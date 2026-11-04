/* Round 8 life layer (docs/DESIGN.md §2g): hobbies, birth origin, flavour gating, the dark side
 * (악동 → 패거리 → 조직, dark-route risks), drinking incidents, sponsor / lobby / bribe arcs and
 * lasting childhood crises. Data: data/hobbies.js, data/events_r8.js. Depends on js/routes.js and
 * js/activities.js (loaded after both).
 * State: s.hobbies [ids], s.hobbyEver {id: age first taken}, s.origin ('rich'|'middle'|'poor'|'slum'),
 * s.spon { n, last, exposed } (accepted sponsor / bribe offers). */
(function (G) {
  var RA = G.RA = G.RA || {};
  var E = RA.Engine, C = RA.C, T = RA.Text, R = RA.RNG, RT = E.Routes;
  var L = E.Life = {};
  function D() { return RA.data; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function W(s) { return E.country(s).wage; }
  function hob(id) { return D().hobbies.filter(function (h) { return h.id === id; })[0] || null; }
  L.hobby = hob;
  var DARK = ['gang', 'con', 'thief'];
  L.DARK = DARK;
  L.isDark = function (s) { return !!(s.route && DARK.indexOf(s.route.id) >= 0); };

  // ---------------------------------------------------------------- hobbies
  L.has = function (s, id) { return (s.hobbies || []).indexOf(id) >= 0; };
  L.add = function (s, id) {
    s.hobbies = s.hobbies || []; s.hobbyEver = s.hobbyEver || {};
    if (L.has(s, id) || s.hobbies.length >= 3) return false;
    s.hobbies.push(id);
    if (s.hobbyEver[id] == null) s.hobbyEver[id] = s.age;
    return true;
  };
  L.drop = function (s, id) { s.hobbies = (s.hobbies || []).filter(function (x) { return x !== id; }); };
  L.names = function (s) { return (s.hobbies || []).map(function (id) { var h = hob(id); return h ? h.icon + ' ' + h.name : id; }).join(', '); };
  // a stable per-life shuffle so different lives are offered different hobbies (no RNG draw)
  function noise(s, id) { var t = s.seed + '|' + id, h = 0; for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h % 16; }
  L.rank = function (s) {
    return D().hobbies.filter(function (h) { return !L.has(s, h.id); }).map(function (h) {
      return { h: h, v: (s.talent ? s.talent[h.talent] || 0 : 0) + noise(s, h.id) };
    }).sort(function (a, b) { return b.v - a.v; }).map(function (x) { return x.h; });
  };
  // auto-play and the 🎯 choice: the child's strongest talents decide (2, or 3 when the third is strong)
  L.autoPick = function (s) {
    var r = L.rank(s);
    while ((s.hobbies || []).length < 2 && r.length) L.add(s, r.shift().id);
    if (r.length && s.hobbies.length < 3 && s.talent && s.talent[r[0].talent] >= 30) L.add(s, r[0].id);
    return L.names(s);
  };
  // what a hobby costs the family: a poor home may not afford the gear (seeded per hobby), a rich one
  // pays without blinking; the hobby's own risk can strike once in childhood (yearlyHobbies)
  var HOBBY_COST = ['돈 안 듦', '조금', '꽤 듦', '비쌈'];
  L.payHobby = function (s, h) {
    if (!h.cost || s.origin === 'rich') return '';
    var poor = s.origin === 'poor' || s.origin === 'slum';
    if (poor && h.cost >= 2) {
      if (R.next(R.create(s.seed + '|hobbycost|' + h.id)) < 0.5) {
        s.flags.hobby_secondhand = h.id; E.addStat(s, 'happy', -2); E.addStat(s, 'grit', 1);
        return ' 새 장비는 엄두도 못 냈다. 남이 쓰던 낡은 걸 얻어 와 시작했다.';
      }
      E.addStat(s, 'happy', 1); s.flags.hardship = s.flags.hardship || s.age;
      var mom = E.person(s, 'mother');
      if (!mom || !mom.alive) return ' 장비값을 대느라 집안 살림이 한층 빠듯해졌다.';
      E.applyEffects(s, { rel: { mother: -2 } }, []);
      return ' 장비값을 대느라 {mother}[이/가] 부업을 하나 더 늘렸다.';
    }
    if (h.cost >= 3) { E.addStat(s, 'happy', 1); return ' 생일 선물을 미리 당겨 장만했다.'; }
    return '';
  };
  function hobbyRisk(s) {
    if (s.age < 5 || s.age > 12 || s.flags.hobby_hurt) return;
    (s.hobbies || []).some(function (id) {
      var h = hob(id); if (!h || !h.risk) return false;
      if (R.next(R.create(s.seed + '|hobbyrisk|' + id + '|' + s.age)) >= h.risk.p) return false;
      s.flags.hobby_hurt = id;
      var chg = E.applyEffects(s, h.risk.effects, []);
      E.addLog(s, h.icon + ' ' + E.narrative(s, h.risk.text), 'bad', { chg: E.compactChanges(chg) });
      return true;
    });
  }
  var HOBBY_EVENTS = [
    { id: 'sys_hobby', manual: true, pick: true,
      textFn: function (s) {
        var n = (s.hobbies || []).length;
        if (!n) return '다섯 살. 뭘 할 때 제일 신날까? 좋아하는 놀이, 즉 취미를 2~3개 골라 보자. 취미는 맞는 재능을 키우고, 커서 걸을 수 있는 길을 열어 준다.';
        if (s.country === 'pt' && n === 1 && L.has(s, 'football')) return '{father}[이/가] 가져온 낡은 공은 이미 단짝이다. 축구 말고도 좋아하는 게 있을까? 취미를 하나 이상 더 골라 보자. (최대 3개)';
        return '지금 취미: ' + L.names(s) + '. 하나 더 고를까? (최대 3개)';
      },
      choicesFn: function (s) {
        var list = [];
        if ((s.hobbies || []).length < 2) list.push({ text: '🎯 마음 가는 대로 (재능에 맞게 골라 줘)', desc: '타고난 재능이 센 쪽으로 취미가 정해진다.', run: function (s) { return '좋아하는 게 저절로 생겼다: ' + L.autoPick(s) + '.'; } });
        L.rank(s).slice(0, 6).forEach(function (h) {
          var tl = D().talents.filter(function (t) { return t.k === h.talent; })[0];
          list.push({ text: h.icon + ' ' + h.name, desc: h.desc + ' (' + tl.label + ' 재능 ' + (s.talent ? s.talent[h.talent] : 0) + ') · 비용: ' + HOBBY_COST[h.cost] + ' · 위험: ' + h.risk.label,
            run: function (s) { L.add(s, h.id); var note = L.payHobby(s, h); if (s.hobbies.length < 3) s.queue.unshift('sys_hobby'); return h.icon + ' ' + h.name + '(이)가 좋아졌다. ' + h.desc + note; } });
        });
        if ((s.hobbies || []).length >= 2) list.push({ text: '이 정도면 충분하다', run: function (s) { return '좋아하는 것: ' + L.names(s) + '.'; } });
        return list;
      } },
    // later in life: a hobby can fade and a new one can start (each needs a reason in the text)
    { id: 'hob_new', age: [9, 70], cooldown: 7, weight: 7, when: function (s) { return (s.hobbies || []).length < 3 && s.jail <= 0; },
      textFn: function (s) { return s.age < 20 ? '친구가 요즘 빠져 있는 걸 같이 해 보자고 한다.' : '동네 문화센터에 새 강좌 전단이 붙었다. 새로운 취미를 시작해 볼까?'; },
      choicesFn: function (s) {
        var list = L.rank(s).filter(function (h) { return h.id !== 'football' || s.age <= 45; }).slice(0, 2).map(function (h) {
          return { text: h.icon + ' ' + h.name + '을(를) 시작한다', run: function (s) { L.add(s, h.id); E.addStat(s, 'happy', 3); return '새 취미가 생겼다: ' + h.icon + ' ' + h.name + '. ' + h.desc; } };
        });
        list.push({ text: '지금 하는 것만으로 충분하다', run: function () { return '전단을 접어 주머니에 넣었다.'; } });
        return list;
      } },
    { id: 'hob_drop', age: [12, 70], cooldown: 8, weight: 6, when: function (s) { return (s.hobbies || []).length >= 2 && s.jail <= 0; },
      textFn: function (s) { return s.age < 19 ? '시험과 숙제가 늘었다. 취미를 다 하기엔 시간이 모자라다.' : '하루가 빠듯하다. 예전처럼 취미를 다 챙기기 어렵다.'; },
      choicesFn: function (s) {
        var list = [{ text: '그래도 다 지킨다', effects: { happy: 1, health: -1 }, run: function () { return '잠을 줄였다. 그래도 좋아하는 걸 놓고 싶지 않았다.'; } }];
        (s.hobbies || []).slice().reverse().slice(0, 2).forEach(function (id) {
          var h = hob(id);
          list.push({ text: h.icon + ' ' + h.name + '은(는) 잠시 내려놓는다', run: function (s) { L.drop(s, id); return h.name + '은(는) 추억으로 남겼다. 가끔 생각은 난다.'; } });
        });
        return list;
      } }
  ];

  // ---------------------------------------------------------------- flavour: which content fits this hero
  // the hero "knows" a flavour (football, basketball…) from a hobby (now or before), the route, the
  // school track, or (football) a club spell
  L.knows = function (s, f) {
    var fl = D().flavours[f]; if (!fl) return true;
    var ever = s.hobbyEver || {};
    if (ever[f] != null) return true;
    var rid = s.route && s.route.id;
    if (fl.routes.indexOf(rid) >= 0 || (s.routeSeen && fl.routes.some(function (r) { return s.routeSeen[r] != null; }))) return true;
    if (s.track && fl.tracks.indexOf(s.track) >= 0) return true;
    if (f === 'football' && ((s.fb && s.fb.stage !== 'none') || (s.fb && s.fb.seasons > 0) || s.flags.fb_quit != null)) return true;
    return false;
  };
  var FB_FX = ['joinLocalClub', 'joinRegionalClub', 'joinAcademy', 'promoteYouth', 'turnPro', 'transferAbroad', 'nationalCallup', 'fbBan'];
  var RICH_NO = /월세|집세|가난|단칸방|리어카|끼니|반지하|판잣집|빚쟁이|사남매의 막내로 태어난 가난/;
  function textFlavours(t, out) {
    if (!t) return out;
    var F = D().flavours;
    Object.keys(F).forEach(function (f) {
      var hit = F[f].re.test(t);
      // the father works at the local club in every country: "{father} … {localClub}" is family, not the hero's game
      if (!hit && F[f].clubRe && F[f].clubRe.test(t) && !/\{father\}|아버지|아빠/.test(t)) hit = true;
      if (hit && out.indexOf(f) < 0) out.push(f);
    });
    var O = D().originFlavours;
    if (O.slum.test(t) && out.indexOf('o:slum') < 0) out.push('o:slum');
    if (RICH_NO.test(t) && out.indexOf('o:notrich') < 0) out.push('o:notrich');
    return out;
  }
  function effFlavours(e, out) {
    if (!e) return out;
    if (e.football > 0 && out.indexOf('football') < 0) out.push('football');
    [].concat(e.fx || []).forEach(function (f) { if (FB_FX.indexOf(f) >= 0 && out.indexOf('football') < 0) out.push('football'); });
    return out;
  }
  L.choiceFlavours = function (ch) {
    if (ch._fl) return ch._fl;
    var out = [];
    [ch.text, ch.log, ch.desc, ch.success && ch.success.log, ch.fail && ch.fail.log].concat(ch.logVariants || []).forEach(function (t) { textFlavours(t, out); });
    effFlavours(ch.effects, out); effFlavours(ch.success && ch.success.effects, out); effFlavours(ch.fail && ch.fail.effects, out);
    ch._fl = out;
    return out;
  };
  L.eventFlavours = function (ev) {
    if (ev._efl) return ev._efl;
    var out = [];
    [ev.text, ev.log].concat(ev.textVariants || [], ev.logVariants || []).forEach(function (t) { textFlavours(t, out); });
    if (!ev.choices) effFlavours(ev.effects, out);
    ev._efl = out;
    return out;
  };
  L.flavourOk = function (s, list) {
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      if (f === 'o:slum') { if (s.origin !== 'slum') return false; }
      else if (f === 'o:notrich') { if (s.origin === 'rich' && s.age <= 18) return false; }
      else if (!L.knows(s, f)) return false;
    }
    return true;
  };
  L.textOk = function (s, t) { return L.flavourOk(s, textFlavours(t, [])); };
  // a choice's `alt` ({ text, log, effects? }) is what a hero who does not know its flavour sees instead:
  // the same moment told through the hero's own hobby ({hobby}, {hobbyAct}). Without alt.effects the
  // original effects are kept minus football, and a football gain becomes a hobby boost.
  function altChoice(ch) {
    if (ch._alt) return ch._alt;
    var a = ch.alt, c = {};
    Object.keys(ch).forEach(function (k) { if (k !== 'alt' && k !== '_fl' && k !== '_alt') c[k] = ch[k]; });
    c.text = a.text;
    if (a.log != null) c.log = a.log;
    function strip(fx) {
      if (!fx) return fx;
      var e = {};
      Object.keys(fx).forEach(function (k) { if (k !== 'football') e[k] = fx[k]; });
      if (fx.football > 0) e.fx = [].concat(e.fx || [], 'hobbyBoost');
      return e;
    }
    var e = a.effects || strip(ch.effects);
    if (e) c.effects = e;
    // the hero's own version never needs or tests football: alt.req / alt.check replace the original
    // (null clears it); otherwise football drops out of req and a football check tests the hobby's talent
    if ('req' in a) { if (a.req) c.req = a.req; else delete c.req; }
    else if (ch.req && ch.req.stats && ch.req.stats.football != null) {
      var st = {}; Object.keys(ch.req.stats).forEach(function (k) { if (k !== 'football') st[k] = ch.req.stats[k]; });
      var rq = {}; Object.keys(ch.req).forEach(function (k) { if (k !== 'stats') rq[k] = ch.req[k]; });
      if (Object.keys(st).length) rq.stats = st;
      if (Object.keys(rq).length) c.req = rq; else delete c.req;
    }
    if ('check' in a) { if (a.check) c.check = a.check; else { delete c.check; delete c.success; delete c.fail; } }
    else if (ch.check && ch.check.stat === 'football') c.check = { talent: 'hobby', diff: ch.check.diff };
    // checked choices: success/fail keep their effects (minus football) and take alt.success/alt.fail logs
    ['success', 'fail'].forEach(function (k) {
      if (!ch[k] || !c.check) return;
      var n = { effects: (a[k] && a[k].effects) || strip(ch[k].effects) };
      // success is the alt's own story; a fail keeps the original line only when it reads flavour-free
      n.log = (a[k] && a[k].log) || (k === 'success' && a.log) || (textFlavours(ch[k].log, []).length ? a.log : ch[k].log);
      c[k] = n;
    });
    c._fl = [];
    ch._alt = c;
    return c;
  }
  L.altChoice = altChoice;
  // what the screen shows: the 축구 stat and tab only for a hero who knows football (js/ui.js)
  L.uiStats = function (s) { return C.STATS.filter(function (k) { return k !== 'football' || L.knows(s, 'football'); }); };
  L.uiTabs = function (s, tabs, cur) {
    var list = tabs.filter(function (t) { return t[0] !== 'football' || L.knows(s, 'football'); });
    return { tabs: list, tab: list.some(function (t) { return t[0] === cur; }) ? cur : 'career' };
  };
  E.hobbyTalent = function (s) { var h = hob((s.hobbies || [])[0]); return h ? h.talent : 'sport'; };
  // every data event with choices shows only the choices that fit the hero (choices stay in ev.choices
  // for the validator; the engine reads ev.choicesFn first)
  function gateChoices() {
    D().events.forEach(function (ev) {
      if (!ev.choices || ev.choicesFn || ev._gated || ev.own === 'chain:first_boots') return;
      ev._gated = true;
      var all = ev.choices;
      if (!all.some(function (ch) { return L.choiceFlavours(ch).length || ch.hobbyReq; })) return;
      ev.choicesFn = function (s) {
        var out = [];
        all.forEach(function (ch) {
          if (L.flavourOk(s, L.choiceFlavours(ch))) out.push(ch);
          else if (ch.alt) out.push(altChoice(ch));
        });
        return out;
      };
    });
  }
  gateChoices();
  var _matches = E.eventMatches;
  E.eventMatches = function (s, ev) {
    if (!_matches(s, ev)) return false;
    if (ev.own === 'chain:first_boots') return /^boots_open_/.test(ev.id);
    if (ev.hobby && !L.has(s, ev.hobby)) return false;
    if (ev.flavour && !L.knows(s, ev.flavour)) return false; // a scene that only makes sense to a player of that game
    if (ev.origin && ev.origin.indexOf(s.origin) < 0) return false;
    if (!L.flavourOk(s, L.eventFlavours(ev))) return false;
    if (ev.choices && ev.choicesFn && ev._gated && ev.choicesFn(s).length < 2) return false;
    return true;
  };
  // activity and route lines follow the same rule
  var _line = E.line;
  E.line = function (s, key, list) {
    var src = list || E.ACTIVITY_LINES[key];
    if (src) { var ok = src.filter(function (t) { return L.textOk(s, t); }); if (!ok.length) return ''; if (ok.length !== src.length) list = ok; }
    return _line(s, key, list);
  };
  // the 축구 chip belongs to football events only, not to a neutral event that once listed fb: 'none'
  var _cat = E.eventCategory;
  E.eventCategory = function (ev) {
    if (ev && !ev._cat && ev.cond && ev.cond.fb && ev.cond.fb.indexOf('none') >= 0 && !/^fb_/.test(ev.id)) {
      var c = ev.cond.fb; delete ev.cond.fb; var out = _cat(ev); ev.cond.fb = c; return out;
    }
    return _cat(ev);
  };

  // ---------------------------------------------------------------- template tokens: {hobby}, house by origin
  E.varsHook = function (s, v) {
    var h = hob((s.hobbies || [])[0]);
    v.hobby = h ? h.noun : '취미';
    v.hobbyAct = h ? h.act : '좋아하는 놀이'; // "그림 그리기", "책 읽기"… for choices that swap in the hero's own hobby
    var c = E.country(s), o = s.origin;
    // the canon South African hometown is a township; a family with money lives in the city itself
    if ((o === 'rich' || o === 'middle') && D().originFlavours.slum.test(v.hometown)) v.hometown = c.places.city + ' 시내';
    if (o === 'rich' || o === 'slum') { var pl = (D().originPlaces[s.country] || {})[o]; if (pl) { v.house = pl[1]; v.houseLong = pl[1]; v.hood = pl[0]; } }
    else if (o === 'middle') { v.house = v.hometown + '의 아파트'; v.houseLong = '방 세 칸짜리 평범한 아파트'; }
    if (!v.hood) v.hood = o === 'middle' ? '평범한 동네' : '가난한 동네';
  };

  // ---------------------------------------------------------------- birth origin
  L.rollOrigin = function (s, parent) {
    if (s.country === 'pt' && !parent) return 'poor';          // the canon story: a poor island family
    if (parent) { var m = parent.money / E.country(parent).wage; return m >= 1e6 ? 'rich' : m >= 1e4 ? 'middle' : m >= 0 ? 'poor' : 'slum'; }
    var r = R.create(s.seed + '|origin|' + s.country + '|' + (s.generation || 1)), O = D().origins, keys = Object.keys(O);
    var tot = keys.reduce(function (a, k) { return a + O[k].weight; }, 0), x = R.next(r) * tot;
    for (var i = 0; i < keys.length; i++) { x -= O[keys[i]].weight; if (x < 0) return keys[i]; }
    return 'middle';
  };
  function originStart(s) {
    var o = s.origin;
    if (o === 'rich') { E.addStat(s, 'smarts', 6); E.addStat(s, 'happy', 4); s.traits.rep = 56; }
    else if (o === 'middle') E.addStat(s, 'smarts', 2);
    else if (o === 'slum') { E.addStat(s, 'grit', 6); E.addStat(s, 'health', -4); s.traits.mischief = 6; }
    else E.addStat(s, 'grit', 3);
  }
  L.originLabel = function (s) { var o = D().origins[s.origin]; return o ? o.icon + ' ' + o.name : ''; };

  // the neighbourhood opens and closes routes: the street teaches rap and fists, money buys lessons
  var ORIGIN_FIT = {
    slum: { rapper: 7, fighter: 7, basketball: 5, football: 5, gang: 8, thief: 8, con: 5, classical: -6, law: -4 },
    poor: { rapper: 3, fighter: 3, gang: 3 },
    rich: { classical: 6, art: 4, law: 4, startup: 6, gang: -6, thief: -6 }
  };
  var _fit = RT.fit;
  RT.fit = function (s, r) {
    var v = _fit(s, r);
    if (!r || !r.fit) return v;
    var bonus = 0;
    (s.hobbies || []).forEach(function (id) { var h = hob(id); if (h && h.routes.indexOf(r.id) >= 0) bonus = Math.max(bonus, 8); });
    if (!bonus && s.hobbyEver) Object.keys(s.hobbyEver).forEach(function (id) { var h = hob(id); if (h && h.routes.indexOf(r.id) >= 0) bonus = Math.max(bonus, 4); });
    bonus += ((ORIGIN_FIT[s.origin] || {})[r.id] || 0);
    if (s.flags && s.flags.bad_knee && r.group === '운동') bonus -= 10;
    return clamp(v + bonus, 0, 100);
  };

  // routes offered on the notice board follow the hero's own life: a hobby, the school track, or a
  // strong natural fit. Dark routes are never on a notice board.
  RT.entryChoices = function (s) {
    if (s.jail > 0 || s.age < 8) return [];
    var cur = s.route.id;
    if (cur !== 'school' && cur !== 'none' && cur !== 'parttime') return [];
    var list = D().routes.filter(function (r) {
      if (!RT.isLadder(r) || r.id === 'football' || (r.entry && r.entry.offer === false)) return false;
      if (s.routeTried && s.routeTried[r.id] && s.age - s.routeTried[r.id] < 2) return false;
      if (RT.entryMissing(s, r).length || RT.fit(s, r) < 30) return false;
      return L.related(s, r);
    });
    list.sort(function (a, b) { return RT.fit(s, b) - RT.fit(s, a); });
    return list.slice(0, 3);
  };
  L.related = function (s, r) {
    if ((s.hobbies || []).some(function (id) { var h = hob(id); return h && h.routes.indexOf(r.id) >= 0; })) return true;
    if (s.track && s.track !== 'general' && (r.entry.tracks || []).indexOf(s.track) >= 0) return true;
    if (s.routeSeen && s.routeSeen[r.id] != null) return true;
    return RT.fit(s, r) >= 62;
  };
  // next steps after a route ends speak only of games the hero knows (no 축구 해설가 for a basketball player)
  var _exitOpts = RT.exitOptions;
  RT.exitOptions = function (s, cause) {
    return _exitOpts(s, cause).filter(function (o) {
      if (o.to === 'merchant' && (!o.career || o.career === 'street_vendor') && !L.suitsTrade(s)) return false; // no stall for someone the trade does not suit
      return L.textOk(s, RT.optionLabel(s, o));
    });
  };
  // 쉬는 중 / 아르바이트: a stall or a shop only for someone the trade suits (taste, a food hobby,
  // a market childhood, or earlier shop work); the other ways forward are ordinary jobs
  L.suitsTrade = function (s) {
    var lastSec = (s.jobHistory || []).slice(-2).some(function (j) { var k = E.careerIndex()[j.id]; return k && (k.sector === 'service' || k.sector === 'parttime'); });
    return (s.talent && s.talent.taste >= 40) || L.has(s, 'cook') || s.origin === 'poor' || s.origin === 'slum' || lastSec || !!(s.routeSeen && (s.routeSeen.merchant != null || s.routeSeen.cook != null));
  };
  // a hero who walks a chosen career is not offered a street stall on the side either
  L.sideStallOk = function (s) {
    var r = RT.cur(s);
    return L.suitsTrade(s) && (!r || r.state || ['merchant', 'cook', 'service', 'parttime'].indexOf(r.id) >= 0);
  };
  var _adrift = RT.adriftOptions;
  RT.adriftOptions = function (s) {
    return _adrift(s).filter(function (o) { return o.a.to !== 'merchant' || L.suitsTrade(s); });
  };

  // ---------------------------------------------------------------- activities: hobby practice; football only for those who play
  var _acts = E.activities;
  E.activities = function (s) {
    var list = _acts(s);
    if (!list.length) return list;
    var fbOk = L.knows(s, 'football');
    list = list.filter(function (a) { return fbOk || (a.id !== 'football' && a.id !== 'joinclub' && a.id !== 'quitfb'); });
    (s.hobbies || []).forEach(function (id) {
      var h = hob(id); if (!h || id === 'football' || !h.lines.length) return;
      var ok = s.jail > 0 ? '수감 중에는 할 수 없다' : s.ap <= 0 ? '올해 행동력을 다 썼다' : (s.y.hobbyDone || {})[id] ? '올해는 이미 했다' : true;
      list.push({ id: 'hobby_' + id, label: '취미: ' + h.name, icon: h.icon, ok: ok === true, reason: ok === true ? '' : ok, opts: null, ui: null, cost: 1 });
    });
    if (L.drinkOpen(s)) {
      var dok = s.jail > 0 ? '수감 중에는 할 수 없다' : s.ap <= 0 ? '올해 행동력을 다 썼다' : s.money < 30 * W(s) ? '술값이 없다' : true;
      list.push({ id: 'drink', label: '술자리', icon: '🍺', ok: dok === true, reason: dok === true ? '' : dok, opts: null, ui: null, cost: 1 });
    }
    return list;
  };
  var _doAct = E.doActivity;
  E.doActivity = function (s, id, arg) {
    if (id !== 'drink' && !/^hobby_/.test(id)) return _doAct(s, id, arg);
    if (!s.alive || s.queue.length) return null;
    var a = E.activities(s).filter(function (x) { return x.id === id; })[0];
    if (!a || !a.ok) return { ok: false, log: a ? a.reason : '지금은 할 수 없다.' };
    s.ap--;
    var before = JSON.parse(JSON.stringify(s.stats)), m0 = s.money;
    s.y.lineKey = null;
    var text = id === 'drink' ? L.drink(s) : L.practise(s, id.slice(6));
    var changes = [];
    Object.keys(before).forEach(function (k) { if (s.stats[k] !== before[k]) changes.push({ k: k, d: s.stats[k] - before[k] }); });
    if (s.money !== m0) changes.push({ k: 'money', d: s.money - m0 });
    E.addLog(s, a.icon + ' ' + text, 'act', { line: s.y.lineKey || null, chg: E.compactChanges(changes) });
    RT.sync(s); E.checkAchievements(s); E.checkDeath(s, true);
    return { ok: true, log: T.fixJosa(text), changes: changes };
  };
  L.practise = function (s, id) {
    var h = hob(id);
    s.y.hobbyDone = s.y.hobbyDone || {}; s.y.hobbyDone[id] = 1;
    var g = E.rint(s, 1, 2);
    RT.addTalent(s, h.talent, g);
    E.addStat(s, 'happy', E.rint(s, 2, 4));
    // a hobby that matches the current route also counts as practice for it
    var onRoute = s.route && h.routes.indexOf(s.route.id) >= 0 && RT.isLadder(RT.cur(s));
    if (onRoute) s.route.sk = Math.min(100, s.route.sk + 1);
    if (id === 'martial') E.addStat(s, 'health', 1);
    var tl = D().talents.filter(function (t) { return t.k === h.talent; })[0];
    return E.line(s, 'hob_' + id, h.lines) + ' (' + tl.label + ' 재능 +' + g + (onRoute ? ' · 길 실력 +1' : '') + ')';
  };

  // ---------------------------------------------------------------- drinking: social now, incidents later
  // open to adults, and to a 악동 teenager who runs with the street crowd
  L.drinkOpen = function (s) { return s.age >= 19 || (s.age >= 14 && (s.flags.street_crew || s.flags.iljin || (s.traits.mischief || 0) >= 30)); };
  var DRINK_LINES = ['포장마차에서 처음 보는 사람들과 잔을 부딪쳤다.', '회식 2차, 3차까지 따라갔다. 노래방에서 목이 쉬었다.', '친구 생일 파티에서 밤을 새웠다.', '동네 술집 사장님이 안주를 하나 더 내줬다.', '술기운에 오래 연락 안 한 친구에게 전화했다.', '술잔을 돌리며 속 얘기를 꺼냈다. 다들 조용히 들어 줬다.', '맥주 한 잔이 다섯 잔이 됐다.', '새벽 첫차를 타고 집에 갔다.'];
  var TEEN_DRINK = ['공원 구석에서 형들이 건넨 캔맥주를 받았다. 쓴맛에 얼굴을 찡그렸다.', '편의점 뒤에서 몰래 소주 한 병을 나눠 마셨다.', '친구네 빈집에서 술판이 벌어졌다. 머리가 핑 돌았다.'];
  L.drink = function (s) {
    s.money -= Math.round(E.rint(s, 30, 80) * W(s));
    var t = s.traits;
    var soc = E.rint(s, 2, 3);
    E.addStat(s, 'social', soc); E.addStat(s, 'happy', 2);
    var up = E.rint(s, 4, 6) + (s.age < 19 ? 2 : 0);
    t.alcohol = clamp((t.alcohol || 0) + up, 0, 100); s.y.drank = true;
    s.y.drinks = (s.y.drinks || 0) + 1;
    if (s.age < 19) { t.mischief = clamp((t.mischief || 0) + 2, 0, 100); E.addStat(s, 'health', -1); }
    E.traitUnlocks(s);
    var line = E.line(s, s.age < 19 ? 'drink_teen' : 'drink', s.age < 19 ? TEEN_DRINK : DRINK_LINES);
    return line + ' (사교성 +' + soc + ' · 음주 +' + up + ': 음주가 높을수록 술 먹고 사고 칠 확률이 커진다)';
  };
  // incident chance grows with drinking: 0 below 15, about 1 in 3 a year near 60, more when drinking this year
  L.incidentChance = function (s) { var a = (s.traits || {}).alcohol || 0; if (a < 15) return 0; return clamp((a - 10) / 150 + (s.y.drinks || 0) * 0.05, 0, 0.6); };
  var INCIDENTS = ['drk_drunk_fight', 'drk_drunk_tongue', 'drk_blackout', 'drk_lost_stuff', 'drk_drunk_drive'];
  function yearlyDrink(s) {
    if (s.jail > 0 || s.age < 14 || !E.chance(s, L.incidentChance(s))) return;
    var pool = INCIDENTS.filter(function (id) { var ev = E.eventIndex()[id]; return s.age >= ev.age[0] && (id !== 'drk_drunk_drive' || s.flags.car_owner) && (id !== 'drk_blackout' || s.age >= 16); });
    E.queueSys(s, E.pick(s, pool));
  }

  // ---------------------------------------------------------------- dark routes: heat each year
  function yearlyDark(s) {
    if (L.isDark(s) && s.flags.went_straight != null) delete s.flags.went_straight; // back in the dark: the clean years start over
    if (!L.isDark(s) || s.jail > 0 || !s.alive) return;
    var st = s.route.st || 0, p = 0.16 + st * 0.06;
    if (!E.chance(s, p)) return;
    var x = E.rnd(s), id = x < 0.45 ? 'drk_raid' : x < 0.75 || st < 1 ? 'drk_rival' : 'drk_betrayal';
    E.queueSys(s, id);
  }

  // ---------------------------------------------------------------- sponsor / lobby / bribe: exposure later
  function yearlySponsor(s) {
    var sp = s.spon;
    if (!sp || !sp.n || sp.exposed || s.jail > 0) return;
    var yrs = s.age - sp.last;
    if (yrs >= 1 && E.chance(s, 0.07 + 0.04 * sp.n)) { E.queueSys(s, 'spn_exposed'); return; }
    if (sp.n >= 2 && s.age - sp.first >= 6 && !s.flags.power_broker) { s.flags.power_broker = s.age; E.addLog(s, '🤝 받은 돈과 맺은 끈이 쌓여 힘이 됐다. 이제 내가 전화 한 통으로 일을 움직인다.', 'milestone'); }
  }

  // ---------------------------------------------------------------- childhood: crises leave marks
  function yearlyChild(s) {
    var f = s.flags;
    if (f.trauma && !f.trauma_healed) {
      if (s.age <= 25) E.addStat(s, 'happy', -1);
      if (s.age >= 16 && s.stats.social >= 55 && E.chance(s, 0.15)) { f.trauma_healed = s.age; E.addLog(s, '어릴 적 기억을 처음으로 누군가에게 털어놓았다. 오래 묵은 무게가 조금 가벼워졌다.', 'good'); }
    }
    if (f.bullied && s.age <= 18 && E.chance(s, 0.3)) E.addStat(s, 'social', -1);
    if (f.hardship && s.age <= 18 && E.chance(s, 0.4)) E.addStat(s, 'grit', 1);
    if (f.bad_knee && s.body) s.body.endurance = Math.min(s.body.endurance, 55);
    // the neighbourhood presses on a child: the street pulls, money cushions
    if (s.age >= 8 && s.age <= 17) {
      if (s.origin === 'slum' && E.chance(s, 0.35)) s.traits.mischief = clamp((s.traits.mischief || 0) + 1, 0, 100);
      if (s.origin === 'rich' && E.chance(s, 0.3)) E.addStat(s, 'smarts', 1);
    }
  }

  // hobbies feed their talents (most in childhood)
  function yearlyHobbies(s) {
    (s.hobbies || []).forEach(function (id) {
      var h = hob(id); if (!h) return;
      if (s.age <= 18 || s.age % 2 === 0) RT.addTalent(s, h.talent, 1);
      if (id === 'football' && s.age <= 15 && s.stats.football < E.Football.cap(s)) E.addStat(s, 'football', 1);
    });
    if ((s.hobbies || []).length) E.addStat(s, 'happy', 0.5);
    hobbyRisk(s);
  }

  // ---------------------------------------------------------------- FX
  var FX = E.FX;
  FX.hobbyBoost = function (s) {
    var h = hob((s.hobbies || [])[0]); if (!h) return null;
    RT.addTalent(s, h.talent, 3);
    if (h.id === 'football') E.addStat(s, 'football', 3);
    return h.name + '에 쏟은 시간만큼 실력이 붙었다.';
  };
  FX.wayOut = function (s) {
    ['iljin', 'street_crew'].forEach(function (f) { delete s.flags[f]; });
    s.flags.left_gang = s.age; s.flags.way_out = s.age;
    var h = hob((s.hobbies || [])[0]); if (h) RT.addTalent(s, h.talent, 4);
    return '거리 대신 ' + (h ? h.name : '새로운 일') + '을(를) 붙잡았다.';
  };
  FX.flee = function (s) {
    s.flags.fled = s.age; s.flags.abroad = s.age; s.abroadCity = s.abroadCity || E.pick(s, ['방콕', '마닐라', '두바이', '리마', '이스탄불']);
    if (L.isDark(s)) RT.leave(s, 'flee', '가짜 여권 한 장으로 ' + s.abroadCity + '(으)로 몸을 숨겼다. 이 바닥과는 끝이다.');
    return '이름을 바꾸고 ' + s.abroadCity + '에서 숨어 살기 시작했다.';
  };
  FX.goStraight = function (s) {
    s.flags.went_straight = s.age;
    s.traits.mischief = Math.max(0, (s.traits.mischief || 0) - 15);
    var r = RT.cur(s);
    if (r && !r.state) RT.leave(s, 'quit', L.isDark(s) ? '손을 씻었다. 이제 평범하게 살아 보기로 했다.' : '모든 것을 내려놓고 떠났다.');
    return null;
  };
  FX.streetClash = function (s) {
    var d = E.rint(s, 14, 30);
    E.addStat(s, 'health', -d);
    if (s.stats.health <= 0 || E.chance(s, 0.12)) { s.flags.street_death = s.age; s.stats.health = 0; s.causeOverride = '골목의 칼부림'; return '골목 바닥이 차가웠다. 그것이 마지막 기억이었다.'; }
    s.flags.scarred = s.age;
    return '수십 바늘을 꿰맸다. 흉터가 남았다. (건강 -' + d + ')';
  };
  FX.drunkCrash = function (s) {
    s.flags.drunk_crash = s.age; delete s.flags.car_owner;
    s.traits.record = (s.traits.record || 0) + 1; s.traits.rep = Math.max(0, (s.traits.rep || 50) - 15);
    E.addStat(s, 'health', -E.rint(s, 8, 20)); s.money -= Math.round(3000 * W(s));
    if (E.chance(s, 0.35)) { s.flags.drunk_victim = s.age; var m = FX.jail(s); return '가드레일을 들이받고 다른 차까지 덮쳤다. 상대 운전자가 크게 다쳤다. 면허가 취소되고 ' + (m || '재판을 받았다.'); }
    return '가드레일을 들이받았다. 면허가 취소되고 벌금과 전과가 남았다. 차는 폐차했다.';
  };
  FX.spnTake = function (s) {
    var sp = s.spon = s.spon || { n: 0, last: 0, first: s.age, exposed: false };
    sp.n++; sp.last = s.age; if (!sp.first) sp.first = s.age;
    s.flags.took_sponsor = s.age;
    return null;
  };
  // exposure: a scandal ends the route; bribery in a public job also brings a trial
  var BRIBE_JAIL = ['law', 'politics', 'public', 'safety', 'medical', 'military', 'football', 'basketball', 'baseball', 'fighter', 'esports'];
  FX.spnFall = function (s) {
    var sp = s.spon || {}; sp.exposed = true; s.flags.spn_exposed = s.age;
    var r = RT.cur(s), rid = r && r.id;
    var msg = '';
    if (r && !r.state) { RT.leave(s, 'scandal', '받은 돈이 세상에 드러났다. 모든 자리에서 내려왔다.'); msg = '모든 자리에서 내려왔다.'; }
    if (BRIBE_JAIL.indexOf(rid) >= 0 && s.jail <= 0 && E.chance(s, 0.6)) { s.flags.spn_jailed = s.age; msg += ' ' + (FX.jail(s) || ''); }
    return msg.trim() || null;
  };
  FX.spnSurvive = function (s) { if (s.spon) s.spon.exposed = true; s.flags.spn_survived = s.age; return null; };
  FX.spnCooperate = function (s) {
    if (s.spon) s.spon.exposed = true; s.flags.spn_exposed = s.age; s.flags.spn_cooperated = s.age;
    s.money -= Math.round(5000 * W(s));
    var r = RT.cur(s); if (r && !r.state) RT.leave(s, 'scandal', '수사에 협조하고 자리에서 물러났다. 감옥은 피했다.');
    return null;
  };
  FX.whistle = function (s) {
    s.flags.whistleblower = s.age; s.traits.rep = clamp((s.traits.rep || 50) + 10, 0, 100);
    s.pending.push({ age: s.age + 1, id: 'spn_retaliation' });
    return '내부 고발자가 됐다. 박수와 원망이 함께 왔다.';
  };

  // ---------------------------------------------------------------- choices that start a route (choice.route)
  var _choose = E.choose;
  E.choose = function (s, idx) {
    var ev = E.eventIndex()[s.queue[0]];
    var ch = ev && (ev.choicesFn ? ev.choicesFn(s) : ev.choices || [])[idx];
    var to = ch && ch.route;
    var res = _choose(s, idx);
    if (res && to && s.alive && s.jail <= 0 && s.route.id !== to && RT.legal(s.route.id, to, 'choice')) {
      var line = RT.enter(s, to, { cause: 'choice', quiet: true });
      if (line) { E.addLog(s, line, 'milestone'); res.changes.push({ k: 'msg', t: line }); }
    }
    if (res && s.causeOverride && !s.alive) s.cause = s.causeOverride;
    return res;
  };
  // a route-starting choice is shown only when the move is legal now
  var _avail = E.choiceAvailable;
  E.choiceAvailable = function (s, ch) {
    if (ch.route && s.route && !RT.legal(s.route.id, ch.route, 'choice')) return false;
    if (ch.career === 'street_vendor' && !L.suitsTrade(s)) return false; // a stall only for someone the trade suits
    return _avail(s, ch);
  };

  // ---------------------------------------------------------------- hooks: new game, yearly, death cause
  var _newGame = E.newGame;
  E.newGame = function (opts) {
    var s = _newGame(opts);
    opts = opts || {};
    s.origin = s.household ? ['slum', 'poor', 'middle', 'middle', 'rich'][s.household.tier - 1] : L.rollOrigin(s, opts.parentState);
    originStart(s);
    s.hobbies = []; s.hobbyEver = {};
    if (s.country === 'pt' && !opts.parentState && (!s.household || s.household.preset === 'canon')) L.add(s, 'football'); // legacy/canon only
    if (opts.parentState && s.age >= 5) L.autoPick(s);
    s.spon = null;
    return s;
  };
  var _ageUp = E.ageUp;
  E.ageUp = function (s) {
    var res = _ageUp(s);
    if (!s.alive || !res) return res;
    if (s.household && s.age >= 5 && s.age < 19 && s.household.allowanceAge !== s.age) {
      var amount = Math.max(0, (s.household.tier - 1) * 5);
      s.wallet = (s.wallet || 0) + amount;
      s.household.cash = (s.household.cash || 0) - amount;
      s.household.allowanceAge = s.age;
      E.addLog(s, '부모님의 가계 현금에서 용돈 ' + amount + '을 내 지갑으로 옮겼다.', 'info');
    }
    yearlyHobbies(s); yearlyChild(s); yearlyDrink(s); yearlyDark(s); yearlySponsor(s);
    // the hobby pick comes first in the year it is due (right after the age-5 early-education review)
    if (s.age >= 5 && (s.hobbies || []).length < 2 && !s.fired.sys_hobby && E.queueSys(s, 'sys_hobby')) {
      s.queue.pop();
      s.queue.splice(s.queue[0] === 'sys_edu_change' ? 1 : 0, 0, 'sys_hobby');
    }
    return res;
  };
  // the birth line names the neighbourhood
  var _birth = E.birth;
  E.birth = function (s) {
    _birth(s);
    var o = D().origins[s.origin];
    if (o && s.country !== 'pt') E.addLog(s, o.icon + ' 태어난 곳: ' + (E.vars(s).hood || o.name) + ' — ' + o.desc, 'milestone');
  };

  // ---------------------------------------------------------------- save migration v6 → v7
  // the old 'crime' history (route log, years, first seen, peak) goes to the dark route of the crime
  // careers actually held at the time (job history), so a cyber-criminal stays a 꾼 and not a gangster
  function migrateCrimeHistory(s) {
    var jobs = (s.jobHistory || []).concat(s.job ? [{ id: s.job.id, from: s.job.since, to: s.age, top: false }] : []);
    var spells = jobs.map(function (j) { return { r: RT.ofCareer(j.id), from: j.from, to: j.to, top: !!j.top }; })
      .filter(function (x) { return DARK.indexOf(x.r) >= 0; });
    var fallback = spells.length ? spells[spells.length - 1].r : (L.isDark(s) ? s.route.id : 'gang');
    function at(age, entering) {
      var hit = spells.filter(function (x) { return entering ? x.from === age : x.to === age; })[0] ||
        spells.filter(function (x) { return age >= x.from && age <= x.to; })[0];
      return hit ? hit.r : fallback;
    }
    (s.routeLog || []).forEach(function (m) {
      if (m.to === 'crime') m.to = at(m.age, true);
      if (m.from === 'crime') m.from = at(m.age, false);
    });
    var len = {};
    spells.forEach(function (x) { len[x.r] = (len[x.r] || 0) + Math.max(1, x.to - x.from); });
    var main = Object.keys(len).sort(function (a, b) { return len[b] - len[a]; })[0] || fallback;
    if (s.routeYears && s.routeYears.crime != null) {
      var total = s.routeYears.crime, ids = Object.keys(len);
      delete s.routeYears.crime;
      if (!ids.length) ids = [fallback], len[fallback] = 1;
      var span = ids.reduce(function (a, k) { return a + len[k]; }, 0), given = 0;
      ids.forEach(function (k) { var n = Math.floor(total * len[k] / span); s.routeYears[k] = (s.routeYears[k] || 0) + n; given += n; });
      s.routeYears[main] = (s.routeYears[main] || 0) + (total - given);
    }
    if (s.routeSeen && s.routeSeen.crime != null) {
      var seen = s.routeSeen.crime; delete s.routeSeen.crime;
      if (spells.length) spells.forEach(function (x) { if (s.routeSeen[x.r] == null || s.routeSeen[x.r] > x.from) s.routeSeen[x.r] = Math.max(seen, x.from); });
      else s.routeSeen[fallback] = seen;
    }
    if (s.routePeak && s.routePeak.crime != null) {
      var top = spells.filter(function (x) { return x.top; }).pop();
      s.routePeak[top ? top.r : main] = s.routePeak.crime; delete s.routePeak.crime;
    }
  }
  L.migrateCrimeHistory = migrateCrimeHistory;
  L.migrate = function (s) {
    if (!s.origin) {
      // older lives were all born into the canon poor family, unless they were heirs of a rich parent
      s.origin = s.flags && s.flags.heir && s.legacy && s.legacy.money >= 1e6 * E.country(s).wage ? 'rich' : 'poor';
    }
    if (!s.hobbies) {
      s.hobbies = []; s.hobbyEver = {};
      var fbPlayed = (s.fb && (s.fb.stage !== 'none' || s.fb.seasons > 0)) || (s.flags && s.flags.fb_quit != null) || s.track === 'football';
      if (fbPlayed || s.country === 'pt') L.add(s, 'football');
      if (s.age >= 5) L.autoPick(s);
      else if (s.country !== 'pt') s.hobbies = [];
      if (s.age >= 5) s.fired.sys_hobby = 1;
    }
    if (s.spon === undefined) s.spon = null;
    // the old single 뒷골목 route split into 조직 / 사기·꾼 / 털이·밀수 (by the job held)
    if (s.route && s.route.id === 'crime') {
      var to = s.job ? RT.ofCareer(s.job.id) : null;
      s.route = null;
      RT.sync(s, true);
      if (!to) s.route.id = s.route.id === 'crime' ? 'none' : s.route.id;
    }
    migrateCrimeHistory(s);
    s.saveVersion = 7;
    return s;
  };

  // ---------------------------------------------------------------- endings (round 8)
  // years since the hero last left a dark route for good (-1: still in it, or never went straight);
  // going back to crime or to prison afterwards starts the count again
  L.cleanYears = function (s) {
    if (s.flags.went_straight == null || L.isDark(s) || s.jail > 0) return -1;
    var last = s.flags.went_straight;
    (s.routeLog || []).forEach(function (m) { if (DARK.indexOf(m.from) >= 0 && m.age > last) last = m.age; });
    if (s.flags.ever_jailed > last) last = s.flags.ever_jailed;
    return s.age - last;
  };
  function peakAny(s, pred) { return Object.keys(s.routePeak || {}).some(function (id) { var r = RT.byId(id); return r && (!pred || pred(r)); }); }
  var NEW_ENDINGS = [
    { id: 'street_death', kind: 'fall', icon: '🩸', name: '골목에서 진 사람', desc: '거리에서 배운 것은 거리에서 끝났다.', hint: '어둠의 길에서 칼부림에 쓰러지면', test: function (s) { return !!s.flags.street_death; } },
    { id: 'drunk_tragedy', kind: 'fall', icon: '🚨', name: '한 잔의 대가', desc: '그날 밤 운전대를 잡지 않았더라면.', hint: '음주 운전 사고로 사람을 다치게 하면', test: function (s) { return !!s.flags.drunk_victim; } },
    { id: 'fugitive', kind: 'fall', icon: '🧳', name: '이름을 버린 도망자', desc: '낯선 나라에서 다른 이름으로 늙어 갔다.', hint: '어둠의 길에서 해외로 도망치면', test: function (s) { return !!s.flags.fled && !s.flags.went_straight; } },
    { id: 'sponsor_fall', kind: 'fall', icon: '📸', name: '스폰서 스캔들', desc: '받은 돈과 선물이 1면을 채웠다.', hint: '스폰서·뇌물을 받았다가 들통나면', test: function (s) { return !!s.flags.spn_exposed && !s.flags.spn_survived; } },
    { id: 'power_broker', kind: 'fall', icon: '🕴️', name: '그림자 실세', desc: '이름은 없지만 모든 결정 뒤에 그가 있었다.', hint: '로비·스폰서를 여러 번 받고 끝까지 들키지 않으면', test: function (s) { return !!s.flags.power_broker && !s.flags.spn_exposed; } },
    { id: 'whistleblower', kind: 'win', icon: '📢', name: '침묵하지 않은 사람', desc: '모두가 눈감을 때 혼자 입을 열었다.', hint: '뇌물·스폰서 제안을 폭로하면', test: function (s) { return !!s.flags.whistleblower; } },
    { id: 'slum_star', kind: 'win', icon: '🌠', name: '골목에서 별까지', desc: '판자 지붕 아래에서 꾼 꿈이 정상에 닿았다.', hint: '빈민가·가난한 동네에서 태어나 어떤 길이든 정상에 오르면', test: function (s) { return (s.origin === 'slum' || (s.origin === 'poor' && s.country !== 'pt')) && peakAny(s, function (r) { return DARK.indexOf(r.id) < 0; }); } },
    { id: 'went_straight', kind: 'win', icon: '🕊️', name: '손을 씻은 사람', desc: '어둠에서 걸어 나와 평범한 하루를 지켰다.', hint: '어둠의 길을 떠나 10년 넘게 바르게 살면', test: function (s) { return L.cleanYears(s) >= 10; } },
    { id: 'reformed_rascal', kind: 'win', icon: '🌤️', name: '일진에서 어른으로', desc: '복도의 무서운 아이가 누군가의 든든한 어른이 됐다.', hint: '일진·패거리에서 빠져나와 손을 내민 어른을 따라가거나, 식구가 되라는 제안을 뿌리치면', test: function (s) { return !!s.flags.way_out || (!!s.flags.left_crew && (s.traits.mischief || 0) < 30 && !(s.traits.record > 0)); } },
    { id: 'sober_again', kind: 'win', icon: '☀️', name: '다시 맑아진 사람', desc: '술병을 내려놓고 아침을 되찾았다.', hint: '음주가 심했다가 치료로 끊어 내면', test: function (s) { return !!s.flags.was_heavy_drinker && (s.traits.alcohol || 0) < 25; } },
    { id: 'party_soul', kind: 'win', icon: '🍻', name: '모두의 술친구', desc: '그가 있는 자리는 늘 웃음이 넘쳤다.', hint: '사교성 85 이상, 술은 즐기되 중독은 피하면', test: function (s) { return s.stats.social >= 85 && (s.traits.alcohol || 0) >= 20 && (s.traits.alcohol || 0) < 60; } },
    { id: 'rich_fall', kind: 'fall', icon: '🏚️', name: '금수저의 몰락', desc: '물려받은 것을 다 잃는 데는 오래 걸리지 않았다.', hint: '부유한 집에서 태어나 파산하면', test: function (s) { return s.origin === 'rich' && !!s.flags.bankrupt && s.money <= 0; } },
    { id: 'self_made_heir', kind: 'win', icon: '🧗', name: '스스로 일어선 금수저', desc: '집안 돈 대신 내 힘으로 정상에 섰다.', hint: '부유한 집에서 태어나 집안 돈을 거절하고 정상에 오르면', test: function (s) { return s.origin === 'rich' && !!s.flags.refused_family_money && peakAny(s); } },
    { id: 'hobby_dream', kind: 'win', icon: '🎈', name: '좋아하던 걸 직업으로', desc: '어릴 적 취미가 평생의 일이 됐다.', hint: '어릴 때 고른 취미와 같은 길에서 정상에 오르면', test: function (s) { return Object.keys(s.routePeak || {}).some(function (id) { return Object.keys(s.hobbyEver || {}).some(function (h) { var x = hob(h); return x && s.hobbyEver[h] <= 12 && x.routes.indexOf(id) >= 0; }); }); } },
    { id: 'lifelong_hobby', kind: 'win', icon: '🎐', name: '평생 취미인', desc: '일은 바뀌어도 좋아하는 건 끝까지 함께였다.', hint: '어릴 때 고른 취미를 70세 넘어서까지 이어 가면', test: function (s) { return s.age >= 70 && (s.hobbies || []).some(function (h) { return s.hobbyEver && s.hobbyEver[h] <= 12; }); } },
    { id: 'childhood_scar', kind: 'fall', icon: '🧸', name: '자라지 못한 아이', desc: '어린 날의 상처를 끝내 꺼내 놓지 못했다.', hint: '어릴 적 상처(트라우마)를 끝내 치유하지 못하면', test: function (s) { return !!s.flags.trauma && !s.flags.trauma_healed && s.stats.happy < 45; } }
  ];
  L.ENDINGS = NEW_ENDINGS;
  (function installEndings() {
    var list = D().endings;
    if (list.some(function (e) { return e.id === 'street_death'; })) return;
    var ids = function () { return list.map(function (e) { return e.id; }); };
    // specific falls right after an early death; specific wins before the general fame/wealth wins
    var falls = NEW_ENDINGS.filter(function (e) { return e.kind === 'fall'; }), wins = NEW_ENDINGS.filter(function (e) { return e.kind === 'win'; });
    // a death in the street or behind the wheel, or a life on the run, is told as such even when it came young
    var first = falls.filter(function (e) { return ['street_death', 'drunk_tragedy', 'fugitive'].indexOf(e.id) >= 0; });
    Array.prototype.splice.apply(list, [ids().indexOf('young_death'), 0].concat(first));
    var early = falls.filter(function (e) { return ['sponsor_fall', 'power_broker'].indexOf(e.id) >= 0; });
    Array.prototype.splice.apply(list, [ids().indexOf('young_death') + 1, 0].concat(early));
    // turning a life around outranks the route and fame endings it would otherwise fall under
    var top = wins.filter(function (e) { return ['whistleblower', 'went_straight', 'reformed_rascal', 'sober_again', 'slum_star', 'self_made_heir', 'hobby_dream'].indexOf(e.id) >= 0; });
    Array.prototype.splice.apply(list, [ids().indexOf('tycoon'), 0].concat(top));
    var late = falls.filter(function (e) { return first.indexOf(e) < 0 && early.indexOf(e) < 0; });
    Array.prototype.splice.apply(list, [ids().indexOf('bankrupt'), 0].concat(late));
    var social = wins.filter(function (e) { return e.id === 'party_soul'; });
    Array.prototype.splice.apply(list, [ids().indexOf('family'), 0].concat(social));
    var calm = wins.filter(function (e) { return top.indexOf(e) < 0 && social.indexOf(e) < 0; });
    Array.prototype.splice.apply(list, [ids().indexOf('centenarian'), 0].concat(calm));
  })();
  // a heavy drinker is remembered as one (for the 다시 맑아진 사람 ending)
  var _traits = E.traitUnlocks;
  E.traitUnlocks = function (s) { _traits(s); if ((s.traits.alcohol || 0) >= 50 && !s.flags.was_heavy_drinker) s.flags.was_heavy_drinker = s.age; };

  E.SYS_EVENTS = E.SYS_EVENTS.concat(HOBBY_EVENTS);
  E.resetCaches();
  void C;
  RA.ownEvents(E.SYS_EVENTS);
  function snapshot(s) {
    return JSON.parse(JSON.stringify({ degree: s.edu.degree, school: s.edu.stage, job: s.job, retired: s.retiredFromWork, alive: s.alive, children: s.people.filter(function (p) { return p.role === 'child'; }).length, spouse: !!E.person(s, 'spouse'), partner: !!E.person(s, 'partner'), fb: s.fb, born: s.born }));
  }
  function record(s, b) {
    function emit(kind, title, tone, tier) { E.emitMoment(s, {kind: kind, title: title, tone: tone || 'joy', tier: tier || 'S'}); }
    if (!b.partner && E.person(s, 'partner')) emit('first_love', '마음을 나눈 날', 'tender', 'A');
    if (s.edu.degree !== b.degree) emit('graduation', '졸업');
    if (s.edu.stage !== b.school && ['elem', 'middle', 'high', 'univ', 'grad'].includes(s.edu.stage)) emit('enrollment', '새로운 학교', 'joy', 'A');
    Object.keys(s.fb.trophies).forEach(function (k) { if (s.fb.trophies[k] > b.fb.trophies[k]) emit('trophy_' + k, k === 'ballon' ? '발롱도르' : k === 'wc' ? '월드컵 우승! SIUUU!' : '우승! SIUUU!', 'triumph'); });
    if (b.alive && !s.alive) emit('death', '한 인생의 마지막', 'sad');
  }
  ['choose', 'ageUp', 'doActivity', 'applyJob'].forEach(function (method) {
    var original = E[method];
    E[method] = function (s) {
      var before = snapshot(s), appliedBefore = E.changeSnapshot(s), result = original.apply(E, arguments);
      record(s, before);
      s.appliedChanges = E.diffChanges(appliedBefore, E.changeSnapshot(s));
      if (result && typeof result === 'object') { result.appliedChanges = s.appliedChanges; result.changes = s.appliedChanges; }
      return result;
    };
  });
  E.changeSnapshot = function (s) {
    var out = {};
    Object.keys(s).forEach(function (k) {
      if (!['rng','log','hist','cards','appliedChanges','seq','momentSeq','cd','fired','queue','nextPid'].includes(k)) out[k] = s[k];
    });
    return JSON.parse(JSON.stringify(out));
  };
  E.diffChanges = function (before, after) {
    var out = [];
    var moneyCountry = RA.data.countries[after.country];
    var labels = {stats:'능력',money:'잔고',wallet:'내 지갑',household:'가계',cash:'현금',people:'사람들',rel:'관계',flags:'기억하는 일',moments:'큰 순간',chronicle:'연대기',memories:'기억',job:'직업',route:'진로',fb:'축구',edu:'학교',ap:'남은 행동'};
    function walk(a,b,path) {
      if (a === b || (Array.isArray(a) && Array.isArray(b) && JSON.stringify(a) === JSON.stringify(b))) return;
      if(path.length===1 && path[0]==='people'){
        var oldPeople=new Map((a||[]).map(function(p){return [p.id,p];}));
        (b||[]).forEach(function(p){
          var old=oldPeople.get(p.id), person={id:p.id,name:p.name,role:p.role};
          if(!old){out.push({kind:'person',k:'msg',path:'people.'+p.id,person:person,action:'added',before:null,after:p,t:p.name+'을(를) 만났다.'});return;}
          Object.keys(p).forEach(function(field){
            if(old[field]===p[field] || JSON.stringify(old[field])===JSON.stringify(p[field]))return;
            var delta=typeof p[field]==='number'&&typeof old[field]==='number'?p[field]-old[field]:null;
            var label={rel:'관계',alive:'생존',role:'관계 역할',age:'나이',recovery:'회복',sober:'금주',memories:'기억'}[field]||field;
            out.push({kind:field==='rel'?'relationship':'person',k:field==='rel'?'rel':'msg',path:'people.'+p.id+'.'+field,person:person,who:p.role,field:field,label:label,before:old[field]==null?null:old[field],after:p[field],d:delta,t:p.name+' · '+label+(delta==null?' 기록': ' '+(delta>0?'+':'')+delta)});
          });oldPeople.delete(p.id);
        });
        oldPeople.forEach(function(p){out.push({kind:'person',k:'msg',path:'people.'+p.id,person:{id:p.id,name:p.name,role:p.role},action:'removed',before:p,after:null,t:p.name+'의 관계 기록이 바뀌었다.'});});
        return;
      }
      if(path.length===1&&['memories','chronicle','moments'].includes(path[0])){
        var array=Array.isArray(b),oldEntries=array?new Map((a||[]).map(function(e){return[e.id,e];})):new Map(Object.entries(a||{}));
        (array?(b||[]).map(function(e){return[e.id,e];}):Object.entries(b||{})).forEach(function(pair){
          var id=pair[0],entry=pair[1],old=oldEntries.get(id);
          if(JSON.stringify(old)!==JSON.stringify(entry))out.push({kind:path[0]==='memories'?'memory':path[0]==='chronicle'?'chronicle':'moment',k:'msg',path:path[0]+'.'+id,action:old?'updated':'added',before:old||null,after:entry,text:entry.text||null,title:entry.title||null,personId:entry.personId||null,entry:entry,t:entry.text||entry.title});
          oldEntries.delete(id);
        });
        oldEntries.forEach(function(entry,id){out.push({kind:path[0]==='moments'?'moment':path[0]==='chronicle'?'chronicle':'memory',k:'msg',path:path[0]+'.'+id,action:'removed',before:entry,after:null,entry:entry,text:entry.text||null,title:entry.title||null,t:entry.text||entry.title});});
        return;
      }
      if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
        Array.from(new Set(Object.keys(a).concat(Object.keys(b)))).forEach(function (k) { walk(a[k],b[k],path.concat(k)); }); return;
      }
      var stat = path[0] === 'stats' && path.length === 2;
      var label = stat ? C.STAT_LABELS[path[1]] : path[0] === 'traits' ? '생활 습관 · '+path[1] : labels[path[path.length-1]] || labels[path[0]] || path.join('.');
      var delta = typeof a === 'number' && typeof b === 'number' ? b-a : null;
      var moneyPath = path.join('.'), displayAmount = null;
      if (delta != null && ['money','wallet','household.cash'].includes(moneyPath)) displayAmount = T.money(delta * (moneyPath === 'money' ? 1 : moneyCountry.wage), moneyCountry);
      out.push({kind:stat?'stat':'state',stat:stat?path[1]:null,label:label,k:stat ? path[1] : path.length === 1 && path[0] === 'money' ? 'money' : 'msg',path:moneyPath,before:a == null ? null : a,after:b == null ? null : b,d:delta,displayAmount:displayAmount,t:label + (displayAmount ? ' ' + displayAmount : delta == null ? ' 기록' : ' ' + (delta>0?'+':'') + delta)});
    }
    walk(before,after,[]);
    return out;
  };
  E.lastChanges = function (s) { return JSON.parse(JSON.stringify(s.appliedChanges || [])); };
})(typeof globalThis !== 'undefined' ? globalThis : this);
