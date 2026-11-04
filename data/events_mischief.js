/* 악동 (mischief) decisions: pranks, lies, fights, theft, cheating, drinking, crime and stubborn old age.
 * Every event offers one risky (악동) option decided by a check and at least one safe option. */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};
  RA.data.events = RA.data.events || [];
  RA.data.events.push(
    // ---------------------------------------------------------------- childhood 5-12

    // ---------------------------------------------------------------- teens 13-19
    { id: 'mis_smoke_try', age: [13, 17], once: true, decision: true, cond: { edu: ['middle', 'high'] },
      text: '학교 뒤 창고, 선배가 담배를 내민다. "한 번만 펴 봐."',
      choices: [
        { text: '받아서 피운다', risky: true, check: { odds: 0.6 },
          success: { effects: { social: 3, health: -2, mischief: 4, flags: ['smoker'] }, log: '콜록거렸지만 선배들이 어깨를 쳐 줬다. 끊기가 더 어렵다는 건 나중에 알았다.' },
          fail: { effects: { health: -2, happy: -3, mischief: 4, rep: -4, flags: ['smoker'], fx: ['suspend'] }, log: '학생부 선생님이 창고 문을 열었다. 정학이다.' } },
        { text: '"건강은 지켜야죠" 거절한다', effects: { health: 1, social: -1 }, log: '선배가 피식 웃었다. 담배 연기를 피해 밖으로 나왔다.' }
      ] },
    { id: 'mis_teen_drink', age: [15, 18], cooldown: 3,
      text: '{friend}네 부모님이 여행을 갔다. 냉장고에 맥주가 가득하다.',
      choices: [
        { text: '오늘은 어른처럼 마신다', risky: true, check: { odds: 0.55 },
          success: { effects: { happy: 5, social: 3, alcohol: 5, mischief: 4, rel: { friend: 4 } }, log: '다 같이 노래를 부르다 잠들었다. 다음 날 머리가 깨질 것 같았다.' },
          fail: { effects: { health: -3, happy: -3, alcohol: 5, mischief: 4, rep: -3, rel: { mother: -6 } }, log: '토하고 쓰러진 걸 {friend}[이/가] 집까지 업어다 줬다. 정신이 들자 부끄러워 고개를 들 수 없었다.' } },
        { text: '콜라로 건배한다', effects: { social: 1, health: 1 }, log: '맨정신이라 친구들의 흑역사를 전부 기억하게 됐다.' }
      ] },
    { id: 'mis_exam_cheat', age: [13, 18], cooldown: 3, cond: { edu: ['middle', 'high'] }, decision: true,
      text: '중간고사 전날. 커닝 페이퍼를 손바닥만 하게 접을 수 있을 것 같다.',
      choices: [
        { text: '커닝 페이퍼를 만든다', risky: true, check: { stat: 'smarts', diff: 50 },
          success: { effects: { happy: 4, smarts: 1, mischief: 4 }, log: '안 들켰다. 아이러니하게도 만들면서 다 외웠다.' },
          fail: { effects: { happy: -5, mischief: 4, rep: -5, fx: ['suspend'] }, log: '감독 선생님이 손바닥을 펴 보라고 했다. 0점에 정학.' } },
        { text: '밤새 공부한다', effects: { smarts: 3, health: -1 }, log: '눈이 퉁퉁 부었지만 점수는 정직했다.' }
      ] },
    { id: 'mis_skip_school', age: [13, 18], cooldown: 3, cond: { edu: ['middle', 'high'] }, decision: true,
      text: '하늘이 너무 맑다. 친구들이 학교 대신 바닷가로 가자고 한다.',
      choices: [
        { text: '담을 넘는다', risky: true, check: { odds: 0.6 },
          success: { effects: { happy: 6, social: 2, mischief: 3 }, log: '파도에 신발까지 젖었다. 인생 최고의 하루였다.' },
          fail: { effects: { happy: -2, smarts: -1, mischief: 3, rep: -2, rel: { mother: -5 } }, log: '담임 선생님이 바닷가 사진을 단톡방에 올렸다. 우리 사진이었다.' } },
        { text: '수업에 들어간다', effects: { smarts: 1 }, log: '창밖을 보며 한숨만 쉬었다.' }
      ] },
    { id: 'mis_pc_bang_year', age: [14, 18], once: true, cond: { edu: ['middle', 'high'], traits: { mischief: [25, 100] } },
      text: '요즘 학교보다 PC방에 있는 시간이 더 길다. 출석부가 위험하다.',
      choices: [
        { text: '출석만 대충 채우고 계속 논다', risky: true, check: { odds: 0.4 },
          success: { effects: { happy: 6, social: 2, mischief: 4 }, log: '아슬아슬하게 출석 일수를 맞췄다. 랭킹은 전교 1등이었다.' },
          fail: { effects: { happy: -6, smarts: -2, mischief: 4, rel: { mother: -8 }, fx: ['holdBack'] }, log: '출석 일수 미달. 유급 통지서가 집으로 날아왔다.' } },
        { text: '게임을 끊고 학교로 돌아간다', effects: { smarts: 2, happy: -2, grit: 2, mischief: -3 }, log: '첫 주는 지옥이었다. 둘째 주부터는 견딜 만했다.' }
      ] },
    { id: 'mis_school_fight', age: [13, 18], cooldown: 4, cond: { edu: ['middle', 'high'] }, decision: true,
      text: '복도에서 일진이 후배의 돈을 뺏고 있다.',
      choices: [
        { text: '어깨를 잡아 돌려세운다', risky: true, check: { stat: 'grit', diff: 50 },
          success: { effects: { social: 3, fame: 2, rep: 3, mischief: 5 }, log: '주먹 한 번에 상황 끝. 후배가 매일 음료수를 사 왔다.' },
          fail: { effects: { health: -6, happy: -4, mischief: 5, rep: -3, fx: ['suspend'] }, log: '눈두덩이가 시퍼렇게 부었다. 싸움 양쪽 모두 정학.' } },
        { text: '선생님께 알린다', effects: { rep: 2, social: -1 }, log: '일진은 징계를 받았다. 나는 한동안 눈치를 봤다.' }
      ] },
    { id: 'mis_shoplift_dare', age: [13, 17], cooldown: 5,
      text: '친구들이 편의점에서 누가 더 많이 들고 나오나 내기를 하자고 한다.',
      choices: [
        { text: '도전한다', risky: true, check: { odds: 0.6 },
          success: { effects: { happy: 4, social: 3, mischief: 6 }, log: '삼각김밥 세 개. 친구들이 박수를 쳤다. 맛은 이상하게 별로였다.' },
          fail: { effects: { happy: -5, mischief: 6, rep: -6, record: 1, rel: { mother: -6 } }, log: 'CCTV에 얼굴이 정면으로 찍혔다. 경찰서에서 무슨 일이 있었는지 설명해야 했다.' } },
        { text: '"난 빠질게" 돌아선다', effects: { rep: 1, social: -1 }, log: '겁쟁이 소리를 들었지만 다리 뻗고 잤다.' }
      ] },
    { id: 'mis_fake_id', age: [17, 19], cooldown: 3,
      text: '친구가 위조 신분증을 구해 왔다. 오늘 밤 클럽에 가자고 한다.',
      choices: [
        { text: '같이 줄을 선다', risky: true, check: { odds: 0.5 },
          success: { effects: { happy: 6, social: 4, alcohol: 3, mischief: 4 }, log: '입구를 통과했다. 음악이 심장을 두드렸다.' },
          fail: { effects: { happy: -3, mischief: 4, rep: -4, record: 1 }, log: '경비원이 신분증을 불빛에 비춰 보더니 경찰을 불렀다.' } },
        { text: '노래방으로 간다', effects: { happy: 2, social: 1 }, log: '목이 쉬도록 불렀다. 합법적인 밤이었다.' }
      ] },
    { id: 'mis_no_license', age: [16, 19], cooldown: 4, decision: true,
      text: '선배가 오토바이 열쇠를 던져 준다. 면허는 없다.',
      choices: [
        { text: '시동을 건다', risky: true, check: { stat: 'grit', diff: 45 },
          success: { effects: { happy: 6, fame: 1, mischief: 5 }, log: '해안 도로를 한 바퀴 돌았다. 바람이 미친 듯이 시원했다.' },
          fail: { effects: { health: -10, happy: -4, mischief: 5, rep: -4, record: 1 }, log: '커브에서 미끄러졌다. 깁스를 한 채 무면허 조사를 받았다.' } },
        { text: '열쇠를 돌려준다', effects: { health: 1 }, log: '"재미없는 녀석." 무릎은 무사했다.' }
      ] },
    { id: 'mis_teen_runaway', age: [14, 18], once: true, decision: true,
      text: '집이 숨 막힌다. 모아 둔 돈으로 {bigcity}까지 갈 수 있을 것 같다.',
      choices: [
        { text: '짐을 싸서 {bigcity}[으로/로] 떠난다', risky: true, check: { odds: 0.35 },
          success: { effects: { grit: 4, happy: 3, social: 2, mischief: 6, flags: ['ran_away'] }, log: '찜질방에서 사흘을 버텼다. 돌아왔을 때 조금은 어른이 된 기분이었다.' },
          fail: { effects: { health: -3, happy: -6, money: -100, mischief: 6, rel: { mother: -10 }, flags: ['ran_away'] }, log: '첫날 지갑을 잃어버렸다. 경찰차를 타고 집에 돌아왔다.' } },
        { text: '{friend}네서 하룻밤 자고 온다', effects: { happy: 2, rel: { friend: 3, mother: -2 } }, log: '밤새 털어놓고 나니 조금 살 것 같았다.' }
      ] },
    { id: 'mis_hack_grades', age: [15, 18], once: true, cond: { edu: ['high'], traits: { mischief: [30, 100] } }, decision: true,
      text: '교무실 컴퓨터가 로그인된 채 켜져 있다. 성적 입력 창이 보인다.',
      choices: [
        { text: '점수를 살짝 올린다', risky: true, check: { stat: 'smarts', diff: 60 },
          success: { effects: { happy: 5, mischief: 6 }, log: '흔적 없이 빠져나왔다. 손이 떨려서 한참 화장실에 있었다.' },
          fail: { effects: { happy: -8, mischief: 6, rep: -8, record: 1, fx: ['expel'] }, log: '로그 기록이 남았다. 퇴학 처분이 내려졌다.' } },
        { text: '모니터를 끄고 나온다', effects: { rep: 1, smarts: 1 }, log: '다음 날 선생님이 "누가 꺼 줬지? 고맙네" 했다.' }
      ] },
    { id: 'mis_homework_copy', age: [13, 19], cooldown: 3, cond: { rel: { friend: 'yes' }, edu: ['middle', 'high'] },
      text: '숙제를 안 했다. {friend}의 공책이 가방에서 삐죽 나와 있다.',
      choices: [
        { text: '몰래 꺼내 베낀다', risky: true, check: { odds: 0.6 },
          success: { effects: { happy: 3, mischief: 3 }, log: '쉬는 시간 10분 만에 끝냈다. 글씨체만 들키지 않으면 된다.' },
          fail: { effects: { happy: -3, mischief: 3, rep: -2, rel: { friend: -6 } }, log: '{friend}[이/가] 돌아와 공책을 낚아챘다. "말을 하지 그랬어."' } },
        { text: '부탁하고 빌린다', effects: { social: 1, rel: { friend: 2 } }, log: '"떡볶이 한 번." 거래가 성사됐다.' }
      ] },
    { id: 'mis_lie_concert', age: [14, 18], once: true, decision: true, cond: { rel: { mother: 'alive' } },
      text: '{bigcity}에서 꿈의 콘서트가 열린다. 엄마는 절대 안 된다고 했다.',
      choices: [
        { text: '"독서실에서 밤샐게요" 하고 간다', risky: true, check: { odds: 0.65 },
          success: { effects: { happy: 7, social: 2, mischief: 4, flags: ['lie_concert'] }, log: '맨 앞줄에서 목이 쉬도록 소리 질렀다. 완벽 범죄였다… 아마도.', schedule: { id: 'mis_lie_found', years: 2 } },
          fail: { effects: { happy: -4, mischief: 4, rel: { mother: -8 } }, log: '독서실 사장님이 엄마 친구였다. 터미널에서 붙잡혔다.' } },
        { text: '집에서 생중계를 본다', effects: { happy: 1, rel: { mother: 2 } }, log: '엄마가 치킨을 시켜 줬다. 나쁘지 않았다.' }
      ] },
    { id: 'mis_lie_found', age: [15, 25], once: true, weight: 1, cond: { flags: ['lie_concert'], rel: { mother: 'alive' } },
      text: '엄마가 휴대폰을 내민다. 몰래 갔던 콘서트 맨 앞줄 사진에 내 얼굴이 크게 찍혀 있다.',
      choices: [
        { text: '"그거… 저 맞아요" 사과한다', effects: { happy: -1, rep: 1, rel: { mother: 3 }, unflags: ['lie_concert'] }, log: '엄마가 한참 웃더니 "재밌었니?" 물었다.' },
        { text: '닮은 사람이라고 끝까지 우긴다', risky: true, check: { stat: 'social', diff: 50 },
          success: { effects: { happy: 2, mischief: 3, unflags: ['lie_concert'] }, log: '엄마는 고개를 갸웃했지만 넘어갔다. 거짓말 실력만 늘었다.' },
          fail: { effects: { happy: -3, mischief: 3, rep: -3, rel: { mother: -8 }, unflags: ['lie_concert'] }, log: '사진 속 티셔츠가 지금 입고 있는 그 티셔츠였다.' } }
      ] },
    { id: 'mis_exam_leak', age: [16, 18], once: true, cond: { edu: ['high'] }, decision: true,
      text: '반에 기말고사 답안지 사진이 돈다는 소문이 있다. 한 장에 50.',
      choices: [
        { text: '산다', risky: true, check: { odds: 0.55 },
          success: { effects: { happy: 4, money: -50, mischief: 5, flags: ['bought_leak'] }, log: '시험은 술술 풀렸다. 다만 그 사진을 산 사람이 너무 많았다.', schedule: { id: 'mis_exam_leak_found', years: 1 } },
          fail: { effects: { happy: -2, money: -50, mischief: 5 }, log: '받고 보니 작년 답안지였다. 돈만 날렸다.' } },
        { text: '안 산다', effects: { smarts: 2, rep: 1 }, log: '정직하게 시험을 봤다. 반 평균이 수상하게 높았다.' }
      ] },
    { id: 'mis_exam_leak_found', age: [17, 19], once: true, weight: 1, cond: { flags: ['bought_leak'], edu: ['high'] },
      text: '답안지 유출 사건이 터졌다. 학생부에서 구매자 명단을 추적하고 있다.',
      choices: [
        { text: '먼저 찾아가 자수한다', effects: { happy: -4, rep: -2, fx: ['suspend'], unflags: ['bought_leak'] }, log: '정학을 받았지만 자수한 덕에 거기서 끝났다.' },
        { text: '휴대폰을 초기화하고 버틴다', risky: true, check: { odds: 0.5 },
          success: { effects: { happy: 2, mischief: 5, unflags: ['bought_leak'] }, log: '명단에서 이름이 빠졌다. 한동안 학생부 앞을 돌아서 다녔다.' },
          fail: { effects: { happy: -8, mischief: 5, rep: -8, fx: ['expel'], unflags: ['bought_leak'] }, log: '송금 기록이 남아 있었다. 퇴학이다.' } }
      ] },
    { id: 'mis_gang_invite', age: [16, 30], once: true, cond: { traits: { mischief: [40, 100] } }, decision: true,
      text: '동네 형들이 "너 배짱 있더라"며 자기 조직에 들어오라고 한다.',
      choices: [
        { text: '첫 심부름을 맡는다', risky: true, check: { odds: 0.5 },
          success: { effects: { money: 3000, happy: 3, mischief: 8, rep: -3 }, log: '봉투 하나 옮기고 두툼한 돈을 받았다. 무엇을 옮겼는지는 묻지 않았다.' },
          fail: { effects: { mischief: 8, rep: -8, fx: ['jail'] }, log: '봉투를 받는 순간 사복 경찰이 다가왔다.' } },
        { text: '"전 안 할게요" 거절한다', effects: { rep: 2, grit: 1 }, log: '형들이 혀를 찼다. 그 뒤로 그 골목은 돌아서 다녔다.' }
      ] },

    // ---------------------------------------------------------------- football
    { id: 'mis_fb_headbutt', age: [14, 36], cooldown: 4, cond: { fb: ['academy', 'youth', 'pro'] }, decision: true,
      text: '상대 수비수가 경기 내내 발을 밟고 귓속말로 도발한다.',
      choices: [
        { text: '심판 안 볼 때 되갚아 준다', risky: true, check: { odds: 0.4 },
          success: { effects: { happy: 3, fame: 2, mischief: 5 }, log: '수비수가 조용해졌다. 그 뒤로 골문까지 길이 열렸다.' },
          fail: { effects: { happy: -4, rep: -5, mischief: 5, rel: { coach: -6 }, fx: ['fbBan'] }, log: '중계 카메라가 다 잡았다. 퇴장에 출전 정지 징계까지.' } },
        { text: '골로 대답한다', effects: { grit: 2, rel: { coach: 3 } }, log: '골은 못 넣었지만 끝까지 냉정했다. 감독이 엄지를 들었다.' }
      ] },
    { id: 'mis_fb_curfew', age: [16, 34], cooldown: 4, cond: { fb: ['academy', 'youth', 'pro'] },
      text: '경기 이틀 전, 동료들이 숙소 통금을 넘어 몰래 클럽에 가자고 한다.',
      choices: [
        { text: '창문으로 빠져나간다', risky: true, check: { odds: 0.55 },
          success: { effects: { happy: 6, social: 3, alcohol: 3, mischief: 4 }, log: '새벽에 무사히 복귀. 경기에선 다리가 조금 무거웠다.' },
          fail: { effects: { happy: -3, rep: -4, alcohol: 3, mischief: 4, rel: { coach: -8 }, fx: ['fbBan'] }, log: '다음 날 SNS에 클럽 사진이 올라왔다. 구단 자체 징계를 받았다.' } },
        { text: '방에서 회복 훈련을 한다', effects: { football: 1, health: 1 }, log: '경기 당일 팀에서 제일 쌩쌩했다.' }
      ] },
    { id: 'mis_fb_ref_rage', age: [16, 38], cooldown: 4, cond: { fb: ['youth', 'pro'] },
      text: '명백한 페널티인데 심판이 휘슬을 불지 않는다.',
      choices: [
        { text: '심판에게 달려가 거칠게 항의한다', risky: true, check: { odds: 0.35 },
          success: { effects: { happy: 4, fame: 3, mischief: 4 }, log: 'VAR 판독 끝에 판정이 번복됐다. 관중석이 들끓었다.' },
          fail: { effects: { happy: -3, rep: -4, mischief: 4, fx: ['fbBan'] }, log: '레드카드. 징계위원회는 세 경기 출전 정지를 내렸다.' } },
        { text: '주장에게 맡긴다', effects: { grit: 1 }, log: '판정은 그대로였다. 대신 경고도 없었다.' }
      ] },
    { id: 'mis_fb_match_fix', age: [20, 36], once: true, cond: { fb: ['pro'] }, decision: true,
      text: '낯선 남자가 "다음 경기 전반에만 조용히 있어 달라"며 큰돈을 제안한다.',
      choices: [
        { text: '받아들인다', risky: true, check: { odds: 0.5 },
          success: { effects: { money: 50000, mischief: 8, happy: -2 }, log: '돈은 들어왔다. 그날 이후 골망을 흔들어도 기쁘지 않았다.' },
          fail: { effects: { fame: -10, rep: -15, mischief: 8, fx: ['fbBan', 'jail'] }, log: '승부조작 수사가 시작됐다. 축구계가 등을 돌렸다.' } },
        { text: '구단에 신고한다', effects: { rep: 5, fame: 2 }, log: '협회가 조사에 나섰다. 정직한 선수라는 기사가 실렸다.' }
      ] },

    // ---------------------------------------------------------------- adults 20-59
    { id: 'mis_drunk_drive', age: [20, 70], cooldown: 5, decision: true,
      text: '술자리가 끝났다. 대신 운전해 줄 사람은 한 시간 뒤에나 온단다. 집까지는 고작 10분.',
      choices: [
        { text: '직접 운전한다', risky: true, check: { odds: 0.7 },
          success: { effects: { money: 40, alcohol: 3, mischief: 5 }, log: '무사히 도착했다. 운이었다는 걸 알면서도 다음이 무서웠다.' },
          fail: { effects: { health: -8, alcohol: 3, rep: -10, mischief: 5, fx: ['jail'] }, log: '사거리에서 가로등을 들이받았다. 음주 측정기가 길게 울렸다.' } },
        { text: '한 시간 기다린다', effects: { money: -40, happy: -1 }, log: '편의점 앞에서 컵라면을 먹으며 기다렸다.' },
        { text: '택시를 타고 차는 두고 간다', effects: { money: -20 }, log: '다음 날 아침 차를 찾으러 가는 길이 상쾌했다.' }
      ] },
    { id: 'mis_bar_fight', age: [20, 50], cooldown: 5,
      text: '술집에서 옆 테이블 사람이 일부러 어깨를 치고 비웃는다.',
      choices: [
        { text: '멱살을 잡는다', risky: true, check: { stat: 'grit', diff: 50 },
          success: { effects: { happy: 3, grit: 1, alcohol: 2, mischief: 6, rep: -1 }, log: '상대가 먼저 사과하고 나갔다. 술집 사장님이 서비스 안주를 줬다.' },
          fail: { effects: { health: -8, happy: -4, alcohol: 2, mischief: 6, rep: -5, record: 1 }, log: '광대뼈에 금이 갔다. 쌍방 폭행으로 벌금형이 나왔다.' } },
        { text: '계산하고 나온다', effects: { happy: -1, grit: 1 }, log: '찬 바람을 맞으며 걸었다. 내일 아침이 깨끗할 것이다.' }
      ] },
    { id: 'mis_tax_evade', age: [28, 65], once: true, cond: { career: 'any' }, decision: true,
      text: '세무사 친구가 "이 정도 소득은 빼도 아무도 몰라"라고 귀띔한다.',
      choices: [
        { text: '신고에서 슬쩍 뺀다', risky: true, check: { odds: 0.6 },
          success: { effects: { money: 3000, mischief: 4, flags: ['tax_hidden'] }, log: '올해 세금이 확 줄었다. 우편함을 볼 때마다 조금 긴장된다.', schedule: { id: 'mis_tax_audit', years: 3 } },
          fail: { effects: { money: -4000, mischief: 4, rep: -5, record: 1 }, log: '국세청 전산에 바로 걸렸다. 가산세까지 물었다.' } },
        { text: '정직하게 신고한다', effects: { rep: 2, happy: 1 }, log: '세금은 아팠지만 잠은 잘 잤다.' }
      ] },
    { id: 'mis_tax_audit', age: [30, 75], once: true, weight: 1, cond: { flags: ['tax_hidden'] },
      text: '세무서에서 "몇 년 치 자료를 보자"는 통지서가 왔다.',
      choices: [
        { text: '자진해서 수정 신고한다', effects: { money: -5000, rep: -2, happy: -2, unflags: ['tax_hidden'] }, log: '세금에 가산세까지 냈다. 그래도 거기서 끝났다.' },
        { text: '장부를 숨긴다', risky: true, check: { odds: 0.45 },
          success: { effects: { mischief: 5, happy: 2, unflags: ['tax_hidden'] }, log: '조사관이 별다른 걸 찾지 못했다. 장부는 다시 꺼내지 않았다.' },
          fail: { effects: { money: -10000, rep: -10, mischief: 5, fx: ['jail'], unflags: ['tax_hidden'] }, log: '증거 인멸 혐의가 붙었다. 판사는 냉정했다.' } }
      ] },
    { id: 'mis_bribe_envelope', age: [25, 64], cooldown: 8, cond: { career: 'any', level: [1, 9] },
      text: '거래처 사람이 "잘 부탁드립니다"라며 두툼한 봉투를 책상 밑으로 민다.',
      choices: [
        { text: '조용히 서랍에 넣는다', risky: true, check: { odds: 0.65 },
          success: { effects: { money: 5000, mischief: 5 }, log: '한동안 회식비 걱정이 없었다. 계약서에는 내 도장이 찍혔다.' },
          fail: { effects: { rep: -8, mischief: 5, record: 1, fx: ['fired'] }, log: '감사팀이 거래처 장부를 열었다. 해고 통보는 짧았다.' } },
        { text: '봉투를 돌려준다', effects: { rep: 3, happy: 1 }, log: '거래처 사람이 머쓱해했다. 계약은 정상 절차대로 진행됐다.' }
      ] },
    { id: 'mis_bribe_official', age: [25, 64], cooldown: 8, cond: { career: ['civil_servant'] }, decision: true,
      text: '인허가 서류를 든 업자가 "식사나 한번 하시죠"라며 명함 뒤에 숫자를 적어 보인다.',
      choices: [
        { text: '식사 자리에 나간다', risky: true, check: { odds: 0.55 },
          success: { effects: { money: 8000, mischief: 6 }, log: '서류는 일주일 만에 통과됐다. 통장은 두둑해졌다.' },
          fail: { effects: { rep: -12, mischief: 6, fx: ['jail'] }, log: '업자가 다른 사건으로 잡히며 장부를 털어놨다.' } },
        { text: '감사실에 보고한다', effects: { rep: 4, happy: 1 }, log: '"청렴 공무원" 표창을 받았다. 업자는 다른 동네로 떠났다.' }
      ] },
    { id: 'mis_company_card', age: [22, 60], cooldown: 5, cond: { career: ['sales_rep'] },
      text: '법인카드가 손에 있다. 오늘 개인적인 식사를 "거래처 미팅"으로 처리할 수 있을 것 같다.',
      choices: [
        { text: '긁는다', risky: true, check: { odds: 0.6 },
          success: { effects: { money: 300, happy: 3, mischief: 4 }, log: '한우가 맛있었다. 영수증엔 거래처 이름이 적혔다.' },
          fail: { effects: { rep: -4, mischief: 4, money: -600, fx: ['demote'] }, log: '경리팀이 결제 위치를 확인했다. 강등에 변상까지.' } },
        { text: '내 카드로 낸다', effects: { money: -300, happy: 2 }, log: '정직한 한우는 더 맛있었다.' }
      ] },
    { id: 'mis_fake_sick_day', age: [22, 60], cooldown: 4, cond: { career: 'any' },
      text: '오늘 {league} 빅매치가 낮 경기다. 미리 잡아 둔 약속과 시간이 겹친다.',
      choices: [
        { text: '목소리를 쉬게 해서 아프다고 둘러댄다', risky: true, check: { odds: 0.65 },
          success: { effects: { happy: 6, mischief: 3 }, log: '경기장에서 목이 쉬도록 응원했다. 내일은 진짜 목이 쉬어 있을 것이다.' },
          fail: { effects: { happy: -3, rep: -3, mischief: 3 }, log: '중계 화면에 내가 잡혔다. 약속 상대가 그 장면을 캡처해 보냈다.' } },
        { text: '약속을 지키고 나중에 하이라이트를 본다', effects: { happy: 1 }, log: '골 장면만 다섯 번 돌려 봤다.' }
      ] },
    { id: 'mis_affair', age: [25, 65], cooldown: 8, cond: { rel: { spouse: 'yes' } }, decision: true,
      text: '모임에서 호감을 보이던 사람과 단둘이 남았다. "2차 갈래?"',
      choices: [
        { text: '따라간다', risky: true, check: { odds: 0.5 },
          success: { effects: { happy: 5, mischief: 6, rel: { spouse: -3 } }, log: '설레는 밤이었다. 집에 돌아와 {spouse}의 얼굴을 똑바로 보지 못했다.' },
          fail: { effects: { happy: -8, rep: -6, mischief: 6, fx: ['divorce'] }, log: '{spouse}의 친구가 같은 술집에 있었다. 이혼 서류가 식탁 위에 놓였다.' } },
        { text: '택시를 잡아 집으로 간다', effects: { happy: 1, rel: { spouse: 5 } }, log: '{spouse}[이/가] 끓여 둔 라면이 불어 있었다. 그래도 맛있었다.' }
      ] },
    { id: 'mis_cheat_partner', age: [18, 40], cooldown: 5, cond: { rel: { partner: 'yes', spouse: 'no' } },
      text: '{partner} 몰래 다른 사람과의 데이트 약속이 잡혔다.',
      choices: [
        { text: '양다리를 걸친다', risky: true, check: { odds: 0.5 },
          success: { effects: { happy: 4, looks: 1, mischief: 5 }, log: '일정표가 테트리스처럼 꽉 찼다. 들키지 않았지만 늘 피곤했다.' },
          fail: { effects: { happy: -5, rep: -4, mischief: 5, fx: ['breakup'] }, log: '둘이 같은 카페에서 마주쳤다. 둘 다 떠났다.' } },
        { text: '약속을 취소한다', effects: { rel: { partner: 4 } }, log: '{partner}[과/와] 보낸 평범한 저녁이 오히려 좋았다.' }
      ] },
    { id: 'mis_scam_partner', age: [25, 65], once: true, decision: true,
      text: '옛 친구가 "노인들한테 가짜 건강식품 팔면 대박"이라며 동업을 제안한다.',
      choices: [
        { text: '손을 잡는다', risky: true, check: { odds: 0.4 },
          success: { effects: { money: 15000, mischief: 8, rep: -3, happy: -1 }, log: '돈은 쏟아졌다. 전화 속 할머니의 고맙다는 목소리가 귀에 남았다.' },
          fail: { effects: { money: -3000, rep: -10, mischief: 8, fx: ['jail'] }, log: '피해자 가족이 고소했다. 친구는 먼저 해외로 도망쳤다.' } },
        { text: '경찰에 신고한다', effects: { rep: 4, happy: 2 }, log: '사기단이 일망타진됐다. 경찰이 감사장을 보냈다.' }
      ] },
    { id: 'mis_parking_scratch', age: [20, 75], cooldown: 6,
      text: '주차하다 옆 차를 긁었다. 주변엔 아무도 없다.',
      choices: [
        { text: '그냥 떠난다', risky: true, check: { odds: 0.6 },
          success: { effects: { money: 500, mischief: 5 }, log: '수리비를 아꼈다. 대신 한동안 블랙박스 뉴스만 보면 움찔했다.' },
          fail: { effects: { money: -1500, rep: -5, mischief: 5, record: 1 }, log: '옆 차 블랙박스에 번호판이 선명했다. 뺑소니로 벌금까지.' } },
        { text: '연락처 메모를 남긴다', effects: { money: -500, rep: 3 }, log: '차 주인이 "요즘 이런 사람 없다"며 수리비를 깎아 줬다.' }
      ] },
    { id: 'mis_speeding', age: [20, 75], cooldown: 4,
      text: '중요한 약속에 늦었다. 도로는 텅 비어 있다.',
      choices: [
        { text: '밟는다', risky: true, check: { odds: 0.6 },
          success: { effects: { happy: 3, mischief: 2 }, log: '정각에 도착했다. 심장이 아직도 쿵쾅거렸다.' },
          fail: { effects: { money: -300, rep: -1, mischief: 2 }, log: '과속 카메라가 번쩍였다. 약속에도 늦고 벌금도 냈다.' } },
        { text: '늦는다고 전화한다', effects: { happy: -1, social: 1 }, log: '"천천히 와." 의외로 다들 괜찮아했다.' }
      ] },
    { id: 'mis_abroad_cash_job', age: [20, 50], cooldown: 6, cond: { flags: ['abroad'] }, decision: true,
      text: '비자 조건엔 안 되지만, 현금으로 주는 주말 알바 자리가 있다.',
      choices: [
        { text: '몰래 일한다', risky: true, check: { odds: 0.6 },
          success: { effects: { money: 4000, mischief: 4 }, log: '주말마다 현금 봉투가 쌓였다. 출입국 사무소 앞은 돌아서 다녔다.' },
          fail: { effects: { rep: -5, mischief: 4, record: 1, fx: ['deport'] }, log: '불시 단속에 걸렸다. 추방 명령이 떨어졌다.' } },
        { text: '비자 규정을 지킨다', effects: { grit: 1, happy: -1 }, log: '빠듯했지만 서류는 깨끗했다.' }
      ] },
    { id: 'mis_abroad_brawl', age: [20, 45], cooldown: 6, cond: { flags: ['abroad'] },
      text: '원정 응원 뒤 술집 앞, 상대 팬들과 분위기가 험악해졌다.',
      choices: [
        { text: '맨 앞으로 나선다', risky: true, check: { stat: 'grit', diff: 55 },
          success: { effects: { happy: 3, social: 2, mischief: 6 }, log: '기세에 눌린 상대가 물러났다. 동료 팬들이 어깨동무를 했다.' },
          fail: { effects: { health: -8, rep: -6, mischief: 6, fx: ['deport'] }, log: '경찰이 들이닥쳤다. 외국인이라 바로 추방 절차가 시작됐다.' } },
        { text: '숙소로 돌아간다', effects: { happy: -1 }, log: '다음 날 뉴스에 그 골목이 나왔다. 피하길 잘했다.' }
      ] },
    { id: 'mis_crime_heist', age: [20, 55], cooldown: 5, cond: { sector: ['crime'] }, decision: true,
      text: '"이번 한 탕이면 은퇴해도 된다." 보스가 큰 작업을 제안한다.',
      choices: [
        { text: '맡는다', risky: true, check: { odds: 0.45 },
          success: { effects: { money: 30000, mischief: 8, happy: 3 }, log: '작업은 완벽했다. 가방 무게가 묵직했다.' },
          fail: { effects: { mischief: 8, rep: -8, fx: ['jail'] }, log: '내부에 정보원이 있었다. 문을 여는 순간 손전등이 켜졌다.' } },
        { text: '이번엔 빠진다', effects: { rep: 1, happy: -1 }, log: '보스가 차갑게 웃었다. 그 작업은 실패했다고 들었다.' }
      ] },
    { id: 'mis_fake_news', age: [24, 60], cooldown: 6, cond: { career: ['journalist'] },
      text: '조회수가 바닥이다. 확인 안 된 스캔들을 "단독"으로 올리면 터질 것 같다.',
      choices: [
        { text: '올린다', risky: true, check: { odds: 0.55 },
          success: { effects: { fame: 5, money: 2000, mischief: 5 }, log: '실시간 검색어 1위. 반쯤은 맞는 얘기였던 게 천만다행이었다.' },
          fail: { effects: { fame: -3, rep: -8, mischief: 5, fx: ['fired'] }, log: '당사자가 소송을 걸었다. 회사는 나를 잘랐다.' } },
        { text: '취재를 더 한다', effects: { smarts: 2, rep: 1 }, log: '한 달 늦었지만 기사는 단단했다.' }
      ] },
    { id: 'mis_bad_reputation', age: [20, 70], cooldown: 8, cond: { traits: { mischief: [60, 100] } },
      text: '동네 사람들이 나를 보면 슬쩍 길을 건넌다. "그 악동"이라는 소문 때문이다.',
      choices: [
        { text: '소문 낸 이웃 차에 낙서를 한다', risky: true, check: { odds: 0.5 },
          success: { effects: { happy: 3, mischief: 5, rep: -2 }, log: '속이 시원했다. 소문은 더 커졌다.' },
          fail: { effects: { happy: -3, mischief: 5, rep: -6, record: 1 }, log: 'CCTV가 있었다. 재물손괴로 벌금을 냈다.' } },
        { text: '동네 봉사부터 시작한다', effects: { rep: 6, mischief: -5, happy: 2, social: 2 }, log: '골목 쓰레기를 줍기 시작했다. 석 달 뒤 누군가 먼저 인사했다.' }
      ] },
    { id: 'mis_midlife_bike', age: [40, 60], once: true, cond: { money: [10000, 100000000] }, decision: true,
      text: '중년의 위기. 커다란 오토바이 광고에서 눈을 뗄 수 없다.',
      choices: [
        { text: '몰래 사서 고속도로를 달린다', risky: true, check: { stat: 'health', diff: 45 },
          success: { effects: { money: -8000, happy: 7, looks: 2, mischief: 4 }, log: '헬멧 속에서 스무 살로 돌아갔다.' },
          fail: { effects: { money: -8000, health: -10, happy: -3, mischief: 4 }, log: '첫 커브에서 넘어졌다. 오토바이는 중고 매물로 올라갔다.' } },
        { text: '자전거로 타협한다', effects: { money: -800, health: 2, happy: 2 }, log: '언덕에서 숨이 찼지만 기분은 좋았다.' }
      ] },

    // ---------------------------------------------------------------- old age 60-85
    { id: 'mis_senior_invest_call', age: [60, 85], cooldown: 6, decision: true,
      text: '"어르신만 특별히, 원금 보장에 수익 세 배!" 낯선 번호의 전화다.',
      choices: [
        { text: '"내가 속을 사람이냐" 큰소리치며 송금한다', risky: true, check: { odds: 0.15 },
          success: { effects: { money: 4000, happy: 4, mischief: 3 }, log: '웬일로 진짜였다. 경로당에서 일주일 내내 자랑했다.' },
          fail: { effects: { happy: -5, mischief: 3, fx: ['scam'] }, log: '다음 날 그 번호는 없는 번호였다.' } },
        { text: '은행 창구에 먼저 물어본다', effects: { happy: 1, smarts: 1 }, log: '창구 직원이 "전형적인 사기예요"라며 손을 잡아 줬다.' }
      ] },
    { id: 'mis_senior_queue', age: [60, 85], cooldown: 4,
      text: '병원 대기 줄이 끝도 없다. 앞쪽 의자에 빈틈이 보인다.',
      choices: [
        { text: '"내가 나이가 몇인데" 새치기한다', risky: true, check: { odds: 0.6 },
          success: { effects: { happy: 3, mischief: 3 }, log: '20분 일찍 진료를 받았다. 뒤통수가 따가웠다.' },
          fail: { effects: { happy: -3, rep: -4, mischief: 3 }, log: '뒤에 선 사람이 나보다 열 살 많았다. 대기실 전체가 쳐다봤다.' } },
        { text: '옆 사람과 수다를 떨며 기다린다', effects: { social: 2, happy: 1 }, log: '진료 차례가 왔을 때 새 친구가 생겨 있었다.' }
      ] },
    { id: 'mis_senior_drive', age: [72, 85], once: true, decision: true,
      text: '진료 중 운전을 그만두는 게 어떻겠느냐는 말을 들었다. "아직 눈이 쌩쌩한데!"',
      choices: [
        { text: '고집대로 계속 운전한다', risky: true, check: { stat: 'health', diff: 50 },
          success: { effects: { happy: 4, mischief: 3 }, log: '시장 가는 길은 여전히 내 차지다. 주차만 조금 오래 걸린다.' },
          fail: { effects: { health: -10, money: -3000, rep: -4, mischief: 3 }, log: '브레이크 대신 가속 페달을 밟았다. 다행히 다친 건 나와 화단뿐이었다.' } },
        { text: '면허를 반납한다', effects: { happy: -2, health: 1, rep: 2 }, log: '대중교통을 이용하기로 했다. 버스 창밖 풍경이 꽤 좋다.' }
      ] },
    { id: 'mis_senior_miracle_cure', age: [62, 85], cooldown: 8,
      text: '경로당 친구들에게 "만병통치 약초즙"을 팔자는 제안을 받았다.',
      choices: [
        { text: '내가 최고 판매원이 된다', risky: true, check: { odds: 0.5 },
          success: { effects: { money: 3000, social: 2, mischief: 6 }, log: '한 달 만에 다 팔았다. 다들 "속이 편해졌다"고 했다. 아마 기분 탓이다.' },
          fail: { effects: { money: -1000, rep: -8, mischief: 6, record: 1 }, log: '한 친구가 성분 검사를 맡겼다. 그냥 쑥물이었다. 경찰서까지 갔다.' } },
        { text: '"그건 사기야" 하고 말린다', effects: { rep: 2, social: 1 }, log: '친구들이 고맙다며 국밥을 샀다.' }
      ] },
    { id: 'mis_senior_election', age: [65, 85], once: true,
      text: '경로당 회장 선거. 지지자 몇 명만 더 있으면 이길 것 같다.',
      choices: [
        { text: '떡을 돌리며 표를 산다', risky: true, check: { odds: 0.5 },
          success: { effects: { fame: 2, happy: 4, mischief: 5 }, log: '당선! 취임 첫날 안마의자 두 대를 들였다.' },
          fail: { effects: { happy: -4, rep: -8, mischief: 5 }, log: '상대 후보가 떡 사진을 찍어 두었다. 당선 무효.' } },
        { text: '공약으로 승부한다', effects: { social: 2, rep: 2 }, log: '아깝게 졌지만 다음 선거 1순위가 됐다.' }
      ] },
    { id: 'mis_senior_will_lie', age: [65, 85], once: true, cond: { rel: { children: 'yes' } }, decision: true,
      text: '자식들 연락이 뜸하다. "유산을 정리 중"이라고 슬쩍 흘리면 어떨까.',
      choices: [
        { text: '통장이 두둑한 척한다', risky: true, check: { odds: 0.6 },
          success: { effects: { happy: 5, mischief: 4, rel: { children: 8 } }, log: '매주 자식들이 찾아온다. 통장 잔고는 비밀이다.' },
          fail: { effects: { happy: -4, rep: -3, mischief: 4, rel: { children: -10 } }, log: '자식에게 통장 잔고를 들켰다. 대화가 뚝 끊겼다.' } },
        { text: '"보고 싶다"고 솔직하게 말한다', effects: { happy: 3, rel: { children: 5 } }, log: '다음 주말, 자식들이 반찬통을 잔뜩 들고 왔다.' }
      ] },
    { id: 'mis_senior_samples', age: [68, 85], cooldown: 4,
      text: '마트 시식 코너가 오늘따라 풍성하다. 장바구니는 비어 있다.',
      choices: [
        { text: '여섯 바퀴를 돈다', risky: true, check: { odds: 0.7 },
          success: { effects: { happy: 3, money: 10, mischief: 3 }, log: '점심을 해결했다. 만두 코너 직원과는 이제 눈인사를 한다.' },
          fail: { effects: { happy: -3, rep: -3, mischief: 3 }, log: '"어르신, 아까도 오셨잖아요." 계산대까지 시선이 따라왔다.' } },
        { text: '하나만 먹고 산다', effects: { money: -10, happy: 1 }, log: '시식한 만두를 샀다. 직원이 하나 더 얹어 줬다.' }
      ] },
    { id: 'mis_senior_stubborn', age: [70, 85], cooldown: 6, cond: { stats: { health: [0, 50] } },
      text: '의사가 술과 짠 음식을 끊으라고 했다. 저녁 상에 좋아하는 {food}[이/가] 올라왔다.',
      choices: [
        { text: '"이 나이에 무슨" 소주까지 곁들인다', risky: true, check: { stat: 'health', diff: 40 },
          success: { effects: { happy: 5, alcohol: 3, mischief: 3 }, log: '세상 행복했다. 다음 검진 수치도 이상하게 멀쩡했다.' },
          fail: { effects: { health: -6, alcohol: 3, mischief: 3 }, log: '밤새 혈압이 치솟아 응급실 신세를 졌다.' } },
        { text: '싱겁게 조금만 먹는다', effects: { health: 2, happy: -1 }, log: '맛은 심심했지만 아침 산책이 가벼웠다.' }
      ] }
  );
  RA.ownEvents(RA.data.events);
})(typeof globalThis !== 'undefined' ? globalThis : this);
