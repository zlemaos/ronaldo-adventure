/* Life routes (round 7). Every life state belongs to exactly one route; a route has a stage ladder
 * (entry → peak → late), entry needs, declared exits and its own endings. The engine (js/routes.js)
 * only lets a route's own events and route-neutral life events fire, and changes route only through
 * an exit listed here (or a global exit). See docs/DESIGN.md §2f.
 *
 * Also here: birth body specs, base talents, school tracks (localized per country) and the route tags
 * of older events that change careers. */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};

  // ---------------------------------------------------------------- body (rolled at birth, 0-100 except height)
  RA.data.bodyAttrs = [
    { k: 'height', label: '예상 키', icon: '📏', desc: '다 자랐을 때의 키. 농구·모델은 큰 키가 유리하다.' },
    { k: 'build', label: '체격', icon: '🦍', desc: '뼈대와 근육. 격투기·야구의 힘이 여기서 나온다.' },
    { k: 'reflex', label: '반사신경', icon: '⚡', desc: '눈과 몸이 반응하는 속도. 모든 구기 종목과 격투기.' },
    { k: 'endurance', label: '지구력', icon: '🫁', desc: '오래 버티는 힘. 운동선수 수명과 고된 일에 영향.' },
    { k: 'flex', label: '유연성', icon: '🤸', desc: '몸이 휘는 정도. 춤·모델 워킹·격투기에 유리.' },
    { k: 'dex', label: '손재주', icon: '✋', desc: '손끝의 정밀함. 외과 수술·악기·요리·미술.' },
    { k: 'voice', label: '목소리', icon: '🎙️', desc: '타고난 음색과 성량. 가수·아이돌·배우.' }
  ];
  // ---------------------------------------------------------------- base talents (태교 sets them, early education feeds them)
  RA.data.talents = [
    { k: 'music', label: '음악', icon: '🎵', desc: '음정과 리듬 감각.' },
    { k: 'art', label: '미술', icon: '🎨', desc: '색과 모양을 보는 눈.' },
    { k: 'sport', label: '운동 감각', icon: '🏅', desc: '몸을 쓰는 요령.' },
    { k: 'logic', label: '논리·수리', icon: '🧮', desc: '숫자와 규칙을 다루는 머리.' },
    { k: 'lang', label: '언어', icon: '📖', desc: '말과 글을 다루는 힘.' },
    { k: 'taste', label: '미각·요리', icon: '🍳', desc: '맛을 구별하고 만들어 내는 감각.' },
    { k: 'stage', label: '끼·무대', icon: '🎭', desc: '사람들 앞에서 웃기고 빛나는 재주.' }
  ];

  // ---------------------------------------------------------------- school tracks
  // Picked at the 13-14 and 16-17 crossroads. Which routes a track opens is read from routes[].entry.tracks.
  RA.data.tracks = {
    study: { name: '진학반', icon: '📚', desc: '공부로 대학을 노린다. 16살에 문과·이과로 나뉜다.' },
    hum: { name: '문과', icon: '📜', desc: '법·행정·언론·교육 쪽 대학으로 이어진다.' },
    sci: { name: '이과', icon: '🧪', desc: '의대·공대·자연과학 쪽 대학으로 이어진다.' },
    art: { name: '미술', icon: '🎨', desc: '미술 실기를 배우는 예체능 과정.' },
    music: { name: '음악', icon: '🎵', desc: '노래·악기를 배우는 예체능 과정.' },
    acting: { name: '연기·방송', icon: '🎭', desc: '연기와 무대를 배우는 예체능 과정.' },
    sport: { name: '체육특기생', icon: '🏅', desc: '운동부에서 선수로 크는 과정.' },
    football: { name: '축구 유스', icon: '⚽', desc: '축구 클럽에서 선수로 크는 과정.' },
    trainee: { name: '기획사 연습생', icon: '🎤', desc: '기획사에서 노래·춤을 배우며 데뷔를 준비한다.' },
    cook: { name: '조리 특성화', icon: '🍳', desc: '요리를 배우는 특성화 과정.' },
    tech: { name: '기술 특성화', icon: '🔧', desc: '기계·전기 기술을 배우는 특성화 과정.' },
    general: { name: '일반 과정', icon: '🎒', desc: '정한 길 없이 졸업한다. 무엇이든 처음부터 시작한다.' }
  };
  // Country-specific names for the special tracks (fallback: tracks[id].name)
  RA.data.trackNames = {
    kr: { art: '예술고 미술과', music: '예술고 음악과', acting: '예술고 연극영화과', sport: '체육고 특기생', cook: '조리과학고', tech: '마이스터고', hum: '인문계 문과', sci: '인문계 이과' },
    jp: { art: '예술고 미술 코스', music: '음악고 성악·기악 코스', acting: '예능 코스 고교', sport: '스포츠 추천 특기생', cook: '조리 전문 과정', tech: '공업고등학교', hum: '문과 진학반', sci: '이과 진학반' },
    cn: { art: '미술 예고반', music: '음악 예고반', acting: '희극 예술학교', sport: '체육학교 특기생', cook: '요리 직업학교', tech: '직업기술학교', hum: '문과반', sci: '이과반' },
    us: { art: '예술 마그넷 스쿨(미술)', music: '예술 마그넷 스쿨(음악)', acting: '연극 마그넷 프로그램', sport: '체육 장학 특기생', cook: '고교 컬리너리 프로그램', tech: '직업기술고(CTE)', hum: 'AP 인문 트랙', sci: 'AP 과학 트랙' },
    pt: { art: '예술학교 시각예술 과정', music: '음악원 과정', acting: '연극학교 과정', sport: '스포츠 특기 과정', cook: '호텔·조리 직업학교', tech: '기술 직업학교', hum: '인문 과정', sci: '과학기술 과정' },
    br: { art: '미술 기술학교', music: '음악 학교', acting: '연극 학교', sport: '스포츠 특기 장학생', cook: '조리 직업 과정', tech: '기술 연방학교', hum: '인문 진학반', sci: '이공 진학반' },
    ar: { art: '미술 고등학교', music: '음악 고등학교', acting: '연극 학교', sport: '스포츠 특기 과정', cook: '조리 기술학교', tech: '기술 고등학교', hum: '인문 바칼로레아', sci: '자연과학 바칼로레아' },
    za: { art: '예술 고등학교 미술과', music: '예술 고등학교 음악과', acting: '예술 고등학교 연극과', sport: '스포츠 아카데미 특기생', cook: '호스피탈리티 과정', tech: '기술 고등학교', hum: '인문 과목반', sci: '수학·과학반' },
    in: { art: '미술 과정', music: '음악 과정(구루 수업)', acting: '연기 학교', sport: '스포츠 호스텔 특기생', cook: '호텔 경영 예비 과정', tech: '산업훈련원(ITI)', hum: '인문(Arts) 계열', sci: '과학(Science) 계열' }
  };

  // ---------------------------------------------------------------- routes
  // Global exits every route has (narrated by the engine): quitting or failing out → none (쉬는 중) or back
  // to school, a crime → prison, old age → retired, and the dark turns anyone can take by choice
  // (뒷골목, 도박) or a calling (출가). Route-specific exits are listed per route.
  // A move is legal only when its destination AND its cause match an exit (js/routes.js RT.legal).
  RA.data.GLOBAL_EXITS = [
    { to: 'none', on: ['quit', 'fail', 'fired', 'release', 'burnout', 'scandal', 'disband', 'injury', 'deport', 'retire'] },
    { to: 'school', on: ['quit', 'fail', 'fired', 'release', 'burnout', 'scandal', 'disband', 'injury', 'deport', 'retire', 'choice', 'enroll'] },
    { to: 'prison', on: ['crime'] },
    { to: 'retired', on: ['retire'] },
    { to: 'gang', on: ['choice'] },
    { to: 'con', on: ['choice'] },
    { to: 'thief', on: ['choice'] },
    { to: 'gamble', on: ['choice'] },
    { to: 'religion', on: ['calling', 'choice'] }
  ];
  var R = RA.data.routes = [];
  function X(to, on, extra) { var x = { to: to, on: on.split(' ') }; for (var k in extra || {}) x[k] = extra[k]; return x; }
  function route(r) { R.push(r); }

  // ================================================================ sports
  route({ id: 'football', name: '축구선수', icon: '⚽', group: '운동', scene: 'pitch', careers: ['footballer'], stageFrom: 'fb',
    fit: { sport: 2, reflex: 1, endurance: 1, football: 2 },
    entry: { age: [5, 15], tracks: ['football', 'sport'], how: '동네 클럽 입단', text: '어릴 때 동네 클럽에서 시작한다. 16살이 넘으면 늦다.' },
    athlete: { decline: 31, end: 41 },
    stages: [
      { id: 'local', t: '동네 클럽', train: true }, { id: 'regional', t: '지역 클럽', train: true },
      { id: 'academy', t: '유스 아카데미', train: true }, { id: 'youth', t: '유스 리저브', train: true },
      { id: 'pro', t: '프로 선수', peak: true }, { id: 'veteran', t: '베테랑', late: true }],
    exits: [X('sports_staff', 'retire injury release', { career: 'football_coach' }), X('sports_staff', 'retire', { career: 'sports_pundit' }),
      X('cook', 'retire', { career: 'restaurant_owner' }), X('school', 'quit release fail')],
    endings: { win: 'pro_player', fall: 'local_legend' },
    lines: {} });

  route({ id: 'basketball', name: '농구선수', icon: '🏀', group: '운동', scene: 'hoops', careers: ['basketball_player'],
    fit: { height: 3, reflex: 1, endurance: 1, sport: 2 },
    entry: { age: [10, 17], tracks: ['sport'], how: '학교 농구부 입부', need: { height: [178, 166] }, text: '키가 크고 운동 감각이 있으면 학교 농구부에서 시작한다.' },
    athlete: { decline: 31, end: 38 },
    stages: [
      { id: 'school_team', t: '학교 농구부', train: true, min: 2, max: 7 },
      { id: 'college', t: '대학·실업 농구', train: true, skill: 35, min: 1, max: 4 },
      { id: 'rookie', t: '프로 신인', lvl: 1, skill: 50, fit: 50, min: 1, max: 4 },
      { id: 'starter', t: '주전 선수', lvl: 2, skill: 62, min: 2, max: 8 },
      { id: 'star', t: '올스타', lvl: 3, skill: 74, fit: 62, peak: true, min: 2 },
      { id: 'veteran', t: '노장 선수', lvl: 2, late: true }],
    exits: [X('sports_staff', 'retire injury release', { career: 'sports_coach' }), X('sports_staff', 'retire', { career: 'sports_pundit' }),
      X('sports_staff', 'injury release', { career: 'personal_trainer' }), X('cook', 'retire', { career: 'restaurant_owner' }), X('school', 'quit fail release')],
    endings: { win: ['🏀', '코트의 왕', '림 위로 날아오른 사람. 체육관이 이름을 외쳤다.'], fall: ['🪑', '코트에 남긴 아쉬움', '코트에서 꾸던 꿈을 끝까지 이어 가지 못했다.'] },
    lines: {
      school_team: ['방과 후 체육관에서 레이업을 백 번 올렸다.', '농구부 형들 틈에서 리바운드를 다퉜다.', '자유투 라인에 서서 숨을 고르는 연습을 했다.'],
      college: ['새벽 웨이트 뒤 전술 미팅에 들어갔다.', '실업 리그 경기에서 20분을 뛰었다.', '드래프트 예상 순위 기사를 몰래 찾아봤다.'],
      rookie: ['프로 체육관의 공기는 달랐다. 패스가 두 배 빠르다.', '선배 대신 수건을 챙기며 벤치를 지켰다.', '데뷔 첫 득점 공을 사물함에 넣어 뒀다.'],
      starter: ['홈 관중 앞에서 연장전 3점 슛을 넣었다.', '원정 버스에서 상대 영상을 돌려 봤다.', '팀 공격의 절반이 내 손을 거쳐 간다.'],
      star: ['올스타전 덩크 콘테스트에 초대받았다.', '내 이름이 적힌 유니폼이 관중석을 채웠다.', '결승전 마지막 공격을 감독이 내게 맡겼다.'],
      veteran: ['무릎 테이핑이 길어졌다. 대신 경기를 읽는 눈이 생겼다.', '후배들에게 수비 위치를 소리쳐 알려 줬다.', '출전 시간은 줄었지만 박수는 더 길어졌다.'] } });

  route({ id: 'baseball', name: '야구선수', icon: '⚾', group: '운동', scene: 'ballpark', careers: ['baseball_player'],
    fit: { build: 2, reflex: 2, dex: 1, sport: 2 },
    entry: { age: [9, 17], tracks: ['sport'], how: '학교 야구부 입부', text: '힘과 눈이 좋으면 리틀 야구·학교 야구부에서 시작한다.' },
    athlete: { decline: 33, end: 41 },
    stages: [
      { id: 'little', t: '학교 야구부', train: true, min: 2, max: 8 },
      { id: 'draft', t: '드래프트·2군', lvl: 0, skill: 40, min: 1, max: 5 },
      { id: 'first', t: '1군 데뷔', lvl: 1, skill: 52, min: 1, max: 5 },
      { id: 'regular', t: '주전 선수', lvl: 2, skill: 62, min: 2, max: 8 },
      { id: 'ace', t: '팀의 에이스', lvl: 3, skill: 75, fit: 60, peak: true, min: 2 },
      { id: 'veteran', t: '베테랑 선수', lvl: 2, late: true }],
    exits: [X('sports_staff', 'retire injury release', { career: 'sports_coach' }), X('sports_staff', 'retire', { career: 'sports_pundit' }),
      X('cook', 'retire', { career: 'restaurant_owner' }), X('school', 'quit fail release')],
    endings: { win: ['⚾', '그라운드의 에이스', '구장을 가득 채운 함성의 주인공.'], fall: ['🧢', '그라운드의 아쉬움', '원하던 야구 인생을 끝까지 이어 가지 못했다.'] },
    lines: {
      little: ['배팅 케이지에서 손바닥이 터질 때까지 방망이를 돌렸다.', '흙투성이 유니폼을 세 번이나 빨았다.', '외야 펑고를 받으며 해가 졌다.'],
      draft: ['2군 구장 버스는 늘 새벽에 출발한다.', '육성 선수 숙소에서 컵라면으로 저녁을 때웠다.', '1군 콜업 명단을 매일 확인했다.'],
      first: ['1군 타석에 섰다. 관중석 함성이 귀를 때렸다.', '대타로 나가 볼넷을 골라 냈다.', '더그아웃에서 선배의 타격 루틴을 훔쳐봤다.'],
      regular: ['개막전 선발 명단에 내 이름이 있었다.', '9회 말 끝내기 안타를 쳤다.', '원정 3연전 동안 매일 특타를 했다.'],
      ace: ['시즌 내내 꾸준히 출전하며 팀을 이끌었다.', '가을 야구에서 결정적인 활약을 했다.', '구단이 내 사진으로 시즌 포스터를 만들었다.'],
      veteran: ['몸은 느려졌지만 수 싸움은 늘었다.', '후배들에게 경기 준비 요령을 알려 줬다.', '은퇴 투어 이야기가 기사에 나기 시작했다.'] } });

  route({ id: 'fighter', name: '격투가', icon: '🥊', group: '운동', scene: 'ring', careers: ['boxer'],
    fit: { build: 3, reflex: 2, endurance: 2, sport: 1 },
    entry: { age: [12, 26], tracks: ['sport', 'general'], how: '체육관(도장) 입관', text: '체격과 반사신경이 좋으면 체육관에서 시작한다. 늦어도 20대 중반까지.' },
    athlete: { decline: 30, end: 37 },
    stages: [
      { id: 'gym', t: '도장 수련생', train: true, min: 1, max: 6 },
      { id: 'amateur', t: '아마추어 선수', train: true, skill: 32, min: 1, max: 5 },
      { id: 'debut', t: '프로 데뷔', lvl: 0, skill: 45, fit: 45, min: 1, max: 4 },
      { id: 'ranker', t: '랭커', lvl: 1, skill: 58, min: 2, max: 7 },
      { id: 'champ', t: '챔피언', lvl: 3, skill: 74, fit: 62, peak: true, min: 1 },
      { id: 'veteran', t: '노장 파이터', lvl: 1, late: true }],
    exits: [X('sports_staff', 'retire injury release', { career: 'personal_trainer' }), X('sports_staff', 'retire', { career: 'sports_coach' }),
      X('performer', 'retire injury', { career: 'stuntman' }), X('safety', 'retire quit', { career: 'police' })],
    endings: { win: ['🥊', '챔피언 벨트의 주인', '링 위에서 마지막까지 서 있던 사람.'], fall: ['🩹', '링에서 내려온 사람', '벨트 대신 상처만 남았다.'] },
    lines: {
      gym: ['샌드백을 치다 주먹에 붕대가 붉게 물들었다.', '관장님이 줄넘기 3분 10라운드를 시켰다.', '스파링 중 코피가 났다. 그래도 웃었다.'],
      amateur: ['아마추어 대회 체급 계량을 통과했다.', '전국 대회 8강에서 판정패했다.', '감량 기간에 물 한 모금이 꿀이었다.'],
      debut: ['프로 경기에서 1라운드 KO승을 거뒀다.', '대전료가 들어왔다. 한참 통장을 들여다봤다.', '링 아나운서가 내 이름을 불렀다.'],
      ranker: ['랭킹 10위 안에 이름을 올렸다.', '판정 논란 끝에 재대결이 잡혔다.', '해외 원정 경기에서 이겼다.'],
      champ: ['챔피언 벨트를 허리에 찼다. 무거웠다.', '방어전 기자회견에서 상대와 눈싸움을 했다.', '체육관에 내 포스터가 걸렸다.'],
      veteran: ['회복이 느려졌다. 다음 경기 날짜를 미뤘다.', '젊은 도전자의 영상을 밤새 봤다.', '은퇴하라는 말이 들려도 링이 그립다.'] } });

  // ================================================================ entertainment
  route({ id: 'idol', name: '아이돌', icon: '🎤', group: '연예계', scene: 'stage', careers: ['idol'],
    fit: { looks: 2, flex: 1, voice: 1, music: 1, stage: 2 },
    entry: { age: [12, 22], tracks: ['trainee', 'acting', 'music'], how: '기획사 오디션', audition: true, text: '외모·춤·노래·끼를 보는 기획사 오디션에 붙어야 연습생이 된다.' },
    athlete: { decline: 29, end: 34, endCause: 'disband' },
    stages: [
      { id: 'trainee', t: '연습생', train: true, min: 1, max: 5 },
      { id: 'debut', t: '데뷔', lvl: 1, skill: 45, fit: 45, min: 1, max: 3 },
      { id: 'rookie', t: '신인 아이돌', lvl: 2, skill: 55, min: 1, max: 4 },
      { id: 'hot', t: '대세 아이돌', lvl: 3, skill: 66, min: 1, max: 5 },
      { id: 'top', t: '월드 스타', lvl: 4, skill: 78, fit: 62, peak: true, min: 1 },
      { id: 'late', t: '재계약 갈림길', lvl: 3, late: true }],
    exits: [X('actor', 'disband quit release', { stage: 'extra' }), X('singer', 'disband quit release', { stage: 'debut' }),
      X('teaching', 'disband quit', { career: 'vocal_coach' }), X('creator', 'disband quit scandal', { career: 'youtuber' }),
      X('model', 'disband quit'), X('school', 'fail quit')],
    endings: { win: ['🌟', '무대 위의 별', '전 세계 팬들이 응원봉을 흔들었다.'], fall: ['📼', '멈춘 안무', '연습실 거울에 남긴 꿈은 계획대로 흘러가지 않았다.'] },
    lines: {
      trainee: ['연습실 거울 앞에서 같은 동작을 밤새 맞췄다.', '월말 평가에서 보컬 점수가 올랐다.', '체중계 숫자에 하루가 좌우됐다.'],
      debut: ['무대 리허설에서 인이어가 빠졌다. 그래도 웃었다.', '음악 방송 대기실에서 선배들에게 인사만 백 번 했다.', '팬카페에 응원 글이 하나 더 올라왔다.'],
      rookie: ['신인상 후보에 올랐다.', '팬사인회에서 이름을 불러 주는 팬이 생겼다.', '컴백 준비로 숙소 불이 꺼지지 않았다.'],
      hot: ['음원 차트 1위 알림이 새벽에 울렸다.', '광고 촬영장이 연습실보다 익숙해졌다.', '공항에 팬들이 마중을 나왔다.'],
      top: ['월드 투어 마지막 공연장에서 떼창이 쏟아졌다.', '해외 시상식 무대에 섰다.', '응원봉 불빛이 바다처럼 일렁였다.'],
      late: ['재계약 협상 테이블에 멤버들이 둘러앉았다.', '휴식과 개인 활동 이야기가 오갔다.', '데뷔 때 영상을 보며 다 같이 울었다.'] } });

  route({ id: 'singer', name: '가수', icon: '🎙️', group: '연예계', scene: 'stage', careers: ['singer'],
    fit: { voice: 3, music: 2, stage: 1 },
    entry: { age: [15, 35], tracks: ['music', 'trainee', 'acting'], how: '오디션·버스킹', audition: true, text: '목소리와 음악 감각으로 오디션 프로그램이나 버스킹에서 시작한다.' },
    athlete: { decline: 58, end: 75 },
    stages: [
      { id: 'busking', t: '버스킹·오디션 준비', train: true, min: 1, max: 5 },
      { id: 'debut', t: '데뷔 가수', lvl: 0, skill: 45, fit: 50, min: 1, max: 4 },
      { id: 'rising', t: '신인 가수', lvl: 1, skill: 55, min: 1, max: 6 },
      { id: 'hit', t: '히트곡 가수', lvl: 2, skill: 66, min: 2, max: 10 },
      { id: 'national', t: '국민 가수', lvl: 3, skill: 78, fit: 65, peak: true, min: 2 },
      { id: 'veteran', t: '관록의 가수', lvl: 4, late: true }],
    exits: [X('teaching', 'quit fail burnout', { career: 'vocal_coach' }), X('band', 'quit choice'), X('actor', 'choice quit', { stage: 'extra' }),
      X('creator', 'fail quit scandal', { career: 'youtuber' }), X('service', 'fail quit', { career: 'barista' })],
    endings: { win: ['🎙️', '국민 가수', '노래방 애창곡 1위에 이름을 올린 목소리.'], fall: ['🎸', '거리의 노래', '무대는 작았지만 노래는 끝까지 불렀다.'] },
    lines: {
      busking: ['역 앞에서 기타 케이스를 열고 노래했다. 동전 세 개.', '오디션 예선 번호표를 가슴에 달았다.', '녹음 파일을 밤새 다시 들었다.'],
      debut: ['새 음원이 나왔다. 스트리밍 수는 아직 한산했다.', '라디오 신인 코너에 출연했다.', '작은 공연장에서 단독 무대를 열었다.'],
      rising: ['드라마 OST 제안이 들어왔다.', '페스티벌 낮 무대에 섰다.', '노래방 신곡 목록에 내 노래가 올라갔다.'],
      hit: ['내 노래가 거리마다 흘러나왔다.', '연말 시상식 대기실에 이름표가 붙었다.', '전국 투어 표가 하루 만에 매진됐다.'],
      national: ['명절 특집 무대의 마지막 순서를 맡았다.', '온 세대가 내 노래를 따라 불렀다.', '데뷔 기념 공연에 동료 가수들이 찾아왔다.'],
      veteran: ['젊은 가수들이 내 노래를 리메이크했다.', '목을 아끼느라 공연 횟수를 줄였다.', '음악 방송 심사위원석에 앉았다.'] } });

  route({ id: 'band', name: '밴드', icon: '🎸', group: '연예계', scene: 'stage', careers: ['band_musician'],
    fit: { music: 3, dex: 2, stage: 1 },
    entry: { age: [14, 35], tracks: ['music', 'general', 'art'], how: '밴드 결성', text: '악기를 잡고 친구들과 합주실에서 시작한다.' },
    athlete: { decline: 52, end: 70 },
    stages: [
      { id: 'garage', t: '합주실 밴드', train: true, min: 1, max: 6 },
      { id: 'club', t: '클럽 공연', lvl: 0, skill: 35, min: 1, max: 5 },
      { id: 'album', t: '첫 정규 앨범', lvl: 1, skill: 48, min: 1, max: 6 },
      { id: 'festival', t: '페스티벌 무대', lvl: 2, skill: 60, min: 2, max: 8 },
      { id: 'headliner', t: '헤드라이너', lvl: 3, skill: 74, peak: true, min: 2 },
      { id: 'reunion', t: '재결성 투어', lvl: 4, late: true }],
    exits: [X('singer', 'disband quit', { stage: 'debut' }), X('teaching', 'disband quit fail', { career: 'vocal_coach' }),
      X('media', 'disband quit', { career: 'radio_dj' }), X('service', 'fail quit', { career: 'barista' })],
    endings: { win: ['🎸', '전설의 밴드', '마지막 곡에서 관객 전원이 함께 뛰었다.'], fall: ['🔌', '플러그를 뽑은 밴드', '합주실 열쇠를 반납하던 날이 마지막 공연이었다.'] },
    lines: {
      garage: ['지하 합주실에서 같은 곡을 스무 번 맞췄다.', '중고 앰프를 사려고 알바비를 모았다.', '밴드 이름 투표가 세 시간 걸렸다.'],
      club: ['관객 열두 명 앞에서 공연했다. 그중 셋은 친구였다.', '공연이 끝나고 장비를 직접 날랐다.', '클럽 사장님이 다음 달 공연을 잡아 줬다.'],
      album: ['자비로 찍은 앨범이 상자째 집에 쌓였다.', '인디 차트에 우리 곡이 올라갔다.', '앨범 커버를 함께 작업했다.'],
      festival: ['여름 록 페스티벌 무대에서 슬램이 터졌다.', '해외 페스티벌 초청 메일이 왔다.', '투어 버스에서 새 곡의 가사를 썼다.'],
      headliner: ['메인 무대 마지막 순서. 수만 개의 불빛.', '기념 공연이 경기장에서 열렸다.', '후배 밴드들이 우리 곡을 커버했다.'],
      reunion: ['해체했던 멤버들이 다시 합주실에 모였다.', '머리는 희끗해도 첫 코드는 그대로였다.', '재결성 공연 표가 순식간에 사라졌다.'] } });

  route({ id: 'rapper', name: '래퍼', icon: '🎧', group: '연예계', scene: 'stage', careers: ['rapper'],
    fit: { lang: 2, music: 2, stage: 2, voice: 1 },
    entry: { age: [13, 35], tracks: ['music', 'general', 'trainee'], how: '크루 가입·사이퍼', text: '라임 노트와 마이크 하나로 동네 크루의 사이퍼(돌아가며 즉흥 랩을 하는 모임)에서 시작한다.' },
    athlete: { decline: 45, end: 70 },
    stages: [
      { id: 'crew', t: '언더그라운드 크루', train: true, min: 1, max: 6 },
      { id: 'mixtape', t: '믹스테이프 래퍼', lvl: 0, skill: 35, min: 1, max: 6 },
      { id: 'show', t: '〈쇼미더라임〉 출신', lvl: 1, skill: 48, min: 1, max: 6 },
      { id: 'debut', t: '정식 데뷔 래퍼', lvl: 2, skill: 58, min: 1, max: 8 },
      { id: 'chart', t: '차트 래퍼', lvl: 3, skill: 68, min: 2, max: 10 },
      { id: 'legend', t: '레이블 대표·레전드', lvl: 4, skill: 78, fit: 58, peak: true, min: 2 },
      { id: 'oldschool', t: '올드스쿨 레전드', lvl: 3, late: true }],
    exits: [X('singer', 'choice quit', { stage: 'debut' }), X('creator', 'fail quit scandal', { career: 'youtuber' }), X('teaching', 'quit retire fail', { career: 'vocal_coach' }),
      X('media', 'choice retire', { career: 'radio_dj' }), X('service', 'fail quit', { career: 'barista' })],
    endings: { win: ['🎧', '라임의 전설', '쌓아 온 가사가 시대의 노래가 됐다.'], fall: ['📼', '끝나지 않은 믹스테이프', '더 많은 이야기를 들려주고 싶다는 아쉬움이 남았다.'] },
    lines: {
      crew: ['지하 연습실에서 크루의 비트에 새 벌스를 얹었다.', '공원 사이퍼에서 프리스타일을 하다 가사를 까먹었다. 다들 웃어 줬다.', '라임 노트 한 권을 다 채웠다.'],
      mixtape: ['무료 믹스테이프를 올렸다. 재생 수 214회.', '작은 클럽 공연에서 관객 서른 명이 따라 불렀다.', '중고 마이크로 방에서 녹음했다. 옆집이 벽을 두드렸다.'],
      show: ['〈쇼미더라임〉 1차 예선 번호표를 목에 걸었다.', '방송에서 디스전을 이겼다. 실시간 검색어에 이름이 올랐다.', '탈락했지만 그 무대 영상이 백만 회를 넘었다.'],
      debut: ['레이블과 새 작업 일정을 조율했다.', '정규 앨범 트랙리스트를 새벽까지 고쳤다.', '음원 사이트 신곡 차트에 이름이 걸렸다.'],
      chart: ['피처링 요청이 하루에 세 건씩 들어온다.', '대학 축제 무대에서 떼창이 터졌다.', '내 가사를 문신으로 새긴 팬을 만났다.'],
      legend: ['신인 래퍼의 작업을 지원했다.', '페스티벌 헤드라이너로 마지막 곡을 불렀다.', '후배 래퍼들이 내 가사를 오마주했다.'],
      oldschool: ['요즘 비트는 빠르다. 그래도 내 라임은 아직 통한다.', '〈쇼미더라임〉 심사위원석에 앉았다.', '기념 공연에 옛 크루가 모였다.'] } });

  route({ id: 'actor', name: '배우', icon: '🎬', group: '연예계', scene: 'studio', careers: ['actor'],
    fit: { looks: 2, stage: 2, lang: 1, voice: 1 },
    entry: { age: [10, 40], tracks: ['acting', 'trainee', 'art'], how: '오디션', audition: true, text: '연기 수업과 오디션으로 단역부터 시작한다.' },
    athlete: { decline: 55, end: 82 },
    stages: [
      { id: 'aspiring', t: '연기 지망생', train: true, min: 1, max: 6 },
      { id: 'extra', t: '단역 배우', lvl: 1, skill: 35, min: 1, max: 6 },
      { id: 'supporting', t: '조연', lvl: 2, skill: 52, min: 1, max: 8 },
      { id: 'lead', t: '주연', lvl: 3, skill: 64, fit: 52, min: 2, max: 10 },
      { id: 'star', t: '톱 배우', lvl: 4, skill: 77, peak: true, min: 2 },
      { id: 'veteran', t: '중견 배우', lvl: 3, late: true }],
    exits: [X('media', 'choice quit', { career: 'film_director' }), X('politics', 'choice', { career: 'politician' }),
      X('teaching', 'fail quit', { career: 'cram_tutor' }), X('creator', 'fail scandal quit', { career: 'youtuber' }), X('comedian', 'choice', { stage: 'corner' })],
    endings: { win: ['🎬', '스크린의 얼굴', '레드카펫 위에서 플래시가 멈추지 않았다.'], fall: ['🎞️', '끝나지 않은 연기', '더 오래 연기하고 싶었던 마음을 남겼다.'] },
    lines: {
      aspiring: ['연기 학원에서 같은 대사를 서른 가지로 읽었다.', '오디션 대기실에서 내 번호를 기다렸다.', '독립 영화 촬영장에서 무급으로 도왔다.'],
      extra: ['지나가는 행인 3 역할로 하루 종일 걸었다.', '대사 한 줄을 받아 밤새 연습했다.', '촬영장 도시락이 하루의 기쁨이다.'],
      supporting: ['주인공의 친구 역으로 드라마에 나왔다.', '감독이 내 애드리브를 살려 줬다.', '길에서 "그 드라마 친구!"라는 말을 들었다.'],
      lead: ['포스터 한가운데에 내 얼굴이 걸렸다.', '대본 리딩에서 상대 배우와 호흡을 맞췄다.', '시청률 발표 날 아침 일찍 눈이 떠졌다.'],
      star: ['영화제 레드카펫을 걸었다.', '해외 플랫폼 작품의 주연을 맡았다.', '광고판마다 내 얼굴이 걸렸다.'],
      veteran: ['젊은 배우와 부모 자식으로 호흡을 맞췄다. 시간이 빠르다.', '연극 무대로 돌아가 관객 숨소리를 느꼈다.', '연기상 공로상 이야기가 나왔다.'] } });

  route({ id: 'comedian', name: '개그맨', icon: '😂', group: '연예계', scene: 'studio', careers: ['comedian'],
    fit: { stage: 3, lang: 2, social: 1 },
    entry: { age: [17, 35], tracks: ['acting', 'general'], how: '방송사 공채 시험', audition: true, text: '사람을 웃기는 끼로 방송사 개그맨 공채에 도전한다.' },
    athlete: { decline: 55, end: 75 },
    stages: [
      { id: 'hopeful', t: '개그 지망생', train: true, min: 1, max: 5 },
      { id: 'recruit', t: '공채 개그맨', lvl: 0, skill: 40, min: 1, max: 4 },
      { id: 'corner', t: '코너 고정', lvl: 1, skill: 52, min: 1, max: 6 },
      { id: 'catchphrase', t: '유행어 스타', lvl: 2, skill: 64, min: 2, max: 8 },
      { id: 'mc', t: '국민 MC', lvl: 4, skill: 77, peak: true, min: 2 },
      { id: 'veteran', t: '원로 코미디언', lvl: 3, late: true }],
    exits: [X('media', 'choice quit', { career: 'radio_dj' }), X('actor', 'choice', { stage: 'supporting' }), X('creator', 'fail quit scandal', { career: 'youtuber' }),
      X('cook', 'quit fail', { career: 'restaurant_owner' })],
    endings: { win: ['🎤', '국민 MC', '온 가족이 주말 저녁 그의 목소리를 기다렸다.'], fall: ['🙊', '웃기지 못한 개그맨', '무대 뒤에서는 아무도 웃지 않았다.'] },
    lines: {
      hopeful: ['대학로 소극장에서 관객 다섯 명 앞에 섰다.', '개그 노트에 아이디어를 빼곡히 적었다.', '공채 시험 개인기를 거울 앞에서 연습했다.'],
      recruit: ['선배들 앞에서 아이디어 검사를 받았다. 전부 퇴짜.', '방송국 연습실 바닥에서 쪽잠을 잤다.', '방송에 0.5초 얼굴이 나왔다.'],
      corner: ['내 코너가 고정됐다. 매주 새 웃음을 짜야 한다.', '녹화장 방청객 웃음소리가 귀에 남았다.', '코너 회의가 새벽까지 이어졌다.'],
      catchphrase: ['내 유행어를 초등학생들이 따라 했다.', '예능 프로그램 섭외 전화가 몰려왔다.', 'CF에서 유행어를 외쳤다.'],
      mc: ['주말 예능 메인 MC 자리에 앉았다.', '연예대상 무대에 올랐다.', '게스트를 편하게 해 주는 법을 터득했다.'],
      veteran: ['후배 개그맨들의 무대를 객석에서 지켜봤다.', '라디오에서 옛날 코너 이야기를 했다.', '희극인 공로상 시상식에 초대받았다.'] } });

  route({ id: 'model', name: '모델', icon: '👠', group: '연예계', scene: 'runway', careers: ['model'],
    fit: { height: 3, looks: 2, flex: 1 },
    entry: { age: [15, 25], tracks: ['acting', 'art', 'trainee', 'general'], how: '에이전시 캐스팅', audition: true, need: { height: [182, 170] }, text: '큰 키와 외모로 모델 에이전시에 캐스팅된다.' },
    athlete: { decline: 31, end: 40 },
    stages: [
      { id: 'hopeful', t: '모델 지망생', train: true, min: 1, max: 4 },
      { id: 'rookie', t: '신인 모델', lvl: 0, skill: 35, fit: 52, min: 1, max: 4 },
      { id: 'exclusive', t: '전속 모델', lvl: 1, skill: 48, min: 1, max: 5 },
      { id: 'runway', t: '런웨이 모델', lvl: 2, skill: 60, min: 1, max: 6 },
      { id: 'top', t: '톱 모델', lvl: 3, skill: 72, fit: 64, peak: true, min: 1 },
      { id: 'late', t: '베테랑 모델', lvl: 2, late: true }],
    exits: [X('actor', 'choice quit', { stage: 'extra' }), X('design', 'quit retire', { career: 'fashion_designer' }), X('creator', 'quit fail', { career: 'youtuber' }),
      X('service', 'fail quit', { career: 'flight_attendant' })],
    endings: { win: ['👠', '런웨이의 주인공', '세계 컬렉션의 오프닝과 피날레를 걸었다.'], fall: ['📸', '사진첩 속 모델', '사진첩에 담았던 꿈은 뜻대로 이어지지 않았다.'] },
    lines: {
      hopeful: ['워킹 수업에서 하이힐 대신 운동화로 백 바퀴를 돌았다.', '프로필 사진을 찍고 에이전시 열 곳에 보냈다.', '거울 앞에서 표정 연습을 했다.'],
      rookie: ['온라인 쇼핑몰 촬영을 하루 종일 했다.', '패션쇼에서 맨 끝 순서로 걸었다.', '피팅 때 핀이 등을 찔렀다. 웃었다.'],
      exclusive: ['브랜드 전속 계약서에 사인했다.', '잡지 화보 한 면을 채웠다.', '촬영지가 매주 바뀌었다.'],
      runway: ['서울 패션위크 오프닝을 걸었다.', '해외 쇼 캐스팅에 붙었다.', '백스테이지에서 3분 만에 옷을 다섯 번 갈아입었다.'],
      top: ['세계 4대 컬렉션 피날레를 장식했다.', '패션 잡지 표지에 얼굴이 실렸다.', '명품 브랜드의 얼굴이 됐다.'],
      late: ['신인 모델들에게 워킹을 가르쳐 줬다.', '캐스팅 연락이 뜸해졌다.', '마지막 쇼를 언제로 할지 고민했다.'] } });

  // ================================================================ arts & food
  route({ id: 'art', name: '미술계', icon: '🎨', group: '예술', scene: 'gallery', careers: ['painter'],
    fit: { art: 3, dex: 2 },
    entry: { age: [16, 60], tracks: ['art'], how: '작업실 마련', text: '그림 실력으로 습작기를 거쳐 화가가 된다.' },
    athlete: { decline: 72, end: 95 },
    stages: [
      { id: 'student', t: '습작기', train: true, min: 1, max: 6 },
      { id: 'emerging', t: '신진 작가', lvl: 0, skill: 35, min: 1, max: 6 },
      { id: 'first_show', t: '첫 개인전', lvl: 1, skill: 48, min: 1, max: 6 },
      { id: 'established', t: '전업 작가', lvl: 2, skill: 60, min: 2, max: 12 },
      { id: 'master', t: '거장', lvl: 3, skill: 76, fit: 62, peak: true, min: 3 },
      { id: 'elder', t: '원로 작가', lvl: 3, late: true }],
    exits: [X('teaching', 'fail quit', { career: 'cram_tutor' }), X('design', 'fail quit choice', { career: 'photographer' }),
      X('writer', 'choice quit', { career: 'webtoon_artist' }), X('design', 'choice', { career: 'tattoo_artist' })],
    endings: { win: ['🖼️', '미술관에 걸린 이름', '그의 그림 앞에서 사람들이 오래 서 있었다.'], fall: ['🧺', '팔리지 않은 캔버스', '작업실 구석에 그림만 쌓여 갔다.'] },
    lines: {
      student: ['스케치북 한 권을 석고 데생으로 채웠다.', '물감값을 아끼려고 팔레트를 긁어 썼다.', '미술관에서 한 그림 앞에 두 시간을 서 있었다.'],
      emerging: ['단체전 구석 자리에 작품이 걸렸다.', '공모전 입선 소식을 들었다.', '작업실 비용을 마련하려고 그림 수업을 했다.'],
      first_show: ['개인전 오프닝에 관람객들이 찾아왔다.', '빨간 판매 스티커가 붙었다.', '평론가가 작품 앞에서 오래 메모했다.'],
      established: ['갤러리 전속 계약을 맺었다.', '해외 아트페어에 작품이 나갔다.', '연작 열두 점을 1년 동안 완성했다.'],
      master: ['국립 미술관 회고전이 열렸다.', '경매에서 작품이 최고가를 기록했다.', '미술 교과서에 내 그림이 실렸다.'],
      elder: ['손이 떨려 큰 붓 대신 작은 붓을 들었다.', '젊은 작가들이 작업실로 찾아왔다.', '평생 그린 스케치북을 기증했다.'] } });

  route({ id: 'cook', name: '요식업', icon: '🍳', group: '예술', scene: 'kitchen', careers: ['chef', 'restaurant_owner'],
    fit: { taste: 3, dex: 1, endurance: 1 },
    entry: { age: [15, 50], tracks: ['cook', 'general'], how: '주방 취업', text: '맛을 보는 감각으로 주방 막내부터 시작한다.' },
    athlete: { decline: 62, end: 76 },
    stages: [
      { id: 'helper', t: '주방 막내', lvl: 0, min: 1, max: 4 },
      { id: 'line', t: '라인 쿡', lvl: 1, skill: 35, min: 1, max: 5 },
      { id: 'sous', t: '수셰프', lvl: 2, skill: 50, min: 2, max: 7 },
      { id: 'head', t: '헤드 셰프', lvl: 3, skill: 62, min: 2, max: 10, owner: '오너 셰프' },
      { id: 'star', t: '스타 셰프', lvl: 4, skill: 76, fit: 60, peak: true, min: 2, owner: '외식 그룹 대표' },
      { id: 'elder', t: '원로 셰프', lvl: 4, late: true, owner: '원로 사장님' }],
    exits: [X('creator', 'choice quit', { career: 'mukbang_creator' }), X('merchant', 'fail quit', { career: 'street_vendor' }),
      X('teaching', 'quit retire', { career: 'cram_tutor' }), X('service', 'fail quit', { career: 'barista' })],
    endings: { win: ['🍽️', '별을 단 주방', '그의 식당 앞에는 언제나 줄이 서 있었다.'], fall: ['🔥', '불 꺼진 주방', '가게 셔터를 내리던 밤, 육수 냄새만 남았다.'] },
    lines: {
      helper: ['양파 한 자루를 까다 눈물이 멈추지 않았다.', '설거지 산을 넘어 새벽에 퇴근했다.', '셰프가 칼 잡는 법부터 다시 가르쳤다.'],
      line: ['저녁 피크 타임에 접시 백 개를 냈다.', '내 소스가 새 메뉴에 올라갔다.', '손에 화상 자국이 하나 늘었다.'],
      sous: ['주방을 대신 맡은 날 클레임이 하나도 없었다.', '새벽 시장에서 생선 눈을 보는 법을 익혔다.', '후배들의 칼질을 바로잡아 줬다.'],
      head: ['내 이름을 건 새 코스 요리를 냈다.', '음식 평론가가 예고 없이 찾아왔다.', '메뉴판을 한 글자씩 직접 썼다.'],
      star: ['미식 가이드에 별이 붙었다.', '요리 방송 심사위원으로 섭외됐다.', '해외 요리 축제에 초청받았다.'],
      elder: ['제자들이 각자 가게를 열었다.', '평생의 레시피를 책으로 묶었다.', '이제는 맛만 보고 고개를 끄덕인다.'] } });

  // ================================================================ professions
  route({ id: 'law', name: '법조계', icon: '⚖️', group: '전문직', scene: 'court', careers: ['lawyer', 'prosecutor', 'judge', 'patent_attorney'], branchPick: true,
    fit: { logic: 2, lang: 2, smarts: 2 },
    entry: { age: [22, 45], tracks: ['hum', 'study'], how: '법학 학위 → 시험', degree: 'bachelor', majors: ['law'], text: '법학을 전공하고 시험에 붙어야 법조인이 된다.' },
    athlete: { decline: 63, end: 72 },
    stages: [
      { id: 'exam', t: '시험 준비생', train: true, min: 1, max: 4 },
      { id: 'trainee', t: null, lvl: 0, skill: 45, min: 1, max: 4 },
      { id: 'associate', t: null, lvl: 1, skill: 55, min: 2, max: 8 },
      { id: 'senior', t: null, lvl: 2, skill: 66, min: 2, max: 10 },
      { id: 'top', t: null, lvl: -1, skill: 78, fit: 60, peak: true, min: 2 },
      { id: 'elder', t: '원로 법조인', lvl: -1, late: true }],
    exits: [X('politics', 'choice quit', { career: 'politician' }), X('office', 'choice burnout quit', { career: 'office_worker' }),
      X('teaching', 'retire quit', { career: 'cram_tutor' })],
    endings: { win: ['⚖️', '법조계의 거목', '법을 다루는 전문성으로 이름을 남겼다.'], fall: ['📚', '법전 옆의 아쉬움', '법과 함께 걸으려던 길에 고비가 남았다.'] },
    lines: {
      exam: ['독서실 칸막이 안에서 판례집을 넘겼다.', '모의고사 점수가 2점 올랐다.', '고시촌 식당 아주머니가 반찬을 더 줬다.'],
      trainee: ['연수원 기록 과제를 새벽까지 썼다.', '사건 기록이 책상 높이만큼 쌓였다.', '법정 방청석에서 선배의 변론을 받아 적었다.'],
      associate: ['법정에서 맡은 역할을 다했다.', '사건을 꼼꼼히 살펴줘 고맙다는 편지를 받았다.', '야근 끝에 사건 서류를 정리했다.'],
      senior: ['큰 사건의 팀장을 맡았다.', '후배들의 서면을 빨간 펜으로 고쳐 줬다.', '언론이 내 이름을 기사에 적었다.'],
      top: ['중요한 법률 사안을 맡았다.', '법조계 신년 하례식에 초대받았다.', '내 전문적인 의견이 주목받았다.'],
      elder: ['로스쿨 특강에 초대받았다.', '평생 맡은 사건 기록을 정리했다.', '후배들이 고비마다 조언을 구하러 왔다.'] } });

  route({ id: 'medical', name: '의료계', icon: '🩺', group: '전문직', scene: 'surgery', careers: ['doctor', 'surgeon', 'dentist', 'nurse', 'pharmacist', 'veterinarian', 'physical_therapist', 'paramedic'], branchPick: true,
    fit: { logic: 2, dex: 1, endurance: 1, smarts: 2 },
    entry: { age: [20, 45], tracks: ['sci', 'study'], how: '의료 학위 → 면허', degree: 'bachelor', majors: ['medicine', 'nursing', 'science', 'sports', 'agriculture'], text: '의학·간호학 등 보건 계열을 전공하고 면허를 따야 한다.' },
    athlete: { decline: 65, end: 75 },
    stages: [
      { id: 'intern', t: null, lvl: 0, min: 1, max: 3 },
      { id: 'resident', t: null, lvl: 1, skill: 42, min: 2, max: 6 },
      { id: 'specialist', t: null, lvl: 2, skill: 55, min: 2, max: 10 },
      { id: 'chief', t: null, lvl: 3, skill: 68, fit: 55, peak: true, min: 2 },
      { id: 'elder', t: '원로 의료인', lvl: -1, late: true }],
    exits: [X('teaching', 'choice retire', { career: 'professor', ignoreReq: true }), X('politics', 'choice', { career: 'politician' }),
      X('startup', 'choice burnout', { career: 'entrepreneur' })],
    endings: { win: ['🩺', '건강을 돌본 손', '전문성과 정성으로 생명을 돌보는 일에 힘을 보탰다.'], fall: ['🩻', '돌봄의 무게', '건강을 책임지는 일의 무게를 오래 기억했다.'] },
    lines: {
      intern: ['긴 근무 끝에 의자에 앉아 잠시 눈을 붙였다.', '배운 절차를 실수 없이 해냈다.', '도움을 청하는 목소리에 서둘러 움직였다.'],
      resident: ['맡은 일을 마치고 안도의 숨을 쉬었다.', '선배의 질문에 막힘없이 답했다.', '전문 서적을 읽다가 출근 시간을 맞았다.'],
      specialist: ['내 전문성을 믿고 찾아오는 사람이 늘었다.', '어려운 사례에 대한 의견을 부탁받았다.', '전문 모임에서 경험을 발표했다.'],
      chief: ['중요한 결정을 앞두고 내 의견을 물었다.', '현장의 업무 절차를 개선했다.', '후배의 업무를 곁에서 도왔다.'],
      elder: ['업무 시간을 줄이고 경험을 나누는 데 힘을 썼다.', '후배들 앞에서 초보 시절 이야기를 했다.', '예전에 도움을 받았다며 감사 인사가 왔다.'] } });

  // ================================================================ careers folded into routes (stages follow the job's own ladder)
  function G2(id, name, icon, group, scene, careers, tracks, endings, lines, exits) {
    route({ id: id, name: name, icon: icon, group: group, scene: scene, careers: careers, generic: true,
      entry: { tracks: tracks, how: '취업' }, endings: endings, lines: lines, exits: exits || [] });
  }
  G2('office', '직장인', '🏢', '직장', 'office',
    ['office_worker', 'marketer', 'hr_manager', 'sales_rep', 'ceo', 'banker', 'stock_trader', 'accountant', 'insurance_agent', 'investment_banker', 'crypto_trader', 'paralegal'],
    ['hum', 'sci', 'study', 'general'],
    { win: ['💼', '일로 쌓은 이름', '맡은 분야에서 실력을 인정받았다.'], fall: ['📦', '정리하는 책상', '일의 무게를 내려놓고 다음을 생각했다.'] },
    { early: ['업무에 필요한 서류를 정리했다.', '낯선 용어를 수첩에 적었다.', '통장 내역을 세 번 확인했다.'], mid: ['업무 성과를 정리해 발표했다.', '복잡한 일도 익숙하게 처리했다.', '후배에게 경험을 나눠 줬다.'], top: ['중요한 일에 내 판단을 구했다.', '분기 실적을 정리했다.', '업계 모임에서 경험을 이야기했다.'], late: ['그동안의 업무를 기록으로 남긴다.', '후배들이 점심을 사겠다고 했다.', '오래 모은 명함첩을 정리했다.'] },
    [X('startup', 'choice burnout', { career: 'entrepreneur' }), X('cook', 'choice burnout', { career: 'restaurant_owner' }), X('merchant', 'fired burnout'), X('public', 'choice', { career: 'civil_servant' })]);
  G2('startup', '창업가', '🚀', '직장', 'office', ['entrepreneur'], ['study', 'sci', 'general'],
    { win: ['🦄', '큰 사업을 일군 사람', '키워 온 사업이 많은 사람에게 알려졌다.'], fall: ['🧯', '창업의 고비', '사업을 이어 가는 일이 뜻대로 되지 않았다.'] },
    { early: ['사무실 구석 책상에서 밤을 새웠다.', '투자자 미팅에서 또 거절을 들었다.', '고객의 결제 알림에 소리를 질렀다.'], mid: ['직원들 급여를 준비하느라 긴장했다.', '투자 계약서를 읽느라 밤을 새웠다.', '경쟁사가 비슷한 서비스를 냈다.'], top: ['사업 가치를 높이 평가받았다.', '창업 강연 무대에 섰다.', '새 시장 진출을 준비했다.'], late: ['경영진과 업무를 나눴다.', '젊은 창업가들의 멘토가 됐다.', '처음 사업을 시작하던 때를 떠올렸다.'] },
    [X('office', 'fail choice', { career: 'office_worker' }), X('merchant', 'fail', { career: 'street_vendor' })]);
  G2('merchant', '장사·자영업', '🏪', '직장', 'office', ['street_vendor', 'lotto_shop_owner', 'pawnshop_owner', 'antique_dealer', 'real_estate_agent'], ['general', 'cook'],
    { win: ['🏪', '골목 상권의 전설', '동네에서 믿고 찾는 이름이 됐다.'], fall: ['🪧', '장사의 고비', '손님을 맞던 일상을 뜻대로 이어 가지 못했다.'] },
    { early: ['아침부터 손님 맞을 준비를 했다.', '손님에게 꼼꼼하게 설명했다.', '하루 매상을 공책에 적었다.'], mid: ['단골이 이름을 불러 줬다.', '손님에게 알릴 안내문을 새로 만들었다.', '장부 정리가 밤늦게 끝났다.'], top: ['사업을 넓힐 계획을 세웠다.', '동네 상인회 모임을 이끌었다.', '지역 상인 소개 프로그램에 나왔다.'], late: ['일을 이어 갈 사람을 생각했다.', '오랜 단골이 손주를 데리고 왔다.', '일을 시작하는 시간이 조금 늦어졌다.'] },
    [X('service', 'fail choice'), X('cook', 'choice', { career: 'restaurant_owner' })]);
  G2('public', '공무원·외교', '🏛️', '직장', 'office', ['civil_servant', 'diplomat', 'tax_auditor', 'customs_officer', 'city_mayor_aide', 'spy', 'postal_worker'], ['hum', 'study', 'general'],
    { win: ['🏛️', '나라의 살림꾼', '이름 없이 나라를 움직인 사람.'], fall: ['📄', '무거웠던 책임', '공적인 일을 맡는 무게가 오래 남았다.'] },
    { early: ['업무 규정을 거듭 읽었다.', '처리한 일을 문서로 남겼다.', '근무 일정에 맞춰 준비했다.'], mid: ['밀린 업무 때문에 퇴근이 늦다.', '일을 잘 마쳤다는 격려를 받았다.', '업무 보고서를 세 번 고쳐 썼다.'], top: ['오랜 경험을 인정받았다.', '내가 제안한 개선안이 적용됐다.', '중요한 업무를 맡아 마무리했다.'], late: ['앞으로의 생활을 준비했다.', '후배에게 업무 노트를 물려줬다.', '오랜 수고에 감사한다는 말을 들었다.'] },
    [X('politics', 'choice', { career: 'politician' }), X('teaching', 'choice', { career: 'cram_tutor' })]);
  G2('politics', '정치', '🗳️', '직장', 'office', ['politician'], ['hum'],
    { win: ['🏛️', '국민의 선택', '선거 벽보 속 얼굴이 나라를 이끌었다.'], fall: ['🗳️', '낙선 인사', '유세차 마이크가 꺼지고 혼자 남았다.'] },
    { early: ['선거 사무소에서 전단을 접었다.', '시장 골목을 돌며 악수를 했다.', '토론회 질문을 밤새 준비했다.'], mid: ['지역구 민원을 하나씩 해결했다.', '상임위 회의에서 질의를 했다.', '여론조사 숫자에 하루가 흔들렸다.'], top: ['당 대표 연설 무대에 섰다.', '정상회담 테이블에 앉았다.', '국정 연설을 했다.'], late: ['정계 은퇴를 고민했다.', '회고록 원고를 쓰기 시작했다.', '후배 정치인들이 조언을 구하러 왔다.'] },
    [X('office', 'fail scandal', { career: 'office_worker' }), X('media', 'fail quit', { career: 'journalist' })]);
  G2('teaching', '교육', '🍎', '직장', 'school', ['teacher', 'professor', 'kindergarten_teacher', 'cram_tutor', 'pe_teacher', 'librarian', 'vocal_coach'], ['hum', 'sci', 'study', 'music', 'art', 'sport'],
    { win: ['🍎', '배움의 길잡이', '배움을 도왔던 사람들이 오래 기억했다.'], fall: ['🖍️', '쉽지 않았던 가르침', '누군가의 배움을 돕는 일은 쉽지 않았다.'] },
    { early: ['설명을 하다 목소리가 떨렸다.', '안내 자료를 밤늦게 만들었다.', '도움을 청한 사람의 이름을 기억하려 애썼다.'], mid: ['도움을 받았던 사람이 좋은 소식을 전했다.', '질문에 답하다 하루가 갔다.', '새로운 지도 방법을 소개했다.'], top: ['교육 현장에서 경험을 인정받았다.', '교육 연수의 강사로 초대받았다.', '같은 길을 걷고 싶다는 사람이 찾아왔다.'], late: ['고맙다는 인사를 받고 마음이 따뜻해졌다.', '현장에서 쓴 일기를 정리했다.', '오랜 인연들이 안부를 전했다.'] },
    [X('public', 'choice'), X('writer', 'choice', { career: 'novelist' })]);
  G2('it', 'IT·개발', '💻', '직장', 'office', ['programmer', 'game_developer', 'data_scientist', 'white_hacker', 'it_support', 'web_designer'], ['sci', 'tech', 'study', 'general'],
    { win: ['💻', '기술로 남긴 이름', '기술을 다루는 솜씨가 많은 사람에게 도움이 됐다.'], fall: ['🐛', '풀리지 않은 문제', '모니터 불빛 속에서 지쳐 버렸다.'] },
    { early: ['작업 검토에서 수정 의견이 쏟아졌다.', '장애 알림에 새벽에 깼다.', '업무 문서를 꼼꼼히 읽었다.'], mid: ['내가 참여한 작업이 좋은 반응을 얻었다.', '신입의 작업을 검토해 줬다.', '기술 모임에서 경험을 나눴다.'], top: ['복잡한 기술 문제에 대한 의견을 구했다.', '기술 행사에서 발표했다.', '내가 공개한 자료를 많은 사람이 참고했다.'], late: ['오래 맡은 작업을 후배에게 설명했다.', '기술 블로그 글이 교재로 쓰였다.', '새 기술을 천천히 익히며 즐거움을 찾았다.'] },
    [X('startup', 'choice burnout', { career: 'entrepreneur' }), X('science', 'choice', { career: 'ai_researcher' })]);
  G2('science', '과학·우주', '🔬', '전문직', 'lab', ['scientist', 'astronaut', 'ai_researcher', 'astronomer', 'archaeologist', 'lab_tech', 'meteorologist'], ['sci'],
    { win: ['🔭', '과학에 보탠 손길', '연구 현장에서 쌓은 경험과 성과를 인정받았다.'], fall: ['🧫', '남겨진 연구 노트', '과학을 향한 길은 생각처럼 풀리지 않았다.'] },
    { early: ['관측과 실험 자료를 밤새 정리했다.', '장비 사용법을 선배에게 다시 배웠다.', '보고서 초고에 수정 의견이 빼곡했다.'], mid: ['연구 결과를 발표하는 데 힘을 보탰다.', '새 연구 과제에 참여했다.', '학회에서 현장 경험을 나눴다.'], top: ['연구 현장에서 중요한 역할을 맡았다.', '국제 공동 작업에서 경험을 인정받았다.', '과학 소식에 내 이름이 나왔다.'], late: ['후배들의 연구 활동을 돕는다.', '연구 노트를 기록 보관소에 기증했다.', '과학 대중 강연을 다녔다.'] },
    [X('teaching', 'choice', { career: 'professor', ignoreReq: true }), X('it', 'choice', { career: 'data_scientist' })]);
  G2('media', '방송·언론', '📺', '연예계', 'studio', ['journalist', 'news_anchor', 'tv_producer', 'radio_dj', 'film_director', 'paparazzi', 'voice_actor'], ['hum', 'acting', 'general'],
    { win: ['📺', '대중에게 남긴 이름', '참여한 작업들이 많은 사람에게 기억됐다.'], fall: ['📰', '멀어진 관심', '대중의 관심을 붙잡는 일은 쉽지 않았다.'] },
    { early: ['현장에서 기회를 기다리며 하루를 보냈다.', '작업 자료를 정리하며 밤을 새웠다.', '내가 한 일이 세상에 공개됐다.'], mid: ['맡은 작업이 좋은 반응을 얻었다.', '새로운 작업 제안이 들어왔다.', '사람들의 반응을 하나하나 찾아봤다.'], top: ['업계에서 손꼽히는 일을 맡았다.', '내 작업이 상을 받았다.', '인터뷰 요청이 들어왔다.'], late: ['후배들에게 현장 경험을 나눴다.', '그동안의 활동을 돌아보는 특집에 나왔다.', '현장에서 배운 것을 강의했다.'] },
    [X('politics', 'choice', { career: 'politician' }), X('writer', 'choice quit', { career: 'novelist' }), X('creator', 'quit fail', { career: 'youtuber' })]);
  G2('writer', '글·웹툰 작가', '✍️', '예술', 'gallery', ['novelist', 'webtoon_artist'], ['hum', 'art', 'study', 'general'],
    { win: ['📚', '베스트셀러 작가', '서점 매대 맨 앞에 그의 책이 쌓였다.'], fall: ['🗒️', '서랍 속 원고', '끝내 세상에 나오지 못한 원고가 쌓였다.'] },
    { early: ['공모전에 원고를 보냈다.', '연재 마감 직전 새벽 네 시.', '독자 댓글을 열 번 읽었다.'], mid: ['연재 순위가 올라갔다.', '출판 계약서를 받았다.', '팬레터가 왔다.'], top: ['내 작품이 드라마로 만들어졌다.', '해외 번역판이 나왔다.', '작품으로 상을 받았다.'], late: ['절필 대신 천천히 작업하기로 했다.', '창작 강의를 열었다.', '작품집이 나왔다.'] },
    [X('media', 'choice', { career: 'tv_producer' }), X('teaching', 'fail quit', { career: 'cram_tutor' })]);
  G2('design', '디자인·사진', '📐', '예술', 'gallery', ['photographer', 'fashion_designer', 'tattoo_artist', 'architect'], ['art', 'sci', 'general'],
    { win: ['📐', '이름이 브랜드가 된 사람', '그의 작품은 한눈에 알아볼 수 있었다.'], fall: ['✂️', '접힌 스케치', '시안은 끝내 채택되지 않았다.'] },
    { early: ['포트폴리오를 들고 사무실을 돌았다.', '수정 요청이 열두 번 왔다.', '작업실 바닥에서 쪽잠을 잤다.'], mid: ['공들인 작업을 완성했다.', '전시회에 작품을 냈다.', '단골 고객이 생겼다.'], top: ['내 이름을 걸고 일을 맡았다.', '국제 행사에서 작품을 인정받았다.', '대표작이 널리 알려졌다.'], late: ['후배들의 작업을 봐 준다.', '작품집이 나왔다.', '작업 속도를 줄였다.'] },
    [X('art', 'choice', { stage: 'emerging' }), X('teaching', 'fail quit', { career: 'cram_tutor' })]);
  G2('classical', '클래식 연주자', '🎻', '예술', 'stage', ['violinist'], ['music'],
    { win: ['🎻', '거장의 활', '그의 연주가 끝나면 객석이 한참 동안 숨을 죽였다.'], fall: ['🎼', '멈춘 악보', '연습실의 보면대만 그 시절을 기억한다.'] },
    { early: ['하루 여섯 시간 음계 연습을 했다.', '오케스트라 오디션 대기실에서 손을 녹였다.', '악보에 연필로 운지를 빼곡히 적었다.'], mid: ['협연 무대에서 독주를 했다.', '해외 콩쿠르 본선에 올랐다.', '실내악 투어를 다녔다.'], top: ['세계적인 홀에서 독주회를 열었다.', '음반이 클래식 차트 1위에 올랐다.', '악장 자리에 앉았다.'], late: ['제자들의 활 쥐는 법을 고쳐 줬다.', '기념 연주회 프로그램을 골랐다.', '오래된 악기를 후배에게 빌려줬다.'] },
    [X('teaching', 'choice quit fail', { career: 'vocal_coach' }), X('band', 'choice')]);
  G2('creator','크리에이터', '📹', '연예계', 'studio', ['youtuber', 'streamer', 'mukbang_creator', 'pirate_dj'], ['acting', 'general', 'art', 'music'],
    { win: ['📹', '콘텐츠로 남긴 이름', '자신만의 콘텐츠로 많은 사람과 이어졌다.'], fall: ['📉', '멀어진 반응', '원하던 활동을 계속 이어 가지 못했다.'] },
    { early: ['공개한 콘텐츠의 반응은 아직 한산했다.', '제작 도구의 단축키를 외웠다.', '반응 하나에 하루 기분이 좌우됐다.'], mid: ['꾸준히 찾아오는 팬들이 생겼다.', '협업 제안이 왔다.', '새 콘텐츠에 반응이 몰렸다.'], top: ['이름을 알아보는 사람이 많아졌다.', '팬 미팅을 열었다.', '업계 행사 무대에 섰다.'], late: ['제작 주기를 늘렸다.', '후배들과 공동 작업을 했다.', '그동안의 활동을 돌아보는 콘텐츠를 만들었다.'] },
    [X('media', 'choice', { career: 'radio_dj' }), X('startup', 'choice', { career: 'entrepreneur' }), X('merchant', 'fail')]);
  G2('performer', '공연·스턴트', '🎪', '연예계', 'stage', ['stuntman', 'circus_performer', 'magician', 'stunt_driver', 'jockey'], ['sport', 'acting', 'general'],
    { win: ['🎪', '관중을 사로잡은 순간', '그 솜씨에 관중들이 숨을 멈췄다.'], fall: ['🩼', '남겨 둔 도전', '더 보여 주고 싶었던 솜씨를 아쉬움으로 남겼다.'] },
    { early: ['같은 동작을 백 번 반복하며 몸에 익혔다.', '필요한 장비를 꼼꼼히 챙겼다.', '실수도 있었지만 끝까지 해냈다.'], mid: ['내 활약에 관중의 시선이 모였다.', '먼 곳에서 활동할 기회를 얻었다.', '새 기술을 완성했다.'], top: ['내 이름을 보고 찾아오는 관중이 늘었다.', '업계에서 실력을 인정받았다.', '큰 행사를 앞두고 준비에 힘을 쏟았다.'], late: ['후배들에게 안전 수칙을 가르쳤다.', '경험을 살려 후배들의 준비를 도왔다.', '활동을 마무리할 시기를 고민했다.'] },
    [X('sports_staff', 'retire injury', { career: 'personal_trainer' }), X('actor', 'choice', { stage: 'extra' })]);
  G2('esports', 'e스포츠·바둑', '🎮', '운동', 'studio', ['pro_gamer', 'baduk_player'], ['general', 'sci', 'study'],
    { win: ['🎮', '승부의 정상', '수많은 관중이 그 결정적인 순간을 지켜봤다.'], fall: ['🖱️', '끝난 승부', '원하던 성적에 닿지 못한 아쉬움이 남았다.'] },
    { early: ['연습실에서 하루 열네 시간을 보냈다.', '연습 경기 성적이 좋아졌다.', '경기를 복기한 노트가 두꺼워졌다.'], mid: ['중요한 경기에서 좋은 성적을 냈다.', '해외 대회에 출전했다.', '팬들이 응원 문구를 만들어 왔다.'], top: ['큰 대회에서 우승했다.', '업계에서 내 성적을 높이 평가했다.', '후배들이 경기 운영을 배우러 왔다.'], late: ['해설과 지도 제안이 들어왔다.', '팬들과 지난 경기를 돌아봤다.', '후배들의 연습을 지켜봤다.'] },
    [X('creator', 'retire quit', { career: 'streamer' }), X('sports_staff', 'retire', { career: 'sports_pundit' })]);
  G2('sports_staff', '스포츠 지도자·해설', '📋', '운동', 'pitch', ['football_coach', 'sports_coach', 'sports_pundit', 'referee', 'personal_trainer', 'golf_caddie'], ['sport', 'football', 'general'],
    { win: ['📋', '스포츠 현장의 전문가', '경기를 보는 눈과 오랜 경험으로 이름을 남겼다.'], fall: ['🧢', '멀어진 현장', '익숙했던 스포츠 현장에서 한발 물러났다.'] },
    { early: ['현장 준비를 하며 하루를 시작했다.', '전문 강습에 다녔다.', '경기와 운동에 필요한 지식을 익혔다.'], mid: ['내 판단이 현장에서 도움이 됐다.', '많은 사람 앞에서도 침착하게 일을 했다.', '같이 일하던 사람에게 좋은 소식이 왔다.'], top: ['큰 경기와 관련된 일을 맡았다.', '업계에서 전문성을 인정받았다.', '내 경험을 듣고 싶다는 연락이 왔다.'], late: ['젊은 사람들에게 현장 경험을 나눴다.', '자서전 제안을 받았다.', '경기장에서 후배들의 활약을 지켜봤다.'] },
    [X('cook', 'choice', { career: 'restaurant_owner' }), X('media', 'choice', { career: 'radio_dj' })]);
  G2('trades', '기술직', '🔧', '직장', 'workshop', ['engineer', 'electrician', 'plumber', 'carpenter', 'mechanic', 'welder', 'construction_worker', 'factory_worker'], ['tech', 'sci', 'general'],
    { win: ['🔧', '기술의 명인', '정확한 솜씨와 현장 경험을 인정받았다.'], fall: ['⚙️', '멈춰 선 작업', '익숙했던 작업 현장을 뒤로하게 됐다.'] },
    { early: ['공구 이름을 외우느라 수첩을 들고 다녔다.', '선배 옆에서 볼트를 건넸다.', '안전화가 발에 익었다.'], mid: ['혼자 맡은 현장을 무사히 마쳤다.', '기능사 자격증을 땄다.', '후배에게 요령을 가르쳤다.'], top: ['기능 명장으로 선정됐다.', '내 이름을 건 작업장을 열었다.', '큰 현장의 총책임을 맡았다.'], late: ['손이 예전 같지 않아 감독 일을 맡았다.', '공구 상자를 후배에게 물려줬다.', '기술 학교에서 특강을 했다.'] },
    [X('merchant', 'fired'), X('transport', 'fired choice', { career: 'truck_driver' })]);
  G2('farm', '농어업', '🌾', '직장', 'farm', ['farmer', 'fisher', 'haenyeo', 'beekeeper', 'rancher', 'forester', 'smart_farmer', 'simmani'], ['general', 'tech', 'sci'],
    { win: ['🌾', '자연을 아는 장인', '자연과 함께 일하며 쌓은 솜씨를 인정받았다.'], fall: ['🌧️', '뜻대로 되지 않은 계절', '자연을 상대하는 일의 어려움을 배웠다.'] },
    { early: ['새벽 다섯 시에 일어나 일터로 나갔다.', '날씨 예보를 하루 세 번 확인했다.', '어르신들에게 요령을 배웠다.'], mid: ['공들인 일에서 좋은 성과가 났다.', '지역 사람들과 정보를 나눴다.', '장비를 새로 들였다.'], top: ['솜씨를 인정받아 상을 받았다.', '지역 모임에서 중요한 역할을 맡았다.', '내 이름을 믿고 일을 부탁하는 사람이 늘었다.'], late: ['작업량을 줄이고 몸을 돌본다.', '새로 일을 시작한 젊은이들을 도와줬다.', '오래 쓴 장비를 정리했다.'] },
    [X('merchant', 'fail'), X('cook', 'choice', { career: 'restaurant_owner' })]);
  G2('military', '군인', '🎖️', '직장', 'barracks', ['soldier', 'army_officer', 'fighter_pilot', 'navy_sailor', 'special_forces', 'mercenary'], ['tech', 'sport', 'general'],
    { win: ['🎖️', '임무를 짊어진 사람', '위험한 현장에서 경험과 책임감을 인정받았다.'], fall: ['🪖', '무거운 군화', '임무의 무게를 오래 기억했다.'] },
    { early: ['훈련 시간에 맞춰 몸이 먼저 일어났다.', '야외 훈련에 필요한 장비를 챙겼다.', '기본 훈련 평가가 좋아졌다.'], mid: ['합동 훈련을 무사히 마쳤다.', '동료들과 호흡을 맞췄다.', '파견 임무를 다녀왔다.'], top: ['중요한 임무에서 경험을 인정받았다.', '오랜 수고에 격려를 받았다.', '현장에서 내 판단을 구하는 일이 늘었다.'], late: ['앞으로의 생활을 준비했다.', '후배들에게 현장 요령을 알려 줬다.', '함께 일했던 사람들과 안부를 나눴다.'] },
    [X('safety', 'retire choice', { career: 'police' }), X('transport', 'retire', { career: 'airline_pilot' }), X('public', 'retire choice', { career: 'civil_servant' })]);
  G2('safety', '경찰·소방', '🚓', '직장', 'office', ['police', 'firefighter', 'detective', 'prison_guard', 'coast_guard', 'lifeguard', 'bounty_hunter'], ['sport', 'tech', 'general'],
    { win: ['🚒', '위험 앞에 선 사람', '위험한 현장에서 쌓은 경험으로 이름을 남겼다.'], fall: ['📛', '현장의 무게', '위험을 감당하는 일은 생각보다 무거웠다.'] },
    { early: ['긴급한 상황에 심장이 빨리 뛰었다.', '담당 구역을 꼼꼼하게 살폈다.', '선배에게 현장 수칙을 배웠다.'], mid: ['위험한 일을 무사히 마무리했다.', '수고했다는 격려를 받았다.', '동료들이 내 판단을 신뢰했다.'], top: ['경험을 인정받아 책임 있는 일을 맡았다.', '어려운 일을 해결해 주목받았다.', '현장의 사례를 다른 사람들에게 소개했다.'], late: ['현장 활동을 줄이고 몸을 돌봤다.', '후배들의 무사 귀환을 기다린다.', '함께 일한 사람들과 지난 일을 돌아봤다.'] },
    [X('public', 'choice', { career: 'civil_servant' }), X('sports_staff', 'choice', { career: 'personal_trainer' })]);
  G2('transport', '운송', '🚚', '직장', 'road', ['taxi_driver', 'bus_driver', 'truck_driver', 'airline_pilot', 'ship_captain', 'train_driver', 'drone_pilot', 'designated_driver'], ['tech', 'general'],
    { win: ['🛫', '믿고 맡기는 솜씨', '안전한 운용을 위해 쌓아 온 경험이 빛났다.'], fall: ['🚧', '멈춰 선 일정', '계획한 여정을 끝까지 이어 가지 못했다.'] },
    { early: ['작업 구역과 이동 경로를 꼼꼼히 확인했다.', '늦은 일정을 마치고 따뜻한 밥을 먹었다.', '익숙한 장비도 다시 점검했다.'], mid: ['신중한 일 처리로 칭찬을 받았다.', '긴 작업 일정에도 집중력을 지켰다.', '새 장비의 조작법을 익혔다.'], top: ['신입에게 안전 수칙을 가르쳤다.', '중요한 운용 계획을 맡았다.', '업계에서 숙련된 인력으로 인정받았다.'], late: ['일하는 시간을 줄였다.', '함께 일하던 사람들과 지난 일을 이야기했다.', '앞으로의 생활을 준비했다.'] },
    [X('merchant', 'fired'), X('service', 'fired')]);
  G2('service', '서비스직', '🛎️', '직장', 'shop', ['barista', 'hairdresser', 'dog_trainer', 'funeral_director', 'hotel_concierge', 'wedding_planner', 'cleaner', 'flight_attendant'], ['cook', 'general', 'art'],
    { win: ['🛎️', '믿음이 쌓인 이름', '꼼꼼한 일 처리와 배려를 많은 사람이 기억했다.'], fall: ['🧹', '일과 마음 사이', '다른 사람을 돌보느라 내 마음이 지쳤다.'] },
    { early: ['맡은 일을 시작하며 손이 떨렸다.', '출근 준비를 꼼꼼하게 했다.', '현장의 규칙을 외웠다.'], mid: ['지난번 일이 고마웠다는 말을 들었다.', '새로 온 동료의 교육을 도왔다.', '친절한 응대로 칭찬을 받았다.'], top: ['경험을 인정받아 책임 있는 일을 맡았다.', '일하는 방식을 직접 개선했다.', '업계에서 수고를 인정받았다.'], late: ['일하는 날을 줄였다.', '후배에게 요령을 알려 줬다.', '오랜 인연들과 인사를 나눴다.'] },
    [X('merchant', 'fail quit'), X('cook', 'choice', { career: 'chef' })]);
  G2('religion', '종교', '🙏', '직장', 'temple', ['monk', 'priest', 'pastor', 'shaman', 'missionary', 'cult_leader', 'fortune_teller'], ['hum', 'general'],
    { win: ['🙏', '많은 이의 스승', '그의 말 한마디에 많은 사람이 위로받았다.'], fall: ['🕯️', '흔들린 믿음', '믿음이 흔들린 날, 길을 잃었다.'] },
    { early: ['고요히 마음을 가다듬으며 하루를 시작했다.', '배운 내용을 한 줄씩 옮겨 적었다.', '마당을 쓸며 마음을 비웠다.'], mid: ['고민을 들고 찾아오는 사람이 늘었다.', '어려움을 털어놓는 사람의 말을 들었다.', '사람들 앞에서 생각을 이야기했다.'], top: ['많은 사람이 내 이야기를 들으러 왔다.', '찾아온 사람들에게 평안을 빌었다.', '먼 곳에서도 조언을 청했다.'], late: ['조용한 곳에서 지난 삶을 돌아본다.', '후배에게 경험을 나눴다.', '오랫동안 정리한 생각을 글로 남겼다.'] },
    [X('none', 'choice', {}), X('teaching', 'choice', { career: 'cram_tutor' })]);
  G2('gamble', '도박꾼', '🎲', '어둠', 'casino', ['pro_gambler'], ['general'],
    { win: 'casino_king', fall: 'broke_gambler' },
    { early: ['카지노 딜러 테이블에서 칩을 셌다.', '밤과 낮이 바뀌었다.', '첫 큰 판에서 손이 떨렸다.'], mid: ['VIP 룸에 초대받았다.', '확률표를 외우고 다녔다.', '빚과 잭팟 사이를 오갔다.'], top: ['전설의 테이블에 앉았다.', '토너먼트 우승 상금을 받았다.', '모두가 내 베팅을 따라 했다.'], late: ['칩 대신 기억만 남았다.', '테이블에 앉는 날을 줄였다.', '젊은 도박꾼에게 그만두라고 했다.'] },
    [X('merchant', 'quit'), X('con', 'choice fail')]);

  // ================================================================ dark routes (round 8): ladders with police, rivals and betrayal
  // (js/life.js RT.darkYear queues the risks each year). They are never on a school notice board
  // (entry.offer false): a hero gets in through the street (일진 → 패거리 → 조직 막내), prison, an offer, or a job search.
  // Ways out: prison (crime), escape abroad (flee), going straight (quit → an ordinary job), death, or the boss's chair.
  route({ id: 'gang', name: '조직', icon: '🕶️', group: '어둠', scene: 'alley', careers: ['gangster', 'loan_shark', 'drug_smuggler'], dark: true,
    fit: { build: 2, reflex: 1, grit: 1, mischief: 2 },
    entry: { age: [15, 45], tracks: ['general'], anyTrack: true, offer: false, how: '형님들 밑으로 들어감', text: '동네 형님의 소개로 조직의 막내가 된다. 들어가기는 쉽고 나오기는 어렵다.' },
    athlete: { decline: 52, end: 72 },
    stages: [
      { id: 'runner', t: '조직 막내', lvl: 0, min: 1 },
      { id: 'soldier', t: '행동대원', lvl: 1, skill: 35, min: 1 },
      { id: 'lieutenant', t: '중간 보스', lvl: 2, skill: 55, min: 2 },
      { id: 'boss', t: '보스', lvl: 3, skill: 72, fit: 48, peak: true, min: 2 },
      { id: 'elder', t: '은퇴한 큰형님', lvl: -1, late: true }],
    exits: [X('merchant', 'quit', { career: 'street_vendor' }), X('trades', 'quit', { career: 'construction_worker' }), X('transport', 'quit', { career: 'truck_driver' }),
      X('con', 'choice'), X('none', 'flee')],
    endings: { win: ['🕶️', '밤의 도시를 쥔 보스', '골목 심부름꾼이 도시의 밤을 손에 쥐었다. 그 자리는 늘 누군가 노리고 있었다.'], fall: ['🩸', '버려진 행동대원', '형님들을 위해 살았지만, 마지막엔 아무도 오지 않았다.'] },
    lines: {
      runner: ['형님들 차 문을 열어 드리고 담배 심부름을 했다.', '구역 가게들을 돌며 봉투를 걷었다. 손이 떨렸다.', '사무실 바닥을 닦으며 서열부터 외웠다.'],
      soldier: ['다른 구역 애들과 패싸움이 붙었다. 눈두덩이 부었다.', '윗사람이 내 이름을 부르며 일을 맡겼다.', '경찰차가 지나가면 고개부터 숙였다.'],
      lieutenant: ['내 밑으로 애들이 열 명 생겼다.', '유흥가 두 블록이 내 관리 구역이 됐다.', '조직 회의 자리에 내 의자가 생겼다.'],
      boss: ['도시의 밤이 내 말 한마디로 움직인다.', '경쟁 조직 보스와 같은 식탁에 앉았다.', '경호원 없이는 문밖에 나가지 않는다.'],
      elder: ['명절마다 옛 식구들이 인사를 온다. 반은 감옥에 있다.', '잠귀가 밝아졌다. 작은 소리에도 깬다.', '젊은 애들에게 "이 바닥엔 오지 마라"고 했다.'] } });
  route({ id: 'con', name: '사기·꾼', icon: '🃏', group: '어둠', scene: 'alley', careers: ['con_artist', 'yabawi', 'counterfeiter', 'cyber_criminal'], dark: true,
    fit: { smarts: 2, lang: 1, stage: 1, mischief: 2 },
    entry: { age: [16, 65], tracks: ['general'], anyTrack: true, offer: false, how: '판에 바람잡이로 들어감', text: '말솜씨와 눈치로 야바위판·사기판의 바람잡이부터 시작한다.' },
    athlete: { decline: 62, end: 80 },
    stages: [
      { id: 'shill', t: '바람잡이', lvl: 0, min: 1 },
      { id: 'hustler', t: '꾼', lvl: 1, skill: 35, min: 1 },
      { id: 'planner', t: '판 설계자', lvl: 2, skill: 55, min: 2 },
      { id: 'legend', t: '전설의 사기꾼', lvl: 3, skill: 72, fit: 52, peak: true, min: 2 },
      { id: 'elder', t: '손 씻은 늙은 꾼', lvl: -1, late: true }],
    exits: [X('merchant', 'quit', { career: 'street_vendor' }), X('office', 'quit', { career: 'insurance_agent', ignoreReq: true }), X('gamble', 'choice'),
      X('gang', 'choice'), X('none', 'flee')],
    endings: { win: ['🃏', '전설의 사기꾼', '속임수로 이름을 날렸지만 떳떳할 수는 없었다.'], fall: ['🧾', '무너진 판', '속임수로 이어 가던 길이 뜻대로 되지 않았다.'] },
    lines: {
      shill: ['야바위판 옆에서 "와, 또 맞혔다!"를 외쳤다.', '선배 꾼의 손놀림을 몰래 따라 해 봤다.', '하루 일당보다 판이 깨질 때 도망치는 법을 먼저 배웠다.'],
      hustler: ['가짜 명함이 세 종류가 됐다.', '혼자 판을 굴렸다. 상대는 끝까지 몰랐다.', '말 한마디로 낯선 사람의 지갑이 열렸다.'],
      planner: ['판 하나에 사람 다섯을 붙였다. 각본은 내가 썼다.', '대포폰을 한 달마다 바꿨다.', '피해자 이야기가 뉴스에 나왔다. 채널을 돌렸다.'],
      legend: ['업계에서 내 이름은 소문으로만 돈다.', '판 하나로 빌딩 값이 오갔다.', '수사관들이 내 수법에 별명을 붙였다.'],
      elder: ['이제는 판을 짜지 않는다. 대신 사기 예방 강연 요청이 왔다.', '속였던 사람들의 얼굴이 하나씩 떠오른다.', '젊은 꾼이 찾아왔다. 돌려보냈다.'] } });
  route({ id: 'thief', name: '털이·밀수', icon: '🧤', group: '어둠', scene: 'alley', careers: ['pickpocket', 'cat_burglar', 'smuggler'], dark: true,
    fit: { reflex: 2, dex: 2, flex: 1, mischief: 1 },
    entry: { age: [13, 45], tracks: ['general'], anyTrack: true, offer: false, how: '패거리 털이에 끼어듦', text: '날랜 손과 몸으로 소매치기·빈집털이·밀수 운반부터 시작한다.' },
    athlete: { decline: 42, end: 62 },
    stages: [
      { id: 'snatch', t: '좀도둑', lvl: 0, min: 1 },
      { id: 'crew', t: '털이 조직원', lvl: 1, skill: 35, min: 1 },
      { id: 'pro', t: '전문 털이범', lvl: 2, skill: 55, min: 2 },
      { id: 'phantom', t: '잡히지 않는 대도', lvl: 3, skill: 72, fit: 55, peak: true, min: 2 },
      { id: 'elder', t: '은퇴한 대도', lvl: -1, late: true }],
    exits: [X('transport', 'quit', { career: 'truck_driver' }), X('merchant', 'quit', { career: 'street_vendor' }), X('trades', 'quit', { career: 'mechanic' }),
      X('gang', 'choice'), X('none', 'flee')],
    endings: { win: ['🧤', '소문난 대도', '그 수법은 악명을 남겼다. 빼앗긴 사람들의 상처도 남았다.'], fall: ['🚔', '막다른 골목', '남의 것을 노리던 길에서 고비를 만났다.'] },
    lines: {
      snatch: ['시장 골목에서 지갑 하나를 빼냈다. 심장이 귀까지 뛰었다.', 'CCTV 위치를 하나씩 외웠다.', '훔친 물건을 장물아비에게 헐값에 넘겼다.'],
      crew: ['털이 조직에서 망보는 일을 맡았다.', '항구 창고에서 보따리를 옮겼다. 내용물은 묻지 않았다.', '동료가 잡혀갔다. 며칠 숨어 지냈다.'],
      pro: ['자물쇠 하나를 30초에 열었다.', '세관 앞에서 웃는 얼굴로 가방을 끌고 지나갔다.', '경찰 수배 전단에 비슷한 얼굴이 실렸다.'],
      phantom: ['신문이 내 사건을 "유령의 짓"이라고 불렀다.', '흔적을 지우려 주변을 거듭 살폈다.', '금고 회사가 내 수법을 연구한다는 소문을 들었다.'],
      elder: ['손가락이 굳었다. 이제 자물쇠는 못 연다.', '옛 동료의 장례식에 몰래 다녀왔다.', '경찰서 앞을 지나며 모자를 눌러썼다. 버릇이다.'] } });

  // ================================================================ states (no ladder of their own)
  function ST(id, name, icon, scene, careers, exits, lines) { route({ id: id, name: name, icon: icon, group: '상태', scene: scene, careers: careers, state: true, exits: exits, lines: lines }); }
  // fit of the folded career-family routes: the talents, body and stats each line of work leans on
  var GFIT = {
    office: { logic: 1, lang: 1, smarts: 2, social: 1 }, startup: { logic: 1, stage: 1, smarts: 1, grit: 1 }, merchant: { taste: 1, social: 2, grit: 1 },
    public: { lang: 2, smarts: 2, grit: 1 }, politics: { lang: 2, stage: 2, social: 2 }, teaching: { lang: 2, logic: 1, social: 1, smarts: 1 },
    it: { logic: 3, smarts: 2 }, science: { logic: 3, smarts: 3 }, media: { lang: 2, stage: 2, social: 1 }, writer: { lang: 3, art: 1 },
    design: { art: 3, dex: 2 }, classical: { music: 3, dex: 2 }, creator: { stage: 2, art: 1, music: 1, social: 1 },
    performer: { flex: 2, reflex: 2, stage: 2, sport: 1 }, esports: { reflex: 3, logic: 2 }, sports_staff: { sport: 2, lang: 1, social: 1 },
    trades: { dex: 3, build: 1, logic: 1 }, farm: { endurance: 2, build: 1, grit: 1 }, military: { build: 2, endurance: 2, grit: 2 },
    safety: { build: 1, endurance: 2, reflex: 1, grit: 1 }, transport: { reflex: 2, endurance: 1, grit: 1 }, service: { social: 2, taste: 1, looks: 1 },
    religion: { lang: 1, social: 1, grit: 2 }, gamble: { logic: 1, mischief: 2 }
  };
  R.forEach(function (r) { if (GFIT[r.id]) r.fit = GFIT[r.id]; });

  // State routes. '*entry' = any route can be started from here by entering it (entry, choice, school moves)
  ST('school', '학생', '🎒', 'school', [], ['*entry'], {});
  ST('none', '쉬는 중', '🛋️', 'home', [], ['*entry'], { any: ['구인 공고를 넘겨 보다 하루가 갔다.', '이력서를 고쳐 썼다.', '동네 도서관에서 진로 책을 읽었다.', '친척 모임에서 "요즘 뭐 하니?"를 들었다.'] });
  ST('parttime', '아르바이트', '🧾', 'shop', ['convenience_clerk', 'delivery_rider', 'cafe_parttime', 'fastfood_crew', 'newspaper_carrier', 'tutor_parttime', 'pc_bang_parttime', 'cinema_parttime', 'flyer_parttime', 'car_wash_parttime', 'ballboy', 'mascot_parttime', 'lifeguard_parttime'], ['*entry'],
    { any: ['시급 계산을 하며 퇴근했다.', '사장님이 다음 달 근무표를 줬다.', '진상 손님을 웃으며 넘겼다.', '알바 동료와 야식을 먹었다.'] });
  ST('prison', '수감', '⛓️', 'prison', [], [X('none', 'release_jail'), X('school', 'release_jail'), X('gang', 'choice'), X('con', 'choice'), X('thief', 'choice')], {});
  ST('retired', '은퇴 생활', '🌅', 'home', [], [X('parttime', 'entry choice'), X('merchant', 'entry choice'), X('service', 'entry choice'), X('transport', 'entry choice'), X('farm', 'entry choice')], { any: ['아침 산책 코스를 하나 늘렸다.', '동네 공원 벤치에 앉았다.', '좋아하는 풍경 사진을 휴대폰 배경으로 바꿨다.', '화분에 심은 상추가 잘 자랐다.'] });

  // ---------------------------------------------------------------- route tags of older events
  // Events written before routes that move the hero between routes. Group names: 'adrift' = none/parttime/retired,
  // 'employee' = salaried routes. The validator checks every career change against these and the exits.
  RA.data.routeGroups = {
    adrift: ['none', 'parttime'],
    employee: ['office', 'public', 'teaching', 'it', 'science', 'media', 'trades', 'service', 'transport', 'safety', 'military']
  };
  // Route-neutral events allowed to mention work words (회사, 출근…) because they are about someone else's job
  RA.data.jobTalkOk = ['life_any_wallet_reward', 'car_startup_result'];
  var EMP = ['employee'], WORK = ['working'];
  RA.data.routeTags = {
    life_ya_monk_retreat: ['adrift', 'employee', 'retired'], life_any_monk_return: ['religion'],
    life_ya_side_hustle: ['adrift', 'merchant', 'service', 'cook'],
    car_malpractice_exposed: ['medical'], car_bribe_caught: ['public', 'politics', 'safety', 'military', 'law'], car_exploit_traced: ['it', 'con', 'none'],
    car_forgery_exposed: ['art', 'design', 'con', 'none'], car_books_audit: ['office', 'startup'], car_embezzle_caught: ['office', 'public', 'startup'],
    car_pol_coverup_exposed: ['politics'], car_crime_old_crew: ['adrift', 'employee'],
    rl_teen_parttime: ['school', 'none'], rl_start_business: ['office', 'none'], rl_volunteer_service: ['adrift', 'school'],
    rl_old_silver_job: ['retired', 'none'], gam_vip_invite: ['adrift'], path_19: ['none'], path_19_family_trade: ['none'],
    path_job_offer: EMP, path_startup_itch: EMP, path_abroad_post: EMP, path_union: EMP, path_promotion_exam: EMP, life_ya_burnout: EMP,
    life_ya_promotion_party: EMP, life_mid_layoff: EMP, rl_job_offer: EMP, rl_quit_job_dream: EMP, rl_office_gossip: EMP, rl_overtime: EMP,
    mis_bribe_envelope: EMP, mis_company_card: EMP, soc_office_cold: EMP,
    mis_drunk_drive: WORK, rl_drinking_night: WORK, rl_sleep_vs_grind: WORK, rl_return_home: WORK, rl_rent_hike: WORK,
    path_pt_store: ['school', 'none'], path_pt_delivery: ['school', 'none'], path_pt_cafe: ['school', 'none'], path_pt_ballboy: ['school', 'none'],
    path_pt_tutor: ['school', 'none'], path_pt_flyer: ['school', 'none'], path_restaurant: ['office', 'none', 'parttime', 'service'],
    path_second_act: ['retired', 'none'], path_odd_job_offer: ['adrift'], path_dark_offer: ['adrift'],
    gam_vip_invite_job: ['employee'], gam_job_loss: ['employee']
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
