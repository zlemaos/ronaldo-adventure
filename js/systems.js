/* Named special effects (FX), engine-built system events, generations and life summary. */
(function (G) {
  var RA = G.RA = G.RA || {};
  var C = RA.C, T = RA.Text, E = RA.Engine;

  function W(s) { return E.country(s).wage; }
  function log(s, t, k) { E.addLog(s, t, k); }
  function dn(s, p) { return E.displayName(s, p); }

  E.ABROAD_CLUBS = ['마드리드 왕관 FC', '런던 로열 유나이티드', '토리노 흑백 FC', '맨체스터 붉은 공장 FC',
    '바르셀로나 해변 FC', '뮌헨 알프스 FC', '파리 센강 FC', '밀라노 두오모 FC'];
  E.ABROAD_CITIES = { '마드리드 왕관 FC': '마드리드', '런던 로열 유나이티드': '런던', '토리노 흑백 FC': '토리노',
    '맨체스터 붉은 공장 FC': '맨체스터', '바르셀로나 해변 FC': '바르셀로나', '뮌헨 알프스 FC': '뮌헨',
    '파리 센강 FC': '파리', '밀라노 두오모 FC': '밀라노' };

  var ILLNESSES = [['독감', 2], ['폐렴', 4], ['당뇨', 2], ['고혈압', 2], ['디스크', 2], ['우울증', 2], ['간염', 3], ['암', 7]];

  // ---------------------------------------------------------------- FX
  var FX = E.FX = {};
  FX.joinLocalClub = function (s) {
    if (s.fb.stage !== 'none' && s.fb.stage !== 'retired') return null;
    s.fb.stage = 'local'; s.fb.club = E.country(s).clubs.local; s.fb.clubs.push(s.fb.club);
    if (!E.person(s, 'coach')) E.addPerson(s, { role: 'coach', name: E.freshName(s, 'm'), gender: 'm', age: E.rint(s, 35, 55), rel: 60 });
    return s.fb.club + '에 입단했다! 등번호가 적힌 낡은 유니폼이 무릎까지 내려온다.';
  };
  FX.joinRegionalClub = function (s) {
    s.fb.stage = 'regional'; s.fb.club = E.country(s).clubs.regional; s.fb.clubs.push(s.fb.club);
    return s.fb.club + ' 유소년팀으로 옮겼다.';
  };
  FX.joinAcademy = function (s) {
    var c = E.country(s);
    s.fb.stage = 'academy'; s.fb.club = c.clubs.academy; s.fb.clubs.push(s.fb.club);
    s.flags.moved_alone = s.age;
    return '가방 하나를 들고 홀로 ' + c.places.bigcity + '의 ' + c.clubs.academy + ' 기숙사로 떠났다.';
  };
  FX.promoteYouth = function (s) { s.fb.stage = 'youth'; return '유스 리저브팀으로 승격했다. 프로가 코앞이다.'; };
  FX.turnPro = function (s) {
    var c = E.country(s);
    s.fb.stage = 'pro'; s.fb.club = c.clubs.big; if (s.fb.clubs.indexOf(s.fb.club) < 0) s.fb.clubs.push(s.fb.club);
    E.startJob(s, 'footballer', 0);
    s.fb.proSince = s.age;
    E.unlock(s, 'pro');
    return c.clubs.big + '와(과) 첫 프로 계약서에 사인했다!';
  };
  FX.quitFootball = function (s) {
    s.flags.fb_quit = s.age;
    if (s.job && s.job.id === 'footballer') E.endJob(s, '축구 포기');
    s.fb.stage = 'none'; s.fb.club = null;
    return '축구화를 벽에 걸었다. 다른 꿈을 찾아보기로 했다.';
  };
  FX.retireFootball = function (s) {
    if (s.fb.stage !== 'pro') return null;
    E.endJob(s, '은퇴');
    s.fb.stage = 'retired'; s.flags.fb_retired = s.age;
    return '프로 축구 선수로서 은퇴를 선언했다. 통산 ' + s.fb.apps + '경기 ' + s.fb.goals + '골.';
  };
  FX.injury = function (s) {
    E.addStat(s, 'health', -E.rint(s, 4, 10));
    s.fb.injury = Math.max(s.fb.injury, 1);
    return '부상을 당했다. 한동안 재활이 필요하다.';
  };
  FX.seriousInjury = function (s) {
    E.addStat(s, 'health', -E.rint(s, 12, 22)); E.addStat(s, 'football', -E.rint(s, 3, 8));
    s.fb.injury = 2;
    return '심각한 부상이다. 의사는 "다시 뛸 수 있을지는 본인 의지에 달렸다"고 했다.';
  };
  FX.transferAbroad = function (s) {
    s.flags.abroad = s.age;
    s.fb.club = s.fb.abroadClub; s.fb.clubs.push(s.fb.club);
    s.abroadCity = E.ABROAD_CITIES[s.fb.club] || '외국';
    E.addStat(s, 'fame', 10);
    return '이적료 신기록! ' + s.fb.club + '(으)로 이적했다.';
  };
  FX.nationalCallup = function (s) {
    if (!s.flags.nat_team) { s.flags.nat_team = s.age; E.unlock(s, 'national'); }
    return E.country(s).nationalTeam + ' 소집 명단에 이름이 올랐다!';
  };
  FX.heartProcedure = function (s) {
    s.flags.heart_fixed = s.age; delete s.flags.heart_hidden;
    E.addStat(s, 'health', 6);
    return '간단한 시술을 받았다. 며칠 뒤 다시 훈련장에 섰다.';
  };
  FX.heartIgnore = function (s) { s.flags.heart_hidden = s.age; return '아무에게도 말하지 않았다. 가슴이 가끔 쿵쾅거린다.'; };
  FX.fatherSeekHelp = function (s) {
    var d = E.person(s, 'father'); if (!d || !d.alive) return null;
    d.recovery = Math.min(100, (d.recovery || 0) + E.rint(s, 18, 30));
    if (d.recovery >= 100) return FX.fatherRecover(s);
    return '아버지가 치료 이야기를 진지하게 듣기 시작했다. (회복 의지 ' + d.recovery + '%)';
  };
  FX.fatherRelapse = function (s) {
    var d = E.person(s, 'father'); if (!d || !d.alive) return null;
    d.recovery = Math.max(0, (d.recovery || 0) - 25); delete s.flags.father_sober;
    s.flags.father_drinking = s.flags.father_drinking || s.age;
    return '아버지가 다시 술잔을 들었다. 회복은 한 번에 오지 않는다.';
  };
  FX.fatherRecover = function (s) {
    var d = E.person(s, 'father'); if (!d || !d.alive) return null;
    d.recovery = 100; s.flags.father_sober = s.age; delete s.flags.father_ill;
    d.rel = Math.min(100, d.rel + 10);
    return '아버지가 술을 끊는 데 성공했다. 온 가족이 오랜만에 마음 놓고 웃었다.';
  };
  FX.newFriend = function (s) {
    var g = E.chance(s, 0.6) ? 'm' : 'f';
    var p = E.addPerson(s, { role: 'friend', name: E.freshName(s, g), gender: g, age: Math.max(1, s.age + E.rint(s, -2, 2)), rel: E.rint(s, 55, 75) });
    s.bestFriend = p.id;
    return dn(s, p) + '와(과) 단짝이 됐다.';
  };
  FX.loseFriend = function (s) {
    var p = E.person(s, 'friend'); if (!p) return null;
    p.role = 'oldfriend'; p.rel = Math.min(p.rel, 25); s.bestFriend = null;
    return dn(s, p) + '와(과) 멀어졌다.';
  };
  FX.newPartner = function (s) {
    if (E.person(s, 'spouse') || E.person(s, 'partner')) return null;
    var g = s.hero.gender === 'm' ? 'f' : 'm';
    var p = E.addPerson(s, { role: 'partner', name: E.freshName(s, g), gender: g, age: Math.max(14, s.age + E.rint(s, -3, 3)), rel: E.rint(s, 60, 80), since: s.age });
    s.flags.dated = s.flags.dated || s.age;
    return dn(s, p) + '와(과) 사귀기 시작했다.';
  };
  FX.breakup = function (s) {
    var p = E.person(s, 'partner'); if (!p) return null;
    p.role = 'ex'; E.addStat(s, 'happy', -5);
    return dn(s, p) + '와(과) 헤어졌다.';
  };
  FX.marry = function (s) {
    var p = E.person(s, 'partner');
    if (!p) { FX.newPartner(s); p = E.person(s, 'partner'); }
    if (!p) return null;
    p.role = 'spouse'; p.rel = Math.min(100, p.rel + 10);
    s.flags.married = s.age; s.marriedAt = s.age;
    E.addStat(s, 'happy', 8);
    return dn(s, p) + '와(과) 결혼했다! 하객들이 ' + E.vars(s).food + '을(를) 원 없이 먹었다.';
  };
  FX.divorce = function (s) {
    var p = E.person(s, 'spouse'); if (!p) return null;
    p.role = 'ex'; delete s.flags.married; s.flags.divorced = s.age;
    var half = Math.max(0, Math.round(s.money * 0.4)); s.money -= half;
    E.addStat(s, 'happy', -10);
    return dn(s, p) + '와(과) 이혼했다. 재산의 일부를 나눴다.';
  };
  FX.haveChild = function (s) {
    var g = E.chance(s, 0.5) ? 'm' : 'f';
    var c = E.country(s), used = s.people.map(function (p) { return E.displayName(s, p); }).concat([s.hero.given]);
    var pool = c.names[g].filter(function (n) { return used.indexOf(n) < 0; });
    var given = E.pick(s, pool.length ? pool : c.names[g]);
    var nm = E.fullName(c, s.hero.surname, given);
    E.addPerson(s, { role: 'child', name: nm, gender: g, age: 0, rel: 85, bornAt: s.age });
    E.addStat(s, 'happy', 8);
    return (g === 'm' ? '아들' : '딸') + ' ' + given + '(이)가 태어났다!';
  };
  FX.jail = function (s) {
    if (s.jail > 0) return null;
    var yrs = E.rint(s, 1, 4);
    s.jail = yrs; s.flags.jailed = s.age; s.flags.ever_jailed = s.age;
    if (s.job) E.endJob(s, '수감');
    if (s.fb.stage === 'pro') { s.fb.stage = 'retired'; }
    if (['elem', 'middle', 'high', 'univ', 'grad'].indexOf(s.edu.stage) >= 0) { s.edu.stage = 'none'; s.flags.dropout = s.age; }
    E.addStat(s, 'happy', -10); E.addStat(s, 'fame', 5);
    E.unlock(s, 'jailbird');
    return '징역 ' + yrs + '년을 선고받았다. 철창 너머로 하늘이 네모나다.';
  };
  FX.fired = function (s) {
    if (!s.job) return null;
    var k = E.careerIndex()[s.job.id];
    E.endJob(s, '해고'); E.addStat(s, 'happy', -8);
    return k.name + ' 일자리에서 해고됐다.';
  };
  FX.promote = function (s, auto) {
    if (!s.job) return null;
    var k = E.careerIndex()[s.job.id];
    if (s.job.level >= k.ladder.length - 1) { s.job.perf = Math.min(100, s.job.perf + 10); return null; }
    s.job.level++; s.job.atLevel = 0; s.job.perf = 50;
    E.addStat(s, 'happy', 5);
    var msg = '승진했다! 이제 "' + E.ladderTitle(s, k, s.job.level) + '"이다.';
    if (auto === true) log(s, msg, 'good');
    if (s.job.level === k.ladder.length - 1) E.unlock(s, 'top_career');
    return auto === true ? null : msg;
  };
  FX.demote = function (s) {
    if (!s.job || s.job.level === 0) return null;
    var k = E.careerIndex()[s.job.id];
    s.job.level--; s.job.atLevel = 0;
    return '강등됐다. "' + E.ladderTitle(s, k, s.job.level) + '"(으)로 내려왔다.';
  };
  FX.quitJob = function (s) {
    if (!s.job) return null;
    var k = E.careerIndex()[s.job.id];
    if (k.special === 'football') return FX.retireFootball(s);
    E.endJob(s, '퇴사');
    return k.name + ' 일을 그만뒀다.';
  };
  FX.getSick = function (s) {
    if (s.sick) return null;
    var pool = s.age < 40 ? ILLNESSES.slice(0, 6) : ILLNESSES;
    var il = E.pick(s, pool);
    s.sick = { name: il[0], sev: il[1], years: 0 };
    E.addStat(s, 'health', -il[1] * 2);
    return il[0] + ' 진단을 받았다.';
  };
  FX.cure = function (s) {
    if (!s.sick) return null;
    var n = s.sick.name; s.sick = null; E.addStat(s, 'health', 5);
    return n + '이(가) 나았다!';
  };
  FX.adoptPet = function (s) { s.flags.has_pet = s.age; return '반려동물이 가족이 됐다.'; };
  FX.buyHouse = function (s) {
    var price = Math.round(250000 * W(s));
    if (s.flags.homeowner) return null;
    if (s.money < price * 0.3) return '집값의 30%도 없어 대출 상담에서 쫓겨났다.';
    s.money -= Math.round(price * 0.3); s.flags.homeowner = s.age; s.houseValue = price;
    return '대출을 끼고 집을 샀다! 내 집이다.';
  };
  FX.buyCar = function (s) {
    var price = Math.round(25000 * W(s));
    if (s.flags.car_owner) return null;
    if (s.money < price) return '차를 보러 갔지만 통장 잔고를 보고 버스를 탔다.';
    s.money -= price; s.flags.car_owner = s.age;
    return '첫 차를 샀다.';
  };
  FX.lottery = function (s) {
    var prize = Math.round(E.rint(s, 200000, 3000000) * W(s));
    s.money += prize; E.addStat(s, 'happy', 15); s.flags.lottery_winner = s.age;
    E.unlock(s, 'lottery');
    return '복권 1등 당첨! ' + T.money(prize, E.country(s)) + '을(를) 받았다.';
  };
  FX.scam = function (s) {
    var loss = Math.round(Math.max(500 * W(s), Math.max(0, s.money) * 0.25));
    s.money -= loss; E.addStat(s, 'happy', -8);
    return '사기를 당해 ' + T.money(loss, E.country(s)) + '을(를) 잃었다.';
  };
  FX.moveAbroad = function (s) { s.flags.abroad = s.age; s.abroadCity = s.abroadCity || E.pick(s, ['런던', '파리', '시드니', '토론토', '베를린', '두바이']); return s.abroadCity + '(으)로 이민을 떠났다.'; };
  FX.becomeMonk = function (s) {
    if (E.careerIndex().monk) { if (s.job) E.endJob(s, '출가'); E.startJob(s, 'monk', 0); }
    s.flags.monk = s.age;
    return '속세를 떠나 수도자의 길을 걷기 시작했다.';
  };
  FX.leaveMonastery = function (s) {
    delete s.flags.monk;
    if (s.job && s.job.id === 'monk') E.endJob(s, '환속');
    return '수도원을 나와 속세로 돌아왔다.';
  };

  // ---------------------------------------------------------------- system events (engine-built)
  var MAJOR_KEYS = Object.keys(C.MAJORS);
  // Grief for a family member (mother, sibling, spouse, child). Written seriously; it is the only thing
  // that happens in that year's event queue besides due follow-ups.
  function griefPerson(s) {
    var id = (s.griefs || [])[0];
    return s.people.filter(function (p) { return p.id === id; })[0] || null;
  }
  function griefDone(s, log) {
    s.griefs = (s.griefs || []).slice(1);
    if (s.griefs.length) s.queue.unshift('sys_grief');
    return log;
  }
  function gname(s) { var p = griefPerson(s); return p ? E.displayName(s, p) : '그 사람'; }
  var GRIEF_EVENT = {
    id: 'sys_grief', manual: true, memorial: true, jailOk: true, scene: 'grave',
    textFn: function (s) {
      var p = griefPerson(s);
      if (!p) return '오래 마음에 남을 이별이 있었다.';
      var nm = E.displayName(s, p), w = E.relWord(s, p), pp = T.particle;
      switch (p.role) {
        case 'mother': return '어머니 ' + nm + '의 장례를 치렀다. 평생 새벽부터 일하며 우리를 먹여 살린 손이 이제 차갑다. 부엌에 서 있던 뒷모습이 자꾸 떠오른다.';
        case 'sibling': return w + ' ' + nm + '의 장례식. 어린 시절 한 방에서 이불을 나눠 덮던 밤들이 떠오른다. 아직 할 말이 많이 남아 있었다.';
        case 'spouse': return w + ' ' + nm + pp(nm, '을/를') + ' 떠나보냈다. 함께 늙어 가자던 약속이 집 안 곳곳에 남아 있다.';
        case 'child': return '자식을 먼저 보내는 슬픔은 어떤 말로도 설명할 수 없다. ' + w + ' ' + nm + '의 방은 그대로다.';
      }
      return nm + pp(nm, '을/를') + ' 떠나보냈다.';
    },
    choices: [
      { text: '장례식에서 마지막 인사를 건넨다', effects: { happy: -2, rel: { family: 5 } }, run: function (s) { var n = gname(s); return griefDone(s, '조문객들이 ' + n + T.particle(n, '과/와') + ' 함께한 이야기를 하나씩 꺼냈다. 울다가, 웃다가, 다시 울었다.'); } },
      { text: '함께한 날들을 글로 적어 남긴다', effects: { smarts: 1, happy: -1 }, run: function (s) { return griefDone(s, '함께 찍은 사진 뒤에 날짜와 짧은 편지를 적었다. 고맙다는 말을 너무 늦게 했다.'); } },
      { text: '한동안 모든 것을 멈추고 슬퍼한다', effects: { happy: -5, health: -2, grit: 2 }, run: function (s) { return griefDone(s, '몇 주 동안 아무것도 하지 못했다. 슬픔은 사라지지 않지만, 조금씩 견딜 만해졌다.'); } }
    ]
  };

  E.SYS_EVENTS = [
    GRIEF_EVENT,
    {
      id: 'sys_exam', manual: true, scene: 'school',
      textFn: function (s) {
        var c = E.country(s);
        return c.school.exam.name + ' 성적표가 나왔다. 점수는 ' + s.edu.examScore + '점. ' +
          (s.edu.examScore >= 85 ? '선생님이 교무실에서 박수를 쳤다.' : s.edu.examScore >= 55 ? '나쁘지 않다.' : '음… 인생은 시험이 전부는 아니다.');
      },
      choicesFn: function (s) {
        var c = E.country(s), sc = s.edu.examScore, list = [];
        list.push({ text: c.school.univTop + ' 진학 (상위권 대학)', reqFn: function () { return sc >= 80; }, run: function (s) { return enroll(s, 'top', c.school.univTop); } });
        list.push({ text: c.school.univMid + ' 진학', reqFn: function () { return sc >= 45; }, run: function (s) { return enroll(s, 'mid', c.school.univMid); } });
        list.push({ text: c.school.univAbroad + ' 유학 (학비 비쌈)', reqFn: function (s) { return sc >= 88 && s.money / W(s) >= 20000; }, run: function (s) { return enroll(s, 'abroad', c.school.univAbroad); } });
        if (['academy', 'youth', 'pro'].indexOf(s.fb.stage) >= 0) list.push({ text: '대학 대신 축구에 모든 것을 건다', run: function (s) { E.addStat(s, 'football', 2); return '책가방 대신 축구화를 택했다.'; } });
        list.push({ text: '바로 사회로 나간다', run: function () { return '대학 대신 일을 해서 돈을 벌기로 했다.'; } });
        return list;
      }
    },
    {
      id: 'sys_major', manual: true, scene: 'school',
      text: '{univ}에서 무엇을 전공할까?',
      choicesFn: function (s) {
        return MAJOR_KEYS.map(function (m) {
          var hard = { medicine: 85, law: 75, aerospace: 80, cs: 60, engineering: 60, economics: 55 }[m] || 0;
          return {
            text: C.MAJORS[m] + (hard ? ' (커트라인 ' + hard + ')' : ''),
            reqFn: function (s) { return (s.edu.examScore || 0) >= hard || s.edu.univTier === 'abroad' && (s.edu.examScore || 0) >= hard - 5; },
            run: function (s) { s.edu.major = m; return C.MAJORS[m] + '을(를) 전공하기로 했다.'; }
          };
        });
      }
    },
    {
      id: 'sys_grad', manual: true, scene: 'school', text: '학사 학위를 받았다. 대학원에 갈까?',
      choices: [
        { text: '석사 과정에 진학한다', req: { stats: { smarts: 55 } }, run: function (s) { s.edu.stage = 'grad'; s.edu.target = 'master'; s.edu.univYears = 0; return '대학원생이 됐다. 연구실 불은 꺼지지 않는다.'; } },
        { text: '이제 일하러 간다', run: function () { return '취업 전선에 뛰어들었다.'; } }
      ]
    },
    {
      id: 'sys_phd', manual: true, scene: 'school', text: '석사를 마쳤다. 박사 과정에 도전할까?',
      choices: [
        { text: '박사 과정에 도전한다', req: { stats: { smarts: 70 } }, run: function (s) { s.edu.stage = 'grad'; s.edu.target = 'phd'; s.edu.univYears = 0; return '박사 과정 입학. 지도교수님의 메일 알림음이 무섭다.'; } },
        { text: '여기까지면 충분하다', run: function () { return '석사로 학업을 마쳤다.'; } }
      ]
    },
    {
      id: 'sys_retire', manual: true, scene: 'office', text: '{job}로 일한 지 오래다. 은퇴할 나이가 됐다.',
      choices: [
        { text: '은퇴한다', run: function (s) { var k = E.careerIndex()[s.job.id]; s.pension = Math.round(E.salaryOf(s, k, s.job.level) * 0.3); E.endJob(s, '은퇴'); s.retiredFromWork = true; E.addStat(s, 'happy', 6); return '은퇴했다. 매년 연금이 나온다.'; } },
        { text: '아직 더 일한다', run: function (s) { E.addStat(s, 'health', -2); return '"평생 현역"을 외쳤다.'; } }
      ]
    },
    {
      id: 'sys_proposal', manual: true, scene: 'home', text: '{partner}에게 청혼할 반지를 준비했다. 떨린다.',
      choices: [
        { text: '무릎을 꿇는다', check: { stat: 'looks', diff: 30 },
          success: { effects: { fx: ['marry'] }, log: '{spouse}[이/가] 눈물을 흘리며 "응!"이라고 답했다.' },
          fail: { effects: { happy: -8, rel: { partner: -15 } }, log: '"아직은… 잘 모르겠어." 반지는 서랍 속으로 돌아갔다.' } },
        { text: '아직은 이르다', run: function () { return '반지를 주머니 속에 다시 넣었다.'; } }
      ]
    }
  ];

  function enroll(s, tier, name) {
    s.edu.stage = 'univ'; s.edu.univ = name; s.edu.univTier = tier; s.edu.univYears = 0;
    if (s.edu.examScore >= 92 || (s.stats.football >= 70 && s.country === 'us')) s.flags.scholarship = s.age;
    s.queue.unshift('sys_major');
    // sys_major must be shown right after this event
    return name + '에 합격했다!' + (s.flags.scholarship ? ' 장학금까지 받았다.' : '');
  }

  // ---------------------------------------------------------------- generations
  E.heirs = function (s) {
    return s.people.filter(function (p) { return p.role === 'child' && p.alive; });
  };

  E.continueAsChild = function (s, pid) {
    var kid = s.people.filter(function (p) { return p.id === pid; })[0];
    if (!kid) throw new Error('no such child');
    var c = E.country(s);
    var given = kid.name;
    if (c.nameOrder === 'surname-first') given = kid.name.indexOf(' ') > 0 ? kid.name.split(' ').slice(1).join(' ') : (s.hero.surname && kid.name.indexOf(s.hero.surname) === 0 ? kid.name.slice(s.hero.surname.length) : kid.name);
    else given = kid.name.split(' ')[0];
    var heirs = E.heirs(s).length || 1;
    var estate = Math.max(0, Math.round(s.money * 0.85 / heirs));
    var ns = E.newGame({
      country: s.country, seed: s.seed + '-G' + (s.generation + 1), generation: s.generation + 1,
      given: given, surname: s.hero.surname, nick: given, gender: kid.gender,
      birthYear: s.birthYear + kid.bornAt, startAge: Math.max(1, kid.age), inheritMoney: estate,
      parentState: s, kid: kid,
      legacy: { parentName: E.fullName(c, s.hero.surname, s.hero.given), parentAge: s.age, parentTitle: E.lifeTitles(s)[0].name, estate: estate, generation: s.generation }
    });
    ns.flags.heir = 1;
    // an heir who is already grown up has a plausible education and adult stats
    var sc = c.school;
    if (ns.age > sc.high.to) {
      ns.edu.stage = 'none'; ns.edu.degree = 'high';
      if (ns.age >= sc.high.to + 5 && E.chance(ns, 0.3 + ns.stats.smarts / 200)) {
        ns.edu.degree = 'bachelor'; ns.edu.major = E.pick(ns, Object.keys(C.MAJORS)); ns.edu.univ = sc.univMid;
      }
      ns.stats.smarts = Math.max(ns.stats.smarts, E.rint(ns, 45, 70));
      ns.stats.grit = Math.max(ns.stats.grit, E.rint(ns, 40, 65));
    } else E.updateEducation(ns, true);
    E.addLog(ns, '부모님 ' + ns.legacy.parentName + '의 뒤를 이어 ' + ns.age + '세의 ' + given + '(으)로 삶을 이어 간다. 유산 ' + T.money(estate, c) + '.', 'milestone');
    return ns;
  };

  E.buildHeirFamily = function (s, opts) {
    var ps = opts.parentState, kid = opts.kid;
    var off = kid.bornAt; // parent's age when kid was born
    E.addPerson(s, { role: ps.hero.gender === 'm' ? 'father' : 'mother', key: ps.hero.gender === 'm' ? 'father' : 'mother', name: E.fullName(E.country(ps), ps.hero.surname, ps.hero.given), gender: ps.hero.gender, bornAt: -off, alive: false, rel: 80, diedAt: kid.age });
    var sp = ps.people.filter(function (p) { return p.role === 'spouse'; })[0];
    if (sp) E.addPerson(s, { role: ps.hero.gender === 'm' ? 'mother' : 'father', key: ps.hero.gender === 'm' ? 'mother' : 'father', name: sp.name, gender: sp.gender, bornAt: -(sp.age - kid.age), alive: sp.alive, rel: 75 });
    ps.people.filter(function (p) { return p.role === 'child' && p.id !== kid.id && p.alive; }).forEach(function (sib) {
      E.addPerson(s, { role: 'sibling', name: sib.name, gender: sib.gender, bornAt: sib.bornAt - kid.bornAt, rel: sib.rel });
    });
    s.flags.father_dead = ps.hero.gender === 'm' ? 1 : s.flags.father_dead;
    // a little genetic & cultural inheritance
    s.fb.talent = Math.min(100, Math.round((s.fb.talent + ps.fb.talent) / 2 + E.rint(s, -5, 8)));
    s.stats.looks = Math.round((s.stats.looks + ps.stats.looks) / 2);
    s.stats.smarts = Math.round((s.stats.smarts + Math.min(ps.stats.smarts, 70) * (kid.age > 6 ? 1 : 0.4)) / 2);
    if (ps.stats.fame > 50) s.stats.fame = Math.round(ps.stats.fame * 0.3);
  };

  // ---------------------------------------------------------------- life summary
  E.lifeTitles = function (s) {
    var list = (RA.data.ribbons || []).filter(function (r) { return r.test(s, E); });
    list.sort(function (a, b) { return b.rank - a.rank; });
    if (!list.length) list.push({ id: 'ordinary', name: '평범한 인생', desc: '특별하지 않아서 특별했던 삶.', rank: 0 });
    return list;
  };

  E.summary = function (s) {
    var c = E.country(s), fb = s.fb;
    var titles = E.lifeTitles(s);
    var ach = (RA.data.achievements || []).filter(function (a) { return s.achievements[a.id]; });
    var best = s.jobHistory.slice().sort(function (a, b) { return b.level - a.level; })[0];
    var kids = s.people.filter(function (p) { return p.role === 'child'; });
    var spouseEver = s.people.filter(function (p) { return p.role === 'spouse' || (p.role === 'ex' && s.marriedAt); }).length;
    return {
      name: E.fullName(c, s.hero.surname, s.hero.given), country: c.name, age: s.age, cause: s.cause,
      born: s.birthYear, died: s.year, money: s.money, moneyText: T.money(s.money, c), fame: s.stats.fame,
      titles: titles, achievements: ach,
      football: fb.seasons ? { apps: fb.apps, goals: fb.goals, caps: fb.caps, natGoals: fb.natGoals, trophies: fb.trophies, clubs: fb.clubs } : null,
      bestJob: best || null, jobs: s.jobHistory.length, children: kids.length, married: !!spouseEver,
      degree: C.DEGREE_LABELS[s.edu.degree], generation: s.generation, seed: s.seed,
      story: E.lifeStory(s, titles, ach)
    };
  };

  E.lifeStory = function (s, titles, ach) {
    var c = E.country(s), v = E.vars(s), fb = s.fb, out = [];
    var nm = E.fullName(c, s.hero.surname, s.hero.given);
    out.push('【' + nm + ' (' + s.birthYear + '–' + s.year + ')】 ' + titles[0].name);
    if (s.generation > 1 && s.legacy) out.push(s.legacy.parentName + '의 자녀로, ' + s.generation + '대째 이어진 이야기.');
    else out.push(c.places.hometown + '에서 ' + v.fatherJob + '인 아버지와 ' + v.motherJob + '인 어머니 사이에서 사남매의 막내로 태어났다.');
    if (s.flags.moved_alone) out.push(s.flags.moved_alone + '세에 홀로 ' + c.places.bigcity + '의 ' + c.clubs.academy + '(으)로 떠났다.');
    if (s.flags.heart_fixed) out.push('15세의 심장 시술을 이겨 냈다.');
    if (fb.seasons) out.push('프로 축구 선수로 ' + fb.apps + '경기 ' + fb.goals + '골' + (fb.trophies.ballon ? ', 발롱도르 ' + fb.trophies.ballon + '회' : '') + (fb.trophies.wc ? ', 월드컵 우승' : '') + '. 거친 클럽: ' + fb.clubs.filter(function (x, i, a) { return a.indexOf(x) === i; }).join(' → ') + '.');
    else if (s.flags.fb_quit) out.push('한때 축구를 꿈꿨지만 다른 길을 택했다.');
    var best = s.jobHistory.slice().sort(function (a, b) { return b.level - a.level; })[0];
    if (best && best.id !== 'footballer') out.push(best.name + '(으)로 일하며 "' + best.title + '"까지 올랐다.');
    if (s.flags.father_sober) out.push('아버지의 회복을 끝까지 곁에서 도왔다.');
    else if (s.flags.father_dead && s.flags.father_drinking) out.push('아버지를 ' + s.flags.father_dead + '세에 떠나보냈다. 그 이후로 술은 입에 대지 않았다.');
    if (s.marriedAt) out.push(s.marriedAt + '세에 결혼했다.');
    var kids = s.people.filter(function (p) { return p.role === 'child'; }).length;
    if (kids) out.push('자녀 ' + kids + '명을 두었다.');
    if (s.flags.ever_jailed) out.push('감옥 밥도 먹어 봤다.');
    if (ach.length) out.push('업적: ' + ach.map(function (a) { return a.name; }).join(', ') + '.');
    out.push(s.age + '세에 ' + s.cause + '(으)로 눈을 감았다. 남긴 재산 ' + T.money(s.money, c) + '.');
    out.push('#호날두의모험 시드 ' + s.seed);
    return out.map(T.fixJosa).join('\n');
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
