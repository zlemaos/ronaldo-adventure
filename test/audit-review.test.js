'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('../tools/sim-helpers');

test('adult university band practice outcomes work with a deceased mother', () => {
  const RA = load(), E = RA.Engine;
  for (const [choice, roll, outcome] of [[0, 0.99, 'fail'], [0, 0, 'success'], [1, 0, null]]) {
    const s = E.newGame({ country: 'us', seed: 'adult-jam' });
    s.age = 50;
    s.edu.stage = 'univ';
    s.hobbies = ['band'];
    const mother = s.people.find(p => p.role === 'mother');
    mother.name = 'Jamie'; mother.alive = false;
    s.queue = ['hob_jam'];
    assert.equal(E.condMatches(s, E.eventIndex().hob_jam.cond), true);
    const original = RA.RNG.next;
    RA.RNG.next = () => roll;
    try {
      const result = E.choose(s, choice);
      assert.ok(result);
      assert.equal(result.outcome, outcome);
      assert.doesNotMatch(result.log, /Jamie|어머니|엄마|부모|옷장 위/);
      if (outcome === 'fail') assert.match(result.log, /넣어 두기로 했다/);
    } finally { RA.RNG.next = original; }
  }
});

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
