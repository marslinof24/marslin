from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from urllib.parse import urlsplit,parse_qs
from pathlib import Path
import time,re
ROOT=Path(__file__).resolve().parents[2]
class QA(SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
 def do_GET(self):
  u=urlsplit(self.path);mode=parse_qs(u.query).get('_qa',['normal'])[0]
  p=(ROOT/u.path.lstrip('/')).resolve()
  if p.is_relative_to(ROOT/'hig-site') and p.suffix=='.html' and p.is_file():
   nav=self.headers.get('Sec-Fetch-Mode')=='navigate'
   if mode=='slow' and not nav:time.sleep(.8)
   if mode=='timeout' and not nav:time.sleep(6.4)
   if mode=='fail' and not nav:self.send_error(503);return
   data=p.read_text(encoding='utf-8')
   data=re.sub(r'href="((?:index|home|workspace|portfolio|about)\.html)(#[^"\s]*)?"',lambda m:'href="'+m[1]+'?_qa='+mode+(m[2] or '')+'"',data)
   data=data.replace('</head>','<script src="../hig-full-study/qa/probe.js" defer></script></head>')
   body=data.encode();self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(body)));self.end_headers()
   try:self.wfile.write(body)
   except (BrokenPipeError,ConnectionResetError):pass
  else:super().do_GET()
ThreadingHTTPServer(('127.0.0.1',4176),QA).serve_forever()
