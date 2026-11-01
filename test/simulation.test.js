'use strict';
/* Plays >= 500 full random lives per country and reports distribution stats to catch balance bugs.
 * Three player archetypes rotate: random, football-focused, study-focused. */
const test = require('node:test');
const assert = require('node:assert');
const { load, autoplay } = require('../tools/sim-helpers.js');
const RA = load();
const E = RA.Engine;
const LIVES = Number(process.env.SIM_LIVES || 500);
const COUNTRIES = ['kr', 'jp', 'cn', 'us', 'br', 'ar', 'za', 'in'];
const POLICIES = [
  null,
  (s, acts) => acts.find(a => a.id === 'football') || null,
  (s, acts) => acts.find(a => a.id === 'study') || null
];

function pct(n, d) { return (100 * n / d).toFixed(1) + '%'; }

const report = [];
for (const c of COUNTRIES) {
  test('simulate ' + LIVES + ' lives in ' + c, () => {
    const ages = [], sectors = {}, errors = [];
    let pros = 0, ballon = 0, wc = 0, nat = 0, top = 0, jail = 0, married = 0, kids = 0, sober = 0, uni = 0, dadDead = [], achieve = 0;
    for (let i = 0; i < LIVES; i++) {
      let s;
      try { s = autoplay(RA, { country: c, seed: 'sim-' + c + '-' + i, policy: POLICIES[i % 3] }); }
      catch (e) { errors.push(e.stack.split('\n').slice(0, 3).join(' | ')); continue; }
      assert.strictEqual(s.alive, false, 'life must end');
      assert.ok(Number.isFinite(s.money), 'money is finite');
      C_STATS_OK(s);
      ages.push(s.age);
      if (s.fb.seasons) pros++;
      if (s.fb.trophies.ballon) ballon++;
      if (s.fb.trophies.wc) wc++;
      if (s.flags.nat_team) nat++;
      if (s.jobHistory.some(j => j.top && E.careerIndex()[j.id].sector !== 'parttime')) top++;
      if (s.flags.ever_jailed) jail++;
      if (s.marriedAt) married++;
      kids += s.people.filter(p => p.role === 'child').length;
      if (s.flags.father_sober) sober++;
      if (RA.C.DEGREES.indexOf(s.edu.degree) >= 2) uni++;
      if (s.flags.father_dead) dadDead.push(s.flags.father_dead);
      achieve += Object.keys(s.achievements).length;
      const best = s.jobHistory.slice().sort((a, b) => b.level - a.level || (b.to - b.from) - (a.to - a.from))[0];
      const sec = best ? E.careerIndex()[best.id].sector : 'none';
      sectors[sec] = (sectors[sec] || 0) + 1;
    }
    assert.deepStrictEqual(errors, [], errors.slice(0, 3).join('\n'));
    ages.sort((a, b) => a - b);
    const avg = ages.reduce((a, b) => a + b, 0) / ages.length;
    const row = {
      country: c, lives: LIVES, avgDeath: avg.toFixed(1), median: ages[ages.length >> 1], min: ages[0], max: ages[ages.length - 1],
      pro: pct(pros, LIVES), natTeam: pct(nat, LIVES), ballon: pct(ballon, LIVES), worldCup: pct(wc, LIVES),
      topOfCareer: pct(top, LIVES), degree: pct(uni, LIVES), married: pct(married, LIVES), kidsAvg: (kids / LIVES).toFixed(2),
      jailed: pct(jail, LIVES), fatherSober: pct(sober, LIVES), fatherDiedAtAvg: dadDead.length ? (dadDead.reduce((a, b) => a + b, 0) / dadDead.length).toFixed(1) : '-',
      achievementsAvg: (achieve / LIVES).toFixed(1), sectorsUsed: Object.keys(sectors).length,
      topSectors: Object.entries(sectors).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => k + ' ' + pct(v, LIVES)).join(', ')
    };
    report.push(row);
    console.log(JSON.stringify(row));
    // balance guards
    assert.ok(avg > 55 && avg < 92, 'average death age ' + avg);
    assert.ok(pros / LIVES > 0.05 && pros / LIVES < 0.7, 'pro share ' + pros / LIVES);
    assert.ok(ballon / LIVES < 0.2, 'ballon share too high');
    assert.ok(Object.keys(sectors).length >= 12, 'career spread ' + Object.keys(sectors).length);
  });
}

function C_STATS_OK(s) {
  for (const k of RA.C.STATS) assert.ok(s.stats[k] >= 0 && s.stats[k] <= 100, k + ' out of range: ' + s.stats[k]);
}

test.after(() => {
  if (!report.length) return;
  const cols = ['country', 'avgDeath', 'median', 'min', 'max', 'pro', 'natTeam', 'ballon', 'worldCup', 'topOfCareer', 'degree', 'married', 'kidsAvg', 'jailed', 'fatherSober', 'fatherDiedAtAvg', 'achievementsAvg', 'sectorsUsed'];
  const lines = ['| ' + cols.join(' | ') + ' |', '|' + cols.map(() => '---').join('|') + '|'];
  report.forEach(r => lines.push('| ' + cols.map(k => r[k]).join(' | ') + ' |'));
  console.log('\nSIMULATION REPORT (' + LIVES + ' lives per country)\n' + lines.join('\n'));
  console.log('\nTop career sectors by country:\n' + report.map(r => '- ' + r.country + ': ' + r.topSectors).join('\n'));
});
