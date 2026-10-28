"""Meaningful editor checks against a disposable draft, never the user's draft."""
import copy
import importlib.util
import json
from pathlib import Path
import shutil
import tempfile
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen
import threading

spec = importlib.util.spec_from_file_location('studio', Path(__file__).with_name('server.py'))
studio = importlib.util.module_from_spec(spec)
spec.loader.exec_module(studio)
SOURCE = studio.ROOT


class EditorTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='editor-test-', dir=SOURCE / '.cache')
        studio.ROOT = Path(self.temp.name)
        studio.LOCAL = studio.ROOT / '_local'
        studio.STORE = studio.LOCAL / 'drafts'
        studio.TEMPLATES = studio.LOCAL / 'templates'
        studio.MEDIA = studio.LOCAL / 'media'
        for name in studio.PAGES + ['effects.js']:
            shutil.copy2(SOURCE / name, studio.ROOT / name)
        shutil.copytree(SOURCE / 'assets', studio.ROOT / 'assets')
        studio.initialize()
        self.server = studio.ThreadingHTTPServer(('127.0.0.1', 0), studio.Handler)
        threading.Thread(target=self.server.serve_forever, daemon=True).start()
        self.url = f'http://127.0.0.1:{self.server.server_port}'

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        assert Path(self.temp.name).resolve().is_relative_to((SOURCE / '.cache').resolve())
        self.temp.cleanup()

    def state(self):
        return json.load(urlopen(self.url + '/api/state'))['draft']

    def post(self, path, data, token=True):
        body = data if isinstance(data, bytes) else json.dumps(data).encode()
        req = Request(self.url + path, body, {'X-Editor-Token': studio.TOKEN if token else 'wrong', 'Content-Type': 'application/json'})
        return json.load(urlopen(req))

    def test_save_reload_escape_and_conflict(self):
        original = {p: (studio.ROOT / p).read_bytes() for p in studio.PAGES}
        model = self.state()
        key = next(k for k, f in model['fields'].items() if k.startswith('home.html:') and f['kind'] == 'text')
        model['fields'][key]['text'] = 'Mars <script>alert(1)</script>\nSecond line'
        result = self.post('/api/save', model)['draft']
        self.assertEqual(self.state()['fields'][key]['text'], model['fields'][key]['text'])
        preview = studio.render('home.html', result)
        self.assertIn('&lt;script&gt;alert(1)&lt;/script&gt;', preview)
        self.assertEqual(original, {p: (studio.ROOT / p).read_bytes() for p in studio.PAGES})
        with self.assertRaises(HTTPError) as error:
            self.post('/api/save', model)
        self.assertEqual(error.exception.code, 409)

    def test_projects_and_captures(self):
        state = self.state()
        state = self.post('/api/item', {'revision': state['revision'], 'collection': 'projects', 'action': 'add'})['draft']
        doc = studio.Parser(studio.render('portfolio.html', state)).root
        ids = [n.attrs['id'] for n in doc.walk() if 'id' in n.attrs]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertIn('New project', doc.text())
        state = self.post('/api/item', {'revision': state['revision'], 'collection': 'projects', 'action': 'delete', 'id': 'base'})['draft']
        self.assertIn('id="portfolio-project"', studio.render('portfolio.html', state))
        state = self.post('/api/item', {'revision': state['revision'], 'collection': 'captures', 'action': 'add'})['draft']
        self.assertEqual(len(state['captures']), 4)
        state = self.post('/api/item', {'revision': state['revision'], 'collection': 'captures', 'action': 'delete', 'id': state['captures'][-1]})['draft']
        self.assertEqual(len(state['captures']), 3)

    def test_upload_and_validation(self):
        with self.assertRaises(HTTPError) as error:
            self.post('/api/upload', b'not an image')
        self.assertEqual(error.exception.code, 400)
        data = self.post('/api/upload', b'\x89PNG\r\n\x1a\n' + bytes(20))
        self.assertTrue((studio.MEDIA / Path(data['src']).name).exists())
        model = self.state()
        key = next(k for k, f in model['fields'].items() if f['kind'] == 'link')
        model['fields'][key]['href'] = 'javascript:alert(1)'
        with self.assertRaises(HTTPError) as error:
            self.post('/api/save', model)
        self.assertEqual(error.exception.code, 400)
        with self.assertRaises(HTTPError) as error:
            self.post('/api/save', self.state(), token=False)
        self.assertEqual(error.exception.code, 403)

    def test_apply_is_explicit_and_conflicts_protected(self):
        model = self.state()
        output = studio.render('about.html', model, False)
        self.assertNotIn('data-field=', output)
        self.assertNotIn('/_editor/', output)
        (studio.ROOT / 'about.html').write_text('External change', encoding='utf-8')
        with self.assertRaises(RuntimeError):
            studio.apply_draft()

    def test_apply_outputs_working_static_content(self):
        model = self.state()
        key = next(k for k, f in model['fields'].items() if k.startswith('about.html:') and f['kind'] == 'text')
        model['fields'][key]['text'] = 'Saved personal introduction'
        self.post('/api/save', model)
        studio.apply_draft()
        output = (studio.ROOT / 'about.html').read_text(encoding='utf-8')
        self.assertIn('Saved personal introduction', output)
        self.assertNotIn('data-field=', output)
        self.assertNotIn('/_editor/', output)
        self.assertTrue((studio.STORE / 'last-applied.json').exists())
        self.assertIn('effects.js?v=', output)


if __name__ == '__main__':
    unittest.main()
