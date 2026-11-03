/* Career catalogue (호날두의 모험).
 * Salaries are reference units (~USD/year, US level); the engine scales per country.
 * Positional helper keeps entries compact:
 * K(id, name, sector, outfit, req, salary, ladder, keyStat, [promoteYears, difficulty, stress, fame, risk], desc, special) */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};
  RA.data.careers = RA.data.careers || [];

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

  /* ---------------- sports ---------------- */
  K('footballer', '프로 축구 선수', 'sports', 'kit',
    { minAge: 16, maxAge: 40, degree: 'none', stats: { football: 60 } },
    [30000, 60000000], ['유스 계약', '1군 백업', '1군 주전', '팀의 에이스', '월드클래스', '레전드'],
    'football', [1, 5, 4, 5, 2], '공 하나로 인생을 바꾸는 길. 거울 앞 세리머니 연습은 필수.', 'football');
  K('football_coach', '축구 감독', 'sports', 'suit',
    { minAge: 28, maxAge: 70, degree: 'high', stats: { football: 45, smarts: 40 }, flags: NJ },
    [35000, 12000000], ['유소년 코치', '2군 코치', '수석 코치', '1군 감독', '명장'],
    'smarts', [3, 4, 4, 4, 0], '90분 내내 서서 소리 지르는 직업. 성대는 소모품.');
  K('sports_pundit', '축구 해설가', 'sports', 'suit',
    { minAge: 24, maxAge: 75, degree: 'high', stats: { football: 35, smarts: 45 } },
    [30000, 1500000], ['지역 방송 해설', '케이블 해설위원', '메인 해설위원', '국민 해설가'],
    'smarts', [3, 3, 2, 4, 0], '"아, 이건 들어가야죠!" 남의 슛에 한숨 쉬고 돈 받는 일.');
  K('referee', '축구 심판', 'sports', 'kit',
    { minAge: 20, maxAge: 55, degree: 'high', stats: { health: 55, grit: 40 } },
    [20000, 250000], ['아마추어 심판', '3부 리그 심판', '1부 리그 심판', '국제 심판'],
    'grit', [3, 3, 4, 2, 0], '모두가 당신을 싫어하지만, 당신 없이는 경기가 안 된다.');
  K('personal_trainer', '퍼스널 트레이너', 'sports', 'casual',
    { minAge: 19, maxAge: 55, degree: 'high', stats: { health: 60, looks: 40 } },
    [25000, 200000], ['헬스장 트레이너', '수석 트레이너', '스타 트레이너', '피트니스 센터 대표'],
    'health', [2, 2, 2, 1, 0], '"하나만 더!"를 하루 3천 번 외치는 직업.');
  K('boxer', '프로 복서', 'sports', 'kit',
    { minAge: 18, maxAge: 35, degree: 'none', stats: { health: 65, grit: 60 } },
    [10000, 5000000], ['신인 복서', '랭커', '동양 챔피언', '세계 챔피언'],
    'grit', [2, 4, 5, 4, 3], '맞으면서 돈 버는 몇 안 되는 정직한 직업.');
  K('baduk_player', '프로 바둑 기사', 'sports', 'suit',
    { minAge: 14, maxAge: 70, degree: 'none', stats: { smarts: 70 } },
    [15000, 1200000], ['초단', '3단', '5단', '9단', '바둑 황제'],
    'smarts', [3, 4, 3, 3, 0], '한 수 두는 데 40분. 상대도 40분. 관중은 잠든다.');
  K('pro_gamer', '프로게이머', 'sports', 'hoodie',
    { minAge: 16, maxAge: 30, degree: 'none', stats: { smarts: 45, grit: 45 } },
    [12000, 3000000], ['연습생', '2군 선수', '1군 주전', '팀 에이스', 'e스포츠 레전드'],
    'grit', [1, 4, 4, 4, 0], '손목 보험이 집보다 비싸다.');
  K('golf_caddie', '골프 캐디', 'sports', 'uniform',
    { minAge: 18, maxAge: 60, degree: 'high', stats: { health: 45 } },
    [18000, 120000], ['신입 캐디', '전담 캐디', '투어 캐디'],
    'health', [2, 1, 2, 1, 0], '남의 공을 나보다 더 잘 안다. 바람 방향은 덤.');

  /* ---------------- medical ---------------- */
  K('doctor', '의사', 'medical', 'whitecoat',
    { minAge: 26, maxAge: 60, degree: 'bachelor', majors: ['medicine'], stats: { smarts: 70 }, flags: NJ },
    [60000, 400000], ['인턴', '레지던트', '전문의', '과장', '병원장'],
    'smarts', [3, 5, 4, 1, 0], '사람을 살리는 일. 밤샘 당직은 덤.');
  K('surgeon', '외과 의사', 'medical', 'scrubs',
    { minAge: 28, maxAge: 62, degree: 'master', majors: ['medicine'], stats: { smarts: 75, grit: 50 }, flags: NJ },
    [70000, 600000], ['외과 레지던트', '외과 전문의', '수술 팀장', '외과 과장', '전설의 집도의'],
    'smarts', [3, 5, 5, 2, 0], '손이 떨리면 안 되는 직업. 커피도 줄여야 한다.');
  K('nurse', '간호사', 'medical', 'scrubs',
    { minAge: 22, maxAge: 62, degree: 'bachelor', majors: ['nursing', 'medicine'], stats: { smarts: 45 }, flags: NJ },
    [40000, 130000], ['신규 간호사', '책임 간호사', '수간호사', '간호부장'],
    'grit', [3, 3, 4, 0, 0], '병원을 실제로 굴리는 사람들. 3교대에 체력은 무한 리필.');
  K('dentist', '치과 의사', 'medical', 'whitecoat',
    { minAge: 25, maxAge: 65, degree: 'bachelor', majors: ['medicine'], stats: { smarts: 65 }, flags: NJ },
    [70000, 350000], ['페이 닥터', '부원장', '개원의', '치과 그룹 대표'],
    'smarts', [3, 4, 2, 0, 0], '"조금 따끔합니다"라는 거짓말을 직업적으로 한다.');
  K('pharmacist', '약사', 'medical', 'whitecoat',
    { minAge: 24, maxAge: 70, degree: 'bachelor', majors: ['medicine', 'science'], stats: { smarts: 60 }, flags: NJ },
    [50000, 180000], ['근무 약사', '관리 약사', '약국 대표'],
    'smarts', [3, 3, 2, 0, 0], '의사 손글씨를 해독하는 유일한 사람.');
  K('paramedic', '응급구조사', 'medical', 'uniform',
    { minAge: 20, maxAge: 55, degree: 'high', stats: { health: 55, grit: 50 }, flags: NJ },
    [32000, 90000], ['구급대원', '선임 구급대원', '구급 팀장'],
    'grit', [3, 3, 5, 0, 1], '사이렌 소리가 출근 알람.');
  K('veterinarian', '수의사', 'medical', 'whitecoat',
    { minAge: 24, maxAge: 68, degree: 'bachelor', majors: ['medicine', 'agriculture', 'science'], stats: { smarts: 60 } },
    [45000, 220000], ['수련 수의사', '동물병원 원장', '동물 메디컬센터장'],
    'smarts', [3, 4, 3, 0, 0], '환자가 말을 못 한다. 대신 문다.');
  K('physical_therapist', '물리치료사', 'medical', 'scrubs',
    { minAge: 22, maxAge: 62, degree: 'bachelor', majors: ['medicine', 'sports', 'nursing'], stats: { health: 45 } },
    [38000, 140000], ['물리치료사', '선임 치료사', '구단 전담 치료사', '재활센터장'],
    'health', [3, 3, 2, 1, 0], '"아파야 낫는 거예요." 반은 진심이다.');

  /* ---------------- law ---------------- */
  K('lawyer', '변호사', 'law', 'suit',
    { minAge: 25, maxAge: 70, degree: 'bachelor', majors: ['law'], stats: { smarts: 70 }, flags: NJ },
    [60000, 1500000], ['신입 변호사', '어쏘 변호사', '파트너 변호사', '대형 로펌 대표'],
    'smarts', [3, 4, 4, 2, 0], '말로 먹고산다. 시간당 요금으로.');
  K('judge', '판사', 'law', 'judge',
    { minAge: 28, maxAge: 65, degree: 'bachelor', majors: ['law'], stats: { smarts: 78 }, flags: ['!jailed', '!ever_jailed'] },
    [80000, 300000], ['판사', '부장판사', '고등법원 판사', '법원장', '대법관'],
    'smarts', [4, 5, 3, 2, 0], '망치 한 번에 인생이 갈린다. 남의 인생이.');
  K('prosecutor', '검사', 'law', 'suit',
    { minAge: 26, maxAge: 63, degree: 'bachelor', majors: ['law'], stats: { smarts: 75 }, flags: ['!jailed', '!ever_jailed'] },
    [70000, 260000], ['초임 검사', '부부장 검사', '부장 검사', '지검장', '검찰총장'],
    'smarts', [3, 5, 4, 2, 0], '드라마에서 늘 정의롭거나 늘 악당인 그 사람.');
  K('paralegal', '법률 사무원', 'law', 'suit',
    { minAge: 20, maxAge: 65, degree: 'high', stats: { smarts: 45 } },
    [30000, 85000], ['사무원', '선임 사무원', '사무장'],
    'smarts', [3, 2, 3, 0, 0], '변호사가 모르는 것을 다 안다. 서류 위치 같은 것.');
  K('patent_attorney', '변리사', 'law', 'suit',
    { minAge: 26, maxAge: 70, degree: 'bachelor', majors: ['engineering', 'science', 'cs', 'law'], stats: { smarts: 72 } },
    [60000, 450000], ['수습 변리사', '변리사', '파트너 변리사', '특허법인 대표'],
    'smarts', [3, 4, 3, 0, 0], '세상의 모든 "최초"를 서류로 증명한다.');

  /* ---------------- tech ---------------- */
  K('programmer', '프로그래머', 'tech', 'hoodie',
    { minAge: 18, maxAge: 65, degree: 'high', stats: { smarts: 60 } },
    [45000, 450000], ['주니어 개발자', '개발자', '시니어 개발자', '테크 리드', 'CTO'],
    'smarts', [2, 3, 3, 0, 0], '"제 컴퓨터에선 되는데요."');
  K('game_developer', '게임 개발자', 'tech', 'hoodie',
    { minAge: 19, maxAge: 60, degree: 'high', majors: ['cs', 'arts', 'engineering'], stats: { smarts: 55 } },
    [38000, 350000], ['신입 개발자', '기획자', '리드 개발자', '디렉터', '스튜디오 대표'],
    'smarts', [2, 3, 4, 2, 0], '남이 노는 걸 만들기 위해 놀 시간이 없다.');
  K('data_scientist', '데이터 과학자', 'tech', 'casual',
    { minAge: 23, maxAge: 65, degree: 'master', majors: ['cs', 'science', 'economics', 'engineering'], stats: { smarts: 72 } },
    [70000, 400000], ['주니어 분석가', '데이터 과학자', '리드 과학자', '최고 데이터 책임자'],
    'smarts', [3, 4, 3, 0, 0], '엑셀로 안 되면 파이썬, 파이썬으로 안 되면 커피.');
  K('white_hacker', '화이트 해커', 'tech', 'hoodie',
    { minAge: 18, maxAge: 60, degree: 'high', stats: { smarts: 70 } },
    [50000, 500000], ['보안 관제 요원', '모의 해킹 전문가', '보안 팀장', '최고 보안 책임자'],
    'smarts', [2, 4, 3, 1, 0], '합법적으로 남의 서버를 털고 감사 인사를 받는다.');
  K('it_support', 'IT 지원 엔지니어', 'tech', 'casual',
    { minAge: 18, maxAge: 65, degree: 'high', stats: { smarts: 40 } },
    [32000, 110000], ['헬프데스크', 'IT 엔지니어', 'IT 팀장'],
    'smarts', [2, 1, 2, 0, 0], '"껐다 켜 보셨어요?" 그게 90%다.');
  K('web_designer', '웹 디자이너', 'tech', 'hoodie',
    { minAge: 19, maxAge: 60, degree: 'high', majors: ['arts', 'cs', 'media'], stats: { smarts: 40 } },
    [32000, 180000], ['주니어 디자이너', 'UI 디자이너', '수석 디자이너', '디자인 총괄'],
    'smarts', [2, 2, 3, 0, 0], '"로고 좀 더 크게, 근데 작게요."');

  /* ---------------- science ---------------- */
  K('scientist', '과학자', 'science', 'lab',
    { minAge: 25, maxAge: 75, degree: 'phd', majors: ['science', 'engineering', 'medicine'], stats: { smarts: 80 } },
    [50000, 350000], ['박사후 연구원', '선임 연구원', '책임 연구원', '연구소장', '노벨상 후보'],
    'smarts', [4, 5, 3, 2, 0], '실험이 실패하면 논문 한 편, 성공하면 논문 두 편.');
  K('astronaut', '우주비행사', 'science', 'space',
    { minAge: 27, maxAge: 50, degree: 'master', majors: ['aerospace', 'engineering', 'science'], stats: { smarts: 85, health: 70 }, flags: ['!jailed', '!ever_jailed'] },
    [70000, 300000], ['후보생', '훈련 우주비행사', '미션 전문가', '선장', '우주 영웅'],
    'smarts', [3, 5, 5, 5, 2], '지구 최고의 출퇴근 풍경. 단, 출퇴근에 6개월.', 'space');
  K('ai_researcher', 'AI 연구원', 'science', 'lab',
    { minAge: 24, maxAge: 70, degree: 'master', majors: ['cs', 'science', 'engineering'], stats: { smarts: 80 } },
    [80000, 1200000], ['연구원', '선임 연구원', '수석 연구원', '연구 책임자'],
    'smarts', [3, 5, 4, 2, 0], '로봇에게 일자리를 줬더니 내 일자리를 묻는다.');
  K('astronomer', '천문학자', 'science', 'lab',
    { minAge: 26, maxAge: 75, degree: 'phd', majors: ['science', 'aerospace'], stats: { smarts: 78 } },
    [50000, 200000], ['박사후 연구원', '천문대 연구원', '천문대장'],
    'smarts', [4, 5, 2, 1, 0], '밤에 일하고 낮에 자는 합법적 핑계.');
  K('archaeologist', '고고학자', 'science', 'lab',
    { minAge: 25, maxAge: 75, degree: 'master', majors: ['humanities', 'science'], stats: { smarts: 65 } },
    [35000, 160000], ['발굴 조사원', '연구원', '발굴단장', '박물관장'],
    'smarts', [4, 4, 2, 1, 1], '붓으로 땅을 쓸며 3천 년 전 쓰레기를 찾는다.');
  K('lab_tech', '연구실 기술원', 'science', 'lab',
    { minAge: 20, maxAge: 65, degree: 'high', majors: ['science', 'medicine', 'engineering'], stats: { smarts: 50 } },
    [30000, 90000], ['연구 보조원', '기술원', '실험실 관리자'],
    'smarts', [3, 2, 2, 0, 0], '박사님들이 깨뜨린 비커를 치우는 진짜 실험실의 주인.');
  K('meteorologist', '기상학자', 'science', 'lab',
    { minAge: 24, maxAge: 68, degree: 'bachelor', majors: ['science', 'engineering'], stats: { smarts: 65 } },
    [45000, 160000], ['예보관', '선임 예보관', '예보국장'],
    'smarts', [3, 3, 3, 1, 0], '틀리면 욕먹고 맞으면 아무도 기억 못 한다.');

  /* ---------------- education ---------------- */
  K('teacher', '교사', 'education', 'suit',
    { minAge: 22, maxAge: 62, degree: 'bachelor', majors: ['education', 'humanities', 'science', 'sports', 'music', 'arts'], stats: { smarts: 55 }, flags: ['!jailed', '!ever_jailed'] },
    [38000, 110000], ['기간제 교사', '정교사', '부장 교사', '교감', '교장'],
    'smarts', [4, 3, 3, 0, 0], '서른 명의 미래를 책임지는데 급식 메뉴로 평가받는다.');
  K('professor', '대학 교수', 'education', 'suit',
    { minAge: 28, maxAge: 70, degree: 'phd', stats: { smarts: 78 }, flags: NJ },
    [60000, 250000], ['시간 강사', '조교수', '부교수', '정교수', '총장'],
    'smarts', [4, 5, 3, 1, 0], '같은 농담을 30년째, 매년 새 학생에게.');
  K('kindergarten_teacher', '유치원 교사', 'education', 'apron',
    { minAge: 21, maxAge: 60, degree: 'bachelor', majors: ['education'], flags: ['!jailed', '!ever_jailed'] },
    [28000, 80000], ['보조 교사', '담임 교사', '원감', '원장'],
    'happy', [3, 2, 4, 0, 0], '하루 400번 "왜요?"에 답하는 철학자.');
  K('cram_tutor', '학원 강사', 'education', 'suit',
    { minAge: 21, maxAge: 65, degree: 'bachelor', stats: { smarts: 60 } },
    [30000, 2500000], ['보조 강사', '단과 강사', '인기 강사', '일타 강사'],
    'smarts', [2, 3, 4, 3, 0], '판서 실력과 드립 실력이 연봉을 정한다.');
  K('pe_teacher', '체육 교사', 'education', 'kit',
    { minAge: 22, maxAge: 62, degree: 'bachelor', majors: ['sports', 'education'], stats: { health: 55 }, flags: NJ },
    [38000, 105000], ['기간제 체육 교사', '체육 교사', '체육 부장', '교장'],
    'health', [4, 2, 2, 0, 0], '호루라기 하나로 학교 전체를 지배한다.');
  K('librarian', '사서', 'education', 'casual',
    { minAge: 22, maxAge: 65, degree: 'bachelor', majors: ['humanities', 'education', 'media'] },
    [32000, 90000], ['사서', '주임 사서', '도서관장'],
    'smarts', [4, 2, 1, 0, 0], '"쉿."이 업무의 30%.');

  /* ---------------- arts ---------------- */
  K('painter', '화가', 'arts', 'artist',
    { minAge: 16, maxAge: 90, degree: 'none', stats: { smarts: 35 } },
    [5000, 3000000], ['무명 화가', '신진 작가', '전업 작가', '거장'],
    'smarts', [3, 3, 3, 3, 0], '살아서 유명해지는 게 목표. 생각보다 어렵다.');
  K('webtoon_artist', '웹툰 작가', 'arts', 'hoodie',
    { minAge: 16, maxAge: 70, degree: 'none', stats: { smarts: 40, grit: 45 } },
    [8000, 2000000], ['아마추어 연재', '신인 작가', '정식 연재 작가', '인기 작가', '웹툰계의 거장'],
    'grit', [2, 3, 5, 3, 0], '마감은 매주 온다. 손목 파스도 매주 산다.');
  K('novelist', '소설가', 'arts', 'casual',
    { minAge: 18, maxAge: 95, degree: 'none', stats: { smarts: 60 } },
    [3000, 2500000], ['습작생', '등단 작가', '중견 작가', '베스트셀러 작가'],
    'smarts', [3, 4, 3, 3, 0], '카페에서 노트북 펴고 4시간 동안 첫 문장을 고친다.');
  K('photographer', '사진작가', 'arts', 'artist',
    { minAge: 18, maxAge: 80, degree: 'none', stats: { smarts: 35, looks: 30 } },
    [15000, 400000], ['어시스턴트', '프리랜서 작가', '전속 작가', '거장 사진가'],
    'smarts', [2, 3, 2, 2, 0], '"자연스럽게 웃어 보세요." 아무도 못 한다.');
  K('violinist', '바이올리니스트', 'arts', 'suit',
    { minAge: 18, maxAge: 80, degree: 'bachelor', majors: ['music'], stats: { grit: 60 } },
    [25000, 1500000], ['객원 단원', '오케스트라 단원', '수석 연주자', '악장', '세계적 솔리스트'],
    'grit', [3, 5, 3, 3, 0], '하루 8시간 연습해서 무대에서 4분.');
  K('fashion_designer', '패션 디자이너', 'arts', 'artist',
    { minAge: 19, maxAge: 75, degree: 'high', majors: ['arts'], stats: { looks: 45, smarts: 45 } },
    [28000, 3000000], ['어시스턴트', '디자이너', '수석 디자이너', '브랜드 디렉터'],
    'looks', [3, 4, 4, 3, 0], '올해 유행은 작년에 자기가 정했다.');
  K('tattoo_artist', '타투이스트', 'arts', 'artist',
    { minAge: 18, maxAge: 70, degree: 'none', stats: { grit: 40 } },
    [15000, 250000], ['견습생', '타투이스트', '유명 타투이스트', '스튜디오 대표'],
    'grit', [2, 2, 2, 1, 0], '오타가 영원히 남는 유일한 직업.');
  K('architect', '건축가', 'arts', 'hardhat',
    { minAge: 24, maxAge: 75, degree: 'bachelor', majors: ['architecture', 'engineering', 'arts'], stats: { smarts: 65 } },
    [45000, 700000], ['인턴 건축가', '설계 담당', '수석 건축가', '건축사무소 대표', '거장 건축가'],
    'smarts', [3, 4, 4, 2, 0], '집 짓는 꿈을 꾸지만 정작 본인은 월세.');

  /* ---------------- entertainment ---------------- */
  K('idol', '아이돌', 'entertainment', 'idol',
    { minAge: 15, maxAge: 32, degree: 'none', stats: { looks: 65, grit: 45 } },
    [5000, 8000000], ['연습생', '데뷔조', '신인 아이돌', '인기 아이돌', '월드 스타'],
    'looks', [1, 5, 5, 5, 0], '칼군무, 다이어트, 팬사인회. 잠은 데뷔 후에.');
  K('singer', '가수', 'entertainment', 'idol',
    { minAge: 16, maxAge: 80, degree: 'none', stats: { looks: 35, grit: 35 } },
    [5000, 6000000], ['무명 가수', '신인 가수', '실력파 가수', '국민 가수', '전설'],
    'grit', [2, 4, 4, 5, 0], '노래 한 곡에 인생을 건다. 앨범 한 장에 대출을 건다.');
  K('actor', '배우', 'entertainment', 'suit',
    { minAge: 14, maxAge: 85, degree: 'none', stats: { looks: 55 } },
    [4000, 10000000], ['엑스트라', '단역', '조연', '주연', '대배우'],
    'looks', [2, 5, 4, 5, 0], '시체 역할 3년 후, 대사 한 줄. 감격의 눈물.');
  K('youtuber', '유튜버', 'entertainment', 'hoodie',
    { minAge: 14, maxAge: 80, degree: 'none' },
    [0, 4000000], ['구독자 10명', '실버 버튼', '골드 버튼', '다이아 버튼', '인터넷 황제'],
    'looks', [1, 2, 4, 5, 0], '"구독과 좋아요, 알림 설정까지!" 엄마가 1호 구독자.');
  K('comedian', '개그맨', 'entertainment', 'casual',
    { minAge: 18, maxAge: 80, degree: 'none', stats: { smarts: 45 } },
    [5000, 3000000], ['공채 개그맨', '코너 고정', '예능 고정', 'MC', '국민 MC'],
    'smarts', [2, 4, 4, 5, 0], '남을 웃기다 정작 본인은 녹화 끝나고 운다.');
  K('stuntman', '스턴트맨', 'entertainment', 'kit',
    { minAge: 19, maxAge: 50, degree: 'none', stats: { health: 70, grit: 55 } },
    [25000, 400000], ['보조 스턴트', '스턴트맨', '무술 감독', '액션 연출 감독'],
    'health', [2, 3, 4, 2, 4], '배우 대신 3층에서 떨어지고 크레딧엔 이름이 없다.');
  K('circus_performer', '서커스 단원', 'entertainment', 'idol',
    { minAge: 16, maxAge: 50, degree: 'none', stats: { health: 65, grit: 50 } },
    [15000, 250000], ['막내 단원', '공중그네 단원', '주연 곡예사', '단장'],
    'health', [2, 3, 4, 2, 3], '공중에서 세 바퀴. 땅에선 이삿짐 싸기 달인.');
  K('voice_actor', '성우', 'entertainment', 'casual',
    { minAge: 19, maxAge: 80, degree: 'high', stats: { smarts: 40 } },
    [20000, 600000], ['신인 성우', '전속 성우', '인기 성우', '목소리 장인'],
    'smarts', [3, 4, 3, 3, 0], '얼굴은 몰라도 목소리는 전 국민이 안다.');
  K('magician', '마술사', 'entertainment', 'suit',
    { minAge: 16, maxAge: 85, degree: 'none', stats: { smarts: 40, looks: 35 } },
    [8000, 1500000], ['길거리 마술사', '파티 마술사', '공연 마술사', '세계적 일루셔니스트'],
    'smarts', [2, 3, 3, 4, 1], '비둘기 사료값이 생각보다 많이 든다.');
  K('model', '모델', 'entertainment', 'idol',
    { minAge: 16, maxAge: 45, degree: 'none', stats: { looks: 75 } },
    [8000, 5000000], ['신인 모델', '전속 모델', '런웨이 모델', '톱 모델'],
    'looks', [2, 4, 4, 4, 0], '걷는 것만으로 돈을 번다. 아주 특별하게 걸어야 하지만.');

  /* ---------------- business ---------------- */
  K('entrepreneur', '창업가', 'business', 'hoodie',
    { minAge: 18, maxAge: 75, degree: 'none', stats: { smarts: 50, grit: 50 } },
    [0, 20000000], ['차고 창업', '시드 투자 유치', '시리즈 A', '유니콘', '전설의 창업자'],
    'grit', [2, 4, 5, 4, 1], '직원 셋, 카드 한도 셋, 꿈은 세계 정복.');
  K('ceo', '대기업 CEO', 'business', 'suit',
    { minAge: 35, maxAge: 75, degree: 'bachelor', majors: ['business', 'economics', 'engineering', 'law'], stats: { smarts: 70, grit: 55 }, flags: NJ },
    [200000, 30000000], ['계열사 대표', '사업부 사장', '부회장', '회장'],
    'smarts', [4, 5, 5, 4, 0], '회의, 회의, 그리고 회의에 대한 회의.');
  K('office_worker', '회사원', 'business', 'suit',
    { minAge: 20, maxAge: 62, degree: 'bachelor', stats: { smarts: 40 } },
    [38000, 200000], ['사원', '대리', '과장', '차장', '부장', '임원'],
    'smarts', [3, 2, 3, 0, 0], '"월요일 좋아"라고 말하는 사람을 아직 못 봤다.');
  K('marketer', '마케터', 'business', 'casual',
    { minAge: 21, maxAge: 60, degree: 'bachelor', majors: ['business', 'media', 'economics', 'arts'], stats: { smarts: 50 } },
    [40000, 280000], ['주니어 마케터', '마케터', '마케팅 팀장', '최고 마케팅 책임자'],
    'smarts', [3, 3, 4, 1, 0], '"이번 캠페인, 바이럴 될 겁니다." 십중팔구 안 된다.');
  K('hr_manager', '인사 담당자', 'business', 'suit',
    { minAge: 22, maxAge: 62, degree: 'bachelor', majors: ['business', 'humanities', 'economics'] },
    [40000, 220000], ['인사팀 사원', '인사 담당', '인사팀장', '인사 총괄'],
    'smarts', [3, 2, 3, 0, 0], '모두의 연봉을 알지만 아무 말도 못 한다.');
  K('real_estate_agent', '공인중개사', 'business', 'suit',
    { minAge: 20, maxAge: 75, degree: 'high', stats: { smarts: 45, looks: 35 } },
    [15000, 600000], ['중개 보조원', '공인중개사', '부동산 대표', '부동산 큰손'],
    'looks', [2, 2, 3, 0, 0], '"이 가격, 오늘만이에요." 매일 오늘이다.');
  K('lotto_shop_owner', '로또 판매점 사장', 'business', 'apron',
    { minAge: 25, maxAge: 85, degree: 'none' },
    [20000, 150000], ['동네 판매점', '1등 배출점', '명당 판매점'],
    'happy', [4, 1, 1, 1, 0], '남의 꿈을 팔아 내 꿈을 이룬다. 본인은 안 산다.');
  K('sales_rep', '영업 사원', 'business', 'suit',
    { minAge: 20, maxAge: 62, degree: 'high', stats: { looks: 40 } },
    [30000, 300000], ['영업 사원', '영업 대리', '영업 팀장', '영업 본부장'],
    'looks', [2, 2, 4, 0, 0], '간 수치와 실적이 반비례한다.');

  /* ---------------- finance ---------------- */
  K('banker', '은행원', 'finance', 'suit',
    { minAge: 22, maxAge: 62, degree: 'bachelor', majors: ['business', 'economics', 'law'], stats: { smarts: 55 }, flags: ['!jailed', '!ever_jailed'] },
    [45000, 900000], ['행원', '대리', '지점장', '본부장', '은행장'],
    'smarts', [3, 3, 3, 0, 0], '매일 남의 돈을 세고, 월급날만 내 돈을 센다.');
  K('stock_trader', '주식 트레이더', 'finance', 'suit',
    { minAge: 21, maxAge: 70, degree: 'bachelor', majors: ['economics', 'business', 'cs', 'science'], stats: { smarts: 65, grit: 45 } },
    [50000, 8000000], ['주니어 트레이더', '트레이더', '수석 트레이더', '헤지펀드 매니저'],
    'smarts', [2, 4, 5, 2, 1], '모니터 여섯 개, 심장 하나.');
  K('accountant', '회계사', 'finance', 'suit',
    { minAge: 22, maxAge: 68, degree: 'bachelor', majors: ['business', 'economics'], stats: { smarts: 65 } },
    [50000, 450000], ['수습 회계사', '회계사', '매니저', '파트너', '회계법인 대표'],
    'smarts', [3, 4, 4, 0, 0], '1원이 안 맞아서 밤을 새운다. 진짜로.');
  K('insurance_agent', '보험 설계사', 'finance', 'suit',
    { minAge: 20, maxAge: 75, degree: 'high', stats: { looks: 35 } },
    [12000, 400000], ['신입 설계사', '설계사', '팀장', '명예의 전당 설계사'],
    'looks', [2, 1, 3, 0, 0], '친척 모임에 가면 모두가 먼저 자리를 피한다.');
  K('investment_banker', '투자은행가', 'finance', 'suit',
    { minAge: 23, maxAge: 65, degree: 'master', majors: ['business', 'economics', 'law'], stats: { smarts: 75, grit: 60 }, flags: NJ },
    [120000, 10000000], ['애널리스트', '어소시에이트', 'VP', '매니징 디렉터', '파트너'],
    'grit', [2, 5, 5, 1, 0], '주 100시간 일하고 보너스로 시간을 산다.');
  K('crypto_trader', '코인 투자자', 'finance', 'hoodie',
    { minAge: 18, maxAge: 80, degree: 'none', stats: { grit: 30 } },
    [0, 5000000], ['개미', '고래 지망생', '고래', '전설의 존버러'],
    'grit', [1, 2, 5, 1, 2], '"가즈아!" 그리고 한강 뷰… 또는 한강 수위 확인.');

  /* ---------------- government ---------------- */
  K('politician', '정치인', 'government', 'suit',
    { minAge: 25, maxAge: 85, degree: 'high', stats: { smarts: 50, looks: 40 }, flags: ['!jailed'] },
    [40000, 400000], ['구의원', '시의원', '국회의원', '장관', '{leader}'],
    'looks', [4, 5, 5, 5, 1], '악수 1만 번, 공약 100개, 지킨 공약은… 노코멘트.', 'politics');
  K('diplomat', '외교관', 'government', 'suit',
    { minAge: 24, maxAge: 65, degree: 'bachelor', majors: ['law', 'economics', 'humanities', 'business'], stats: { smarts: 72 }, flags: ['!jailed', '!ever_jailed'] },
    [55000, 260000], ['외무 서기관', '참사관', '공사', '대사'],
    'smarts', [4, 5, 3, 2, 0], '세 나라 말로 "검토해 보겠습니다"를 할 수 있다.');
  K('civil_servant', '공무원', 'government', 'suit',
    { minAge: 20, maxAge: 60, degree: 'high', stats: { smarts: 50 }, flags: ['!jailed', '!ever_jailed'] },
    [35000, 140000], ['9급 주무관', '7급 주무관', '사무관', '서기관', '국장'],
    'smarts', [4, 3, 2, 0, 0], '정년, 연금, 그리고 끝없는 결재 도장.');
  K('spy', '국정원 요원', 'government', 'suit',
    { minAge: 23, maxAge: 55, degree: 'bachelor', stats: { smarts: 70, health: 60, grit: 55 }, flags: ['!jailed', '!ever_jailed'] },
    [50000, 250000], ['신입 요원', '현장 요원', '베테랑 요원', '작전 팀장', '전설의 그림자'],
    'smarts', [3, 5, 5, 0, 3], '가족에게는 "무역회사 다녀"라고 말한다.');
  K('tax_auditor', '세무 공무원', 'government', 'suit',
    { minAge: 22, maxAge: 60, degree: 'bachelor', majors: ['business', 'economics', 'law'], stats: { smarts: 60 }, flags: ['!jailed', '!ever_jailed'] },
    [40000, 160000], ['조사관', '선임 조사관', '조사 팀장', '세무서장'],
    'smarts', [4, 3, 3, 0, 0], '파티에서 직업을 말하면 다들 지갑을 숨긴다.');
  K('customs_officer', '세관원', 'government', 'uniform',
    { minAge: 21, maxAge: 60, degree: 'high', stats: { smarts: 45 }, flags: ['!jailed', '!ever_jailed'] },
    [35000, 120000], ['세관 직원', '검사관', '세관 팀장', '세관장'],
    'smarts', [4, 2, 3, 0, 0], '여행 가방 속 수상한 물건을 엑스레이보다 먼저 알아챈다.');
  K('city_mayor_aide', '시장 비서관', 'government', 'suit',
    { minAge: 23, maxAge: 60, degree: 'bachelor', majors: ['law', 'humanities', 'economics', 'media', 'business'], stats: { smarts: 55 } },
    [38000, 150000], ['인턴 비서', '비서관', '수석 비서관', '비서실장'],
    'smarts', [3, 3, 4, 1, 0], '시장님 연설문의 진짜 작가. 이름은 절대 안 나온다.');

  /* ---------------- military ---------------- */
  K('soldier', '직업 군인', 'military', 'military',
    { minAge: 18, maxAge: 45, degree: 'high', stats: { health: 55 }, flags: ['!jailed'] },
    [28000, 160000], ['하사', '중사', '상사', '원사', '주임원사'],
    'grit', [3, 2, 4, 0, 2], '기상 06시. 주말에도 06시.');
  K('army_officer', '육군 장교', 'military', 'military',
    { minAge: 22, maxAge: 50, degree: 'bachelor', stats: { health: 55, smarts: 50, grit: 50 }, flags: ['!jailed', '!ever_jailed'] },
    [38000, 220000], ['소위', '대위', '소령', '대령', '장군'],
    'grit', [4, 4, 4, 1, 2], '어깨 위 별을 세는 직업. 별 대신 흰머리가 먼저 온다.');
  K('fighter_pilot', '전투기 조종사', 'military', 'pilot',
    { minAge: 22, maxAge: 40, degree: 'bachelor', stats: { health: 75, smarts: 65, grit: 60 }, flags: ['!jailed', '!ever_jailed'] },
    [50000, 220000], ['조종 훈련생', '편대원', '편대장', '비행대대장', '에이스 조종사'],
    'health', [3, 5, 5, 2, 3], '음속을 넘는 출근길. 멀미약은 금지.');
  K('navy_sailor', '해군 부사관', 'military', 'military',
    { minAge: 18, maxAge: 45, degree: 'high', stats: { health: 55 }, flags: ['!jailed'] },
    [28000, 140000], ['하사', '중사', '상사', '원사'],
    'grit', [3, 2, 4, 0, 2], '6개월 바다 위. 육지 멀미가 생긴다.');
  K('special_forces', '특수부대원', 'military', 'military',
    { minAge: 20, maxAge: 40, degree: 'high', stats: { health: 75, grit: 75 }, flags: ['!jailed', '!ever_jailed'] },
    [40000, 180000], ['특전 대원', '팀원', '팀장', '전설의 교관'],
    'grit', [3, 5, 5, 1, 4], '산 하나를 뛰어넘는 게 오전 일과.');

  /* ---------------- public safety ---------------- */
  K('police', '경찰관', 'public', 'police',
    { minAge: 20, maxAge: 55, degree: 'high', stats: { health: 50, grit: 40 }, flags: ['!jailed', '!ever_jailed'] },
    [35000, 160000], ['순경', '경장', '경위', '경감', '총경', '경찰청장'],
    'grit', [3, 3, 4, 1, 2], '야간 순찰과 취객 상담이 주 업무. 추격전은 드물다.');
  K('firefighter', '소방관', 'public', 'firefighter',
    { minAge: 20, maxAge: 50, degree: 'high', stats: { health: 65, grit: 55 }, flags: ['!jailed', '!ever_jailed'] },
    [35000, 130000], ['소방사', '소방교', '소방위', '소방서장'],
    'health', [3, 3, 5, 1, 3], '모두가 도망칠 때 들어가는 사람. 고양이 구조도 한다.');
  K('detective', '형사', 'public', 'casual',
    { minAge: 25, maxAge: 58, degree: 'high', stats: { smarts: 55, grit: 50 }, flags: ['!jailed', '!ever_jailed'] },
    [42000, 170000], ['막내 형사', '형사', '반장', '강력팀장'],
    'smarts', [3, 4, 5, 1, 2], '잠복근무 3일째. 단팥빵이 주식이 됐다.');
  K('prison_guard', '교도관', 'public', 'uniform',
    { minAge: 21, maxAge: 58, degree: 'high', stats: { health: 50 }, flags: ['!jailed', '!ever_jailed'] },
    [33000, 110000], ['교도', '교위', '교감', '교도소장'],
    'grit', [4, 2, 4, 0, 1], '매일 감옥에 출근하지만 퇴근은 할 수 있다.');
  K('coast_guard', '해양경찰', 'public', 'uniform',
    { minAge: 20, maxAge: 55, degree: 'high', stats: { health: 60, grit: 45 }, flags: ['!jailed', '!ever_jailed'] },
    [35000, 140000], ['순경', '경장', '경위', '함장'],
    'health', [3, 3, 4, 1, 2], '파도와 밀수꾼, 둘 다 만만치 않다.');
  K('lifeguard', '해수욕장 안전요원', 'public', 'kit',
    { minAge: 17, maxAge: 45, degree: 'none', stats: { health: 60 } },
    [18000, 60000], ['안전요원', '선임 요원', '구조대장'],
    'health', [2, 1, 2, 0, 1], '선글라스 끼고 바다를 노려보는 게 진짜 업무다.');
  K('postal_worker', '집배원', 'public', 'uniform',
    { minAge: 19, maxAge: 60, degree: 'high', stats: { health: 45 } },
    [30000, 80000], ['집배원', '선임 집배원', '우체국장'],
    'health', [4, 1, 3, 0, 0], '동네 개들이 모두 이름을 안다. 좋은 의미는 아니다.');

  /* ---------------- agriculture / fishing ---------------- */
  K('farmer', '농부', 'agri', 'farmer',
    { minAge: 16, maxAge: 90, degree: 'none', stats: { health: 40 } },
    [12000, 250000], ['소작농', '자영농', '대농', '스마트팜 대표'],
    'health', [3, 1, 3, 0, 0], '하늘이 사장님. 장마가 오면 결재가 반려된다.');
  K('fisher', '어부', 'agri', 'farmer',
    { minAge: 16, maxAge: 85, degree: 'none', stats: { health: 50 } },
    [14000, 250000], ['갑판원', '어부', '선장', '선단주'],
    'health', [3, 1, 4, 0, 2], '새벽 3시 출항. 물고기도 그 시간엔 졸려 한다.');
  K('haenyeo', '해녀/해남', 'agri', 'farmer',
    { minAge: 16, maxAge: 85, degree: 'none', stats: { health: 60, grit: 50 } },
    [12000, 90000], ['애기 해녀', '하군', '중군', '상군', '대상군'],
    'grit', [4, 3, 4, 1, 2], '숨 한 번에 전복 하나. 숨비소리가 출근 도장.');
  K('beekeeper', '양봉가', 'agri', 'farmer',
    { minAge: 18, maxAge: 85, degree: 'none', stats: { grit: 35 } },
    [10000, 150000], ['초보 양봉가', '양봉가', '양봉 농장주'],
    'grit', [3, 2, 2, 0, 1], '직원 5만 마리. 노조는 없지만 침은 있다.');
  K('rancher', '목장주', 'agri', 'farmer',
    { minAge: 18, maxAge: 85, degree: 'none', stats: { health: 50 } },
    [15000, 400000], ['목장 일꾼', '목동', '목장주', '대목장주'],
    'health', [3, 2, 3, 0, 1], '소 200마리의 이름을 다 안다. 조카 이름은 헷갈린다.');
  K('forester', '산림 관리원', 'agri', 'farmer',
    { minAge: 19, maxAge: 65, degree: 'high', majors: ['agriculture', 'science'], stats: { health: 50 } },
    [28000, 90000], ['산림 보호원', '산림 관리원', '국립공원 소장'],
    'health', [4, 2, 2, 0, 1], '나무와 대화하는 시간이 사람과 대화하는 시간보다 길다.');
  K('smart_farmer', '스마트팜 농부', 'agri', 'farmer',
    { minAge: 22, maxAge: 75, degree: 'bachelor', majors: ['agriculture', 'engineering', 'cs', 'science'], stats: { smarts: 55 } },
    [25000, 600000], ['청년 농부', '스마트팜 운영자', '농업 벤처 대표', '농업계 혁신가'],
    'smarts', [3, 3, 3, 1, 0], '딸기에게 와이파이를 연결했다. 딸기가 더 빨라졌다.');

  /* ---------------- trades / manufacturing ---------------- */
  K('engineer', '엔지니어', 'trade', 'hardhat',
    { minAge: 22, maxAge: 65, degree: 'bachelor', majors: ['engineering', 'aerospace', 'science', 'cs', 'architecture'], stats: { smarts: 60 } },
    [55000, 300000], ['신입 엔지니어', '엔지니어', '선임 엔지니어', '수석 엔지니어', '기술 총괄'],
    'smarts', [3, 3, 3, 0, 0], '"원래 그렇게 설계된 겁니다."');
  K('electrician', '전기 기사', 'trade', 'hardhat',
    { minAge: 18, maxAge: 65, degree: 'high', stats: { smarts: 35 } },
    [30000, 140000], ['견습공', '전기 기사', '기사장', '전기공사 대표'],
    'smarts', [3, 2, 3, 0, 2], '빨간 선이냐 파란 선이냐, 그것이 문제로다.');
  K('plumber', '배관공', 'trade', 'hardhat',
    { minAge: 17, maxAge: 70, degree: 'none', stats: { health: 40 } },
    [28000, 150000], ['견습공', '배관공', '베테랑 배관공', '설비업체 사장'],
    'health', [3, 1, 2, 0, 1], '새벽 2시에 가장 반가운 손님.');
  K('carpenter', '목수', 'trade', 'hardhat',
    { minAge: 17, maxAge: 75, degree: 'none', stats: { health: 40, grit: 35 } },
    [25000, 130000], ['조공', '목수', '도편수', '공방 대표'],
    'grit', [3, 2, 2, 0, 1], '두 번 재고 한 번 자른다. 가끔 세 번 자른다.');
  K('mechanic', '자동차 정비사', 'trade', 'hardhat',
    { minAge: 17, maxAge: 70, degree: 'none', stats: { smarts: 30 } },
    [26000, 120000], ['견습 정비사', '정비사', '정비 실장', '카센터 사장'],
    'smarts', [3, 1, 2, 0, 1], '소리만 듣고 고장을 맞힌다. 의사보다 정확하다.');
  K('welder', '용접공', 'trade', 'hardhat',
    { minAge: 18, maxAge: 65, degree: 'none', stats: { health: 45, grit: 40 } },
    [30000, 130000], ['보조 용접공', '용접공', '특급 용접사', '용접 반장'],
    'grit', [3, 2, 3, 0, 2], '불꽃 튀는 직장 생활. 비유가 아니다.');
  K('construction_worker', '건설 노동자', 'trade', 'hardhat',
    { minAge: 18, maxAge: 65, degree: 'none', stats: { health: 50 } },
    [26000, 110000], ['일용직', '기능공', '반장', '현장 소장'],
    'health', [2, 1, 4, 0, 2], '도시의 스카이라인 절반은 내 손으로 올렸다.');
  K('factory_worker', '공장 노동자', 'trade', 'uniform',
    { minAge: 18, maxAge: 62, degree: 'none' },
    [24000, 90000], ['생산직 사원', '숙련공', '조장', '생산 반장'],
    'grit', [3, 1, 3, 0, 1], '컨베이어 벨트 속도에 인생 템포를 맞춘다.');

  /* ---------------- service / food ---------------- */
  K('chef', '셰프', 'service', 'chef',
    { minAge: 17, maxAge: 75, degree: 'none', stats: { grit: 40 } },
    [22000, 1500000], ['주방 막내', '라인 쿡', '수셰프', '헤드 셰프', '스타 셰프'],
    'grit', [2, 3, 5, 3, 0], '"예, 셰프!"를 하루 천 번. 언젠가 내가 들을 날까지.');
  K('barista', '바리스타', 'service', 'apron',
    { minAge: 17, maxAge: 70, degree: 'none' },
    [20000, 90000], ['바리스타', '헤드 바리스타', '카페 사장', '로스터리 대표'],
    'happy', [2, 1, 2, 0, 0], '하트 라떼아트 성공률 30%. 나머지는 "튤립"이다.');
  K('hairdresser', '미용사', 'service', 'apron',
    { minAge: 17, maxAge: 75, degree: 'none', stats: { looks: 40 } },
    [20000, 300000], ['스태프', '디자이너', '실장', '원장', '스타 헤어디자이너'],
    'looks', [2, 2, 3, 1, 0], '"다듬기만 해 주세요"의 정확한 길이를 아는 사람.');
  K('dog_trainer', '반려견 훈련사', 'service', 'casual',
    { minAge: 18, maxAge: 75, degree: 'none', stats: { grit: 40 } },
    [20000, 300000], ['보조 훈련사', '훈련사', '수석 훈련사', '국민 개통령'],
    'grit', [2, 2, 2, 3, 0], '문제견은 없다. 문제 보호자만 있을 뿐.');
  K('funeral_director', '장의사', 'service', 'suit',
    { minAge: 21, maxAge: 75, degree: 'high' },
    [30000, 150000], ['장례지도사 보조', '장례지도사', '장례식장 실장', '장례식장 대표'],
    'grit', [3, 2, 3, 0, 0], '고객 만족도 조사를 할 수 없는 유일한 업종.');
  K('hotel_concierge', '호텔리어', 'service', 'uniform',
    { minAge: 19, maxAge: 65, degree: 'high', stats: { looks: 45 } },
    [26000, 180000], ['벨보이', '프런트 직원', '컨시어지', '총지배인'],
    'looks', [3, 2, 3, 0, 0], '무엇이든 구해 드립니다. 새벽 3시의 젤리 곰까지.');
  K('wedding_planner', '웨딩 플래너', 'service', 'suit',
    { minAge: 21, maxAge: 65, degree: 'high', stats: { looks: 40 } },
    [22000, 250000], ['어시스턴트', '플래너', '수석 플래너', '웨딩업체 대표'],
    'looks', [3, 2, 4, 0, 0], '남의 인생 최고의 날을 매주 세 번 겪는다.');
  K('cleaner', '청소 노동자', 'service', 'apron',
    { minAge: 16, maxAge: 80, degree: 'none' },
    [18000, 50000], ['청소원', '반장', '청소업체 대표'],
    'health', [3, 1, 2, 0, 0], '도시가 깨어나기 전에 도시를 깨끗하게 만든다.');
  K('restaurant_owner', '식당 사장', 'service', 'chef',
    { minAge: 22, maxAge: 85, degree: 'none', stats: { grit: 40 } },
    [10000, 800000], ['동네 식당', '맛집', '체인점 대표', '외식 그룹 회장'],
    'grit', [3, 3, 4, 2, 0], '국 한 그릇에 인생을 담는다. 월세도 담긴다.');
  K('flight_attendant', '승무원', 'service', 'uniform',
    { minAge: 20, maxAge: 55, degree: 'high', stats: { looks: 55, health: 50 } },
    [28000, 120000], ['신입 승무원', '선임 승무원', '사무장', '객실 총괄'],
    'looks', [3, 3, 4, 0, 0], '고도 3만 피트에서 "치킨 오어 비프?"');

  /* ---------------- transport ---------------- */
  K('taxi_driver', '택시 기사', 'transport', 'casual',
    { minAge: 21, maxAge: 80, degree: 'none' },
    [20000, 70000], ['법인 택시 기사', '개인택시 기사', '택시회사 사장'],
    'happy', [3, 1, 3, 0, 1], '이 도시의 모든 정치 평론을 뒷좌석에서 듣는다.');
  K('bus_driver', '버스 기사', 'transport', 'uniform',
    { minAge: 22, maxAge: 68, degree: 'none', stats: { health: 40 } },
    [28000, 80000], ['마을버스 기사', '시내버스 기사', '고속버스 기사'],
    'grit', [3, 1, 3, 0, 1], '"뒷문 열어 주세요!" 이미 열려 있다.');
  K('truck_driver', '화물차 기사', 'transport', 'casual',
    { minAge: 21, maxAge: 70, degree: 'none', stats: { grit: 35 } },
    [30000, 120000], ['용달 기사', '화물차 기사', '트레일러 기사', '운수 회사 사장'],
    'grit', [3, 1, 4, 0, 2], '휴게소 맛집 지도가 머릿속에 다 있다.');
  K('airline_pilot', '항공기 조종사', 'transport', 'pilot',
    { minAge: 23, maxAge: 63, degree: 'bachelor', stats: { smarts: 65, health: 65 }, flags: ['!jailed', '!ever_jailed'] },
    [60000, 400000], ['부기장 훈련생', '부기장', '기장', '수석 기장'],
    'smarts', [4, 5, 3, 0, 1], '"승객 여러분, 기장입니다." 이 한마디에 모두가 안심한다.');
  K('ship_captain', '선장', 'transport', 'uniform',
    { minAge: 22, maxAge: 70, degree: 'high', stats: { health: 50, grit: 50 } },
    [35000, 250000], ['항해사', '1등 항해사', '선장', '선단 총선장'],
    'grit', [4, 3, 4, 0, 2], '배와 결혼했다는 말을 농담 반 진담 반으로 듣는다.');
  K('train_driver', '기관사', 'transport', 'uniform',
    { minAge: 22, maxAge: 62, degree: 'high', stats: { smarts: 45 } },
    [40000, 120000], ['부기관사', '기관사', '고속열차 기관사', '기관사 팀장'],
    'smarts', [4, 3, 3, 0, 0], '시속 300km. 그런데 핸들은 없다.');
  K('drone_pilot', '드론 조종사', 'transport', 'hoodie',
    { minAge: 18, maxAge: 65, degree: 'high', stats: { smarts: 45 } },
    [28000, 160000], ['드론 교육생', '촬영 기사', '방제 팀장', '드론 회사 대표'],
    'smarts', [2, 2, 2, 1, 0], '하늘을 나는데 의자에서 안 일어난다.');

  /* ---------------- religion ---------------- */
  K('monk', '스님', 'religion', 'robe',
    { minAge: 16, maxAge: 90, degree: 'none', flags: ['!married', '!jailed'] },
    [0, 30000], ['행자', '사미', '비구', '주지', '큰스님'],
    'happy', [5, 2, 1, 2, 0], '새벽 3시 예불. 마음은 비우고 머리도 비운다(물리적으로).', 'religion');
  K('priest', '신부', 'religion', 'robe',
    { minAge: 25, maxAge: 85, degree: 'bachelor', majors: ['theology', 'humanities'], flags: ['!married', '!jailed'] },
    [18000, 60000], ['부제', '보좌 신부', '주임 신부', '주교'],
    'happy', [5, 3, 2, 1, 0], '고해성사로 동네의 모든 비밀을 알지만 영원히 말 못 한다.');
  K('pastor', '목사', 'religion', 'suit',
    { minAge: 25, maxAge: 85, degree: 'bachelor', majors: ['theology', 'humanities'], flags: NJ },
    [18000, 250000], ['전도사', '부목사', '담임 목사', '원로 목사'],
    'smarts', [4, 3, 3, 1, 0], '설교 준비는 토요일 밤, 영감은 일요일 새벽.');
  K('shaman', '무당/점술가', 'religion', 'robe',
    { minAge: 18, maxAge: 95, degree: 'none' },
    [5000, 500000], ['신내림 받은 초보', '동네 점집', '용한 무당', '전국구 도사'],
    'smarts', [3, 2, 3, 2, 0], '"올해 물을 조심하세요." 장마철이라 늘 맞는다.');
  K('missionary', '선교사', 'religion', 'casual',
    { minAge: 22, maxAge: 75, degree: 'bachelor', majors: ['theology', 'humanities', 'education', 'medicine', 'nursing'], flags: NJ },
    [12000, 45000], ['단기 선교사', '선교사', '선교 센터장'],
    'grit', [4, 3, 3, 1, 1], '세계 어디서든 일한다. 와이파이만 있으면.');

  /* ---------------- crime ---------------- */
  K('pickpocket', '소매치기', 'crime', 'hoodie',
    { minAge: 14, maxAge: 60, degree: 'none', stats: { grit: 20 } },
    [3000, 60000], ['좀도둑', '소매치기', '골목의 손', '전설의 손가락'],
    'grit', [2, 1, 3, 0, 4], '손이 빠르다. 도망은 더 빠르다.', 'crime');
  K('gangster', '조직폭력배', 'crime', 'suit',
    { minAge: 16, maxAge: 60, degree: 'none', stats: { health: 45, grit: 40 } },
    [8000, 2000000], ['막내', '행동대원', '중간 보스', '부두목', '두목'],
    'grit', [2, 2, 5, 2, 5], '"형님!" 소리 듣는 대가로 평생 뒤를 조심해야 한다.', 'crime');
  K('con_artist', '사기꾼', 'crime', 'suit',
    { minAge: 18, maxAge: 80, degree: 'none', stats: { smarts: 50, looks: 45 } },
    [5000, 3000000], ['잔챙이 사기꾼', '전문 사기꾼', '희대의 사기꾼', '전설의 꾼'],
    'smarts', [2, 2, 4, 1, 4], '말 한마디로 천 냥 빚을… 천 냥 빚으로 만든다.', 'crime');
  K('drug_smuggler', '마약 밀수꾼', 'crime', 'casual',
    { minAge: 18, maxAge: 60, degree: 'none', stats: { grit: 40 } },
    [10000, 6000000], ['운반책', '중간책', '총책', '마약왕'],
    'grit', [2, 2, 5, 1, 5], '돈은 빨리 오고 감옥은 더 빨리 온다.', 'crime');
  K('cyber_criminal', '사이버 범죄자', 'crime', 'hoodie',
    { minAge: 16, maxAge: 65, degree: 'none', stats: { smarts: 65 } },
    [5000, 4000000], ['스크립트 키디', '해커', '해킹 조직 간부', '어둠의 해커'],
    'smarts', [2, 3, 4, 0, 4], '지하실에서 세계 은행을 흔든다. 엄마는 게임하는 줄 안다.', 'crime');
  K('cat_burglar', '괴도', 'crime', 'hoodie',
    { minAge: 18, maxAge: 55, degree: 'none', stats: { health: 55, smarts: 50 } },
    [5000, 2500000], ['빈집털이', '금고털이', '괴도', '전설의 괴도'],
    'smarts', [2, 3, 4, 3, 4], '예고장을 보내는 낭만파. 경찰은 낭만이 없다.', 'crime');
  K('loan_shark', '사채업자', 'crime', 'suit',
    { minAge: 22, maxAge: 75, degree: 'none', stats: { grit: 40 } },
    [10000, 1500000], ['수금책', '사채업자', '사채왕'],
    'grit', [3, 2, 4, 0, 3], '이자 계산은 은행보다 빠르고 양심은 은행보다 느리다.', 'crime');
  K('counterfeiter', '위조범', 'crime', 'artist',
    { minAge: 18, maxAge: 75, degree: 'none', stats: { smarts: 55 } },
    [5000, 1800000], ['가짜 명품 판매상', '위조범', '위조의 장인'],
    'smarts', [3, 3, 4, 0, 4], '예술가 재능을 엉뚱한 데 쓰고 있다.', 'crime');

  /* ---------------- media ---------------- */
  K('journalist', '기자', 'media', 'suit',
    { minAge: 22, maxAge: 65, degree: 'bachelor', majors: ['media', 'humanities', 'economics', 'law'], stats: { smarts: 55 } },
    [32000, 180000], ['수습 기자', '기자', '차장', '부장', '편집국장'],
    'smarts', [3, 3, 4, 1, 0], '마감 10분 전에 특종이 터진다. 꼭 그렇다.');
  K('news_anchor', '뉴스 앵커', 'media', 'suit',
    { minAge: 23, maxAge: 65, degree: 'bachelor', majors: ['media', 'humanities', 'law', 'economics'], stats: { looks: 60, smarts: 55 } },
    [45000, 1000000], ['아나운서', '주말 앵커', '메인 앵커', '국민 앵커'],
    'looks', [3, 5, 3, 4, 0], '책상 아래는 반바지. 비밀이다.');
  K('tv_producer', '방송 PD', 'media', 'hoodie',
    { minAge: 23, maxAge: 65, degree: 'bachelor', stats: { smarts: 55 } },
    [38000, 500000], ['조연출', '연출', '메인 PD', '책임 프로듀서', '방송국 국장'],
    'smarts', [3, 4, 5, 2, 0], '편집실에서 사계절을 보낸다.');
  K('radio_dj', '라디오 DJ', 'media', 'casual',
    { minAge: 20, maxAge: 80, degree: 'high', stats: { smarts: 40 } },
    [25000, 400000], ['새벽 DJ', '심야 DJ', '저녁 DJ', '국민 라디오 DJ'],
    'smarts', [3, 3, 2, 3, 0], '사연을 읽다 혼자 울컥한다. 생방송인데.');
  K('film_director', '영화감독', 'media', 'artist',
    { minAge: 22, maxAge: 85, degree: 'none', stats: { smarts: 55, grit: 50 } },
    [10000, 8000000], ['연출부 막내', '단편 감독', '장편 데뷔 감독', '흥행 감독', '거장'],
    'smarts', [3, 5, 5, 5, 0], '"컷! 한 번만 더." 그게 40번째다.');
  K('paparazzi', '연예부 사진기자', 'media', 'casual',
    { minAge: 20, maxAge: 65, degree: 'high', stats: { grit: 40 } },
    [22000, 250000], ['막내 기자', '현장 기자', '특종 사냥꾼'],
    'grit', [2, 2, 4, 1, 1], '골목에서 12시간 잠복. 결과는 연예인의 편의점 봉지.');

  /* ---------------- part-time (teen-friendly) ---------------- */
  K('convenience_clerk', '편의점 알바', 'parttime', 'apron',
    { minAge: 15, maxAge: 70, degree: 'none' },
    [8000, 22000], ['야간 알바', '주간 알바', '매니저'],
    'happy', [1, 1, 2, 0, 0], '삼각김밥 유통기한의 수호자. 새벽 손님은 늘 수상하다.');
  K('delivery_rider', '배달 라이더', 'parttime', 'casual',
    { minAge: 16, maxAge: 65, degree: 'none', stats: { health: 35 } },
    [9000, 45000], ['초보 라이더', '라이더', '배달왕'],
    'health', [1, 1, 3, 0, 2], '음식이 식기 전에 도착하는 것이 인생의 목표.');
  K('cafe_parttime', '카페 알바', 'parttime', 'apron',
    { minAge: 15, maxAge: 60, degree: 'none' },
    [8000, 24000], ['알바생', '오픈 담당', '매니저'],
    'happy', [1, 1, 2, 0, 0], '"아이스 아메리카노 한 잔이요, 뜨겁게."');
  K('fastfood_crew', '패스트푸드 크루', 'parttime', 'uniform',
    { minAge: 15, maxAge: 60, degree: 'none' },
    [8000, 26000], ['크루', '트레이너', '시프트 매니저'],
    'grit', [1, 1, 3, 0, 0], '감자튀김 기름 냄새가 향수가 됐다.');
  K('newspaper_carrier', '신문 배달', 'parttime', 'casual',
    { minAge: 14, maxAge: 70, degree: 'none' },
    [4000, 12000], ['배달원', '구역 반장', '지국 총무'],
    'health', [1, 1, 2, 0, 0], '새벽 4시, 동네에서 제일 먼저 뉴스를 안다.');
  K('tutor_parttime', '과외 알바', 'parttime', 'casual',
    { minAge: 16, maxAge: 40, degree: 'none', stats: { smarts: 60 } },
    [6000, 30000], ['초보 과외쌤', '인기 과외쌤', '과외 브로커'],
    'smarts', [1, 2, 2, 0, 0], '나도 아직 모르는 걸 가르친다. 30분 먼저 공부하면 된다.');
  K('pc_bang_parttime', 'PC방 알바', 'parttime', 'hoodie',
    { minAge: 16, maxAge: 45, degree: 'none' },
    [8000, 20000], ['알바생', '야간 담당', '점장'],
    'happy', [1, 1, 2, 0, 0], '라면 끓이는 실력이 프로게이머 수준.');
  K('cinema_parttime', '영화관 알바', 'parttime', 'uniform',
    { minAge: 15, maxAge: 40, degree: 'none' },
    [8000, 20000], ['매점 알바', '검표 알바', '파트 리더'],
    'happy', [1, 1, 1, 0, 0], '모든 영화의 결말을 안다. 팝콘 소리로.');
  K('flyer_parttime', '전단지 알바', 'parttime', 'casual',
    { minAge: 14, maxAge: 70, degree: 'none' },
    [3000, 10000], ['전단지 알바', '구역 팀장', '홍보 실장'],
    'grit', [1, 1, 2, 0, 0], '하루 500장. 받아 주는 사람은 천사다.');
  K('car_wash_parttime', '세차장 알바', 'parttime', 'apron',
    { minAge: 15, maxAge: 60, degree: 'none', stats: { health: 30 } },
    [7000, 22000], ['세차 알바', '광택 담당', '세차장 실장'],
    'health', [1, 1, 2, 0, 0], '남의 차가 내 얼굴보다 반짝인다.');
  K('ballboy', '경기장 볼보이', 'parttime', 'kit',
    { minAge: 14, maxAge: 19, ageOut: 22, degree: 'none' },
    [2000, 6000], ['볼보이', '선임 볼보이', '볼보이 반장'],
    'football', [1, 1, 1, 0, 0], '최고의 자리에서 경기를 본다. 공도 가끔 만진다.');
  K('mascot_parttime', '인형탈 알바', 'parttime', 'casual',
    { minAge: 16, maxAge: 50, degree: 'none', stats: { health: 40 } },
    [6000, 25000], ['인형탈 알바', '구단 마스코트', '전설의 마스코트'],
    'health', [1, 1, 3, 1, 0], '안은 사우나, 밖은 동심. 절대 머리를 벗으면 안 된다.');
  K('lifeguard_parttime', '수영장 알바', 'parttime', 'kit',
    { minAge: 16, maxAge: 35, degree: 'none', stats: { health: 45 } },
    [6000, 18000], ['수영장 알바', '수영 강사 보조', '수영 강사'],
    'health', [1, 1, 1, 0, 0], '호루라기를 불 때마다 권력의 맛을 느낀다.');
})(typeof globalThis !== 'undefined' ? globalThis : this);
