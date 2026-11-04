/* Round 8 events: childhood crises, hobbies, origin (slum / rich side of town), the 악동 street path
 * (일진 → 패거리 → 조직), dark-route risks, drinking incidents, sponsor / lobby / bribe arcs and the rapper route.
 * Extra event fields read by js/life.js: hobby (the hero must have that hobby), origin (list of origins),
 * and choice.route (enter that route by choice when the move is legal). docs/DESIGN.md §2g. */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};
  var EV = RA.data.events = RA.data.events || [];
  function H(ev) { if (ev.cooldown == null) ev.cooldown = 5; EV.push(ev); }
  var POOR = ['poor', 'slum'];

  // ================================================================ childhood crises (5-12): each choice risks something different
  H({ id: 'cri_eviction', age: [5, 12], origin: POOR, once: true, weight: 16,
    text: '집주인이 밀린 월세를 내라며 우리 짐을 골목에 내놓았다. {mother}[이/가] 이불 보따리 위에 주저앉았다.',
    choices: [
      { text: '돼지저금통을 깨서 {mother}에게 내민다', effects: { happy: -3, grit: 3, rel: { mother: 8 }, flags: ['hardship'] }, log: '동전은 한 줌이었다. {mother}[은/는] 그 동전을 쥐고 오래 울었다. 그날 이후 장난감을 사 달라는 말을 하지 않았다.' },
      { text: '이웃 할머니 집으로 뛰어가 도움을 청한다', check: { stat: 'social', diff: 35 },
        success: { effects: { social: 3, rel: { family: 4 }, flags: ['hardship'] }, log: '할머니가 쌀 한 포대와 방 한 칸을 내주셨다. 동네가 우리를 붙잡아 줬다.' },
        fail: { effects: { happy: -5, flags: ['hardship', 'lost_home'] }, log: '문은 열리지 않았다. 그해 겨울은 친척 집 창고에서 났다.' } },
      { text: '놀이터로 가서 숨어 있는다', effects: { happy: -6, rel: { siblings: 5 }, flags: ['lost_home', 'trauma'] }, log: '해가 질 때까지 그네에 앉아 있었다. 새로 옮긴 좁은 방에서 한동안 악몽을 꿨다.' }
    ] });
  H({ id: 'cri_sibling_sick', age: [6, 12], once: true, weight: 12, cond: { rel: { sis2: 'alive' } },
    text: '{sis2}[이/가] 큰 병으로 입원했다. 병원비 이야기가 나올 때마다 어른들 목소리가 낮아진다.',
    choices: [
      { text: '학교 끝나면 병원에서 곁을 지킨다', effects: { rel: { sis2: 12 }, social: 2, smarts: -2, happy: -2 }, log: '병실 보조 침대가 숙제 책상이 됐다. 성적은 떨어졌지만 {sis2}[은/는] 그 시절을 평생 고마워했다.' },
      { text: '신문 배달을 해서 병원비를 보탠다', risky: true, check: { stat: 'health', diff: 45 },
        success: { effects: { grit: 4, money: 150, rel: { family: 5 }, flags: ['hardship'] }, log: '새벽 다섯 시의 골목을 외웠다. 첫 봉투를 {mother}에게 드렸다.' },
        fail: { effects: { health: -8, grit: 2, flags: ['hardship'] }, log: '빙판에서 넘어져 팔에 금이 갔다. 배달은 석 달 만에 끝났다.' } },
      { text: '아무 일 없는 척 친구들과 논다', effects: { happy: 2, rel: { sis2: -6, mother: -3 } }, log: '집에 오면 불이 꺼져 있었다. 그 불 꺼진 집이 오래 마음에 걸렸다.' }
    ] });
  H({ id: 'cri_bully', age: [7, 12], once: true, weight: 14, cond: { edu: ['elem', 'middle'] },
    text: '같은 반 덩치 큰 아이가 매일 급식 반찬과 용돈을 뺏어 간다. 오늘은 신발주머니까지 던졌다.',
    choices: [
      { text: '맞선다', risky: true, check: { stat: 'health', diff: 55 },
        success: { effects: { grit: 3, rep: 3, mischief: 3 }, log: '코피가 났지만 그 애가 먼저 물러섰다. 다음 날부터 아무도 건드리지 않았다.' },
        fail: { effects: { health: -7, happy: -6, flags: ['bullied'] }, log: '운동장 바닥에 쓰러졌다. 그 뒤로 더 심해졌다. 학교 가는 길이 길어졌다.' } },
      { text: '선생님께 말한다', check: { stat: 'social', diff: 45 },
        success: { effects: { rep: 3, happy: 3 }, log: '선생님이 자리를 바꾸고 부모님 상담을 잡았다. 괴롭힘이 멈췄다.' },
        fail: { effects: { happy: -6, social: -3, flags: ['bullied'] }, log: '"고자질쟁이"라는 별명이 붙었다. 쉬는 시간마다 혼자였다.' } },
      { text: '참고 뺏긴다', effects: { happy: -5, social: -2, flags: ['bullied', 'trauma'] }, log: '아무에게도 말하지 않았다. 사람들 앞에서 목소리가 작아지는 버릇이 생겼다.' },
      { text: '태권도장에서 배운 대로 막아 낸다', reqFn: function (s) { return (s.hobbies || []).indexOf('martial') >= 0; }, effects: { grit: 2, rep: 4, happy: 3 }, log: '팔목을 잡아 비틀자 그 애가 놀라 물러섰다. 관장님 말이 맞았다. "피하는 게 먼저, 막는 건 그다음."' }
    ] });
  H({ id: 'cri_crosswalk', age: [6, 11], once: true, weight: 10,
    text: '학교 앞 횡단보도에서 신호를 무시한 차가 {name}[을/를] 치고 지나갔다. 무릎이 이상하게 꺾였다.',
    choices: [
      { text: '괜찮다며 집까지 절뚝이며 걷는다', check: { stat: 'health', diff: 55 },
        success: { effects: { grit: 2, health: -3 }, log: '멍만 들었다. 며칠 절뚝이다 나았다.' },
        fail: { effects: { health: -6, flags: ['bad_knee'] }, log: '치료 시기를 놓쳤다. 비 오는 날마다 무릎이 쑤셨다. 오래 달리는 일은 이제 힘들다.' } },
      { text: '목격한 어른들에게 차 번호를 외워 달라고 한다', effects: { smarts: 2, health: -3, money: 200 }, log: '운전자를 찾아 치료비를 받았다. 경찰 아저씨가 "똑똑하구나" 했다.' },
      { text: '울면서 {mother}에게 전화한다', effects: { health: -2, rel: { mother: 5 }, money: -100 }, log: '{mother}[이/가] 일하다 말고 달려왔다. 병원에서 깁스를 했다. 석 달이 길었다.' }
    ] });
  H({ id: 'cri_parents_fight', age: [6, 12], once: true, weight: 12, cond: { rel: { father: 'alive', mother: 'alive' } },
    text: '밤마다 부모님 다투는 소리가 벽 너머로 들린다. 오늘은 그릇 깨지는 소리까지 났다.',
    choices: [
      { text: '방문을 잠그고 귀를 막는다', effects: { happy: -4, flags: ['trauma'] }, log: '이불 속에서 숫자를 셌다. 그 버릇은 어른이 돼서도 남았다.' },
      { text: '둘 사이에 들어가 그만하라고 외친다', check: { stat: 'social', diff: 45 },
        success: { effects: { rel: { father: 4, mother: 4 }, grit: 2 }, log: '두 사람이 동시에 입을 다물었다. 다음 날 아침, 식탁에 셋이 같이 앉았다.' },
        fail: { effects: { happy: -6, rel: { father: -6 } }, log: '"애는 빠져!" 고함이 돌아왔다. 그날 밤은 길었다.' } },
      { text: '형제들과 몰래 집을 나와 놀이터에서 버틴다', risky: true, check: { odds: 0.7 },
        success: { effects: { mischief: 3, rel: { siblings: 6 }, happy: -1 }, log: '{bro}[이/가] 사 준 컵라면을 나눠 먹었다. 밤 열한 시에 들어갔다가 크게 혼났다.' },
        fail: { effects: { mischief: 3, health: -3, happy: -4, rel: { siblings: 3 } }, log: '밤 놀이터에서 동네 형들에게 컵라면 값을 빼앗겼다. {bro}의 팔에 멍이 들었다.' } }
    ] });
  H({ id: 'cri_dare', age: [8, 12], once: true, weight: 12,
    text: '동네 형들이 공사장 철골 위를 건너면 무리에 끼워 주겠다고 한다. 바닥까지는 3층 높이다.',
    choices: [
      { text: '건넌다', risky: true, check: { stat: 'health', diff: 60 },
        success: { effects: { social: 3, mischief: 4, happy: 4 }, log: '다리가 후들거렸지만 끝까지 갔다. 형들이 머리를 쓰다듬었다.' },
        fail: { effects: { health: -18, mischief: 2, flags: ['bad_knee'] }, log: '발이 미끄러졌다. 모래 더미 위로 떨어져 다리뼈가 부러졌다. 넉 달을 깁스로 지냈다.' } },
      { text: '"무서워서 안 해" 하고 집에 간다', effects: { social: -2, health: 1 }, log: '겁쟁이라고 놀림받았다. 그 형 중 한 명이 다음 주에 떨어졌다는 소식을 들었다.' },
      { text: '공사장 아저씨에게 알린다', effects: { rep: 3, social: -3 }, log: '공사장 입구에 자물쇠가 생겼다. 형들은 범인이 누군지 금방 알아냈다.' }
    ] });
  H({ id: 'cri_lost_festival', age: [5, 9], once: true, weight: 10,
    text: '시내 축제에서 가족을 놓쳤다. 사람은 많고 해는 지고 있다.',
    choices: [
      { text: '제복 입은 경찰관을 찾아간다', effects: { smarts: 1, happy: -1 }, log: '경찰관이 방송을 해 줬다. 십 분 뒤 {mother}[이/가] 달려왔다.' },
      { text: '데려다주겠다는 낯선 어른을 따라간다', risky: true, check: { odds: 0.75 },
        success: { effects: { happy: 1 }, log: '친절한 아주머니였다. 집 앞까지 데려다주고 사라졌다.' },
        fail: { effects: { happy: -10, flags: ['trauma'] }, log: '어른은 골목 깊숙이 데려갔다. 비명에 상인들이 뛰어나왔고 어른은 도망쳤다. 그 뒤로 혼자 다니는 게 무서웠다.' } },
      { text: '버스 번호를 떠올려 혼자 집에 간다', check: { stat: 'smarts', diff: 30 },
        success: { effects: { grit: 3, smarts: 2 }, log: '버스 기사님께 동네 이름을 말했다. 혼자 집에 도착했다. 다들 놀랐다.' },
        fail: { effects: { happy: -5, grit: 1 }, log: '반대 방향 버스였다. 종점 파출소에서 밤 열 시에 찾았다.' } }
    ] });
  H({ id: 'cri_hunger', age: [5, 10], origin: POOR, cooldown: 4, maxTimes: 2, weight: 12, cond: { edu: ['elem', 'middle'] },
    text: '쌀독이 비었다. 오늘 저녁은 없다고 {mother}[이/가] 미안한 얼굴로 말했다.',
    choices: [
      { text: '학교 급식 빵을 몰래 싸 온다', risky: true, check: { odds: 0.7 },
        success: { effects: { rel: { family: 5 }, mischief: 2 }, log: '주머니 속 빵 두 개를 식탁에 올렸다. 다 같이 나눠 먹었다.' },
        fail: { effects: { happy: -5, rep: -3 }, log: '선생님께 들켰다. 반 아이들 앞에서 주머니를 뒤집혔다. 얼굴이 화끈거렸다.' } },
      { text: '구멍가게 할머니 일을 돕고 라면을 얻는다', effects: { grit: 3, social: 2, flags: ['hardship'] }, log: '상자를 나르고 라면 두 봉지를 받았다. 일해서 먹는 밥이 이렇게 맛있는 줄 몰랐다.' },
      { text: '물 한 잔 마시고 일찍 잔다', effects: { health: -3, happy: -3, flags: ['hardship'] }, log: '배가 고파 잠이 오지 않았다. 그 밤을 오래 기억했다.' }
    ] });
  H({ id: 'cri_errand_bag', age: [8, 12], origin: ['slum'], once: true, weight: 14,
    text: '골목 패거리 형들이 가방 하나를 옆 동네까지 갖다주면 용돈을 준다고 한다. 가방은 열어 보지 말라고 했다.',
    choices: [
      { text: '한다', risky: true, check: { odds: 0.75 },
        success: { effects: { money: 120, mischief: 6, flags: ['street_errands'] }, log: '지폐 몇 장이 손에 쥐어졌다. 형들이 "다음에도 부를게" 했다.' },
        fail: { effects: { mischief: 6, rep: -6, happy: -8, rel: { mother: -8 } }, log: '순찰차가 멈춰 섰다. 경찰서에서 {mother}[이/가] 머리를 숙였다. 가방에 뭐가 있었는지는 끝내 몰랐다.' } },
      { text: '싫다고 버틴다', check: { stat: 'grit', diff: 40 },
        success: { effects: { grit: 3, rep: 2 }, log: '형들은 혀를 차고 돌아섰다. 다른 애를 찾아갔다.' },
        fail: { effects: { health: -5, happy: -4 }, log: '뒤통수를 한 대 맞았다. 그 골목으로는 돌아서 다녔다.' } },
      { text: '{mother}에게 털어놓는다', effects: { rel: { mother: 6 }, happy: -1, flags: ['hardship'] }, log: '{mother}[은/는] 그날부터 학교 앞까지 마중을 나왔다. 일을 하나 줄이면서까지.' }
    ] });
  H({ id: 'cri_flood', age: [5, 12], once: true, weight: 9, origin: ['middle', 'poor', 'slum'], countries: ['kr', 'jp', 'cn', 'br', 'in', 'za'],
    text: '밤새 내린 폭우에 하천이 넘쳤다. 방바닥으로 흙탕물이 차오른다.',
    choices: [
      { text: '가족 사진첩부터 챙긴다', effects: { rel: { family: 4 }, happy: -3, money: -200, flags: ['lost_home'] }, log: '살림은 다 젖었지만 사진첩은 살렸다. 그 사진들이 지금도 거실에 걸려 있다.' },
      { text: '위험하다고 소리치며 높은 데로 피한다', effects: { grit: 3, rel: { siblings: 6 }, money: -400, flags: ['lost_home'] }, log: '교회 2층 대피소에서 밤을 새웠다. 집은 한 달 동안 말려야 했다.' },
      { text: '물에 들어가 옆집 할머니를 돕는다', risky: true, check: { stat: 'health', diff: 55 },
        success: { effects: { rep: 6, fame: 1, grit: 3 }, log: '할머니를 업고 나왔다. 동네 신문에 사진이 실렸다.' },
        fail: { effects: { health: -12, flags: ['trauma'] }, log: '급류에 휩쓸려 전봇대를 붙잡았다. 구조대가 왔을 땐 손이 하얗게 질려 있었다. 그 뒤로 물이 무섭다.' } }
    ] });
  H({ id: 'cri_mother_job', age: [6, 12], once: true, weight: 10, origin: ['poor', 'slum', 'middle'], cond: { rel: { mother: 'alive' }, edu: ['elem', 'middle', 'high'] },
    text: '{mother}[이/가] 일하던 곳이 문을 닫았다. 저녁마다 {mother}[이/가] 구인 광고 신문을 펼친다.',
    choices: [
      { text: '방과 후 집안일을 맡아 {mother}[이/가] 일을 구하게 돕는다', check: { stat: 'grit', diff: 40 },
          success: { effects: { grit: 3, rel: { mother: 6, siblings: 3 }, smarts: -1, flags: ['hardship'] }, log: '숙제할 시간을 쪼개 청소와 설거지를 했다. 석 달 뒤 {mother}[이/가] 새 일을 구했다.' },
          fail: { effects: { grit: 1, smarts: -2, rel: { mother: 2 }, flags: ['hardship'] }, log: '무리하다 열이 났다. {mother}[은/는] 면접을 포기하고 약국으로 뛰었다.' } },
      { text: '학원을 끊겠다고 먼저 말한다', effects: { smarts: -3, rel: { mother: 8 }, happy: -2 }, log: '{mother}[은/는] 대답 대신 등을 쓸어 줬다. 그 뒤로 혼자 공부하는 법을 익혔다.' },
      { text: '친구들 앞에서 아무렇지 않은 척한다', effects: { social: 1, happy: -3 }, log: '새 운동화 이야기에 웃으며 맞장구쳤다. 집에 와서는 말이 없었다.' }
    ] });
  H({ id: 'cri_rich_schedule', age: [7, 12], origin: ['rich'], once: true, weight: 14, cond: { rel: { father: 'alive', mother: 'alive' } },
    text: '부모님이 다음 달부터 학원 일곱 개를 잡아 놓았다. 주말에는 과외 선생님이 온다.',
    choices: [
      { text: '시키는 대로 다 다닌다', effects: { smarts: 6, happy: -7, flags: ['trauma'] }, log: '성적표는 반짝였다. 웃는 날은 줄었다. 밤에 혼자 우는 날이 생겼다.' },
      { text: '{hobby} 수업 하나만 남기겠다고 버틴다', check: { stat: 'social', diff: 50 },
        success: { effects: { happy: 4, rel: { family: 3 } }, log: '부모님이 처음으로 내 말을 끝까지 들었다. {hobby} 수업이 일주일의 낙이 됐다.' },
        fail: { effects: { happy: -5, rel: { father: -5, mother: -5 } }, log: '"다 너 잘되라고 하는 거야." 대화는 거기서 끝났다.' } },
      { text: '학원 가는 척하고 몰래 땡땡이친다', risky: true, check: { odds: 0.55 },
        success: { effects: { happy: 6, mischief: 4 }, log: 'PC방과 공원을 오갔다. 석 달 동안 아무도 몰랐다.' },
        fail: { effects: { mischief: 4, rel: { father: -8, mother: -8 }, happy: -4 }, log: '학원에서 집으로 전화가 왔다. 휴대폰을 빼앗기고 기사님이 학원 앞까지 데려다주게 됐다.' } }
    ] });
  H({ id: 'cri_rich_follow', age: [8, 12], origin: ['rich'], once: true, weight: 8, cond: { edu: ['elem', 'middle'], rel: { father: 'alive', mother: 'alive' } },
    text: '하굣길, 낯선 승합차가 천천히 따라온다. 창문이 조금 열려 있다.',
    choices: [
      { text: '가까운 편의점으로 뛰어 들어간다', effects: { smarts: 2, happy: -3 }, log: '점원이 경찰을 불렀다. 그 뒤로 부모님은 경호원을 붙였다. 자유롭게 걷던 하굣길이 끝났다.' },
      { text: '모른 척 평소대로 걷는다', risky: true, check: { odds: 0.7 },
        success: { effects: { happy: -1 }, log: '차는 다음 골목에서 사라졌다. 그냥 길을 찾던 차였을까.' },
        fail: { effects: { happy: -12, health: -4, flags: ['trauma'] }, log: '누군가 팔을 잡아끌었다. 지나가던 학생들이 소리를 질러 겨우 빠져나왔다. 오랫동안 혼자 밖에 나가지 못했다.' } },
      { text: '차 번호를 외우고 부모님께 전화한다', effects: { smarts: 3, rel: { family: 3 } }, log: '번호판 덕에 경찰이 차 주인을 찾아냈다. 아빠가 처음으로 "잘했다"고 했다.' }
    ] });
  H({ id: 'cri_school_fee', age: [7, 12], origin: POOR, once: true, weight: 12, countries: ['in', 'za', 'br', 'ar', 'cn'], cond: { edu: ['elem', 'middle'] },
    text: '수업료가 밀려 담임이 교실 밖에 서 있으라고 했다. 복도 창문 너머로 수업이 계속된다.',
    choices: [
      { text: '장학금 신청서를 혼자 써서 낸다', check: { stat: 'smarts', diff: 40 },
        success: { effects: { smarts: 3, happy: 4, flags: ['scholarship'] }, log: '교장 선생님 이름으로 장학 통지가 왔다. 졸업까지 수업료 걱정이 사라졌다.' },
        fail: { effects: { happy: -4, grit: 2 }, log: '서류는 돌아왔다. 대신 다음 학기를 기약했다.' } },
      { text: '시장에서 짐을 날라 수업료를 번다', effects: { grit: 4, smarts: -2, money: 100, flags: ['hardship'] }, log: '새벽 시장에서 짐을 나르고 학교에 갔다. 수업 시간마다 졸았다.' },
      { text: '당분간 수업보다 집안일을 챙긴다', effects: { smarts: -5, rel: { family: 5 }, flags: ['left_school_early', 'hardship'] }, log: '밀린 수업 내용을 따라가기 어려워졌다. 친구들 공책을 빌려 빈칸을 채웠다.' }
    ] });
  H({ id: 'cri_hobby_injury', age: [8, 12], once: true, weight: 10, when: function (s) { return (s.hobbies || []).some(function (h) { return ['basketball', 'baseball', 'martial', 'dance', 'football'].indexOf(h) >= 0; }); },
    text: '운동을 하다 착지를 잘못했다. 발목이 퉁퉁 부어올랐다. 다음 주에 대회가 있다.',
    choices: [
      { text: '대회를 포기하고 푹 쉰다', effects: { health: 2, happy: -3 }, log: '대회는 관중석에서 봤다. 발목은 깨끗이 나았다.' },
      { text: '붕대를 감고 대회에 나간다', risky: true, check: { stat: 'health', diff: 55 },
        success: { effects: { grit: 4, fame: 1, happy: 4 }, log: '절뚝이면서도 끝까지 해냈다. 메달이 목에 걸렸다.' },
        fail: { effects: { health: -8, flags: ['bad_knee'] }, log: '같은 곳을 또 다쳤다. 의사가 "이제 조심해야 한다"고 했다. 그 다리는 끝내 예전 같지 않았다.' } },
      { text: '아픈 김에 다른 놀이에 빠져 본다', effects: { smarts: 2, happy: 1 }, log: '깁스한 다리로 책과 퍼즐에 빠졌다. 새로운 재미를 알았다.' }
    ] });
  H({ id: 'cri_pet_loss', age: [6, 12], once: true, weight: 8, cond: { flags: ['has_pet'] },
    text: '아침에 문을 열었더니 반려동물이 사라졌다. 대문이 조금 열려 있었다.',
    choices: [
      { text: '전단을 만들어 동네에 붙인다', check: { odds: 0.6 },
        success: { effects: { happy: 6, social: 2 }, log: '사흘 만에 옆 동네에서 전화가 왔다. 꼭 껴안고 울었다.' },
        fail: { effects: { happy: -8, unflags: ['has_pet'] }, log: '전단은 비에 젖어 갔다. 끝내 돌아오지 않았다.' } },
      { text: '문을 연 {bro}[을/를] 탓한다', effects: { happy: -4, rel: { bro: -8 } }, log: '{bro}[은/는] 아무 말도 하지 않았다. 그 일로 둘 사이가 오래 서먹했다.' }
    ] });
  H({ id: 'cri_fire', age: [5, 12], origin: POOR, once: true, weight: 8,
    text: '옆집에서 난 불이 우리 집 지붕으로 옮겨 붙었다. 연기가 방 안으로 밀려 들어온다.',
    choices: [
      { text: '젖은 수건으로 입을 막고 기어서 나간다', effects: { smarts: 2, health: -3, money: -300, flags: ['lost_home'] }, log: '소방관 아저씨가 "잘했다"고 했다. 집은 반이 탔다. 한동안 교회 강당에서 지냈다.' },
      { text: '아끼는 물건을 가지러 다시 들어간다', risky: true, check: { stat: 'health', diff: 60 },
        success: { effects: { happy: 2, health: -5, flags: ['lost_home'] }, log: '{hobby} 물건을 안고 나왔다. 어른들에게 크게 혼났다.' },
        fail: { effects: { health: -20, looks: -4, flags: ['lost_home', 'scar', 'trauma'] }, log: '연기에 쓰러졌다. 팔에 화상 흉터가 남았다. 지금도 타는 냄새에 몸이 굳는다.' } }
    ] });

  // ================================================================ hobbies: changes and moments
  H({ id: 'hob_jam', age: [9, 60], hobby: 'band', cooldown: 6, weight: 10, cond: { edu: ['elem', 'middle', 'high', 'univ'] },
    text: '친구가 합주실을 한 시간 빌렸다며 부른다. 시험 기간인데.',
    choices: [
      { text: '간다', check: { odds: 0.55 },
          success: { effects: { happy: 4, smarts: -1 }, log: '드럼 소리에 머리가 맑아졌다. 처음으로 우리끼리 한 곡을 끝까지 맞췄다.' },
          fail: { effects: { smarts: -3, happy: -2, rel: { mother: -3 } }, log: '합주는 신났지만 다음 날 시험지를 반이나 비웠다. 시험지를 보고 한숨이 났다. 다음 시험까지 기타를 잠시 넣어 두기로 했다.' } },
      { text: '시험부터 끝낸다', effects: { smarts: 2, happy: -1 }, log: '시험이 끝난 날 밤새 기타를 쳤다.' }
    ] });
  H({ id: 'hob_streetball', age: [9, 45], hobby: 'basketball', cooldown: 6, weight: 10,
    text: '공원 코트에서 덩치 큰 어른들이 3대3 한 판 끼라고 한다.',
    choices: [
      { text: '낀다', check: { stat: 'health', diff: 45 },
        success: { effects: { happy: 5, social: 2 }, log: '레이업 두 개를 넣었다. 같이 뛴 사람들이 "다음에 또 와" 했다.' },
        fail: { effects: { health: -3, happy: -2 }, log: '몸싸움에 밀려 넘어졌다. 무릎에 피가 났다.' } },
      { text: '구경만 하며 동작을 익힌다', effects: { smarts: 1 }, log: '돌파하는 스텝을 머릿속으로 그려 봤다.' }
    ] });
  H({ id: 'hob_catch', age: [7, 60], hobby: 'baseball', cooldown: 6, weight: 10,
    text: '저녁 공터, 캐치볼 상대가 필요하다는 이웃이 글러브를 하나 더 들고 있다.',
    choices: [
      { text: '같이 던진다', effects: { happy: 4, social: 2 }, log: '글러브 소리가 해 질 때까지 울렸다.' },
      { text: '변화구를 가르쳐 달라고 조른다', check: { stat: 'grit', diff: 40 },
        success: { effects: { happy: 3, grit: 2 }, log: '처음으로 커브가 꺾였다!' },
        fail: { effects: { happy: -1 }, log: '공이 엉뚱한 데로 날아가 창문을 맞힐 뻔했다.' } }
    ] });
  H({ id: 'hob_belt', age: [7, 30], hobby: 'martial', cooldown: 4, maxTimes: 3, weight: 10,
    text: '도장 승급 심사 날. 송판 격파가 남았다.',
    choices: [
      { text: '돌려차기로 깬다', check: { stat: 'grit', diff: 45 },
        success: { effects: { happy: 5, grit: 2 }, log: '송판이 두 쪽 났다. 띠 색이 바뀌었다.' },
        fail: { effects: { happy: -3, health: -2 }, log: '발등만 얼얼했다. 다음 심사를 기약했다.' } },
      { text: '안전하게 주먹 격파로 바꾼다', effects: { happy: 2 }, log: '무난하게 통과했다. 관장님이 "다음엔 발로" 했다.' }
    ] });
  H({ id: 'hob_karaoke', age: [8, 80], hobby: 'sing', cooldown: 6, weight: 10,
    text: '동네 노래자랑 예선 공고가 붙었다. 상품은 쌀 한 가마. 참가비는 노래방 두 시간 값이다.',
    choices: [
      { text: '참가비를 내고 무대에 선다', check: { stat: 'grit', diff: 40 },
        success: { effects: { money: -20, happy: 6, fame: 2, social: 2 }, log: '고음에서 박수가 터졌다. 인기상과 쌀 한 가마를 수레에 싣고 왔다.' },
        fail: { effects: { money: -20, happy: -4, social: -1 }, log: '첫 소절에서 음이 갈라졌다. 구경하던 이웃이 그 장면을 흉내 내며 한 달을 우려먹었다.' } },
      { text: '음이 높은 곡을 낮춰 달라고 사회자에게 부탁한다', check: { stat: 'social', diff: 35 },
        success: { effects: { happy: 4, social: 1 }, log: '사회자가 반주 키를 두 칸 내려 줬다. 편하게 불러 장려상을 받았다.' },
        fail: { effects: { happy: -2 }, log: '"규정상 안 돼요." 결국 예선 대기표만 손에 쥔 채 돌아왔다.' } },
      { text: '친구를 등 떠밀어 내보내고 응원석에 앉는다', effects: { social: 2, happy: 1 }, log: '친구가 상을 탔다. 쌀은 반씩 나눠 들고 골목을 걸었다.' }
    ] });
  H({ id: 'hob_dance_battle', age: [10, 40], hobby: 'dance', cooldown: 6, weight: 10,
    text: '광장에서 즉석 댄스 배틀이 벌어졌다. 바닥은 비에 젖어 미끄럽고, 누군가 손가락으로 나를 가리킨다.',
    choices: [
      { text: '젖은 바닥에서 회전 기술을 건다', risky: true, check: { stat: 'health', diff: 45 },
        success: { effects: { happy: 6, fame: 2 }, log: '마지막 프리즈에서 함성이 터졌다. 누가 찍은 영상이 동네 단톡방을 돌았다.' },
        fail: { effects: { health: -5, happy: -2 }, log: '착지하다 손목을 짚었다. 깁스를 한 채 한 달 동안 연습 영상만 돌려 봤다.' } },
      { text: '안전한 스텝만 밟으며 박자로 승부한다', check: { stat: 'looks', diff: 40 },
        success: { effects: { happy: 4, social: 2 }, log: '화려하진 않았지만 박자가 딱 맞았다. 상대 크루가 연습실 주소를 알려 줬다.' },
        fail: { effects: { happy: -2, social: -1 }, log: '심심하다는 야유가 나왔다. 상대는 공중제비 한 번으로 끝냈다.' } },
      { text: '손을 저으며 사양한다', effects: { happy: -1 }, log: '집에 와서 거울 앞에서 몰래 그 춤을 따라 췄다.' }
    ] });
  H({ id: 'hob_cypher', age: [11, 40], hobby: 'rap', cooldown: 5, weight: 12,
    text: '공원 정자 밑에서 사이퍼(돌아가며 즉흥 랩을 하는 모임)가 열렸다. 비트가 흐르고, 다음 차례가 나다.',
    choices: [
      { text: '마이크를 잡는다', check: { stat: 'social', diff: 40 },
        success: { effects: { happy: 6, fame: 1 }, log: '즉흥 라임이 꽂혔다. 크루 형이 연락처를 물었다.' },
        fail: { effects: { happy: -3 }, log: '가사가 막혔다. 다들 박자를 맞춰 기다려 줬다. 창피했지만 다음엔 안 막힐 거다.' } },
      { text: '앞 사람을 디스하는 가사로 받아친다', risky: true, check: { odds: 0.45 },
        success: { effects: { fame: 2, social: 1, mischief: 1 }, log: '정자 밑이 뒤집어졌다. 디스당한 형도 웃으며 주먹을 맞댔다.' },
        fail: { effects: { health: -3, rep: -2 }, log: '형의 얼굴이 굳었다. 사이퍼가 끝나고 정자 뒤로 불려 가 멱살을 잡혔다.' } },
      { text: '듣기만 하고 라임을 받아 적는다', effects: { smarts: 1 }, log: '노트 한 장이 남의 라임으로 찼다. 밤새 내 걸로 바꿨다.' }
    ] });
  H({ id: 'hob_sketch_contest', age: [7, 70], hobby: 'draw', cooldown: 6, weight: 10,
    text: '구청 사생 대회가 열린다. 주제는 "우리 동네". 비싼 수채 물감을 쓰는 아이들이 많다.',
    choices: [
      { text: '크레파스로 골목 풍경을 그린다', check: { stat: 'smarts', diff: 35 },
        success: { effects: { happy: 5, fame: 1 }, log: '입선! 심사위원이 "색이 대담하다"고 적었다. 구청 로비에 그림이 걸렸다.' },
        fail: { effects: { happy: -2 }, log: '수상자 명단에 이름이 없었다. 그림은 둘둘 말아 방 벽에 붙였다.' } },
      { text: '옆자리 아이의 물감을 빌려 쓴다', risky: true, check: { odds: 0.5 },
        success: { effects: { happy: 4, social: 2 }, log: '물감을 빌려준 아이와 같이 장려상을 받았다. 다음 대회에서도 나란히 앉기로 했다.' },
        fail: { effects: { happy: -3, money: -30, rel: { mother: -2 } }, log: '물통을 엎어 그 아이 그림을 망쳤다. 사과하고 물감값을 물어 줬다.' } },
      { text: '대회 대신 혼자 그린다', effects: { happy: 2 }, log: '아무도 채점하지 않는 그림이 제일 자유로웠다.' }
    ] });
  H({ id: 'hob_game_tourney', age: [10, 45], hobby: 'game', cooldown: 6, weight: 10,
    text: 'PC방 게임 대회 포스터가 붙었다. 결선은 밤 열한 시에 시작한다.',
    choices: [
      { text: '친구들과 팀을 짜 밤샘 결선까지 간다', check: { stat: 'smarts', diff: 45 },
        success: { effects: { happy: 5, social: 2, health: -1 }, log: '4강! 상대 팀 감독이 명함을 줬다. 해가 뜰 때 집에 들어갔다.' },
        fail: { effects: { happy: -2, health: -2, rel: { mother: -3 } }, log: '첫판에 떨어졌다. 새벽 두 시에 PC방으로 데리러 온 {mother}의 얼굴을 볼 수 없었다.' } },
      { text: '친구 계정으로 대리 출전해 준다', risky: true, check: { odds: 0.5 },
        success: { effects: { money: 40, mischief: 2 }, log: '친구 이름으로 8강에 갔다. 상금 일부가 내 몫으로 들어왔다.' },
        fail: { effects: { mischief: 2, rep: -3, happy: -3 }, log: '운영진이 접속 기록을 확인했다. 둘 다 대회에서 영구 제명됐다.' } },
      { text: '그 시간에 공부한다', effects: { smarts: 2, happy: -2 }, log: '대회 중계를 틀어 놓고 문제집을 풀었다.' }
    ] });
  H({ id: 'hob_family_dinner', age: [9, 80], hobby: 'cook', cooldown: 6, weight: 10, when: function (s) { return RA.Engine.peopleByRel(s, 'family').length > 0; },
    text: '생일상을 직접 차려 보겠다고 큰소리를 쳤다. 이번 메뉴는 처음 만들어 본다.',
    choices: [
      { text: '튀김까지 처음부터 만든다', risky: true, check: { stat: 'grit', diff: 45 },
        success: { effects: { happy: 5, rel: { family: 6 } }, log: '다들 두 그릇씩 비웠다. 부엌이 내 자리가 됐다.' },
        fail: { effects: { health: -4, happy: -2 }, log: '기름이 튀어 팔뚝에 물집이 잡혔다. 생일상은 결국 라면이 됐다.' } },
      { text: '{food}[을/를] 오래된 요리책에 나온 대로 만든다', check: { stat: 'smarts', diff: 35 },
        success: { effects: { happy: 3, rel: { family: 4 } }, log: '"정겨운 맛이네." 그 말 한마디에 어깨가 으쓱했다.' },
        fail: { effects: { happy: -2, rel: { family: 1 } }, log: '간을 세 번 했는데 짰다. 다들 물을 들이켜며 먹었다.' } },
      { text: '배달 음식을 시키고 플레이팅만 한다', effects: { happy: 2, money: -50 }, log: '접시는 예뻤다. 다들 알면서 모른 척했다.' }
    ] });
  H({ id: 'hob_book_club', age: [9, 90], hobby: 'read', cooldown: 6, weight: 10,
    text: '도서관 독서 모임에서 이번 달 발제를 맡아 달라고 한다. 책은 어른용 두꺼운 소설이다.',
    choices: [
      { text: '맡아서 끝까지 읽고 발표한다', check: { stat: 'smarts', diff: 45 },
        success: { effects: { smarts: 3, social: 2 }, log: '토론이 두 시간 넘게 이어졌다. 사서 선생님이 다음 달 책도 골라 달라고 했다.' },
        fail: { effects: { happy: -2, smarts: 1 }, log: '절반밖에 못 읽은 게 질문 하나에 들통났다. 얼굴이 화끈거렸다.' } },
      { text: '인터넷 줄거리 요약만 보고 발표한다', risky: true, check: { odds: 0.4 },
        success: { effects: { social: 2, mischief: 1 }, log: '아무도 눈치채지 못했다. 박수를 받으면서도 등이 서늘했다.' },
        fail: { effects: { rep: -3, happy: -3 }, log: '요약이 틀린 결말을 말했다. 모임 어른들이 서로 눈짓을 주고받았다.' } },
      { text: '듣는 쪽에 앉는다', effects: { smarts: 1, happy: 1 }, log: '남이 읽은 책 이야기가 더 재밌었다.' }
    ] });
  H({ id: 'hob_school_play', age: [8, 18], hobby: 'act', cooldown: 4, weight: 10, cond: { edu: ['elem', 'middle', 'high'] },
    text: '학예회 연극 배역을 정한다. 주인공과 웃기는 조연이 남았다. 공연 날은 시험 전날이다.',
    choices: [
      { text: '주인공에 손을 든다', check: { stat: 'looks', diff: 40 },
        success: { effects: { happy: 5, fame: 1, smarts: -1 }, log: '마지막 대사에서 강당이 조용해졌다. 다음 날 시험은 엉망이었다.' },
        fail: { effects: { happy: -3 }, log: '다른 아이가 뽑혔다. 연습 내내 그 아이 대사를 속으로 따라 했다.' } },
      { text: '대본에 없는 애드리브를 넣는다', risky: true, check: { stat: 'social', diff: 45 },
        success: { effects: { happy: 4, social: 3 }, log: '등장할 때마다 웃음이 터졌다. 주인공보다 박수가 길었다.' },
        fail: { effects: { rel: { friend: -4 }, happy: -2 }, log: '애드리브가 상대 배우 대사를 끊었다. 막이 내리자 친구가 울면서 나갔다.' } },
      { text: '무대 뒤 조명을 맡는다', effects: { smarts: 1, grit: 1 }, log: '어두운 곳에서 스위치를 쥐고 공연 전체를 지켜봤다.' }
    ] });

  // ================================================================ origin: the neighbourhood speaks
  H({ id: 'org_slum_police', age: [13, 30], origin: ['slum'], cooldown: 5, maxTimes: 2, weight: 10,
    text: '골목 입구에서 경찰이 이유도 없이 불러 세우더니 가방을 뒤진다. 친구들이 멀찍이서 본다.',
    choices: [
      { text: '말없이 응한다', effects: { happy: -3 }, log: '가방 속 소지품을 확인하고 경찰은 돌아갔다. 손이 떨렸다.' },
      { text: '"무슨 근거로요?" 따진다', risky: true, check: { stat: 'social', diff: 55 },
        success: { effects: { rep: 3, grit: 2 }, log: '경찰이 머쓱해하며 돌아섰다. 친구들이 박수를 쳤다.' },
        fail: { effects: { happy: -6, rep: -3, mischief: 2 }, log: '파출소에서 하룻밤을 보냈다. 기록이 남지는 않았지만 마음엔 남았다.' } },
      { text: '휴대폰으로 몰래 찍는다', check: { odds: 0.6 },
        success: { effects: { fame: 2, rep: 2 }, log: '영상이 퍼졌다. 동네 사람들이 처음으로 같이 목소리를 냈다.' },
        fail: { effects: { happy: -4 }, log: '휴대폰을 빼앗겼다. 사진은 지워져 있었다.' } }
    ] });
  H({ id: 'org_study_room', age: [11, 17], origin: POOR, once: true, weight: 12, cond: { stats: { smarts: [45, 100] } },
    text: '동네 공부방 선생님이 장학 재단 시험을 권한다. 붙으면 대학까지 학비가 나온다.',
    choices: [
      { text: '장학 시험 원서를 쓴다', check: { stat: 'smarts', diff: 55 },
        success: { effects: { smarts: 3, happy: 5, flags: ['scholarship'] }, log: '합격 통지서를 {mother}[이/가] 액자에 넣었다. 동네를 벗어날 길이 보였다.' },
        fail: { effects: { happy: -3, grit: 2 }, log: '떨어졌다. 선생님이 "내년에 또 보자"며 문제집을 쥐여 줬다.' } },
      { text: '그 시간에 돈을 번다', effects: { money: 200, grit: 2, smarts: -1 }, log: '시장 짐꾼 일을 시작했다. 공부방엔 발길을 끊었다.' }
    ] });
  H({ id: 'org_rich_plan', age: [14, 18], origin: ['rich'], once: true, weight: 12, cond: { rel: { father: 'alive', mother: 'alive' } },
    text: '부모님이 정해 둔 진로가 있다. 유학, 명문대, 그리고 가업. 식탁에서 계획표를 내민다.',
    choices: [
      { text: '계획대로 간다', effects: { smarts: 4, happy: -3, money: 2000 }, log: '과외 선생님이 셋 더 붙었다. 미래가 정해졌다는 건 편하면서 답답했다.' },
      { text: '{hobby}의 길을 가겠다고 말한다', check: { stat: 'grit', diff: 50 },
        success: { effects: { happy: 5, rel: { family: -2 } }, log: '긴 침묵 끝에 아버지가 "한번 해 봐라. 대신 끝까지"라고 했다.' },
        fail: { effects: { happy: -6, rel: { family: -8 } }, log: '용돈과 카드가 끊겼다. 처음으로 돈 없는 하루를 살았다.' } }
    ] });
  H({ id: 'org_rich_seed', age: [19, 24], origin: ['rich'], once: true, weight: 14, cond: { rel: { father: 'alive', mother: 'alive' } },
    text: '부모님이 독립 자금이라며 통장 하나를 건넸다. 0이 생각보다 많다.',
    choices: [
      { text: '손대지 않고 묻어 둔다', effects: { money: 30000, smarts: 1 }, log: '통장은 서랍 깊숙이 들어갔다. 든든한 비상구가 생겼다.' },
      { text: '친구들과 한 해를 신나게 쓴다', risky: true, effects: { money: 8000, happy: 8, social: 3, alcohol: 6 }, log: '파티와 여행으로 한 해가 갔다. 받은 돈은 많이 줄었고 사진은 잔뜩 남았다.' },
      { text: '돌려드리고 내 힘으로 해 본다', effects: { grit: 6, happy: -2, rel: { family: -2 }, flags: ['refused_family_money'] }, log: '아버지는 통장을 한참 보다가 "고집은 누굴 닮았는지" 하며 웃었다. 생활비는 내가 마련하기로 했다.' }
    ] });
  H({ id: 'org_hood_return', age: [30, 70], origin: POOR, once: true, weight: 8,
    text: '어릴 적 살던 {hood}에 오랜만에 가 봤다. 골목 몇 개는 사라졌고, 몇 개는 그대로다.',
    choices: [
      { text: '동네 아이들을 위해 장학금을 내놓는다', reqFn: function (s) { return s.money > 5000 * RA.data.countries[s.country].wage; }, effects: { money: -3000, rep: 8, happy: 6, flags: ['gave_back'] }, log: '공부방 벽에 내 이름이 붙은 작은 명판이 생겼다.' },
      { text: '옛 친구네 가게에 들른다', effects: { happy: 4, social: 2 }, log: '친구는 그대로였다. 국수 한 그릇 값을 끝내 받지 않았다.' },
      { text: '차에서 내리지 않고 돌아선다', effects: { happy: -2 }, log: '창밖으로 옛 골목을 봤다. 아직 마주할 준비가 안 됐다.' }
    ] });

  // ================================================================ the 악동 street path: pranks → 일진 → 패거리 → 조직
  H({ id: 'drk_iljin_invite', age: [11, 16], once: true, weight: 16, cond: { edu: ['elem', 'middle', 'high'], traits: { mischief: [15, 100] }, flags: ['!iljin', '!left_gang'] },
    text: '학교에서 제일 잘나가는 무리, 일진들이 "같이 다니자"고 한다. 거절하면 표적이 될 수도 있다.',
    choices: [
      { text: '끼어든다', risky: true, check: { odds: 0.65 },
        success: { effects: { mischief: 6, social: 2, rep: -4, happy: 3, flags: ['iljin'] }, log: '복도를 걸으면 아이들이 길을 비켰다. 처음엔 그게 좋았다.' },
        fail: { effects: { mischief: 6, rep: -8, happy: -4, flags: ['iljin'] }, log: '첫 주에 패싸움에 끌려갔다가 학교폭력위원회 명단에 이름이 올랐다.' } },
      { text: '거절한다', check: { stat: 'grit', diff: 45 },
        success: { effects: { grit: 2, rep: 2 }, log: '"재미없는 놈." 그 말 한마디로 끝났다.' },
        fail: { effects: { health: -4, happy: -5, flags: ['bullied'] }, log: '화장실에서 둘러싸였다. 그 학기는 조용히 지나가기만 바랐다.' } },
      { text: '선생님께 알린다', effects: { rep: 3, social: -3, happy: -2 }, log: '무리 몇 명이 정학을 받았다. 대신 "배신자" 소리를 졸업 때까지 들었다.' }
    ] });
  H({ id: 'drk_iljin_shakedown', age: [11, 17], cooldown: 3, weight: 14, cond: { edu: ['elem', 'middle', 'high'], flags: ['iljin', '!left_gang', '!went_straight'] },
    text: '일진 선배들이 후배들한테서 "회비"를 걷어 오라고 시킨다.',
    choices: [
      { text: '시키는 대로 걷는다', risky: true, check: { odds: 0.7 },
        success: { effects: { money: 80, mischief: 5, rep: -5 }, log: '후배들 눈이 무서웠다. 선배들은 내 몫을 챙겨 줬다.' },
        fail: { effects: { mischief: 5, rep: -8, fx: ['suspend'] }, log: '한 후배의 부모가 학교에 왔다. 정학 통지서가 집으로 날아갔다.' } },
      { text: '못 하겠다고 버틴다', effects: { health: -5, happy: -3, rep: 2 }, log: '선배들에게 몇 대 맞았다. 그래도 후배들 돈엔 손대지 않았다.' },
      { text: '무리에서 빠진다', effects: { happy: -2, social: -2, unflags: ['iljin'], flags: ['left_gang'] }, log: '혼자 걷는 복도가 넓었다. 몇 달은 외로웠지만 숨은 편해졌다.' }
    ] });
  H({ id: 'drk_iljin_brawl', age: [12, 17], cooldown: 4, weight: 12, cond: { edu: ['middle', 'high'], flags: ['iljin', '!left_gang', '!went_straight'] },
    text: '옆 학교 일진들과 방과 후 공터에서 패싸움 약속이 잡혔다.',
    choices: [
      { text: '공터로 간다', risky: true, check: { stat: 'health', diff: 55 },
        success: { effects: { mischief: 4, fame: 1, rep: -3 }, log: '이겼다. 동네에 이름이 돌았다. 좋은 이름은 아니었다.' },
        fail: { effects: { health: -12, mischief: 3, fx: ['suspend'] }, log: '응급실에서 눈을 떴다. 경찰이 학교에 연락했다.' } },
      { text: '핑계를 대고 빠진다', effects: { social: -2 }, log: '다음 날 무리의 눈빛이 달라졌다.' },
      { text: '경찰에 몰래 신고한다', effects: { rep: 2, happy: -3, unflags: ['iljin'], flags: ['left_gang'] }, log: '순찰차가 먼저 와 있었다. 아무도 다치지 않았다. 나는 조용히 무리를 떠났다.' }
    ] });
  // the 일진 kids, and in a rough neighbourhood any kid who already gets into trouble
  H({ id: 'drk_street_crew', age: [14, 19], once: true, weight: 14, cond: { flags: ['!left_gang', '!went_straight'] },
    when: function (s) { return !!s.flags.iljin || (POOR.indexOf(s.origin) >= 0 && (s.traits.mischief || 0) >= 12); },
    text: '동네 형들 패거리가 "학교는 시시하지 않냐"며 밤거리로 부른다. 오토바이와 술이 있다.',
    choices: [
      { text: '따라간다', risky: true, effects: { mischief: 6, alcohol: 5, happy: 3, smarts: -2, flags: ['street_crew'] }, log: '밤의 골목이 내 교실이 됐다. 집에는 새벽에 들어갔다.' },
      { text: '따라가지 않고 돌아선다', effects: { smarts: 2, happy: -2, unflags: ['iljin'], flags: ['left_gang'] }, log: '형들의 오토바이 소리가 멀어졌다. 그 소리를 오래 기억했다.' }
    ] });
  H({ id: 'drk_crew_offer', age: [15, 26], once: true, weight: 16, cond: { flags: ['street_crew', '!left_gang', '!went_straight'] },
    text: '패거리 형님이 진짜 "식구"가 될 기회라고 한다. 조직 막내, 야바위판, 털이 패거리 중 하나가 자리를 비웠다.',
    choices: [
      { text: '조직 막내로 들어간다', risky: true, route: 'gang', effects: { mischief: 5 }, log: '형님들 앞에서 고개를 숙였다. 그날 받은 봉투가 무거웠다.' },
      { text: '야바위판 바람잡이를 한다', risky: true, route: 'con', effects: { mischief: 4 }, log: '"자, 공은 어디에?" 옆에서 맞장구치는 법부터 배웠다.' },
      { text: '털이 패거리에 붙는다', risky: true, route: 'thief', effects: { mischief: 4 }, log: '첫날은 망만 봤다. 손이 하얗게 질려 있었다.' },
      { text: '손을 턴다', effects: { happy: -2, grit: 3, unflags: ['street_crew', 'iljin'], flags: ['left_gang', 'left_crew'] }, log: '형님은 한참 보더니 담배를 끄고 "그래, 너는 가라"고 했다.' }
    ] });
  H({ id: 'drk_way_out', age: [13, 21], once: true, weight: 14, when: function (s) { return !s.flags.went_straight && !s.flags.left_gang && !!(s.flags.iljin || s.flags.street_crew); },
    text: '{hobby}[을/를] 하는 모습을 본 어른이 손을 내밀었다. "그 힘, 다른 데 써 볼래?"',
    choices: [
      { text: '손을 잡는다', effects: { mischief: -10, happy: 4, grit: 3, rep: 4, fx: ['wayOut'] }, log: '그날 이후 밤거리 대신 좋아하는 일에 시간을 썼다. 형들의 연락은 받지 않았다.' },
      { text: '웃어넘긴다', effects: { mischief: 2 }, log: '"아저씨가 뭘 알아요." 돌아서는 등 뒤로 한숨 소리가 들렸다.' }
    ] });
  // an adult with no work of their own and a reason the street knows them: a 악동 past, a record, a prison contact
  H({ id: 'drk_dark_offer_adult', age: [19, 50], cooldown: 6, weight: 10, routes: ['adrift'],
    when: function (s) {
      var t = s.traits || {};
      return s.route && s.route.at >= 1 && s.money < 2000 * RA.data.countries[s.country].wage &&
        ((t.mischief || 0) >= 25 || (t.record || 0) > 0 || !!s.flags.dark_contact || !!s.flags.street_crew);
    },
    text: '빈털터리로 지낸 지 오래다. 옛 동네 형이 "쉽게 버는 일"이 있다며 연락해 왔다.',
    choices: [
      { text: '조직 일을 받는다', risky: true, route: 'gang', effects: { mischief: 4 }, log: '형이 차 문을 열어 줬다. 다시는 예전으로 못 돌아갈 것 같았다.' },
      { text: '사기판에 들어간다', risky: true, route: 'con', effects: { mischief: 4 }, log: '첫 판은 생각보다 쉬웠다. 그게 더 무서웠다.' },
      { text: '거절하고 일자리를 더 찾는다', effects: { grit: 2, happy: -1 }, log: '전화를 끊고 구인 공고를 다시 넘겼다.' }
    ] });

  H({ id: 'drk_cellmate', age: [16, 60], once: true, weight: 14, routes: ['prison'], jailOk: true,
    text: '같은 방 수감자가 출소하면 연락하라며 전화번호를 적어 준다. "밖에 나가면 일자리 하나 없을 거다. 우리 쪽은 전과 안 따져."',
    choices: [
      { text: '번호를 받아 둔다', risky: true, effects: { mischief: 3, flags: ['dark_contact'] }, log: '쪽지를 신발 깔창 밑에 숨겼다.' },
      { text: '교도소 직업 훈련을 신청한다', effects: { grit: 2, smarts: 1, flags: ['prison_training'] }, log: '용접 실습실의 불꽃을 보며 출소 날을 셌다.' },
      { text: '종이를 찢어 버린다', effects: { happy: -1, grit: 1 }, log: '"그래, 네 맘대로 해라." 그는 돌아누웠다.' }
    ] });

  // ================================================================ dark-route risks (queued by js/life.js from the stage's heat)
  var DARK = ['gang', 'con', 'thief'];
  H({ id: 'drk_raid', manual: true, routes: DARK, age: [13, 90], cooldown: 0,
    text: '새벽, 문을 두드리는 소리. "경찰입니다! 문 여세요!"',
    choices: [
      { text: '뒷문으로 도망친다', risky: true, check: { stat: 'health', diff: 55 },
        success: { effects: { happy: -3, fx: ['rtSetback'] }, log: '지붕을 타고 빠져나갔다. 한동안 거처를 옮겨 다녔다.' },
        fail: { effects: { fx: ['jail'] }, log: '담을 넘다 붙잡혔다. 수갑이 차가웠다.' } },
      { text: '순순히 잡혀간다', effects: { rep: 2, fx: ['jail'] }, log: '조사실에서 아는 걸 다 말하지는 않았다. 판사는 자수에 가까운 태도를 참작했다.' },
      { text: '아는 경찰에게 돈을 찔러 준다', risky: true, check: { odds: 0.55 },
        success: { effects: { money: -3000, fx: ['rtSkill'] }, log: '압수 목록에서 내 이름이 빠졌다. 그 경찰과는 이제 한 배를 탔다.' },
        fail: { effects: { money: -3000, fx: ['jail'] }, log: '그 경찰은 이미 감찰을 받는 중이었다. 뇌물죄까지 붙었다.' } },
      { text: '돈다발을 챙겨 해외로 뜬다', reqFn: function (s) { return s.money >= 3000 * RA.data.countries[s.country].wage; }, effects: { money: -3000, fx: ['flee'] }, log: '새벽 배를 탔다. 가족에게 인사도 못 했다.' }
    ] });
  H({ id: 'drk_rival', manual: true, routes: DARK, age: [13, 90], cooldown: 0,
    text: '같은 바닥의 경쟁자들이 내 몫을 노린다. 오늘 밤 골목 끝에서 그들과 마주쳤다.',
    choices: [
      { text: '정면으로 붙는다', risky: true, check: { stat: 'health', diff: 55 },
        success: { effects: { fame: 2, fx: ['rtBig'] }, log: '그 골목은 이제 내 것이다. 소문이 빨랐다.' },
        fail: { effects: { fx: ['streetClash'] }, log: '칼날이 번뜩였다.' } },
      { text: '협상 테이블을 차린다', check: { stat: 'social', diff: 50 },
        success: { effects: { money: 1500, fx: ['rtSkill'] }, log: '구역을 나눴다. 당분간은 조용할 것이다.' },
        fail: { effects: { money: -2000, happy: -3 }, log: '협상은 깨졌다. 돈까지 뜯기고 돌아왔다.' } },
      { text: '이 바닥을 떠나겠다고 한다', effects: { happy: 2, fx: ['goStraight'] }, log: '아무도 붙잡지 않았다. 대신 다시는 이 동네에 오지 말라고 했다.' }
    ] });
  H({ id: 'drk_betrayal', manual: true, routes: DARK, age: [13, 90], cooldown: 0,
    text: '가장 믿던 동료가 경찰에 내 이름을 불었다는 소문이 돈다.',
    choices: [
      { text: '먼저 잠적한다', effects: { money: -1500, happy: -4, fx: ['rtSetback'] }, log: '휴대폰을 버리고 지방 여인숙에 숨었다. 석 달 동안 아무도 믿지 않았다.' },
      { text: '그 동료를 찾아가 따진다', risky: true, check: { stat: 'social', diff: 55 },
        success: { effects: { rep: 3, fx: ['rtSkill'] }, log: '헛소문이었다. 오히려 둘 사이가 단단해졌다.' },
        fail: { effects: { fx: ['jail'] }, log: '그 자리에 형사들이 기다리고 있었다.' } },
      { text: '자수하고 형량을 줄인다', effects: { rep: 4, fx: ['jail'] }, log: '변호사가 "현명한 선택"이라고 했다. 감옥 문은 그래도 무거웠다.' }
    ] });
  H({ id: 'drk_boss_seat', age: [25, 70], routes: DARK, stages: ['lieutenant', 'planner', 'pro'], cooldown: 6, weight: 12,
    text: '위에 있던 사람이 쓰러졌다. 빈자리를 두고 모두가 눈치를 본다.',
    choices: [
      { text: '빈자리를 차지한다', risky: true, check: { stat: 'grit', diff: 60 },
        success: { effects: { fame: 3, money: 5000, fx: ['rtBig'] }, log: '내 말에 귀를 기울이는 사람이 늘었다. 빈자리에 한 걸음 가까워졌다.' },
        fail: { effects: { health: -10, fx: ['rtSetback'] }, log: '반대파의 습격을 받았다. 병원 침대에서 다른 사람의 이름을 들었다.' } },
      { text: '한 발 물러나 2인자로 남는다', effects: { money: 1500, happy: 1 }, log: '총알받이 자리는 사양했다. 대신 오래 살 것이다.' },
      { text: '이 틈에 손을 씻는다', effects: { happy: 3, fx: ['goStraight'] }, log: '아무도 나를 찾지 않았다. 모두 그 자리만 보고 있었다.' }
    ] });
  H({ id: 'drk_family_plea', age: [18, 70], routes: DARK, cooldown: 6, weight: 12, cond: { rel: { mother: 'alive' } },
    text: '{mother}[이/가] 내 방 서랍에서 현금 다발과 대포폰을 찾았다. 아무 말 없이 식탁에 올려 두었다.',
    choices: [
      { text: '무릎 꿇고 그만두겠다고 한다', effects: { rel: { mother: 10 }, happy: 2, fx: ['goStraight'] }, log: '{mother}[은/는] 내 손을 오래 잡고 있었다.' },
      { text: '"엄마를 위해서 이러는 거야"라고 한다', effects: { rel: { mother: -12 }, happy: -4 }, log: '{mother}[은/는] 그 돈에 손대지 않았다. 다음 날 짐을 싸서 {sis1}의 집으로 갔다.' }
    ] });

  // ================================================================ drinking: social now, trouble later (incidents queued by js/life.js)
  H({ id: 'drk_drunk_fight', manual: true, age: [14, 90], cooldown: 0,
    text: '술자리 끝에 옆 테이블과 시비가 붙었다. 상대가 먼저 멱살을 잡았다.',
    choices: [
      { text: '주먹을 날린다', risky: true, check: { stat: 'health', diff: 55 },
        success: { effects: { mischief: 3, rep: -3 }, log: '상대가 먼저 쓰러졌다. 주변 사람들이 손가락질했다.', },
        fail: { effects: { health: -10, money: -1500, rep: -5, record: 1 }, log: '경찰서에서 깼다. 폭행 전과가 생겼다.' } },
      { text: '사과하고 자리를 뜬다', effects: { happy: -2, rep: 1 }, log: '자존심은 상했지만 다음 날 아침이 멀쩡했다.' },
      { text: '친구에게 말려 달라고 한다', check: { stat: 'social', diff: 40 },
        success: { effects: { rel: { friend: 4 } }, log: '{friend}[이/가] 끌고 나왔다. 택시 안에서 한참 웃었다.' },
        fail: { effects: { money: -800, happy: -3 }, log: '친구까지 휘말렸다. 둘이 나란히 진술서를 썼다.' } }
    ] });
  H({ id: 'drk_drunk_drive', manual: true, age: [18, 90], cooldown: 0, cond: { flags: ['car_owner'] },
    text: '술을 꽤 마셨다. 대리 기사는 한 시간째 안 잡힌다. 차 키가 주머니에 있다.',
    choices: [
      { text: '조금만 가면 된다, 직접 몬다', risky: true, check: { odds: 0.72 },
        success: { effects: { happy: -1, alcohol: 2 }, log: '집 앞에 차를 세우고 핸들에 이마를 댔다. 손이 떨렸다. 운이 좋았을 뿐이다.' },
        fail: { effects: { fx: ['drunkCrash'] }, log: '신호등이 두 개로 보였다.' } },
      { text: '택시를 타고 차는 두고 간다', effects: { money: -60 }, log: '다음 날 아침 차를 찾으러 갔다. 머리는 아팠지만 마음은 편했다.' },
      { text: '차 안에서 잠든다', effects: { health: -2 }, log: '새벽 추위에 깼다. 목이 뻐근했다.' }
    ] });
  H({ id: 'drk_drunk_tongue', manual: true, age: [14, 90], cooldown: 0,
    text: '취해서 하지 말아야 할 말을 해 버렸다. 다음 날 아침, 단체 대화방이 조용하다.',
    choices: [
      { text: '한 명 한 명 찾아가 사과한다', effects: { social: 2, rep: 1, happy: -2 }, log: '몇 명은 웃어넘겼고, 한 명은 끝내 연락을 끊었다.' },
      { text: '기억이 안 난다고 버틴다', effects: { rep: -5, social: -2 }, log: '그 말이 거짓말이라는 건 모두 알았다.' },
      { text: '아예 대화방을 나간다', effects: { social: -4, happy: -2, fx: ['loseFriend'] }, log: '조용해진 휴대폰이 편하면서도 쓸쓸했다.' }
    ] });
  H({ id: 'drk_blackout', manual: true, age: [16, 90], cooldown: 0,
    text: '눈을 떠 보니 모르는 동네 버스 정류장이었다. 어젯밤 기억이 통째로 없다.',
    choices: [
      { text: '병원에서 간 검사를 받는다', effects: { money: -200, health: 2, alcohol: -4 }, log: '의사가 수치를 보여 주며 고개를 저었다. 처음으로 겁이 났다.' },
      { text: '오늘부터 술을 끊는다', check: { stat: 'grit', diff: 55 },
        success: { effects: { alcohol: -15, happy: 2 }, log: '석 달 동안 한 잔도 마시지 않았다. 아침이 밝았다.' },
        fail: { effects: { alcohol: 3, happy: -3 }, log: '사흘 만에 다시 잔을 들었다.' } },
      { text: '해장국 한 그릇으로 넘긴다', effects: { alcohol: 3, health: -2 }, log: '다들 그렇게 산다고 생각했다.' }
    ] });
  H({ id: 'drk_lost_stuff', manual: true, age: [14, 90], cooldown: 0,
    text: '술자리에서 지갑과 휴대폰을 통째로 잃어버렸다.',
    choices: [
      { text: '어젯밤 간 가게들을 다시 돈다', check: { odds: 0.5 },
        success: { effects: { happy: 3 }, log: '세 번째 가게 카운터에 지갑이 있었다. 사장님이 "또 오세요" 했다.' },
        fail: { effects: { money: -500, happy: -4 }, log: '어디에도 없었다. 카드 정지 전화만 열 통을 했다.' } },
      { text: '깔끔히 포기하고 새로 산다', effects: { money: -800 }, log: '새 휴대폰엔 사진이 하나도 없었다.' }
    ] });
  H({ id: 'drk_pocha', age: [19, 85], cooldown: 5, weight: 9, cond: { traits: { alcohol: [20, 100] } },
    text: '단골 술집 사장님이 이름을 기억한다. 오늘도 같은 자리에 같은 사람들이 앉아 있다.',
    choices: [
      { text: '합석해 밤새 이야기한다', risky: true, effects: { social: 3, happy: 3, alcohol: 4, money: -60 }, log: '처음 보는 사람과 형님 동생 사이가 됐다. 이름은 다음 날 기억나지 않았다.' },
      { text: '한 잔만 하고 일어선다', effects: { social: 1, alcohol: 1 }, log: '사장님이 "웬일이야" 했다.' }
    ] });
  H({ id: 'drk_recovery', age: [18, 90], cooldown: 3, weight: 14, cond: { traits: { alcohol: [45, 100] } },
    text: '아침마다 손이 떨린다. 거울 속 얼굴이 낯설다. 술병을 쥔 손을 한참 내려다봤다.',
    choices: [
      { text: '금주 모임과 치료를 시작한다', effects: { fx: ['rehab'], happy: 1 }, log: '모임에서 처음으로 "제 이름은… 저는 알코올 중독입니다"라고 말했다.' },
      { text: '혼자 끊어 본다', check: { stat: 'grit', diff: 60 },
        success: { effects: { alcohol: -20, happy: 2, health: 2 }, log: '첫 한 달이 지옥이었다. 그다음 달은 조금 덜했다.' },
        fail: { effects: { alcohol: 4, happy: -4 }, log: '열흘 만에 무너졌다. 술병을 숨기는 버릇이 생겼다.' } },
      { text: '아직은 괜찮다', risky: true, effects: { alcohol: 3, social: 1 }, log: '"다들 이 정도는 마셔." 그 말을 몇 번째 하는지 모른다.' }
    ] });

  // ================================================================ sponsor / lobby / bribe arcs (accept → money or a step up now, exposure later)
  var ENT = ['actor', 'idol', 'singer', 'model', 'comedian', 'rapper', 'band'];
  H({ id: 'spn_ent_patron', age: [19, 55], routes: ENT, cooldown: 6, weight: 12,
    text: '업계 관계자가 "도움 줄 분"을 소개하겠다며 비공개 술자리에 부른다. 그분 말 한마디면 일거리 하나쯤은 쉽게 꽂힌다고 한다. 대신 따로 만나는 자리가 이어질 거라고 한다.',
    choices: [
      { text: '스폰서를 받아들인다', risky: true, effects: { money: 6000, alcohol: 3, happy: -4, fx: ['spnTake', 'rtBig'] }, log: '명품 가방과 카드, 그리고 다음 작품 계약서가 같은 주에 왔다. 밤마다 전화가 울렸다.' },
      { text: '정중히 거절한다', effects: { rep: 2, happy: 1, fx: ['rtSetback'] }, log: '소개자의 표정이 굳었다. 약속했던 다음 일거리에서 내 이름이 빠졌다.' },
      { text: '녹음해 두고 폭로한다', risky: true, check: { stat: 'social', diff: 55 },
        success: { effects: { fame: 4, fx: ['whistle'] }, log: '기사가 터졌다. 같은 일을 겪은 동료들이 하나둘 목소리를 냈다.' },
        fail: { effects: { happy: -6, fx: ['rtSetback', 'rtSetback'] }, log: '상대는 "허위 사실"이라며 소송을 걸었다. 일을 제안하는 연락이 하나씩 끊겼다.' } }
    ] });
  H({ id: 'spn_law_bribe', age: [27, 72], routes: ['law'], cooldown: 7, weight: 12, cond: { career: ['judge', 'prosecutor'] },
    text: '재벌가 사건을 맡았다. 상대 측 사람이 골프장에서 두툼한 봉투와 함께 "앞으로 잘 부탁드린다"고 한다.',
    choices: [
      { text: '봉투를 받는다', risky: true, effects: { money: 15000, fx: ['spnTake', 'rtBig'] }, log: '그 사건은 조용히 끝났다. 다음 인사에서 좋은 자리가 났다.' },
      { text: '돌려보낸다', effects: { rep: 4, fx: ['rtSetback'] }, log: '그 뒤로 이상하게 승진 명단에서 밀렸다.' },
      { text: '봉투째 감찰에 신고한다', risky: true, check: { stat: 'smarts', diff: 55 },
        success: { effects: { fame: 3, fx: ['whistle'] }, log: '뇌물 공여로 상대 측 인사가 구속됐다. "강골"이라는 별명이 붙었다.' },
        fail: { effects: { happy: -6, fx: ['rtSetback'] }, log: '증거가 부족하다며 사건은 덮였다. 나만 조직에서 고립됐다.' } }
    ] });
  H({ id: 'spn_pol_lobby', age: [25, 85], routes: ['politics', 'public'], cooldown: 7, weight: 12, cond: { career: ['politician', 'city_mayor_aide'] },
    text: '건설사 회장이 규정 하나만 손봐 주면 다음 선거 자금과 퇴임 뒤 자리를 책임지겠다고 한다.',
    choices: [
      { text: '손잡는다', risky: true, effects: { money: 20000, fx: ['spnTake', 'rtBig'] }, log: '규정이 바뀌었다. 회장의 아파트 단지가 올라갔다. 정치권에 내 편도 늘었다.' },
      { text: '거절한다', effects: { rep: 4, fx: ['rtSetback'] }, log: '다음 선거에서 상대 후보 쪽 현수막이 두 배로 늘었다.' },
      { text: '대화 내용을 기자에게 넘긴다', risky: true, check: { stat: 'social', diff: 55 },
        success: { effects: { fame: 4, fx: ['whistle'] }, log: '로비 의혹이 1면에 실렸다. 청렴한 이름이 생겼다.' },
        fail: { effects: { happy: -6, rep: -4, fx: ['rtSetback'] }, log: '기사는 "정쟁"으로 묻혔다. 당내에서 찍혔다.' } }
    ] });
  H({ id: 'spn_police_bribe', age: [22, 62], routes: ['safety'], cooldown: 6, weight: 12, cond: { career: ['police', 'detective', 'coast_guard'] },
    text: '단속 중인 불법 업소 사장이 "눈 한 번만 감아 주면 매달 챙겨 드린다"고 한다.',
    choices: [
      { text: '받는다', risky: true, effects: { money: 4000, fx: ['spnTake'] }, log: '매달 같은 날 봉투가 왔다. 단속 정보도 흘려 줬다.' },
      { text: '그대로 단속한다', effects: { rep: 4, fx: ['rtSkill'] }, log: '업소는 문을 닫았다. 사장은 "두고 보자"고 했다.' },
      { text: '상납 고리를 통째로 감찰에 넘긴다', risky: true, check: { stat: 'grit', diff: 55 },
        success: { effects: { fame: 3, fx: ['whistle'] }, log: '선배 세 명이 옷을 벗었다. 동료들은 나와 점심을 먹지 않았다.' },
        fail: { effects: { happy: -6, fx: ['rtSetback'] }, log: '감찰은 흐지부지됐다. 나는 외딴 파출소로 발령 났다.' } }
    ] });
  H({ id: 'spn_med_kickback', age: [26, 75], routes: ['medical'], cooldown: 7, weight: 12, cond: { career: ['doctor', 'surgeon', 'dentist'] },
    text: '제약 회사 영업 담당이 처방을 바꿔 주면 매달 "강연료"를 주겠다고 한다.',
    choices: [
      { text: '받는다', risky: true, effects: { money: 8000, fx: ['spnTake'] }, log: '해외 학회 비행기는 비즈니스석이었다. 처방전 속 약 이름이 바뀌었다.' },
      { text: '거절한다', effects: { rep: 3 }, log: '그 영업 담당은 옆 병원으로 갔다.' },
      { text: '리베이트 장부를 공익 신고한다', risky: true, check: { stat: 'smarts', diff: 55 },
        success: { effects: { fame: 3, fx: ['whistle'] }, log: '업계 전체가 조사를 받았다. 환자들이 감사 편지를 보냈다.' },
        fail: { effects: { happy: -6, fx: ['rtSetback'] }, log: '병원은 나를 "조직을 흔드는 사람"으로 찍었다.' } }
    ] });
  H({ id: 'spn_match_fix', age: [19, 36], routes: ['football', 'basketball', 'baseball', 'fighter', 'esports'], cooldown: 6, weight: 10,
    text: '브로커가 접근했다. "다음 경기, 살짝만 져 주면 큰돈을 주지."',
    choices: [
      { text: '돈을 받는다', risky: true, effects: { money: 12000, happy: -6, fx: ['spnTake'] }, log: '결정적인 순간, 일부러 실수했다. 들키지는 않았다. 나만은 그 이유를 알았다.' },
      { text: '거절한다', effects: { rep: 3, grit: 2 }, log: '브로커는 "생각 바뀌면 연락해"라며 명함을 남겼다. 찢어 버렸다.' },
      { text: '경기 주최 측에 신고한다', risky: true, check: { stat: 'grit', diff: 50 },
        success: { effects: { fame: 4, fx: ['whistle'] }, log: '승부 조작 조직이 적발됐다. 주최 측이 공정한 경기를 지켰다며 나를 표창했다.' },
        fail: { effects: { happy: -6, fx: ['rtSetback'] }, log: '증거 불충분. 브로커 쪽 사람들이 경기장 밖에서 기다렸다.' } }
    ] });
  H({ id: 'spn_biz_lobby', age: [28, 80], routes: ['startup', 'office'], cooldown: 7, weight: 10, cond: { career: ['entrepreneur', 'ceo'] },
    text: '인허가가 1년째 막혀 있다. 브로커가 담당 공무원과 "식사 자리"를 만들어 주겠다고 한다.',
    choices: [
      { text: '브로커에게 뒷일을 맡긴다', risky: true, effects: { money: 10000, fx: ['spnTake', 'promote'] }, log: '한 달 만에 도장이 찍혔다. 매출이 뛰었고 내 몫도 들어왔다.' },
      { text: '정식 절차를 끝까지 기다린다', effects: { rep: 3, happy: -3 }, log: '1년이 더 걸렸다. 그래도 떳떳했다.' },
      { text: '브로커의 제안을 언론에 알린다', risky: true, check: { stat: 'social', diff: 55 },
        success: { effects: { fame: 3, fx: ['whistle'] }, log: '인허가 비리가 기사화됐다. 업계 사람들이 나를 피했다.' },
        fail: { effects: { happy: -5, money: -3000 }, log: '기사는 나가지 않았다. 대신 세무 조사가 나왔다.' } }
    ] });
  H({ id: 'spn_press_hush', age: [24, 75], routes: ['media'], cooldown: 7, weight: 12, cond: { career: ['journalist', 'news_anchor', 'tv_producer'] },
    text: '대기업 홍보팀이 취재 중인 기사를 빼 주면 광고를 몰아주겠다고 한다.',
    choices: [
      { text: '기사를 뺀다', risky: true, effects: { money: 7000, fx: ['spnTake', 'rtSkill'] }, log: '책임자가 웃었다. 그 기업 광고가 주요 광고 자리를 채웠다.' },
      { text: '그대로 내보낸다', effects: { rep: 4, fame: 2 }, log: '광고가 끊겼다. 기사는 많이 읽혔다.' },
      { text: '회유 사실까지 기사로 쓴다', risky: true, check: { stat: 'smarts', diff: 55 },
        success: { effects: { fame: 4, fx: ['whistle'] }, log: '"기사를 사려 한 기업" 후속 보도가 상을 받았다.' },
        fail: { effects: { happy: -5, fx: ['rtSetback'] }, log: '소송이 들어왔다. 지루한 재판이 2년 동안 이어졌다.' } }
    ] });
  // variants for jobs with a different kind of power (a lawyer has clients, not verdicts; an official signs papers)
  H({ id: 'spn_law_lawyer', age: [27, 75], routes: ['law'], cooldown: 7, weight: 12, cond: { career: ['lawyer'] },
    text: '큰손 의뢰인이 사건 기록 한 묶음을 내밀며 "이 서류는 처음부터 없던 걸로" 해 주면 성공 보수를 세 배로 주겠다고 한다.',
    choices: [
      { text: '서류를 파쇄기에 넣는다', risky: true, effects: { money: 12000, fx: ['spnTake', 'rtBig'] }, log: '사건은 이겼다. 그 의뢰인이 다른 큰손들을 줄줄이 소개했다.' },
      { text: '수임을 거절한다', effects: { rep: 3, money: -2000 }, log: '의뢰인은 옆 사무실로 갔다. 그달 사무실 월세가 빠듯했다.' },
      { text: '증거 인멸 요구를 변호사회에 알린다', risky: true, check: { stat: 'smarts', diff: 55 },
        success: { effects: { fame: 3, fx: ['whistle'] }, log: '의뢰인이 증거 인멸 교사로 수사를 받았다. 원칙 있는 변호사로 이름이 났다.' },
        fail: { effects: { happy: -5, rep: -3, fx: ['rtSetback'] }, log: '"의뢰인을 판 변호사"라는 소문만 돌았다. 사건 의뢰가 끊겼다.' } }
    ] });
  H({ id: 'spn_public_bribe', age: [25, 65], routes: ['public'], cooldown: 7, weight: 12, cond: { career: ['tax_auditor', 'customs_officer', 'civil_servant'] },
    text: '서류 한 장에 내 도장이 필요한 업체 사장이 상자에 든 고급 선물 세트를 사무실에 놓고 갔다. 상자 밑에 봉투가 깔려 있다.',
    choices: [
      { text: '도장을 찍고 상자를 챙긴다', risky: true, effects: { money: 5000, fx: ['spnTake'] }, log: '서류는 하루 만에 통과됐다. 명절마다 같은 상자가 왔다.' },
      { text: '상자를 돌려보내고 규정대로 본다', effects: { rep: 3, happy: -1 }, log: '서류는 반려됐다. 사장은 윗선에 전화를 돌렸다.' },
      { text: '봉투째 감사실에 넘긴다', risky: true, check: { stat: 'grit', diff: 50 },
        success: { effects: { fame: 2, fx: ['whistle'] }, log: '업체와 윗선 한 명이 함께 징계를 받았다. 청사 복도가 조용해졌다.' },
        fail: { effects: { happy: -5, fx: ['rtSetback'] }, log: '감사는 "단순 착오"로 끝났다. 나는 한직으로 옮겨졌다.' } }
    ] });
  H({ id: 'spn_fire_inspect', age: [22, 60], routes: ['safety'], cooldown: 7, weight: 10, cond: { career: ['firefighter'] },
    text: '소방 점검을 나간 노래방 사장이 비상구 앞 짐은 내일 치우겠다며 "점검표만 잘 써 달라"고 봉투를 내민다.',
    choices: [
      { text: '봉투를 받고 합격 도장을 찍는다', risky: true, effects: { money: 2500, fx: ['spnTake'] }, log: '점검표엔 "이상 없음". 비상구 앞 짐은 그대로였다.' },
      { text: '그 자리에서 짐을 치우게 한다', effects: { rep: 3, social: -1 }, log: '사장은 투덜대며 짐을 뺐다. 다음 점검 때 인사도 하지 않았다.' },
      { text: '구청에 영업 정지를 요청한다', risky: true, check: { stat: 'grit', diff: 45 },
        success: { effects: { fame: 2, fx: ['whistle'] }, log: '근처 업소들까지 비상구를 정리했다. 동네 신문에 짧게 실렸다.' },
        fail: { effects: { happy: -4, fx: ['rtSetback'] }, log: '사장 친척이 구의원이었다. 나는 야간 근무로만 돌았다.' } }
    ] });
  H({ id: 'spn_exposed', manual: true, age: [19, 100], cooldown: 0,
    text: '📸 과거에 받은 뒷돈이 기사로 터졌다. 사진과 통화 기록까지 나왔다.',
    choices: [
      { text: '인정하고 사과한다', effects: { rep: -12, happy: -8, fx: ['spnFall'] }, log: '카메라 앞에서 고개를 숙였다. 플래시가 그치지 않았다.' },
      { text: '끝까지 부인한다', risky: true, check: { stat: 'smarts', diff: 60 },
        success: { effects: { rep: -5, fx: ['spnSurvive'] }, log: '증거가 하나씩 무너졌다. 사건은 흐지부지됐다. 소문은 남았다.' },
        fail: { effects: { rep: -20, happy: -10, fx: ['spnFall', 'spnFall'] }, log: '거짓말이 하나씩 드러났다. 처음 받은 비난의 두 배가 돌아왔다.' } },
      { text: '윗선과 브로커를 불고 수사에 협조한다', effects: { rep: -6, happy: -5, fx: ['spnCooperate'] }, log: '받은 돈을 돌려주고 진술서를 썼다. 많은 사람이 나를 원망했다.' }
    ] });
  H({ id: 'spn_retaliation', age: [19, 100], cooldown: 0, manual: true,
    text: '폭로 이후 지지 문자와 협박 문자가 하루에도 여러 통 온다. 사람들 앞에 서는 일이 부담스럽다.',
    choices: [
      { text: '버틴다', check: { stat: 'grit', diff: 55 },
        success: { effects: { rep: 6, fame: 2, fx: ['rtSkill'] }, log: '시간이 내 편이었다. 후배들이 나를 따라 목소리를 냈다.' },
        fail: { effects: { happy: -8, health: -3 }, log: '불면증이 생겼다. 그래도 폭로한 사실을 뒤집지는 않았다.' } },
      { text: '떠나서 새로 시작한다', effects: { happy: 2, fx: ['goStraight'] }, log: '짐을 쌌다. 옳은 일을 한 대가가 생각보다 컸다.' }
    ] });

  // ================================================================ rapper route moments
  function RP(age, text, choices, extra) { var ev = { id: 'rt_rapper_' + (EV.filter(function (e) { return /^rt_rapper_/.test(e.id); }).length + 1), routes: ['rapper'], age: age, cooldown: 3, weight: 14, decision: true, text: text, choices: choices }; for (var k in extra || {}) ev[k] = extra[k]; EV.push(ev); }
  RP([14, 40], '다른 크루 래퍼가 SNS에 나를 저격하는 디스곡을 올렸다. 조회수가 무섭게 오른다.', [
    { text: '맞디스로 받아친다', risky: true, check: { stat: 'social', diff: 50 },
      success: { effects: { fame: 3, fx: ['rtBig'] }, log: '사흘 밤을 새워 쓴 벌스가 판을 뒤집었다. 상대가 게시물을 내렸다.' },
      fail: { effects: { happy: -4, fx: ['rtSetback'] }, log: '가사가 약했다. 댓글창이 내 패배를 선언했다.' } },
    { text: '무대에서 실력으로 답한다', effects: { grit: 2, fx: ['rtSkill'] }, log: '말 대신 공연 영상을 올렸다. 조용한 팬들이 늘었다.' }
  ]);
  RP([16, 38], '〈쇼미더라임〉 예선 줄이 경기장을 한 바퀴 돌았다. 60초 안에 심사위원을 사로잡아야 한다.', [
    { text: '준비한 가사로 정면 승부', check: { stat: 'grit', diff: 50 },
      success: { effects: { fame: 3, fx: ['rtBig'] }, log: '목걸이 패스를 받았다. 방송에 얼굴이 나갔다.' },
      fail: { effects: { happy: -3, fx: ['rtSetback'] }, log: '긴장해서 박자를 놓쳤다. 다음 시즌을 기약했다.' } },
    { text: '즉석에서 심사위원을 디스한다', risky: true, check: { odds: 0.4 },
      success: { effects: { fame: 5, fx: ['rtBig'] }, log: '심사위원이 웃으며 박수를 쳤다. 그 장면이 시즌 최고 클립이 됐다.' },
      fail: { effects: { rep: -4, fx: ['rtScandal'] }, log: '"선을 넘었다"는 기사가 쏟아졌다.' } }
  ], { stages: ['crew', 'mixtape', 'show', 'debut'] });
  RP([18, 55], '큰 레이블이 계약서를 내밀었다. 계약금은 두둑하지만 저작권은 10년 동안 레이블 소유다.', [
    { text: '사인한다', effects: { money: 8000, fx: ['rtBig'] }, log: '새 앨범이 대형 마케팅을 탔다. 내 곡인데 내 곡이 아닌 기분이 들었다.' },
    { text: '독립 레이블을 고집한다', check: { stat: 'grit', diff: 55 },
      success: { effects: { fame: 2, fx: ['rtSkill'] }, log: '느리지만 내 이름으로 쌓였다. 팬들이 굿즈를 사 줬다.' },
      fail: { effects: { money: -2000, fx: ['rtSetback'] }, log: '앨범 제작비가 예상을 넘었다. 적자를 메우느라 돈이 나갔다.' } }
  ], { stages: ['debut', 'chart', 'legend'] });
  RP([20, 60], '어린 시절 살던 동네 이야기를 가사에 담을지 고민된다. 가족이 싫어할 수도 있다.', [
    { text: '있는 그대로 쓴다', check: { stat: 'social', diff: 45 },
      success: { effects: { fame: 3, happy: 3, fx: ['rtSkill'] }, log: '같은 골목에서 자란 사람들이 "우리 이야기"라며 울었다.' },
      fail: { effects: { rel: { family: -6 }, happy: -3 }, log: '{mother}[이/가] 그 노래를 듣고 한참 전화를 받지 않았다.' } },
    { text: '이름과 장소를 바꿔 쓴다', effects: { fx: ['rtSkill'] }, log: '덜 날카로웠지만 모두가 들을 수 있는 노래가 됐다.' }
  ], { stages: ['mixtape', 'debut', 'chart', 'legend', 'oldschool'] });
  RA.ownEvents(RA.data.events);
})(typeof globalThis !== 'undefined' ? globalThis : this);
