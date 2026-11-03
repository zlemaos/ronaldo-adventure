'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('../tools/sim-helpers');

test('grandchild stories need an adult child and a previously born, speaking-age grandchild', () => {
  const E = load().Engine;
  const s = E.newGame({ country: 'kr', seed: 'grandchild-eligibility' });
  s.age = 65;
  s.people = [{ role: 'child', name: '민수', gender: 'm', alive: true, age: 8 }];
  const birth = E.allEvents().find(e => e.id === 'life_old_grandchild');
  const visit = E.allEvents().find(e => e.id === 'life_old_grandkid_visit');
  const care = E.allEvents().find(e => e.id === 'rl_old_grandkids');
  const eligible = ev => E.condMatches(s, ev.cond) && (!ev.when || ev.when(s));
  assert.equal(eligible(birth), false, 'a minor child cannot trigger grandparenthood');
  s.people.push({ role: 'child', name: '민지', gender: 'f', alive: true, age: 25 });
  assert.equal(eligible(birth), true);
  assert.equal(eligible(visit), false, 'having children alone is not grandparenthood');
  assert.equal(eligible(care), false, 'childcare needs a grandchild');
  s.achievements.grandparent = 65;
  assert.equal(eligible(visit), false, 'a newborn cannot ask for stories');
  assert.equal(eligible(care), false, 'a newborn cannot speak thanks');
  s.age = 68;
  assert.equal(eligible(visit), true);
  assert.equal(eligible(care), true);
});
