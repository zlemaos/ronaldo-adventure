#!/usr/bin/env node
/* Validates all data packs against docs/DESIGN.md (section 4). Usage: node tools/validate-data.js
 * Exits 1 on errors. Also exported for tests. */
'use strict';
const fs = require('fs');
const path = require('path');

function loadAll() {
  const root = path.join(__dirname, '..');
  delete globalThis.RA;
  const cp = path.join(root, 'data/constants.js');
  delete require.cache[require.resolve(cp)];
  require(cp);
  const files = fs.readdirSync(path.join(root, 'data')).filter(f => f.endsWith('.js') && f !== 'constants.js').sort();
  for (const f of files) {
    const p = path.join(root, 'data', f);
    delete require.cache[require.resolve(p)];
    require(p);
  }
  return globalThis.RA;
}

function validate(RA) {
  const C = RA.C, D = RA.data;
  const errors = [], warns = [];
  const err = (m) => errors.push(m);
  const tokenRe = /\{([a-zA-Z0-9]+)\}/g;
  const checkText = (where, t) => {
    if (typeof t !== 'string' || !t.trim()) { err(where + ': empty text'); return; }
    let m; tokenRe.lastIndex = 0;
    while ((m = tokenRe.exec(t))) if (!C.TOKENS.includes(m[1])) err(where + ': unknown token {' + m[1] + '}');
    const bad = t.match(/\[[^\]/]*\/[^\]]*\]/g) || [];
    bad.forEach(b => { if (!['[이/가]', '[은/는]', '[을/를]', '[과/와]', '[으로/로]', '[아/야]', '[이/]'].includes(b)) err(where + ': unknown particle ' + b); });
  };
  const COUNTRIES = ['pt', 'kr', 'jp', 'cn', 'us', 'br', 'ar', 'za', 'in'];

  // Countries
  const cs = D.countries || {};
  for (const id of COUNTRIES) {
    const c = cs[id];
    if (!c) { err('country missing: ' + id); continue; }
    const w = 'country ' + id;
    ['name', 'leader', 'nationalTeam', 'footballCulture'].forEach(k => { if (!c[k]) err(w + ': missing ' + k); });
    if (!c.currency || !c.currency.unit || !(c.currency.rate > 0)) err(w + ': bad currency');
    if (!(c.wage > 0 && c.wage <= 1.5)) err(w + ': bad wage');
    if (!c.hero || !c.hero.given || !c.hero.nick) err(w + ': bad hero');
    const f = c.family || {};
    if (!f.father || !f.father.name || !f.father.job || !f.father.job2) err(w + ': bad father');
    if (!f.mother || !f.mother.name || !f.mother.job) err(w + ': bad mother');
    if (!Array.isArray(f.siblings) || f.siblings.length !== 3) err(w + ': need 3 siblings');
    else {
      const keys = f.siblings.map(s => s.key).join(',');
      if (keys !== 'bro,sis1,sis2') err(w + ': sibling keys must be bro,sis1,sis2');
      f.siblings.forEach(s => { if (!s.name || !(s.gap >= 1)) err(w + ': bad sibling'); });
    }
    const p = c.places || {};
    ['hometown', 'region', 'city', 'bigcity', 'capital', 'house', 'homeShort'].forEach(k => { if (!p[k]) err(w + ': places.' + k); });
    if (p.house && !/집$/.test(p.house)) err(w + ': places.house must be a noun phrase ending in 집 (used as "…에서 태어났다")');
    const cl = c.clubs || {};
    ['local', 'regional', 'academy', 'big', 'rival', 'league'].forEach(k => { if (!cl[k]) err(w + ': clubs.' + k); });
    const s = c.school || {};
    ['elem', 'middle', 'high'].forEach(k => {
      if (!s[k] || !s[k].name || !s[k].school || !(s[k].from < s[k].to)) err(w + ': school.' + k);
    });
    if (s.elem && s.middle && s.high && !(s.elem.to < s.middle.from && s.middle.to < s.high.from)) err(w + ': school ages overlap');
    if (!s.exam || !s.exam.name || !s.exam.age) err(w + ': school.exam');
    ['univTop', 'univMid', 'univAbroad', 'sportsClub'].forEach(k => { if (!s[k]) err(w + ': school.' + k); });
    if (!Array.isArray(c.foods) || c.foods.length < 5) err(w + ': foods >= 5');
    if (!Array.isArray(c.holidays) || c.holidays.length < 3) err(w + ': holidays >= 3');
    const n = c.names || {};
    if (!n.m || n.m.length < 12 || !n.f || n.f.length < 12 || !n.surnames || n.surnames.length < 5) err(w + ': names');
    if (!['surname-first', 'given-first'].includes(c.nameOrder)) err(w + ': nameOrder');
    if (!Array.isArray(c.skin) || c.skin.length < 2) err(w + ': skin');
    if (!Array.isArray(c.flag) || c.flag.length !== 3) err(w + ': flag');
  }

  // Careers
  const careers = D.careers || [];
  const cids = new Set();
  for (const k of careers) {
    const w = 'career ' + k.id;
    if (!k.id || cids.has(k.id)) err(w + ': missing/duplicate id');
    cids.add(k.id);
    if (!k.name) err(w + ': name');
    if (!C.SECTORS[k.sector]) err(w + ': bad sector ' + k.sector);
    if (!C.OUTFITS.includes(k.outfit)) err(w + ': bad outfit ' + k.outfit);
    if (!k.desc) err(w + ': desc');
    const r = k.req || {};
    if (!(r.minAge >= 10 && r.maxAge > r.minAge)) err(w + ': req ages');
    if (r.degree && !C.DEGREES.includes(r.degree)) err(w + ': bad degree');
    (r.majors || []).forEach(m => { if (!C.MAJORS[m]) err(w + ': bad major ' + m); });
    Object.keys(r.stats || {}).forEach(s => { if (!C.STATS.includes(s)) err(w + ': bad stat ' + s); });
    Object.keys(r.traits || {}).forEach(t => { if (!C.TRAITS.includes(t)) err(w + ': bad trait ' + t); });
    if (r.traits && !r.unlockHint) err(w + ': trait-gated careers need req.unlockHint (shown in the 진로 panel)');
    if (!Array.isArray(k.salary) || k.salary.length !== 2 || !(k.salary[0] >= 0 && k.salary[1] >= k.salary[0])) err(w + ': salary');
    if (!Array.isArray(k.ladder) || k.ladder.length < 3 || k.ladder.length > 7) err(w + ': ladder 3..7');
    if (!C.STATS.includes(k.keyStat)) err(w + ': keyStat');
    ['promoteYears', 'difficulty', 'stress'].forEach(f => { if (!(k[f] >= 1)) err(w + ': ' + f); });
  }

  // Events
  const events = D.events || [];
  const eids = new Set();
  const fxSet = new Set(C.FX);
  const checkEffects = (w, e) => {
    if (!e) return;
    for (const key of Object.keys(e)) {
      if (C.STATS.includes(key) || key === 'money' || C.TRAITS.includes(key)) { if (typeof e[key] !== 'number') err(w + ': ' + key + ' not number'); }
      else if (key === 'rel') Object.keys(e.rel).forEach(r => { if (!C.REL_KEYS.includes(r)) err(w + ': bad rel ' + r); });
      else if (key === 'flags' || key === 'unflags') { if (!Array.isArray(e[key])) err(w + ': ' + key + ' must be array'); }
      else if (key === 'fx') { (Array.isArray(e.fx) ? e.fx : [e.fx]).forEach(f => { if (!fxSet.has(f)) err(w + ': bad fx ' + f); }); }
      else if (key === 'achieve') { /* free id */ }
      else err(w + ': unknown effect key ' + key);
    }
  };
  for (const ev of events) {
    const w = 'event ' + ev.id;
    if (!ev.id || eids.has(ev.id)) err(w + ': missing/duplicate id');
    eids.add(ev.id);
    checkText(w, ev.text);
    (ev.textVariants || []).forEach((t, i) => checkText(w + ' textVariant' + i, t));
    (ev.logVariants || []).forEach((t, i) => checkText(w + ' logVariant' + i, t));
    if (ev.maxTimes != null && !(ev.maxTimes >= 1)) err(w + ': maxTimes must be >= 1');
    if (ev.age && !(Array.isArray(ev.age) && ev.age[0] <= ev.age[1])) err(w + ': age');
    (ev.countries || []).forEach(c => { if (!COUNTRIES.includes(c)) err(w + ': bad country ' + c); });
    const cd = ev.cond || {};
    const allowed = ['stats', 'money', 'flags', 'fb', 'edu', 'degree', 'career', 'sector', 'level', 'rel', 'gender', 'recent', 'family', 'traits', 'jailed', 'childAge'];
    Object.keys(cd).forEach(k => { if (!allowed.includes(k)) err(w + ': unknown cond ' + k); });
    if (cd.family && cd.family !== 'all') err(w + ': cond.family must be "all"');
    if (ev.memorial && ev.memorial !== true && !Array.isArray(ev.memorial)) err(w + ': memorial must be true or a list');

    Object.keys(cd.stats || {}).forEach(s => { if (!C.STATS.includes(s)) err(w + ': bad cond stat ' + s); });
    Object.keys(cd.traits || {}).forEach(t => { if (!C.TRAITS.includes(t) || !Array.isArray(cd.traits[t])) err(w + ': bad cond trait ' + t); });
    (cd.fb || []).forEach(s => { if (!C.FB_STAGES.includes(s)) err(w + ': bad fb ' + s); });
    (cd.edu || []).forEach(s => { if (!C.EDU_STAGES.includes(s)) err(w + ': bad edu ' + s); });
    (cd.sector || []).forEach(s => { if (!C.SECTORS[s]) err(w + ': bad sector ' + s); });
    if (cd.degree && !C.DEGREES.includes(cd.degree)) err(w + ': bad degree');
    if (cd.flags && !Array.isArray(cd.flags)) err(w + ': cond.flags must be array');
    if (Array.isArray(cd.career)) cd.career.forEach(c => { if (careers.length && !cids.has(c)) err(w + ': unknown career ' + c); });
    else if (cd.career && !['any', 'none'].includes(cd.career)) err(w + ': career must be array/any/none');
    if (cd.rel) Object.keys(cd.rel).forEach(r => { if (!['father', 'mother', 'partner', 'spouse', 'children', 'friend', 'bro', 'sis1', 'sis2'].includes(r)) err(w + ': bad cond rel ' + r); });
    if (ev.choicesFn && !ev.choices) { /* choices built at runtime (js/routes.js track picks); checked by test/routes.test.js */ }
    else if (ev.choices) {
      if (!Array.isArray(ev.choices) || ev.choices.length < 2 || ev.choices.length > 4) err(w + ': 2..4 choices');
      ev.choices.forEach((ch, i) => {
        const cw = w + ' choice' + i;
        checkText(cw, ch.text);
        if (ch.career && careers.length && !cids.has(ch.career)) err(cw + ': unknown career ' + ch.career);
        if (ch.bet) {
          const b = ch.bet;
          if (!(b.odds > 0 && b.odds < 1) || !(b.mult > 1) || !C.BET_STAKES.includes(b.stake)) err(cw + ': bad bet (odds 0..1, mult > 1, stake ' + C.BET_STAKES.join('/') + ')');
          if (!ch.success || !ch.fail) err(cw + ': bet needs success+fail');
          else { checkText(cw + ' success', ch.success.log); checkText(cw + ' fail', ch.fail.log); checkEffects(cw, ch.success.effects); checkEffects(cw, ch.fail.effects); }
        } else if (ch.check) {
          const fixed = typeof ch.check.odds === 'number';
          if (fixed ? !(ch.check.odds > 0 && ch.check.odds < 1) : (!C.STATS.includes(ch.check.stat) || typeof ch.check.diff !== 'number')) err(cw + ': bad check');
          if (!ch.success || !ch.fail) err(cw + ': check needs success+fail');
          else { checkText(cw + ' success', ch.success.log); checkText(cw + ' fail', ch.fail.log); checkEffects(cw, ch.success.effects); checkEffects(cw, ch.fail.effects); }
        } else {
          checkText(cw + ' log', ch.log);
          checkEffects(cw, ch.effects);
        }
        (ch.logVariants || []).forEach((t, k) => checkText(cw + ' logVariant' + k, t));
        if (ch.schedule && !ch.schedule.id) err(cw + ': schedule.id');
      });
    } else {
      checkText(w + ' log', ev.log);
      checkEffects(w, ev.effects);
    }
  }
  // schedule targets must exist
  for (const ev of events) (ev.choices || []).forEach(ch => {
    [ch, ch.success, ch.fail].forEach(o => { if (o && o.schedule && !eids.has(o.schedule.id)) err('event ' + ev.id + ': schedule target missing ' + o.schedule.id); });
  });

  // Milestones (ages 0-4 montage)
  const ms = D.milestones || [];
  const mids = new Set();
  for (const m of ms) {
    const w = 'milestone ' + m.id;
    if (!m.id || mids.has(m.id) || eids.has(m.id)) err(w + ': missing/duplicate id');
    mids.add(m.id);
    const ages = Array.isArray(m.age) ? m.age : [m.age, m.age];
    if (!(ages[0] >= 0 && ages[1] <= 4)) err(w + ': age must be 0..4');
    if (!C.MILESTONE_PICS.includes(m.pic)) err(w + ': bad pic ' + m.pic);
    if (m.props && !C.MILESTONE_PROPS.includes(m.props)) err(w + ': bad props ' + m.props);
    (m.countries || []).forEach(c => { if (!COUNTRIES.includes(c)) err(w + ': bad country ' + c); });
    checkText(w, m.text);
    checkEffects(w, m.effects);
    if (m.text && m.text.length > 60) err(w + ': keep milestone sentences short (<= 60 chars)');
  }
  if (Object.keys(cs).length && ms.length < 10) err('need at least 10 milestones');
  for (const c of COUNTRIES) if (!ms.some(m => (m.countries || []).includes(c))) err('milestones: no country-specific milestone for ' + c);

  if (D.routes && RA.Engine && RA.Engine.Routes) validateRoutes(RA, err);

  const byPrefix = {};
  events.forEach(e => { const p = e.id.split('_')[0]; byPrefix[p] = (byPrefix[p] || 0) + 1; });
  return { errors, warns, counts: { milestones: ms.length, events: events.length, careers: careers.length, countries: Object.keys(cs).length, routes: (D.routes || []).length, byPrefix } };
}

// Route rules (docs/DESIGN.md §2f). Needs the engine (js/routes.js) for event classification.
const CAUSES = ['quit', 'fail', 'fired', 'release', 'burnout', 'scandal', 'disband', 'injury', 'deport', 'crime', 'retire', 'choice', 'calling', 'release_jail', 'entry', 'enroll'];
// scenes js/pixel.js can draw (parsed from its source, so a typo in a route's scene is caught here)
function drawnScenes() {
  const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'js', 'pixel.js'), 'utf8');
  return new Set([...src.matchAll(/^\s{4}(\w+): function \(ctx, t, c\)/gm)].map(m => m[1]));
}
const YOUTH_SPORT = /스카우트|유소년|아카데미|입단 테스트|트라이아웃|드래프트|국가대표 선발/;
const JOB_WORDS = /회사|출근|퇴근|직장|상사|야근|회식|사표|출장|월급날|동료 직원/;
function validateRoutes(RA, err) {
  const D = RA.data, RT = RA.Engine.Routes, C = RA.C;
  const ids = new Set(D.routes.map(r => r.id));
  const careerIds = new Set(D.careers.map(k => k.id));
  const owner = {};
  const scenes = drawnScenes();
  const fitKeys = new Set([].concat(D.bodyAttrs.map(a => a.k), D.talents.map(a => a.k), C.STATS, C.TRAITS));
  for (const r of D.routes) {
    const w = 'route ' + r.id;
    if (!r.name || !r.icon || !r.group) err(w + ': name/icon/group');
    if (!scenes.has(r.scene)) err(w + ': scene "' + r.scene + '" is not drawn by js/pixel.js');
    if (!r.state && (!r.fit || !Object.keys(r.fit).length)) err(w + ': fit (which body/talent/stat keys the route needs)');
    Object.keys(r.fit || {}).forEach(k => { if (!fitKeys.has(k)) err(w + ': unknown fit key ' + k); });
    (r.careers || []).forEach(c => { if (!careerIds.has(c)) err(w + ': unknown career ' + c); if (!owner[c]) owner[c] = r.id; });
    for (const x of r.exits || []) {
      if (x === '*entry') continue;
      if (typeof x === 'string') { err(w + ': exit "' + x + '" needs causes: X(to, \'cause …\')'); continue; }
      if (!ids.has(x.to)) err(w + ': exit to unknown route ' + x.to);
      x.on.forEach(c => { if (!CAUSES.includes(c)) err(w + ': exit cause ' + c); });
      if (x.career && RT.ofCareer(x.career) !== x.to) err(w + ': exit career ' + x.career + ' is not on route ' + x.to);
      if (x.to === r.id) err(w + ': exit to itself');
    }
    if (r.state) continue;
    if (!(r.exits || []).length) err(w + ': needs at least one exit');
    if (!r.endings) err(w + ': endings');
    if (!r.entry || !Array.isArray(r.entry.tracks) || !r.entry.tracks.length) err(w + ': entry.tracks');
    else r.entry.tracks.forEach(t => { if (!D.tracks[t]) err(w + ': unknown track ' + t); });
    if (RT.isLadder(r)) {
      if (r.stages.length < 4) err(w + ': a ladder needs entry → peak → late (4+ stages)');
      if (!r.stages.some(s => s.peak)) err(w + ': no peak stage');
      // once a ladder pays (a stage with lvl), every later stage keeps a paid position: no job gap mid-career
      const firstPaid = r.stages.findIndex(s => s.lvl != null);
      if (firstPaid >= 0) r.stages.slice(firstPaid).forEach(s => { if (s.lvl == null) err(w + ': stage ' + s.id + ' has no lvl after a paid stage'); });
      if (r.id !== 'football') {
        if (!r.stages.some(s => s.late)) err(w + ': no late (decline) stage');
        r.stages.forEach(s => { if (!(r.lines[s.id] || []).length || r.lines[s.id].length < 3) err(w + ': stage ' + s.id + ' needs 3+ yearly lines'); });
        const own = D.events.filter(e => (e.routes || []).includes(r.id));
        if (own.length < 3) err(w + ': needs 3+ own decision events (ev.routes)');
        if (!r.athlete) err(w + ': athlete {decline, end} ages');
        if (!r.endings || !Array.isArray(r.endings.win) || !Array.isArray(r.endings.fall)) err(w + ': endings [icon, name, desc] win+fall');
        if (!r.entry.age) err(w + ': entry.age');
      }
      // sports have realistic age windows
      if (r.group === '운동' && r.athlete && (r.athlete.end > 45 || (r.entry.age && r.entry.age[1] > 30))) err(w + ': sport age window too wide');
    } else if (r.generic) ['early', 'mid', 'top', 'late'].forEach(p => { if (!(r.lines[p] || []).length) err(w + ': lines.' + p); });
  }
  D.careers.forEach(k => { if (!owner[k.id]) err('career ' + k.id + ': belongs to no route'); });
  D.GLOBAL_EXITS.forEach(x => { if (!ids.has(x.to)) err('global exit to unknown route ' + x.to); x.on.forEach(c => { if (!CAUSES.includes(c)) err('global exit ' + x.to + ': cause ' + c); }); });
  Object.keys(D.tracks).forEach(t => { if (!D.routes.some(r => r.entry && (r.entry.tracks || []).includes(t))) err('track ' + t + ': opens no route'); });
  Object.keys(D.routeTags).forEach(id => { if (!D.events.some(e => e.id === id)) err('routeTags: unknown event ' + id); });
  const groups = ['adrift', 'employee', 'working', '*'];
  const expand = list => [].concat(...list.map(g => g === 'adrift' ? ['none', 'parttime'] : g === 'employee' ? D.routeGroups.employee : g === 'working' || g === '*' ? D.routes.map(r => r.id) : [g]));
  for (const ev of D.events) {
    const w = 'event ' + ev.id;
    const rr = RT.eventRoutes(ev);
    (ev.routes || []).forEach(g => { if (!ids.has(g) && !groups.includes(g)) err(w + ': unknown route ' + g); });
    const tg = RT.eventTargets(ev);
    if (tg.any && !rr && !tg.club) {
      // a route-neutral event may only end a job (global exits), never start one
      if (tg.careers.length || tg.quick || tg.monk) err(w + ': changes the career but is route-neutral (add ev.routes or a routeTags entry)');
    }
    if (tg.careers.length && rr) {
      const from = expand(rr);
      tg.careers.forEach(c => { if (!from.some(a => RT.legal(a, RT.ofCareer(c), 'choice'))) err(w + ': career ' + c + ' (' + RT.ofCareer(c) + ') is not an exit of ' + rr.join('/')); });
    }
    // age plausibility: an athlete route's events stop at its retirement age; youth-sport words
    // (scouts, academy, try-outs, signing) never reach an older hero outside the football ladder
    const age = ev.age || [0, 120];
    (rr || []).forEach(g => { const r = D.routes.find(x => x.id === g); if (r && r.athlete && r.group === '운동' && age[1] > r.athlete.end) err(w + ': ages past ' + r.id + ' retirement (' + r.athlete.end + ')'); });
    if (!(rr || []).includes('football') && age[1] > 30) {
      const all = [ev.text].concat(ev.textVariants || [], ...(ev.choices || []).map(c => [c.text, c.log, c.success && c.success.log, c.fail && c.fail.log])).filter(Boolean).join(' ');
      const m = all.match(YOUTH_SPORT);
      if (m && !(ev.cond && (ev.cond.childAge || ev.cond.fb))) err(w + ': youth-sport word "' + m[0] + '" up to age ' + age[1]);
    }
    if (!rr && !(D.jobTalkOk || []).includes(ev.id)) {
      const texts = [ev.text, ev.log].concat(ev.textVariants || [], ev.logVariants || [], ...(ev.choices || []).map(c => [c.text, c.log, c.success && c.success.log, c.fail && c.fail.log])).filter(Boolean).join(' ');
      if (JOB_WORDS.test(texts)) err(w + ': route-neutral text talks about a job (' + texts.match(JOB_WORDS)[0] + '); tag it with ev.routes');
    }
  }
  void C;
}

module.exports = { loadAll, validate };

if (require.main === module) {
  const res = validate(require('./sim-helpers.js').load());
  console.log(JSON.stringify(res.counts));
  if (res.errors.length) { console.log(res.errors.slice(0, 80).join('\n')); console.log(res.errors.length + ' error(s)'); process.exit(1); }
  console.log('OK');
}
