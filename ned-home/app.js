(function () {
  'use strict';
  var password = '', last = [];
  function el(id) { return document.getElementById(id); }
  function safe(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function clock() { var d = new Date(); el('clock').textContent = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); el('date').textContent = d.toLocaleDateString('bg-BG'); }
  clock(); setInterval(clock, 15000);
  function locationOf(x) { return /царево|tsarevo|tzarevo/i.test(x.name + ' ' + x.id) ? 'Царево' : 'София'; }
  function kindOf(x) {
    var k = (x.kind || '').toLowerCase(), name = (x.name || '').toLowerCase();
    if (k === 'temperature' || x.unit === '°C' || /(?:temperature|температура)$/.test(name)) return 'temperature';
    if (k === 'humidity' || (x.unit === '%' && !/battery|батерия/i.test(name)) || /(?:humidity|влажност)$/.test(name)) return 'humidity';
    if (k === 'battery' || /(?:battery|батерия)$/.test(name)) return 'battery';
    return 'other';
  }
  function roomName(x) {
    var name = String(x.name || x.id || 'Сензор');
    name = name.replace(/^(?:(?:дружба|софия|царево|druzhba|sofia|tsarevo|tzarevo)[\s\-–_:]+)+/i, '');
    name = name.replace(/[\s\-–_:]*(?:temperature|humidity|battery|температура|влажност|батерия)\s*$/i, '');
    name = name.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
    return name || 'Общ сензор';
  }
  function valid(x) { return x && x.state != null && x.state !== 'unknown' && x.state !== 'unavailable' && x.state !== ''; }
  function metric(kind, item) {
    var labels = {temperature:'Температура',humidity:'Влажност',battery:'Батерия'};
    var val = '—', extra = '', low = false;
    if (item && valid(item)) {
      val = String(item.state) + (kind === 'temperature' ? ' °C' : ' %');
      if (kind === 'battery') { var n = parseFloat(item.state); low = !isNaN(n) && n <= 30; }
    }
    return '<div class="metric"><div class="metric-label">' + labels[kind] + '</div><div class="metric-value ' + kind + (low ? ' low' : '') + (val === '—' ? ' missing' : '') + '">' + safe(val) + '</div></div>';
  }
  function render() {
    var buckets = {'София':{},'Царево':{}}, html = '';
    last.forEach(function (x) {
      var loc = locationOf(x), room = roomName(x), key = room.toLocaleLowerCase('bg-BG'), group = buckets[loc], kind = kindOf(x);
      if (!group[key]) group[key] = {name:room, temperature:null, humidity:null, battery:null, other:[]};
      if (kind === 'other') group[key].other.push(x);
      else if (!group[key][kind] || (!valid(group[key][kind]) && valid(x))) group[key][kind] = x;
    });
    ['София','Царево'].forEach(function (loc) {
      var rooms = Object.keys(buckets[loc]).map(function (k) { return buckets[loc][k]; });
      rooms.sort(function (a,b) { return a.name.localeCompare(b.name,'bg'); });
      html += '<section><div class="section-head"><h2>' + loc + '</h2><span class="muted">' + rooms.length + ' помещения / устройства</span></div>';
      if (!rooms.length) { html += '<div class="empty">Няма открити сензори.</div></section>'; return; }
      html += '<div class="cards">';
      rooms.forEach(function (r) {
        var hasMain = !!(r.temperature || r.humidity || r.battery);
        html += '<article class="card"><div class="card-title">' + safe(r.name) + '</div>';
        if (hasMain) html += '<div class="metrics">' + metric('temperature',r.temperature) + metric('humidity',r.humidity) + metric('battery',r.battery) + '</div>';
        r.other.forEach(function (x) {
          var val = valid(x) ? x.state + (x.unit ? ' ' + x.unit : '') : 'Няма данни';
          html += '<div class="card-note">' + safe(x.name) + ': <span class="other-reading">' + safe(val) + '</span></div>';
        });
        html += '</article>';
      });
      html += '</div></section>';
    });
    el('content').innerHTML = html;
  }
  function load() {
    var xhr = new XMLHttpRequest(); xhr.open('GET','/api/status',true);
    if (password) xhr.setRequestHeader('X-App-Password',password);
    xhr.timeout = 18000;
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status === 401) { el('auth').style.display = 'flex'; el('status').textContent = 'Необходима е парола'; return; }
      if (xhr.status !== 200) { el('status').textContent = 'Няма връзка'; el('message').innerHTML = '<div class="alert">Сървърът не отговаря. Проверете NAS и Home Assistant.</div>'; return; }
      var data; try { data = JSON.parse(xhr.responseText); } catch (e) { el('status').textContent = 'Невалиден отговор'; return; }
      if (data.error) { el('status').textContent = 'Грешка'; el('message').innerHTML = '<div class="alert">' + safe(data.error) + '</div>'; return; }
      el('auth').style.display = 'none'; el('message').innerHTML = ''; last = data.entities || [];
      el('status').textContent = '● Онлайн · ' + last.length + ' показания'; render();
    };
    xhr.ontimeout = function () { el('status').textContent = 'Изтекло време'; };
    xhr.send();
  }
  el('refresh').onclick = load;
  el('login').onclick = function () { password = el('password').value; load(); };
  el('password').onkeydown = function (e) { if ((e || window.event).keyCode === 13) el('login').click(); };
  load(); setInterval(load,30000);
})();
