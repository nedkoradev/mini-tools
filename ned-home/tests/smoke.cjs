'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(base, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(base, 'index.html'), 'utf8');
for (const id of ['clock', 'date', 'holiday', 'moon', 'settings-btn', 'settings-overlay', 'settings-list', 'status', 'forecast']) {
  assert.ok(html.includes('id="' + id + '"'), 'Missing element ' + id);
}
assert.ok(html.includes('v2.15'), 'Wrong displayed version');
// Fixed UTC instant: 16 November 2026, 00:06 in Sofia; observed waxing crescent ~35%.
class FixedDate extends Date {
  constructor(...args) { if (args.length === 0) super('2026-11-15T22:06:00.000Z'); else super(...args); }
}
const elements = new Map();
function element(id) {
  if (!elements.has(id)) {
    const classes = new Set(['hide']);
    elements.set(id, {
      textContent: '', innerHTML: '', style: {}, attributes: {},
      setAttribute(name,value) { this.attributes[name] = value; },
      classList: {
        add(name) { classes.add(name); },
        remove(name) { classes.delete(name); },
        contains(name) { return classes.has(name); },
        toggle(name, force) { if (force) classes.add(name); else classes.delete(name); }
      }
    });
  }
  return elements.get(id);
}
class XHR {
  open(method, url) { this.url = url; }
  send() {
    if (this.url === '/api/status') {
      this.readyState = 4;
      this.status = 200;
      this.responseText = JSON.stringify({entities: [], climates: [], weather: {temperature: 5, code: 61, forecast: []}});
      if (this.onreadystatechange) this.onreadystatechange();
    }
  }
}
vm.runInNewContext(script, {
  document: {getElementById: element, querySelectorAll: () => [], addEventListener: () => {}},
  localStorage: {getItem: () => null, setItem: () => {}},
  XMLHttpRequest: XHR, navigator: {}, setInterval: () => {},
  Date:FixedDate, Math, Number, String, Array, Object, JSON, RegExp, isFinite, parseInt, encodeURIComponent
}, {filename: 'app.js', timeout: 2000});
assert.match(element('clock').textContent, /^\d{2}:\d{2}$/, 'Clock did not start');
assert.ok(element('date').innerHTML.length > 0, 'Date did not render');
assert.match(element('moon').innerHTML, /<svg\b/, 'SVG moon missing');
assert.match(element('moon').innerHTML, /data-waxing="1"/, 'Moon should be waxing on Nov 16');
const fraction = Number((element('moon').innerHTML.match(/data-illumination="([\d.]+)"/)||[])[1]);
assert.ok(fraction >= 34 && fraction <= 38, 'Expected about 36% illumination on Nov 16, got '+fraction);
assert.equal(element('moon').textContent, '', 'Moon should not have a text label in the layout');
assert.equal(element('weather-temp').textContent, '5°C', 'Weather did not render');
assert.equal(typeof element('settings-btn').onclick, 'function', 'Settings button is inactive');
element('settings-btn').onclick();
assert.equal(element('settings-overlay').classList.contains('hide'), false, 'Settings did not open');
console.log('NED Home runtime smoke test passed');
