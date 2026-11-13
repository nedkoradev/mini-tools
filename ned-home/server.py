import os, json, time, urllib.request, urllib.error
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path

HOST=os.getenv('HOST','0.0.0.0'); PORT=int(os.getenv('PORT','8765'))
HA_URL=os.getenv('HA_URL','http://192.168.1.114:8123').rstrip('/')
HA_TOKEN=os.getenv('HA_TOKEN','')
APP_PASSWORD=os.getenv('APP_PASSWORD','')
ROOT=Path(__file__).resolve().parent
CACHE={'time':0,'data':None}

def fetch():
    if not HA_TOKEN: return {'error':'HA_TOKEN не е настроен','entities':[]}
    if time.time()-CACHE['time']<15 and CACHE['data'] is not None: return CACHE['data']
    req=urllib.request.Request(HA_URL+'/api/states',headers={'Authorization':'Bearer '+HA_TOKEN,'Accept':'application/json'})
    try:
        with urllib.request.urlopen(req,timeout=12) as resp: states=json.load(resp)
        entities=[]
        for s in states:
            a=s.get('attributes') or {}; domain=s.get('entity_id','').split('.')[0]
            if domain not in ('sensor','binary_sensor'): continue
            dc=a.get('device_class','')
            if domain=='sensor' and dc not in ('temperature','humidity','battery','moisture','gas') and a.get('unit_of_measurement') not in ('°C','%'): continue
            if domain=='binary_sensor' and dc not in ('door','window','opening','moisture','gas','smoke','motion','safety','problem','connectivity','battery','lock','garage_door'): continue
            entities.append({'id':s.get('entity_id'),'name':a.get('friendly_name') or s.get('entity_id'),'state':s.get('state'),'unit':a.get('unit_of_measurement',''),'kind':dc or domain,'updated':s.get('last_updated')})
        data={'entities':entities,'fetched_at':int(time.time())};CACHE.update(time=time.time(),data=data);return data
    except Exception as e: return {'error':'Неуспешна връзка с Home Assistant: '+str(e),'entities':[]}

class Handler(BaseHTTPRequestHandler):
    def respond(self,code,data,content_type='application/json; charset=utf-8'):
        body=data if isinstance(data,bytes) else json.dumps(data,ensure_ascii=False).encode()
        self.send_response(code);self.send_header('Content-Type',content_type);self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.send_header('Content-Security-Policy',"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'");self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
    def do_GET(self):
        path=self.path.split('?')[0]
        if path=='/api/status':
            if APP_PASSWORD and self.headers.get('X-App-Password')!=APP_PASSWORD: return self.respond(401,{'error':'Невалидна парола за панела'})
            return self.respond(200,fetch())
        if path in ('/','/index.html'):
            return self.respond(200,(ROOT/'index.html').read_bytes(),'text/html; charset=utf-8')
        if path=='/app.js':return self.respond(200,(ROOT/'app.js').read_bytes(),'application/javascript; charset=utf-8')
        return self.respond(404,{'error':'Not found'})

if __name__=='__main__':
    print('NED Home listening on',PORT,flush=True)
    ThreadingHTTPServer((HOST,PORT),Handler).serve_forever()
