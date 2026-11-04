/* DOM rendering and input. All game rules live in the engine; this file only presents state. */
(function (G) {
  'use strict';
  var RA = G.RA, E = RA.Engine, C = RA.C, T = RA.Text, P = RA.Pixel, S = RA.Save, A = RA.Audio;
  var doc = G.document;
  var $ = function (sel, root) { return (root || doc).querySelector(sel); };

  var app = {
    s: null, slot: 1, tab: 'acts', screen: 'start', mood: null, moodUntil: 0,
    sel: { country: 'pt', gender: 'm', seed: '', given: C.HERO_NAME },
    canvases: [], jobFilter: 'ok',
    auto: false, speed: 1, autoTimer: null, cardsShown: 0, cardsAge: -1, montageOpen: false, busy: false
  };
  G.__app = app; // handy for debugging / headless checks

  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function h(html) { var d = doc.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  function country() { return RA.data.countries[app.s ? app.s.country : app.sel.country]; }
  function money(v) { return T.money(v, country()); }

  function editHeroName() {
    if (!app.s) return;
    setAuto(false);
    var m = modal('<form id="name-form"><h2>캐릭터 이름 바꾸기</h2>' +
      '<div class="field"><label for="in-hero-name">캐릭터 이름 (최대 20자)</label>' +
      '<input type="text" id="in-hero-name" maxlength="20" autocomplete="off">' +
      '<p class="muted">비우면 호날두가 됩니다. 현재 인생의 기록에도 새 이름이 적용됩니다.</p></div>' +
      '<div class="row"><button class="btn btn-green" type="submit">저장</button>' +
      '<button class="btn" id="cancel-hero-name" type="button">취소</button></div></form>');
    var input = $('#in-hero-name', m);
    input.value = E.heroName(app.s);
    $('#cancel-hero-name', m).onclick = showMenu;
    $('#name-form', m).onsubmit = function (e) {
      e.preventDefault();
      var renamed = S.deserialize(S.serialize(app.s));
      E.renameHero(renamed, input.value);
      if (!S.save(app.slot, renamed)) { toast('저장 공간을 확인해 주세요. 이름을 저장하지 못했어요.'); return; }
      app.s = renamed;
      closeModal();
      if (app.screen === 'summary') renderSummary(); else { refresh(true); proceed(); }
    };
    input.onkeydown = function (e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); showMenu(); } };
    input.focus(); input.select();
  }

  var STAT_COLORS = { health: '#ff5470', happy: '#f5c518', smarts: '#60a5fa', looks: '#f472b6', football: '#2fd171', grit: '#f97316', social: '#14b8a6', fame: '#a78bfa' };
  var SHORT = C.STAT_SHORT;
  var STAT_ICONS = C.STAT_ICONS;

  // ---------------------------------------------------------------- animation loop (≈12 fps)
  function addCanvas(el, draw) { app.canvases.push({ el: el, draw: draw }); draw(performance.now()); }
  var last = 0;
  function redrawAll() {
    var t = performance.now();
    app.canvases.forEach(function (c) { try { c.draw(t); } catch (e) { /* ignore */ } });
  }
  function loop(t) {
    if (t - last > 80) {
      last = t;
      app.canvases = app.canvases.filter(function (c) { return doc.body.contains(c.el); });
      app.canvases.forEach(function (c) { try { c.draw(t); } catch (e) { /* keep animating others */ } });
    }
    G.requestAnimationFrame(loop);
  }

  function lookOf(s, mood) {
    var c = RA.data.countries[s.country];
    var m = mood || (performance.now() < app.moodUntil ? app.mood : null) || (s.stats.happy < 28 ? 'sad' : null);
    return {
      hidden: !s.born && s.age === 0 && !s.legacy,
      age: s.age, skin: c.skin[s.hero.skin % c.skin.length], hairColor: c.hair, hair: s.hero.hair,
      outfit: E.outfit(s), gender: s.hero.gender, number: s.flags.number7 ? 7 : 28, sick: !!s.sick, mood: m
    };
  }
  function portraitCanvas(cls, sceneFn, lookFn, heroX) {
    var cv = doc.createElement('canvas'); cv.width = P.W; cv.height = P.H; cv.className = 'px ' + (cls || '');
    addCanvas(cv, function (t) {
      var ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
      var sc = sceneFn(); P.drawScene(ctx, sc, t, country());
      var lk = lookFn && lookFn(); if (lk && !lk.hidden && sc !== 'grave') P.drawHero(ctx, heroX || 80, 88, Object.assign({ t: t }, lk));
    });
    return cv;
  }

  // ---------------------------------------------------------------- toasts & fx
  function toast(text, ms) {
    var root = $('#toast-root');
    if (!root.firstChild) root.appendChild(h('<div class="toast-wrap"></div>'));
    var wrap = root.firstChild;
    var el = h('<div class="toast">' + esc(text) + '</div>');
    wrap.appendChild(el);
    while (wrap.children.length > 3) wrap.removeChild(wrap.firstChild);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, ms || 3200);
  }
  // Stat changes as icon chips: "🧠 +3", "💰 +12만 원", "❤️ 관계"
  function chipsHtml(changes, preview) {
    if (!changes) return '';
    var list = Array.isArray(changes) ? changes : Object.keys(changes).filter(function (k) { return typeof changes[k] === 'number'; }).map(function (k) { return { k: k, d: changes[k] }; });
    if (!Array.isArray(changes) && changes.rel) list.push({ k: 'rel', d: 1 });
    var agg = {}, order = [], capped = {};
    list.forEach(function (c) {
      if (c.k === 'msg' || !(c.d || c.want)) return;
      if (!(c.k in agg)) { agg[c.k] = 0; order.push(c.k); }
      agg[c.k] += c.d || 0;
      if (c.want) capped[c.k] = c.max ? 'max' : 'near';
    });
    var out = order.filter(function (k) { return agg[k] || capped[k]; }).map(function (k) {
      var v = agg[k];
      // gains reduced by the top of the scale say so, instead of silently shrinking
      if (capped[k] && v <= 0) return '<span class="chip cap" title="' + esc(C.STAT_LABELS[k] || k) + (capped[k] === 'max' ? ' 최대치' : ' 최대치 근접') + '">' + (STAT_ICONS[k] || '') + (capped[k] === 'max' ? ' 최대' : ' 최대 근접') + '</span>';
      if (capped[k]) return '<span class="chip up cap" title="최대치에 가까워 덜 올랐어요">' + (STAT_ICONS[k] || '') + ' +' + v + (capped[k] === 'max' ? ' (최대)' : ' (최대 근접)') + '</span>';
      if (k === 'rel') return '<span class="chip ' + (v > 0 ? 'up' : 'down') + '" title="관계">' + (v > 0 ? '💞' : '💔') + ' 관계</span>';
      var txt = k === 'money' ? (v > 0 ? '+' : '') + (preview ? '' : money(v)) : (v > 0 ? '+' : '') + v;
      if (k === 'money' && preview) txt = v > 0 ? '+' : '−';
      var trait = C.TRAITS.indexOf(k) >= 0;
      // for traits "up" is usually bad (악동, 도박, 음주, 전과) — 평판 is the exception
      var good = trait ? (k === 'rep' ? v > 0 : v < 0) : v > 0;
      var icon = trait ? C.TRAIT_ICONS[k] : (STAT_ICONS[k] || '');
      var label = trait ? C.TRAIT_LABELS[k] : (C.STAT_LABELS[k] || k);
      if (trait && preview) txt = (v > 0 ? '+' : '−');
      return '<span class="chip ' + (good ? 'up' : 'down') + (trait ? ' trait' : '') + '" title="' + esc(label) + '">' + icon + (trait ? ' ' + esc(label.replace(/ .*/, '')) : '') + ' ' + esc(txt) + '</span>';
    });
    return out.length ? '<div class="chips">' + out.join('') + '</div>' : '';
  }
  function ageFlash(age) {
    var el = h('<div class="age-flash"><div class="big">' + age + '살<small>' + (app.s.year) + '년</small></div></div>');
    doc.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 1000);
  }
  function celebrate(kind, siuuPlayed) {
    var label = { trophy: '우승!', ballon: '발롱도르!', worldcup: '월드컵 우승!', goal: '골!!', achieve: '업적 달성!', peak: '정상에 올랐다!', jackpot: '잭팟!', nobel: '노벨상 수상!' }[kind] || '축하해요!';
    if (!siuuPlayed) A.play(kind === 'achieve' ? 'achieve' : kind === 'peak' ? 'cheer' : kind === 'jackpot' ? 'jackpot' : 'trophy');
    app.mood = 'celebrate'; app.moodUntil = performance.now() + 3000;
    var root = $('#fx-root');
    var conf = doc.createElement('canvas'); conf.width = 160; conf.height = 96; conf.className = 'px';
    conf.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;';
    var box = h('<div class="celebrate"><div class="box"><canvas class="px tro" width="16" height="16"></canvas><div class="t">' + esc(label) + '</div></div></div>');
    P.drawTrophy(box.querySelector('canvas').getContext('2d'), kind === 'ballon' ? 'ballon' : kind === 'worldcup' ? 'worldcup' : 'cup', 0, 0, 1);
    root.appendChild(conf); root.appendChild(box);
    // purely visual particles (Math.random is fine here: not outcome-affecting)
    var parts = [], cols = ['#f5c518', '#2fd171', '#ff5470', '#60a5fa', '#ffffff'];
    for (var i = 0; i < 90; i++) parts.push({ x: Math.random() * 160, y: -Math.random() * 60, vx: (Math.random() - .5) * .8, vy: .6 + Math.random() * 1.2, c: cols[i % cols.length] });
    var start = performance.now();
    (function step(t) {
      var ctx = conf.getContext('2d'); ctx.clearRect(0, 0, 160, 96);
      parts.forEach(function (p) { p.x += p.vx; p.y += p.vy; ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); });
      if (t - start < 2600) G.requestAnimationFrame(step); else { conf.remove(); box.remove(); }
    })(start);
  }

  // ---------------------------------------------------------------- modal
  function closeModal() { $('#modal-root').innerHTML = ''; }
  function closeModalAndGo() { closeModal(); proceed(); }
  function modal(inner, opts) {
    opts = opts || {};
    var wrap = h('<div class="modal-wrap' + (opts.sheet ? ' sheet' : '') + '" role="dialog" aria-modal="true"><div class="modal card"></div></div>');
    var m = wrap.firstChild;
    if (typeof inner === 'string') m.innerHTML = inner; else m.appendChild(inner);
    if (opts.dismiss) wrap.addEventListener('click', function (e) { if (e.target === wrap) closeModal(); });
    $('#modal-root').innerHTML = '';
    $('#modal-root').appendChild(wrap);
    return m;
  }

  // ---------------------------------------------------------------- start screen
  function renderStart() {
    app.screen = 'start'; app.s = null;
    $('#seed-chip').hidden = true;
    var scr = $('#screen'); scr.innerHTML = '';
    var c = RA.data.countries[app.sel.country];
    var list = S.list();
    var el = h('<div class="start">' +
      '<section class="card"><div class="hero-banner"></div>' +
      '<div class="card-b"><p class="pitch-text">사남매의 막내로 태어난 가난한 소년. 열두 살에 혼자 떠난 축구 아카데미, 열다섯의 심장 수술, 아버지의 아픔… 이 이야기의 끝은 발롱도르일까, 노벨상일까, 감옥일까? 1살부터 생을 마칠 때까지 한 해 한 해 선택하며 살아 보세요.</p>' +
      '<div class="section-title">이어하기</div><div class="slots" id="slots"></div></div></section>' +
      '<section class="card"><div class="card-h">새 인생 시작</div><div class="card-b">' +
      '<div class="field"><label>태어날 나라를 고르세요</label><div class="countries" id="countries"></div></div>' +
      '<div class="family-preview" id="family"></div>' +
      '<div class="field"><label for="in-name">캐릭터 이름 (최대 20자)</label><input type="text" id="in-name" maxlength="20" autocomplete="off"><p class="muted">비우면 호날두가 됩니다. 나중에 ☰ 메뉴에서 바꿀 수 있어요.</p></div>' +
      '<div class="field"><label>성별</label><div class="seg" id="seg-g"><button data-g="m">남</button><button data-g="f">여</button></div></div>' +
      '<div class="field"><label>시드 (같은 시드 + 같은 선택 = 같은 인생)</label><div class="row"><input type="text" class="grow" id="in-seed" maxlength="24" placeholder="비우면 무작위"><button class="btn btn-sm" id="btn-dice" title="무작위 시드">🎲</button></div></div>' +
      '<div class="field"><button class="btn btn-green" id="btn-start" style="width:100%;font-size:17px;padding:14px">인생 시작하기 ▶</button></div>' +
      '</div></section></div>');
    scr.appendChild(el);
    var banner = $('.hero-banner', el);
    banner.appendChild(portraitCanvas('', function () { return 'stadium'; }, function () {
      var cc = RA.data.countries[app.sel.country];
      return { age: 24, skin: cc.skin[0], hairColor: cc.hair, hair: 1, outfit: 'kit', gender: app.sel.gender, number: 7, mood: 'celebrate' };
    }, 128));
    banner.appendChild(h('<div class="title-over"><h1>인생게임</h1><p>도트 인생 시뮬레이션 · 비공식 팬 패러디</p></div>'));
    // countries
    var grid = $('#countries', el);
    // the canon route (Portugal) comes first, as a wide card
    var ids = Object.keys(RA.data.countries).sort(function (a, b) { return (RA.data.countries[b].canon ? 1 : 0) - (RA.data.countries[a].canon ? 1 : 0); });
    ids.forEach(function (id) {
      var cc = RA.data.countries[id];
      var b = h('<button class="country' + (cc.canon ? ' canon' : '') + (id === app.sel.country ? ' sel' : '') + '" data-id="' + id + '"><canvas class="px" width="24" height="16"></canvas><span>' + esc(cc.name) + (cc.canon ? ' <em class="canon-badge">원작 루트</em>' : '') + '</span>' + (cc.canon ? '<small class="canon-note">실제 이야기와 가장 가까운 길 · 마데이라섬 → 리스본</small>' : '') + '</button>');
      P.drawFlag(b.querySelector('canvas').getContext('2d'), id, 0, 0, 1);
      b.addEventListener('click', function () { A.play('click'); app.sel.country = id; renderStart(); });
      grid.appendChild(b);
    });
    var f = c.family;
    $('#family', el).innerHTML = '<b>' + esc(c.places.hometown) + '</b>에서 태어납니다.<br>' +
      '아버지 <b>' + esc(f.father.name) + '</b> — ' + esc(f.father.job) + ', ' + esc(f.father.job2) + '<br>' +
      '어머니 <b>' + esc(f.mother.name) + '</b> — ' + esc(f.mother.job) + '<br>' +
      '형제자매: ' + f.siblings.map(function (x) {
        var word = E.relWord({ hero: { gender: app.sel.gender } }, { role: 'sibling', gender: x.gender, bornAt: -x.gap });
        return word + ' <b>' + esc(x.name) + '</b>';
      }).join(', ') + '<br>' +
      '<span class="muted">동네 클럽 ' + esc(c.clubs.local) + ' → ' + esc(c.clubs.regional) + ' → ' + esc(c.places.bigcity) + '의 ' + esc(c.clubs.academy) + '</span>';
    $('#in-seed', el).value = app.sel.seed;
    $('#in-name', el).value = app.sel.given;
    $('#in-name', el).addEventListener('input', function (e) { app.sel.given = e.target.value; });
    $('#in-seed', el).addEventListener('input', function (e) { app.sel.seed = e.target.value; });
    $('#btn-dice', el).addEventListener('click', function () { app.sel.seed = RA.RNG.randomSeedString(); $('#in-seed').value = app.sel.seed; });
    Array.prototype.forEach.call(el.querySelectorAll('#seg-g button'), function (b) {
      if (b.dataset.g === app.sel.gender) b.classList.add('on');
      b.addEventListener('click', function () { app.sel.gender = b.dataset.g; renderStart(); });
    });
    $('#btn-start', el).addEventListener('click', function () { A.unlock(); A.siuu(); startGame(); });
    // slots
    var sl = $('#slots', el);
    list.slots.forEach(function (x) {
      var meta = x.meta;
      var row = h('<div class="slot"><span class="grow">' + (meta ? '슬롯 ' + x.slot + ' · ' + esc(meta.name) + ' ' + meta.age + '세 · ' + esc((RA.data.countries[meta.country] || {}).name || '') + (meta.alive ? '' : ' · 사망') + (meta.gen > 1 ? ' · ' + meta.gen + '대' : '') : '슬롯 ' + x.slot + ' · 비어 있음') + '</span></div>');
      if (meta) {
        var lb = h('<button class="btn btn-sm btn-gold">불러오기</button>');
        lb.addEventListener('click', function () { loadSlot(x.slot); });
        row.appendChild(lb);
      }
      sl.appendChild(row);
    });
  }

  function startGame(opts) {
    opts = opts || {};
    var seed = opts.seed || app.sel.seed || RA.RNG.randomSeedString();
    app.s = E.newGame({ country: opts.country || app.sel.country, seed: seed, gender: opts.gender || app.sel.gender, given: opts.given != null ? opts.given : app.sel.given });
    app.cardsAge = -1; app.cardsShown = 0;
    var list = S.list();
    var empty = list.slots.filter(function (x) { return !x.meta || !x.meta.alive; })[0];
    app.slot = opts.slot || (empty ? empty.slot : 1);
    app.tab = isPhone() ? 'log' : 'acts';
    save();
    renderGame();
    proceed();
  }
  function loadSlot(n) {
    try {
      var s = S.load(n);
      if (!s) return toast('저장된 인생이 없습니다.');
      app.s = s; app.slot = n;
      if (!s.alive) return renderSummary();
      app.cardsAge = s.age; app.cardsShown = (s.cards || []).length; // do not replay last year's cards
      renderGame();
      proceed();
    } catch (e) { toast('불러오기 실패: ' + e.message); }
  }
  function save() { if (app.s) S.save(app.slot, app.s); }
  function isPhone() { return G.innerWidth <= 860; }
  function isTouch() {
    try { return G.matchMedia('(hover: none)').matches || G.matchMedia('(pointer: coarse)').matches; } catch (e) { return 'ontouchstart' in G; }
  }

  // ---------------------------------------------------------------- game screen
  function renderGame() {
    app.screen = 'game';
    var s = app.s;
    prevMoney = null;
    var chip = $('#seed-chip'); chip.hidden = false; chip.textContent = '시드 ' + s.seed + (s.generation > 1 ? ' · ' + s.generation + '대' : '');
    var scr = $('#screen'); scr.innerHTML = '';
    var el = h('<div class="game">' +
      '<aside class="side">' +
      '  <section class="card portrait"><div class="portrait-row"><div class="pcv"></div><div class="who" id="who"></div></div></section>' +
      '  <section class="card"><div class="card-h">능력치</div><div class="card-b stats" id="stats"></div><div class="traits" id="traits"></div><div class="bodytal" id="bodytal"></div></section>' +
      '  <div class="actionbar" id="actionbar"><button class="ab-auto" id="btn-auto" aria-pressed="false"></button><button class="ab-speed" id="btn-speed" aria-label="속도"></button><button class="age-btn" id="btn-age"></button></div>' +
      '</aside>' +
      '<section class="card logcol"><div class="card-h">인생 기록 <span class="muted" id="log-count"></span></div><div class="log" id="log"></div></section>' +
      '<section class="card panelcol"><div class="tabs" id="tabs"></div><div class="tabpanel" id="panel"></div></section>' +
      '</div>');
    scr.appendChild(el);
    $('.pcv', el).appendChild(portraitCanvas('', function () { return E.homeScene(app.s); }, function () { return lookOf(app.s); }));
    $('#btn-age', el).addEventListener('click', function () { if (E.isMontage(app.s) && !app.s.queue.length) return proceed(true); onAgeUp(); });
    $('#btn-auto', el).addEventListener('click', function () { setAuto(!app.auto); });
    $('#btn-speed', el).addEventListener('click', function () { app.speed = app.speed === 1 ? 2 : 1; try { G.localStorage.setItem('ronaldo-adventure.speed', String(app.speed)); } catch (e) { /* ignore */ } renderAgeBtn(); });
    refresh(true);
  }

  function refresh(full) {
    if (app.screen !== 'game') return;
    renderWho(); renderStats(); renderTraits(); renderBody(); renderAgeBtn(); renderLog(full); renderTabs(); renderPanel();
  }

  var prevMoney = null;
  function renderWho() {
    var s = app.s, c = country();
    var ap = ''; for (var i = 0; i < E.AP_PER_YEAR; i++) ap += '<i class="' + (i < s.ap ? '' : 'off') + '"></i>';
    var where = s.jail > 0 ? '수감 중 (' + s.jail + '년 남음)' : (s.flags.abroad ? (s.abroadCity || '해외') : (s.flags.moved_alone && s.age < 40 ? c.places.bigcity : c.places.city));
    $('#who').innerHTML =
      '<div class="nm"><span class="age">' + s.age + '살</span><span>' + esc(E.genName(s.generation, E.heroName(s))) + '</span></div>' +
      '<div class="sub">' + esc(c.name) + ' · ' + esc(where) + ' · ' + s.year + '년</div>' +
      '<div class="sub">' + esc(s.job ? E.jobTitle(s) : eduLabel(s)) + '</div>' +
      (s.route && !E.isMontage(s) ? '<div class="sub route-chip">🧭 ' + esc(E.Routes.label(s)) + '</div>' : '') +
      '<div class="money">' + esc(money(s.money)) + '</div>' +
      (E.isMontage(s) ? '<div class="ap">아기 시절 · 자동으로 넘어가요</div>' : '<div class="ap">행동력 ' + ap + '</div>');
    // a change of more than ~a tenth of the balance (or of a month's wage) makes the money bounce
    if (prevMoney != null && s.money !== prevMoney && Math.abs(s.money - prevMoney) >= Math.max(Math.abs(prevMoney) * 0.1, 30 * c.wage)) {
      $('#who .money').classList.add(s.money > prevMoney ? 'jump-up' : 'jump-down');
    }
    prevMoney = s.money;
  }
  function inSchool(s) { return ['elem', 'middle', 'high', 'univ', 'grad'].indexOf(s.edu.stage) >= 0; }
  function eduLabel(s) {
    var c = country(), st = c.school[s.edu.stage];
    if (st && st.school) return st.school + ' 재학';
    if (s.edu.stage === 'univ') return s.edu.univ + ' ' + (C.MAJORS[s.edu.major] || '') + ' 재학';
    if (s.edu.stage === 'grad') return s.edu.univ + ' 대학원';
    if (s.age < c.school.elem.from) return (s.eduFocus ? E.EDU_FOCUS[s.eduFocus].icon + ' ' + E.EDU_FOCUS[s.eduFocus].label + ' 집중 · ' : '') + (s.age < 3 ? '아기' : '미취학 어린이');
    if (s.fb.stage !== 'none' && s.fb.stage !== 'retired') return C.FB_STAGE_LABELS[s.fb.stage];
    var deg = C.DEGREE_LABELS[s.edu.degree];
    if (s.job) return E.jobTitle(s) + ' · ' + deg;
    var r = E.Routes.cur(s);
    // an unpaid route stage (습작기, 연습생…) is still what the hero does, not 무직
    if (r && !r.state) return E.Routes.stageTitle(s) + ' · ' + deg;
    return s.retiredFromWork ? '은퇴' : '무직 · ' + deg;
  }
  var prevStats = {};
  function renderStats() {
    var s = app.s, box = $('#stats');
    if (!box.children.length) {
      C.STATS.forEach(function (k) {
        box.appendChild(h('<div class="stat" data-k="' + k + '"><span>' + STAT_ICONS[k] + ' ' + SHORT[k] + '</span><div class="bar"><i></i></div><span class="v"></span></div>'));
      });
    }
    var shown = E.Life ? E.Life.uiStats(s) : C.STATS;
    C.STATS.forEach(function (k) {
      var row = box.querySelector('[data-k="' + k + '"]');
      row.style.display = shown.indexOf(k) >= 0 ? '' : 'none';
      var v = s.stats[k], i = row.querySelector('i'), vv = row.querySelector('.v');
      i.style.width = v + '%'; i.style.backgroundColor = STAT_COLORS[k];
      if (prevStats[k] != null && prevStats[k] !== v) {
        vv.classList.remove('flash-up', 'flash-down'); void vv.offsetWidth;
        vv.classList.add(v > prevStats[k] ? 'flash-up' : 'flash-down');
      }
      vv.textContent = v; prevStats[k] = v;
    });
  }
  // 특성 strip: shows what bad (and good) choices have built up
  function renderTraits() {
    var s = app.s, box = $('#traits'); if (!box) return;
    var t = s.traits || {}, out = [];
    var stageCls = t.gamble >= 75 ? 'bad3' : t.gamble >= 45 ? 'bad2' : t.gamble >= 20 ? 'bad1' : '';
    out.push('<span class="tchip' + (t.rep < 35 ? ' bad1' : t.rep >= 65 ? ' good' : '') + '">' + C.TRAIT_ICONS.rep + ' 평판 ' + (t.rep != null ? t.rep : 50) + '</span>');
    if (t.mischief > 0) out.push('<span class="tchip' + (t.mischief >= 40 ? ' bad2' : t.mischief >= 20 ? ' bad1' : '') + '">' + C.TRAIT_ICONS.mischief + ' 악동 ' + t.mischief + '</span>');
    if (t.gamble > 0) out.push('<span class="tchip ' + stageCls + '">' + C.TRAIT_ICONS.gamble + ' 도박 ' + t.gamble + ' · ' + esc(E.gambleStage(s)) + '</span>');
    if (t.alcohol > 0) out.push('<span class="tchip' + (t.alcohol >= 50 ? ' bad2' : t.alcohol >= 25 ? ' bad1' : '') + '">' + C.TRAIT_ICONS.alcohol + ' 음주 ' + t.alcohol + '</span>');
    if (t.record > 0) out.push('<span class="tchip bad2">' + C.TRAIT_ICONS.record + ' 전과 ' + t.record + '범</span>');
    // round 8: where the hero was born and what they love doing (취미 = hobby)
    var Lf = E.Life;
    if (Lf && s.origin) out.unshift('<span class="tchip" title="' + esc((RA.data.origins[s.origin] || {}).desc || '') + '">' + esc(Lf.originLabel(s)) + '</span>');
    (s.hobbies || []).forEach(function (id) { var h = Lf && Lf.hobby(id); if (h) out.push('<span class="tchip good" title="취미: ' + esc(h.desc) + '">' + h.icon + ' ' + esc(h.name) + '</span>'); });
    box.innerHTML = '<span class="traits-h">특성</span>' + out.join('');
  }
  // 타고난 몸·재능: body specs rolled at birth and base talents (태교 → 조기 교육 → 학교 과정)
  var bodyOpen = false;
  function renderBody() {
    var s = app.s, box = $('#bodytal'); if (!box || !s.body) return;
    var RT = E.Routes;
    var cells = RA.data.bodyAttrs.map(function (a) {
      var v = a.k === 'height' ? s.body.height + 'cm' : s.body[a.k];
      return '<span class="bt" title="' + esc(a.desc) + '">' + a.icon + ' ' + esc(a.label) + ' <b>' + v + '</b></span>';
    }).concat(RA.data.talents.map(function (a) {
      return '<span class="bt tal" title="' + esc(a.desc) + '">' + a.icon + ' ' + esc(a.label) + ' <b>' + (s.talent ? s.talent[a.k] : 0) + '</b></span>';
    }));
    box.innerHTML = '<details' + (bodyOpen ? ' open' : '') + '><summary>🧬 타고난 몸 · 재능</summary>' +
      '<p class="hint">몸(키·체격·반사신경…)은 태어날 때 정해져요. 재능(0~100)은 태교·조기 교육·학교 과정으로 자라요. 길마다 필요한 몸과 재능이 달라서, 맞을수록 더 멀리 갑니다.' + (s.age < 18 ? ' 예상 키는 다 자랐을 때의 키예요.' : '') + '</p>' +
      '<div class="bts">' + cells.join('') + '</div></details>';
    box.querySelector('details').addEventListener('toggle', function (e) { bodyOpen = e.target.open; });
    void RT;
  }
  function renderAgeBtn() {
    var s = app.s, b = $('#btn-age'), au = $('#btn-auto'), sp = $('#btn-speed');
    if (!b) return;
    if (au) { au.innerHTML = app.auto ? '⏸ <span>자동 진행 중</span>' : '▶ <span>자동 진행</span>'; au.setAttribute('aria-pressed', app.auto ? 'true' : 'false'); au.classList.toggle('on', app.auto); }
    if (sp) sp.textContent = app.speed + 'x';
    doc.body.classList.toggle('auto-on', !!app.auto);
    if (!s.alive) { b.innerHTML = '인생 결산 보기<small>이번 생이 끝났습니다</small>'; return; }
    if (s.queue.length) { b.innerHTML = '선택하기<small>먼저 일어난 일에 답하세요</small>'; return; }
    if (E.isMontage(s)) { b.innerHTML = '빨리 넘기기 ⏩<small>아기 시절은 자동으로 흘러가요</small>'; return; }
    b.innerHTML = '+1살 <small>' + (s.age + 1) + '살이 됩니다 · 행동력 ' + s.ap + '</small>';
  }
  function renderLog(full) {
    var s = app.s, box = $('#log');
    var html = renderLogHtml(s);
    if (box) { box.innerHTML = html; box.scrollTop = box.scrollHeight; $('#log-count').textContent = s.age + '년의 기록'; }
  }
  function renderLogHtml(s, newestFirst) {
    var items = s.log.slice(-180), groups = [], cur = null;
    items.forEach(function (e) {
      if (e.k === 'year' || !cur) { cur = []; groups.push(cur); }
      if (e.k === 'year') cur.push('<div class="yr">' + esc(e.t.replace(/—/g, '').trim()) + '</div>');
      else cur.push('<div class="e k-' + esc(e.k) + '">' + (e.k === 'card' ? '🍼 ' : '') + esc(e.t) + (e.chg ? chipsHtml(e.chg) : '') + '</div>');
    });
    if (newestFirst) groups.reverse();
    return groups.map(function (g) { return g.join(''); }).join('');
  }

  var TABS = [['log', '기록'], ['acts', '활동'], ['people', '관계'], ['career', '학업·직업'], ['football', '축구'], ['goals', '업적']];
  function renderTabs() {
    var box = $('#tabs'); box.innerHTML = '';
    if (!isPhone() && app.tab === 'log') app.tab = 'acts';
    var tabs = TABS;
    // the 축구 tab exists only for a hero who knows football; a selected one moves to 학업·직업
    if (E.Life && app.s) { var vt = E.Life.uiTabs(app.s, TABS, app.tab); tabs = vt.tabs; app.tab = vt.tab; }
    tabs.forEach(function (t) {
      var b = h('<button class="tab' + (t[0] === 'log' ? ' log-tab' : '') + (app.tab === t[0] ? ' on' : '') + '">' + t[1] + '</button>');
      b.addEventListener('click', function () { A.play('click'); app.tab = t[0]; renderTabs(); renderPanel(); });
      box.appendChild(b);
    });
  }
  function renderPanel() {
    var p = $('#panel'); if (!p) return;
    p.innerHTML = '';
    ({ log: panelLog, acts: panelActs, people: panelPeople, career: panelCareer, football: panelFootball, goals: panelGoals }[app.tab] || panelActs)(p);
  }

  function panelLog(p) {
    p.innerHTML = '<p class="hint" style="margin:0 0 6px">최근 기록이 위에 보입니다.</p><div class="log" style="padding:0">' + renderLogHtml(app.s, true) + '</div>';
  }

  function panelActs(p) {
    var s = app.s;
    if (!s.alive) { p.innerHTML = '<p class="muted">이번 생은 끝났습니다.</p>'; return; }
    if (E.isMontage(s)) { p.innerHTML = '<p class="muted">🍼 아기 시절(0~4살)에는 활동이 없어요. 사진첩처럼 자동으로 넘어가요.</p>' + (s.eduFocus ? '<p class="hint">조기 교육: ' + E.EDU_FOCUS[s.eduFocus].icon + ' ' + esc(E.EDU_FOCUS[s.eduFocus].label) + ' — ' + esc(E.EDU_FOCUS[s.eduFocus].desc) + '</p>' : ''); return; }
    var grid = h('<div class="acts"></div>');
    E.activities(s).forEach(function (a) {
      var b = h('<button class="act' + (a.ok ? '' : ' is-off') + '" aria-disabled="' + (a.ok ? 'false' : 'true') + '" title="' + esc(a.reason) + '"><span class="ic">' + a.icon + '</span><span>' + esc(a.label) + '</span>' + (a.cost === 0 ? '<span class="muted" style="font-size:10px">행동력 0</span>' : '') + '</button>');
      b.addEventListener('click', function () {
        if (!a.ok) { A.play('bad'); toast(a.label + ': ' + (a.reason || '지금은 할 수 없어요.')); return; }
        onActivity(a);
      });
      grid.appendChild(b);
    });
    p.appendChild(grid);
    p.appendChild(h('<p class="hint">해마다 행동력 ' + E.AP_PER_YEAR + '을 쓸 수 있어요. 다 쓰지 않아도 나이를 먹을 수 있습니다. ' + (isTouch() ? '회색 버튼을 누르면 할 수 없는 이유가 보여요.' : '회색 버튼에 마우스를 올리거나 누르면 이유가 보여요.') + '</p>'));
  }

  function onActivity(a) {
    var s = app.s;
    if (s.queue.length) return showEvent();
    if (a.ui === 'jobs') return showJobs();
    if (a.opts) {
      var m = modal('<div class="card-h">' + esc(a.label) + '</div><div class="card-b"><p class="muted">정말로? 잡히면 대가를 치릅니다.</p><div class="choices"></div><div class="row" style="margin-top:10px"><button class="btn btn-ghost" id="x">그만두기</button></div></div>', { dismiss: true });
      a.opts.forEach(function (o) {
        var b = h('<button class="btn choice">' + esc(o[1]) + '</button>');
        b.addEventListener('click', function () { closeModal(); runActivity(a.id, o[0]); });
        m.querySelector('.choices').appendChild(b);
      });
      m.querySelector('#x').addEventListener('click', closeModal);
      return;
    }
    runActivity(a.id);
  }
  function runActivity(id, arg) {
    var res = E.doActivity(app.s, id, arg);
    if (!res) return;
    if (!res.ok) { A.play('bad'); toast(res.log); return; }
    A.play(id === 'football' ? 'click' : 'good');
    toast(res.log);
    afterAction();
  }
  function afterAction() {
    save();
    triumphCue();
    var news = app.s.y.newAchievements; app.s.y.newAchievements = null;
    refresh();
    if (news && news.length) { A.play('achieve'); news.forEach(function (id) { var a = achById(id); if (a) toast('🏅 업적 달성: ' + a.name); }); }
    if (!app.s.alive) return setTimeout(renderSummary, 900);
    proceed();
  }
  function achById(id) { return (RA.data.achievements || []).filter(function (a) { return a.id === id; })[0]; }

  function relLabel(p) {
    if (p.role === 'friend') return '단짝';
    if (p.role === 'coach') return '코치';
    if (p.role === 'oldfriend') return '옛 친구';
    return E.relWord(app.s, p);
  }
  function relIcon(p) { return { father: '👨', mother: '👩', sibling: p.gender === 'f' ? '👧' : '👦', spouse: '💍', partner: '💘', child: '🧒', coach: '🧢', friend: '🤝', oldfriend: '👋', ex: '💔' }[p.role] || '🙂'; }
  function panelPeople(p) {
    var s = app.s;
    var order = ['father', 'mother', 'sibling', 'spouse', 'partner', 'child', 'friend', 'coach', 'oldfriend', 'ex'];
    var ppl = s.people.slice().sort(function (a, b) { return order.indexOf(a.role) - order.indexOf(b.role); });
    var box = h('<div class="people"></div>');
    ppl.forEach(function (x) {
      if (x.role === 'friend' && x.id !== s.bestFriend) return;
      var extra = '';
      if (x.role === 'father' && s.flags.father_drinking && x.alive) extra = s.flags.father_sober ? ' · 회복 중 🌱' : ' · 알코올 의존과 싸우는 중 (회복 의지 ' + (x.recovery || 0) + '%)';
      box.appendChild(h('<div class="person' + (x.alive ? '' : ' dead') + '"><div class="av">' + relIcon(x) + '</div><div><div class="nm"><span>' + esc(x.name) + '</span><span class="muted">' + (x.alive ? (x.age != null ? x.age + '세' : '') : '故') + '</span></div>' +
        '<div class="role">' + esc(relLabel(x)) + esc(extra) + '</div>' + (x.alive ? '<div class="bar"><i style="width:' + x.rel + '%;background:' + (x.rel > 60 ? '#2fd171' : x.rel > 30 ? '#f5c518' : '#ff5470') + '"></i></div>' : '') + '</div></div>'));
    });
    p.appendChild(box);
    p.appendChild(h('<p class="hint">관계는 "가족과 시간", "친구 만나기", "데이트" 활동과 사건 선택으로 바뀝니다.</p>'));
  }

  // the current route: stage ladder, what the next stage needs, and where the route can lead
  function routeHtml(s) {
    var d = E.Routes.panel(s), r = d.route;
    var html = '<div class="section-title">지금 걷는 길</div><div class="route-now"><b>' + esc(r.icon + ' ' + r.name) + '</b>' + (r.state ? '' : ' · ' + esc(d.title)) +
      (d.track ? '<div class="muted">학교 과정: ' + esc(d.track) + '</div>' : '') +
      (!r.state && r.fit != null && E.Routes.isLadder(r) ? '<div class="muted">이 길과 맞는 정도 ' + d.fit + '/100 · 길 실력 ' + d.skill + '/100 <span class="hint">(맞는 정도 = 이 길에 필요한 몸·재능·능력치의 평균)</span></div>' : '') + '</div>';
    if (d.ladder.length) html += '<div class="ladder">' + d.ladder.map(function (x, i) { return '<div class="' + (x.cur ? 'cur' : x.done ? 'done' : '') + '">' + (i + 1) + '. ' + esc(x.t) + (x.peak ? ' 🏆' : '') + '</div>'; }).join('') + '</div>';
    if (d.next) html += '<p class="hint">' + esc(d.next) + '</p>';
    if (d.exits.length) html += '<p class="hint">이 길에서 갈 수 있는 곳: ' + d.exits.map(function (x) { return esc(x.name) + '(' + esc(x.why) + ')'; }).join(', ') + '</p>';
    return html;
  }
  function panelCareer(p) {
    var s = app.s, c = country();
    var html = routeHtml(s) + '<div class="section-title">학업</div><dl class="kv">' +
      '<dt>현재</dt><dd>' + esc(inSchool(s) || s.age < c.school.elem.from ? eduLabel(s) : '학교를 마쳤다') + '</dd>' +
      '<dt>최종 학력</dt><dd>' + esc(C.DEGREE_LABELS[s.edu.degree]) + (s.edu.major ? ' · ' + esc(C.MAJORS[s.edu.major]) : '') + '</dd>' +
      '<dt>학교 제도</dt><dd class="muted">' + esc(c.school.elem.name + ' ' + c.school.elem.from + '–' + c.school.elem.to + '세 · ' + c.school.middle.name + ' ' + c.school.middle.from + '–' + c.school.middle.to + '세 · ' + c.school.high.name + ' ' + c.school.high.from + '–' + c.school.high.to + '세 · ' + c.school.exam.name + ' ' + c.school.exam.age + '세') + '</dd>' +
      (s.edu.examScore != null ? '<dt>' + esc(c.school.exam.name) + '</dt><dd>' + s.edu.examScore + '점</dd>' : '') +
      '</dl><div class="section-title">직업</div>';
    if (s.job) {
      var k = E.careerIndex()[s.job.id];
      // the route panel above already shows this job's ladder (route stages or the job's own ranks)
      var shown = E.Routes.panel(s).ladder.length && E.Routes.ofCareer(s.job.id) === s.route.id;
      html += '<dl class="kv"><dt>직업</dt><dd>' + esc(k.name) + ' · ' + esc(E.rankTitle(s)) + ' <span class="muted">(' + esc(C.SECTORS[k.sector]) + ')</span></dd><dt>연봉</dt><dd class="money">' + esc(money(E.salaryOf(s, k, s.job.level))) + '</dd><dt>평판</dt><dd>' + Math.round(s.job.perf) + '/100</dd><dt>근속</dt><dd>' + s.job.years + '년</dd></dl>' +
        (shown ? '' : '<div class="ladder">' + k.ladder.map(function (t, i) { return '<div class="' + (i === s.job.level ? 'cur' : i < s.job.level ? 'done' : '') + '">' + (i + 1) + '. ' + esc(E.ladderTitle(s, k, i)) + '</div>'; }).join('') + '</div>') +
        '<p class="hint">' + esc(k.desc) + '</p>';
    } else html += '<p class="muted">' + (s.age < 14 ? '아직 일할 나이가 아닙니다.' : (E.Routes.managesJob(s) ? '아직 급여를 받는 자리는 아니에요. 지금 걷는 길에서 다음 단계로 올라서면 직함이 생겨요.' : '직업이 없습니다. 활동 탭의 "구직/이직"에서 지금 길에서 갈 수 있는 직업에 지원할 수 있어요.')) + '</p>';
    if (s.jobHistory.length) html += '<div class="section-title">경력</div><div class="ladder">' + s.jobHistory.slice(-8).reverse().map(function (j) { return '<div>' + j.from + '–' + j.to + '세 · ' + esc(j.name) + ' · ' + esc(j.title) + ' <span class="muted">(' + esc(j.why) + ')</span></div>'; }).join('') + '</div>';
    p.innerHTML = html;
    var pb = h('<button class="btn" style="margin-top:12px;width:100%">🧭 진로 지도 (열린 길 · 잠긴 길)</button>');
    pb.addEventListener('click', showPaths); p.appendChild(pb);
    if (s.age >= 14 && s.alive) {
      var b = h('<button class="btn btn-gold" style="margin-top:8px;width:100%">🔎 직업 찾아보기</button>');
      b.addEventListener('click', showJobs); p.appendChild(b);
    }
  }

  function trophyBox(kind, n, label) {
    var el = h('<div class="trophy"><canvas class="px" width="16" height="16"></canvas><b>' + n + '</b><span>' + esc(label) + '</span></div>');
    P.drawTrophy(el.querySelector('canvas').getContext('2d'), kind, 0, 0, 1);
    return el;
  }
  function panelFootball(p) {
    var s = app.s, fb = s.fb, c = country(), tr = fb.trophies;
    p.innerHTML = '<div class="section-title">축구 경력</div><dl class="kv">' +
      '<dt>단계</dt><dd>' + esc(RA.Engine.Football.statusText(s)) + '</dd>' +
      '<dt>축구 실력</dt><dd>' + s.stats.football + ' <span class="muted">(성장 한계 ≈ ' + E.Football.cap(s) + ')</span></dd>' +
      '<dt>국가대표</dt><dd>' + (s.flags.nat_team ? esc(c.nationalTeam) + ' · A매치 ' + fb.caps + '경기 ' + fb.natGoals + '골' : '-') + '</dd>' +
      '<dt>거친 팀</dt><dd>' + (fb.clubs.length ? esc(fb.clubs.filter(function (x, i, a) { return a.indexOf(x) === i; }).join(' → ')) : '-') + '</dd>' +
      (fb.seasons ? '<dt>한 시즌 최다</dt><dd>' + fb.bestSeason + '골</dd>' : '') +
      '</dl><div class="section-title">트로피 진열장</div>';
    var t = h('<div class="trophies"></div>');
    t.appendChild(trophyBox('cup', tr.league, '리그'));
    t.appendChild(trophyBox('cup', tr.cup, '컵 대회'));
    t.appendChild(trophyBox('cup', tr.cont, '챔피언스 컵'));
    t.appendChild(trophyBox('cup', tr.natCup, E.Football.CONT_CUP[s.country]));
    t.appendChild(trophyBox('worldcup', tr.wc, '월드컵'));
    t.appendChild(trophyBox('ballon', tr.ballon, '발롱도르'));
    p.appendChild(t);
    p.appendChild(h('<p class="hint">정석 루트: 동네 클럽 ' + esc(c.clubs.local) + ' → ' + esc(c.clubs.regional) + ' → 12살에 ' + esc(c.places.bigcity) + '의 ' + esc(c.clubs.academy) + ' → 유스 → ' + esc(c.clubs.big) + ' 프로 데뷔 → 해외 빅클럽. 하지만 정해진 결말은 없어요.</p>'));
  }

  function panelGoals(p) {
    var s = app.s;
    var got = (RA.data.achievements || []).filter(function (a) { return s.achievements[a.id]; }).length;
    p.appendChild(h('<div class="section-title">업적 ' + got + ' / ' + RA.data.achievements.length + '</div>'));
    var box = h('<div class="achs"></div>');
    RA.data.achievements.forEach(function (a) {
      var on = s.achievements[a.id];
      box.appendChild(h('<div class="ach ' + (on ? 'got' : 'locked') + '"><div class="t">' + a.icon + ' ' + esc(a.name) + '</div><div class="muted">' + esc(a.desc) + (on ? ' · ' + on + '세' : '') + '</div></div>'));
    });
    p.appendChild(box);
  }

  // ---------------------------------------------------------------- jobs modal
  function showJobs() {
    var s = app.s;
    var list = E.jobList(s);
    var sectors = {}; list.forEach(function (j) { sectors[j.sector] = 1; });
    var m = modal('<div class="card-h">직업 찾기 <button class="btn btn-sm btn-ghost" id="x">닫기</button></div><div class="card-b"><div class="filter" id="flt"></div><div class="joblist" id="jl"></div></div>', { dismiss: true });
    m.querySelector('#x').addEventListener('click', closeModalAndGo);
    var flt = m.querySelector('#flt');
    [['ok', '지원 가능'], ['all', '전체']].concat(Object.keys(sectors).map(function (k) { return [k, C.SECTORS[k]]; })).forEach(function (f) {
      var b = h('<button class="' + (app.jobFilter === f[0] ? 'on' : '') + '">' + esc(f[1]) + '</button>');
      b.addEventListener('click', function () { app.jobFilter = f[0]; showJobs(); });
      flt.appendChild(b);
    });
    var jl = m.querySelector('#jl');
    var shown = list.filter(function (j) { return app.jobFilter === 'all' ? true : app.jobFilter === 'ok' ? j.ok : j.sector === app.jobFilter; });
    shown.sort(function (a, b) { return (b.ok - a.ok) || (b.salary - a.salary); });
    if (!shown.length) jl.appendChild(h('<p class="muted">조건에 맞는 직업이 없습니다. 공부하거나 나이를 먹어 보세요.</p>'));
    shown.slice(0, 80).forEach(function (j) {
      var row = h('<div class="job' + (j.ok ? '' : ' no') + '"><div><div class="n">' + esc(j.name) + ' <span class="muted">· ' + esc(C.SECTORS[j.sector]) + '</span></div><div class="muted" style="font-size:11px">초봉 ' + esc(money(j.salary)) + (j.ok ? ' · 합격 확률 약 ' + Math.round(j.chance * 100) + '%' : '') + '</div></div></div>');
      if (j.current) row.appendChild(h('<span class="gold">재직 중</span>'));
      else if (j.ok) {
        var b = h('<button class="btn btn-sm btn-green">지원</button>');
        b.addEventListener('click', function () {
          var r = E.applyJob(s, j.id);
          A.play(r.ok ? 'good' : 'bad'); toast(r.log); closeModal(); afterAction();
        });
        row.appendChild(b);
      } else row.appendChild(h('<span></span>'));
      row.appendChild(h('<div class="d">' + esc(j.desc) + '</div>'));
      if (!j.ok) row.appendChild(h('<div class="miss">필요: ' + esc(j.missing.join(', ')) + '</div>'));
      jl.appendChild(row);
    });
  }

  // ---------------------------------------------------------------- events
  // While auto-play is on, an open card covers the bottom bar, so the card carries its own stop and speed buttons.
  function autoRowHtml(label) {
    return '<div class="auto-row"><button class="btn btn-ghost auto-stop">' + label + '</button><button class="btn auto-speed" aria-label="속도">' + app.speed + 'x</button></div>';
  }
  function bindAutoStop(root) {
    var row = root.querySelector('.auto-row'); if (!row) return;
    row.querySelector('.auto-stop').addEventListener('click', function () { setAuto(false); row.remove(); });
    var sp = row.querySelector('.auto-speed');
    sp.addEventListener('click', function () {
      app.speed = app.speed === 1 ? 2 : 1;
      try { G.localStorage.setItem('ronaldo-adventure.speed', String(app.speed)); } catch (e) { /* ignore */ }
      sp.textContent = app.speed + 'x'; renderAgeBtn();
    });
  }
  function categoryHtml(cat) {
    if (!cat) return '';
    return '<div class="ev-cat" style="--cat:' + cat.color + '"><span class="ev-cat-ic">' + cat.icon + '</span>' + esc(cat.label) + '</div>';
  }
  function showEvent() {
    var s = app.s;
    var ev = E.currentEvent(s);
    if (!ev) { closeModal(); refresh(); return proceed(); }
    renderAgeBtn();
    var wrap = doc.createElement('div');
    wrap.className = 'ev-card' + (ev.pick ? ' is-pick' : '');
    wrap.style.setProperty('--cat', ev.category.color);
    var cvHolder = doc.createElement('div'); cvHolder.className = 'ev-pic';
    wrap.appendChild(cvHolder);
    var isYearDecision = s.y && s.y.yearDecision === ev.id;
    var body = h('<div class="card-b">' + categoryHtml(ev.category) + (isYearDecision ? '<span class="year-decision">🧭 올해의 결정</span>' : '') + '<p class="ev-text">' + esc(ev.text) + '</p><div class="choices"></div>' +
      (app.auto ? autoRowHtml('⏸ 자동 진행 끄기<small>선택을 기다리는 중</small>') : '') + '</div>');
    wrap.appendChild(body);
    ev.choices.forEach(function (ch) {
      var pct = ch.bet ? '<span class="p odds">' + Math.round(ch.bet.odds * 100) + '% · 💰×' + ch.bet.mult + '</span>'
        : ch.chance != null ? '<span class="p">성공 ' + Math.round(ch.chance * 100) + '%</span>' : '';
      var extra = (ch.risky ? '<span class="risky-tag">⚠️ 위험한 선택</span>' : '') +
        (ch.bet ? '<span class="desc">판돈 ' + esc(money(ch.bet.stake)) + ' · 이기면 ' + esc(money(Math.round(ch.bet.stake * (ch.bet.mult - 1)))) + ' 벌고, 지면 잃어요. 아주 드물게 잭팟(' + E.JACKPOT.x + '배 더)이 터져요. 🎲 도박 중독 +' + ch.bet.addict + '</span>' : '') +
        (ch.career ? '<span class="desc">💼 진로: ' + esc(ch.career) + '</span>' : '') +
        (ch.desc ? '<span class="desc">' + esc(ch.desc) + '</span>' : '') + (ch.preview ? chipsHtml(ch.preview, true) : '');
      var b = h('<button class="btn choice' + (ch.desc ? ' has-desc' : '') + (ch.risky ? ' is-risky' : '') + '" ' + (ch.enabled ? '' : 'aria-disabled="true"') + '><span class="ct"><span>' + esc(ch.text) + '</span>' + extra + '</span>' + (ch.enabled ? pct : '<span class="p">조건 부족</span>') + '</button>');
      b.addEventListener('click', function () {
        if (!ch.enabled) { A.play('bad'); toast('조건이 부족해서 고를 수 없어요.'); return; }
        onChoose(ch.i, ev);
      });
      body.querySelector('.choices').appendChild(b);
    });
    bindAutoStop(body);
    modal(wrap, { sheet: true });
    var scene = ev.scene;
    if (ev.pic) {
      var pc = doc.createElement('canvas'); pc.width = P.W; pc.height = P.H; pc.className = 'px';
      addCanvas(pc, function (t) { P.drawMilestone(pc.getContext('2d'), ev.pic, t, country(), lookOf(app.s)); });
      cvHolder.appendChild(pc);
    } else cvHolder.appendChild(portraitCanvas('', function () { return scene; }, function () { return lookOf(app.s); }));
  }
  // Bet result: the won/lost amount counts up in a banner, coins fall on a win, slot reels on a jackpot.
  function betFx(bet) {
    var root = $('#fx-root'); if (!root || !bet || !bet.delta) return;
    var up = bet.delta > 0;
    var el = h('<div class="bet-fx ' + (bet.jackpot ? 'jackpot' : up ? 'win' : 'lose') + '"><div class="bx">' +
      (bet.jackpot ? '<div class="reels"><i>7</i><i>7</i><i>7</i></div><div class="bt">잭팟!</div>' : '<div class="bt">' + (up ? '땄다!' : '잃었다…') + '</div>') +
      '<div class="amt">' + (up ? '+' : '−') + '0</div></div></div>');
    root.appendChild(el);
    var amt = el.querySelector('.amt'), total = Math.abs(bet.delta), t0 = performance.now(), dur = bet.jackpot ? 1400 : 900;
    var coins = null;
    if (up) {
      coins = doc.createElement('canvas'); coins.width = 120; coins.height = 80; coins.className = 'px';
      coins.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none';
      root.insertBefore(coins, el);
    }
    // purely visual particles (Math.random is fine: not outcome-affecting)
    var parts = [];
    for (var i = 0; up && i < (bet.jackpot ? 70 : 26); i++) parts.push({ x: Math.random() * 120, y: -Math.random() * 50, vy: .5 + Math.random(), r: Math.random() < .5 });
    (function step(t) {
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      amt.textContent = (up ? '+' : '−') + money(Math.round(total * e));
      if (coins) {
        var c = coins.getContext('2d'); c.clearRect(0, 0, 120, 80);
        parts.forEach(function (p) { p.y += p.vy; c.fillStyle = '#b8860b'; c.fillRect(Math.round(p.x), Math.round(p.y), 3, 3); c.fillStyle = p.r ? '#f5c518' : '#ffe680'; c.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); });
      }
      if (t - t0 < dur + 900) G.requestAnimationFrame(step); else { el.remove(); if (coins) coins.remove(); }
    })(t0);
  }
  function onChoose(i, ev) {
    var s = app.s;
    var res = E.choose(s, i);
    if (!res) return;
    if (res.bet) { A.play(res.bet.jackpot ? 'jackpot' : res.bet.won ? 'coins' : 'lose'); betFx(res.bet); app.mood = res.bet.won ? 'celebrate' : 'sad'; app.moodUntil = performance.now() + 2000; }
    else if (res.outcome === 'fail') { A.play('bad'); app.mood = 'sad'; app.moodUntil = performance.now() + 2000; }
    else { A.play(res.sound || 'good'); if (res.outcome === 'success') { app.mood = 'celebrate'; app.moodUntil = performance.now() + 1800; } }
    triumphCue();
    var m = $('.modal');
    var pic = m && m.querySelector('.ev-pic');
    if (pic && res.fx) { pic.classList.remove('fx-shake', 'fx-glow', 'fx-dim'); void pic.offsetWidth; pic.classList.add('fx-' + res.fx); }
    var body = m.querySelector('.card-b');
    body.innerHTML = categoryHtml(ev.category) + '<p class="ev-text muted">' + esc(ev.text) + '</p>' +
      '<div class="result ' + (res.outcome === 'fail' ? 'fail' : '') + '">' + (res.outcome === 'success' ? '✔ 성공! ' : res.outcome === 'fail' ? '✖ 실패… ' : '') + esc(res.log) +
      res.changes.filter(function (c) { return c.k === 'msg'; }).map(function (c) { return '<br>▸ ' + esc(c.t); }).join('') + '</div>' +
      chipsHtml(res.changes) +
      '<button class="btn btn-green btn-big" id="next" style="width:100%">' + (s.queue.length ? '다음 ▶' : (s.alive ? '계속하기 ▶' : '…')) + '</button>' +
      (app.auto ? autoRowHtml('⏸ 자동 진행 끄기') : '');
    bindAutoStop(body);
    var nb = body.querySelector('#next');
    var go = function () {
      A.play('click');
      save();
      if (!s.alive) { closeModal(); return renderSummary(); }
      if (s.queue.length && !unseenCards()) return showEvent();
      closeModal(); afterAction();
    };
    nb.addEventListener('click', go);
    nb.focus();
    refresh();
    // in auto mode a plain result (no further choice) moves on by itself
    if (app.auto) setTimeout(function () { if (doc.body.contains(nb) && app.auto) go(); }, autoDelay() + 600);
  }

  // ---------------------------------------------------------------- flow, montage and auto-play
  function autoDelay() { return app.speed === 2 ? 900 : 1800; }
  function cardDelay() { return app.speed === 2 ? 1000 : 1700; }
  function triumphCue() { var s = app.s; if (s && s.y && s.y.triumph) { s.y.triumph = null; if (!A.siuu()) A.play('goal'); } }
  function unseenCards() {
    var s = app.s; if (!s || !s.cards) return 0;
    if (app.cardsAge !== s.age) { app.cardsAge = s.age; app.cardsShown = 0; }
    return Math.max(0, s.cards.length - app.cardsShown);
  }
  function setAuto(on) {
    app.auto = !!on;
    clearTimeout(app.autoTimer);
    renderAgeBtn();
    toast(app.auto ? '▶ 자동 진행을 켰어요. 선택이 필요하면 멈춰요.' : '⏸ 자동 진행을 껐어요.', 1800);
    if (app.auto) proceed();
  }
  // Decide what happens next: cards → choices → (montage or auto) next year.
  function proceed(fast) {
    var s = app.s;
    clearTimeout(app.autoTimer);
    if (!s || app.screen !== 'game') return;
    if (!s.alive) { setTimeout(renderSummary, 600); return; }
    if ($('.modal-wrap') || app.montageOpen) { if (app.auto || E.isMontage(s)) app.autoTimer = setTimeout(proceed, 800); return; }
    if (unseenCards()) return showMontage();
    if (s.queue.length) return showEvent();
    renderAgeBtn();
    if (E.isMontage(s)) { app.autoTimer = setTimeout(onAgeUp, fast ? 50 : 500); return; }
    if (app.auto) app.autoTimer = setTimeout(function () { if (app.auto && !$('.modal-wrap') && !app.montageOpen) onAgeUp(); else proceed(); }, autoDelay());
  }
  function showMontage() {
    var s = app.s, c = country();
    app.montageOpen = true;
    var root = $('#fx-root');
    var ov = h('<div class="montage" role="dialog" aria-label="아기 시절"><div class="mt-card card"><div class="mt-age"></div><div class="mt-pic"></div><p class="mt-text"></p><div class="mt-chips"></div><div class="mt-dots"></div><p class="mt-hint">화면을 누르면 넘어가요</p></div></div>');
    root.appendChild(ov);
    var cv = doc.createElement('canvas'); cv.width = P.W; cv.height = P.H; cv.className = 'px';
    ov.querySelector('.mt-pic').appendChild(cv);
    var cur = null, timer = null;
    addCanvas(cv, function (t) {
      if (!cur) return;
      var ms = (RA.data.milestones || []).filter(function (m) { return m.id === cur.id; })[0];
      P.drawMilestone(cv.getContext('2d'), cur.pic, t, c, lookOf(s), cur.props || (ms && ms.props));
    });
    function show() {
      var left = unseenCards();
      if (!left) { finish(); return; }
      cur = s.cards[app.cardsShown];
      ov.querySelector('.mt-age').textContent = cur.age === 0 ? '태어난 해' : cur.age + '살';
      ov.querySelector('.mt-text').textContent = cur.text;
      ov.querySelector('.mt-chips').innerHTML = chipsHtml(cur.chg);
      var dots = ''; for (var i = 0; i < s.cards.length; i++) dots += '<i class="' + (i <= app.cardsShown ? 'on' : '') + '"></i>';
      ov.querySelector('.mt-dots').innerHTML = dots;
      var card = ov.querySelector('.mt-card'); card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop');
      A.play('click');
      clearTimeout(timer); timer = setTimeout(next, cardDelay());
    }
    function next() { clearTimeout(timer); app.cardsShown++; show(); }
    function finish() { clearTimeout(timer); app.montageOpen = false; ov.remove(); refresh(); proceed(); }
    ov.addEventListener('click', next);
    show();
  }
  // ---------------------------------------------------------------- age up
  function onAgeUp() {
    var s = app.s;
    clearTimeout(app.autoTimer);
    if (!s || app.screen !== 'game') return;
    if (!s.alive) return renderSummary();
    if (s.queue.length) return showEvent();
    if ($('.modal-wrap') || app.montageOpen) return;
    E.ageUp(s);
    var baby = E.isMontage(s) || unseenCards();
    if (!baby) { A.play('age'); ageFlash(s.age); }
    save();
    if (isPhone()) app.tab = E.isMontage(s) ? app.tab : 'log';
    refresh(true);
    var anim = s.y.anim;
    var news = s.y.newAchievements; s.y.newAchievements = null;
    var hadTriumph = !!s.y.triumph;
    triumphCue();
    setTimeout(function () {
      if (anim) celebrate(anim, hadTriumph);
      if (news) news.forEach(function (id) { var a = achById(id); if (a) toast('🏅 업적 달성: ' + a.name); });
      if (news && news.length && !anim && !hadTriumph) A.play('achieve');
      if (!s.alive) { A.play('death'); return setTimeout(renderSummary, anim ? 2600 : 1200); }
      setTimeout(proceed, anim ? 1800 : 50);
    }, baby ? 50 : 650);
  }

  // ---------------------------------------------------------------- summary
  function renderSummary() {
    var s = app.s;
    if (!s) return renderStart();
    app.screen = 'summary';
    app.auto = false; clearTimeout(app.autoTimer); doc.body.classList.remove('auto-on');
    closeModal();
    var sum = E.summary(s);
    var newEnding = recordEnding(s, sum.ending);
    var scr = $('#screen'); scr.innerHTML = '';
    var heirs = E.heirs(s);
    var el = h('<div class="summary">' +
      '<section class="card"><div class="grave"></div><div class="card-b">' +
      (sum.ending ? '<div class="ending-card ' + sum.ending.kind + '"><div class="ec-icon">' + sum.ending.icon + '</div><div><div class="ec-kind">' + (sum.ending.kind === 'win' ? '엔딩' : '실패 엔딩') + (newEnding ? ' · <b class="gold">새 엔딩!</b>' : '') + '</div><div class="ec-name">' + esc(sum.ending.name) + '</div><div class="ec-desc">' + esc(sum.ending.desc) + '</div></div></div>' : '') +
      '<div style="font-size:20px;font-weight:700">' + esc(sum.name) + '</div>' +
      '<div class="muted">' + sum.born + ' – ' + sum.died + ' · ' + sum.age + '세 · ' + esc(sum.cause) + '</div>' +
      '<div class="titles" style="margin:10px 0">' + sum.titles.slice(0, 4).map(function (t, i) { return '<span class="ribbon' + (i ? ' sub' : '') + '" title="' + esc(t.desc) + '">' + esc(t.name) + '</span>'; }).join('') + '</div>' +
      '<dl class="kv"><dt>남긴 재산</dt><dd class="money' + (sum.money < 0 ? ' neg' : '') + '">' + esc(sum.moneyText) + (sum.money < 0 ? ' (빚)' : '') + '</dd><dt>명성</dt><dd>' + sum.fame + '</dd><dt>최종 학력</dt><dd>' + esc(sum.degree) + '</dd>' +
      (sum.football ? '<dt>축구</dt><dd>' + sum.football.apps + '경기 ' + sum.football.goals + '골 · 발롱도르 ' + sum.football.trophies.ballon + ' · 월드컵 ' + sum.football.trophies.wc + '</dd>' : '') +
      (sum.bestJob ? '<dt>최고 경력</dt><dd>' + esc(sum.bestJob.name) + ' · ' + esc(sum.bestJob.title) + '</dd>' : '') +
      '<dt>자녀</dt><dd>' + sum.children + '명</dd><dt>시드</dt><dd>' + esc(sum.seed) + (sum.generation > 1 ? ' · ' + sum.generation + '대째' : '') + '</dd></dl>' +
      '<div class="section-title">다음 인생</div><div class="heirs" id="heirs"></div>' +
      '<div class="row" style="margin-top:10px"><button class="btn btn-gold grow" id="btn-replay">같은 시드로 다시</button><button class="btn grow" id="btn-new">새 인생</button></div>' +
      '<div class="row" style="margin-top:8px"><button class="btn grow" id="btn-hall">📖 엔딩 도감</button></div>' +
      '</div></section>' +
      '<section class="card"><div class="card-h">인생 이야기 <button class="btn btn-sm btn-green" id="btn-copy">복사해서 자랑하기</button></div><div class="card-b">' +
      '<textarea class="story" id="story" readonly></textarea>' +
      '<div class="section-title">업적 ' + sum.achievements.length + '개</div><div class="achs" id="achs"></div>' +
      '<div class="section-title">마지막 기록</div><div class="log" style="max-height:320px;padding:0">' + renderLogHtml({ log: s.log.slice(-40) }) + '</div>' +
      '</div></section></div>');
    scr.appendChild(el);
    $('.grave', el).appendChild(portraitCanvas('', function () { return 'grave'; }));
    $('#story', el).value = sum.story;
    var ab = $('#achs', el);
    if (!sum.achievements.length) ab.appendChild(h('<p class="muted">이번 생엔 업적이 없었어요. 다음엔 꼭!</p>'));
    sum.achievements.forEach(function (a) { ab.appendChild(h('<div class="ach got"><div class="t">' + a.icon + ' ' + esc(a.name) + '</div><div class="muted">' + esc(a.desc) + '</div></div>')); });
    var hb = $('#heirs', el);
    if (!heirs.length) hb.appendChild(h('<p class="muted">이어 갈 자녀가 없습니다.</p>'));
    heirs.forEach(function (k) {
      var b = h('<button class="btn btn-green">' + esc(k.name) + ' (' + k.age + '세)로 이어서 살기 · 유산 상속</button>');
      b.addEventListener('click', function () {
        A.play('age');
        app.s = E.continueAsChild(s, k.id);
        save(); app.tab = isPhone() ? 'log' : 'acts'; app.cardsAge = -1; renderGame();
        toast(s.generation + 1 + '대째 이야기가 시작됩니다.');
        proceed();
      });
      hb.appendChild(b);
    });
    $('#btn-replay', el).addEventListener('click', function () {
      var cc = RA.data.countries[s.country];
      if (s.generation > 1) { startGame({ country: s.country, seed: s.seed.split('-G')[0], given: E.heroName(s) }); return; }
      void cc;
      startGame({ country: s.country, seed: s.seed, gender: s.hero.gender, slot: app.slot, given: E.heroName(s) });
    });
    $('#btn-new', el).addEventListener('click', function () { renderStart(); });
    $('#btn-hall', el).addEventListener('click', showEndings);
    $('#btn-copy', el).addEventListener('click', function () {
      var ta = $('#story');
      var done = function () { toast('인생 이야기를 복사했어요!'); };
      if (G.navigator.clipboard && G.navigator.clipboard.writeText) G.navigator.clipboard.writeText(ta.value).then(done, function () { ta.select(); doc.execCommand('copy'); done(); });
      else { ta.select(); doc.execCommand('copy'); done(); }
    });
    save();
  }

  // ---------------------------------------------------------------- menu
  function showMenu() {
    var list = S.list();
    var m = modal('<div class="card-h">메뉴 <button class="btn btn-sm btn-ghost" id="x">닫기</button></div><div class="card-b">' +
      (app.s ? '<div class="section-title">저장 슬롯 (현재: ' + app.slot + '번 · 매년 자동 저장)</div>' : '<div class="section-title">저장 슬롯</div>') +
      '<div class="slots" id="mslots"></div>' +
      (app.s ? '<div class="section-title">캐릭터</div><button class="btn" id="btn-rename">✏️ 이름 바꾸기</button>' : '') +
      '<div class="section-title">인생 길잡이</div><div class="row">' + (app.s ? '<button class="btn grow" id="m-path">🧭 진로</button>' : '') + '<button class="btn grow" id="m-endings">📖 엔딩 도감</button></div>' +
      '<div class="section-title">게임</div><div class="row"><button class="btn grow" id="m-new">새 인생</button>' + (app.s ? '<button class="btn grow" id="m-help">도움말</button>' : '') + '</div>' +
      '<p class="hint">비공식 팬 패러디 게임입니다. 실존 인물·구단과 관계가 없으며 등장하는 구단·학교 이름은 모두 가상입니다. 폰트: Galmuri (OFL-1.1).</p></div>', { dismiss: true });
    m.querySelector('#x').addEventListener('click', closeModal);
    var rename = m.querySelector('#btn-rename'); if (rename) rename.addEventListener('click', editHeroName);
    m.querySelector('#m-new').addEventListener('click', function () { closeModal(); renderStart(); });
    var hb = m.querySelector('#m-help'); if (hb) hb.addEventListener('click', showHelp);
    var pb = m.querySelector('#m-path'); if (pb) pb.addEventListener('click', showPaths);
    m.querySelector('#m-endings').addEventListener('click', showEndings);
    var box = m.querySelector('#mslots');
    list.slots.forEach(function (x) {
      var meta = x.meta;
      var row = h('<div class="slot"><span class="grow">' + x.slot + '번 · ' + (meta ? esc(meta.name) + ' ' + meta.age + '세' + (meta.alive ? '' : ' (사망)') : '비어 있음') + '</span></div>');
      if (app.s) { var sb = h('<button class="btn btn-sm btn-green">여기에 저장</button>'); sb.addEventListener('click', function () { app.slot = x.slot; save(); toast(x.slot + '번 슬롯에 저장했습니다.'); showMenu(); }); row.appendChild(sb); }
      if (meta) {
        var lb = h('<button class="btn btn-sm btn-gold">불러오기</button>'); lb.addEventListener('click', function () { closeModal(); loadSlot(x.slot); }); row.appendChild(lb);
        var db = h('<button class="btn btn-sm btn-red" title="삭제">✕</button>'); db.addEventListener('click', function () { if (G.confirm(x.slot + '번 슬롯을 지울까요?')) { S.remove(x.slot); showMenu(); } }); row.appendChild(db);
      }
      box.appendChild(row);
    });
  }
  // ---------------------------------------------------------------- 진로 panel
  function showPaths() {
    var s = app.s; if (!s) return;
    var d = E.Routes.panel(s);
    var item = function (x, open) {
      return '<div class="path ' + (open ? 'open' : 'locked') + '"><div class="pn">' + (open ? '🔓 ' : '🔒 ') + esc(x.name) + ' <span class="muted">· ' + esc(x.group) + ' · 맞는 정도 ' + x.fit + '</span></div>' +
        (x.ladder ? '<div class="pl">' + x.ladder.map(esc).join(' → ') + '</div>' : '') +
        '<div class="ph">' + esc(x.how ? '시작: ' + x.how + '. ' : '') + esc(x.text) + (open ? '' : ' · 지금 부족한 것: ' + esc(x.miss.join(', '))) + '</div></div>';
    };
    var m = modal('<div class="card-h">🧭 진로 지도 <button class="btn btn-sm btn-ghost" id="x">닫기</button></div><div class="card-b">' +
      routeHtml(s) +
      '<p class="hint">길은 정해진 출구로만 바뀌어요: 실패·방출·부상·은퇴·지침·스캔들, 또는 갈림길에서 내가 고를 때. 운동·연예·예술·전문직 길은 입단·오디션·면허로 시작하고, 회사·장사 같은 길은 "구직/이직"으로 시작해요.</p>' +
      '<div class="section-title">지금 시작할 수 있는 길 ' + d.open.length + '</div><div class="paths">' + (d.open.map(function (x) { return item(x, true); }).join('') || '<p class="muted">지금은 없어요. 나이·학교 과정·몸과 재능이 맞으면 열려요.</p>') + '</div>' +
      '<div class="section-title">아직 닫힌 길 ' + d.locked.length + '</div><div class="paths">' + d.locked.map(function (x) { return item(x, false); }).join('') + '</div>' +
      '</div>', { dismiss: true });
    m.querySelector('#x').addEventListener('click', closeModalAndGo);
  }

  // ---------------------------------------------------------------- 엔딩 도감 (kept across lives in this browser)
  var ENDINGS_KEY = 'ronaldo-adventure.endings';
  function endingHall() { try { return JSON.parse(G.localStorage.getItem(ENDINGS_KEY) || '{}'); } catch (e) { return {}; } }
  function recordEnding(s, en) {
    if (!en || s.endingRecorded) return false;
    var hall = endingHall(), isNew = !hall[en.id];
    hall[en.id] = { count: (hall[en.id] ? hall[en.id].count : 0) + 1, last: s.year, country: s.country };
    try { G.localStorage.setItem(ENDINGS_KEY, JSON.stringify(hall)); } catch (e) { /* ignore */ }
    s.endingRecorded = true;
    return isNew;
  }
  function showEndings() {
    var hall = endingHall(), all = RA.data.endings || [];
    var got = all.filter(function (e) { return hall[e.id]; }).length;
    var m = modal('<div class="card-h">📖 엔딩 도감 ' + got + ' / ' + all.length + ' <button class="btn btn-sm btn-ghost" id="x">닫기</button></div><div class="card-b"><div class="endings">' +
      all.map(function (e) {
        var h0 = hall[e.id];
        return '<div class="ending ' + (h0 ? 'got ' + e.kind : 'locked') + '"><div class="ei">' + (h0 ? e.icon : '❔') + '</div><div><div class="en">' + (h0 ? esc(e.name) : '???') + (h0 && h0.count > 1 ? ' <span class="muted">×' + h0.count + '</span>' : '') + '</div>' +
          '<div class="ed">' + (h0 ? esc(e.desc) : '힌트: ' + esc(e.hint)) + '</div></div></div>';
      }).join('') + '</div><p class="hint">실패한 인생도 엔딩이에요. 모든 엔딩을 모아 보세요.</p></div>', { dismiss: true });
    m.querySelector('#x').addEventListener('click', closeModalAndGo);
  }

  function showHelp() {
    var m = modal('<div class="card-h">도움말 <button class="btn btn-sm btn-ghost" id="x">닫기</button></div><div class="card-b" style="font-size:13px">' +
      '<p>⓪ 아기 시절(0~4살)은 사진첩처럼 자동으로 흘러가요. 태교와 조기 교육, 두 가지만 직접 골라요.</p>' +
      '<p>① <b class="gold">활동</b> 탭에서 한 해에 행동력 3만큼 하고 싶은 일을 고르세요.</p>' +
      '<p>② <b class="gold">+1살 나이 먹기</b>를 누르면 한 해가 지나고 사건이 일어납니다. 선택지마다 결과가 다르고, 어떤 선택은 몇 년 뒤에 돌아옵니다.</p>' +
      '<p>③ 인생은 <b class="gold">길(루트)</b>을 따라 이어져요. 태어날 때 정해진 몸(키·체격·목소리…)과 태교·조기 교육으로 생긴 재능, 13살·16살에 고르는 학교 과정(진학반·문과·이과·예체능·특성화·연습생…)에 따라 열리는 길이 달라요. 축구·농구·야구·격투기, 아이돌·가수·밴드·배우·개그맨·모델, 미술·요식업, 법조계·의료계, 회사·공무원·장사… 한 길에 들어서면 그 길의 일만 일어나고, 실패·부상·은퇴나 갈림길의 선택으로만 다음 길로 넘어가요. 학업·직업 탭과 🧭 진로 지도에서 지금 단계와 다음 조건을 볼 수 있어요.</p>' +
      '<p>④ 생을 마치면 인생 결산과 칭호가 나오고, 자녀가 있으면 유산을 물려받아 자녀의 삶을 이어 갈 수 있어요.</p>' +
      '<p>⑤ 아래쪽 <b class="gold">▶ 자동 진행</b>을 켜면 해마다 저절로 넘어가고, 선택이 필요할 때만 멈춰요. 1x/2x로 속도를 바꿀 수 있어요.</p>' +
      '<p class="muted">같은 시드에서 같은 선택을 하면 똑같은 인생이 펼쳐집니다. Enter 키로도 나이를 먹을 수 있어요.</p></div>', { dismiss: true });
    m.querySelector('#x').addEventListener('click', closeModal);
  }

  // ---------------------------------------------------------------- boot
  function boot() {
    // The old title preference is obsolete; the game itself is always 인생게임.
    try { G.localStorage.removeItem('ronaldo-adventure.name'); } catch (e) { /* blocked storage */ }
    $('#btn-mute').textContent = A.isMuted() ? '🔇' : '🔊';
    $('#btn-mute').addEventListener('click', function () { var mu = A.toggle(); $('#btn-mute').textContent = mu ? '🔇' : '🔊'; if (!mu) A.play('click'); });
    $('#btn-menu').addEventListener('click', showMenu);
    $('#btn-home').addEventListener('click', function () { if (app.screen === 'start') return; showMenu(); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && $('.modal-wrap') && !app.s || (e.key === 'Escape' && $('.modal-wrap') && !(app.s && app.s.queue.length))) closeModal();
      if (e.key === 'Enter' && app.screen === 'game' && !$('.modal-wrap') && !app.montageOpen && doc.activeElement === doc.body) onAgeUp();
    });
    var resizeTimer = null, lastW = G.innerWidth;
    function onViewportChange(e) {
      // height-only changes (mobile address bar showing/hiding) must not rebuild the screen
      if (e && e.type === 'resize' && G.innerWidth === lastW) { redrawAll(); return; }
      lastW = G.innerWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (app.screen === 'game' && app.s) renderGame();
        else if (app.screen === 'summary' && app.s) renderSummary();
        else if (app.screen === 'start') renderStart();
        redrawAll();
      }, 150);
    }
    G.addEventListener('resize', onViewportChange);
    G.addEventListener('orientationchange', onViewportChange);
    try { app.speed = Number(G.localStorage.getItem('ronaldo-adventure.speed')) === 2 ? 2 : 1; } catch (e) { app.speed = 1; }
    // the web app manifest only makes sense (and only loads without errors) over http(s), not from file://
    if (/^https?:$/.test(G.location.protocol)) { var ln = doc.createElement('link'); ln.rel = 'manifest'; ln.href = 'manifest.webmanifest'; doc.head.appendChild(ln); }
    var list = S.list();
    renderStart();
    G.requestAnimationFrame(loop);
    void list;
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot); else boot();
})(typeof globalThis !== 'undefined' ? globalThis : this);
