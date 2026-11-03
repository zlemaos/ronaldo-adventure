/* Endings: every life ends on exactly one ending card (first match in this order wins).
 * kind 'win' or 'fall'; hint is shown for endings not reached yet in the 엔딩 도감. */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};
  function ref(s, E) { return s.money / E.country(s).wage; }
  function tr(s) { return s.traits || {}; }
  function topJob(s, E, pred) { return s.jobHistory.some(function (j) { var k = E.careerIndex()[j.id]; return j.top && k && (!pred || pred(k)); }); }
  RA.data.endings = [
    { id: 'young_death', kind: 'fall', icon: '🥀', name: '너무 이른 작별', desc: '꽃피기도 전에 떠났다. 남은 사람들이 오래 기억했다.', hint: '서른 전에 생을 마치면', test: function (s) { return s.age < 30; } },
    { id: 'goat', kind: 'win', icon: '👑', name: '역대 최고', desc: '축구사에 남을 기록, 전설 그 자체.', hint: '발롱도르 5회 또는 월드컵+발롱도르', test: function (s) { var t = s.fb.trophies; return t.ballon >= 5 || (t.wc && t.ballon); } },
    { id: 'legend', kind: 'win', icon: '🏆', name: '축구 전설', desc: '세계가 이름을 외친 선수.', hint: '발롱도르나 월드컵 우승', test: function (s) { return s.fb.trophies.ballon || s.fb.trophies.wc; } },
    { id: 'leader', kind: 'win', icon: '🏛️', name: '나라를 이끈 사람', desc: '작았던 아이가 자라 나라의 지도자가 됐다.', hint: '정치인으로 정상에', test: function (s) { return !!s.achievements.leader; } },
    { id: 'nobel', kind: 'win', icon: '🔬', name: '노벨상 수상자', desc: '세상의 지식을 한 뼘 넓혔다.', hint: '과학자로 정상에서 노벨상', test: function (s) { return !!s.achievements.nobel; } },
    { id: 'astronaut', kind: 'win', icon: '🚀', name: '별을 본 사람', desc: '밤하늘을 올려다보던 아이가 우주에서 지구를 봤다.', hint: '우주비행사로 비행', test: function (s) { return !!s.achievements.astronaut; } },
    { id: 'casino_king', kind: 'win', icon: '🎰', name: '카지노의 왕', desc: '판돈의 신이 웃어 준 몇 안 되는 사람.', hint: '겜블러로 성공해 부자가 되면', test: function (s, E) { return (topJob(s, E, function (k) { return k.special === 'gamble'; }) || tr(s).gamble >= 45) && ref(s, E) >= 1e6; } },
    { id: 'fallen_genius', kind: 'fall', icon: '💔', name: '몰락한 천재', desc: '빛나던 시절 뒤로 어두운 그림자가 드리웠다.', hint: '프로 축구 3시즌 이상 또는 최고 명성 70 이상을 기록한 뒤 전과·과음·미해결 파산', test: function (s) { var peak = Math.max.apply(null, (s.hist || []).map(function (h) { return h.fame || 0; }).concat([s.stats.fame])); return (s.fb.seasons > 2 || peak >= 70) && (tr(s).record >= 1 || tr(s).alcohol >= 60 || (s.flags.bankrupt && s.money <= 0)); } },
    { id: 'broke_gambler', kind: 'fall', icon: '🎲', name: '판돈에 인생을 건 사람', desc: '마지막 한 판은 끝내 오지 않았다.', hint: '도박 중독 2단계에서 파산', test: function (s, E) { return (tr(s).gamble >= 45 || s.flags.gambler_unlocked) && (s.flags.bankrupt || s.money < 0); } },
    { id: 'kingpin', kind: 'fall', icon: '🕶️', name: '암흑가의 보스', desc: '골목의 왕. 대가는 늘 비쌌다.', hint: '범죄 조직의 정점에', test: function (s, E) { return topJob(s, E, function (k) { return k.sector === 'crime'; }); } },
    { id: 'jailbird', kind: 'fall', icon: '⛓️', name: '철창 안의 기억', desc: '감옥의 차가운 문이 삶에 흔적을 남겼다.', hint: '전과 2범 이상 또는 감옥에서 생을 마치면', test: function (s) { return tr(s).record >= 2 || s.jail > 0; } },
    { id: 'deported', kind: 'fall', icon: '🧳', name: '돌아갈 곳을 잃은 사람', desc: '쫓겨난 나라와 낯설어진 고향 사이에서.', hint: '해외에서 추방되면', test: function (s) { return !!s.flags.deported; } },
    { id: 'injury_end', kind: 'fall', icon: '🩼', name: '부상으로 꺾인 꿈', desc: '한 번의 부상이 모든 걸 바꿨다.', hint: '선수 생명을 끝내는 부상', test: function (s) { return !!s.flags.career_injury; } },
    { id: 'addict', kind: 'fall', icon: '🍺', name: '술잔에 진 사람', desc: '술에 기대던 날들이 끝내 삶을 삼켰다.', hint: '음주 60 이상으로 생을 마치면', test: function (s) { return tr(s).alcohol >= 60; } },
    { id: 'tycoon', kind: 'win', icon: '💎', name: '재벌', desc: '어마어마한 재산을 가진 거부가 됐다.', hint: '재산 1억 달러 상당', test: function (s, E) { return ref(s, E) >= 1e8; } },
    { id: 'star', kind: 'win', icon: '🌟', name: '월드 스타', desc: '어디를 가도 사람들이 알아봤다.', hint: '명성 90 이상', test: function (s) { return s.stats.fame >= 90; } },
    { id: 'pro_player', kind: 'win', icon: '⚽', name: '프로 축구 선수로 산 인생', desc: '꿈을 직업으로 살았다.', hint: '프로 축구 선수가 되면', test: function (s) { return s.fb.seasons > 0; } },
    { id: 'local_legend', kind: 'fall', icon: '🥅', name: '동네 전설로 남은 사람', desc: '프로는 못 됐지만, 동네 골목에선 영원한 에이스.', hint: '축구 실력은 높은데 프로가 못 되면', test: function (s) { return s.stats.football >= 45 && !s.fb.seasons; } },
    { id: 'bankrupt', kind: 'fall', icon: '📉', name: '빚만 남긴 사람', desc: '파산의 그림자를 끝내 벗지 못했다.', hint: '파산한 채 생을 마치면', test: function (s) { return !!s.flags.bankrupt && s.money <= 0; } },
    { id: 'comeback', kind: 'win', icon: '🔥', name: '바닥에서 다시 일어선 사람', desc: '파산과 실패를 딛고 다시 섰다.', hint: '파산 뒤 재기하면', test: function (s) { return !!s.flags.bankrupt && s.money > 0; } },
    { id: 'dropout', kind: 'fall', icon: '🎒', name: '학교 밖에서 자란 사람', desc: '졸업장 대신 거리에서 배웠다.', hint: '퇴학당하면', test: function (s) { return !!s.flags.expelled; } },
    { id: 'family', kind: 'win', icon: '👨‍👩‍👧‍👦', name: '대가족의 기둥', desc: '아이들과 함께 큰 가족의 이야기를 썼다.', hint: '결혼하고 자녀 셋 이상', test: function (s) { return s.marriedAt && s.people.filter(function (p) { return p.role === 'child'; }).length >= 3; } },
    { id: 'loved', kind: 'win', icon: '💞', name: '사랑받은 사람', desc: '평판 좋은 이웃, 다정한 가족.', hint: '평판 65 이상, 결혼', test: function (s) { return tr(s).rep >= 65 && !!s.marriedAt; } },
    { id: 'top_career', kind: 'win', icon: '📈', name: '그 분야 일인자', desc: '한 길을 끝까지 걸어 정상에 섰다.', hint: '어떤 직업이든 최고 직급', test: function (s, E) { return topJob(s, E, function (k) { return k.sector !== 'parttime'; }); } },
    { id: 'scholar', kind: 'win', icon: '🎓', name: '학자', desc: '책과 함께한 인생.', hint: '박사 학위', test: function (s) { return s.edu.degree === 'phd'; } },
    { id: 'lonely', kind: 'fall', icon: '🪑', name: '혼자 남은 사람', desc: '마지막 식탁에는 의자가 하나뿐이었다.', hint: '이혼 후 자녀 없이 혼자 생을 마치면', test: function (s) { return !!s.flags.divorced && !s.people.some(function (p) { return (p.role === 'spouse' || p.role === 'child') && p.alive; }); } },
    { id: 'rascal', kind: 'fall', icon: '😈', name: '영원한 악동', desc: '나이를 먹어도 장난기는 줄지 않았다.', hint: '악동 기질 40 이상으로 생을 마치면', test: function (s) { return tr(s).mischief >= 40; } },
    { id: 'centenarian', kind: 'win', icon: '🎂', name: '한 세기에 걸친 삶', desc: '아흔다섯 해를 넘어 긴 세월을 살아냈다.', hint: '95세 이상', test: function (s) { return s.age >= 95; } },
    { id: 'saint', kind: 'win', icon: '🙏', name: '구도자', desc: '세상을 떠나 마음을 닦았다.', hint: '수도자의 길', test: function (s) { return !!s.flags.monk; } },
    { id: 'quiet_rich', kind: 'win', icon: '💰', name: '조용한 부자', desc: '요란하지 않게, 단단하게 모았다.', hint: '재산 100만 달러 상당', test: function (s, E) { return ref(s, E) >= 1e6; } },
    { id: 'ordinary', kind: 'win', icon: '🌱', name: '평범하지만 따뜻한 인생', desc: '특별하지 않아서 특별했던 삶.', hint: '그 밖의 모든 인생', test: function () { return true; } }
  ];
})(typeof globalThis !== 'undefined' ? globalThis : this);
