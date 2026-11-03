'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('../tools/sim-helpers');

test('mischief scenes require school, a living mother, or the relevant profession', () => {
  const E = load().Engine;
  const s = E.newGame({ country: 'kr', seed: 'mischief-gates' });
  const event = id => E.allEvents().find(e => e.id === id);
  s.edu.stage = 'none';
  assert.equal(E.condMatches(s, event('mis_smoke_try').cond), false);
  s.edu.stage = 'high';
  assert.equal(E.condMatches(s, event('mis_smoke_try').cond), true);
  s.flags.lie_concert = 15;
  const mother = s.people.find(p => p.role === 'mother');
  for (const id of ['mis_lie_concert', 'mis_lie_found']) {
    mother.alive = false;
    assert.equal(E.condMatches(s, event(id).cond), false, id);
    mother.alive = true;
    assert.equal(E.condMatches(s, event(id).cond), true, id);
  }
  for (const [id, wrong, right] of [
    ['mis_bribe_official', 'fighter_pilot', 'civil_servant'],
    ['mis_fake_news', 'comedian', 'journalist']
  ]) {
    s.job = { id: wrong, level: 1 };
    assert.equal(E.condMatches(s, event(id).cond), false, id);
    s.job = { id: right, level: 1 };
    assert.equal(E.condMatches(s, event(id).cond), true, id);
  }
});
