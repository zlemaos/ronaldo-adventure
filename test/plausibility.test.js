'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('../tools/sim-helpers');
test('match fixing never describes a ball or club to fighters and esports players', () => {
  const E = load().Engine;
  for (const route of ['fighter', 'esports', 'football', 'basketball', 'baseball']) {
    const s = E.newGame({ country: 'kr', seed: 'plausibility-' + route });
    s.age = 25;
    s.route.id = route;
    s.queue = ['spn_match_fix'];
    const card = E.currentEvent(s);
    assert.ok(card, route);
    if (['fighter', 'esports'].includes(route)) {
      assert.doesNotMatch(card.text + card.choices.map(c => c.text).join(' '), /구단|시즌 연봉/);
    }
    const result = E.choose(s, 0);
    assert.ok(result);
    if (['fighter', 'esports'].includes(route)) assert.doesNotMatch(result.log, /공 하나|골|드리블/);
  }
});
