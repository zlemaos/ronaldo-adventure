// GUI "A v2" helpers: path identity for every life path, stamps, keepsakes, odds cells, look setting.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function load(files, extra) {
  const ctx = Object.assign({ RA: {}, console }, extra || {});
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  files.forEach(f => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx));
  return ctx;
}

test('every life path gets a spine colour and stamp; only football uses the ball', () => {
  const ctx = load(['data/routes.js', 'js/pixel.js']);
  const P = ctx.RA.Pixel, routes = ctx.RA.data.routes;
  assert.ok(routes.length > 40);
  for (const r of routes) {
    const th = P.pathTheme(r, 30);
    assert.match(th.spine, /^#[0-9A-F]{6}$/i, r.id);
    assert.ok(P.STAMP_SHAPES.includes(th.stamp), r.id + ' stamp');
    assert.ok(th.life, r.id);
    if (r.id !== 'football') assert.ok(!/축구/.test(th.life), r.id);
    if (r.id !== 'football') { assert.notEqual(th.stamp, 'ball', r.id); assert.notEqual(th.stampName, '공 도장', r.id); }
  }
  assert.equal(P.pathTheme(routes.find(r => r.id === 'football'), 13).stamp, 'ball');
  assert.equal(P.pathTheme(routes.find(r => r.id === 'cook'), 31).stamp, 'spoon');
  assert.equal(P.pathTheme(null, 3).life, '어린 시절');
});

test('stamps differ by result and keepsakes avoid football objects outside football lives', () => {
  const P = load(['js/pixel.js']).RA.Pixel;
  for (const shape of P.STAMP_SHAPES) {
    const keys = ['success', 'partial', 'fail', 'choice'].map(k => Buffer.from(P.stampBitmap(shape, k)).toString('hex'));
    assert.equal(new Set(keys).size, 4, shape);
  }
  for (const kind of ['pro', 'national', 'birth', 'graduation', 'marriage', 'first_job', 'promote', 'whatever']) {
    assert.ok(!['boots', 'ball'].includes(P.keepsakeFor(kind, false)), kind);
    assert.ok(P.KEEPSAKES.includes(P.keepsakeFor(kind, false)), kind);
  }
  assert.equal(P.keepsakeFor('pro', true), 'boots');
});

test('odds cells keep order and show 0%; look setting defaults to v2 and persists classic', () => {
  const store = {};
  const el = { dataset: {}, classList: { set: new Set(), toggle(c, on) { on ? this.set.add(c) : this.set.delete(c); } } };
  const ctx = load(['js/opening.js'], {
    localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; } },
    matchMedia: () => ({ matches: false }),
    document: { documentElement: el }
  });
  const V = ctx.RA.V2;
  const cells = V.oddsCells({ success: 0.65, partial: 0, fail: 0.35 });
  assert.deepEqual(cells.map(c => c.name + c.pct), ['성공65', '부분 성공0', '실패35']);
  V.init();
  assert.equal(V.isV2(), true);
  assert.ok(el.classList.set.has('ui-v2'));
  V.settings.look = 'classic'; V.apply();
  assert.ok(!el.classList.set.has('ui-v2'));
  assert.equal(JSON.parse(store['ronaldo-adventure.preferences']).look, 'classic');
  // older preference objects without a look load as v2
  store['ronaldo-adventure.preferences'] = JSON.stringify({ text: 'large' });
  V.settings.look = undefined; V.init();
  assert.equal(V.settings.look, 'v2');
  assert.equal(V.resultInfo('choice').name, '기록됨');
});
