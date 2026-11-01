/* Seeded, serialisable RNG (mulberry32). State lives inside the game state so saves
 * resume the exact same random stream. */
(function (G) {
  var RA = G.RA = G.RA || {};

  function hashSeed(str) {
    str = String(str);
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }

  var RNG = {
    hashSeed: hashSeed,
    create: function (seed) { return { s: hashSeed(seed) }; },
    // float in [0,1)
    next: function (r) {
      r.s = (r.s + 0x6D2B79F5) >>> 0;
      var t = r.s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    int: function (r, a, b) { return a + Math.floor(RNG.next(r) * (b - a + 1)); },
    chance: function (r, p) { return RNG.next(r) < p; },
    pick: function (r, arr) { return arr[Math.floor(RNG.next(r) * arr.length)]; },
    weighted: function (r, items, wf) {
      var total = 0, i;
      for (i = 0; i < items.length; i++) total += Math.max(0, wf(items[i]));
      if (total <= 0) return null;
      var x = RNG.next(r) * total;
      for (i = 0; i < items.length; i++) { x -= Math.max(0, wf(items[i])); if (x < 0) return items[i]; }
      return items[items.length - 1];
    },
    // random seed for new games (UI only; not outcome-affecting once chosen)
    randomSeedString: function () {
      var c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '';
      for (var i = 0; i < 8; i++) s += c[Math.floor(Math.random() * c.length)];
      return s;
    }
  };
  RA.RNG = RNG;
})(typeof globalThis !== 'undefined' ? globalThis : this);
