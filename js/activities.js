/* Activities menu (age-unlocked). Each costs 1 action point (행동력); effects use the seeded RNG. */
(function (G) {
  var RA = G.RA = G.RA || {};
  var E = RA.Engine, T = RA.Text;

  function W(s) { return E.country(s).wage; }
  function inSchool(s) { return ['elem', 'middle', 'high', 'univ', 'grad'].indexOf(s.edu.stage) >= 0; }
  function eff(s, e) { return E.applyEffects(s, e, []); }

  // id, label, icon, minAge, maxAge, available(s) -> true | reason string, run(s, arg) -> text
  var A = [
    { id: 'play', label: '놀기', icon: '🧸', min: 1, max: 12, run: function (s) {
      eff(s, { happy: E.rint(s, 3, 6), smarts: E.chance(s, 0.3) ? 1 : 0 });
      return E.pick(s, ['블록으로 탑을 쌓았다가 와르르 무너뜨렸다.', '골목에서 술래잡기를 했다.', '빈 페트병을 공 삼아 찼다.', '모래성을 쌓았다.']);
    } },
    { id: 'football', label: '축구 연습', icon: '⚽', min: 3, max: 60, run: function (s) {
      var g = s.age < 30 ? E.rint(s, 1, 3) + (s.stats.grit > 60 ? 1 : 0) : E.rint(s, 0, 1);
      var cap = E.Football.cap(s);
      if (s.stats.football + g > cap) g = Math.max(0, cap - s.stats.football);
      eff(s, { football: g, health: 1, grit: E.chance(s, 0.5) ? 1 : 0, happy: 1 });
      s.y.trainedFb = (s.y.trainedFb || 0) + 1;
      if (s.age < 6) return '아빠가 가져온 낡은 공을 집 안에서 찼다. 엄마가 화분을 걱정했다.';
      return E.pick(s, ['해가 질 때까지 프리킥만 100개 찼다.', '발목에 모래주머니를 차고 드리블 연습을 했다.', '벽에 공을 차고 받기를 수천 번 반복했다.', '혼자 남아 헛다리 짚기 기술을 연마했다.']) + (g ? ' (축구 실력 +' + g + ')' : ' 몸이 예전 같지 않다.');
    } },
    { id: 'study', label: '공부', icon: '📚', min: 6, max: 120, run: function (s) {
      var g = E.rint(s, 2, 4);
      eff(s, { smarts: g, happy: -1 });
      s.edu.grades = E.clamp(s.edu.grades + E.rint(s, 3, 8), 0, 100);
      s.y.studied = (s.y.studied || 0) + 1;
      if (s.job) s.job.perf = E.clamp(s.job.perf + 3, 0, 100);
      return E.pick(s, ['도서관 문 닫을 때까지 버텼다.', '문제집 한 권을 끝냈다.', '졸면서도 단어장을 넘겼다.', '인터넷 강의를 2배속으로 정주행했다.']) + ' (지능 +' + g + ')';
    } },
    { id: 'exercise', label: '운동', icon: '🏋️', min: 5, max: 120, run: function (s) {
      eff(s, { health: E.rint(s, 2, 4), looks: E.chance(s, 0.5) ? 1 : 0, grit: 1, happy: 1 });
      return E.pick(s, ['새벽 달리기를 했다.', '팔굽혀펴기 100개. 내일 팔이 안 올라갈 것 같다.', '수영장에서 몇 바퀴를 돌았다.', '줄넘기 2단 뛰기에 성공했다.']);
    } },
    { id: 'family', label: '가족과 시간', icon: '🏠', min: 1, max: 120, run: function (s) {
      eff(s, { happy: 2, rel: { family: E.rint(s, 3, 6) } });
      var dad = E.person(s, 'father');
      if (dad && dad.alive && s.flags.father_drinking && !s.flags.father_sober && s.age >= 8) {
        dad.recovery = Math.min(100, (dad.recovery || 0) + 6);
        return '아버지 곁에 앉아 오래 이야기를 나눴다. 오늘은 술병 대신 내 경기 이야기를 하셨다.';
      }
      return E.render(s, E.pick(s, ['{mother}[이/가] 만들어 준 {food}[을/를] 다 같이 먹었다.', '{bro}[과/와] 낡은 소파에서 TV로 축구를 봤다.', '{sis1}[과/와] {sis2}[이/가] 머리를 땋아 주겠다며 쫓아왔다.', '온 가족이 좁은 거실에 모여 웃었다.']));
    } },
    { id: 'friends', label: '친구 만나기', icon: '🤝', min: 5, max: 120, run: function (s) {
      var f = E.person(s, 'friend');
      if (!f) {
        if (E.chance(s, 0.55 + s.stats.looks / 300)) return E.FX.newFriend(s);
        eff(s, { happy: -1 });
        return '놀이터에 갔지만 말을 걸 용기가 나지 않았다.';
      }
      eff(s, { happy: 3, rel: { friend: E.rint(s, 4, 8) } });
      return E.render(s, E.pick(s, ['{friend}[과/와] 밤새 수다를 떨었다.', '{friend}[과/와] 길거리 음식으로 배를 채웠다.', '{friend}[과/와] 게임을 하다가 싸우고 다시 화해했다.']));
    } },
    { id: 'date', label: '데이트', icon: '💘', min: 15, max: 100, run: function (s) {
      var p = E.person(s, 'partner') || E.person(s, 'spouse');
      if (!p) {
        if (E.chance(s, 0.25 + s.stats.looks / 160 + s.stats.fame / 300)) return E.FX.newPartner(s);
        eff(s, { happy: -2 });
        return E.pick(s, ['소개팅 상대가 화장실 간다더니 돌아오지 않았다.', '고백했지만 "좋은 친구로 지내자"는 답을 들었다.', '데이트 앱을 깔았다가 지웠다.']);
      }
      eff(s, { happy: 4, rel: { partner: 7, spouse: 7 } });
      if (p.role === 'partner' && s.age >= 20 && p.rel >= 70 && E.chance(s, 0.35)) { E.queueSys(s, 'sys_proposal', 2); }
      return E.render(s, E.pick(s, ['{partner}[과/와] 바닷가를 걸었다.', '{partner}[과/와] 영화를 보다 둘 다 졸았다.', '{partner}에게 {food}[을/를] 만들어 줬다. 맛은… 마음이 중요하다.'])).replace(/연인/g, E.displayName(s, p));
    } },
    { id: 'parttime', label: '아르바이트', icon: '🧾', min: 14, max: 120, avail: function (s) { return s.job && E.careerIndex()[s.job.id].sector !== 'parttime' ? '이미 직장이 있다' : true; }, run: function (s) {
      var pay = Math.round(E.rint(s, 400, 1200) * W(s));
      s.money += pay; eff(s, { happy: -1, grit: 1 });
      return E.pick(s, ['편의점 야간 알바를 했다.', '전단지를 돌렸다.', '식당에서 설거지를 했다.', '이삿짐을 날랐다.']) + ' +' + T.money(pay, E.country(s));
    } },
    { id: 'work', label: '열심히 일하기', icon: '💼', min: 14, max: 120, avail: function (s) { return s.job ? true : '직장이 없다'; }, run: function (s) {
      s.y.workHard = true;
      s.job.perf = E.clamp(s.job.perf + E.rint(s, 6, 12), 0, 100);
      eff(s, { health: -1, happy: -1, grit: 1 });
      return '야근을 자청했다. 상사가 처음으로 이름을 기억했다.';
    } },
    { id: 'doctor', label: '병원 가기', icon: '🏥', min: 1, max: 120, run: function (s) {
      var cost = Math.round(150 * W(s));
      if (s.age >= 18) s.money -= cost;
      if (s.sick && E.chance(s, 0.55)) return E.FX.cure(s);
      eff(s, { health: E.rint(s, 3, 7) });
      return s.sick ? s.sick.name + ' 치료를 받았다. 조금 나아졌다.' : '건강검진을 받았다. "운동 꾸준히 하세요."';
    } },
    { id: 'look', label: '외모 가꾸기', icon: '💇', min: 12, max: 120, run: function (s) {
      var cost = Math.round(120 * W(s)); if (s.age >= 18) s.money -= cost;
      s.hero.hair = (s.hero.hair + 1) % 5;
      eff(s, { looks: E.rint(s, 1, 3), happy: 2 });
      return '새 헤어스타일로 바꿨다. 거울 앞에서 한참 서 있었다.';
    } },
    { id: 'meditate', label: '명상', icon: '🧘', min: 8, max: 120, run: function (s) {
      eff(s, { happy: E.rint(s, 2, 5), health: 1, grit: 1 });
      return '눈을 감고 호흡에 집중했다. 마음이 잔잔해졌다.';
    } },
    { id: 'travel', label: '여행', icon: '✈️', min: 16, max: 100, avail: function (s) { return s.money >= 1500 * W(s) ? true : '돈이 부족하다'; }, run: function (s) {
      s.money -= Math.round(1500 * W(s)); s.flags.traveler = s.flags.traveler || s.age;
      eff(s, { happy: E.rint(s, 6, 10), smarts: 1 });
      return E.pick(s, ['배낭 하나 메고 이웃 나라를 돌았다.', '바닷가 마을에서 일주일을 보냈다.', '처음 보는 음식에 도전했다.']);
    } },
    { id: 'invest', label: '투자', icon: '📈', min: 20, max: 110, avail: function (s) { return s.money >= 1000 * W(s) ? true : '투자할 돈이 없다'; }, run: function (s) {
      var stake = Math.round(Math.max(1000 * W(s), s.money * 0.2));
      var r = E.rnd(s), mult = r < 0.05 ? 2 : r < 0.5 ? 1 + E.rnd(s) * 0.3 : r < 0.88 ? 1 - E.rnd(s) * 0.35 : 0.2;
      mult += (s.stats.smarts - 50) / 500;
      var gain = Math.round(stake * (mult - 1));
      s.money += gain;
      eff(s, { happy: gain > 0 ? 3 : -4 });
      return (gain >= 0 ? '투자 수익 +' : '투자 손실 ') + T.money(gain, E.country(s)) + (mult > 2 ? ' 대박이다!' : mult < 0.3 ? ' 휴지 조각이 됐다…' : '');
    } },
    { id: 'lotto', label: '복권 사기', icon: '🎟️', min: 18, max: 120, run: function (s) {
      s.money -= Math.round(5 * W(s));
      if (E.chance(s, 0.0015)) return E.FX.lottery(s);
      if (E.chance(s, 0.05)) { var w = Math.round(200 * W(s)); s.money += w; return '4등 당첨! +' + T.money(w, E.country(s)); }
      return '꽝. 다음 주엔 될 것 같다.';
    } },
    { id: 'crime', label: '범죄', icon: '🦹', min: 14, max: 100, opts: [['shoplift', '가게 물건 훔치기'], ['pickpocket', '소매치기'], ['burglary', '빈집 털기'], ['fraud', '사기 치기']], run: function (s, arg) {
      var t = { shoplift: [0.25, 80], pickpocket: [0.3, 300], burglary: [0.4, 3000], fraud: [0.35, 8000] }[arg || 'shoplift'];
      var catchP = t[0] - (s.stats.smarts - 50) / 250;
      eff(s, { happy: -1 });
      s.flags.criminal = s.flags.criminal || s.age;
      if (E.chance(s, catchP)) {
        if (s.age < 18) { eff(s, { rel: { mother: -12, father: -8 }, fame: 1 }); return '현장에서 붙잡혔다. 경찰서에 엄마가 울면서 왔다.'; }
        return '현장에서 체포됐다. ' + E.FX.jail(s);
      }
      var loot = Math.round(t[1] * (0.5 + E.rnd(s)) * W(s));
      s.money += loot;
      return '들키지 않았다. +' + T.money(loot, E.country(s)) + '. 심장이 아직도 쿵쾅거린다.';
    } },
    { id: 'jobs', label: '구직/이직', icon: '🔎', min: 14, max: 75, ui: 'jobs' },
    { id: 'quitjob', label: '퇴사', icon: '🚪', min: 14, max: 120, avail: function (s) { return s.job ? true : '직장이 없다'; }, ap: 0, run: function (s) { return E.FX.quitJob(s); } },
    { id: 'joinclub', label: '동네 축구클럽 입단', icon: '🥅', min: 5, max: 16, avail: function (s) { return s.fb.stage === 'none' && !s.flags.fb_quit ? true : '이미 소속팀이 있다'; }, run: function (s) { return E.FX.joinLocalClub(s); } },
    { id: 'quitfb', label: '축구 그만두기', icon: '🥾', min: 8, max: 45, avail: function (s) { return ['local', 'regional', 'academy', 'youth', 'pro'].indexOf(s.fb.stage) >= 0 ? true : '소속팀이 없다'; }, ap: 0, run: function (s) { return s.fb.stage === 'pro' ? E.FX.retireFootball(s) : E.FX.quitFootball(s); } },
    { id: 'kids', label: '아이와 놀기', icon: '👶', min: 18, max: 120, avail: function (s) { return E.peopleByRel(s, 'children').length ? true : '아이가 없다'; }, run: function (s) {
      eff(s, { happy: 4, rel: { children: 7 } });
      return E.render(s, '{child}[과/와] 공원에서 공을 찼다. 슈팅 자세가 누굴 닮았다.');
    } },
    { id: 'baby', label: '아이 갖기', icon: '🍼', min: 20, max: 50, avail: function (s) { return E.person(s, 'spouse') ? true : '배우자가 필요하다'; }, run: function (s) {
      if (E.chance(s, 0.6)) return E.FX.haveChild(s);
      return '아직 소식이 없다. 조급해하지 않기로 했다.';
    } },
    { id: 'pet', label: '반려동물 입양', icon: '🐶', min: 8, max: 100, avail: function (s) { return s.flags.has_pet ? '이미 반려동물이 있다' : true; }, run: function (s) {
      eff(s, { happy: 6 }); return E.FX.adoptPet(s) + ' 이름은 "' + E.pick(s, ['골키퍼', '드리블', '코너킥', '뭉치', '보리']) + '".';
    } },
    { id: 'house', label: '집 사기', icon: '🏡', min: 25, max: 100, avail: function (s) { return s.flags.homeowner ? '이미 집이 있다' : true; }, run: function (s) { return E.FX.buyHouse(s); } },
    { id: 'car', label: '차 사기', icon: '🚗', min: 18, max: 100, avail: function (s) { return s.flags.car_owner ? '이미 차가 있다' : true; }, run: function (s) { return E.FX.buyCar(s); } },
    { id: 'donate', label: '기부', icon: '🎁', min: 18, max: 120, avail: function (s) { return s.money > 2000 * W(s) ? true : '여윳돈이 없다'; }, run: function (s) {
      var d = Math.round(s.money * 0.1); s.money -= d;
      eff(s, { happy: 5, fame: s.stats.fame > 30 ? 3 : 1 });
      s.donated = (s.donated || 0) + d;
      return T.money(d, E.country(s)) + '을(를) 어린이 병원에 기부했다.';
    } },
    { id: 'blood', label: '헌혈', icon: '🩸', min: 16, max: 69, run: function (s) {
      eff(s, { happy: 3, health: -1 });
      s.bloodDonations = (s.bloodDonations || 0) + 1;
      return '헌혈을 했다. 간호사가 건넨 과자가 유난히 달았다.';
    } }
  ];
  E.ACTIVITIES = A;

  E.activities = function (s) {
    return A.filter(function (a) { return s.age >= a.min && s.age <= a.max; }).map(function (a) {
      var av = a.avail ? a.avail(s) : true;
      var cost = a.ap === 0 ? 0 : 1;
      if (av === true && s.jail > 0 && ['study', 'exercise', 'meditate', 'family'].indexOf(a.id) < 0) av = '수감 중에는 할 수 없다';
      if (av === true && cost && s.ap <= 0) av = '올해 행동력을 다 썼다';
      return { id: a.id, label: a.label, icon: a.icon, ok: av === true, reason: av === true ? '' : av, opts: a.opts || null, ui: a.ui || null, cost: cost };
    });
  };

  E.doActivity = function (s, id, arg) {
    var a = A.filter(function (x) { return x.id === id; })[0];
    if (!a || !s.alive || s.queue.length) return null;
    var list = E.activities(s).filter(function (x) { return x.id === id; })[0];
    if (!list || !list.ok || !a.run) return { ok: false, log: list ? list.reason : '지금은 할 수 없다.' };
    if (list.cost) s.ap--;
    var before = JSON.parse(JSON.stringify(s.stats)), m0 = s.money;
    var text = a.run(s, arg) || '';
    var changes = [];
    Object.keys(before).forEach(function (k) { if (s.stats[k] !== before[k]) changes.push({ k: k, d: s.stats[k] - before[k] }); });
    if (s.money !== m0) changes.push({ k: 'money', d: s.money - m0 });
    E.addLog(s, a.icon + ' ' + text, 'act');
    E.checkAchievements(s);
    E.checkDeath(s, true);
    return { ok: true, log: T.fixJosa(text), changes: changes };
  };
  void inSchool;
})(typeof globalThis !== 'undefined' ? globalThis : this);
