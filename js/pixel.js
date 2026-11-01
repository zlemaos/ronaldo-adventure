/* Pixel-art renderer: everything is drawn from code (no image files).
 * Logical canvas 160x96, scaled with image-rendering: pixelated. */
(function (G) {
  var RA = G.RA = G.RA || {};
  var P = RA.Pixel = {};

  P.W = 160; P.H = 96;
  var PAL = P.PAL = {
    ink: '#0b1020', navy: '#141b33', navy2: '#1f2a4d', navy3: '#2c3a66', slate: '#53608a', mist: '#9aa6c8',
    white: '#f4f6ff', grass: '#22b35e', grass2: '#1a9150', grass3: '#2fd171', gold: '#f5c518', gold2: '#c99a06',
    red: '#e8384f', red2: '#a8213a', blue: '#3b82f6', blue2: '#1d4ed8', sky: '#5aa9ff', sky2: '#9fd0ff',
    teal: '#14b8a6', purple: '#8b5cf6', orange: '#f97316', brown: '#7c4a2d', brown2: '#5a3320', grey: '#8a8fa3',
    grey2: '#5d6275', black: '#11131c', pink: '#f472b6', olive: '#5b6b2f', olive2: '#45521f', cream: '#e9e3cf'
  };

  function hash(n) { n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n = n ^ (n >>> 4); n = Math.imul(n, 0x27d4eb2d); n = n ^ (n >>> 15); return (n >>> 0) / 4294967296; }
  P.hash = hash;

  function R(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  // filled rect with 1px outline
  function B(ctx, x, y, w, h, c, o) { R(ctx, x - 1, y - 1, w + 2, h + 2, o || PAL.ink); R(ctx, x, y, w, h, c); }
  P.R = R; P.B = B;

  function shade(hex, f) {
    var n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.max(0, Math.min(255, Math.round(r * f))); g = Math.max(0, Math.min(255, Math.round(g * f))); b = Math.max(0, Math.min(255, Math.round(b * f)));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  P.shade = shade;

  // ---------------------------------------------------------------- outfits
  var OUT = {
    casual: { top: '#3b82f6', pants: '#1e293b' },
    hoodie: { top: '#6b7280', pants: '#1f2937', hood: true },
    kit: { top: '#f4f6ff', pants: '#f4f6ff', trim: '#e8384f', socks: '#e8384f', number: true },
    suit: { top: '#1f2a4d', pants: '#141b33', collar: '#f4f6ff', tie: '#e8384f' },
    whitecoat: { top: '#f4f6ff', pants: '#334155', inner: '#93c5fd', coat: true },
    scrubs: { top: '#14b8a6', pants: '#0f766e' },
    chef: { top: '#f4f6ff', pants: '#1f2937', hat: 'chef' },
    farmer: { top: '#dc2626', pants: '#2563eb', overalls: true, hat: 'straw' },
    hardhat: { top: '#f97316', pants: '#334155', vest: '#facc15', hat: 'helmet' },
    military: { top: '#5b6b2f', pants: '#45521f', camo: '#3b4520', hat: 'beret' },
    police: { top: '#1d4ed8', pants: '#0f172a', badge: '#f5c518', hat: 'cap' },
    firefighter: { top: '#b91c1c', pants: '#7f1d1d', stripe: '#facc15', hat: 'fire' },
    idol: { top: '#8b5cf6', pants: '#1e1b4b', sparkle: true },
    robe: { top: '#d97706', pants: '#d97706', robe: true, bald: true },
    lab: { top: '#f4f6ff', pants: '#334155', inner: '#22c55e', coat: true, goggles: true },
    space: { top: '#e5e7eb', pants: '#e5e7eb', trim: '#3b82f6', helmet: true },
    prison: { top: '#f97316', pants: '#f97316', number: true, trim: '#7c2d12' },
    uniform: { top: '#1f2a4d', pants: '#334155', collar: '#f4f6ff', tie: '#22b35e' },
    apron: { top: '#e2e8f0', pants: '#334155', apronC: '#16a34a' },
    artist: { top: '#f4f6ff', pants: '#1f2937', stripes: '#1d4ed8', hat: 'beret' },
    pilot: { top: '#f4f6ff', pants: '#0f172a', tie: '#0f172a', hat: 'pilot' },
    judge: { top: '#111827', pants: '#111827', robe: true, collar: '#f4f6ff' }
  };
  P.OUTFITS = OUT;
  var HAIR_COLORS = ['#1b1b1f', '#3b2416', '#6b4423', '#c08a3e', '#2a2a2a'];

  function stageOf(age) {
    if (age < 3) return 'baby';
    if (age < 8) return 'kid';
    if (age < 13) return 'child';
    if (age < 20) return 'teen';
    if (age < 60) return 'adult';
    return 'old';
  }
  P.stageOf = stageOf;
  var DIM = {
    baby: { body: 7, legs: 3, torsoW: 10, armW: 3, head: 12 },
    kid: { body: 10, legs: 6, torsoW: 10, armW: 3, head: 12 },
    child: { body: 13, legs: 8, torsoW: 12, armW: 3, head: 12 },
    teen: { body: 16, legs: 11, torsoW: 13, armW: 3, head: 12 },
    adult: { body: 17, legs: 12, torsoW: 15, armW: 4, head: 12 },
    old: { body: 16, legs: 11, torsoW: 15, armW: 4, head: 12 }
  };

  // look: {age, skin, hairColor, hair, outfit, gender, t, number, sick, mood}
  P.drawHero = function (ctx, cx, baseY, look) {
    var st = stageOf(look.age), d = DIM[st], o = OUT[look.outfit] || OUT.casual;
    var t = look.t || 0;
    var bob = (Math.floor(t / 500) % 2) && st !== 'baby' ? 1 : 0;
    var skin = look.skin || '#e0ac85', skinD = shade(skin, 0.82);
    var hairC = st === 'old' ? '#cfd3dc' : (look.hairColor || '#1b1b1f');
    if (look.age >= 50 && st !== 'old') hairC = shade(hairC, 1.5);
    var x0 = cx - Math.floor(d.torsoW / 2);
    var legTop = baseY - d.legs;
    var torsoTop = legTop - d.body + bob;
    // shadow
    ctx.globalAlpha = 0.35; R(ctx, cx - d.torsoW / 2 - 3, baseY, d.torsoW + 6, 2, PAL.ink); ctx.globalAlpha = 1;
    // legs
    var legW = Math.max(3, Math.floor(d.torsoW / 2) - 1);
    if (o.robe) {
      B(ctx, x0 - 1, torsoTop + 4, d.torsoW + 2, d.body + d.legs - 5, o.top);
    } else {
      B(ctx, x0 + 1, legTop + bob, legW, d.legs - bob, o.pants);
      B(ctx, x0 + d.torsoW - legW - 1, legTop + bob, legW, d.legs - bob, o.pants);
      if (o.socks && st !== 'baby') { R(ctx, x0 + 1, baseY - 4, legW, 3, o.socks); R(ctx, x0 + d.torsoW - legW - 1, baseY - 4, legW, 3, o.socks); R(ctx, x0 + 1, legTop + bob, d.torsoW - 2, 3, PAL.black); }
      R(ctx, x0, baseY - 1, legW + 1, 1, PAL.black); R(ctx, x0 + d.torsoW - legW - 1, baseY - 1, legW + 1, 1, PAL.black);
    }
    // arms
    var armY = torsoTop + 1;
    var armH = d.body - 3;
    var wave = look.mood === 'celebrate' ? -Math.floor(armH * 0.9) : 0;
    B(ctx, x0 - d.armW, armY + wave, d.armW, armH, o.coat ? o.top : o.top);
    B(ctx, x0 + d.torsoW, armY + (look.mood === 'celebrate' ? wave : 0), d.armW, armH, o.top);
    R(ctx, x0 - d.armW, armY + wave + armH - 2, d.armW, 2, skin);
    R(ctx, x0 + d.torsoW, armY + (look.mood === 'celebrate' ? wave : 0) + armH - 2, d.armW, 2, skin);
    // torso
    B(ctx, x0, torsoTop, d.torsoW, d.body, o.top);
    if (o.coat) { R(ctx, x0 + Math.floor(d.torsoW / 2) - 2, torsoTop, 4, d.body - 3, o.inner); R(ctx, x0 + Math.floor(d.torsoW / 2), torsoTop, 1, d.body, shade(o.top, 0.8)); }
    if (o.trim) { R(ctx, x0, torsoTop, d.torsoW, 1, o.trim); R(ctx, x0, torsoTop + d.body - 2, d.torsoW, 1, o.trim); }
    if (o.collar) { R(ctx, x0 + Math.floor(d.torsoW / 2) - 2, torsoTop, 4, 2, o.collar); }
    if (o.tie) { R(ctx, x0 + Math.floor(d.torsoW / 2) - 1, torsoTop + 1, 2, Math.min(7, d.body - 3), o.tie); }
    if (o.number && st !== 'baby') {
      var num = String(look.number || 7);
      drawDigits(ctx, x0 + Math.floor(d.torsoW / 2) - (num.length * 4 - 1) / 2, torsoTop + 4, num, o.trim || PAL.red);
    }
    if (o.overalls) { R(ctx, x0 + 2, torsoTop + 4, d.torsoW - 4, d.body - 4, o.pants); R(ctx, x0 + 2, torsoTop, 2, 4, o.pants); R(ctx, x0 + d.torsoW - 4, torsoTop, 2, 4, o.pants); }
    if (o.vest) { R(ctx, x0, torsoTop + 2, d.torsoW, 3, o.vest); R(ctx, x0, torsoTop + d.body - 6, d.torsoW, 2, o.vest); }
    if (o.camo) { R(ctx, x0 + 2, torsoTop + 3, 3, 2, o.camo); R(ctx, x0 + d.torsoW - 5, torsoTop + 8, 3, 3, o.camo); R(ctx, x0 + 5, torsoTop + 11, 2, 2, o.camo); }
    if (o.badge) R(ctx, x0 + 2, torsoTop + 3, 2, 2, o.badge);
    if (o.stripe) { R(ctx, x0, torsoTop + 6, d.torsoW, 1, o.stripe); R(ctx, x0, torsoTop + d.body - 4, d.torsoW, 1, o.stripe); }
    if (o.stripes) for (var sy = torsoTop + 2; sy < torsoTop + d.body - 1; sy += 3) R(ctx, x0, sy, d.torsoW, 1, o.stripes);
    if (o.apronC) R(ctx, x0 + 2, torsoTop + 3, d.torsoW - 4, d.body - 2, o.apronC);
    if (o.sparkle && Math.floor(t / 300) % 3 === 0) { R(ctx, x0 + 3, torsoTop + 4, 1, 1, PAL.gold); R(ctx, x0 + d.torsoW - 4, torsoTop + 9, 1, 1, PAL.white); }
    if (o.hood) R(ctx, x0 + 2, torsoTop - 1, d.torsoW - 4, 2, shade(o.top, 0.8));
    // neck + head
    var hw = d.head, hh = st === 'baby' ? 11 : 12;
    var hx = cx - Math.floor(hw / 2), hy = torsoTop - hh - 1 + (st === 'baby' ? 2 : 0);
    R(ctx, cx - 2, torsoTop - 2, 4, 2, skinD);
    B(ctx, hx, hy, hw, hh, skin);
    // ears
    R(ctx, hx - 1, hy + 5, 1, 3, skinD); R(ctx, hx + hw, hy + 5, 1, 3, skinD);
    // eyes (blink)
    var blink = (t % 3800) < 140;
    var ey = hy + 6;
    if (blink) { R(ctx, hx + 3, ey + 1, 2, 1, PAL.ink); R(ctx, hx + hw - 5, ey + 1, 2, 1, PAL.ink); }
    else { R(ctx, hx + 3, ey, 2, 2, PAL.ink); R(ctx, hx + hw - 5, ey, 2, 2, PAL.ink); R(ctx, hx + 3, ey, 1, 1, PAL.white); R(ctx, hx + hw - 5, ey, 1, 1, PAL.white); }
    // brows for adults
    if (st === 'adult' || st === 'old' || st === 'teen') { R(ctx, hx + 2, ey - 2, 3, 1, shade(hairC, 0.9)); R(ctx, hx + hw - 5, ey - 2, 3, 1, shade(hairC, 0.9)); }
    // mouth by mood
    var my = hy + hh - 3;
    if (look.mood === 'sad') { R(ctx, cx - 2, my + 1, 4, 1, PAL.red2); R(ctx, cx - 3, my + 2, 1, 1, PAL.red2); R(ctx, cx + 2, my + 2, 1, 1, PAL.red2); }
    else if (look.mood === 'celebrate') { R(ctx, cx - 2, my, 4, 2, PAL.red2); R(ctx, cx - 1, my, 2, 1, PAL.white); }
    else { R(ctx, cx - 2, my, 4, 1, PAL.red2); R(ctx, cx - 3, my - 1, 1, 1, PAL.red2); R(ctx, cx + 2, my - 1, 1, 1, PAL.red2); }
    // cheeks
    if (st === 'baby' || st === 'kid') { R(ctx, hx + 1, ey + 3, 2, 1, '#f49a9a'); R(ctx, hx + hw - 3, ey + 3, 2, 1, '#f49a9a'); }
    // wrinkles / beard
    if (st === 'old') { R(ctx, hx + 2, ey + 3, 2, 1, skinD); R(ctx, hx + hw - 4, ey + 3, 2, 1, skinD); R(ctx, hx + 4, hy + 2, 4, 1, skinD); }
    if (look.sick) { ctx.globalAlpha = 0.25; R(ctx, hx, hy, hw, hh, '#7ee081'); ctx.globalAlpha = 1; }
    // hair
    if (!o.bald && !o.helmet) drawHair(ctx, hx, hy, hw, hh, st, look.hair || 0, hairC, look.gender);
    if (o.goggles) { R(ctx, hx + 2, ey - 1, hw - 4, 1, PAL.slate); B(ctx, hx + 2, ey - 1, 3, 3, '#9fd0ff'); B(ctx, hx + hw - 5, ey - 1, 3, 3, '#9fd0ff'); }
    // hats
    drawHat(ctx, o.hat, hx, hy, hw);
    if (o.helmet) { ctx.globalAlpha = 0.5; R(ctx, hx - 3, hy - 3, hw + 6, hh + 5, '#bfe3ff'); ctx.globalAlpha = 1; R(ctx, hx - 3, hy - 3, hw + 6, 1, PAL.white); R(ctx, hx - 3, hy + hh + 1, hw + 6, 2, PAL.mist); }
    if (st === 'baby') { R(ctx, cx - 1, my + 1, 3, 2, '#7dd3fc'); }
  };

  function drawHair(ctx, hx, hy, hw, hh, st, style, c, gender) {
    var dk = shade(c, 0.75);
    if (st === 'baby') { R(ctx, hx + 4, hy - 1, 4, 2, c); R(ctx, hx + 6, hy - 2, 2, 1, c); return; }
    if (st === 'old' && style % 2 === 1) { R(ctx, hx, hy + 2, 2, 4, c); R(ctx, hx + hw - 2, hy + 2, 2, 4, c); return; } // balding
    R(ctx, hx - 1, hy - 1, hw + 2, 4, c); // base cap
    R(ctx, hx - 1, hy + 2, 2, 3, c); R(ctx, hx + hw - 1, hy + 2, 2, 3, c);
    switch (gender === 'f' ? (style % 2) + 5 : style % 5) {
      case 0: // short neat with side part
        R(ctx, hx + 2, hy + 2, 5, 1, c); R(ctx, hx + 7, hy - 1, 1, 1, dk); break;
      case 1: // spiky gel (signature)
        R(ctx, hx + 1, hy - 3, 2, 2, c); R(ctx, hx + 4, hy - 4, 2, 3, c); R(ctx, hx + 7, hy - 3, 2, 2, c); R(ctx, hx + 9, hy - 2, 2, 1, c); R(ctx, hx + 2, hy + 2, hw - 4, 1, c); break;
      case 2: // curtains / fringe
        R(ctx, hx, hy + 2, hw, 2, c); R(ctx, hx + 5, hy + 2, 2, 1, PAL.ink === c ? dk : dk); R(ctx, hx - 1, hy + 4, 2, 4, c); R(ctx, hx + hw - 1, hy + 4, 2, 4, c); break;
      case 3: // buzz cut
        R(ctx, hx - 1, hy - 1, hw + 2, 2, dk); break;
      case 4: // curly top
        for (var i = 0; i < hw; i += 3) R(ctx, hx + i - 1, hy - 3, 3, 3, c);
        break;
      case 5: // long hair (f)
        R(ctx, hx - 2, hy + 2, 3, hh + 3, c); R(ctx, hx + hw - 1, hy + 2, 3, hh + 3, c); R(ctx, hx + 1, hy + 2, hw - 6, 2, c); break;
      case 6: // ponytail (f)
        R(ctx, hx + 1, hy + 2, hw - 2, 1, c); R(ctx, hx + hw + 1, hy + 1, 3, 7, c); R(ctx, hx + hw, hy + 1, 2, 2, PAL.red); break;
    }
  }

  function drawHat(ctx, hat, hx, hy, hw) {
    if (!hat) return;
    switch (hat) {
      case 'chef': B(ctx, hx, hy - 6, hw, 6, PAL.white); B(ctx, hx - 1, hy - 1, hw + 2, 2, PAL.white); break;
      case 'straw': B(ctx, hx - 4, hy, hw + 8, 1, '#e5c06b'); B(ctx, hx + 1, hy - 4, hw - 2, 4, '#e5c06b'); R(ctx, hx + 1, hy - 1, hw - 2, 1, PAL.red2); break;
      case 'helmet': B(ctx, hx - 1, hy - 3, hw + 2, 4, '#facc15'); R(ctx, hx - 2, hy, hw + 4, 1, '#ca8a04'); break;
      case 'beret': B(ctx, hx - 1, hy - 2, hw + 1, 3, PAL.red2); break;
      case 'cap': B(ctx, hx - 1, hy - 3, hw + 2, 4, PAL.blue2); R(ctx, hx + hw - 2, hy, 4, 1, PAL.ink); R(ctx, hx + 5, hy - 2, 2, 2, PAL.gold); break;
      case 'fire': B(ctx, hx - 2, hy - 3, hw + 4, 4, '#facc15'); R(ctx, hx - 3, hy, hw + 6, 1, '#ca8a04'); break;
      case 'pilot': B(ctx, hx - 1, hy - 3, hw + 2, 3, PAL.ink); R(ctx, hx + 4, hy - 2, 4, 1, PAL.gold); break;
    }
  }

  // tiny 3x5 digits
  var DIG = { 0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001111001111', 4: '101101111001001', 5: '111100111001111', 6: '111100111101111', 7: '111001001001001', 8: '111101111101111', 9: '111101111001111' };
  function drawDigits(ctx, x, y, str, c) {
    for (var k = 0; k < str.length; k++) {
      var g = DIG[str[k]]; if (!g) continue;
      for (var i = 0; i < 15; i++) if (g[i] === '1') R(ctx, x + k * 4 + (i % 3), y + Math.floor(i / 3), 1, 1, c);
    }
  }
  P.drawDigits = drawDigits;

  // ---------------------------------------------------------------- scenes
  function sky(ctx, top, bot, h) {
    for (var y = 0; y < h; y++) { var f = y / h; R(ctx, 0, y, P.W, 1, f < 0.5 ? top : bot); }
  }
  function clouds(ctx, t, y) {
    for (var i = 0; i < 3; i++) {
      var x = ((i * 67 + t / 120) % (P.W + 40)) - 30;
      R(ctx, x, y + i * 7, 18, 3, '#e8f1ff'); R(ctx, x + 4, y + i * 7 - 2, 9, 2, '#e8f1ff');
    }
  }
  function bunting(ctx, flag, y) {
    for (var x = 4; x < P.W; x += 10) { R(ctx, x, y + (x % 20 ? 0 : 1), 5, 3, flag[(x / 10) % 3 | 0]); R(ctx, x + 1, y + 3 + (x % 20 ? 0 : 1), 3, 1, flag[(x / 10) % 3 | 0]); }
    R(ctx, 0, y, P.W, 1, PAL.slate);
  }

  var SCENES = {
    home: function (ctx, t, c) {
      R(ctx, 0, 0, P.W, P.H, '#2a3355');
      for (var y = 0; y < 70; y += 6) R(ctx, 0, y, P.W, 1, '#323c63');
      // window with sky + sea
      B(ctx, 104, 12, 44, 30, '#5aa9ff'); R(ctx, 104, 32, 44, 10, '#2563eb'); R(ctx, 104, 31, 44, 1, '#9fd0ff');
      R(ctx, 125, 12, 2, 30, PAL.cream); R(ctx, 104, 26, 44, 2, PAL.cream);
      R(ctx, 110 + (t / 300 % 30), 18, 6, 2, '#e8f1ff');
      // shelf + tv
      B(ctx, 10, 30, 30, 20, '#1f2937'); R(ctx, 12, 32, 26, 14, (Math.floor(t / 400) % 2) ? '#22b35e' : '#1a9150'); R(ctx, 24, 38, 2, 2, PAL.white);
      // floor
      R(ctx, 0, 70, P.W, 26, '#6b4a33'); for (var x = 0; x < P.W; x += 16) R(ctx, x, 70, 1, 26, '#5a3c28');
      // sofa
      B(ctx, 112, 54, 40, 14, '#8b2e3e'); R(ctx, 112, 54, 40, 4, '#a3394b');
      // ball on floor
      B(ctx, 22, 80, 6, 6, PAL.white); R(ctx, 24, 82, 2, 2, PAL.ink);
      bunting(ctx, c.flag, 4);
    },
    school: function (ctx, t, c) {
      R(ctx, 0, 0, P.W, P.H, '#2b3a5c');
      B(ctx, 20, 10, 120, 40, '#1f5135'); R(ctx, 20, 49, 120, 2, '#8b6b46');
      // chalk scribbles
      R(ctx, 30, 18, 30, 1, '#dfe7d8'); R(ctx, 30, 24, 46, 1, '#dfe7d8'); R(ctx, 30, 30, 22, 1, '#dfe7d8');
      R(ctx, 92, 16, 10, 10, '#dfe7d8'); R(ctx, 93, 17, 8, 8, '#1f5135'); R(ctx, 96, 20, 2, 2, '#dfe7d8');
      R(ctx, 0, 70, P.W, 26, '#7a6a55');
      for (var i = 0; i < 4; i++) { B(ctx, 8 + i * 40, 66, 24, 4, '#a07a52'); R(ctx, 10 + i * 40, 70, 2, 10, '#5a3c28'); R(ctx, 28 + i * 40, 70, 2, 10, '#5a3c28'); }
      R(ctx, 140, 4, 12, 12, PAL.white); R(ctx, 145, 6, 1, 5, PAL.ink); R(ctx, 145, 10, 4, 1, PAL.ink);
    },
    pitch: function (ctx, t, c) {
      sky(ctx, '#4f9dff', '#86c3ff', 40); clouds(ctx, t, 6);
      // trees / fence
      for (var x = 0; x < P.W; x += 12) { R(ctx, x, 30, 12, 10, '#166534'); R(ctx, x + 3, 27, 6, 4, '#15803d'); }
      R(ctx, 0, 38, P.W, 2, '#d4d4d8');
      for (var y = 40; y < P.H; y += 8) R(ctx, 0, y, P.W, 8, ((y / 8) | 0) % 2 ? PAL.grass : PAL.grass2);
      R(ctx, 0, 52, P.W, 1, PAL.white); R(ctx, 79, 52, 1, 44, PAL.white);
      // goal
      R(ctx, 8, 30, 2, 22, PAL.white); R(ctx, 8, 30, 22, 2, PAL.white); R(ctx, 28, 30, 2, 22, PAL.white);
      for (var gx = 10; gx < 28; gx += 3) R(ctx, gx, 32, 1, 20, 'rgba(255,255,255,0.35)');
      // cones
      R(ctx, 120, 84, 4, 4, PAL.orange); R(ctx, 140, 84, 4, 4, PAL.orange);
      bunting(ctx, c.flag, 2);
    },
    stadium: function (ctx, t, c) {
      R(ctx, 0, 0, P.W, 46, '#0b1530');
      // floodlights
      for (var k = 0; k < 2; k++) { var lx = k ? 140 : 14; R(ctx, lx, 2, 10, 5, '#fff7c2'); R(ctx, lx + 4, 7, 2, 20, PAL.grey2); ctx.globalAlpha = 0.12; R(ctx, lx - 10, 7, 30, 40, '#fff7c2'); ctx.globalAlpha = 1; }
      // crowd
      for (var y = 14; y < 44; y += 3) for (var x = 0; x < P.W; x += 3) {
        var h = hash(x * 131 + y * 7);
        var col = h < 0.3 ? c.flag[0] : h < 0.55 ? c.flag[1] : h < 0.75 ? c.flag[2] : '#2d3a66';
        var jump = (Math.floor(t / 250) + x + y) % 7 === 0 ? -1 : 0;
        R(ctx, x, y + jump, 2, 2, col);
      }
      R(ctx, 0, 44, P.W, 3, '#1f2a4d');
      for (var yy = 47; yy < P.H; yy += 7) R(ctx, 0, yy, P.W, 7, ((yy / 7) | 0) % 2 ? PAL.grass : PAL.grass2);
      R(ctx, 0, 60, P.W, 1, PAL.white);
      // ad boards
      for (var a = 0; a < P.W; a += 32) { R(ctx, a, 44, 30, 3, (Math.floor(t / 900) + a / 32) % 2 ? PAL.gold : '#e8384f'); }
    },
    hospital: function (ctx, t, c) {
      R(ctx, 0, 0, P.W, P.H, '#d9e6f2'); R(ctx, 0, 66, P.W, 30, '#a9bccf');
      for (var x = 0; x < P.W; x += 20) R(ctx, x, 66, 1, 30, '#97abc0');
      B(ctx, 16, 12, 18, 18, PAL.white); R(ctx, 23, 15, 4, 12, PAL.red); R(ctx, 19, 19, 12, 4, PAL.red);
      // bed
      B(ctx, 100, 54, 50, 10, PAL.white); R(ctx, 100, 64, 3, 12, PAL.grey2); R(ctx, 147, 64, 3, 12, PAL.grey2); B(ctx, 102, 50, 12, 5, '#bfdbfe');
      // heart monitor
      B(ctx, 120, 14, 30, 18, '#0b1020');
      var px = Math.floor(t / 60) % 30;
      for (var i = 0; i < 30; i++) { var yv = (i === px || i === px - 1) ? 18 : (i === px - 2 ? 26 : 23); R(ctx, 120 + i, 14 + (yv - 14), 1, 1, '#22c55e'); }
    },
    office: function (ctx, t, c) {
      R(ctx, 0, 0, P.W, P.H, '#1c2541');
      for (var x = 8; x < P.W; x += 26) for (var y = 6; y < 44; y += 12) { R(ctx, x, y, 20, 9, (hash(x + y) > 0.4) ? '#fbbf24' : '#334155'); }
      R(ctx, 0, 48, P.W, 2, '#475569'); R(ctx, 0, 70, P.W, 26, '#334155');
      B(ctx, 100, 58, 50, 6, '#8b6b46'); B(ctx, 110, 46, 20, 12, '#0f172a'); R(ctx, 112, 48, 16, 8, (Math.floor(t / 500) % 2) ? '#38bdf8' : '#0ea5e9');
      B(ctx, 14, 52, 8, 18, '#166534'); R(ctx, 16, 48, 4, 4, '#22c55e');
    },
    farm: function (ctx, t, c) {
      sky(ctx, '#62b0ff', '#a6d6ff', 44); clouds(ctx, t, 8);
      R(ctx, 128, 6, 12, 12, PAL.gold);
      R(ctx, 0, 40, P.W, 56, '#4d7c0f');
      for (var y = 46; y < P.H; y += 7) { R(ctx, 0, y, P.W, 2, '#3f6212'); for (var x = (y % 14); x < P.W; x += 10) R(ctx, x, y - 3, 2, 3, '#84cc16'); }
      B(ctx, 12, 24, 26, 18, '#b91c1c'); R(ctx, 10, 20, 30, 5, '#7f1d1d'); R(ctx, 21, 32, 8, 10, '#451a03');
    },
    prison: function (ctx, t, c) {
      R(ctx, 0, 0, P.W, P.H, '#3f4454');
      for (var y = 0; y < 70; y += 8) for (var x = (y % 16) ? 0 : 10; x < P.W; x += 20) R(ctx, x, y, 19, 7, '#4a5063');
      B(ctx, 110, 12, 24, 16, '#1e293b'); R(ctx, 110, 12, 24, 16, '#5aa9ff'); for (var b = 112; b < 134; b += 4) R(ctx, b, 12, 1, 16, PAL.grey2);
      R(ctx, 0, 70, P.W, 26, '#2b2f3a');
      for (var k = 0; k < P.W; k += 9) R(ctx, k, 0, 2, P.H, 'rgba(20,22,30,0.55)');
    },
    grave: function (ctx, t, c) {
      R(ctx, 0, 0, P.W, P.H, '#0b1020');
      for (var i = 0; i < 40; i++) { var h = hash(i * 977); if ((Math.floor(t / 400) + i) % 9) R(ctx, h * P.W, hash(i * 13) * 50, 1, 1, PAL.white); }
      R(ctx, 120, 10, 10, 10, '#e5e7eb'); R(ctx, 123, 10, 7, 7, '#0b1020');
      R(ctx, 0, 72, P.W, 24, '#14532d'); for (var x = 0; x < P.W; x += 5) R(ctx, x, 70 + (x % 3), 2, 2, '#166534');
      B(ctx, 66, 40, 28, 32, PAL.grey); R(ctx, 66, 38, 28, 4, PAL.grey); R(ctx, 70, 36, 20, 2, PAL.grey);
      R(ctx, 79, 46, 2, 12, PAL.grey2); R(ctx, 75, 50, 10, 2, PAL.grey2);
      R(ctx, 60, 70, 8, 3, PAL.red); R(ctx, 92, 70, 8, 3, PAL.gold);
    }
  };
  P.SCENES = SCENES;

  P.drawScene = function (ctx, name, t, country) {
    (SCENES[name] || SCENES.home)(ctx, t || 0, country || { flag: ['#fff', '#e8384f', '#3b82f6'] });
  };

  // Whole portrait: scene + hero
  P.drawPortrait = function (canvas, look, scene, country, t) {
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    P.drawScene(ctx, scene, t, country);
    if (scene !== 'grave') P.drawHero(ctx, 80, 88, Object.assign({ t: t }, look));
  };

  // ---------------------------------------------------------------- flags (simplified, drawn from rects) 24x16
  P.drawFlag = function (ctx, id, x, y, s) {
    s = s || 1;
    function r(a, b, w, h, c) { R(ctx, x + a * s, y + b * s, w * s, h * s, c); }
    switch (id) {
      case 'kr': r(0, 0, 24, 16, '#fff'); r(9, 5, 6, 3, '#c60c30'); r(9, 8, 6, 3, '#003478'); r(2, 2, 4, 1, '#111'); r(18, 2, 4, 1, '#111'); r(2, 13, 4, 1, '#111'); r(18, 13, 4, 1, '#111'); break;
      case 'jp': r(0, 0, 24, 16, '#fff'); r(9, 5, 6, 6, '#bc002d'); r(8, 6, 8, 4, '#bc002d'); break;
      case 'cn': r(0, 0, 24, 16, '#de2910'); r(3, 3, 3, 3, '#ffde00'); r(7, 1, 1, 1, '#ffde00'); r(8, 3, 1, 1, '#ffde00'); r(8, 5, 1, 1, '#ffde00'); r(7, 7, 1, 1, '#ffde00'); break;
      case 'us': for (var i = 0; i < 8; i++) r(0, i * 2, 24, 1, '#b22234'), r(0, i * 2 + 1, 24, 1, '#fff'); r(0, 0, 10, 8, '#3c3b6e'); r(2, 2, 1, 1, '#fff'); r(5, 2, 1, 1, '#fff'); r(8, 2, 1, 1, '#fff'); r(3, 5, 1, 1, '#fff'); r(6, 5, 1, 1, '#fff'); break;
      case 'br': r(0, 0, 24, 16, '#009c3b'); r(6, 4, 12, 8, '#ffdf00'); r(4, 6, 16, 4, '#ffdf00'); r(9, 2, 6, 12, '#ffdf00'); r(9, 5, 6, 6, '#002776'); r(9, 7, 6, 1, '#fff'); break;
      case 'ar': r(0, 0, 24, 16, '#fff'); r(0, 0, 24, 5, '#74acdf'); r(0, 11, 24, 5, '#74acdf'); r(11, 7, 2, 2, '#f6b40e'); r(10, 6, 4, 1, '#f6b40e'); break;
      case 'za': {
        // Drawn per pixel from the flag's geometry: a green Y (white-edged outside, gold-edged inside)
        // whose arms start at the hoist corners and join a horizontal band; black triangle at the hoist.
        var X0 = 12, k = 8 / X0;
        for (var py = 0; py < 16; py++) for (var px = 0; px < 24; px++) {
          var cx = px + 0.5, dy = Math.abs(py + 0.5 - 8), dist, inFork = false;
          if (cx >= X0) dist = dy;
          else { var armY = k * (X0 - cx); dist = Math.abs(dy - armY) / Math.sqrt(1 + k * k); inFork = dy < armY; }
          var col;
          if (dist < 1.6) col = '#007749';
          else if (dist < 2.6) col = inFork ? '#ffb81c' : '#ffffff';
          else if (inFork) col = '#000000';
          else col = py < 8 ? '#e03c31' : '#001489';
          r(px, py, 1, 1, col);
        }
        break;
      }
      case 'in': r(0, 0, 24, 5, '#ff9933'); r(0, 5, 24, 6, '#fff'); r(0, 11, 24, 5, '#138808'); r(10, 6, 4, 4, '#000080'); r(11, 7, 2, 2, '#fff'); break;
      default: r(0, 0, 24, 16, '#888');
    }
  };

  // ---------------------------------------------------------------- trophies 16x16
  P.drawTrophy = function (ctx, kind, x, y, s) {
    s = s || 1;
    function r(a, b, w, h, c) { R(ctx, x + a * s, y + b * s, w * s, h * s, c); }
    if (kind === 'ballon') {
      r(4, 2, 8, 8, PAL.gold2); r(5, 1, 6, 10, PAL.gold2); r(3, 3, 10, 6, PAL.gold2);
      r(5, 2, 6, 8, PAL.gold); r(4, 4, 8, 4, PAL.gold); r(6, 3, 2, 2, '#fff6c8');
      r(6, 11, 4, 2, PAL.gold2); r(4, 13, 8, 2, '#7c5e10');
    } else if (kind === 'worldcup') {
      r(6, 1, 4, 3, PAL.gold); r(5, 4, 6, 3, PAL.gold); r(6, 7, 4, 4, PAL.gold2); r(7, 2, 2, 8, '#ffe066');
      r(4, 11, 8, 2, '#15803d'); r(4, 13, 8, 2, PAL.gold2);
    } else {
      r(3, 1, 10, 6, PAL.gold); r(1, 2, 2, 4, PAL.gold2); r(13, 2, 2, 4, PAL.gold2); r(5, 7, 6, 2, PAL.gold2); r(7, 9, 2, 3, PAL.gold2);
      r(4, 12, 8, 3, '#7c5e10'); r(5, 2, 2, 3, '#fff6c8');
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
