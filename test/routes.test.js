'use strict';
/* Route architecture (docs/DESIGN.md §2f): every life is on exactly one route each year, moves only
 * through declared exits, only sees events of its own route plus route-neutral life events, and the
 * validator rejects content that would bring the old 짬뽕 back. */
const test = require('node:test');
const assert = require('node:assert');
const { load, autoplay } = require('../tools/sim-helpers.js');
const { validate } = require('../tools/validate-data.js');
const RA = load();
const E = RA.Engine, RT = E.Routes, D = RA.data;
const COUNTRIES = ['pt', 'kr', 'jp', 'cn', 'us', 'br', 'ar', 'za', 'in'];
const LIVES = Number(process.env.ROUTE_LIVES || 90);

// play lives while recording every event shown and the route the hero was on at that moment
function playRecorded(opts) {
  const seen = [];
  const orig = E.choose;
  E.choose = function (s, i) {
    const ev = E.currentEvent(s);
    if (ev) seen.push({ id: ev.id, route: s.route && s.route.id, age: s.age, fb: s.fb.stage, job: s.job && s.job.id, s });
    return orig.apply(this, arguments);
  };
  try { return { s: autoplay(RA, opts), seen }; } finally { E.choose = orig; }
}

test('routes: every track opens a route, every career belongs to a route', () => {
  const res = validate(RA);
  assert.deepStrictEqual(res.errors, [], res.errors.slice(0, 10).join('\n'));
  const required = ['law', 'medical', 'art', 'model', 'singer', 'idol', 'band', 'actor', 'comedian', 'cook', 'fighter', 'football', 'basketball', 'baseball', 'none', 'parttime', 'prison', 'school', 'retired'];
  required.forEach(id => assert.ok(RT.byId(id), 'route ' + id));
  D.careers.forEach(k => assert.ok(RT.ofCareer(k.id), 'career ' + k.id + ' has a route'));
});

test('lives: always on a route, moves only through declared exits, events fit the route', () => {
  const bad = [], moves = {}, visited = new Set();
  for (let i = 0; i < LIVES; i++) {
    const bot = i % 3 === 0 ? 'rascal' : i % 3 === 1 ? 'model' : undefined;
    const { s, seen } = playRecorded({ country: COUNTRIES[i % 9], seed: 'route-' + i, bot });
    assert.ok(s.route && RT.byId(s.route.id), 'life ends on a known route');
    for (const m of s.routeLog || []) {
      visited.add(m.to);
      moves[m.from + '>' + m.to] = 1;
      if (!m.legal) bad.push('illegal move ' + m.from + ' → ' + m.to + ' at ' + m.age + ' (' + m.cause + ') seed route-' + i);
    }
    for (const x of seen) {
      if (/^sys_/.test(x.id)) continue;
      const ev = D.events.find(e => e.id === x.id); if (!ev) continue;
      const rr = RT.eventRoutes(ev);
      // a route-gated event is shown only on its route (queued events are re-checked by currentEvent)
      if (rr && rr.length && !rr.some(g => g === x.route || g === '*' || (g === 'adrift' && (x.route === 'none' || x.route === 'parttime')) || (g === 'football' && x.fb !== 'none' && x.fb !== 'retired') || (g === 'employee' && D.routeGroups.employee.includes(x.route)) || (g === 'working' && x.job)))
        bad.push(x.id + ' shown on route ' + x.route + ' at ' + x.age);
      const r = RT.byId(x.route);
      if (r && r.athlete && r.group === '운동' && x.age > r.athlete.end + 1) bad.push('athlete route ' + r.id + ' at ' + x.age);
    }
  }
  assert.deepStrictEqual(bad.slice(0, 10), []);
  assert.ok(visited.size >= 20, 'lives spread over many routes: ' + visited.size);
});

test('no footballer or academy content after the sporting age; old heroes play 조기축구 at most', () => {
  for (let i = 0; i < 30; i++) {
    const { s, seen } = playRecorded({ country: COUNTRIES[i % 9], seed: 'fbage-' + i, prefer: /축구/ });
    for (const x of seen) {
      if (x.age > 41) assert.ok(!/^canon_(regional|academy|youth|pro|late)|^fb_(transfer|pro|national)/.test(x.id), x.id + ' at ' + x.age);
    }
    assert.ok(!(s.fb.stage === 'pro' && s.age > 41) || !s.alive);
  }
  const s = E.newGame({ country: 'kr', seed: 'old-fb' });
  while (s.queue.length) E.choose(s, 0);
  s.age = 50; s.queue = [];
  // round 8: football is a hobby; without it there is no football activity at all
  s.hobbies = ['read']; s.hobbyEver = { read: 6 };
  assert.ok(!E.activities(s).some(a => a.id === 'football'), 'no football activity without the football hobby');
  s.hobbies = ['football']; s.hobbyEver = { football: 6 };
  const fa = E.activities(s).find(a => a.id === 'football');
  assert.ok(fa && fa.label === '조기축구', 'a 50-year-old off the football route plays 조기축구: ' + (fa && fa.label));
  s.age = 61;
  assert.ok(!E.activities(s).some(a => a.id === 'football'), 'no football activity past 60');
});

test('a route-neutral event that changes the career is rejected by the validator', () => {
  const ev = { id: 'life_bad_jump', age: [20, 40], text: '갑자기 축구 선수가 됐다.', choices: [{ text: '좋다', career: 'footballer', log: '됐다.' }] };
  D.events.push(ev); E.resetCaches();
  try {
    const res = validate(RA);
    assert.ok(res.errors.some(e => /life_bad_jump.*route-neutral/.test(e)), res.errors.join('\n'));
  } finally { D.events.pop(); E.resetCaches(); }
  const ev2 = { id: 'life_bad_scout', age: [30, 60], text: '스카우트가 찾아왔다.', choices: [{ text: '좋다', log: '좋았다.' }] };
  D.events.push(ev2); E.resetCaches();
  try { assert.ok(validate(RA).errors.some(e => /life_bad_scout.*youth-sport/.test(e))); } finally { D.events.pop(); E.resetCaches(); }
});

test('body specs and talents: seeded, vary between lives, shape route fit', () => {
  const a = E.newGame({ country: 'kr', seed: 'body-1' }), b = E.newGame({ country: 'kr', seed: 'body-1' });
  assert.deepStrictEqual(a.body, b.body, 'same seed, same body');
  const heights = new Set();
  for (let i = 0; i < 20; i++) heights.add(E.newGame({ country: 'us', seed: 'body-v' + i }).body.height);
  assert.ok(heights.size >= 8, 'heights vary: ' + [...heights].join(','));
  const bb = RT.byId('basketball');
  const tall = E.newGame({ country: 'us', seed: 'tall' }), short = E.newGame({ country: 'us', seed: 'short' });
  tall.body.height = RT.avgHeight(tall) + 18; short.body.height = RT.avgHeight(short) - 12;
  assert.ok(RT.fit(tall, bb) > RT.fit(short, bb), 'height helps basketball');
});

test('v5 saves (made by the previous version) open on a sensible route and play on to an ending', () => {
  const fx = require('./fixtures/v5-saves.json');
  const expect = { kid: ['school', 'football'], job: [RT.ofCareer('fisher')], idle: ['none', 'parttime', 'school'], jail: ['prison'], old: ['retired', 'none'], pro: ['football'] };
  for (const k of Object.keys(expect)) {
    assert.ok(fx[k], 'fixture ' + k);
    assert.strictEqual(fx[k].saveVersion, 5);
    const s = RA.Save.deserialize(JSON.stringify(fx[k]));
    assert.strictEqual(s.saveVersion, RA.C.SAVE_VERSION);
    assert.ok(s.body && s.body.height > 100 && s.talent, k + ': body and talents defaulted');
    assert.ok(fx[k].jail > 0 ? s.route.id === 'prison' : expect[k].includes(s.route.id), k + ': route ' + s.route.id);
    assert.ok(s.achievements, 'achievements kept');
    const end = autoplay(RA, { state: s, seed: 'v5-' + k });
    assert.strictEqual(end.alive, false);
    assert.ok(E.endingById(end.ending), k + ': reaches an ending');
    assert.ok((end.routeLog || []).every(m => m.legal), k + ': only legal moves after loading');
  }
});

test('scenes: every event picks a drawn scene, route events use their own place', () => {
  const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'js', 'pixel.js'), 'utf8');
  const drawn = new Set([...src.matchAll(/^\s{4}(\w+): function \(ctx, t, c\)/gm)].map(m => m[1]));
  Object.values(E.ROUTE_SCENE).forEach(n => assert.ok(drawn.has(n), 'scene drawn: ' + n));
  const s = E.newGame({ country: 'kr', seed: 'scene' }); while (s.queue.length) E.choose(s, 0);
  for (const ev of D.events) { const n = ev.scene || E.sceneFor(s, ev); assert.ok(drawn.has(n), ev.id + ' → ' + n); }
  const ofRoute = id => E.sceneFor(s, D.events.find(e => (e.routes || [])[0] === id && e.routes.length === 1));
  assert.strictEqual(ofRoute('law'), 'court'); assert.strictEqual(ofRoute('cook'), 'kitchen');
  assert.strictEqual(ofRoute('fighter'), 'ring'); assert.strictEqual(ofRoute('model'), 'runway');
  assert.strictEqual(E.sceneFor(s, D.events.find(e => /^gam_/.test(e.id))), 'casino');
});

test('a move is legal only when both destination and cause match a declared exit', () => {
  assert.strictEqual(RT.legal('football', 'cook', 'choice'), false, 'football → restaurant needs retirement');
  assert.strictEqual(RT.legal('football', 'cook', 'retire'), true);
  assert.strictEqual(RT.legal('art', 'none', 'choice'), false, 'quitting is "quit", not a choice');
  assert.strictEqual(RT.legal('art', 'none', 'quit'), true);
  assert.strictEqual(RT.legal('office', 'prison', 'quit'), false);
  assert.strictEqual(RT.legal('office', 'prison', 'crime'), true);
  assert.strictEqual(RT.legal('office', 'startup'), false, 'no cause, no move');
  // an illegal entry is refused before anything changes
  const s = E.newGame({ country: 'kr', seed: 'refuse' }); while (s.queue.length) E.choose(s, 0);
  s.age = 30; s.edu.stage = 'none'; RT.sync(s, true);
  RT.enter(s, 'office', { career: 'office_worker', cause: 'choice', quiet: true });
  const before = JSON.stringify([s.route, s.job]);
  assert.strictEqual(RT.enter(s, 'law', { cause: 'choice', quiet: true }), '');
  assert.strictEqual(RT.enter(s, 'cook', { cause: 'fail', quiet: true }), '', 'office → restaurant is a choice or burnout, not a failure');
  assert.strictEqual(E.startJob(s, 'boxer', 0), false);
  assert.strictEqual(JSON.stringify([s.route, s.job]), before);
});

test('v5 top-rank professionals keep their rank and stage after loading', () => {
  const fx = require('./fixtures/v5-saves.json');
  for (const [k, stage] of [['lawyer_top', 'top'], ['doctor_top', 'chief']]) {
    const lvl = fx[k].job.level;
    const s = RA.Save.deserialize(JSON.stringify(fx[k]));
    assert.strictEqual(RT.stage(s).id, stage, k + ' stage');
    assert.strictEqual(s.job.level, lvl, k + ' rank after loading');
    for (let i = 0; i < 2; i++) { while (s.queue.length) { const ev = E.currentEvent(s); if (!ev) break; const c = ev.choices.find(x => x.enabled && !/쉰다|옮긴다/.test(x.text)) || ev.choices.find(x => x.enabled); if (!E.choose(s, c.i)) s.queue.shift(); } E.ageUp(s); }
    if (s.job && s.route.id === RT.ofCareer(fx[k].job.id)) assert.ok(s.job.level >= lvl, k + ' never demoted on the same stage: ' + s.job.level);
  }
});

// particles directly after inserted names (track, route, stage, career) must fit the final consonant
function particleProblems(text, values) {
  const out = [];
  values.forEach(v => {
    let i = text.indexOf(v);
    while (i >= 0) {
      const m = text.slice(i + v.length).match(/^(을|를|은|는|이|가|와|과|으로|로)(?![가-힣])/);
      if (m) {
        const pair = { 을: '을/를', 를: '을/를', 은: '은/는', 는: '은/는', 이: '이/가', 가: '이/가', 와: '과/와', 과: '과/와', 으로: '으로/로', 로: '으로/로' }[m[1]];
        if (RA.Text.particle(v, pair) !== m[1]) out.push(v + m[1]);
      }
      i = text.indexOf(v, i + 1);
    }
  });
  return out;
}
test('generated choice, track and route texts pass the particle check in every country', () => {
  const bad = [];
  for (const c of COUNTRIES) {
    const values = Object.values(D.trackNames[c]).concat(Object.values(D.tracks).map(t => t.name), D.routes.map(r => r.name));
    D.routes.forEach(r => (r.stages || []).forEach(x => { if (x.t) values.push(x.t); }));
    for (const track of [null].concat(Object.keys(D.tracks))) {
      const s = E.newGame({ country: c, seed: 'josa-' + track }); while (s.queue.length) E.choose(s, 0);
      s.age = 13; s.track = track;
      const texts = RT.trackChoices13(s).concat(RT.trackChoices16(s)).map(x => [x.text, x.desc]);
      [].concat(...texts).filter(Boolean).forEach(t => particleProblems(E.render(s, t), values).forEach(p => bad.push(c + ' ' + track + ': ' + p)));
    }
  }
  assert.deepStrictEqual(bad, []);
});

test('the summary does not show same-year bounces; causes read as words', () => {
  const s = E.newGame({ country: 'kr', seed: 'bounce' }); while (s.queue.length) E.choose(s, 0);
  s.age = 21; s.edu.stage = 'univ'; RT.sync(s, true);
  const n = s.routeLog.length;
  s.edu.stage = 'none'; RT.sync(s, true); s.edu.stage = 'grad'; RT.sync(s, true);
  assert.strictEqual(s.routeLog.length, n, 'graduate + grad school in one year is no move');
  assert.strictEqual(RT.causeLabel('fail'), '실패');
});

test('lives without a route of their own keep moving (adrift crossroads), even on auto-play', () => {
  let stuck = 0;
  for (let i = 0; i < 8; i++) {
    const s = E.newGame({ country: COUNTRIES[i], seed: 'adrift-' + i });
    let g = 0, idleFrom = null, longest = 0;
    while (s.alive && g++ < 130) {
      while (s.queue.length) { const ev = E.currentEvent(s); if (!ev) break; const c = ev.choices.find(x => x.enabled && !x.risky) || ev.choices.find(x => x.enabled) || ev.choices[0]; if (!E.choose(s, c.i)) s.queue.shift(); }
      if (!s.alive) break;
      const idle = ['none', 'parttime'].includes(s.route.id) && s.age >= 19 && s.age <= 62;
      if (idle) { idleFrom = idleFrom == null ? s.age : idleFrom; longest = Math.max(longest, s.age - idleFrom); } else idleFrom = null;
      E.ageUp(s);
    }
    if (longest > 12) stuck++;
  }
  assert.strictEqual(stuck, 0, stuck + ' of 8 auto-played lives idled more than 12 years');
});

test('a school-track student can practise the track before a route starts', () => {
  const s = E.newGame({ country: 'kr', seed: 'practice' }); while (s.queue.length) E.choose(s, 0);
  s.age = 14; s.edu.stage = 'middle'; s.track = 'art'; RT.sync(s, true); s.ap = 3;
  assert.strictEqual(s.route.id, 'school');
  const a = E.activities(s).find(x => x.id === 'route');
  assert.ok(a.ok, a.reason); assert.strictEqual(a.label, '실기 연습');
  const t0 = s.talent.art; E.doActivity(s, 'route');
  assert.ok(s.talent.art > t0 && s.trackPrep > 0);
  const fresh = E.newGame({ country: 'kr', seed: 'practice' }); while (fresh.queue.length) E.choose(fresh, 0);
  fresh.age = 18; fresh.edu.stage = 'none'; fresh.track = 'art'; RT.sync(fresh, true);
  s.age = 18; s.edu.stage = 'none'; RT.sync(s, true);
  RT.enter(s, 'art', { cause: 'entry', quiet: true }); RT.enter(fresh, 'art', { cause: 'entry', quiet: true });
  assert.ok(s.route.sk > fresh.route.sk, 'practice gives a head start');
});

test('folded career-family routes get their fit from talents; the body card follows the birth card', () => {
  const s = E.newGame({ country: 'kr', seed: 'fit' });
  s.talent.art = 90; s.talent.logic = 10;
  assert.ok(RT.fit(s, RT.byId('design')) > RT.fit(s, RT.byId('it')));
  while (s.queue.length) E.choose(s, 0);
  const ids = s.cards.map(c => c.id);
  assert.strictEqual(ids.indexOf('birth_body'), ids.indexOf('ms_birth') + 1, ids.join(','));
  // 돌잡이 / first word follow the strongest talent
  const t = E.newGame({ country: 'kr', seed: 'dol' }); t.talent.art = 99;
  const m = D.milestones.find(x => x.id === 'ms_kr_dol');
  assert.ok(/붓/.test(m.byTalent[E.topTalent(t)].text));
});

test('youth-only jobs (볼보이) age out through a narrated, legal exit; a plain hiring age limit does not', () => {
  const ageUpQuiet = s => { s.queue.length = 0; E.ageUp(s); };
  // new game: a 17-year-old ballboy keeps the job to 22 and grows out of it at 23
  const y = E.newGame({ country: 'kr', seed: 'ballboy' }); while (y.queue.length) E.choose(y, 0);
  y.age = 17; y.edu.stage = 'none'; y.fb.stage = 'none'; E.startJob(y, 'ballboy', 0); RT.sync(y, true);
  // keep the job performance steady so a random 실적 부진 firing does not end the job first
  for (let a = 18; a <= 22; a++) { y.job.perf = 60; ageUpQuiet(y); assert.strictEqual(y.job && y.job.id, 'ballboy', 'still a ballboy at ' + a); }
  ageUpQuiet(y);
  assert.strictEqual(y.job, null);
  assert.ok(y.log.some(l => l.age === 23 && /볼보이/.test(l.t) && /어른의 일자리/.test(l.t)), 'the exit is narrated');
  const m = y.routeLog[y.routeLog.length - 1];
  assert.ok(m.from === 'parttime' && m.to === 'none' && m.legal, JSON.stringify(m));
  // existing (v5) save holding a 50-year-old ballboy: the next year moves on
  const fx = JSON.parse(JSON.stringify(require('./fixtures/v5-saves.json').idle));
  fx.age = 50; fx.jail = 0; fx.job = { id: 'ballboy', level: 2, years: 30, atLevel: 10, perf: 50, since: 20 };
  const s = RA.Save.deserialize(JSON.stringify(fx));
  ageUpQuiet(s);
  assert.strictEqual(s.job, null, 'a 51-year-old is no longer a ballboy');
  assert.ok(s.routeLog.every(x => x.legal));
  // a hiring limit only (영화관 알바 hires to 40) keeps an older worker employed
  const c = E.newGame({ country: 'kr', seed: 'cinema' }); while (c.queue.length) E.choose(c, 0);
  c.age = 44; c.edu.stage = 'none'; c.fb.stage = 'none'; E.startJob(c, 'cinema_parttime', 0); RT.sync(c, true);
  ageUpQuiet(c);
  assert.ok(c.job && c.job.id === 'cinema_parttime');
});

test('same seed + same choices = same life', () => {
  const x = autoplay(RA, { country: 'br', seed: 'det-route' }), y = autoplay(RA, { country: 'br', seed: 'det-route' });
  assert.deepStrictEqual(x.routeLog, y.routeLog);
  assert.strictEqual(x.age, y.age); assert.strictEqual(x.money, y.money);
});
