/* Save / load with versioned migrations. Storage is injectable (localStorage in browser). */
(function (G) {
  var RA = G.RA = G.RA || {};
  var C = RA.C;
  var KEY = 'ronaldo-adventure.saves';
  var SLOTS = 3;

  // Each migration upgrades a save from version n to n+1.
  var MIGRATIONS = {
    // v1 (prototype): stat was called "discipline", no relationships ids, log entries were strings
    1: function (s) {
      if (s.stats && s.stats.discipline != null && s.stats.grit == null) { s.stats.grit = s.stats.discipline; delete s.stats.discipline; }
      if (Array.isArray(s.log)) s.log = s.log.map(function (e) { return typeof e === 'string' ? { age: s.age || 0, year: s.year || 0, t: e, k: 'info' } : e; });
      s.people = s.people || [];
      var n = 1; s.people.forEach(function (p) { if (p.id == null) p.id = n; n = Math.max(n, p.id) + 1; });
      s.nextPid = Math.max(s.nextPid || 1, n);
      s.saveVersion = 2;
      return s;
    },
    // v2: added delayed-consequence queue, national cup trophies, history chart, cooldown map
    2: function (s) {
      s.pending = s.pending || [];
      s.queue = s.queue || [];
      s.cd = s.cd || {};
      s.fired = s.fired || {};
      s.hist = s.hist || [];
      s.y = s.y || {};
      s.fb = s.fb || {};
      s.fb.trophies = s.fb.trophies || {};
      ['league', 'cup', 'cont', 'natCup', 'wc', 'ballon'].forEach(function (k) { if (s.fb.trophies[k] == null) s.fb.trophies[k] = 0; });
      ['apps', 'goals', 'caps', 'natGoals', 'injury', 'seasons', 'bestSeason'].forEach(function (k) { if (s.fb[k] == null) s.fb[k] = 0; });
      s.fb.clubs = s.fb.clubs || [];
      if (s.fb.talent == null) s.fb.talent = 80;
      if (!s.fb.abroadClub) s.fb.abroadClub = RA.Engine && RA.Engine.ABROAD_CLUBS ? RA.Engine.ABROAD_CLUBS[0] : '해외 명문 FC';
      if (!s.fb.stage) s.fb.stage = 'none';
      s.saveVersion = 3;
      return s;
    },
    // v3: hero is always 호날두; new 공감/사교 stat; early-childhood picks and montage cards
    3: function (s) {
      s.hero = s.hero || {};
      s.hero.given = C.HERO_NAME; s.hero.nick = C.HERO_NAME;
      s.stats = s.stats || {};
      if (s.stats.social == null) s.stats.social = 40;
      if (s.prenatal === undefined) s.prenatal = null;
      if (s.eduFocus === undefined) s.eduFocus = null;
      if (s.eduFocusChanged == null) s.eduFocusChanged = !!s.eduFocus;
      s.cards = s.cards || [];
      s.born = true;
      s.saveVersion = 4;
      return s;
    },
    // v4: traits (악동 기질, 평판, 도박 중독, 음주, 전과), decision counts, gambling log, ending id
    4: function (s) {
      s.traits = s.traits || { mischief: 0, rep: 50, gamble: 0, alcohol: 0, record: s.flags && s.flags.ever_jailed ? 1 : 0 };
      s.dec = s.dec || {};
      s.gambleLog = s.gambleLog || { plays: 0, wins: 0, net: 0 };
      if (s.ending === undefined) s.ending = null;
      s.saveVersion = 5;
      return s;
    },
    // v5 → v6 (round 7, routes): body specs and base talents are rolled from the seed (prenatal and
    // early-education picks feed the talents), the school track is read from the old path flags and the
    // current route is derived from the life state (prison, football club, job, school, retired, none).
    5: function (s) {
      s.saveVersion = 6;
      return RA.Engine && RA.Engine.Routes ? RA.Engine.Routes.migrate(s) : s;
    }
  };

  function migrate(s) {
    if (!s || typeof s !== 'object') throw new Error('bad save');
    if (s.saveVersion == null) s.saveVersion = 1;
    var guard = 0;
    while (s.saveVersion < C.SAVE_VERSION) {
      var m = MIGRATIONS[s.saveVersion];
      if (!m || guard++ > 50) throw new Error('no migration from v' + s.saveVersion);
      s = m(s);
    }
    // defaults for any newly-optional fields (forward-compatible)
    s.achievements = s.achievements || {};
    s.flags = s.flags || {};
    s.jobHistory = s.jobHistory || [];
    s.edu = s.edu || { stage: 'none', degree: 'none', grades: 50 };
    s.ap = s.ap == null ? 3 : s.ap;
    s.jail = s.jail || 0;
    // Older saves did not identify the borrower. Never assign that debt to today's friend.
    if (s.flags.lent_friend && !s.friendLoan && !s.friendLoans) {
      s.friendLoan = { personId: null, amount: 2000, legacy: true };
      delete s.flags.lent_friend;
      s.queue = (s.queue || []).filter(function (id) { return id !== 'life_ya_friend_loan_back'; });
      s.pending = (s.pending || []).filter(function (p) { return p.id !== 'life_ya_friend_loan_back'; });
    }
    // Pre-fix debt values were nominal effect units, not balance currency.
    var wage = RA.data.countries[s.country].wage;
    if (s.friendLoan) {
      (s.friendLoans = s.friendLoans || []).push(s.friendLoan);
      delete s.friendLoan;
    }
    (s.friendLoans || []).forEach(function (loan) {
      if (loan.amountUnit !== 'balance') {
        loan.amount = -Math.round(-loan.amount * wage);
        loan.amountUnit = 'balance';
      }
    });
    (s.people || []).forEach(function (p) {
      if (p.unpaidDebt && p.unpaidDebtUnit !== 'balance') {
        p.unpaidDebt = -Math.round(-p.unpaidDebt * wage);
        p.unpaidDebtUnit = 'balance';
      }
    });
    return s;
  }

  function serialize(s) { return JSON.stringify(s); }
  function deserialize(str) { return migrate(JSON.parse(str)); }

  function memStorage() {
    var m = {};
    return { getItem: function (k) { return k in m ? m[k] : null; }, setItem: function (k, v) { m[k] = String(v); }, removeItem: function (k) { delete m[k]; } };
  }
  function getStore(store) {
    if (store) return store;
    try { if (G.localStorage) { G.localStorage.getItem(KEY); return G.localStorage; } } catch (e) { /* blocked */ }
    if (!G.__raMem) G.__raMem = memStorage();
    return G.__raMem;
  }
  function readAll(store) {
    try { var raw = getStore(store).getItem(KEY); return raw ? JSON.parse(raw) : { slots: {} }; } catch (e) { return { slots: {} }; }
  }
  function writeAll(all, store) {
    try { getStore(store).setItem(KEY, JSON.stringify(all)); return true; } catch (e) { return false; }
  }

  RA.Save = {
    KEY: KEY, SLOTS: SLOTS, MIGRATIONS: MIGRATIONS,
    migrate: migrate, serialize: serialize, deserialize: deserialize, memStorage: memStorage,
    save: function (slot, s, store) {
      var all = readAll(store);
      all.slots[slot] = { savedAt: Date.now(), data: serialize(s), meta: { name: s.hero.given, age: s.age, country: s.country, alive: s.alive, gen: s.generation } };
      all.last = slot;
      return writeAll(all, store);
    },
    load: function (slot, store) {
      var all = readAll(store), e = all.slots[slot];
      if (!e) return null;
      return deserialize(e.data);
    },
    list: function (store) {
      var all = readAll(store), out = [];
      for (var i = 1; i <= SLOTS; i++) out.push({ slot: i, meta: all.slots[i] ? all.slots[i].meta : null, savedAt: all.slots[i] ? all.slots[i].savedAt : null });
      return { slots: out, last: all.last || null };
    },
    remove: function (slot, store) { var all = readAll(store); delete all.slots[slot]; return writeAll(all, store); }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
