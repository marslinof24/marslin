"""Loopback-only visual editor. Saving never changes the public site or runs Git."""
from __future__ import annotations
import argparse
import copy
import hashlib
import html
from html.parser import HTMLParser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import mimetypes
from pathlib import Path
import re
import secrets
import shutil
import threading
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[2]
LOCAL = ROOT / '_local'
STORE = LOCAL / 'drafts'
TEMPLATES = LOCAL / 'templates'
MEDIA = LOCAL / 'media'
PAGES = ['index.html', 'home.html', 'portfolio.html', 'workspace.html', 'about.html']
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
TEXT = {'h1', 'h2', 'h3', 'p', 'span', 'strong', 'li', 'a', 'label'}
LOCK = threading.RLock()
TOKEN = secrets.token_urlsafe(32)


class Node:
    def __init__(self, tag='', attrs=None, children=None):
        self.tag, self.attrs, self.children = tag, dict(attrs or []), children or []

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Node):
                yield from child.walk()

    def find(self, predicate):
        return next((n for n in self.walk() if predicate(n)), None)

    def cls(self, name):
        return name in self.attrs.get('class', '').split()

    def text(self):
        return ''.join(c.text() if isinstance(c, Node) and c.tag != 'br' else '\n' if isinstance(c, Node) else c for c in self.children)

    def output(self):
        if not self.tag:
            return ''.join(c.output() if isinstance(c, Node) else html.escape(c, quote=False) for c in self.children)
        attrs = ''.join(' ' + k + ('' if v is None else '="' + html.escape(str(v), quote=True) + '"') for k, v in self.attrs.items())
        body = ''.join(c.output() if isinstance(c, Node) else c if self.tag in ('script', 'style') else html.escape(c, quote=False) for c in self.children)
        return '<' + self.tag + attrs + '>' + ('' if self.tag in VOID else body + '</' + self.tag + '>')


class Parser(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs)
        self.stack[-1].children.append(n)
        if tag not in VOID:
            self.stack.append(n)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.stack.pop()

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                self.stack = self.stack[:i]
                return

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix('.tmp')
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    tmp.replace(path)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def set_text(node, value):
    node.children = []
    for i, line in enumerate(value.split('\n')):
        if i:
            node.children.append(Node('br'))
        node.children.append(line)


def annotate(doc, page, fields):
    counter = 0
    for region_name in ('header', 'main', 'footer'):
        counter = 0
        if page == 'index.html' and region_name != 'main':
            continue
        region = doc.find(lambda n: n.tag == region_name)
        if not region:
            continue
        for node in region.walk():
            if node.cls('mobile-page-label'):
                continue
            # SVG logos and decorative artwork keep their authored vectors.
            if node.tag not in TEXT | {'img', 'div'}:
                continue
            image = node.tag == 'img' or node.cls('project-poster')
            children = [c for c in node.children if isinstance(c, Node)]
            text = node.tag in TEXT and node.text().strip() and all(c.tag == 'br' for c in children)
            link = node.tag == 'a' and bool(node.attrs.get('href')) or node.cls('personal-social-pending')
            if not (image or text or link):
                continue
            if node.tag == 'img' and node.attrs.get('src', '').endswith('mars-mark.svg'):
                continue
            counter += 1
            key = f'{page}:{counter}'
            if region_name in ('header', 'footer'):
                # Shared navigation/brand/footer copy updates across content pages.
                key = f'shared:{region_name}:{counter}'
            node.attrs['data-field'] = key
            field = {'kind': 'image' if image else 'link' if link else 'text', 'label': node.text().strip()[:65] or '圖片'}
            if text or (link and not children):
                field['text'] = node.text()
            if image:
                field.update(src=node.attrs.get('src', ''), alt=node.attrs.get('alt', ''))
            if link:
                field['href'] = node.attrs.get('href', '')
            fields.setdefault(key, field)


def capture_fields(fields, item, title, description, status, image='', href=''):
    for name, value in [('title', title), ('description', description), ('status', status)]:
        fields[f'capture:{item}:{name}'] = {'kind': 'text', 'text': value, 'label': name}
    fields[f'capture:{item}:image'] = {'kind': 'image', 'src': image, 'alt': title, 'label': '實機截圖'}
    fields[f'capture:{item}:link'] = {'kind': 'link', 'text': 'View repository' if href else 'Read notes', 'href': href, 'label': '相關連結'}


def initialize():
    for d in (STORE, TEMPLATES, MEDIA):
        d.mkdir(parents=True, exist_ok=True)
    if (STORE / 'draft.json').exists():
        return
    model = {'revision': 0, 'fields': {}, 'projects': ['base'], 'captures': ['website', 'linux', 'data'], 'base': {}}
    for page in PAGES:
        model['base'][page] = digest(ROOT / page)
        doc = Parser((ROOT / page).read_text(encoding='utf-8')).root
        annotate(doc, page, model['fields'])
        (TEMPLATES / page).write_text('<!doctype html>' + doc.output(), encoding='utf-8')
    capture_fields(model['fields'], 'website', 'Personal website', 'An actual local capture of the selected homepage prototype. Built with HTML, CSS, and JavaScript.', 'Local prototype capture', 'assets/prototype/website-preview.png', 'https://github.com/marslinof24/marslin')
    capture_fields(model['fields'], 'linux', 'Linux environment', 'A place for an environment screenshot, with its setup notes alongside.', 'Screenshot to add')
    capture_fields(model['fields'], 'data', 'Data & queries', 'A place for database practice, query results, and the notes behind them.', 'Screenshot to add')
    write_json(STORE / 'draft.json', model)
    write_json(STORE / 'initial.json', model)


def shot_data(model):
    shots = {}
    for item in model['captures']:
        f = lambda name: model['fields'][f'capture:{item}:{name}']
        shots[item] = {'title': f('title')['text'], 'description': f('description')['text'], 'status': f('status')['text'],
                       'image': f('image')['src'], 'alt': f('image')['alt'], 'href': f('link')['href'], 'linkLabel': f('link').get('text', 'Read notes')}
    return shots


def shot_markup(item, shot, picker=False):
    key = f'capture:{item}:'
    attr = lambda name: ' data-field="' + html.escape(key + name) + '"'
    frame = '<div class="capture-frame' + ('' if shot['image'] else ' is-placeholder') + '"' + attr('image') + '>'
    if shot['image']:
        frame += '<img src="' + html.escape(shot['image'], quote=True) + '" alt="' + html.escape(shot['alt'], quote=True) + '" width="1425" height="790">'
    else:
        frame += '<div class="capture-empty"><span class="empty-image" aria-hidden="true"></span><span>Screenshot to add</span></div>'
    frame += '</div>'
    esc = lambda name: html.escape(shot[name])
    if picker:
        return frame + '<strong' + attr('title') + '>' + esc('title') + '</strong><span' + attr('status') + '>' + esc('status') + '</span>'
    link = '<a class="text-link"' + attr('link') + ' href="' + html.escape(shot['href'], quote=True) + '">' + esc('linkLabel') + '</a>' if shot['href'] else '<span class="capture-pending"' + attr('link') + '>Related link to add</span>'
    return frame + '<div class="capture-caption"><p class="capture-status"' + attr('status') + '>' + esc('status') + '</p><h2' + attr('title') + '>' + esc('title') + '</h2><p' + attr('description') + '>' + esc('description') + '</p>' + link + '</div>'


def render(page, model, editable=True):
    doc = Parser((TEMPLATES / page).read_text(encoding='utf-8')).root
    if page == 'portfolio.html':
        main = doc.find(lambda n: n.tag == 'main')
        project = main.find(lambda n: n.attrs.get('id') == 'portfolio-project')
        main.children = [n for n in main.children if n is not project]
        for index, item in enumerate(model['projects']):
            clone = copy.deepcopy(project)
            if item != 'base':
                for node in clone.walk():
                    if 'data-field' in node.attrs:
                        node.attrs['data-field'] = item + '|' + node.attrs['data-field']
            if index > 0:
                for node in clone.walk():
                    for attr in ('id', 'aria-labelledby'):
                        if attr in node.attrs:
                            node.attrs[attr] = item + '-' + node.attrs[attr]
                    if node.attrs.get('href', '').startswith('#'):
                        node.attrs['href'] = '#' + item + '-' + node.attrs['href'][1:]
            clone.attrs['data-project'] = item
            main.children.append(clone)
    for node in list(doc.walk()):
        field = model['fields'].get(node.attrs.get('data-field'))
        if not field:
            continue
        if 'text' in field:
            set_text(node, field['text'])
        if 'href' in field and (node.tag == 'a' or node.cls('personal-social-pending')):
            if field['href']:
                node.tag = 'a'
                node.attrs['class'] = node.attrs.get('class', '').replace('personal-social-pending', '').strip()
            if node.tag == 'a':
                node.attrs['href'] = field['href'] or '#links'
        if field['kind'] == 'image' and field.get('src'):
            if node.tag == 'img':
                node.attrs.update(src=field['src'], alt=field.get('alt', ''))
            else:
                node.children = [Node('img', {'src': field['src'], 'alt': field.get('alt', ''), 'style': 'width:100%;height:100%;object-fit:cover'})]
                node.attrs.pop('aria-hidden', None)
    if page == 'portfolio.html':
        for project in (n for n in doc.walk() if n.attrs.get('data-project')):
            item = project.attrs['data-project']
            if project.attrs.get('id') == 'portfolio-project':
                continue
            for node in project.walk():
                href = node.attrs.get('href', '')
                if href.startswith('#') and not href.startswith('#' + item + '-'):
                    node.attrs['href'] = '#' + item + '-' + href[1:]
    if page == 'workspace.html':
        shots = shot_data(model)
        first = model['captures'][0]
        viewer = doc.find(lambda n: n.attrs.get('id') == 'capture-viewer')
        viewer.children = Parser(shot_markup(first, shots[first])).root.children
        picker = doc.find(lambda n: n.cls('capture-picker'))
        picker.children = [Node('button', {'type': 'button', 'data-capture': item, 'aria-pressed': str(item == first).lower()}, Parser(shot_markup(item, shots[item], True)).root.children) for item in model['captures']]
    if not editable:
        for node in doc.walk():
            node.attrs.pop('data-field', None)
            node.attrs.pop('data-project', None)
    result = '<!doctype html>' + doc.output()
    if editable:
        result = result.replace('</head>', '<link rel="stylesheet" href="/_editor/bridge.css"></head>')
        result = result.replace('</body>', '<script src="/_editor/bridge.js"></script></body>')
    return result


def effects_source(model):
    source = (ROOT / 'effects.js').read_text(encoding='utf-8')
    start = source.index('  const shots = ')
    end = source.index('  function selectCapture', start)
    source = source[:start] + '  const shots = ' + json.dumps(shot_data(model), ensure_ascii=False) + ';\n' + source[end:]
    # Existing effects remain; use per-item link and alt instead of a fixed repository.
    source = source.replace('alt="Actual local screenshot of the selected personal website homepage A"', 'alt="${escapeMarkup(item.alt || item.title)}"')
    a = source.index('${item.image\n        ?')
    b = source.index('</div>`;', a)
    source = source[:a] + '''${item.href
        ? `<a class="text-link" href="${escapeMarkup(item.href)}">${escapeMarkup(item.linkLabel || 'Read notes')}</a>`
        : '<span class="capture-pending">Related link to add</span>'}''' + source[b:]
    source = source.replace('  function selectCapture', '  const escapeMarkup = value => String(value).replace(/[&<>"\']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",\'"\':"&quot;","\'":"&#39;"}[c]));\n  function selectCapture', 1)
    # Interpolated caption values must also remain text, never executable markup.
    for key in ('status', 'title', 'description', 'image'):
        source = source.replace('${item.' + key + '}', '${escapeMarkup(item.' + key + ')}')
    return source


def validate(model, previous):
    if model.get('revision') != previous['revision']:
        raise RuntimeError('草稿已被另一個分頁更新，請重新載入後再修改。')
    if set(model) != set(previous) or model['base'] != previous['base']:
        raise ValueError('草稿格式不符。')
    if model['projects'] != previous['projects'] or model['captures'] != previous['captures']:
        raise ValueError('請使用新增／刪除按鈕調整項目。')
    if set(model['fields']) != set(previous['fields']):
        raise ValueError('未知欄位。')
    for key, field in model['fields'].items():
        old = previous['fields'][key]
        if set(field) != set(old) or field['kind'] != old['kind']:
            raise ValueError('欄位格式不符。')
        for name, value in field.items():
            if not isinstance(value, str) or len(value) > 20000:
                raise ValueError('文字過長或格式不符。')
            if name == 'href' and value:
                u = urlsplit(value)
                if u.scheme and u.scheme not in ('http', 'https', 'mailto', 'tel') or value.startswith('//') or '\\' in value or any(ord(c) < 32 for c in value):
                    raise ValueError('連結請使用 https 網址、站內頁面、mailto 或 tel。')
                if not u.scheme and u.path and not re.fullmatch(r'[a-zA-Z0-9_./-]+', u.path):
                    raise ValueError('站內連結格式不符。')
            if name == 'src' and value:
                candidate = (ROOT / value).resolve()
                if not candidate.is_relative_to(ROOT / 'assets') or not (candidate.is_file() or (MEDIA / candidate.name).is_file()):
                    raise ValueError('圖片請透過上傳按鈕選擇。')


def add_item(model, collection):
    item = secrets.token_hex(6)
    if collection == 'captures':
        capture_fields(model['fields'], item, 'New workspace item', '', 'Work in progress')
        model['captures'].append(item)
    elif collection == 'projects':
        doc = Parser((TEMPLATES / 'portfolio.html').read_text(encoding='utf-8')).root
        project = doc.find(lambda n: n.attrs.get('id') == 'portfolio-project')
        for node in project.walk():
            key = node.attrs.get('data-field')
            if not key:
                continue
            field = copy.deepcopy(model['fields'][key])
            if 'text' in field and node.tag not in ('h2', 'h3', 'a'):
                field['text'] = ''
            if node.cls('project-title'):
                field['text'] = 'New project'
                field['label'] = '專案名稱'
            if node.tag == 'li':
                field['text'] = ''
            if field['kind'] == 'image':
                field.update(src='', alt='')
            if field.get('text') == '':
                field['label'] = '新專案 ' + node.tag
            model['fields'][item + '|' + key] = field
        model['projects'].append(item)
    else:
        raise ValueError('未知項目類型。')
    return item


def apply_draft():
    model = read_json(STORE / 'draft.json')
    for page, baseline in model['base'].items():
        if digest(ROOT / page) != baseline:
            raise RuntimeError(f'{page} 在建立草稿後已修改；請先合併差異，不會覆寫。')
    staging = LOCAL / 'applied-preview'
    staging.mkdir(exist_ok=True)
    outputs = {p: render(p, model, False) for p in PAGES}
    outputs['effects.js'] = effects_source(model)
    version = hashlib.sha256(outputs['effects.js'].encode()).hexdigest()[:12]
    for page in PAGES:
        outputs[page] = re.sub(r'effects\.js\?v=[\w-]+', 'effects.js?v=' + version, outputs[page])
    backup = STORE / ('before-apply-' + str(model['revision']))
    backup.mkdir(exist_ok=True)
    for name, data in outputs.items():
        (staging / name).write_text(data, encoding='utf-8')
        shutil.copy2(ROOT / name, backup / name)
    for image in MEDIA.iterdir():
        target = ROOT / 'assets' / 'content' / image.name
        target.parent.mkdir(exist_ok=True)
        shutil.copy2(image, target)
    for name in outputs:
        shutil.copy2(staging / name, ROOT / name)
    model['base'] = {p: digest(ROOT / p) for p in PAGES}
    model['revision'] += 1
    write_json(STORE / 'draft.json', model)
    write_json(STORE / 'last-applied.json', {'revision': model['revision'], 'files': list(outputs)})
    print('Draft applied locally. No Git command was run. Review before publishing.')


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(fmt % args, flush=True)

    def send_data(self, data, mime='application/json; charset=utf-8', status=200):
        if isinstance(data, (dict, list)):
            data = json.dumps(data, ensure_ascii=False).encode()
        if isinstance(data, str):
            data = data.encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.end_headers()
        self.wfile.write(data)

    def host_ok(self):
        return self.headers.get('Host') in (f'127.0.0.1:{self.server.server_port}', f'localhost:{self.server.server_port}')

    def do_GET(self):
        if not self.host_ok():
            return self.send_data({'error': 'Localhost only'}, status=403)
        path = unquote(urlsplit(self.path).path)
        if path == '/':
            return self.file(Path(__file__).with_name('editor.html'))
        if path == '/api/state':
            with LOCK:
                model = read_json(STORE / 'draft.json')
            return self.send_data({'draft': model, 'token': TOKEN})
        if path.startswith('/_editor/'):
            name = path.split('/')[-1]
            if name in ('editor.js', 'editor.css', 'bridge.js', 'bridge.css'):
                return self.file(Path(__file__).with_name(name))
        if path.startswith('/preview/'):
            name = path.removeprefix('/preview/') or 'index.html'
            with LOCK:
                model = read_json(STORE / 'draft.json')
            if name in PAGES:
                return self.send_data(render(name, model), 'text/html; charset=utf-8')
            if name == 'effects.js':
                return self.send_data(effects_source(model), 'text/javascript; charset=utf-8')
            target = (ROOT / name).resolve()
            allowed = {'design.css', 'website-process.js', 'navigation.js', 'entry.js', 'welcome.js', 'welcome.css', 'glass-cursor.svg', 'articles.html', 'links.html'}
            if name.startswith('assets/content/') and re.fullmatch(r'[a-f0-9]+\.(png|jpg|webp)', Path(name).name) and (MEDIA / Path(name).name).is_file():
                return self.file(MEDIA / Path(name).name)
            if target.is_relative_to(ROOT / 'assets') or name in allowed:
                return self.file(target)
        return self.send_data({'error': 'Not found'}, status=404)

    def file(self, path):
        if not path.is_file():
            return self.send_data({'error': 'Not found'}, status=404)
        return self.send_data(path.read_bytes(), mimetypes.guess_type(str(path))[0] or 'application/octet-stream')

    def do_POST(self):
        if not self.host_ok() or self.headers.get('X-Editor-Token') != TOKEN:
            return self.send_data({'error': '請從本機編輯器操作。'}, status=403)
        try:
            origin = self.headers.get('Origin')
            if origin and origin != 'http://' + self.headers['Host']:
                return self.send_data({'error': 'Origin mismatch'}, status=403)
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 12 * 1024 * 1024:
                raise ValueError('資料大小需小於 12MB。')
            body = self.rfile.read(length)
            path = urlsplit(self.path).path
            if path == '/api/upload':
                ext = 'png' if body.startswith(b'\x89PNG\r\n\x1a\n') else 'jpg' if body.startswith(b'\xff\xd8\xff') else 'webp' if body[:4] == b'RIFF' and body[8:12] == b'WEBP' else None
                if not ext:
                    raise ValueError('請選擇 PNG、JPG 或 WebP 圖片。')
                filename = hashlib.sha256(body).hexdigest()[:24] + '.' + ext
                (MEDIA / filename).write_bytes(body)
                return self.send_data({'src': 'assets/content/' + filename})
            request = json.loads(body)
            with LOCK:
                previous = read_json(STORE / 'draft.json')
                if path == '/api/save':
                    validate(request, previous)
                    model = request
                elif path == '/api/item':
                    if request.get('revision') != previous['revision']:
                        raise RuntimeError('草稿已更新，請先重新載入。')
                    model = previous
                    collection = request.get('collection')
                    if collection not in ('projects', 'captures'):
                        raise ValueError('未知項目類型。')
                    if request.get('action') == 'add':
                        add_item(model, collection)
                    elif request.get('action') == 'delete':
                        if len(model[collection]) <= 1:
                            raise ValueError('至少保留一個項目。')
                        item = request.get('id')
                        model[collection].remove(item)
                    else:
                        raise ValueError('未知操作。')
                else:
                    return self.send_data({'error': 'Not found'}, status=404)
                model['revision'] += 1
                shutil.copy2(STORE / 'draft.json', STORE / 'previous.json')
                write_json(STORE / 'draft.json', model)
            return self.send_data({'draft': model})
        except RuntimeError as exc:
            self.send_data({'error': str(exc)}, status=409)
        except (ValueError, KeyError, TypeError) as exc:
            self.send_data({'error': str(exc)}, status=400)


if __name__ == '__main__':
    cli = argparse.ArgumentParser()
    cli.add_argument('--port', type=int, default=4175)
    cli.add_argument('--apply', action='store_true')
    args = cli.parse_args()
    initialize()
    if args.apply:
        apply_draft()
    else:
        print(f'Mars visual editor: http://127.0.0.1:{args.port}/', flush=True)
        ThreadingHTTPServer(('127.0.0.1', args.port), Handler).serve_forever()
