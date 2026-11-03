/* Portugal (원작 루트) country storylets. Same conventions as data/events_country.js:
 * ids prefixed pt_, countries: ['pt'], follow-ups gated by a flag set in the scheduling choice. */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};
  RA.data.events = RA.data.events || [];
  function E(ev) { ev.countries = ['pt']; RA.data.events.push(ev); }
  var FATHER_STRUGGLING = { flags: ['father_drinking', '!father_sober', '!father_dead'], rel: { father: 'alive' } };

  // ---------------------------------------------------------------- childhood on Madeira
  E({
    id: 'pt_new_year_fireworks', age: [5, 70], cooldown: 7,
    text: '12월 31일 밤, 푼샬 항구를 둘러싼 산비탈에서 일제히 불꽃이 터진다.',
    textVariants: [
      '12월 31일 밤, 푼샬 항구를 둘러싼 산비탈에서 일제히 불꽃이 터진다.',
      '새해 불꽃놀이. 올해는 가족들과 언덕 꼭대기에 돗자리를 폈다.',
      '새해 불꽃이 바다에 비친다. 항구의 배들이 일제히 뱃고동을 울렸다.'
    ],
    effects: { happy: 4, rel: { family: 2 } },
    log: '건포도 열두 알을 먹으며 소원을 빌었다.',
    logVariants: ['건포도 열두 알을 먹으며 소원을 빌었다.', '올해 소원은 비밀로 했다.', '불꽃이 끝나고도 한참 바다를 바라봤다.']
  });

  // ---------------------------------------------------------------- the father's struggle (respectful)
  E({
    id: 'pt_father_bar', age: [9, 30], cooldown: 5,
    cond: FATHER_STRUGGLING,
    text: '일을 마친 {father}[이/가] 오늘도 동네 선술집에 들렀다. 늦은 밤, 문 앞에서 한참을 망설이다 들어온다.',
    choices: [
      { text: '성당 회복 모임을 같이 알아본다', schedule: { id: 'pt_father_meeting', years: 1 }, check: { stat: 'social', diff: 40 },
          success: { effects: { rel: { father: 4 }, flags: ['pt_parish_help'], fx: ['fatherSeekHelp'] }, log: '{father}[이/가] 전단지를 오래 들여다보더니 "한번 가 보마"라고 했다.' },
          fail: { effects: { rel: { father: -3 }, happy: -2 }, log: '전단지는 구겨져 선술집 휴지통에 들어갔다. "신부님한테 내 얘길 했냐?"' } },
      { text: '{father}의 장비 가방을 대신 챙겨 둔다', effects: { rel: { father: 6 }, happy: -1 }, log: '다음 날 아침, {father}[이/가] 가지런한 가방을 보고 머리를 쓰다듬었다.' }
    ]
  });
  E({
    id: 'pt_father_meeting', age: [10, 40], weight: 1, once: true,
    cond: { flags: ['pt_parish_help', '!father_sober'], rel: { father: 'alive' } },
    text: '{father}[이/가] 회복 모임에 다닌 지 일 년. 오늘은 처음으로 사람들 앞에서 이야기를 한다고 한다.',
    choices: [
      { text: '맨 뒷줄에 앉아 지켜본다', check: { stat: 'grit', diff: 35 },
          success: { effects: { rel: { father: 8 }, unflags: ['pt_parish_help'], fx: ['fatherSeekHelp'] }, log: '"막내가 와 있습니다." 그 말에 모두가 박수를 쳤다.' },
          fail: { effects: { happy: -3, rel: { father: 2 } }, log: '{father}[은/는] 단상 앞에서 말을 잇지 못하고 내려왔다. 돌아오는 길에 둘 다 바다만 봤다.' } },
      { text: '끝나고 함께 바닷가를 걷는다', effects: { rel: { father: 6 }, happy: 2, unflags: ['pt_parish_help'], fx: ['fatherSeekHelp'] }, log: '파도 소리 사이로 {father}[이/가] "고맙다"고 했다.' }
    ]
  });
  E({
    id: 'pt_father_memory', age: [22, 85], cooldown: 5, maxTimes: 6,
    cond: { flags: ['father_dead'] },
    text: '{father}의 기일. 그가 가꾸던 공원 화단에 가족들이 꽃을 심었다.',
    textVariants: [
      '{father}의 기일. 그가 가꾸던 공원 화단에 가족들이 꽃을 심었다.',
      '또 {father}의 기일이다. 성당 미사가 끝나고 {localClub} 장비실에 들렀다.',
      '{father}의 기일. 낡은 장비 가방을 꺼내 유니폼 한 벌을 정성껏 개어 봤다.'
    ],
    effects: { happy: -1, rel: { family: 4 } },
    log: '화단 앞에서 다 같이 그의 노래를 흥얼거렸다.',
    logVariants: ['화단 앞에서 다 같이 그의 노래를 흥얼거렸다.', '장비실 벽에는 아직도 그의 사진이 걸려 있었다.', '유니폼을 개다 보니 그 손길이 이해됐다.']
  });

  // ---------------------------------------------------------------- the academy in Lisbon
  E({
    id: 'pt_accent_lisbon', age: [12, 16], once: true, weight: 20,
    cond: { flags: ['moved_alone'], fb: ['academy'] },
    text: '{academy} 숙소. 아이들이 섬 억양을 따라 하며 킥킥댄다.',
    choices: [
      { text: '섬 이야기를 재미있게 들려준다', check: { stat: 'social', diff: 40 },
        success: { effects: { social: 3, happy: 3 }, log: '바나나 계단밭 이야기에 다들 배를 잡고 웃었다. 그날부터 숙소의 이야기꾼이 됐다.' },
        fail: { effects: { happy: -3 }, log: '이야기는 엇나갔다. 밤에 혼자 {mother}에게 편지를 썼다.' } },
      { text: '훈련장에서 실력으로 답한다', check: { stat: 'football', diff: 40 },
        success: { effects: { football: 2, fame: 2 }, log: '자체 경기에서 두 골. 억양 이야기는 그날로 끝났다.' },
        fail: { effects: { happy: -2, grit: 2 }, log: '오늘은 안 풀렸다. 그래도 내일 또 나간다.' } }
    ]
  });
  E({
    id: 'pt_phone_card', age: [12, 16], cooldown: 2,
    cond: { flags: ['moved_alone'], fb: ['academy', 'youth'], rel: { mother: 'alive' } },
    text: '일주일에 한 번, 전화 카드로 {mother}에게 전화를 건다. 남은 시간이 숫자로 줄어든다.',
    choices: [
      { text: '괜찮다고만 말한다', check: { stat: 'grit', diff: 40 },
          success: { effects: { grit: 2, happy: -1, rel: { mother: 3 } }, log: '"밥은 잘 먹지?" 대답하기도 전에 시간이 끝났다.' },
          fail: { effects: { happy: -3, rel: { mother: -1 } }, log: '목소리가 떨리는 걸 {mother}[이/가] 알아챘다. "거짓말할 거면 전화하지 마라." 카드 잔액이 0이 됐다.' } },
      { text: '보고 싶다고 솔직히 말한다', effects: { happy: 2, rel: { mother: 6 } }, log: '{mother}[이/가] 다음 달 섬에서 {food}[을/를] 부쳐 주기로 했다.' }
    ]
  });

  // ---------------------------------------------------------------- school and exams
  E({
    id: 'pt_national_exam_prep', age: [16, 18], once: true,
    cond: { edu: ['high'] },
    text: '{exam}[이/가] 다가온다. 공부할지 훈련할지, 하루가 너무 짧다.',
    choices: [
      { text: '밤에는 공부, 낮에는 훈련', effects: { smarts: 3, grit: 2, health: -2 }, log: '책상 위에서 졸다 깨면 새벽이었다. 그래도 둘 다 놓지 않았다.' },
      { text: '도서관 스터디 모임에 들어간다', effects: { smarts: 3, social: 2 }, log: '처음 보는 친구들과 기출 문제를 나눠 풀었다.' }
    ]
  });

  // ---------------------------------------------------------------- football culture
  E({
    id: 'pt_lisbon_derby', age: [17, 38], cooldown: 3,
    cond: { fb: ['pro'] },
    text: '{bigClub}[과/와] {rivalClub}의 리스본 더비. 도시 전체가 초록과 빨강으로 갈렸다.',
    choices: [
      { text: '첫 터치부터 과감하게 돌파한다', check: { stat: 'football', diff: 68 },
        success: { effects: { fame: 4, happy: 5 }, log: '결승골! 시내 광장이 밤새 노래로 가득 찼다.' },
        fail: { effects: { happy: -3 }, log: '상대 수비에 막혔다. 다음 더비를 기약했다.' } },
      { text: '동료들을 살리는 패스에 집중한다', check: { stat: 'social', diff: 50 },
        success: { effects: { fame: 2, social: 2, happy: 3 }, log: '도움 두 개. 감독이 "팀을 위한 선수"라고 했다.' },
        fail: { effects: { happy: -1 }, log: '패스가 번번이 끊겼다. 호흡을 더 맞춰야 한다.' } }
    ]
  });
  E({
    id: 'pt_island_hero', age: [18, 40], once: true, weight: 20,
    cond: { fb: ['pro'], stats: { fame: [50, 100] } },
    text: '{region}에 돌아오자 공항에서 동네 꼬마들이 {localClub} 유니폼을 입고 기다리고 있다.',
    choices: [
      { text: '{localClub}에 새 장비를 기증한다', effects: { money: -20000, fame: 3, happy: 5 }, log: '장비실 선반이 새 공으로 가득 찼다.' },
      { text: '꼬마들과 계단 골목에서 공을 찬다', effects: { happy: 6, social: 2 }, log: '다음 날 신문에 계단 골목 사진이 실렸다.' }
    ]
  });

  // ---------------------------------------------------------------- adult life and old age
  E({
    id: 'pt_fado_night', age: [20, 75], cooldown: 6,
    text: '리스본 골목 작은 식당에서 파두 가수가 그리움에 대한 노래를 부른다.',
    choices: [
      { text: '눈을 감고 끝까지 듣는다', effects: { happy: 3, smarts: 1 }, log: '섬과 가족 얼굴이 하나씩 떠올랐다.' },
      { text: '가족에게 전화를 건다', effects: { happy: 2, rel: { family: 4 } }, log: '"지금 노래가 나오는데, 그냥 생각나서." 수화기 너머가 조용히 웃었다.' }
    ]
  });
  E({
    id: 'pt_island_wedding', age: [22, 50], once: true,
    cond: { rel: { partner: 'yes' } },
    text: '{partner}[이/가] 결혼식을 마데이라의 작은 성당에서 올리자고 한다.',
    choices: [
      { text: '좋다, 고향에서 하자', effects: { fx: ['marry'], happy: 6, rel: { family: 4 } }, log: '성당 계단에 꽃잎이 흩날렸다. 동네 사람들이 전부 하객이 됐다.' },
      { text: '아직은 조금 더 생각해 보자', effects: { rel: { partner: -4 } }, log: '{partner}[이/가] 서운한 눈치였지만 고개를 끄덕였다.' }
    ]
  });
  E({
    id: 'pt_mother_kitchen', age: [30, 70], once: true,
    cond: { rel: { mother: 'alive' } },
    text: '나이 든 {mother}[이/가] 오랜만에 부엌에 서서 {food}[을/를] 만든다. 손이 예전보다 느리다.',
    choices: [
      { text: '옆에서 조리법을 받아 적는다', effects: { happy: 3, rel: { mother: 8 } }, log: '"소금은 손끝으로 재는 거야." 그 말을 그대로 적었다.' },
      { text: '설거지를 맡는다', effects: { happy: 2, rel: { mother: 5 } }, log: '{mother}[이/가] 식탁에 앉아 쉬는 모습을 처음 봤다.' }
    ]
  });
  E({
    id: 'pt_levada_walk', age: [55, 95], cooldown: 6,
    text: '산허리를 따라 흐르는 오래된 수로 길을 걷는다. 물소리가 어릴 적 그대로다.',
    choices: [
      { text: '끝까지 걷는다', check: { stat: 'health', diff: 45 },
        success: { effects: { health: 2, happy: 3 }, log: '수로 끝 폭포 앞에서 한참 쉬었다.' },
        fail: { effects: { health: -2 }, log: '중간에 돌아왔다. 무릎이 예전 같지 않다.' } },
      { text: '쉬엄쉬엄 천천히 걷는다', effects: { happy: 4, health: 1 }, log: '어릴 적 공을 쫓아 뛰던 길을 이제는 한 걸음씩 걷는다.' }
    ]
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
