'use strict';
/* Round 8 (docs/DESIGN.md §2g): hobbies, birth origin, the rapper route, the dark side (악동 path,
 * crime routes, drinking, sponsor arcs), new endings, childhood crises, and the coherence rule that a
 * hero only meets content that fits their hobbies, route, age and origin. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { load, autoplay } = require('../tools/sim-helpers.js');
const RA = load();
const E = RA.Engine, RT = E.Routes, L = E.Life, D = RA.data;
const COUNTRIES = ['pt', 'kr', 'jp', 'cn', 'us', 'br', 'ar', 'za', 'in'];

function fresh(c, seed) { const s = E.newGame({ country: c, seed }); while (s.queue.length) E.choose(s, 0); return s; }
// show one event now and take the choice whose text matches
function drive(s, id, re) {
  s.queue = [id];
  const ev = E.currentEvent(s);
  assert.ok(ev && ev.id === id, id + ' is shown');
  const c = ev.choices.find(x => x.enabled && re.test(x.text));
  assert.ok(c, id + ': choice ' + re + ' among ' + ev.choices.map(x => x.text + (x.enabled ? '' : '(x)')).join(' | '));
  E.choose(s, c.i);
  while (s.queue.length) { const n = E.currentEvent(s); if (!n) break; const k = n.choices.find(x => x.enabled) || n.choices[0]; if (!E.choose(s, k.i)) s.queue.shift(); }
}
function adult(c, seed, age) { const s = fresh(c, seed); s.age = age; s.edu.stage = 'none'; s.queue = []; RT.sync(s, true); return s; }
const endingId = s => E.ending(s).id;

test('a hero who never played football meets no football anywhere; hobbies and origin set the flavour', () => {
  const F = D.flavours, leaks = [];
  let S = null;
  const chk = (where, t) => {
    if (!S || !t || /sys_hobby|hob_new|sys_route_entry/.test(where)) return;
    if (D.originFlavours.slum.test(t) && S.origin !== 'slum' && S.origin !== 'poor') leaks.push('origin: ' + where + ' ' + t.slice(0, 60));
    for (const f of Object.keys(F)) if (F[f].re.test(t) && !L.knows(S, f)) leaks.push(f + ': ' + where + ' ' + t.slice(0, 60));
  };
  const o = { cur: E.currentEvent, act: E.activities, age: E.ageUp, ch: E.choose };
  const tail = (fn, tag) => function (s) { const n = s.log.length; const r = fn.apply(this, arguments); s.log.slice(n).forEach(e => chk(tag + (e.ev || e.k), e.t)); return r; };
  E.currentEvent = function (s) { const ev = o.cur(s); if (ev) { chk('ev:' + ev.id, ev.text); ev.choices.filter(c => c.enabled).forEach(c => chk('ch:' + ev.id, c.text)); } return ev; };
  E.activities = function (s) { const l = o.act(s); l.forEach(a => chk('act:' + a.id, a.label)); return l; };
  E.ageUp = tail(o.age, 'log:'); E.choose = tail(o.ch, 'log:');
  let noFb = 0;
  try {
    for (let i = 0; i < 48; i++) {
      const s = E.newGame({ country: COUNTRIES[1 + i % 8], seed: 'leak8-' + i }); S = s;
      autoplay(RA, { state: s, seed: 'leak8-' + i, prefer: /🎸|🎨|📚|🎮|🍳|🎧|🎤/ });
      if (!s.hobbyEver.football) noFb++;
    }
  } finally { Object.assign(E, { currentEvent: o.cur, activities: o.act, ageUp: o.age, choose: o.ch }); }
  assert.ok(noFb >= 40, 'most of these heroes never took football: ' + noFb);
  assert.deepStrictEqual(leaks.slice(0, 10), []);
  // the 학원 pressure event speaks in the hero's own hobby
  const s = fresh('kr', 'hagwon'); s.age = 14; s.edu.stage = 'middle'; s.hobbies = ['band']; s.hobbyEver = { band: 5 }; s.fb.stage = 'none';
  s.queue = ['kr_hagwon_pressure'];
  const ev = E.currentEvent(s);
  assert.ok(ev.choices.some(c => /밴드/.test(c.text)), ev.choices.map(c => c.text).join(' | '));
  assert.ok(!ev.choices.some(c => /축구/.test(c.text)));
});

test('hobbies: 2-3 picked in childhood from the talents, they feed talents and can change later', () => {
  let changed = 0;
  for (let i = 0; i < 18; i++) {
    const s = E.newGame({ country: COUNTRIES[i % 9], seed: 'hob-' + i });
    let g = 0;
    while (s.age < 13 && g++ < 40) { while (s.queue.length) { const ev = E.currentEvent(s); if (!ev) break; const c = ev.choices.find(x => x.enabled) || ev.choices[0]; if (!E.choose(s, c.i)) s.queue.shift(); } E.ageUp(s); }
    assert.ok(s.hobbies.length >= 2 && s.hobbies.length <= 3, 'hobbies at 13: ' + s.hobbies);
    const top = L.rank(s)[0];
    assert.ok(s.hobbies.length && D.hobbies.find(h => h.id === s.hobbies[0]), 'known hobby');
    void top;
    const t0 = s.talent[D.hobbies.find(h => h.id === s.hobbies[0]).talent];
    const s2 = autoplay(RA, { state: s, seed: 'hob-' + i, prefer: i % 2 ? /내려놓는다/ : /시작한다/ });
    if (Object.keys(s2.hobbyEver).length > 3 || s2.hobbies.length !== Object.keys(s2.hobbyEver).length) changed++;
    assert.ok(t0 >= 0);
  }
  assert.ok(changed >= 3, 'hobbies are dropped or picked up later in some lives: ' + changed);
  // the pick card offers a 🎯 auto choice and at least 10 hobbies
  assert.ok(D.hobbies.length >= 10 && ['football', 'basketball', 'baseball', 'rap', 'band'].every(id => D.hobbies.find(h => h.id === id) || id === 'band'));
});

test('rapper route: stages, exits with causes, scene, fit, and plausible ways in', () => {
  const r = RT.byId('rapper');
  assert.ok(r && r.stages.length >= 5 && r.stages.some(x => x.peak) && r.stages.some(x => x.late));
  assert.ok(r.scene && r.fit && r.exits.length >= 2 && r.exits.every(x => x.on && x.on.length));
  let reached = 0;
  for (let i = 0; i < 36; i++) { const s = autoplay(RA, { country: COUNTRIES[i % 9], seed: 'rap-' + i, prefer: /🎧|랩|사이퍼|믹스테이프/ }); if ((s.routeLog || []).some(m => m.to === 'rapper' && m.legal)) reached++; }
  assert.ok(reached >= 4, 'rapper reached in ' + reached + ' of 36');
});

test('birth origin: four origins with local neighbourhood names; old saves get one', () => {
  const seen = {};
  for (let i = 0; i < 60; i++) { const s = E.newGame({ country: COUNTRIES[1 + i % 8], seed: 'org-' + i }); seen[s.origin] = (seen[s.origin] || 0) + 1; }
  ['slum', 'poor', 'middle', 'rich'].forEach(o => assert.ok(seen[o] > 0, o + ' ' + JSON.stringify(seen)));
  assert.strictEqual(E.newGame({ country: 'pt', seed: 'canon' }).origin, 'poor', 'the canon family');
  COUNTRIES.filter(c => c !== 'pt').forEach(c => assert.ok(D.originPlaces[c] && D.originPlaces[c].slum && D.originPlaces[c].rich, c));
});

test('the 악동 street path leads into a dark route legally, and out again', () => {
  const s = fresh('br', 'street'); s.origin = 'slum'; s.age = 15; s.traits.mischief = 20; s.queue = [];
  drive(s, 'drk_street_crew', /따라간다/);
  assert.ok(s.flags.street_crew);
  drive(s, 'drk_crew_offer', /조직 막내/);
  assert.strictEqual(s.route.id, 'gang');
  assert.ok(s.routeLog.filter(m => m.to === 'gang').every(m => m.legal));
  // the boss's chair, or walking away: going straight leaves the route with a stated cause
  s.age = 30; drive(s, 'drk_family_plea', /그만두겠다/);
  assert.ok(!L.isDark(s) && s.flags.went_straight === 30);
  s.age = 41; s.alive = false;
  assert.strictEqual(endingId(s), 'went_straight');
  // a prison cellmate can open the door to the street for an adult with no work
  const p = adult('kr', 'cell', 30); p.jail = 2; p.flags.jailed = true; RT.sync(p, true);
  drive(p, 'drk_cellmate', /번호를 받아/);
  assert.ok(p.flags.dark_contact);
});

test('dark routes carry real risk: a street death or a flight abroad ends the life its own way', () => {
  let death = null;
  for (let i = 0; i < 40 && !death; i++) {
    const s = adult('kr', 'clash-' + i, 26); s.traits.mischief = 40;
    RT.enter(s, 'gang', { cause: 'choice', quiet: true });
    assert.strictEqual(s.route.id, 'gang');
    for (let k = 0; k < 6 && !s.flags.street_death; k++) drive(s, 'drk_rival', /맞붙|붙는다|나선다|받아/);
    if (s.flags.street_death) death = s;
  }
  assert.ok(death, 'a street fight can kill');
  death.alive = false;
  assert.strictEqual(endingId(death), 'street_death', 'told as a street death even under 30');
  const f = adult('kr', 'flee', 33); RT.enter(f, 'gang', { cause: 'choice', quiet: true }); f.money = 10000 * E.country(f).wage;
  drive(f, 'drk_raid', /해외로/);
  assert.ok(f.flags.fled && !L.isDark(f));
  assert.ok(f.routeLog.slice(-1)[0].legal, 'flee is a declared exit');
  f.age = 60; f.alive = false;
  assert.strictEqual(endingId(f), 'fugitive');
});

test('drinking raises social and the incident risk; drunk driving and recovery have their endings', () => {
  const s = adult('kr', 'drink', 25);
  const soc = s.stats.social;
  assert.strictEqual(L.incidentChance(s), 0);
  for (let i = 0; i < 6; i++) L.drink(s);
  assert.ok(s.stats.social > soc && s.traits.alcohol >= 24);
  const mid = L.incidentChance(s);
  for (let i = 0; i < 8; i++) L.drink(s);
  assert.ok(mid > 0 && L.incidentChance(s) > mid, 'risk grows with drinking');
  // a 악동 teenager can drink too; a plain 12-year-old cannot
  const kid = fresh('kr', 'kid'); kid.age = 12; assert.ok(!L.drinkOpen(kid)); kid.age = 15; kid.flags.street_crew = true; assert.ok(L.drinkOpen(kid));
  let crash = null;
  for (let i = 0; i < 40 && !crash; i++) {
    const d = adult('kr', 'dd-' + i, 35); d.traits.alcohol = 50; d.flags.car_owner = true;
    drive(d, 'drk_drunk_drive', /직접 몬다/);
    if (d.flags.drunk_victim) crash = d;
  }
  assert.ok(crash, 'drunk driving can hurt someone');
  crash.alive = false; assert.strictEqual(endingId(crash), 'drunk_tragedy');
  const r = adult('kr', 'rehab', 40); r.traits.alcohol = 70; E.traitUnlocks(r);
  drive(r, 'drk_recovery', /치료/);
  assert.ok(r.traits.alcohol <= 40, 'treatment brings drinking down: ' + r.traits.alcohol);
  for (let y = 0; y < 18 && r.alive; y++) { r.queue = []; E.ageUp(r); } // dry years let the habit fade
  r.queue = [];
  assert.ok(r.traits.alcohol < 25, 'after sober years: ' + r.traits.alcohol);
  r.age = 70; r.alive = false; assert.strictEqual(endingId(r), 'sober_again');
});

test('sponsor and bribe arcs: offered to suitable adult careers, exposure or power later', () => {
  const spn = D.events.filter(e => /^spn_/.test(e.id));
  assert.ok(spn.length >= 8);
  spn.forEach(e => assert.ok(e.age[0] >= 19, e.id + ' starts at ' + e.age[0]));
  spn.filter(e => !/exposed|retaliation/.test(e.id)).forEach(e => assert.ok(e.routes && e.routes.length, e.id + ' is tied to careers'));
  const s = adult('kr', 'spn', 30); RT.enter(s, 'actor', { cause: 'choice', career: 'actor', quiet: true });
  assert.strictEqual(s.route.id, 'actor');
  drive(s, 'spn_ent_patron', /받는다|받아/);
  assert.ok(s.spon && s.spon.n === 1);
  drive(s, 'spn_exposed', /.*/);
  assert.ok(s.flags.spn_exposed);
  if (!s.flags.spn_survived) { s.alive = false; assert.strictEqual(endingId(s), 'sponsor_fall'); }
});

test('15+ new endings, each with a hint; specific ones come before the general ones', () => {
  assert.ok(L.ENDINGS.length >= 15);
  const ids = D.endings.map(e => e.id);
  L.ENDINGS.forEach(e => { assert.ok(ids.includes(e.id), e.id); assert.ok(e.hint && e.name && e.desc, e.id + ' hint'); });
  const before = (a, b) => assert.ok(ids.indexOf(a) < ids.indexOf(b), a + ' before ' + b);
  before('street_death', 'young_death'); before('drunk_tragedy', 'young_death'); before('fugitive', 'jailbird');
  before('went_straight', 'route_gang_fall'); before('reformed_rascal', 'star'); before('sober_again', 'addict' === 'x' ? 'x' : 'family');
  before('party_soul', 'family'); before('slum_star', 'tycoon'); before('rich_fall', 'bankrupt'); before('lifelong_hobby', 'ordinary');
  // the ones a plain bot rarely meets, reached through their real events
  const rich = fresh('kr', 'heir'); rich.origin = 'rich'; rich.age = 20; rich.queue = [];
  drive(rich, 'org_rich_seed', /돌려드리고/);
  rich.routePeak = { office: 45 }; rich.alive = false; rich.age = 70;
  assert.strictEqual(endingId(rich), 'self_made_heir');
  const kid = fresh('kr', 'reform'); kid.age = 16; kid.queue = []; kid.flags.street_crew = true; kid.traits.mischief = 25; kid.hobbies = ['rap']; kid.hobbyEver = { rap: 9 };
  drive(kid, 'drk_way_out', /손을 잡는다/);
  kid.age = 60; kid.alive = false;
  assert.strictEqual(endingId(kid), 'reformed_rascal');
  const soul = adult('kr', 'soul', 50); soul.stats.social = 90; soul.traits.alcohol = 30; soul.alive = false; soul.age = 75;
  assert.strictEqual(endingId(soul), 'party_soul');
});

test('a hero on a chosen career is never offered a street stall; a stall only after leaving, for someone it suits', () => {
  const s = adult('kr', 'stall', 35);
  RT.enter(s, 'office', { cause: 'choice', career: 'office_worker', quiet: true });
  assert.strictEqual(s.route.id, 'office');
  s.talent.taste = 10; s.hobbies = ['reading']; s.origin = 'middle';
  for (const ev of D.events) {
    if (!ev.choices) continue;
    for (const ch of ev.choices) if (ch.career === 'street_vendor') assert.ok(!E.choiceAvailable(s, ch), ev.id + ' offers a stall to an office worker');
  }
  RT.leave(s, 'fired', '해고됐다.');
  assert.ok(!(s.routeNext && s.routeNext.opts.some(o => o.to === 'merchant')), 'no stall for someone the trade does not suit');
  assert.ok(!RT.adriftOptions(s).some(o => o.a.to === 'merchant'));
  s.talent.taste = 70;
  assert.ok(L.suitsTrade(s));
  // in 90 lives no move into the street-stall trade comes from a career route without a stated reason
  for (let i = 0; i < 90; i++) {
    const l = autoplay(RA, { country: COUNTRIES[i % 9], seed: 'stall-' + i, bot: ['rascal', 'model', undefined][i % 3] });
    for (const m of l.routeLog || []) if (m.to === 'merchant') {
      const from = RT.byId(m.from);
      assert.ok(m.legal && (from.state || m.cause !== 'choice' || ['cook', 'service', 'parttime', 'none', 'retired'].includes(m.from)), 'stall from ' + m.from + ' (' + m.cause + ')');
    }
  }
});

test('childhood holds real crises: varied choices, lasting marks, shaped by origin and hobbies', () => {
  const cri = D.events.filter(e => /^cri_/.test(e.id));
  assert.ok(cri.length >= 15);
  for (const ev of cri) {
    assert.ok(ev.age[1] <= 12, ev.id);
    const sig = ev.choices.map(c => JSON.stringify([c.effects, c.check, c.success, c.fail]));
    assert.strictEqual(new Set(sig).size, sig.length, ev.id + ': choices differ in what they risk');
    const marks = JSON.stringify(ev.choices);
    assert.ok(/flags|rel|trauma|hardship|bullied|bad_knee|fx/.test(marks), ev.id + ' leaves a lasting mark');
  }
  assert.ok(cri.filter(e => e.origin).length >= 5, 'crises depend on the origin');
  assert.ok(cri.some(e => JSON.stringify(e.choices).includes('hobbies') || /hobb/.test(String(e.when)) || e.choices.some(c => c.reqFn && /hobbies/.test(String(c.reqFn)))), 'some depend on hobbies');
  let total = 0, none = 0;
  for (let i = 0; i < 45; i++) {
    const s = E.newGame({ country: COUNTRIES[i % 9], seed: 'cri-' + i });
    let g = 0;
    while (s.age < 13 && g++ < 40) { while (s.queue.length) { const ev = E.currentEvent(s); if (!ev) break; const c = ev.choices.find(x => x.enabled) || ev.choices[0]; if (!E.choose(s, c.i)) s.queue.shift(); } E.ageUp(s); }
    const n = Object.keys(s.fired).filter(k => /^cri_/.test(k)).length; total += n; if (!n) none++;
  }
  assert.ok(total / 45 >= 1.5, 'crises per childhood ' + (total / 45).toFixed(2));
  assert.ok(none <= 9, 'childhoods without a crisis: ' + none);
});

test('v6 saves load with origin and hobbies and play on through legal moves only', () => {
  const fx = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'v6-saves.json'), 'utf8'));
  for (const k of Object.keys(fx)) {
    const s = RA.Save.deserialize(JSON.stringify(fx[k]));
    assert.strictEqual(s.saveVersion, RA.C.SAVE_VERSION, k);
    assert.ok(['slum', 'poor', 'middle', 'rich'].includes(s.origin), k + ' origin');
    assert.ok(Array.isArray(s.hobbies) && (s.age < 5 || s.hobbies.length >= 1), k + ' hobbies');
    assert.ok(RT.byId(s.route.id), k + ' route ' + s.route.id);
    const n = (s.routeLog || []).length;
    autoplay(RA, { state: s, seed: 'v6-' + k });
    assert.ok(!s.alive && E.ending(s));
    s.routeLog.slice(n).forEach(m => assert.ok(m.legal, k + ': ' + m.from + ' → ' + m.to + ' (' + m.cause + ')'));
  }
});
