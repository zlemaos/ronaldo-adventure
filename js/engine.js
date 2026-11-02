/* Core game engine: pure logic, no DOM. Runs in the browser (classic script) and in Node tests.
 * Depends on: data/constants.js, data/*.js packs, js/rng.js, js/text.js. */
(function (G) {
  var RA = G.RA = G.RA || {};
  var C = RA.C, R = RA.RNG, T = RA.Text;
  var E = RA.Engine = RA.Engine || {};

  var BIRTH_YEAR = 1985;
  var AP_PER_YEAR = 3;
  var MAX_LOG = 1200;

  // ---------------------------------------------------------------- helpers
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function country(s) { return RA.data.countries[s.country]; }
  function wage(s) { return country(s).wage; }
  function careerById(id) { return E.careerIndex()[id]; }
  E.clamp = clamp;
  E.country = country;
  E.BIRTH_YEAR = BIRTH_YEAR;

  var _careerIndex = null, _eventIndex = null;
  E.careerIndex = function () {
    if (!_careerIndex || _careerIndex._n !== RA.data.careers.length) {
      _careerIndex = { _n: RA.data.careers.length };
      RA.data.careers.forEach(function (k) { _careerIndex[k.id] = k; });
    }
    return _careerIndex;
  };
  E.allEvents = function () { return (RA.data.events || []).concat(E.SYS_EVENTS || []); };
  E.eventIndex = function () {
    var all = E.allEvents();
    if (!_eventIndex || _eventIndex._n !== all.length) {
      _eventIndex = { _n: all.length };
      all.forEach(function (e) { _eventIndex[e.id] = e; });
    }
    return _eventIndex;
  };
  E.resetCaches = function () { _careerIndex = null; _eventIndex = null; };

  function rnd(s) { return R.next(s.rng); }
  function rint(s, a, b) { return R.int(s.rng, a, b); }
  function chance(s, p) { return R.chance(s.rng, p); }
  function pick(s, arr) { return R.pick(s.rng, arr); }
  E.rnd = rnd; E.rint = rint; E.chance = chance; E.pick = pick;

  function degreeRank(d) { return C.DEGREES.indexOf(d || 'none'); }
  E.degreeRank = degreeRank;

  function fullName(c, surname, given) {
    if (!surname) return given;
    if (c.nameOrder === 'surname-first') {
      // Korean/Chinese/Japanese style: no space for Korean-like 1-2 syllable surnames
      return surname.length <= 2 && /[가-힣]/.test(surname) && /[가-힣]/.test(given) ? surname + given : surname + ' ' + given;
    }
    return given + ' ' + surname;
  }
  E.fullName = fullName;
  E.heroName = function (s) { return C.HERO_NAME; };
  // UI cue for a big triumph (goal, trophy, promotion, big win). Presentation only: never affects outcomes.
  E.triumph = function (s, why) { if (s && s.y) s.y.triumph = why || true; };

  // ---------------------------------------------------------------- people
  function addPerson(s, p) {
    p.id = s.nextPid++;
    if (p.alive == null) p.alive = true;
    if (p.rel == null) p.rel = 60;
    s.people.push(p);
    return p;
  }
  function person(s, key) {
    var ps = s.people, i;
    if (key === 'friend') { for (i = 0; i < ps.length; i++) if (ps[i].id === s.bestFriend && ps[i].alive) return ps[i]; return null; }
    if (key === 'child') { for (i = 0; i < ps.length; i++) if (ps[i].role === 'child' && ps[i].alive) return ps[i]; return null; }
    if (key === 'bro' || key === 'sis1' || key === 'sis2') { for (i = 0; i < ps.length; i++) if (ps[i].key === key) return ps[i]; return null; }
    if (key === 'father' || key === 'mother') { for (i = 0; i < ps.length; i++) if (ps[i].role === key) return ps[i]; return null; }
    for (i = 0; i < ps.length; i++) if (ps[i].role === key && ps[i].alive) return ps[i];
    return null;
  }
  function peopleByRel(s, key) {
    switch (key) {
      case 'siblings': return s.people.filter(function (p) { return p.role === 'sibling' && p.alive; });
      case 'children': return s.people.filter(function (p) { return p.role === 'child' && p.alive; });
      case 'family': return s.people.filter(function (p) { return ['father', 'mother', 'sibling', 'spouse', 'child'].indexOf(p.role) >= 0 && p.alive; });
      default: var p = person(s, key); return p && p.alive ? [p] : [];
    }
  }
  E.person = person; E.peopleByRel = peopleByRel; E.addPerson = addPerson;

  function randomName(s, gender) {
    var c = country(s);
    var given = pick(s, c.names[gender === 'f' ? 'f' : 'm']);
    var sur = pick(s, c.names.surnames);
    return fullName(c, sur, given);
  }
  E.randomName = randomName;
  // A name whose given part is not already used by anyone in the hero's life (avoids confusing namesakes)
  E.freshName = function (s, gender) {
    var c = country(s);
    var used = s.people.map(function (p) { return displayName(s, p); }).concat([s.hero.given]);
    var pool = c.names[gender === 'f' ? 'f' : 'm'].filter(function (n) { return used.indexOf(n) < 0; });
    if (!pool.length) return randomName(s, gender); // a very sociable life ran out of distinct names
    return fullName(c, pick(s, c.names.surnames), pick(s, pool));
  };


  // ---------------------------------------------------------------- new game
  E.newGame = function (opts) {
    opts = opts || {};
    var cid = opts.country || 'pt';
    var c = RA.data.countries[cid];
    if (!c) throw new Error('unknown country ' + cid);
    var seed = opts.seed != null && String(opts.seed).trim() ? String(opts.seed).trim() : R.randomSeedString();
    var s = {
      saveVersion: C.SAVE_VERSION,
      seed: seed, rng: R.create(seed + '|' + cid + '|' + (opts.generation || 1)),
      country: cid, generation: opts.generation || 1,
      birthYear: opts.birthYear || BIRTH_YEAR, age: 0, year: 0, alive: true, cause: null,
      hero: {
        given: C.HERO_NAME,                       // always 호날두
        surname: opts.surname != null ? opts.surname : (c.hero.surname || ''),
        nick: C.HERO_NAME,
        gender: opts.gender || 'm', hair: 0, skin: 0
      },
      stats: {}, money: 0, flags: {}, cd: {}, fired: {}, log: [], people: [], nextPid: 1,
      bestFriend: null,
      edu: { stage: 'none', degree: 'none', major: null, univ: null, univYears: 0, grades: 50, examScore: null },
      job: null, jobHistory: [], retiredFromWork: false, pension: 0,
      fb: {
        stage: 'none', club: null, apps: 0, goals: 0, caps: 0, natGoals: 0, injury: 0, seasons: 0,
        trophies: { league: 0, cup: 0, cont: 0, natCup: 0, wc: 0, ballon: 0 }, clubs: [],
        talent: 0, abroadClub: null, bestSeason: 0
      },
      achievements: {}, pending: [], queue: [], ap: AP_PER_YEAR, jail: 0, sick: null,
      y: {}, hist: [], legacy: opts.legacy || null,
      prenatal: null, eduFocus: null, eduFocusChanged: false, cards: [],
      traits: { mischief: 0, rep: 50, gamble: 0, alcohol: 0, record: 0 }, dec: {}, gambleLog: { plays: 0, wins: 0, net: 0 }
    };
    s.year = s.birthYear;
    s.hero.skin = rint(s, 0, (c.skin || [1]).length - 1);
    s.hero.hair = rint(s, 0, 2);
    var st = s.stats;
    st.health = rint(s, 75, 95); st.happy = rint(s, 65, 90); st.smarts = rint(s, 15, 40);
    st.looks = rint(s, 35, 80); st.football = rint(s, 2, 8); st.grit = rint(s, 25, 50); st.fame = 0;
    st.social = rint(s, 25, 45);
    s.fb.talent = rint(s, 55, 100);
    s.fb.abroadClub = pick(s, E.ABROAD_CLUBS);
    s.money = opts.inheritMoney || 0;

    if (opts.parentState) E.buildHeirFamily(s, opts);
    else buildCanonFamily(s, c);
    s.age = opts.parentState ? Math.max(1, opts.startAge || 1) : 0;
    s.year = s.birthYear + s.age;
    s.people.forEach(function (p) { if (p.bornAt != null) p.age = s.age - p.bornAt; });
    // a new life starts before birth with the one prenatal pick (태교); heirs start at their current age
    if (!opts.parentState) s.queue.push('sys_prenatal');
    else if (s.age >= 1 && s.age <= 6) E.queueSys(s, 'sys_edu_focus');
    E.updateEducation(s, true);
    return s;
  };

  function buildCanonFamily(s, c) {
    var f = c.family;
    var dadAge = rint(s, 30, 34), momAge = rint(s, 29, 32);
    addPerson(s, { role: 'father', key: 'father', name: f.father.name, gender: 'm', bornAt: -dadAge, rel: rint(s, 65, 85), recovery: 0, liver: rint(s, 60, 74) });
    addPerson(s, { role: 'mother', key: 'mother', name: f.mother.name, gender: 'f', bornAt: -momAge, rel: rint(s, 80, 95) });
    f.siblings.forEach(function (sb) {
      addPerson(s, { role: 'sibling', key: sb.key, name: sb.name, gender: sb.gender, bornAt: -sb.gap, rel: rint(s, 55, 85) });
    });
  }

  // ---------------------------------------------------------------- template vars
  function vars(s) {
    var c = country(s), v = {};
    v.name = s.hero.given; v.nick = s.hero.nick;
    v.father = displayName(s, person(s, 'father')) || '아버지'; v.mother = displayName(s, person(s, 'mother')) || '어머니';
    v.bro = displayName(s, person(s, 'bro')) || '형'; v.sis1 = displayName(s, person(s, 'sis1')) || '누나'; v.sis2 = displayName(s, person(s, 'sis2')) || '작은누나';
    v.friend = displayName(s, person(s, 'friend')) || '친구';
    v.partner = displayName(s, person(s, 'partner')) || '연인';
    v.spouse = displayName(s, person(s, 'spouse')) || '배우자';
    v.child = displayName(s, person(s, 'child')) || '아이';
    v.coach = displayName(s, person(s, 'coach')) || '코치님';
    v.city = s.flags.moved_alone && s.age < 40 ? c.places.bigcity : (s.flags.abroad ? s.abroadCity || '외국 도시' : c.places.city);
    v.hometown = c.places.hometown; v.region = c.places.region; v.bigcity = c.places.bigcity; v.capital = c.places.capital;
    v.house = c.places.homeShort || c.places.house;
    v.houseLong = c.places.house;
    var sibs = peopleByRel(s, 'siblings');
    v.siblings = sibs.length ? T.joinNames(sibs.map(function (p) { return displayName(s, p); })) : '형제들';
    v.siblingsAll = T.countWord(sibs.length + 1);
    v.localClub = c.clubs.local; v.regionalClub = c.clubs.regional; v.academy = c.clubs.academy; v.bigClub = c.clubs.big;
    v.rivalClub = c.clubs.rival; v.league = c.clubs.league; v.nationalTeam = c.nationalTeam;
    v.abroadClub = s.fb.abroadClub;
    var dayIdx = (s.age * 7 + s.year) % c.foods.length;
    v.food = c.foods[dayIdx]; v.food2 = c.foods[(dayIdx + 2) % c.foods.length];
    v.holiday = c.holidays[s.age % c.holidays.length]; v.holiday2 = c.holidays[(s.age + 1) % c.holidays.length];
    var st = c.school[s.edu.stage];
    v.school = st && st.school ? st.school : (s.edu.univ || c.school.high.school);
    v.exam = c.school.exam.name;
    v.univ = s.edu.univ || c.school.univMid;
    v.job = s.job ? E.jobTitle(s) : '백수';
    v.fatherJob = c.family.father.job; v.fatherJob2 = c.family.father.job2; v.motherJob = c.family.mother.job;
    v.currency = c.currency.unit; v.leader = c.leader; v.country = c.name; v.sportsClub = c.school.sportsClub;
    return v;
  }
  function displayName(s, p) {
    if (!p) return null;
    // Family members are addressed by given name within the family (more natural in Korean text)
    var c = country(s), parts = p.name.split(' ');
    if (p.role === 'father' || p.role === 'mother') return p.name;
    if (c.nameOrder === 'surname-first') {
      if (parts.length > 1) return parts.slice(1).join(' ');
      // Hangul name without space: drop 1-syllable surname
      return p.name.length >= 3 ? p.name.slice(1) : p.name;
    }
    return parts[0];
  }
  E.vars = vars;
  E.render = function (s, text) { return T.fixJosa(T.render(text, vars(s))); };
  E.displayName = displayName;

  // ---------------------------------------------------------------- log
  function addLog(s, text, kind, extra) {
    var e = { age: s.age, year: s.year, t: T.fixJosa(text), k: kind || 'info' };
    s.seq = (s.seq || 0) + 1; e.n = s.seq;            // monotonic sequence number (audits)
    if (s.jail > 0) e.j = 1;                           // written while in prison
    if (extra) for (var x in extra) if (extra[x] != null) e[x] = extra[x];
    if (e.j === 0) delete e.j;
    s.log.push(e);
    if (s.log.length > MAX_LOG) s.log.splice(0, s.log.length - MAX_LOG);
  }
  E.addLog = addLog;

  // ---------------------------------------------------------------- stats & effects
  // Soft cap: gains shrink as a stat approaches 100 (fractions carry over between calls).
  // Football has its own talent cap and fame is driven by events, so both grow linearly.
  function addStat(s, k, d) {
    if (k === 'money') { s.money += d; return; }
    var v = s.stats[k] || 0;
    if (d > 0 && k !== 'football' && k !== 'fame') {
      d *= clamp((104 - v) / 55, 0.08, 1);
      s.frac = s.frac || {};
      var acc = (s.frac[k] || 0) + d, whole = Math.floor(acc);
      s.frac[k] = acc - whole; d = whole;
    }
    s.stats[k] = clamp(Math.round(v + d), 0, 100);
  }
  E.addStat = addStat;
  E.CAP_NOTE_FROM = 80; // gains shrink as a stat gets high; from here on the UI says so

  function changeRel(s, key, d) {
    peopleByRel(s, key).forEach(function (p) { p.rel = clamp(Math.round(p.rel + d), 0, 100); });
  }

  // Apply a declarative effects object. Returns a list of human-readable changes.
  function applyEffects(s, eff, out) {
    out = out || [];
    if (!eff) return out;
    C.STATS.forEach(function (k) {
      if (typeof eff[k] === 'number' && eff[k] !== 0) {
        var before = s.stats[k]; addStat(s, k, eff[k]);
        var d = s.stats[k] - before;
        // a gain reduced near the top of the scale is reported as such (UI: "❤️ 최대" / "+1 (최대 근접)")
        var capped = eff[k] > 0 && d < eff[k] && s.stats[k] >= E.CAP_NOTE_FROM;
        if (d || capped) out.push(capped ? { k: k, d: d, want: eff[k], max: s.stats[k] >= 100 } : { k: k, d: d });
      }
    });
    C.TRAITS.forEach(function (k) {
      if (typeof eff[k] === 'number' && eff[k] !== 0) {
        var before = s.traits[k] || 0;
        s.traits[k] = clamp(Math.round(before + eff[k]), 0, k === 'record' ? 99 : 100);
        var d = s.traits[k] - before;
        if (d) out.push({ k: k, d: d });
      }
    });
    if (eff.alcohol > 0) s.y.drank = true;
    if (eff.mischief || eff.gamble || eff.alcohol || eff.record) E.traitUnlocks(s);
    if (typeof eff.money === 'number' && eff.money !== 0) {
      var m = Math.round(eff.money * wage(s));
      s.money += m; out.push({ k: 'money', d: m });
    }
    if (eff.rel) Object.keys(eff.rel).forEach(function (r) { changeRel(s, r, eff.rel[r]); out.push({ k: 'rel', who: r, d: eff.rel[r] }); });
    (eff.flags || []).forEach(function (f) { s.flags[f] = s.age || 1; });
    (eff.unflags || []).forEach(function (f) { delete s.flags[f]; });
    var fx = eff.fx ? (Array.isArray(eff.fx) ? eff.fx : [eff.fx]) : [];
    fx.forEach(function (name) {
      var fn = E.FX[name];
      if (!fn) throw new Error('unknown fx ' + name);
      var msg = fn(s);
      if (msg) out.push({ k: 'msg', t: T.fixJosa(msg) });
    });
    if (eff.achieve) E.unlock(s, eff.achieve);
    return out;
  }
  E.applyEffects = applyEffects;

  // ---------------------------------------------------------------- conditions
  function inRange(v, r) { return !r || (v >= r[0] && v <= r[1]); }
  function hasFlags(s, list) {
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      if (f.charAt(0) === '!') { if (s.flags[f.slice(1)]) return false; }
      else if (!s.flags[f]) return false;
    }
    return true;
  }
  E.hasFlags = hasFlags;

  function relState(s, key) {
    if (key === 'children') return peopleByRel(s, 'children').length ? 'yes' : 'no';
    var p = person(s, key);
    if (!p) return 'none';
    return p.alive ? 'alive' : 'dead';
  }

  E.condMatches = function (s, cond) {
    if (!cond) return true;
    var k;
    if (cond.stats) for (k in cond.stats) if (!inRange(s.stats[k], cond.stats[k])) return false;
    if (cond.money && !inRange(s.money / wage(s), cond.money)) return false;
    if (cond.flags && !hasFlags(s, cond.flags)) return false;
    if (cond.fb && cond.fb.indexOf(s.fb.stage) < 0) return false;
    if (cond.edu && cond.edu.indexOf(s.edu.stage) < 0) return false;
    if (cond.degree && degreeRank(s.edu.degree) < degreeRank(cond.degree)) return false;
    if (cond.career) {
      if (cond.career === 'any') { if (!s.job) return false; }
      else if (cond.career === 'none') { if (s.job) return false; }
      else if (!s.job || cond.career.indexOf(s.job.id) < 0) return false;
    }
    if (cond.sector) { if (!s.job || cond.sector.indexOf(careerById(s.job.id).sector) < 0) return false; }
    if (cond.level) { if (!s.job || !inRange(s.job.level, cond.level)) return false; }
    if (cond.gender && s.hero.gender !== cond.gender) return false;
    if (cond.traits) for (k in cond.traits) if (!inRange((s.traits || {})[k] || 0, cond.traits[k])) return false;
    if (cond.jailed && !(s.jail > 0)) return false;
    // recent: { flag: maxYears } — the flag was set no more than maxYears ago (e.g. first holiday after a death)
    if (cond.recent) for (k in cond.recent) { if (!s.flags[k] || s.age - s.flags[k] > cond.recent[k]) return false; }
    // family: 'all' — both parents and all three siblings still alive (present-tense "여섯 식구" texts)
    if (cond.family === 'all') {
      var fam = s.people.filter(function (p) { return p.role === 'father' || p.role === 'mother' || p.role === 'sibling'; });
      if (fam.length < 5 || fam.some(function (p) { return !p.alive; })) return false;
    }
    if (cond.rel) for (k in cond.rel) {
      var want = cond.rel[k], st = relState(s, k);
      if (want === 'alive' || want === 'yes') { if (st !== 'alive' && st !== 'yes') return false; }
      else if (want === 'dead') { if (st !== 'dead') return false; }
      else if (want === 'no') { if (st === 'alive' || st === 'yes') return false; }
    }
    return true;
  };

  // ---------------------------------------------------------------- person gating
  // Every event that names a person (via tokens, or plainly as 아버지/어머니) is only eligible while that
  // person is alive and present. Events can opt in to referencing the dead with `memorial: true` or
  // `memorial: ['father']`; conditions such as rel.father 'dead' or the flag father_dead imply it.
  var PERSON_TOKENS = ['father', 'mother', 'bro', 'sis1', 'sis2', 'spouse', 'partner', 'friend', 'coach', 'child', 'siblings', 'siblingsAll'];
  var TOKEN_RE = /\{([a-zA-Z0-9]+)\}/g;
  // Recurring events may vary their wording: textVariants/logVariants are used in turn (1st, 2nd, 3rd time…)
  function variant(s, ev, list, base) {
    if (!list || !list.length) return base;
    var n = Math.max(1, s.fired[ev.id] || 1);
    return list[(n - 1) % list.length];
  }
  E.eventText = function (s, ev) { return ev.textFn ? ev.textFn(s) : variant(s, ev, ev.textVariants, ev.text); };
  E.eventLog = function (s, ev) { return variant(s, ev, ev.logVariants, ev.log); };
  function eventTexts(ev) {
    var out = [ev.text, ev.log].concat(ev.textVariants || [], ev.logVariants || []);
    (ev.choices || []).forEach(function (ch) {
      out.push(ch.text, ch.log);
      if (ch.success) out.push(ch.success.log);
      if (ch.fail) out.push(ch.fail.log);
      out = out.concat(ch.logVariants || []);
    });
    return out.filter(Boolean);
  }
  E.eventRefs = function (ev) {
    if (ev._refs) return ev._refs;
    var refs = {}, m;
    eventTexts(ev).forEach(function (t) {
      TOKEN_RE.lastIndex = 0;
      while ((m = TOKEN_RE.exec(t))) if (PERSON_TOKENS.indexOf(m[1]) >= 0) refs[m[1] === 'siblingsAll' ? 'siblings' : m[1]] = 1;
      // plain words for the hero's own parents (grand-/in-law words removed first)
      var plain = t.replace(/할아버지|시아버지|외할아버지|장인|할머니|시어머니|장모|친구 (아버지|어머니|엄마|아빠)|아이 (엄마|아빠)/g, '');
      var aboutOwnKids = ev.cond && ev.cond.rel && (ev.cond.rel.children || ev.cond.rel.child);
      if (!aboutOwnKids) {
        if (/아버지|아빠/.test(plain)) refs.father = 1;
        if (/어머니|엄마/.test(plain)) refs.mother = 1;
      }
    });
    var mem = {};
    if (ev.memorial === true) PERSON_TOKENS.forEach(function (k) { mem[k] = 1; });
    else (ev.memorial || []).forEach(function (k) { mem[k] = 1; });
    var c = ev.cond || {};
    if (c.rel) Object.keys(c.rel).forEach(function (k) { if (c.rel[k] === 'dead') mem[k] = 1; });
    (c.flags || []).forEach(function (f) { if (f === 'father_dead') mem.father = 1; if (f === 'mother_dead') mem.mother = 1; });
    if (c.recent) Object.keys(c.recent).forEach(function (f) { if (f === 'father_dead') mem.father = 1; if (f === 'mother_dead') mem.mother = 1; });
    ev._refs = { refs: refs, mem: mem, isMemorial: Object.keys(mem).length > 0 };
    return ev._refs;
  };
  function personPresent(s, who) {
    if (who === 'siblings') return peopleByRel(s, 'siblings').length > 0;
    if (who === 'friend' || who === 'coach') {
      // generic fallback words are fine when nobody holds the role; a dead holder is never named
      return true;
    }
    var p = person(s, who);
    return !!(p && p.alive);
  }
  E.personsOk = function (s, ev) {
    var r = E.eventRefs(ev);
    for (var who in r.refs) if (!r.mem[who] && !personPresent(s, who)) return false;
    return true;
  };
  // Events allowed while the hero is in prison
  E.jailOk = function (ev) {
    return !!(ev && (ev.jailOk || ev.anyState || (ev.cond && ev.cond.jailed) || (ev.cond && ev.cond.flags && ev.cond.flags.indexOf('jailed') >= 0)));
  };
  function dropJailBlocked(s) {
    if (s.jail > 0) s.queue = s.queue.filter(function (id) { return E.jailOk(E.eventIndex()[id]); });
  }
  E.dropJailBlocked = dropJailBlocked;

  E.eventMatches = function (s, ev) {
    if (!s.alive) return false;
    if (ev.cond && ev.cond.jailed && !(s.jail > 0)) return false;
    var age = ev.age || [1, 120];
    if (s.age < age[0] || s.age > age[1]) return false;
    if (ev.countries && ev.countries.indexOf(s.country) < 0) return false;
    if (ev.once && s.fired[ev.id]) return false;
    if (ev.maxTimes && (s.fired[ev.id] || 0) >= ev.maxTimes) return false;
    var cd = ev.cooldown != null ? ev.cooldown : 6;
    if (s.cd[ev.id] != null && s.age - s.cd[ev.id] < cd) return false;
    // While in prison only prison-aware events can fire
    if (s.jail > 0 && !E.jailOk(ev)) return false;
    if (!E.condMatches(s, ev.cond)) return false;
    if (!E.personsOk(s, ev)) return false;
    if (ev.when && !ev.when(s)) return false;
    return true;
  };

  // ---------------------------------------------------------------- event categories
  // Every event card shows a category icon, colour and label so it can be read at a glance.
  E.CATEGORIES = {
    pick: { label: '선택', icon: '✨', color: '#f5c518', pic: 'pick' },
    memorial: { label: '추모', icon: '🕯️', color: '#9aa3b5', pic: 'memorial' },
    crime: { label: '범죄·사건', icon: '🚨', color: '#ff5470', pic: 'crime' },
    football: { label: '축구', icon: '⚽', color: '#2fd171', pic: 'football' },
    work: { label: '일', icon: '💼', color: '#60a5fa', pic: 'work' },
    school: { label: '학교', icon: '📚', color: '#a78bfa', pic: 'school' },
    love: { label: '사랑', icon: '💘', color: '#f472b6', pic: 'love' },
    family: { label: '가족', icon: '🏠', color: '#f5a524', pic: 'family' },
    health: { label: '건강', icon: '🏥', color: '#ff8a65', pic: 'health' },
    money: { label: '돈', icon: '💰', color: '#34d399', pic: 'money' },
    social: { label: '친구·관계', icon: '🤝', color: '#14b8a6', pic: 'social' },
    gamble: { label: '도박', icon: '🎲', color: '#e879f9', pic: 'gamble' },
    mischief: { label: '악동', icon: '😈', color: '#fb923c', pic: 'mischief' },
    career: { label: '진로', icon: '🧭', color: '#facc15', pic: 'career' },
    country: { label: '고향·명절', icon: '🎉', color: '#38bdf8', pic: 'country' },
    life: { label: '일상', icon: '🌱', color: '#8e9ac0', pic: 'life' }
  };
  E.eventCategory = function (ev) {
    if (!ev) return E.CATEGORIES.life;
    if (ev._cat) return E.CATEGORIES[ev._cat];
    var id = ev.id || '', c = ev.cond || {}, k = 'life';
    var refs = E.eventRefs(ev);
    var fbCanon = /^canon_(join|regional|academy|first_night|accent|warning|homesick|work_ethic|youth|pro|late|kitroom)/.test(id);
    if (ev.pick || /^sys_(prenatal|edu|exam|major|grad|phd|retire)/.test(id)) k = 'pick';
    else if (/^gam_/.test(id) || (ev.choices || []).some(function (ch) { return ch.bet; })) k = 'gamble';
    else if (/^path_/.test(id)) k = 'career';
    else if (/^mis_/.test(id)) k = 'mischief';
    else if (refs.isMemorial || id === 'sys_grief') k = 'memorial';
    else if ((c.flags || []).indexOf('jailed') >= 0 || (c.sector || []).indexOf('crime') >= 0 || /crime|fraud|shoplift|theft|steal|jail|prison|police_raid|loan_shark/.test(id)) k = 'crime';
    else if (/^fb_/.test(id) || fbCanon || c.fb) k = 'football';
    else if (c.sector || c.career || c.level || /^car_/.test(id)) k = 'work';
    else if (/heart|hospital|sick|health|checkup|ill|injur|smok|drink/.test(id) || (c.stats && c.stats.health)) k = 'health';
    else if (c.edu || /school|exam|class|teacher|study|univ|homework/.test(id)) k = 'school';
    else if ((c.rel && (c.rel.partner || c.rel.spouse)) || /love|date|crush|wedding|propos|romance|marri/.test(id) || refs.refs.partner || refs.refs.spouse) k = 'love';
    else if (/^soc_/.test(id) || (c.stats && c.stats.social) || refs.refs.friend) k = 'social';
    else if (c.money || /money|lotter|invest|debt|wallet|crypto|bubble|loan|salary/.test(id)) k = 'money';
    else if (refs.refs.father || refs.refs.mother || refs.refs.bro || refs.refs.sis1 || refs.refs.sis2 || refs.refs.siblings || refs.refs.child || /^canon_/.test(id)) k = 'family';
    else if (ev.countries) k = 'country';
    ev._cat = k;
    return E.CATEGORIES[k];
  };

  // ---------------------------------------------------------------- event presentation
  E.choiceAvailable = function (s, ch) {
    if (ch.reqFn && !ch.reqFn(s)) return false;
    if (!ch.req) return true;
    if (ch.req.stats) for (var k in ch.req.stats) if ((s.stats[k] || 0) < ch.req.stats[k]) return false;
    if (ch.req.money != null && s.money / wage(s) < ch.req.money) return false;
    if (ch.req.flags && !hasFlags(s, ch.req.flags)) return false;
    return true;
  };

  function eventChoices(s, ev) { return ev.choicesFn ? ev.choicesFn(s) : (ev.choices || []); }

  // Current pending modal event, rendered for the UI.
  E.currentEvent = function (s) {
    if (!s.queue.length) return null;
    var ev = E.eventIndex()[s.queue[0]];
    if (!ev || (s.jail > 0 && !E.jailOk(ev)) || (!ev.manual && !E.personsOk(s, ev))) { s.queue.shift(); return E.currentEvent(s); }
    var text = E.eventText(s, ev);
    var cat = E.eventCategory(ev);
    return {
      id: ev.id, text: E.render(s, text), scene: ev.scene || E.sceneFor(s, ev), pick: !!ev.pick, pic: ev.pic || null,
      category: { key: ev._cat, label: cat.label, icon: cat.icon, color: cat.color, pic: cat.pic },
      choices: eventChoices(s, ev).map(function (ch, i) {
        var chance = ch.bet ? ch.bet.odds : ch.check ? E.checkChance(s, ch.check) : null;
        return { i: i, text: E.render(s, ch.text), enabled: E.choiceAvailable(s, ch), chance: chance,
          desc: ch.desc ? E.render(s, ch.desc) : null, preview: ch.preview || E.autoPreview(ch), risky: E.isRisky(ch),
          bet: ch.bet ? { odds: ch.bet.odds, mult: ch.bet.mult, stake: E.betStake(s, ch.bet), addict: ch.bet.addict != null ? ch.bet.addict : 3 } : null,
          career: ch.career ? (E.careerIndex()[ch.career] || {}).name : null };
      })
    };
  };

  // A choice is risky when the author marked it, or when it can lead to prison, expulsion, bankruptcy,
  // or builds up 악동 기질 / 도박 / 음주 (used for the ⚠️ badge and the test bots)
  var RISKY_FX = ['jail', 'expel', 'suspend', 'bankrupt', 'deport', 'fbBan', 'divorce', 'scam', 'dropOut'];
  E.isRisky = function (ch) {
    if (ch.risky || ch.bet) return true;
    var bad = function (eff) {
      if (!eff) return false;
      var fx = eff.fx ? (Array.isArray(eff.fx) ? eff.fx : [eff.fx]) : [];
      return fx.some(function (f) { return RISKY_FX.indexOf(f) >= 0; }) || eff.mischief > 0 || eff.gamble > 0 || eff.alcohol > 0 || eff.record > 0;
    };
    if (bad(ch.effects) || bad(ch.success && ch.success.effects) || bad(ch.fail && ch.fail.effects)) return true;
    // a delayed consequence counts too (e.g. lending your bank account → the police knock a year later)
    var sch = ch.schedule || (ch.success && ch.success.schedule) || (ch.fail && ch.fail.schedule);
    var next = sch && E.eventIndex()[sch.id];
    return !!(next && (next.choices || []).some(function (c2) { return bad(c2.effects) || bad(c2.success && c2.success.effects) || bad(c2.fail && c2.fail.effects); }));
  };
  // What a choice touches, for the icon chips shown before deciding (sign only matters for previews)
  E.autoPreview = function (ch) {
    var out = {}, add = function (eff) {
      if (!eff) return;
      C.STATS.concat(C.TRAITS, ['money']).forEach(function (k) { if (typeof eff[k] === 'number' && eff[k] && out[k] == null) out[k] = eff[k]; });
      if (eff.rel && out.rel == null) out.rel = 1;
    };
    if (ch.bet) { out.money = 1; out.gamble = ch.bet.addict != null ? ch.bet.addict : 3; }
    add(ch.effects); if (ch.success) add(ch.success.effects); if (ch.fail) add(ch.fail.effects);
    return Object.keys(out).length ? out : null;
  };
  // Money at stake for a bet (internal money units)
  E.betStake = function (s, bet) {
    var w = wage(s), m = Math.max(0, s.money);
    switch (bet.stake) {
      case 'tiny': return Math.round(5 * w);
      case 'small': return Math.round(Math.max(20 * w, m * 0.02));
      case 'medium': return Math.round(Math.max(200 * w, m * 0.1));
      case 'big': return Math.round(Math.max(1000 * w, m * 0.3));
      case 'all': return Math.round(Math.max(2000 * w, m));
    }
    return Math.round(20 * w);
  };
  E.checkChance = function (s, chk) {
    if (typeof chk.odds === 'number') return chk.odds; // fixed odds (dice, cards, being caught)
    return clamp(0.5 + ((s.stats[chk.stat] || 0) - chk.diff) / 40, chk.min != null ? chk.min : 0.05, chk.max != null ? chk.max : 0.95);
  };

  // Resolve a choice of the current event. Returns {log, changes, outcome}
  E.choose = function (s, idx) {
    var ev = E.eventIndex()[s.queue[0]];
    if (!ev) return null;
    var choices = eventChoices(s, ev);
    var ch = choices[idx];
    if (!ch || !E.choiceAvailable(s, ch)) return null;
    s.queue.shift();
    var mem = E.eventRefs(ev).isMemorial ? { mem: 1, ev: ev.id } : { ev: ev.id };
    mem.j = s.jail > 0 ? 1 : 0; // the outcome of an event that starts a prison term was written outside
    if (!ev.manual || ev.id.indexOf('canon_') === 0 || ev.memorial) addLog(s, E.render(s, E.eventText(s, ev)), 'q', mem);
    var res = { changes: [], outcome: null, log: '', anim: ch.anim || null };
    var branch = ch;
    if (choices.length >= 2) { s.dec = s.dec || {}; s.dec[s.age] = (s.dec[s.age] || 0) + 1; }
    var betNote = '';
    if (ch.bet) {
      var stake = E.betStake(s, ch.bet), won = rnd(s) < ch.bet.odds;
      branch = won ? ch.success : ch.fail;
      res.outcome = won ? 'success' : 'fail';
      var delta = won ? Math.round(stake * (ch.bet.mult - 1)) : (ch.bet.stake === 'tiny' ? 0 : -stake);
      s.money += delta;
      if (delta) res.changes.push({ k: 'money', d: delta });
      var add = (ch.bet.addict != null ? ch.bet.addict : 3) + (won && ch.bet.mult >= 3 ? 5 : 0);
      applyEffects(s, { gamble: add }, res.changes);
      s.gambleLog = s.gambleLog || { plays: 0, wins: 0, net: 0 };
      s.gambleLog.plays++; if (won) s.gambleLog.wins++; s.gambleLog.net += delta;
      s.y.bets = (s.y.bets || 0) + 1;
      if (won && ch.bet.mult >= 3) E.triumph(s, 'jackpot');
      betNote = delta ? ' (' + (delta > 0 ? '+' : '') + T.money(delta, country(s)) + ')' : '';
    } else if (ch.check) {
      var ok = rnd(s) < E.checkChance(s, ch.check);
      branch = ok ? ch.success : ch.fail;
      res.outcome = ok ? 'success' : 'fail';
    }
    applyEffects(s, branch.effects, res.changes);
    if (ch.career && E.careerIndex()[ch.career] && s.jail === 0) {
      var kc = E.careerIndex()[ch.career];
      if (!s.job || s.job.id !== ch.career) {
        E.startJob(s, ch.career, 0);
        res.changes.push({ k: 'msg', t: kc.name + '(으)로 새 길을 시작했다. 첫 직함은 "' + E.ladderTitle(s, kc, 0) + '".' });
      }
    }
    if (res.outcome !== 'fail' && branch.effects && (branch.effects.fame || 0) >= 3 && E.eventCategory(ev).key === 'football') E.triumph(s, 'goal');
    var log = variant(s, ev, branch.logVariants, branch.log);
    if (branch.run) log = branch.run(s, res) || log;
    var sch = branch.schedule || ch.schedule;
    if (sch) s.pending.push({ age: s.age + (sch.years || 1), id: sch.id });
    res.log = E.render(s, log || '') + betNote;
    mem.chg = compactChanges(res.changes);
    res.category = E.eventCategory(ev);
    if (res.log) addLog(s, res.log, res.outcome === 'fail' ? 'bad' : res.outcome === 'success' ? 'good' : 'event', mem);
    res.changes.forEach(function (c) { if (c.k === 'msg') addLog(s, c.t, 'info'); });
    dropJailBlocked(s);
    E.checkAchievements(s);
    E.checkDeath(s, true);
    return res;
  };

  function fireEvent(s, ev) {
    s.fired[ev.id] = (s.fired[ev.id] || 0) + 1;
    s.cd[ev.id] = s.age;
    if (ev.choices || ev.choicesFn) { s.queue.push(ev.id); return; }
    // choiceless: apply now, log it
    var wasJailed = s.jail > 0 ? 1 : 0;
    var changes = applyEffects(s, ev.effects, []);
    var text = E.eventText(s, ev), evLog = E.eventLog(s, ev);
    var log = ev.run ? ev.run(s) : null;
    addLog(s, E.render(s, text) + (evLog ? ' ' + E.render(s, evLog) : '') + (log ? ' ' + log : ''), ev.kind || 'event', { mem: E.eventRefs(ev).isMemorial ? 1 : null, ev: ev.id, j: wasJailed, chg: compactChanges(changes) });
    changes.forEach(function (c) { if (c.k === 'msg') addLog(s, c.t, 'info'); });
  }
  E.fireEvent = fireEvent;

  // Queue an engine-triggered event (marks it fired; optional cooldown in years)
  E.queueSys = function (s, id, cooldown) {
    if (s.queue.indexOf(id) >= 0) return false;
    if (cooldown != null && s.cd[id] != null && s.age - s.cd[id] < cooldown) return false;
    s.fired[id] = (s.fired[id] || 0) + 1; s.cd[id] = s.age;
    s.queue.push(id);
    return true;
  };

  // Choose this year's storylets
  E.selectEvents = function (s) {
    var idx = E.eventIndex(), chosen = [], used = {};
    // 1) delayed consequences that are due
    var due = s.pending.filter(function (p) { return p.age <= s.age; });
    s.pending = s.pending.filter(function (p) { return p.age > s.age; });
    due.forEach(function (p) {
      var ev = idx[p.id];
      if (ev && !used[ev.id] && s.alive) {
        var ageOk = true; // scheduled follow-ups ignore age windows/cooldowns but respect cond
        if (ev.once && s.fired[ev.id]) return;                                  // once-per-life holds for follow-ups too
        if (ev.maxTimes && (s.fired[ev.id] || 0) >= ev.maxTimes) return;
        if (s.jail > 0 && !E.jailOk(ev)) { s.pending.push({ age: s.age + s.jail + 1, id: p.id }); return; } // wait until release
        if (E.condMatches(s, ev.cond) && E.personsOk(s, ev) && (!ev.when || ev.when(s)) && ageOk) { chosen.push(ev); used[ev.id] = 1; }
      }
    });
    var all = E.allEvents();
    var eligible = all.filter(function (ev) { return !used[ev.id] && E.eventMatches(s, ev); });
    // 2) canon / priority milestones
    eligible.filter(function (ev) { return ev.priority; }).slice(0, 2).forEach(function (ev) { chosen.push(ev); used[ev.id] = 1; });
    // 3) random storylets
    var pool = eligible.filter(function (ev) { return !ev.priority && !used[ev.id] && !ev.manual; });
    var n = s.age < 3 ? 1 : (rnd(s) < 0.55 ? 2 : 1);
    if (s.age >= 14 && s.age < 70 && rnd(s) < 0.2) n++;
    if (s.y.bereaved) n = 0; // a year of mourning: no cheerful random storylets
    n = Math.max(0, Math.min(n, 4 - chosen.length));
    for (var i = 0; i < n && pool.length; i++) {
      var ev = R.weighted(s.rng, pool, function (e) {
        var w = e.weight != null ? e.weight : 10;
        if (e.countries) w *= 1.6;
        if (e.cond && (e.cond.sector || e.cond.career)) w *= 1.3;
        if (e.once) w *= 1.2;
        return w * E.habitWeight(s, e);
      });
      if (!ev) break;
      chosen.push(ev); used[ev.id] = 1;
      pool = pool.filter(function (e) { return e !== ev; });
    }
    chosen.forEach(function (ev) { fireEvent(s, ev); });
    // 4) "올해의 결정": make sure the year asks for enough real decisions
    var target = E.decisionTarget(s);
    var extra = eligible.filter(function (ev) { return !used[ev.id] && !ev.priority && !ev.manual && (ev.choices || ev.choicesFn) && (ev.choices || []).length >= 2; });
    while (s.queue.length < target && extra.length) {
      var d = R.weighted(s.rng, extra, function (e) { return (e.decision ? 30 : 6) * (e.weight != null ? Math.max(0.2, e.weight / 10) : 1) * E.habitWeight(s, e); });
      if (!d) break;
      extra = extra.filter(function (e) { return e !== d; });
      used[d.id] = 1; chosen.push(d);
      s.y.yearDecision = s.y.yearDecision || d.id;
      fireEvent(s, d);
    }
    return chosen.map(function (e) { return e.id; });
  };
  // A habit pulls its temptations closer: gambling events come more often the deeper the addiction
  E.habitWeight = function (s, ev) {
    if (ev._bet == null) ev._bet = (ev.choices || []).some(function (c) { return !!c.bet; }) || /^gam_/.test(ev.id || '');
    var g = (s.traits || {}).gamble || 0;
    return ev._bet && g > 0 ? 1 + g / 8 : 1;
  };
  // decisions wanted per year: ages 5-12: 1, teens: 2-3, adults: 1-2
  E.decisionTarget = function (s) {
    if (E.isMontage(s)) return 0;
    if (s.age <= 12) return 1;
    if (s.age <= 19) return rnd(s) < 0.35 ? 3 : 2;
    if (s.age <= 64) return rnd(s) < 0.4 ? 2 : 1;
    return 1;
  };

  // ---------------------------------------------------------------- education
  E.updateEducation = function (s, silent) {
    var c = country(s), sc = c.school, ed = s.edu, a = s.age;
    if (s.jail > 0) return;
    var stages = ['elem', 'middle', 'high'];
    if (ed.stage === 'univ' || ed.stage === 'grad') return; // handled yearly in progressUniversity
    if (s.flags.dropout) { ed.stage = 'none'; return; }
    for (var i = 0; i < stages.length; i++) {
      var st = sc[stages[i]];
      if (a >= st.from && a <= st.to) {
        if (ed.stage !== stages[i]) {
          ed.stage = stages[i];
          if (!silent) addLog(s, st.school + '(' + st.name + ')에 입학했다.', 'milestone');
        }
        return;
      }
    }
    if (a > sc.high.to && ed.stage === 'high') {
      ed.stage = 'none';
      if (degreeRank(ed.degree) < 1) ed.degree = 'high';
      if (!silent) addLog(s, sc.high.name + T.particle(sc.high.name, '을/를') + ' 졸업했다.', 'milestone');
    } else if (a < sc.elem.from) ed.stage = 'none';
  };

  function progressUniversity(s) {
    var ed = s.edu;
    if (ed.stage !== 'univ' && ed.stage !== 'grad') return;
    ed.univYears++;
    addStat(s, 'smarts', rint(s, 1, 3));
    // tuition (scholarship or abroad changes cost)
    if (!s.flags.scholarship) s.money -= Math.round((ed.univTier === 'abroad' ? 30000 : ed.univTier === 'top' ? 6000 : 4000) * (ed.univTier === 'abroad' ? 1 : wage(s)));
    var need = ed.stage === 'univ' ? (ed.major === 'medicine' ? 6 : 4) : (ed.target === 'phd' ? 4 : 2);
    if (ed.univYears >= need) {
      if (ed.stage === 'univ') {
        ed.degree = 'bachelor'; ed.stage = 'none'; ed.gradAge = s.age;
        addLog(s, ed.univ + ' ' + C.MAJORS[ed.major] + ' 전공으로 졸업했다. 학사모를 던졌다!', 'milestone');
        E.queueSys(s, 'sys_grad');
      } else {
        ed.degree = ed.target; ed.stage = 'none'; ed.gradAge = s.age;
        addLog(s, (ed.target === 'phd' ? '박사' : '석사') + ' 학위를 받았다.', 'milestone');
        if (ed.target === 'master') E.queueSys(s, 'sys_phd');
      }
      ed.univYears = 0;
    }
  }

  // ---------------------------------------------------------------- careers
  E.jobTitle = function (s) {
    if (!s.job) return '무직';
    var k = careerById(s.job.id);
    return E.ladderTitle(s, k, s.job.level) + (k.special === 'football' ? '' : ' (' + k.name + ')');
  };
  // Ladder titles may contain tokens like {leader}; render with a minimal var set (no recursion via vars()).
  E.ladderTitle = function (s, k, level) {
    var c = country(s);
    return T.render(k.ladder[clamp(level, 0, k.ladder.length - 1)], { leader: c.leader, country: c.name, nationalTeam: c.nationalTeam, bigClub: c.clubs.big });
  };

  E.salaryOf = function (s, k, level) {
    var n = k.ladder.length - 1, f = n ? level / n : 0;
    var lo = Math.max(k.salary[0], 1), hi = Math.max(k.salary[1], lo);
    var base = lo * Math.pow(hi / lo, f);
    var w = wage(s);
    if (k.special === 'football') w = s.flags.abroad ? 1 : Math.max(w, 0.35);
    return Math.round(base * w);
  };

  // Requirement check; returns list of unmet reasons (Korean)
  E.jobMissing = function (s, k) {
    var r = k.req || {}, miss = [];
    if (s.age < r.minAge) miss.push(r.minAge + '세 이상');
    if (s.age > r.maxAge) miss.push(r.maxAge + '세 이하');
    if (r.degree && degreeRank(s.edu.degree) < degreeRank(r.degree)) miss.push(C.DEGREE_LABELS[r.degree] + ' 이상');
    if (r.majors && r.majors.length && (degreeRank(s.edu.degree) < 2 || r.majors.indexOf(s.edu.major) < 0)) miss.push('전공: ' + r.majors.map(function (m) { return C.MAJORS[m]; }).join('/'));
    if (r.stats) Object.keys(r.stats).forEach(function (st) { if ((s.stats[st] || 0) < r.stats[st]) miss.push(C.STAT_LABELS[st] + ' ' + r.stats[st] + '+'); });
    if (r.flags && !hasFlags(s, r.flags)) miss.push(r.unlockHint || '특별 조건');
    if (r.traits) Object.keys(r.traits).forEach(function (t) { if (((s.traits || {})[t] || 0) < r.traits[t]) miss.push(r.unlockHint || (C.TRAIT_LABELS[t] + ' ' + r.traits[t] + ' 이상')); });
    if (r.fame && s.stats.fame < r.fame) miss.push('명성 ' + r.fame + '+');
    var school = ['elem', 'middle', 'high', 'univ', 'grad'].indexOf(s.edu.stage) >= 0;
    if (school && k.sector !== 'parttime') miss.push('학업 중');
    if (k.special === 'football') miss.push('유스 아카데미를 거쳐야 함');
    if (s.jail > 0) miss.push('수감 중');
    return miss;
  };

  E.hireChance = function (s, k) {
    var st = s.stats[k.keyStat] || 0;
    var p = 0.95 - (k.difficulty - 1) * 0.16 + (st - 50) / 150 + (s.flags.ever_jailed && k.sector !== 'crime' ? -0.2 : 0);
    return clamp(p, 0.05, 0.95);
  };

  E.jobList = function (s) {
    return RA.data.careers.filter(function (k) {
      var r = k.req || {};
      return k.special !== 'football' && s.age >= r.minAge - 4 && s.age <= r.maxAge;
    }).map(function (k) {
      var miss = E.jobMissing(s, k);
      return { id: k.id, name: k.name, sector: k.sector, desc: k.desc, salary: E.salaryOf(s, k, 0), missing: miss, ok: !miss.length, chance: miss.length ? 0 : E.hireChance(s, k), current: s.job && s.job.id === k.id };
    });
  };

  function startJob(s, id, level) {
    if (s.job) endJob(s, '이직');
    s.job = { id: id, level: level || 0, years: 0, atLevel: 0, perf: 50, since: s.age };
    var k = careerById(id);
    if (k.special === 'religion') s.flags.monk = s.age;
  }
  function endJob(s, why) {
    if (!s.job) return;
    var k = careerById(s.job.id);
    s.jobHistory.push({ id: s.job.id, title: E.ladderTitle(s, k, s.job.level), name: k.name, from: s.job.since, to: s.age, why: why, level: s.job.level, top: s.job.level === k.ladder.length - 1 });
    s.lastSalary = E.salaryOf(s, k, s.job.level);
    s.job = null;
  }
  E.startJob = startJob; E.endJob = endJob;

  E.applyJob = function (s, id) {
    var k = careerById(id);
    if (!k || E.jobMissing(s, k).length) return { ok: false, log: '지원 자격이 없다.' };
    if (s.ap <= 0) return { ok: false, log: '올해는 더 이상 행동할 힘이 없다.' };
    s.ap--;
    if (rnd(s) < E.hireChance(s, k)) {
      startJob(s, id, 0);
      var msg = k.name + '(으)로 취직했다! 첫 직함은 "' + E.ladderTitle(s, k, 0) + '".';
      addLog(s, msg, 'good');
      E.checkAchievements(s);
      return { ok: true, log: T.fixJosa(msg) };
    }
    var no = k.name + ' 면접에서 떨어졌다. "좋은 분이지만 인연이 아닌 것 같습니다."';
    addLog(s, no, 'bad');
    return { ok: false, log: no };
  };

  function yearlyCareer(s) {
    if (!s.job) {
      if (s.retiredFromWork && s.pension) s.money += s.pension;
      return;
    }
    var k = careerById(s.job.id);
    if (k.special === 'football') return; // football module handles pros
    var j = s.job;
    j.years++; j.atLevel++;
    var st = s.stats[k.keyStat] || 0;
    var people = ['service', 'education', 'medical', 'entertainment', 'business', 'government', 'media', 'religion', 'public'].indexOf(k.sector) >= 0;
    j.perf = clamp(j.perf + (st - 55) / 10 + ((s.stats.social || 40) - 50) / (people ? 15 : 40) + (rnd(s) * 10 - 5) + (s.y.workHard ? 8 : 0) - (s.y.slack ? 10 : 0), 0, 100);
    var n = k.ladder.length - 1;
    var gate = j.level < n - 1 || st >= 72; // the top rung needs real excellence
    if (k.special === 'politics' && j.level >= n - 2) gate = gate && s.stats.fame >= 45 && rnd(s) < 0.4; // elections are hard to win
    if (gate && j.perf >= 66 && j.atLevel >= k.promoteYears && j.level < n && rnd(s) < 0.35 + (j.perf - 66) / 60) {
      E.FX.promote(s, true);
    } else if (j.perf <= 12 && rnd(s) < 0.35) {
      addLog(s, '실적 부진으로 ' + k.name + ' 일자리에서 해고됐다.', 'bad');
      endJob(s, '해고'); addStat(s, 'happy', -8);
      return;
    }
    var sal = E.salaryOf(s, k, j.level);
    if (k.special === 'gamble') {
      // a gambler's year swings wildly: from big losses to a fortune, and the habit deepens
      var swing = Math.round(sal * (rnd(s) * 2.8 - 0.9));
      s.money += swing;
      s.traits.gamble = clamp((s.traits.gamble || 0) + 2, 0, 100);
      addLog(s, '🎲 ' + E.jobTitle(s) + '의 한 해: ' + (swing >= 0 ? '+' : '') + T.money(swing, country(s)) + (swing > sal ? ' 대박이 났다!' : swing < 0 ? ' 테이블에서 크게 잃었다.' : ''), swing >= 0 ? 'good' : 'bad');
      if (swing > sal * 1.2) E.triumph(s, 'jackpot');
    } else s.money += Math.round(sal * 0.78);
    s.y.income = (s.y.income || 0) + Math.max(0, sal);
    addStat(s, 'happy', -(k.stress - 2) + (j.perf > 70 ? 1 : 0));
    if (k.stress >= 4) addStat(s, 'health', -1);
    if (k.fame) addStat(s, 'fame', Math.round(k.fame * (n ? j.level / n : 1)));
    if (k.risk && s.jail === 0) {
      if (k.special === 'crime' && rnd(s) < 0.03 * k.risk) { E.FX.jail(s); return; }
      if (k.special !== 'crime' && rnd(s) < 0.006 * k.risk) { addStat(s, 'health', -rint(s, 5, 20)); addLog(s, '업무 중 사고로 다쳤다.', 'bad'); }
    }
    if (k.special === 'politics' && j.level === n && E.unlock(s, 'leader')) E.triumph(s, 'leader');
    if (k.special === 'space' && j.level >= 1) E.unlock(s, 'astronaut');
    if ((k.sector === 'science' || k.id === 'professor') && j.level >= n - 1 && s.stats.smarts >= 92 && rnd(s) < 0.04) {
      addLog(s, '스톡홀름에서 전화가 왔다. 노벨상 수상자로 선정됐다!', 'milestone');
      addStat(s, 'fame', 25); s.money += Math.round(1000000 * wage(s)); E.unlock(s, 'nobel');
      s.y.anim = 'trophy'; E.triumph(s, 'nobel');
    }
    // mandatory retirement prompt
    if (s.age >= 65 && k.sector !== 'crime' && k.special !== 'politics') E.queueSys(s, 'sys_retire', 5);
  }

  // ---------------------------------------------------------------- yearly simulation
  E.mortality = function (s) {
    var a = s.age, st = s.stats;
    var q = a < 5 ? 0.0006 : a < 40 ? 0.0004 + 0.00002 * a : 0.00008 * Math.exp(0.082 * a);
    var hm = st.health >= 80 ? 0.55 : st.health >= 60 ? 0.85 : st.health >= 40 ? 1.4 : st.health >= 20 ? 2.6 : 5;
    q *= hm;
    if (s.flags.smoker) q *= 1.4;
    if (s.flags.drinker) q *= 1.2;
    if (s.sick) q *= 1.6;
    if (s.stats.happy < 15) q *= 1.25;
    var tr = s.traits || {};
    if (tr.alcohol >= 60) q *= 1.3;
    if (tr.gamble >= 75) q *= 1.15;
    return clamp(q, 0, 0.95);
  };

  function deathCause(s) {
    if (s.sick) return s.sick.name;
    if (s.age >= 85) return pick(s, ['노환으로 잠든 채', '가족들 곁에서 평온하게', '노환']);
    if (s.flags.heart_hidden && s.age < 50) return '숨겨 왔던 심장 질환';
    if (s.flags.smoker && s.age > 45) return '폐암';
    if (s.age < 30) return pick(s, ['교통사고', '불의의 사고', '갑작스러운 심장마비']);
    return pick(s, ['심장마비', '뇌졸중', '암', '폐렴', '갑작스러운 사고']);
  }

  E.checkDeath = function (s, onlyHealth) {
    if (!s.alive) return true;
    var dead = s.stats.health <= 0;
    if (!dead && !onlyHealth) dead = rnd(s) < E.mortality(s) || s.age >= 122;
    if (dead) {
      s.alive = false;
      s.cause = s.stats.health <= 0 ? (s.sick ? s.sick.name : ((s.traits || {}).alcohol >= 60 ? '술로 망가진 건강' : '건강 악화')) : deathCause(s);
      s.queue = [];
      if (E.ending) { var en = E.ending(s); s.ending = en ? en.id : null; }
      if (s.job) endJob(s, '사망');
      addLog(s, s.age + '세, ' + s.cause + '(으)로 세상을 떠났다.', 'death');
      E.checkAchievements(s);
    }
    return dead;
  };

  // Traits act every year: drinking wears the body down, gambling eats savings, habits fade if left alone
  function yearlyTraits(s) {
    var t = s.traits = s.traits || { mischief: 0, rep: 50, gamble: 0, alcohol: 0, record: 0 };
    if (t.alcohol >= 50) { addStat(s, 'health', t.alcohol >= 75 ? -3 : -2); if (t.alcohol >= 75) addStat(s, 'happy', -2); }
    if (t.alcohol > 0 && !s.y.drank) t.alcohol = Math.max(0, t.alcohol - 1);
    if (t.gamble >= 45 && s.money > 0) {
      var loss = Math.round(s.money * (t.gamble >= 75 ? 0.15 : 0.08));
      s.money -= loss; addStat(s, 'happy', -2);
      if (loss > 0) addLog(s, '🎲 도박으로 모은 돈이 새어 나간다. (-' + T.money(loss, country(s)) + ')', 'bad');
    }
    if (t.gamble > 0 && t.gamble < 20 && !s.y.bets) t.gamble = Math.max(0, t.gamble - 1); // a habit (20+) does not fade on its own
    if (t.mischief > 0 && s.age > 20) t.mischief = Math.max(0, t.mischief - 1);
    if (t.rep !== 50) t.rep += t.rep > 50 ? -1 : 1;
    E.traitUnlocks(s);
  }
  E.yearlyTraits = yearlyTraits;
  // New paths open when a trait crosses a threshold (shown in the log and the 진로 panel)
  E.traitUnlocks = function (s) {
    var t = s.traits || {};
    if (t.gamble >= 45 && !s.flags.gambler_unlocked) {
      s.flags.gambler_unlocked = s.age;
      addLog(s, '🎲 도박 중독 2단계. 새 진로 해금: 겜블러 (카지노 딜러부터 시작할 수 있다)', 'achieve');
    }
    if (t.mischief >= 40 && !s.flags.rascal_unlocked) {
      s.flags.rascal_unlocked = s.age;
      addLog(s, '😈 악동 기질 40. 뒷골목 진로가 열렸다 (야바위꾼, 밀수꾼…)', 'achieve');
    }
  };
  E.gambleStage = function (s) {
    var g = (s.traits || {}).gamble || 0, st = C.GAMBLE_STAGES, out = st[0][1];
    for (var i = 0; i < st.length; i++) if (g >= st[i][0]) out = st[i][1];
    return out;
  };

  function yearlyStats(s) {
    var a = s.age, st = s.stats;
    // health drift by age
    var hd = a < 18 ? 1 : a < 35 ? 0 : a < 50 ? -1 : a < 65 ? -1.6 : a < 80 ? -2.4 : -3.2;
    hd += rnd(s) * 3 - 1.5;
    if (s.sick) hd -= s.sick.sev;
    if (s.flags.smoker) hd -= 1;
    if (s.flags.drinker) hd -= 0.7;
    if (st.happy < 20) hd -= 1;
    if (st.grit > 70 && a > 30) hd += 0.5;
    addStat(s, 'health', hd);
    // happiness regresses to 55
    addStat(s, 'happy', (55 - st.happy) / 12 + (rnd(s) * 4 - 2));
    // smarts grow in childhood and school
    if (a <= 18) addStat(s, 'smarts', rint(s, 1, 3) + (s.edu.stage !== 'none' ? 1 : 0));
    else if (a > 70) addStat(s, 'smarts', -rint(s, 0, 2));
    // looks
    if (a >= 12 && a <= 18) addStat(s, 'looks', rint(s, -2, 3));
    if (a > 45) addStat(s, 'looks', -rint(s, 0, 2));
    // grit grows with age a little
    if (a < 25 && rnd(s) < 0.5) addStat(s, 'grit', 1);
    // fame fades if not working in a famous job
    if (st.fame > 0 && !(s.job && careerById(s.job.id).fame) && s.fb.stage !== 'pro') addStat(s, 'fame', -Math.max(1, Math.round(st.fame * 0.04)));
    // football natural drift
    E.Football.yearlySkill(s);
  }

  function yearlyMoney(s) {
    if (s.age < 18 || s.jail > 0) return;
    if ((s.edu.stage === 'univ' || s.edu.stage === 'grad') && s.age < 26) { s.money -= Math.round(2000 * wage(s)); return; }
    var cost = s.job || s.pension ? 9000 : 5000; // without income people live leaner (family, benefits)
    if (s.flags.homeowner) cost *= 0.6;
    if (person(s, 'spouse')) cost += 4000;
    cost += peopleByRel(s, 'children').filter(function (p) { return p.age < 22; }).length * 5000;
    if (s.flags.car_owner) cost += 1200;
    cost = Math.round(cost * wage(s));
    // lifestyle grows with income (rent, food, family, taxes not withheld)
    cost += Math.round((s.y.income || 0) * 0.5);
    // the rich spend more
    if (s.money > cost * 50) cost += Math.round(s.money * 0.01);
    s.money -= cost;
    // savings interest / debt interest
    if (s.money > 0) s.money += Math.round(s.money * 0.01);
    else {
      // student loans: low interest and no bankruptcy while studying and for 4 years after the last degree
      var studying = s.edu.stage === 'univ' || s.edu.stage === 'grad' || (s.edu.gradAge && s.age - s.edu.gradAge < 4);
      s.money += Math.round(s.money * (studying ? 0.02 : 0.05)); addStat(s, 'happy', studying ? -1 : -3); s.flags.in_debt = s.age;
      if (!studying && !s.job && s.money < -60000 * wage(s) && (!s.flags.bankrupt || s.age - s.flags.bankrupt >= 10)) { // people with a job keep repaying
        s.money = 0; s.flags.bankrupt = s.age; addStat(s, 'happy', -10);
        addLog(s, '빚을 감당할 수 없어 개인 파산을 신청했다. 모든 걸 잃었지만, 다시 시작할 수 있다.', 'bad');
      }
    }
    if (s.money > 0 && s.flags.in_debt) delete s.flags.in_debt;
  }

  function yearlyPeople(s) {
    var c = country(s);
    s.people.forEach(function (p) {
      if (!p.alive) return;
      p.age = (p.age || 0) + 1;
      // relationships fade without contact
      if (p.role !== 'child' || p.age > 12) p.rel = clamp(p.rel - rint(s, 0, 2), 0, 100);
      if (p.role === 'father' && s.flags.father_drinking && !s.flags.father_sober) return; // father handled in arc
      var q = p.age < 40 ? 0.001 : 0.00012 * Math.exp(0.082 * p.age) * 0.8;
      if (p.role === 'child' && p.age < 40) q = 0.0005;
      if (rnd(s) < q || p.age > 105) personDies(s, p, p.age > 75 ? '노환' : '병');
    });
    // father's drinking arc
    var dad = person(s, 'father');
    if (dad && dad.alive && s.flags.father_drinking && !s.flags.father_sober) {
      dad.recovery = clamp((dad.recovery || 0) - 3, 0, 100);
      dad.liver = (dad.liver || 70) - Math.max(1, rint(s, 3, 6) - Math.floor(dad.recovery / 30));
      if (dad.liver < 30 && !s.flags.father_ill) { s.flags.father_ill = s.age; E.queueSys(s, 'canon_father_hospital'); }
      if (dad.liver <= 0) personDies(s, dad, '간 질환');
    } else if (dad && dad.alive && s.flags.father_sober) {
      dad.liver = Math.min(70, (dad.liver || 40) + 2);
    }
    // partner drift
    var pt = person(s, 'partner');
    if (pt && pt.rel < 12) { addLog(s, displayName(s, pt) + '와(과) 헤어졌다. 연락이 점점 뜸해지더니 결국…', 'bad'); pt.role = 'ex'; addStat(s, 'happy', -6); }
    var sp = person(s, 'spouse');
    if (sp && sp.rel < 8 && rnd(s) < 0.5) { E.FX.divorce(s); }
  }

  // Korean kinship word for a person, seen from the hero
  E.relWord = function (s, p) {
    if (!p) return '';
    var hm = s.hero.gender !== 'f';
    switch (p.role) {
      case 'father': return '아버지';
      case 'mother': return '어머니';
      case 'sibling':
        var older = (p.bornAt != null ? p.bornAt : -1) < 0;
        if (older) return p.gender === 'f' ? (hm ? '누나' : '언니') : (hm ? '형' : '오빠');
        return p.gender === 'f' ? '여동생' : '남동생';
      case 'spouse': return p.gender === 'f' ? '아내' : '남편';
      case 'child': return p.gender === 'f' ? '딸' : '아들';
      case 'partner': return '연인';
      case 'friend': case 'oldfriend': return '친구';
      case 'coach': return '은사';
      case 'ex': return '옛 연인';
    }
    return '지인';
  };
  var GRIEF_ROLES = ['mother', 'sibling', 'spouse', 'child'];

  function personDies(s, p, cause) {
    p.alive = false; p.diedAt = s.age; p.diedSeq = (s.seq || 0) + 1;
    var nm = displayName(s, p), word = E.relWord(s, p);
    var mem = { mem: 1 };
    if (p.role === 'father') {
      s.flags.father_dead = s.age;
      addLog(s, '아버지 ' + nm + '께서 ' + cause + '(으)로 세상을 떠나셨다. 마지막까지 막내의 경기를 이야기하셨다고 한다.', 'death', mem);
      addStat(s, 'happy', -18);
      E.queueSys(s, 'canon_father_farewell');
      s.y.bereaved = true;
    } else if (p.role === 'mother') {
      s.flags.mother_dead = s.age;
      addLog(s, '어머니 ' + nm + '께서 ' + cause + '(으)로 세상을 떠나셨다.', 'death', mem);
      addStat(s, 'happy', -18);
    } else if (p.role !== 'ex') {
      addLog(s, word + ' ' + nm + '(이)가 ' + cause + '(으)로 세상을 떠났다 (' + p.age + '세).', 'death', mem);
      addStat(s, 'happy', p.rel > 60 ? -12 : -5);
    }
    if (GRIEF_ROLES.indexOf(p.role) >= 0) {
      s.flags[p.role === 'sibling' ? 'sibling_dead' : p.role + '_dead'] = s.age;
      s.griefs = (s.griefs || []).concat([p.id]);
      s.y.bereaved = true;
      if (s.queue.indexOf('sys_grief') < 0) s.queue.unshift('sys_grief');
    }
    if ((p.role === 'father' || p.role === 'mother') && s.age >= 18) {
      var inh = Math.round(rint(s, 2000, 12000) * wage(s));
      s.money += inh;
    }
    if (p.id === s.bestFriend) s.bestFriend = null;
  }
  E.personDies = personDies;

  function yearlyKids(s) {
    peopleByRel(s, 'children').forEach(function (k) {
      if (k.age === 18) addLog(s, E.relWord(s, k) + ' ' + displayName(s, k) + '(이)가 성인이 됐다.', 'info');
    });
  }

  function yearlyHealth(s) {
    if (s.sick) {
      s.sick.years++;
      if (s.sick.years > 2 && rnd(s) < 0.3) { addLog(s, s.sick.name + '에서 자연스럽게 회복됐다.', 'good'); s.sick = null; }
    }
    if (s.jail > 0) {
      s.jail--;
      addStat(s, 'happy', -4);
      if (s.jail === 0) { delete s.flags.jailed; addLog(s, '출소했다. 바깥 공기가 이렇게 달 줄이야.', 'milestone'); }
    }
  }

  // Advance one year. Returns {events: ids}
  E.ageUp = function (s) {
    if (!s.alive) return null;
    if (s.queue.length) throw new Error('resolve pending events first');
    s.age++; s.year++;
    s.ap = AP_PER_YEAR;
    var prevY = s.y; s.y = {};
    s.cards = [];
    s.hist.push({ age: s.age, money: Math.round(s.money), fame: s.stats.fame, happy: s.stats.happy, health: s.stats.health });
    if (s.hist.length > 130) s.hist.shift();
    addLog(s, '— ' + s.age + '세 (' + s.year + '년) —', 'year');
    yearlyHealth(s);
    yearlyStats(s);
    yearlyTraits(s);
    E.updateEducation(s);
    progressUniversity(s);
    if (s.edu.stage === 'high' && s.age === country(s).school.exam.age) E.prepareExam(s);
    yearlyCareer(s);
    E.Football.yearly(s, prevY);
    yearlyMoney(s);
    yearlyPeople(s);
    yearlyKids(s);
    if (E.checkDeath(s)) return { events: [] };
    E.applyEduFocus(s);
    if (s.age === 1 && !s.eduFocus) E.queueSys(s, 'sys_edu_focus');
    if (s.age === E.MONTAGE_UNTIL && s.eduFocus && !s.eduFocusChanged && !s.fired.sys_edu_change) E.queueSys(s, 'sys_edu_change');
    var ids;
    if (E.isMontage(s)) ids = E.selectMilestones(s);   // ages 0-4: a montage of milestone cards, no storylets
    else ids = E.selectEvents(s);
    E.checkAchievements(s);
    return { events: ids };
  };

  // ---------------------------------------------------------------- early childhood (ages 0-4)
  E.MONTAGE_UNTIL = 5;           // ages below this play as a montage of milestone cards
  E.EDU_FOCUS_UNTIL = 7;         // the early-education focus applies every year up to this age
  E.isMontage = function (s) { return s.alive && s.age < E.MONTAGE_UNTIL; };

  // A milestone card: big picture + one short sentence + stat chips. Also logged.
  E.addCard = function (s, card) {
    var text = T.fixJosa(card.text);
    s.cards = s.cards || [];
    s.cards.push({ id: card.id, pic: card.pic, text: text, chg: card.chg || [], age: s.age });
    addLog(s, text, 'card', { pic: card.pic, chg: compactChanges(card.chg), ev: card.id, mem: card.mem ? 1 : null });
  };
  function compactChanges(chg) {
    var out = [];
    (chg || []).forEach(function (c) {
      if (c.k === 'msg' || c.k === 'rel' || !(c.d || c.want)) return;
      out.push(c.want ? { k: c.k, d: c.d, want: c.want, max: !!c.max } : { k: c.k, d: c.d });
    });
    return out.length ? out : null;
  }
  E.compactChanges = compactChanges;

  E.selectMilestones = function (s) {
    var ids = [];
    (RA.data.milestones || []).forEach(function (m) {
      if (m.age !== s.age && !(Array.isArray(m.age) && s.age >= m.age[0] && s.age <= m.age[1])) return;
      if (s.fired[m.id]) return;
      if (m.countries && m.countries.indexOf(s.country) < 0) return;
      if (m.cond && !E.condMatches(s, m.cond)) return;
      if (!E.personsOk(s, m)) return;
      if (m.chance != null && rnd(s) >= m.chance) return;
      s.fired[m.id] = 1;
      var chg = applyEffects(s, m.effects, []);
      E.addCard(s, { id: m.id, pic: m.pic, text: E.render(s, m.text), chg: chg });
      ids.push(m.id);
    });
    return ids;
  };

  // Birth happens right after the prenatal pick
  E.birth = function (s) {
    s.born = true;
    addLog(s, T.render('{hometown}에서 태어났다. 집은 {houseLong}[이/]다.', vars(s)), 'milestone'); // "사남매의 막내" is told once, on the birth card
    E.selectMilestones(s);
  };

  E.applyEduFocus = function (s) {
    var f = s.eduFocus && E.EDU_FOCUS[s.eduFocus];
    if (!f || s.age < 1 || s.age > E.EDU_FOCUS_UNTIL || s.y.focusApplied) return;
    s.y.focusApplied = true;
    var chg = applyEffects(s, f.effects, []);
    var line = f.lines[(s.age - 1) % f.lines.length];
    var text = f.icon + ' 조기 교육(' + f.label + '): ' + line;
    if (E.isMontage(s)) E.addCard(s, { id: 'focus_' + s.eduFocus, pic: 'focus_' + s.eduFocus, text: text, chg: chg });
    else addLog(s, text, 'focus', { chg: compactChanges(chg) });
  };

  // Auto-play: one step. Stops (returns 'choose') whenever the player has to decide something.
  E.autoStep = function (s) {
    if (!s.alive) return 'dead';
    if (s.queue.length) return 'choose';
    E.ageUp(s);
    if (!s.alive) return 'dead';
    return s.queue.length ? 'choose' : 'aged';
  };

  E.prepareExam = function (s) {
    var st = s.stats;
    var score = clamp(Math.round(st.smarts * 0.75 + s.edu.grades * 0.25 + rint(s, -12, 12) + (s.y.studied || 0) * 3), 0, 100);
    s.edu.examScore = score;
    E.queueSys(s, 'sys_exam');
  };

  // ---------------------------------------------------------------- achievements
  E.unlock = function (s, id) {
    if (s.achievements[id]) return false;
    var a = (RA.data.achievements || []).filter(function (x) { return x.id === id; })[0];
    if (!a) return false;
    s.achievements[id] = s.age || 1;
    addLog(s, '🏅 업적 달성: ' + a.name, 'achieve');
    s.y.newAchievements = (s.y.newAchievements || []).concat([id]);
    return true;
  };
  E.checkAchievements = function (s) {
    (RA.data.achievements || []).forEach(function (a) {
      if (!s.achievements[a.id] && a.test && a.test(s, E)) E.unlock(s, a.id);
    });
  };

  // ---------------------------------------------------------------- scene selection
  E.sceneFor = function (s, ev) {
    if (s.jail > 0) return 'prison';
    if (ev && ev.id) {
      if (/^fb_|^canon_(join|regional|academy|youth|pro|late)/.test(ev.id)) return s.fb.stage === 'pro' ? 'stadium' : 'pitch';
      if (/heart|hospital/.test(ev.id)) return 'hospital';
    }
    return E.homeScene(s);
  };
  E.homeScene = function (s) {
    if (!s.alive) return 'grave';
    if (s.jail > 0) return 'prison';
    if (s.fb.stage === 'pro') return 'stadium';
    if (s.sick) return 'hospital';
    if (['elem', 'middle', 'high', 'univ', 'grad'].indexOf(s.edu.stage) >= 0) return s.fb.stage !== 'none' && s.fb.stage !== 'retired' && s.age % 2 ? 'pitch' : 'school';
    if (s.job) {
      var sec = careerById(s.job.id).sector;
      if (sec === 'sports') return 'pitch';
      if (sec === 'medical') return 'hospital';
      if (sec === 'agri') return 'farm';
      return 'office';
    }
    return 'home';
  };

  // ---------------------------------------------------------------- outfit
  E.outfit = function (s) {
    if (s.jail > 0) return 'prison';
    if (s.fb.stage === 'pro' || (['local', 'regional', 'academy', 'youth'].indexOf(s.fb.stage) >= 0 && s.age % 3 !== 0)) return 'kit';
    if (s.job) return careerById(s.job.id).outfit || 'casual';
    if (['elem', 'middle', 'high'].indexOf(s.edu.stage) >= 0) return 'uniform';
    return s.age < 6 ? 'casual' : (s.age % 2 ? 'casual' : 'hoodie');
  };

  E.AP_PER_YEAR = AP_PER_YEAR;
})(typeof globalThis !== 'undefined' ? globalThis : this);
