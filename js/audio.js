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
    achieve: function () { seq([N.C6, N.G5, N.C6], 0.06, 'square', 0.04); }
  };

  RA.Audio = {
    play: function (name) { if (muted || !SFX[name]) return; try { SFX[name](); } catch (e) { /* audio is optional */ } },
    isMuted: function () { return muted; },
    toggle: function () {
      muted = !muted;
      try { G.localStorage && G.localStorage.setItem('ronaldo-adventure.muted', muted ? '1' : '0'); } catch (e) { /* ignore */ }
      return muted;
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
