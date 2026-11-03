'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('../tools/sim-helpers');

test('queued route scenes expire after leaving, including direct choice resolution', () => {
  const E = load().Engine;
  const index = E.eventIndex();
  for (const route of ['football', 'basketball', 'rapper', 'medical']) {
    const s = E.newGame({ country: 'us', seed: route });
    const id = 'continuity_fixture';
    index[id] = { id, routes: [route], text: 'Working in this route',
      choices: [{ text: 'Continue', effects: { money: 100 }, log: 'Still working' }] };
    s.route.id = route;
    s.queue = [id];
    assert.ok(E.currentEvent(s), route + ' accepts its own scene');
    s.route.id = 'none';
    s.fb.stage = 'none';
    assert.equal(E.currentEvent(s), null, route + ' must expire');
    s.queue = [id];
    const money = s.money;
    assert.equal(E.choose(s, 0), null, route + ' must not resolve a stale choice');
    assert.equal(s.money, money);
    delete index[id];
  }
});
