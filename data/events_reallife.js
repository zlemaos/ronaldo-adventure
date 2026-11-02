/* Real-life decision pack (rl_): money, health, relationships, moving, service, school life, old age.
 * Every event is a 2-4 choice decision, almost all marked `decision: true` so the engine can pull them
 * when a year has too few decisions. Most have one tempting `risky` option and one safe option. */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};
  RA.data.events = RA.data.events || [];
  var SCHOOL = ['elem', 'middle', 'high'];
  var NOT_KR = ['pt', 'jp', 'cn', 'us', 'br', 'ar', 'za', 'in'];
  RA.data.events.push(

    // ================================================================ childhood (5-12)
    { id: 'rl_kid_allowance', age: [6, 12], decision: true, cooldown: 4,
      text: '이번 달 용돈을 받았다. 문구점 앞 진열대가 반짝인다.',
      choices: [
        { text: '반은 저금통에 넣는다', effects: { smarts: 1, money: 10, happy: -1 }, log: '저금통이 조금 무거워졌다. 괜히 뿌듯했다.' },
        { text: '한 번에 다 쓴다', risky: true, effects: { happy: 4, money: -5, mischief: 1 }, log: '사흘 만에 용돈이 바닥났다. 그래도 재밌었다.' },
        { text: '용돈 기입장을 쓴다', effects: { smarts: 2, grit: 1 }, log: '삐뚤빼뚤한 글씨로 지출을 적었다. 군것질이 제일 많았다.' }
      ] },
    { id: 'rl_kid_toy_save', age: [5, 11], decision: true, cooldown: 5,
      text: '갖고 싶던 장난감이 나왔다. 모은 돈으로는 조금 모자란다.',
      choices: [
        { text: '두 달 더 모은다', effects: { grit: 2, happy: 1, money: 5 }, log: '두 달 뒤, 직접 모은 돈으로 샀다. 더 소중했다.' },
        { text: '부모님께 조른다', check: { stat: 'social', diff: 35 },
          success: { effects: { happy: 4 }, log: '"이번만이야." 장난감이 손에 들어왔다.' },
          fail: { effects: { happy: -2 }, log: '"생일까지 기다려." 단호한 대답이 돌아왔다.' } },
        { text: '친구 것과 바꿔 논다', effects: { social: 2, happy: 2 }, log: '바꿔 노니 장난감이 두 배가 됐다.' }
      ] },
    { id: 'rl_kid_errand_change', age: [5, 9], decision: true, cooldown: 4,
      text: '심부름으로 {food} 재료를 사 왔다. 거스름돈이 손에 남았다.',
      choices: [
        { text: '거스름돈을 그대로 돌려드린다', effects: { rep: 2, social: 1 }, log: '"정직하네." 머리를 쓰다듬어 줬다.' },
        { text: '몰래 사탕을 사 먹는다', risky: true, check: { odds: 0.5 },
          success: { effects: { happy: 3, mischief: 2 }, log: '입안 가득 단맛. 아무도 모르는 비밀이 됐다.' },
          fail: { effects: { happy: -2, mischief: 2, rep: -1 }, log: '영수증과 계산이 안 맞았다. 바로 들켰다.' } }
      ] },
    { id: 'rl_kid_playground_turn', age: [5, 9], decision: true, cooldown: 3,
      text: '놀이터 그네 앞에 줄이 길다. 드디어 내 차례다.',
      choices: [
        { text: '어린 동네 아이에게 양보한다', effects: { social: 2, rep: 2, happy: -1 }, log: '그 아이가 그네를 밀어 줬다. 둘이 친해졌다.' },
        { text: '해 질 때까지 안 내린다', risky: true, effects: { happy: 3, mischief: 2, social: -1 }, log: '하늘 높이 날았다. 뒤에서 원성이 들렸다.' },
        { text: '미끄럼틀로 간다', effects: { happy: 2, health: 1 }, log: '미끄럼틀을 스무 번 탔다.' }
      ] },
    { id: 'rl_kid_stranger_candy', age: [5, 10], decision: true, cooldown: 5,
      text: '처음 보는 어른이 사탕을 주며 강아지를 같이 찾자고 한다.',
      choices: [
        { text: '"안 돼요!" 하고 가게로 뛰어간다', effects: { smarts: 2, grit: 1 }, log: '가게 주인이 경찰에 신고해 줬다. 배운 대로 잘했다.' },
        { text: '따라가 본다', risky: true, check: { odds: 0.5 },
          success: { effects: { happy: 1, mischief: 1 }, log: '골목 끝에서 이웃 어른과 마주쳐 바로 집으로 돌아왔다.' },
          fail: { effects: { happy: -6, health: -2 }, log: '무서운 일을 겪을 뻔했다. 지나가던 어른이 구해 줬다.' } }
      ] },
    { id: 'rl_kid_gacha', age: [6, 12], decision: true, cooldown: 4,
      text: '학교 앞 뽑기 기계에 한정판 캡슐이 들어 있다고 한다.',
      choices: [
        { text: '동전을 넣어 본다', risky: true, bet: { odds: 0.3, mult: 2, stake: 'tiny', addict: 1 },
          success: { effects: { happy: 4 }, log: '한정판이 나왔다! 반 친구들이 몰려들었다.' },
          fail: { effects: { happy: -2 }, log: '똑같은 캡슐만 세 개째. 동전만 사라졌다.' } },
        { text: '그 돈으로 {food}[을/를] 사 먹는다', effects: { happy: 2, health: 1 }, log: '배가 든든하니 뽑기 생각이 사라졌다.' }
      ] },
    { id: 'rl_kid_picky', age: [5, 10], decision: true, cooldown: 4,
      text: '저녁 반찬에 제일 싫어하는 채소가 올라왔다.',
      choices: [
        { text: '눈 딱 감고 먹는다', effects: { health: 2, grit: 1, happy: -1 }, log: '생각보다 먹을 만했다. 칭찬도 받았다.' },
        { text: '몰래 식탁 밑에 숨긴다', risky: true, check: { odds: 0.5 },
          success: { effects: { happy: 2, mischief: 2 }, log: '완전 범죄였다. 아무도 몰랐다.' },
          fail: { effects: { happy: -3, mischief: 2 }, log: '청소하다 들켰다. 디저트가 사라졌다.' } },
        { text: '"한 입만 먹을게" 협상한다', effects: { social: 2 }, log: '딱 한 입. 협상은 성공이었다.' }
      ] },
    { id: 'rl_kid_game_time', age: [7, 12], decision: true, cooldown: 3,
      text: '게임 한 판만 더 하면 레벨이 오른다. 숙제는 아직이다.',
      choices: [
        { text: '숙제부터 한다', effects: { smarts: 2, happy: -1 }, log: '숙제를 끝내고 하니 마음이 편했다.' },
        { text: '딱 한 판만 더', risky: true, check: { odds: 0.4 },
          success: { effects: { happy: 4 }, log: '레벨 업! 숙제도 밤에 겨우 끝냈다.' },
          fail: { effects: { happy: -2, smarts: -1, mischief: 1 }, log: '한 판이 열 판이 됐다. 다음 날 숙제 검사에 걸렸다.' } },
        { text: '밖에 나가 공을 찬다', effects: { football: 2, health: 1 }, log: '해 질 때까지 골목에서 공을 찼다.' }
      ] },
    { id: 'rl_kid_bedtime', age: [5, 11], decision: true, cooldown: 4,
      text: '자야 할 시간인데 이불 속에서 만화책을 펼쳤다.',
      choices: [
        { text: '책을 덮고 잔다', effects: { health: 2, grit: 1 }, log: '푹 자고 개운하게 일어났다.' },
        { text: '손전등 켜고 끝까지 본다', risky: true, effects: { happy: 3, smarts: 1, health: -2, mischief: 1 }, log: '마지막 장까지 다 봤다. 아침엔 눈이 퉁퉁 부었다.' }
      ] },
    { id: 'rl_kid_found_wallet', age: [7, 14], decision: true, cooldown: 6,
      text: '{city} 길가에서 지갑을 주웠다. 안에 돈이 꽤 들어 있다.',
      choices: [
        { text: '경찰서에 가져다준다', effects: { rep: 4, social: 1, happy: 2 }, log: '주인이 찾아와 고맙다며 {food}[을/를] 사 줬다.' },
        { text: '돈만 슬쩍 챙긴다', risky: true, check: { odds: 0.6 },
          success: { effects: { money: 30, happy: 2, mischief: 4 }, log: '아무도 몰랐다. 그런데 며칠 동안 마음이 무거웠다.' },
          fail: { effects: { mischief: 4, rep: -6, happy: -4 }, log: 'CCTV에 찍혔다. 학교에 연락이 왔다.' } }
      ] },
    { id: 'rl_kid_sports_day', age: [6, 12], decision: true, cooldown: 3, cond: { edu: SCHOOL },
      text: '운동회 계주 대표를 뽑는다. 마지막 주자 자리가 비었다.',
      choices: [
        { text: '손을 번쩍 든다', check: { stat: 'grit', diff: 30 },
          success: { effects: { fame: 1, happy: 4, grit: 1 }, log: '역전 골인! 반 전체가 이름을 외쳤다.' },
          fail: { effects: { happy: -3, grit: 1 }, log: '코너에서 넘어졌다. 무릎보다 마음이 더 아팠다.' } },
        { text: '응원단을 맡는다', effects: { social: 2, happy: 2 }, log: '목이 쉬도록 응원했다.' }
      ] },
    { id: 'rl_kid_pet_beg', age: [6, 12], decision: true, cooldown: 6, cond: { flags: ['!has_pet'] },
      text: '친구네 강아지가 새끼를 낳았다. 한 마리 데려가도 된다고 한다.',
      choices: [
        { text: '매일 산책시키겠다고 약속한다', check: { stat: 'social', diff: 30 },
          success: { effects: { happy: 6, grit: 1, fx: ['adoptPet'] }, log: '허락이 떨어졌다! 새 가족이 생겼다.' },
          fail: { effects: { happy: -2 }, log: '"집이 좁아서 안 돼." 강아지는 사진으로만 봤다.' } },
        { text: '가끔 놀러 가서 본다', effects: { happy: 2, social: 1 }, log: '친구네 갈 때마다 강아지가 꼬리를 흔들었다.' }
      ] },
    { id: 'rl_kid_quit_lesson', age: [7, 12], decision: true, cooldown: 5,
      text: '다니던 피아노 학원이 지겨워졌다. 그만두고 싶다.',
      choices: [
        { text: '1년만 더 버틴다', effects: { grit: 3, smarts: 1, happy: -2 }, log: '1년 뒤 발표회에서 한 곡을 끝까지 쳤다.' },
        { text: '그만두고 축구 교실에 간다', effects: { football: 3, happy: 3, money: -10 }, log: '첫날부터 땀범벅이 됐다. 훨씬 즐거웠다.' },
        { text: '몰래 빼먹는다', risky: true, check: { odds: 0.4 },
          success: { effects: { happy: 3, mischief: 3 }, log: '한 달 동안 놀이터에서 놀았다. 아무도 몰랐다.' },
          fail: { effects: { happy: -4, mischief: 3, rep: -2 }, log: '학원 선생님의 전화 한 통에 모든 게 들통났다.' } }
      ] },
    { id: 'rl_kid_broken_window', age: [6, 13], decision: true, cooldown: 6,
      text: '공을 차다 옆집 유리창을 깼다. 아무도 못 본 것 같다.',
      choices: [
        { text: '초인종을 누르고 사과한다', effects: { rep: 4, grit: 1, money: -20 }, log: '옆집 할아버지가 "솔직해서 봐준다"며 웃었다.' },
        { text: '뒤도 안 보고 도망친다', risky: true, check: { odds: 0.5 },
          success: { effects: { mischief: 4, happy: 1 }, log: '무사히 도망쳤다. 그 뒤로 그 골목은 피해 다녔다.' },
          fail: { effects: { mischief: 4, rep: -5, money: -30 }, log: '공에 이름이 적혀 있었다. 변상에 사과까지 했다.' } }
      ] },
    { id: 'rl_kid_snack_shop', age: [6, 12], decision: true, cooldown: 3,
      text: '학교 앞 가게에서 색깔이 요란한 과자를 판다.',
      choices: [
        { text: '친구들과 나눠 사 먹는다', effects: { happy: 3, social: 1, health: -1 }, log: '혀가 파랗게 물들었다. 다 같이 깔깔 웃었다.' },
        { text: '집에 가서 과일을 먹는다', effects: { health: 2 }, log: '집에 오니 깎아 둔 과일이 있었다.' }
      ] },
    { id: 'rl_kid_secret_base', age: [7, 12], decision: true, cooldown: 5,
      text: '친구들이 공사장 옆 빈터에 비밀 기지를 만들자고 한다.',
      choices: [
        { text: '같이 만든다', risky: true, check: { odds: 0.6 },
          success: { effects: { happy: 5, social: 2, mischief: 2 }, log: '골판지 기지가 완성됐다. 여름 내내 아지트였다.' },
          fail: { effects: { health: -4, mischief: 2, happy: -1 }, log: '철근에 걸려 팔을 긁혔다. 기지는 그날로 철거됐다.' } },
        { text: '놀이터에 만들자고 한다', effects: { social: 2, happy: 2 }, log: '미끄럼틀 아래 기지도 나쁘지 않았다.' }
      ] },
    { id: 'rl_kid_friend_group', age: [8, 14], decision: true, cooldown: 4,
      text: '새 학년, 쉬는 시간마다 무리가 나뉜다. 어디에 낄까?',
      choices: [
        { text: '축구하는 친구들', effects: { football: 2, grit: 1, social: 1 }, log: '쉬는 시간 10분도 공을 찼다.' },
        { text: '공부 잘하는 친구들', effects: { smarts: 3, social: 1 }, log: '같이 문제를 풀다 보니 성적이 올랐다.' },
        { text: '노는 친구들', risky: true, effects: { happy: 4, social: 2, mischief: 4, smarts: -1 }, log: '매일이 소풍 같았다. 선생님 눈총도 늘었다.' }
      ] },
    { id: 'rl_kid_class_president', age: [9, 17], decision: true, cooldown: 3, cond: { edu: SCHOOL },
      text: '반장 선거가 다가온다. 친구가 나가 보라고 부추긴다.',
      choices: [
        { text: '공약을 준비해 출마한다', check: { stat: 'social', diff: 40 },
          success: { effects: { social: 3, rep: 4, fame: 1, happy: 3 }, log: '반장에 뽑혔다! 첫 공약은 "체육 시간 늘리기"였다.' },
          fail: { effects: { happy: -2, grit: 1 }, log: '두 표 차이로 떨어졌다. 그래도 연설은 멋졌다.' } },
        { text: '사탕을 돌려 표를 산다', risky: true, check: { odds: 0.45 },
          success: { effects: { rep: 1, fame: 1, mischief: 3, money: -10 }, log: '당선됐다. 사탕 덕인지는 아무도 모른다.' },
          fail: { effects: { rep: -5, mischief: 3, money: -10 }, log: '선생님께 들켜 후보 자격을 잃었다.' } },
        { text: '친구를 밀어 준다', effects: { social: 2, rel: { friend: 5 } }, log: '선거 운동원이 되어 목이 쉬었다.' }
      ] },
    { id: 'rl_kid_copy_homework', age: [8, 17], decision: true, cooldown: 3, cond: { edu: SCHOOL },
      text: '숙제를 깜빡했다. 짝꿍이 공책을 슬쩍 내민다.',
      choices: [
        { text: '베낀다', risky: true, check: { odds: 0.55 },
          success: { effects: { happy: 2, mischief: 2 }, log: '무사히 넘어갔다. 그런데 내용은 하나도 모른다.' },
          fail: { effects: { mischief: 2, rep: -3, smarts: -1 }, log: '틀린 답까지 똑같았다. 둘 다 교무실에 불려 갔다.' } },
        { text: '솔직히 안 했다고 말한다', effects: { rep: 2, happy: -2, grit: 1 }, log: '혼났지만 다음 날 두 배로 해 왔다.' },
        { text: '쉬는 시간에 급히 푼다', effects: { smarts: 1, grit: 1 }, log: '반만 했지만 내 힘으로 했다.' }
      ] },
    { id: 'rl_kid_study_or_play', age: [9, 18], decision: true, cooldown: 3, cond: { edu: SCHOOL },
      text: '내일이 시험이다. 친구들이 공원에서 축구 한 판 하자고 한다.',
      choices: [
        { text: '도서관에 남는다', effects: { smarts: 3, happy: -2 }, log: '시험지를 받는 순간 아는 문제가 보였다.' },
        { text: '딱 한 시간만 찬다', effects: { football: 1, smarts: 1, happy: 2 }, log: '머리를 식히고 오니 공부가 잘 됐다.' },
        { text: '밤까지 논다', risky: true, check: { odds: 0.35 },
          success: { effects: { happy: 5, football: 2 }, log: '찍은 문제가 다 맞았다. 운도 실력이다.' },
          fail: { effects: { happy: 2, smarts: -2, mischief: 1 }, log: '시험지 앞에서 머리가 하얘졌다.' } }
      ] },
    { id: 'rl_kid_club_pick', age: [9, 16], decision: true, cooldown: 4, cond: { edu: SCHOOL },
      text: '동아리 신청서를 내야 한다. 칸은 하나뿐이다.',
      choices: [
        { text: '{sportsClub}', effects: { football: 3, grit: 1 }, log: '방과 후마다 운동장이 내 차지였다.' },
        { text: '과학 탐구반', effects: { smarts: 3 }, log: '로켓을 만들어 쏘아 올렸다. 3층까지 날았다.' },
        { text: '밴드부', effects: { happy: 3, looks: 1, social: 1 }, log: '축제 무대에서 베이스를 쳤다. 손이 떨렸다.' },
        { text: '봉사 동아리', effects: { social: 3, rep: 3 }, log: '주말마다 동네 어르신들 장을 같이 봤다.' }
      ] },
    { id: 'rl_kid_field_trip', age: [10, 17], decision: true, cooldown: 3, cond: { edu: SCHOOL },
      text: '수학여행 첫날 밤. 친구들이 몰래 숙소를 빠져나가자고 한다.',
      choices: [
        { text: '같이 나간다', risky: true, check: { odds: 0.5 },
          success: { effects: { happy: 6, social: 2, mischief: 3 }, log: '밤바다를 보며 컵라면을 먹었다. 평생 못 잊을 밤이었다.' },
          fail: { effects: { mischief: 3, rep: -4, happy: -2 }, log: '현관에서 담임 선생님과 마주쳤다. 복도에서 손 들고 있었다.' } },
        { text: '방에서 베개 싸움을 한다', effects: { happy: 4, social: 1 }, log: '깃털이 날리는 방에서 새벽까지 웃었다.' },
        { text: '일찍 잔다', effects: { health: 2 }, log: '다음 날 혼자만 쌩쌩했다.' }
      ] },

    // ================================================================ teens (13-19)
    { id: 'rl_teen_smoke', age: [13, 30], decision: true, cooldown: 4, cond: { flags: ['!smoker'] },
      text: '뒷골목에서 아는 형이 담배를 내민다. "한 대 피워 봐."',
      choices: [
        { text: '받아서 피운다', risky: true, effects: { happy: 2, social: 2, mischief: 3, health: -3, flags: ['smoker'] }, log: '기침이 터졌지만 어른이 된 것 같았다. 그날부터 담배를 샀다.' },
        { text: '"난 공 차야 돼" 거절한다', effects: { health: 1, grit: 1 }, log: '형은 어깨를 으쓱했다. 폐가 고마워했다.' },
        { text: '자리를 피한다', effects: { social: -1 }, log: '조용히 빠져나왔다. 조금 어색해졌다.' }
      ] },
    { id: 'rl_teen_quit_smoke', age: [16, 70], decision: true, cooldown: 4, cond: { flags: ['smoker'] },
      text: '계단 몇 층에 숨이 찬다. 담배를 끊을 때가 된 것 같다.',
      choices: [
        { text: '오늘부터 끊는다', check: { stat: 'grit', diff: 45 },
          success: { effects: { health: 5, happy: 2, money: 300, unflags: ['smoker'] }, log: '석 달째 금연 중. 밥맛이 돌아왔다.' },
          fail: { effects: { happy: -3 }, log: '사흘 만에 다시 불을 붙였다.' } },
        { text: '금연 클리닉에 간다', effects: { health: 3, money: -50, unflags: ['smoker'] }, log: '패치를 붙이고 버텼다. 결국 끊었다.' },
        { text: '그냥 피운다', risky: true, effects: { happy: 1, health: -2, money: -200 }, log: '연기와 함께 결심도 날아갔다.' }
      ] },
    { id: 'rl_teen_crush', age: [13, 19], decision: true, cooldown: 3, cond: { rel: { partner: 'no', spouse: 'no' } },
      text: '같은 반 아이가 자꾸 눈에 들어온다. 고백할까?',
      choices: [
        { text: '쪽지로 마음을 전한다', check: { stat: 'social', diff: 40 },
          success: { effects: { happy: 6, fx: ['newPartner'] }, log: '답장에 하트가 그려져 있었다!' },
          fail: { effects: { happy: -4 }, log: '"우린 친구로 지내자." 쪽지는 서랍 속으로.' } },
        { text: '축제날 공개 고백한다', risky: true, check: { stat: 'looks', diff: 50 },
          success: { effects: { happy: 8, fame: 2, fx: ['newPartner'] }, log: '모두의 환호 속에 고개를 끄덕였다!' },
          fail: { effects: { happy: -7, rep: -2 }, log: '정적. 그날 영상이 학교에 다 퍼졌다.' } },
        { text: '마음속에만 둔다', effects: { happy: -1, smarts: 1 }, log: '일기장에만 이름을 적었다.' }
      ] },
    { id: 'rl_teen_parttime', age: [15, 19], decision: true, cooldown: 4, cond: { career: 'none' },
      text: '동네 편의점에서 주말 알바를 구한다는 공고가 붙었다.',
      choices: [
        { text: '지원한다', career: 'convenience_clerk', effects: { grit: 1, money: 50 }, log: '첫 월급으로 부모님께 {food}[을/를] 샀다.' },
        { text: '공부에 집중한다', effects: { smarts: 2 }, log: '돈 대신 시간을 택했다.' },
        { text: '친구와 중고 거래로 돈을 번다', risky: true, check: { odds: 0.45 },
          success: { effects: { money: 200, smarts: 1, happy: 3 }, log: '운동화를 되팔아 꽤 남겼다.' },
          fail: { effects: { money: -80, happy: -3 }, log: '가품이었다. 돈만 날렸다.' } }
      ] },
    { id: 'rl_teen_all_nighter', age: [13, 25], decision: true, cooldown: 3,
      text: '새 게임이 나왔다. 친구들이 오늘 밤 같이 밤새자고 한다.',
      choices: [
        { text: '밤새 달린다', risky: true, effects: { happy: 5, social: 2, health: -3, smarts: -1 }, log: '해가 뜰 때 엔딩을 봤다. 낮에는 좀비였다.' },
        { text: '자정에 끊고 잔다', effects: { happy: 2, health: 1 }, log: '적당히 즐기고 꿀잠을 잤다.' },
        { text: '아예 안 한다', effects: { smarts: 1, grit: 1, social: -1 }, log: '다음 날 대화에 끼지 못했다.' }
      ] },
    { id: 'rl_teen_first_drink', age: [17, 22], decision: true, cooldown: 3,
      text: '친구 생일 파티. 누군가 몰래 술을 꺼냈다.',
      choices: [
        { text: '한 잔 받는다', risky: true, check: { odds: 0.55 },
          success: { effects: { happy: 4, social: 2, alcohol: 4 }, log: '얼굴이 빨개졌지만 다 같이 노래를 불렀다.' },
          fail: { effects: { health: -3, alcohol: 5, rep: -3 }, log: '화장실에서 밤을 보냈다. 사진이 단톡방에 올라왔다.' } },
        { text: '음료수로 건배한다', effects: { social: 1, health: 1 }, log: '맨정신으로 모두를 집에 데려다줬다.' }
      ] },
    { id: 'rl_teen_dye_hair', age: [14, 19], decision: true, cooldown: 4,
      text: '머리를 밝은 색으로 염색해 보고 싶다. 교칙에는 걸린다.',
      choices: [
        { text: '과감하게 염색한다', risky: true, check: { odds: 0.5 },
          success: { effects: { looks: 3, happy: 4, fame: 1, mischief: 1 }, log: '학교에서 제일 눈에 띄는 머리가 됐다.' },
          fail: { effects: { looks: 1, mischief: 2, rep: -2, happy: -2 }, log: '교문 앞에서 걸려 바로 검게 덮었다.' } },
        { text: '방학 때까지 참는다', effects: { grit: 1 }, log: '방학 첫날 염색했다. 개학 전날 다시 검게.' }
      ] },
    { id: 'rl_teen_skip_school', age: [13, 18], decision: true, cooldown: 4, cond: { edu: ['middle', 'high'] },
      text: '날씨가 너무 좋다. 친구가 수업을 빼먹고 바다에 가자고 한다.',
      choices: [
        { text: '따라간다', risky: true, check: { odds: 0.45 },
          success: { effects: { happy: 6, social: 2, mischief: 3 }, log: '파도 소리를 들으며 하루를 보냈다. 들키지 않았다.' },
          fail: { effects: { mischief: 3, rep: -4, smarts: -1, fx: ['suspend'] }, log: '무단결석이 쌓여 정학을 받았다.' } },
        { text: '방과 후에 가자고 한다', effects: { happy: 3, social: 1 }, log: '노을 지는 바다도 꽤 멋졌다.' }
      ] },
    { id: 'rl_teen_cheat_exam', age: [13, 22], decision: true, cooldown: 4, cond: { edu: ['middle', 'high', 'univ'] },
      text: '기말고사 전날, 답안이 돈다는 소문이 들린다.',
      choices: [
        { text: '답안을 구한다', risky: true, check: { odds: 0.4 },
          success: { effects: { smarts: 1, happy: 3, mischief: 4 }, log: '성적은 올랐다. 내 실력은 아니었다.' },
          fail: { effects: { mischief: 4, rep: -6, fx: ['suspend'] }, log: '가짜 답안이었다. 게다가 들켜서 정학까지.' } },
        { text: '밤새 정면 돌파한다', effects: { smarts: 3, health: -1, grit: 1 }, log: '정직하게 받은 점수가 생각보다 괜찮았다.' }
      ] },
    { id: 'rl_teen_selfie', age: [13, 24], decision: true, cooldown: 4,
      text: 'SNS에 올린 영상이 조금씩 퍼지고 있다. 더 자극적으로 찍어 볼까?',
      choices: [
        { text: '위험한 묘기 영상을 찍는다', risky: true, check: { odds: 0.4 },
          success: { effects: { fame: 4, happy: 4 }, log: '조회수가 폭발했다. 학교에서 나를 알아본다.' },
          fail: { effects: { health: -5, rep: -2 }, log: '착지에 실패했다. 깁스한 사진만 남았다.' } },
        { text: '일상 브이로그를 꾸준히 올린다', effects: { fame: 1, social: 1, looks: 1 }, log: '구독자가 천천히 늘었다.' },
        { text: '계정을 비공개로 돌린다', effects: { happy: 1, smarts: 1 }, log: '알림이 꺼지니 마음이 조용해졌다.' }
      ] },
    { id: 'rl_teen_career_talk', age: [16, 19], decision: true, cooldown: 3, cond: { edu: ['high'] },
      text: '진로 상담 시간. 선생님이 원하는 길을 묻는다.',
      choices: [
        { text: '대학 진학에 올인한다', effects: { smarts: 3, happy: -2 }, log: '책상 앞에 목표 대학 이름을 붙였다.' },
        { text: '기술을 배워 바로 일한다', effects: { grit: 2, money: 100 }, log: '자격증 학원에 등록했다.' },
        { text: '하고 싶은 걸 찾을 때까지 방황한다', risky: true, effects: { happy: 3, smarts: -1, mischief: 1 }, log: '"아직 모르겠어요." 솔직한 대답이었다.' }
      ] },
    { id: 'rl_teen_motorbike', age: [16, 24], decision: true, cooldown: 5,
      text: '친구가 중고 오토바이를 싸게 넘기겠다고 한다.',
      choices: [
        { text: '산다', risky: true, check: { odds: 0.6 },
          success: { effects: { happy: 6, looks: 1, money: -400, mischief: 1 }, log: '{city} 해안도로를 달리며 바람을 맞았다.' },
          fail: { effects: { health: -8, money: -600, fx: ['injury'] }, log: '빗길에 미끄러졌다. 병원에서 한 달을 보냈다.' } },
        { text: '자전거로 만족한다', effects: { health: 2, grit: 1 }, log: '페달을 밟을수록 다리가 단단해졌다.' }
      ] },
    { id: 'rl_teen_cram', age: [12, 18], decision: true, cooldown: 4, cond: { edu: SCHOOL },
      text: '친구들이 다 다니는 학원이 있다. 학원비가 만만치 않다.',
      choices: [
        { text: '다닌다', effects: { smarts: 3, happy: -2, money: -300 }, log: '밤 10시 학원 버스가 일상이 됐다.' },
        { text: '인터넷 강의로 혼자 한다', effects: { smarts: 2, grit: 2 }, log: '혼자 하려니 의지가 필요했다. 그래도 해냈다.' },
        { text: '그 시간에 축구를 한다', effects: { football: 3, happy: 2, smarts: -1 }, log: '공부는 뒤처졌지만 슈팅이 매서워졌다.' }
      ] },
    { id: 'rl_teen_bully_watch', age: [11, 18], decision: true, cooldown: 4, cond: { edu: SCHOOL },
      text: '반 아이 몇 명이 한 친구의 가방을 뒤져 장난을 친다.',
      choices: [
        { text: '"그만해" 하고 막는다', check: { stat: 'grit', diff: 35 },
          success: { effects: { rep: 5, social: 2, grit: 1 }, log: '무리는 머쓱해하며 흩어졌다. 그 친구가 고맙다고 했다.' },
          fail: { effects: { health: -2, rep: 3, happy: -2 }, log: '밀쳐져 넘어졌다. 그래도 선생님이 사정을 알게 됐다.' } },
        { text: '같이 웃으며 낀다', risky: true, effects: { social: 1, mischief: 4, rep: -4 }, log: '무리에 끼었다. 집에 오는 길이 찜찜했다.' },
        { text: '선생님께 조용히 알린다', effects: { rep: 2, social: 1 }, log: '다음 날 상담이 열렸다. 장난은 멈췄다.' }
      ] },
    { id: 'rl_teen_diet', age: [14, 40], decision: true, cooldown: 4,
      text: '거울 속 모습이 마음에 들지 않는다. 다이어트를 해 볼까?',
      choices: [
        { text: '식단과 운동을 같이 한다', check: { stat: 'grit', diff: 40 },
          success: { effects: { looks: 3, health: 3, happy: 2 }, log: '석 달 만에 옷이 헐렁해졌다.' },
          fail: { effects: { happy: -2, health: 1 }, log: '일주일 만에 야식이 이겼다.' } },
        { text: '굶어서 빨리 뺀다', risky: true, check: { odds: 0.45 },
          success: { effects: { looks: 4, health: -2 }, log: '살은 빠졌다. 어지러움도 같이 왔다.' },
          fail: { effects: { health: -5, happy: -3 }, log: '요요가 왔다. 더 쪘다.' } },
        { text: '지금 모습도 괜찮다', effects: { happy: 3 }, log: '{food} 한 그릇에 행복을 느꼈다.' }
      ] },
    { id: 'rl_teen_exercise_habit', age: [13, 60], decision: true, cooldown: 4,
      text: '새벽 운동을 시작할까 고민 중이다. 알람은 늘 이긴다.',
      choices: [
        { text: '매일 새벽 달리기', effects: { health: 3, grit: 3, happy: -1 }, log: '석 달째. 계단이 더 이상 무섭지 않다.' },
        { text: '헬스장 연간 회원권을 끊는다', check: { stat: 'grit', diff: 45 },
          success: { effects: { health: 4, looks: 2, money: -300 }, log: '돈이 아까워서라도 꾸준히 나갔다.' },
          fail: { effects: { money: -300, happy: -2 }, log: '세 번 가고 끝났다. 헬스장 기부 천사가 됐다.' } },
        { text: '그냥 푹 잔다', effects: { happy: 2 }, log: '이불 속이 제일 좋다.' }
      ] },
    { id: 'rl_teen_save_or_shoes', age: [13, 19], decision: true, cooldown: 4,
      text: '모은 용돈으로 한정판 축구화를 살 수 있다. 저금도 아깝다.',
      choices: [
        { text: '축구화를 산다', effects: { happy: 5, football: 1, money: -150 }, log: '새 축구화를 신고 운동장에 섰다. 어깨가 올라갔다.' },
        { text: '은행 통장을 만든다', effects: { smarts: 2, money: 150 }, log: '통장에 찍힌 숫자가 신기했다.' },
        { text: '되팔 생각으로 두 켤레 산다', risky: true, check: { odds: 0.45 },
          success: { effects: { money: 200, happy: 3, smarts: 1 }, log: '한 켤레를 웃돈 받고 팔았다. 한 켤레는 공짜인 셈.' },
          fail: { effects: { money: -250, happy: -3 }, log: '재고가 풀려 값이 떨어졌다. 신발장만 꽉 찼다.' } }
      ] },
    { id: 'rl_teen_volunteer_or_job', age: [15, 19], decision: true, cooldown: 4,
      text: '방학 계획을 세워야 한다. 시간은 한정돼 있다.',
      choices: [
        { text: '해외 봉사를 간다', effects: { social: 3, rep: 3, money: -500, happy: 3 }, log: '처음 보는 아이들과 공을 찼다. 말이 안 통해도 웃었다.' },
        { text: '공장 단기 알바를 한다', effects: { grit: 3, money: 400, health: -1 }, log: '손이 거칠어진 만큼 통장이 두꺼워졌다.' },
        { text: '하루 종일 축구만 한다', effects: { football: 3, health: 1 }, log: '방학이 끝날 때 얼굴이 새까매졌다.' }
      ] },
    { id: 'rl_teen_tattoo', age: [17, 30], decision: true, cooldown: 5,
      text: '친구가 같이 우정 타투를 새기자고 한다.',
      choices: [
        { text: '크게 새긴다', risky: true, effects: { looks: 2, happy: 3, rep: -2, mischief: 2, money: -150, rel: { friend: 6 } }, log: '팔에 커다란 그림이 생겼다. 면접 때는 긴팔이다.' },
        { text: '작게 발목에만', effects: { happy: 2, money: -60, rel: { friend: 4 } }, log: '양말을 벗어야 보이는 비밀이 됐다.' },
        { text: '사진만 같이 찍자고 한다', effects: { social: 1, rel: { friend: 2 } }, log: '우정 사진이 액자에 걸렸다.' }
      ] },

    // ================================================================ adults: money
    { id: 'rl_rent_hike', age: [20, 64], decision: true, cooldown: 5, cond: { flags: ['!homeowner'] },
      text: '집주인이 다음 달부터 월세를 크게 올리겠다고 통보했다.',
      choices: [
        { text: '싼 동네로 이사한다', effects: { money: -500, happy: -2, grit: 1 }, log: '출근길은 멀어졌지만 지갑은 숨을 쉬었다.' },
        { text: '그냥 올려 주고 버틴다', effects: { money: -1500, happy: -1 }, log: '익숙한 동네를 지켰다. 대신 외식을 줄였다.' },
        { text: '집주인과 협상한다', check: { stat: 'social', diff: 45 },
          success: { effects: { money: -300, social: 2 }, log: '절반만 올리기로 했다. 말솜씨가 돈이 됐다.' },
          fail: { effects: { money: -1500, happy: -3 }, log: '"싫으면 나가세요." 대화는 1분 만에 끝났다.' } }
      ] },
    { id: 'rl_insurance', age: [22, 60], decision: true, cooldown: 6, cond: { flags: ['!insured'] },
      text: '보험 설계사가 실손 보험을 권한다. 매달 나가는 돈이 아깝다.',
      choices: [
        { text: '가입한다', effects: { money: -400, happy: 1, flags: ['insured'] }, log: '서명을 마치니 마음 한쪽이 든든했다.' },
        { text: '그 돈을 모아 비상금으로 둔다', effects: { money: 200, smarts: 1 }, log: '비상금 통장을 하나 만들었다.' },
        { text: '아직 젊으니 패스', risky: true, check: { odds: 0.7 },
          success: { effects: { money: 400, happy: 1 }, log: '아픈 데 없이 한 해가 지나갔다. 아낀 돈으로 여행을 갔다.' },
          fail: { effects: { money: -2500, health: -3 }, log: '맹장 수술을 했다. 병원비 고지서에 눈앞이 캄캄했다.' } }
      ] },
    { id: 'rl_save_or_invest', age: [22, 70], decision: true, cooldown: 4, cond: { money: [1000, 100000000] },
      text: '목돈이 조금 모였다. 친구들은 다들 주식 이야기뿐이다.',
      choices: [
        { text: '적금에 넣는다', effects: { money: 300, smarts: 1 }, log: '이자는 작아도 마음은 편했다.' },
        { text: '주식에 투자한다', risky: true, bet: { odds: 0.55, mult: 1.6, stake: 'medium', addict: 0 },
          success: { effects: { happy: 4, smarts: 1 }, log: '빨간 숫자가 떴다! 수익을 챙겨 나왔다.' },
          fail: { effects: { happy: -4 }, log: '파란 숫자만 가득했다. 손절하고 앱을 지웠다.' } },
        { text: '자기 계발에 쓴다', effects: { smarts: 3, money: -300 }, log: '자격증 강의를 끊었다. 미래의 나에게 투자했다.' }
      ] },
    { id: 'rl_credit_card', age: [20, 55], decision: true, cooldown: 4,
      text: '최신 휴대폰이 나왔다. 카드사가 24개월 무이자 할부를 내건다.',
      choices: [
        { text: '할부로 바로 산다', risky: true, effects: { happy: 4, looks: 1, money: -1200 }, log: '새 폰은 반짝였다. 매달 고지서도 반짝였다.' },
        { text: '쓰던 폰을 더 쓴다', effects: { money: 200, grit: 1 }, log: '배터리만 갈았더니 새것 같았다.' },
        { text: '중고로 한 세대 전 모델을 산다', effects: { happy: 2, money: -300, smarts: 1 }, log: '반값에 거의 같은 폰을 샀다.' }
      ] },
    { id: 'rl_debt_order', age: [22, 64], decision: true, cooldown: 5, cond: { money: [-100000000, 0] },
      text: '빚이 여기저기 흩어져 있다. 어디부터 갚을까?',
      choices: [
        { text: '이자 높은 것부터 갚는다', effects: { smarts: 2, money: 600, happy: -1 }, log: '이자 고지서가 하나씩 사라졌다.' },
        { text: '작은 빚부터 하나씩 없앤다', effects: { happy: 3, money: 300, grit: 1 }, log: '하나 끝낼 때마다 작은 해방감이 왔다.' },
        { text: '한 방으로 메우려 코인을 산다', risky: true, bet: { odds: 0.35, mult: 2.5, stake: 'small', addict: 3 },
          success: { effects: { happy: 5 }, log: '코인이 급등했다! 빚 일부를 단번에 갚았다.' },
          fail: { effects: { happy: -5 }, log: '코인은 반토막이 났다. 빚이 하나 늘었다.' } }
      ] },
    { id: 'rl_lend_friend', age: [18, 75], decision: true, cooldown: 5, cond: { rel: { friend: 'yes' } },
      text: '{friend}[이/가] 급하다며 돈을 빌려 달라고 한다.',
      choices: [
        { text: '선뜻 빌려준다', check: { odds: 0.55 },
          success: { effects: { rel: { friend: 8 }, social: 1 }, log: '석 달 뒤 {friend}[이/가] 이자까지 얹어 갚았다.' },
          fail: { effects: { money: -2000, rel: { friend: -10 }, happy: -4 }, log: '연락이 점점 뜸해졌다. 돈도 우정도 잃었다.' } },
        { text: '갚지 않아도 될 만큼만 준다', effects: { money: -300, rel: { friend: 4 }, social: 1 }, log: '"이건 선물이야." 부담 없는 액수였다.' },
        { text: '정중히 거절한다', effects: { rel: { friend: -4 } }, log: '{friend}[은/는] 알겠다고 했지만 서운해 보였다.' }
      ] },
    { id: 'rl_house_contract', age: [26, 60], decision: true, cooldown: 6, cond: { flags: ['!homeowner'], money: [5000, 100000000] },
      text: '마음에 드는 집이 나왔다. 대출을 끼면 계약할 수 있다.',
      choices: [
        { text: '대출받아 산다', effects: { happy: 5, fx: ['buyHouse'] }, log: '내 이름으로 된 열쇠를 받았다.' },
        { text: '전세로 몇 년 더 산다', effects: { money: -500, smarts: 1 }, log: '보증금을 맡기고 기회를 엿보기로 했다.' },
        { text: '집값이 오를 곳에 무리해서 산다', risky: true, check: { odds: 0.5 },
          success: { effects: { money: 8000, happy: 5, fx: ['buyHouse'] }, log: '2년 만에 집값이 뛰었다. 신의 한 수였다.' },
          fail: { effects: { money: -5000, happy: -6 }, log: '계약 직전 사기 매물이었다. 계약금을 날렸다.' } }
      ] },
    { id: 'rl_retire_fund', age: [40, 64], decision: true, cooldown: 5,
      text: '은퇴가 남의 일 같지 않다. 노후 자금을 어떻게 굴릴까?',
      choices: [
        { text: '연금 저축을 늘린다', effects: { money: -500, smarts: 1, happy: 1, flags: ['pension_saver'] }, log: '매달 조금씩 미래의 나에게 송금했다.' },
        { text: '지금 즐기며 산다', effects: { happy: 4, money: -800 }, log: '가족과 여행을 다녀왔다. 노후는 그때 생각하기로.' },
        { text: '고수익 상품에 넣는다', risky: true, bet: { odds: 0.45, mult: 1.8, stake: 'medium', addict: 1 },
          success: { effects: { happy: 3 }, log: '수익률이 꽤 좋았다. 노후 걱정이 조금 줄었다.' },
          fail: { effects: { happy: -5 }, log: '상품이 부실했다. 원금이 쪼그라들었다.' } }
      ] },
    { id: 'rl_side_hustle', age: [20, 55], decision: true, cooldown: 4, cond: { career: 'any' },
      text: '퇴근 후 시간이 남는다. 부업을 해 볼까?',
      choices: [
        { text: '주말 배달 알바', effects: { money: 1200, health: -2, grit: 2 }, log: '주말마다 {city} 골목을 누볐다.' },
        { text: '온라인 쇼핑몰을 연다', risky: true, check: { odds: 0.4 },
          success: { effects: { money: 4000, smarts: 2, happy: 3 }, log: '{food} 관련 굿즈가 대박이 났다!' },
          fail: { effects: { money: -1500, happy: -3 }, log: '재고만 산더미처럼 쌓였다.' } },
        { text: '쉬는 게 남는 거다', effects: { happy: 3, health: 1 }, log: '소파에서 영화 세 편을 봤다.' }
      ] },
    { id: 'rl_lottery_ticket', age: [20, 90], decision: true, cooldown: 4,
      text: '꿈에 돼지가 나왔다. 복권 판매점 앞을 지나간다.',
      choices: [
        { text: '복권 한 장 산다', bet: { odds: 0.1, mult: 5, stake: 'small', addict: 2 },
          success: { effects: { happy: 6 }, log: '5등... 아니 3등이다! 손이 떨렸다.' },
          fail: { effects: { happy: -1 }, log: '역시 꽝이다. 꿈은 그냥 꿈이었다.' } },
        { text: '열 장을 몰아 산다', risky: true, bet: { odds: 0.15, mult: 4, stake: 'medium', addict: 4 },
          success: { effects: { happy: 8, fame: 1 }, log: '당첨! 동네 판매점에 "1등 배출" 현수막이 붙었다.' },
          fail: { effects: { happy: -3 }, log: '열 장 모두 꽝. 다음 주를 기약했다.' } },
        { text: '그냥 지나간다', effects: { smarts: 1 }, log: '돼지꿈은 {food} 먹는 걸로 대신했다.' }
      ] },
    { id: 'rl_car_choice', age: [22, 65], decision: true, cooldown: 7, cond: { flags: ['!car_owner'], money: [3000, 100000000] },
      text: '차가 있으면 편할 것 같다. 어떤 차를 살까?',
      choices: [
        { text: '튼튼한 중고차', effects: { happy: 3, money: -2000, fx: ['buyCar'] }, log: '조금 낡았지만 잘 달렸다.' },
        { text: '번쩍이는 외제 신차', risky: true, effects: { happy: 6, looks: 2, fame: 1, money: -9000, fx: ['buyCar'] }, log: '시동을 걸 때마다 뿌듯했다. 할부는 5년이다.' },
        { text: '대중교통으로 버틴다', effects: { health: 1, money: 300 }, log: '걷는 시간이 늘어 몸이 가벼워졌다.' }
      ] },

    // ================================================================ adults: health
    { id: 'rl_drinking_night', age: [20, 64], decision: true, cooldown: 3,
      text: '회식 2차, 3차로 이어진다. "한 잔만 더!"',
      choices: [
        { text: '끝까지 달린다', risky: true, check: { odds: 0.5 },
          success: { effects: { social: 3, happy: 3, alcohol: 5, rep: 2 }, log: '상사와 어깨동무를 했다. 다음 날 프로젝트를 맡았다.' },
          fail: { effects: { health: -4, alcohol: 6, rep: -4 }, log: '길에서 잠들었다. 기억은 없고 사진만 남았다.' } },
        { text: '1차만 하고 빠진다', effects: { health: 1, social: -1 }, log: '조용히 택시를 탔다. 아침이 상쾌했다.' },
        { text: '술 대신 노래방만 간다', effects: { happy: 3, social: 2 }, log: '맨정신으로 부른 노래가 제일 신났다.' }
      ] },
    { id: 'rl_cut_drinking', age: [25, 75], decision: true, cooldown: 4, cond: { traits: { alcohol: [35, 100] } },
      text: '아침마다 손이 떨린다. 술을 줄여야 할 것 같다.',
      choices: [
        { text: '치료 프로그램에 등록한다', effects: { money: -500, happy: -1, fx: ['rehab'] }, log: '모임에서 처음으로 솔직하게 털어놓았다.' },
        { text: '혼자 줄여 본다', check: { stat: 'grit', diff: 50 },
          success: { effects: { alcohol: -15, health: 3 }, log: '석 달째 맥주 한 캔도 안 마셨다.' },
          fail: { effects: { alcohol: 3, happy: -3 }, log: '금요일 저녁에 무너졌다.' } },
        { text: '아직 괜찮다', risky: true, effects: { alcohol: 4, happy: 1, health: -2 }, log: '오늘도 냉장고 문을 열었다.' }
      ] },
    { id: 'rl_overtime', age: [20, 64], decision: true, cooldown: 3, cond: { career: 'any' },
      text: '마감이 내일이다. 오늘 밤을 새우면 끝낼 수 있다.',
      choices: [
        { text: '밤을 새운다', risky: true, check: { odds: 0.55 },
          success: { effects: { health: -2, rep: 3, money: 500, fx: ['promote'] }, log: '새벽 5시에 완성. 결과물이 인정받아 승진했다.' },
          fail: { effects: { health: -4, happy: -3 }, log: '졸다가 실수했다. 다시 해야 했다.' } },
        { text: '자고 일찍 출근한다', effects: { health: 1, smarts: 1 }, log: '맑은 머리로 두 시간 만에 끝냈다.' },
        { text: '마감 연장을 요청한다', effects: { rep: -1, happy: 1 }, log: '하루 더 받았다. 대신 눈치도 받았다.' }
      ] },
    { id: 'rl_checkup', age: [30, 90], decision: true, cooldown: 4,
      text: '건강검진 안내문이 왔다. 귀찮아서 미뤄 둔 지 2년째다.',
      choices: [
        { text: '정밀 검진을 받는다', check: { odds: 0.8 },
          success: { effects: { health: 2, money: -200, happy: 1 }, log: '모두 정상. 의사가 운동만 더 하라고 했다.' },
          fail: { effects: { money: -400, health: 1, fx: ['getSick', 'cure'] }, log: '초기 질환이 발견됐다. 일찍 찾아서 금방 치료했다.' } },
        { text: '또 미룬다', risky: true, check: { odds: 0.7 },
          success: { effects: { money: 100 }, log: '올해도 별일 없었다. 운이 좋았다.' },
          fail: { effects: { health: -6, money: -1500, fx: ['getSick'] }, log: '참다 참다 병원에 갔다. 너무 늦었다는 말을 들었다.' } }
      ] },
    { id: 'rl_skip_doctor', age: [20, 80], decision: true, cooldown: 4,
      text: '며칠째 배가 쿡쿡 쑤신다. 병원에 갈까?',
      choices: [
        { text: '오늘 바로 간다', effects: { money: -100, health: 2 }, log: '가벼운 위염이었다. 약 먹고 나았다.' },
        { text: '약국 약으로 버틴다', risky: true, check: { odds: 0.6 },
          success: { effects: { money: 50 }, log: '사흘 만에 괜찮아졌다.' },
          fail: { effects: { health: -6, money: -800 }, log: '응급실에 실려 갔다. 진작 갈걸.' } }
      ] },
    { id: 'rl_sleep_vs_grind', age: [20, 50], decision: true, cooldown: 4,
      text: '요즘 하루 네 시간씩 잔다. 성과는 나지만 몸이 무겁다.',
      choices: [
        { text: '여덟 시간 수면을 지킨다', effects: { health: 3, happy: 2, money: -200 }, log: '일은 조금 줄었지만 얼굴에 생기가 돌았다.' },
        { text: '이번 분기만 더 버틴다', risky: true, check: { odds: 0.5 },
          success: { effects: { money: 1500, rep: 2, health: -3 }, log: '목표를 달성해 성과급을 받았다.' },
          fail: { effects: { health: -6, happy: -4 }, log: '출근길에 쓰러졌다. 한 달을 쉬었다.' } }
      ] },

    // ================================================================ adults: relationships
    { id: 'rl_confess', age: [20, 45], decision: true, cooldown: 3, cond: { rel: { partner: 'no', spouse: 'no' } },
      text: '자주 마주치는 사람이 있다. 오늘은 먼저 말을 걸어 볼까?',
      choices: [
        { text: '커피 한 잔 하자고 한다', check: { stat: 'social', diff: 40 },
          success: { effects: { happy: 6, fx: ['newPartner'] }, log: '커피 한 잔이 저녁 식사가 됐다. 연애가 시작됐다.' },
          fail: { effects: { happy: -3 }, log: '"죄송해요, 만나는 사람 있어요." 씁쓸했다.' } },
        { text: '외모에 기대 과감히 다가간다', risky: true, check: { stat: 'looks', diff: 50 },
          success: { effects: { happy: 7, looks: 1, fx: ['newPartner'] }, log: '눈이 마주친 순간 통했다.' },
          fail: { effects: { happy: -5, rep: -1 }, log: '어색한 웃음만 남겼다.' } },
        { text: '소개팅 앱을 깐다', effects: { happy: 1, social: 1 }, log: '스와이프만 하다 하루가 갔다.' }
      ] },
    { id: 'rl_move_in_marry', age: [22, 50], decision: true, cooldown: 3, cond: { rel: { partner: 'yes', spouse: 'no' } },
      text: '{partner}[과/와] 만난 지 꽤 됐다. 다음 단계를 이야기할 때다.',
      choices: [
        { text: '청혼한다', check: { stat: 'social', diff: 35 },
          success: { effects: { money: -3000, fx: ['marry'] }, log: '{partner}[이/가] 반지를 보고 울음을 터뜨렸다.' },
          fail: { effects: { happy: -4, rel: { partner: -5 } }, log: '"조금만 더 생각해 보자." 반지는 서랍에 들어갔다.' } },
        { text: '먼저 같이 살아 본다', effects: { happy: 4, money: 500, rel: { partner: 6 }, flags: ['cohabit'] }, log: '칫솔 두 개가 나란히 놓였다.' },
        { text: '아직은 이르다', effects: { rel: { partner: -3 }, smarts: 1 }, log: '{partner}[은/는] 고개를 끄덕였지만 말이 줄었다.' }
      ] },
    { id: 'rl_temptation_partner', age: [18, 50], decision: true, cooldown: 5, cond: { rel: { partner: 'yes' } },
      text: '모임에서 만난 사람이 노골적으로 호감을 표한다. {partner}[은/는] 출장 중이다.',
      choices: [
        { text: '선을 긋고 집에 간다', effects: { rep: 2, rel: { partner: 4 } }, log: '{partner}에게 전화를 걸었다. 목소리가 반가웠다.' },
        { text: '몰래 만난다', risky: true, check: { odds: 0.45 },
          success: { effects: { happy: 4, mischief: 4, rep: -1 }, log: '들키지 않았다. 그런데 거울을 보기가 싫었다.' },
          fail: { effects: { happy: -8, rep: -6, mischief: 4, fx: ['breakup'] }, log: '메시지를 들켰다. {partner}[은/는] 짐을 싸서 나갔다.' } }
      ] },
    { id: 'rl_temptation_spouse', age: [25, 70], decision: true, cooldown: 6, cond: { rel: { spouse: 'yes' } },
      text: '옛 연인에게서 "한번 볼래?" 하는 연락이 왔다.',
      choices: [
        { text: '답장하지 않는다', effects: { rep: 1, rel: { spouse: 3 } }, log: '메시지를 지우고 {spouse}[과/와] 산책을 나갔다.' },
        { text: '{spouse}에게 털어놓는다', effects: { rel: { spouse: 6 }, social: 1 }, log: '{spouse}[이/가] "말해 줘서 고마워"라고 했다.' },
        { text: '몰래 만난다', risky: true, check: { odds: 0.4 },
          success: { effects: { happy: 3, mischief: 5, rep: -2 }, log: '추억 이야기만 했다. 그래도 비밀이 하나 생겼다.' },
          fail: { effects: { happy: -10, rep: -8, mischief: 5, fx: ['divorce'] }, log: '{spouse}[이/가] 모든 걸 알게 됐다. 결국 이혼 서류에 도장을 찍었다.' } }
      ] },
    { id: 'rl_marriage_crisis', age: [28, 75], decision: true, cooldown: 6, cond: { rel: { spouse: 'yes' } },
      text: '{spouse}[과/와] 대화가 사라진 지 오래다. 집 안 공기가 무겁다.',
      choices: [
        { text: '부부 상담을 받는다', check: { stat: 'social', diff: 35 },
          success: { effects: { money: -500, happy: 4, rel: { spouse: 12 } }, log: '오래 묵은 서운함을 털어놓았다. 다시 손을 잡았다.' },
          fail: { effects: { money: -500, happy: -2, rel: { spouse: -4 } }, log: '상담실에서도 싸웠다. 갈 길이 멀다.' } },
        { text: '아이들 생각해 참고 산다', effects: { happy: -4, grit: 2, rel: { spouse: -2 } }, log: '평온한 척하는 하루가 이어졌다.' },
        { text: '이혼을 결심한다', risky: true, effects: { happy: 2, fx: ['divorce'] }, log: '서로를 위해 내린 결정이었다. 그래도 아팠다.' }
      ] },
    { id: 'rl_have_kid', age: [25, 45], decision: true, cooldown: 4, cond: { rel: { spouse: 'yes' } },
      text: '{spouse}[과/와] 아이 이야기를 나눈다. 둘 다 마음이 반반이다.',
      choices: [
        { text: '가족을 늘리자', check: { odds: 0.7 },
          success: { effects: { happy: 3, money: -1000, fx: ['haveChild'] }, log: '집에 작은 울음소리가 생겼다.' },
          fail: { effects: { happy: -2, rel: { spouse: 3 } }, log: '올해는 소식이 없었다. 서로를 다독였다.' } },
        { text: '둘만의 삶을 즐긴다', effects: { happy: 3, money: 500, rel: { spouse: 3 } }, log: '둘이서 {food} 맛집 투어를 떠났다.' }
      ] },
    { id: 'rl_kid_education', age: [30, 60], decision: true, cooldown: 4, cond: { rel: { children: 'yes' } },
      text: '{child}의 교육 방향을 정해야 한다. 주변은 다 학원에 보낸다.',
      choices: [
        { text: '학원을 여러 개 보낸다', effects: { money: -2000, happy: -1, rel: { children: -3 } }, log: '{child}의 성적은 올랐지만 웃음이 줄었다.' },
        { text: '하고 싶은 걸 하게 둔다', effects: { happy: 3, rel: { children: 6 } }, log: '{child}[이/가] 그림 그리기에 푹 빠졌다.' },
        { text: '같이 책을 읽는 시간을 만든다', effects: { smarts: 1, money: -100, rel: { children: 5 } }, log: '저녁마다 둘이서 한 권씩 읽었다.' }
      ] },
    { id: 'rl_kid_football', age: [30, 60], decision: true, cooldown: 5, cond: { rel: { children: 'yes' } },
      text: '{child}[이/가] 축구를 하고 싶다고 조른다. 유소년 클럽 회비가 꽤 든다.',
      choices: [
        { text: '{localClub}에 보낸다', effects: { money: -800, happy: 3, rel: { children: 8 } }, log: '주말마다 사이드라인에서 목이 쉬었다.' },
        { text: '직접 가르친다', effects: { football: 1, happy: 4, rel: { children: 6 } }, log: '공원에서 기본기부터 가르쳤다. 둘 다 흙투성이가 됐다.' },
        { text: '공부가 먼저라고 한다', effects: { rel: { children: -5 } }, log: '{child}[은/는] 축구공을 방구석에 뒀다.' }
      ] },
    { id: 'rl_care_mother', age: [35, 75], decision: true, cooldown: 5, cond: { rel: { mother: 'alive' } },
      text: '{mother}[이/가] 혼자 지내기 힘들어 보인다. 무릎도 많이 약해졌다.',
      choices: [
        { text: '집으로 모신다', effects: { money: -1000, happy: -1, rel: { mother: 12 }, rep: 3 }, log: '{mother}[이/가] 차려 준 {food} 냄새가 집에 퍼졌다.' },
        { text: '매달 생활비를 보낸다', effects: { money: -1500, rel: { mother: 5 } }, log: '통화 끝에 "고맙다"는 말이 붙었다.' },
        { text: '바쁘다며 미룬다', risky: true, effects: { money: 300, rel: { mother: -10 }, rep: -3, happy: -2 }, log: '전화를 걸 때마다 목소리가 작아졌다.' }
      ] },
    { id: 'rl_care_father', age: [35, 75], decision: true, cooldown: 5, cond: { rel: { father: 'alive' } },
      text: '{father}[이/가] 병원 가는 날마다 길을 헤맨다. 누군가 곁에 있어야 한다.',
      choices: [
        { text: '휴가를 내고 함께 다닌다', effects: { money: -500, rel: { father: 10 }, happy: 1 }, log: '진료실 앞에서 오랜만에 긴 이야기를 나눴다.' },
        { text: '형제들과 순번을 정한다', check: { stat: 'social', diff: 35 },
          success: { effects: { social: 2, rel: { father: 5, siblings: 4 } }, log: '단톡방에 깔끔한 표가 올라왔다.' },
          fail: { effects: { rel: { siblings: -6 }, happy: -2 }, log: '누가 더 했느니 하며 언성이 높아졌다.' } },
        { text: '간병인을 쓴다', effects: { money: -2000, rel: { father: 2 } }, log: '마음은 편했지만 지갑이 얇아졌다.' }
      ] },
    { id: 'rl_inheritance', age: [35, 85], decision: true, once: true, cond: { rel: { father: 'dead', bro: 'alive' } },
      text: '남겨진 집을 두고 {bro}[과/와] 의견이 갈린다.',
      choices: [
        { text: '공평하게 나눈다', effects: { money: 3000, rel: { bro: 3 }, rep: 2 }, log: '서운함은 있어도 의는 상하지 않았다.' },
        { text: '{bro}에게 양보한다', effects: { rel: { bro: 12 }, happy: 2, rep: 3 }, log: '{bro}[이/가] 말없이 어깨를 두드렸다.' },
        { text: '소송까지 간다', risky: true, check: { odds: 0.5 },
          success: { effects: { money: 9000, rel: { bro: -25 }, rep: -3 }, log: '재판에서 이겼다. 명절에 볼 얼굴은 잃었다.' },
          fail: { effects: { money: -3000, rel: { bro: -25 }, happy: -5, rep: -3 }, log: '소송비만 날렸다. 형제의 연도 끊겼다.' } }
      ] },
    { id: 'rl_pet_adopt', age: [20, 75], decision: true, cooldown: 6, cond: { flags: ['!has_pet'] },
      text: '유기동물 보호소 앞을 지나다 눈이 마주친 강아지가 있다.',
      choices: [
        { text: '입양한다', effects: { happy: 5, money: -400, fx: ['adoptPet'] }, log: '집에 돌아오면 반겨 주는 존재가 생겼다.' },
        { text: '봉사만 다닌다', effects: { social: 2, rep: 2 }, log: '주말마다 산책 봉사를 했다.' }
      ] },
    { id: 'rl_office_gossip', age: [22, 62], decision: true, cooldown: 4, cond: { career: 'any' },
      text: '동료들이 팀장 뒷담화 단톡방에 초대했다.',
      choices: [
        { text: '같이 맞장구친다', risky: true, check: { odds: 0.55 },
          success: { effects: { social: 2, happy: 2, mischief: 2 }, log: '동료들과 부쩍 가까워졌다.' },
          fail: { effects: { rep: -6, happy: -4, fx: ['demote'] }, log: '캡처가 팀장에게 넘어갔다. 분위기가 싸늘해졌다.' } },
        { text: '조용히 나간다', effects: { rep: 1, social: -1 }, log: '"쟤 왜 저래" 소리가 들렸지만 마음은 편했다.' }
      ] },
    { id: 'rl_job_offer', age: [24, 60], decision: true, cooldown: 5, cond: { career: 'any' },
      text: '경쟁사에서 연봉을 더 주겠다며 이직을 제안한다.',
      choices: [
        { text: '옮긴다', risky: true, check: { odds: 0.6 },
          success: { effects: { money: 3000, happy: 3, fx: ['promote'] }, log: '새 직장에서 직급도 한 단계 올랐다.' },
          fail: { effects: { happy: -4, fx: ['quitJob'] }, log: '입사 직전 제안이 취소됐다. 이미 사표는 냈다.' } },
        { text: '제안서를 들고 연봉 협상한다', check: { stat: 'social', diff: 45 },
          success: { effects: { money: 1500, rep: 1 }, log: '회사가 붙잡았다. 연봉이 올랐다.' },
          fail: { effects: { rep: -2 }, log: '"그럼 가시든가요." 머쓱하게 자리로 돌아왔다.' } },
        { text: '지금 자리에 만족한다', effects: { happy: 1, grit: 1 }, log: '익숙한 책상이 좋다.' }
      ] },
    { id: 'rl_start_business', age: [25, 60], decision: true, cooldown: 6,
      text: '오래 꿈꿔 온 가게 자리가 났다. 지금 아니면 못 할 것 같다.',
      choices: [
        { text: '퇴직금 걸고 창업한다', risky: true, career: 'entrepreneur', effects: { money: -3000, happy: 4, grit: 2 }, log: '간판을 달던 날 손이 떨렸다.' },
        { text: '작은 가게부터 시작한다', career: 'restaurant_owner', effects: { money: -1500, happy: 3 }, log: '테이블 네 개짜리 {food} 가게를 열었다.' },
        { text: '꿈은 꿈으로 둔다', effects: { happy: -2, money: 300 }, log: '가게 자리에 다른 간판이 걸렸다.' }
      ] },
    { id: 'rl_quit_job_dream', age: [26, 55], decision: true, cooldown: 6, cond: { career: 'any' },
      text: '출근길마다 숨이 막힌다. 다 내려놓고 쉬고 싶다.',
      choices: [
        { text: '사표를 던지고 1년 쉰다', risky: true, effects: { happy: 6, health: 3, money: -3000, fx: ['quitJob'] }, log: '1년 동안 {country} 구석구석을 걸었다.' },
        { text: '휴직 제도를 쓴다', effects: { happy: 3, health: 2, money: -1000 }, log: '석 달 쉬고 돌아오니 일이 다시 보였다.' },
        { text: '조금만 더 버틴다', effects: { grit: 2, happy: -3, money: 500 }, log: '오늘도 지하철에 몸을 실었다.' }
      ] },

    // ================================================================ moving / service
    { id: 'rl_move_bigcity', age: [19, 45], decision: true, cooldown: 6,
      text: '{bigcity}에 가면 기회가 많다고들 한다. 짐을 쌀까?',
      choices: [
        { text: '{bigcity}[으로/로] 올라간다', risky: true, check: { odds: 0.55 },
          success: { effects: { money: 2000, smarts: 2, happy: 2, flags: ['moved_bigcity'] }, log: '좁은 원룸에서 시작했지만 일이 잘 풀렸다.' },
          fail: { effects: { money: -1500, happy: -4, flags: ['moved_bigcity'] }, log: '월세와 외로움에 지쳤다.' } },
        { text: '{city}에 남는다', effects: { happy: 2, social: 1 }, log: '익숙한 골목, 익숙한 얼굴들. 그것도 행복이다.' }
      ] },
    { id: 'rl_emigrate', age: [22, 55], decision: true, cooldown: 7, cond: { flags: ['!abroad'] },
      text: '해외에 사는 지인이 그쪽에서 일자리를 알아봐 주겠다고 한다.',
      choices: [
        { text: '이민을 결심한다', risky: true, check: { odds: 0.6 },
          success: { effects: { happy: 4, smarts: 2, money: 1000, fx: ['moveAbroad'] }, log: '공항에서 {food}[을/를] 마지막으로 먹었다. 새 삶이 시작됐다.' },
          fail: { effects: { money: -2000, happy: -4 }, log: '비자가 거절됐다. 비행기표만 남았다.' } },
        { text: '1년만 워킹홀리데이로 간다', effects: { happy: 4, social: 2, money: -500 }, log: '세상이 넓다는 걸 배우고 돌아왔다.' },
        { text: '{country}에 남는다', effects: { happy: 1 }, log: '고마운 제안이었지만 여기가 내 자리다.' }
      ] },
    { id: 'rl_return_home', age: [30, 70], decision: true, cooldown: 7,
      text: '도시 생활에 지쳤다. {hometown}[으로/로] 돌아갈까?',
      choices: [
        { text: '고향으로 내려간다', effects: { happy: 5, health: 2, money: -800, unflags: ['moved_bigcity'] }, log: '{hometown}의 바람 냄새는 그대로였다.' },
        { text: '주말에만 다녀온다', effects: { happy: 2, money: -200 }, log: '두 집 살림 같은 주말이 이어졌다.' },
        { text: '여기서 끝까지 버틴다', effects: { grit: 2, money: 500 }, log: '도시의 불빛 속에 다시 출근했다.' }
      ] },
    { id: 'rl_volunteer_service', age: [18, 28], countries: NOT_KR, decision: true, cooldown: 5, cond: { flags: ['!mil_done'] },
      text: '군 모병관이 학교 앞에서 지원병을 모집한다. 학비 지원도 있다고 한다.',
      choices: [
        { text: '입대한다', effects: { grit: 3, health: 2, rep: 2, fx: ['enlist'] }, log: '머리를 짧게 깎았다. 새벽 기상이 시작됐다.' },
        { text: '예비군 훈련만 받는다', effects: { grit: 2, money: 300 }, log: '주말마다 훈련장에 나갔다.' },
        { text: '내 길을 간다', effects: { happy: 1 }, log: '모병관의 전단지를 정중히 돌려줬다.' }
      ] },

    // ================================================================ old age (65+)
    { id: 'rl_old_grandkids', age: [58, 95], decision: true, cooldown: 4, cond: { rel: { children: 'yes' } },
      text: '{child}[이/가] 맞벌이라며 손주를 봐 줄 수 있냐고 묻는다.',
      choices: [
        { text: '기꺼이 돌본다', effects: { happy: 4, health: -2, rel: { children: 8 } }, log: '손주가 "할머니 할아버지 최고!" 하고 안겼다.' },
        { text: '주 이틀만 맡는다', effects: { happy: 2, rel: { children: 4 } }, log: '나머지 날엔 내 시간을 지켰다.' },
        { text: '내 인생도 있다며 거절한다', effects: { happy: 1, rel: { children: -6 } }, log: '{child}[은/는] 서운한 얼굴로 돌아갔다.' }
      ] },
    { id: 'rl_old_will', age: [65, 100], decision: true, cooldown: 6,
      text: '변호사가 유언장을 미리 써 두라고 권한다.',
      choices: [
        { text: '꼼꼼하게 써 둔다', effects: { smarts: 1, money: -200, happy: 2, flags: ['has_will'] }, log: '봉투를 봉하니 마음이 홀가분했다.' },
        { text: '전 재산을 기부하겠다고 쓴다', effects: { rep: 8, fame: 2, happy: 3, flags: ['has_will'] }, log: '소문이 퍼져 지역 신문에 실렸다.' },
        { text: '아직 멀었다며 미룬다', risky: true, effects: { happy: 1 }, log: '"내가 얼마나 오래 살 건데." 웃어넘겼다.' }
      ] },
    { id: 'rl_old_silver_job', age: [62, 80], decision: true, cooldown: 5, cond: { career: 'none' },
      text: '주민센터에서 어르신 일자리를 모집한다.',
      choices: [
        { text: '건물 청소 일을 한다', career: 'cleaner', effects: { health: 1, happy: 2 }, log: '아침마다 갈 곳이 생겼다.' },
        { text: '전단 배포 일을 한다', career: 'flyer_parttime', effects: { health: 2 }, log: '{city} 골목을 걸으며 만보를 채웠다.' },
        { text: '쉬면서 손주들 본다', effects: { happy: 2 }, log: '일은 젊은이들 몫이다.' }
      ] },
    { id: 'rl_old_scam_call', age: [60, 100], decision: true, cooldown: 4,
      text: '"고객님 계좌가 범죄에 연루됐습니다." 수상한 전화가 왔다.',
      choices: [
        { text: '끊고 은행에 직접 확인한다', effects: { smarts: 1, rep: 1 }, log: '역시 사기였다. 은행 직원이 잘하셨다고 했다.' },
        { text: '시키는 대로 해 본다', risky: true, check: { odds: 0.15 },
          success: { effects: { money: 200, happy: 1 }, log: '알고 보니 진짜 환급금 안내였다. 이번엔 운이 좋았다.' },
          fail: { effects: { happy: -6, fx: ['scam'] }, log: '송금 버튼을 누른 순간 전화가 끊겼다.' } },
        { text: '사기꾼을 붙잡고 훈계한다', effects: { happy: 3, social: 1 }, log: '20분간 설교했더니 상대가 먼저 끊었다.' }
      ] },
    { id: 'rl_old_remarry_meet', age: [60, 90], decision: true, cooldown: 4, cond: { rel: { partner: 'no', spouse: 'no' } },
      text: '복지관 노래 교실에 늘 옆자리에 앉는 분이 있다.',
      choices: [
        { text: '식사 한번 하자고 한다', check: { stat: 'social', diff: 35 },
          success: { effects: { happy: 6, fx: ['newPartner'] }, log: '{food} 한 그릇에 이야기가 끝없이 이어졌다.' },
          fail: { effects: { happy: -2 }, log: '"자식들 눈치가 보여서요." 정중한 거절이었다.' } },
        { text: '노래만 열심히 한다', effects: { happy: 2, health: 1 }, log: '목청이 트이니 기분도 트였다.' }
      ] },
    { id: 'rl_old_remarry', age: [60, 95], decision: true, cooldown: 4, cond: { rel: { partner: 'yes', spouse: 'no' } },
      text: '{partner}[과/와] 함께하는 노년이 즐겁다. 재혼 이야기가 나온다.',
      choices: [
        { text: '조촐하게 재혼한다', effects: { happy: 5, money: -800, fx: ['marry'] }, log: '가까운 사람들만 모여 축하해 줬다.' },
        { text: '혼인 신고 없이 함께 산다', effects: { happy: 3, rel: { partner: 5 } }, log: '서류보다 매일의 아침이 중요했다.' },
        { text: '각자 집에서 지내며 만난다', effects: { happy: 2, rel: { partner: 2 } }, log: '적당한 거리가 오히려 좋았다.' }
      ] },
    { id: 'rl_old_license', age: [70, 100], decision: true, cooldown: 5, cond: { flags: ['car_owner'] },
      text: '최근 주차하다 기둥을 두 번 긁었다. 운전면허를 반납할까?',
      choices: [
        { text: '반납하고 버스를 탄다', effects: { health: 1, rep: 2, unflags: ['car_owner'], money: 500 }, log: '차를 팔고 교통카드를 받았다.' },
        { text: '아직 쌩쌩하다며 계속 운전한다', risky: true, check: { odds: 0.6 },
          success: { effects: { happy: 2 }, log: '조심조심 시장까지 잘 다녀왔다.' },
          fail: { effects: { health: -6, money: -2000, rep: -3 }, log: '신호를 놓쳐 접촉 사고를 냈다.' } }
      ] },
    { id: 'rl_old_leading_room', age: [60, 95], decision: true, cooldown: 5, cond: { money: [1000, 100000000] },
      text: '"원금 보장, 월 10% 수익!" 주식 리딩방 초대 문자가 왔다.',
      choices: [
        { text: '조금만 넣어 본다', risky: true, bet: { odds: 0.25, mult: 2.5, stake: 'big', addict: 2 },
          success: { effects: { happy: 4 }, log: '진짜로 수익이 났다. 바로 빼서 다시는 안 들어갔다.' },
          fail: { effects: { happy: -6, rep: -1 }, log: '방이 사라졌다. 신고했지만 돈은 돌아오지 않았다.' } },
        { text: '바로 차단한다', effects: { smarts: 1 }, log: '세상에 공짜 수익은 없다.' }
      ] },
    { id: 'rl_old_garden_trip', age: [65, 95], decision: true, cooldown: 3,
      text: '시간이 많아졌다. 남은 날들을 어떻게 보낼까?',
      choices: [
        { text: '텃밭을 가꾼다', effects: { health: 2, happy: 3 }, log: '첫 수확한 상추로 {food}[을/를] 싸 먹었다.' },
        { text: '배낭여행을 떠난다', risky: true, check: { stat: 'health', diff: 35 },
          success: { effects: { happy: 7, smarts: 1, money: -1500, flags: ['traveler'] }, log: '이 나이에 처음 본 오로라에 눈물이 났다.' },
          fail: { effects: { health: -5, money: -2000 }, log: '여행지에서 탈이 나 병원 신세를 졌다.' } },
        { text: '노인 대학에 등록한다', effects: { smarts: 2, social: 2, money: -100 }, log: '스마트폰 사진 찍는 법을 배웠다.' }
      ] },
    { id: 'rl_old_reunion', age: [60, 95], decision: true, cooldown: 4,
      text: '수십 년 만에 동창회 연락이 왔다.',
      choices: [
        { text: '나간다', effects: { happy: 4, social: 2, money: -100 }, log: '다들 늙었지만 웃음소리는 그대로였다.' },
        { text: '은근히 자랑하러 간다', risky: true, check: { stat: 'fame', diff: 40 },
          success: { effects: { happy: 5, rep: 2 }, log: '모두가 내 이야기를 듣고 싶어 했다.' },
          fail: { effects: { happy: -3, rep: -2 }, log: '자랑이 길어지자 하나둘 자리를 떴다.' } },
        { text: '추억은 추억으로 둔다', effects: { happy: 1 }, log: '오래된 졸업 앨범을 넘겨 봤다.' }
      ] },
    { id: 'rl_old_support_kids', age: [60, 95], decision: true, cooldown: 5, cond: { rel: { children: 'yes' }, money: [3000, 100000000] },
      text: '{child}[이/가] 집 장만에 보태 달라며 조심스레 운을 뗀다.',
      choices: [
        { text: '노후 자금을 떼어 준다', effects: { money: -3000, rel: { children: 10 }, happy: 2 }, log: '{child}[이/가] 연신 고개를 숙였다.' },
        { text: '빌려주는 걸로 한다', effects: { money: -1500, rel: { children: 3 }, smarts: 1 }, log: '차용증을 쓰니 서로 깔끔했다.' },
        { text: '내 노후가 먼저다', effects: { rel: { children: -6 } }, log: '{child}[은/는] "알겠어요" 하고 일어섰다.' }
      ] },
    { id: 'rl_old_nursing_home', age: [75, 100], decision: true, cooldown: 5,
      text: '혼자 계단을 오르기가 버겁다. 요양 시설 상담 날짜가 잡혔다.',
      choices: [
        { text: '시설에 들어간다', effects: { health: 3, money: -2000, social: 1 }, log: '말동무가 생기고 식사도 제때 챙겼다.' },
        { text: '집에서 방문 돌봄을 받는다', effects: { happy: 2, money: -1200 }, log: '익숙한 집에서 지내니 마음이 놓였다.' },
        { text: '혼자서도 괜찮다', risky: true, check: { stat: 'health', diff: 40 },
          success: { effects: { happy: 3, grit: 1 }, log: '천천히, 하지만 혼자 힘으로 지냈다.' },
          fail: { effects: { health: -7 }, log: '욕실에서 미끄러졌다. 한참 뒤에야 발견됐다.' } }
      ] },
    { id: 'rl_old_memoir', age: [65, 100], decision: true, cooldown: 6,
      text: '살아온 이야기를 글로 남겨 볼까 싶다.',
      choices: [
        { text: '자서전을 쓴다', effects: { smarts: 2, happy: 3, fame: 1 }, log: '첫 문장은 "{hometown}에서 태어났다"였다.' },
        { text: '출판사에 거액을 내고 낸다', risky: true, check: { odds: 0.3 },
          success: { effects: { fame: 4, money: 1000, happy: 4 }, log: '뜻밖에 입소문을 탔다. 사인회까지 열었다.' },
          fail: { effects: { money: -2000, happy: -2 }, log: '창고에 책 상자만 쌓였다.' } },
        { text: '사진첩만 정리한다', effects: { happy: 2 }, log: '빛바랜 사진마다 이야기가 있었다.' }
      ] },
    { id: 'rl_old_health_walk', age: [65, 100], decision: true, cooldown: 3,
      text: '의사가 매일 30분씩 걸으라고 한다. 날이 춥다.',
      choices: [
        { text: '꼬박꼬박 걷는다', effects: { health: 3, grit: 1 }, log: '공원 비둘기들과 얼굴을 텄다.' },
        { text: '실내 수영장에 다닌다', effects: { health: 3, social: 1, money: -100 }, log: '수영장 동기들과 아침 체조도 함께했다.' },
        { text: '따뜻한 집에서 TV를 본다', effects: { happy: 2, health: -2 }, log: '드라마 한 편이 두 편이 됐다.' }
      ] }
  );
})(typeof globalThis !== 'undefined' ? globalThis : this);
