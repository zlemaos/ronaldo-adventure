/* Country-specific storylet events (8 countries).
 * Ids are prefixed with the country id; every event has countries: ['<id>'].
 * Follow-up events reached via `schedule` are gated by a flag set in the scheduling choice. */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};
  RA.data.events = RA.data.events || [];
  function E(ev) { RA.data.events.push(ev); }
  var FATHER_STRUGGLING = { flags: ['father_drinking', '!father_sober', '!father_dead'], rel: { father: 'alive' } };

  /* =============================================================== KOREA */
  E({
    id: 'kr_seollal_sebae', age: [3, 10], countries: ['kr'], once: true, cond: { family: 'all' },
    text: '설날 아침, 가족들이 줄지어 앉았다. {name}[이/가] 서툰 세배를 하자 {father}[이/가] 세뱃돈을 내밀었다.',
    effects: { happy: 4, money: 20, rel: { family: 3 } },
    log: '절하다 앞으로 굴렀지만 세뱃돈은 받았다.'
  });
  E({
    id: 'kr_gyul_winter', age: [9, 16], countries: ['kr'], cooldown: 3,
    cond: { money: [0, 3000] },
    text: '겨울방학, 이웃 귤밭에서 귤 따기 일손을 구한다. {sis2}[이/가] 같이 가자고 손짓한다.',
    choices: [
      { text: '{sis2}[과/와] 귤을 딴다', check: { stat: 'health', diff: 35 },
          success: { effects: { money: 60, grit: 3, rel: { sis2: 4 } }, log: '손끝이 노랗게 물들었지만 받은 돈으로 {mother}에게 장갑을 사 드렸다.' },
          fail: { effects: { health: -3, money: 20, rel: { sis2: 2 } }, log: '귤 상자를 나르다 언덕길에서 미끄러졌다. 일당은 반만 받고 손목에 파스를 붙였다.' } },
      { text: '빈 운동장에서 혼자 슈팅 연습', alt: { text: '집에서 혼자 {hobbyAct} 연습', log: '찬 바닷바람 소리를 들으며 하루 종일 붙잡고 있었다.' }, effects: { football: 3, grit: 1, happy: -1 },
        log: '찬 바닷바람 속에서 공을 백 번 찼다.' }
    ]
  });
  E({
    id: 'kr_jogi_chukgu', age: [6, 11], countries: ['kr'], cooldown: 4,
    cond: { fb: ['none', 'local'] },
    text: '새벽 운동장, 조기축구회 아저씨들 틈에 꼬마 {name}[이/가] 끼었다. "야, 저 꼬맹이 공 좀 차네!"',
    effects: { football: 3, grit: 2, happy: 2 },
    log: '아저씨들이 해장국 집까지 데려가 국물을 나눠 줬다.'
  });
  E({
    id: 'kr_hagwon_pressure', age: [13, 17], countries: ['kr'], cooldown: 3,
    cond: { edu: ['middle', 'high'] },
    text: '반 친구들은 밤 10시까지 학원에 간다. {mother}[이/가] 식당 앞치마를 벗으며 조용히 묻는다. "너도 학원 보내 줄까?"',
    choices: [
      { text: '학원에 다닌다', effects: { money: -300, smarts: 4, happy: -2 },
        log: '{mother}의 야간 근무가 하루 늘었다는 걸 나중에 알았다.' },
      { text: '인터넷 강의로 혼자 한다',
        check: { stat: 'grit', diff: 40 },
        success: { effects: { smarts: 4, grit: 2 }, log: '도서관 구석 자리가 {name}의 학원이 되었다.' },
        fail: { effects: { smarts: 1, happy: -1 }, log: '강의 창 옆에 {hobby} 영상 창이 늘 떠 있었다.' } },
      { text: '공부보다 {hobby}에 걸어 본다', effects: { fx: ['hobbyBoost'], rel: { mother: -2 } },
        log: '{mother}[은/는] 한숨을 쉬었지만 {hobby}에 쓸 용돈을 조금 더 쥐여 줬다.' }
    ]
  });
  E({
    id: 'kr_suneung_eve', age: [18, 18], countries: ['kr'], once: true,
    cond: { edu: ['high'] },
    text: '{exam} 전날 밤, {mother}[이/가] 찹쌀떡과 엿을 가방에 넣어 준다. {bro}[은/는] "찍을 땐 3번"이라는 문자를 보냈다.',
    choices: [
      { text: '일찍 자고 컨디션을 지킨다',
        check: { stat: 'smarts', diff: 50 },
        success: { effects: { smarts: 3, happy: 3, flags: ['kr_suneung_taken', 'kr_suneung_good'] }, log: '시험장을 나서는 발걸음이 가벼웠다.' },
        fail: { effects: { happy: -3, flags: ['kr_suneung_taken'] }, log: '수학 마지막 문제에서 시간이 모자랐다.' },
        schedule: { id: 'kr_suneung_result', years: 1 } },
      { text: '밤새 오답 노트를 본다',
        check: { stat: 'smarts', diff: 65 },
        success: { effects: { smarts: 4, health: -2, flags: ['kr_suneung_taken', 'kr_suneung_good'] }, log: '밤새 본 문제가 그대로 나왔다!' },
        fail: { effects: { health: -3, happy: -4, flags: ['kr_suneung_taken'] }, log: '2교시에 꾸벅 졸았다.' },
        schedule: { id: 'kr_suneung_result', years: 1 } }
    ]
  });
  E({
    id: 'kr_suneung_result', age: [18, 20], countries: ['kr'], once: true, weight: 1,
    cond: { flags: ['kr_suneung_taken'] },
    text: '{exam} 성적표가 나왔다. 온 식구가 좁은 방에 모여 숫자를 들여다본다.',
    choices: [
      { text: '결과를 받아들이고 다음 길을 찾는다', effects: { happy: 2, grit: 2, rel: { family: 3 } },
        log: '{father}[이/가] "숫자가 사람을 정하진 않는다"며 어깨를 두드렸다.' },
      { text: '재수를 결심한다', effects: { smarts: 3, happy: -3, money: -800, flags: ['kr_jaesu'] },
        log: '노량진 고시원 창문 없는 방에서 1년이 시작됐다.' }
    ]
  });
  E({
    id: 'kr_jeju_accent', age: [12, 16], countries: ['kr'], once: true,
    cond: { flags: ['moved_alone'] },
    text: '"혼저 옵서예~" 선배들이 {name}의 제주 말투를 흉내 내며 낄낄거린다. 탈의실이 조용해졌다.',
    choices: [
      { text: '웃으며 제주어 강좌를 열어 준다',
        check: { stat: 'happy', diff: 45 },
        success: { effects: { happy: 3, fx: ['newFriend'] }, log: '"폭삭 속았수다"를 배운 선배가 제일 친한 사이가 되었다.' },
        fail: { effects: { happy: -3 }, log: '농담이 통하지 않았다. 그날 밤 이불을 머리끝까지 덮었다.' } },
      { text: '말 대신 훈련장에서 보여 준다', alt: { text: '말 대신 {hobbyAct} 실력으로 보여 준다', log: '실력을 보여 주자 아무도 말투 얘기를 하지 않았다.',
          fail: { log: '하필 그날 실수를 연발했다. 놀림이 더 심해졌지만 다음 날도 또 나섰다.' } },
        check: { stat: 'football', diff: 50 },
        success: { effects: { football: 2, grit: 3, rel: { coach: 4 } }, log: '미니게임에서 선배 셋을 제치자 아무도 말투 얘기를 하지 않았다.' },
        fail: { effects: { grit: 2, happy: -2 }, log: '공을 뺏기고 더 놀림을 받았다. 그래도 다음 날 또 나갔다.' } }
    ]
  });
  E({
    id: 'kr_father_soju', age: [10, 19], countries: ['kr'], cooldown: 4,
    cond: FATHER_STRUGGLING,
    text: '{localClub} 장비실 불이 늦게까지 켜져 있다. {father}[이/가] 빈 소주병 옆에서 유니폼을 개다 잠들어 있었다.',
    choices: [
      { text: '담요를 덮어 드리고, 다음 날 조심스레 이야기한다', check: { stat: 'social', diff: 45 },
          success: { effects: { happy: -2, rel: { father: 5 }, fx: ['fatherSeekHelp'] }, log: '{father}[은/는] 한참 말이 없다가 "아빠가 미안하다"고 했다.' },
          fail: { effects: { rel: { father: -5 }, happy: -3 }, log: '"애가 뭘 안다고!" {father}[이/가] 소주병을 벽에 던졌다. 그날 밤 장비실 바닥에 유리 조각이 반짝였다.' } },
      { text: '{bro}에게 털어놓는다', effects: { rel: { bro: 5 }, flags: ['kr_bro_told'] },
        log: '{bro}[은/는] "혼자 안고 있지 마. 같이 방법 찾자"고 했다.',
        schedule: { id: 'kr_father_center', years: 1 } },
      { text: '못 본 척 돌아선다', effects: { happy: -4 },
        log: '돌아오는 길, 마음이 돌처럼 무거웠다.' }
    ]
  });
  E({
    id: 'kr_father_center', age: [11, 25], countries: ['kr'], once: true, weight: 1,
    cond: { flags: ['kr_bro_told', '!father_sober', '!father_dead'], rel: { father: 'alive' } },
    text: '{bro}[과/와] 함께 {father}[을/를] 모시고 보건소 중독관리센터를 찾았다. 상담실 앞에서 {father}의 손이 떨렸다.',
    effects: { rel: { father: 6, bro: 3 }, happy: 1, fx: ['fatherSeekHelp'] },
    log: '상담사가 "오신 것 자체가 큰 용기"라고 말해 주었다.'
  });
  E({
    id: 'kr_military_notice', age: [19, 28], countries: ['kr'], once: true, weight: 14,
    cond: { gender: 'm', flags: ['!mil_done', '!jailed', '!abroad'] },
    text: '병무청에서 입영 통지서가 날아왔다. {mother}[은/는] 벌써 {food}[을/를] 끓이며 눈시울을 붉힌다.',
    choices: [
      { text: '현역으로 입대한다', effects: { grit: 6, health: 2, happy: -4, flags: ['mil_done'] },
        log: '18개월, 훈련소 첫날 밤엔 별이 유난히 많았다.' },
      { text: '국군체육부대에 지원한다', alt: { text: '공군에 지원한다', req: null, check: { stat: 'smarts', diff: 45 },
          success: { effects: { grit: 4, smarts: 2, happy: -3, flags: ['mil_done'] }, log: '경쟁률을 뚫고 합격했다. 복무 기간은 길었지만 정비 기술을 배웠다.' },
          fail: { effects: { grit: 5, happy: -3, flags: ['mil_done'] }, log: '공군 시험에서 떨어져 현역으로 갔다. 그래도 18개월은 생각보다 빨리 지나갔다.' } }, req: { stats: { football: 55 } },
        check: { stat: 'football', diff: 65 },
        success: { effects: { football: 2, grit: 3, flags: ['mil_done'] }, log: '군복 대신 군 팀 유니폼. 경례도 축구도 열심히 했다.' },
        fail: { effects: { grit: 5, happy: -3, flags: ['mil_done'] }, log: '선발에서 떨어져 현역으로 갔다. 부대 축구에선 전설이 되었다.' } }
    ]
  });
  E({
    id: 'kr_asian_games', age: [20, 27], countries: ['kr'], once: true, weight: 20,
    cond: { gender: 'm', career: ['footballer'], flags: ['nat_team', '!mil_done'] },
    text: '아시안게임 결승. 동료들끼리 농담 반 진담 반으로 말한다. "이거 이기면 다 같이 군대 면제다!"',
    choices: [
      { text: '모든 걸 쏟아붓는다',
        check: { stat: 'football', diff: 70 },
        success: { effects: { fame: 6, happy: 6, flags: ['mil_done'], achieve: 'kr_asian_gold' }, log: '금메달! 병역 특례를 받아 계속 공을 찰 수 있게 됐다.' },
        fail: { effects: { happy: -4, grit: 3 }, log: '은메달. 입영 통지서가 언젠가 올 것이다.' } },
      { text: '팀 분위기를 띄우는 데 집중한다', effects: { happy: 3, rel: { coach: 4 }, fame: 2 },
        log: '라커룸 댄스 영상이 화제가 됐다. 결과와 상관없이 즐거웠다.' }
    ]
  });
  E({
    id: 'kr_derby_busan', age: [16, 36], countries: ['kr'], cooldown: 3,
    cond: { fb: ['youth', 'pro'] },
    text: '{rivalClub} 원정 경기. 원정 응원석에서 고향 섬에서 비행기 타고 온 현수막이 보인다. "제주의 자랑 {nick}!"',
    choices: [
      { text: '현수막 앞으로 달려가 인사한다', effects: { fame: 3, happy: 4 },
        log: '골은 못 넣었지만 그 사진이 신문에 실렸다.' },
      { text: '골로 보답하겠다고 다짐한다',
        check: { stat: 'football', diff: 60 },
        success: { effects: { fame: 5, football: 1 }, log: '후반 막판 결승골! 원정석이 귤빛으로 물들었다.' },
        fail: { effects: { happy: -3 }, log: '슈팅이 골대를 때렸다. 현수막 아래서 고개를 숙였다.' } }
    ]
  });
  E({
    id: 'kr_hoesik', age: [24, 58], countries: ['kr'], cooldown: 5,
    cond: { career: 'any', sector: ['business', 'finance', 'government', 'tech', 'trade', 'media'] },
    text: '일로 만난 사람들과 저녁 자리. 옆 사람이 잔을 내밀며 "한 잔 받아야지?" 한다.',
    choices: [
      { text: '받아서 분위기를 맞춘다', effects: { health: -2, happy: 1 },
        log: '다음 날 아침 해장국이 유난히 짰다.' },
      { text: '사이다로 건배한다', effects: { happy: 2, grit: 2 },
        log: '"저는 이걸로 할게요." 생각보다 아무도 뭐라 하지 않았다.' }
    ]
  });
  E({
    id: 'kr_sanggyeonrye', age: [25, 45], countries: ['kr'], once: true,
    cond: { rel: { partner: 'yes' }, flags: ['!married'] },
    text: '{partner}의 부모님과 상견례 날. {mother}[은/는] 제주에서 귤 한 상자를 들고 비행기를 탔다.',
    choices: [
      { text: '정중하게 예의를 다한다', effects: { rel: { partner: 5, mother: 3 }, money: -150 },
        log: '귤 상자 덕에 분위기가 금세 풀렸다.' },
      { text: '축구 이야기로 분위기를 띄운다', alt: { text: '{hobby} 이야기로 분위기를 띄운다', log: '{partner}의 아버지도 같은 취미였다! 분위기가 단번에 풀렸다.',
          fail: { log: '상대 부모님은 {hobby}에 관심이 하나도 없었다. 정적이 흘렀다.' } },
        check: { stat: 'happy', diff: 45 },
        success: { effects: { rel: { partner: 6 }, happy: 3 }, log: '{partner}의 아버지도 조기축구 30년 차였다!' },
        fail: { effects: { rel: { partner: -2 } }, log: '상대 부모님은 야구 팬이었다. 정적이 흘렀다.' } }
    ]
  });
  E({
    id: 'kr_mother_gyulbat', age: [38, 70], countries: ['kr'], cooldown: 6,
    cond: { rel: { mother: 'alive' } },
    text: '{mother}[이/가] 전화로 무릎이 시리다는 말을 지나가듯 한다. 그래도 매년 귤 상자는 꼬박꼬박 부친다.',
    choices: [
      { text: '주말마다 제주에 내려간다', effects: { money: -600, happy: 3, rel: { mother: 6 } },
        log: '{mother}[은/는] 바닷가 산책길에서 내 팔짱을 꼭 꼈다.' },
      { text: '병원비와 용돈을 보낸다', effects: { money: -1000, rel: { mother: 3 } },
        log: '"돈은 됐고 얼굴이나 보여 줘." 목소리가 조금 쓸쓸했다.' }
    ]
  });
  E({
    id: 'kr_father_jesa', age: [22, 85], countries: ['kr'], cooldown: 5,
    cond: { flags: ['father_dead'] },
    text: '{father}의 기일. 상 위에 {father}[이/가] 좋아하던 {food}[을/를] 올렸다.',
    textVariants: [
      '{father}의 기일. 상 위에 {father}[이/가] 좋아하던 {food}[을/를] 올렸다.',
      '또 {father}의 기일이 돌아왔다. 상 앞에서 잠시 고개를 숙였다.',
      '{father}의 기일. 지방을 쓰는 손이 예전보다 느려졌다. 향 냄새가 방 안에 오래 머물렀다.'
    ],
    effects: { happy: -1, rel: { family: 4 } },
    log: '함께했던 기억을 떠올리다 웃음과 눈물이 함께 났다.',
    logVariants: ['함께했던 기억을 떠올리다 웃음과 눈물이 함께 났다.', '사진 속 얼굴을 한참 바라봤다.', '상을 물린 뒤 {food}[을/를] 먹으며 옛날을 떠올렸다.']
  });
  E({
    id: 'kr_olle_old', age: [62, 90], countries: ['kr'], cooldown: 5,
    text: '고향 올레길을 천천히 걷는다. 기억 속 돌담 골목이 카페 거리가 되어 있다.',
    effects: { health: 3, happy: 3 },
    log: '카페 주인이 {nick}[을/를] 알아보고 귤차를 내 왔다.'
  });

  /* =============================================================== JAPAN */
  E({
    id: 'jp_otoshidama', age: [3, 10], countries: ['jp'], once: true,
    text: '오쇼가쓰, 상에 차린 소박한 오세치 앞에서 {father}[이/가] 작은 봉투를 건넨다. {bro}[은/는] 벌써 봉투 무게를 재고 있다.',
    effects: { happy: 4, money: 15, rel: { family: 3 } },
    log: '세뱃돈은 전부 축구공 저금통으로 들어갔다.'
  });
  E({
    id: 'jp_bukatsu', age: [13, 13], countries: ['jp'], once: true,
    cond: { edu: ['middle'] },
    text: '중학교 입학, 부카쓰(동아리)를 정해야 한다. 야구부 선배들이 우렁찬 목소리로 신입생을 부른다.',
    choices: [
      { text: '{school} 축구부', effects: { football: 3, grit: 2, flags: ['jp_soccer_bu'] },
        log: '첫날부터 운동장 정비와 공 줍기. 그래도 설렜다.' },
      { text: '야구부에 들어간다', effects: { grit: 3, health: 2, flags: ['jp_baseball'] },
        log: '까까머리가 되었다. {sis1}[이/가] 사진을 찍어 갔다.' },
      { text: '귀가부(무소속)로 공부에 집중', effects: { smarts: 3, happy: 1 },
        log: '방과 후 도서관 창가 자리가 생겼다.' }
    ]
  });
  E({
    id: 'jp_koshien_qualifier', age: [16, 18], countries: ['jp'], once: true,
    cond: { edu: ['high'], flags: ['jp_baseball'] },
    text: '여름 고교 야구 지역 예선 결승. 전국대회 구장의 흙을 밟는 게 팀 모두의 꿈이다.',
    choices: [
      { text: '마지막 타석, 풀스윙',
        check: { stat: 'grit', diff: 50 },
        success: { effects: { fame: 4, happy: 6 }, log: '역전 적시타! 섬 전체가 라디오 앞에서 환호했다.' },
        fail: { effects: { happy: -4, grit: 3 }, log: '삼진. 울면서 운동장 흙을 주머니에 담았다.' } },
      { text: '번트로 팀에 헌신한다', effects: { grit: 3, rel: { friend: 4 } },
        log: '결과는 졌지만 감독님이 "최고의 번트였다"고 했다.' }
    ]
  });
  E({
    id: 'jp_hs_cup', age: [16, 18], countries: ['jp'], cooldown: 2,
    cond: { edu: ['high'], fb: ['none', 'local', 'regional'], stats: { football: [40, 100] } },
    text: '겨울 전국 고교 축구 선수권 현 예선 결승. 관중석에 {mother}[이/가] 일하던 앞치마 차림으로 와 있다.',
    choices: [
      { text: '드리블로 승부한다',
        check: { stat: 'football', diff: 55 },
        success: { effects: { fame: 3, football: 2, happy: 5 }, log: '연장 결승골! 전국대회 진출이다.' },
        fail: { effects: { happy: -3, grit: 2 }, log: '승부차기에서 졌다. 선배들과 끌어안고 울었다.' } },
      { text: '침착하게 패스를 돌린다', effects: { football: 1, rel: { coach: 3 } },
        log: '팀은 이겼고, {coach}[은/는] 판단력을 칭찬했다.' }
    ]
  });
  E({
    id: 'jp_juku_summer', age: [17, 18], countries: ['jp'], once: true,
    cond: { edu: ['high'] },
    text: '여름방학, 친구들이 하나둘 입시 학원(주쿠) 여름 강습에 등록한다. {exam}[이/가] 반년 앞이다.',
    choices: [
      { text: '주쿠에 다닌다', effects: { money: -500, smarts: 4, happy: -2 },
        log: '매미 소리 대신 형광등 소리를 들으며 여름을 보냈다.' },
      { text: '헌책 문제집으로 독학한다',
        check: { stat: 'smarts', diff: 55 },
        success: { effects: { smarts: 4, grit: 2, flags: ['jp_self_study'] }, log: '{sis2}[이/가] 물려준 문제집이 너덜너덜해졌다.' },
        fail: { effects: { smarts: 1, flags: ['jp_self_study'] }, log: '문제집 위에서 자주 잠들었다.' },
        schedule: { id: 'jp_sakura_saku', years: 1 } },
      { text: '마지막 대회를 위해 운동에 집중', effects: { football: 2, grit: 2 },
        log: '공부는 가을부터 하기로 했다. 아마도.' }
    ]
  });
  E({
    id: 'jp_sakura_saku', age: [18, 19], countries: ['jp'], once: true, weight: 1,
    cond: { flags: ['jp_self_study'] },
    text: '합격 발표 날. 휴대폰 화면 속 수험번호를 손가락으로 하나씩 짚어 내려간다.',
    choices: [
      { text: '숨을 참고 끝까지 본다',
        check: { stat: 'smarts', diff: 55 },
        success: { effects: { happy: 6, smarts: 2 }, log: '“벚꽃 피다(합격)!” {mother}[이/가] 전화기 너머에서 울었다.' },
        fail: { effects: { happy: -4, grit: 3 }, log: '번호가 없었다. 내년 봄을 다시 기약했다.' } },
      { text: '{sis1}에게 대신 봐 달라고 한다', effects: { rel: { sis1: 4 }, happy: 1 },
        log: '{sis1}[은/는] 결과보다 "수고했다"는 말을 먼저 했다.' }
    ]
  });
  E({
    id: 'jp_okinawa_accent', age: [12, 16], countries: ['jp'], once: true,
    cond: { flags: ['moved_alone'] },
    text: '{name}[이/가] 무심코 오키나와 억양으로 대답하자 팀 동료들이 따라 하며 웃는다.',
    choices: [
      { text: '고향 말 인사를 가르쳐 준다',
        check: { stat: 'happy', diff: 40 },
        success: { effects: { happy: 3, rel: { coach: 2 }, fx: ['newFriend'] }, log: '어느새 팀 구호가 "하이사이!"가 되었다.' },
        fail: { effects: { happy: -3 }, log: '웃음만 커졌다. 그날은 말을 아꼈다.' } },
      { text: '{coach}에게 털어놓는다', effects: { rel: { coach: 4 }, happy: 1 },
        log: '{coach}[은/는] 자신도 지방 출신이라며 다음 날 팀 미팅을 열었다.' },
      { text: '묵묵히 개인 훈련을 늘린다', effects: { grit: 4, happy: -2 },
        log: '말수는 줄었고 슈팅은 날카로워졌다.' }
    ]
  });
  E({
    id: 'jp_father_awamori', age: [10, 19], countries: ['jp'], cooldown: 4,
    cond: FATHER_STRUGGLING,
    text: '태풍이 지나간 밤, {father}[이/가] 혼자 아와모리 병을 비우고 있다. 공원 나무가 쓰러져 일이 많았다고 중얼거린다.',
    choices: [
      { text: '옆에 앉아 오늘 하루를 들어 드린다', check: { stat: 'social', diff: 45 },
          success: { effects: { rel: { father: 5 }, happy: -1, fx: ['fatherSeekHelp'] }, log: '{father}[은/는] "내일 병원에 같이 가 줄래?" 하고 작게 물었다.' },
          fail: { effects: { rel: { father: -3 }, happy: -3 }, log: '{father}[은/는] 끝내 입을 열지 않았다. 태풍이 할퀴고 간 창문 테이프를 혼자 떼며 밤을 새웠다.' } },
      { text: '단주 모임 안내지를 장비 가방에 넣어 둔다', effects: { flags: ['jp_danshu_flyer'] },
        log: '안내지 위에 "아빠 응원해"라고 적었다.',
        schedule: { id: 'jp_danshu_meeting', years: 1 } },
      { text: '방문을 닫고 이어폰을 낀다', effects: { happy: -4 },
        log: '음악 소리를 키워도 마음은 시끄러웠다.' }
    ]
  });
  E({
    id: 'jp_danshu_meeting', age: [11, 25], countries: ['jp'], once: true, weight: 1,
    cond: { flags: ['jp_danshu_flyer', '!father_sober', '!father_dead'], rel: { father: 'alive' } },
    text: '{father}[이/가] 저녁상 앞에서 머뭇거리다 말한다. "지난주에… 그 모임에 가 봤다." 가방 속 안내지는 손때가 묻어 있었다.',
    effects: { rel: { father: 6 }, happy: 2, fx: ['fatherSeekHelp'] },
    log: '{mother}[이/가] 조용히 {father}의 밥그릇에 밥을 더 퍼 주었다.'
  });
  E({
    id: 'jp_derby_osaka', age: [17, 36], countries: ['jp'], cooldown: 3,
    cond: { fb: ['youth', 'pro'] },
    text: '{rivalClub}[과/와]의 경기. 원정석이 90분 내내 응원가를 부른다. 오늘은 고향 방송국도 중계를 왔다.',
    choices: [
      { text: '응원가에 맞춰 질주한다',
        check: { stat: 'football', diff: 60 },
        success: { effects: { fame: 4, happy: 4 }, log: '골 세리머니로 에이사 북 치는 흉내를 냈다. 섬이 들썩였다.' },
        fail: { effects: { happy: -2, health: -1 }, log: '태클에 넘어져 무릎이 까졌다.' } },
      { text: '경기 후 원정석에 끝까지 인사한다', effects: { fame: 2, rel: { coach: 2 } },
        log: '빗속에서 고개 숙여 인사하는 사진이 화제가 됐다.' }
    ]
  });
  E({
    id: 'jp_nomikai', age: [23, 60], countries: ['jp'], cooldown: 5,
    cond: { career: 'any', sector: ['business', 'finance', 'tech', 'trade', 'government'] },
    text: '일로 만난 사람들과 금요일 술자리(노미카이). 한 사람이 "2차 가라오케 가는 사람?" 하고 손을 든다.',
    choices: [
      { text: '마이크를 잡는다', effects: { happy: 3, health: -1 },
        log: '고향 민요를 불렀더니 의외로 기립 박수가 나왔다.' },
      { text: '"막차가…" 하며 정중히 빠진다', effects: { health: 1, grit: 1 },
        log: '편의점 오니기리를 들고 집에 가는 길이 평화로웠다.' }
    ]
  });
  E({
    id: 'jp_okinawa_wedding', age: [25, 45], countries: ['jp'], once: true,
    cond: { rel: { partner: 'yes' }, flags: ['!married'] },
    text: '{mother}[이/가] 고향식 결혼 피로연엔 손님이 수백 명 와야 한다며 벌써 명단을 쓰고 있다.',
    choices: [
      { text: '고향에서 떠들썩하게 연다', effects: { money: -3000, happy: 6, rel: { family: 5, partner: 3 } },
        log: '마지막엔 모두 일어나 손을 흔드는 춤을 췄다.' },
      { text: '가족끼리 소박하게 한다', effects: { money: -600, happy: 3, rel: { partner: 4 } },
        log: '{mother}[은/는] 조금 아쉬워했지만 사진을 액자에 넣었다.' }
    ]
  });
  E({
    id: 'jp_obon_father', age: [22, 85], countries: ['jp'], cooldown: 5,
    cond: { flags: ['father_dead'] },
    text: '오봉, 불단 앞에 {father}의 사진과 낡은 {localClub} 열쇠 꾸러미가 놓여 있다. 멀리서 에이사 북소리가 들린다.',
    textVariants: [
      '오봉, 불단 앞에 {father}의 사진과 낡은 {localClub} 열쇠 꾸러미가 놓여 있다. 멀리서 에이사 북소리가 들린다.',
      '오봉 마지막 날, 강가에서 등불을 띄웠다. {father}의 등불이 가장 멀리 흘러갔다.',
      '올해 오봉에는 {father}[이/가] 좋아하던 {food}[을/를] 불단에 올렸다. 향이 가늘게 피어올랐다.'
    ],
    effects: { happy: -1, rel: { family: 4 } },
    log: '"아버지도 저 북소리 따라 오셨을 거야"라는 말에 다들 고개를 끄덕였다.',
    logVariants: ['"아버지도 저 북소리 따라 오셨을 거야"라는 말에 다들 고개를 끄덕였다.', '등불이 보이지 않을 때까지 아무도 자리를 뜨지 않았다.', '불단 앞에서 올해 있었던 일을 하나씩 보고했다.']
  });
  E({
    id: 'jp_senior_life', age: [65, 90], countries: ['jp'], cooldown: 5,
    text: '동네 공민관에서 어르신 게이트볼 대회가 열렸다. 다들 {nick}의 정확한 타격에 감탄한다.',
    effects: { health: 3, happy: 3 },
    log: '우승 상품은 고야 한 봉지였다.'
  });

  /* =============================================================== CHINA */
  E({
    id: 'cn_spring_hongbao', age: [3, 10], countries: ['cn'], once: true,
    text: '춘절 밤, 골목에 폭죽 소리가 가득하다. {father}[이/가] 빨간 봉투를 건네며 "올해도 건강하게"라고 말한다.',
    effects: { happy: 4, money: 15, rel: { family: 3 } },
    log: '{sis1}[이/가] 봉투 속 지폐를 같이 세어 주었다.'
  });
  E({
    id: 'cn_dragon_boat', age: [6, 15], countries: ['cn'], cooldown: 5,
    text: '단오절, 강가에서 용선 경기가 열렸다. {bro}[이/가] 동네 팀 노잡이로 나간다.',
    effects: { happy: 3, grit: 1, rel: { bro: 4 } },
    log: '쫑쯔를 입에 문 채 목이 쉬도록 응원했다.'
  });
  E({
    id: 'cn_zhongkao', age: [15, 15], countries: ['cn'], once: true,
    cond: { edu: ['middle'] },
    text: '중카오(고입 시험)가 코앞이다. 담임은 일반고 진학을, 축구부 코치는 체육 특기생 길을 권한다.',
    choices: [
      { text: '시험에 전력을 다한다',
        check: { stat: 'smarts', diff: 50 },
        success: { effects: { smarts: 4, happy: 3 }, log: '명문 고중 합격 통지가 왔다.' },
        fail: { effects: { smarts: 1, happy: -3 }, log: '목표 학교엔 못 갔지만 집 근처 고중에 붙었다.' } },
      { text: '체육 특기생 시험을 본다', req: { stats: { football: 40 } }, effects: { football: 3, grit: 2, smarts: -1 },
        log: '운동장 열 바퀴로 시작하는 새벽 훈련이 시작됐다.' }
    ]
  });
  E({
    id: 'cn_gaokao_100', age: [18, 18], countries: ['cn'], once: true,
    cond: { edu: ['high'] },
    text: '{exam} D-100 서약식. 운동장에 붉은 현수막이 걸리고, 전교생이 주먹을 쥐고 다짐을 외친다.',
    choices: [
      { text: '새벽 5시 기상, 문제집을 판다',
        check: { stat: 'smarts', diff: 55 },
        success: { effects: { smarts: 5, health: -2, flags: ['cn_gaokao_done', 'cn_gaokao_good'] }, log: '시험장에서 손이 떨리지 않았다.' },
        fail: { effects: { smarts: 2, health: -3, happy: -3, flags: ['cn_gaokao_done'] }, log: '시험 첫날 밤 한숨도 못 잤다.' },
        schedule: { id: 'cn_gaokao_result', years: 1 } },
      { text: '운동으로 머리를 비우며 공부한다', alt: { text: '{hobbyAct}[으로/로] 머리를 비우며 공부한다', log: '저녁 30분 {hobbyAct}[이/가] 최고의 휴식이었다.' },
        check: { stat: 'grit', diff: 45 },
        success: { effects: { smarts: 3, health: 2, flags: ['cn_gaokao_done', 'cn_gaokao_good'] }, log: '저녁 30분 공차기가 최고의 휴식이었다.' },
        fail: { effects: { smarts: 1, flags: ['cn_gaokao_done'] }, log: '30분이 자꾸 두 시간이 되었다.' },
        schedule: { id: 'cn_gaokao_result', years: 1 } }
    ]
  });
  E({
    id: 'cn_gaokao_result', age: [18, 20], countries: ['cn'], once: true, weight: 1,
    cond: { flags: ['cn_gaokao_done'] },
    text: '{exam} 점수 발표 날. 골목 사람들까지 소식을 기다린다. {father}[은/는] 공원 일을 마치고 흙 묻은 손으로 휴대폰을 쥐었다.',
    choices: [
      { text: '점수를 가족과 함께 확인한다', effects: { happy: 2, rel: { family: 4 } },
        log: '숫자가 어떻든 그날 저녁 {mother}[은/는] 원창 닭을 삶았다.' },
      { text: '혼자 바닷가에 가서 확인한다', effects: { grit: 2, happy: -1 },
        log: '파도 소리가 한참 동안 위로해 주었다.' }
    ]
  });
  E({
    id: 'cn_accent_tease', flavour: 'football', age: [12, 16], countries: ['cn'], once: true,
    cond: { flags: ['moved_alone'] },
    text: '훈련 중 {name}[이/가] 말을 할 때마다 누군가 섬 억양을 흉내 낸다. "야, 코코넛!"',
    choices: [
      { text: '"코코넛 맛 좀 볼래?" 받아친다',
        check: { stat: 'football', diff: 50 },
        success: { effects: { football: 2, grit: 2, happy: 2 }, log: '다음 미니게임에서 그 녀석을 두 번 제쳤다. 별명이 "코코넛 미사일"로 바뀌었다.' },
        fail: { effects: { happy: -3 }, log: '말은 했지만 공은 뺏겼다. 웃음소리가 길었다.' } },
      { text: '표준어를 밤마다 연습한다', effects: { smarts: 2, happy: -2, grit: 2 },
        log: '라디오 아나운서 말투를 따라 했다. 그래도 고향 말은 잊지 않기로 했다.' }
    ]
  });
  E({
    id: 'cn_father_baijiu', age: [10, 19], countries: ['cn'], cooldown: 4,
    cond: FATHER_STRUGGLING,
    text: '{father}[이/가] 장비 정리를 하다 말고 바이주 잔을 연거푸 비운다. 아침에 공원에 늦게 나가 혼났다는 이야기가 들린다.',
    choices: [
      { text: '{father}의 손을 잡고 진심을 말한다', check: { stat: 'social', diff: 45 },
          success: { effects: { rel: { father: 5 }, happy: -1, fx: ['fatherSeekHelp'] }, log: '"아빠가 아프면 우리도 아파요." {father}[은/는] 고개를 끄덕였다.' },
          fail: { effects: { rel: { father: -4 }, happy: -3 }, log: '손을 뿌리친 {father}[이/가] 잔을 하나 더 채웠다. "체면 깎이게 어디서 훈계야."' } },
      { text: '{sis1}[과/와] 병원 상담을 알아본다', effects: { rel: { sis1: 5 }, flags: ['cn_sis_hospital'] },
        log: '{sis1}[이/가] 시립병원 상담 예약 번호를 적어 왔다.',
        schedule: { id: 'cn_father_clinic', years: 1 } },
      { text: '아무 말 없이 술병을 치운다', effects: { happy: -3, rel: { father: 1 } },
        log: '다음 날 {father}[은/는] 아무 말 없이 장비를 챙겨 나갔다.' }
    ]
  });
  E({
    id: 'cn_father_clinic', age: [11, 25], countries: ['cn'], once: true, weight: 1,
    cond: { flags: ['cn_sis_hospital', '!father_sober', '!father_dead'], rel: { father: 'alive' } },
    text: '{sis1}[과/와] 함께 {father}[을/를] 모시고 시립병원 상담실에 갔다. 의사는 천천히, 오래 걸려도 괜찮다고 말했다.',
    effects: { rel: { father: 6, sis1: 3 }, happy: 1, fx: ['fatherSeekHelp'] },
    log: '돌아오는 버스에서 {father}[이/가] 처음으로 먼저 손을 잡았다.'
  });
  E({
    id: 'cn_derby_beijing', age: [17, 36], countries: ['cn'], cooldown: 3,
    cond: { fb: ['youth', 'pro'] },
    text: '{rivalClub} 원정. 경기장을 가득 메운 함성에 땅이 울린다. 고향 골목에서는 다들 휴대폰 중계를 켰을 것이다.',
    choices: [
      { text: '첫 터치부터 과감하게',
        check: { stat: 'football', diff: 60 },
        success: { effects: { fame: 5, happy: 4 }, log: '중거리 슈팅이 꽂혔다! 동네 단체 채팅방이 폭발했다.' },
        fail: { effects: { happy: -3 }, log: '패스 실수로 실점의 빌미를 줬다.' } },
      { text: '수비 가담으로 팀을 돕는다', effects: { grit: 2, rel: { coach: 3 } },
        log: '무승부. 감독은 성실함을 칭찬했다.' }
    ]
  });
  E({
    id: 'cn_overtime', age: [23, 55], countries: ['cn'], cooldown: 5,
    cond: { career: 'any', sector: ['tech', 'business', 'finance', 'trade'] },
    text: '일로 연락하는 사람에게 밤 11시 메시지가 온다. "내일 아침까지 수정본 부탁해요."',
    choices: [
      { text: '밤새 고친다', effects: { money: 300, health: -3, happy: -2 },
        log: '답장으로 엄지 이모티콘 하나를 받았다.' },
      { text: '정중하게 내일 오전으로 미룬다',
        check: { stat: 'grit', diff: 45 },
        success: { effects: { happy: 3, health: 1 }, log: '의외로 "그래요"라는 답이 왔다.' },
        fail: { effects: { happy: -2 }, log: '다음 날에도 재촉하는 연락이 왔다.' } }
    ]
  });
  E({
    id: 'cn_wedding_candy', age: [25, 45], countries: ['cn'], once: true,
    cond: { rel: { partner: 'yes' }, flags: ['!married'] },
    text: '결혼 준비. 양가 부모님이 하이난식으로 할지 {partner}의 고향식으로 할지 의논이 길어진다.',
    choices: [
      { text: '두 고향에서 한 번씩 잔치를 연다', effects: { money: -2500, happy: 5, rel: { family: 4, partner: 4 } },
        log: '결혼 사탕을 두 번 돌렸다. 친척들은 두 배로 기뻐했다.' },
      { text: '작게 하고 신혼여행에 쓴다', effects: { money: -1200, happy: 4, rel: { partner: 5 } },
        log: '{mother}[은/는] 사진을 보며 "행복하면 됐다"고 했다.' }
    ]
  });
  E({
    id: 'cn_qingming', age: [22, 85], countries: ['cn'], cooldown: 5,
    cond: { flags: ['father_dead'] },
    text: '청명절, 가족들이 {father}의 묘를 찾아 풀을 뽑고 꽃을 놓는다. 공원 정원사였던 {father}[이/가] 봤다면 잘 다듬었다고 했을 것이다.',
    textVariants: [
      '청명절, 가족들이 {father}의 묘를 찾아 풀을 뽑고 꽃을 놓는다. 공원 정원사였던 {father}[이/가] 봤다면 잘 다듬었다고 했을 것이다.',
      '청명절 아침, 이슬비가 내렸다. {father}의 묘 앞에 차 한 잔을 따랐다.',
      '올해 청명절에는 꽃모종을 {father}의 묘에 옮겨 심었다.'
    ],
    effects: { happy: -1, rel: { family: 4 } },
    log: '무덤가에 작은 축구공 모양 장식을 놓았다.',
    logVariants: ['무덤가에 작은 축구공 모양 장식을 놓았다.', '돌아오는 길에 다 같이 {food}[을/를] 먹었다.', '묘비의 이름을 손으로 한 번 쓸어 보았다.']
  });
  E({
    id: 'cn_square_dance', age: [60, 90], countries: ['cn'], cooldown: 5,
    text: '저녁 광장, 음악에 맞춰 어르신들이 광장무를 춘다. {name}[은/는] 한쪽에서 손주 또래 아이들에게 공 차는 법을 가르친다.',
    effects: { health: 3, happy: 4 },
    log: '아이들이 "왼발 진짜 예술이에요!" 하며 눈을 반짝였다.'
  });

  /* =============================================================== USA */
  E({
    id: 'us_thanksgiving', age: [3, 12], countries: ['us'], once: true,
    text: '추수감사절. 작은 집에 친척까지 모여 접이식 테이블 세 개를 이어 붙였다. {father}[이/가] 칠면조를 자르며 올해 감사한 일을 하나씩 말해 보자고 한다.',
    effects: { happy: 4, rel: { family: 4 } },
    log: '{name}[은/는] "{bro}[이/가] 공 차는 거 봐 준 거"라고 말했다. {bro}[이/가] 머리를 헝클어 줬다.'
  });
  E({
    id: 'us_halloween_kit', origin: ['middle', 'poor', 'slum'], age: [5, 12], countries: ['us'], cooldown: 3,
    cond: { money: [0, 3000] },
    text: '할로윈. 가게 코스튬은 너무 비싸다. {father}[이/가] {localClub}의 낡은 유니폼에 번호를 꿰매 준다.',
    effects: { happy: 3, rel: { father: 4 } },
    log: '"오늘 밤 넌 월드컵 스타야." 사탕을 두 배로 받았다.'
  });
  E({
    id: 'us_park_soccer', age: [6, 11], countries: ['us'], cooldown: 4,
    cond: { fb: ['none', 'local'] },
    text: '토요일 아침 카운티 공원. {father}[이/가] 직접 깎은 잔디 위에 콘을 놓고 꼬마들 경기를 준비한다.',
    effects: { football: 3, happy: 2, rel: { father: 2 } },
    log: '경기 후 오렌지 조각을 나눠 먹는 게 제일 좋았다.'
  });
  E({
    id: 'us_tryouts', age: [14, 15], countries: ['us'], once: true,
    cond: { edu: ['middle', 'high'], fb: ['none', 'local', 'regional'] },
    text: '{school} 고교 축구팀 트라이아웃. 체육관 게시판 앞에 신입생들이 줄을 섰다.',
    choices: [
      { text: '대표팀(바시티)에 도전한다',
        check: { stat: 'football', diff: 45 },
        success: { effects: { football: 2, fame: 1, happy: 4, flags: ['us_varsity'] }, log: '신입생 중 유일하게 바시티 명단에 이름이 올랐다.' },
        fail: { effects: { grit: 3, happy: -2 }, log: 'JV(2군)로 시작한다. 코치가 "내년에 보자"고 했다.' } },
      { text: '친구들과 같이 JV부터 한다', effects: { happy: 3, fx: ['newFriend'] },
        log: '원정 버스 맨 뒷자리가 우리 차지가 되었다.' }
    ]
  });
  E({
    id: 'us_prom', age: [17, 18], countries: ['us'], once: true,
    cond: { edu: ['high'] },
    text: '프롬 시즌. 복도마다 풍선과 포스터로 "프롬 같이 갈래?" 고백이 이어진다.',
    choices: [
      { text: '골대 모양 포스터로 신청한다',
        check: { stat: 'looks', diff: 45 },
        success: { effects: { happy: 6, fx: ['newPartner'] }, log: '"골인!" 환호 속에 승낙을 받았다.' },
        fail: { effects: { happy: -3 }, log: '정중히 거절당했다. 포스터는 {sis2}[이/가] 기념으로 가져갔다.' } },
      { text: '친구들과 단체로 간다', effects: { happy: 4, rel: { friend: 4 } },
        log: '빌린 정장은 컸지만 밤새 춤을 췄다.' },
      { text: '그날 리조트 아르바이트를 한다', effects: { money: 150, happy: -1 },
        log: '번 돈으로 {mother}에게 꽃을 샀다.' }
    ]
  });
  E({
    id: 'us_sat', age: [17, 17], countries: ['us'], once: true,
    cond: { edu: ['high'] },
    text: '{exam} 시험이 다가온다. 친구들은 비싼 과외를 받는데, 도서관에는 무료 온라인 연습 문제가 있다.',
    choices: [
      { text: '무료 연습 문제를 매일 푼다',
        check: { stat: 'smarts', diff: 50 },
        success: { effects: { smarts: 4, grit: 2 }, log: '점수가 예상보다 훨씬 잘 나왔다.' },
        fail: { effects: { smarts: 2 }, log: '평균 정도. 다시 볼 기회는 있다.' } },
      { text: '돈을 모아 과외를 받는다', req: { money: 1500 }, effects: { money: -1500, smarts: 5 },
        log: '과외비를 내고 수업을 시작했다.' },
      { text: '시즌 경기에 집중한다', effects: { football: 3, smarts: -1 },
        log: '연습 문제집은 축구 가방 밑바닥에서 구겨졌다.' }
    ]
  });
  E({
    id: 'us_scholarship_letter', age: [17, 18], countries: ['us'], once: true,
    cond: { edu: ['high'], flags: ['us_varsity', '!moved_alone'], stats: { football: [55, 100] } },
    text: '본토 대학 축구부 코치에게서 메일이 왔다. "체육 장학금을 제안합니다." {mother}[이/가] 메일을 세 번 소리 내어 읽었다.',
    choices: [
      { text: '장학금을 받고 대학에 간다', effects: { happy: 6, smarts: 2, flags: ['scholarship'], rel: { mother: 4 } },
        log: '첫 장학금 서류에 {father}[이/가] 떨리는 손으로 보호자 서명을 했다.' },
      { text: '프로의 꿈을 위해 보류한다', effects: { football: 2, grit: 3, flags: ['us_scholar_wait'] },
        log: '"한 시즌만 더 보여 줄게." 결정을 미뤘다.',
        schedule: { id: 'us_second_offer', years: 1 } }
    ]
  });
  E({
    id: 'us_second_offer', age: [18, 20], countries: ['us'], once: true, weight: 1,
    cond: { flags: ['us_scholar_wait'] },
    text: '장학금을 제안했던 코치가 다시 연락해 왔다. "아직 자리 있다, 생각 있나?"',
    choices: [
      { text: '이번엔 받아들인다', effects: { happy: 4, flags: ['scholarship'] },
        log: '돌아서 온 길이지만 늦지 않았다.' },
      { text: '내 길을 계속 간다', effects: { grit: 3, happy: 1 },
        log: '"응원할게." 코치는 쿨하게 전화를 끊었다.' }
    ]
  });
  E({
    id: 'us_pidgin_tease', flavour: 'football', age: [12, 16], countries: ['us'], once: true,
    cond: { flags: ['moved_alone'] },
    text: '{name}[이/가] 섬 사투리로 "브라~" 하고 부르자 팀원들이 따라 하며 웃는다. 누군가는 "서핑이나 하지 왜 왔냐"고 한다.',
    choices: [
      { text: '서핑 대신 볼 리프팅으로 응수한다',
        check: { stat: 'football', diff: 45 },
        success: { effects: { football: 2, happy: 3, fx: ['newFriend'] }, log: '백 번 리프팅에 다들 조용해졌다. 이제 "브라"는 팀 유행어다.' },
        fail: { effects: { happy: -3 }, log: '공을 떨어뜨렸다. 웃음이 더 커졌다.' } },
      { text: '{coach}에게 이야기한다', effects: { rel: { coach: 4 } },
        log: '{coach}[은/는] "여기선 출신이 아니라 실력과 태도로 말한다"고 팀에 못 박았다.' }
    ]
  });
  E({
    id: 'us_father_beer', age: [10, 19], countries: ['us'], cooldown: 4,
    cond: FATHER_STRUGGLING,
    text: '경기장 주차장, 장비 트럭 옆에서 {father}[이/가] 맥주 캔을 들고 비틀거린다. 다른 부모들이 수군거린다.',
    choices: [
      { text: '{father}[을/를] 차에 태우고 조용히 이야기한다', check: { stat: 'smarts', diff: 45 },
          success: { effects: { rel: { father: 5 }, happy: -2, fx: ['fatherSeekHelp'] }, log: '{father}[은/는] 핸들에 이마를 대고 "회복 모임을 알아볼게"라고 했다.' },
          fail: { effects: { rel: { father: -4 }, health: -2, happy: -2 }, log: '{father}[이/가] 굳이 운전대를 잡겠다고 우겼다. 트럭이 주차장 기둥을 긁었고, 둘 다 한마디도 하지 않았다.' } },
      { text: '지역 상담 센터에 털어놓는다', effects: { happy: 1, flags: ['us_counselor'] },
        log: '상담사가 가족 지원 프로그램 안내서를 건넸다.',
        schedule: { id: 'us_family_program', years: 1 } },
      { text: '창피해서 먼저 집에 간다', effects: { happy: -4, rel: { father: -2 } },
        log: '혼자 걷는 길이 유난히 길었다.' }
    ]
  });
  E({
    id: 'us_family_program', age: [11, 25], countries: ['us'], once: true, weight: 1,
    cond: { flags: ['us_counselor', '!father_sober', '!father_dead'], rel: { father: 'alive' } },
    text: '지역 회복 센터의 가족 모임. 둥글게 앉은 사람들 사이에서 {father}[이/가] 처음으로 자기 이름과 "회복 중"이라는 말을 했다.',
    effects: { rel: { father: 6, family: 3 }, happy: 2, fx: ['fatherSeekHelp'] },
    log: '{mother}[이/가] {father}의 손을 꼭 잡았다.'
  });
  E({
    id: 'us_rivalry', age: [17, 36], countries: ['us'], cooldown: 3,
    cond: { fb: ['youth', 'pro'] },
    text: '{rivalClub}[과/와]의 라이벌전. 원정석에 하와이 국기와 꽃목걸이를 건 팬들이 보인다.',
    choices: [
      { text: '골을 노린다',
        check: { stat: 'football', diff: 60 },
        success: { effects: { fame: 4, happy: 4 }, log: '골! 손가락으로 샤카 사인을 만들어 원정석에 바쳤다.' },
        fail: { effects: { happy: -3 }, log: '빗속에서 미끄러졌다. 상대 팬들의 환호가 따가웠다.' } },
      { text: '경기 후 팬들에게 사인을 해 준다', effects: { fame: 2, happy: 2 },
        log: '고향에서 온 꼬마가 울면서 사진을 찍었다.' }
    ]
  });
  E({
    id: 'us_benefits', age: [22, 40], countries: ['us'], once: true,
    cond: { career: 'any' },
    text: '건강보험과 노후 자금 계획을 살펴본다. 비교할 서류가 열 장이다.',
    choices: [
      { text: '꼼꼼히 비교하고 연금을 넣는다',
        check: { stat: 'smarts', diff: 40 },
        success: { effects: { money: 800, smarts: 1 }, log: '조건을 비교해 지출을 줄였다. 미래의 내가 고마워할 것이다.' },
        fail: { effects: { money: -200 }, log: '공제액을 잘못 골라 병원비가 생각보다 나왔다.' } },
      { text: '{sis1}에게 전화해서 물어본다', effects: { rel: { sis1: 4 }, money: 300 },
        log: '{sis1}[은/는] 한 시간 동안 엑셀을 공유해 줬다.' }
    ]
  });
  E({
    id: 'us_fourth_july', age: [18, 70], countries: ['us'], cooldown: 6,
    cond: { rel: { mother: 'alive' } },
    text: '독립기념일, 형제들이 힐로 해변 공원에 모였다. 바비큐 그릴 앞은 여전히 {bro}의 자리다.',
    effects: { happy: 3, rel: { family: 4 } },
    log: '불꽃놀이 아래서 {mother}[이/가] 내 어깨를 다정하게 감쌌다.'
  });
  E({
    id: 'us_beach_wedding', age: [24, 45], countries: ['us'], once: true,
    cond: { rel: { partner: 'yes' }, flags: ['!married'] },
    text: '{partner}[이/가] 해변 결혼식은 어떠냐고 묻는다. 고향 사람들은 레이(꽃목걸이)를 수백 개 만들겠다고 벌써 들떠 있다.',
    choices: [
      { text: '고향 해변에서 한다', effects: { money: -2500, happy: 6, rel: { family: 5, partner: 4 } },
        log: '맨발로 모래 위를 걸었다. 하객 모두 꽃향기에 취했다.' },
      { text: '시청에서 간단히 한다', effects: { money: -200, happy: 3, rel: { partner: 3 } },
        log: '그날 저녁 플레이트 런치로 둘만의 파티를 했다.' }
    ]
  });
  E({
    id: 'us_father_memory', age: [22, 85], countries: ['us'], once: true, // a bench is donated once
    cond: { flags: ['father_dead'] },
    text: '{father}[이/가] 돌보던 카운티 공원에 가족이 작은 벤치를 기증했다. 명판에는 "그는 잔디와 아이들을 사랑했다"라고 적혀 있다.',
    effects: { happy: -1, rel: { family: 4 } },
    log: '벤치 앞에서 꼬마들이 공을 차고 있었다.'
  });
  E({
    id: 'us_retire_hilo', age: [63, 90], countries: ['us'], cooldown: 5,
    text: '고향 해변을 걷다가 동네 아이들 축구 교실을 구경했다. 연습을 준비하는 손길이 분주하다.',
    effects: { health: 3, happy: 4 },
    log: '콘을 놓는 일을 거들자 아이들이 고맙다고 인사했다.'
  });

  /* =============================================================== BRAZIL */
  E({
    id: 'br_carnaval_bloco', age: [4, 12], countries: ['br'], cooldown: 3,
    text: '카니발! 동네 골목 블로쿠(거리 행렬)에 {father}[이/가] {name}[을/를] 어깨에 태우고 나섰다.',
    effects: { happy: 5, rel: { father: 4 } },
    log: '반짝이 가루가 일주일 동안 머리에서 떨어졌다.'
  });
  E({
    id: 'br_futsal', age: [8, 13], countries: ['br'], cooldown: 3,
    cond: { fb: ['local', 'regional'] },
    text: '비 오는 시즌엔 학교 체육관 풋살 대회. 좁은 코트에서 공이 발에서 떨어질 틈이 없다.',
    effects: { football: 3, smarts: 1 },
    log: '{coach}[이/가] "좁은 데서 배운 기술은 넓은 데서 빛난다"고 했다.'
  });
  E({
    id: 'br_enem', age: [18, 18], countries: ['br'], once: true,
    cond: { edu: ['high'] },
    text: '{exam} 두 번의 일요일. 시험장 문이 닫히기 직전, 늦은 수험생들이 전력 질주하는 모습이 해마다 뉴스에 나온다.',
    choices: [
      { text: '두 시간 일찍 나간다',
        check: { stat: 'smarts', diff: 50 },
        success: { effects: { smarts: 4, flags: ['br_enem_done', 'br_enem_good'] }, log: '작문 주제가 딱 내가 아는 이야기였다.' },
        fail: { effects: { smarts: 1, happy: -2, flags: ['br_enem_done'] }, log: '수학에서 시간이 모자랐다.' },
        schedule: { id: 'br_enem_result', years: 1 } },
      { text: '전날 펠라다 한 판으로 긴장을 푼다',
        check: { stat: 'grit', diff: 50 },
        success: { effects: { smarts: 3, happy: 2, flags: ['br_enem_done', 'br_enem_good'] }, log: '머리가 맑았다.' },
        fail: { effects: { health: -2, flags: ['br_enem_done'] }, log: '발목을 삐끗해 절뚝이며 시험장에 들어갔다.' },
        schedule: { id: 'br_enem_result', years: 1 } }
    ]
  });
  E({
    id: 'br_enem_result', age: [18, 20], countries: ['br'], once: true, weight: 1,
    cond: { flags: ['br_enem_done'] },
    text: '{exam} 점수로 지원할 대학을 고르는 날. 공용 컴퓨터 앞에 {sis2}[과/와] 나란히 앉았다.',
    choices: [
      { text: '먼 곳의 연방대학에 도전한다', effects: { smarts: 2, happy: 2, flags: ['br_far_univ'] },
        log: '{sis2}[이/가] "넌 늘 멀리 가는 애였어"라며 웃었다.' },
      { text: '가까운 주립대학을 고른다', effects: { happy: 3, rel: { mother: 3 } },
        log: '{mother}[은/는] 가까운 곳을 골랐다며 기뻐했다.' }
    ]
  });
  E({
    id: 'br_sotaque', flavour: 'football', age: [12, 16], countries: ['br'], once: true,
    cond: { flags: ['moved_alone'] },
    text: '{name}의 북부 억양을 두고 라커룸에서 농담이 오간다. 웃음 사이에 가시가 섞여 있다.',
    choices: [
      { text: '"내 억양은 골 넣을 때 더 커져" 받아친다',
        check: { stat: 'football', diff: 50 },
        success: { effects: { football: 2, happy: 3, grit: 2 }, log: '그 주 연습경기 해트트릭. 세리머니는 고향 말로 외쳤다.' },
        fail: { effects: { happy: -3 }, log: '그날은 공도 말도 잘 안 됐다.' } },
      { text: '{coach}에게 말한다', effects: { rel: { coach: 4 }, happy: 1 },
        log: '{coach}[은/는] "이 팀은 브라질 전체로 이루어져 있다"며 다음 날 팀 미팅을 열었다.' }
    ]
  });
  E({
    id: 'br_father_cachaca', age: [10, 19], countries: ['br'], cooldown: 4,
    cond: FATHER_STRUGGLING,
    text: '{localClub} 클럽하우스 뒤편, {father}[이/가] 카샤사 병을 든 채 벤치에 앉아 있다. 장비 가방은 아직 열리지도 않았다.',
    choices: [
      { text: '옆에 앉아 손을 잡는다', check: { stat: 'social', diff: 45 },
          success: { effects: { rel: { father: 5 }, happy: -1, fx: ['fatherSeekHelp'] }, log: '{father}[은/는] "너와 맑은 정신으로 시간을 보내고 싶다"며 울었다.' },
          fail: { effects: { rel: { father: -3 }, happy: -4 }, log: '{father}[은/는] 벤치에서 일어나 비틀거리며 골목으로 사라졌다. 새벽에야 이웃이 업어 데려왔다.' } },
      { text: '{bro}[과/와] 공공 정신건강센터를 알아본다', effects: { rel: { bro: 5 }, flags: ['br_caps'] },
        log: '{bro}[이/가] 동네 보건소에서 상담 일정을 받아 왔다.',
        schedule: { id: 'br_father_caps', years: 1 } },
      { text: '아무 말 없이 장비를 대신 챙긴다', effects: { grit: 2, happy: -3 },
        log: '공 열두 개를 혼자 닦았다. 마음은 하나도 안 닦였다.' }
    ]
  });
  E({
    id: 'br_father_caps', age: [11, 25], countries: ['br'], once: true, weight: 1,
    cond: { flags: ['br_caps', '!father_sober', '!father_dead'], rel: { father: 'alive' } },
    text: '공공 정신건강센터 대기실. {father}[은/는] 모자를 손에 쥐고 있다가 자기 이름이 불리자 천천히 일어섰다.',
    effects: { rel: { father: 6, bro: 3 }, happy: 1, fx: ['fatherSeekHelp'] },
    log: '상담을 마친 {father}[이/가] "다음 주에도 오래"라고 말하며 희미하게 웃었다.'
  });
  E({
    id: 'br_classico', age: [17, 36], countries: ['br'], cooldown: 3,
    cond: { fb: ['youth', 'pro'] },
    text: '{rivalClub}[과/와]의 클라시쿠. 관중석에서 쏟아지는 노래가 그라운드를 흔든다. 고향 언덕에선 다들 라디오를 켰다.',
    choices: [
      { text: '헛다리 짚기로 수비를 흔든다',
        check: { stat: 'football', diff: 60 },
        success: { effects: { fame: 5, happy: 4 }, log: '팔다리를 꼬아 넣은 골! 세리머니 영상이 퍼졌다.' },
        fail: { effects: { happy: -3, rel: { coach: -2 } }, log: '쓸데없는 기술이라며 교체됐다.' } },
      { text: '간결하게 원터치로 푼다', effects: { football: 1, rel: { coach: 3 } },
        log: '어시스트 하나. 감독이 엄지를 들었다.' }
    ]
  });
  E({
    id: 'br_altinha', age: [18, 45], countries: ['br'], cooldown: 5,
    text: '일요일 해변, 둥글게 선 사람들이 공을 땅에 떨어뜨리지 않는 알치냐를 한다. 낯선 이가 {name}에게 공을 넘겼다.',
    effects: { happy: 3, health: 2 },
    log: '서른 번을 이어 갔다. 해 질 녘엔 다들 친구가 되어 있었다.'
  });
  E({
    id: 'br_13th_salary', age: [20, 60], countries: ['br'], cooldown: 5,
    cond: { career: 'any' },
    text: '12월, 13번째 월급이 들어왔다. {mother}[은/는] 지붕 누수 얘기를 꺼냈다가 얼른 "아니다" 하고 웃는다.',
    choices: [
      { text: '{mother}의 집 지붕을 고친다', effects: { money: -800, happy: 4, rel: { mother: 6 } },
        log: '비 오는 밤, {mother}[이/가] "이제 양동이가 필요 없다"고 문자를 보냈다.' },
      { text: '저축하고 크리스마스 선물만 산다', effects: { money: 400, rel: { family: 2 } },
        log: '조카들 선물로 장난감 세 개를 샀다.' }
    ]
  });
  E({
    id: 'br_wedding_forro', age: [24, 45], countries: ['br'], once: true,
    cond: { rel: { partner: 'yes' }, flags: ['!married'] },
    text: '결혼식 준비. {partner}[이/가] 피로연엔 밤새 포후(아코디언 춤곡) 밴드를 부르자고 한다.',
    choices: [
      { text: '밴드도 부르고 동네 전체를 초대한다', effects: { money: -2000, happy: 6, rel: { family: 5, partner: 4 } },
        log: '새벽 4시, {mother}[이/가] 마지막까지 춤을 췄다.' },
      { text: '작은 성당에서 가족만 모인다', effects: { money: -400, happy: 4, rel: { partner: 4 } },
        log: '{father}의 빈자리에 꽃 한 송이를 놓았다.' }
    ]
  });
  E({
    id: 'br_finados', age: [22, 85], countries: ['br'], cooldown: 5,
    cond: { flags: ['father_dead'] },
    text: '11월 2일 망자의 날. 가족들이 {father}의 묘에 꽃과 {localClub} 깃발을 꽂았다.',
    textVariants: [
      '11월 2일 망자의 날. 가족들이 {father}의 묘에 꽃과 {localClub} 깃발을 꽂았다.',
      '망자의 날, 묘지 입구에서 꽃을 파는 할머니가 {father}[을/를] 기억하고 있었다.',
      '올해 망자의 날에는 {localClub} 꼬마 선수들이 함께 와서 묘 앞에서 응원가를 불렀다.'
    ],
    effects: { happy: -1, rel: { family: 4 } },
    log: '누군가 {father}[이/가] 공을 닦던 모습을 흉내 내서 다들 울다 웃었다.',
    logVariants: ['누군가 {father}[이/가] 공을 닦던 모습을 흉내 내서 다들 울다 웃었다.', '촛불이 다 탈 때까지 묘지에 앉아 있었다.', '돌아오는 길, 골목에서 아이들이 맨발로 공을 차고 있었다.']
  });
  E({
    id: 'br_domino_old', age: [65, 90], countries: ['br'], cooldown: 5,
    text: '광장 나무 그늘에서 도미노 판이 벌어졌다. 옆 골목에선 손주들이 슬리퍼 골대로 펠라다를 한다.',
    effects: { happy: 4, health: 1 },
    log: '"심판 좀 봐 주세요!" 도미노는 잠시 미뤘다.'
  });
  E({
    id: 'br_retired_return', age: [33, 60], countries: ['br'], once: true,
    cond: { fb: ['retired'] },
    text: '은퇴 후 처음으로 {localClub} 흙 운동장에 섰다. 장비실엔 {father}의 이름이 적힌 낡은 사물함이 그대로 있다.',
    choices: [
      { text: '아이들을 위한 무료 축구 교실을 연다', effects: { happy: 6, fame: 2, money: -1000, rel: { family: 3 } },
        log: '첫날 아이 마흔 명이 맨발로 왔다.' },
      { text: '새 잔디 구장을 기부한다', req: { money: 20000 }, effects: { money: -20000, fame: 4, happy: 5 },
        log: '개장식 날, 구장 이름은 {father}의 이름을 땄다.' }
    ]
  });

  /* =============================================================== ARGENTINA */
  E({
    id: 'ar_asado_sunday', age: [3, 12], countries: ['ar'], cooldown: 4,
    text: '일요일 아사도. 바람막이 담 아래서 {father}[이/가] 장작불을 다루고, {name}[은/는] 빵을 굽는 임무를 맡았다.',
    effects: { happy: 4, rel: { father: 3, family: 2 } },
    log: '빵은 조금 탔지만 모두 "아사도 장인"이라며 박수를 쳤다.'
  });
  E({
    id: 'ar_mate_round', age: [9, 16], countries: ['ar'], cooldown: 4,
    text: '저녁, 난로 옆에서 마테가 한 바퀴 돈다. 마테 잔이 {name}에게 오자 {mother}[이/가] "요즘 무슨 생각 하니?" 하고 묻는다.',
    choices: [
      { text: '축구 선수가 되고 싶다고 털어놓는다', alt: { text: '좋아하는 {hobbyAct} 이야기를 털어놓는다', log: '{mother}[은/는] "그럼 엄마는 제일 큰 소리로 응원할게"라고 했다.' }, effects: { happy: 3, rel: { mother: 5 }, grit: 1 },
        log: '{mother}[은/는] "그럼 엄마는 제일 큰 소리로 응원할게"라고 했다.' },
      { text: '학교 이야기를 한다', check: { stat: 'smarts', diff: 40 },
          success: { effects: { smarts: 2, rel: { mother: 3 } }, log: '{sis1}[이/가] 숙제를 도와주겠다고 나섰다.' },
          fail: { effects: { happy: -2, rel: { mother: -1 } }, log: '말하다 보니 수학 시험 점수까지 나와 버렸다. 마테가 식는 동안 잔소리가 이어졌다.' } }
    ]
  });
  E({
    id: 'ar_baby_futbol', age: [7, 12], countries: ['ar'], cooldown: 3,
    cond: { fb: ['local'] },
    text: '7인제 꼬마 리그 결승. {localClub} 벤치 옆에서 {father}[이/가] 물병을 나르며 누구보다 크게 응원한다.',
    effects: { football: 3, happy: 3, rel: { father: 3 } },
    log: '경기 후 {father}[이/가] 장비 가방에서 몰래 사탕을 꺼내 줬다.'
  });
  E({
    id: 'ar_inferiores_list', age: [13, 17], countries: ['ar'], once: true,
    cond: { fb: ['regional', 'academy', 'youth'] },
    text: '인페리오레스(유소년부) 다음 시즌 명단이 붙었다. {name}의 이름은 있는데, 단짝의 이름이 없다.',
    choices: [
      { text: '친구와 밤새 이야기한다', effects: { rel: { friend: 5 }, happy: -1 },
        log: '친구는 "네가 내 몫까지 해"라며 축구화를 건넸다.' },
      { text: '코치에게 친구를 한 번 더 봐 달라고 한다',
        check: { stat: 'fame', diff: 20 },
        success: { effects: { rel: { coach: 2, friend: 6 } }, log: '추가 테스트 기회를 얻었다. 친구는 붙었다!' },
        fail: { effects: { rel: { coach: -2 } }, log: '"결정은 내가 한다." 코치는 단호했다.' } }
    ]
  });
  E({
    id: 'ar_cbc', age: [18, 18], countries: ['ar'], once: true,
    cond: { edu: ['high'] },
    text: '전국 시험은 없지만 대학 기초과정 {exam}[이/가] 만만치 않다. 친구들은 사설 강좌를 듣는다.',
    choices: [
      { text: '공립 도서관에서 매일 공부한다',
        check: { stat: 'smarts', diff: 50 },
        success: { effects: { smarts: 4, flags: ['ar_cbc_done', 'ar_cbc_good'] }, log: '사서 아주머니가 응원 쪽지를 끼워 줬다.' },
        fail: { effects: { smarts: 1, flags: ['ar_cbc_done'] }, log: '책상 앞에서 마테만 세 통 비웠다.' },
        schedule: { id: 'ar_cbc_result', years: 1 } },
      { text: '아르바이트와 병행한다', effects: { money: 200, smarts: 2, grit: 2, flags: ['ar_cbc_done'] },
        log: '빵집 새벽 근무 후 교과서를 폈다.',
        schedule: { id: 'ar_cbc_result', years: 1 } }
    ]
  });
  E({
    id: 'ar_cbc_result', age: [18, 20], countries: ['ar'], once: true, weight: 1,
    cond: { flags: ['ar_cbc_done'] },
    text: '기초과정 결과 발표. 게시판 앞에서 {name}[은/는] 자기 학번을 찾는다.',
    choices: [
      { text: '결과를 확인한다',
        check: { stat: 'smarts', diff: 50 },
        success: { effects: { happy: 5, smarts: 2 }, log: '통과! {mother}[이/가] 이웃에게 엠파나다를 돌렸다.' },
        fail: { effects: { happy: -3, grit: 3 }, log: '두 과목 재수강. 그래도 길은 열려 있다.' } },
      { text: '{bro}[과/와] 함께 보러 간다', effects: { rel: { bro: 4 }, happy: 2 },
        log: '{bro}[은/는] 결과보다 먼저 피자를 샀다.' }
    ]
  });
  E({
    id: 'ar_south_accent', flavour: 'football', age: [12, 16], countries: ['ar'], once: true,
    cond: { flags: ['moved_alone'] },
    text: '"펭귄 동네에서 왔냐?" 동료들이 {name}의 남쪽 말투를 흉내 낸다.',
    choices: [
      { text: '"펭귄처럼 미끄러지듯 제쳐 줄게"',
        check: { stat: 'football', diff: 50 },
        success: { effects: { football: 2, happy: 3, fx: ['newFriend'] }, log: '정말로 미끄러지듯 제쳤다. 별명이 "펭귄"이 되었고, 이젠 칭찬이다.' },
        fail: { effects: { happy: -3 }, log: '진흙에 미끄러져 넘어졌다. 웃음이 더 커졌다.' } },
      { text: '말없이 새벽 훈련을 늘린다', effects: { grit: 4, happy: -2 },
        log: '아무도 없는 운동장에서 공만 대답해 줬다.' }
    ]
  });
  E({
    id: 'ar_father_vino', age: [10, 19], countries: ['ar'], cooldown: 4,
    cond: FATHER_STRUGGLING,
    text: '경기가 끝난 뒤 {father}[이/가] 클럽 바에서 일어나지 못하고 있다. 동네 아저씨들이 걱정스러운 눈으로 {name}[을/를] 본다.',
    choices: [
      { text: '{father}[을/를] 부축해 집에 가며 이야기한다', check: { stat: 'health', diff: 40 },
          success: { effects: { rel: { father: 5 }, happy: -2, fx: ['fatherSeekHelp'] }, log: '바람 속에서 {father}[이/가] "도와줄래?"라고 말했다.' },
          fail: { effects: { health: -3, rel: { father: -2 } }, log: '무게를 못 이겨 둘이 함께 보도블록에 넘어졌다. 무릎이 까진 채로 이웃 아저씨를 불러야 했다.' } },
      { text: '{sis1}[과/와] 병원 상담을 예약한다', effects: { rel: { sis1: 5 }, flags: ['ar_clinic'] },
        log: '{sis1}[이/가] 시립병원 중독 상담 번호를 찾아 냉장고에 붙였다.',
        schedule: { id: 'ar_father_clinic', years: 1 } },
      { text: '먼저 집에 가 버린다', effects: { happy: -4 },
        log: '잠이 오지 않았다.' }
    ]
  });
  E({
    id: 'ar_father_clinic', age: [11, 25], countries: ['ar'], once: true, weight: 1,
    cond: { flags: ['ar_clinic', '!father_sober', '!father_dead'], rel: { father: 'alive' } },
    text: '시립병원 상담실. {father}[은/는] 장비 담당 점퍼를 입고 왔다. "이 옷 입을 자격을 지키고 싶어서요."',
    effects: { rel: { father: 6, sis1: 3 }, happy: 2, fx: ['fatherSeekHelp'] },
    log: '의사가 다음 상담 날짜를 적어 주었다. {father}[은/는] 그 종이를 지갑에 넣었다.'
  });
  E({
    id: 'ar_clasico', age: [17, 36], countries: ['ar'], cooldown: 3,
    cond: { fb: ['youth', 'pro'] },
    text: '{rivalClub}[과/와]의 더비. 경기장 전체가 깃발과 종이 꽃가루로 뒤덮였다. 노래가 심장 박동처럼 쿵쿵 울린다.',
    choices: [
      { text: '팬들 앞에서 프리킥을 찬다',
        check: { stat: 'football', diff: 62 },
        success: { effects: { fame: 5, happy: 5 }, log: '골망이 흔들렸다. 그 노래에 {nick}의 이름이 들어갔다.' },
        fail: { effects: { happy: -3 }, log: '벽에 맞았다. 휘파람이 쏟아졌다.' } },
      { text: '동료에게 양보한다', effects: { rel: { coach: 3, friend: 2 } },
        log: '동료가 넣고 {name}에게 달려와 안겼다.' }
    ]
  });
  E({
    id: 'ar_price_tags', age: [20, 70], countries: ['ar'], cooldown: 6,
    cond: { career: 'any' },
    text: '월급날 장 보러 갔더니 동네 가게 사장님이 가격표를 또 새로 쓰고 있다. "미안해요, 오늘 아침에 바뀌었어."',
    choices: [
      { text: '꼭 필요한 것만 미리 사 둔다', effects: { money: 150, smarts: 1 },
        log: '찬장이 파스타로 가득 찼다.' },
      { text: '사장님과 수다나 떤다', effects: { happy: 2 },
        log: '사장님이 덤으로 알파호르를 하나 줬다.' }
    ]
  });
  E({
    id: 'ar_dia_amigo', age: [15, 60], countries: ['ar'], cooldown: 4,
    cond: { rel: { friend: 'yes' } },
    text: '7월 20일 친구의 날. 휴대폰이 아침부터 축하 메시지로 쉴 새 없이 울린다. {friend}[이/가] 저녁에 마테 한잔하자고 한다.',
    effects: { happy: 4, rel: { friend: 5 } },
    log: '둘은 어릴 적 포트레로 이야기로 밤을 새웠다.'
  });
  E({
    id: 'ar_wedding', age: [24, 45], countries: ['ar'], once: true,
    cond: { rel: { partner: 'yes' }, flags: ['!married'] },
    text: '결혼식 피로연은 새벽까지 이어지는 게 기본이다. {partner}[이/가] 새벽 3시에 깜짝 가면 파티 순서를 넣자고 한다.',
    choices: [
      { text: '밤새 파티를 연다', effects: { money: -1800, happy: 6, rel: { family: 4, partner: 4 } },
        log: '해가 뜰 무렵 {mother}[이/가] 신발을 벗어 들고 춤을 췄다.' },
      { text: '아사도 한 상으로 조촐하게', effects: { money: -400, happy: 4, rel: { partner: 3, family: 2 } },
        log: '{bro}[이/가] 직접 고기를 구웠다. 최고의 결혼식이었다.' }
    ]
  });
  E({
    id: 'ar_father_bag', age: [22, 85], countries: ['ar'], once: true, // the old bag is found once
    cond: { flags: ['father_dead'] },
    text: '창고에서 {father}의 낡은 장비 가방을 찾았다. 안에는 꼬마 {name}의 첫 축구화가 고이 싸여 있었다.',
    effects: { happy: -1, rel: { family: 4 } },
    log: '형제들과 그 축구화를 {localClub} 클럽하우스에 걸기로 했다.'
  });
  E({
    id: 'ar_plaza_old', age: [65, 90], countries: ['ar'], cooldown: 5,
    text: '광장 벤치에서 마테를 마신다. 포트레로에서 공을 차는 아이들을 보며 심판 노릇을 자처한다.',
    effects: { happy: 4, health: 1 },
    log: '오프사이드 판정 하나로 아이들과 10분을 다퉜다. 즐거웠다.'
  });

  /* =============================================================== SOUTH AFRICA */
  E({
    id: 'za_heritage_braai', age: [3, 12], countries: ['za'], cooldown: 4,
    text: '유산의 날, 이웃들이 마당마다 브라이 불을 피운다. {father}[이/가] 할아버지께 배운 노래를 불러 준다.',
    effects: { happy: 4, rel: { father: 3, family: 2 } },
    log: '연기 냄새와 노랫소리가 골목 끝까지 퍼졌다.'
  });
  E({
    id: 'za_kasi_cup', age: [10, 17], countries: ['za'], cooldown: 3,
    cond: { fb: ['none', 'local', 'regional'] },
    text: '크리스마스 연휴 타운십 토너먼트. 우승 상품은 새 축구화 한 켤레와 동네 자랑거리다.',
    choices: [
      { text: '결승에서 페널티킥을 찬다',
        check: { stat: 'football', diff: 45 },
        success: { effects: { football: 2, fame: 2, happy: 5 }, log: '골! 부부젤라 소리에 귀가 멍멍했다.' },
        fail: { effects: { happy: -3, grit: 2 }, log: '크로스바. 형들이 "다음 해엔 네 거야"라며 안아 줬다.' } },
      { text: '키커를 친구에게 양보한다', effects: { rel: { friend: 4 }, happy: 2 },
        log: '친구가 넣었고, 축구화는 사이즈가 맞는 사람이 돌아가며 신기로 했다.' }
    ]
  });
  E({
    id: 'za_matric', age: [18, 18], countries: ['za'], once: true,
    cond: { edu: ['high'] },
    text: '{exam}[이/가] 한 달 남았다. 정전이 잦은 밤에도 공부는 해야 한다.',
    choices: [
      { text: '촛불 아래 친구들과 스터디 그룹을 꾸린다',
        check: { stat: 'smarts', diff: 50 },
        success: { effects: { smarts: 4, rel: { friend: 3 }, flags: ['za_matric_done', 'za_matric_good'] }, log: '서로 문제를 내며 밤을 지새웠다.' },
        fail: { effects: { smarts: 2, flags: ['za_matric_done'] }, log: '절반은 수다였다. 그래도 즐거웠다.' },
        schedule: { id: 'za_matric_results', years: 1 } },
      { text: '도서관 문 열 때 가서 닫을 때 나온다',
        check: { stat: 'grit', diff: 50 },
        success: { effects: { smarts: 4, grit: 2, flags: ['za_matric_done', 'za_matric_good'] }, log: '사서가 {name}의 자리를 맡아 줄 정도였다.' },
        fail: { effects: { smarts: 1, health: -1, flags: ['za_matric_done'] }, log: '버스비가 모자라 일주일은 걸어 다녔다.' },
        schedule: { id: 'za_matric_results', years: 1 } }
    ]
  });
  E({
    id: 'za_matric_results', age: [18, 20], countries: ['za'], once: true, weight: 1,
    cond: { flags: ['za_matric_done'] },
    text: '{exam} 결과가 신문에 실리는 날. 새벽부터 가판대 앞에 동네 아이들이 줄을 섰다. {mother}[이/가] 신문을 펼친다.',
    choices: [
      { text: '이름을 같이 찾는다',
        check: { stat: 'smarts', diff: 45 },
        success: { effects: { happy: 6, rel: { mother: 4 } }, log: '대학 진학 가능 등급! {mother}[이/가] 골목에서 춤을 췄다.' },
        fail: { effects: { happy: -2, grit: 3 }, log: '합격은 했지만 원하던 등급은 아니었다. 재시험 기회가 있다.' } },
      { text: '{sis1}에게 먼저 봐 달라고 한다', effects: { rel: { sis1: 4 }, happy: 2 },
        log: '{sis1}[은/는] 결과를 말하기 전에 꼭 안아 줬다.' }
    ]
  });
  E({
    id: 'za_click_tease', flavour: 'football', age: [12, 16], countries: ['za'], once: true,
    cond: { flags: ['moved_alone'] },
    text: '{name}[이/가] 코사어 억양으로 영어를 하자 몇몇이 따라 하며 웃는다.',
    choices: [
      { text: '코사어 흡착음 발음 강좌를 연다',
        check: { stat: 'happy', diff: 40 },
        success: { effects: { happy: 3, fx: ['newFriend'] }, log: '다들 혀를 차며 따라 하다 웃음보가 터졌다. 놀리던 녀석이 제일 열심이었다.' },
        fail: { effects: { happy: -3 }, log: '분위기가 어색해졌다. 그래도 고개는 숙이지 않았다.' } },
      { text: '훈련이 끝난 뒤 {coach}에게 사정을 털어놓는다', effects: { rel: { coach: 4 }, happy: 1 },
        log: '{coach}[은/는] "이 나라엔 공용어가 열한 개 넘게 있다. 다 우리 말이다"라고 팀에 말했다.' }
    ]
  });
  E({
    id: 'za_father_shebeen', age: [10, 19], countries: ['za'], cooldown: 4,
    cond: FATHER_STRUGGLING,
    text: '해가 진 지 한참인데 {father}[이/가] 돌아오지 않는다. 동네 술집 앞에서 장비 가방을 베고 앉아 있는 {father}[을/를] 찾았다.',
    choices: [
      { text: '함께 걸어오며 마음을 말한다', check: { stat: 'grit', diff: 40 },
          success: { effects: { rel: { father: 5 }, happy: -2, fx: ['fatherSeekHelp'] }, log: '{father}[은/는] 별을 올려다보며 "도움을 받아 보겠다"고 했다.' },
          fail: { effects: { rel: { father: -4 }, happy: -2 }, log: '"집에나 가 있어." {father}[은/는] 술집 앞 친구들에게 돌아갔다. 어두운 길을 혼자 걸어 돌아왔다.' } },
      { text: '교회 목사님께 상담을 부탁한다', effects: { rel: { mother: 3 }, flags: ['za_pastor'] },
        log: '목사님이 지역 중독 상담 모임을 소개해 주겠다고 했다.',
        schedule: { id: 'za_father_group', years: 1 } },
      { text: '{mother}에게만 조용히 알린다', effects: { rel: { mother: 3 }, happy: -2 },
        log: '{mother}[은/는] 아무 말 없이 {father}의 신발을 털어 주었다.' }
    ]
  });
  E({
    id: 'za_father_group', age: [11, 25], countries: ['za'], once: true, weight: 1,
    cond: { flags: ['za_pastor', '!father_sober', '!father_dead'], rel: { father: 'alive' } },
    text: '교회 별관의 상담 모임. {father}[은/는] 처음엔 문 앞에 서 있기만 했다. 세 번째 주, 드디어 의자에 앉았다.',
    effects: { rel: { father: 6, family: 3 }, happy: 2, fx: ['fatherSeekHelp'] },
    log: '돌아오는 길, {father}[이/가] 오랜만에 휘파람을 불었다.'
  });
  E({
    id: 'za_derby_cape', age: [17, 36], countries: ['za'], cooldown: 3,
    cond: { fb: ['youth', 'pro'] },
    text: '{rivalClub}[과/와]의 더비. 부부젤라 소리가 하늘을 덮었다. 고향 타운십에선 다들 이웃집 TV 앞에 모였을 것이다.',
    choices: [
      { text: '화려한 개인기를 보여 준다',
        check: { stat: 'football', diff: 60 },
        success: { effects: { fame: 5, happy: 4 }, log: '상대 다리 사이로 공을 넣었다! 관중석이 춤을 췄다.' },
        fail: { effects: { happy: -2, rel: { coach: -2 } }, log: '공을 뺏겨 역습을 허용했다.' } },
      { text: '팀을 위해 궂은일을 한다', effects: { grit: 3, rel: { coach: 3 } },
        log: '골은 없었지만 경기 MVP로 {name}[이/가] 뽑혔다.' }
    ]
  });
  E({
    id: 'za_loadshedding', age: [8, 60], countries: ['za'], cooldown: 6,
    text: '계획 정전 시간이 되자 온 집 안이 깜깜해졌다. 가족들이 촛불 하나를 가운데 두고 둘러앉는다.',
    effects: { happy: 2, rel: { family: 3 } },
    log: '{bro}[이/가] 옛날 이야기를 시작했고, 아무도 휴대폰을 찾지 않았다.'
  });
  E({
    id: 'za_taxi_commute', age: [20, 60], countries: ['za'], cooldown: 5,
    cond: { career: 'any' },
    text: '출근길 미니버스 택시. 앞자리 손님에게 요금을 건네면 손에서 손으로 운전석까지 전달되고, 거스름돈도 그렇게 돌아온다.',
    choices: [
      { text: '돈 계산 담당을 자청한다',
        check: { stat: 'smarts', diff: 35 },
        success: { effects: { happy: 2, smarts: 1 }, log: '열네 명분 거스름돈을 완벽히 계산했다. 운전사가 엄지를 들었다.' },
        fail: { effects: { money: -5 }, log: '계산이 꼬여 내 돈으로 메웠다.' } },
      { text: '창밖을 보며 음악을 듣는다', effects: { happy: 2 },
        log: '라디오에서 흘러나온 노래에 버스 전체가 따라 불렀다.' }
    ]
  });
  E({
    id: 'za_lobola', age: [24, 45], countries: ['za'], once: true,
    cond: { rel: { partner: 'yes' }, flags: ['!married'] },
    text: '결혼을 앞두고 양가 어른들이 로볼라(혼인 예물) 협의를 위해 모였다. {bro}[이/가] 집안 대표로 넥타이를 맸다.',
    choices: [
      { text: '어른들의 전통을 존중하며 따른다', effects: { money: -1500, rel: { family: 5, partner: 4 }, happy: 3 },
        log: '협의가 끝나자 양가가 함께 노래하며 춤을 췄다.' },
      { text: '{partner}[과/와] 함께 의견을 내본다',
        check: { stat: 'smarts', diff: 45 },
        success: { effects: { money: -800, rel: { partner: 6 }, happy: 3 }, log: '어른들이 "요즘 젊은이들 지혜롭다"며 고개를 끄덕였다.' },
        fail: { effects: { money: -1500, rel: { family: -2 } }, log: '{bro}[이/가] 조용히 팔꿈치로 찔렀다. 다음부터는 듣기만 하기로.' } }
    ]
  });
  E({
    id: 'za_unveiling', age: [22, 85], countries: ['za'], once: true,
    cond: { flags: ['father_dead'] },
    text: '{father}의 묘비 제막식. 온 동네 사람들이 모여 노래하고, {localClub} 아이들이 유니폼을 입고 줄지어 섰다.',
    effects: { happy: -1, rel: { family: 5 }, grit: 2 },
    log: '묘비에는 "공원과 아이들의 정원사"라고 새겨졌다.'
  });
  E({
    id: 'za_stokvel', age: [35, 85], countries: ['za'], cooldown: 6,
    cond: { rel: { mother: 'alive' } },
    text: '{mother}[이/가] 동네 아주머니들과 수십 년째 이어 온 계모임(스토크벨) 연말 잔치에 초대받았다.',
    choices: [
      { text: '잔치 음식을 통째로 대접한다', effects: { money: -500, rel: { mother: 6 }, happy: 3 },
        log: '아주머니들이 "{mother}의 막내는 보물"이라고 노래를 지어 불렀다.' },
      { text: '설거지 담당을 자청한다', effects: { rel: { mother: 4 }, happy: 2 },
        log: '접시가 백 개였다. 그래도 웃음소리에 시간이 금방 갔다.' }
    ]
  });
  E({
    id: 'za_youth_day', age: [14, 25], countries: ['za'], cooldown: 5,
    text: '6월 16일 청소년의 날. 학교에서 1976년 교육 평등을 외친 학생들의 이야기를 듣는다. 그들도 지금의 {name} 또래였다.',
    effects: { smarts: 2, grit: 2 },
    log: '집에 와서 {father}에게 그 시절 이야기를 물었다. {father}[은/는] 오래 말했다.'
  });

  /* =============================================================== INDIA */
  E({
    id: 'in_goa_christmas', age: [3, 12], countries: ['in'], cooldown: 4,
    text: '크리스마스 준비. {mother}[이/가] 이웃들과 비빙카를 굽고, {father}[은/는] 대나무와 색종이로 커다란 별 등을 만든다.',
    effects: { happy: 4, rel: { family: 3 } },
    log: '별 등을 다는 날, {name}[은/는] {father}의 어깨 위에 올라갔다.'
  });
  E({
    id: 'in_monsoon_football', age: [6, 13], countries: ['in'], cooldown: 3,
    cond: { fb: ['none', 'local'] },
    text: '몬순 비가 쏟아지는 논두렁 옆 공터. 공이 흙탕물에 멈출 때마다 아이들이 비명을 지르며 웃는다.',
    effects: { football: 3, happy: 3, health: -1 },
    log: '{mother}[이/가] 흙투성이 옷을 보고 한숨을 쉬다 결국 웃었다.'
  });
  E({
    id: 'in_board10', age: [15, 16], countries: ['in'], once: true,
    cond: { edu: ['middle', 'high'] },
    text: '10학년 보드시험 시즌. 집안 어른들이 모일 때마다 "몇 퍼센트 나올 것 같니?"가 첫 인사다.',
    choices: [
      { text: '저녁 과외(튜션)를 다닌다', effects: { money: -200, smarts: 4, happy: -2 },
        log: '{sis1}[이/가] 자기 월급에서 과외비를 보탰다.' },
      { text: '{sis2}의 노트로 독학한다',
        check: { stat: 'smarts', diff: 50 },
        success: { effects: { smarts: 4, rel: { sis2: 3 }, flags: ['in_board_done', 'in_board_good'] }, log: '{sis2}의 노트엔 별표가 빼곡했다.' },
        fail: { effects: { smarts: 2, flags: ['in_board_done'] }, log: '노트 글씨를 해독하는 데만 한 달이 걸렸다.' },
        schedule: { id: 'in_board_result', years: 1 } },
      { text: '훈련 시간은 절대 줄이지 않는다', effects: { football: 3, smarts: -1, rel: { mother: -2 } },
        log: '{mother}[이/가] 문제집을 축구 가방 안에 몰래 넣어 두었다.' }
    ]
  });
  E({
    id: 'in_board_result', age: [16, 17], countries: ['in'], once: true, weight: 1,
    cond: { flags: ['in_board_done'] },
    text: '보드시험 결과 발표. 동네 사이버 카페 앞에 학생들이 몰렸다. 접속이 자꾸 끊긴다.',
    choices: [
      { text: '끝까지 새로고침한다',
        check: { stat: 'smarts', diff: 50 },
        success: { effects: { happy: 6, smarts: 1, rel: { family: 3 } }, log: '90퍼센트! {mother}[이/가] 성당에 초를 켜러 갔다.' },
        fail: { effects: { happy: -2, grit: 2 }, log: '기대보다 낮았다. {father}[이/가] "다음이 있다"고 등을 두드렸다.' } },
      { text: '결과는 내일 보고 오늘은 해변에 간다', effects: { happy: 3 },
        log: '파도 앞에서는 퍼센트가 중요하지 않았다.' }
    ]
  });
  E({
    id: 'in_coaching_city', age: [17, 18], countries: ['in'], once: true,
    cond: { edu: ['high'], fb: ['none', 'local', 'regional'] },
    text: '반 친구들이 공대·의대 입시 코칭센터가 모인 도시로 떠난다. {mother}[이/가] 모아 둔 돈 봉투를 꺼냈다.',
    choices: [
      { text: '코칭센터에 간다', effects: { money: -1000, smarts: 5, happy: -3, flags: ['in_coaching'] },
        log: '하루 열네 시간 수업. 밤마다 집에 전화했다.' },
      { text: '집에서 온라인 강의로 한다',
        check: { stat: 'grit', diff: 50 },
        success: { effects: { smarts: 4, rel: { mother: 3 } }, log: '봉투는 {mother}에게 돌려 드렸다.' },
        fail: { effects: { smarts: 1 }, log: '정전과 인터넷 끊김에 진도가 밀렸다.' } },
      { text: '축구 쪽 길을 택한다', effects: { football: 3, grit: 2 },
        log: '{mother}[은/는] 봉투로 축구화 두 켤레를 사 주었다.' }
    ]
  });
  E({
    id: 'in_language_tease', flavour: 'football', age: [12, 16], countries: ['in'], once: true,
    cond: { flags: ['moved_alone'] },
    text: '동료들이 벵골어로 농담을 주고받다 {name}[을/를] 보며 웃는다. 콘칸어 억양의 힌디어도 놀림거리가 됐다.',
    choices: [
      { text: '벵골어를 배우기 시작한다',
        check: { stat: 'smarts', diff: 40 },
        success: { effects: { smarts: 2, happy: 3, fx: ['newFriend'] }, log: '첫 벵골어 농담에 라커룸이 뒤집어졌다. 이제 "우리 고아 동생"이다.' },
        fail: { effects: { happy: -2, smarts: 1 }, log: '발음을 틀려 더 웃음을 샀다. 그래도 계속하기로 했다.' } },
      { text: '그라운드에서 답한다', effects: { football: 2, grit: 3, happy: -1 },
        log: '골을 넣고 아무 말 없이 고향 쪽 하늘을 가리켰다.' }
    ]
  });
  E({
    id: 'in_father_feni', age: [10, 19], countries: ['in'], cooldown: 4,
    cond: FATHER_STRUGGLING,
    text: '{father}[이/가] 장비 정리를 하다 말고 페니 병을 기울이고 있다. 오늘 아침에도 공원 일을 나가지 못했다.',
    choices: [
      { text: '{father} 곁에 앉아 진심을 말한다', check: { stat: 'social', diff: 45 },
          success: { effects: { rel: { father: 5 }, happy: -2, fx: ['fatherSeekHelp'] }, log: '{father}[은/는] 오래 침묵하다 "내일 같이 병원에 가 보자"고 했다.' },
          fail: { effects: { rel: { father: -4 }, happy: -3 }, log: '{father}[이/가] 병을 쾅 내려놓았다. "네가 이 집 가장이냐?" 그 말이 한동안 귀에서 떠나지 않았다.' } },
      { text: '본당 신부님께 도움을 청한다', effects: { rel: { mother: 3 }, flags: ['in_parish_help'] },
        log: '신부님이 마르가오의 회복 모임을 알아봐 주겠다고 했다.',
        schedule: { id: 'in_father_recovery', years: 1 } },
      { text: '{sis1}에게 하소연한다', effects: { rel: { sis1: 4 }, happy: -1 },
        log: '{sis1}[은/는] "넌 아직 아이야. 이건 어른들이 같이 짊어질 일"이라고 했다.' }
    ]
  });
  E({
    id: 'in_father_recovery', age: [11, 25], countries: ['in'], once: true, weight: 1,
    cond: { flags: ['in_parish_help', '!father_sober', '!father_dead'], rel: { father: 'alive' } },
    text: '성당 별관의 회복 모임. {father}[은/는] 맨 뒷자리에 앉았지만 끝까지 자리를 지켰다.',
    effects: { rel: { father: 6, family: 3 }, happy: 2, fx: ['fatherSeekHelp'] },
    log: '모임이 끝나자 {father}[이/가] 신부님과 오래 악수를 나눴다.'
  });
  E({
    id: 'in_derby', age: [17, 36], countries: ['in'], cooldown: 3,
    cond: { fb: ['youth', 'pro'] },
    text: '{rivalClub}[과/와]의 경기. 관중석 6만 명이 휴대폰 불빛을 흔든다. 고향 마을에선 성당 마당에 스크린을 걸었다고 한다.',
    choices: [
      { text: '빗속에서 과감하게 슈팅한다',
        check: { stat: 'football', diff: 60 },
        success: { effects: { fame: 5, happy: 4 }, log: '골! 고향 성당 종이 울렸다는 소식을 들었다.' },
        fail: { effects: { happy: -3 }, log: '진흙에 미끄러져 기회를 놓쳤다.' } },
      { text: '경기 후 원정 팬들과 사진을 찍는다', effects: { fame: 2, happy: 2 },
        log: '고향 사투리로 인사하자 팬들이 환호했다.' }
    ]
  });
  E({
    id: 'in_aunty_match', age: [25, 36], countries: ['in'], cooldown: 4,
    cond: { flags: ['!married'], rel: { partner: 'no' } },
    text: '결혼식에 갈 때마다 이모들이 다가온다. "좋은 사람 있는데, 한번 만나 볼래?"',
    choices: [
      { text: '한번 만나 본다', check: { stat: 'looks', diff: 40 },
        success: { effects: { happy: 4, fx: ['newPartner'] }, log: '어색한 차 한잔이 세 시간짜리 산책이 되었다.' },
        fail: { effects: { happy: -1 }, log: '서로 크리켓 이야기만 하다 헤어졌다.' } },
      { text: '"인연은 제가 찾을게요" 웃으며 사양한다', effects: { happy: 1 },
        log: '이모들은 "다음 결혼식에서 보자"며 물러났다.' }
    ]
  });
  E({
    id: 'in_goa_wedding', age: [24, 45], countries: ['in'], once: true,
    cond: { rel: { partner: 'yes' }, flags: ['!married'] },
    text: '결혼 준비. 성당 예식 뒤 밤새 이어지는 피로연 댄스가 고향의 자랑이다. {mother}[은/는] 벌써 밴드를 알아보고 있다.',
    choices: [
      { text: '마을 전체를 초대한다', effects: { money: -1500, happy: 6, rel: { family: 5, partner: 4 } },
        log: '새벽까지 밴드가 연주했다. {mother}[이/가] 제일 먼저 무대에 나갔다.' },
      { text: '가까운 사람들만 초대한다', effects: { money: -400, happy: 4, rel: { partner: 4 } },
        log: '바닷가 작은 성당에서 촛불이 흔들렸다.' }
    ]
  });
  E({
    id: 'in_mother_feast', age: [38, 70], countries: ['in'], cooldown: 6,
    cond: { rel: { mother: 'alive' } },
    text: '마을 성당 축일. 나이 든 {mother}[이/가] 여전히 부엌 봉사를 하겠다고 고집한다.',
    choices: [
      { text: '내려가서 같이 부엌을 지킨다', effects: { money: -300, happy: 3, rel: { mother: 6 } },
        log: '{mother}[은/는] 모두에게 "우리 막내가 카레를 젓는다"고 자랑했다.' },
      { text: '봉사팀에 기부금을 보낸다', effects: { money: -500, rel: { mother: 3 }, fame: 1 },
        log: '{mother}[이/가] "다음엔 얼굴도 같이 보내라"고 답장했다.' }
    ]
  });
  E({
    id: 'in_all_souls', age: [22, 85], countries: ['in'], cooldown: 5,
    cond: { flags: ['father_dead'] },
    text: '위령의 날, 마을 묘지가 촛불로 환하다. 가족들이 {father}의 묘에 화환과 작은 축구공을 놓았다.',
    textVariants: [
      '위령의 날, 마을 묘지가 촛불로 환하다. 가족들이 {father}의 묘에 화환과 작은 축구공을 놓았다.',
      '위령의 날 미사가 끝나고, 성당 마당에서 {father}[을/를] 기억하는 이웃들과 이야기를 나눴다.',
      '올해 위령의 날에는 아이들이 {father}의 묘에 직접 그린 그림을 놓았다.'
    ],
    effects: { happy: -1, rel: { family: 4 } },
    log: '"아버지는 공원 꽃을 이렇게 가꾸셨지"라며 화환을 다듬었다.',
    logVariants: ['"아버지는 공원 꽃을 이렇게 가꾸셨지"라며 화환을 다듬었다.', '촛불 하나를 더 켜고 한참을 서 있었다.', '돌아오는 길에 바닷가에 들러 노을을 봤다.']
  });
  E({
    id: 'in_old_beach', age: [62, 90], countries: ['in'], cooldown: 5,
    text: '오후의 고향 해변. 야자수 그늘 아래 차이를 마시며 어부들이 그물을 끌어올리는 모습을 본다.',
    effects: { happy: 4, health: 2 },
    log: '해변 축구를 하던 아이들이 공을 차 달라며 손을 흔들었다.'
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
