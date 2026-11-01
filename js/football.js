/* Football route: skill growth, pro seasons, trophies, national team, World Cup, retirement. */
(function (G) {
  var RA = G.RA = G.RA || {};
  var E = RA.Engine, T = RA.Text;
  var F = E.Football = {};

  // Rough national-team strength (chance to win a World Cup with an average squad)
  F.NAT_STRENGTH = { br: 0.06, ar: 0.055, us: 0.015, jp: 0.015, kr: 0.012, za: 0.006, cn: 0.004, in: 0.002 };
  F.CONT_CUP = { kr: '아시안컵', jp: '아시안컵', cn: '아시안컵', in: '아시안컵', br: '코파 대회', ar: '코파 대회', us: '골드컵', za: '아프리카 네이션스컵' };
  F.ACTIVE = ['local', 'regional', 'academy', 'youth', 'pro'];

  function cap(s) { return Math.min(99, s.fb.talent + Math.floor(s.stats.grit / 12)); }
  F.cap = cap;

  // Natural development each year
  F.yearlySkill = function (s) {
    var a = s.age, st = s.stats, fb = s.fb;
    var active = F.ACTIVE.indexOf(fb.stage) >= 0;
    var g = 0;
    if (active) {
      g = a <= 12 ? E.rint(s, 2, 4) : a <= 20 ? E.rint(s, 2, 5) : a <= 27 ? E.rint(s, 0, 2) : a <= 31 ? E.rint(s, -1, 1) : -E.rint(s, 1, 3);
      g *= 0.7 + st.grit / 160;
      if (a > 31 && st.grit > 75) g += 1; // legendary discipline slows decline
    } else if (a > 18) g = st.football > 20 ? -E.rint(s, 0, 2) : 0;
    else if (a >= 4) g = E.chance(s, 0.4) ? 1 : 0;
    var nv = st.football + g;
    if (g > 0 && nv > cap(s)) nv = Math.max(st.football, cap(s));
    E.addStat(s, 'football', Math.round(nv - st.football));
  };

  function seasonLabel(s) { return (s.year - 1) + '-' + String(s.year).slice(2) + ' 시즌'; }

  // Pro season + national team + retirement
  F.yearly = function (s, prevY) {
    var fb = s.fb, st = s.stats;
    if (fb.stage !== 'pro' || !s.job || s.job.id !== 'footballer') return;
    var c = E.country(s);
    fb.seasons++;
    var rating = st.football * 0.72 + st.grit * 0.14 + st.health * 0.14 + E.rint(s, -6, 6) + (prevY && prevY.trainedFb ? 2 : 0);
    var apps = fb.injury > 0 ? E.rint(s, 3, 18) : E.rint(s, 24, 52);
    if (fb.injury > 0) fb.injury--;
    if (st.health < 40) apps = Math.round(apps * 0.6);
    var gpg = Math.max(0, (rating - 52) / 44) * 0.95;
    var goals = Math.round(apps * gpg * (0.75 + E.rnd(s) * 0.5));
    fb.apps += apps; fb.goals += goals;
    if (goals > fb.bestSeason) fb.bestSeason = goals;
    // ladder level follows form
    var target = rating < 60 ? 0 : rating < 68 ? 1 : rating < 76 ? 2 : rating < 83 ? 3 : rating < 90 ? 4 : 5;
    var j = s.job; j.years++;
    if (target > j.level) { j.level++; E.addLog(s, '팀 내 입지가 올라갔다: ' + E.jobTitle(s) + '.', 'good'); if (j.level === 5) E.unlock(s, 'top_career'); }
    else if (target < j.level - 1) j.level--;
    var abroad = !!s.flags.abroad;
    var parts = [seasonLabel(s) + ' (' + fb.club + '): ' + apps + '경기 ' + goals + '골.'];
    var anim = null;
    // trophies
    var pLeague = (abroad ? 0.18 : 0.25) + (rating - 72) / 90;
    if (E.rnd(s) < Math.max(0.03, pLeague)) { fb.trophies.league++; parts.push('리그 우승!'); anim = 'trophy'; }
    if (E.rnd(s) < Math.max(0.03, pLeague * 0.6)) { fb.trophies.cup++; parts.push('컵 대회 우승!'); anim = 'trophy'; }
    if (abroad && E.rnd(s) < Math.max(0.01, 0.06 + (rating - 82) / 70)) { fb.trophies.cont++; parts.push('유럽 챔피언스 컵 정상!'); anim = 'trophy'; E.unlock(s, 'champions'); }
    // individual award
    if (abroad && rating >= 89 && goals >= 30 && E.rnd(s) < (rating - 88) / 12 * 0.22 + (anim ? 0.02 : 0)) {
      fb.trophies.ballon++; parts.push('발롱도르 수상!!'); anim = 'ballon'; E.unlock(s, 'ballon'); E.addStat(s, 'fame', 10);
    }
    // salary & fame
    var sal = E.salaryOf(s, E.careerIndex().footballer, j.level);
    s.money += Math.round(sal * 0.6);
    s.y.income = (s.y.income || 0) + sal * 0.5;
    if (j.level >= 3) s.money += Math.round(sal * 0.15 * (st.fame / 100)); // sponsorships
    E.addStat(s, 'fame', 1 + j.level * 2 + (anim ? 3 : 0));
    E.addStat(s, 'happy', goals > 15 ? 3 : 0);
    E.addStat(s, 'health', -1);
    // national team
    if (!s.flags.nat_team && st.football >= 72 && rating >= 72 && E.chance(s, 0.5)) {
      E.FX.nationalCallup(s); parts.push(c.nationalTeam + '에 첫 발탁!');
    }
    if (s.flags.nat_team) {
      var caps = E.rint(s, 4, 10), ng = Math.round(caps * gpg * 0.7);
      fb.caps += caps; fb.natGoals += ng;
      var base = F.NAT_STRENGTH[s.country] || 0.01;
      var boost = Math.max(0, (rating - 75) / 120);
      if (s.year % 4 === 2) { // World Cup year
        var pWin = Math.min(0.35, base * (1 + boost * 2));
        var r = E.rnd(s);
        var stage = r < pWin ? 'win' : r < pWin * 2.5 + 0.08 ? 'semi' : r < 0.55 ? 'r16' : 'group';
        if (stage === 'win') { fb.trophies.wc++; parts.push(s.year + ' 월드컵 우승!!! 온 나라가 뒤집혔다.'); anim = 'worldcup'; E.unlock(s, 'worldcup'); E.addStat(s, 'fame', 15); }
        else parts.push(s.year + ' 월드컵: ' + { semi: '4강 진출', r16: '16강', group: '조별리그 탈락' }[stage] + '.');
        E.unlock(s, 'worldcup_play');
      } else if (s.year % 4 === 0) {
        if (E.rnd(s) < Math.min(0.6, base * 2.5 + boost * 0.4)) { fb.trophies.natCup++; parts.push(F.CONT_CUP[s.country] + ' 우승!'); anim = anim || 'trophy'; }
      }
    }
    E.addLog(s, parts.join(' '), anim ? 'trophy' : 'fb');
    if (anim) s.y.anim = anim;
    // retirement
    var retireP = s.age < 33 ? 0 : (s.age - 32) * 0.1 - (st.grit > 80 ? 0.1 : 0) - (rating > 80 ? 0.1 : 0);
    if (s.age >= 41 || st.health < 25 || E.rnd(s) < retireP) {
      var msg = E.FX.retireFootball(s);
      if (msg) E.addLog(s, msg, 'milestone');
    }
  };

  F.statusText = function (s) {
    var fb = s.fb, C = RA.C;
    if (fb.stage === 'none') return s.flags.fb_quit ? '축구를 그만뒀다' : '아직 소속팀 없음';
    var t = C.FB_STAGE_LABELS[fb.stage] + (fb.club ? ' · ' + fb.club : '');
    if (fb.seasons) t += ' · 통산 ' + fb.apps + '경기 ' + fb.goals + '골';
    return t;
  };
  void T;
})(typeof globalThis !== 'undefined' ? globalThis : this);
