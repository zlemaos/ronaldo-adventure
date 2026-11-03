/* Achievements (life goals) and end-of-life ribbons/titles.
 * test(s, E) is evaluated by the engine; add entries to extend. */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};
  function refMoney(s, E) { return s.money / E.country(s).wage; }
  function fbt(s) { return s.fb.trophies; }

  RA.data.achievements = [
    { id: 'pro', icon: '⚽', name: '프로 데뷔', desc: '프로 축구 선수가 됐다.' },
    { id: 'national', icon: '🎽', name: '국가대표', desc: '국가대표팀에 발탁됐다.' },
    { id: 'worldcup_play', icon: '🌍', name: '월드컵 출전', desc: '월드컵 무대를 밟았다.' },
    { id: 'worldcup', icon: '🏆', name: '월드컵 우승', desc: '조국에 월드컵을 안겼다.' },
    { id: 'champions', icon: '⭐', name: '유럽 챔피언', desc: '유럽 챔피언스 컵 우승.' },
    { id: 'ballon', icon: '🥇', name: '발롱도르', desc: '세계 최고의 선수로 뽑혔다.' },
    { id: 'ballon5', icon: '👑', name: '발롱도르 5회', desc: '발롱도르를 다섯 번 들었다.', test: function (s) { return fbt(s).ballon >= 5; } },
    { id: 'goals500', icon: '🎯', name: '500골 클럽', desc: '프로 통산 500골.', test: function (s) { return s.fb.goals >= 500; } },
    { id: 'goals800', icon: '💫', name: '800골의 주인공', desc: '프로 통산 800골.', test: function (s) { return s.fb.goals >= 800; } },
    { id: 'abroad', icon: '✈️', name: '해외 진출', desc: '해외 빅클럽으로 이적했다.', test: function (s) { return s.fb.stage !== 'none' && s.fb.clubs.some(function (c) { return RA.Engine.ABROAD_CLUBS.indexOf(c) >= 0; }); } },
    { id: 'heart', icon: '❤️', name: '심장 시술을 이겨 낸 사람', desc: '심장 시술을 이겨 냈다.', test: function (s) { return !!s.flags.heart_fixed; } },
    { id: 'alone12', icon: '🧳', name: '열두 살의 이별', desc: '열두 살에 홀로 아카데미로 떠났다.', test: function (s) { return !!s.flags.moved_alone; } },
    { id: 'father_saved', icon: '🤲', name: '아버지의 회복', desc: '아버지가 술을 끊도록 도왔다.', test: function (s) { return !!s.flags.father_sober; } },
    { id: 'nobel', icon: '🔬', name: '노벨상', desc: '노벨상을 받았다.' },
    { id: 'leader', icon: '🏛️', name: '국가 지도자', desc: '대통령(총리)이 됐다.' },
    { id: 'astronaut', icon: '🚀', name: '우주 비행', desc: '우주에 다녀왔다.' },
    { id: 'top_career', icon: '📈', name: '정상에 서다', desc: '어떤 직업이든 최고 직급에 올랐다.' },
    { id: 'millionaire', icon: '💰', name: '백만장자', desc: '재산 100만 달러 상당.', test: function (s, E) { return refMoney(s, E) >= 1e6; } },
    { id: 'billionaire', icon: '💎', name: '억만장자', desc: '재산 10억 달러 상당.', test: function (s, E) { return refMoney(s, E) >= 1e9; } },
    { id: 'lottery', icon: '🎟️', name: '인생 역전', desc: '복권 1등 당첨.' },
    { id: 'phd', icon: '🎓', name: '박사님', desc: '박사 학위를 받았다.', test: function (s) { return s.edu.degree === 'phd'; } },
    { id: 'married', icon: '💍', name: '백년가약', desc: '결혼했다.', test: function (s) { return !!s.flags.married; } },
    { id: 'big_family', icon: '👨‍👩‍👧‍👦', name: '대가족', desc: '자녀 다섯 명 이상.', test: function (s) { return s.people.filter(function (p) { return p.role === 'child'; }).length >= 5; } },
    { id: 'century', icon: '🎂', name: '100세', desc: '100번째 생일을 맞았다.', test: function (s) { return s.age >= 100; } },
    { id: 'jailbird', icon: '🔒', name: '철창 신세', desc: '감옥에 갔다.' },
    { id: 'famous', icon: '📸', name: '국민 스타', desc: '명성 90 이상.', test: function (s) { return s.stats.fame >= 90; } },
    { id: 'monk', icon: '🙏', name: '구도자', desc: '수도자의 길을 걸었다.', test: function (s) { return !!s.flags.monk; } },
    { id: 'philanthropist', icon: '🎁', name: '기부 천사', desc: '많은 돈을 기부했다.', test: function (s, E) { return (s.donated || 0) / E.country(s).wage >= 100000; } },
    { id: 'blood', icon: '🩸', name: '타투 대신 헌혈', desc: '헌혈 10회 이상.', test: function (s) { return (s.bloodDonations || 0) >= 10; } },
    { id: 'grandparent', icon: '👴', name: '손주 바보', desc: '손주를 품에 안았다.' },
    { id: 'house_for_mom', icon: '🏠', name: '엄마에게 집을', desc: '어머니께 집을 선물했다.' },
    { id: 'lifesaver', icon: '🛟', name: '생명의 은인', desc: '누군가의 목숨을 구했다.' },
    { id: 'marathoner', icon: '🏃', name: '마라토너', desc: '마라톤을 완주했다.' },
    { id: 'memoir', icon: '📖', name: '자서전', desc: '인생을 책으로 남겼다.' },
    { id: 'quit_smoking', icon: '🚭', name: '금연 성공', desc: '담배를 끊었다.' },
    { id: 'young_inventor', icon: '💡', name: '꼬마 발명가', desc: '어린 나이에 발명품을 만들었다.' },
    { id: 'kr_asian_gold', icon: '🥇', name: '아시안게임 금메달', desc: '아시안게임 금메달을 땄다.' },
    { id: 'gen3', icon: '🌳', name: '3대째 이야기', desc: '3세대까지 삶을 이어 갔다.', test: function (s) { return s.generation >= 3; } }
  ];

  // Ribbons / life titles shown at death (highest rank first)
  RA.data.ribbons = [
    { id: 'goat', rank: 100, name: '역대 최고 (GOAT)', desc: '발롱도르 5회 이상 또는 월드컵 우승 + 발롱도르.', test: function (s) { return fbt(s).ballon >= 5 || (fbt(s).wc && fbt(s).ballon); } },
    { id: 'legend', rank: 90, name: '축구 전설', desc: '발롱도르 또는 월드컵 우승.', test: function (s) { return fbt(s).ballon || fbt(s).wc; } },
    { id: 'leader', rank: 88, name: '국가 지도자', desc: '나라를 이끌었다.', test: function (s) { return !!s.achievements.leader; } },
    { id: 'nobel', rank: 87, name: '노벨상 수상자', desc: '인류의 지식을 넓혔다.', test: function (s) { return !!s.achievements.nobel; } },
    { id: 'astronaut', rank: 85, name: '별을 본 사람', desc: '우주에 다녀왔다.', test: function (s) { return !!s.achievements.astronaut; } },
    { id: 'tycoon', rank: 80, name: '재벌', desc: '억만장자.', test: function (s, E) { return refMoney(s, E) >= 1e9; } },
    { id: 'star', rank: 70, name: '월드 스타', desc: '명성 90 이상.', test: function (s) { return s.stats.fame >= 90; } },
    { id: 'pro', rank: 60, name: '프로 축구 선수', desc: '꿈을 이뤘다.', test: function (s) { return s.fb.seasons > 0; } },
    { id: 'rich', rank: 55, name: '부자', desc: '백만장자.', test: function (s, E) { return refMoney(s, E) >= 1e6; } },
    { id: 'kingpin', rank: 50, name: '암흑가의 거물', desc: '범죄 조직의 정점.', test: function (s) { return s.jobHistory.some(function (j) { return j.top && RA.Engine.careerIndex()[j.id] && RA.Engine.careerIndex()[j.id].sector === 'crime'; }); } },
    { id: 'topdog', rank: 45, name: '그 분야 일인자', desc: '최고 직급에 올랐다.', test: function (s) { return s.jobHistory.some(function (j) { return j.top; }); } },
    { id: 'saint', rank: 42, name: '성자', desc: '수도자로 살았다.', test: function (s) { return !!s.flags.monk; } },
    { id: 'family', rank: 40, name: '가정적인 사람', desc: '결혼하고 아이를 셋 이상 키웠다.', test: function (s) { return s.marriedAt && s.people.filter(function (p) { return p.role === 'child'; }).length >= 3; } },
    { id: 'centenarian', rank: 38, name: '백세 인생', desc: '100세 이상 살았다.', test: function (s) { return s.age >= 100; } },
    { id: 'scholar', rank: 35, name: '학자', desc: '박사 학위.', test: function (s) { return s.edu.degree === 'phd'; } },
    { id: 'son', rank: 34, name: '아버지의 버팀목', desc: '아버지의 회복을 도왔다.', test: function (s) { return !!s.flags.father_sober; } },
    { id: 'criminal', rank: 30, name: '전과자', desc: '감옥에 다녀왔다.', test: function (s) { return !!s.flags.ever_jailed; } },
    { id: 'happy', rank: 25, name: '행복한 사람', desc: '행복 80 이상으로 생을 마쳤다.', test: function (s) { return s.stats.happy >= 80; } },
    { id: 'short', rank: 20, name: '짧고 굵게', desc: '30세 이전에 세상을 떠났다.', test: function (s) { return !s.alive && s.age < 30; } },
    { id: 'broke', rank: 10, name: '빈털터리', desc: '빚을 남기고 떠났다.', test: function (s) { return s.money < 0; } }
  ];
})(typeof globalThis !== 'undefined' ? globalThis : this);
