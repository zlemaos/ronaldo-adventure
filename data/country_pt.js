/* Portugal — the "원작 루트" (canon route) closest to the real story: a poor family on Madeira,
 * the youngest of four, local club → island club → alone to a big Lisbon academy at 12.
 * Names, clubs and schools are fictional parodies at the same level as the other countries. */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};
  RA.data.countries = RA.data.countries || {};

  RA.data.countries.pt = {
    id: 'pt', name: '포르투갈', adjective: '포르투갈',
    canon: true,                                   // shown first on the start screen as "원작 루트"
    flag: ['#046a38', '#da291c', '#ffe900'],
    skin: ['#e8b896', '#d29f78'],
    hair: '#2a1a12',
    currency: { unit: '유로', symbol: '€', rate: 0.92 },
    wage: 0.5,
    leader: '총리',
    hero: { surname: '프레이타스', given: '호날두', nick: '호날두' },
    family: {
      father: { name: '마누엘 프레이타스', job: '시청 공원 정원사', job2: '안도리뉴 푼샬 장비 담당' },
      mother: { name: '마리아 다 루스', job: '식당 조리원 겸 청소원' },
      siblings: [
        { key: 'bro', name: '티아구 프레이타스', gender: 'm', gap: 10 },
        { key: 'sis1', name: '엘레나 프레이타스', gender: 'f', gap: 8 },
        { key: 'sis2', name: '카롤리나 프레이타스', gender: 'f', gap: 6 }
      ]
    },
    places: {
      hometown: '마데이라섬 푼샬 언덕배기 동네', region: '마데이라', city: '푼샬',
      bigcity: '리스본', capital: '리스본',
      homeShort: '푼샬 언덕의 함석지붕 집',
      house: '가파른 계단 골목 끝, 방 두 칸짜리 함석지붕 집'
    },
    clubs: {
      local: '안도리뉴 푼샬',
      regional: '이줄라르 FC',
      academy: '사자단 유스 아카데미',
      big: '리스본 사자단',
      rival: '리스본 독수리단',
      league: '포르투갈 1부 리그'
    },
    nationalTeam: '포르투갈 대표팀',
    school: {
      elem: { name: '기초학교 1·2단계', from: 6, to: 11, school: '푼샬 언덕 기초학교' },
      middle: { name: '기초학교 3단계', from: 12, to: 14, school: '푼샬 바다 기초학교' },
      high: { name: '중등학교', from: 15, to: 18, school: '푼샬 대서양 중등학교' },
      exam: { name: '전국 시험', age: 18 },
      univTop: '리스본 왕립대학교', univMid: '마데이라 섬대학교', univAbroad: '런던 왕립 공과대학',
      sportsClub: '학교 스포츠 클럽',
      notes: '기초교육 9년(1·2·3단계)과 중등 3년, 12학년 전국 시험 성적으로 대학 진학'
    },
    foods: ['에스파다 생선 튀김', '볼루 두 카쿠', '에스페타다 꼬치구이', '바칼랴우', '파스텔 드 나타', '마데이라 바나나', '토마토 양파 수프'],
    holidays: ['성탄절', '부활절', '꽃 축제', '새해 불꽃놀이', '성 요한 축제'],
    footballCulture: '섬의 가파른 계단 골목이 곧 운동장이고, 주말이면 온 동네가 작은 라디오 앞에 모여 리스본 클럽들의 더비를 듣는다.',
    names: {
      m: ['주앙', '페드루', '디오구', '안드레', '히카르두', '누누', '루이', '미겔', '브루누', '파비우', '곤살루', '마르쿠'],
      f: ['아나', '베아트리스', '이네스', '마리아나', '소피아', '하켈', '조아나', '카타리나', '마르타', '헤나타', '테레자', '파티마'],
      surnames: ['시우바', '산투스', '페헤이라', '페레이라', '코스타', '고메스', '마르팅스', '소자', '알메이다', '카르발류']
    },
    nameOrder: 'given-first'
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
