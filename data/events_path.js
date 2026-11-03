/* 진로: career worries and real decisions at 13-14, 16-17 and 19-20, aptitude discovery, teen part-time
 * offers, adult career changes, and events for the unusual careers of round 5. Ids prefixed path_. */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};
  var EV = RA.data.events = RA.data.events || [];
  function E(ev) { EV.push(ev); }
  E({ id: 'path_friend_return', age: [18, 90], cooldown: 8, decision: true,
    text: '연락을 끊었던 친구가 지난 일을 사과하고 다시 만나고 싶다고 한다.',
    when: function (s) { return !RA.Engine.person(s, 'friend') && s.people.some(function (p) { return p.alive && p.role === 'oldfriend' && p.estrangedAt != null && s.age - p.estrangedAt >= 2; }); },
    textFn: function (s) { var p = s.people.filter(function (p) { return p.alive && p.role === 'oldfriend' && p.estrangedAt != null; })[0]; return p.name + '에게 연락이 왔다. ' + (p.unpaidDebt ? '빌린 돈을 갚지 않아 멀어진 사이였다. 이제 전액을 갚고 사과하고 싶다고 한다.' : '갈등 끝에 연락을 끊었던 친구다. 지난 일을 사과하고 다시 만나고 싶다고 한다.'); },
    choices: [
      { text: '사과를 받아들이고 천천히 다시 알아간다', effects: { fx: ['acceptFriendReturn'] }, log: '지난 일을 없던 일로 하지는 않기로 했다.' },
      { text: '다시 연락하지 않겠다고 말한다', effects: { grit: 1 }, log: '거리를 유지하기로 했다.' }
    ] });
  // two events per unusual career: (id, ages, text, choices)
  function C2(career, list) { list.forEach(function (ev, i) { ev.id = 'path_' + career + '_' + (i + 1); ev.cond = Object.assign({ career: [career] }, ev.cond || {}); ev.cooldown = ev.cooldown || 4; EV.push(ev); }); }

  // ================================================================ 진로 고민 milestones
  // The two school crossroads pick an education track (s.track); the choices are built by js/routes.js
  // from the hero's talents, body and current route, and named per country (data/routes.js trackNames).
  E({ id: 'path_13', age: [13, 14], once: true, priority: true,
    text: '앞으로 무엇을 배울지 생각해 본다. "{name}, 어떤 분야에 관심이 있니?" 고른 과정에 따라 열리는 길이 달라진다.',
    choicesFn: function (s) { return RA.Engine.Routes.trackChoices13(s); } });
  E({ id: 'path_16', age: [16, 17], once: true, priority: true,
    when: function (s) { return s.route && s.route.id !== 'football'; },
    text: '앞으로 공부와 훈련에 힘을 쏟을 분야를 고를 때다. 지금 내게 맞는 과정은 무엇일까?',
    choicesFn: function (s) { return RA.Engine.Routes.trackChoices16(s); } });
  E({ id: 'path_16_football', age: [16, 18], once: true, priority: true,
    cond: { fb: ['academy', 'youth'] },
    text: '유스 감독이 진지하게 묻는다. "학업과 축구, 이제 하나를 골라야 할 때다."',
    choices: [
      { text: '축구에 모든 것을 건다', effects: { football: 4, grit: 3, smarts: -1, flags: ['path_football'] }, log: '책가방을 사물함에 넣고 축구화 끈을 다시 묶었다.' },
      { text: '공부도 놓지 않는다', effects: { smarts: 3, football: 1, health: -1 }, log: '버스 안에서 단어장을 넘기고, 훈련장에선 이를 악물었다.' },
      { text: '축구를 그만두고 공부한다', effects: { smarts: 4, fx: ['quitFootball'], flags: ['path_study'] }, run: function (s) { s.track = 'study'; }, log: '어려운 결정이었다. 그래도 내가 고른 길이다.' }
    ] });
  E({ id: 'path_19', age: [19, 20], once: true, priority: true,
    cond: { career: 'none', edu: ['none'] },
    text: '스무 살 무렵. 앞으로 걸어갈 길을 생각한다.',
    choices: [
      { text: '💼 바로 취업한다', effects: { grit: 2, fx: ['quickJob'] }, log: '일자리를 찾아 나섰다. 새로운 시작이 낯설었다.' },
      { text: '🚀 창업에 도전한다', risky: true, check: { odds: 0.45 },
        success: { effects: { money: 3000, fame: 2, happy: 4 }, log: '작은 가게로 시작했다. 첫 손님에게 고개를 깊이 숙였다.' },
        fail: { effects: { money: -4000, happy: -5 }, log: '석 달 만에 문을 닫았다. 손실과 경험이 남았다.' } },
      { text: '🎖️ 군에 입대한다', effects: { fx: ['enlist'] }, log: '머리를 짧게 깎고 거울을 봤다. 낯선 얼굴이었다.' },
      { text: '✈️ 해외로 떠난다', req: { money: 3000 }, effects: { money: -3000, smarts: 2, fx: ['moveAbroad'] }, log: '공항에서 익숙한 풍경에 작별했다. 새로운 세계가 기다린다.' }
    ] });
  E({ id: 'path_19_football', age: [19, 20], once: true, priority: true,
    cond: { fb: ['academy', 'youth', 'pro'] },
    text: '스무 살을 앞두고 감독과 다음 시즌을 의논했다. 지금은 축구 안에서 내 자리를 찾을 때다.',
    choices: [
      { text: '주전 경쟁에 집중한다', effects: { football: 3, grit: 2 }, log: '출전 기회는 보장되지 않는다. 훈련으로 보여 주기로 했다.' },
      { text: '학업을 병행하며 준비한다', effects: { smarts: 3, football: 1, health: -1 }, log: '훈련이 끝나면 책을 폈다. 축구 이후의 삶도 천천히 준비한다.' },
      { text: '감독과 출전 계획을 상담한다', effects: { football: 1, social: 2, grit: 2 }, log: '당장 이적을 약속받지는 못했다. 먼저 부족한 부분부터 보완하기로 했다.' }
    ] });
  E({ id: 'path_19_plans', age: [19, 20], once: true, priority: true,
    when: function (s) { return !RA.Engine.activeFootball(s) && (!!s.job || s.edu.stage !== 'none'); },
    text: '스무 살을 앞두고 지금 하는 일과 앞으로의 계획을 돌아봤다.',
    choices: [
      { text: '지금의 길에서 실력을 쌓는다', effects: { smarts: 2, grit: 2 }, log: '당장 진로를 바꾸기보다 지금의 경험을 쌓기로 했다.' },
      { text: '미래를 위해 조금씩 저축한다', effects: { grit: 2, happy: 1 }, log: '작은 목표부터 세웠다. 서두르지 않아도 된다.' }
    ] });
  E({ id: 'path_19_family_trade', age: [19, 30], once: true, weight: 20,
    cond: { career: 'none', rel: { father: 'alive' }, flags: ['!heir'] },
    text: '{father}[이/가] 조심스럽게 묻는다. "공원 일, 같이 해 볼 생각 있니? 나무랑 꽃은 거짓말을 안 한다."',
    choices: [
      { text: '가업을 잇는다', career: 'forester', effects: { rel: { father: 10 }, grit: 2 }, log: '{father}[과/와] 나란히 화단을 정리했다. 손이 닮아 있었다.' },
      { text: '내 길을 찾겠다고 말한다', effects: { rel: { father: -2 }, happy: 1 }, log: '{father}[은/는] 고개를 끄덕였다. "그래, 네 인생이다."' }
    ] });

  // ================================================================ aptitude discovery (8-17)
  E({ id: 'path_talent_math', age: [9, 16], once: true, cond: { stats: { smarts: [65, 100] } },
    text: '수학 문제를 푸는 모습을 본 선생님이 묻는다. "너, 경시대회 나가 볼래? 머리가 남다르다."',
    choices: [
      { text: '도전한다', check: { stat: 'smarts', diff: 60 },
        success: { effects: { smarts: 3, fame: 2, flags: ['talent_science'] }, log: '은상! 공부하는 재미가 더 커졌다.' },
        fail: { effects: { smarts: 1, happy: -1 }, log: '본선에서 떨어졌지만 세상은 넓다는 걸 배웠다.' } },
      { text: '축구 시간이 줄어서 싫다', alt: { text: '{hobbyAct} 시간이 줄어서 싫다', effects: { happy: 1 } }, effects: { football: 1 }, log: '선생님이 아쉬워했다.' }
    ] });
  E({ id: 'path_talent_looks', age: [12, 19], once: true, cond: { stats: { looks: [70, 100] } },
    text: '길을 걷는데 누군가 명함을 내민다. "연예 기획사입니다. 오디션 볼래요?"',
    choices: [
      { text: '오디션을 본다', check: { stat: 'looks', diff: 65 },
        success: { effects: { fame: 3, happy: 4, flags: ['talent_star'] }, log: '연습생 계약 제안을 받았다. 진로에 "연예인"이 생겼다.' },
        fail: { effects: { happy: -2 }, log: '카메라 앞에서 얼어 버렸다. 그래도 신기한 경험이었다.' } },
      { text: '수상해서 거절한다', effects: { smarts: 1 }, log: '명함은 버렸다. 신중하게 판단하길 잘했다고 생각했다.' }
    ] });
  E({ id: 'path_talent_social', age: [10, 17], once: true, cond: { stats: { social: [65, 100] } },
    text: '또래 모임에서 대표를 뽑는다. 사람들이 나가 보라고 등을 떠민다.',
    choices: [
      { text: '출마한다', check: { stat: 'social', diff: 55 },
        success: { effects: { social: 3, rep: 5, flags: ['talent_leader'] }, log: '당선! 연설하는 내내 손이 떨렸지만 아무도 몰랐다.' },
        fail: { effects: { happy: -2, social: 1 }, log: '한 표 차로 졌다. 다음엔 더 잘할 수 있다.' } },
      { text: '친구를 밀어준다', effects: { social: 2, rel: { friend: 6 } }, log: '친구가 당선됐다. 내 선거 운동이 한몫했다.' }
    ] });
  E({ id: 'path_talent_hands', age: [10, 17], once: true, cond: { stats: { grit: [60, 100] } },
    text: '동네 정비소 아저씨가 고장 난 자전거를 고치는 걸 보고 말한다. "손재주가 좋구나."',
    choices: [
      { text: '주말마다 일을 배운다', check: { stat: 'grit', diff: 55 },
          success: { effects: { grit: 2, smarts: 1, flags: ['talent_hands', 'path_trade'] }, log: '기름 묻은 장갑이 훈장처럼 느껴졌다.' },
          fail: { effects: { health: -3, grit: 1 }, log: '첫 주에 렌치에 손가락을 찧었다. 아저씨는 "손재주보다 조심성이 먼저"라며 돌려보냈다.' } },
      { text: '고맙다고만 한다', effects: { happy: 1 }, log: '자전거를 타고 바람을 갈랐다.' }
    ] });
  E({ id: 'path_talent_game', age: [12, 19], once: true, cond: { stats: { smarts: [50, 100] } },
    text: 'PC방 랭킹 1위에 내 아이디가 올라갔다. 프로팀 스카우트가 메시지를 보냈다.',
    choices: [
      { text: '프로게이머 테스트를 본다', risky: true, check: { stat: 'smarts', diff: 60 },
        success: { effects: { fame: 3, happy: 4, flags: ['talent_gamer'] }, log: '테스트 통과! 숙소 생활 제안을 받았다.' },
        fail: { effects: { happy: -3, smarts: -1 }, log: '프로의 벽은 높았다. 밤샘만 남았다.' } },
      { text: '취미로 남긴다', effects: { health: 1 }, log: '게임은 즐길 때가 제일 재밌다.' }
    ] });
  E({ id: 'path_talent_trickster', age: [11, 19], once: true, cond: { traits: { mischief: [25, 100] } },
    text: '말재주로 친구들 간식을 모조리 따냈다. 누가 말한다. "너 나중에 장사하면 대박 나겠다."',
    choices: [
      { text: '이 재능으로 돈을 벌어 본다', risky: true, check: { stat: 'social', diff: 50 },
          success: { effects: { mischief: 4, money: 50, flags: ['talent_trickster'] }, log: '시장 골목 어르신들이 "장사 수완이 좋다"며 웃었다.' },
          fail: { effects: { mischief: 3, money: -20, rep: -3, rel: { mother: -3 } }, log: '부풀린 값에 속은 손님이 항의했다. 돈을 돌려주며 손해까지 봤다.' } },
      { text: '친구들에게 간식을 돌려준다', effects: { rep: 3, social: 2, mischief: -2 }, log: '다들 웃으며 다시 나눠 먹었다.' }
    ] });

  // ================================================================ teen part-time offers (15-19)
  [
    ['path_pt_store', '편의점 사장님이 알바를 구한다.', 'convenience_clerk', '근무 중 컵라면 냄새가 위로가 됐다.'],
    ['path_pt_delivery', '배달 앱 광고가 뜬다. "원하는 시간에 일하세요."', 'delivery_rider', '배달 중 길을 잃었지만 손님이 웃어 줬다.'],
    ['path_pt_cafe', '카페에 "알바 구함" 쪽지가 붙었다.', 'cafe_parttime', '라테 아트 하트가 예쁘게 나왔다.'],
    ['path_pt_ballboy', '{bigClub} 홈경기 볼보이를 모집한다.', 'ballboy', '프로 선수들의 땀 냄새를 바로 앞에서 맡았다.'],
    ['path_pt_tutor', '옆집에서 초등학생 과외를 부탁한다.', 'tutor_parttime', '아이가 백 점을 받아 왔다.'],
    ['path_pt_flyer', '전단지 아르바이트 자리가 났다. 일당은 바로 준다.', 'flyer_parttime', '하루 종일 걸어 다리가 퉁퉁 부었다. 그래도 내 돈이다.']
  ].forEach(function (x) {
    E({ id: x[0], age: [15, 19], once: true, decision: true, cond: { career: 'none' },
      text: x[1],
      choices: [
        { text: '해 본다', career: x[2], effects: { grit: 2, money: 100 }, log: x[3] },
        { text: '공부와 운동에 집중한다', effects: { smarts: 1, health: 1 }, log: '시간은 돈보다 귀하다고 믿기로 했다.' }
      ] });
  });

  // ================================================================ adult career changes
  E({ id: 'path_job_offer', age: [27, 55], cooldown: 6, decision: true, cond: { career: 'any' },
    text: '새 일자리를 소개받았다. 조건은 좋아 보이지만 익숙한 일을 떠나야 한다.',
    choices: [
      { text: '이직한다', risky: true, check: { odds: 0.6 },
        success: { effects: { money: 3000, happy: 3, fx: ['quitJob', 'quickJob'] }, log: '새 명함을 받았다. 공기가 달랐다.' },
        fail: { effects: { happy: -4, fx: ['quitJob'] }, log: '막상 가 보니 자리가 없어졌다고 한다. 실업자가 됐다.' } },
      { text: '지금 자리를 지킨다', effects: { grit: 2, rep: 2 }, log: '익숙한 자리에서 계속 일하기로 했다.' }
    ] });
  E({ id: 'path_startup_itch', age: [28, 55], cooldown: 7, decision: true, cond: { career: 'any' },
    text: '일을 마치고 문득 생각한다. "내 사업을 시작해 보면 어떨까?"',
    choices: [
      { text: '하던 일을 그만두고 창업한다', risky: true, career: 'entrepreneur', effects: { money: -5000, happy: 3, grit: 2 }, log: '작은 사무실 열쇠를 받았다. 두렵고 설렌다.' },
      { text: '주말에 부업으로 시작해 본다', effects: { money: 500, health: -1, grit: 1 }, log: '주말이 사라졌지만 통장에 작은 숫자가 늘었다.' },
      { text: '지금이 좋다', effects: { happy: 1 }, log: '안정도 하나의 재능이다.' }
    ] });
  E({ id: 'path_restaurant', age: [30, 60], cooldown: 8, decision: true, cond: { money: [8000, 1e12] },
    text: '{mother}의 손맛을 살려 {food} 가게를 열어 보라는 말을 들었다.',
    choices: [
      { text: '가게를 연다', risky: true, career: 'restaurant_owner', effects: { money: -8000, happy: 4 }, log: '간판에 가족 이름을 넣었다.' },
      { text: '레시피만 공책에 적어 둔다', effects: { happy: 1, rel: { mother: 3 } }, log: '언젠가를 위한 공책이 생겼다.' }
    ] });
  E({ id: 'path_abroad_post', age: [25, 50], once: true, decision: true, cond: { career: 'any', flags: ['!abroad'] },
    text: '해외에서 일할 기회를 소개받았다. 익숙한 생활을 떠나야 한다.',
    choices: [
      { text: '간다', effects: { smarts: 2, money: 2000, fx: ['moveAbroad'] }, log: '낯선 도시의 아침 공기가 차가웠다.' },
      { text: '익숙한 곳에 남는다', effects: { rel: { family: 4 } }, log: '지금의 생활을 이어 가기로 했다.' }
    ] });
  E({ id: 'path_union', age: [25, 60], cooldown: 8, decision: true, cond: { career: 'any' },
    text: '같은 업계 사람들이 일하는 환경을 개선하자며 함께 목소리를 내자고 한다.',
    choices: [
      { text: '앞장선다', risky: true, check: { stat: 'social', diff: 50 },
        success: { effects: { rep: 6, social: 3, money: 1000 }, log: '협상이 타결됐다. 동료들이 어깨를 두드렸다.' },
        fail: { effects: { rep: 2, fx: ['fired'] }, log: '반발을 산 끝에 하던 일을 떠나게 됐다. 그래도 후회는 없다.' } },
      { text: '조용히 지켜본다', effects: { happy: -1 }, log: '회의실 밖에서 결과를 기다렸다.' }
    ] });
  E({ id: 'path_promotion_exam', age: [25, 58], cooldown: 5, decision: true, cond: { career: 'any' },
    text: '업무 능력을 평가받을 기회가 생겼다. 준비하려면 석 달은 저녁이 없다.',
    choices: [
      { text: '준비한다', check: { stat: 'smarts', diff: 50 },
        success: { effects: { fx: ['promote'], health: -1 }, log: '좋은 평가를 받았다. 쌓아 온 실력을 보여 줬다.' },
        fail: { effects: { happy: -3, health: -1 }, log: '떨어졌다. 다음 해를 기약했다.' } },
      { text: '지금 자리도 충분하다', effects: { happy: 2, health: 1 }, log: '저녁이 있는 삶을 택했다.' }
    ] });
  E({ id: 'path_second_act', age: [58, 75], once: true, decision: true, cond: { career: 'none' },
    text: '일을 쉬는 요즘, 하루가 길게 느껴진다. 새 일을 시작해 볼까?',
    choices: [
      { text: '작은 카페를 연다', career: 'barista', effects: { money: -3000, happy: 4 }, log: '단골 손님들이 이름을 불러 준다.' },
      { text: '노점을 연다', career: 'street_vendor', effects: { happy: 3, social: 2 }, log: '시장 사람들과 금세 친해졌다.' },
      { text: '택시 운전을 시작한다', career: 'taxi_driver', effects: { happy: 2 }, log: '손님들의 인생 이야기가 라디오보다 재밌다.' },
      { text: '푹 쉰다', effects: { health: 2, happy: 1 }, log: '낮잠이 이렇게 달 줄이야.' }
    ] });
  E({ id: 'path_odd_job_offer', age: [20, 50], cooldown: 6, decision: true, cond: { career: 'none' },
    text: '구인 게시판에 특이한 일자리가 잔뜩 붙어 있다.',
    choices: [
      { text: '스트리머가 되어 본다', career: 'streamer', effects: { happy: 2 }, log: '방송을 켜자 시청자 세 명이 들어왔다. 채팅창에 인사를 건넸다.' },
      { text: '대리운전을 시작한다', career: 'designated_driver', effects: { grit: 2 }, log: '손님이 차에서 노래를 불렀다.' },
      { text: '산으로 심마니를 따라간다', career: 'simmani', effects: { health: 2 }, log: '산은 조용했고, 바람은 차가웠다.' },
      { text: '좀 더 찾아본다', effects: { smarts: 1 }, log: '이력서를 다시 고쳐 썼다.' }
    ] });
  E({ id: 'path_dark_offer', age: [18, 50], cooldown: 6, decision: true, cond: { traits: { mischief: [40, 100] }, career: 'none' },
    text: '뒷골목에서 알던 형이 일을 제안한다. "쉬운 일이야. 입만 다물면 돼."',
    choices: [
      { text: '야바위판에 들어간다', risky: true, career: 'yabawi', effects: { mischief: 4, money: 500 }, log: '컵 세 개와 구슬 하나. 손이 눈보다 빨라야 한다.' },
      { text: '밀수 일을 돕는다', risky: true, career: 'smuggler', effects: { mischief: 5, money: 1000 }, log: '항구의 밤은 생각보다 시끄러웠다.' },
      { text: '거절한다', effects: { rep: 3, mischief: -3 }, log: '형은 "후회할걸"이라며 웃었다. 후회하지 않았다.' }
    ] });

  // ================================================================ events for the unusual careers
  C2('yabawi', [
    { age: [18, 70], text: '구경꾼 중 한 명이 판을 유심히 본다. 사복 경찰 같다.',
      choices: [
        { text: '판을 계속 돌린다', risky: true, check: { odds: 0.5 },
          success: { effects: { money: 800, mischief: 3 }, log: '그는 그냥 구경꾼이었다. 오늘 수입이 짭짤하다.' },
          fail: { effects: { record: 1, rep: -5, fx: ['fired'] }, log: '현장에서 붙잡혔다. 벌금과 함께 판이 끝났다.' } },
        { text: '판을 접고 자리를 뜬다', effects: { mischief: -1 }, log: '골목 모퉁이를 돌자 진짜 경찰차가 지나갔다.' }
      ] },
    { age: [18, 70], text: '야바위판에서 아이가 용돈을 다 잃고 울고 있다.',
      choices: [
        { text: '돈을 돌려준다', effects: { rep: 4, mischief: -3, happy: 2 }, log: '"다신 오지 마라." 아이가 고개를 끄덕였다.' },
        { text: '못 본 척한다', risky: true, effects: { mischief: 4, money: 30, happy: -2 }, log: '그날 밤 이상하게 잠이 오지 않았다.' }
      ] }
  ]);
  C2('smuggler', [
    { age: [18, 65], text: '세관 검색이 강화됐다는 소문이 돈다. 오늘 물건은 크다.',
      choices: [
        { text: '그대로 진행한다', risky: true, check: { odds: 0.55 },
          success: { effects: { money: 6000, mischief: 3 }, log: '컨테이너가 무사히 빠져나갔다.' },
          fail: { effects: { fx: ['jail'] }, log: '세관견이 짖었다. 수갑이 차가웠다.' } },
        { text: '이번 건은 빠진다', effects: { rep: 1 }, log: '다른 놈들이 그날 줄줄이 잡혔다는 뉴스를 봤다.' }
      ] },
    { age: [25, 65], text: '조직이 더 위험한 물건을 맡기려 한다. 돈은 열 배다.',
      choices: [
        { text: '받는다', risky: true, check: { odds: 0.4 },
          success: { effects: { money: 20000, mischief: 5, fx: ['promote'] }, log: '조직 안에서 이름이 올라갔다.' },
          fail: { effects: { fx: ['jail'], health: -5 }, log: '배신자가 있었다. 모든 게 무너졌다.' } },
        { text: '손을 씻는다', effects: { mischief: -5, rep: 4, fx: ['quitJob'] }, log: '항구를 떠나는 발걸음이 가벼웠다.' }
      ] }
  ]);
  C2('cult_leader', [
    { age: [25, 80], text: '신도들이 집을 팔아 헌금하겠다고 한다.',
      choices: [
        { text: '받는다', risky: true, check: { odds: 0.5 },
          success: { effects: { money: 30000, fame: 3, mischief: 5 }, log: '성전이 커졌다. 마음 한쪽이 서늘했다.' },
          fail: { effects: { rep: -20, record: 1, fx: ['jail'] }, log: '피해자 가족들이 고소했다. 뉴스 1면에 실렸다.' } },
        { text: '돌려보낸다', effects: { rep: 3, mischief: -4 }, log: '"생활을 지키는 데 쓰세요." 진심을 담아 말했다.' }
      ] },
    { age: [25, 80], text: '방송국이 잠입 취재를 하고 있다는 제보가 들어왔다.',
      choices: [
        { text: '조직을 해산하고 사라진다', effects: { fx: ['quitJob'], mischief: -5 }, log: '간판을 내리고 조용히 떠났다.' },
        { text: '기자를 회유한다', risky: true, check: { stat: 'social', diff: 60 },
          success: { effects: { fame: 2, mischief: 3 }, log: '보도는 흐지부지됐다.' },
          fail: { effects: { rep: -15, fame: 5, fx: ['fired'] }, log: '회유 장면까지 방송됐다. 모든 게 끝났다.' } }
      ] }
  ]);
  C2('fortune_teller', [
    { age: [20, 85], text: '단골 손님이 묻는다. "이 사람이랑 결혼해도 될까요?"',
      choices: [
        { text: '솔직하게 마음을 들어 준다', effects: { social: 2, rep: 2 }, log: '손님은 울다가 웃으며 돌아갔다.' },
        { text: '부적을 비싸게 판다', risky: true, effects: { money: 400, mischief: 3, rep: -2 }, log: '지갑은 두둑해졌다. 양심은 조금 가벼워졌다.' }
      ] },
    { age: [20, 85], text: '유명 연예인이 몰래 사주를 보러 왔다.',
      choices: [
        { text: '비밀을 지킨다', effects: { rep: 4, fame: 1, fx: ['promote'] }, log: '입소문이 나서 예약이 석 달 치 찼다.' },
        { text: '기자에게 귀띔한다', risky: true, effects: { money: 2000, rep: -10, fame: 2 }, log: '기사가 났고, 단골들이 하나둘 끊겼다.' }
      ] }
  ]);
  C2('mercenary', [
    { age: [21, 55], text: '위험 지역 경호 임무가 들어왔다. 큰 보수를 제시한다.',
      choices: [
        { text: '간다', risky: true, check: { stat: 'grit', diff: 65 },
          success: { effects: { money: 30000, grit: 3, fx: ['promote'] }, log: '임무 완수. 몸 곳곳에 흉터가 늘었다.' },
          fail: { effects: { health: -35, fx: ['careerEndingInjury'] }, log: '매복에 걸렸다. 살아 돌아온 게 기적이다.' } },
        { text: '이번엔 거절한다', effects: { health: 2, happy: 1 }, log: '편히 쉴 시간을 얻었다. 긴장이 조금 풀렸다.' }
      ] },
    { age: [25, 60], text: '동료가 부상을 입고 쓰러졌다. 철수 명령이 떨어졌다.',
      choices: [
        { text: '업고 나온다', check: { stat: 'health', diff: 55 },
          success: { effects: { rep: 8, grit: 3, fame: 2 }, log: '둘 다 살았다. 동료의 가족이 편지를 보냈다.' },
          fail: { effects: { health: -15, rep: 6 }, log: '다리를 다쳤지만 동료는 살렸다.' } },
        { text: '명령대로 철수한다', effects: { happy: -6 }, log: '그날 밤 오랫동안 잠들지 못했다.' }
      ] }
  ]);
  C2('bounty_hunter', [
    { age: [21, 60], text: '현상수배범이 동네 술집에 나타났다는 제보.',
      choices: [
        { text: '혼자 잡으러 간다', risky: true, check: { stat: 'grit', diff: 60 },
          success: { effects: { money: 8000, fame: 3, fx: ['promote'] }, log: '수갑을 채우는 순간 손님들이 박수를 쳤다.' },
          fail: { effects: { health: -20 }, log: '놓쳤다. 갈비뼈에 금이 갔다.' } },
        { text: '경찰과 함께 간다', effects: { money: 2000, rep: 3 }, log: '보상금은 줄었지만 안전하게 끝났다.' }
      ] },
    { age: [21, 60], text: '수배범이 돈다발을 내밀며 눈감아 달라고 한다.',
      choices: [
        { text: '받는다', risky: true, check: { odds: 0.5 },
          success: { effects: { money: 10000, mischief: 5 }, log: '아무도 몰랐다. 당분간은.' },
          fail: { effects: { record: 1, rep: -15, fx: ['fired'] }, log: '녹음기가 돌아가고 있었다.' } },
        { text: '거절하고 넘긴다', effects: { rep: 5, money: 3000 }, log: '정당한 보상금을 받았다.' }
      ] }
  ]);
  C2('simmani', [
    { age: [20, 85], text: '깊은 산속에서 붉은 열매가 달린 풀을 발견했다. 산삼일지도 모른다.',
      choices: [
        { text: '"심봤다!" 정성껏 캔다', check: { odds: 0.3 },
          success: { effects: { money: 20000, fame: 3, happy: 8, fx: ['promote'] }, log: '백 년 묵은 산삼이었다! 동네에 소문이 났다.' },
          fail: { effects: { happy: -1 }, log: '평범한 도라지였다. 그래도 산은 좋았다.' } },
        { text: '어린 삼은 남겨 둔다', effects: { rep: 3, happy: 2 }, log: '십 년 뒤를 기약하며 표시를 남겼다.' }
      ] },
    { age: [20, 85], text: '산에 짙은 안개가 내려앉았다. 길이 보이지 않는다.',
      choices: [
        { text: '조금만 더 들어간다', risky: true, check: { stat: 'health', diff: 50 },
          success: { effects: { money: 3000, grit: 2 }, log: '안개 속에서 약초 군락을 찾았다.' },
          fail: { effects: { health: -15 }, log: '길을 잃고 밤을 새웠다. 구조대가 찾아왔다.' } },
        { text: '내려간다', effects: { health: 1 }, log: '산은 내일도 그 자리에 있다.' }
      ] }
  ]);
  C2('streamer', [
    { age: [16, 70], text: '방송 중 시청자가 위험한 미션을 걸고 후원금을 약속한다.',
      choices: [
        { text: '미션을 한다', risky: true, check: { odds: 0.5 },
          success: { effects: { money: 3000, fame: 4, mischief: 2 }, log: '조회수가 폭발했다. 실시간 1위!' },
          fail: { effects: { health: -10, rep: -6, fame: 2 }, log: '다쳤고, 방송 정지 경고까지 받았다.' } },
        { text: '건전한 콘텐츠를 고집한다', effects: { rep: 3, fame: 1 }, log: '시청자는 적어도 단단한 팬이 생겼다.' }
      ] },
    // the 100k milestone happens once (flag subs_100k); a young streamer tries a stunt, an older one a talk show
    { age: [16, 39], cond: { flags: ['!subs_100k'] }, text: '구독자 10만이 코앞이다. 축구 리프팅 챌린지를 할까?',
      choices: [
        { text: '도전한다', check: { stat: 'football', diff: 40 },
          success: { effects: { fame: 5, money: 2000, flags: ['subs_100k'], fx: ['promote'] }, log: '10만 돌파! 실버 버튼 언박싱 영상을 찍었다.' },
          fail: { effects: { fame: 2, happy: 2 }, log: '공이 카메라를 맞혔다. 그 장면이 오히려 웃겨서 떴다.' } },
        { text: '평소처럼 방송한다', effects: { happy: 1 }, log: '꾸준함이 이긴다고 믿는다.' }
      ] },
    { age: [40, 70], cond: { flags: ['!subs_100k'] }, text: '구독자 10만이 코앞이다. 오래 봐 준 시청자들과 인생 상담 라이브를 열어 볼까?',
      choices: [
        { text: '연다', check: { stat: 'social', diff: 45 },
          success: { effects: { fame: 5, money: 2000, flags: ['subs_100k'], fx: ['promote'] }, log: '새벽까지 사연을 읽었다. 10만 돌파! 실버 버튼이 택배로 왔다.' },
          fail: { effects: { fame: 1, happy: 2 }, log: '사연은 적었지만 단골 시청자들이 끝까지 남아 줬다.' } },
        { text: '평소처럼 방송한다', effects: { happy: 1 }, log: '꾸준함이 이긴다고 믿는다.' }
      ] }
  ]);
  C2('mukbang_creator', [
    { age: [18, 60], text: '시청자들이 매운 라면 열 개 먹방을 요구한다.',
      choices: [
        { text: '도전한다', risky: true, check: { stat: 'health', diff: 55 },
          success: { effects: { fame: 4, money: 1500 }, log: '완식! 댓글창이 불타올랐다.' },
          fail: { effects: { health: -8, fame: 2 }, log: '응급실에 실려 갔다. 그 영상이 제일 많이 봤다.' } },
        { text: '{food} 맛집 탐방으로 바꾼다', effects: { happy: 3, health: 1 }, log: '사장님이 다음에 또 오라고 했다.' }
      ] },
    { age: [18, 60], text: '협찬 제안이 왔다. 그런데 음식 맛이 별로다.',
      choices: [
        { text: '맛있다고 한다', risky: true, effects: { money: 3000, rep: -4, mischief: 2 }, log: '돈은 들어왔고, 댓글은 싸늘했다.' },
        { text: '솔직하게 말한다', effects: { rep: 5, fame: 2 }, log: '"믿고 보는 먹방"이라는 별명이 생겼다.' }
      ] }
  ]);
  C2('pirate_dj', [
    { age: [18, 70], text: '해적 방송 주파수를 당국이 추적하고 있다는 소문.',
      choices: [
        { text: '오늘 밤도 송출한다', risky: true, check: { odds: 0.55 },
          success: { effects: { fame: 3, happy: 3 }, log: '동네 택시 기사들이 다 듣고 있었다.' },
          fail: { effects: { record: 1, fx: ['fired'] }, log: '장비를 압수당했다.' } },
        { text: '오늘은 합법 인터넷 라디오에 출연한다', effects: { rep: 3, fame: 1 }, log: '청취자들이 찾아와 응원했다.' }
      ] },
    { age: [18, 70], text: '단골 청취자가 사연을 보냈다. 아버지가 아프시다고 한다.',
      choices: [
        { text: '그 노래를 틀어 준다', effects: { rep: 4, social: 2, fx: ['promote'] }, log: '그날 밤 감사 문자가 수백 통 왔다.' },
        { text: '광고를 튼다', effects: { money: 300 }, log: '광고비는 받았다. 마음이 허전했다.' }
      ] }
  ]);
  C2('street_vendor', [
    { age: [18, 85], text: '단속반이 골목 끝에서 오고 있다.',
      choices: [
        { text: '재빨리 수레를 끌고 피한다', risky: true, check: { stat: 'health', diff: 45 },
          success: { effects: { money: 200, happy: 2 }, log: '골목을 두 번 돌자 단속반이 사라졌다.' },
          fail: { effects: { money: -500, happy: -3 }, log: '과태료를 물었다. 오늘 장사는 접었다.' } },
        { text: '영업 요건을 확인하고 정비한다', effects: { money: -300, rep: 3, fx: ['promote'] }, log: '필요한 절차와 시설을 정비했다. 마음이 편하다.' }
      ] },
    { age: [18, 85], text: '배고파 보이는 학생이 지폐를 세다가 내려놓는다.',
      choices: [
        { text: '덤으로 하나 더 준다', effects: { rep: 4, happy: 3, money: -10 }, log: '학생이 환하게 웃으며 고맙다고 인사했다.' },
        { text: '정가대로 받는다', effects: { money: 10 }, log: '장사는 장사다.' }
      ] }
  ]);
  C2('pawnshop_owner', [
    { age: [25, 85], text: '누군가 출처가 의심스러운 금목걸이를 맡기려 한다.',
      choices: [
        { text: '싸게 받는다', risky: true, check: { odds: 0.5 },
          success: { effects: { money: 3000, mischief: 3 }, log: '되팔아 큰 이문을 남겼다.' },
          fail: { effects: { record: 1, rep: -8, money: -2000 }, log: '장물이었다. 경찰서에 불려 갔다.' } },
        { text: '경찰에 신고한다', effects: { rep: 5 }, log: '도난 피해자가 고맙다며 찾아왔다.' }
      ] },
    { age: [25, 85], text: '노인이 남편의 유품인 시계를 맡기며 꼭 찾으러 오겠다고 한다.',
      choices: [
        { text: '넉넉히 쳐주고 기한을 늘려 준다', effects: { rep: 5, money: -200, happy: 3 }, log: '석 달 뒤 노인이 시계를 찾아가며 울었다.' },
        { text: '규정대로 처리한다', effects: { money: 200 }, log: '시계는 진열장에 걸렸다.' }
      ] }
  ]);
  C2('antique_dealer', [
    { age: [25, 85], text: '시골 창고에서 오래된 도자기를 발견했다. 주인은 값을 모른다.',
      choices: [
        { text: '헐값에 산다', risky: true, check: { odds: 0.4 },
          success: { effects: { money: 15000, mischief: 3, fx: ['promote'] }, log: '감정 결과 진품이었다! 경매에서 큰돈이 됐다.' },
          fail: { effects: { money: -1000 }, log: '모조품이었다. 헐값이 제값이었다.' } },
        { text: '제값을 알려 주고 산다', effects: { rep: 5, money: 2000 }, log: '주인이 다른 물건까지 맡겼다.' }
      ] },
    { age: [25, 85], text: '외국 수집가가 문화재급 물건의 해외 반출을 부탁한다.',
      choices: [
        { text: '몰래 보낸다', risky: true, check: { odds: 0.45 },
          success: { effects: { money: 30000, mischief: 5 }, log: '큰돈이 들어왔다. 뉴스를 볼 때마다 가슴이 철렁한다.' },
          fail: { effects: { fx: ['jail'] }, log: '공항 세관에서 적발됐다.' } },
        { text: '거절하고 박물관에 알린다', effects: { rep: 8, fame: 2 }, log: '문화재가 제자리를 찾았다. 감사패를 받았다.' }
      ] }
  ]);
  C2('jockey', [
    { age: [18, 50], text: '큰 경주 전날, 누군가 일부러 지라고 돈을 내민다.',
      choices: [
        { text: '받는다', risky: true, check: { odds: 0.45 },
          success: { effects: { money: 15000, mischief: 5 }, log: '말에게 미안했다. 아무도 몰랐다.' },
          fail: { effects: { record: 1, rep: -20, fx: ['careerEndingInjury'] }, log: '경기 중 큰 부상을 입었다. 승부 조작까지 밝혀져 선수 생활을 접었다.' } },
        { text: '거절하고 전력으로 달린다', check: { stat: 'grit', diff: 55 },
          success: { effects: { fame: 4, money: 5000, fx: ['promote'] }, log: '우승! 말 목을 끌어안았다.' },
          fail: { effects: { fame: 1 }, log: '3위. 그래도 떳떳하다.' } }
      ] },
    { age: [18, 50], text: '체중 감량 때문에 사흘째 거의 굶었다.',
      choices: [
        { text: '계속 굶는다', risky: true, effects: { health: -6, grit: 2 }, log: '계량을 통과했지만 눈앞이 핑 돌았다.' },
        { text: '이번 경주는 쉰다', effects: { health: 3, happy: 1 }, log: '오랜만에 {food}[을/를] 배불리 먹었다.' }
      ] }
  ]);
  C2('stunt_driver', [
    { age: [20, 55], text: '감독이 대역 없이 차를 공중에서 한 바퀴 돌려 달라고 한다.',
      choices: [
        { text: '한다', risky: true, check: { stat: 'grit', diff: 60 },
          success: { effects: { fame: 4, money: 6000, fx: ['promote'] }, log: '완벽한 착지. 촬영장이 박수로 뒤덮였다.' },
          fail: { effects: { health: -30, fx: ['careerEndingInjury'] }, log: '착지에 실패했다. 몇 달을 병원에서 보냈다.' } },
        { text: '안전 장비를 더 요구한다', effects: { health: 1, rep: 2 }, log: '촬영이 하루 미뤄졌지만 무사히 끝냈다.' }
      ] },
    { age: [20, 55], text: '친구들이 심야 도로 레이스에 끼라고 부추긴다.',
      choices: [
        { text: '달린다', risky: true, check: { odds: 0.5 },
          success: { effects: { money: 2000, mischief: 4, fame: 1 }, log: '압도적인 1등. 영상이 퍼졌다.' },
          fail: { effects: { record: 1, rep: -8, health: -10 }, log: '위험하게 달리다 다쳤고 경찰 조사까지 받았다.' } },
        { text: '트랙에서만 달린다', effects: { rep: 2 }, log: '프로는 도로에서 레이스하지 않는다.' }
      ] }
  ]);
  C2('designated_driver', [
    { age: [20, 75], text: '취한 손님이 운전대를 다시 잡겠다고 고집을 부린다.',
      choices: [
        { text: '끝까지 설득한다', check: { stat: 'social', diff: 45 },
          success: { effects: { rep: 4, social: 2 }, log: '손님은 뒷좌석에서 잠들었다. 무사히 집에 데려다줬다.' },
          fail: { effects: { happy: -3 }, log: '손님이 화를 내며 내렸다. 경찰에 신고했다.' } },
        { text: '그냥 내린다', effects: { happy: -2, rep: -1 }, log: '다음 날 뉴스에서 사고 소식을 봤다. 마음이 무거웠다.' }
      ] },
    { age: [20, 75], text: '새벽 세 시, 손님이 대기업 회장이었다. 명함을 건넨다.',
      choices: [
        { text: '전화를 걸어 본다', check: { stat: 'social', diff: 50 },
          success: { effects: { fx: ['quickJob'], happy: 4 }, log: '회장님 회사에 자리가 생겼다.' },
          fail: { effects: { happy: -1 }, log: '비서가 받았다. 회장님은 기억하지 못했다.' } },
        { text: '추억으로 간직한다', effects: { happy: 1 }, log: '명함은 지갑 속에 오래 남았다.' }
      ] }
  ]);
})(typeof globalThis !== 'undefined' ? globalThis : this);
