/* Round 5 careers: unusual life routes (gambling, crime, odd jobs, niche trades).
 * Same schema as data/careers.js. Trait-gated rows carry req.unlockHint for the 진로 panel. */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};
  RA.data.careers = RA.data.careers || [];

  // K(id, name, sector, outfit, req, salary, ladder, keyStat, [promoteYears, difficulty, stress, fame, risk], desc, special)
  function K(id, name, sector, outfit, req, salary, ladder, keyStat, n, desc, special) {
    var c = {
      id: id, name: name, sector: sector, outfit: outfit, desc: desc, req: req,
      salary: salary, ladder: ladder, keyStat: keyStat,
      promoteYears: n[0], difficulty: n[1], stress: n[2], fame: n[3], risk: n[4]
    };
    if (special) c.special = special;
    RA.data.careers.push(c);
  }
  var NJ = ['!jailed'];

  /* ---------------- gambling ---------------- */
  K('pro_gambler', '프로 겜블러', 'business', 'suit',
    { minAge: 19, maxAge: 70, degree: 'none', traits: { gamble: 45 }, unlockHint: '도박 중독 2단계 이상' },
    [15000, 3000000], ['카지노 딜러', '하우스 플레이어', '프로 겜블러', '하이롤러', '카지노 사장'],
    'smarts', [2, 3, 5, 3, 2], '올해 연봉은 카드가 정한다. 작년엔 0원, 재작년엔 집 한 채.', 'gamble');

  /* ---------------- crime ---------------- */
  K('yabawi', '야바위꾼', 'crime', 'casual',
    { minAge: 17, maxAge: 75, degree: 'none', traits: { mischief: 40 }, unlockHint: '악동 기질 40 이상' },
    [3000, 300000], ['골목 바람잡이', '컵 돌리는 손', '장터의 꾼', '야바위 명인'],
    'smarts', [2, 2, 3, 1, 3], '"자, 공은 어디에 있을까요?" 정답은 늘 내 소매 속.', 'crime');
  K('smuggler', '밀수꾼', 'crime', 'casual',
    { minAge: 19, maxAge: 70, degree: 'none', traits: { mischief: 40 }, unlockHint: '악동 기질 40 이상' },
    [8000, 2500000], ['운반책', '보따리상', '밀수 브로커', '항구의 큰손'],
    'grit', [2, 3, 4, 1, 4], '세관 앞에서 웃는 연습만 3년. 가방 바닥이 이중이다.', 'crime');

  /* ---------------- religion / fortune ---------------- */
  K('cult_leader', '사이비 교주', 'religion', 'robe',
    { minAge: 25, maxAge: 85, degree: 'none', stats: { social: 60 }, traits: { mischief: 50 }, unlockHint: '악동 기질 50 이상 · 공감/사교 60 이상' },
    [2000, 5000000], ['길거리 전도자', '소모임 인도자', '교단 간부', '자칭 선지자', '교주'],
    'social', [3, 3, 4, 3, 3], '"종말은 다음 주 화요일입니다." 화요일이 지나면 날짜를 바꾼다.');
  K('fortune_teller', '타로·사주 상담가', 'religion', 'robe',
    { minAge: 18, maxAge: 90, degree: 'none', stats: { social: 40 } },
    [6000, 350000], ['타로 카페 알바', '길거리 타로', '사주 카페 원장', '방송 출연 역술가'],
    'social', [2, 2, 2, 2, 0], '카드보다 손님 표정을 더 잘 읽는다. 그게 비결이다.');

  /* ---------------- military / public ---------------- */
  K('mercenary', '용병', 'military', 'military',
    { minAge: 21, maxAge: 50, degree: 'none', stats: { grit: 70, health: 70 }, flags: ['mil_done', '!jailed'] },
    [40000, 900000], ['신입 계약 경호원', '분대원', '팀장', '작전 지휘관', '민간 군사기업 대표'],
    'grit', [2, 4, 5, 1, 5], '계약서 한 장에 목숨을 건다. 휴가는 길지만 일은 무섭다.');
  K('bounty_hunter', '현상금 사냥꾼', 'public', 'casual',
    { minAge: 21, maxAge: 60, degree: 'none', stats: { health: 55, grit: 55 }, flags: NJ },
    [10000, 400000], ['제보 수집가', '추적자', '현상금 사냥꾼', '전설의 추적자'],
    'grit', [2, 3, 4, 2, 3], '수배 전단을 들고 다니는 직업. 잠복 중 먹는 김밥이 인생의 낙.');

  /* ---------------- agri ---------------- */
  K('simmani', '심마니', 'agri', 'farmer',
    { minAge: 18, maxAge: 85, degree: 'none', stats: { health: 50 } },
    [3000, 400000], ['초보 약초꾼', '심마니', '어인마니', '전설의 심마니'],
    'health', [3, 2, 2, 1, 1], '"심 봤다!" 한 번이면 일 년이 풀린다. 못 보면 산만 탄다.');

  /* ---------------- entertainment / media ---------------- */
  K('streamer', '스트리머', 'entertainment', 'hoodie',
    { minAge: 15, maxAge: 70, degree: 'none' },
    [0, 2500000], ['시청자 3명', '소통 방송인', '파트너 스트리머', '대형 스트리머', '플랫폼 간판'],
    'social', [1, 2, 4, 4, 0], '밤새 혼잣말을 하는데 그걸 수천 명이 본다.');
  K('mukbang_creator', '먹방 크리에이터', 'entertainment', 'hoodie',
    { minAge: 16, maxAge: 60, degree: 'none', stats: { health: 45 } },
    [0, 1500000], ['구독자 50명', '먹방 꿈나무', '먹방 크리에이터', '먹방 대왕'],
    'health', [1, 2, 3, 4, 1], '라면 열 봉지가 출근 준비. 건강검진 날이 제일 무섭다.');
  K('pirate_dj', '해적 방송 DJ', 'media', 'hoodie',
    { minAge: 17, maxAge: 70, degree: 'none', traits: { mischief: 25 }, unlockHint: '악동 기질 25 이상' },
    [1000, 120000], ['새벽 무허가 방송', '지하 라디오 DJ', '전설의 해적 DJ'],
    'social', [2, 2, 3, 3, 2], '허가 없는 주파수에서 허락 없는 음악을 튼다.');

  /* ---------------- service / business ---------------- */
  K('street_vendor', '노점상', 'service', 'apron',
    { minAge: 16, maxAge: 85, degree: 'none' },
    [5000, 120000], ['리어카 노점', '단골 생긴 노점', '푸드트럭 사장', '포장마차 거리 터줏대감'],
    'grit', [2, 1, 3, 1, 0], '비 오는 날엔 붕어빵, 더운 날엔 슬러시. 날씨가 사장님이다.');
  K('pawnshop_owner', '전당포 주인', 'finance', 'suit',
    { minAge: 25, maxAge: 85, degree: 'none', stats: { smarts: 45 }, flags: NJ },
    [15000, 400000], ['전당포 직원', '물건 감정사', '전당포 사장', '전당포 체인 대표'],
    'smarts', [3, 2, 2, 0, 1], '사연 없는 물건은 없다. 시계 하나에 인생 하나.');
  K('antique_dealer', '골동품 딜러', 'business', 'suit',
    { minAge: 22, maxAge: 85, degree: 'none', stats: { smarts: 50 } },
    [8000, 900000], ['고물상 조수', '골동품 가게 점원', '골동품 딜러', '감정 명인'],
    'smarts', [3, 3, 2, 2, 0], '먼지 쌓인 항아리가 집값일 수도, 라면값일 수도 있다.');

  /* ---------------- sports / transport ---------------- */
  K('jockey', '경마 기수', 'sports', 'kit',
    { minAge: 16, maxAge: 45, degree: 'none', stats: { health: 55, grit: 50 } },
    [12000, 700000], ['견습 기수', '기수', '리딩 자키', '명예의 전당 기수'],
    'grit', [2, 4, 4, 3, 3], '말 위에서 1분, 체중계 위에서 하루 종일.');
  K('stunt_driver', '카 스턴트 드라이버', 'transport', 'kit',
    { minAge: 20, maxAge: 55, degree: 'none', stats: { health: 60, grit: 50 } },
    [20000, 450000], ['드리프트 연습생', '스턴트 드라이버', '액션팀 수석 드라이버', '추격신 전문 감독'],
    'grit', [2, 3, 4, 2, 4], '영화 속 추격신의 진짜 주인공. 보험사는 이름만 들어도 한숨.');
  K('designated_driver', '대리운전 기사', 'transport', 'casual',
    { minAge: 20, maxAge: 72, degree: 'none' },
    [9000, 50000], ['초보 대리기사', '콜 많은 기사', '대리운전 팀장'],
    'health', [1, 1, 3, 0, 1], '남의 차로 남의 집에 간다. 퇴근은 첫차로.');
})(typeof globalThis !== 'undefined' ? globalThis : this);
