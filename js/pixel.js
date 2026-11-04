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
  // route scenes (docs/DESIGN.md §2f): one place per route family, each with a little looping motion
  function spot(ctx, x, w, col, a) { ctx.globalAlpha = a; for (var y = 0; y < 70; y += 2) R(ctx, x - (y * w / 140), y, 2 + (y * w / 70), 2, col); ctx.globalAlpha = 1; }
  function crowdRow(ctx, t, y, cols) { for (var x = 0; x < P.W; x += 4) { var up = (Math.floor(t / 300) + x) % 5 === 0 ? -1 : 0; R(ctx, x, y + up, 3, 3, cols[(x / 4) % cols.length | 0]); } }
  Object.assign(SCENES, {
    court: function (ctx, t, c) { // courtroom: bench, scales, gallery
      R(ctx, 0, 0, P.W, P.H, '#3b2a20'); for (var x = 0; x < P.W; x += 14) R(ctx, x, 0, 2, 66, '#33241b');
      B(ctx, 50, 22, 60, 20, '#5c3b24'); R(ctx, 50, 22, 60, 3, '#7a4f31'); B(ctx, 72, 8, 16, 14, '#1e1b16');
      R(ctx, 79, 10, 2, 10, PAL.gold); R(ctx, 73, 12, 14, 1, PAL.gold);
      var tilt = Math.round(Math.sin(t / 700)); R(ctx, 73, 13 + tilt, 4, 2, PAL.gold); R(ctx, 83, 13 - tilt, 4, 2, PAL.gold);
      R(ctx, 0, 66, P.W, 30, '#6b4a33'); B(ctx, 6, 56, 30, 10, '#5c3b24'); B(ctx, 124, 56, 30, 10, '#5c3b24');
      if (Math.floor(t / 900) % 4 === 0) R(ctx, 96, 18, 6, 3, '#a07a52'); // gavel up
      else R(ctx, 96, 20, 6, 2, '#a07a52');
    },
    surgery: function (ctx, t, c) { // operating room: lamp, monitor, green drapes
      R(ctx, 0, 0, P.W, P.H, '#1f3b3a'); R(ctx, 0, 66, P.W, 30, '#2f5755');
      B(ctx, 60, 4, 40, 8, '#cbd5e1'); ctx.globalAlpha = 0.18; R(ctx, 52, 12, 56, 50, '#fffbe6'); ctx.globalAlpha = 1;
      B(ctx, 40, 52, 80, 8, '#14b8a6'); R(ctx, 40, 52, 80, 2, '#5eead4');
      B(ctx, 126, 18, 28, 18, '#0b1020'); var px = Math.floor(t / 60) % 28;
      for (var i = 0; i < 28; i++) R(ctx, 126 + i, (i === px ? 22 : i === px - 1 ? 30 : 27), 1, 1, '#22c55e');
      R(ctx, 10, 40, 14, 2, '#94a3b8'); R(ctx, 12, 42, 2, 24, '#94a3b8'); R(ctx, 8, 36, 4, 4, '#e5e7eb'); R(ctx, 16, 36, 4, 4, '#e5e7eb');
    },
    stage: function (ctx, t, c) { // concert stage: moving spotlights, crowd silhouettes
      R(ctx, 0, 0, P.W, P.H, '#0a0a1a');
      var sw = Math.sin(t / 600) * 20;
      spot(ctx, 40 + sw, 30, '#f472b6', 0.22); spot(ctx, 120 - sw, 30, '#60a5fa', 0.22);
      for (var x = 0; x < P.W; x += 10) R(ctx, x + 3, 2, 4, 3, ((Math.floor(t / 200) + x / 10) % 3) ? '#facc15' : '#f97316');
      R(ctx, 0, 64, P.W, 6, '#1e1b4b'); R(ctx, 0, 63, P.W, 1, '#6366f1');
      B(ctx, 20, 50, 10, 14, '#111827'); B(ctx, 130, 50, 10, 14, '#111827'); // speakers
      crowdRow(ctx, t, 78, ['#111', '#1f2937', '#312e81']); crowdRow(ctx, t + 150, 86, ['#0b0b16', '#1e1b4b']);
      if (Math.floor(t / 250) % 2) for (var k = 0; k < 6; k++) R(ctx, 10 + k * 28, 74, 1, 3, '#fef08a'); // phone lights
    },
    studio: function (ctx, t, c) { // film set: camera, clapper, boom mic
      R(ctx, 0, 0, P.W, P.H, '#1f2433'); R(ctx, 0, 66, P.W, 30, '#2a2f40');
      B(ctx, 112, 40, 24, 14, '#111827'); R(ctx, 104, 44, 8, 6, '#374151'); R(ctx, 122, 54, 2, 14, '#6b7280'); R(ctx, 116, 66, 14, 2, '#6b7280');
      if (Math.floor(t / 500) % 2) R(ctx, 130, 42, 3, 3, '#ef4444'); // REC
      R(ctx, 20, 6, 80, 2, '#6b7280'); B(ctx, 92, 8, 8, 6, '#374151');
      var shut = Math.floor(t / 1200) % 3 === 0;
      B(ctx, 14, 60, 18, 12, '#111'); R(ctx, 14, shut ? 58 : 54, 18, 3, '#e5e7eb'); for (var x = 15; x < 32; x += 4) R(ctx, x, shut ? 58 : 54, 2, 3, '#111');
      ctx.globalAlpha = 0.12; R(ctx, 50, 10, 60, 56, '#fde68a'); ctx.globalAlpha = 1;
    },
    runway: function (ctx, t, c) { // fashion runway: long catwalk, camera flashes
      R(ctx, 0, 0, P.W, P.H, '#0f0f14');
      for (var y = 40; y < P.H; y++) { var w = 20 + (y - 40) * 1.2; R(ctx, 80 - w / 2, y, w, 1, y % 4 ? '#e5e7eb' : '#d1d5db'); }
      R(ctx, 60, 6, 40, 30, '#1f1f2b'); R(ctx, 62, 8, 36, 2, '#fbbf24');
      for (var k = 0; k < 8; k++) { var fx = k < 4 ? 6 + k * 9 : 120 + (k - 4) * 9; R(ctx, fx, 60 + (k % 2) * 8, 5, 5, '#1f2937'); if ((Math.floor(t / 180) + k * 3) % 11 === 0) { ctx.globalAlpha = 0.8; R(ctx, fx - 2, 57 + (k % 2) * 8, 9, 9, '#fff'); ctx.globalAlpha = 1; } }
    },
    kitchen: function (ctx, t, c) { // restaurant kitchen: range, pans, steam
      R(ctx, 0, 0, P.W, P.H, '#e2e8f0'); for (var x = 0; x < P.W; x += 8) for (var y = 0; y < 50; y += 8) R(ctx, x, y, 7, 7, '#f1f5f9');
      B(ctx, 0, 50, P.W, 20, '#9ca3af'); R(ctx, 0, 50, P.W, 2, '#d1d5db'); R(ctx, 0, 70, P.W, 26, '#475569');
      for (var i = 0; i < 3; i++) { B(ctx, 100 + i * 18, 44, 14, 6, '#1f2937'); R(ctx, 112 + i * 18, 46, 6, 1, '#1f2937');
        ctx.globalAlpha = 0.5; R(ctx, 104 + i * 18 + Math.round(Math.sin(t / 300 + i) * 2), 34 - (t / 80 + i * 7) % 12, 4, 4, '#fff'); ctx.globalAlpha = 1;
        if ((Math.floor(t / 150) + i) % 4 === 0) R(ctx, 104 + i * 18, 50, 6, 2, '#f97316'); }
      for (var h = 0; h < 4; h++) R(ctx, 14 + h * 12, 12, 2, 12, '#64748b');
      R(ctx, 10, 10, 50, 2, '#64748b');
    },
    ring: function (ctx, t, c) { // boxing/MMA ring under lights
      R(ctx, 0, 0, P.W, P.H, '#0b0b12'); ctx.globalAlpha = 0.2; R(ctx, 20, 0, 120, 70, '#fffbe6'); ctx.globalAlpha = 1;
      crowdRow(ctx, t, 30, ['#1f2937', '#111827', '#374151']);
      B(ctx, 10, 60, 140, 10, '#1d4ed8'); R(ctx, 10, 60, 140, 2, '#60a5fa');
      R(ctx, 12, 36, 3, 26, '#e5e7eb'); R(ctx, 145, 36, 3, 26, '#e5e7eb');
      for (var r = 0; r < 3; r++) R(ctx, 14, 40 + r * 6, 132, 1, ['#ef4444', '#f8fafc', '#3b82f6'][r]);
      R(ctx, 0, 70, P.W, 26, '#111827');
      if (Math.floor(t / 1500) % 3 === 0) { R(ctx, 76, 8, 8, 6, PAL.gold); R(ctx, 79, 14, 2, 4, PAL.gold); } // bell
    },
    hoops: function (ctx, t, c) { // basketball arena: wood floor, hoop, scoreboard
      R(ctx, 0, 0, P.W, 50, '#111a33'); crowdRow(ctx, t, 34, [c.flag[0], c.flag[1], c.flag[2], '#2d3a66']);
      R(ctx, 0, 50, P.W, 46, '#c58b4c'); for (var x = 0; x < P.W; x += 10) R(ctx, x, 50, 1, 46, '#b07a40');
      R(ctx, 0, 70, P.W, 1, '#fff');
      B(ctx, 128, 14, 22, 14, '#f8fafc'); R(ctx, 134, 20, 10, 6, '#ef4444'); R(ctx, 135, 28, 8, 2, '#f97316'); R(ctx, 149, 28, 2, 40, '#6b7280');
      var by = 40 + Math.abs(Math.sin(t / 250)) * -14; B(ctx, 112, by, 6, 6, '#ea580c'); // dribble
      B(ctx, 60, 4, 40, 10, '#0b1020'); drawDigits(ctx, 64, 7, String(80 + Math.floor(t / 4000) % 20), '#f59e0b'); drawDigits(ctx, 84, 7, '78', '#f59e0b');
    },
    ballpark: function (ctx, t, c) { // baseball diamond under the sky
      sky(ctx, '#4f9dff', '#86c3ff', 30); clouds(ctx, t, 4);
      crowdRow(ctx, t, 24, [c.flag[0], c.flag[1], '#e5e7eb', '#2d3a66']);
      R(ctx, 0, 32, P.W, 64, PAL.grass);
      for (var y = 46; y < P.H; y++) { var w = (y - 46) * 2.4; R(ctx, 80 - w / 2, y, w, 1, '#c2814a'); }
      for (var y2 = 56; y2 < 80; y2++) { var w2 = (y2 - 56) * 1.6; R(ctx, 80 - w2 / 2, y2, w2, 1, PAL.grass2); }
      B(ctx, 78, 54, 4, 2, '#fff'); B(ctx, 78, 88, 4, 3, '#fff');
      var k = (t / 1400) % 1; R(ctx, 80 - k * 70, 30 - Math.sin(k * Math.PI) * 24, 2, 2, '#fff'); // fly ball
    },
    gallery: function (ctx, t, c) { // art gallery / atelier: framed pictures, easel
      R(ctx, 0, 0, P.W, P.H, '#f5f5f4'); R(ctx, 0, 70, P.W, 26, '#a8a29e');
      var art = [['#ef4444', '#fbbf24'], ['#3b82f6', '#22c55e'], ['#a855f7', '#f97316']];
      for (var i = 0; i < 3; i++) { B(ctx, 12 + i * 48, 14, 34, 26, '#78350f'); R(ctx, 14 + i * 48, 16, 30, 22, art[i][0]); R(ctx, 20 + i * 48, 22, 14, 10, art[i][1]); ctx.globalAlpha = 0.15; R(ctx, 12 + i * 48, 4, 34, 10, '#fde68a'); ctx.globalAlpha = 1; }
      R(ctx, 126, 50, 2, 20, '#78350f'); B(ctx, 118, 46, 18, 14, '#fff'); R(ctx, 120, 48, Math.floor(t / 300) % 14, 2, '#3b82f6');
    },
    casino: function (ctx, t, c) { // casino floor: slot machines blinking, green table
      R(ctx, 0, 0, P.W, P.H, '#1a0b1f'); for (var x = 0; x < P.W; x += 6) R(ctx, x, 0, 3, 3, (Math.floor(t / 200) + x / 6) % 4 ? '#7c2d12' : '#facc15');
      for (var i = 0; i < 4; i++) { var sx = 6 + i * 22; B(ctx, sx, 20, 18, 30, '#b91c1c'); R(ctx, sx + 2, 26, 14, 8, '#fff');
        for (var r = 0; r < 3; r++) R(ctx, sx + 3 + r * 4, 28, 3, 4, ['#ef4444', '#facc15', '#22c55e', '#3b82f6'][(Math.floor(t / 120) + r + i) % 4]); R(ctx, sx + 16, 30, 2, 8, '#e5e7eb'); }
      B(ctx, 100, 50, 56, 18, '#166534'); R(ctx, 100, 50, 56, 2, '#78350f');
      for (var k = 0; k < 4; k++) B(ctx, 108 + k * 10, 56, 5, 3, ['#ef4444', '#fff', '#3b82f6', '#111'][k]);
      R(ctx, 0, 70, P.W, 26, '#3b0a24');
    },
    party: function (ctx, t, c) { // celebration: garlands and falling confetti
      R(ctx, 0, 0, P.W, P.H, '#2a3355'); R(ctx, 0, 70, P.W, 26, '#6b4a33');
      bunting(ctx, c.flag, 4); bunting(ctx, ['#f472b6', '#facc15', '#60a5fa'], 12);
      for (var i = 0; i < 30; i++) { var x = (hash(i * 31) * P.W + Math.sin(t / 400 + i) * 3) | 0, y = ((hash(i * 7) * 70 + t / 25) % 70) | 0; R(ctx, x, y, 2, 2, ['#f472b6', '#facc15', '#60a5fa', '#22c55e'][i % 4]); }
      B(ctx, 12, 58, 50, 4, '#a07a52'); R(ctx, 16, 62, 2, 8, '#5a3c28'); R(ctx, 56, 62, 2, 8, '#5a3c28'); // table
      B(ctx, 22, 44, 28, 14, '#fde68a'); R(ctx, 22, 44, 28, 3, '#f472b6'); for (var k = 0; k < 3; k++) { R(ctx, 28 + k * 8, 38, 1, 6, '#fff'); if (Math.floor(t / 200 + k) % 2) R(ctx, 28 + k * 8, 36, 1, 2, '#f97316'); }
    },
    lab: function (ctx, t, c) { // laboratory: shelves of flasks, bubbling beaker, microscope
      R(ctx, 0, 0, P.W, P.H, '#e0f2fe'); R(ctx, 0, 70, P.W, 26, '#94a3b8');
      for (var s = 0; s < 2; s++) { R(ctx, 10, 18 + s * 16, 60, 2, '#64748b'); for (var f = 0; f < 5; f++) B(ctx, 14 + f * 11, 10 + s * 16, 6, 8, ['#22c55e', '#3b82f6', '#f472b6', '#facc15', '#a855f7'][(f + s) % 5]); }
      B(ctx, 90, 56, 64, 6, '#e5e7eb'); B(ctx, 100, 42, 10, 14, '#bae6fd'); R(ctx, 102, 48, 6, 7, '#22c55e');
      for (var b = 0; b < 3; b++) { ctx.globalAlpha = 0.7; R(ctx, 103 + b * 2, 44 - ((t / 90 + b * 5) % 12), 2, 2, '#dcfce7'); ctx.globalAlpha = 1; }
      B(ctx, 128, 40, 8, 16, '#334155'); R(ctx, 124, 38, 10, 3, '#334155'); if (Math.floor(t / 700) % 2) R(ctx, 138, 44, 4, 2, '#38bdf8');
    },
    workshop: function (ctx, t, c) { // workshop: tool wall, workbench, sparks from a grinder
      R(ctx, 0, 0, P.W, P.H, '#3f3a36'); R(ctx, 0, 70, P.W, 26, '#27272a');
      B(ctx, 10, 8, 70, 34, '#78716c'); for (var i = 0; i < 6; i++) R(ctx, 16 + i * 11, 12, 3, 14 + (i % 3) * 4, ['#ef4444', '#facc15', '#9ca3af'][i % 3]);
      B(ctx, 90, 52, 64, 8, '#a16207'); R(ctx, 94, 60, 3, 10, '#713f12'); R(ctx, 147, 60, 3, 10, '#713f12');
      B(ctx, 112, 44, 14, 8, '#4b5563');
      for (var k = 0; k < 6; k++) { var a = (t / 40 + k * 13) % 14; R(ctx, 126 + a, 46 - a / 2 + (k % 3), 1, 1, a < 9 ? '#fde047' : '#f97316'); }
    },
    shop: function (ctx, t, c) { // small shop / store counter: shelves, register, door bell
      R(ctx, 0, 0, P.W, P.H, '#f1f5f9'); R(ctx, 0, 70, P.W, 26, '#cbd5e1');
      for (var y = 10; y < 50; y += 13) { R(ctx, 8, y + 9, 70, 2, '#94a3b8'); for (var x = 10; x < 76; x += 8) B(ctx, x, y + 2, 6, 7, ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b'][((x + y) / 8 | 0) % 4]); }
      B(ctx, 92, 48, 62, 22, '#0ea5e9'); R(ctx, 92, 48, 62, 3, '#38bdf8'); B(ctx, 128, 38, 18, 10, '#1f2937'); R(ctx, 131, 40, 12, 4, '#22c55e');
      var sw = Math.round(Math.sin(t / 250) * 1.5); R(ctx, 104 + sw, 8, 4, 5, PAL.gold); R(ctx, 105, 4, 2, 4, '#64748b');
    },
    temple: function (ctx, t, c) { // place of worship: candles, quiet hall, soft light
      R(ctx, 0, 0, P.W, P.H, '#2a1f3d'); ctx.globalAlpha = 0.15; R(ctx, 50, 0, 60, 70, '#fde68a'); ctx.globalAlpha = 1;
      B(ctx, 64, 12, 32, 30, '#4c1d95'); R(ctx, 74, 18, 12, 18, '#facc15'); R(ctx, 0, 70, P.W, 26, '#3b2f4a');
      for (var i = 0; i < 6; i++) { var x = 30 + i * 20; B(ctx, x, 56, 4, 10, '#f5f5f4'); R(ctx, x + 1, 52 + ((Math.floor(t / 180) + i) % 2), 2, 3, '#f97316'); }
    },
    alley: function (ctx, t, c) { // back alley at night: brick walls, flickering lamp, puddle
      R(ctx, 0, 0, P.W, P.H, '#111827');
      for (var y = 0; y < 70; y += 6) for (var x = (y % 12) ? 0 : 8; x < 50; x += 16) { R(ctx, x, y, 15, 5, '#3f1d1d'); R(ctx, 110 + x, y, 15, 5, '#3f1d1d'); }
      R(ctx, 0, 70, P.W, 26, '#1f2937'); R(ctx, 70, 80, 24, 3, '#334155');
      var on = Math.floor(t / 130) % 9 !== 0; R(ctx, 78, 6, 2, 30, '#4b5563'); B(ctx, 74, 4, 10, 4, on ? '#fde68a' : '#57534e');
      if (on) { ctx.globalAlpha = 0.12; R(ctx, 60, 8, 40, 62, '#fde68a'); ctx.globalAlpha = 1; }
    },
    road: function (ctx, t, c) { // road / depot: moving lane marks, a truck, the sky
      sky(ctx, '#4f9dff', '#86c3ff', 40); clouds(ctx, t, 6);
      R(ctx, 0, 40, P.W, 10, '#4d7c0f'); R(ctx, 0, 50, P.W, 46, '#374151');
      for (var x = -20; x < P.W; x += 24) R(ctx, x + (t / 20) % 24, 72, 12, 2, '#facc15');
      B(ctx, 20, 52, 40, 16, '#e5e7eb'); B(ctx, 60, 56, 16, 12, '#2563eb'); R(ctx, 66, 58, 8, 4, '#93c5fd');
      B(ctx, 26, 66, 8, 6, '#111'); B(ctx, 64, 66, 8, 6, '#111');
    },
    barracks: function (ctx, t, c) { // military base: flag pole, tents, marching drill
      sky(ctx, '#64748b', '#94a3b8', 40); R(ctx, 0, 40, P.W, 56, '#4d5d3a');
      R(ctx, 20, 6, 2, 40, '#d4d4d8'); var wave = Math.floor(t / 300) % 2; B(ctx, 22, 6 + wave, 16, 9, c.flag[1]); R(ctx, 22, 9 + wave, 16, 3, c.flag[0]);
      for (var i = 0; i < 3; i++) { var x = 60 + i * 32; R(ctx, x, 30, 24, 2, '#3f4a2c'); for (var y = 0; y < 10; y++) R(ctx, x + 12 - y * 1.2, 30 + y, y * 2.4, 1, '#556b2f'); }
      for (var k = 0; k < 5; k++) { var mx = 50 + k * 14 + (Math.floor(t / 400) % 2); B(ctx, mx, 62 + (k % 2), 4, 10, '#3f4a2c'); R(ctx, mx, 60 + (k % 2), 4, 2, '#1f2937'); }
    },
    rain: function (ctx, t, c) { // grief / hard times: grey window, falling rain
      R(ctx, 0, 0, P.W, P.H, '#1e2433'); B(ctx, 40, 10, 80, 46, '#475569');
      for (var i = 0; i < 40; i++) { var x = 42 + (hash(i * 17) * 76) | 0, y = 10 + ((hash(i * 5) * 46 + t / 12) % 46) | 0; R(ctx, x, y, 1, 3, '#94a3b8'); }
      R(ctx, 79, 10, 2, 46, '#334155'); R(ctx, 40, 32, 80, 2, '#334155'); R(ctx, 0, 70, P.W, 26, '#2b2f3a');
      B(ctx, 20, 60, 14, 10, '#4b5563'); // empty chair
    }
  });
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


  // ---------------------------------------------------------------- milestone pictures (ages 0-4 montage)
  function heart(ctx, x, y, c) { R(ctx, x, y, 2, 1, c); R(ctx, x + 3, y, 2, 1, c); R(ctx, x - 1, y + 1, 7, 2, c); R(ctx, x, y + 3, 5, 1, c); R(ctx, x + 1, y + 4, 3, 1, c); R(ctx, x + 2, y + 5, 1, 1, c); }
  function ball(ctx, x, y, r) { B(ctx, x - r, y - r, r * 2, r * 2, PAL.white); R(ctx, x - 1, y - 1, 2, 2, PAL.ink); R(ctx, x - r + 1, y, 1, 1, PAL.ink); R(ctx, x + r - 2, y, 1, 1, PAL.ink); R(ctx, x, y - r + 1, 1, 1, PAL.ink); }
  function swaddle(ctx, x, y, skin, col) {
    B(ctx, x, y + 4, 18, 9, col || '#f4f6ff'); R(ctx, x + 1, y + 8, 16, 1, shade(col || '#f4f6ff', 0.85));
    B(ctx, x + 2, y, 10, 9, skin); R(ctx, x + 4, y + 4, 1, 1, PAL.ink); R(ctx, x + 8, y + 4, 1, 1, PAL.ink); R(ctx, x + 5, y + 6, 3, 1, PAL.red2);
    R(ctx, x + 3, y - 1, 6, 1, '#3b2416');
  }
  // the small thing a toddler grabs or names, by talent (돌잡이 / first word); k = scale
  function heldItem(ctx, what, x, y, t, k) {
    k = k || 1;
    function r(a, b, w, h, c) { R(ctx, x + a * k, y + b * k, w * k, h * k, c); }
    switch (what) {
      case 'music': r(-1, -4, 4, 4, '#374151'); r(0, 0, 2, 7, '#9ca3af'); if (Math.floor(t / 300) % 2) r(4, -6, 2, 2, PAL.gold); break;      // microphone + note
      case 'stage': r(-1, -4, 4, 4, '#ef4444'); r(0, 0, 2, 7, '#e5e7eb'); r(-4, -6, 1, 1, PAL.gold); r(5, -5, 1, 1, PAL.gold); break;     // mic + sparkles
      case 'art': r(0, -2, 2, 9, '#a16207'); r(-1, -5, 4, 3, ['#ef4444', '#3b82f6', '#22c55e'][Math.floor(t / 400) % 3]); break;        // brush
      case 'logic': r(-4, -2, 10, 6, '#8b5a2b'); for (var i = 0; i < 4; i++) r(-3 + i * 2, -1 + (i % 2), 1, 2, PAL.ink); break;         // abacus
      case 'lang': r(-3, -3, 8, 7, '#2563eb'); r(1, -3, 1, 7, '#e5e7eb'); break;                                                           // book
      case 'taste': r(-1, -1, 2, 8, '#d1d5db'); r(-2, -4, 4, 3, '#d1d5db'); break;                                                        // spoon
      default: ball(ctx, x, y, 5 * k);
    }
  }
  function confetti(ctx, t, n, cols, seed) {
    for (var i = 0; i < n; i++) { var x = hash(i * 31 + seed) * P.W, y = (hash(i * 7 + seed) * P.H + t / (40 + i % 5 * 10)) % P.H; R(ctx, x, y, 2, 2, cols[i % cols.length]); }
  }
  function floor(ctx, y, c1, c2) { R(ctx, 0, y, P.W, P.H - y, c1); for (var x = 0; x < P.W; x += 16) R(ctx, x, y, 1, P.H - y, c2); }
  function wall(ctx, c) { R(ctx, 0, 0, P.W, P.H, c); for (var y = 0; y < 70; y += 6) R(ctx, 0, y, P.W, 1, shade(c, 1.08)); }
  function table(ctx, x, y, w, c) { B(ctx, x, y, w, 4, c); R(ctx, x + 2, y + 4, 2, 10, shade(c, 0.7)); R(ctx, x + w - 4, y + 4, 2, 10, shade(c, 0.7)); }

  var MS = {
    birth: function (ctx, t, c, lk) {
      wall(ctx, '#232c4f'); floor(ctx, 72, '#5b4030', '#4a3426');
      B(ctx, 112, 10, 34, 24, '#0b1530'); R(ctx, 128, 10, 2, 24, PAL.cream); R(ctx, 112, 21, 34, 2, PAL.cream);
      if (Math.floor(t / 500) % 2) R(ctx, 120, 14, 1, 1, PAL.white); R(ctx, 138, 16, 2, 2, PAL.gold);
      P.drawHero(ctx, 40, 88, { t: t, age: 31, gender: 'f', outfit: 'apron', skin: lk.skin, hairColor: lk.hairColor, hair: 0 });
      P.drawHero(ctx, 124, 88, { t: t, age: 33, gender: 'm', outfit: 'casual', skin: lk.skin, hairColor: lk.hairColor, hair: 3, mood: 'celebrate' });
      B(ctx, 64, 60, 34, 16, '#a07a52'); R(ctx, 64, 76, 2, 10, '#5a3c28'); R(ctx, 96, 76, 2, 10, '#5a3c28');
      swaddle(ctx, 72, 50, lk.skin);
      heart(ctx, 80 + Math.round(Math.sin(t / 400) * 3), 30 - (t / 120 % 10), PAL.red);
    },
    smile: function (ctx, t, c, lk) {
      R(ctx, 0, 0, P.W, P.H, '#ffd9e0'); for (var i = 0; i < 12; i++) heart(ctx, hash(i * 9) * 150, hash(i * 3) * 88, '#ffb3c4');
      var x = 50, y = 14; B(ctx, x, y, 60, 62, lk.skin); R(ctx, x + 18, y - 3, 24, 4, '#3b2416');
      var blink = (t % 3000) < 150;
      R(ctx, x + 14, y + 22, 8, blink ? 1 : 3, PAL.ink); R(ctx, x + 38, y + 22, 8, blink ? 1 : 3, PAL.ink);
      R(ctx, x + 6, y + 32, 8, 4, '#f49a9a'); R(ctx, x + 46, y + 32, 8, 4, '#f49a9a');
      R(ctx, x + 18, y + 40, 24, 3, PAL.red2); R(ctx, x + 16, y + 37, 3, 3, PAL.red2); R(ctx, x + 41, y + 37, 3, 3, PAL.red2); R(ctx, x + 22, y + 43, 16, 4, '#d9465b');
      if (Math.floor(t / 300) % 2) { R(ctx, 120, 20, 3, 1, PAL.gold); R(ctx, 121, 19, 1, 3, PAL.gold); }
    },
    steps: function (ctx, t, c, lk) {
      wall(ctx, '#2a3355'); floor(ctx, 70, '#6b4a33', '#5a3c28');
      table(ctx, 16, 54, 36, '#a07a52');
      var x = 70 + (Math.floor(t / 300) % 4) * 6;
      P.drawHero(ctx, x, 88, { t: t, age: 1, outfit: 'casual', skin: lk.skin, hairColor: lk.hairColor, gender: lk.gender, mood: 'celebrate' });
      for (var i = 0; i < 3; i++) R(ctx, x - 14 - i * 8, 86 - (i % 2), 3, 2, '#3f2b1f');
      R(ctx, x + 10, 72, 4, 1, PAL.white); R(ctx, x + 11, 76, 5, 1, PAL.white);
      bunting(ctx, c.flag, 4);
    },
    word: function (ctx, t, c, lk, props) {
      var said = String(props || '').split(':')[1] || 'sport';
      wall(ctx, '#2a3355'); floor(ctx, 72, '#6b4a33', '#5a3c28');
      P.drawHero(ctx, 46, 88, { t: t, age: 2, outfit: 'casual', skin: lk.skin, hairColor: lk.hairColor, gender: lk.gender, mood: 'celebrate' });
      B(ctx, 70, 12, 70, 40, PAL.white); R(ctx, 70, 52, 8, 4, PAL.white); R(ctx, 64, 56, 6, 3, PAL.white);
      if (said === 'sport') ball(ctx, 104, 32, 10 + (Math.floor(t / 400) % 2));
      else heldItem(ctx, said, 100, 26, t, 2);
      R(ctx, 126, 22, 3, 12, PAL.red); R(ctx, 126, 38, 3, 3, PAL.red);
    },
    ball: function (ctx, t, c, lk) {
      SCENES.home(ctx, t, c);
      P.drawHero(ctx, 120, 88, { t: t, age: 33, outfit: 'casual', skin: lk.skin, hairColor: lk.hairColor, hair: 3 });
      B(ctx, 132, 70, 16, 12, '#2f6b3a'); R(ctx, 132, 70, 16, 2, '#1f4a28'); ball(ctx, 140, 68, 4);
      P.drawHero(ctx, 70, 88, { t: t, age: 3, outfit: 'casual', skin: lk.skin, hairColor: lk.hairColor, gender: lk.gender, mood: 'celebrate' });
      ball(ctx, 70, 82 - Math.abs(Math.sin(t / 250)) * 8, 6);
    },
    move: function (ctx, t, c, lk) {
      sky(ctx, '#7fb4ff', '#b5d6ff', 50); clouds(ctx, t, 8);
      for (var x = 0; x < P.W; x += 30) { B(ctx, x + 2, 26, 24, 26, x % 60 ? '#c9b79c' : '#b8a586'); R(ctx, x + 10, 38, 8, 14, '#5a3c28'); R(ctx, x, 22, 28, 4, '#7c4a2d'); }
      R(ctx, 0, 52, P.W, 44, '#6b6f80'); R(ctx, 0, 70, P.W, 2, '#f4f6ff');
      var cx = 40 + (t / 60 % 60);
      B(ctx, cx, 56, 40, 14, '#a07a52'); B(ctx, cx + 4, 46, 12, 10, '#d8b27a'); B(ctx, cx + 18, 44, 14, 12, '#c99a5e'); B(ctx, cx + 10, 36, 10, 8, '#e0c08a');
      R(ctx, cx + 4, 70, 6, 6, PAL.ink); R(ctx, cx + 30, 70, 6, 6, PAL.ink); R(ctx, cx - 10, 60, 10, 2, '#5a3c28');
      P.drawHero(ctx, cx - 16, 88, { t: t, age: 4, outfit: 'casual', skin: lk.skin, hairColor: lk.hairColor, gender: lk.gender });
    },
    sibling: function (ctx, t, c, lk) {
      sky(ctx, '#ffb86b', '#ffd59e', 60);
      R(ctx, 120, 10, 14, 14, '#fff2b3');
      R(ctx, 0, 60, P.W, 36, '#8a7a5e'); for (var x = 0; x < P.W; x += 12) R(ctx, x, 60, 10, 6, '#9b8a6c');
      P.drawHero(ctx, 80, 90, { t: t, age: 14, outfit: 'uniform', skin: lk.skin, hairColor: lk.hairColor, hair: 1 });
      P.drawHero(ctx, 80, 66, { t: t, age: 2, outfit: 'casual', skin: lk.skin, hairColor: lk.hairColor, gender: lk.gender, mood: 'celebrate' });
      heart(ctx, 104, 26 - (t / 150 % 8), PAL.red); heart(ctx, 52, 34 - (t / 170 % 8), '#ff8fab');
    },
    birthday: function (ctx, t, c, lk, props) {
      // props 'doljabi:music' → the 돌잡이 table with the item of the child's strongest talent
      var held = String(props || '').split(':')[1] || 'sport'; props = String(props || '').split(':')[0];
      wall(ctx, '#2a2f55'); bunting(ctx, c.flag, 4); floor(ctx, 74, '#6b4a33', '#5a3c28');
      var kid = { t: t, age: 1, outfit: 'casual', skin: lk.skin, hairColor: lk.hairColor, gender: lk.gender, mood: 'celebrate' };
      if (props === 'mochi') { P.drawHero(ctx, 70, 88, kid); B(ctx, 54, 52, 20, 18, PAL.white); R(ctx, 54, 58, 20, 3, PAL.red); R(ctx, 60, 50, 8, 2, PAL.red); return; }
      if (props === 'doljabi' || props === 'zhuazhou') {
        var cloth = props === 'doljabi' ? '#d94f7a' : '#c8102e';
        B(ctx, 20, 62, 120, 10, cloth); R(ctx, 20, 62, 120, 2, PAL.gold);
        R(ctx, 30, 58, 12, 3, PAL.white);                               // thread / brush
        R(ctx, 50, 56, 2, 6, '#f5c518'); R(ctx, 50, 55, 2, 1, PAL.ink); // pencil
        B(ctx, 104, 56, 14, 5, props === 'doljabi' ? '#7fbf7f' : '#8b5a2b'); // money / abacus
        if (props === 'zhuazhou') for (var k = 0; k < 4; k++) R(ctx, 106 + k * 3, 57, 2, 2, PAL.ink);
        P.drawHero(ctx, 80, 66, kid); heldItem(ctx, held, 88, 50 - Math.abs(Math.sin(t / 300)) * 4, t);
        if (props === 'doljabi') { R(ctx, 74, 46, 12, 2, '#3b82f6'); R(ctx, 74, 48, 12, 2, '#e8384f'); }
        return;
      }
      table(ctx, 40, 58, 80, '#a07a52');
      B(ctx, 60, 40, 40, 18, props === 'smash' ? '#f9d7e0' : '#fbe7b3'); R(ctx, 60, 40, 40, 4, PAL.pink); R(ctx, 79, 32, 2, 8, PAL.white);
      var fl = Math.floor(t / 200) % 2; R(ctx, 79, 29 - fl, 2, 3, PAL.gold);
      P.drawHero(ctx, 130, 88, kid);
      if (props === 'smash') { R(ctx, 126, 50, 8, 3, PAL.pink); R(ctx, 70, 44, 10, 6, '#c26d84'); }
    },
    ceremony: function (ctx, t, c, lk, props) {
      var bg = props === 'baptism' ? '#2b2f4f' : '#3a2f2a';
      wall(ctx, bg); floor(ctx, 74, '#5b4030', '#4a3426');
      if (props === 'baptism') { B(ctx, 70, 8, 20, 30, '#7dd3fc'); R(ctx, 79, 8, 2, 30, PAL.gold); R(ctx, 70, 20, 20, 2, PAL.gold); B(ctx, 104, 56, 22, 14, '#d4d4d8'); R(ctx, 106, 56, 18, 3, '#9fd0ff'); }
      if (props === 'imbeleko') { for (var i = 0; i < 5; i++) P.drawHero(ctx, 16 + i * 30, 88, { t: t + i * 200, age: 40, outfit: i % 2 ? 'casual' : 'apron', gender: i % 2 ? 'm' : 'f', skin: lk.skin, hairColor: lk.hairColor }); R(ctx, 0, 76, P.W, 4, '#c8102e'); for (var x = 0; x < P.W; x += 8) R(ctx, x, 77, 4, 2, PAL.gold); swaddle(ctx, 70, 48, lk.skin, '#f5c518'); return; }
      table(ctx, 20, 58, 60, '#8b5a2b');
      if (props === 'baekseolgi') { for (var l = 0; l < 4; l++) B(ctx, 30 + l * 2, 50 - l * 7, 36 - l * 4, 6, PAL.white); }
      if (props === 'redeggs') { for (var e = 0; e < 7; e++) B(ctx, 26 + (e % 4) * 10, 50 - Math.floor(e / 4) * 6, 6, 6, '#d7263d'); }
      if (props === 'okuizome') { B(ctx, 24, 48, 50, 8, '#7a1f1f'); R(ctx, 30, 44, 26, 6, '#ff6b6b'); R(ctx, 54, 43, 6, 4, '#ff6b6b'); R(ctx, 60, 46, 8, 4, PAL.white); }
      P.drawHero(ctx, 120, 88, { t: t, age: 30, gender: 'f', outfit: props === 'baptism' ? 'suit' : 'apron', skin: lk.skin, hairColor: lk.hairColor });
      swaddle(ctx, 108, 52, lk.skin, props === 'baptism' ? '#ffffff' : '#ffe08a');
    },
    festival: function (ctx, t, c, lk, props) {
      var night = props === 'halloween' || props === 'fireworks';
      if (props === 'beach') { sky(ctx, '#62b0ff', '#a6d6ff', 46); R(ctx, 0, 46, P.W, 18, '#1d6fd1'); for (var w = 0; w < P.W; w += 10) R(ctx, (w + t / 50) % P.W, 50 + (w % 3), 6, 1, '#9fd0ff'); R(ctx, 0, 64, P.W, 32, '#f2d58a'); R(ctx, 130, 8, 14, 14, PAL.gold); }
      else if (props === 'shichigosan') { wall(ctx, '#3a2a3a'); B(ctx, 20, 20, 120, 8, '#c8102e'); R(ctx, 30, 28, 6, 46, '#c8102e'); R(ctx, 124, 28, 6, 46, '#c8102e'); floor(ctx, 74, '#9b8a6c', '#8a7a5e'); }
      else if (props === 'asado') { sky(ctx, '#ff9e5e', '#ffc58f', 50); R(ctx, 0, 50, P.W, 46, '#4d7c0f'); B(ctx, 96, 54, 44, 8, PAL.grey2); for (var g = 0; g < 5; g++) R(ctx, 100 + g * 8, 50, 6, 4, '#8b3a1f'); for (var sm = 0; sm < 4; sm++) R(ctx, 104 + sm * 9, 40 - (t / 80 + sm * 5) % 20, 3, 3, 'rgba(230,230,230,0.6)'); R(ctx, 100, 62, 2, 14, PAL.ink); R(ctx, 136, 62, 2, 14, PAL.ink); }
      else { R(ctx, 0, 0, P.W, P.H, night ? '#120d2a' : '#2a1458'); R(ctx, 0, 74, P.W, 22, night ? '#2b2440' : '#3b2a6b'); }
      if (props === 'carnival') confetti(ctx, t, 60, [PAL.gold, PAL.grass3, PAL.red, PAL.blue, PAL.pink], 7);
      if (props === 'carnival') { B(ctx, 112, 56, 20, 16, PAL.red); R(ctx, 112, 60, 20, 2, PAL.gold); R(ctx, 114 + (Math.floor(t / 150) % 2) * 12, 50, 2, 6, PAL.white); }
      if (props === 'fireworks') {
        R(ctx, 0, 60, P.W, 14, '#0e2a4a'); for (var hx = 0; hx < P.W; hx += 9) R(ctx, hx, 54 + (hx % 4), 6, 6, hx % 18 ? '#c9b79c' : '#e8e0c8');
        var fcols = [PAL.gold, PAL.red, PAL.grass3, PAL.pink, PAL.sky2];
        for (var f = 0; f < 4; f++) { var ph = ((t / 60) + f * 17) % 40, fx0 = 24 + f * 36, fy0 = 14 + (f % 2) * 10;
          for (var a = 0; a < 8; a++) { var ang = a * Math.PI / 4; R(ctx, fx0 + Math.cos(ang) * ph / 3, fy0 + Math.sin(ang) * ph / 3, 2, 2, fcols[(f + a) % fcols.length]); } }
      }
      else if (night) { R(ctx, 128, 10, 12, 12, '#fff2b3'); R(ctx, 132, 10, 8, 8, '#120d2a'); B(ctx, 40, 66, 16, 12, PAL.orange); R(ctx, 44, 70, 2, 2, PAL.ink); R(ctx, 50, 70, 2, 2, PAL.ink); R(ctx, 47, 63, 2, 3, '#166534'); }
      var kid = { t: t, age: props === 'shichigosan' ? 3 : 2, outfit: props === 'shichigosan' ? 'robe' : 'casual', skin: lk.skin, hairColor: lk.hairColor, gender: lk.gender, mood: 'celebrate' };
      P.drawHero(ctx, 80, 88, kid);
      if (props === 'shichigosan') { R(ctx, 90, 58, 3, 18, PAL.white); R(ctx, 90, 58, 3, 3, PAL.red); }
      if (props === 'beach') { R(ctx, 74, 52, 12, 3, PAL.red); R(ctx, 84, 50, 3, 3, PAL.white); }
    },
    preschool: function (ctx, t, c, lk) {
      sky(ctx, '#7fc3ff', '#bfe3ff', 50); clouds(ctx, t, 6);
      B(ctx, 92, 22, 60, 40, '#ffe08a'); R(ctx, 88, 18, 68, 6, '#e8384f'); for (var w = 0; w < 3; w++) B(ctx, 98 + w * 18, 30, 10, 10, '#9fd0ff'); R(ctx, 116, 46, 12, 16, '#7c4a2d');
      R(ctx, 0, 62, P.W, 34, '#7fb069'); R(ctx, 0, 62, P.W, 2, '#5c8a4a');
      var x = 50 + (Math.floor(t / 300) % 3) * 2;
      P.drawHero(ctx, x, 90, { t: t, age: 4, outfit: 'casual', skin: lk.skin, hairColor: lk.hairColor, gender: lk.gender });
      B(ctx, x - 9, 68, 18, 14, '#e8384f'); R(ctx, x - 7, 70, 14, 2, PAL.gold);
    },
    prenatal: function (ctx, t, c, lk) {
      wall(ctx, '#2c2a52'); floor(ctx, 74, '#6b4a33', '#5a3c28'); bunting(ctx, c.flag, 4);
      B(ctx, 112, 14, 34, 24, '#5aa9ff'); R(ctx, 128, 14, 2, 24, PAL.cream); R(ctx, 112, 25, 34, 2, PAL.cream);
      P.drawHero(ctx, 70, 88, { t: t, age: 31, gender: 'f', outfit: 'apron', skin: lk.skin, hairColor: lk.hairColor });
      for (var by = 0; by < 10; by++) { var bw = Math.round(Math.sqrt(1 - Math.pow((by - 4.5) / 5, 2)) * 5); R(ctx, 76, 60 + by, bw + 1, 1, '#16a34a'); R(ctx, 76 + bw, 60 + by, 1, 1, '#0f6e33'); } // the baby bump
      R(ctx, 77, 62, 1, 3, '#4ade80');
      heart(ctx, 79, 50 - (t / 160 % 8), PAL.red);
      for (var n = 0; n < 2; n++) { var y = 30 + ((t / 100 + n * 15) % 20); R(ctx, 96 + n * 12, y, 4, 3, PAL.gold); R(ctx, 99 + n * 12, y - 7, 1, 7, PAL.gold); }
      B(ctx, 30, 64, 14, 10, '#e8384f'); R(ctx, 36, 64, 2, 10, PAL.gold);         // a picture book
    },
    focus_lang: function (ctx, t, c, lk) {
      wall(ctx, '#20304f'); floor(ctx, 74, '#6b4a33', '#5a3c28');
      B(ctx, 70, 30, 34, 26, PAL.white); B(ctx, 104, 30, 34, 26, '#f4f0e0'); R(ctx, 103, 30, 2, 26, PAL.slate);
      for (var l = 0; l < 4; l++) { R(ctx, 74, 36 + l * 5, 24, 1, PAL.slate); R(ctx, 108, 36 + l * 5, 22, 1, PAL.slate); }
      R(ctx, 118, 18 - (t / 200 % 6), 6, 6, PAL.gold); R(ctx, 84, 16 - (t / 260 % 6), 5, 5, PAL.blue);
      P.drawHero(ctx, 40, 88, { t: t, age: 3, outfit: 'casual', skin: lk.skin, hairColor: lk.hairColor, gender: lk.gender });
    },
    focus_music: function (ctx, t, c, lk) {
      wall(ctx, '#2c2050'); floor(ctx, 74, '#6b4a33', '#5a3c28');
      var cols = [PAL.red, PAL.orange, PAL.gold, PAL.grass3, PAL.blue, PAL.purple];
      for (var k = 0; k < 6; k++) B(ctx, 92 + k * 9, 60 - k, 7, 14 + k, cols[k]);
      for (var n = 0; n < 3; n++) { var y = 20 + ((t / 90 + n * 20) % 30); R(ctx, 70 + n * 22, y, 4, 3, PAL.white); R(ctx, 73 + n * 22, y - 8, 1, 8, PAL.white); }
      P.drawHero(ctx, 50, 88, { t: t, age: 3, outfit: 'casual', skin: lk.skin, hairColor: lk.hairColor, gender: lk.gender, mood: 'celebrate' });
    },
    focus_play: function (ctx, t, c, lk) {
      wall(ctx, '#2a3355'); floor(ctx, 72, '#c99a5e', '#b08650');
      B(ctx, 100, 40, 40, 30, '#f9d7e0'); R(ctx, 96, 34, 48, 8, PAL.red); B(ctx, 114, 54, 10, 16, '#7c4a2d');
      P.drawHero(ctx, 50, 88, { t: t, age: 3, outfit: 'apron', skin: lk.skin, hairColor: lk.hairColor, gender: lk.gender, mood: 'celebrate' });
      P.drawHero(ctx, 78, 88, { t: t + 400, age: 3, outfit: 'casual', skin: lk.skin, hairColor: '#6b4423', gender: lk.gender === 'f' ? 'm' : 'f' });
      heart(ctx, 62, 40 - (t / 160 % 8), PAL.red);
    },
    focus_sports: function (ctx, t, c, lk) {
      SCENES.pitch(ctx, t, c);
      var x = 40 + (t / 30 % 80);
      P.drawHero(ctx, x, 88, { t: t, age: 4, outfit: 'kit', skin: lk.skin, hairColor: lk.hairColor, gender: lk.gender, number: 7 });
      ball(ctx, x + 12, 84, 4);
    }
  };
  P.MILESTONES = MS;
  P.drawMilestone = function (ctx, pic, t, country, look, props) {
    ctx.imageSmoothingEnabled = false;
    if (pic === 'focus_all') pic = ['focus_lang', 'focus_music', 'focus_play', 'focus_sports'][Math.floor((t || 0) / 1400) % 4];
    (MS[pic] || MS.steps)(ctx, t || 0, country || { flag: ['#fff', '#e8384f', '#3b82f6'] }, look || {}, props);
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
      case 'pt': r(0, 0, 24, 16, '#da291c'); r(0, 0, 10, 16, '#046a38');
        r(7, 4, 6, 8, '#ffe900'); r(6, 5, 8, 6, '#ffe900'); r(8, 5, 4, 6, '#da291c'); r(9, 6, 2, 4, '#ffffff'); break;
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
