'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { load, autoplay } = require('../tools/sim-helpers.js');
const RA = load();
const E = RA.Engine, S = RA.Save;
const COUNTRIES = ['kr', 'jp', 'cn', 'us', 'br', 'ar', 'za', 'in'];

function fresh(country, seed) { return E.newGame({ country: country || 'kr', seed: seed || 'unit' }); }
// Resolve every pending event by picking the first enabled choice
function resolve(s) {
  let guard = 0;
  while (s.queue.length && guard++ < 50) {
    const ev = E.currentEvent(s);
    const i = ev ? ev.choices.findIndex(c => c.enabled) : -1;
    if (i < 0 || !E.choose(s, i)) s.queue.shift();
  }
}

test('event condition matching: age, country, stats, flags, fb stage, relationships, cooldown', () => {
  const s = fresh('kr');
  s.age = 12;
  const ev = { id: 't1', age: [10, 14], countries: ['kr'], cond: { stats: { football: [40, 100] }, flags: ['moved_alone', '!fb_quit'], fb: ['academy'], rel: { father: 'alive' } } };
  assert.strictEqual(E.eventMatches(s, ev), false, 'football too low');
  s.stats.football = 50; s.fb.stage = 'academy'; s.flags.moved_alone = 12;
  assert.strictEqual(E.eventMatches(s, ev), true);
  s.flags.fb_quit = 12;
  assert.strictEqual(E.eventMatches(s, ev), false, 'negated flag');
  delete s.flags.fb_quit;
  assert.strictEqual(E.eventMatches(s, Object.assign({}, ev, { countries: ['jp'] })), false, 'country');
  s.age = 20; assert.strictEqual(E.eventMatches(s, ev), false, 'age window'); s.age = 12;
  E.person(s, 'father').alive = false;
  assert.strictEqual(E.eventMatches(s, ev), false, 'father dead');
  E.person(s, 'father').alive = true;
  // cooldown & once
  s.cd.t1 = 11; assert.strictEqual(E.eventMatches(s, Object.assign({ cooldown: 3 }, ev)), false, 'cooldown');
  s.fired.t1 = 1; assert.strictEqual(E.eventMatches(s, Object.assign({ once: true }, ev, { id: 't1' })), false, 'once');
  // career / sector / degree / money
  const s2 = fresh('us'); s2.age = 30; s2.edu.degree = 'bachelor'; s2.money = 5000;
  assert.strictEqual(E.condMatches(s2, { career: 'none', degree: 'high', money: [4000, 6000] }), true);
  E.startJob(s2, 'doctor', 2);
  assert.strictEqual(E.condMatches(s2, { career: ['doctor'], sector: ['medical'], level: [1, 3] }), true);
  assert.strictEqual(E.condMatches(s2, { career: 'none' }), false);
});

test('age-up advances time, applies drift, schools the child and fires storylets', () => {
  const s = fresh('jp', 'ageup');
  const y0 = s.year;
  for (let i = 0; i < 7; i++) { resolve(s); E.ageUp(s); }
  assert.strictEqual(s.age, 8);
  assert.strictEqual(s.year, y0 + 7);
  assert.strictEqual(s.edu.stage, 'elem');
  assert.ok(s.log.some(l => l.k === 'year'));
  assert.strictEqual(s.ap, E.AP_PER_YEAR);
  assert.ok(Object.keys(s.fired).length >= 3, 'some storylets fired');
  // queue must be resolved before ageing
  s.queue.push('sys_grad');
  assert.throws(() => E.ageUp(s));
});

test('choice with check uses seeded chance and applies success/fail effects', () => {
  const s = fresh('br', 'check');
  s.age = 15; s.queue.push('canon_heart');
  const ev = E.currentEvent(s);
  assert.ok(ev.text.length > 10);
  const r = E.choose(s, 0);
  assert.ok(s.flags.heart_fixed, 'procedure sets flag');
  assert.ok(r.log.length > 0);
  assert.ok(s.achievements.heart, 'achievement unlocked');
});

test('career requirements, hiring and promotion ladder', () => {
  const s = fresh('kr', 'career');
  s.age = 30; s.edu.stage = 'none'; s.edu.degree = 'high';
  const doctor = E.careerIndex().doctor;
  assert.ok(E.jobMissing(s, doctor).length > 0, 'doctor needs a medical degree');
  s.edu.degree = 'bachelor'; s.edu.major = 'medicine'; s.stats.smarts = 95;
  assert.deepStrictEqual(E.jobMissing(s, doctor), []);
  assert.ok(E.careerIndex().footballer, 'footballer exists');
  assert.ok(E.jobMissing(s, E.careerIndex().footballer).length > 0, 'pros come via the academy route');
  E.startJob(s, 'doctor', 0);
  s.job.perf = 100; s.job.atLevel = 10;
  E.FX.promote(s, true);
  assert.strictEqual(s.job.level, 1);
  const sal0 = E.salaryOf(s, doctor, 0), salTop = E.salaryOf(s, doctor, doctor.ladder.length - 1);
  assert.ok(salTop > sal0, 'salary grows with ladder');
  // yearly promotion through ageUp with strong performance
  let promoted = false;
  for (let i = 0; i < 12 && s.alive; i++) { resolve(s); if (!s.alive) break; s.job && (s.job.perf = 95); E.ageUp(s); if (s.job && s.job.level >= 2) promoted = true; }
  assert.ok(promoted, 'promotes over years');
  // politician top title renders the country leader
  const pol = E.careerIndex().politician;
  assert.match(E.ladderTitle(s, pol, pol.ladder.length - 1), /대통령|총리|주석/);
  // job list is filtered and annotated
  const list = E.jobList(s);
  assert.ok(list.length > 50);
  assert.ok(list.every(j => Array.isArray(j.missing)));
});

test('family generation is localized for all 8 countries', () => {
  for (const c of COUNTRIES) {
    const s = fresh(c, 'fam');
    const cd = RA.data.countries[c];
    const dad = E.person(s, 'father'), mom = E.person(s, 'mother');
    assert.strictEqual(dad.name, cd.family.father.name);
    assert.strictEqual(mom.name, cd.family.mother.name);
    const sibs = s.people.filter(p => p.role === 'sibling');
    assert.strictEqual(sibs.length, 3, c);
    assert.deepStrictEqual(sibs.map(x => x.key), ['bro', 'sis1', 'sis2']);
    assert.ok(sibs.every(x => x.age > s.age), 'siblings are older');
    assert.strictEqual(sibs[0].gender, 'm');
    const v = E.vars(s);
    for (const k of ['hometown', 'localClub', 'academy', 'bigcity', 'food', 'holiday', 'exam', 'currency', 'leader']) assert.ok(v[k] && v[k] !== k, c + ' token ' + k);
    assert.ok(s.log[0].t.indexOf(cd.places.hometown) >= 0, 'birth log uses hometown');
  }
});

test('Korean particles are chosen by the final syllable', () => {
  const T = RA.Text;
  assert.strictEqual(T.render('{a}[이/가] {b}[을/를] {c}[으로/로] {d}[과/와]', { a: '아버지', b: '공', c: '서울', d: '형' }), '아버지가 공을 서울로 형과');
  assert.strictEqual(T.fixJosa('민준(이)가 1등(으)로 축구공을(를)'), '민준이 1등으로 축구공을');
});

test('save → load → migrate round trip keeps the game identical', () => {
  const store = S.memStorage();
  const s = fresh('za', 'save');
  for (let i = 0; i < 10; i++) { resolve(s); E.ageUp(s); }
  S.save(2, s, store);
  const back = S.load(2, store);
  assert.deepStrictEqual(back, JSON.parse(JSON.stringify(s)));
  assert.strictEqual(S.list(store).slots[1].meta.age, s.age);
  // continuing from the loaded copy produces the same future as the original
  const a = JSON.parse(JSON.stringify(s));
  [a, back].forEach(x => { for (let i = 0; i < 5; i++) { resolve(x); E.ageUp(x); } });
  assert.deepStrictEqual(a.stats, back.stats);
  assert.strictEqual(a.rng.s, back.rng.s);
});

test('old v1 saves migrate to the current schema and keep playing', () => {
  const s = fresh('in', 'old');
  for (let i = 0; i < 5; i++) { resolve(s); E.ageUp(s); }
  // fabricate a v1 save: renamed stat, string logs, no pending/cd/hist, no ids
  const v1 = JSON.parse(JSON.stringify(s));
  v1.saveVersion = 1;
  v1.stats.discipline = v1.stats.grit; delete v1.stats.grit;
  v1.log = v1.log.map(l => l.t);
  delete v1.pending; delete v1.cd; delete v1.hist; delete v1.fb.trophies.natCup; delete v1.fb.bestSeason;
  v1.people.forEach(p => delete p.id); delete v1.nextPid;
  const m = S.deserialize(JSON.stringify(v1));
  assert.strictEqual(m.saveVersion, RA.C.SAVE_VERSION);
  assert.strictEqual(m.stats.grit, s.stats.grit);
  assert.ok(m.log.every(l => typeof l === 'object' && l.t));
  assert.ok(Array.isArray(m.pending) && m.fb.trophies.natCup === 0);
  assert.ok(m.people.every(p => typeof p.id === 'number'));
  for (let i = 0; i < 10 && m.alive; i++) { resolve(m); E.ageUp(m); }
  assert.ok(m.age >= 10 || !m.alive);
  // a save without any version is treated as v1
  const nov = JSON.parse(JSON.stringify(v1)); delete nov.saveVersion;
  assert.strictEqual(S.migrate(nov).saveVersion, RA.C.SAVE_VERSION);
});

test('seeded replay is deterministic, different seeds differ', () => {
  const a = autoplay(RA, { country: 'ar', seed: 'REPLAY' });
  const b = autoplay(RA, { country: 'ar', seed: 'REPLAY' });
  assert.strictEqual(a.age, b.age);
  assert.deepStrictEqual(a.log, b.log);
  assert.strictEqual(a.money, b.money);
  const c = autoplay(RA, { country: 'ar', seed: 'OTHER' });
  assert.notDeepStrictEqual(a.log, c.log);
});

test('delayed consequences fire when due', () => {
  const s = fresh('kr', 'delay');
  s.age = 30;
  s.pending.push({ age: 31, id: 'canon_father_sober_year' });
  s.flags.father_sober = 1;
  resolve(s);
  E.ageUp(s);
  assert.ok(s.fired.canon_father_sober_year || !s.alive);
});

test('death leads to a summary and heirs can continue the family line', () => {
  const s = fresh('us', 'gen');
  s.age = 40; E.FX.marry(s); E.FX.haveChild(s); E.FX.haveChild(s);
  s.people.filter(p => p.role === 'child').forEach(k => { k.age = 12; });
  s.money = 100000; s.stats.health = 0; E.checkDeath(s, true);
  assert.strictEqual(s.alive, false);
  const sum = E.summary(s);
  assert.ok(sum.titles.length >= 1 && sum.story.indexOf(s.seed) >= 0);
  const heirs = E.heirs(s);
  assert.strictEqual(heirs.length, 2);
  const n = E.continueAsChild(s, heirs[0].id);
  assert.strictEqual(n.generation, 2);
  assert.strictEqual(n.age, 12);
  assert.ok(n.money > 0, 'inherited money');
  assert.ok(n.flags.heir);
  assert.ok(n.people.some(p => p.role === 'sibling'), 'other child becomes a sibling');
  for (let i = 0; i < 20 && n.alive; i++) { resolve(n); E.ageUp(n); }
  assert.ok(n.age >= 13);
});

test('football canon route can be followed to a pro contract', () => {
  // A focused player who trains football every year
  const pol = (s, acts) => acts.find(a => a.id === 'football') || null;
  let pros = 0;
  for (let i = 0; i < 20; i++) {
    const s = autoplay(RA, { country: 'br', seed: 'pro' + i, policy: pol });
    if (s.fb.seasons > 0) pros++;
  }
  assert.ok(pros >= 8, 'dedicated players usually turn pro, got ' + pros);
});
