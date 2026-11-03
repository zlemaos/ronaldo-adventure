/* Tiny chiptune SFX generated with WebAudio (no audio files). Mute state kept per viewer. */
(function (G) {
  var RA = G.RA = G.RA || {};
  var ctx = null, muted = false;
  try { muted = G.localStorage && G.localStorage.getItem('ronaldo-adventure.muted') === '1'; } catch (e) { muted = false; }

  function ac() {
    if (!ctx) {
      var AC = G.AudioContext || G.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, start, dur, type, vol) {
    var a = ac(); if (!a) return;
    var o = a.createOscillator(), g = a.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, a.currentTime + start);
    g.gain.setValueAtTime(0.0001, a.currentTime + start);
    g.gain.exponentialRampToValueAtTime(vol || 0.06, a.currentTime + start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + dur);
    o.connect(g); g.connect(a.destination);
    o.start(a.currentTime + start); o.stop(a.currentTime + start + dur + 0.02);
  }
  function seq(notes, step, type, vol) { notes.forEach(function (n, i) { if (n) tone(n, i * step, step * 0.9, type, vol); }); }

  var N = { C4: 262, D4: 294, E4: 330, F4: 349, G4: 392, A4: 440, B4: 494, C5: 523, D5: 587, E5: 659, G5: 784, A5: 880, C6: 1047 };
  var SFX = {
    click: function () { tone(880, 0, 0.04, 'square', 0.03); },
    age: function () { seq([N.C5, N.E5, N.G5, N.C6], 0.07, 'square', 0.05); },
    good: function () { seq([N.E5, N.G5, N.C6], 0.07, 'triangle', 0.08); },
    bad: function () { seq([N.E4, N.C4], 0.12, 'sawtooth', 0.04); },
    goal: function () { seq([N.G4, N.C5, N.E5, N.G5, 0, N.E5, N.G5, N.C6], 0.08, 'square', 0.06); },
    trophy: function () { seq([N.C5, N.C5, N.G5, N.G5, N.A5, N.A5, N.G5, 0, N.E5, N.G5, N.C6], 0.09, 'square', 0.06); tone(130, 0, 0.9, 'triangle', 0.05); },
    death: function () { seq([N.A4, N.F4, N.D4, N.C4], 0.28, 'triangle', 0.07); },
    achieve: function () { seq([N.C6, N.G5, N.C6], 0.06, 'square', 0.04); },
    // gambling: falling coins on a win, a slot-machine run on a jackpot, a sinking slide on a loss
    coins: function () { seq([N.C6, N.G5, N.C6, N.E5, N.C6], 0.05, 'square', 0.04); },
    jackpot: function () { seq([N.C5, N.E5, N.G5, N.C6, N.G5, N.C6, N.E5, N.G5, N.C6, 0, N.C6, N.C6], 0.06, 'square', 0.05); tone(196, 0, 0.8, 'triangle', 0.05); },
    lose: function () { seq([N.G4, N.E4, N.D4, N.C4], 0.1, 'triangle', 0.06); },
    // grief: a slow two-note sigh; cheer: a short crowd-ish triad for stage/route peaks
    sorrow: function () { seq([N.E4, 0, N.C4], 0.32, 'triangle', 0.05); },
    cheer: function () { seq([N.G4, N.C5, N.E5, N.G5, N.E5, N.G5], 0.07, 'triangle', 0.07); }
  };

  // SIUU celebration: a real recording played with an HTMLAudioElement (works from file://, no fetch).
  // The file itself is mastered quiet (mean ≈ -28 dBFS, like the synth effects) because iOS ignores
  // element.volume, so the level must live in the asset, not in code.
  // Phones only allow audio after a user gesture, so the element is created and "unlocked" on the first tap.
  var siuuEl = null, unlocked = false, realPlay = false;
  function siuuElement() {
    if (!siuuEl && G.Audio) {
      try { siuuEl = new G.Audio('assets/audio/siuu.mp3'); siuuEl.preload = 'auto'; siuuEl.volume = 1; } catch (e) { siuuEl = null; }
    }
    return siuuEl;
  }
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    ac();
    var el = siuuElement();
    if (el && !muted) {
      try { el.muted = true; var pr = el.play(); if (pr && pr.then) pr.then(function () { if (!realPlay) { el.pause(); el.currentTime = 0; } el.muted = false; }, function () { el.muted = false; }); } catch (e) { el.muted = false; }
    }
  }
  if (G.document && G.addEventListener) {
    G.addEventListener('pointerdown', unlock, { once: false, passive: true });
    G.addEventListener('keydown', unlock, { passive: true });
  }

  RA.Audio = {
    siuu: function () {
      if (muted || !unlocked) return false;
      var el = siuuElement(); if (!el) return false;
      try { realPlay = true; el.muted = false; el.currentTime = 0; var pr = el.play(); if (pr && pr.catch) pr.catch(function () { /* blocked: ignore */ }); } catch (e) { return false; }
      return true;
    },
    unlock: unlock,
    play: function (name) { if (muted || !SFX[name]) return; try { SFX[name](); } catch (e) { /* audio is optional */ } },
    isMuted: function () { return muted; },
    toggle: function () {
      muted = !muted;
      if (muted && siuuEl) { try { siuuEl.pause(); } catch (e) { /* ignore */ } }
      try { G.localStorage && G.localStorage.setItem('ronaldo-adventure.muted', muted ? '1' : '0'); } catch (e) { /* ignore */ }
      return muted;
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
