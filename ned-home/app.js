(function(){'use strict';
var entities=[],rooms=[],selected=null,period=24;
function E(id){return document.getElementById(id)}function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]})}
function clock(){var d=new Date();E('clock').textContent=d.toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit'});E('date').textContent=d.toLocaleDateString('bg-BG',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}clock();setInterval(clock,15000);
function req(path,done){var x=new XMLHttpRequest();x.open('GET',path,true);x.timeout=18000;x.onreadystatechange=function(){if(x.readyState===4){var data=null;try{data=JSON.parse(x.responseText)}catch(e){}done(x.status,data)}};x.ontimeout=function(){done(0,null)};x.send()}
function loc(x){return /царево|tsarevo|tzarevo/i.test(x.name+' '+x.id)?'Царево':'София'}
function kind(x){var k=(x.kind||'').toLowerCase(),n=x.name||'';if(k==='temperature'||x.unit==='°C'||/temperature|температура/i.test(n))return 'temperature';if(k==='humidity'||(/влажност|humidity/i.test(n)))return 'humidity';if(k==='battery'||/battery|батерия/i.test(n))return 'battery';return 'other'}
function name(x){return (x.name||x.id||'Сензор').replace(/\s*(temperature|humidity|battery|температура|влажност|батерия)\s*$/i,'').replace(/^(дружба|софия|царево|druzhba|sofia|tsarevo|tzarevo)[\s:_-]*/i,'').replace(/[\s:_-]*(царево|tsarevo|tzarevo)\s*$/i,'').replace(/\s+/g,' ').trim()||'Сензор'}
function ok(x){return x&&x.state!=null&&x.state!=='unknown'&&x.state!=='unavailable'&&x.state!==''}
function age(x){if(!x||!x.updated)return '—';var n=Date.parse(x.updated);if(!isFinite(n))return '—';var min=Math.max(0,Math.floor((Date.now()-n)/60000));return min<60?min+' мин':min<1440?Math.floor(min/60)+' ч':Math.floor(min/1440)+' д'}
function stale(r){var a=[r.temperature,r.humidity].filter(Boolean);return a.length===0||a.every(function(x){return !ok(x)})}
function build(){
var defs=[
['Хола','София',/^Дружба\s+хола\s+1\s+(Temperature|Humidity|Battery)$/i],
['Детска','София',/^Дружба\s+детска\s+2\s+(Temperature|Humidity|Battery)$/i],
['Спалня','София',/^Дружба\s+спалня\s+3\s+(Temperature|Humidity|Battery)$/i],
['Външна','София',/^Дружба\s+външна\s+5\s+(Temperature|Humidity|Battery)$/i],
['Гараж','София',/^Дружба\s+гаража\s+6\s+(Temperature|Humidity|Battery)$/i],
['Хола','Царево',/^хола\s+Царево\s+(Temperature|Humidity|Battery)$/i]
];
rooms=defs.map(function(d){var r={name:d[0],location:d[1],temperature:null,humidity:null,battery:null};entities.forEach(function(x){var n=(x.name||'').replace(/\s+/g,' ').trim();if(d[2].test(n)){var k=kind(x);if(k==='temperature'||k==='humidity'||k==='battery')r[k]=x}});return r})
}
function val(x,k){return ok(x)?esc(x.state)+(k==='temperature'?'°C':'%'):'—'}
function row(r,i,small){var isStale=stale(r),a=r.temperature||r.humidity,bat=r.battery;return '<button class="sensor'+(isStale?' stale':'')+'" data-room="'+i+'"><span class="name">'+esc(r.name)+(isStale?'<div class="warn">Недостъпен / без данни</div>':'')+'</span><span class="value temp">'+val(r.temperature,'temperature')+'</span><span class="value hum">'+val(r.humidity,'humidity')+'</span><span class="battery">▰ '+val(bat,'battery')+'</span><span class="age">'+(a?age(a):'—')+'</span></button>'}
function render(){build();['София','Царево'].forEach(function(l){var rs=rooms.filter(function(r){return r.location===l}),html=rs.map(function(r){return row(r,rooms.indexOf(r),l==='Царево')}).join('');E(l==='София'?'sofia':'tsarevo').innerHTML=html||'<div class="empty">Няма налични сензори</div>'});document.querySelectorAll('[data-room]').forEach(function(b){b.onclick=function(){openRoom(rooms[Number(this.getAttribute('data-room'))])}})}
function renderHeat(climates){
var x=climates.find(function(c){return /спалня/i.test(c.name||'')})||climates[0];
var a=x&&x.attributes||{},current=a.current_temperature,target=a.temperature;
var battery=entities.find(function(e){return e.id==='sensor.druzhba_spalnia_battery'});
E('heating').innerHTML='<div class="sensor heatrow"><strong>Регулатор парно · Спалня</strong><span class="temp">'+esc(current==null?'—':current+'°C')+'</span><span class="muted">Зададени '+esc(target==null?'—':target+'°C')+'</span><span class="battery">▰ '+val(battery,'battery')+'</span></div>'
}
function weatherSvg(code){
code=Number(code);
var sun='<circle cx="19" cy="19" r="8" fill="#ffcf52"/><g stroke="#ffcf52" stroke-width="3" stroke-linecap="round"><path d="M19 3v6M19 29v6M3 19h6M29 19h6M8 8l4 4M26 26l4 4M30 8l-4 4M12 26l-4 4"/></g>';
var cloud='<path d="M13 34h25c7 0 11-5 11-11s-5-11-11-11c-2 0-4 0-5 1C29 5 17 5 12 14 4 14 1 20 1 25c0 5 5 9 12 9Z" fill="#d4e1ed" stroke="#8299af" stroke-width="2"/>';
var rain='<g stroke="#58bbff" stroke-width="3" stroke-linecap="round"><path d="M15 39l-4 8M29 39l-4 8M42 39l-4 8"/></g>';
var snow='<g fill="#a5e3ff" font-size="19"><text x="12" y="49">*</text><text x="33" y="49">*</text></g>';
var thunder='<path d="M27 34l-8 13h9l-4 10 16-20H29l5-3" fill="#ffdb58"/>';
var body=code===0?sun:code<=2?'<g transform="translate(0 -3)">'+sun+'</g><g transform="translate(12 10) scale(.75)">'+cloud+'</g>':code===3||code===45||code===48?cloud:code>=95?cloud+rain+thunder:code>=71&&code<=77?cloud+snow:cloud+rain;
return '<svg viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+body+'</svg>';
}
function weather(d){
var w=d&&d.weather;
if(!w){E('weather-desc').textContent='Прогнозата за София не е достъпна';E('forecast').innerHTML='<div class="muted">Няма метеоданни</div>';return}
var icons={0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',71:'🌨️',73:'❄️',75:'❄️',80:'🌦️',81:'🌧️',82:'🌧️',95:'⛈️',96:'⛈️',99:'⛈️'};
function description(code){if(code===0)return 'Слънчево';if(code<=2)return 'Разкъсана облачност';if(code===3)return 'Облачно';if(code===45||code===48)return 'Мъгла';if(code>=51&&code<=55)return 'Ръмеж';if(code>=61&&code<=65)return 'Дъжд';if(code>=71&&code<=77)return 'Сняг';if(code>=80&&code<=82)return 'Превалявания';if(code>=95)return 'Гръмотевици';return 'Променливо'}
E('weather-icon').innerHTML=weatherSvg(w.code);
E('weather-temp').textContent=w.temperature==null?'—':Math.round(w.temperature)+'°C';
E('weather-desc').textContent='София · '+description(Number(w.code));
E('forecast').innerHTML=(w.forecast||[]).slice(0,3).map(function(f){var dt=new Date(f.date+'T12:00:00');return '<div class="day"><div>'+esc(dt.toLocaleDateString('bg-BG',{weekday:'short'}))+'</div><div class="forecast-icon">'+weatherSvg(f.code)+'</div><div class="forecast-desc">'+esc(description(Number(f.code)))+'</div><strong>'+esc(Math.round(f.low))+'° / '+esc(Math.round(f.high))+'°</strong><div class="rain">💧 '+(f.rain==null?'—':esc(Math.round(f.rain))+'%')+'</div></div>'}).join('')||'<div class="muted">Няма прогноза</div>'
}
function load(){req('/api/status',function(status,data){if(status===401){E('auth').classList.remove('hide');E('status').textContent='Необходима е парола';return}if(status!==200||!data){E('status').textContent='Няма връзка';return}if(data.error){E('message').textContent=data.error;E('status').textContent='Грешка';return}E('auth').classList.add('hide');E('message').textContent='';entities=data.entities||[];render();E('status').textContent='● Онлайн · '+rooms.filter(function(r){return r.temperature||r.humidity}).length+' помещения';renderHeat(data.climates||[]);weather(data)})}
function openRoom(r){selected=r;period=24;E('dialog-title').textContent=r.name+' · '+r.location;E('details').innerHTML='<div class="stats"><div>Температура <span class="temp">'+val(r.temperature,'temperature')+'</span></div><div>Влажност <span class="hum">'+val(r.humidity,'humidity')+'</span></div><div>Батерия <span>'+val(r.battery,'battery')+'</span></div></div><div class="muted">Последно обновяване: '+age(r.temperature||r.humidity)+' (промяна в Home Assistant, не непременно физически отчет)</div>';E('overlay').classList.remove('hide');setPeriod(24)}
function setPeriod(p){period=p;document.querySelectorAll('[data-period]').forEach(function(b){b.classList.toggle('selected',Number(b.getAttribute('data-period'))===p)});if(!selected)return;var ids=[selected.temperature,selected.humidity].filter(Boolean).map(function(x){return encodeURIComponent(x.id)});if(!ids.length){drawHistory({});return}req('/api/history?hours='+p+'&entities='+ids.join(','),function(status,data){drawHistory(status===200&&data?data:{})})}
function drawHistory(data){['temperature','humidity'].forEach(function(k){var x=selected&&selected[k],samples=x&&data[x.id]||[];var points=samples.map(function(v){return {t:Date.parse(v.t),v:Number(v.v)}}).filter(function(v){return isFinite(v.t)&&isFinite(v.v)});var target=E(k==='temperature'?'chart-temp':'chart-hum');if(points.length<2){target.innerHTML='<div class="empty">Няма налична история за периода</div>';return}var min=Math.min.apply(null,points.map(function(v){return v.v})),max=Math.max.apply(null,points.map(function(v){return v.v})),lo=Math.min.apply(null,points.map(function(v){return v.t})),hi=Math.max.apply(null,points.map(function(v){return v.t})),span=Math.max(1,max-min),dur=Math.max(1,hi-lo);var poly=points.map(function(v){return (20+(v.t-lo)/dur*560).toFixed(1)+','+(130-(v.v-min)/span*105).toFixed(1)}).join(' ');target.innerHTML='<svg viewBox="0 0 600 150" role="img" aria-label="История"><line x1="20" y1="130" x2="580" y2="130" stroke="#555"/><polyline fill="none" stroke="'+(k==='temperature'?'#ffbe78':'#8ac8ff')+'" stroke-width="2.5" points="'+poly+'"/></svg><div class="muted">Мин '+min.toFixed(1)+' · Макс '+max.toFixed(1)+'</div>'})}
E('refresh').onclick=load;E('login').onclick=function(){var x=new XMLHttpRequest();x.open('POST','/api/login',true);x.setRequestHeader('Content-Type','application/json');x.onload=function(){if(x.status===200){E('password').value='';load()}else{E('status').textContent='Грешна парола'}};x.send(JSON.stringify({password:E('password').value}))};E('password').onkeydown=function(e){if(e.key==='Enter')E('login').click()};E('close').onclick=function(){E('overlay').classList.add('hide')};E('overlay').onclick=function(e){if(e.target===E('overlay'))E('overlay').classList.add('hide')};document.addEventListener('keydown',function(e){if(e.key==='Escape')E('overlay').classList.add('hide')});document.querySelectorAll('[data-period]').forEach(function(b){b.onclick=function(){setPeriod(Number(this.getAttribute('data-period')))}});load();setInterval(load,30000);
if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(function(){})}
})();