'use strict';
/* Round 5: decisions every year, the 악동 route, gambling and addiction, failure routes and endings.
 * Two bots play 500 lives each across all 9 countries: the 악동 봇 always takes the risky option, the
 * 모범생 봇 the safe, studious one. */
const test = require('node:test');
const assert = require('node:assert');
const { load, autoplay } = require('../tools/sim-helpers.js');
const RA = load();
const E = RA.Engine, C = RA.C, S = RA.Save;
const LIVES = Number(process.env.BOT_LIVES || 500);
const COUNTRIES = ['pt', 'kr', 'jp', 'cn', 'us', 'br', 'ar', 'za', 'in'];

function playBot(bot) {
  const endings = {}, dec = { kid: [0, 0], teen: [0, 0], adult: [0, 0] };
  let gamblerUnlocked = 0, becameGambler = 0, jailed = 0, expelled = 0, bankrupt = 0, falls = 0;
  for (let i = 0; i < LIVES; i++) {
    const s = autoplay(RA, { country: COUNTRIES[i % COUNTRIES.length], seed: bot + '-' + i, bot });
    assert.strictEqual(s.alive, false);
    assert.ok(s.ending, 'every life ends on an ending');
    endings[s.ending] = (endings[s.ending] || 0) + 1;
    const en = E.endingById(s.ending);
    if (en.kind === 'fall') falls++;
    if (s.flags.gambler_unlocked) gamblerUnlocked++;
    if (s.jobHistory.some(j => j.id === 'pro_gambler')) becameGambler++;
    if (s.flags.ever_jailed) jailed++;
    if (s.flags.expelled) expelled++;
    if (s.flags.bankrupt) bankrupt++;
    for (let a = 5; a < s.age; a++) {
      const d = (s.dec || {})[a] || 0, band = a <= 12 ? 'kid' : a <= 19 ? 'teen' : 'adult';
      dec[band][0] += d; dec[band][1]++;
    }
  }
  const perYear = {}; for (const k in dec) perYear[k] = dec[k][0] / Math.max(1, dec[k][1]);
  return { endings, perYear, gamblerUnlocked, becameGambler, jailed, expelled, bankrupt, falls };
}

const results = {};
for (const bot of ['rascal', 'model']) {
  test(bot + ' bot: ' + LIVES + ' lives reach a spread of endings and enough decisions', () => {
    const r = results[bot] = playBot(bot);
    const top = Object.entries(r.endings).sort((a, b) => b[1] - a[1]);
    console.log(bot, JSON.stringify({ endings: top.slice(0, 10), kinds: Object.keys(r.endings).length, perYear: Object.fromEntries(Object.entries(r.perYear).map(([k, v]) => [k, +v.toFixed(2)])), gamblerUnlocked: r.gamblerUnlocked, becameGambler: r.becameGambler, jailed: r.jailed, expelled: r.expelled, bankrupt: r.bankrupt, falls: r.falls }));
    assert.ok(top[0][1] / LIVES <= 0.6, 'no single ending above 60%: ' + top[0][0] + ' ' + top[0][1]);
    assert.ok(Object.keys(r.endings).length >= 6, 'at least 6 different endings');
    assert.ok(r.perYear.kid >= 1, 'ages 5-12: ≥ 1 decision a year (' + r.perYear.kid + ')');
    assert.ok(r.perYear.teen >= 2, 'teens: ≥ 2 decisions a year (' + r.perYear.teen + ')');
    assert.ok(r.perYear.adult >= 1, 'adults: ≥ 1 decision a year (' + r.perYear.adult + ')');
  });
}

test('the 악동 bot lives riskier lives than the 모범생 bot', () => {
  const a = results.rascal, m = results.model;
  assert.ok(a && m);
  assert.ok(a.gamblerUnlocked > 0, '도박 중독 unlocks 겜블러 in some 악동 lives');
  assert.ok(a.becameGambler > 0, 'some 악동 lives actually become 겜블러');
  assert.ok(a.jailed > m.jailed, 'more prison');
  assert.ok(a.falls > m.falls, 'more failure endings');
});

test('bets follow their odds, move money, and feed 도박 중독', () => {
  const s = E.newGame({ country: 'kr', seed: 'bet' });
  while (s.queue.length) E.choose(s, 0);
  s.age = 30; s.money = 100000; s.queue = [];
  const ev = { id: 'test_bet', text: '한 판?', choices: [
    { text: '한다', bet: { odds: 0.5, mult: 2, stake: 'medium', addict: 4 }, success: { effects: {}, log: '이겼다.' }, fail: { effects: {}, log: '졌다.' } },
    { text: '안 한다', effects: {}, log: '참았다.' }] };
  RA.data.events.push(ev); E.resetCaches();
  let wins = 0; const n = 200;
  for (let i = 0; i < n; i++) {
    s.queue = ['test_bet']; const m0 = s.money;
    const shown = E.currentEvent(s).choices[0];
    assert.ok(shown.bet && shown.risky && shown.chance === 0.5);
    E.choose(s, 0);
    if (s.money > m0) wins++;
    assert.notStrictEqual(s.money, m0, 'a bet always moves money');
  }
  RA.data.events.pop(); E.resetCaches();
  assert.ok(wins > n * 0.35 && wins < n * 0.65, 'about 50% wins: ' + wins);
  assert.ok(s.traits.gamble >= 45, 'heavy betting builds addiction');
  assert.ok(s.flags.gambler_unlocked, '2단계 unlocks the 겜블러 path');
  const k = E.careerIndex().pro_gambler;
  assert.ok(k, 'pro_gambler exists');
  assert.deepStrictEqual(E.jobMissing(s, k).filter(x => !/세/.test(x)), []);
  const fresh = E.newGame({ country: 'kr', seed: 'bet2' }); fresh.age = 30;
  assert.ok(E.jobMissing(fresh, k).some(x => /도박/.test(x)), 'locked paths show their unlock hint');
});

test('failure FX: suspension, expulsion, bankruptcy, deportation, rehab, career-ending injury', () => {
  const s = E.newGame({ country: 'us', seed: 'fall' });
  while (s.queue.length) E.choose(s, 0);
  s.age = 15; s.edu.stage = 'high';
  assert.match(E.FX.suspend(s), /정학/);
  E.FX.expel(s);
  assert.strictEqual(s.edu.stage, 'none'); assert.ok(s.flags.expelled);
  s.money = 5000; E.FX.bankrupt(s); assert.strictEqual(s.money, 0); assert.ok(s.flags.bankrupt);
  s.flags.abroad = 20; E.startJob(s, 'chef', 0); E.FX.deport(s);
  assert.ok(s.flags.deported && !s.flags.abroad && !s.job);
  s.traits.gamble = 60; s.traits.alcohol = 50; E.FX.rehab(s);
  assert.strictEqual(s.traits.gamble, 30); assert.strictEqual(s.traits.alcohol, 20);
  s.fb.stage = 'pro'; E.startJob(s, 'footballer', 2); E.FX.careerEndingInjury(s);
  assert.ok(s.flags.career_injury && s.fb.stage === 'retired');
  const before = s.traits.record; s.jail = 0; E.FX.jail(s);
  assert.strictEqual(s.traits.record, before + 1, 'prison adds to 전과');
});

test('every ending is reachable in principle and the hall lists them', () => {
  assert.ok(RA.data.endings.length >= 25);
  const ids = new Set();
  RA.data.endings.forEach(e => { assert.ok(e.id && e.name && e.icon && e.desc && e.hint && /^(win|fall)$/.test(e.kind)); assert.ok(!ids.has(e.id)); ids.add(e.id); });
  assert.ok(RA.data.endings.filter(e => e.kind === 'fall').length >= 10, 'at least 10 failure endings');
  assert.strictEqual(RA.data.endings[RA.data.endings.length - 1].id, 'ordinary', 'a catch-all ending last');
});

test('traits: shown as chips, saved, and migrated from v4 saves', () => {
  const s = E.newGame({ country: 'br', seed: 'traits' });
  assert.deepStrictEqual(Object.keys(s.traits).sort(), C.TRAITS.slice().sort());
  const v4 = JSON.parse(JSON.stringify(s)); v4.saveVersion = 4; delete v4.traits; delete v4.dec; v4.flags.ever_jailed = 30;
  const m = S.deserialize(JSON.stringify(v4));
  assert.strictEqual(m.saveVersion, C.SAVE_VERSION);
  assert.strictEqual(m.traits.record, 1);
  assert.strictEqual(m.traits.rep, 50);
});

test('the 진로 panel lists open and locked special paths with hints', () => {
  const s = E.newGame({ country: 'kr', seed: 'paths' });
  while (s.queue.length) E.choose(s, 0);
  s.age = 25;
  const cp = E.careerPaths(s);
  assert.ok(cp.locked.length >= 5);
  const g = cp.locked.find(x => x.id === 'pro_gambler');
  assert.ok(g && /도박 중독/.test(g.hint));
  s.traits.gamble = 50;
  assert.ok(E.careerPaths(s).open.some(x => x.id === 'pro_gambler'));
});
