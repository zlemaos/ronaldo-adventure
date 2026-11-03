'use strict';
/* Every way to gamble loses money on average (checked analytically, not by luck):
 * bets in events, lottery tickets (activity + events), wagers with fixed money, and the gambler career. */
const test = require('node:test');
const assert = require('node:assert');
const { load } = require('../tools/sim-helpers.js');
const RA = load();
const E = RA.Engine;

const GAMBLING = ev => /^gam_|lotto|lottery|gambl|casino|bet/.test(ev.id) || (ev.choices || []).some(c => c.bet);
const fxOf = e => (e && e.fx ? [].concat(e.fx) : []);

test('every bet returns less than its stake on average (jackpot included)', () => {
  const bad = [];
  for (const ev of E.allEvents()) (ev.choices || []).forEach((c, i) => {
    if (!c.bet) return;
    const p = E.betWinChance(c.bet), jp = E.JACKPOT;
    const jx = c.bet.stake === 'tiny' ? 1 : 1 - jp.p + jp.p * jp.x; // kids' 'tiny' bets have no jackpot
    const ret = p * c.bet.mult * jx;                             // stake comes back × mult on a win (× x on a jackpot)
    if (!(ret < 1)) bad.push(ev.id + '#' + i + ' returns ' + ret.toFixed(3));
  });
  assert.deepStrictEqual(bad, []);
});

test('lottery tickets return less than their price; wagers with fixed money lose even at the best odds', () => {
  const L = E.LOTTERY;
  const perTicket = L.first.p * (L.first.lo + L.first.hi) / 2 + L.tiers.reduce((a, t) => a + t.p * t.prize, 0);
  assert.ok(perTicket < L.price, 'ticket returns ' + perTicket.toFixed(2) + ' of ' + L.price);
  const bad = [];
  for (const ev of E.allEvents()) {
    if (!GAMBLING(ev)) continue;
    (ev.choices || []).forEach((c, i) => {
      // a sure prize (the old "fx lottery" for a few coins) is not a wager
      if (fxOf(c.effects).includes('lottery')) bad.push(ev.id + '#' + i + ': a guaranteed lottery prize');
      if (!c.check || !c.success || !c.fail) return;
      const win = (c.success.effects || {}).money || 0, lose = (c.fail.effects || {}).money || 0;
      if (!(lose < 0)) return;                                    // bribes and cheating risk jail, not money
      const pMax = typeof c.check.odds === 'number' ? c.check.odds : (c.check.max != null ? c.check.max : 0.95);
      if (pMax * win + (1 - pMax) * lose >= 0) bad.push(ev.id + '#' + i + ' can profit at p=' + pMax);
    });
  }
  assert.deepStrictEqual(bad, []);
});

test('with branch effects applied (bankruptcy too), a lost bet leaves less money and a won bet more', () => {
  const play = (ev, ci, money, r) => {
    const s = E.newGame({ country: 'kr', seed: 'bk' }); while (s.queue.length) E.choose(s, 0);
    s.age = Math.max(ev.age ? ev.age[0] : 20, 25); s.money = money; s.traits.gamble = 80; s.flags.homeowner = 1;
    // Exercise settlement independently of the source event's wealth/career eligibility.
    const id = 'settlement_fixture', index = E.eventIndex();
    index[id] = { id, text: 'Wager', choices: ev.choices };
    s.queue.unshift(id);
    const orig = RA.RNG.next; RA.RNG.next = () => r;          // 0.999 = always lose, 0.0001 = always win
    try { assert.ok(E.choose(s, ci)); } finally { RA.RNG.next = orig; delete index[id]; }
    return s.money;
  };
  const bad = [];
  for (const ev of E.allEvents()) (ev.choices || []).forEach((c, i) => {
    if (!c.bet || c.bet.stake === 'tiny') return;
    for (const m of [0, 1000, 100000]) {
      const lose = play(ev, i, m, 0.999), win = play(ev, i, m, 0.0001);
      if (!(lose < m)) bad.push(ev.id + '#' + i + ' loss at ' + m + ' → ' + lose);
      if (!(win > m)) bad.push(ev.id + '#' + i + ' win at ' + m + ' → ' + win);
    }
  });
  assert.deepStrictEqual(bad, []);
});

test('the gambler career loses money on average; a lost small bet costs the stake', () => {
  const [lo, hi] = E.GAMBLER_SWING;
  assert.ok((lo + hi) / 2 < 0, 'gambler swing mean ' + (lo + hi) / 2);
  const s = E.newGame({ country: 'kr', seed: 'tiny' }); while (s.queue.length) E.choose(s, 0);
  s.age = 9;
  assert.ok(E.betStake(s, { stake: 'tiny' }) > 0);
  // force the arcade bet and a loss
  s.queue.unshift('gam_arcade_claw'); const m0 = s.money;
  const rnd = E.rnd; let calls = 0;
  const orig = RA.RNG.next; RA.RNG.next = function () { calls++; return 0.999; };
  try { E.choose(s, 0); } finally { RA.RNG.next = orig; }
  assert.ok(calls > 0 && s.money < m0, 'lost tiny bet costs money: ' + m0 + ' → ' + s.money);
  void rnd;
});
