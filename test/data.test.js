'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { loadAll, validate } = require('../tools/validate-data.js');

test('all data packs pass schema validation', () => {
  const res = validate(loadAll());
  assert.deepStrictEqual(res.errors, [], res.errors.slice(0, 20).join('\n'));
});

test('content volume targets are met', () => {
  const { counts } = validate(loadAll());
  assert.ok(counts.events >= 300, 'events: ' + counts.events);
  assert.ok(counts.careers >= 120, 'careers: ' + counts.careers);
  assert.strictEqual(counts.countries, 8);
  for (const c of ['kr', 'jp', 'cn', 'us', 'br', 'ar', 'za', 'in']) assert.ok(counts.byPrefix[c] >= 10, c + ' country events: ' + counts.byPrefix[c]);
});

test('every career sector has at least 4 careers and every sector is covered by events', () => {
  const RA = loadAll();
  const per = {};
  RA.data.careers.forEach(k => { per[k.sector] = (per[k.sector] || 0) + 1; });
  for (const sec of Object.keys(RA.C.SECTORS)) assert.ok(per[sec] >= 4, sec + ' has ' + per[sec]);
  const evSec = {};
  const secOf = {}; RA.data.careers.forEach(k => { secOf[k.id] = k.sector; });
  RA.data.events.forEach(e => {
    const c = e.cond || {};
    const secs = new Set((c.sector || []).concat(Array.isArray(c.career) ? c.career.map(id => secOf[id]) : []));
    secs.forEach(x => { evSec[x] = (evSec[x] || 0) + 1; });
  });
  // sports is covered by the football route events (fb_/canon_) instead of sector conditions
  for (const sec of Object.keys(RA.C.SECTORS)) if (sec !== 'sports') assert.ok(evSec[sec] >= 2, sec + ' events: ' + evSec[sec]);
});
