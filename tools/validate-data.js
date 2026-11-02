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
      if (C.STATS.includes(key) || key === 'money') { if (typeof e[key] !== 'number') err(w + ': ' + key + ' not number'); }
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
    const allowed = ['stats', 'money', 'flags', 'fb', 'edu', 'degree', 'career', 'sector', 'level', 'rel', 'gender', 'recent', 'family'];
    Object.keys(cd).forEach(k => { if (!allowed.includes(k)) err(w + ': unknown cond ' + k); });
    if (cd.family && cd.family !== 'all') err(w + ': cond.family must be "all"');
    if (ev.memorial && ev.memorial !== true && !Array.isArray(ev.memorial)) err(w + ': memorial must be true or a list');

    Object.keys(cd.stats || {}).forEach(s => { if (!C.STATS.includes(s)) err(w + ': bad cond stat ' + s); });
    (cd.fb || []).forEach(s => { if (!C.FB_STAGES.includes(s)) err(w + ': bad fb ' + s); });
    (cd.edu || []).forEach(s => { if (!C.EDU_STAGES.includes(s)) err(w + ': bad edu ' + s); });
    (cd.sector || []).forEach(s => { if (!C.SECTORS[s]) err(w + ': bad sector ' + s); });
    if (cd.degree && !C.DEGREES.includes(cd.degree)) err(w + ': bad degree');
    if (cd.flags && !Array.isArray(cd.flags)) err(w + ': cond.flags must be array');
    if (Array.isArray(cd.career)) cd.career.forEach(c => { if (careers.length && !cids.has(c)) err(w + ': unknown career ' + c); });
    else if (cd.career && !['any', 'none'].includes(cd.career)) err(w + ': career must be array/any/none');
    if (cd.rel) Object.keys(cd.rel).forEach(r => { if (!['father', 'mother', 'partner', 'spouse', 'children', 'friend', 'bro', 'sis1', 'sis2'].includes(r)) err(w + ': bad cond rel ' + r); });
    if (ev.choices) {
      if (!Array.isArray(ev.choices) || ev.choices.length < 2 || ev.choices.length > 4) err(w + ': 2..4 choices');
      ev.choices.forEach((ch, i) => {
        const cw = w + ' choice' + i;
        checkText(cw, ch.text);
        if (ch.check) {
          if (!C.STATS.includes(ch.check.stat) || typeof ch.check.diff !== 'number') err(cw + ': bad check');
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

  const byPrefix = {};
  events.forEach(e => { const p = e.id.split('_')[0]; byPrefix[p] = (byPrefix[p] || 0) + 1; });
  return { errors, warns, counts: { milestones: ms.length, events: events.length, careers: careers.length, countries: Object.keys(cs).length, byPrefix } };
}

module.exports = { loadAll, validate };

if (require.main === module) {
  const res = validate(loadAll());
  console.log(JSON.stringify(res.counts));
  if (res.errors.length) { console.log(res.errors.slice(0, 80).join('\n')); console.log(res.errors.length + ' error(s)'); process.exit(1); }
  console.log('OK');
}
