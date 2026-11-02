/* Loads the game's classic scripts into Node's global scope, in the same order as index.html. */
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');

// Same order as the <script> tags in index.html (parsed from it so they never drift apart)
function scriptOrder() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const re = /<script src="([^"]+)"/g; const out = []; let m;
  while ((m = re.exec(html))) if (!/^(js\/(ui|pixel|audio|fx)\.js)$/.test(m[1])) out.push(m[1]);
  return out;
}

function load() {
  delete globalThis.RA;
  for (const f of scriptOrder()) {
    const p = path.join(ROOT, f);
    delete require.cache[require.resolve(p)];
    require(p);
  }
  return globalThis.RA;
}

// Play a whole life with random-but-seeded choices. Returns final state.
function autoplay(RA, opts) {
  const E = RA.Engine;
  const s = E.newGame(opts);
  const pick = RA.RNG.create('player|' + (opts.seed || ''));
  let guard = 0;
  // Choice policy. opts.bot: 'rascal' (악동 봇: always the risky option), 'model' (모범생 봇: the safe, studious option)
  const choiceIndex = (ev) => {
    const en = ev.choices.filter(c => c.enabled);
    if (!en.length) return ev.choices[0].i;
    if (opts.bot === 'rascal') {
      const risky = en.find(c => c.risky) || en.find(c => c.bet) || en.slice().sort((a, b) => (a.chance == null ? 1 : a.chance) - (b.chance == null ? 1 : b.chance))[0];
      return risky.i;
    }
    if (opts.bot === 'model') {
      const safe = en.filter(c => !c.risky && !c.bet);
      const pool = safe.length ? safe : en;
      const study = pool.find(c => /공부|대학|학원|입시|저축|적금|치료|검진|운동|가족/.test(c.text));
      if (study && RA.RNG.next(pick) < 0.5) return study.i;
      return pool[Math.floor(RA.RNG.next(pick) * pool.length)].i;
    }
    return en[Math.floor(RA.RNG.next(pick) * en.length)].i;
  };
  const resolveAll = () => {
    let qg = 0;
    while (s.queue.length && qg++ < 40) {
      const ev = E.currentEvent(s);
      if (!ev) break;
      if (!E.choose(s, choiceIndex(ev))) s.queue.shift();
    }
  };
  while (s.alive && guard++ < 200) {
    resolveAll();
    if (!s.alive) break;
    // job hunting first (uses one action point)
    if (s.age >= 18 && !s.job && s.edu.stage === 'none' && RA.RNG.next(pick) < 0.6) {
      // a casual player rarely picks a criminal career on purpose; bots follow their nature
      let ok = E.jobList(s).filter(j => j.ok && (j.sector !== 'crime' || opts.bot === 'rascal' || RA.RNG.next(pick) < 0.25));
      if (opts.bot === 'rascal') { const g = ok.find(j => j.id === 'pro_gambler') || (RA.RNG.next(pick) < 0.5 && ok.find(j => j.sector === 'crime')); if (g) ok = [g]; }
      if (opts.bot === 'model') { const good = ok.filter(j => j.sector !== 'crime' && j.sector !== 'parttime'); if (good.length) ok = good.sort((a, b) => b.salary - a.salary).slice(0, 3); }
      if (ok.length) E.applyJob(s, ok[Math.floor(RA.RNG.next(pick) * ok.length)].id);
    }
    // activities
    for (let i = 0; i < 3 && s.ap > 0; i++) {
      const acts = E.activities(s).filter(a => a.ok && !a.ui);
      if (!acts.length) break;
      const a = acts[Math.floor(RA.RNG.next(pick) * acts.length)];
      let chosen = (opts.policy && opts.policy(s, acts, pick)) || a;
      if (opts.bot === 'model') chosen = acts.find(x => x.id === ['study', 'exercise', 'family', 'football'][Math.floor(RA.RNG.next(pick) * 4)]) || chosen;
      if (opts.bot === 'rascal') chosen = acts.find(x => x.id === ['crime', 'lotto', 'football', 'friends', 'date'][Math.floor(RA.RNG.next(pick) * 5)]) || chosen;
      if (chosen.id === 'crime' && opts.bot !== 'rascal' && RA.RNG.next(pick) < 0.9) continue;
      if (chosen.id === 'quitjob' || chosen.id === 'quitfb') continue;
      E.doActivity(s, chosen.id, chosen.opts ? chosen.opts[0][0] : undefined);
      resolveAll();
      if (!s.alive) break;
    }
    resolveAll();
    if (!s.alive) break;
    E.ageUp(s);
  }
  // drain any remaining events at death
  return s;
}

module.exports = { load, autoplay, ROOT, scriptOrder };
