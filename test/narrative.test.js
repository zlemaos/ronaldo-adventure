'use strict';
/* Narrative-consistency audit: plays seeded lives with the autoplayer and checks the life log for
 * - mentions of a dead person after their death (outside memorial events),
 * - leftover Korean particle markers such as (으)로 or 을(를),
 * - storylets that fired while the hero was in prison but are not prison/family-visit events,
 * - the same activity line repeated within 3 years. */
const test = require('node:test');
const assert = require('node:assert');
const { load, autoplay } = require('../tools/sim-helpers.js');
const RA = load();
const E = RA.Engine, T = RA.Text;
const LIVES = Number(process.env.NARRATIVE_LIVES || 100);
const COUNTRIES = ['kr', 'jp', 'cn', 'us', 'br', 'ar', 'za', 'in'];
const POLICIES = [null, (s, acts) => acts.find(a => a.id === 'football') || null, (s, acts) => acts.find(a => a.id === 'family') || null];

function namesOf(s, p) {
  const out = new Set([p.name, E.displayName(s, p)]);
  return [...out].filter(n => n && n.length >= 2);
}

// The name as a word: not glued to other Hangul, except a following particle (이/가/은/는/을/를/과/와/의/에게/도…)
function mentions(text, n) {
  const re = new RegExp('(^|[^가-힣])' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=$|[^가-힣]|이|가|은|는|을|를|과|와|의|에|도|만|랑|이랑|께|아|야)', 'g');
  return re.test(text);
}

function audit(s) {
  const problems = [];
  const idx = E.eventIndex();
  const dead = s.people.filter(p => !p.alive && p.diedSeq && ['father', 'mother', 'sibling', 'spouse', 'partner', 'child', 'friend', 'coach'].includes(p.role) || (!p.alive && p.diedSeq && p.role === 'oldfriend'));
  for (const p of dead) {
    // a name shared with someone alive (e.g. a new friend with the same given name) cannot be attributed
    // a name shared with anyone else in the hero's life (a namesake friend) cannot be attributed
    const names = namesOf(s, p).filter(n => !s.people.some(q => q !== p && namesOf(s, q).includes(n)) && n !== s.hero.given);
    for (const e of s.log) {
      if (e.n <= p.diedSeq || e.mem) continue;
      if (e.k === 'death') continue; // someone else's death notice, written by the engine
      for (const n of names) if (mentions(e.t, n)) problems.push(`dead ${p.role} ${n} (died ${p.diedAt}) named at ${e.age}: ${e.t}`);
    }
  }
  for (const e of s.log) {
    if (T.hasLeftoverJosa(e.t)) problems.push('leftover josa at ' + e.age + ': ' + e.t);
    if (e.j && e.ev && !E.jailOk(idx[e.ev])) problems.push('event while jailed at ' + e.age + ' (' + e.ev + '): ' + e.t);
  }
  // once-per-life and capped events never exceed their limit
  for (const id of Object.keys(s.fired)) {
    const ev = idx[id]; if (!ev || ev.manual) continue;
    if (ev.once && s.fired[id] > 1) problems.push('once-per-life event fired ' + s.fired[id] + 'x: ' + id);
    if (ev.maxTimes && s.fired[id] > ev.maxTimes) problems.push('event over its cap ' + s.fired[id] + 'x: ' + id);
  }
  // recurring memorial rituals: at least 5 years apart, never the same sentence twice in a row
  const ritual = new Map();
  for (const e of s.log) {
    if (!e.mem || !e.ev || e.k === 'q' || !idx[e.ev] || idx[e.ev].manual) continue;
    const prev = ritual.get(e.ev);
    if (prev && prev.age !== e.age) {
      if (e.age - prev.age < 3) problems.push('memorial ' + e.ev + ' repeated after ' + (e.age - prev.age) + ' years');
      if (prev.t === e.t) problems.push('memorial ' + e.ev + ' repeated the same text: ' + e.t);
    }
    if (!prev || prev.age !== e.age) ritual.set(e.ev, e);
  }
  // flavour lines of an activity never repeat within 3 years (same year or the next two)
  const seen = new Map();
  for (const e of s.log) {
    if (e.k !== 'act' || !e.line) continue;
    const base = e.line + '|' + e.t.replace(/\s*\([^()]*\)$/, '').replace(/ [+-][^ ]+ [^ ]+$/, '').trim();
    const prev = seen.get(base);
    if (prev != null && e.age - prev < 3) problems.push('repeated activity line at ' + e.age + ': ' + base);
    seen.set(base, e.age);
  }
  return problems;
}

for (const c of COUNTRIES) {
  test('narrative consistency over ' + LIVES + ' lives in ' + c, () => {
    const all = [];
    for (let i = 0; i < LIVES; i++) {
      const s = autoplay(RA, { country: c, seed: 'nar-' + c + '-' + i, policy: POLICIES[i % 3] });
      audit(s).forEach(p => all.push('[' + s.seed + '] ' + p));
    }
    assert.deepStrictEqual(all.slice(0, 15), [], all.length + ' problem(s)');
  });
}

test('fixJosa looks through closing quotes and brackets', () => {
  assert.strictEqual(T.fixJosa('강등됐다. "장례지도사"(으)로 내려왔다.'), '강등됐다. "장례지도사"로 내려왔다.');
  assert.strictEqual(T.fixJosa('"동네 식당"(으)로 "바리스타"(으)로 "스태프"을(를) (서울)(으)로 「책」와(과)'), '"동네 식당"으로 "바리스타"로 "스태프"를 (서울)로 「책」과');
  assert.strictEqual(T.fixJosa("'팀장'(이)가 웃었다"), "'팀장'이 웃었다");
  assert.ok(!T.hasLeftoverJosa(T.fixJosa('"부장"은(는) 말했다')));
});

test('dead people are never referenced by ordinary events; memorial events may', () => {
  const s = E.newGame({ country: 'kr', seed: 'gate' });
  s.age = 40;
  const mom = E.person(s, 'mother');
  const ev = { id: 't_mom', text: '{mother}[과/와] 산책을 했다.' };
  assert.ok(E.personsOk(s, ev));
  mom.alive = false;
  assert.ok(!E.personsOk(s, ev), 'mother dead → ineligible');
  assert.ok(E.personsOk(s, { id: 't_mem', memorial: ['mother'], text: '{mother}의 산소에 갔다.' }));
  assert.ok(E.personsOk(s, { id: 't_mem2', cond: { flags: ['mother_dead'] }, text: '{mother}[이/가] 그립다.' }));
  // plain words count as references too
  assert.ok(!E.personsOk(s, { id: 't_plain', text: '어머니가 전화를 했다.' }));
  assert.ok(E.personsOk(s, { id: 't_grand', text: '할머니가 전화를 했다.' }));
});

test('sibling lists and count words use living siblings only', () => {
  const s = E.newGame({ country: 'kr', seed: 'sibs' });
  s.age = 50;
  const ev = { id: 't_sibs', text: '{siblings}[과/와] 모였다. {siblingsAll} 다 웃었다.' };
  assert.match(E.render(s, ev.text), /, .*, .*모였다\. 넷 다/);
  E.person(s, 'sis1').alive = false;
  const t = E.render(s, ev.text);
  assert.ok(!t.includes(E.displayName(s, E.person(s, 'sis1'))), t);
  assert.match(t, /셋 다/);
  ['bro', 'sis2'].forEach(k => { E.person(s, k).alive = false; });
  assert.ok(!E.personsOk(s, ev), 'no living sibling → event skipped');
});

test('kinship words follow gender and birth order', () => {
  const m = E.newGame({ country: 'kr', seed: 'kin' });
  assert.strictEqual(E.relWord(m, E.person(m, 'bro')), '형');
  assert.strictEqual(E.relWord(m, E.person(m, 'sis1')), '누나');
  const f = E.newGame({ country: 'kr', seed: 'kin', gender: 'f' });
  assert.strictEqual(E.relWord(f, E.person(f, 'bro')), '오빠');
  assert.strictEqual(E.relWord(f, E.person(f, 'sis1')), '언니');
});

test('a death queues a grief event and silences cheerful storylets that year', () => {
  const s = E.newGame({ country: 'jp', seed: 'grief' });
  s.age = 30;
  E.personDies(s, E.person(s, 'sis2'), '병');
  assert.strictEqual(s.queue[0], 'sys_grief');
  const ev = E.currentEvent(s);
  assert.match(ev.text, /누나|언니/);
  const before = s.log.length;
  E.selectEvents(s);
  const random = s.log.slice(before).filter(e => e.ev && !E.eventIndex()[e.ev].priority);
  assert.strictEqual(random.length, 0);
});

test('the first-holiday-after-a-death event only fires within two years of the death', () => {
  const s = E.newGame({ country: 'kr', seed: 'holiday' });
  const ev = E.eventIndex().life_mid_mother_funeral;
  s.age = 50; E.person(s, 'mother').alive = false; s.flags.mother_dead = 43;
  assert.ok(!E.eventMatches(s, ev), '7 years later: no');
  s.flags.mother_dead = 49;
  assert.ok(E.eventMatches(s, ev), 'next year: yes');
});

test('prison blocks work, school and dating events and activities', () => {
  const s = E.newGame({ country: 'us', seed: 'jail' });
  s.age = 30; E.startJob(s, 'programmer', 1);
  E.FX.jail(s);
  assert.ok(s.jail > 0 && !s.job);
  const blocked = E.allEvents().filter(ev => ev.cond && (ev.cond.sector || ev.cond.career === 'any') ).slice(0, 20);
  blocked.forEach(ev => assert.ok(!E.eventMatches(s, ev), ev.id));
  const acts = E.activities(s).filter(a => a.ok).map(a => a.id);
  ['date', 'travel', 'parttime', 'football', 'jobs'].forEach(id => assert.ok(!acts.includes(id), id));
  s.queue = ['sys_grad', 'sys_grief'];
  E.dropJailBlocked(s);
  assert.deepStrictEqual(s.queue, ['sys_grief']);
});

test('one-time memorials fire once, recurring rituals vary their text', () => {
  const idx = E.eventIndex();
  assert.ok(idx.us_father_memory.once, 'the bench is donated once');
  assert.ok(idx.ar_father_bag.once);
  assert.strictEqual(idx.life_old_mother_memory.maxTimes, 2);
  const s = E.newGame({ country: 'kr', seed: 'ritual' });
  s.age = 30; E.person(s, 'father').alive = false; s.flags.father_dead = 25;
  const ev = idx.kr_father_jesa;
  const texts = [];
  for (let k = 0; k < 3; k++) { s.fired[ev.id] = k + 1; texts.push(E.render(s, E.eventText(s, ev))); }
  assert.strictEqual(new Set(texts).size, 3);
  s.cd[ev.id] = 30; s.age = 33;
  assert.ok(!E.eventMatches(s, ev), 'not again within the cooldown');
  s.age = 35;
  assert.ok(E.eventMatches(s, ev));
});
