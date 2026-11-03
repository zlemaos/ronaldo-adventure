/* Childhood cards (5-12), rebuilt in round 8 (docs/DESIGN.md §2g "Childhood rebuilt").
 * Every card is its own situation; its options differ in what they risk and what they pay, and at least
 * one option can go wrong (a check, odds or a bet). Origin (rich / middle / poor / slum), hobbies and
 * the football story change which cards a child meets. Cards fire once per life unless noted.
 * Fields read by js/life.js: origin, hobby, flavour; choice.alt (the same moment for a hero who does not
 * play football). test/childhood.test.js keeps these rules. */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};
  var EV = RA.data.events = RA.data.events || [];
  function K(ev) { if (ev.once == null && ev.cooldown == null) ev.once = true; if (ev.cooldown == null) ev.cooldown = 4; EV.push(ev); }
  var POOR = ['poor', 'slum'], NOT_RICH = ['middle', 'poor', 'slum'];
  var SCHOOL = ['elem', 'middle'];

  // ================================================================ home and family
  K({ id: 'canon_crowded_house', weight: 25, once: true, age: [5, 11], origin: POOR, cond: { flags: ['!heir'] },
    text: '장대비가 쏟아지는 밤. 천장 얼룩에서 물이 똑똑 떨어진다. 방 하나에 형제 넷이 붙어 잔다.',
    choices: [
      { text: '형들과 지붕에 올라가 비닐을 덮는다', risky: true, check: { stat: 'health', diff: 45 },
        success: { effects: { grit: 3, rel: { siblings: 5 } }, log: '흠뻑 젖었지만 물이 멎었다. 넷이 수건 하나로 머리를 말리며 낄낄댔다.' },
        fail: { effects: { health: -9, rel: { mother: 3 } }, log: '젖은 슬레이트에서 미끄러졌다. 팔에 깁스를 한 채 여름 방학을 보냈다.' } },
      { text: '양동이를 받쳐 두고 베개 싸움을 벌인다', effects: { happy: 5, rel: { siblings: 5 }, health: -1 }, log: '양동이가 엎어져 이불이 다 젖었다. 그래도 그날 밤 웃음소리가 빗소리보다 컸다.' },
      { text: '"나중에 큰 집 사 줄게" 하고 {mother}[과/와] 새끼손가락을 건다', effects: { grit: 3, rel: { mother: 4 }, flags: ['promised_house'] }, log: '{mother}[은/는] 웃었지만 눈가가 촉촉했다. 그 약속은 오래 마음에 남았다.' }
    ] });
  K({ id: 'canon_mother_shift', weight: 20, once: true, age: [6, 12], cond: { flags: ['!heir'], rel: { mother: 'alive' } },
    text: '{motherJob}[으로/로] 일하는 {mother}[이/가] 손목에 붕대를 감고 왔다. 그래도 내일 일을 나가겠다고 한다.',
    choices: [
      { text: '장을 봐서 저녁을 대신 짓는다', check: { stat: 'smarts', diff: 30 },
        success: { effects: { grit: 3, rel: { mother: 7 } }, log: '삐뚤빼뚤한 계란밥이었다. {mother}[은/는] 한 숟갈 뜨고 한참 고개를 숙였다.' },
        fail: { effects: { money: -30, happy: -2, rel: { mother: 3 } }, log: '밥을 홀랑 태우고 냄비 바닥까지 눌어붙었다. 결국 {mother}[이/가] 다친 손으로 다시 지었다.' } },
      { text: '학교를 하루 빠지고 {mother}의 일터에 따라간다', risky: true, check: { odds: 0.6 },
        success: { effects: { rel: { mother: 9 }, grit: 2, smarts: -1 }, log: '상자를 나르고 손님 물건을 챙겼다. 사장님이 "아들 하나 잘 뒀다"고 했다.' },
        fail: { effects: { rep: -2, rel: { mother: 2 }, happy: -2 }, log: '무단결석이라며 담임이 집에 전화했다. {mother}[은/는] 고맙다면서도 다시는 그러지 말라고 했다.' } },
      { text: '형제들을 모아 집안일 당번표를 만든다', check: { stat: 'social', diff: 40 },
        success: { effects: { social: 3, rel: { siblings: 4, mother: 4 } }, log: '냉장고에 당번표가 붙었다. 설거지 담당은 {bro}[이/가] 됐다.' },
        fail: { effects: { happy: -2, rel: { siblings: -3 } }, log: '"막내가 왜 시키냐"는 말에 당번표는 찢어졌다. 결국 혼자 걸레질을 했다.' } }
    ] });
  K({ id: 'canon_father_drinking', priority: true, once: true, age: [7, 9], cond: { flags: ['!heir', '!father_drinking'], rel: { father: 'alive' } },
    text: '요즘 {father}[은/는] 일을 마치면 곧장 집에 오지 않는다. 늦은 밤 술 냄새와 함께 들어와 불 꺼진 부엌에 오래 앉아 있다.',
    choices: [
      { text: '찬장 속 술병을 몰래 하수구에 붓는다', risky: true, check: { odds: 0.5 },
        success: { effects: { rel: { father: 3 }, grit: 2, flags: ['father_drinking'] }, log: '빈 병을 본 {father}[은/는] 한참 말이 없더니 그날은 술 대신 물을 마셨다.' },
        fail: { effects: { happy: -6, rel: { father: -5 }, flags: ['father_drinking'] }, log: '"누가 건드렸어!" 처음 듣는 고함이었다. 이불 속에서 숨을 죽였다.' } },
      { text: '{mother}에게 본 걸 털어놓는다', effects: { rel: { mother: 5 }, happy: -2, flags: ['father_drinking'] }, log: '{mother}[은/는] "아빠가 많이 힘드신 거야. 네 잘못이 아니라 병이란다"라고 말했다.' },
      { text: '{bro}[과/와] 아빠를 지키자고 약속한다', effects: { rel: { bro: 5 }, smarts: 1, flags: ['father_drinking'] }, log: '{bro}[이/가] 새끼손가락을 걸었다. 그날부터 둘이 번갈아 현관 불을 켜 두었다.' }
    ] });
  K({ id: 'life_child_father_promise', age: [8, 12], cond: { rel: { father: 'alive' }, flags: ['father_drinking'] },
    text: '학교 발표회 날. 맨 앞줄에 앉겠다던 {father}[이/가] 동네 술집에 있다는 이야기가 들려왔다.',
    choices: [
      { text: '발표회 전에 술집으로 직접 찾아간다', risky: true, check: { stat: 'grit', diff: 45 },
        success: { effects: { rel: { father: 6 }, grit: 2, fx: ['fatherSeekHelp'] }, log: '문간에 선 나를 보고 {father}[이/가] 잔을 내려놓았다. 발표회 끝 무렵, 뒷줄에서 박수 소리가 들렸다.' },
        fail: { effects: { happy: -6, flags: ['trauma'] }, log: '취한 어른들이 "애가 왜 여기 있냐"며 웃었다. {father}[은/는] 나를 보지도 못했다.' } },
      { text: '"아빠 아픈 거 싫어" 쪽지를 베개 밑에 둔다', effects: { happy: -2, rel: { father: 4 }, fx: ['fatherSeekHelp'] }, log: '다음 날 아침 쪽지가 사라져 있었다. {father}[은/는] 처음으로 "미안하다"고 했다.' },
      { text: '빈자리를 보며 혼자 무대에 선다', effects: { grit: 3, rel: { father: -4 } }, log: '마지막 인사까지 목소리가 떨리지 않았다. 객석의 빈 의자는 끝까지 비어 있었다.' }
    ] });
  K({ id: 'life_child_sibling_fight', age: [6, 12], cond: { rel: { sis2: 'alive' } },
    text: '{sis2}[이/가] 아끼던 머리핀을 빌렸다가 운동장에서 잃어버렸다. {sis2}[이/가] 온 집을 뒤지고 있다.',
    choices: [
      { text: '솔직히 말하고 용돈으로 물어 준다', effects: { money: -20, rel: { sis2: 4 }, happy: -1 }, log: '석 달 치 용돈이 날아갔다. {sis2}[은/는] 새 핀보다 솔직하게 말한 걸 더 오래 기억했다.' },
      { text: '모르는 척 같이 찾는 시늉을 한다', risky: true, check: { odds: 0.5 },
        success: { effects: { happy: 1, mischief: 2 }, log: '{sis2}[은/는] 결국 포기했다. 그 뒤로 그 핀 얘기만 나오면 괜히 딴청을 부렸다.' },
        fail: { effects: { rel: { sis2: -8, mother: -3 }, mischief: 2 }, log: '같은 반 아이가 "네 동생이 운동장에서 잃어버렸던데?" 하고 일러바쳤다. 한 달 동안 말을 안 했다.' } },
      { text: '철사와 단추로 비슷한 걸 만들어 준다', check: { stat: 'smarts', diff: 40 },
        success: { effects: { rel: { sis2: 6 }, happy: 2 }, log: '삐뚤어졌지만 세상에 하나뿐인 핀이었다. {sis2}[은/는] 그걸 몇 년이나 꽂고 다녔다.' },
        fail: { effects: { health: -2, rel: { sis2: -2 } }, log: '철사에 손가락만 찔렸다. 완성품은 핀이라기보다 낚싯바늘이었다.' } }
    ] });
  K({ id: 'life_child_pet_stray', age: [6, 12], cond: { flags: ['!has_pet'] },
    text: '비 오는 골목 박스 안에서 새끼 고양이가 떨고 있다. 한쪽 눈에 진물이 났다.',
    choices: [
      { text: '품에 안고 집으로 데려간다', risky: true, check: { odds: 0.65 },
        success: { effects: { happy: 6, money: -50, fx: ['adoptPet'] }, log: '{mother}[은/는] 한숨을 쉬었지만 결국 우유 접시를 내줬다. 새 식구가 생겼다.' },
        fail: { effects: { health: -4, happy: -3 }, log: '겁먹은 고양이가 손등을 깊게 할퀴고 도망쳤다. 손등이 곪아 주사를 맞았다.' } },
      { text: '저금통을 털어 동물병원에 데려간다', effects: { money: -80, rep: 3, smarts: 1 }, log: '눈약을 받아 왔다. 수의사 선생님이 입양할 집을 찾아 주겠다고 했다.' },
      { text: '박스 위에 우산만 씌워 준다', effects: { happy: -1 }, log: '다음 날 박스는 비어 있었다. 우산도 없었다. 누가 데려갔길 바랐다.' }
    ] });
  K({ id: 'life_child_birthday_party', age: [6, 12], origin: ['rich', 'middle'],
    text: '생일 파티를 크게 열어 주겠다고 한다. 반에서 제일 인기 많은 아이도 초대 명단에 넣어야 할지 고민이다.',
    choices: [
      { text: '반 전체에 초대장을 돌린다', check: { stat: 'social', diff: 40 },
        success: { effects: { happy: 5, money: -400, fx: ['newFriend'] }, log: '케이크가 세 개였다. 다음 날부터 쉬는 시간마다 내 자리가 붐볐다.' },
        fail: { effects: { happy: -5, money: -400 }, log: '같은 날 인기 많은 아이도 파티를 열었다. 풍선 서른 개 아래 앉은 손님은 다섯 명이었다.' } },
      { text: '친한 친구 셋만 불러 밤새 논다', effects: { happy: 3, social: 1, rel: { friend: 5 } }, log: '이불로 텐트를 치고 무서운 이야기를 했다. 셋은 그 뒤로도 오래 붙어 다녔다.' },
      { text: '선물 대신 저금해 달라고 한다', effects: { money: 100, smarts: 1, happy: -1 }, log: '통장에 찍힌 숫자가 신기했다. 친구들은 "생일인데 그게 뭐야"라고 했다.' }
    ] });
  K({ id: 'life_child_handmedown_shoes', age: [6, 12], origin: POOR,
    text: '{bro}에게 물려받은 운동화 밑창이 덜렁거린다. 하필 내일이 체육 대회다.',
    choices: [
      { text: '테이프로 칭칭 감고 나간다', risky: true, check: { odds: 0.55 },
        success: { effects: { grit: 3, happy: 2 }, log: '테이프 운동화로 끝까지 달렸다. 결승선에서 친구들이 내 신발을 보고 박수를 쳤다.' },
        fail: { effects: { happy: -5, social: -2 }, log: '출발하자마자 밑창이 떨어져 날아갔다. 꼴찌보다 웃음소리가 더 아팠다.' } },
      { text: '{mother}에게 새 신발을 조른다', effects: { happy: 2, money: -40, rel: { mother: -3 } }, log: '{mother}[은/는] 시장에서 제일 싼 신발을 사 왔다. 그날 저녁 반찬이 하나 줄었다.' },
      { text: '맨발로 뛰겠다고 한다', check: { stat: 'health', diff: 40 },
        success: { effects: { grit: 4, fame: 1 }, log: '맨발의 2등. 체육 선생님이 "깡이 있다"며 머리를 쓰다듬었다.' },
        fail: { effects: { health: -5 }, log: '운동장 유리 조각에 발바닥이 베였다. 보건실에서 다섯 바늘을 꿰맸다.' } }
    ] });

  // ================================================================ school
  K({ id: 'life_child_school_first', age: [6, 7], cond: { edu: ['elem'] },
    text: '{school} 첫날. 짝이 될 아이가 교실 구석에서 엄마를 찾으며 울고 있다. 담임 선생님은 출석부를 들고 있다.',
    choices: [
      { text: '옆에 가서 지우개를 반 잘라 준다', check: { stat: 'social', diff: 30 },
        success: { effects: { social: 2, fx: ['newFriend'] }, log: '울음이 멎었다. 그 아이는 6년 내내 짝꿍이 됐다.' },
        fail: { effects: { happy: -3 }, log: '그 아이가 더 크게 울었다. 둘이 같이 "울보"로 불렸다.' } },
      { text: '맨 앞자리에 앉아 손을 번쩍 든다', check: { stat: 'grit', diff: 35 },
        success: { effects: { smarts: 2, rep: 2 }, log: '선생님이 첫 반장 대리를 맡겼다. 출석부 심부름이 자랑스러웠다.' },
        fail: { effects: { happy: -3, social: -1 }, log: '자기소개를 하다 이름 대신 "엄마"라고 말해 버렸다. 반 전체가 웃었다.' } },
      { text: '창가 맨 뒷자리에서 하루 종일 창밖만 본다', effects: { happy: 1, smarts: -1 }, log: '운동장 비둘기를 세다 하루가 갔다. 알림장엔 아무것도 적혀 있지 않았다.' }
    ] });
  K({ id: 'life_child_report_card', age: [8, 12], cond: { edu: ['elem'] },
    text: '성적표가 나왔다. 수학 칸이 빨갛다. 내일까지 부모님 서명을 받아 가야 한다.',
    choices: [
      { text: '저녁 식탁에 그대로 내민다', check: { stat: 'smarts', diff: 45 },
        success: { effects: { happy: 2, rel: { mother: 4, father: 2 } }, log: '"다른 과목은 잘했네." {mother}[이/가] 성적표를 냉장고에 붙였다. 빨간 칸만 손으로 가리고.' },
        fail: { effects: { happy: -3, smarts: 1 }, log: '그달 용돈이 끊기고 저녁마다 문제집 두 장이 생겼다.' } },
      { text: '매트리스 밑에 숨기고 "아직 안 나왔다"고 한다', effects: { happy: 1, rel: { mother: -3 }, flags: ['hid_report'] }, schedule: { id: 'life_child_report_found', years: 1 }, log: '완벽한 범죄 같았다. 밤마다 매트리스가 유난히 배겼다.' },
      { text: '부모님 서명을 흉내 내 직접 쓴다', risky: true, check: { stat: 'smarts', diff: 45 },
        success: { effects: { happy: 2, mischief: 5 }, log: '선생님은 눈치채지 못했다. 문제는 다음 학기 성적표였다.' },
        fail: { effects: { happy: -5, mischief: 5, rep: -3, rel: { father: -6 } }, log: '이름 철자가 틀렸다. 담임이 집에 전화를 걸었다.' } }
    ] });
  K({ id: 'life_child_talent_show', age: [7, 12], cond: { edu: SCHOOL },
    text: '장기자랑 순서표에 내 이름이 적혀 있다. 짝꿍이 장난으로 몰래 써 넣었다. 공연은 내일이다.',
    choices: [
      { text: '좋아하는 {hobbyAct} 솜씨를 무대에서 보여 준다', check: { talent: 'hobby', diff: 35 },
        success: { effects: { happy: 5, fame: 2, social: 2 }, log: '강당에 박수가 쏟아졌다. 복도에서 모르는 후배가 인사를 했다.' },
        fail: { effects: { happy: -4, flags: ['stage_fright'] }, log: '조명 아래서 머리가 하얘졌다. 그 뒤로 사람들 앞에 서면 손이 떨렸다.' } },
      { text: '짝꿍을 끌고 나가 즉석 콩트를 한다', risky: true, check: { odds: 0.5 },
        success: { effects: { happy: 6, social: 3, rel: { friend: 4 } }, log: '대본도 없이 한 콩트에 교장 선생님까지 웃었다. 둘은 학교 개그 콤비가 됐다.' },
        fail: { effects: { happy: -3, social: -2 }, log: '짝꿍이 대사를 까먹고 굳어 버렸다. 3분이 30분 같았다.' } },
      { text: '담임에게 이름을 지워 달라고 부탁한다', effects: { happy: -1, social: -1 }, log: '이름은 지워졌다. 객석에서 남들 무대를 보며 조금 아쉬웠다.' }
    ] });
  K({ id: 'life_child_science_fair', age: [9, 12], cond: { edu: SCHOOL, stats: { smarts: [50, 100] } },
    text: '과학 발명대회 신청 마감이 내일이다. {father}[이/가] "아빠가 확실한 걸로 하나 만들어 줄까?" 하고 묻는다.',
    choices: [
      { text: '페트병 정수기를 혼자 만든다', check: { stat: 'smarts', diff: 55 },
        success: { effects: { smarts: 4, fame: 1, happy: 4, achieve: 'young_inventor' }, log: '금상! 지역 신문 구석에 작은 사진이 실렸다.' },
        fail: { effects: { smarts: 2, happy: -1 }, log: '물이 더 흐려져서 나왔다. 그래도 왜 실패했는지는 정확히 알았다.' } },
      { text: '친구 셋과 팀을 짜 로봇 팔을 만든다', check: { stat: 'social', diff: 40 },
        success: { effects: { smarts: 2, social: 3, fx: ['newFriend'] }, log: '나무젓가락 로봇 팔이 지우개를 집어 들었다. 넷이 얼싸안았다.' },
        fail: { effects: { happy: -3, social: -1 }, log: '누가 발표할지로 싸우다 팀이 깨졌다. 로봇 팔은 반쯤 만든 채 창고로 갔다.' } },
      { text: '{father}[이/가] 만든 작품을 내 이름으로 낸다', risky: true, check: { odds: 0.55 },
        success: { effects: { happy: 2, mischief: 2 }, log: '장려상을 받았다. 상장을 볼 때마다 괜히 목이 간지러웠다.' },
        fail: { effects: { rep: -4, happy: -4 }, log: '심사위원이 원리를 묻자 한마디도 못 했다. "부모님 작품은 실격"이라는 말이 강당에 울렸다.' } }
    ] });
  K({ id: 'cn_homework_night', age: [8, 12], countries: ['cn'], cond: { edu: ['elem'] },
    text: '밤 10시, 숙제가 아직 산더미다. 내일은 받아쓰기 시험도 있다. 일을 마친 {mother}[이/가] 졸린 눈으로 옆에 앉는다.',
    choices: [
      { text: '새벽까지 다 하고 잔다', check: { stat: 'health', diff: 40 },
        success: { effects: { smarts: 3 }, log: '받아쓰기 100점. {mother}[이/가] 숙제 검사 사인 옆에 별을 하나 그려 줬다.' },
        fail: { effects: { smarts: 1, health: -4 }, log: '아침 조회 시간에 쓰러졌다. 보건실 침대에서 시험을 놓쳤다.' } },
      { text: '{mother}께 먼저 주무시라고 하고 반만 한다', effects: { rel: { mother: 4 }, smarts: 1, rep: -1 }, log: '선생님께 숙제 반을 안 했다고 혼났다. {mother}[은/는] 오랜만에 푹 잤다.' },
      { text: '반 친구 숙제를 사진으로 받아 베낀다', risky: true, check: { odds: 0.55 },
        success: { effects: { happy: 2, mischief: 2 }, log: '열한 시에 잠들었다. 받아쓰기는 세 개 틀렸다.' },
        fail: { effects: { rep: -3, mischief: 2, rel: { mother: -3 } }, log: '틀린 답까지 똑같았다. 둘 다 교실 뒤에 서 있었다.' } }
    ] });

  // ================================================================ friends, play and small temptations
  K({ id: 'life_child_playground_king', age: [5, 8],
    text: '놀이터 미끄럼틀을 큰 애들이 막아섰다. 타려면 과자를 하나씩 내놓으라고 한다.',
    choices: [
      { text: '과자를 내고 탄다', effects: { happy: -1, money: -2 }, log: '한 번 타는 데 과자 한 봉지. 미끄럼틀은 생각보다 짧았다.' },
      { text: '미끄럼틀을 거꾸로 기어 올라간다', risky: true, check: { stat: 'health', diff: 45 },
        success: { effects: { happy: 4, grit: 2, mischief: 1 }, log: '꼭대기에 먼저 닿자 큰 애들이 어이없어 웃었다. 그날부터 통행료는 사라졌다.' },
        fail: { effects: { health: -7, happy: -3 }, log: '중간에서 미끄러져 턱을 찧었다. 턱 밑에 작은 흉터가 남았다.' } },
      { text: '동네 꼬마들을 모아 줄을 세운다', check: { stat: 'social', diff: 35 },
        success: { effects: { social: 3, rep: 2 }, log: '열 명이 줄을 서자 큰 애들도 끼어들지 못했다. 놀이터에 순서가 생겼다.' },
        fail: { effects: { happy: -3, social: -1 }, log: '모두 흩어지고 나만 남았다. 큰 애들이 등을 떠밀었다.' } }
    ] });
  K({ id: 'soc_new_kid', once: true, age: [7, 12], cond: { stats: { social: [45, 100] } },
    text: '전학 온 아이가 쉬는 시간마다 혼자 앉아 있다. 반 아이들은 "저 애 이상한 데서 왔대" 하고 수군댄다.',
    choices: [
      { text: '점심시간에 옆자리에 식판을 놓는다', risky: true, check: { odds: 0.65 },
        success: { effects: { social: 3, happy: 2, fx: ['newFriend'] }, log: '말이 없던 아이가 알고 보니 엄청 웃겼다. 둘은 단짝이 됐다.' },
        fail: { effects: { social: -2, happy: -3 }, log: '그날부터 나까지 "이상한 애 친구"로 불렸다. 그래도 그 아이는 내 이름을 기억했다.' } },
      { text: '수군대는 애들 편에 선다', effects: { social: 1, rep: -2 }, log: '무리에서는 편했다. 졸업 사진 속 그 아이 얼굴이 오래 마음에 걸렸다.' },
      { text: '담임에게 짝을 바꿔 달라고 쪽지를 쓴다', effects: { rep: 2, social: 1 }, log: '다음 주 그 아이가 내 짝이 됐다. 말을 걸기까지 한 달이 걸렸다.' }
    ] });
  K({ id: 'rl_kid_friend_group', cooldown: 4, age: [8, 12], cond: { edu: SCHOOL },
    text: '새 학년, 쉬는 시간마다 무리가 갈린다. 어느 쪽에 낄지가 1년을 정한다.',
    choices: [
      { text: '운동장 끝에서 공 차는 무리', alt: { text: '{hobby} 좋아하는 아이들 무리', log: '쉬는 시간 10분도 {hobbyAct} 이야기로 모자랐다.' }, effects: { football: 2, grit: 1, social: 1 }, log: '쉬는 시간 10분도 공을 찼다. 무릎은 늘 까져 있었다.' },
      { text: '문제집을 같이 푸는 무리', check: { stat: 'smarts', diff: 40 },
        success: { effects: { smarts: 3, social: 1 }, log: '서로 문제를 내 주다 보니 성적이 같이 올랐다.' },
        fail: { effects: { happy: -2, social: -2 }, log: '따라가기 벅찼다. 다들 푼 문제를 혼자 붙잡고 있다가 슬그머니 빠졌다.' } },
      { text: '선생님 몰래 노는 무리', risky: true, check: { odds: 0.6 },
        success: { effects: { happy: 4, social: 2, mischief: 4, smarts: -1 }, log: '매일이 소풍 같았다. 담임의 눈총도 매일 늘었다.' },
        fail: { effects: { happy: -3, mischief: 4, smarts: -2, rel: { mother: -3 } }, log: '무리 전체가 교무실에 불려 갔다. 반성문 세 장에 부모님 호출까지 따라왔다.' } }
    ] });
  K({ id: 'life_child_shoplift_candy', age: [8, 12],
    text: '구멍가게 할머니가 졸고 있다. 같이 간 친구가 사탕을 주머니에 넣으며 눈짓한다. "너도 해 봐."',
    choices: [
      { text: '한 움큼 주머니에 넣는다', risky: true, check: { odds: 0.55 },
        success: { effects: { happy: 2, mischief: 4, flags: ['petty_thief'] }, log: '들키지 않았다. 사탕은 이상하게 맛이 없었다. 그 가게 앞을 지날 때마다 심장이 뛰었다.' },
        fail: { effects: { happy: -5, mischief: 4, rep: -3, rel: { mother: -6 }, flags: ['petty_thief'] }, log: '할머니가 실눈을 뜨고 있었다. 불려 온 {mother}[이/가] 허리를 숙여 사과했다.' } },
      { text: '"나 먼저 간다" 하고 가게를 나온다', effects: { grit: 2, social: -2 }, log: '친구는 다음 날 반 아이들에게 "쫄보"라고 소문냈다. 그래도 발걸음은 가벼웠다.' },
      { text: '할머니를 깨워 사탕값을 대신 낸다', effects: { money: -5, rep: 3, rel: { friend: -6 } }, log: '할머니가 덤으로 하나를 더 줬다. 친구는 그 뒤로 말을 걸지 않았다.' }
    ] });
  K({ id: 'rl_kid_toy_save', cooldown: 5, age: [6, 12],
    text: '갖고 싶던 장난감이 나왔다. 저금통에 든 돈은 딱 절반이다. 반 아이들은 벌써 다 샀다.',
    choices: [
      { text: '석 달 더 모은다', effects: { grit: 3, money: 10, happy: -2 }, log: '석 달 뒤 내 돈으로 샀다. 그때쯤엔 다들 질려 했지만 나한텐 제일 소중했다.' },
      { text: '안 쓰는 장난감을 벼룩시장에 내다 판다', check: { stat: 'social', diff: 40 },
        success: { effects: { money: 30, smarts: 2, happy: 3 }, log: '목청껏 외쳐 다 팔았다. 장난감 값을 채우고도 남았다.' },
        fail: { effects: { money: -10, happy: -4 }, log: '중학생 형이 "나중에 줄게" 하고 몽땅 들고 갔다. 다시는 볼 수 없었다.' } },
      { text: '할머니 댁에 가서 슬쩍 조른다', effects: { happy: 3, rel: { family: -2 } }, log: '할머니가 꼬깃꼬깃한 지폐를 쥐여 줬다. 나중에 {mother}[이/가] 알고 크게 혼냈다.' }
    ] });
  K({ id: 'rl_kid_errand_change', cooldown: 4, age: [6, 10],
    text: '심부름 다녀오는 길에 거스름돈을 잃어버렸다. 주머니에 구멍이 나 있었다.',
    choices: [
      { text: '현관에서 바로 사실대로 말한다', effects: { rep: 2, happy: -2, rel: { mother: 2 } }, log: '"돈보다 네가 거짓말 안 한 게 중요해." 저녁에 바늘로 주머니를 꿰매 줬다.' },
      { text: '저금통에서 몰래 채워 넣는다', effects: { money: -10, grit: 2 }, log: '아무도 몰랐다. 저금통이 가벼워진 만큼 마음도 조금 무거웠다.' },
      { text: '가게 아저씨가 덜 줬다고 둘러댄다', risky: true, check: { odds: 0.5 },
        success: { effects: { happy: 1, mischief: 3 }, log: '넘어갔다. 그 가게에 다시 심부름 갈 때마다 고개를 못 들었다.' },
        fail: { effects: { rep: -4, mischief: 3, rel: { mother: -5 } }, log: '{mother}[이/가] 가게로 따지러 갔다. 아저씨는 영수증을 내밀었다. 집에 오는 길이 길었다.' } }
    ] });
  K({ id: 'rl_kid_found_wallet', cooldown: 6, age: [8, 12],
    text: '{city} 버스 정류장 의자 밑에서 지갑을 주웠다. 지폐가 두툼하고 신분증도 들어 있다.',
    choices: [
      { text: '파출소에 가져다준다', effects: { rep: 4, social: 1, happy: 2 }, log: '주인 아저씨가 찾아와 {food}[을/를] 사 줬다. 경찰관이 감사장을 써 줬다.' },
      { text: '지폐만 빼고 지갑은 우체통에 넣는다', risky: true, check: { odds: 0.6 },
        success: { effects: { money: 30, happy: 1, mischief: 4 }, log: '아무도 몰랐다. 그 돈으로 산 과자는 끝까지 다 먹지 못했다.' },
        fail: { effects: { mischief: 4, rep: -6, happy: -4 }, log: '정류장 CCTV에 찍혔다. 학교로 연락이 왔다.' } },
      { text: '신분증 주소를 보고 직접 찾아간다', check: { stat: 'smarts', diff: 35 },
        success: { effects: { rep: 3, money: 20, fx: ['newFriend'] }, log: '할머니 댁이었다. 사례금과 함께 손자를 소개받았다. 동갑이었다.' },
        fail: { effects: { happy: -3, health: -1 }, log: '버스를 잘못 타 해 질 녘까지 헤맸다. 결국 지갑은 파출소에 맡겼다.' } }
    ] });
  K({ id: 'rl_kid_game_time', cooldown: 3, age: [7, 12],
    text: '친구 형 계정으로 온라인 게임을 하는데 유료 아이템 결제 창이 떴다. 손에 든 건 {mother}의 휴대폰이다.',
    choices: [
      { text: '"확인"을 누른다', risky: true, check: { odds: 0.4 },
        success: { effects: { happy: 4, mischief: 2 }, log: '전설 아이템을 얻었다. 결제 문자는 운 좋게 스팸함으로 들어갔다.' },
        fail: { effects: { money: -200, happy: -4, rel: { mother: -6 }, mischief: 2 }, log: '다음 날 카드 명세서가 날아왔다. 휴대폰은 석 달 동안 압수됐다.' } },
      { text: '창을 닫고 휴대폰을 돌려준다', effects: { smarts: 1, happy: -1 }, log: '형이 "쫄보네" 했다. 대신 혼자 깨는 법을 연구했다.' },
      { text: '{mother}에게 시험 100점이면 사 달라고 협상한다', check: { stat: 'smarts', diff: 45 },
        success: { effects: { smarts: 2, happy: 3, rel: { mother: 2 } }, log: '진짜로 100점을 맞았다. 아이템보다 성적표가 더 자랑스러웠다.' },
        fail: { effects: { happy: -2 }, log: '87점. 약속은 약속이었다. 아이템은 못 샀다.' } }
    ] });
  K({ id: 'rl_kid_secret_base', cooldown: 5, age: [8, 12],
    text: '친구들이 뒷산 너머 비어 있는 집에 비밀 기지를 만들자고 한다. 대문에 "출입 금지" 종이가 붙어 있다.',
    choices: [
      { text: '담을 넘어 들어간다', risky: true, check: { odds: 0.55 },
        success: { effects: { happy: 5, social: 2, mischief: 3 }, log: '먼지 쌓인 다락방이 우리 기지가 됐다. 여름 내내 아지트였다.' },
        fail: { effects: { mischief: 3, rep: -4, rel: { father: -4 } }, log: '집주인 아저씨가 경찰을 불렀다. 파출소 의자에서 {father}[을/를] 기다렸다.' } },
      { text: '{father}에게 공구를 빌려 우리 집 마당에 짓는다', check: { stat: 'grit', diff: 35 },
        success: { effects: { happy: 4, rel: { father: 4 }, social: 1 }, log: '판자 다섯 장짜리 오두막이 섰다. {father}[이/가] 지붕에 깃발을 달아 줬다.' },
        fail: { effects: { health: -4, happy: -1 }, log: '망치로 손가락을 찧었다. 오두막은 첫 비에 무너졌다.' } },
      { text: '"출입 금지잖아" 하고 빠진다', effects: { social: -2, rep: 1 }, log: '다음 주 친구들 무리에 내 자리는 없었다.' }
    ] });

  // ================================================================ mischief (the 악동 trait grows here)
  K({ id: 'mis_crayon_wall', once: true, age: [5, 7],
    text: '새로 도배한 거실 벽에 크레용으로 커다란 그림을 그려 버렸다. 현관문 열리는 소리가 난다.',
    choices: [
      { text: '{bro}[이/가] 그렸다고 한다', risky: true, check: { odds: 0.5 },
        success: { effects: { happy: 3, mischief: 3, rel: { bro: -3 } }, log: '{bro}[이/가] 대신 혼났다. 웃음을 참느라 볼이 아팠다.' },
        fail: { effects: { happy: -3, mischief: 3, rep: -2, rel: { mother: -4, bro: -4 } }, log: '"{bro}[은/는] 오늘 학교에 있었잖니?" 들켰다.' } },
      { text: '"제가 그렸어요" 하고 걸레를 든다', effects: { happy: -1, rep: 1, rel: { mother: 3 } }, log: '둘이 같이 벽을 닦았다. 해님 하나만은 남겨 두기로 했다.' },
      { text: '벽 전체를 그림으로 덮어 작품이라고 우긴다', risky: true, check: { odds: 0.35 },
        success: { effects: { happy: 4, rel: { father: 3 } }, log: '{father}[이/가] 웃음을 터뜨리더니 그 벽에 액자 틀을 둘렀다.' },
        fail: { effects: { happy: -4, rel: { mother: -5 } }, log: '도배를 다시 하는 데 한 달 치 반찬값이 들었다. 크레용은 압수됐다.' } }
    ] });
  K({ id: 'mis_doorbell', cooldown: 4, age: [7, 12], cond: { edu: ['elem'] },
    text: '친구들이 동네 초인종 누르고 도망가기 시합을 하자고 한다. 마지막 집은 무섭기로 소문난 할아버지 댁이다.',
    choices: [
      { text: '할아버지 댁 초인종을 맡는다', risky: true, check: { stat: 'health', diff: 40 },
        success: { effects: { happy: 5, social: 2, mischief: 3 }, log: '전력 질주로 골목을 빠져나왔다. 그날의 영웅이 됐다.' },
        fail: { effects: { happy: -3, mischief: 3, rep: -3 }, log: '문이 너무 빨리 열렸다. 할아버지가 다음 날 학교까지 찾아왔다.' } },
      { text: '전봇대 뒤에서 망을 본다', effects: { social: 1, mischief: 1 }, log: '망을 보다 혼자 웃음이 터져 다 같이 들킬 뻔했다.' },
      { text: '할아버지 댁에 가서 "장난칠 거래요" 귀띔한다', effects: { rep: 2, social: -3 }, log: '할아버지가 사탕을 쥐여 줬다. 친구들은 범인을 금방 알아냈다.' }
    ] });
  K({ id: 'mis_dictation_cheat', cooldown: 4, age: [8, 11], cond: { edu: ['elem'] },
    text: '받아쓰기 시간. 짝꿍 공책이 훤히 보인다. 오늘 70점이 안 되면 남아서 다시 쳐야 한다.',
    choices: [
      { text: '짝꿍 공책을 슬쩍 베낀다', risky: true, check: { odds: 0.6 },
        success: { effects: { happy: 3, mischief: 3 }, log: '100점! 그런데 무슨 단어였는지는 하나도 기억이 안 났다.' },
        fail: { effects: { happy: -4, mischief: 3, rep: -3, rel: { mother: -3 } }, log: '짝꿍이 틀린 답까지 똑같이 베꼈다. 선생님이 웃으며 둘을 불렀다.' } },
      { text: '아는 만큼만 쓰고 남는다', effects: { smarts: 2, happy: -2 }, log: '60점. 틀린 단어는 다섯 번씩 써서 외웠다. 다음 주엔 90점이었다.' },
      { text: '짝꿍에게 내 답도 보여 준다', effects: { social: 2, rep: -1 }, log: '둘 다 80점. 짝꿍이 그날 우유를 나눠 줬다.' }
    ] });
  K({ id: 'mis_playground_fight', cooldown: 5, age: [8, 12], cond: { edu: ['elem'] },
    text: '덩치 큰 6학년이 1학년 꼬마의 우유 값을 뺏고 있다. 꼬마가 울면서 나를 쳐다본다.',
    choices: [
      { text: '사이에 끼어들어 막아선다', risky: true, check: { stat: 'grit', diff: 45 },
        success: { effects: { grit: 3, rep: 4, mischief: 2 }, log: '6학년이 혀를 차고 돌아섰다. 꼬마가 다음 날 사탕 한 봉지를 들고 왔다.' },
        fail: { effects: { health: -5, happy: -3, mischief: 3 }, log: '한 대 맞고 넘어졌다. 둘이 나란히 교무실에 섰다. 꼬마는 끝까지 내 편을 들었다.' } },
      { text: '교무실로 뛰어가 선생님을 데려온다', effects: { rep: 2, social: -1 }, log: '6학년은 벌을 받았다. 복도에서 마주칠 때마다 노려봤다.' },
      { text: '못 본 척 지나간다', effects: { happy: -2 }, log: '그 꼬마 우는 소리가 집에 가는 내내 따라왔다.' }
    ] });
  K({ id: 'mis_window_ball', once: true, age: [7, 12],
    text: '쨍그랑! 친구들과 던지고 놀던 공이 옆집 유리창을 깼다. 골목엔 아무도 없다.',
    choices: [
      { text: '뒤도 안 보고 도망친다', risky: true, check: { odds: 0.5 },
        success: { effects: { happy: 1, mischief: 4 }, log: '아무도 못 봤다. 그날 밤은 이상하게 잠이 오지 않았다.' },
        fail: { effects: { happy: -3, mischief: 4, rep: -4, rel: { father: -6 } }, log: '공에 이름이 적혀 있었다. {father}[이/가] 말없이 유리값을 치렀다.' } },
      { text: '초인종을 누르고 고개를 숙인다', effects: { money: -40, rep: 3, rel: { father: 3 } }, log: '옆집 할아버지가 "솔직해서 봐준다"며 유리값을 반만 받았다.' },
      { text: '친구들과 돈을 모아 유리 가게에 간다', check: { stat: 'social', diff: 40 },
        success: { effects: { money: -10, social: 3, rep: 2 }, log: '다섯이 나눠 내니 금방 모였다. 유리 가게 아저씨가 끼워 주는 법까지 알려 줬다.' },
        fail: { effects: { money: -40, social: -2 }, log: '다들 핑계를 대고 빠졌다. 혼자 다 물어냈다.' } }
    ] });
  K({ id: 'mis_skip_cram', cooldown: 3, age: [9, 12], origin: ['rich', 'middle', 'poor'], cond: { edu: ['elem'] },
    text: '학원 가는 길, 오락실 문이 활짝 열려 있다. 오늘은 학원 단어 시험 날이다.',
    choices: [
      { text: '오늘만 땡땡이친다', risky: true, check: { odds: 0.6 },
        success: { effects: { happy: 5, mischief: 3 }, log: '최고 기록을 세웠다. 학원에서는 아무 연락도 없었다.' },
        fail: { effects: { happy: -3, smarts: -1, mischief: 3, rel: { mother: -5 } }, log: '학원에서 문자가 갔다. 오락실 문 앞에 {mother}[이/가] 서 있었다.' } },
      { text: '학원 가서 단어 시험을 본다', effects: { smarts: 2, happy: -1 }, log: '단어 시험은 반타작. 그래도 빠지진 않았다.' },
      { text: '학원비를 빼돌려 오락실 정기권을 끊는다', risky: true, check: { odds: 0.3 },
        success: { effects: { happy: 6, mischief: 6, money: 20 }, log: '한 달 동안 오락실 VIP였다. 학원비 영수증은 내가 직접 위조했다.' },
        fail: { effects: { rel: { mother: -8, father: -5 }, mischief: 6, rep: -4 }, log: '학원 원장이 "한 달째 안 왔다"고 전화했다. 그날 저녁 식탁은 조용했다.' } }
    ] });
  K({ id: 'mis_fake_sick', cooldown: 4, age: [6, 12],
    text: '오늘은 줄넘기 시험이 있는 날. 이불 속에서 배를 움켜쥐어 본다.',
    choices: [
      { text: '꾀병 연기를 펼친다', risky: true, check: { stat: 'looks', diff: 35 },
        success: { effects: { happy: 4, mischief: 3 }, log: '죽까지 얻어먹었다. 오후엔 몰래 만화를 봤다.' },
        fail: { effects: { happy: -2, mischief: 3, rel: { mother: -4 } }, log: '"배 아픈 애가 왜 웃니?" 바로 등교했다.' } },
      { text: '아침 일찍 나가 줄넘기를 연습한다', check: { stat: 'health', diff: 35 },
        success: { effects: { grit: 2, health: 1 }, log: '이단 뛰기 세 번 성공. 처음으로 체육 시간이 기다려졌다.' },
        fail: { effects: { health: -2, happy: -1 }, log: '줄에 걸려 넘어져 무릎이 까졌다. 시험은 그래도 봤다.' } },
      { text: '그냥 가서 시험을 본다', effects: { grit: 1, happy: -1 }, log: '줄은 다섯 번 만에 걸렸다. 생각보다 아무도 신경 쓰지 않았다.' }
    ] });
  K({ id: 'mis_kid_runaway', once: true, age: [9, 12],
    text: '크게 혼난 날 밤. 책가방에 과자와 손전등을 넣었다. 가출이다.',
    choices: [
      { text: '친구 집에서 몰래 하룻밤 잔다', risky: true, check: { odds: 0.5 },
        success: { effects: { happy: 4, social: 2, mischief: 4, rel: { friend: 5 } }, log: '밤새 수다를 떨었다. 새벽에 슬그머니 돌아오니 아무도 몰랐다.' },
        fail: { effects: { happy: -4, mischief: 4, rel: { mother: -8, father: -4 } }, log: '온 동네가 나를 찾고 있었다. {mother}[이/가] 울면서 껴안았다.' } },
      { text: '버스를 타고 할머니 댁까지 간다', check: { stat: 'smarts', diff: 40 },
        success: { effects: { grit: 3, rel: { family: 2 } }, log: '할머니가 아무것도 묻지 않고 밥을 차려 줬다. 다음 날 {mother}[이/가] 데리러 왔다.' },
        fail: { effects: { happy: -6, flags: ['trauma'] }, log: '종점에서 내려 길을 잃었다. 낯선 동네에서 밤 열한 시에 경찰차를 탔다.' } },
      { text: '놀이터만 한 바퀴 돌고 들어간다', effects: { happy: 1, rel: { mother: 3 } }, log: '식탁에 저녁밥이 차려져 있었다. 가출은 20분 만에 끝났다.' }
    ] });
  K({ id: 'mis_class_prank', cooldown: 5, age: [8, 12], cond: { edu: ['elem'], traits: { mischief: [15, 100] } },
    text: '교탁 서랍에 장난감 개구리를 넣자는 작전이 돌고 있다. 실행 담당은 나다.',
    choices: [
      { text: '작전 개시', risky: true, check: { odds: 0.45 },
        success: { effects: { happy: 6, social: 3, fame: 1, mischief: 5 }, log: '선생님의 비명과 함께 반 전체가 뒤집어졌다. 전설이 됐다.' },
        fail: { effects: { happy: -3, mischief: 5, rep: -4, fx: ['suspend'] }, log: '설치하다 딱 걸렸다. 교장실까지 갔다.' } },
      { text: '개구리 대신 선생님 생일 케이크를 넣자고 바꾼다', check: { stat: 'social', diff: 45 },
        success: { effects: { social: 3, rep: 3 }, log: '선생님이 서랍을 열고 울컥했다. 장난꾸러기들이 하루 동안 모범생이 됐다.' },
        fail: { effects: { social: -3 }, log: '"재미없게 왜 그래?" 작전에서 빠지게 됐다.' } },
      { text: '이번엔 빠진다', effects: { rep: 1, social: -1 }, log: '다른 아이가 했다가 걸렸다. 휴, 살았다.' }
    ] });

  // ================================================================ money and luck (small bets as a child)
  K({ id: 'gam_arcade_claw', age: [7, 12], cooldown: 3, once: false,
    text: '오락실 앞 인형뽑기 기계. 집게가 반짝이며 손짓한다. 주머니엔 이번 주 용돈이 있다.',
    choices: [
      { text: '용돈을 기계에 넣는다', risky: true, bet: { odds: 0.35, mult: 2, stake: 'tiny', addict: 2 },
        success: { effects: { happy: 4 }, log: '집게가 인형을 꽉 물었다! 친구들이 환호했다.' },
        fail: { effects: { happy: -2 }, log: '인형이 집게에서 미끄러졌다. 용돈이 사라졌다.' } },
      { text: '그 돈으로 {food}[을/를] 사 먹는다', effects: { smarts: 1 }, log: '배가 든든하니 인형 생각이 사라졌다. 확실한 행복이다.' }
    ] });
  K({ id: 'gam_ddakji', cooldown: 3, age: [6, 11],
    text: '골목 딱지치기 판. 중학생 형이 "지면 네 딱지 다, 이기면 내 거 다" 하고 판을 키운다. 형 딱지는 이상하게 두껍다.',
    choices: [
      { text: '전부 건다', risky: true, bet: { odds: 0.4, mult: 2, stake: 'tiny', addict: 1 },
        success: { effects: { happy: 4, mischief: 1 }, log: '형의 두꺼운 딱지가 뒤집혔다! 골목이 들썩였다.' },
        fail: { effects: { happy: -3 }, log: '마지막 한 장까지 넘어갔다. 형 딱지 안에는 종이가 두 겹 들어 있었다.' } },
      { text: '"딱지 바꿔서 하자"고 따진다', check: { stat: 'grit', diff: 40 },
        success: { effects: { grit: 2, rep: 2 }, log: '형이 얼굴이 빨개져 판을 접었다. 꼬마들이 나를 따라다녔다.' },
        fail: { effects: { health: -3, happy: -2 }, log: '꿀밤을 세게 맞았다. 그 골목은 한동안 돌아서 다녔다.' } },
      { text: '구경만 하며 요령을 익힌다', effects: { smarts: 1 }, log: '누가 어떻게 이기는지 잘 봐 뒀다. 형 딱지의 비밀도.' }
    ] });

  // ================================================================ everyday moments with a price
  K({ id: 'life_any_ice_cream_truck', age: [5, 10], origin: POOR,
    text: '아이스크림 트럭 아저씨가 "트럭 청소 도와주면 하나 공짜"라고 한다. 주머니엔 동전 하나뿐이다.',
    choices: [
      { text: '걸레를 들고 트럭을 닦는다', effects: { grit: 2, happy: 3 }, log: '땀범벅이 됐지만 제일 비싼 걸로 골랐다. 일해서 먹는 아이스크림이었다.' },
      { text: '동전으로 하나 사서 {sis2}[과/와] 반씩 나눈다', effects: { happy: 2, rel: { sis2: 5 } }, log: '반으로 나눈 아이스크림이 한 통보다 맛있었다.' },
      { text: '출발하는 트럭 뒤에 매달린다', risky: true, check: { stat: 'health', diff: 45 },
        success: { effects: { happy: 4, mischief: 3 }, log: '동네 한 바퀴를 돌았다. 아저씨는 끝까지 몰랐다.' },
        fail: { effects: { health: -7, looks: -2, mischief: 3 }, log: '모퉁이에서 떨어져 이마를 꿰맸다. 아직도 앞머리로 흉터를 가린다.' } }
    ] });
  K({ id: 'rl_kid_sports_day', cooldown: 3, age: [7, 12], cond: { edu: SCHOOL },
    text: '운동회 반 대항 계주. 마지막 주자가 아침에 발목을 삐었다. 반 아이들이 일제히 나를 본다.',
    choices: [
      { text: '대신 바통을 받겠다고 나선다', check: { stat: 'health', diff: 40 },
        success: { effects: { fame: 1, happy: 4, social: 2 }, log: '마지막 코너에서 두 명을 제쳤다. 반 전체가 이름을 외쳤다.' },
        fail: { effects: { happy: -4, social: -1 }, log: '바통을 떨어뜨렸다. 꼴찌로 들어오며 고개를 들 수 없었다.' } },
      { text: '삔 친구 대신 응원단장을 맡는다', effects: { social: 2, happy: 2 }, log: '목이 쉬도록 응원했다. 계주는 졌지만 응원상은 우리 반이 받았다.' },
      { text: '삔 친구를 업고 보건실까지 간다', effects: { rep: 3, rel: { friend: 5 } }, log: '계주는 다른 아이가 뛰었다. 업혀 가던 친구가 "고마워"를 열 번 했다.' }
    ] });
  K({ id: 'rl_kid_quit_lesson', cooldown: 5, age: [7, 12], origin: ['rich', 'middle', 'poor'],
    text: '{mother}[이/가] 동네 피아노 학원 전단지를 들고 왔다. "체험 수업 한 번 받아 볼래? 다니려면 석 달 치를 먼저 내야 한대."',
    choices: [
      { text: '석 달 치를 내고 다녀 보겠다고 한다', check: { stat: 'grit', diff: 45 },
        success: { effects: { grit: 2, smarts: 1, happy: 2, money: -15 }, log: '석 달 뒤 발표회에서 짧은 곡 하나를 끝까지 쳤다. 더 다니고 싶어졌다.' },
        fail: { effects: { happy: -3, money: -15, rel: { mother: -2 } }, log: '한 달 만에 손가락이 아프다며 울었다. 미리 낸 학원비는 돌려받지 못했다.' } },
      { text: '피아노 대신 공 차는 교실에 보내 달라고 한다', alt: { text: '피아노 대신 {hobby} 교실에 보내 달라고 한다', log: '첫날부터 신이 났다. 전단지는 냉장고 자석 밑에 그대로 붙어 있다.' }, effects: { football: 3, happy: 3, money: -10 }, log: '첫날부터 땀범벅이 됐다. 전단지는 냉장고 자석 밑에 그대로 붙어 있다.' },
      { text: '체험 수업 날 몰래 놀이터로 샌다', risky: true, check: { odds: 0.4 },
        success: { effects: { happy: 3, mischief: 3 }, log: '아무도 몰랐다. "체험해 보니 별로였어"라는 말에 {mother}[은/는] 고개만 끄덕였다.' },
        fail: { effects: { happy: -4, mischief: 3, rep: -2, rel: { mother: -4 } }, log: '학원 원장이 집으로 전화를 걸었다. "체험 수업에 안 왔던데요?"' } }
    ] });
  K({ id: 'life_any_time_capsule', age: [10, 12],
    text: '반 친구들과 학교 뒷산에 타임캡슐을 묻기로 했다. 20년 뒤에 같이 열기로 했다.',
    choices: [
      { text: '미래의 나에게 꿈을 적은 편지를 넣는다', effects: { happy: 3, smarts: 1, flags: ['time_capsule'] }, schedule: { id: 'life_any_time_capsule_open', years: 20 }, log: '"미래의 나, 꿈은 이뤘니?" 봉투에 침을 발라 붙였다.' },
      { text: '좋아하는 아이 이름을 쓴 쪽지를 넣는다', risky: true, check: { odds: 0.6 },
        success: { effects: { happy: 3, flags: ['time_capsule'] }, log: '아무도 못 봤다. 20년 뒤의 나에게 맡겨 두기로 했다.' },
        fail: { effects: { happy: -4, social: -1, flags: ['time_capsule'] }, log: '짓궂은 아이가 몰래 펼쳐 읽었다. 다음 날 칠판에 이름 두 개와 하트가 그려져 있었다.' },
        schedule: { id: 'life_any_time_capsule_open', years: 20 } }
    ] });

  // ================================================================ the neighbourhood you were born into
  K({ id: 'chd_slum_scrap', age: [8, 12], origin: ['slum'],
    text: '골목 형들이 철길 옆에서 고철을 주워 팔면 하루 용돈은 번다고 한다. 철길엔 화물 열차가 자주 지나간다.',
    choices: [
      { text: '형들을 따라 철길로 간다', risky: true, check: { stat: 'health', diff: 50 },
        success: { effects: { money: 40, grit: 3, mischief: 2 }, log: '자루 하나를 채워 고물상에 넘겼다. 처음 번 돈을 {mother} 지갑에 몰래 넣었다.' },
        fail: { effects: { health: -10, flags: ['trauma'] }, log: '열차 경적에 놀라 자갈 위로 굴렀다. 다리를 크게 다쳤고, 그 뒤로 기차 소리만 나면 몸이 굳었다.' } },
      { text: '시장 상인들 짐을 날라 주고 잔돈을 받는다', effects: { money: 15, grit: 2, social: 2 }, log: '하루 종일 상자를 날랐다. 생선 가게 아주머니가 "내일도 와라" 했다.' },
      { text: '방과 후 공부방에 남는다', effects: { smarts: 3, social: -1 }, log: '봉사자 선생님이 숙제를 봐 줬다. 형들은 "범생이"라고 놀렸다.' }
    ] });
  K({ id: 'chd_slum_walk', age: [6, 10], origin: ['slum'],
    text: '학교 가는 지름길 모퉁이에 무서운 형들이 진을 치고 있다. 지나가는 꼬마들 주머니를 뒤진다.',
    choices: [
      { text: '숨을 참고 전력으로 뛰어 지나간다', risky: true, check: { stat: 'health', diff: 40 },
        success: { effects: { grit: 2, happy: 1 }, log: '형들이 쫓아오다 말았다. 매일 아침이 달리기 시합이 됐다.' },
        fail: { effects: { money: -10, happy: -5, flags: ['bullied'] }, log: '뒷덜미를 잡혔다. 급식비를 뺏기고 그날 점심을 굶었다.' } },
      { text: '30분 돌아가는 큰길로 다닌다', effects: { smarts: -1, health: 1, rep: -1 }, log: '매일 지각해서 교문 앞에 섰다. 그래도 주머니는 무사했다.' },
      { text: '{bro}에게 아침마다 데려다 달라고 한다', effects: { rel: { bro: 5 }, social: 1 }, log: '{bro}[이/가] 투덜대면서도 매일 같이 걸어 줬다. 그 모퉁이 형들은 {bro}[과/와] 아는 사이였다.' }
    ] });
  K({ id: 'chd_poor_trip_fee', age: [8, 12], origin: POOR,
    text: '다음 주 현장 체험 학습비를 내야 한다. 봉투를 보고 {mother}[이/가] 한참 말이 없다.',
    choices: [
      { text: '"배 아파서 못 간다"고 미리 말해 둔다', effects: { happy: -4, rel: { mother: 5 } }, log: '친구들이 놀이공원 사진을 자랑하는 날, 혼자 교실에서 자습을 했다.' },
      { text: '담임 선생님께 지원 신청서를 받는다', check: { stat: 'social', diff: 40 },
        success: { effects: { happy: 3, rep: 1 }, log: '선생님이 조용히 처리해 줬다. 아무도 몰랐다.' },
        fail: { effects: { happy: -5, social: -2 }, log: '종례 시간에 지원 대상자 이름이 불렸다. 뒷자리에서 키득거리는 소리가 들렸다.' } },
      { text: '빈 병을 모아 직접 돈을 마련한다', check: { stat: 'grit', diff: 45 },
        success: { effects: { grit: 4, money: 10, happy: 3 }, log: '일주일 동안 빈 병 백 개를 모았다. 봉투를 내미는 손이 떨렸다.' },
        fail: { effects: { health: -2, happy: -3 }, log: '깨진 병에 손을 베었다. 돈은 절반밖에 못 모았다.' } }
    ] });
  K({ id: 'chd_rich_driver', age: [6, 10], origin: ['rich'],
    text: '하교 시간, 교문 앞에 검은 차와 기사 아저씨가 서 있다. 친구들이 "부잣집 도련님"이라고 놀린다.',
    choices: [
      { text: '한 블록 떨어진 곳에 세워 달라고 한다', effects: { social: 2, rel: { father: -2 } }, log: '모퉁이까지 걸어가 차를 탔다. {father}[은/는] "뭐가 부끄러우냐"고 했다.' },
      { text: '친구들을 태워 같이 집에 간다', check: { stat: 'social', diff: 40 },
        success: { effects: { social: 4, fx: ['newFriend'] }, log: '뒷자리에 넷이 끼어 앉아 노래를 불렀다. 놀림은 그날로 끝났다.' },
        fail: { effects: { social: -3, happy: -3 }, log: '"자랑하냐?" 다음 날부터 놀림이 더 심해졌다.' } },
      { text: '기사 아저씨 몰래 친구들과 버스를 탄다', risky: true, check: { odds: 0.5 },
        success: { effects: { happy: 5, mischief: 2, social: 2 }, log: '처음 탄 버스는 놀이기구 같았다. 집에선 난리가 났지만 그날 친구가 생겼다.' },
        fail: { effects: { happy: -4, flags: ['trauma'] }, log: '버스를 잘못 타 낯선 동네에 내렸다. 경찰이 집에 데려다줬다. {mother}[이/가] 실신할 뻔했다.' } }
    ] });
  K({ id: 'chd_rich_exam', age: [10, 12], origin: ['rich'], cond: { edu: ['elem'] },
    text: '명문 사립 중학교 입학시험이 코앞이다. 부모님이 "어디서 구한" 기출 문제지 봉투를 책상에 올려놓았다.',
    choices: [
      { text: '봉투를 열어 외운다', risky: true, check: { odds: 0.6 },
        success: { effects: { smarts: 2, mischief: 3, flags: ['elite_school'] }, log: '합격했다. 입학식 날 교복이 이상하게 무거웠다.' },
        fail: { effects: { rep: -6, happy: -6, rel: { father: -4 } }, log: '문제 유출이 뉴스에 났다. 우리 집도 조사를 받았다. 학교에서 다들 수군거렸다.' } },
      { text: '봉투를 돌려주고 내 실력으로 친다', check: { stat: 'smarts', diff: 60 },
        success: { effects: { smarts: 3, grit: 3, flags: ['elite_school'] }, log: '합격자 명단에 내 이름이 있었다. 아무 빚 없는 합격이었다.' },
        fail: { effects: { happy: -4, rel: { father: -3 } }, log: '떨어졌다. {father}[은/는] "그러게 봉투를 보라니까"라고 했다. 그래도 후회하진 않았다.' } },
      { text: '"그 학교 안 가고 싶어요"라고 말한다', effects: { happy: 3, rel: { father: -6, mother: -2 }, flags: ['refused_family_plan'] }, log: '집 안이 얼어붙었다. 동네 중학교에 갔고, 처음으로 숨이 쉬어졌다.' }
    ] });
  K({ id: 'chd_mid_noise', age: [6, 10], origin: ['middle'],
    text: '아랫집 아저씨가 올라와 문을 두드렸다. "밤마다 쿵쿵거리는 게 이 집 애냐!"',
    choices: [
      { text: '{mother} 뒤에 숨어 "아니에요"라고 한다', risky: true, check: { odds: 0.5 },
        success: { effects: { happy: 1, mischief: 2 }, log: '아저씨는 윗집을 의심하며 내려갔다. 그날부터 까치발로 걸었다.' },
        fail: { effects: { rel: { mother: -4 }, rep: -2, mischief: 2 }, log: '등 뒤에서 공이 굴러 나왔다. 아저씨 얼굴이 더 빨개졌다.' } },
      { text: '직접 사과 쪽지와 과자를 들고 내려간다', effects: { rep: 3, money: -5, social: 2 }, log: '아저씨가 쪽지를 냉장고에 붙였다고 한다. 명절마다 귤을 올려 보냈다.' },
      { text: '거실에 매트를 깔자고 조른다', effects: { money: -50, happy: 2 }, log: '매트 위에서는 마음껏 뛰었다. 매트값은 내 생일 선물이었다.' }
    ] });

  // ================================================================ the football story (football kids only)
  K({ id: 'canon_kitroom', weight: 30, once: true, age: [5, 6], cond: { flags: ['!heir'], rel: { father: 'alive' } },
    text: '{fatherJob2}인 {father}[을/를] 따라 {localClub}의 장비실에 갔다. 땀 냄새 나는 유니폼이 산더미다.',
    choices: [
      { text: '유니폼 개는 걸 돕는다', effects: { grit: 2, rel: { father: 6 } }, log: '{father}[이/가] 머리를 쓰다듬으며 "넌 일을 야무지게 하는구나" 했다.' },
      { text: '몰래 운동장에 나가 공을 찬다', alt: { text: '장비실 구석에서 {hobbyAct}에 빠진다', log: '유니폼 더미 사이에서 {hobbyAct}에 빠져 있다가 잠이 들었다. {father}[이/가] 업어서 집에 데려갔다.',
          fail: { log: '장비 상자를 엎어 버렸다. {father}[이/가] 혼자 남아 정리했다.' } },
        check: { stat: 'football', diff: 6 },
        success: { effects: { football: 3 }, log: '1군 형들이 꼬마의 드리블을 보고 휘파람을 불었다.' },
        fail: { effects: { health: -2, happy: -1 }, log: '공에 걸려 넘어져 무릎이 까졌다. 1군 형이 반창고를 붙여 줬다.' } },
      { text: '창고의 새 공 하나를 가방에 넣는다', risky: true, check: { odds: 0.45 },
        success: { effects: { happy: 4, mischief: 2 }, log: '집 마당에 새 공이 생겼다. 밤마다 그 공을 안고 잤다.' },
        fail: { effects: { rel: { father: -6 }, mischief: 2 }, log: '창고 관리인에게 들켰다. {father}[이/가] 내 대신 고개를 숙이고 월급에서 공값을 뺐다.' } }
    ] });
  K({ id: 'canon_join_local', priority: true, once: true, age: [6, 8], cond: { flags: ['!heir', '!fb_quit'], fb: ['none'] },
    text: '{localClub}의 {coach}[이/가] 골목에서 공을 차는 {name}[을/를] 보더니 물었다. "너, 우리 팀에서 뛰어 볼래? 회비는 한 달에 조금 든다."',
    choices: [
      { text: '"네!" 하고 그 자리에서 대답한다', effects: { happy: 6, rel: { mother: -2 }, fx: ['joinLocalClub'] }, log: '그날 밤 축구화를 신은 채로 잠들었다. {mother}[은/는] 회비 봉투를 보며 한숨을 쉬었다.' },
      { text: '{mother}에게 먼저 허락을 받는다', check: { stat: 'social', diff: 35 },
        success: { effects: { rel: { mother: 5 }, fx: ['joinLocalClub'] }, log: '{mother}[은/는] 잠시 고민하더니 "다치지만 마라"며 부업을 하나 더 늘렸다.' },
        fail: { effects: { happy: -4, flags: ['declined_club'] }, log: '"이번 달은 안 돼." 회비가 없었다. 골목에서 혼자 공을 찼다.' } },
      { text: '"축구보다 다른 게 좋아요"라고 한다', effects: { smarts: 2, flags: ['declined_club'] }, log: '{coach}[은/는] 어깨를 으쓱했다. 공은 골목에서만 찼다.' }
    ] });
  K({ id: 'fb_street', weight: 12, cooldown: 3, age: [5, 11], cond: { fb: ['none', 'local'] }, flavour: 'football',
    text: '골목에서 동네 형들이 슬리퍼를 골대 삼아 축구를 한다. "끼고 싶으면 네 공을 걸어. 지면 공은 우리 거다."',
    choices: [
      { text: '내 공을 걸고 끼어든다', risky: true, check: { stat: 'football', diff: 18 },
        success: { effects: { football: 3, happy: 3, social: 1 }, log: '형들 다리 사이로 공을 빼서 결승 골을 넣었다. 다음 날부터 형들이 먼저 불렀다.' },
        fail: { effects: { happy: -4, football: 1 }, log: '0대 5로 졌다. 아끼던 공은 형들 차지가 됐다.' } },
      { text: '아무도 안 하려는 골키퍼를 자청한다', check: { stat: 'health', diff: 35 },
        success: { effects: { football: 2, grit: 2 }, log: '몸을 날려 세 골을 막았다. "꼬맹이 손 좀 봐라!"' },
        fail: { effects: { health: -3, football: 1 }, log: '형의 슛을 얼굴로 막았다. 코피가 났지만 경기는 계속됐다.' } },
      { text: '담벼락에 앉아 형들 기술을 외운다', effects: { smarts: 1, football: 1 }, log: '헛다리 기술을 머릿속으로 백 번 따라 했다.' }
    ] });
  K({ id: 'fb_coach_mentor', weight: 12, cooldown: 3, age: [6, 12], cond: { fb: ['local', 'regional'] },
    text: '{coach}[이/가] 훈련이 끝난 뒤 따로 불렀다. "넌 왼발이 약해. 한 달 동안 오른발 금지다."',
    choices: [
      { text: '왼발만 쓰는 특훈을 한다', check: { stat: 'grit', diff: 40 },
        success: { effects: { football: 3, grit: 2 }, log: '한 달 뒤 왼발로 감아 찬 슛이 골대 구석에 꽂혔다.' },
        fail: { effects: { football: 1, health: -4 }, log: '무리하다 허벅지가 찢어질 듯 아팠다. 2주를 쉬었다.' } },
      { text: '"오른발이면 충분해요!" 하고 웃어넘긴다', effects: { happy: 2, rel: { coach: -3 } }, log: '{coach}[은/는] 웃기만 했다. 그 말을 이해하게 된 건 몇 년 뒤였다.' },
      { text: '{bro}에게 매일 밤 연습 상대를 부탁한다', effects: { football: 2, rel: { bro: 5 }, happy: -1 }, log: '{bro}[이/가] 담벼락에 분필로 과녁을 그려 줬다. 밤마다 둘이 공을 찼다.' }
    ] });
  K({ id: 'life_child_rain_football', age: [6, 12], flavour: 'football',
    text: '폭우가 쏟아지는데 골목 아이들이 공을 들고 공터에 모였다. 공터는 이미 진흙탕이다.',
    choices: [
      { text: '진흙탕 축구에 뛰어든다', check: { stat: 'health', diff: 40 },
        success: { effects: { football: 2, happy: 4, rel: { mother: -1 } }, log: '온몸이 진흙투성이. {mother}[은/는] 빨래통을 보며 할 말을 잃었다.' },
        fail: { effects: { football: 1, health: -5 }, log: '비를 너무 맞아 독감에 걸렸다. 일주일을 앓아누웠다.' } },
      { text: '미끄러운 골문 앞에서 몸을 날린다', risky: true, check: { odds: 0.5 },
        success: { effects: { football: 2, grit: 2, fame: 1 }, log: '진흙 속 슈퍼세이브. 동네 형들이 별명을 지어 줬다.' },
        fail: { effects: { health: -4 }, log: '손가락이 꺾였다. 붕대를 감고 한 달 동안 숟가락을 왼손으로 들었다.' } },
      { text: '창문으로 구경하며 작전을 그린다', effects: { smarts: 1 }, log: '공책에 공터 지도를 그리고 누가 어디로 뛰는지 화살표를 그렸다.' }
    ] });
  K({ id: 'path_talent_coach', once: true, age: [8, 12], cond: { stats: { football: [40, 100] }, fb: ['none'] }, flavour: 'football',
    text: '체육 선생님이 골목 축구를 보다가 다가왔다. "학교 축구부 입단 테스트가 토요일이다. 와 볼래?"',
    choices: [
      { text: '테스트를 보러 간다', check: { stat: 'football', diff: 45 },
        success: { effects: { happy: 4, fx: ['joinLocalClub'], flags: ['path_football'] }, log: '합격! 첫 유니폼이 무릎까지 내려왔다.' },
        fail: { effects: { grit: 3, happy: -3 }, log: '이름이 불리지 않았다. 다음 해에 다시 오라는 말을 들었다.' } },
      { text: '골목 축구가 제일 재밌다고 사양한다', effects: { happy: 2, social: 1 }, log: '선생님은 아쉬워했다. 골목에선 여전히 내가 왕이었다.' }
    ] });
  K({ id: 'canon_regional_offer', priority: true, once: true, age: [9, 11], cond: { flags: ['!heir'], fb: ['local'], stats: { football: [20, 100] } },
    text: '{regionalClub}의 스카우트가 {localClub} 경기를 보러 왔다. "이 아이, 우리 유소년팀으로 데려가고 싶습니다." 버스로 한 시간 거리다.',
    choices: [
      { text: '더 큰 무대로 간다', check: { stat: 'football', diff: 30 },
        success: { effects: { happy: 4, fx: ['joinRegionalClub'] }, log: '{father}[은/는] 장비실 동료들에게 밤새 자랑을 했다고 한다.' },
        fail: { effects: { happy: -2, health: -1, fx: ['joinRegionalClub'] }, log: '첫 시즌은 벤치였다. 새벽 버스에서 졸다 내릴 곳을 지나친 날도 많았다.' } },
      { text: '친구들이 있는 {localClub}에 남는다', effects: { happy: 2, rel: { friend: 5 }, flags: ['stayed_local'] }, log: '조금 더 동네의 왕으로 남기로 했다.' }
    ] });
  K({ id: 'canon_regional_late', weight: 30, once: true, age: [12, 14], cond: { fb: ['local'], stats: { football: [30, 100] } },
    text: '{regionalClub}에서 다시 연락이 왔다. "아직 늦지 않았다. 다만 이번엔 테스트를 봐야 한다."',
    choices: [
      { text: '테스트에 도전한다', check: { stat: 'football', diff: 40 },
        success: { effects: { fx: ['joinRegionalClub'] }, log: '새 유니폼이 몸에 꼭 맞았다.' },
        fail: { effects: { happy: -3, grit: 2 }, log: '떨어졌다. 동네 팀 친구들이 아무 말 없이 어깨를 툭 쳤다.' } },
      { text: '그냥 즐기면서 찬다', effects: { happy: 3 }, log: '공은 취미로도 충분히 즐겁다.' }
    ] });
  K({ id: 'canon_academy_offer', priority: true, once: true, age: [12, 12], cond: { flags: ['!heir'], fb: ['regional', 'local'], stats: { football: [42, 100] } },
    text: '{bigcity}의 {academy}에서 입단 테스트 합격 통지가 왔다. 단, 열두 살에 혼자 {bigcity}[으로/로] 올라가 기숙사에서 지내야 한다.',
    choices: [
      { text: '혼자 떠난다', effects: { grit: 4, happy: -3, rel: { mother: -2 }, fx: ['joinAcademy'] }, log: '{hometown}[을/를] 떠나는 날, {mother}[은/는] 손을 흔들다 끝내 돌아서서 울었다.' },
      { text: '가족 곁에 남는다', effects: { happy: 3, rel: { family: 6 }, flags: ['stayed_home'] }, log: '아직은 엄마 밥이 더 좋다. 기회는 또 올지도 모른다.' },
      { text: '주말마다 집에 보내 달라고 구단에 편지를 쓴다', check: { stat: 'smarts', diff: 50 },
        success: { effects: { grit: 2, rel: { mother: 3 }, fx: ['joinAcademy'] }, log: '구단이 첫 해만은 한 달에 한 번 집에 보내 주기로 했다. {mother}[은/는] 달력에 동그라미를 그렸다.' },
        fail: { effects: { happy: -4, flags: ['stayed_home'] }, log: '"특별 대우는 없다." 답장을 받고 결국 남기로 했다. 한동안 공이 손에 잡히지 않았다.' } }
    ] });
  K({ id: 'canon_first_night', priority: true, once: true, flavour: 'football', age: [12, 15], cond: { flags: ['moved_alone'], fb: ['academy'] },
    text: '{academy} 기숙사의 첫날 밤. 낯선 천장, 낯선 이불. 내일 아침 6시에 체력 테스트가 있다.',
    choices: [
      { text: '공중전화로 {mother} 목소리를 듣는다', effects: { money: -5, happy: 3, rel: { mother: 6 } }, log: '전화 카드가 다 닳을 때까지 "괜찮아"만 반복했다.' },
      { text: '이불 속에서 몰래 운다', effects: { happy: -3, grit: 3, flags: ['homesick'] }, log: '아침이 되자 퉁퉁 부은 눈으로 가장 먼저 운동장에 나갔다.' },
      { text: '불 꺼진 체육관에서 혼자 훈련한다', risky: true, check: { stat: 'health', diff: 45 },
        success: { effects: { football: 2, grit: 2 }, log: '경비 아저씨가 손전등을 비추며 "또 너냐"라고 했다. 다음 날 테스트 1등이었다.' },
        fail: { effects: { health: -4, happy: -2 }, log: '잠이 모자라 아침 테스트에서 토했다. 코치 수첩에 첫 기록이 꼴찌로 적혔다.' } }
    ] });
  // far from home at the academy: each country has its own trouble, not another phone call home
  K({ id: 'kr_seoul_homesick', flavour: 'football', age: [12, 15], countries: ['kr'], cond: { flags: ['moved_alone'] },
    text: '{bigcity} 기숙사. 고등부 선배가 자기 빨래 바구니를 내 침대에 던져 놓고 갔다. "내일 아침까지."',
    choices: [
      { text: '말없이 빨래를 해 둔다', effects: { grit: 2, happy: -3 }, log: '세탁실에서 새벽 한 시까지 있었다. 다음 주엔 바구니가 두 개였다.' },
      { text: '바구니를 선배 방 앞에 도로 갖다 놓는다', risky: true, check: { stat: 'grit', diff: 50 },
        success: { effects: { rep: 3, grit: 3 }, log: '선배가 한참 노려보더니 그냥 들고 들어갔다. 동기들이 나를 다시 봤다.' },
        fail: { effects: { health: -4, happy: -5, flags: ['bullied'] }, log: '그날 밤 선배 셋이 방으로 찾아왔다. 한동안 식당에서 혼자 밥을 먹었다.' } },
      { text: '사감 선생님께 찾아간다', effects: { rep: 1, social: -2 }, log: '선배는 벌점을 받았다. 복도에서 "고자질" 소리가 따라다녔다.' }
    ] });
  K({ id: 'jp_tokyo_parcel', flavour: 'football', age: [12, 15], countries: ['jp'], cond: { flags: ['moved_alone'] },
    text: '{mother}[이/가] 보낸 사타안다기 상자가 사물함에서 반이나 비었다. 룸메이트 입가에 설탕이 묻어 있다.',
    choices: [
      { text: '남은 걸 룸메이트와 마저 나눠 먹는다', effects: { happy: 3, fx: ['newFriend'] }, log: '"너희 엄마 천재다." 그날부터 둘은 단짝이 됐다.' },
      { text: '룸메이트에게 정면으로 따진다', check: { stat: 'social', diff: 45 },
        success: { effects: { rep: 2, social: 2 }, log: '룸메이트가 얼굴이 빨개져 사과하고 매점 빵을 사 왔다.' },
        fail: { effects: { happy: -4, social: -2 }, log: '말싸움이 주먹다짐 직전까지 갔다. 방 안 공기가 한 달 동안 얼어 있었다.' } },
      { text: '사물함에 자물쇠를 달고 혼자 먹는다', effects: { happy: 1, social: -2, flags: ['homesick'] }, log: '마지막 하나를 먹던 날 바다 냄새가 그리웠다. 방에는 말이 없었다.' }
    ] });
  K({ id: 'cn_shanghai_winter', flavour: 'football', age: [12, 15], countries: ['cn'], cond: { flags: ['moved_alone'] },
    text: '{bigcity}의 첫 겨울. 축축한 추위가 뼛속까지 스민다. 겨울이 없는 섬에서 온 {name}에겐 패딩조차 없다.',
    choices: [
      { text: '한 달 식비로 시장에서 패딩을 산다', effects: { health: 2, happy: -1, money: -30 }, log: '한 달 내내 컵라면으로 버텼다. 그래도 밤에는 떨지 않았다.' },
      { text: '옷을 세 겹 껴입고 버틴다', check: { stat: 'health', diff: 50 },
        success: { effects: { grit: 3 }, log: '겨울이 끝날 무렵 동기들이 "곰"이라고 불렀다. 감기 한 번 안 걸렸다.' },
        fail: { effects: { health: -7, happy: -2 }, log: '폐렴으로 열흘을 입원했다. 그 사이 훈련 명단에서 이름이 빠졌다.' } },
      { text: '코치에게 사정을 말한다', alt: { text: '하숙집 아주머니에게 사정을 말한다', log: '아주머니가 아들이 입던 겨울 점퍼를 꺼내 주었다.' }, effects: { rel: { coach: 4 }, happy: 2 }, log: '{coach}[이/가] 구단 창고에서 겨울 점퍼를 꺼내 주었다.' }
    ] });
  K({ id: 'us_la_homesick', flavour: 'football', age: [12, 15], countries: ['us'], cond: { flags: ['moved_alone'] },
    text: '{bigcity} 하숙집 아들이 차고에서 몰래 전자 담배를 내민다. "여기선 다 해. 촌스럽게 굴지 마."',
    choices: [
      { text: '한 모금 빨아 본다', risky: true, check: { odds: 0.5 },
        success: { effects: { social: 2, mischief: 3 }, log: '기침이 터졌다. 하숙집 아들이 웃으며 어깨동무를 했다.' },
        fail: { effects: { mischief: 3, rep: -4, health: -2 }, log: '하숙집 아주머니가 차고 문을 열었다. 아카데미에 연락이 갔다.' } },
      { text: '"운동하는 사람은 안 해"라고 거절한다', effects: { grit: 2, social: -1 }, log: '하숙집 아들은 한동안 말을 걸지 않았다. 대신 아침마다 같이 뛰자고 했다.' },
      { text: '대신 스팸 무스비를 만들어 준다', check: { stat: 'social', diff: 40 },
        success: { effects: { happy: 3, fx: ['newFriend'] }, log: '고향 맛에 하숙집 아들이 눈이 동그래졌다. 그날부터 둘은 단짝이 됐다.' },
        fail: { effects: { happy: -2 }, log: '"이게 뭐야?" 접시는 그대로 돌아왔다.' } }
    ] });
  K({ id: 'br_sp_homesick', flavour: 'football', age: [12, 15], countries: ['br'], cond: { flags: ['moved_alone'] },
    text: '훈련장 밖에서 금목걸이를 한 남자가 다가왔다. "에이전트다. 계약서에 사인만 하면 유럽 구단에 보내 주지. 수수료는 첫 연봉의 절반."',
    choices: [
      { text: '그 자리에서 사인한다', risky: true, check: { odds: 0.3 },
        success: { effects: { happy: 4, fame: 1 }, log: '정말로 유럽 구단 테스트 초청장이 왔다. 남자는 계약서를 흔들며 웃었다.' },
        fail: { effects: { money: -60, happy: -6, rel: { mother: -3 } }, log: '"등록비"만 받고 사라졌다. {mother}[이/가] 빌려 보낸 돈이었다.' } },
      { text: '계약서를 들고 {coach}에게 보여 준다', effects: { smarts: 2, rel: { coach: 4 } }, log: '"사기꾼이야. 다들 한 번씩 당한다." {coach}[이/가] 계약서를 찢었다.' },
      { text: '{mother}에게 전화해 물어본다', effects: { rel: { mother: 5 }, flags: ['homesick'] }, log: '"엄마는 모르겠다. 그래도 서두르지 마라." 전화를 끊고 한참 울었다.' }
    ] });
  K({ id: 'ar_bsas_homesick', flavour: 'football', age: [12, 15], countries: ['ar'], cond: { flags: ['moved_alone'] },
    text: '기숙사 사물함이 열려 있다. {mother}[이/가] 보내 준 한 달 용돈 봉투가 사라졌다.',
    choices: [
      { text: '방마다 찾아다니며 범인을 찾는다', check: { stat: 'smarts', diff: 45 },
        success: { effects: { rep: 3, money: 20 }, log: '복도 쓰레기통에서 빈 봉투를 찾았다. 범인은 옆방 고등부였다. 돈은 반만 돌려받았다.' },
        fail: { effects: { social: -3, happy: -3 }, log: '애꿎은 룸메이트를 의심했다. 그 뒤로 방에서 말이 사라졌다.' } },
      { text: '집에는 말하지 않고 한 달을 버틴다', effects: { grit: 3, health: -2 }, log: '점심은 구단 식당 빵으로 때웠다. {mother}[은/는] 끝까지 몰랐다.' },
      { text: '하숙집 가족 일을 돕고 용돈을 번다', effects: { grit: 2, social: 2, money: 10 }, log: '주말마다 아사도 장작을 날랐다. 집주인이 고향 양고기 굽는 법을 물어봤다.' }
    ] });
  K({ id: 'za_joburg_homesick', flavour: 'football', age: [12, 15], countries: ['za'], cond: { flags: ['moved_alone'] },
    text: '야간 훈련이 늦게 끝났다. 숙소까지 마지막 버스는 이미 떠났다. 지름길은 가로등 없는 골목이다.',
    choices: [
      { text: '지름길로 뛰어간다', risky: true, check: { odds: 0.6 },
        success: { effects: { grit: 2 }, log: '심장이 터질 것 같았지만 무사히 도착했다. 다시는 혼자 그 길로 가지 않았다.' },
        fail: { effects: { money: -20, happy: -6, flags: ['trauma'] }, log: '어둠 속에서 두 사람이 길을 막았다. 축구화 가방을 뺏겼다. 그날 이후 밤길이 무서웠다.' } },
      { text: '훈련장에 남아 코치에게 태워 달라고 한다', effects: { rel: { coach: 3 }, happy: -1 }, log: '{coach}[이/가] 투덜대며 차 키를 집었다. 숙소 앞에서 "다음엔 미리 말해"라고 했다.' },
      { text: '동료들과 함께 큰길로 돌아간다', effects: { social: 2, health: -1 }, log: '한 시간을 걸었다. 다 같이 고향 노래를 부르니 길이 짧아졌다.' }
    ] });
  K({ id: 'in_kolkata_homesick', flavour: 'football', age: [12, 15], countries: ['in'], cond: { flags: ['moved_alone'] },
    text: '{bigcity} 학교 수업이 처음 듣는 말로 진행된다. 중간고사 성적이 낮으면 아카데미에서 내보낸다고 한다.',
    choices: [
      { text: '밤마다 사전을 끼고 공부한다', check: { stat: 'smarts', diff: 45 },
        success: { effects: { smarts: 3, grit: 2 }, log: '시험을 통과했다. 식당 아주머니가 "이제 우리 말 다 하네" 하고 웃었다.' },
        fail: { effects: { health: -3, happy: -3, flags: ['academy_warning'] }, log: '잠을 줄여도 점수가 안 나왔다. 아카데미에서 경고장이 날아왔다.' } },
      { text: '같은 고향 선배에게 과외를 부탁한다', effects: { social: 2, money: -10, smarts: 2 }, log: '선배가 고향 말로 하나하나 풀어 줬다. 대가는 축구화 닦기 한 달이었다.' },
      { text: '훈련만 하고 시험은 운에 맡긴다', risky: true, check: { odds: 0.4 },
        success: { effects: { football: 2, happy: 2 }, log: '커트라인에 딱 걸쳐 통과했다. 등에 식은땀이 흘렀다.' },
        fail: { effects: { happy: -5, flags: ['academy_warning'] }, log: '낙제점이었다. 한 번만 더 그러면 집으로 돌아가야 한다.' } }
    ] });

  // ================================================================ festivals and country life
  K({ id: 'kr_chuseok_songpyeon', age: [5, 12], countries: ['kr'],
    text: '추석 전날, 친척들이 오기 전에 송편 백 개를 빚어야 한다. {mother}[이/가] 찜통에 물을 올렸다.',
    choices: [
      { text: '끝까지 옆에 앉아 빚는다', effects: { rel: { mother: 6 }, happy: -1 }, log: '손가락이 쑤시도록 빚었다. {mother}[이/가] "예쁘게 빚으면 예쁜 짝 만난다"며 웃었다.' },
      { text: '찜통 불 조절을 맡겠다고 나선다', check: { stat: 'smarts', diff: 35 },
        success: { effects: { smarts: 1, rel: { family: 3 } }, log: '송편이 한 개도 터지지 않았다. 큰아버지가 "우리 집 요리사"라고 불렀다.' },
        fail: { effects: { health: -3 }, log: '뚜껑을 열다 김에 손등을 데었다. 송편 반은 터져 버렸다.' } },
      { text: '골목으로 나가 공을 찬다', alt: { text: '방에 들어가 {hobbyAct}에 빠진다', log: '송편 대신 {hobbyAct}. {mother}[은/는] "그래도 하나는 빚어라" 하며 웃었다.',
          fail: { log: '친척들 앞에서 혼자 방에만 있다고 꾸중을 들었다.' } },
        check: { stat: 'football', diff: 30 },
        success: { effects: { football: 2, happy: 2, rel: { mother: -1 } }, log: '돌담 사이로 드리블하다 동네 형들 사이에서 골을 넣었다.' },
        fail: { effects: { rel: { mother: -3 }, happy: -1 }, log: '공이 귤밭으로 굴러가 주인 할머니께 혼났다.' } }
    ] });
  K({ id: 'jp_eisa_drum', age: [6, 12], countries: ['jp'],
    text: '오봉이 다가오자 마을 청년들이 에이사 북 연습을 시작했다. {father}[은/는] 젊었을 때 북 치는 줄 맨 앞이었다고 자랑한다.',
    choices: [
      { text: '어른용 큰 북을 메고 줄에 선다', check: { stat: 'health', diff: 40 },
        success: { effects: { grit: 2, happy: 3, rel: { father: 4 } }, log: '행렬 끝까지 북을 쳤다. {father}[이/가] 오랜만에 소리 내어 웃었다.' },
        fail: { effects: { happy: -3, health: -2 }, log: '북이 무거워 행렬 한가운데서 넘어졌다. 어깨에 멍이 들었다.' } },
      { text: '어린이용 작은 북을 고른다', effects: { happy: 2, social: 1 }, log: '꼬마들 줄 맨 앞에서 신나게 쳤다. 사진 속 표정이 제일 밝았다.' },
      { text: '해변에서 혼자 공을 찬다', alt: { text: '해변에서 혼자 {hobbyAct}[을/를] 한다', log: '북소리를 배경 삼아 하루를 보냈다.' }, effects: { football: 2, rel: { father: -2 } }, log: '북소리를 박자 삼아 리프팅을 했다. {father}[은/는] 조금 서운해했다.' }
    ] });
  K({ id: 'jp_bento', age: [7, 12], countries: ['jp'], origin: POOR,
    text: '소풍 날. 친구들 도시락엔 캐릭터 주먹밥이 가득한데, 내 도시락엔 가게에서 남은 {food}[이/가] 꾹꾹 눌러 담겨 있다.',
    choices: [
      { text: '뚜껑을 활짝 열고 당당하게 먹는다', check: { stat: 'social', diff: 35 },
        success: { effects: { happy: 2, grit: 2, social: 2 }, log: '"그거 맛있어 보인다." 결국 반찬 교환 시장이 열렸다.' },
        fail: { effects: { happy: -3, social: -1 }, log: '"냄새나." 누가 코를 쥐었다. 반쯤 먹고 뚜껑을 닫았다.' } },
      { text: '구석에서 뚜껑으로 가리고 먹는다', effects: { happy: -2 }, log: '집에 와서 {mother}에게 "진짜 맛있었어"라고만 말했다.' },
      { text: '다음 소풍엔 캐릭터 도시락을 싸 달라고 조른다', effects: { money: -20, rel: { mother: -2 }, happy: 2 }, log: '{mother}[이/가] 밤새 김을 오려 고양이 얼굴을 만들었다. 눈이 짝짝이였다.' }
    ] });
  K({ id: 'cn_mid_autumn', age: [5, 12], countries: ['cn'],
    text: '중추절 밤 옥상. 월병 하나를 여섯 조각으로 나눈다. {mother}[이/가] 제일 큰 조각을 막내에게 밀어 준다.',
    choices: [
      { text: '큰 조각을 {mother}에게 돌려준다', effects: { rel: { mother: 6 }, happy: 1 }, log: '{mother}[은/는] 웃으며 그 조각을 다시 반으로 나눴다.' },
      { text: '달빛 아래 리프팅 묘기를 보여 준다', alt: { text: '달빛 아래 {hobbyAct} 솜씨를 뽐낸다', log: '박수가 쏟아졌다.',
          fail: { log: '긴장해서 실수만 연발했다. 그래도 다들 웃어 줬다.' } },
        check: { stat: 'football', diff: 30 },
        success: { effects: { football: 2, happy: 3, rel: { family: 2 } }, log: '스무 번 성공! 박수가 쏟아졌다.' },
        fail: { effects: { happy: -1 }, log: '공이 옆집 빨래로 날아갔다.' } },
      { text: '옥상 난간에 걸터앉아 달을 본다', risky: true, check: { stat: 'health', diff: 40 },
        success: { effects: { happy: 3 }, log: '달이 손에 닿을 것 같았다. 그날 소원을 아직 아무에게도 말하지 않았다.' },
        fail: { effects: { health: -8, rel: { mother: 4 } }, log: '발이 미끄러져 아래층 차양 위로 떨어졌다. 팔이 부러졌다.' } }
    ] });
  K({ id: 'cn_brick_goals', age: [6, 11], countries: ['cn'], cond: { fb: ['none', 'local'] }, flavour: 'football',
    text: '저녁 공터, 벽돌 두 개가 골대다. 아침엔 태극권 하던 할아버지들이 이제는 훈수를 둔다.',
    choices: [
      { text: '할아버지 말대로 왼발을 써 본다', effects: { football: 3, smarts: 1 }, log: '"그렇지! 양발을 써야 큰다!" 할아버지가 부채를 흔들었다.' },
      { text: '내 방식대로 드리블한다', check: { stat: 'football', diff: 35 },
        success: { effects: { football: 3, happy: 2 }, log: '다섯 명을 제쳤다. 공터가 들썩였다.' },
        fail: { effects: { football: 1, health: -2 }, log: '벽돌 골대를 걷어차 발가락이 퉁퉁 부었다.' } }
    ] });
  K({ id: 'us_malasada_day', age: [5, 12], countries: ['us'],
    text: '말라사다 데이! {mother}[이/가] 할머니에게 배운 대로 설탕 묻힌 도넛을 튀긴다. 기름 솥이 지글거린다.',
    choices: [
      { text: '반죽 굴리기를 돕는다', effects: { rel: { mother: 5 }, happy: 2 }, log: '얼굴이 설탕투성이가 되었다.' },
      { text: '접시에 담아 이웃집에 돌린다', effects: { social: 2, fx: ['newFriend'] }, log: '옆집 아이가 답례로 자전거를 빌려줬다.' },
      { text: '기름 솥 앞에서 직접 튀겨 보겠다고 한다', check: { stat: 'smarts', diff: 40 },
        success: { effects: { happy: 3, smarts: 1 }, log: '노릇하게 튀겼다. {mother}[이/가] "우리 집 후계자"라고 했다.' },
        fail: { effects: { health: -4 }, log: '반죽을 툭 떨어뜨리자 기름이 튀었다. 팔에 동그란 화상 자국이 남았다.' } }
    ] });
  K({ id: 'br_sao_joao', age: [5, 12], countries: ['br'],
    text: '6월 상주앙 축제. 마당 한가운데 모닥불이 타오르고 북소리가 동네를 채운다. {sis1}[이/가] 콰드릴랴 춤 짝꿍을 찾는다.',
    choices: [
      { text: '{sis1}[과/와] 춤을 춘다', effects: { happy: 3, looks: 1, rel: { sis1: 5 } }, log: '발을 세 번 밟았지만 {sis1}[은/는] 끝까지 웃었다.' },
      { text: '형들처럼 모닥불을 뛰어넘는다', risky: true, check: { stat: 'health', diff: 45 },
        success: { effects: { happy: 4, grit: 2 }, log: '불꽃 위를 날았다. 동네 어른들이 휘파람을 불었다.' },
        fail: { effects: { health: -6 }, log: '바짓단에 불이 붙었다. {sis1}[이/가] 물바가지를 끼얹었다. 종아리에 흉터가 남았다.' } },
      { text: '축제 마당 구석에서 공을 찬다', alt: { text: '축제 마당 구석에서 {hobbyAct}에 빠진다', log: '옥수수 노점 아저씨가 "저 꼬마 물건이다"라고 소리쳤다.' }, effects: { football: 2, rel: { sis1: -2 } }, log: '옥수수 노점 아저씨가 "저 꼬마 물건이다"라고 소리쳤다.' }
    ] });
  K({ id: 'br_pelada', age: [5, 11], countries: ['br'], cond: { fb: ['none', 'local'] }, flavour: 'football',
    text: '언덕 골목 펠라다. 슬리퍼 두 짝이 골대고, 해가 지면 경기 끝이다. 마지막 공이 {name}에게 왔다.',
    choices: [
      { text: '혼자 드리블로 끝낸다', check: { stat: 'football', diff: 35 },
        success: { effects: { football: 3, happy: 3, fame: 1 }, log: '셋을 제치고 넣었다. 골목 어른들이 박수를 쳤다.' },
        fail: { effects: { football: 1, social: -1 }, log: '공을 뺏겼다. 같은 편 친구가 "패스했으면 이겼잖아" 하고 토라졌다.' } },
      { text: '친구에게 패스한다', effects: { football: 2, rel: { friend: 3 } }, log: '친구의 골. 둘이 껴안고 흙바닥을 굴렀다.' }
    ] });
  K({ id: 'br_peneira', age: [11, 14], countries: ['br'], cond: { fb: ['local', 'regional'], stats: { football: [45, 100] }, flags: ['!moved_alone'] },
    text: '{bigClub}의 페네이라(공개 선수 선발)에 수백 명이 몰렸다. 주어진 시간은 단 15분이다. 버스비는 {mother}의 일당이다.',
    choices: [
      { text: '15분 안에 모든 걸 보여 준다', check: { stat: 'football', diff: 60 },
        success: { effects: { football: 3, fame: 2, happy: 4, rel: { coach: 3 } }, log: '스카우트가 수첩에 이름을 적었다. "연락하마."' },
        fail: { effects: { grit: 4, happy: -3 }, log: '번호가 불리지 않았다. 버스 창밖을 보며 다음을 다짐했다.' } },
      { text: '긴장 풀고 즐긴다', effects: { football: 1, happy: 3, social: 2 }, log: '결과와 상관없이 그날 다른 동네 친구 셋을 사귀었다.' }
    ] });
  K({ id: 'ar_potrero', age: [5, 11], countries: ['ar'], cond: { fb: ['none', 'local'] }, flavour: 'football',
    text: '옆 동네 아이들이 포트레로(흙 공터)로 도전장을 내밀었다. "지는 쪽이 공을 내놓기!" 남쪽 바람이 거세다.',
    choices: [
      { text: '바람을 타고 감아 찬다', check: { stat: 'football', diff: 35 },
        success: { effects: { football: 3, happy: 3, fame: 1 }, log: '공이 휘어 들어갔다. 옆 동네 아이들이 공을 내려놓고 갔다.' },
        fail: { effects: { football: 1, happy: -3 }, log: '공이 바람을 타고 지붕 위로 올라갔다. 우리 공만 하나 줄었다.' } },
      { text: '낮게 깔아 패스로 풀어 간다', effects: { football: 2, grit: 2, social: 1 }, log: '흙먼지 속에서 짧은 패스가 이어졌다. 비겼지만 다음 주 재경기를 약속했다.' }
    ] });
  K({ id: 'za_umngqusho', age: [5, 12], countries: ['za'], origin: ['middle', 'poor', 'slum'],
    text: '{mother}[이/가] 큰 냄비 가득 우뭉쿠쇼를 끓였다. 옆집 할머니가 아프다며 한 그릇을 덜어 놓는다. 할머니 약도 떨어졌다고 한다.',
    choices: [
      { text: '뜨거울 때 할머니 댁에 가져다드린다', effects: { happy: 3, rel: { mother: 5 } }, log: '"우리가 있어 네가 있다." 할머니가 이마에 입을 맞춰 줬다.' },
      { text: '내 용돈으로 약까지 사서 간다', check: { stat: 'smarts', diff: 35 },
        success: { effects: { money: -10, rep: 3, rel: { mother: 4 } }, log: '약사 아저씨에게 증상을 또박또박 설명했다. 할머니가 다음 날 마당에 나와 있었다.' },
        fail: { effects: { money: -10, happy: -2 }, log: '엉뚱한 약을 사 왔다. 할머니는 고맙다며 웃었지만 다시 다녀와야 했다.' } },
      { text: '가는 길에 친구들과 공부터 찬다', alt: { text: '가는 길에 친구들과 놀다 간다', log: '죽이 식어 버렸다. 할머니는 그래도 고맙다고 했다.' }, effects: { football: 2, rel: { mother: -2 } }, log: '죽이 식어 버렸다. 할머니는 그래도 고맙다고 했다.' }
    ] });
  K({ id: 'za_plastic_ball', age: [5, 11], countries: ['za'], cond: { fb: ['none', 'local'] }, flavour: 'football',
    text: '공이 찢어졌다. {bro}[이/가] 비닐봉지를 겹겹이 뭉치고 끈으로 묶어 새 공을 만들어 준다. 페트병 두 개가 골대다.',
    choices: [
      { text: '비닐 공으로 기술을 연습한다', check: { stat: 'football', diff: 30 },
        success: { effects: { football: 3, happy: 3 }, log: '제멋대로 튀는 공에 익숙해지자 진짜 공은 쉬웠다.' },
        fail: { effects: { football: 1, happy: -1 }, log: '공이 풀려 버렸다. 다 같이 다시 묶느라 해가 졌다.' } },
      { text: '{bro}[과/와] 1대1을 한다', effects: { football: 2, rel: { bro: 5 } }, log: '{bro}[은/는] 일부러 져 주는 척하다 진짜로 졌다.' }
    ] });
  K({ id: 'in_diwali_neighbors', age: [5, 12], countries: ['in'],
    text: '디왈리 밤, 옆집 친구네가 등잔과 과자를 들고 왔다. 골목에선 형들이 큰 폭죽에 불을 붙이고 있다.',
    choices: [
      { text: '{mother}[과/와] 답례 과자를 들고 간다', effects: { happy: 3, rel: { mother: 3 }, fx: ['newFriend'] }, log: '등불이 골목을 가득 채웠다. 친구 할머니가 이마에 축복을 해 줬다.' },
      { text: '형들 틈에서 큰 폭죽에 불을 붙인다', risky: true, check: { stat: 'health', diff: 45 },
        success: { effects: { happy: 4, mischief: 2 }, log: '하늘에 금빛 꽃이 터졌다. 형들이 "배짱 있네" 했다.' },
        fail: { effects: { health: -6, looks: -1 }, log: '불꽃이 손으로 튀었다. 손바닥에 물집이 잡히고 눈썹이 그을렸다.' } },
      { text: '친구랑 등불 사이에서 공을 찬다', alt: { text: '친구랑 등불 사이를 뛰어다닌다', log: '등잔 하나 안 건드리고 골목을 누볐다. 다들 놀랐다.' }, effects: { football: 2, happy: 2 }, log: '등잔 하나 안 건드리고 드리블했다. 다들 놀랐다.' }
    ] });
  K({ id: 'in_cricket_pressure', age: [8, 12], countries: ['in'], cond: { fb: ['none', 'local'] }, flavour: 'football',
    text: '친척 삼촌이 크리켓 배트를 선물하며 말한다. "축구로 밥 먹고 살겠냐? 이 나라는 크리켓이지!"',
    choices: [
      { text: '축구를 고집한다', effects: { football: 2, grit: 2, rel: { family: -2 } }, log: '{father}[이/가] 조용히 편을 들어 줬다. "우리 동네는 축구 동네야."' },
      { text: '두 운동을 다 해 본다', check: { stat: 'health', diff: 45 },
        success: { effects: { health: 2, happy: 2, football: 1 }, log: '크리켓으로 다진 눈썰미가 골키퍼 앞에서 도움이 됐다.' },
        fail: { effects: { health: -3, happy: -2 }, log: '주말마다 두 경기씩 뛰다 몸살이 났다. 둘 다 어정쩡해졌다.' } },
      { text: '크리켓으로 갈아탄다', effects: { happy: 2, flags: ['in_cricket'] }, log: '삼촌이 동네방네 자랑을 했다.' }
    ] });
  K({ id: 'pt_flower_festival', age: [5, 11], countries: ['pt'], cond: { rel: { father: 'alive' } },
    text: '{holiday2} 아침, 공원 정원사인 {father}[이/가] 꽃 수레를 끌고 나간다. "막내야, 같이 가자."',
    choices: [
      { text: '꽃 수레를 같이 민다', effects: { grit: 2, rel: { father: 6 } }, log: '{father}[이/가] 심은 꽃길을 따라 퍼레이드가 지나갔다. 괜히 어깨가 으쓱했다.' },
      { text: '광장에서 공을 찬다', effects: { football: 2, happy: 2, rel: { father: -1 } }, log: '꽃잎이 흩날리는 광장에서 관광객들이 박수를 쳤다.' },
      { text: '수레에서 꽃을 몇 송이 빼 관광객에게 판다', risky: true, check: { odds: 0.5 },
        success: { effects: { money: 10, mischief: 2, happy: 2 }, log: '동전 몇 개를 벌었다. {father}[은/는] 수레가 가벼워진 걸 모르는 척했다.' },
        fail: { effects: { rel: { father: -6 }, mischief: 2 }, log: '퍼레이드 관리인이 {father}[을/를] 불러 세웠다. {father}[이/가] 내 대신 꾸중을 들었다.' } }
    ] });
  K({ id: 'pt_stair_football', age: [5, 11], countries: ['pt'],
    text: '가파른 계단 골목에서 공을 놓치면 바다까지 굴러간다. 오늘도 공이 계단을 타고 내려간다.',
    choices: [
      { text: '끝까지 쫓아간다', check: { stat: 'health', diff: 40 },
        success: { effects: { health: 2, grit: 2 }, log: '바다에 빠지기 직전에 공을 잡았다. 다리가 터질 것 같지만 뿌듯하다.' },
        fail: { effects: { health: -2, happy: -1 }, log: '공은 결국 파도에 실려 갔다. 형들이 새 공을 구해 오기로 했다.' } },
      { text: '발바닥으로 멈추는 연습을 한다', effects: { football: 2, happy: -1 }, log: '계단에서 공을 세우는 기술이 늘었다. 볼 컨트롤이 남다르다는 말을 들었다.' }
    ] });
  K({ id: 'pt_banana_terrace', age: [7, 12], countries: ['pt'], origin: POOR,
    text: '방학 동안 이웃집 바나나 계단밭에서 일손을 구한다. 맨 위 절벽 쪽 밭은 품삯이 두 배다.',
    choices: [
      { text: '아래쪽 밭에서 일하고 번 돈을 {mother}에게 드린다', effects: { money: 30, grit: 3, rel: { mother: 6 } }, log: '{mother}[이/가] 돈을 받아 들고 한참 말이 없었다. 저녁 반찬이 하나 늘었다.' },
      { text: '절벽 쪽 밭을 맡는다', risky: true, check: { stat: 'health', diff: 50 },
        success: { effects: { money: 60, grit: 4 }, log: '두 배를 벌었다. 그 돈으로 {mother}의 겨울 외투를 샀다.' },
        fail: { effects: { health: -9, money: 10 }, log: '젖은 돌계단에서 미끄러져 발목이 꺾였다. 남은 방학을 깁스로 보냈다.' } },
      { text: '그 돈으로 새 축구공을 산다', effects: { money: 10, football: 2, happy: 3 }, log: '가게 진열장에서 몇 주 동안 쳐다만 보던 공을 드디어 샀다.' }
    ] });
  K({ id: 'pt_ferry_lisbon', flavour: 'football', age: [12, 15], countries: ['pt'], cond: { flags: ['moved_alone'] },
    text: '{bigcity}행 비행기. 창밖으로 마데이라가 손바닥만 해진다. 주머니에는 {mother}[이/가] 싸 준 {food}[이/가] 있다.',
    choices: [
      { text: '창에 이마를 대고 끝까지 본다', effects: { happy: -3, grit: 3, flags: ['homesick'] }, log: '섬이 구름 아래로 사라질 때까지 눈을 떼지 않았다.' },
      { text: '옆자리 아저씨에게 축구 이야기를 한다', effects: { social: 2, happy: 2 }, log: '내릴 때쯤 그 아저씨는 "네 경기 꼭 보러 가마"라고 했다.' },
      { text: '{mother}의 {food}[을/를] 꺼내 옆 사람과 나눈다', risky: true, check: { odds: 0.55 },
        success: { effects: { happy: 3, social: 2 }, log: '앞뒤 좌석 사람들까지 한 입씩 얻어 갔다. 섬 냄새가 기내에 퍼졌다.' },
        fail: { effects: { happy: -3 }, log: '승무원이 기내 음식 반입이라며 통째로 가져갔다. 빈 주머니만 만지작거렸다.' } }
    ] });
})(typeof globalThis !== 'undefined' ? globalThis : this);
