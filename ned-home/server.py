import os, json, time, urllib.request, urllib.parse, hashlib, hmac
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path

HOST=os.getenv('HOST','0.0.0.0')
PORT=int(os.getenv('PORT','8765'))
HA_URL=os.getenv('HA_URL','http://192.168.1.114:8123').rstrip('/')
HA_TOKEN=os.getenv('HA_TOKEN','')
APP_PASSWORD=os.getenv('APP_PASSWORD','')
WEATHER_ENTITY=os.getenv('WEATHER_ENTITY','')
ROOT=Path(__file__).resolve().parent
CACHE={'time':0,'data':None}
WEATHER_CACHE={'time':0,'data':None}
SESSION_SECRET=hashlib.sha256((APP_PASSWORD+'|'+HA_TOKEN+'|ned-home-v1.3').encode()).digest()
SESSION_LIFETIME=30*24*3600

def session_token():
    expiry=str(int(time.time())+SESSION_LIFETIME)
    sig=hmac.new(SESSION_SECRET,expiry.encode(),hashlib.sha256).hexdigest()
    return expiry+'.'+sig

def valid_session(cookie):
    try:
        token=next((v.strip()[12:] for v in cookie.split(';') if v.strip().startswith('ned_session=')), '')
        expiry,sig=token.split('.',1)
        expected=hmac.new(SESSION_SECRET,expiry.encode(),hashlib.sha256).hexdigest()
        return int(expiry)>time.time() and hmac.compare_digest(sig,expected)
    except (ValueError,TypeError):
        return False

def get_weather():
    if WEATHER_CACHE['data'] is not None and time.time()-WEATHER_CACHE['time']<1800:
        return WEATHER_CACHE['data']
    url='https://api.open-meteo.com/v1/forecast?'+urllib.parse.urlencode({'latitude':42.6977,'longitude':23.3219,'timezone':'Europe/Sofia','current':'temperature_2m,weather_code','daily':'weather_code,temperature_2m_max,temperature_2m_min','forecast_days':4})
    try:
        with urllib.request.urlopen(url,timeout=10) as response:
            raw=json.load(response)
        daily=raw['daily']
        weather={'temperature':raw['current']['temperature_2m'],'code':raw['current']['weather_code'],'forecast':[{'date':daily['time'][i],'code':daily['weather_code'][i],'low':daily['temperature_2m_min'][i],'high':daily['temperature_2m_max'][i]} for i in range(1,min(4,len(daily['time'])))]}
        WEATHER_CACHE.update(time=time.time(),data=weather)
        return weather
    except Exception:
        return WEATHER_CACHE['data']


def ha(path, method='GET', body=None):
    headers={'Authorization':'Bearer '+HA_TOKEN,'Accept':'application/json'}
    data=None
    if body is not None:
        headers['Content-Type']='application/json'
        data=json.dumps(body).encode()
    req=urllib.request.Request(HA_URL+path,data=data,headers=headers,method=method)
    with urllib.request.urlopen(req,timeout=15) as resp:
        return json.load(resp)

def fetch():
    if not HA_TOKEN:
        return {'error':'HA_TOKEN не е настроен','entities':[]}
    if time.time()-CACHE['time']<15 and CACHE['data'] is not None:
        return CACHE['data']
    try:
        states=ha('/api/states')
        entities=[]
        climates=[]
        for s in states:
            a=s.get('attributes') or {}
            eid=s.get('entity_id','')
            domain=eid.split('.')[0]
            if domain=='climate':
                climates.append({'id':eid,'name':a.get('friendly_name',eid),'state':s.get('state'),'attributes':{'current_temperature':a.get('current_temperature'),'temperature':a.get('temperature')}})
            if domain not in ('sensor','binary_sensor'):
                continue
            dc=a.get('device_class','')
            if domain=='sensor' and dc not in ('temperature','humidity','battery','moisture','gas') and a.get('unit_of_measurement') not in ('°C','%'):
                continue
            if domain=='binary_sensor' and dc not in ('door','window','opening','moisture','gas','smoke','motion','safety','problem','connectivity','battery','lock','garage_door'):
                continue
            entities.append({'id':eid,'name':a.get('friendly_name') or eid,'state':s.get('state'),'unit':a.get('unit_of_measurement',''),'kind':dc or domain,'updated':s.get('last_updated')})
        weather=get_weather()
        result={'entities':entities,'climates':climates,'weather':weather,'fetched_at':int(time.time())}
        CACHE.update(time=time.time(),data=result)
        return result
    except Exception as e:
        return {'error':'Неуспешна връзка с Home Assistant: '+str(e),'entities':[]}

def history(params):
    try:
        hours=min(168,max(1,int(params.get('hours',['24'])[0])))
    except (ValueError,TypeError):
        hours=24
    ids=[i for i in params.get('entities',[''])[0].split(',') if i.startswith('sensor.')][:4]
    if not ids:
        return {}
    # Use the same auth check as /api/status; only permit sensor IDs.
    from datetime import datetime, timedelta, timezone
    start=(datetime.now(timezone.utc)-timedelta(hours=hours)).isoformat()
    path='/api/history/period/'+urllib.parse.quote(start,safe=':+')+'?'+urllib.parse.urlencode({'filter_entity_id':','.join(ids),'minimal_response':'false','no_attributes':'true'})
    raw=ha(path)
    result={eid:[] for eid in ids}
    for series in raw:
        for entry in series:
            eid=entry.get('entity_id','')
            if eid not in result:
                continue
            try:
                value=float(entry.get('state'))
            except (ValueError,TypeError):
                continue
            result[eid].append({'t':entry.get('last_changed') or entry.get('last_updated'),'v':value})
    return result

class Handler(BaseHTTPRequestHandler):
    def respond(self,code,data,content_type='application/json; charset=utf-8'):
        body=data if isinstance(data,bytes) else json.dumps(data,ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header('Content-Type',content_type)
        self.send_header('Cache-Control','no-store')
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Content-Security-Policy',"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'")
        if getattr(self,'session_cookie',None):
            self.send_header('Set-Cookie',self.session_cookie)
        self.send_header('Content-Length',str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def do_POST(self):
        if urllib.parse.urlsplit(self.path).path!='/api/login':
            return self.respond(404,{'error':'Not found'})
        try:
            length=int(self.headers.get('Content-Length','0'))
            if length>2048 or length<1:
                return self.respond(400,{'error':'Invalid request'})
            data=json.loads(self.rfile.read(length))
        except (ValueError,TypeError):
            return self.respond(400,{'error':'Invalid request'})
        if not APP_PASSWORD or not hmac.compare_digest(str(data.get('password','')),APP_PASSWORD):
            return self.respond(401,{'error':'Invalid password'})
        self.session_cookie='ned_session='+session_token()+'; Path=/; HttpOnly; SameSite=Strict; Max-Age='+str(SESSION_LIFETIME)
        return self.respond(200,{'ok':True})
    def do_GET(self):
        parsed=urllib.parse.urlsplit(self.path)
        path=parsed.path
        if path.startswith('/api/'):
            if APP_PASSWORD and not valid_session(self.headers.get('Cookie','')):
                return self.respond(401,{'error':'Невалидна парола за панела'})
            if path=='/api/status':
                return self.respond(200,fetch())
            if path=='/api/history':
                if not HA_TOKEN:
                    return self.respond(503,{'error':'HA_TOKEN не е настроен'})
                try:
                    return self.respond(200,history(urllib.parse.parse_qs(parsed.query)))
                except Exception:
                    return self.respond(502,{'error':'Историята не е достъпна'})
            return self.respond(404,{'error':'Not found'})
        if path in ('/','/index.html'):
            return self.respond(200,(ROOT/'index.html').read_bytes(),'text/html; charset=utf-8')
        if path=='/app.js':
            return self.respond(200,(ROOT/'app.js').read_bytes(),'application/javascript; charset=utf-8')
        return self.respond(404,{'error':'Not found'})

if __name__=='__main__':
    print('NED Home listening on',PORT,flush=True)
    ThreadingHTTPServer((HOST,PORT),Handler).serve_forever()
