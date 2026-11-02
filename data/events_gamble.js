/* Gambling: 한다/안 한다 decisions with shown odds at every age, addiction stages, debt and recovery,
 * and the way into the 겜블러 career (pro_gambler). Ids prefixed gam_. Bets use the `bet` choice field:
 * the engine moves the stake, raises 도박 중독 and appends the amount to the log. */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};
  RA.data.events = RA.data.events || [];
  RA.data.events.push(
    // ---------------------------------------------------------------- childhood (7-12): pocket money
    { id: 'gam_arcade_claw', age: [7, 12], cooldown: 2, decision: true,
      text: '오락실 앞 인형뽑기 기계. 집게가 반짝이며 손짓한다.',
      choices: [
        { text: '한다 (35%: 용돈 2배)', risky: true, bet: { odds: 0.35, mult: 2, stake: 'tiny', addict: 2 },
          success: { effects: { happy: 4 }, log: '집게가 인형을 꽉 물었다! 친구들이 환호했다.' },
          fail: { effects: { happy: -2 }, log: '인형이 집게에서 미끄러졌다. 용돈이 사라졌다.' } },
        { text: '안 한다', effects: { smarts: 1 }, log: '용돈으로 {food}[을/를] 사 먹었다. 확실한 행복이다.' }
      ] },
    { id: 'gam_arcade_gacha', age: [7, 12], cooldown: 3, decision: true,
      text: '문방구 앞 뽑기 기계에 한정판 축구 카드가 들어 있다고 한다.',
      choices: [
        { text: '한 판 돌린다 (30%: 한정판 카드)', risky: true, bet: { odds: 0.3, mult: 3, stake: 'tiny', addict: 2 },
          success: { effects: { happy: 5, social: 1 }, log: '반짝이는 한정판! 반 아이들이 모두 구경하러 왔다.' },
          fail: { effects: { happy: -2 }, log: '또 똑같은 카드. 벌써 다섯 장째다.' } },
        { text: '용돈을 저금통에 넣는다', effects: { grit: 1 }, log: '저금통이 조금 무거워졌다.' }
      ] },
    { id: 'gam_ddakji', age: [6, 11], cooldown: 3, decision: true,
      text: '골목에서 딱지치기 내기가 벌어졌다. 지면 딱지를 다 내줘야 한다.',
      choices: [
        { text: '전부 걸고 한다 (45%: 딱지 2배)', risky: true, bet: { odds: 0.45, mult: 2, stake: 'tiny', addict: 1 },
          success: { effects: { happy: 4, mischief: 1 }, log: '형들 딱지까지 다 땄다. 주머니가 불룩하다.' },
          fail: { effects: { happy: -3 }, log: '마지막 한 장까지 넘어갔다.' } },
        { text: '구경만 한다', effects: { smarts: 1 }, log: '누가 어떻게 이기는지 잘 봐 뒀다.' }
      ] },

    // ---------------------------------------------------------------- teens (13-19): bets with friends
    { id: 'gam_teen_football_bet', age: [13, 19], cooldown: 2, decision: true,
      text: '친구들이 주말 더비 결과에 돈을 걸자고 한다.',
      choices: [
        { text: '건다 (45%: 판돈 2배)', risky: true, bet: { odds: 0.45, mult: 2, stake: 'small', addict: 3 },
          success: { effects: { happy: 4, social: 1 }, log: '예상이 맞았다! 친구들 용돈이 내 주머니로.' },
          fail: { effects: { happy: -3 }, log: '후반 막판 동점골. 판돈이 날아갔다.' } },
        { text: '돈 말고 음료수 내기로 하자고 한다', effects: { social: 2, happy: 1 }, log: '진 친구가 투덜대며 음료수를 샀다.' }
      ] },
    { id: 'gam_teen_cards', age: [14, 19], cooldown: 3, decision: true,
      text: '방과 후 교실 뒤에서 카드 게임 판이 벌어졌다. 선생님은 아직 모른다.',
      choices: [
        { text: '판에 낀다 (40%: 판돈 2배)', risky: true, bet: { odds: 0.4, mult: 2, stake: 'small', addict: 3 },
          success: { effects: { happy: 3, mischief: 2 }, log: '포커페이스가 통했다. 다들 혀를 내둘렀다.' },
          fail: { effects: { happy: -2, mischief: 2, rep: -2 }, log: '돈도 잃고, 결국 선생님께 걸려 반성문을 썼다.' } },
        { text: '집에 간다', effects: { grit: 1 }, log: '창문 너머 웃음소리가 조금 부러웠다.' }
      ] },
    { id: 'gam_teen_toto', age: [16, 19], cooldown: 3, decision: true,
      text: '선배가 몰래 스포츠 토토 사이트 주소를 알려 준다. "축구 잘 아는 너라면 무조건 따."',
      choices: [
        { text: '몰래 걸어 본다 (40%: 판돈 2.5배)', risky: true, bet: { odds: 0.4, mult: 2.5, stake: 'small', addict: 5 },
          success: { effects: { happy: 5, mischief: 3 }, log: '용돈이 하룻밤 새 두 배 넘게 불었다. 가슴이 쿵쾅거린다.' },
          fail: { effects: { happy: -4, mischief: 3 }, log: '돈이 순식간에 사라졌다. 화면을 끄는 손이 떨렸다.' } },
        { text: '선배에게 관심 없다고 한다', effects: { grit: 2, rep: 1 }, log: '선배는 혀를 찼지만 더 권하지 않았다.' }
      ] },

    // ---------------------------------------------------------------- adults: lottery, horses, casino, online
    { id: 'gam_lottery_ticket', age: [19, 95], cooldown: 2, decision: true,
      text: '복권 판매점 앞. 이번 주 1등 당첨금이 사상 최대라고 한다.',
      choices: [
        { text: '산다 (2%: 30배)', risky: true, bet: { odds: 0.02, mult: 30, stake: 'small', addict: 2 },
          success: { effects: { happy: 10 }, log: '숫자가 맞았다! 판매점 사장님이 박수를 쳤다.' },
          fail: { effects: { happy: -1 }, log: '역시 꽝. 다음 주에 또 오겠지.' } },
        { text: '그 돈으로 {food}[을/를] 사 먹는다', effects: { happy: 2 }, log: '확률 100%의 행복이었다.' }
      ] },
    { id: 'gam_racetrack', age: [20, 85], cooldown: 3, decision: true,
      text: '친구가 경마장에 가자고 한다. "오늘 3번 말이 대박이래."',
      choices: [
        { text: '3번 말에 건다 (30%: 3배)', risky: true, bet: { odds: 0.3, mult: 3, stake: 'medium', addict: 4 },
          success: { effects: { happy: 6 }, log: '3번 말이 결승선을 1등으로 끊었다! 친구와 얼싸안았다.' },
          fail: { effects: { happy: -3 }, log: '3번 말은 꼴찌로 들어왔다. 친구는 "원래 그런 거야"라고 했다.' } },
        { text: '구경만 하고 핫도그를 먹는다', effects: { happy: 2, health: -1 }, log: '말들이 달리는 소리는 생각보다 멋졌다.' }
      ] },
    { id: 'gam_casino_blackjack', age: [21, 85], cooldown: 2, decision: true,
      text: '출장지 호텔 1층에 카지노가 있다. 블랙잭 테이블 딜러가 미소를 짓는다.',
      choices: [
        { text: '블랙잭을 한다 (45%: 2배)', risky: true, bet: { odds: 0.45, mult: 2, stake: 'medium', addict: 4 },
          success: { effects: { happy: 5 }, log: '21! 칩이 산처럼 쌓였다.' },
          fail: { effects: { happy: -3 }, log: '버스트. 칩이 딜러 쪽으로 쓸려 갔다.' } },
        { text: '룰렛에 크게 건다 (18%: 5배)', risky: true, bet: { odds: 0.18, mult: 5, stake: 'big', addict: 6 },
          success: { effects: { happy: 9, fame: 1 }, log: '빨강 23! 테이블 전체가 환호했다.' },
          fail: { effects: { happy: -6 }, log: '공은 검정 칸에 멈췄다. 방으로 돌아가는 엘리베이터가 길었다.' } },
        { text: '방에 올라가 잔다', effects: { health: 2 }, log: '다음 날 회의에서 가장 맑은 정신이었다.' }
      ] },
    { id: 'gam_online_betting', age: [19, 70], cooldown: 2, decision: true,
      text: '휴대폰에 온라인 베팅 앱 광고가 뜬다. "첫 충전 보너스 100%!"',
      choices: [
        { text: '설치하고 건다 (40%: 2배)', risky: true, bet: { odds: 0.4, mult: 2, stake: 'medium', addict: 5 },
          success: { effects: { happy: 4 }, log: '첫판부터 땄다. 알림이 계속 울린다.' },
          fail: { effects: { happy: -4 }, log: '보너스까지 다 날아갔다. 새벽 세 시였다.' } },
        { text: '광고를 차단한다', effects: { grit: 1 }, log: '휴대폰이 조용해졌다.' }
      ] },
    { id: 'gam_high_roller', age: [25, 80], cooldown: 3, decision: true,
      cond: { money: [20000, 1e12] },
      text: '돈 냄새를 맡은 지인이 하이롤러 테이블에 초대했다. 판돈 단위가 다르다.',
      choices: [
        { text: '앉는다 (40%: 2.5배)', risky: true, bet: { odds: 0.4, mult: 2.5, stake: 'big', addict: 6 },
          success: { effects: { happy: 7, fame: 2 }, log: '하룻밤에 차 한 대 값을 땄다.' },
          fail: { effects: { happy: -7 }, log: '하룻밤에 차 한 대 값을 잃었다.' } },
        { text: '정중히 거절한다', effects: { rep: 2 }, log: '"다음에 봅시다." 그 다음은 오지 않게 하기로 했다.' }
      ] },
    { id: 'gam_athlete_betting', age: [17, 40], once: true,
      cond: { fb: ['academy', 'youth', 'pro'] },
      text: '브로커가 접근했다. "다음 경기, 후반에 한 골만 덜 넣으면 큰돈을 주지."',
      choices: [
        { text: '받아들인다 (60%: 들키지 않음)', risky: true, check: { odds: 0.6 },
          success: { effects: { money: 30000, mischief: 6, rep: -2 }, log: '돈이 들어왔다. 그런데 골대 앞에서 다리가 무거웠다.' },
          fail: { effects: { mischief: 6, rep: -25, record: 1, fx: ['fbBan', 'careerEndingInjury'] }, log: '승부 조작이 발각됐다. 영구 제명. 이름이 뉴스에 실렸다.' } },
        { text: '신고한다', effects: { rep: 8, fame: 3, grit: 2 }, log: '협회가 브로커를 붙잡았다. 동료들이 고개를 숙여 인사했다.' }
      ] },

    // ---------------------------------------------------------------- addiction: habit (20-44)
    { id: 'gam_habit_night', age: [16, 80], cooldown: 3, decision: true,
      cond: { traits: { gamble: [20, 100] } },
      text: '자기 전에 "딱 한 판만"이 습관이 됐다. 오늘도 손가락이 앱으로 간다.',
      choices: [
        { text: '딱 한 판만 (45%: 2배)', risky: true, bet: { odds: 0.45, mult: 2, stake: 'small', addict: 4 },
          success: { effects: { happy: 2, health: -1 }, log: '땄다. 그래서 한 판 더 했다.' },
          fail: { effects: { happy: -3, health: -1 }, log: '잃었다. 본전 생각에 잠이 오지 않았다.' } },
        { text: '휴대폰을 거실에 두고 잔다', effects: { gamble: -3, health: 2 }, log: '처음으로 푹 잤다.' }
      ] },
    { id: 'gam_habit_borrow', age: [18, 80], cooldown: 4, decision: true,
      cond: { traits: { gamble: [20, 100] } },
      text: '판돈이 모자라자 {friend}에게 돈을 빌릴 핑계를 찾고 있다.',
      choices: [
        { text: '거짓말로 빌린다', risky: true, check: { odds: 0.5 },
          success: { effects: { money: 500, gamble: 3, mischief: 3, rel: { friend: -5 } }, log: '돈은 빌렸다. 마음 한쪽이 무거웠다.' },
          fail: { effects: { gamble: 3, mischief: 3, rep: -5, fx: ['loseFriend'] }, log: '거짓말이 들통났다. 친구가 연락을 끊었다.' } },
        { text: '솔직하게 털어놓는다', effects: { gamble: -5, rel: { friend: 6 }, social: 2 }, log: '친구가 같이 상담 센터에 가 주겠다고 했다.' }
      ] },

    // ---------------------------------------------------------------- addiction: stage 2 (45+)
    { id: 'gam_debt_call', age: [19, 85], cooldown: 3, priority: false, weight: 30, decision: true,
      cond: { traits: { gamble: [45, 100] } },
      text: '모르는 번호로 전화가 계속 온다. 카드값과 대출 이자가 밀렸다.',
      choices: [
        { text: '한 방에 갚으려고 크게 건다 (35%: 3배)', risky: true, bet: { odds: 0.35, mult: 3, stake: 'big', addict: 6 },
          success: { effects: { happy: 6 }, log: '기적처럼 빚을 다 갚았다. 그리고 또 걸고 싶어졌다.' },
          fail: { effects: { happy: -8 }, log: '빚이 두 배가 됐다. 전화벨이 무섭다.' } },
        { text: '가족에게 털어놓고 갚을 계획을 세운다', effects: { gamble: -6, happy: -2, rel: { family: 4 }, money: -1000 }, log: '부끄러웠지만, 처음으로 길이 보였다.' }
      ] },
    { id: 'gam_loan_shark', age: [19, 85], cooldown: 4, weight: 20, decision: true,
      cond: { traits: { gamble: [45, 100] }, money: [-1e12, 2000] },
      text: '"급전 바로 됩니다." 사채업자 명함이 문틈에 끼워져 있다.',
      choices: [
        { text: '돈을 빌려 다시 건다 (35%: 3배)', risky: true, bet: { odds: 0.35, mult: 3, stake: 'all', addict: 6 },
          success: { effects: { happy: 6, mischief: 2 }, log: '빌린 돈으로 크게 땄다. 이자를 치르고도 남았다.' },
          fail: { effects: { happy: -10, health: -4, fx: ['bankrupt'] }, log: '사채업자들이 집 앞에 진을 쳤다. 모든 걸 잃었다.' } },
        { text: '명함을 찢어 버린다', effects: { gamble: -4, grit: 3 }, log: '쓰레기통에 명함을 넣고 뚜껑을 꾹 눌렀다.' }
      ] },
    { id: 'gam_job_loss', age: [20, 65], cooldown: 6, weight: 15,
      cond: { traits: { gamble: [45, 100] }, career: 'any' },
      text: '근무 시간에도 몰래 베팅 화면을 보다가 상사에게 들켰다.',
      choices: [
        { text: '변명한다', risky: true, check: { odds: 0.4 },
          success: { effects: { rep: -2, gamble: 2 }, log: '이번만 봐준다고 했다. 다음은 없다.' },
          fail: { effects: { rep: -6, fx: ['fired'] }, log: '짐을 싸라는 말을 들었다.' } },
        { text: '사실대로 말하고 치료를 약속한다', effects: { gamble: -5, rep: 2, fx: ['rehab'] }, log: '회사가 상담 프로그램을 연결해 줬다.' }
      ] },
    { id: 'gam_intervention', age: [19, 90], cooldown: 5, weight: 25, decision: true,
      cond: { traits: { gamble: [45, 100] }, rel: { mother: 'alive' } },
      text: '{mother}[과/와] {siblings}[이/가] 거실에 모였다. 다들 표정이 무겁다. "이제 그만하자."',
      choices: [
        { text: '치료를 받겠다고 약속한다', effects: { rel: { family: 8 }, fx: ['rehab'], happy: 2 }, log: '{mother}[이/가] 손을 꼭 잡아 줬다. 오래 울었다.' },
        { text: '"내 인생이야!"라며 뛰쳐나간다', risky: true, effects: { rel: { family: -12 }, gamble: 4, mischief: 3, happy: -4 }, log: '현관문이 쾅 닫혔다. 그날 밤도 테이블에 앉았다.' }
      ] },
    { id: 'gam_intervention_spouse', age: [22, 90], cooldown: 5, weight: 25, decision: true,
      cond: { traits: { gamble: [45, 100] }, rel: { spouse: 'yes' } },
      text: '{spouse}[이/가] 통장 내역을 보여 주며 말한다. "우리 이대로는 못 살아."',
      choices: [
        { text: '치료 모임에 나간다', effects: { rel: { spouse: 8 }, fx: ['rehab'] }, log: '첫 모임에서 이름을 말하는 데 한참 걸렸다.' },
        { text: '이번이 마지막이라며 숨긴다', risky: true, check: { odds: 0.35 },
          success: { effects: { gamble: 3, rel: { spouse: -6 } }, log: '{spouse}[은/는] 한 번 더 믿어 줬다. 마지막 기회였다.' },
          fail: { effects: { gamble: 3, fx: ['divorce'] }, log: '{spouse}[이/가] 짐을 쌌다. 집이 너무 조용해졌다.' } }
      ] },
    { id: 'gam_treatment_group', age: [19, 90], cooldown: 4, decision: true,
      cond: { traits: { gamble: [30, 100] } },
      text: '단도박 모임 전단지를 받았다. 매주 목요일 저녁, 동네 회관.',
      choices: [
        { text: '가 본다', effects: { fx: ['rehab'], social: 2 }, log: '다들 비슷한 이야기를 하고 있었다. 혼자가 아니었다.' },
        { text: '나는 아직 괜찮다', risky: true, effects: { gamble: 3 }, log: '전단지는 주머니 속에서 구겨졌다.' }
      ] },
    { id: 'gam_relapse', age: [19, 90], cooldown: 5,
      cond: { flags: ['rehab'], traits: { gamble: [0, 44] } },
      text: '치료를 시작한 지 한참 됐다. 옛 친구가 카지노 무료 숙박권을 내민다.',
      choices: [
        { text: '딱 한 번만 (45%: 2배)', risky: true, bet: { odds: 0.45, mult: 2, stake: 'medium', addict: 8 },
          success: { effects: { happy: 3 }, log: '땄다. 그런데 이긴 기분이 아니었다.' },
          fail: { effects: { happy: -5 }, log: '오랜만에 느끼는 그 허무함. 다시 모임에 나가야겠다.' } },
        { text: '숙박권을 돌려준다', effects: { grit: 3, gamble: -3, happy: 2 }, log: '"고맙지만 난 이제 안 해." 말하고 나니 개운했다.' }
      ] },

    // ---------------------------------------------------------------- stage 3 (75+): serious
    { id: 'gam_house_mortgage', age: [25, 90], cooldown: 6, weight: 25, decision: true,
      cond: { traits: { gamble: [75, 100] }, flags: ['homeowner'] },
      text: '집 문서를 손에 쥐고 있다. 담보로 맡기면 큰 판을 벌일 수 있다.',
      choices: [
        { text: '집을 걸고 마지막 한 판 (30%: 3배)', risky: true, bet: { odds: 0.3, mult: 3, stake: 'all', addict: 6 },
          success: { effects: { happy: 10, fame: 2 }, log: '인생을 건 한 판에서 이겼다. 손이 한참 떨렸다.' },
          fail: { effects: { happy: -12, fx: ['bankrupt'] }, log: '집이 넘어갔다. 짐 몇 개만 들고 나왔다.' } },
        { text: '문서를 가족에게 맡긴다', effects: { gamble: -8, rel: { family: 6 } }, log: '"이건 네가 갖고 있어." 그 말이 시작이었다.' }
      ] },
    { id: 'gam_last_hand', age: [20, 90], cooldown: 5, weight: 25, decision: true,
      cond: { traits: { gamble: [75, 100] } },
      text: '모든 게 무너지기 직전이다. 남은 돈 전부를 들고 카지노 앞에 섰다.',
      choices: [
        { text: '전부 건다 (25%: 4배)', risky: true, bet: { odds: 0.25, mult: 4, stake: 'all', addict: 5 },
          success: { effects: { happy: 12, fame: 3 }, log: '기적이었다. 카지노 직원들이 박수를 쳤다.' },
          fail: { effects: { happy: -12, health: -5, fx: ['bankrupt'] }, log: '빈손으로 새벽 거리를 걸었다. 모든 걸 잃었다.' } },
        { text: '돌아서서 치료 센터로 간다', effects: { fx: ['rehab'], happy: -2, grit: 4 }, log: '그 문을 여는 데 인생 전부의 용기가 필요했다.' }
      ] },

    // ---------------------------------------------------------------- into the 겜블러 career
    { id: 'gam_vip_invite', age: [21, 60], cooldown: 6, weight: 25, decision: true,
      cond: { traits: { gamble: [45, 100] }, career: 'none' },
      text: '카지노 매니저가 말을 건다. "그 감각이면 딜러로 일해 볼 생각 없어요? 판을 보는 눈이 있네요."',
      choices: [
        { text: '카지노 딜러가 된다', risky: true, career: 'pro_gambler', effects: { gamble: 4, happy: 3 }, log: '검은 조끼를 입고 첫 테이블에 섰다. 새 길이 시작됐다.' },
        { text: '그 세계와 거리를 둔다', effects: { gamble: -5, rep: 2 }, log: '카지노 불빛을 등지고 걸었다.' }
      ] },
    { id: 'gam_vip_invite_job', age: [21, 60], cooldown: 6, weight: 15, decision: true,
      cond: { traits: { gamble: [45, 100] }, career: 'any' },
      text: '단골 카지노에서 하우스 플레이어 자리를 제안한다. 지금 직장보다 판돈이 크다.',
      choices: [
        { text: '직장을 그만두고 간다', risky: true, career: 'pro_gambler', effects: { gamble: 5, happy: 4, fx: ['quitJob'] }, log: '사표를 내던 날, 카지노 조명이 유난히 밝았다.' },
        { text: '지금 일을 지킨다', effects: { gamble: -3, grit: 2 }, log: '월급날의 소박한 안도감을 택했다.' }
      ] },
    { id: 'gam_pro_tournament', age: [21, 75], cooldown: 3,
      cond: { career: ['pro_gambler'] },
      text: '국제 카드 토너먼트 초청장이 왔다. 우승 상금은 상상 이상이다.',
      choices: [
        { text: '참가한다 (30%: 4배)', risky: true, bet: { odds: 0.3, mult: 4, stake: 'big', addict: 4 },
          success: { effects: { fame: 6, happy: 8, fx: ['promote'] }, log: '파이널 테이블에서 우승했다! 카메라 플래시가 쏟아졌다.' },
          fail: { effects: { happy: -5, fame: 1 }, log: '버블에서 탈락했다. 그래도 이름은 알렸다.' } },
        { text: '이번엔 쉰다', effects: { health: 2, gamble: -2 }, log: '집에서 오랜만에 가족과 저녁을 먹었다.' }
      ] },
    { id: 'gam_pro_cheat', age: [21, 75], cooldown: 5,
      cond: { career: ['pro_gambler'] },
      text: '동료가 카드를 표시하는 수법을 알려 준다. "아무도 몰라."',
      choices: [
        { text: '써 본다 (55%: 들키지 않음)', risky: true, check: { odds: 0.55 },
          success: { effects: { money: 20000, mischief: 5 }, log: '판을 휩쓸었다. 동료가 윙크했다.' },
          fail: { effects: { mischief: 5, rep: -15, fx: ['jail'] }, log: '감시 카메라에 모든 게 찍혔다.' } },
        { text: '정직하게 한다', effects: { rep: 3, gamble: -1 }, log: '오늘은 조금 잃었다. 그래도 떳떳하다.' }
      ] },
    { id: 'gam_pro_owner', age: [35, 80], once: true,
      cond: { career: ['pro_gambler'], level: [3, 9] },
      text: '오래 일한 카지노가 매물로 나왔다. 투자자들이 당신을 찾는다.',
      choices: [
        { text: '인수에 뛰어든다 (50%: 성공)', risky: true, check: { odds: 0.5 },
          success: { effects: { fame: 5, happy: 8, fx: ['promote'] }, log: '카지노 사장이 됐다. 이제 판을 여는 쪽이다.' },
          fail: { effects: { happy: -6, fx: ['bankrupt'] }, log: '투자자들이 손을 뺐다. 빚만 남았다.' } },
        { text: '은퇴할 때라고 느낀다', effects: { gamble: -10, happy: 3, fx: ['quitJob'] }, log: '칩을 반납하고 바닷가로 이사했다.' }
      ] }
  );
})(typeof globalThis !== 'undefined' ? globalThis : this);
