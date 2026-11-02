'use strict';
/* Round 3: fixed hero name, prenatal pick, early-childhood montage, early-education focus,
 * auto-play stepping, event categories, 공감 stat and triumph cues. */
const test = require('node:test');
const assert = require('node:assert');
const { load, autoplay } = require('../tools/sim-helpers.js');
const RA = load();
const E = RA.Engine, C = RA.C, T = RA.Text, S = RA.Save;
const COUNTRIES = ['pt', 'kr', 'jp', 'cn', 'us', 'br', 'ar', 'za', 'in'];

function pickFirst(s) { const ev = E.currentEvent(s); return E.choose(s, ev.choices.findIndex(c => c.enabled)); }

test('the hero is always 호날두 (male or female) and particles fit the name', () => {
  for (const g of ['m', 'f']) {
    const s = E.newGame({ country: 'br', seed: 'name', gender: g, given: '다른이름' });
    assert.strictEqual(s.hero.given, '호날두');
    assert.strictEqual(E.heroName(s), '호날두');
    assert.strictEqual(E.render(s, '{name}[이/가] {name}[을/를] 봤다. {name}[은/는] {name}[과/와] {name}[으로/로]'), '호날두가 호날두를 봤다. 호날두는 호날두와 호날두로');
  }
  // family members keep their own names
  const s = E.newGame({ country: 'kr', seed: 'name' });
  assert.strictEqual(E.person(s, 'father').name, RA.data.countries.kr.family.father.name);
  // later generations are told apart
  assert.strictEqual(E.genName(3), '3대 호날두');
});

test('old saves load with the name set to 호날두 and the new fields', () => {
  const s = E.newGame({ country: 'us', seed: 'oldname' });
  const v3 = JSON.parse(JSON.stringify(s));
  v3.saveVersion = 3; v3.hero.given = '로니'; v3.hero.nick = '로니';
  delete v3.stats.social; delete v3.eduFocus; delete v3.prenatal; delete v3.cards;
  const m = S.deserialize(JSON.stringify(v3));
  assert.strictEqual(m.saveVersion, C.SAVE_VERSION);
  assert.strictEqual(m.hero.given, '호날두');
  assert.strictEqual(m.stats.social, 40);
  assert.ok(Array.isArray(m.cards));
});

test('a life starts with one prenatal pick; each option gives a different, visible head start', () => {
  const s = E.newGame({ country: 'kr', seed: 'prenatal' });
  assert.strictEqual(s.age, 0);
  assert.deepStrictEqual(s.queue, ['sys_prenatal']);
  const ev = E.currentEvent(s);
  assert.ok(ev.pick);
  assert.ok(ev.choices.length >= 4 && ev.choices.length <= 5);
  const previews = ev.choices.map(c => JSON.stringify(c.preview));
  assert.strictEqual(new Set(previews).size, ev.choices.length, 'each option differs');
  ev.choices.forEach(c => { assert.ok(c.desc && c.desc.length < 40, 'one plain line'); assert.ok(c.preview); });
  const smarts0 = s.stats.smarts;
  E.choose(s, ev.choices.findIndex(c => /동화/.test(c.text)));
  assert.strictEqual(s.prenatal, 'story');
  assert.ok(s.stats.smarts > smarts0, 'story reading boosts smarts');
  assert.ok(s.born);
  assert.ok(s.cards.length >= 2, 'birth cards');
  assert.ok(s.cards.every(c => C.MILESTONE_PICS.includes(c.pic) && c.text.length > 4));
});

test('ages 0-4 are a montage: milestone cards, no storylets, no activities, only two picks', () => {
  for (const c of COUNTRIES) {
    const s = E.newGame({ country: c, seed: 'montage-' + c });
    const picks = [];
    const country = new Set();
    while (s.age < 5) {
      while (s.queue.length) { picks.push(s.queue[0]); pickFirst(s); }
      assert.deepStrictEqual(E.activities(s), [], 'no activities at age ' + s.age);
      assert.ok(s.cards.length >= 1, c + ': cards at age ' + s.age);
      s.cards.forEach(card => {
        const m = RA.data.milestones.find(x => x.id === card.id);
        if (m && m.countries) country.add(card.id);
        assert.ok(card.chg.every(ch => ch.k in C.STAT_ICONS || ch.k === 'rel'), 'chips have icons');
      });
      E.ageUp(s);
    }
    assert.deepStrictEqual(picks, ['sys_prenatal', 'sys_edu_focus'], c + ': the only decisions before 5');
    assert.ok(country.size >= 1, c + ': at least one country-specific milestone');
    const storylets = s.log.filter(e => e.age < 5 && e.ev && E.eventIndex()[e.ev] && !/^sys_/.test(e.ev));
    assert.deepStrictEqual(storylets.map(e => e.ev), [], 'no storylets before 5');
    assert.ok(E.activities(s).length > 0, 'activities open at 5');
  }
});

test('early-education focus: picked at 1, applied every year to 7, changeable once at 5', () => {
  const s = E.newGame({ country: 'jp', seed: 'focus' });
  pickFirst(s); E.ageUp(s);
  assert.strictEqual(s.age, 1);
  assert.deepStrictEqual(s.queue, ['sys_edu_focus']);
  const ev = E.currentEvent(s);
  assert.deepStrictEqual(ev.choices.map(c => c.text.replace(/^\S+ /, '')), ['언어', '음악', '소꿉놀이', '스포츠']);
  ev.choices.forEach(c => assert.ok(c.desc && c.preview));
  E.choose(s, 2); // 소꿉놀이 → 공감
  assert.strictEqual(s.eduFocus, 'play');
  const social0 = s.stats.social;
  const focusYears = new Set();
  while (s.age < 9) {
    E.ageUp(s);
    if (s.age === 5) {
      assert.strictEqual(s.queue[0], 'sys_edu_change');
      const ch = E.currentEvent(s);
      assert.ok(ch.choices[0].text.includes('그대로'));
      E.choose(s, ch.choices.findIndex(c => c.text.includes('스포츠')));
      assert.strictEqual(s.eduFocus, 'sports');
    }
    while (s.queue.length) pickFirst(s);
  }
  s.log.filter(e => e.k === 'focus' || (e.k === 'card' && /^focus_/.test(e.ev || ''))).forEach(e => focusYears.add(e.age));
  assert.deepStrictEqual([...focusYears].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7]);
  assert.ok(s.stats.social > social0, '소꿉놀이 raised 공감');
  assert.ok(s.log.some(e => e.k === 'focus' && /스포츠/.test(e.t) && e.chg), 'changed focus shows its effects');
  assert.ok(!s.queue.includes('sys_edu_change') && s.fired.sys_edu_change === 1, 'only one change');
});

test('auto-play steps years and stops whenever the player must choose', () => {
  const s = E.newGame({ country: 'ar', seed: 'auto' });
  assert.strictEqual(E.autoStep(s), 'choose', 'stops at the prenatal pick');
  assert.strictEqual(s.age, 0, 'did not advance while waiting');
  pickFirst(s);
  let steps = 0, stops = 0;
  while (s.alive && steps < 200) {
    const r = E.autoStep(s); steps++;
    if (r === 'choose') {
      stops++;
      const age = s.age;
      assert.strictEqual(E.autoStep(s), 'choose', 'keeps waiting');
      assert.strictEqual(s.age, age);
      while (s.queue.length) pickFirst(s); // the player chooses → auto continues
    }
    if (r === 'dead') break;
  }
  assert.ok(stops >= 2, 'stopped for choices');
  assert.strictEqual(s.alive, false, 'auto-play can run a whole life');
});

test('every event has a category with icon, colour and label', () => {
  for (const ev of E.allEvents()) {
    const cat = E.eventCategory(ev);
    assert.ok(cat && cat.icon && /^#/.test(cat.color) && cat.label, ev.id);
  }
  const s = E.newGame({ country: 'kr', seed: 'cat' });
  const ev = E.currentEvent(s);
  assert.strictEqual(ev.category.key, 'pick');
});

test('공감/사교 is a real stat that changes outcomes later', () => {
  const s = E.newGame({ country: 'kr', seed: 'social' });
  assert.ok(C.STATS.includes('social') && s.stats.social >= 0);
  assert.ok(E.allEvents().filter(e => e.cond && e.cond.stats && e.cond.stats.social).length >= 6, 'events react to 공감');
  // friendship: a social child makes friends more easily
  const tries = (social) => { let n = 0; for (let i = 0; i < 60; i++) { const t = E.newGame({ country: 'kr', seed: 'fr' + i }); while (t.queue.length) pickFirst(t); t.age = 10; t.stats.social = social; E.doActivity(t, 'friends'); if (E.person(t, 'friend')) n++; } return n; };
  assert.ok(tries(90) > tries(10), 'social helps friendship');
});

test('triumph cues fire on big wins only', () => {
  const s = E.newGame({ country: 'br', seed: 'siuu' });
  pickFirst(s);
  s.age = 18; s.y = {};
  E.FX.turnPro(s);
  assert.ok(s.y.triumph, 'turning pro is a triumph');
  s.y = {};
  E.personDies(s, E.person(s, 'sis2'), '병');
  assert.ok(!s.y.triumph, 'no SIUU on sad events');
});

test('the whole life still plays end to end with the new early years', () => {
  const s = autoplay(RA, { country: 'za', seed: 'e2e-early' });
  assert.strictEqual(s.alive, false);
  assert.ok(s.prenatal && s.eduFocus);
  assert.ok(RA.data.milestones.filter(m => s.fired[m.id]).length >= 7, 'milestones were shown');
});

test('birth lines read naturally in every country and "사남매의 막내" is told once', () => {
  for (const c of COUNTRIES) {
    const s = E.newGame({ country: c, seed: 'birth-' + c });
    pickFirst(s);
    const lines = s.log.filter(e => e.age === 0).map(e => e.t);
    const birth = lines[0];
    assert.ok(birth.includes(RA.data.countries[c].places.hometown), c + ': ' + birth);
    // a descriptive phrase ending in a verb or a bare "식구" must never be followed by "에서"
    assert.ok(!/(다|는다|식구)(에서| 에서)/.test(birth), c + ': ' + birth);
    assert.ok(!/에서 사남매/.test(lines.join(' ')), c + ': ' + birth);
    assert.match(birth, /에서 태어났다\. 집은 .+집이다\.$/, c);
    assert.strictEqual(lines.join('\n').split('사남매의 막내로 태어났다').length - 1, 1, c + ': told once');
  }
});

test('a gain reduced near the top of the scale is reported as capped', () => {
  const s = E.newGame({ country: 'pt', seed: 'cap' });
  pickFirst(s);
  s.eduFocus = 'sports'; s.age = 5;
  s.stats.health = 100; s.y = {};
  E.applyEduFocus(s);
  let chg = s.log[s.log.length - 1].chg;
  const h = chg.find(c => c.k === 'health');
  assert.ok(h && h.want === 3 && h.max, 'health at max is shown as 최대');
  s.age = 6; s.stats.health = 90; s.y = {};
  E.applyEduFocus(s);
  chg = s.log[s.log.length - 1].chg;
  const h2 = chg.find(c => c.k === 'health');
  assert.ok(h2 && h2.want === 3 && h2.d < 3 && !h2.max, 'reduced gain near the top carries the intended amount');
  // low stats grow in full, without a cap note
  s.age = 7; s.stats.health = 40; s.y = {};
  E.applyEduFocus(s);
  chg = s.log[s.log.length - 1].chg;
  assert.ok(chg.find(c => c.k === 'health' && c.d === 3 && !c.want));
});
