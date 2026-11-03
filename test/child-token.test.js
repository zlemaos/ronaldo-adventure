'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('../tools/sim-helpers');

test('child age gates select the same child for cards and outcomes after the queue advances', () => {
  const E = load().Engine;
  const s = E.newGame({ country: 'us', seed: 'child-token' });
  s.people = [
    { role: 'child', name: 'Alex', alive: true, age: 25, rel: 70 },
    { role: 'child', name: 'Jamie', alive: true, age: 14, rel: 70 }
  ];
  const ev = E.eventIndex().life_mid_child_football;
  const original = ev.choices;
  ev.choices = [{ text: '{child}', effects: {}, log: '{child}' }];
  try {
    s.queue = [ev.id];
    assert.equal(E.condMatches(s, ev.cond), true);
    assert.equal(E.render(s, '{child}'), 'Jamie');
    assert.equal(E.choose(s, 0).log, 'Jamie');
    assert.equal(E.render(s, '{child}'), 'Alex', 'event context must not leak');
  } finally {
    ev.choices = original;
  }
});
