"""Rebuild offline HTML, service-worker manifest and distributable ZIP."""
from pathlib import Path
import base64,hashlib,json,mimetypes,re,zipfile
from xml.sax.saxutils import escape

ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'index.html').read_text()
data=json.JSONDecoder().raw_decode(html.split('const DATA=',1)[1])[0]
kml_bank={}
for day,rows in enumerate(data['days'],1):
    marks=[]
    for index,row in enumerate(rows):
        if not row[1]:continue
        place=data['places'][row[1]]
        marks.append('<Placemark><name>'+escape(chr(65+index)+' · '+place[0])+'</name><description>'+escape(row[0]+'｜'+row[2]+'｜'+row[3])+'</description><Point><coordinates>'+str(place[2])+','+str(place[1])+',0</coordinates></Point></Placemark>')
    kml='<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>'+escape('11/'+str(day+12)+' 福岡四週年')+'</name>'+''.join(marks)+'</Document></kml>'
    (ROOT/'maps'/('day'+str(day)+'.kml')).write_text(kml);kml_bank[str(day)]=kml
html=re.sub(r'const kmlBank=.*?;\n',lambda m:'const kmlBank='+json.dumps(kml_bank,ensure_ascii=False)+';\n',html,count=1)
(ROOT/'index.html').write_text(html)
offline=html
for name in ['assets/field-guide.css']:
    offline=offline.replace(f'<link rel="stylesheet" href="{name}">','<style>'+(ROOT/name).read_text()+'</style>')
for name in ['assets/travel-facts.js','assets/field-guide.js']:
    offline=offline.replace(f'<script src="{name}"></script>','<script>'+(ROOT/name).read_text().replace('</script','<\\/script')+'</script>')
for p in (ROOT/'assets').rglob('*'):
    if p.is_file() and p.suffix in ['.jpg','.mp3']:
        mime=mimetypes.guess_type(p.name)[0]
        path=p.relative_to(ROOT).as_posix()
        data='data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()
        offline=offline.replace('"'+path+'"','"'+data+'"').replace("'"+path+"'","'"+data+"'")
# Audio paths are assembled at runtime, so embed a lookup for all generated clips.
audio={p.name:'data:audio/mpeg;base64,'+base64.b64encode(p.read_bytes()).decode() for p in (ROOT/'assets/audio').glob('*.mp3')}
bridge='const OFFLINE_AUDIO='+json.dumps(audio)+';\n'
offline=offline.replace('/* Daily itinerary,',bridge+'/* Daily itinerary,')
offline=offline.replace("file: 'assets/audio/phrase' + String(++phraseIndex).padStart(2, '0') + '.mp3'", "file: OFFLINE_AUDIO['phrase' + String(++phraseIndex).padStart(2, '0') + '.mp3']")
offline=offline.replace("file: 'assets/audio/' + id + '.mp3'", "file: OFFLINE_AUDIO[id + '.mp3']")
offline=offline.replace("href=\"offline.html\" download",'href="#" hidden')
# A downloaded file has no service worker; the media is already inside the file.
offline=offline.replace("const status=$('#offline-state');if(!('serviceWorker'in navigator)","const status=$('#offline-state');if(location.protocol==='file:'){status.textContent='單檔版：行程、照片與 31 段日文語音已內含。';return;}if(!('serviceWorker'in navigator)")
offline=offline.replace("'use strict';\n  const facts", "'use strict';\n  const facts")
(ROOT/'offline.html').write_text(offline)
paths=['./','./index.html','./manifest.webmanifest','./icon.svg']
paths += ['./'+p.relative_to(ROOT).as_posix() for p in (ROOT/'assets').rglob('*') if p.is_file()]
paths += ['./'+p.name for p in ROOT.glob('*SOURCES.json')]
paths += ['./'+p.relative_to(ROOT).as_posix() for p in (ROOT/'maps').glob('*.kml')]
paths += ['./GOOGLE-RATINGS.json','./VERIFICATION.json','./AUDIO-LICENSE.txt']
version=hashlib.sha256(''.join(hashlib.sha256((ROOT/p.removeprefix('./')).read_bytes()).hexdigest() for p in paths if p not in ['./']).encode()).hexdigest()[:12]
sw="""const VERSION='anniversary-__VERSION__';
const FILES=__FILES__;
async function cacheOffline(){const c=await caches.open(VERSION);await c.addAll(FILES);const clients=await self.clients.matchAll();clients.forEach(client=>client.postMessage({type:'CACHE_DONE'}));}
self.addEventListener('install',e=>e.waitUntil(cacheOffline().then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith('anniversary-')||k.startsWith('fukuoka-'))&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{if(e.data?.type==='CACHE_OFFLINE')e.waitUntil(cacheOffline().catch(async()=>{const clients=await self.clients.matchAll();clients.forEach(c=>c.postMessage({type:'CACHE_FAILED'}));}));});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.origin!==location.origin||e.request.method!=='GET')return;
if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(async response=>{if(response.ok){const c=await caches.open(VERSION);c.put(e.request,response.clone());}return response;}).catch(async()=>await caches.match(e.request)||await caches.match(new URL('./index.html',self.registration.scope))));return;}
e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request)));});
""".replace('__VERSION__',version).replace('__FILES__',json.dumps(paths))
(ROOT/'sw.js').write_text(sw)
out=ROOT/'fukuoka-anniversary-offline.zip'
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
    for p in ROOT.rglob('*'):
        relative=p.relative_to(ROOT)
        if p.is_file() and not any(part.startswith('.') for part in relative.parts) and p.suffix!='.zip':z.write(p,relative)
print(json.dumps({'cache_version':version,'cached_files':len(paths),'offline_bytes':len(offline.encode()),'zip_bytes':out.stat().st_size}))
