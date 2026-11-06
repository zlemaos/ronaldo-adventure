'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('../tools/sim-helpers');
const RA = load(), E = RA.Engine;

function fresh(country = 'us', seed = 'story-fix') {
  const s = E.newGame({ country, seed });
  while (s.queue.length) E.choose(s, 0);
  s.queue = [];
  s.origin = 'middle';
  s.hobbies = []; s.hobbyEver = {};
  s.age = 80; s.edu.stage = 'none'; s.fb.stage = 'none';
  s.route = { id: 'office', st: 0, sk: 40, since: 30 };
  s.routeSeen = { office: 30 }; s.routeYears = { office: 40 }; s.routePeak = {};
  s.routeLog = []; s.jobHistory = []; s.job = null;
  s.stats.fame = 0; s.stats.football = 0;
  s.traits.record = 0; s.traits.alcohol = 0;
  return s;
}
function show(s, id) {
  s.queue = [id];
  const ev = E.currentEvent(s);
  assert.equal(ev && ev.id, id);
  return ev;
}

test('an old sporting injury remains history without erasing a later medical career or recovery', () => {
  const s = fresh();
  s.flags.career_injury = 24;
  s.route = { id: 'medical', st: 0, sk: 90, since: 30 };
  s.routeSeen = { football: 10, medical: 30 };
  s.routeYears = { football: 14, medical: 40 }; s.routePeak = { medical: 50 };
  assert.equal(E.ending(s).id, 'route_medical_win');
  assert.equal(s.flags.career_injury, 24);
  s.routePeak = {}; s.routeSeen = { football: 10 }; s.routeYears = { football: 14 };
  s.route.id = 'none';
  assert.equal(E.ending(s).id, 'injury_end');
  s.flags.bankrupt = 30; s.money = 100;
  assert.equal(E.ending(s).id, 'comeback');
});

test('sustained rehabilitation outranks old convictions but not current imprisonment or recent reoffending', () => {
  const s = fresh();
  s.age = 70; s.flags.went_straight = 30; s.flags.ever_jailed = 25;
  s.traits.record = 2;
  assert.equal(E.ending(s).id, 'went_straight');
  s.fb.seasons = 4;
  assert.equal(E.ending(s).id, 'went_straight');
  s.fb.seasons = 0; s.jail = 2;
  assert.equal(E.ending(s).id, 'jailbird');
  s.jail = 0; s.flags.ever_jailed = 68;
  assert.equal(E.ending(s).id, 'jailbird');
});

test('local legend requires football participation, not just an office worker with football ability', () => {
  const s = fresh();
  s.stats.football = 47;
  assert.notEqual(E.ending(s).id, 'local_legend');
  s.routeSeen.football = 10;
  assert.equal(E.ending(s).id, 'local_legend');
  delete s.routeSeen.football;
  s.fb.stage = 'local';
  assert.equal(E.ending(s).id, 'local_legend');
});

test('language-related academic failure offers school support instead of a conduct warning', () => {
  let failed;
  for (let i = 0; i < 40 && !failed; i++) {
    const s = fresh('in', 'academic-' + i);
    s.age = 14; s.edu.stage = 'middle'; s.stats.smarts = 0;
    s.fb.stage = 'academy'; s.route.id = 'football'; s.routeSeen.football = 12;
    s.flags.moved_alone = 12;
    show(s, 'in_kolkata_homesick');
    const result = E.choose(s, 0);
    if (result.outcome === 'fail') failed = s;
  }
  assert.ok(failed, 'seeded academic failure reached');
  assert.ok(!failed.flags.academy_warning, 'academic trouble is not misconduct');
  assert.ok(failed.flags.academy_academic_warning);
  const support = E.currentEvent(failed);
  assert.ok(support && /수업|언어|과외/.test(support.text));
  const result = E.choose(failed, 0);
  assert.match(result.log, /수업|과외|보충/);
  assert.ok(!failed.flags.academy_academic_warning);
  failed.flags.academy_warning = 14;
  show(failed, 'canon_warning');
});

test('choosing a retake schedules next-year results with better, same and worse outcomes or an exit', () => {
  const outcomes = new Set();
  for (let i = 0; i < 45; i++) {
    const s = fresh('kr', 'retake-' + i);
    s.age = 19; s.flags.kr_suneung_taken = 18; s.stats.smarts = 50;
    show(s, 'kr_suneung_result');
    const before = s.money;
    E.choose(s, 1);
    assert.equal(s.money - before, Math.round(-800 * E.country(s).wage));
    const due = s.pending.find(p => /jaesu/.test(p.id));
    assert.ok(due, 'retake follow-up scheduled');
    assert.equal(due.age, 20);
    s.queue = []; E.ageUp(s);
    assert.ok(s.queue.includes(due.id), 'real yearly selector delivers the retake');
    show(s, due.id);
    const result = E.choose(s, 0);
    outcomes.add(result.outcome);
    assert.match(result.log, /지난.*보다|지난.*비슷/);
    assert.ok(!s.flags.kr_jaesu, 'retake resolved');
    if (i === 0) {
      s.flags.kr_jaesu = 19;
      const ev = show(s, due.id);
      assert.ok(ev.choices.length >= 2);
      E.choose(s, 1);
      assert.ok(!s.flags.kr_jaesu, 'explicit exit resolves retake too');
    }
  }
  assert.deepEqual([...outcomes].sort(), ['fail', 'partial', 'success']);
});

test('a lifelong no-drink vow is acknowledged at alcohol offers and can be kept or broken', () => {
  const s = fresh();
  s.age = 30; s.flags.teetotal = 20; s.traits.alcohol = 25; s.money = 100000;
  const ev = show(s, 'drk_pocha');
  const keep = ev.choices.find(c => /맹세.*지|금주.*지/.test(c.text));
  assert.ok(keep, 'offer includes keeping the vow');
  const result = E.choose(s, keep.i);
  assert.match(result.log, /맹세|아버지/);
  assert.equal(s.flags.teetotal, 20); assert.equal(s.traits.alcohol, 25);
  const offer = show(s, 'drk_pocha');
  assert.match(offer.choices[0].text, /맹세|금주/);
  E.choose(s, 0);
  assert.ok(!s.flags.teetotal);
  assert.ok(s.log.some(l => /맹세.*깼/.test(l.t)));
  s.queue = []; s.flags.teetotal = 20; s.ap = 3;
  const activity = E.activities(s).find(a => a.id === 'drink');
  assert.match(activity.label, /맹세|금주/);
  const abstain = E.activities(s).find(a => a.id === 'keep_teetotal');
  assert.ok(abstain);
  assert.match(E.doActivity(s, abstain.id).log, /맹세/);
  assert.equal(s.flags.teetotal, 20);
  assert.match(E.doActivity(s, 'drink').log, /맹세.*깼/);
  assert.ok(!s.flags.teetotal);
});
