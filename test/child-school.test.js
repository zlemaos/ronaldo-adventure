'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('../tools/sim-helpers');

test('school-only childhood scenes reject children outside education', () => {
  const E = load().Engine;
  const s = E.newGame({ country: 'kr', seed: 'school-eligibility' });
  s.age = 9;
  for (const id of ['life_child_birthday_party', 'life_child_handmedown_shoes', 'rl_kid_game_time',
    'mis_fake_sick', 'life_any_time_capsule', 'chd_slum_walk', 'chd_poor_trip_fee', 'chd_rich_driver']) {
    const ev = E.allEvents().find(e => e.id === id);
    s.edu.stage = 'none';
    assert.equal(E.condMatches(s, ev.cond), false, id);
    s.edu.stage = 'elem';
    assert.equal(E.condMatches(s, ev.cond), true, id);
  }
});
