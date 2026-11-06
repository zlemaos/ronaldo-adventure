'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { load } = require('../tools/sim-helpers');
const RA = load(), E = RA.Engine, F = RA.Family;
const athletes = [
  ['pro_football', '프로 축구선수', '축구', 36000],
  ['pro_baseball', '프로 야구선수', '야구', 48000],
  ['pro_basketball', '프로 농구선수', '농구', 36000]
];
function family(jobId, role = 'father', country = 'kr') {
  const spec = F.preset('canon');
  spec.preset = 'custom'; spec.residence = country; spec.siblings = 0;
  spec.parents.forEach(p => {
    p.nationality = country; p.jobId = 'caregiver'; p.talents = {}; p.bright = {}; p.dark = {};
  });
  spec.parents[role === 'father' ? 0 : 1].jobId = jobId;
  return spec;
}
function resolve(s) {
  let guard = 0;
  while (s.queue.length) {
    assert.ok(guard++ < 50, 'the year must finish without a stuck decision');
    const ev = E.currentEvent(s);
    assert.ok(ev);
    assert.ok(E.choose(s, ev.choices.find(c => c.enabled).i));
  }
}

test('athletes are offered in both parent selectors and can be born in every country or rolled randomly', () => {
  const selects = [0, 1].map(parent => ({ dataset: { path: 'jobId', parent: String(parent) } }));
  const birth = {};
  const root = {
    innerHTML: '',
    querySelectorAll: q => q === 'select[data-path]' ? selects : [],
    querySelector: q => q === '#family-birth' ? birth : null
  };
  let chosen;
  const context = { RA, scrollTo() {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/parents_ui.js'), 'utf8'), context);
  context.RA.ParentsUI.open(root, { esc: String, birth: spec => { chosen = spec; } });
  for (const [id, name] of athletes) {
    assert.equal((root.innerHTML.match(new RegExp('<option value="' + id + '">' + name + '</option>', 'g')) || []).length, 2);
    for (const select of selects) { select.value = id; select.onchange(); }
    birth.onclick();
    assert.deepEqual(chosen.parents.map(p => p.jobId), [id, id]);
    for (const country of Object.keys(RA.data.countries)) {
      const s = E.newGame({ ...family(id, 'mother', country), seed: 'international-athlete' });
      assert.equal(E.vars(s).motherJob, name);
      assert.equal(s.country, country);
    }
  }
  const rolled = new Set();
  for (let i = 0; i < 500; i++) F.randomParents('athlete-roll-' + i).parents.forEach(p => rolled.add(p.jobId));
  for (const [id] of athletes) assert.ok(rolled.has(id), id + ' can be rolled');
  assert.equal(F.preset('canon').parents[0].jobId, 'kitman');
});

test('athlete employment supplies away schedules, sports exposure and non-star tier income', () => {
  for (const [id, , , income] of athletes) {
    const s = E.newGame({ ...family(id), seed: 'athlete-income' });
    assert.ok(E.condMatches(s, { parent: { role: 'father', alive: true, time: ['away'], exposure: ['sports'] } }));
    F.householdYear(s);
    assert.equal(s.household.ledger.income.father, income);
    assert.ok(F.checkLedger(s));
    assert.equal(E.condMatches(s, { parent: { role: 'father', exposure: ['football'] } }), id === 'pro_football');
  }
});

test('athlete family scenes offer their own sport, light talent practice and a real opt-out', () => {
  for (const [id, , sport] of athletes) {
    for (const role of ['father', 'mother']) {
      const s = E.newGame({ ...family(id, role), seed: 'athlete-family' });
      E.choose(s, 0); s.age = 5; s.year = s.birthYear + 5; s.queue = [];
      const ev = E.eventIndex()['fam_' + role + '_job_' + id];
      assert.ok(ev, 'athlete has an ordinary family job scene');
      assert.ok(E.condMatches(s, ev.cond));
      assert.ok(E.careerStoryOk(s, ev));
      E.fireEvent(s, ev);
      assert.ok(E.currentEvent(s).text.includes(sport));
      if (id !== 'pro_football') assert.ok(!E.currentEvent(s).text.includes('축구'));
      const before = s.talent.sport, football = s.stats.football;
      const declined = RA.Save.deserialize(JSON.stringify(s));
      E.choose(declined, 1);
      assert.equal(declined.talent.sport, before);
      E.choose(s, 0);
      assert.equal(s.talent.sport, before + 2);
      assert.equal(s.stats.football, football);
      assert.ok(E.person(s, role).memories.some(m => m.tag === 'job_' + id));
    }
  }
});

test('real childhood years include sport exposure then one retirement at 38, with saved coaching income and no stale athlete stories', () => {
  for (const [id, , sport, income] of athletes) {
    for (const role of ['father', 'mother']) {
      let s = E.newGame({ ...family(id, role), seed: 'athlete-years-' + id + role });
      let p = E.person(s, role);
      p.bornAt = -30; p.age = 30;
      for (let age = 1; age <= 10; age++) {
        resolve(s); E.ageUp(s);
        p = E.person(s, role);
        assert.ok(p.alive);
        if (age === 2) {
          const card = s.cards.find(c => c.id === 'inf_' + role + '_athlete_' + id);
          assert.ok(card && card.text.includes(sport));
          assert.ok(card.chg.some(c => c.k === 'talent_sport' && c.d === 3));
        }
        if (age < 8) {
          assert.equal(p.v2.jobId, id);
          assert.equal(s.household.ledger.income[role], income);
        } else {
          assert.equal(p.age, 30 + age);
          assert.equal(E.vars(s)[role + 'Job'], '스포츠 지도자');
          assert.equal(s.household.ledger.income[role], 24000);
          assert.equal(E.condMatches(s, { parent: { role, time: ['away'] } }), false);
          assert.equal(E.condMatches(s, E.eventIndex()['fam_' + role + '_job_' + id].cond), false);
          const memories = p.memories.filter(m => m.tag === 'athlete_retirement_' + p.id);
          assert.equal(memories.length, 1);
          assert.equal(memories[0].age, 8);
          assert.ok(memories[0].text.includes(sport) && memories[0].text.includes('은퇴'));
          assert.equal(s.log.filter(l => l.t.includes('선수 생활을 마치고')).length, 1);
        }
        if (age === 7 || age === 8) {
          const store = RA.Save.memStorage();
          RA.Save.save(0, s, store); s = RA.Save.load(0, store);
        }
        assert.ok(F.checkLedger(s));
      }
    }
  }
});

test('ordinary jobs and deceased athlete parents do not change careers', () => {
  const s = E.newGame({ ...F.preset('canon'), seed: 'ordinary-jobs' });
  for (const p of s.people.filter(p => p.v2)) { p.age = 60; p.bornAt = -60; }
  F.householdYear(s);
  assert.equal(E.person(s, 'father').v2.jobId, 'kitman');
  assert.equal(E.person(s, 'mother').v2.jobId, 'cook');
  const dead = E.newGame({ ...family('pro_baseball'), seed: 'deceased-athlete' });
  const p = E.person(dead, 'father'); p.alive = false; p.age = 60; p.bornAt = -60;
  F.householdYear(dead);
  assert.equal(p.v2.jobId, 'pro_baseball');
  assert.equal(dead.household.ledger.income.father, 0);
  assert.ok(!p.memories.some(m => m.tag === 'athlete_retirement_' + p.id));
});
