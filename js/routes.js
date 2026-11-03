/* Route engine (round 7). Every life state belongs to exactly one route (data/routes.js).
 * - s.body (rolled at birth), s.talent (prenatal + early education), s.track (school track)
 * - s.route = { id, st: stage index, at: years at stage, sk: route skill 0-100, since, branch: career id }
 * - only the current route's events and route-neutral events fire (RT.eventOk)
 * - a route changes only through declared exits (RT.legal); every change is logged in s.routeLog
 * Depends on js/engine.js, js/systems.js, js/football.js. */
(function (G) {
  var RA = G.RA = G.RA || {};
  var E = RA.Engine, C = RA.C, T = RA.Text, R = RA.RNG;
  var RT = E.Routes = {};
  function D() { return RA.data; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  var SCHOOL_STAGES = ['elem', 'middle', 'high', 'univ', 'grad'];
  function inSchool(s) { return SCHOOL_STAGES.indexOf(s.edu.stage) >= 0; }

  // ---------------------------------------------------------------- index
  var _idx = null;
  function index() {
    var n = D().routes.length * 1000 + D().careers.length;
    if (_idx && _idx._n === n) return _idx;
    _idx = { _n: n, byId: {}, byCareer: {} };
    D().routes.forEach(function (r) {
      _idx.byId[r.id] = r;
      (r.careers || []).forEach(function (c) { if (!_idx.byCareer[c]) _idx.byCareer[c] = r.id; });
    });
    return _idx;
  }
  RT.byId = function (id) { return index().byId[id] || null; };
  RT.ofCareer = function (cid) { return index().byCareer[cid] || null; };
  RT.isLadder = function (r) { return !!(r && r.stages && !r.generic && !r.state); };
  RT.cur = function (s) { if (!s.route) RT.sync(s, true); return RT.byId(s.route.id); };

  // ---------------------------------------------------------------- body & talents
  // average adult height (cm) per country and gender
  var HEIGHT = { kr: [174, 161], jp: [171, 158], cn: [172, 160], us: [176, 162], pt: [173, 163], br: [173, 161], ar: [174, 161], za: [170, 159], in: [166, 153] };
  RT.avgHeight = function (s) { var h = HEIGHT[s.country] || [172, 160]; return h[s.hero.gender === 'f' ? 1 : 0]; };
  RT.rollBody = function (s, parent) {
    // a separate seeded stream, so the main life RNG sequence is unchanged by the body roll
    var r = R.create(s.seed + '|body|' + s.country + '|' + (s.generation || 1));
    function n(a, b) { return a + Math.floor(R.next(r) * (b - a + 1)); }
    function bell() { return Math.round((n(0, 100) + n(0, 100) + n(0, 100)) / 3); }
    var b = {};
    var tall = n(1, 100) <= 7 ? n(7, 15) : 0;
    b.height = RT.avgHeight(s) + Math.round((bell() - 50) * 0.34) + tall;
    D().bodyAttrs.forEach(function (a) { if (a.k !== 'height') b[a.k] = clamp(bell() + n(-12, 12), 3, 99); });
    if (parent && parent.body) Object.keys(b).forEach(function (k) { if (parent.body[k] != null) b[k] = Math.round((b[k] + parent.body[k]) / 2); });
    return b;
  };
  RT.rollTalent = function (s) {
    var r = R.create(s.seed + '|talent|' + s.country + '|' + (s.generation || 1));
    var t = {};
    D().talents.forEach(function (a) { t[a.k] = 5 + Math.floor(R.next(r) * 21); });
    return t;
  };
  // height as a 0-100 score relative to the country average for the hero's gender (avg = 50, +1 cm = +3)
  RT.heightScore = function (s) { return clamp(Math.round(50 + ((s.body ? s.body.height : RT.avgHeight(s)) - RT.avgHeight(s)) * 3), 0, 100); };
  RT.attr = function (s, k) {
    if (k === 'height') return RT.heightScore(s);
    if (s.body && s.body[k] != null) return s.body[k];
    if (s.talent && s.talent[k] != null) return s.talent[k];
    if (s.stats[k] != null) return s.stats[k];
    return (s.traits && s.traits[k]) || 0;
  };
  RT.addTalent = function (s, k, d) { if (!s.talent) return; s.talent[k] = clamp((s.talent[k] || 0) + d, 0, 100); };
  // how well body, talents and stats suit a route (0-100)
  RT.fit = function (s, r) {
    if (!r || !r.fit) return 50;
    var sum = 0, w = 0;
    Object.keys(r.fit).forEach(function (k) { sum += RT.attr(s, k) * r.fit[k]; w += r.fit[k]; });
    return w ? Math.round(sum / w) : 50;
  };
  RT.bodyText = function (s) {
    var b = s.body; if (!b) return '';
    var grade = function (v) { return v >= 75 ? '타고났다' : v >= 58 ? '좋은 편' : v >= 42 ? '보통' : v >= 25 ? '약한 편' : '많이 약하다'; };
    return '예상 키 ' + b.height + 'cm · 체격 ' + grade(b.build) + ' · 반사신경 ' + grade(b.reflex) + ' · 목소리 ' + grade(b.voice);
  };

  // ---------------------------------------------------------------- stages
  RT.stages = function (r) { return (r && r.stages) || []; };
  var FB_INDEX = { local: 0, regional: 1, academy: 2, youth: 3, pro: 4 };
  RT.stageIndex = function (s) {
    var r = RT.byId(s.route.id);
    if (r && r.id === 'football') { var i = FB_INDEX[s.fb.stage]; if (i === 4 && s.age >= 31) i = 5; return i == null ? 0 : i; }
    return s.route.st || 0;
  };
  RT.stage = function (s) { var r = RT.byId(s.route.id); return RT.isLadder(r) ? r.stages[RT.stageIndex(s)] : null; };
  function jobCareer(s, r) { return s.route.branch && r.careers.indexOf(s.route.branch) >= 0 ? s.route.branch : r.careers[0]; }
  function levelFor(k, lvl) { var n = k.ladder.length - 1; return lvl < 0 ? n : Math.min(lvl, n); }
  // does this stage come with a paid position (job)?
  function hasJob(st) { return st && st.lvl != null; }
  RT.stageTitle = function (s) {
    var r = RT.byId(s.route.id);
    if (!r) return '';
    if (r.state) return r.name;
    // a youth footballer is at a club stage (동네 클럽, 지역 클럽…); a pro carries the contract title
    if (r.id === 'football') return s.job ? E.ladderTitle(s, E.careerIndex()[s.job.id], s.job.level) : r.stages[RT.stageIndex(s)].t;
    if (r.generic) return s.job ? E.ladderTitle(s, E.careerIndex()[s.job.id], s.job.level) : r.name;
    var st = RT.stage(s);
    if (!st) return r.name;
    if (st.owner && s.route.branch === 'restaurant_owner') return st.owner;
    if (st.t) return st.t;
    if (s.job) return E.ladderTitle(s, E.careerIndex()[s.job.id], s.job.level);
    return r.name;
  };
  // the name of any stage of a ladder route: its own title, or the job title of the route's career at that level
  RT.stageLabel = function (s, r, x) {
    if (x.owner && s.route.branch === 'restaurant_owner') return x.owner;
    if (x.t) return x.t;
    if (hasJob(x)) { var k = E.careerIndex()[s.job && RT.ofCareer(s.job.id) === r.id ? s.job.id : jobCareer(s, r)]; if (k) return E.ladderTitle(s, k, levelFor(k, x.lvl)); }
    return r.name;
  };
  RT.label = function (s) { var r = RT.cur(s); return r ? r.icon + ' ' + r.name + (r.state ? '' : ' · ' + RT.stageTitle(s)) : ''; };

  // ---------------------------------------------------------------- entry rules
  function trackOk(s, r) {
    var tr = (r.entry && r.entry.tracks) || [];
    if (!tr.length || !s.track) return true;          // before the 13-year crossroads every track is still open
    if (tr.indexOf(s.track) >= 0) return true;
    // a study track that split into 문과/이과 still counts as study
    return (s.track === 'hum' || s.track === 'sci') && tr.indexOf('study') >= 0;
  }
  // reasons a route cannot be entered now ([] = can enter)
  RT.entryMissing = function (s, r, ignoreTrack) {
    var e = r.entry || {}, miss = [];
    if (r.state) return ['상태'];
    if (r.id === 'football') {
      if (s.age > 15 || s.age < 5) miss.push('5~15세에 클럽에 들어가야 함');
      if (s.flags.fb_quit) miss.push('이미 축구를 그만둠');
      return miss;
    }
    if (e.age && (s.age < e.age[0] || s.age > e.age[1])) miss.push(e.age[0] + '~' + e.age[1] + '세');
    if (!ignoreTrack && !trackOk(s, r)) miss.push('맞는 학교 과정: ' + e.tracks.map(function (t) { return RT.trackName(s, t); }).join('/'));
    if (e.need && e.need.height) { var h = e.need.height[s.hero.gender === 'f' ? 1 : 0]; if (!s.body || s.body.height < h) miss.push('키 ' + h + 'cm 이상'); }
    if (e.degree && E.degreeRank(s.edu.degree) < E.degreeRank(e.degree)) miss.push(C.DEGREE_LABELS[e.degree] + ' 이상');
    if (e.majors && (E.degreeRank(s.edu.degree) < 2 || e.majors.indexOf(s.edu.major) < 0)) miss.push('전공: ' + e.majors.map(function (m) { return C.MAJORS[m]; }).join('/'));
    if (r.generic) {
      // the easiest job on the route tells what is missing (e.g. the unlock hint of a trait-gated job)
      var best = null;
      r.careers.forEach(function (cid) { var k = E.careerIndex()[cid]; if (!k) return; var m = E.jobMissing(s, k).filter(function (x) { return x !== '학업 중' && x !== '축구 진로를 먼저 마무리해야 함'; }); if (!best || m.length < best.length) best = m; });
      if (best && best.length) miss.push(best.join(', '));
    }
    if (s.jail > 0) miss.push('수감 중');
    return miss;
  };
  RT.trackName = function (s, t) { var n = (D().trackNames[s.country] || {})[t]; return n || (D().tracks[t] || {}).name || t; };

  // ---------------------------------------------------------------- legality
  RT.groupHas = function (s, g) {
    var id = s.route.id;
    if (g === '*') return true;
    if (g === 'adrift') return id === 'none' || id === 'parttime';
    if (g === 'employee') return D().routeGroups.employee.indexOf(id) >= 0 && !!s.job;
    if (g === 'working') return !!s.job;
    if (g === 'football') return id === 'football' || ACTIVE_FB.indexOf(s.fb.stage) >= 0;
    return g === id;
  };
  // causes that start something from a state route ('*entry': school, 쉬는 중, 아르바이트)
  var ENTRY_CAUSES = ['entry', 'choice', 'enroll', 'graduate', 'retire'];
  // can a life move from route a to route b for this cause? Both the destination and the cause must
  // match a declared exit of a (or a global exit). A move without a cause is never legal.
  RT.legal = function (a, b, cause) {
    if (a === b) return true;
    if (!b || !cause || !RT.byId(a) || !RT.byId(b)) return false;
    var match = function (x) { return x && typeof x === 'object' && x.to === b && x.on.indexOf(cause) >= 0; };
    if (D().GLOBAL_EXITS.some(match)) return true;
    var ex = RT.byId(a).exits || [];
    if (ex.indexOf('*entry') >= 0 && b !== 'prison' && ENTRY_CAUSES.indexOf(cause) >= 0) return true;
    return ex.some(match);
  };

  // ---------------------------------------------------------------- event routing
  var FB_CANON = /^canon_(join|regional|academy|first_night|accent|warning|homesick|work_ethic|youth|pro|late|kitroom)/;
  var ACTIVE_FB = ['local', 'regional', 'academy', 'youth', 'pro'];
  // which routes an event belongs to (null = route-neutral life event)
  RT.eventRoutes = function (ev) {
    if (ev._rt !== undefined) return ev._rt;
    var out = null, c = ev.cond || {};
    if (ev.routes) out = ev.routes;
    else if (D().routeTags[ev.id]) out = D().routeTags[ev.id];
    else if (/^fb_/.test(ev.id) && !c.fb) out = ['football'];
    else if (FB_CANON.test(ev.id) && ev.id !== 'canon_kitroom' && ev.id !== 'canon_join_local') out = ['football'];
    else if (c.fb && c.fb.every(function (x) { return ACTIVE_FB.indexOf(x) >= 0; })) out = ['football'];
    else if (Array.isArray(c.career)) {
      out = []; c.career.forEach(function (k) { var r = RT.ofCareer(k); if (r && out.indexOf(r) < 0) out.push(r); });
    } else if (c.sector) {
      out = []; D().careers.forEach(function (k) { if (c.sector.indexOf(k.sector) >= 0) { var r = RT.ofCareer(k.id); if (r && out.indexOf(r) < 0) out.push(r); } });
    } else if (c.career === 'any' || c.level) out = ['employee'];
    ev._rt = out;
    return out;
  };
  var CHANGE_FX = { quickJob: 'quick', quitJob: 'quit', fired: 'quit', becomeMonk: 'monk', leaveMonastery: 'quit', joinLocalClub: 'club', quitFootball: 'quitfb', careerEndingInjury: 'quit', dropOut: 'quit' };
  // career moves an event can make: { careers: [ids], quick, monk, club, quit }
  RT.eventTargets = function (ev) {
    if (ev._tg) return ev._tg;
    var tg = { careers: [] };
    function fx(e) { if (e && e.fx) [].concat(e.fx).forEach(function (f) { if (CHANGE_FX[f]) tg[CHANGE_FX[f]] = true; }); }
    function visit(n) { if (!n) return; if (n.career && tg.careers.indexOf(n.career) < 0) tg.careers.push(n.career); fx(n.effects); visit(n.success); visit(n.fail); }
    visit(ev); (ev.choices || []).forEach(visit);
    tg.any = tg.careers.length > 0 || !!(tg.quick || tg.monk || tg.club || tg.quit || tg.quitfb);
    ev._tg = tg;
    return tg;
  };
  RT.quickOk = function (s) { var id = s.route.id; return id === 'none' || id === 'parttime' || id === 'school' || id === 'retired' || RT.groupHas(s, 'employee'); };
  RT.eventOk = function (s, ev) {
    if (!ev || /^sys_/.test(ev.id)) return true;
    if (!s.route) RT.sync(s, true);
    var allow = RT.eventRoutes(ev);
    if (allow && !allow.some(function (g) { return RT.groupHas(s, g); })) return false;
    if (ev.stages && ev.stages.indexOf((RT.stage(s) || {}).id) < 0) return false;
    var tg = RT.eventTargets(ev), cur = s.route.id;
    for (var i = 0; i < tg.careers.length; i++) if (!RT.legal(cur, RT.ofCareer(tg.careers[i]), 'choice')) return false;
    if (tg.quick && !RT.quickOk(s)) return false;
    if (tg.club && cur !== 'school' && cur !== 'none') return false;
    return true;
  };

  // ---------------------------------------------------------------- moving between routes
  var CAUSE_TEXT = { fail: '꿈을 이루지 못하고', release: '팀(소속사)에서 방출돼', injury: '부상으로', retire: '은퇴하고', burnout: '지쳐서', scandal: '스캔들에 휘말려',
    disband: '팀이 해체돼', quit: '스스로 그만두고', fired: '해고돼', choice: '갈림길에서 스스로', crime: '수감되며', deport: '추방돼', calling: '마음의 부름을 따라', release_jail: '출소하며', entry: '', enroll: '', graduate: '' };
  // short names of causes for the 진로 panel and the life summary
  var CAUSE_LABEL = { fail: '실패', release: '방출', injury: '부상', retire: '은퇴', burnout: '번아웃', scandal: '스캔들', disband: '해체', quit: '그만둠', fired: '해고',
    choice: '내 선택', crime: '수감', deport: '추방', calling: '출가', release_jail: '출소', flee: '도주', entry: '입문', enroll: '진학', graduate: '졸업', start: '시작' };
  var WHY_CAUSE = { '해고': 'fired', '퇴사': 'quit', '은퇴': 'retire', '부상': 'injury', '수감': 'crime', '추방': 'deport', '축구 포기': 'quit', '출가': 'calling', '환속': 'quit', '이직': 'quit' };
  RT.causeText = function (c) { return CAUSE_TEXT[c] != null ? CAUSE_TEXT[c] : ''; };
  RT.causeLabel = function (c) { return CAUSE_LABEL[c] || c; };
  function logMove(s, from, to, cause, legal) {
    s.routeLog = s.routeLog || [];
    var last = s.routeLog[s.routeLog.length - 1];
    // leaving and coming back in the same year (e.g. graduating, then starting grad school) is no move at all
    if (last && last.age === s.age && last.to === from && last.from === to) { s.routeLog.pop(); return; }
    s.routeLog.push({ from: from, to: to, age: s.age, cause: cause, legal: legal });
    if (s.routeLog.length > 60) s.routeLog.shift();
  }
  // set the route without narration (the caller narrates); keeps job and football state in line.
  // Callers check RT.legal before changing anything; the logged `legal` flag lets tests prove they did.
  function setRoute(s, id, o) {
    o = o || {};
    var r = RT.byId(id), here = s.route ? s.route.id : null;
    // a move offered right after a route ended (sys_route_next) is an exit of the route that ended
    var from = o.from || here;
    var legal = from == null || RT.legal(from, id, o.cause);
    if (here !== id) logMove(s, from, id, o.cause, legal);
    var prevSk = s.route && s.route.id === id ? s.route.sk : null;
    // years of 실기 practice on a matching school track give a head start
    var prep = s.trackPrep && r && trackOk(s, r) && ((r.entry && r.entry.tracks) || []).length ? s.trackPrep : 0;
    s.route = { id: id, st: 0, at: 0, sk: prevSk != null ? prevSk : Math.min(60, Math.round(RT.fit(s, r) * 0.35) + prep), since: s.age, branch: o.career || null };
    if (r && RT.isLadder(r) && r.id !== 'football') {
      var si = 0;
      if (o.stage) r.stages.forEach(function (st, i) { if (st.id === o.stage) si = i; });
      else if (o.level != null) {
        // a saved or carried-over job keeps its rank: the highest working stage whose rank (lvl -1 = the
        // career's top rank) is not above the job's level; the job level itself is left as it is
        var kk = E.careerIndex()[o.career || jobCareer(s, r)], best = -1;
        r.stages.forEach(function (st, i) { if (hasJob(st) && !st.late && kk && levelFor(kk, st.lvl) <= o.level && i > best) best = i; });
        if (best >= 0) { si = best; s.route.lvlSt = si; }
      }
      s.route.st = si;
      var stg = r.stages[si];
      if (stg.skill && s.route.sk < stg.skill) s.route.sk = stg.skill;
    }
    s.routePeak = s.routePeak || {};
    s.routeSeen = s.routeSeen || {};
    if (!s.routeSeen[id]) s.routeSeen[id] = s.age;
    return r;
  }
  RT.syncJob = function (s) {
    var r = RT.byId(s.route.id);
    if (!RT.isLadder(r) || r.id === 'football') return;
    var st = RT.stage(s);
    if (hasJob(st)) {
      var cid = jobCareer(s, r), k = E.careerIndex()[cid], lvl = levelFor(k, st.lvl);
      if (!s.job || s.job.id !== cid) { s._routeSync = true; E.startJob(s, cid, lvl); s._routeSync = false; }
      else if (s.route.lvlSt !== s.route.st) s.job.level = lvl; // the rank changes only with the stage
      s.route.lvlSt = s.route.st;
    } else if (s.job && RT.ofCareer(s.job.id) === r.id) { s._routeSync = true; E.endJob(s, '단계 이동'); s._routeSync = false; }
  };
  // enter a route (narrated)
  RT.enter = function (s, id, o) {
    o = o || {};
    var r = RT.byId(id);
    // an undeclared move (wrong destination or wrong cause) is refused before anything changes
    if (!r || !RT.legal(o.from || s.route.id, id, o.cause)) return '';
    if (s.job && RT.ofCareer(s.job.id) !== id) { s._routeSync = true; E.endJob(s, o.cause === 'retire' ? '은퇴' : '이직'); s._routeSync = false; }
    if (id !== 'football' && ACTIVE_FB.indexOf(s.fb.stage) >= 0) E.FX.quitFootball(s);
    if (id === 'football') { setRoute(s, id, o); return E.FX.joinLocalClub(s) || ''; }
    setRoute(s, id, o);
    if (r.generic) {
      var cid = o.career && r.careers.indexOf(o.career) >= 0 ? o.career : null;
      if (!cid) {
        var ok = r.careers.filter(function (c) { var k = E.careerIndex()[c]; return k && !E.jobMissing(s, k).length; });
        cid = ok.length ? E.pick(s, ok) : null;
      }
      if (cid) { s._routeSync = true; E.startJob(s, cid, 0); s._routeSync = false; s.route.branch = cid; }
    }
    RT.syncJob(s);
    var line = r.icon + ' 새 길: ' + r.name + ' — ' + RT.stageTitle(s) + '.';
    if (!o.quiet) E.addLog(s, line, 'milestone');
    return line;
  };
  // the current route ends for a reason; plausible next routes are offered when there are any
  RT.leave = function (s, cause, note) {
    var r = RT.byId(s.route.id), from = s.route.id;
    var opts = RT.exitOptions(s, cause);
    if (s.job && RT.ofCareer(s.job.id) === from) { s._routeSync = true; E.endJob(s, { retire: '은퇴', injury: '부상', fired: '해고', release: '방출', fail: '실패' }[cause] || '퇴사'); s._routeSync = false; }
    var to = cause === 'retire' && s.age >= 55 ? 'retired' : (inSchool(s) ? 'school' : 'none');
    setRoute(s, to, { cause: cause });
    E.addLog(s, '🧭 ' + (r ? r.name : '') + ' 길이 끝났다: ' + (note || (RT.causeText(cause) + ' 내려놓았다.')), 'milestone');
    if (opts.length) { s.routeNext = { from: from, cause: cause, opts: opts.slice(0, 3) }; E.queueSys(s, 'sys_route_next'); }
    return opts;
  };
  // exits of the current route that fit a cause and can actually be entered now
  RT.exitOptions = function (s, cause) {
    var r = RT.byId(s.route.id), out = [];
    ((r && r.exits) || []).forEach(function (x) {
      if (!x || !x.to || x.on.indexOf(cause) < 0) return;
      var tr = RT.byId(x.to); if (!tr || tr.state) return;
      if (x.career) { var k = E.careerIndex()[x.career]; if (!k || (!x.ignoreReq && (s.age < k.req.minAge || s.age > k.req.maxAge))) return; }
      else if (RT.entryMissing(s, tr, true).length) return;
      if (out.some(function (o) { return o.to === x.to && o.career === x.career; })) return;
      out.push({ to: x.to, career: x.career || null, stage: x.stage || null });
    });
    return out;
  };
  RT.optionLabel = function (s, o) {
    var r = RT.byId(o.to), k = o.career && E.careerIndex()[o.career];
    return r.icon + ' ' + (k ? k.name : r.name) + (o.stage ? ' (' + ((r.stages || []).filter(function (x) { return x.id === o.stage; })[0] || {}).t + ')' : '');
  };

  // reconcile the route with what other systems did this year (jail, football, jobs, school)
  RT.sync = function (s, quiet) {
    if (!s.route) {
      var id = s.jail > 0 ? 'prison' : ACTIVE_FB.indexOf(s.fb.stage) >= 0 ? 'football' : s.job ? (RT.ofCareer(s.job.id) || 'office') : inSchool(s) || s.age < 7 ? 'school' : s.retiredFromWork ? 'retired' : 'none';
      setRoute(s, id, { cause: 'start', level: s.job ? s.job.level : null, career: s.job ? s.job.id : null });
      return;
    }
    var cur = s.route.id;
    if (s.jail > 0) { if (cur !== 'prison') setRoute(s, 'prison', { cause: 'crime' }); return; }
    if (cur === 'prison') { setRoute(s, inSchool(s) ? 'school' : 'none', { cause: 'release_jail' }); cur = s.route.id; }
    var fbActive = ACTIVE_FB.indexOf(s.fb.stage) >= 0;
    if (fbActive && cur !== 'football') { setRoute(s, 'football', { cause: cur === 'school' || cur === 'none' ? 'entry' : 'choice' }); return; }
    if (cur === 'football' && !fbActive) {
      var injured = s.flags.career_injury === s.age;
      RT.leave(s, injured ? 'injury' : s.fb.stage === 'retired' ? 'retire' : 'quit', s.fb.stage === 'retired' ? '프로 축구 선수 생활을 마쳤다.' : '축구화를 벽에 걸었다.');
      return;
    }
    if (cur === 'football') return;
    var r = RT.byId(cur);
    if (s.job) {
      var jr = RT.ofCareer(s.job.id) || 'office';
      if (jr !== cur) {
        var tr = RT.byId(jr);
        // the job was started by the player (job search, an event choice) after E.startJob checked the move
        setRoute(s, jr, { cause: 'choice', career: s.job.id, level: s.job.level });
        if (!RT.isLadder(tr)) s.route.branch = s.job.id; else RT.syncJob(s);
        if (!quiet) E.addLog(s, tr.icon + ' 새 길: ' + tr.name + ' — ' + RT.stageTitle(s) + '.', 'milestone');
      } else if (r.generic) s.route.branch = s.job.id;
      return;
    }
    // the route expects a paid position but the job is gone (fired, quit, retired)
    if (r.generic || (RT.isLadder(r) && hasJob(RT.stage(s)))) {
      var last = s.jobHistory[s.jobHistory.length - 1];
      var cause = last ? WHY_CAUSE[last.why] || 'quit' : 'quit';
      if (s.retiredFromWork) cause = 'retire';
      RT.leave(s, cause, last ? last.name + ' 일을 ' + ({ fired: '잃었다.', retire: '마치고 은퇴했다.', injury: '부상으로 그만뒀다.' }[cause] || '그만뒀다.') : null);
      return;
    }
    if (cur === 'school' && !inSchool(s) && s.age >= 15) setRoute(s, s.retiredFromWork ? 'retired' : 'none', { cause: s.retiredFromWork ? 'retire' : 'graduate' });
    else if ((cur === 'none' || cur === 'parttime') && inSchool(s)) setRoute(s, 'school', { cause: 'enroll' });
    else if (cur === 'none' && s.retiredFromWork) setRoute(s, 'retired', { cause: 'retire' });
  };
  // ---------------------------------------------------------------- yearly
  RT.managesJob = function (s) { var r = s.route && RT.byId(s.route.id); return RT.isLadder(r) && r.id !== 'football'; };
  RT.yearly = function (s) {
    RT.sync(s);
    var r = RT.byId(s.route.id);
    if (!r || !s.alive) return;
    s.route.at++;
    RT.countYear(s);
    feedTalents(s);
    if (RT.isLadder(r) && r.id !== 'football') ladderYear(s, r);
    // a youth footballer who never got the next contract ages out of club football
    if (r.id === 'football' && ((['local', 'regional'].indexOf(s.fb.stage) >= 0 && s.age >= 18) || (['academy', 'youth'].indexOf(s.fb.stage) >= 0 && s.age >= 23))) {
      E.FX.quitFootball(s);
      RT.leave(s, 'release', '프로 계약 없이 ' + s.age + '살이 됐다. 클럽과의 인연이 끝났다. 축구는 이제 취미로 남는다.');
      return;
    }
    if (!s.route || s.route.id !== r.id) return;
    routeLine(s, r);
    if (r.id !== 'football' && !r.state && s.age >= 16 && s.age <= 62 && s.route.at >= 3 && s.age % 4 === s.route.since % 4 && RT.crossOptions(s).length) E.queueSys(s, 'sys_route_cross', 3);
    if ((r.id === 'school' || r.id === 'none' || r.id === 'parttime') && RT.entryChoices(s).length && (!s.routeAsk || s.age - s.routeAsk >= (r.id === 'school' ? 1 : 2))) { s.routeAsk = s.age; E.queueSys(s, 'sys_route_entry'); }
    // a life without a route of its own keeps meeting ordinary ways forward (정직원 제안, 자격증, 장사…)
    else if ((r.id === 'none' || r.id === 'parttime') && s.age >= 19 && s.age <= 62 && s.route.at >= 1 && (!s.adriftAsk || s.age - s.adriftAsk >= 3) && RT.adriftOptions(s).length) { s.adriftAsk = s.age; E.queueSys(s, 'sys_route_adrift'); }
  };
  // ordinary next steps from 쉬는 중 / 아르바이트: each starts a real job on a route that follows
  var ADRIFT = [
    { to: 'service', careers: ['barista', 'hotel_concierge', 'hairdresser', 'cleaner'], icon: '🛎️',
      text: function (s) { return s.route.id === 'parttime' ? '사장님의 정직원 제안을 받아들인다' : '매장 정직원 공고에 지원한다'; },
      log: function (s) { return s.route.id === 'parttime' ? '알바 몇 년 만에 사장님이 정직원 계약서를 내밀었다. 처음으로 4대 보험이 생겼다.' : '매장 정직원 면접에 붙었다. 유니폼 이름표가 생겼다.'; } },
    { to: 'trades', careers: ['electrician', 'plumber', 'welder', 'mechanic', 'factory_worker', 'construction_worker'], icon: '🔧', cost: 300,
      text: function () { return '야간 학원에서 자격증을 따 기술직으로 간다'; },
      log: function () { return '퇴근 뒤 야간 학원을 다니며 기능사 자격증을 땄다. 공구 가방을 들고 첫 현장에 나갔다.'; } },
    { to: 'transport', careers: ['truck_driver', 'taxi_driver', 'bus_driver', 'designated_driver'], icon: '🚚',
      text: function (s) { return s.job && s.job.id === 'delivery_rider' ? '배달하며 익힌 길로 운송 일을 시작한다' : '운전면허를 살려 운송 일을 시작한다'; },
      log: function (s) { return s.job && s.job.id === 'delivery_rider' ? '오토바이로 외운 골목길이 밑천이 됐다. 이제 큰 차의 운전대를 잡는다.' : '운전대를 잡았다. 매일 다른 길이 일터가 됐다.'; } },
    { to: 'merchant', careers: ['street_vendor'], icon: '🏪', cost: 800,
      text: function () { return '모은 돈으로 작은 노점을 연다'; },
      log: function () { return '모은 돈으로 리어카와 첫 물건을 샀다. 내 이름을 건 장사가 시작됐다.'; } },
    { to: 'office', careers: ['office_worker', 'sales_rep', 'insurance_agent'], icon: '🏢',
      text: function () { return '공채에 지원해 회사원이 된다'; },
      log: function () { return '서류, 면접, 또 면접. 마침내 합격 문자가 왔다. 첫 출근 정장을 샀다.'; } },
    { to: 'farm', careers: ['farmer', 'fisher'], icon: '🌾',
      text: function () { return '고향에 내려가 농사·고기잡이를 배운다'; },
      log: function () { return '도시 생활을 접고 고향으로 내려갔다. 동네 어르신들이 일을 가르쳐 줬다.'; } }
  ];
  RT.adriftOptions = function (s) {
    if (s.jail > 0 || inSchool(s)) return [];
    var out = [];
    ADRIFT.forEach(function (a) {
      if (!RT.legal(s.route.id, a.to, 'choice') || (a.cost && s.money < a.cost * E.country(s).wage)) return;
      var ok = a.careers.filter(function (c) { var k = E.careerIndex()[c]; return k && !E.jobMissing(s, k).length; });
      // no RNG here: the prompt is rebuilt every time the screen redraws
      if (ok.length) out.push({ a: a, career: ok[s.age % ok.length], fit: RT.fit(s, RT.byId(a.to)) });
    });
    // what the current part-time job leads to comes first (store → 정직원, delivery → 운송), then the best fit
    var lead = (s.job && { delivery_rider: 'transport', convenience_clerk: 'service', cafe_parttime: 'service', fastfood_crew: 'service' }[s.job.id]) ||
      (s.flags.prison_training ? 'trades' : null); // the welding course taken inside
    out.sort(function (x, y) { return (y.a.to === lead) - (x.a.to === lead) || y.fit - x.fit; });
    return out.slice(0, 3);
  };

  // ---------------------------------------------------------------- school-track practice (🔥 activity before a route starts)
  var TRACK_PRACTICE = {
    art: { icon: '🎨', label: '실기 연습', talent: 'art', lines: ['석고 데생을 두 장 그렸다.', '수채화로 창밖 풍경을 그렸다.', '선생님이 명암을 다시 잡아 주셨다.', '크로키 수업에서 친구를 모델로 그렸다.', '포트폴리오에 넣을 작품을 골랐다.', '색상환을 처음부터 다시 칠했다.', '미술관 견학에서 스케치를 했다.', '점토로 손 모양을 빚었다.', '실기실에 남아 붓을 빨았다.', '정물 구도를 세 번 바꿔 그렸다.'] },
    music: { icon: '🎵', label: '보컬·악기 연습', talent: 'music', lines: ['연습실에서 스케일을 한 시간 연습했다.', '합창 파트를 외웠다.', '메트로놈에 맞춰 같은 마디를 반복했다.', '청음 수업에서 화음을 맞혔다.', '실기 시험곡을 처음부터 끝까지 쳤다.', '선배에게 호흡법을 배웠다.', '작은 발표회에서 독주를 했다.', '악보를 베껴 쓰며 화성을 익혔다.', '녹음해서 내 소리를 들어 봤다.', '앙상블 수업에서 박자를 맞췄다.'] },
    acting: { icon: '🎭', label: '연기 연습', talent: 'stage', lines: ['독백 대본을 소리 내어 읽었다.', '즉흥극 수업에서 웃음이 터졌다.', '발성 연습으로 복도를 울렸다.', '거울 앞에서 표정 연습을 했다.', '학교 연극의 단역을 맡았다.', '카메라 테스트 영상을 찍었다.', '선생님이 대사 호흡을 고쳐 주셨다.', '고전 희곡 한 장면을 외웠다.', '움직임 수업에서 땀을 흘렸다.', '친구와 대본 리딩을 했다.'] },
    sport: { icon: '🏅', label: '운동부 훈련', talent: 'sport', lines: ['새벽 체력 훈련으로 운동장을 열 바퀴 돌았다.', '코치가 자세를 처음부터 다시 잡아 줬다.', '웨이트장에서 하체를 단련했다.', '연습 경기에서 몸이 가볍게 움직였다.', '순발력 사다리 훈련을 반복했다.', '경기 영상을 보며 실수를 적었다.', '근지구력 서킷을 버텼다.', '선배들과 기술 훈련을 했다.', '스트레칭으로 유연성을 챙겼다.', '대회 대비 실전 훈련을 했다.'] },
    trainee: { icon: '🎤', label: '보컬·안무 연습', talent: 'stage', lines: ['안무 한 곡을 처음부터 끝까지 맞췄다.', '보컬 트레이너와 고음을 연습했다.', '월말 평가 무대를 준비했다.', '연습실 거울 앞에서 표정을 연습했다.', '라이브로 부르며 러닝머신을 뛰었다.', '동기들과 동선을 맞췄다.', '외국어 수업을 들었다.', '데뷔조 선배들의 무대를 모니터했다.', '발성 연습으로 목을 풀었다.', '새벽까지 안무 영상을 돌려 봤다.'] },
    cook: { icon: '🍳', label: '조리 실습', talent: 'taste', lines: ['칼질 연습으로 양파를 한 망 썰었다.', '육수를 처음부터 냈다.', '실습 시간에 소스 농도를 맞췄다.', '조리 기능사 실기 과제를 연습했다.', '플레이팅을 세 번 다시 했다.', '선생님이 간을 보고 고개를 끄덕였다.', '제철 재료를 공부했다.', '위생 점검표를 외웠다.', '반죽 발효 시간을 기록했다.', '친구들과 한 상 차림을 완성했다.'] },
    tech: { icon: '🔧', label: '기술 실습', talent: 'logic', lines: ['회로를 납땜해 불을 켰다.', '선반 실습에서 치수를 맞췄다.', '도면을 처음부터 다시 그렸다.', '자격증 실기 과제를 연습했다.', '엔진을 분해했다가 다시 조립했다.', '용접 비드를 곧게 뽑는 연습을 했다.', '실습실 공구를 정리했다.', '측정 오차를 줄이는 법을 배웠다.', '전기 배선 실습을 했다.', '팀 프로젝트로 작은 로봇을 만들었다.'] }
  };
  // the practice a school-track student can do before a route starts (null = none)
  RT.trackPractice = function (s) { return s.route && s.route.id === 'school' && s.track ? TRACK_PRACTICE[s.track] || null : null; };
  RT.practiceTrack = function (s) {
    var p = RT.trackPractice(s), g = E.rint(s, 1, 2), first = !s.trackPrep;
    RT.addTalent(s, p.talent, g);
    s.trackPrep = Math.min(25, (s.trackPrep || 0) + 2);
    var tl = D().talents.filter(function (x) { return x.k === p.talent; })[0];
    return E.line(s, 'trk_' + s.track, p.lines) + ' (' + tl.label + ' 재능 +' + g + ' · 길 준비 ' + s.trackPrep +
      (first ? ': 이 과정이 여는 길을 시작할 때 처음 실력에 더해진다' : '') + ')';
  };
  function feedTalents(s) {
    if (!s.talent) return;
    var map = { art: 'art', music: 'music', acting: 'stage', sport: 'sport', football: 'sport', trainee: 'stage', cook: 'taste', tech: 'logic', hum: 'lang', sci: 'logic', study: 'logic' };
    if (s.track && map[s.track] && inSchool(s)) RT.addTalent(s, map[s.track], 2);
  }
  function ladderYear(s, r) {
    var rt = s.route, i = rt.st, st = r.stages[i], nx = r.stages[i + 1], fit = RT.fit(s, r), a = s.age;
    var ath = r.athlete || { decline: 99, end: 120 };
    var g;
    if (a >= ath.decline) g = -E.rint(s, 1, 3) - Math.floor((a - ath.decline) / 3);
    else g = (a <= 22 ? E.rint(s, 2, 5) : a <= 32 ? E.rint(s, 1, 3) : E.rint(s, 0, 2)) * (0.45 + fit / 90);
    g += (s.y.trainedRoute || 0) * 1.5;
    rt.sk = clamp(Math.round(rt.sk + g), 0, 100);
    if (a >= ath.end) { RT.leave(s, ath.endCause || 'retire', ath.endCause === 'disband' ? '그룹 활동이 끝났다. 멤버들과 마지막 인사를 나눴다.' : '나이와 몸이 말해 줬다. 은퇴를 선언했다.'); return; }
    if (nx && !nx.late && rt.at >= (st.min || 1) && rt.sk >= (nx.skill || 0) && fit >= (nx.fit || 0) && E.chance(s, 0.6)) {
      rt.st++; rt.at = 0;
      RT.syncJob(s);
      E.addLog(s, r.icon + ' 한 단계 올라섰다: ' + RT.stageTitle(s) + '!', 'good');
      E.addStat(s, 'happy', 5); E.addStat(s, 'fame', nx.lvl > 0 ? nx.lvl * 2 : 0);
      if (nx.peak) { s.routePeak = s.routePeak || {}; s.routePeak[r.id] = s.age; E.triumph(s, 'promote'); s.y.anim = s.y.anim || 'peak'; E.unlock(s, 'top_career'); }
      else E.triumph(s, 'promote');
      return;
    }
    var lateIdx = -1; r.stages.forEach(function (x, k) { if (x.late) lateIdx = k; });
    if (a >= ath.decline && !st.late && lateIdx > i && hasJob(st) && E.chance(s, 0.4)) {
      rt.st = lateIdx; rt.at = 0; RT.syncJob(s);
      E.addLog(s, r.icon + ' 전성기가 지나갔다. 이제 ' + RT.stageTitle(s) + '(으)로 산다.', 'info');
      return;
    }
    if (st.max && rt.at > st.max && !st.peak && !st.late) {
      RT.leave(s, st.train ? 'fail' : 'release', st.train ? st.t + ' 생활 ' + rt.at + '년. 다음 단계의 문은 끝내 열리지 않았다.' : '계약이 끝났다. 다음 계약서는 오지 않았다.');
      return;
    }
    if (hasJob(st) && st.lvl > 0) E.addStat(s, 'fame', st.lvl);
  }
  // one line of the route's own life each year
  function routeLine(s, r) {
    var lines = r.lines || {}, list = null, key;
    if (RT.isLadder(r) && r.id !== 'football') { var st = RT.stage(s); list = lines[st.id]; key = 'rt_' + r.id + '_' + st.id; }
    else if (r.generic) {
      var k = s.job && E.careerIndex()[s.job.id], n = k ? k.ladder.length - 1 : 1, lv = s.job ? s.job.level : 0;
      var ph = s.age >= 56 ? 'late' : lv >= n ? 'top' : lv >= 1 && s.route.at >= 2 ? 'mid' : 'early';
      list = lines[ph]; key = 'rt_' + r.id + '_' + ph;
    } else if (lines.any) { list = lines.any; key = 'rt_' + r.id; }
    if (!list || !list.length) return;
    var t = E.line(s, key, list);
    if (t) E.addLog(s, r.icon + ' ' + t, 'route');
  }

  // ---------------------------------------------------------------- choices offered by system events
  // routes the hero could start now (best fit first)
  RT.entryChoices = function (s) {
    if (s.jail > 0 || s.age < 8) return [];
    var cur = s.route.id;
    if (cur !== 'school' && cur !== 'none' && cur !== 'parttime') return [];
    var list = D().routes.filter(function (r) {
      if (!RT.isLadder(r) || r.id === 'football') return false;
      if (s.routeTried && s.routeTried[r.id] && s.age - s.routeTried[r.id] < 2) return false;
      return !RT.entryMissing(s, r).length && RT.fit(s, r) >= 30;
    });
    list.sort(function (a, b) { return RT.fit(s, b) - RT.fit(s, a); });
    return list.slice(0, 3);
  };
  RT.crossOptions = function (s) {
    var r = RT.byId(s.route.id), out = [];
    ((r && r.exits) || []).forEach(function (x) {
      if (!x || !x.to || x.on.indexOf('choice') < 0) return;
      var tr = RT.byId(x.to); if (!tr || tr.state) return;
      if (x.career) { var k = E.careerIndex()[x.career]; if (!k || (!x.ignoreReq && E.jobMissing(s, k).filter(function (m) { return m !== '학업 중'; }).length)) return; }
      else if (RT.entryMissing(s, tr, true).length) return;
      if (!out.some(function (o) { return o.to === x.to; })) out.push({ to: x.to, career: x.career || null, stage: x.stage || null });
    });
    return out.slice(0, 2);
  };
  function chanceFor(s, r) { return clamp(0.2 + (RT.fit(s, r) - 40) / 60, 0.1, 0.9); }
  RT.entryChance = chanceFor;

  var ROUTE_EVENTS = [
    { id: 'sys_route_entry', manual: true, pick: true,
      textFn: function (s) { return s.route.id === 'school' ? '방과 후 게시판에 입단·오디션·모집 공고가 붙었다. 내 몸과 재능에 맞는 길이 보인다.' : '새로 시작할 수 있는 길이 보인다. 내 몸과 재능에 맞는 길이다.'; },
      choicesFn: function (s) {
        var list = RT.entryChoices(s).map(function (r) {
          var p = r.entry.audition ? chanceFor(s, r) : null;
          var ch = { text: r.icon + ' ' + r.name + ' — ' + r.entry.how, desc: r.entry.text + ' (나와 맞는 정도 ' + RT.fit(s, r) + '/100)',
            run: function (s) {
              s.routeTried = s.routeTried || {}; s.routeTried[r.id] = s.age;
              if (p != null && E.rnd(s) >= p) { E.addStat(s, 'happy', -3); return r.entry.how + '에서 떨어졌다. "다음에 다시 와요." 실력을 더 쌓아야겠다.'; }
              RT.enter(s, r.id, { cause: 'entry', quiet: true });
              if (r.branchPick) E.queueSys(s, 'sys_route_branch');
              E.triumph(s, 'promote');
              return r.entry.how + ' 성공! ' + r.icon + ' ' + r.name + '의 길이 시작됐다. 지금은 "' + RT.stageTitle(s) + '".';
            } };
          if (p != null) ch.chance = p;
          return ch;
        });
        list.push({ text: '지금은 하던 대로 지낸다', run: function (s) { s.routeTried = s.routeTried || {}; RT.entryChoices(s).forEach(function (r) { s.routeTried[r.id] = s.age; }); return '공고를 한참 보다가 지나쳤다.'; } });
        return list;
      } },
    { id: 'sys_route_next', manual: true, pick: true,
      textFn: function (s) { var n = s.routeNext || {}, r = RT.byId(n.from); return (r ? r.icon + ' ' + r.name + ' 시절이 끝났다. ' : '') + '이제 무엇을 할까? 지금까지 쌓은 경험이 이어지는 길이 있다.'; },
      choicesFn: function (s) {
        var n = s.routeNext || { opts: [] };
        var list = n.opts.map(function (o) {
          return { text: RT.optionLabel(s, o), run: function (s) { s.routeNext = null; RT.enter(s, o.to, { career: o.career, stage: o.stage, cause: n.cause, from: n.from, quiet: true }); return '경험을 살려 ' + RT.optionLabel(s, o).replace(/^\S+ /, '') + '(으)로 새 출발을 했다.'; } };
        });
        list.push({ text: '🛋️ 한동안 쉬면서 생각한다', run: function (s) { s.routeNext = null; return '서두르지 않기로 했다. 쉬는 동안 할 일을 천천히 찾아본다.'; } });
        return list;
      } },
    // the route may end between queueing and showing (an event in between can leave it)
    { id: 'sys_route_branch', manual: true, pick: true, live: function (s) { var r = RT.cur(s); return !!(r && r.branchPick && RT.branches(s, r).length); },
      textFn: function (s) { var r = RT.cur(s); return r.icon + ' ' + r.name + '에서 어떤 길을 걸을까?'; },
      choicesFn: function (s) {
        var r = RT.cur(s);
        var opts = RT.branches(s, r);
        return opts.map(function (cid) {
          var k = E.careerIndex()[cid];
          return { text: k.name, desc: k.desc, run: function (s) { s.route.branch = cid; if (s.job) { s._routeSync = true; E.endJob(s, '단계 이동'); s._routeSync = false; } RT.syncJob(s); return k.name + '의 길을 가기로 했다.'; } };
        });
      } },
    { id: 'sys_route_cross', manual: true, pick: true,
      textFn: function (s) { var r = RT.cur(s); return r.icon + ' ' + RT.stageTitle(s) + '(으)로 지낸 지 ' + s.route.at + '년. 갈림길에 섰다. 이대로 갈까, 다른 길로 갈까?'; },
      choicesFn: function (s) {
        var list = [{ text: '이 길을 계속 간다', effects: { grit: 1 }, run: function () { return '지금 걷는 길을 믿기로 했다.'; } }];
        RT.crossOptions(s).forEach(function (o) {
          list.push({ text: RT.optionLabel(s, o) + '(으)로 옮긴다', desc: '지금까지의 경험이 이어지는 길이다.', run: function (s) { var from = RT.cur(s); RT.enter(s, o.to, { career: o.career, stage: o.stage, cause: 'choice', quiet: true }); return from.name + '에서 쌓은 경험을 들고 ' + RT.cur(s).name + '(으)로 옮겼다.'; } });
        });
        list.push({ text: '🛋️ 그만두고 쉰다', risky: true, run: function (s) { RT.leave(s, 'quit', '스스로 내려놓았다. 잠시 쉬어 가기로 했다.'); return '사직서를 냈다. 마음이 가벼우면서도 불안했다.'; } });
        return list;
      } },
    { id: 'sys_route_adrift', manual: true, pick: true, live: function (s) { return RT.adriftOptions(s).length > 0; },
      textFn: function (s) { return s.route.id === 'parttime' ? '아르바이트로 지낸 지 ' + s.route.at + '년. 이대로 계속할까, 한 걸음 옮겨 볼까?' : '쉬는 날이 길어졌다. 슬슬 일을 찾아볼 때다. 갈 수 있는 길이 몇 가지 보인다.'; },
      choicesFn: function (s) {
        var list = RT.adriftOptions(s).map(function (o) {
          var a = o.a, k = E.careerIndex()[o.career], tr = RT.byId(a.to);
          return { text: a.icon + ' ' + a.text(s), desc: tr.name + ' 길 · ' + k.name + (a.cost ? ' · 준비 비용 ' + T.money(Math.round(a.cost * E.country(s).wage), E.country(s)) : ''),
            run: function (s) {
              var log = a.log(s);
              if (a.cost) s.money -= Math.round(a.cost * E.country(s).wage);
              RT.enter(s, a.to, { career: o.career, cause: 'choice', quiet: true });
              return log + ' ' + tr.icon + ' 새 길: ' + tr.name + ' — ' + RT.stageTitle(s) + '.';
            } };
        });
        list.push({ text: '지금처럼 지낸다', run: function (s) { return s.route.id === 'parttime' ? '익숙한 근무표가 편했다. 조금 더 지금처럼 지내기로 했다.' : '조금 더 쉬면서 생각해 보기로 했다.'; } });
        return list;
      } }
  ];
  RT.branches = function (s, r) {
    if (r.id === 'law') return s.edu.major === 'law' ? ['lawyer', 'prosecutor', 'judge'] : ['patent_attorney'];
    if (r.id === 'medical') {
      var m = s.edu.major;
      var out = m === 'medicine' ? ['doctor', 'dentist'].concat(s.body && s.body.dex >= 55 ? ['surgeon'] : []) : m === 'nursing' ? ['nurse', 'paramedic'] : m === 'science' ? ['pharmacist'] : m === 'agriculture' ? ['veterinarian'] : ['physical_therapist', 'paramedic'];
      return out.filter(function (c) { return !!E.careerIndex()[c]; });
    }
    return r.careers.slice(0, 3);
  };

  // ---------------------------------------------------------------- school tracks (13 and 16)
  function track(s, id, flag, extra) {
    s.track = id;
    if (flag) s.flags[flag] = s.age;
    return extra || '';
  }
  // a new school track that the current route does not follow ends that route (narrated)
  function leaveIfOff(s) {
    var r = RT.cur(s);
    if (!RT.isLadder(r) || ((r.entry && r.entry.tracks) || []).indexOf(s.track) >= 0) return '';
    if (r.id === 'football') { E.FX.quitFootball(s); RT.sync(s); return '축구화를 벽에 걸었다. '; }
    RT.leave(s, 'quit', r.name + '의 길을 접고 다른 과정으로 옮겼다.');
    return r.name + '은(는) 여기까지. ';
  }
  function wrapTrack(list) {
    list.forEach(function (x) { var run = x.run; x.run = function (s) { var t = run(s); return leaveIfOff(s) + t; }; });
    return list;
  }
  RT.trackChoices13 = function (s) {
    var c = [];
    var cur = s.route.id;
    if (cur === 'football') c.push({ text: '⚽ 축구 유스에 전념한다', effects: { football: 3, grit: 2 }, run: function (s) { track(s, 'football', 'path_football'); return '새벽 운동장이 내 교실이 됐다.'; } });
    else if (RT.isLadder(RT.byId(cur)) && (RT.byId(cur).entry.tracks || []).length) {
      var r0 = RT.byId(cur);
      c.push({ text: r0.icon + ' ' + r0.name + '의 길을 계속 간다', run: function (s) { track(s, r0.entry.tracks[0], 'path_arts'); return '지금 걷는 길에 더 집중하기로 했다.'; } });
    }
    c.push({ text: '📚 진학반: 공부로 대학에 간다', effects: { smarts: 3 }, run: function (s) { track(s, 'study', 'path_study'); return '책상 앞에 "목표: 장학생"이라고 붙였다.'; } });
    var arts = [['art', '🎨', '미술', 'art'], ['music', '🎵', '음악', 'music'], ['acting', '🎭', '연기·방송', 'stage']];
    arts.sort(function (a, b) { return (s.talent ? s.talent[b[3]] : 0) - (s.talent ? s.talent[a[3]] : 0); });
    arts.slice(0, 2).forEach(function (a) {
      c.push({ text: a[1] + ' 예체능: ' + RT.trackName(s, a[0]), desc: D().tracks[a[0]].desc + ' (내 ' + a[2] + ' 재능 ' + (s.talent ? s.talent[a[3]] : 0) + ')', run: function (s) { track(s, a[0], 'path_arts'); RT.addTalent(s, a[3], 5); return '방과 후 실기실 불이 늦게까지 켜져 있었다.'; } });
    });
    c.push({ text: '🏅 ' + RT.trackName(s, 'sport') + '(으)로 운동을 한다', desc: '농구·야구·격투기 같은 운동부로 이어진다. (운동 감각 ' + (s.talent ? s.talent.sport : 0) + ')', run: function (s) { track(s, 'sport', 'path_arts'); RT.addTalent(s, 'sport', 4); return '운동부 감독이 체력 테스트 기록지를 건넸다.'; } });
    if (s.stats.looks >= 50 || (s.talent && s.talent.stage >= 35)) c.push({ text: '🎤 기획사 연습생에 도전한다', desc: '노래·춤을 배우며 아이돌 데뷔를 노린다.', run: function (s) { track(s, 'trainee', 'path_arts'); RT.addTalent(s, 'stage', 4); return '연습실 거울 앞에서 첫 안무를 배웠다.'; } });
    c.push({ text: '🛹 아직 모르겠다, 일단 논다', risky: true, effects: { happy: 4, mischief: 3 }, run: function (s) { track(s, cur === 'football' ? 'football' : (s.track || 'general'), 'path_free'); return '선생님이 한숨을 쉬었다. 친구들과 오락실로 향했다.'; } });
    var r1 = RT.byId(cur);
    if (RT.isLadder(r1)) c.forEach(function (x, i) { if (i > 0 && !/논다/.test(x.text)) x.desc = (x.desc ? x.desc + ' ' : '') + '지금의 ' + r1.name + ' 길은 그만두게 된다.'; });
    return wrapTrack(c);
  };
  RT.trackChoices16 = function (s) {
    var c = [], t = s.track || 'general';
    var keep = { football: 1, sport: 1, art: 1, music: 1, acting: 1, trainee: 1 }[t];
    if (keep) c.push({ text: '지금 과정(' + RT.trackName(s, t) + ')을 계속 간다', effects: { grit: 2 }, run: function () { return '이 길로 끝까지 가 보기로 했다.'; } });
    c.push({ text: '📜 ' + RT.trackName(s, 'hum') + '(으)로 대학을 준비한다', desc: '법·행정·언론·교육 계열로 이어진다.', effects: { smarts: 3, money: -800 }, run: function (s) { track(s, 'hum', 'path_study'); RT.addTalent(s, 'lang', 4); return '밤 열한 시 학원 버스가 일상이 됐다.'; } });
    c.push({ text: '🧪 ' + RT.trackName(s, 'sci') + '(으)로 대학을 준비한다', desc: '의대·공대·자연과학 계열로 이어진다.', effects: { smarts: 3, money: -800 }, run: function (s) { track(s, 'sci', 'path_study'); RT.addTalent(s, 'logic', 4); return '실험 노트와 문제집이 책상을 덮었다.'; } });
    if (!keep || c.length < 4) {
      var tk = (s.talent && s.talent.taste > s.talent.logic) ? ['cook', '🍳'] : ['tech', '🔧'];
      c.push({ text: tk[1] + ' ' + RT.trackName(s, tk[0]) + '에 간다', desc: D().tracks[tk[0]].desc, effects: { grit: 3 }, run: function (s) { track(s, tk[0], 'path_trade'); RT.addTalent(s, tk[0] === 'cook' ? 'taste' : 'logic', 5); return tk[0] === 'cook' ? '조리 실습실의 칼 소리가 생각보다 좋았다.' : '기름 냄새 나는 실습실이 생각보다 좋았다.'; } });
    }
    if (c.length < 5) c.push({ text: '자퇴하고 내 길을 간다', risky: true, effects: { mischief: 4, happy: 3, rep: -4, fx: ['dropOut'] }, run: function (s) { track(s, 'general', 'path_creator'); return '교복을 벗던 날, 세상이 넓어 보이면서도 무서웠다.'; } });
    return wrapTrack(c);
  };

  // ---------------------------------------------------------------- 진로 panel data
  RT.panel = function (s) {
    var r = RT.cur(s), st = RT.stage(s), out = { route: r, title: RT.stageTitle(s), stage: st, ladder: [], next: null, exits: [], open: [], locked: [], fit: RT.fit(s, r), skill: s.route.sk, track: s.track ? RT.trackName(s, s.track) : null };
    if (RT.isLadder(r)) {
      var si = RT.stageIndex(s);
      out.ladder = r.stages.map(function (x, i) { return { t: RT.stageLabel(s, r, x), cur: i === si, done: i < si, peak: !!x.peak }; });
      var nx = r.stages[si + 1];
      if (r.id === 'football') out.next = s.fb.stage === 'pro' ? '경기력(축구 실력·근성·건강)을 높이면 팀 내 입지가 오른다.' : '축구 실력을 키우면 다음 클럽의 스카우트가 찾아온다.';
      else if (nx && !nx.late) out.next = '다음 단계 "' + RT.stageLabel(s, r, nx) + '" 조건: 길 실력 ' + (nx.skill || 0) + ' 이상' + (nx.fit ? ', 맞는 정도 ' + nx.fit + ' 이상' : '') + ', 지금 단계 ' + (st.min || 1) + '년 이상. (지금 실력 ' + s.route.sk + ')';
      else if (st && st.peak) out.next = '정상에 섰다. 이제 오래 버티는 것이 목표다.';
      if (st && st.max && !st.peak && !st.late) out.next += ' 이 단계에서 ' + st.max + '년 안에 올라서지 못하면 길이 끝날 수 있다.';
    } else if (r.generic && s.job) {
      var k = E.careerIndex()[s.job.id];
      out.ladder = k.ladder.map(function (t, i) { return { t: E.ladderTitle(s, k, i), cur: i === s.job.level, done: i < s.job.level }; });
      out.next = s.job.level < k.ladder.length - 1 ? '성과를 쌓아 승진: 이 직급 ' + k.promoteYears + '년 이상, ' + C.STAT_LABELS[k.keyStat] + '이(가) 높을수록 유리.' : '최고 직급에 올랐다.';
    }
    var causes = {};
    (r.exits || []).forEach(function (x) { if (x && x.to) x.on.forEach(function (c) { (causes[x.to] = causes[x.to] || []).push(c); }); });
    out.exits = Object.keys(causes).map(function (to) { var tr = RT.byId(to); return { to: to, name: tr.icon + ' ' + tr.name, why: causes[to].filter(function (c, i, a) { return a.indexOf(c) === i; }).map(RT.causeLabel).join('·') }; });
    D().routes.forEach(function (x) {
      if (x.state || x.id === r.id) return;
      var miss = RT.entryMissing(s, x);
      var item = { id: x.id, name: x.icon + ' ' + x.name, group: x.group, how: (x.entry && x.entry.how) || '', fit: RT.fit(s, x), text: (x.entry && x.entry.text) || '', miss: miss };
      if (RT.isLadder(x)) item.ladder = x.stages.map(function (st2) { return st2.t || '·'; }).filter(function (t) { return t !== '·'; });
      (miss.length ? out.locked : out.open).push(item);
    });
    out.open.sort(function (a, b) { return b.fit - a.fit; });
    return out;
  };

  // ---------------------------------------------------------------- endings
  RT.mainRoute = function (s) {
    var best = null, score = -1;
    Object.keys(s.routeSeen || {}).forEach(function (id) {
      var r = RT.byId(id); if (!r || r.state) return;
      var sc = (s.routePeak && s.routePeak[id] != null ? 100 : 0) + (s.routeYears && s.routeYears[id] || 0);
      if (sc > score) { score = sc; best = id; }
    });
    return best;
  };
  RT.routeEndings = function () {
    var out = { win: [], fall: [] };
    D().routes.forEach(function (r) {
      if (!r.endings || !Array.isArray(r.endings.win)) return;
      var peak = (RT.stages(r).filter(function (x) { return x.peak; })[0] || {}).t || '정상';
      out.win.push({ id: 'route_' + r.id + '_win', kind: 'win', icon: r.endings.win[0], name: r.endings.win[1], desc: r.endings.win[2], hint: r.name + '에서 "' + peak + '"까지 오르면',
        test: function (s) { if (RT.mainRoute(s) !== r.id) return false; if (s.routePeak && s.routePeak[r.id] != null) return true; return r.generic && s.jobHistory.concat(s.job ? [{ id: s.job.id, top: s.job.level === E.careerIndex()[s.job.id].ladder.length - 1 }] : []).some(function (j) { return j.top && r.careers.indexOf(j.id) >= 0; }); } });
      out.fall.push({ id: 'route_' + r.id + '_fall', kind: 'fall', icon: r.endings.fall[0], name: r.endings.fall[1], desc: r.endings.fall[2], hint: r.name + '의 길에서 꿈을 이루지 못하면',
        test: function (s) { return RT.mainRoute(s) === r.id && (s.routeLog || []).some(function (m) { return m.from === r.id && ['fail', 'release', 'fired', 'disband', 'scandal', 'burnout'].indexOf(m.cause) >= 0; }); } });
    });
    return out;
  };
  RT.installEndings = function () {
    var list = D().endings, re = RT.routeEndings();
    if (list.some(function (e) { return /^route_/.test(e.id); })) return;
    var at = list.map(function (e) { return e.id; }).indexOf('pro_player');
    var fallAt = function () { return list.map(function (e) { return e.id; }).indexOf('bankrupt'); };
    Array.prototype.splice.apply(list, [at, 0].concat(re.win));
    Array.prototype.splice.apply(list, [fallAt(), 0].concat(re.fall));
  };
  RT.installEndings();

  // ---------------------------------------------------------------- system events and hooks
  E.SYS_EVENTS = (E.SYS_EVENTS || []).concat(ROUTE_EVENTS);
  E.resetCaches();

  // years spent on each route (for the main-route ending and the summary)
  RT.countYear = function (s) { s.routeYears = s.routeYears || {}; s.routeYears[s.route.id] = (s.routeYears[s.route.id] || 0) + 1; };

  // set up body, talents and route for a new life
  var _newGame = E.newGame;
  E.newGame = function (opts) {
    var s = _newGame(opts);
    opts = opts || {};
    s.body = RT.rollBody(s, opts.parentState);
    s.talent = RT.rollTalent(s);
    if (opts.parentState && opts.parentState.talent) Object.keys(s.talent).forEach(function (k) { s.talent[k] = Math.round((s.talent[k] * 2 + (opts.parentState.talent[k] || 0)) / 3); });
    s.track = null;
    s.routeLog = [];
    s.route = null;
    RT.sync(s, true);
    return s;
  };
  // 태교 and early education feed base talents
  RT.PRENATAL_TALENT = { music: { music: 25 }, story: { lang: 25 }, walk: { sport: 22 }, talk: { stage: 22 }, rest: { sport: 8, taste: 8 }, art: { art: 25 }, cook: { taste: 25 }, puzzle: { logic: 25 } };
  RT.FOCUS_TALENT = { lang: 'lang', music: 'music', play: 'stage', sports: 'sport', art: 'art', logic: 'logic', cook: 'taste' };
  RT.migrate = function (s) {
    if (!s.body) s.body = RT.rollBody(s);
    if (!s.talent) {
      s.talent = RT.rollTalent(s);
      var p = RT.PRENATAL_TALENT[s.prenatal]; if (p) Object.keys(p).forEach(function (k) { RT.addTalent(s, k, p[k]); });
      var f = RT.FOCUS_TALENT[s.eduFocus]; if (f) RT.addTalent(s, f, 12);
    }
    if (s.track === undefined) s.track = s.flags.path_football ? 'football' : s.flags.path_study ? 'study' : s.flags.path_trade ? 'tech' : s.flags.path_arts ? 'art' : s.flags.path_free || s.flags.path_creator ? 'general' : null;
    s.routeLog = s.routeLog || [];
    // v5 never closed a youth club spell, so adults kept 'local'/'regional' forever; those heroes
    // stopped playing long ago (or took another job), so they are off the football ladder now
    var fbs = s.fb && s.fb.stage;
    if ((fbs === 'local' || fbs === 'regional' || fbs === 'academy' || fbs === 'youth') &&
        ((s.job && s.job.id !== 'footballer') || s.age > (fbs === 'local' || fbs === 'regional' ? 18 : 21))) {
      s.fb.stage = 'none'; s.fb.club = null; if (s.flags.fb_quit == null) s.flags.fb_quit = s.age;
    }
    if (!s.route) RT.sync(s, true);
    s.routeYears = s.routeYears || {};
    return s;
  };
  // lines for the 🔥 실력 쌓기 activity (kept apart from the yearly stage lines so years do not repeat)
  var TRAIN_LINES = {
    basketball: ['드리블 코스를 왕복 스무 번 돌았다.', '자유투 백 개를 넣을 때까지 체육관에 남았다.', '점프력 훈련으로 박스 점프를 반복했다.', '수비 스텝만 한 시간 연습했다.', '경기 영상을 보며 패스 길을 그려 봤다.', '웨이트장에서 하체를 단련했다.', '왼손 레이업을 따로 연습했다.', '코트 한쪽에서 혼자 페이드어웨이를 던졌다.'],
    baseball: ['티 배팅으로 공 이백 개를 쳤다.', '불펜에서 변화구 그립을 바꿔 봤다.', '외야 펑고를 백 개 받았다.', '하체 밸런스 훈련으로 투구 폼을 다듬었다.', '전력 분석 영상을 보며 상대 투수 버릇을 적었다.', '번트와 주루 연습을 반복했다.', '수건으로 섀도 피칭을 했다.', '악력기를 쥐며 손목 힘을 키웠다.'],
    fighter: ['미트 치기 5라운드를 소화했다.', '줄넘기 3분 10세트를 했다.', '스파링 파트너와 클린치 탈출을 연습했다.', '새벽 로드워크로 언덕을 다섯 번 올랐다.', '목 근력 운동을 했다.', '그라운드 기술을 관장님께 배웠다.', '거울 앞에서 섀도복싱을 했다.', '복근 운동 뒤 샌드백을 쳤다.'],
    idol: ['안무 한 곡을 처음부터 끝까지 열 번 맞췄다.', '발성 연습으로 고음을 다듬었다.', '카메라 앞 표정 연습을 했다.', '멤버들과 동선을 맞췄다.', '라이브로 부르며 러닝머신을 뛰었다.', '외국어 수업을 들었다.', '무대 영상을 보며 실수를 체크했다.', '보컬 트레이너에게 호흡법을 배웠다.'],
    singer: ['녹음실에서 같은 구절을 스무 번 불렀다.', '새 곡의 가사를 고쳐 썼다.', '발성 연습으로 목을 풀었다.', '피아노 앞에서 코드를 짰다.', '좋아하는 가수의 라이브를 분석했다.', '거리 공연으로 실전 감각을 익혔다.', '호흡 훈련을 했다.', '데모 음원을 다시 믹싱했다.'],
    band: ['합주실에서 새 곡을 맞췄다.', '메트로놈에 맞춰 손가락 연습을 했다.', '멤버들과 편곡을 바꿔 봤다.', '공연 셋리스트를 정했다.', '녹음 장비 사용법을 익혔다.', '좋아하는 밴드의 곡을 따라 연주했다.', '새 리프를 만들었다.', '라이브 영상을 찍어 돌려 봤다.'],
    actor: ['독백 대본을 세 가지 감정으로 읽었다.', '발음 연습으로 볼펜을 물고 대사를 했다.', '사람들을 관찰하며 캐릭터 노트를 썼다.', '연기 수업에서 즉흥극을 했다.', '고전 영화를 보며 장면을 따라 했다.', '체력 관리를 위해 달리기를 했다.', '사투리 대사를 연습했다.', '상대역과 대본 리딩을 했다.'],
    comedian: ['개그 노트에 아이디어를 열 개 적었다.', '동료들 앞에서 새 코너를 시연했다.', '성대모사를 연습했다.', '옛날 코미디 영상을 분석했다.', '즉흥 연기 모임에 나갔다.', '타이밍 연습으로 같은 대사를 백 번 했다.', '소극장 무대에 섰다.', '유행어 후보를 녹음해 들어 봤다.'],
    model: ['워킹 연습을 백 바퀴 했다.', '포즈 연습을 거울 앞에서 했다.', '필라테스로 자세를 바로잡았다.', '프로필 사진을 새로 찍었다.', '런웨이 영상을 보며 시선 처리를 배웠다.', '식단 일지를 썼다.', '하이힐 워킹을 연습했다.', '패션 잡지를 넘기며 트렌드를 공부했다.'],
    art: ['석고 데생을 세 장 그렸다.', '새 재료로 실험해 봤다.', '미술관에서 대가의 그림을 오래 봤다.', '크로키 백 장을 그렸다.', '작업 노트를 정리했다.', '색 조합 연습을 했다.', '야외 스케치를 나갔다.', '작품 사진을 찍어 포트폴리오를 정리했다.'],
    cook: ['칼질 연습으로 양파 한 자루를 썰었다.', '육수를 처음부터 다시 냈다.', '새 레시피를 세 번 만들어 봤다.', '시장에서 제철 재료를 공부했다.', '소스 농도를 맞추는 연습을 했다.', '플레이팅을 연습했다.', '유명 식당의 맛을 분석했다.', '위생 관리 공부를 했다.'],
    law: ['판례집을 한 권 정리했다.', '모의 변론을 연습했다.', '법조문을 소리 내어 외웠다.', '서면 쓰기 연습을 했다.', '스터디 모임에서 사례를 토론했다.', '새 판례 기사를 읽고 메모했다.', '논리 구조를 도식으로 그려 봤다.', '선배의 변론 기록을 공부했다.'],
    medical: ['해부학 노트를 다시 정리했다.', '봉합 연습을 했다.', '최신 논문을 읽었다.', '응급 처치 시뮬레이션을 했다.', '케이스 컨퍼런스를 준비했다.', '진단 순서를 외웠다.', '선배의 수술 영상을 돌려 봤다.', '약물 상호작용표를 공부했다.'],
    rapper: ['비트 위에 16마디를 새로 썼다.', '프리스타일로 십 분을 쉬지 않고 뱉었다.', '라임 노트에 단어를 서른 개 모았다.', '녹음 부스에서 같은 벌스를 열 번 녹음했다.', '사이퍼에 나가 다른 래퍼들과 돌아가며 뱉었다.', '좋아하는 래퍼의 플로우를 받아 적었다.', '호흡을 끊지 않고 빠른 벌스를 연습했다.', '새 비트를 받아 훅을 짰다.'],
    gang: ['형님들 심부름으로 골목을 한 바퀴 돌았다.', '구역 가게들을 돌며 얼굴을 익혔다.', '체육관에서 몸을 만들었다.', '누가 누구 편인지 장부를 머릿속에 정리했다.', '조직 선배에게 입 다무는 법부터 배웠다.', '경찰 순찰 시간을 눈여겨봤다.'],
    con: ['말투 하나로 사람 마음이 열리는 걸 연습했다.', '남의 서명을 백 번 따라 써 봤다.', '사람들 표정 읽는 연습을 했다.', '새 명함과 새 이름을 만들었다.', '선배 꾼이 판 짜는 걸 옆에서 봤다.', '들킬 때 도망칠 말부터 미리 준비했다.'],
    thief: ['손가락 놀림을 동전으로 연습했다.', '골목과 지붕 길을 외웠다.', '장물 넘길 곳을 알아 뒀다.', '눈에 안 띄는 옷차림을 연구했다.', '선배에게 빠지는 길부터 배웠다.', '밤마다 동네를 걸으며 눈을 익혔다.']
  };
  RT.trainLines = function (r) {
    return TRAIN_LINES[r.id] || [r.name + ' 연습을 했다.', r.name + ' 일을 잘하는 선배에게 요령을 물었다.', r.name + ' 관련 책을 한 권 읽었다.', '퇴근 뒤 ' + r.name + ' 실력을 따로 갈고닦았다.', '실수했던 일을 다시 해 봤다.', '부족한 부분을 노트에 적고 하나씩 고쳤다.'];
  };

  // majors that belong to the other school track (문과 vs 이과); arts/sport tracks have their own majors
  var HUM_MAJORS = ['law', 'business', 'economics', 'education', 'humanities', 'media', 'theology'];
  var SCI_MAJORS = ['medicine', 'nursing', 'cs', 'engineering', 'science', 'agriculture', 'architecture', 'aerospace'];
  RT.offTrackMajor = function (t, m) {
    if (t === 'hum') return SCI_MAJORS.indexOf(m) >= 0;
    if (t === 'sci') return HUM_MAJORS.indexOf(m) >= 0;
    if (t === 'art' || t === 'acting') return ['medicine', 'law', 'aerospace'].indexOf(m) >= 0;
    if (t === 'music') return ['medicine', 'law', 'aerospace'].indexOf(m) >= 0;
    if (t === 'sport' || t === 'football') return ['medicine', 'law', 'aerospace'].indexOf(m) >= 0;
    return false;
  };

  // ---------------------------------------------------------------- route moments (FX used by data/events_routes.js)
  function rtGain(s, d) { if (s.route) s.route.sk = clamp(s.route.sk + d, 0, 100); }
  E.FX.rtSkill = function (s) { rtGain(s, E.rint(s, 3, 5)); return null; };
  E.FX.rtBig = function (s) { rtGain(s, E.rint(s, 6, 9)); E.addStat(s, 'fame', 3); E.triumph(s, 'promote'); return null; };
  E.FX.rtSetback = function (s) { rtGain(s, -E.rint(s, 3, 6)); return null; };
  E.FX.rtInjury = function (s) {
    E.addStat(s, 'health', -E.rint(s, 8, 16)); rtGain(s, -E.rint(s, 5, 10));
    var r = RT.cur(s);
    if (r && r.athlete && r.athlete.decline < 50 && E.chance(s, 0.35)) { s.flags.career_injury = s.age; RT.leave(s, 'injury', '부상이 선수 생명을 끊었다. 재활 끝에 은퇴를 받아들였다.'); return '선수 생명이 끝나는 부상이었다.'; }
    return '부상으로 한동안 쉬어야 했다.';
  };
  E.FX.rtScandal = function (s) {
    s.traits.rep = Math.max(0, (s.traits.rep || 50) - 12); E.addStat(s, 'happy', -8);
    if (E.chance(s, 0.4) && !RT.cur(s).state) { RT.leave(s, 'scandal', '스캔들 기사가 쏟아졌다. 결국 모든 활동을 내려놓았다.'); return '스캔들로 활동을 접었다.'; }
    rtGain(s, -4); return '기사는 금방 잊혔지만 상처가 남았다.';
  };
  E.FX.rtBurnout = function (s) {
    E.addStat(s, 'happy', -6); E.addStat(s, 'health', -3);
    if (E.chance(s, 0.4) && !RT.cur(s).state) { RT.leave(s, 'burnout', '몸과 마음이 바닥났다. 잠시 내려놓기로 했다.'); return '지쳐서 내려놓았다.'; }
    return '버텼다. 대신 웃음이 줄었다.';
  };

  // right after the birth card: the body the hero was born with
  E.birthExtras = function (s) {
    if (s.body) E.addCard(s, { id: 'birth_body', pic: 'birth', text: '타고난 몸: ' + RT.bodyText(s) + '.' });
  };

  // ---------------------------------------------------------------- engine hooks
  // one ladder per career: on a stage-ladder route the job title is the stage title (신진 작가, 주전 선수…)
  var _rank = E.rankTitle;
  E.rankTitle = function (s) {
    var r = s.route && RT.byId(s.route.id);
    return RT.managesJob(s) && RT.ofCareer(s.job.id) === r.id ? RT.stageTitle(s) : _rank(s);
  };
  // a move into another route by taking a job is checked before the job starts
  var _startJob = E.startJob;
  E.startJob = function (s, id, level) {
    if (!s._routeSync && s.route) {
      var to = RT.ofCareer(id) || 'office';
      if (to !== s.route.id && !RT.legal(s.route.id, to, 'choice')) return false;
    }
    _startJob(s, id, level);
    return true;
  };
  var _applyJob = E.applyJob;
  E.applyJob = function (s, id) {
    var j = E.jobList(s).filter(function (x) { return x.id === id; })[0];
    if (j && !j.ok && !j.current) return { ok: false, log: j.missing[0] || '지원 자격이 없다.' };
    return _applyJob(s, id);
  };
  // the old football blacklist is replaced by route membership + exit legality
  E.careerStoryOk = RT.eventOk;
  // the current route's own events come up more often than general life events
  var _habit = E.habitWeight;
  E.habitWeight = function (s, ev) {
    var w = _habit(s, ev), rr = RT.eventRoutes(ev);
    return rr && s.route && rr.indexOf(s.route.id) >= 0 ? w * 2.5 : w;
  };
  // job search only offers jobs that the current route can lead to
  var _jobList = E.jobList;
  E.jobList = function (s) {
    if (!s.route) RT.sync(s, true);
    var cur = RT.byId(s.route.id);
    return _jobList(s).map(function (j) {
      var rid = RT.ofCareer(j.id), r = RT.byId(rid), miss = j.missing.slice();
      if (RT.isLadder(r)) miss.unshift('🧭 ' + r.name + ' 길로만 시작 (' + ((r.entry && r.entry.how) || '진로') + ')');
      else if (!j.current && !RT.legal(cur.id, rid, 'choice')) miss.unshift('지금 걷는 길(' + cur.name + ')에서 바로 옮길 수 없음');
      if (miss.length !== j.missing.length) { j.missing = miss; j.ok = false; j.chance = 0; }
      j.route = rid;
      return j;
    });
  };
  // a quick job prefers the hero's own route (a new employer in the same field)
  var _quick = E.FX.quickJob;
  E.FX.quickJob = function (s) {
    var cur = s.route && s.route.id, k = s.job && E.careerIndex()[s.job.id];
    if (k && RT.byId(cur) && RT.byId(cur).generic) {
      var same = E.jobList(s).filter(function (j) { return j.ok && !j.current && j.route === cur; });
      if (same.length) { var j = E.pick(s, same); E.startJob(s, j.id, 0); return j.name + '(으)로 자리를 옮겼다.'; }
    }
    return _quick(s);
  };
  var TRAIN_OUTFIT = { '운동': 'kit', '연예계': 'idol', '예술': 'artist', '전문직': 'suit' };
  var _outfit = E.outfit;
  E.outfit = function (s) {
    var r = s.route && RT.byId(s.route.id);
    if (s.jail <= 0 && r && RT.isLadder(r) && r.id !== 'football' && !s.job) return r.id === 'cook' ? 'apron' : TRAIN_OUTFIT[r.group] || _outfit(s);
    return _outfit(s);
  };
  void T;
})(typeof globalThis !== 'undefined' ? globalThis : this);
