'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('../tools/sim-helpers');

test('proposal outcome names the newly married partner', () => {
  const RA = load(), E = RA.Engine;
  const s = E.newGame({ country: 'us', seed: 'proposal-review' });
  s.age = 25;
  s.people.push({ role: 'partner', name: 'Jamie', alive: true, age: 25, rel: 100 });
  s.queue = ['sys_proposal'];
  const original = RA.RNG.next;
  RA.RNG.next = () => 0;
  try {
    const result = E.choose(s, 0);
    assert.equal(result.outcome, 'success');
    assert.match(result.log, /Jamie/);
  } finally { RA.RNG.next = original; }
});

test('corporate expenses require a corporate client-facing career', () => {
  const E = load().Engine, s = E.newGame({ country: 'us', seed: 'expenses' });
  const ev = E.eventIndex().mis_company_card;
  s.age = 30;
  s.job = { id: 'soldier', level: 0 };
  assert.equal(E.condMatches(s, ev.cond), false);
  s.job = { id: 'sales_rep', level: 0 };
  assert.equal(E.condMatches(s, ev.cond), true);
});

test('school-dependent household help requires enrollment', () => {
  const E = load().Engine, s = E.newGame({ country: 'us', seed: 'school-help' });
  s.age = 10;
  s.edu.stage = 'none';
  assert.equal(E.condMatches(s, E.eventIndex().cri_mother_job.cond), false);
  s.edu.stage = 'elem';
  assert.equal(E.condMatches(s, E.eventIndex().cri_mother_job.cond), true);
});

test('abstinence after a sober fathers funeral does not invent a fatal disease', () => {
  const RA = load(), E = RA.Engine, s = E.newGame({ country: 'us', seed: 'funeral' });
  const father = s.people.find(p => p.role === 'father');
  father.alive = false;
  s.queue = ['canon_father_farewell'];
  const original = RA.RNG.next;
  RA.RNG.next = () => 0;
  try {
    const result = E.choose(s, 2);
    assert.equal(result.outcome, 'success');
    assert.doesNotMatch(result.log, /앗아 간 병|술 때문에|알코올/);
    assert.ok(s.flags.teetotal);
  } finally { RA.RNG.next = original; }
});
