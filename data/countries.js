/* Country packs: the Ronaldo family template localized into 8 countries.
 * All clubs, schools and universities are fictional parodies.
 * Money: wage = wage/price factor vs USA; currency.rate = local units per USD. */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};
  RA.data.countries = RA.data.countries || {};

  // ---------------------------------------------------------------- Korea
  RA.data.countries.kr = {
    id: 'kr', name: '한국', adjective: '한국',
    flag: ['#ffffff', '#c60c30', '#003478'],
    skin: ['#f1c9a5', '#e0ac85'],
    hair: '#1b1b1f',
    currency: { unit: '원', symbol: '₩', rate: 1300 },
    wage: 0.7,
    leader: '대통령',
    hero: { surname: '오', given: '날두', nick: '날두' },
    family: {
      father: { name: '오진수', job: '시청 공원 정원사', job2: '제비 FC 장비 담당' },
      mother: { name: '정미자', job: '식당 조리원 겸 청소원' },
      siblings: [
        { key: 'bro', name: '오현우', gender: 'm', gap: 10 },
        { key: 'sis1', name: '오은미', gender: 'f', gap: 8 },
        { key: 'sis2', name: '오가람', gender: 'f', gap: 6 }
      ]
    },
    places: {
      hometown: '제주 서귀포 바닷가 동네', region: '제주', city: '서귀포',
      bigcity: '서울', capital: '서울',
      homeShort: '서귀포 돌담집',
      house: '방 두 칸에 여섯 식구가 사는 낡은 슬레이트 지붕 돌담집'
    },
    clubs: {
      local: '제비 FC',
      regional: '탐라 유나이티드',
      academy: '서울 라이온즈 유스',
      big: '서울 라이온즈',
      rival: '부산 갈매기스',
      league: 'K-프로리그'
    },
    nationalTeam: '대한민국 대표팀',
    school: {
      elem: { name: '초등학교', from: 7, to: 12, school: '서귀포 바다초등학교' },
      middle: { name: '중학교', from: 13, to: 15, school: '서귀포 한라중학교' },
      high: { name: '고등학교', from: 16, to: 18, school: '서귀포 해송고등학교' },
      exam: { name: '수능', age: 18 },
      univTop: '한빛대학교', univMid: '탐라시립대학교', univAbroad: '보스턴 공과대학',
      sportsClub: '방과후 축구부',
      notes: '초 6년·중 3년·고 3년(6-3-3), 고3 11월 수능, 학원 문화'
    },
    foods: ['고기국수', '김치찌개', '떡볶이', '갈치조림', '귤', '몸국', '김밥'],
    holidays: ['설날', '추석', '어린이날', '크리스마스'],
    footballCulture: '동네마다 조기축구회가 새벽 운동장을 지키고, 국가대표 경기 날이면 온 나라가 붉은 옷을 입고 거리로 나온다.',
    names: {
      m: ['민준', '서준', '도윤', '예준', '시우', '하준', '주원', '지호', '준우', '건우', '우진', '태윤', '성민', '동현'],
      f: ['서연', '서윤', '지우', '하은', '민서', '하윤', '지유', '윤서', '채원', '수아', '지민', '예은', '다은', '수빈'],
      surnames: ['김', '이', '박', '최', '정', '강', '조', '윤', '고', '양', '부', '한']
    },
    nameOrder: 'surname-first'
  };

  // ---------------------------------------------------------------- Japan
  RA.data.countries.jp = {
    id: 'jp', name: '일본', adjective: '일본',
    flag: ['#ffffff', '#bc002d', '#ffffff'],
    skin: ['#f3d0b0', '#e2b48e'],
    hair: '#1a1a1e',
    currency: { unit: '엔', symbol: '¥', rate: 150 },
    wage: 0.75,
    leader: '총리',
    hero: { surname: '오시로', given: '나루야', nick: '나루' },
    family: {
      father: { name: '오시로 조지', job: '시청 공원 관리원', job2: 'FC 쓰바메 장비 담당' },
      mother: { name: '오시로 마리코', job: '도시락 가게 조리원 겸 청소원' },
      siblings: [
        { key: 'bro', name: '오시로 유고', gender: 'm', gap: 10 },
        { key: 'sis1', name: '오시로 에마', gender: 'f', gap: 8 },
        { key: 'sis2', name: '오시로 가스미', gender: 'f', gap: 6 }
      ]
    },
    places: {
      hometown: '오키나와 나고시 바닷가 마을', region: '오키나와', city: '나고',
      bigcity: '도쿄', capital: '도쿄',
      homeShort: '나고의 콘크리트 단층집',
      house: '태풍에 대비해 낮게 지은 낡은 콘크리트 단층집, 다다미방 두 칸에 여섯 식구'
    },
    clubs: {
      local: 'FC 쓰바메',
      regional: '류큐 시사 유나이티드',
      academy: '도쿄 블루 팰컨스 유스',
      big: '도쿄 블루 팰컨스',
      rival: '오사카 코스모스',
      league: 'J-프로리그'
    },
    nationalTeam: '일본 대표팀',
    school: {
      elem: { name: '소학교', from: 7, to: 12, school: '나고 바닷바람 소학교' },
      middle: { name: '중학교', from: 13, to: 15, school: '나고 히가시 중학교' },
      high: { name: '고등학교', from: 16, to: 18, school: '얀바루 고등학교' },
      exam: { name: '대학 입시', age: 18 },
      univTop: '도쿄 학원대학', univMid: '류큐 시립대학', univAbroad: '런던 왕립 칼리지',
      sportsClub: '축구부(부카쓰)',
      notes: '소 6년·중 3년·고 3년, 부카쓰(동아리) 문화, 고교 전국대회, 공통 테스트와 대학 입시'
    },
    foods: ['고야 참프루', '오키나와 소바', '오니기리', '라멘', '카레라이스', '사타안다기', '미소시루'],
    holidays: ['오쇼가쓰(설)', '오봉', '어린이날', '에이사 축제'],
    footballCulture: '고교 축구 전국대회가 새해마다 온 나라를 달구고, 프로 경기장에서는 응원단이 90분 내내 노래를 멈추지 않는다.',
    names: {
      m: ['하루토', '소타', '유토', '하야토', '렌', '다이키', '쇼타', '겐타', '류세이', '고타', '신야', '다쿠미', '가이토'],
      f: ['유이', '아오이', '히나', '사쿠라', '미유', '리코', '나나미', '아카리', '유나', '모모카', '하루카', '미사키', '치나쓰'],
      surnames: ['오시로', '히가', '긴조', '다마키', '사토', '스즈키', '다카하시', '다나카', '나카무라', '야마모토', '미야자토']
    },
    nameOrder: 'surname-first'
  };

  // ---------------------------------------------------------------- China
  RA.data.countries.cn = {
    id: 'cn', name: '중국', adjective: '중국',
    flag: ['#de2910', '#ffde00', '#de2910'],
    skin: ['#f0cba6', '#d9a982'],
    hair: '#16161a',
    currency: { unit: '위안', symbol: '¥', rate: 7.2 },
    wage: 0.35,
    leader: '국가주석',
    hero: { surname: '뤄', given: '나둬', nick: '둬둬' },
    family: {
      father: { name: '뤄젠핑', job: '시 원림국 공원 정원사', job2: '옌쯔 FC 장비 담당' },
      mother: { name: '마리화', job: '식당 주방 보조 겸 호텔 청소원' },
      siblings: [
        { key: 'bro', name: '뤄하이', gender: 'm', gap: 10 },
        { key: 'sis1', name: '뤄메이', gender: 'f', gap: 8 },
        { key: 'sis2', name: '뤄팅', gender: 'f', gap: 6 }
      ]
    },
    places: {
      hometown: '하이난섬 하이커우 변두리 어촌 골목', region: '하이난', city: '하이커우',
      bigcity: '상하이', capital: '베이징',
      homeShort: '하이커우의 낡은 벽돌집',
      house: '야자수 옆 낡은 2층 벽돌집, 방 두 칸에 여섯 식구가 산다'
    },
    clubs: {
      local: '옌쯔 FC',
      regional: '하이난 야자수 FC',
      academy: '상하이 룽청 유스',
      big: '상하이 룽청',
      rival: '베이징 창청 FC',
      league: 'C-프로리그'
    },
    nationalTeam: '중국 대표팀',
    school: {
      elem: { name: '소학교', from: 7, to: 12, school: '하이커우 바닷가 제3소학교' },
      middle: { name: '초중(중학교)', from: 13, to: 15, school: '하이커우 야자수 초급중학' },
      high: { name: '고중(고등학교)', from: 16, to: 18, school: '하이커우 해성 고급중학' },
      exam: { name: '가오카오', age: 18 },
      univTop: '화샤 대학', univMid: '남해 사범대학', univAbroad: '캘리포니아 퍼시픽 대학',
      sportsClub: '교내 축구팀',
      notes: '소학 6년·초중 3년·고중 3년, 중카오(고입)와 6월 가오카오'
    },
    foods: ['원창 닭백숙', '하이난 쌀국수', '자오쯔(만두)', '칭부량', '월병', '훠궈', '볶음밥'],
    holidays: ['춘절', '중추절', '단오절', '국경절'],
    footballCulture: '아침 공원에서는 어르신들이 태극권을 하고, 저녁 공터에서는 아이들이 벽돌 두 개로 골대를 만들어 공을 찬다.',
    names: {
      m: ['하오란', '쯔쉬안', '위천', '하오위', '이천', '쥔제', '위항', '밍', '웨이', '정하오', '톈위', '즈청'],
      f: ['이눠', '신이', '쯔한', '위퉁', '신옌', '메이링', '팅팅', '쉐', '자이', '위시', '샤오위', '링'],
      surnames: ['왕', '리', '장', '류', '천', '양', '황', '저우', '우', '린', '푸', '윈']
    },
    nameOrder: 'surname-first'
  };

  // ---------------------------------------------------------------- USA
  RA.data.countries.us = {
    id: 'us', name: '미국', adjective: '미국',
    flag: ['#b22234', '#ffffff', '#3c3b6e'],
    skin: ['#e9be98', '#b9815a'],
    hair: '#2a1d15',
    currency: { unit: '달러', symbol: '$', rate: 1 },
    wage: 1.0,
    leader: '대통령',
    hero: { surname: '메데이로스', given: '로니', nick: '로니' },
    family: {
      father: { name: '조 메데이로스', job: '카운티 공원 관리원', job2: '힐로 스왈로스 SC 장비 담당' },
      mother: { name: '메리 루 메데이로스', job: '리조트 식당 조리원 겸 객실 청소원' },
      siblings: [
        { key: 'bro', name: '휴고 메데이로스', gender: 'm', gap: 10 },
        { key: 'sis1', name: '레일라니 메데이로스', gender: 'f', gap: 8 },
        { key: 'sis2', name: '케이티 메데이로스', gender: 'f', gap: 6 }
      ]
    },
    places: {
      hometown: '하와이 빅아일랜드 힐로의 바닷가 동네', region: '하와이', city: '힐로',
      bigcity: '로스앤젤레스', capital: '워싱턴 D.C.',
      homeShort: '힐로의 낡은 목조 주택',
      house: '비 오면 양철 지붕이 북처럼 울리는 낡은 목조 주택, 방 둘에 여섯 식구'
    },
    clubs: {
      local: '힐로 스왈로스 SC',
      regional: '빅아일랜드 볼케이노스',
      academy: 'LA 선셋 FC 유스 아카데미',
      big: 'LA 선셋 FC',
      rival: '시애틀 레인메이커스',
      league: 'US 메이저 프로리그'
    },
    nationalTeam: '미국 대표팀',
    school: {
      elem: { name: '초등학교', from: 6, to: 11, school: '힐로 레인보우 초등학교' },
      middle: { name: '중학교', from: 12, to: 14, school: '와이아케아 미들스쿨' },
      high: { name: '고등학교', from: 15, to: 18, school: '힐로 볼케이노 하이스쿨' },
      exam: { name: 'SAT', age: 17 },
      univTop: '스탠윅 대학교', univMid: '알로하 주립대학교', univAbroad: '옥스퍼드셔 칼리지',
      sportsClub: '고교 축구팀',
      notes: '킨더~5학년 초등, 6~8학년 중학, 9~12학년 고교, SAT와 대학 체육 장학금'
    },
    foods: ['로코모코', '포케', '스팸 무스비', '말라사다 도넛', '플레이트 런치', '햄버거', '칠면조 구이'],
    holidays: ['추수감사절', '독립기념일', '크리스마스', '할로윈'],
    footballCulture: '“축구”라고 하면 다들 미식축구를 떠올리지만, 주말 공원은 사커 유니폼을 입은 아이들과 접이식 의자를 든 부모들로 꽉 찬다.',
    names: {
      m: ['제이슨', '카이', '노아', '마이클', '이선', '마커스', '대니얼', '브랜던', '타일러', '루카스', '앤드루', '케알라', '마테오'],
      f: ['엠마', '올리비아', '말리아', '소피아', '케일라', '매디슨', '아이리스', '나탈리', '클로이', '코아', '그레이스', '해나', '마야'],
      surnames: ['스미스', '가르시아', '나카무라', '카할레', '존슨', '리', '산토스', '패터슨', '김', '브라운', '아키나']
    },
    nameOrder: 'given-first'
  };

  // ---------------------------------------------------------------- Brazil
  RA.data.countries.br = {
    id: 'br', name: '브라질', adjective: '브라질',
    flag: ['#009c3b', '#ffdf00', '#002776'],
    skin: ['#d9a47a', '#8d5a3b'],
    hair: '#1c140f',
    currency: { unit: '헤알', symbol: 'R$', rate: 5.5 },
    wage: 0.3,
    leader: '대통령',
    hero: { surname: '산투스 소우자', given: '헤이나우두', nick: '나우두' },
    family: {
      father: { name: '조제 소우자', job: '시청 공원 정원사', job2: '안도리냐스 FC 장비 담당' },
      mother: { name: '마리아 헤지나 산투스', job: '식당 조리원 겸 가사도우미' },
      siblings: [
        { key: 'bro', name: '우구 산투스 소우자', gender: 'm', gap: 10 },
        { key: 'sis1', name: '에우자 산투스 소우자', gender: 'f', gap: 8 },
        { key: 'sis2', name: '카치아 산투스 소우자', gender: 'f', gap: 6 }
      ]
    },
    places: {
      hometown: '마라냥주 상루이스섬 언덕배기 동네', region: '마라냥', city: '상루이스',
      bigcity: '상파울루', capital: '브라질리아',
      homeShort: '언덕 골목의 작은 벽돌집',
      house: '언덕 골목 끝 벽돌을 다 못 바른 작은 집, 방 둘에 여섯 식구와 해먹 세 개'
    },
    clubs: {
      local: '안도리냐스 FC',
      regional: '상루이스 투바랑스',
      academy: '파울리스타 레옹이스 유스',
      big: '파울리스타 레옹이스',
      rival: '히우 아틀란치쿠',
      league: '브라질 프로 세리에'
    },
    nationalTeam: '브라질 대표팀',
    school: {
      elem: { name: '초등과정(푼다멘타우 I)', from: 7, to: 11, school: '상루이스 바닷바람 시립학교' },
      middle: { name: '중등과정(푼다멘타우 II)', from: 12, to: 15, school: '상루이스 언덕 주립학교' },
      high: { name: '고등과정(엔시누 메지우)', from: 16, to: 18, school: '마라냥 주립 고등학교' },
      exam: { name: '에넴(ENEM)', age: 18 },
      univTop: '상파울루 연방대학', univMid: '마라냥 주립대학', univAbroad: '리스본 대학',
      sportsClub: '에스콜리냐(축구 교실)',
      notes: '기초교육 9년(I·II)과 중등 3년, 에넴 성적으로 대학 진학; 클럽 에스콜리냐 → 인페리오르스'
    },
    foods: ['페이조아다', '아호스 지 쿠샤', '파스테우', '브리가데이루', '아사이', '타피오카', '모케카'],
    holidays: ['카니발', '상주앙 축제', '크리스마스', '헤베이옹(새해맞이)'],
    footballCulture: '흙바닥이든 해변이든 공터만 있으면 맨발의 펠라다가 시작되고, 동네 꼬마의 드리블에도 어른들이 박수를 친다.',
    names: {
      m: ['주앙', '페드루', '가브리에우', '루카스', '마테우스', '하파에우', '치아구', '브루누', '펠리피', '이고르', '다비', '엔주'],
      f: ['아나', '줄리아', '베아트리스', '라리사', '마리아나', '페르난다', '카밀라', '브루나', '하파엘라', '알리시', '이자도라', '레치시아'],
      surnames: ['시우바', '산투스', '올리베이라', '소우자', '페헤이라', '코스타', '호드리기스', '아우메이다', '리마', '고메스']
    },
    nameOrder: 'given-first'
  };

  // ---------------------------------------------------------------- Argentina
  RA.data.countries.ar = {
    id: 'ar', name: '아르헨티나', adjective: '아르헨티나',
    flag: ['#74acdf', '#ffffff', '#f6b40e'],
    skin: ['#efc8a4', '#c9946b'],
    hair: '#2b1e16',
    currency: { unit: '페소', symbol: '$', rate: 900 },
    wage: 0.25,
    leader: '대통령',
    hero: { surname: '가르시아 페레스', given: '롤란도', nick: '롤로' },
    family: {
      father: { name: '호세 가르시아', job: '시청 공원 정원사', job2: '골론드리나스 FC 장비 담당' },
      mother: { name: '돌로레스 페레스', job: '식당 조리원 겸 청소원' },
      siblings: [
        { key: 'bro', name: '우고 가르시아 페레스', gender: 'm', gap: 10 },
        { key: 'sis1', name: '엘레나 가르시아 페레스', gender: 'f', gap: 8 },
        { key: 'sis2', name: '카리나 가르시아 페레스', gender: 'f', gap: 6 }
      ]
    },
    places: {
      hometown: '티에라델푸에고섬 리오그란데의 바람 센 동네', region: '티에라델푸에고', city: '리오그란데',
      bigcity: '부에노스아이레스', capital: '부에노스아이레스',
      homeShort: '리오그란데의 조립식 집',
      house: '바람막이 함석 담장 안 낡은 조립식 집, 난로 하나를 여섯 식구가 둘러앉는다'
    },
    clubs: {
      local: '골론드리나스 FC',
      regional: '비엔토 델 수르 CA',
      academy: '에스트레야 포르테냐 유스',
      big: '에스트레야 포르테냐',
      rival: '라플라타 콘도레스',
      league: '아르헨티나 프로리가'
    },
    nationalTeam: '아르헨티나 대표팀',
    school: {
      elem: { name: '초등학교(프리마리아)', from: 7, to: 12, school: '리오그란데 제9 프리마리아' },
      middle: { name: '중등 기초과정', from: 13, to: 15, school: '푸에고 해안 세쿤다리아' },
      high: { name: '중등 심화과정', from: 16, to: 18, school: '리오그란데 국립 세쿤다리아' },
      exam: { name: 'CBC 입학시험', age: 18 },
      univTop: '부에노스아이레스 리오델라플라타 대학', univMid: '파타고니아 국립대학', univAbroad: '마드리드 왕립대학',
      sportsClub: '클럽 인페리오레스(유소년부)',
      notes: '프리마리아 6년·세쿤다리아 6년(기초3+심화3), 전국 단일 시험 없음 → 대학 기초과정(CBC); 포트레로와 인페리오레스'
    },
    foods: ['아사도', '엠파나다', '밀라네사', '둘세 데 레체', '로크로', '푸에고 양고기 구이', '알파호르'],
    holidays: ['독립기념일(7월 9일)', '5월 혁명 기념일', '크리스마스', '어린이날'],
    footballCulture: '흙먼지 날리는 포트레로에서 배운 기술이 최고로 대접받고, 일요일 더비 날엔 온 동네가 노래와 깃발로 들썩인다.',
    names: {
      m: ['마테오', '산티아고', '니콜라스', '파쿤도', '토마스', '이그나시오', '루시아노', '에세키엘', '곤살로', '마르틴', '호아킨', '브루노'],
      f: ['소피아', '발렌티나', '카밀라', '루시아', '마르티나', '아구스티나', '플로렌시아', '훌리에타', '밀라그로스', '카탈리나', '로시오', '파울라'],
      surnames: ['곤살레스', '로드리게스', '페르난데스', '로페스', '마르티네스', '디아스', '소사', '로메로', '알바레스', '베니테스']
    },
    nameOrder: 'given-first'
  };

  // ---------------------------------------------------------------- South Africa
  RA.data.countries.za = {
    id: 'za', name: '남아공', adjective: '남아공',
    flag: ['#007a4d', '#ffb612', '#de3831'],
    skin: ['#8a5a3c', '#5e3a24'],
    hair: '#141010',
    currency: { unit: '랜드', symbol: 'R', rate: 18 },
    wage: 0.3,
    leader: '대통령',
    hero: { surname: '마카야', given: '르완도', nick: '완디' },
    family: {
      father: { name: '시포 마카야', job: '시 공원 관리원', job2: '인콘자네 FC 장비 담당' },
      mother: { name: '놈사 마카야', job: '병원 구내식당 조리원 겸 청소원' },
      siblings: [
        { key: 'bro', name: '탄도 마카야', gender: 'm', gap: 10 },
        { key: 'sis1', name: '진틀레 마카야', gender: 'f', gap: 8 },
        { key: 'sis2', name: '린디웨 마카야', gender: 'f', gap: 6 }
      ]
    },
    places: {
      hometown: '이스턴케이프 이스트런던 근교의 타운십', region: '이스턴케이프', city: '이스트런던',
      bigcity: '요하네스버그', capital: '프리토리아',
      homeShort: '양철 지붕 블록집',
      house: '양철 지붕을 얹은 방 두 칸짜리 작은 블록집, 마당에 빨랫줄과 여섯 식구'
    },
    clubs: {
      local: '인콘자네 FC',
      regional: '버펄로 시티 스타스',
      academy: '조이버그 골드 FC 유스',
      big: '조이버그 골드 FC',
      rival: '케이프타운 테이블마운틴 FC',
      league: 'SA 프리미어 프로리그'
    },
    nationalTeam: '남아공 대표팀',
    school: {
      elem: { name: '초등학교(그레이드 1~7)', from: 7, to: 13, school: '음단차네 햇살 초등학교' },
      middle: { name: '고교 저학년(그레이드 8~9)', from: 14, to: 15, school: '음단차네 하이스쿨' },
      high: { name: '고교 고학년(그레이드 10~12)', from: 16, to: 18, school: '음단차네 하이스쿨' },
      exam: { name: '매트릭(졸업시험)', age: 18 },
      univTop: '하이벨트 대학교', univMid: '이스턴케이프 기술대학', univAbroad: '런던 킹스필드 대학',
      sportsClub: '학교 축구팀',
      notes: '초등 그레이드 1~7, 고교 그레이드 8~12, 12학년 말 매트릭(NSC) 시험; 타운십 축구 문화'
    },
    foods: ['우뭉쿠쇼(옥수수 콩죽)', '파프', '브라이 고기 구이', '보보티', '버니 차우', '쿡시스터', '차칼라카'],
    holidays: ['자유의 날', '유산의 날', '크리스마스', '청소년의 날'],
    footballCulture: '타운십 공터에서는 맨발의 아이들이 페트병 골대 사이로 공을 몰고, 경기장에서는 부부젤라 소리가 하늘을 덮는다.',
    names: {
      m: ['시야본가', '루톤도', '반다', '음포', '레세고', '카갈로', '볼리웨', '루카냐', '키건', '애런', '앤델레', '시페실레'],
      f: ['날레디', '레라토', '아얀다', '노물라', '타토', '시네', '템바', '케이틀린', '노부흘레', '우실레', '아마하', '조라'],
      surnames: ['은들로부', '들라미니', '모코에나', '음템부', '은코시', '반 데르 메르베', '보타', '나이두', '아브라함스', '음보나']
    },
    nameOrder: 'given-first'
  };

  // ---------------------------------------------------------------- India
  RA.data.countries.in = {
    id: 'in', name: '인도', adjective: '인도',
    flag: ['#ff9933', '#ffffff', '#138808'],
    skin: ['#c98e63', '#9a6440'],
    hair: '#121014',
    currency: { unit: '루피', symbol: '₹', rate: 83 },
    wage: 0.15,
    leader: '총리',
    hero: { surname: '페르난데스', given: '로이스턴', nick: '로이' },
    family: {
      father: { name: '조지프 페르난데스', job: '마을 공원 정원사', job2: '아바빌 FC 장비 담당' },
      mother: { name: '마리아 루르드 페르난데스', job: '해변 식당 조리원 겸 가사도우미' },
      siblings: [
        { key: 'bro', name: '후버트 페르난데스', gender: 'm', gap: 10 },
        { key: 'sis1', name: '엘시 페르난데스', gender: 'f', gap: 8 },
        { key: 'sis2', name: '캐시 페르난데스', gender: 'f', gap: 6 }
      ]
    },
    places: {
      hometown: '고아주 남쪽 바닷가 어촌 마을', region: '고아', city: '마르가오',
      bigcity: '콜카타', capital: '뉴델리',
      homeShort: '고아의 붉은 벽돌집',
      house: '야자수 그늘 아래 붉은 라테라이트 벽돌집, 방 두 칸에 여섯 식구'
    },
    clubs: {
      local: '아바빌 FC',
      regional: '마르가오 마리너스',
      academy: '하우라 라이언스 유스',
      big: '하우라 라이언스',
      rival: '뭄바이 아라비안스',
      league: '인디아 프로풋볼리그'
    },
    nationalTeam: '인도 대표팀',
    school: {
      elem: { name: '초등학교(1~5학년)', from: 7, to: 11, school: '마르가오 성 요셉 초등학교' },
      middle: { name: '상급 초등(6~8학년)', from: 12, to: 14, school: '살세테 공립학교' },
      high: { name: '중고등(9~12학년)', from: 15, to: 18, school: '마르가오 해안 고등학교' },
      exam: { name: '12학년 보드시험·공대 입시', age: 18 },
      univTop: '인디아 테크 인스티튜트', univMid: '고아 해안대학', univAbroad: '맨체스터 노스 대학',
      sportsClub: '학교 축구팀',
      notes: '1~5 / 6~8 / 9~12학년, 10학년(15~16세)과 12학년 보드시험, JEE·NEET식 전국 입시'
    },
    foods: ['피시 커리 라이스', '비빙카', '소르포텔', '사모사', '달', '차이', '비리야니'],
    holidays: ['크리스마스', '디왈리', '홀리', '독립기념일'],
    footballCulture: '나라 전체는 크리켓에 열광하지만, 고아와 콜카타에서는 몬순 비 속에서도 축구 경기장이 꽉 찬다.',
    names: {
      m: ['아르준', '비크람', '로한', '아니시', '라훌', '프라샨트', '존', '앤서니', '클라이브', '사힐', '이샨', '카비르'],
      f: ['프리야', '아나냐', '스네하', '메이라', '디비야', '셰릴', '리아', '아디티', '카브야', '사라', '니키타', '로셸'],
      surnames: ['페르난데스', '드소자', '나이크', '샤르마', '피레스', '쿠마르', '메논', '고메스', '파틸', '로드리게스']
    },
    nameOrder: 'given-first'
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
