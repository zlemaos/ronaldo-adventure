/* DOM rendering and input. All game rules live in the engine; this file only presents state. */
(function (G) {
  'use strict';
  var RA = G.RA, E = RA.Engine, C = RA.C, T = RA.Text, P = RA.Pixel, S = RA.Save, A = RA.Audio;
  var doc = G.document;
  var $ = function (sel, root) { return (root || doc).querySelector(sel); };

  var app = {
    s: null, slot: 1, tab: 'acts', screen: 'start', mood: null, moodUntil: 0,
    sel: { country: 'kr', gender: 'm', name: '', seed: '' },
    canvases: [], jobFilter: 'ok'
  };
  G.__app = app; // handy for debugging / headless checks

  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function h(html) { var d = doc.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  function country() { return RA.data.countries[app.s ? app.s.country : app.sel.country]; }
  function money(v) { return T.money(v, country()); }

  var STAT_COLORS = { health: '#ff5470', happy: '#f5c518', smarts: '#60a5fa', looks: '#f472b6', football: '#2fd171', grit: '#f97316', fame: '#a78bfa' };
  var SHORT = { health: '건강', happy: '행복', smarts: '지능', looks: '외모', football: '축구', grit: '근성', fame: '명성' };
  var STAT_ICONS = { health: '❤', happy: '☺', smarts: '✎', looks: '✦', football: '⚽', grit: '▲', fame: '★' };

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
      age: s.age, skin: c.skin[s.hero.skin % c.skin.length], hairColor: c.hair, hair: s.hero.hair,
      outfit: E.outfit(s), gender: s.hero.gender, number: s.flags.number7 ? 7 : 28, sick: !!s.sick, mood: m
    };
  }
  function portraitCanvas(cls, sceneFn, lookFn, heroX) {
    var cv = doc.createElement('canvas'); cv.width = P.W; cv.height = P.H; cv.className = 'px ' + (cls || '');
    addCanvas(cv, function (t) {
      var ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
      var sc = sceneFn(); P.drawScene(ctx, sc, t, country());
      var lk = lookFn && lookFn(); if (lk && sc !== 'grave') P.drawHero(ctx, heroX || 80, 88, Object.assign({ t: t }, lk));
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
  function chipsHtml(changes) {
    if (!changes || !changes.length) return '';
    var agg = {};
    changes.forEach(function (c) { if (c.k === 'msg' || c.k === 'rel') return; agg[c.k] = (agg[c.k] || 0) + c.d; });
    var out = Object.keys(agg).filter(function (k) { return agg[k]; }).map(function (k) {
      var v = agg[k], lab = C.STAT_LABELS[k] || k;
      var txt = k === 'money' ? (v > 0 ? '+' : '') + money(v) : (v > 0 ? '+' : '') + v;
      return '<span class="chip ' + (v > 0 ? 'up' : 'down') + '">' + esc(lab) + ' ' + esc(txt) + '</span>';
    });
    changes.filter(function (c) { return c.k === 'rel'; }).forEach(function (c) {
      out.push('<span class="chip ' + (c.d > 0 ? 'up' : 'down') + '">관계 ' + (c.d > 0 ? '♥' : '♡') + '</span>');
    });
    return out.length ? '<div class="chips">' + out.join('') + '</div>' : '';
  }
  function ageFlash(age) {
    var el = h('<div class="age-flash"><div class="big">' + age + '살<small>' + (app.s.year) + '년</small></div></div>');
    doc.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 1000);
  }
  function celebrate(kind) {
    var label = { trophy: '우승!', ballon: '발롱도르!', worldcup: '월드컵 우승!', goal: '골!!', achieve: '업적 달성!' }[kind] || '축하해요!';
    A.play(kind === 'achieve' ? 'achieve' : 'trophy');
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
  function modal(inner, opts) {
    opts = opts || {};
    var wrap = h('<div class="modal-wrap" role="dialog" aria-modal="true"><div class="modal card"></div></div>');
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
      '<div class="field"><label>이름 (비워 두면 기본 이름)</label><input type="text" id="in-name" maxlength="12" placeholder="' + esc(c.hero.given) + '"></div>' +
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
    banner.appendChild(h('<div class="title-over"><h1>호날두의 모험</h1><p>도트 인생 시뮬레이션 · 비공식 팬 패러디</p></div>'));
    // countries
    var grid = $('#countries', el);
    Object.keys(RA.data.countries).forEach(function (id) {
      var cc = RA.data.countries[id];
      var b = h('<button class="country' + (id === app.sel.country ? ' sel' : '') + '" data-id="' + id + '"><canvas class="px" width="24" height="16"></canvas><span>' + esc(cc.name) + '</span></button>');
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
    $('#in-name', el).value = app.sel.name;
    $('#in-seed', el).value = app.sel.seed;
    $('#in-name', el).addEventListener('input', function (e) { app.sel.name = e.target.value; });
    $('#in-seed', el).addEventListener('input', function (e) { app.sel.seed = e.target.value; });
    $('#btn-dice', el).addEventListener('click', function () { app.sel.seed = RA.RNG.randomSeedString(); $('#in-seed').value = app.sel.seed; });
    Array.prototype.forEach.call(el.querySelectorAll('#seg-g button'), function (b) {
      if (b.dataset.g === app.sel.gender) b.classList.add('on');
      b.addEventListener('click', function () { app.sel.gender = b.dataset.g; renderStart(); });
    });
    $('#btn-start', el).addEventListener('click', function () { startGame(); });
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
    A.play('age');
    var seed = opts.seed || app.sel.seed || RA.RNG.randomSeedString();
    app.s = E.newGame({ country: opts.country || app.sel.country, seed: seed, given: opts.given || (app.sel.name.trim() || undefined), gender: opts.gender || app.sel.gender });
    var list = S.list();
    var empty = list.slots.filter(function (x) { return !x.meta || !x.meta.alive; })[0];
    app.slot = opts.slot || (empty ? empty.slot : 1);
    app.tab = isPhone() ? 'log' : 'acts';
    save();
    renderGame();
    toast('슬롯 ' + app.slot + '에 자동 저장됩니다. 시드: ' + seed);
  }
  function loadSlot(n) {
    try {
      var s = S.load(n);
      if (!s) return toast('저장된 인생이 없습니다.');
      app.s = s; app.slot = n;
      if (!s.alive) return renderSummary();
      renderGame();
      if (s.queue.length) showEvent();
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
    var chip = $('#seed-chip'); chip.hidden = false; chip.textContent = '시드 ' + s.seed + (s.generation > 1 ? ' · ' + s.generation + '대' : '');
    var scr = $('#screen'); scr.innerHTML = '';
    var el = h('<div class="game">' +
      '<aside class="side">' +
      '  <section class="card portrait"><div class="portrait-row"><div class="pcv"></div><div class="who" id="who"></div></div></section>' +
      '  <section class="card"><div class="card-h">능력치</div><div class="card-b stats" id="stats"></div></section>' +
      '  <div class="age-dock"><button class="age-btn" id="btn-age"></button></div>' +
      '</aside>' +
      '<section class="card logcol"><div class="card-h">인생 기록 <span class="muted" id="log-count"></span></div><div class="log" id="log"></div></section>' +
      '<section class="card panelcol"><div class="tabs" id="tabs"></div><div class="tabpanel" id="panel"></div></section>' +
      '</div>');
    scr.appendChild(el);
    $('.pcv', el).appendChild(portraitCanvas('', function () { return E.homeScene(app.s); }, function () { return lookOf(app.s); }));
    $('#btn-age', el).addEventListener('click', onAgeUp);
    refresh(true);
  }

  function refresh(full) {
    if (app.screen !== 'game') return;
    renderWho(); renderStats(); renderAgeBtn(); renderLog(full); renderTabs(); renderPanel();
  }

  function renderWho() {
    var s = app.s, c = country();
    var ap = ''; for (var i = 0; i < E.AP_PER_YEAR; i++) ap += '<i class="' + (i < s.ap ? '' : 'off') + '"></i>';
    var where = s.jail > 0 ? '수감 중 (' + s.jail + '년 남음)' : (s.flags.abroad ? (s.abroadCity || '해외') : (s.flags.moved_alone && s.age < 40 ? c.places.bigcity : c.places.city));
    $('#who').innerHTML =
      '<div class="nm"><span class="age">' + s.age + '살</span><span>' + esc(E.fullName(c, s.hero.surname, s.hero.given)) + '</span></div>' +
      '<div class="sub">' + esc(c.name) + ' · ' + esc(where) + ' · ' + s.year + '년</div>' +
      '<div class="sub">' + esc(s.job ? E.jobTitle(s) : eduLabel(s)) + '</div>' +
      '<div class="money">' + esc(money(s.money)) + '</div>' +
      '<div class="ap">행동력 ' + ap + '</div>';
  }
  function eduLabel(s) {
    var c = country(), st = c.school[s.edu.stage];
    if (st && st.school) return st.school + ' 재학';
    if (s.edu.stage === 'univ') return s.edu.univ + ' ' + (C.MAJORS[s.edu.major] || '') + ' 재학';
    if (s.edu.stage === 'grad') return s.edu.univ + ' 대학원';
    if (s.age < c.school.elem.from) return '미취학 어린이';
    if (s.fb.stage !== 'none' && s.fb.stage !== 'retired') return C.FB_STAGE_LABELS[s.fb.stage];
    return s.retiredFromWork ? '은퇴' : '무직 · ' + C.DEGREE_LABELS[s.edu.degree];
  }
  var prevStats = {};
  function renderStats() {
    var s = app.s, box = $('#stats');
    if (!box.children.length) {
      C.STATS.forEach(function (k) {
        box.appendChild(h('<div class="stat" data-k="' + k + '" title="' + C.STAT_LABELS[k] + '"><span>' + STAT_ICONS[k] + ' ' + SHORT[k] + '</span><div class="bar"><i></i></div><span class="v"></span></div>'));
      });
    }
    C.STATS.forEach(function (k) {
      var row = box.querySelector('[data-k="' + k + '"]');
      var v = s.stats[k], i = row.querySelector('i'), vv = row.querySelector('.v');
      i.style.width = v + '%'; i.style.backgroundColor = STAT_COLORS[k];
      if (prevStats[k] != null && prevStats[k] !== v) {
        vv.classList.remove('flash-up', 'flash-down'); void vv.offsetWidth;
        vv.classList.add(v > prevStats[k] ? 'flash-up' : 'flash-down');
      }
      vv.textContent = v; prevStats[k] = v;
    });
  }
  function renderAgeBtn() {
    var s = app.s, b = $('#btn-age');
    if (!s.alive) { b.innerHTML = '인생 결산 보기<small>이번 생이 끝났습니다</small>'; return; }
    b.innerHTML = '+1살 나이 먹기 <small>' + (s.queue.length ? '먼저 일어난 일에 답하세요' : (s.age + 1) + '살이 됩니다 · 남은 행동력 ' + s.ap) + '</small>';
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
      else cur.push('<div class="e k-' + esc(e.k) + '">' + esc(e.t) + '</div>');
    });
    if (newestFirst) groups.reverse();
    return groups.map(function (g) { return g.join(''); }).join('');
  }

  var TABS = [['log', '기록'], ['acts', '활동'], ['people', '관계'], ['career', '학업·직업'], ['football', '축구'], ['goals', '업적']];
  function renderTabs() {
    var box = $('#tabs'); box.innerHTML = '';
    if (!isPhone() && app.tab === 'log') app.tab = 'acts';
    TABS.forEach(function (t) {
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
    var news = app.s.y.newAchievements; app.s.y.newAchievements = null;
    refresh();
    if (news && news.length) { A.play('achieve'); news.forEach(function (id) { var a = achById(id); if (a) toast('🏅 업적 달성: ' + a.name); }); }
    if (!app.s.alive) return setTimeout(renderSummary, 900);
    if (app.s.queue.length) showEvent();
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

  function panelCareer(p) {
    var s = app.s, c = country();
    var html = '<div class="section-title">학업</div><dl class="kv">' +
      '<dt>현재</dt><dd>' + esc(eduLabel(s)) + '</dd>' +
      '<dt>최종 학력</dt><dd>' + esc(C.DEGREE_LABELS[s.edu.degree]) + (s.edu.major ? ' · ' + esc(C.MAJORS[s.edu.major]) : '') + '</dd>' +
      '<dt>학교 제도</dt><dd class="muted">' + esc(c.school.elem.name + ' ' + c.school.elem.from + '–' + c.school.elem.to + '세 · ' + c.school.middle.name + ' ' + c.school.middle.from + '–' + c.school.middle.to + '세 · ' + c.school.high.name + ' ' + c.school.high.from + '–' + c.school.high.to + '세 · ' + c.school.exam.name + ' ' + c.school.exam.age + '세') + '</dd>' +
      (s.edu.examScore != null ? '<dt>' + esc(c.school.exam.name) + '</dt><dd>' + s.edu.examScore + '점</dd>' : '') +
      '</dl><div class="section-title">직업</div>';
    if (s.job) {
      var k = E.careerIndex()[s.job.id];
      html += '<dl class="kv"><dt>직업</dt><dd>' + esc(k.name) + ' <span class="muted">(' + esc(C.SECTORS[k.sector]) + ')</span></dd><dt>연봉</dt><dd class="money">' + esc(money(E.salaryOf(s, k, s.job.level))) + '</dd><dt>평판</dt><dd>' + Math.round(s.job.perf) + '/100</dd><dt>근속</dt><dd>' + s.job.years + '년</dd></dl>' +
        '<div class="ladder">' + k.ladder.map(function (t, i) { return '<div class="' + (i === s.job.level ? 'cur' : i < s.job.level ? 'done' : '') + '">' + (i + 1) + '. ' + esc(E.ladderTitle(s, k, i)) + '</div>'; }).join('') + '</div>' +
        '<p class="hint">' + esc(k.desc) + '</p>';
    } else html += '<p class="muted">' + (s.age < 14 ? '아직 일할 나이가 아닙니다.' : '직업이 없습니다. 활동 탭의 "구직/이직"에서 120가지가 넘는 직업에 지원할 수 있어요.') + '</p>';
    if (s.jobHistory.length) html += '<div class="section-title">경력</div><div class="ladder">' + s.jobHistory.slice(-8).reverse().map(function (j) { return '<div>' + j.from + '–' + j.to + '세 · ' + esc(j.name) + ' · ' + esc(j.title) + ' <span class="muted">(' + esc(j.why) + ')</span></div>'; }).join('') + '</div>';
    p.innerHTML = html;
    if (s.age >= 14 && s.alive) {
      var b = h('<button class="btn btn-gold" style="margin-top:12px;width:100%">🔎 직업 찾아보기</button>');
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
    m.querySelector('#x').addEventListener('click', closeModal);
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
  function showEvent() {
    var s = app.s;
    var ev = E.currentEvent(s);
    if (!ev) { closeModal(); refresh(); return; }
    var wrap = doc.createElement('div');
    var cvHolder = doc.createElement('div');
    wrap.appendChild(cvHolder);
    var body = h('<div class="card-b"><p class="ev-text">' + esc(ev.text) + '</p><div class="choices"></div></div>');
    wrap.appendChild(body);
    ev.choices.forEach(function (ch) {
      var pct = ch.chance != null ? '<span class="p">성공률 ' + Math.round(ch.chance * 100) + '%</span>' : '';
      var b = h('<button class="btn choice" ' + (ch.enabled ? '' : 'disabled') + '><span>' + esc(ch.text) + '</span>' + (ch.enabled ? pct : '<span class="p">조건 부족</span>') + '</button>');
      b.addEventListener('click', function () { onChoose(ch.i, ev); });
      body.querySelector('.choices').appendChild(b);
    });
    modal(wrap);
    var scene = ev.scene;
    cvHolder.appendChild(portraitCanvas('', function () { return scene; }, function () { return lookOf(app.s); }));
  }
  function onChoose(i, ev) {
    var s = app.s;
    var res = E.choose(s, i);
    if (!res) return;
    if (res.outcome === 'fail') { A.play('bad'); app.mood = 'sad'; app.moodUntil = performance.now() + 2000; }
    else { A.play('good'); if (res.outcome === 'success') { app.mood = 'celebrate'; app.moodUntil = performance.now() + 1800; } }
    var m = $('.modal');
    var body = m.querySelector('.card-b');
    body.innerHTML = '<p class="ev-text muted">' + esc(ev.text) + '</p>' +
      '<div class="result ' + (res.outcome === 'fail' ? 'fail' : '') + '">' + (res.outcome === 'success' ? '✔ 성공! ' : res.outcome === 'fail' ? '✖ 실패… ' : '') + esc(res.log) +
      res.changes.filter(function (c) { return c.k === 'msg'; }).map(function (c) { return '<br>▸ ' + esc(c.t); }).join('') + '</div>' +
      chipsHtml(res.changes) +
      '<button class="btn btn-green" id="next" style="width:100%">' + (s.queue.length ? '다음 일 ▶' : (s.alive ? '계속하기' : '…')) + '</button>';
    var nb = body.querySelector('#next');
    nb.addEventListener('click', function () {
      A.play('click');
      save();
      if (!s.alive) { closeModal(); return renderSummary(); }
      if (s.queue.length) return showEvent();
      closeModal(); afterAction();
    });
    nb.focus();
    refresh();
  }

  // ---------------------------------------------------------------- age up
  function onAgeUp() {
    var s = app.s;
    if (!s.alive) return renderSummary();
    if (s.queue.length) return showEvent();
    var before = s.age;
    E.ageUp(s);
    A.play('age');
    ageFlash(s.age);
    save();
    if (isPhone()) app.tab = 'log';
    refresh(true);
    var anim = s.y.anim;
    var news = s.y.newAchievements; s.y.newAchievements = null;
    setTimeout(function () {
      if (anim) celebrate(anim);
      else if (news && news.length) { A.play('achieve'); }
      if (news) news.forEach(function (id) { var a = achById(id); if (a) toast('🏅 업적 달성: ' + a.name); });
      if (!s.alive) { A.play('death'); return setTimeout(renderSummary, anim ? 2600 : 1200); }
      if (s.queue.length) setTimeout(showEvent, anim ? 1800 : 150);
    }, 650);
    void before;
  }

  // ---------------------------------------------------------------- summary
  function renderSummary() {
    var s = app.s;
    if (!s) return renderStart();
    app.screen = 'summary';
    closeModal();
    var sum = E.summary(s);
    var scr = $('#screen'); scr.innerHTML = '';
    var heirs = E.heirs(s);
    var el = h('<div class="summary">' +
      '<section class="card"><div class="grave"></div><div class="card-b">' +
      '<div style="font-size:20px;font-weight:700">' + esc(sum.name) + '</div>' +
      '<div class="muted">' + sum.born + ' – ' + sum.died + ' · ' + sum.age + '세 · ' + esc(sum.cause) + '</div>' +
      '<div class="titles" style="margin:10px 0">' + sum.titles.slice(0, 4).map(function (t, i) { return '<span class="ribbon' + (i ? ' sub' : '') + '" title="' + esc(t.desc) + '">' + esc(t.name) + '</span>'; }).join('') + '</div>' +
      '<dl class="kv"><dt>남긴 재산</dt><dd class="money">' + esc(sum.moneyText) + '</dd><dt>명성</dt><dd>' + sum.fame + '</dd><dt>최종 학력</dt><dd>' + esc(sum.degree) + '</dd>' +
      (sum.football ? '<dt>축구</dt><dd>' + sum.football.apps + '경기 ' + sum.football.goals + '골 · 발롱도르 ' + sum.football.trophies.ballon + ' · 월드컵 ' + sum.football.trophies.wc + '</dd>' : '') +
      (sum.bestJob ? '<dt>최고 경력</dt><dd>' + esc(sum.bestJob.name) + ' · ' + esc(sum.bestJob.title) + '</dd>' : '') +
      '<dt>자녀</dt><dd>' + sum.children + '명</dd><dt>시드</dt><dd>' + esc(sum.seed) + (sum.generation > 1 ? ' · ' + sum.generation + '대째' : '') + '</dd></dl>' +
      '<div class="section-title">다음 인생</div><div class="heirs" id="heirs"></div>' +
      '<div class="row" style="margin-top:10px"><button class="btn btn-gold grow" id="btn-replay">같은 시드로 다시</button><button class="btn grow" id="btn-new">새 인생</button></div>' +
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
        save(); app.tab = isPhone() ? 'log' : 'acts'; renderGame();
        toast(s.generation + 1 + '대째 이야기가 시작됩니다.');
      });
      hb.appendChild(b);
    });
    $('#btn-replay', el).addEventListener('click', function () {
      var cc = RA.data.countries[s.country];
      if (s.generation > 1) { startGame({ country: s.country, seed: s.seed.split('-G')[0] }); return; }
      startGame({ country: s.country, seed: s.seed, given: s.hero.given !== cc.hero.given ? s.hero.given : undefined, gender: s.hero.gender, slot: app.slot });
    });
    $('#btn-new', el).addEventListener('click', function () { renderStart(); });
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
      '<div class="section-title">게임</div><div class="row"><button class="btn grow" id="m-new">새 인생</button>' + (app.s ? '<button class="btn grow" id="m-help">도움말</button>' : '') + '</div>' +
      '<p class="hint">비공식 팬 패러디 게임입니다. 실존 인물·구단과 관계가 없으며 등장하는 구단·학교 이름은 모두 가상입니다. 폰트: Galmuri (OFL-1.1).</p></div>', { dismiss: true });
    m.querySelector('#x').addEventListener('click', closeModal);
    m.querySelector('#m-new').addEventListener('click', function () { closeModal(); renderStart(); });
    var hb = m.querySelector('#m-help'); if (hb) hb.addEventListener('click', showHelp);
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
  function showHelp() {
    var m = modal('<div class="card-h">도움말 <button class="btn btn-sm btn-ghost" id="x">닫기</button></div><div class="card-b" style="font-size:13px">' +
      '<p>① <b class="gold">활동</b> 탭에서 한 해에 행동력 3만큼 하고 싶은 일을 고르세요.</p>' +
      '<p>② <b class="gold">+1살 나이 먹기</b>를 누르면 한 해가 지나고 사건이 일어납니다. 선택지마다 결과가 다르고, 어떤 선택은 몇 년 뒤에 돌아옵니다.</p>' +
      '<p>③ 축구 실력이 충분하면 동네 클럽 → 지역 클럽 → 12살 아카데미 → 프로로 이어지는 정석 루트가 열려요. 공부하면 의사·변호사·우주비행사, 범죄를 저지르면 감옥… 무엇이든 될 수 있습니다.</p>' +
      '<p>④ 생을 마치면 인생 결산과 칭호가 나오고, 자녀가 있으면 유산을 물려받아 자녀의 삶을 이어 갈 수 있어요.</p>' +
      '<p class="muted">같은 시드에서 같은 선택을 하면 똑같은 인생이 펼쳐집니다. Enter 키로도 나이를 먹을 수 있어요.</p></div>', { dismiss: true });
    m.querySelector('#x').addEventListener('click', closeModal);
  }

  // ---------------------------------------------------------------- boot
  function boot() {
    $('#btn-mute').textContent = A.isMuted() ? '🔇' : '🔊';
    $('#btn-mute').addEventListener('click', function () { var mu = A.toggle(); $('#btn-mute').textContent = mu ? '🔇' : '🔊'; if (!mu) A.play('click'); });
    $('#btn-menu').addEventListener('click', showMenu);
    $('#btn-home').addEventListener('click', function () { if (app.screen === 'start') return; showMenu(); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && $('.modal-wrap') && !app.s || (e.key === 'Escape' && $('.modal-wrap') && !(app.s && app.s.queue.length))) closeModal();
      if (e.key === 'Enter' && app.screen === 'game' && !$('.modal-wrap') && doc.activeElement === doc.body) onAgeUp();
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
    var list = S.list();
    renderStart();
    G.requestAnimationFrame(loop);
    void list;
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot); else boot();
})(typeof globalThis !== 'undefined' ? globalThis : this);
