"""Open the local visual editor without showing a background server console."""
from pathlib import Path
import os
import subprocess
import sys
import time
from urllib.request import urlopen
import webbrowser

root = Path(__file__).resolve().parents[2]
url = 'http://127.0.0.1:4175/'


def running():
    try:
        with urlopen(url, timeout=1) as response:
            return 'Mars' in response.read().decode('utf-8')
    except OSError:
        return False


if not running():
    log = open(root / '_local' / 'editor-server.log', 'ab')
    subprocess.Popen([sys.executable, str(Path(__file__).with_name('server.py'))], cwd=root,
                     stdout=log, stderr=log,
                     creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
    for _ in range(30):
        if running():
            break
        time.sleep(.15)
if running():
    webbrowser.open(url)
else:
    raise SystemExit('本機編輯器未能啟動，請查看 _local/editor-server.log。')
