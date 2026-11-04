'use strict';
/* Round 8 childhood rebuild (birth to 12) and the five review fixes of the round. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { load } = require('../tools/sim-helpers.js');
const RA = load();
const E = RA.Engine, RT = E.Routes, L = E.Life, D = RA.data;

// V2 family support and optional invitations intentionally include safe, reusable dialogue.
// The old risk/unique-copy contract remains scoped to the original childhood pack.
// Academy setbacks and friend contact intentionally need not inflict a negative stat.
const CHILD = D.events.filter(e => !/^(acad_|friends_)/.test(e.id) && !/^(family:|chain:)/.test(e.own || '') && e.age && e.age[0] <= 11 && (e.choices || []).length);
// a risk that can actually happen: a bet, or a check that can fail into a worse outcome (a label is not enough)
const hurts = fx => !!fx && (Object.keys(fx).some(k => k !== 'mischief' && typeof fx[k] === 'number' && fx[k] < 0)
  || (fx.rel && Object.values(fx.rel).some(v => v < 0)) || [].concat(fx.fx || []).length > 0);
const canFail = (chk, fail) => !!(chk && fail && hurts(fail.effects) && (chk.odds == null || chk.odds < 1));
const risky = c => !!(c.bet || canFail(c.check, c.fail) || (c.alt && canFail(c.alt.check || c.check, c.alt.fail)));
const logs = c => [c.log, c.success && c.success.log, c.fail && c.fail.log].filter(Boolean);
function fresh(c, seed) { const s = E.newGame({ country: c, seed }); while (s.queue.length) E.choose(s, 0); return s; }
function adult(seed, age) { const s = fresh('kr', seed); s.age = age; s.edu.stage = 'none'; s.queue = []; RT.sync(s, true); return s; }
function originLife(origin) {
  for (let i = 0; i < 400; i++) { const s = E.newGame({ country: 'kr', seed: 'or-' + i }); if (s.origin === origin) return s; }
  throw new Error('no ' + origin + ' life');
}

test('every childhood card has an option that can go wrong, and its options differ in what they risk', () => {
  assert.ok(CHILD.length >= 120, 'childhood cards: ' + CHILD.length);
  for (const ev of CHILD) {
    assert.ok(ev.choices.some(risky), ev.id + ' has no option that can go wrong');
    const sig = ev.choices.map(c => JSON.stringify([c.effects, c.check, c.success, c.fail, c.fx]));
    assert.strictEqual(new Set(sig).size, sig.length, ev.id + ': two options pay out the same');
  }
});

test('no two childhood cards share an option label or an outcome line', () => {
  const label = {}, line = {};
  for (const ev of CHILD) for (const c of ev.choices) {
    (label[c.text] = label[c.text] || new Set()).add(ev.id);
    logs(c).forEach(l => (line[l] = line[l] || new Set()).add(ev.id));
  }
  const dup = m => Object.keys(m).filter(k => m[k].size > 1).map(k => k + ' ← ' + [...m[k]].join(','));
  assert.deepStrictEqual(dup(label), []);
  assert.deepStrictEqual(dup(line), []);
});

test('slum, poor, middle and rich childhoods differ from the first screen on', () => {
  const lives = ['slum', 'poor', 'middle', 'rich'].map(originLife);
  const first = lives.map(s => E.currentEvent(s));
  assert.ok(first.every(ev => ev.id === 'sys_prenatal'));
  assert.strictEqual(new Set(first.map(ev => ev.text)).size, 4, 'prenatal screen reads differently per origin');
  const focus = lives.map(s => { s.queue = ['sys_edu_focus']; return E.currentEvent(s).text; });
  assert.strictEqual(new Set(focus).size, 4, 'the 1-7 focus screen reads differently per origin');
  // each origin has its own childhood cards, and a rich child never meets the poor-home ones
  for (const o of ['slum', 'poor', 'middle', 'rich']) assert.ok(CHILD.filter(e => e.origin && e.origin.includes(o)).length >= 5, o);
  const rich = lives[3];
  for (const id of ['cri_flood', 'life_child_power_cut', 'life_child_birthday_poor', 'canon_crowded_house']) {
    const ev = D.events.find(e => e.id === id);
    assert.ok(ev.origin && !ev.origin.includes('rich'), id + ' is not offered to a rich child');
  }
  assert.ok(rich.origin === 'rich');
});

test('a football kid and a hobby kid get different childhood stories', () => {
  const fb = CHILD.filter(e => e.flavour === 'football' || (e.cond && e.cond.fb));
  const hob = CHILD.filter(e => e.hobby);
  assert.ok(fb.length >= 8 && hob.length >= 6, 'football ' + fb.length + ', hobby ' + hob.length);
  const s = fresh('kr', 'band-kid'); s.age = 9; s.hobbies = ['band']; s.hobbyEver = { band: 5 }; s.fb.stage = 'none';
  assert.ok(!E.condMatches(s, D.events.find(e => e.id === 'fb_coach_mentor').cond), 'no club coach for a kid outside a club');
});

test('a childhood option marked risky can really go wrong (no label-only risk)', () => {
  for (const ev of CHILD) for (const c of ev.choices) if (c.risky) assert.ok(risky(c), ev.id + ': "' + c.text + '" is risky by label only');
  const sell = D.events.find(e => e.id === 'path_talent_trickster').choices[0];
  assert.ok(sell.check && sell.fail.effects.money < 0, 'selling with the gift of the gab can backfire');
});

// ---------------------------------------------------------------- re-review fixes
test('a sporty child who does not play football gets no football gifts or gains', () => {
  const s = fresh('kr', 'sporty'); s.age = 2; s.hobbies = []; s.hobbyEver = {}; s.fb.stage = 'none'; s.fb.seasons = 0;
  for (const t of D.talents) s.talent[t.k] = 0; s.talent.sport = 90;
  assert.ok(!E.footballHome(s));
  const ms = id => D.milestones.find(m => m.id === id);
  assert.ok(!ms('ms_first_ball').when(s) && !ms('ms_first_ball_heir').when(s) && ms('ms_first_gift').when(s));
  assert.ok(!/공/.test(ms('ms_first_gift').byTalent.sport.text), 'the gift for a sporty child is not a ball');
  s.eduFocus = 'sports'; s.y = {}; const fb = s.stats.football, hp = s.stats.health;
  E.applyEduFocus(s);
  assert.strictEqual(s.stats.football, fb); assert.ok(s.stats.health > hp);
  s.queue = ['sys_edu_focus'];
  const pick = E.currentEvent(s).choices.find(c => /스포츠/.test(c.text));
  assert.ok(pick && !('football' in (pick.preview || {})), 'the focus card shows no football chip');
  // the canon football child keeps the club ball and the football gains
  const p = fresh('pt', 'canon-ball'); p.age = 3;
  assert.ok(E.footballHome(p) && E.footballGate(p, { football: 1 }).football === 1);
});

test('a Portuguese descendant who never played football gets no football from sports education', () => {
  const s = fresh('pt', 'pt-heir-band'); s.age = 3; s.generation = 2; s.flags.heir = true;
  s.hobbies = []; s.hobbyEver = {}; s.fb.stage = 'none'; s.fb.seasons = 0;
  assert.ok(!E.Life.knows(s, 'football') && !E.footballHome(s));
  const ms = id => D.milestones.find(m => m.id === id);
  assert.ok(!ms('ms_first_ball').when(s) && ms('ms_first_gift').when(s));
  s.eduFocus = 'sports'; s.y = {}; const fb = s.stats.football;
  E.applyEduFocus(s);
  assert.strictEqual(s.stats.football, fb);
});

// a particle marker or a template token that reached the player unrendered
const leftover = t => RA.Text.hasLeftoverJosa(t) || /\[(이\/가|을\/를|은\/는|과\/와|으로\/로|아\/야|이\/)\]|\{[a-zA-Z0-9]+\}/.test(String(t || ''));
function shown(s) {
  const ev = E.currentEvent(s); if (!ev) return [];
  return [ev.text].concat(...ev.choices.map(c => [c.text, c.desc]));
}

test('hobby cards and childhood play never show a raw particle marker', () => {
  const s = fresh('kr', '4242'); s.age = 5; s.hobbies = []; s.hobbyEver = {}; s.log = [];
  s.queue = ['sys_hobby'];
  const pick = name => E.currentEvent(s).choices.findIndex(c => c.text.includes(name));
  for (const name of ['그림', '요리']) {
    const i = pick(name); assert.ok(i >= 0, name + ' offered');
    shown(s).forEach(t => assert.ok(!leftover(t), t));
    E.choose(s, i);
  }
  const lines = s.log.map(e => e.t);
  assert.ok(lines.some(t => t.includes('그림이 좋아졌다')) && lines.some(t => t.includes('요리가 좋아졌다')), lines.join(' / '));
  // the later hobby cards: start a new one, put one down
  s.age = 12; s.hobbies = ['draw', 'cook']; s.queue = ['hob_new', 'hob_drop'];
  shown(s).forEach(t => assert.ok(!leftover(t), t)); E.choose(s, 0);
  shown(s).forEach(t => assert.ok(!leftover(t), t)); E.choose(s, 1);
  // whole childhoods in several countries and families: every card, button and log line
  for (const c of ['kr', 'pt', 'br', 'in', 'us']) for (let n = 0; n < 4; n++) {
    const k = E.newGame({ country: c, seed: 'josa-' + c + n });
    let guard = 0;
    while (k.alive && k.age <= 12 && guard++ < 400) {
      while (k.queue.length) {
        shown(k).forEach(t => assert.ok(!leftover(t), c + n + ' age ' + k.age + ': ' + t));
        const ev = E.currentEvent(k); if (!ev) break;
        const enabled = ev.choices.filter(c => c.enabled);
        E.choose(k, enabled[(guard + n) % enabled.length].i);
      }
      E.ageUp(k);
    }
    k.log.forEach(e => assert.ok(!leftover(e.t), c + n + ' log: ' + e.t));
  }
});

test('a football card reaching a child who never chose football is labelled by its people, not 축구', () => {
  const s = fresh('kr', '4242'); s.age = 5; s.hobbies = ['draw', 'cook']; s.hobbyEver = { draw: 1, cook: 1 }; s.fb.stage = 'none'; s.fb.seasons = 0;
  assert.ok(!L.knows(s, 'football'));
  s.queue = ['canon_kitroom'];
  assert.strictEqual(E.currentEvent(s).category.key, 'family');
  for (const ev of CHILD) if (E.eventCategory(ev) === E.CATEGORIES.football) assert.notStrictEqual(E.eventCategoryKey(ev, s), 'football', ev.id);
  // the football child still sees 축구 on the same card
  const p = fresh('pt', 'kit-canon'); p.age = 5; p.queue = ['canon_kitroom'];
  assert.ok(L.knows(p, 'football'));
  assert.strictEqual(E.currentEvent(p).category.key, 'football');
});

test('a result reads its category from the hero: football cheers, memorial grieves, a relabelled card stays quiet', () => {
  const sure = c => !c.check && !c.bet && !c.alt && c.effects && (c.effects.fame || 0) >= 3;
  const goal = E.allEvents().find(ev => E.eventCategory(ev) === E.CATEGORIES.football && (ev.choices || []).some(sure));
  assert.ok(goal, 'a football card with a sure fame +3 option');
  const idx = goal.choices.findIndex(sure);
  const play = (s, id, i) => {
    // Category rendering is independent of the source event's eligibility.
    const index = E.eventIndex(), fixture = 'category_fixture';
    const source = index[id];
    index[fixture] = { id: fixture, text: source.text, choices: source.choices, _cat: source._cat };
    s.queue = [fixture]; s.y.triumph = null;
    try { return E.choose(s, i); } finally { delete index[fixture]; }
  };
  // the football child: the card is 축구 and the big moment cheers
  const p = fresh('pt', 'goal-cue'); assert.ok(L.knows(p, 'football'));
  const rp = play(p, goal.id, idx);
  assert.strictEqual(rp.category.key, 'football');
  assert.ok(E.pendingMoments(p).some(m => m.kind === 'goal'), 'v2 retains goal moments in the queue');
  // a child who never chose football: same card, relabelled, no goal cheer
  const k = fresh('kr', '4242'); k.hobbies = ['draw', 'cook']; k.hobbyEver = { draw: 1, cook: 1 }; k.fb.stage = 'none'; k.fb.seasons = 0;
  assert.ok(!L.knows(k, 'football'));
  const rk = play(k, goal.id, idx);
  assert.notStrictEqual(rk.category.key, 'football');
  assert.ok(!E.pendingMoments(k).some(m => m.kind === 'goal'), 'no queued goal cheer for a relabelled card');
  // a memorial card plays the grief sound
  const mem = E.allEvents().find(ev => E.eventCategory(ev) === E.CATEGORIES.memorial && (ev.choices || []).some(c => !c.check && !c.bet));
  assert.ok(mem, 'a memorial card');
  const rm = play(fresh('kr', 'grief-cue'), mem.id, mem.choices.findIndex(c => !c.check && !c.bet));
  assert.strictEqual(rm.category.key, 'memorial');
  assert.strictEqual(rm.sound, 'sorrow');
});

test('the piano card is a first offer, not lessons the child never took', () => {
  const ev = D.events.find(e => e.id === 'rl_kid_quit_lesson');
  assert.ok(!/다니던|지겨워/.test(ev.text) && /체험/.test(ev.text), ev.text);
});

// ---------------------------------------------------------------- review fixes
test('fix 1: football stat and tab are hidden from a non-football hero, and a selected tab moves', () => {
  const s = fresh('kr', 'ui-band'); s.hobbies = ['band']; s.hobbyEver = { band: 5 }; s.fb.stage = 'none'; s.fb.seasons = 0;
  assert.ok(!L.knows(s, 'football'));
  assert.ok(!L.uiStats(s).includes('football'));
  const tabs = [['career', '커리어'], ['football', '축구'], ['life', '인생']];
  const v = L.uiTabs(s, tabs, 'football');
  assert.ok(!v.tabs.some(t => t[0] === 'football') && v.tab === 'career');
  s.hobbies.push('football'); s.hobbyEver.football = 6;
  assert.ok(L.uiStats(s).includes('football') && L.uiTabs(s, tabs, 'football').tab === 'football');
  const ui = fs.readFileSync(path.join(__dirname, '..', 'js', 'ui.js'), 'utf8');
  assert.ok(/uiStats\(s\)/.test(ui) && /uiTabs\(app\.s/.test(ui), 'ui.js renders through the gates');
});

test('fix 2: flavour-free alternatives never require or test football', () => {
  for (const ev of D.events) for (const c of ev.choices || []) {
    if (!c.alt) continue;
    const a = L.altChoice(c);
    assert.ok(!(a.req && a.req.stats && a.req.stats.football != null), ev.id + ': ' + a.text + ' requires football');
    assert.ok(!(a.check && a.check.stat === 'football'), ev.id + ': ' + a.text + ' tests football');
  }
  const s = adult('mil-band', 20); s.hobbies = ['band']; s.hobbyEver = { band: 5 }; s.fb.stage = 'none'; s.stats.football = 5;
  s.flags = Object.assign(s.flags, {}); s.queue = ['kr_military_notice'];
  const ev = E.currentEvent(s);
  const air = ev.choices.find(c => /공군/.test(c.text));
  assert.ok(air && air.enabled, 'the air force option is open: ' + ev.choices.map(c => c.text).join(' | '));
  assert.ok(!ev.choices.some(c => /축구|체육부대/.test(c.text)));
});

test('fix 3: sponsor and bribe offers only reach careers that hold that power', () => {
  const fire = adult('spn-fire', 30); RT.enter(fire, 'safety', { cause: 'choice', career: 'firefighter', quiet: true });
  const nurse = adult('spn-nurse', 30); RT.enter(nurse, 'medical', { cause: 'choice', career: 'nurse', quiet: true });
  const cond = id => D.events.find(e => e.id === id).cond;
  assert.ok(!E.condMatches(fire, cond('spn_police_bribe')), 'no police bribe for a firefighter');
  assert.ok(E.condMatches(fire, cond('spn_fire_inspect')), 'a firefighter gets the inspection offer');
  assert.ok(!E.condMatches(nurse, cond('spn_med_kickback')), 'no prescription kickback for a nurse');
  for (const e of D.events.filter(x => /^spn_/.test(x.id) && !/exposed|retaliation|ent_patron|match_fix/.test(x.id))) assert.ok(e.cond && e.cond.career && e.cond.career.length, e.id + ' names its careers');
});

test('fix 4: v6 crime history goes to the route of the crime careers actually held', () => {
  const s = adult('mig', 45);
  s.jobHistory = [{ id: 'cyber_criminal', from: 25, to: 42, top: true }];
  s.job = null;
  s.routeLog = [{ age: 25, from: 'none', to: 'crime', cause: 'choice', legal: true }, { age: 42, from: 'crime', to: 'none', cause: 'quit', legal: true }];
  s.routeYears = { crime: 17 }; s.routeSeen = { crime: 25 }; s.routePeak = { crime: 44 };
  L.migrateCrimeHistory(s);
  assert.deepStrictEqual(s.routeLog.map(m => m.to + '<' + m.from), ['con<none', 'none<con']);
  assert.strictEqual(s.routeYears.con, 17); assert.ok(!('crime' in s.routeYears) && !s.routeYears.gang);
  assert.strictEqual(s.routePeak.con, 44); assert.ok(!('crime' in s.routePeak));
  assert.strictEqual(s.routeSeen.con, 25);
});

test('fix 5: going back to crime resets the clean years needed for 손을 씻은 사람', () => {
  const s = adult('clean', 45);
  s.flags.went_straight = 30;
  s.routeLog = [{ age: 30, from: 'gang', to: 'none', cause: 'quit', legal: true }, { age: 31, from: 'none', to: 'gang', cause: 'choice', legal: true }];
  RT.enter(s, 'gang', { cause: 'choice', quiet: true });
  assert.ok(L.isDark(s)); assert.strictEqual(L.cleanYears(s), -1);
  s.alive = false; assert.notStrictEqual(E.ending(s).id, 'went_straight');
  // left again at 40: five years are not enough, fifteen are
  const t = adult('clean2', 45); t.flags.went_straight = 30;
  t.routeLog = [{ age: 30, from: 'gang', to: 'none' }, { age: 31, from: 'none', to: 'gang' }, { age: 40, from: 'gang', to: 'none' }];
  assert.strictEqual(L.cleanYears(t), 5);
  t.age = 50; assert.strictEqual(L.cleanYears(t), 10);
});
