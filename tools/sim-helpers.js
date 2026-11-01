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
  const resolveAll = () => {
    let qg = 0;
    while (s.queue.length && qg++ < 40) {
      const ev = E.currentEvent(s);
      if (!ev) break;
      const en = ev.choices.filter(c => c.enabled);
      const c = en.length ? en[Math.floor(RA.RNG.next(pick) * en.length)] : ev.choices[0];
      if (!E.choose(s, c.i)) s.queue.shift();
    }
  };
  while (s.alive && guard++ < 200) {
    resolveAll();
    if (!s.alive) break;
    // job hunting first (uses one action point)
    if (s.age >= 18 && !s.job && s.edu.stage === 'none' && RA.RNG.next(pick) < 0.6) {
      // a casual player rarely picks a criminal career on purpose
      const ok = E.jobList(s).filter(j => j.ok && (j.sector !== 'crime' || RA.RNG.next(pick) < 0.25));
      if (ok.length) E.applyJob(s, ok[Math.floor(RA.RNG.next(pick) * ok.length)].id);
    }
    // activities
    for (let i = 0; i < 3 && s.ap > 0; i++) {
      const acts = E.activities(s).filter(a => a.ok && !a.ui);
      if (!acts.length) break;
      const a = acts[Math.floor(RA.RNG.next(pick) * acts.length)];
      const chosen = (opts.policy && opts.policy(s, acts, pick)) || a;
      if (chosen.id === 'crime' && RA.RNG.next(pick) < 0.9) continue;
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
