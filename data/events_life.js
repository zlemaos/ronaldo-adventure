/* Shared (country-neutral) life storylet events. Prefix: life_
 * Country flavour comes only through text tokens. Follow-up events reached via
 * `schedule` are gated by a flag set by the scheduling choice and clear it on fire. */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};
  RA.data.events = RA.data.events || [];
  var E = RA.data.events;
  function add(list) { for (var i = 0; i < list.length; i++) E.push(list[i]); }

  // ───────────────────────── Baby / toddler (1–4) ─────────────────────────
  add([
    {
      id: 'life_first_word', age: [1, 2], once: true, weight: 30,
      text: '드디어 첫 단어를 말할 시간이다. 온 가족이 숨죽이고 {name}의 입만 바라본다.',
      choices: [
        { text: '"엄마!"', effects: { happy: 3, rel: { mother: 8 } }, log: '{mother}[이/가] 눈물을 글썽이며 동네방네 자랑했다.' },
        { text: '"아빠!"', effects: { happy: 3, rel: { father: 8 } }, log: '{father}[은/는] 그날 하루 종일 콧노래를 불렀다.' },
        { text: '"공!"', effects: { football: 2, happy: 2 }, log: '첫 단어가 "공"이었다. 형 {bro}[이/가] 배를 잡고 웃었다.' },
        { text: '"{food}!"', effects: { happy: 4, health: 1 }, log: '첫 단어부터 먹을 것. 가족 모두 납득했다.' }
      ]
    },
    {
      id: 'life_first_steps', age: [1, 2], once: true, weight: 25,
      text: '소파를 붙잡고 일어선 {name}. 거실 건너편에서 누나들이 손뼉을 친다.',
      choices: [
        { text: '아장아장 걸어간다', check: { stat: 'grit', diff: 20 },
          success: { effects: { health: 2, grit: 2, rel: { siblings: 4 } }, log: '다섯 걸음! 집 안이 환호로 떠나갈 듯했다.' },
          fail: { effects: { happy: -1, health: -1 }, log: '두 걸음 만에 엉덩방아. 울었지만 금방 다시 일어났다.' } },
        { text: '그냥 기어서 간다', effects: { happy: 2 }, log: '기는 게 더 빠르다는 걸 이미 알고 있었다.' }
      ]
    },
    {
      id: 'life_toddler_tantrum', age: [2, 4], cooldown: 2,
      text: '시장에서 {name}[이/가] 장난감 앞에 드러누웠다. 사람들이 쳐다본다.',
      choices: [
        { text: '더 크게 운다', check: { stat: 'looks', diff: 45 },
          success: { effects: { happy: 4, rel: { mother: -2 } }, log: '귀여움에 진 가게 주인이 장난감을 그냥 줬다.' },
          fail: { effects: { happy: -3, rel: { mother: -4 } }, log: '{mother}[은/는] 단호하게 {name}[을/를] 들쳐 업고 집에 갔다.' } },
        { text: '훌쩍이며 일어난다', effects: { grit: 2, rel: { mother: 3 } }, log: '{mother}[이/가] 집에 가는 길에 사탕 하나를 몰래 쥐여 줬다.' }
      ]
    },
    {
      id: 'life_toddler_ball', age: [2, 4], cooldown: 3,
      text: '{father}[이/가] 낡은 공을 굴려 주자 {name}[이/가] 온몸으로 뒤뚱뒤뚱 쫓아간다.',
      cond: { rel: { father: 'alive' } },
      effects: { football: 2, happy: 2, rel: { father: 3 } },
      log: '공을 찼다기보다 공 위에 넘어졌지만, {father}[은/는] "골!"이라고 외쳤다.'
    },
    {
      id: 'life_toddler_crowded_bed', age: [1, 4], cooldown: 3,
      cond: { money: [-999999, 3000] },
      text: '{house}. 밤마다 형제들과 한 이불을 나눠 덮는다.',
      effects: { happy: 1, rel: { siblings: 3 } },
      log: '누군가 발로 차서 깼지만, 따뜻해서 금방 다시 잠들었다.'
    },
    {
      id: 'life_toddler_fever', age: [1, 4], cooldown: 4,
      cond: { stats: { health: [0, 55] } },
      text: '밤새 열이 펄펄 끓는다. {mother}[이/가] 젖은 수건을 갈아 주며 한숨도 못 잔다.',
      choices: [
        { text: '병원에 간다', effects: { health: 5, money: -80, rel: { mother: 3 } }, log: '주사 한 방에 울음바다였지만 다음 날 열이 내렸다.' },
        { text: '집에서 버틴다', check: { stat: 'health', diff: 30 },
          success: { effects: { health: 2, rel: { mother: 4 } }, log: '새벽녘에 열이 내렸다. {mother}[은/는] 그제야 눈을 붙였다.' },
          fail: { effects: { health: -5, money: -150 }, log: '결국 새벽에 응급실로 달려갔다.' } }
      ]
    },
    {
      id: 'life_toddler_hide', age: [3, 4], cooldown: 3,
      text: '숨바꼭질에서 {name}[이/가] 빨래 바구니 속에 숨었다. 아무도 못 찾는다.',
      effects: { happy: 3, smarts: 1 },
      log: '한 시간 뒤 바구니 속에서 곤히 잠든 채 발견됐다. 전설적인 승리였다.'
    },
    {
      id: 'life_toddler_crayon_wall', age: [2, 4], once: true,
      text: '{name}[이/가] 크레용으로 벽 한가득 거대한 그림을 그렸다.',
      choices: [
        { text: '"엄마 그린 거야"라고 한다', effects: { happy: 2, rel: { mother: 5 } }, log: '{mother}[은/는] 화를 내려다 웃음이 터져 버렸다.' },
        { text: '{sis2}[이/가] 했다고 한다', check: { stat: 'smarts', diff: 40 },
          success: { effects: { happy: 2, rel: { sis2: -3 } }, log: '믿어 줬다. {sis2}[은/는] 억울해서 이틀간 말을 안 했다.' },
          fail: { effects: { rel: { mother: -3, sis2: -2 } }, log: '크레용이 아직 손에 들려 있었다.' } }
      ]
    },
    {
      id: 'life_toddler_dog_meet', age: [2, 4], once: true,
      text: '골목의 커다란 개가 꼬리를 흔들며 다가온다.',
      choices: [
        { text: '쓰다듬는다', effects: { happy: 4, grit: 1 }, log: '개가 {name}의 얼굴을 핥았다. 둘은 친구가 됐다.' },
        { text: '{bro} 뒤에 숨는다', effects: { rel: { bro: 3 } }, log: '{bro}[이/가] "괜찮아, 형 있잖아" 하고 손을 잡아 줬다.' }
      ]
    },
    {
      id: 'life_toddler_vegetable', age: [2, 4], cooldown: 3,
      text: '저녁상에 채소가 올라왔다. {name}의 숟가락이 공중에서 멈췄다.',
      choices: [
        { text: '꾹 참고 먹는다', effects: { health: 2, grit: 1 }, log: '얼굴이 일그러졌지만 다 먹었다. 박수가 쏟아졌다.' },
        { text: '몰래 바닥에 떨어뜨린다', effects: { happy: 1, health: -1 }, log: '고양이도 안 먹고 지나갔다.' }
      ]
    },
    {
      id: 'life_toddler_song', age: [3, 4], cooldown: 4,
      text: '{holiday} 가족 모임에서 {name}[이/가] 갑자기 노래를 부르기 시작했다.',
      effects: { happy: 3, looks: 1, rel: { family: 3 } },
      log: '가사는 반쯤 지어냈지만, 친척들이 용돈을 쥐여 줬다.'
    },
    {
      id: 'life_toddler_lost_market', age: [3, 4], once: true,
      text: '{city} 시장 한복판에서 {name}[이/가] 엄마 손을 놓쳤다.',
      choices: [
        { text: '그 자리에서 기다린다', effects: { smarts: 2, rel: { mother: 3 } }, log: '{mother}[이/가] 사색이 되어 달려와 꼭 안아 줬다.' },
        { text: '울면서 찾아다닌다', check: { stat: 'grit', diff: 30 },
          success: { effects: { grit: 2 }, log: '생선 가게 아주머니가 손을 잡고 엄마를 찾아 줬다.' },
          fail: { effects: { happy: -4 }, log: '두 시간 만에 파출소에서 가족과 재회했다.' } }
      ]
    },
    {
      id: 'life_toddler_father_tired', age: [2, 4], cooldown: 4,
      cond: { rel: { father: 'alive' }, flags: ['father_drinking'] },
      text: '{father}[이/가] 늦은 밤 지친 얼굴로 들어온다. 오늘은 집 안이 유난히 조용하다.',
      choices: [
        { text: '아빠 무릎에 기어오른다', effects: { happy: 1, rel: { father: 5 } }, log: '{father}[은/는] 한참 {name}[을/를] 안고 아무 말도 하지 않았다.' },
        { text: '{mother} 곁에 붙어 있는다', effects: { rel: { mother: 4 }, happy: -1 }, log: '{mother}[이/가] 등을 토닥이며 자장가를 불러 줬다.' }
      ]
    },
    {
      id: 'life_toddler_handmedown', age: [1, 4], cooldown: 4,
      cond: { money: [-999999, 4000] },
      text: '{bro}[이/가] 입던 옷을 물려받았다. 소매가 손끝을 한참 덮는다.',
      effects: { happy: 1, rel: { bro: 2 } },
      log: '"크면 맞아" — 이 말을 앞으로 수백 번 듣게 될 것이다.'
    },
    {
      id: 'life_toddler_stairs', age: [1, 3], cooldown: 3,
      cond: { stats: { grit: [40, 100] } },
      text: '{name}[이/가] 혼자서 계단 꼭대기까지 기어올랐다.',
      effects: { grit: 2, health: -1 },
      log: '내려오는 법은 몰랐다. {sis1}[이/가] 구조대 역할을 했다.'
    },
    {
      id: 'life_toddler_bath', age: [1, 3], cooldown: 3,
      text: '목욕 시간. {name}[은/는] 고무 오리와 함께 욕실을 수영장으로 만들었다.',
      effects: { happy: 3 },
      log: '바닥이 물바다가 됐지만 아무도 화내지 않았다. 너무 행복해 보였으니까.'
    }
  ]);

  // ───────────────────────── Childhood (5–12) ─────────────────────────
  add([
    {
      id: 'life_child_playground_king', age: [5, 9], cooldown: 3,
      text: '놀이터 미끄럼틀 꼭대기를 두고 아이들 사이에 영역 다툼이 벌어졌다.',
      choices: [
        { text: '정정당당하게 가위바위보', check: { stat: 'smarts', diff: 30 },
          success: { effects: { happy: 3, fx: ['newFriend'] }, log: '이긴 뒤 상대와 같이 미끄럼을 탔다. 친구가 생겼다.' },
          fail: { effects: { happy: -1 }, log: '세 판 내리 졌다. 그네로 영역을 옮겼다.' } },
        { text: '그냥 같이 놀자고 한다', effects: { happy: 2, smarts: 1 }, log: '다툼은 술래잡기로 바뀌었다.' }
      ]
    },
    {
      id: 'life_child_handmedown_shoes', age: [6, 12], cooldown: 4,
      cond: { money: [-999999, 5000] },
      text: '새 운동화 대신 {bro}의 낡은 운동화를 물려받았다. 앞코가 벌어져 있다.',
      choices: [
        { text: '테이프로 감고 신는다', effects: { grit: 3, happy: -1 }, log: '테이프 운동화로 골목을 누볐다. 오히려 공이 더 잘 붙는 것 같았다.' },
        { text: '{mother}에게 새 신발을 조른다', effects: { happy: 1, rel: { mother: -2 }, money: -40 }, log: '{mother}[은/는] 한참 고민하더니 시장에서 싼 신발을 사 왔다. 그 표정이 오래 마음에 남았다.' }
      ]
    },
    {
      id: 'life_child_power_cut', age: [5, 12], cooldown: 5,
      cond: { money: [-999999, 2000] },
      text: '전기 요금이 밀려 집에 불이 끊겼다. 촛불 하나에 온 가족이 모였다.',
      effects: { happy: -1, rel: { family: 4 }, grit: 2 },
      log: '{sis1}[이/가] 그림자 놀이를 시작했고, 그날 밤은 이상하게 따뜻했다.'
    },
    {
      id: 'life_child_dinner_share', age: [5, 12], cooldown: 4,
      cond: { money: [-999999, 2500], family: 'all' },
      text: '오늘 저녁 {food}[이/가] 여섯 식구에게는 조금 모자라다.',
      choices: [
        { text: '내 몫을 {mother}에게 덜어 준다', effects: { health: -1, happy: 2, rel: { mother: 6 } }, log: '{mother}[은/는] 다시 돌려주며 "엄마는 아까 먹었어"라고 했다. 거짓말인 걸 알았다.' },
        { text: '배부르게 먹는다', effects: { health: 1, rel: { siblings: -1 } }, log: '{sis2}[이/가] 빈 그릇을 아쉽게 쳐다봤다.' }
      ]
    },
    {
      id: 'life_child_pet_stray', age: [6, 12], once: true,
      cond: { flags: ['!has_pet'] },
      text: '비 오는 날, 골목에서 떨고 있는 새끼 고양이를 발견했다.',
      choices: [
        { text: '집에 데려간다', effects: { happy: 6, money: -50, fx: ['adoptPet'] }, log: '{mother}[은/는] 한숨을 쉬었지만 결국 우유 접시를 내줬다.' },
        { text: '박스와 담요만 놓아 준다', effects: { happy: 1, smarts: 1 }, log: '다음 날 박스는 비어 있었다. 좋은 사람이 데려갔길 바랐다.' }
      ]
    },
    {
      id: 'life_pet_mischief', age: [5, 80], cooldown: 4,
      cond: { flags: ['has_pet'] },
      text: '반려동물이 {name}의 숙제(혹은 서류)를 갈기갈기 찢어 놓았다.',
      effects: { happy: 2, smarts: -1 },
      log: '"강아지가 먹었어요"가 진짜 변명이 되는 날이 올 줄이야.'
    },
    {
      id: 'life_pet_old', age: [14, 90], once: true,
      cond: { flags: ['has_pet'] },
      text: '오래 함께한 반려동물이 요즘 부쩍 잠만 잔다. 수의사는 나이가 많다고 했다.',
      choices: [
        { text: '마지막까지 곁을 지킨다', effects: { happy: -6, grit: 2, money: -300, unflags: ['has_pet'] }, log: '마지막 날, 녀석은 {name}의 손바닥에 머리를 기댄 채 잠들었다.' },
        { text: '비싼 치료를 시도한다', effects: { happy: -3, money: -1500 }, log: '1년을 더 함께했다. 그 1년은 돈으로 살 수 없는 시간이었다.' }
      ]
    },
    {
      id: 'life_child_bully', age: [7, 13], cooldown: 4,
      cond: { flags: ['!bullied'] },
      text: '덩치 큰 아이가 {name}의 낡은 가방을 보고 비웃으며 운동장에 던졌다.',
      choices: [
        { text: '맞선다', check: { stat: 'grit', diff: 45 },
          success: { effects: { grit: 3, happy: 2, fame: 1 }, log: '눈을 피하지 않자 녀석이 먼저 물러섰다. 반 아이들이 수군거렸다.' },
          fail: { effects: { health: -3, happy: -4, flags: ['bullied'] }, log: '코피가 났다. 그 뒤로 녀석은 {name}[을/를] 표적으로 삼았다.' } },
        { text: '선생님께 말한다', effects: { smarts: 1, happy: -1 }, log: '선생님이 중재했지만, 복도에서 "고자질쟁이"라는 소리를 들었다.' },
        { text: '가방을 주워 조용히 간다', effects: { happy: -3, flags: ['bullied'] }, log: '집에 가는 길이 유난히 길었다.' }
      ]
    },
    {
      id: 'life_child_bully_ends', age: [8, 16], once: true,
      cond: { flags: ['bullied'] },
      text: '괴롭힘이 계속되던 어느 날, {name}[은/는] 결심을 해야 했다.',
      choices: [
        { text: '가족에게 털어놓는다', effects: { happy: 4, rel: { family: 5 }, unflags: ['bullied'] }, log: '{bro}[이/가] 다음 날 학교 앞에 나타났다. 그 뒤로 아무도 건드리지 않았다.' },
        { text: '운동으로 단단해진다', effects: { grit: 5, health: 3, unflags: ['bullied'] }, log: '매일 밤 달리기를 했다. 1년 뒤, 녀석은 더 이상 {name}[을/를] 내려다보지 못했다.' },
        { text: '혼자 참는다', effects: { happy: -5, smarts: 2 }, log: '도서관이 피난처가 됐다. 책 속 주인공들은 늘 결국 이겼다.' }
      ]
    },
    {
      id: 'life_child_talent_show', age: [7, 12], once: true,
      cond: { edu: ['elem', 'middle'] },
      text: '{school} 장기자랑이 열린다. 무대에 나갈까?',
      choices: [
        { text: '춤을 춘다', check: { stat: 'looks', diff: 40 },
          success: { effects: { happy: 5, fame: 2, looks: 1 }, log: '강당이 떠나갈 듯한 환호. 한동안 "춤신"으로 불렸다.' },
          fail: { effects: { happy: -3 }, log: '음악이 끊겼는데 혼자 계속 췄다. 그것도 나름 전설이 됐다.' } },
        { text: '공 리프팅 묘기', check: { stat: 'football', diff: 30 },
          success: { effects: { football: 2, fame: 2, happy: 4 }, log: '공이 한 번도 땅에 닿지 않았다. 체육 선생님이 눈여겨봤다.' },
          fail: { effects: { happy: -2 }, log: '공이 교장 선생님 쪽으로 날아갔다.' } },
        { text: '관객석에 앉는다', effects: { happy: 1 }, log: '친구들을 열심히 응원했다.' }
      ]
    },
    {
      id: 'life_child_broken_window', age: [6, 12], once: true,
      text: '골목에서 찬 공이 이웃집 유리창을 깼다. 쨍그랑!',
      choices: [
        { text: '초인종을 누르고 사과한다', effects: { grit: 2, money: -60, rel: { father: 3 } }, log: '이웃 할머니는 화내는 대신 "다음엔 저쪽으로 차라"며 웃었다.' },
        { text: '튄다', check: { stat: 'health', diff: 35 },
          success: { effects: { happy: 2, flags: ['window_secret'] }, log: '무사히 도망쳤다. 하지만 공은 그 집 마당에 남았다.' },
          fail: { effects: { happy: -3, money: -100, rel: { mother: -4 } }, log: '모퉁이에서 {mother}[과/와] 마주쳤다.' } }
      ]
    },
    {
      id: 'life_child_lost_tooth', age: [6, 8], once: true,
      text: '앞니가 빠졌다! 웃을 때마다 바람이 샌다.',
      effects: { happy: 2, looks: -1 },
      log: '이를 지붕 위로 던지며 튼튼한 새 이를 빌었다.'
    },
    {
      id: 'life_child_school_first', age: [6, 8], once: true,
      cond: { edu: ['elem'] },
      text: '{school} 첫 등교 날. 교문 앞에서 {mother}의 손을 놓기가 싫다.',
      choices: [
        { text: '씩씩하게 들어간다', effects: { grit: 2, fx: ['newFriend'] }, log: '짝꿍과 지우개를 나눠 쓰다 친구가 됐다.' },
        { text: '울며 매달린다', effects: { happy: -1, rel: { mother: 3 } }, log: '선생님이 사탕으로 설득했다. 점심시간쯤엔 다 잊었다.' }
      ]
    },
    {
      id: 'life_child_report_card', age: [8, 12], cooldown: 2,
      cond: { edu: ['elem'] },
      text: '성적표가 나왔다.',
      choices: [
        { text: '솔직하게 보여 준다', check: { stat: 'smarts', diff: 45 },
          success: { effects: { happy: 3, rel: { mother: 4, father: 2 } }, log: '{mother}[이/가] 성적표를 냉장고에 붙였다.' },
          fail: { effects: { happy: -2, smarts: 1 }, log: '"다음엔 잘하자." 혼나지 않아서 더 미안했다.' } },
        { text: '성적표를 숨긴다', effects: { happy: 1, rel: { mother: -3 }, flags: ['hid_report'] }, log: '침대 매트리스 밑에 숨겼다. 완벽한 범죄 같았다.', schedule: { id: 'life_child_report_found', years: 1 } }
      ]
    },
    {
      id: 'life_child_report_found', age: [8, 14], weight: 1, once: true,
      cond: { flags: ['hid_report'] },
      text: '대청소 날, {mother}[이/가] 매트리스 밑에서 무언가를 발견했다.',
      effects: { happy: -3, rel: { mother: -4 }, grit: 1, unflags: ['hid_report'] },
      log: '성적보다 숨긴 것 때문에 더 혼났다. 그날 정직의 비용을 배웠다.'
    },
    {
      id: 'life_child_sibling_fight', age: [5, 12], cooldown: 3,
      text: '하나뿐인 TV 리모컨을 두고 {sis2}[과/와] 전쟁이 벌어졌다.',
      choices: [
        { text: '양보한다', effects: { rel: { sis2: 5 }, happy: -1 }, log: '{sis2}[이/가] 다음 날 자기 간식을 반 나눠 줬다.' },
        { text: '끝까지 싸운다', check: { stat: 'grit', diff: 40 },
          success: { effects: { happy: 2, rel: { sis2: -3 } }, log: '리모컨을 쟁취했다. 하지만 혼자 보는 만화는 재미가 덜했다.' },
          fail: { effects: { happy: -2, rel: { sis2: -2, mother: -2 } }, log: '{mother}[이/가] TV 코드를 뽑았다. 모두가 졌다.' } }
      ]
    },
    {
      id: 'life_child_sister_help', age: [7, 12], cooldown: 4,
      cond: { stats: { smarts: [0, 45] } },
      text: '{sis1}[이/가] 밤마다 {name}의 받아쓰기 숙제를 봐 준다.',
      effects: { smarts: 3, rel: { sis1: 4 } },
      log: '틀린 글자마다 별을 그려 줬다. 별이 줄어드는 게 눈에 보였다.'
    },
    {
      id: 'life_child_mother_work', age: [6, 12], cooldown: 4,
      cond: { rel: { mother: 'alive' } },
      text: '{mother}[이/가] {motherJob} 일을 마치고 늦게 돌아온다. 손이 많이 거칠어졌다.',
      choices: [
        { text: '설거지를 대신 해 둔다', effects: { grit: 2, rel: { mother: 6 } }, log: '{mother}[은/는] 깨끗한 싱크대를 보고 한참 서 있었다.' },
        { text: '어깨를 주물러 드린다', effects: { happy: 2, rel: { mother: 5 } }, log: '"우리 막내 손이 약손이네." 금방 코를 골며 잠들었다.' }
      ]
    },
    {
      id: 'life_child_father_garden', age: [5, 12], cooldown: 4,
      cond: { rel: { father: 'alive' }, flags: ['!father_dead'] },
      text: '{father}[이/가] {fatherJob} 일터에 {name}[을/를] 데려갔다. 꽃밭에 물을 주는 손이 능숙하다.',
      effects: { happy: 3, smarts: 1, rel: { father: 5 } },
      log: '"꽃도 사람도 매일 조금씩 돌봐야 해." 그 말이 오래 기억에 남았다.'
    },
    {
      id: 'life_child_father_promise', age: [7, 12], once: true,
      cond: { rel: { father: 'alive' }, flags: ['father_drinking'] },
      text: '{father}[이/가] 또 약속한 경기 구경을 잊었다. 현관에서 술 냄새가 난다.',
      choices: [
        { text: '"아빠, 나 아빠가 아픈 거 싫어"라고 말한다', effects: { happy: -2, grit: 2, rel: { father: 5 }, fx: ['fatherSeekHelp'] }, log: '{father}[은/는] 오래 침묵하다 "미안하다"고 했다. 처음으로 진심이 들렸다.' },
        { text: '방문을 닫고 혼자 운다', effects: { happy: -4, rel: { father: -3 } }, log: '{sis1}[이/가] 조용히 들어와 옆에 앉아 줬다.' },
        { text: '{mother}에게 이야기한다', effects: { happy: -1, rel: { mother: 4 } }, log: '{mother}[은/는] "아빠는 지금 아픈 거야, 너 때문이 아니야"라고 꼭 안아 줬다.' }
      ]
    },
    {
      id: 'life_child_birthday_poor', age: [5, 12], cooldown: 5,
      cond: { money: [-999999, 2000] },
      text: '생일인데 케이크 살 돈이 없다. 식탁에는 {food}[이/가] 놓여 있다.',
      effects: { happy: 2, rel: { family: 4 } },
      log: '{food} 위에 초 하나를 꽂았다. 형제들이 목청껏 생일 노래를 불렀다.'
    },
    {
      id: 'life_child_birthday_party', age: [5, 12], cooldown: 4,
      cond: { money: [8000, 99999999] },
      text: '생일 파티를 크게 열어 주겠다고 한다.',
      choices: [
        { text: '반 전체를 초대한다', effects: { happy: 5, money: -400, fx: ['newFriend'] }, log: '케이크가 세 개였다. 반에서 인기 순위가 급상승했다.' },
        { text: '가족끼리 조촐하게', effects: { happy: 3, rel: { family: 4 } }, log: '{bro}[이/가] 직접 만든 선물을 줬다. 조금 이상하게 생겼지만 최고였다.' }
      ]
    },
    {
      id: 'life_child_shoplift_candy', age: [8, 13], once: true,
      text: '동네 가게에서 친구가 사탕을 주머니에 넣으며 눈짓한다. "너도 해 봐."',
      choices: [
        { text: '따라 한다', check: { stat: 'smarts', diff: 50 },
          success: { effects: { happy: 2, flags: ['petty_thief'] }, log: '들키지 않았다. 사탕은 이상하게 맛이 없었다.' },
          fail: { effects: { happy: -5, rel: { mother: -6 }, flags: ['petty_thief'] }, log: '주인 아저씨에게 붙잡혀 {mother}[이/가] 불려 왔다. 고개를 들 수가 없었다.' } },
        { text: '거절하고 돈 내고 산다', effects: { grit: 2, money: -2 }, log: '친구는 "쫄보"라고 놀렸지만, 마음은 편했다.' }
      ]
    },
    {
      id: 'life_child_science_fair', age: [9, 13], once: true,
      cond: { edu: ['elem', 'middle'], stats: { smarts: [50, 100] } },
      text: '{school} 과학 발명대회가 열린다.',
      choices: [
        { text: '페트병 정수기를 만든다', check: { stat: 'smarts', diff: 55 },
          success: { effects: { smarts: 4, fame: 1, happy: 4, achieve: 'young_inventor' }, log: '금상! 지역 신문에 작은 사진이 실렸다.' },
          fail: { effects: { smarts: 2 }, log: '물이 더 더러워져서 나왔다. 그래도 원리는 이해했다.' } },
        { text: '화산 모형을 만든다', effects: { happy: 3, smarts: 1 }, log: '심사위원 셔츠에 거품이 튀었다. 장려상.' }
      ]
    },
    {
      id: 'life_child_rain_football', age: [6, 12], cooldown: 3,
      text: '폭우가 쏟아지는데 골목 아이들이 공을 들고 모였다.',
      choices: [
        { text: '진흙탕 축구!', effects: { football: 2, happy: 4, health: -1, rel: { mother: -1 } }, log: '온몸이 진흙투성이. {mother}[은/는] 빨래통을 보며 할 말을 잃었다.' },
        { text: '창문으로 구경한다', effects: { smarts: 1 }, log: '빗소리를 들으며 만화책을 읽었다.' }
      ]
    },
    {
      id: 'life_child_found_coin', age: [5, 12], cooldown: 5,
      text: '하굣길 하수구 옆에서 반짝이는 동전을 주웠다.',
      choices: [
        { text: '군것질을 한다', effects: { happy: 2 }, log: '{food2} 하나에 세상을 다 가진 기분이었다.' },
        { text: '저금통에 넣는다', effects: { money: 5, smarts: 1 }, log: '저금통이 조금 더 무거워졌다.' }
      ]
    },
    {
      id: 'life_child_sleepover', age: [8, 12], cooldown: 4,
      cond: { rel: { friend: 'yes' } },
      text: '{friend}[이/가] 자기 집에서 자고 가라고 한다.',
      effects: { happy: 4, rel: { friend: 5 } },
      log: '새벽 세 시까지 귀신 이야기를 했다. 둘 다 화장실을 혼자 못 갔다.'
    },
    {
      id: 'life_child_holiday_cousins', age: [5, 12], cooldown: 3,
      text: '{holiday2}, 사촌들이 몰려왔다. 집이 터질 것 같다.',
      effects: { happy: 3, rel: { family: 2 } },
      log: '열두 명이 바닥에 나란히 누워 잤다. 누군가의 발이 계속 얼굴에 왔다.'
    },
    {
      id: 'life_child_glasses', age: [7, 12], once: true,
      cond: { stats: { smarts: [55, 100] } },
      text: '칠판 글씨가 흐릿하다. 검사해 보니 안경이 필요하단다.',
      effects: { smarts: 1, looks: -2, money: -100 },
      log: '세상이 이렇게 선명했다니! 별명이 하나 늘었지만 상관없었다.'
    },
    {
      id: 'life_child_moved_alone_call', age: [12, 16], cooldown: 2,
      cond: { flags: ['moved_alone', 'homesick'] },
      text: '{bigcity}의 밤. 공중전화 앞에서 {mother}의 목소리가 듣고 싶어진다.',
      choices: [
        { text: '동전을 털어 전화한다', effects: { happy: 3, money: -10, rel: { mother: 5 } }, log: '"밥은 먹었니?" 그 한마디에 눈물이 터졌다.' },
        { text: '참고 일기를 쓴다', effects: { grit: 3, happy: -2, smarts: 1 }, log: '일기장 마지막 줄: "언젠가 엄마를 호강시켜 드릴 거다."' }
      ]
    },
    {
      id: 'life_child_kite', age: [6, 11], cooldown: 4,
      text: '{father}[과/와] 함께 비닐봉지와 대나무로 연을 만들었다.',
      cond: { rel: { father: 'alive' } },
      effects: { happy: 4, rel: { father: 4 } },
      log: '연은 생각보다 높이 날았다. {father}[이/가] 어린아이처럼 웃었다.'
    }
  ]);

  // ───────────────────────── Teens (13–19) ─────────────────────────
  add([
    {
      id: 'life_teen_first_love', age: [13, 17], once: true,
      cond: { rel: { partner: 'no' } },
      text: '같은 반 누군가와 눈이 마주칠 때마다 심장이 이상하게 뛴다.',
      choices: [
        { text: '쪽지를 건넨다', check: { stat: 'looks', diff: 45 },
          success: { effects: { happy: 7, fx: ['newPartner'], flags: ['dated'] }, log: '답장: "나도." 세상이 갑자기 핑크빛이 됐다.' },
          fail: { effects: { happy: -5 }, log: '쪽지가 반 전체에 낭독됐다. 3주간 투명인간처럼 지냈다.' } },
        { text: '멀리서 지켜만 본다', effects: { happy: -1, smarts: 1 }, log: '시를 열네 편 썼다. 아무에게도 보여 주지 않았다.' }
      ]
    },
    {
      id: 'life_teen_acne', age: [13, 17], once: true,
      text: '중요한 날 아침, 이마 한가운데 거대한 여드름이 솟았다.',
      choices: [
        { text: '짜 버린다', effects: { looks: -2, happy: -2 }, log: '더 커졌다. 앞머리로 가렸다.' },
        { text: '그냥 당당하게 다닌다', effects: { grit: 2, happy: 1 }, log: '아무도 신경 안 썼다. 생각보다 세상은 나에게 관심이 없었다.' },
        { text: '비싼 연고를 산다', effects: { looks: 1, money: -30 }, log: '사흘 만에 가라앉았다. 용돈은 증발했다.' }
      ]
    },
    {
      id: 'life_teen_growth_spurt', age: [13, 16], once: true,
      text: '여름방학 동안 키가 한 뼘이나 자랐다. 바지가 모두 7부가 됐다.',
      effects: { looks: 3, health: 2, money: -50 },
      log: '{mother}[은/는] "쌀값보다 바짓값이 더 든다"며 웃었다.'
    },
    {
      id: 'life_teen_smoke_offer', age: [13, 19], once: true,
      cond: { flags: ['!smoker'] },
      text: '학교 뒤편, 선배들이 담배 한 개비를 내민다. "한 번만 펴 봐."',
      choices: [
        { text: '받아서 핀다', effects: { happy: 1, health: -3, flags: ['smoker'] }, log: '기침이 멈추지 않았다. 그런데 이상하게 다음 날 또 생각났다.' },
        { text: '"나 운동해서 안 돼"', effects: { grit: 3, health: 1 }, log: '선배들은 시시하다는 듯 웃었지만, 다시 권하지 않았다.' }
      ]
    },
    {
      id: 'life_teen_drink_offer', age: [15, 19], once: true,
      cond: { flags: ['!drinker'] },
      text: '친구 생일 파티에서 누군가 몰래 술병을 꺼냈다.',
      choices: [
        { text: '마신다', effects: { happy: 3, health: -3, flags: ['drinker'] }, log: '다음 날 아침, 머리가 깨질 것 같았다. 기억은 군데군데 비어 있었다.' },
        { text: '탄산음료로 버틴다', effects: { grit: 2, smarts: 1 }, log: '모두를 집에 데려다준 건 결국 {name}이었다.' },
        { text: '집안 일을 떠올리고 자리를 뜬다', effects: { grit: 3, rel: { family: 2 } }, log: '술이 사람을 어떻게 아프게 하는지 이미 알고 있었다. 일찍 집에 왔다.' }
      ]
    },
    {
      id: 'life_teen_exam_prep', age: [16, 18], once: true,
      cond: { edu: ['high'] },
      text: '{exam}[이/가] 다가온다. 학원비가 만만치 않다.',
      choices: [
        { text: '학원에 다닌다', req: { money: 800 }, effects: { smarts: 6, money: -800, happy: -2 }, log: '매일 밤 10시까지 공부했다. 눈 밑이 거뭇해졌다.' },
        { text: '도서관에서 독학한다', check: { stat: 'grit', diff: 45 },
          success: { effects: { smarts: 6, grit: 2 }, log: '무료 강의와 헌책으로 버텼다. 실력이 쑥쑥 늘었다.' },
          fail: { effects: { smarts: 2, happy: -3 }, log: '도서관에서 자꾸 잠들었다. 침 자국 난 문제집이 쌓였다.' } },
        { text: '시험은 운이다', effects: { happy: 3, smarts: -1 }, log: '친구들과 노래방에 갔다. 마음만은 편했다.' }
      ]
    },
    {
      id: 'life_teen_exam_day', age: [17, 19], once: true,
      cond: { edu: ['high'] },
      text: '{exam} 당일 아침. {mother}[이/가] 싸 준 도시락이 따뜻하다.',
      choices: [
        { text: '심호흡하고 들어간다', check: { stat: 'smarts', diff: 55 },
          success: { effects: { smarts: 3, happy: 8, flags: ['exam_ace'] }, log: '시험이 끝나고 나오니 하늘이 유난히 파랬다. 예감이 좋다.' },
          fail: { effects: { happy: -6, flags: ['exam_flop'] }, log: '수학 시간에 머리가 하얘졌다. 집에 오는 버스에서 창밖만 봤다.' } },
        { text: '찍기 신공을 믿는다', check: { stat: 'happy', diff: 60 },
          success: { effects: { happy: 6 }, log: '찍은 문제가 줄줄이 맞았다. 기적이었다.' },
          fail: { effects: { happy: -4, flags: ['exam_flop'] }, log: '기적은 오지 않았다.' } }
      ]
    },
    {
      id: 'life_teen_exam_retry', age: [18, 21], once: true,
      cond: { flags: ['exam_flop'] },
      text: '{exam} 결과가 기대에 못 미쳤다. 친구들은 하나둘 대학에 간다.',
      choices: [
        { text: '1년 더 도전한다', effects: { smarts: 5, happy: -3, grit: 3, unflags: ['exam_flop'] }, log: '재수 생활이 시작됐다. 독서실 칸막이가 세상의 전부가 됐다.' },
        { text: '바로 일을 시작한다', effects: { money: 600, grit: 2, unflags: ['exam_flop'] }, log: '첫 월급으로 {mother}에게 {food}[을/를] 사 드렸다.' }
      ]
    },
    {
      id: 'life_teen_parttime', age: [15, 19], cooldown: 3,
      cond: { money: [-999999, 3000] },
      text: '편의점에서 야간 아르바이트생을 구한다는 공고가 붙었다.',
      choices: [
        { text: '지원한다', effects: { money: 900, health: -2, happy: -1, grit: 2 }, log: '새벽 컵라면의 맛을 알게 됐다. 첫 월급은 반을 집에 드렸다.' },
        { text: '공부가 우선이다', effects: { smarts: 2 }, log: '용돈은 부족했지만 성적은 올랐다.' }
      ]
    },
    {
      id: 'life_teen_parttime_boss', age: [15, 22], once: true,
      cond: { money: [-999999, 5000] },
      text: '아르바이트 사장님이 이번 달 월급을 "다음 달에 같이 주겠다"고 한다.',
      choices: [
        { text: '정중하게 지금 달라고 한다', check: { stat: 'grit', diff: 40 },
          success: { effects: { money: 500, grit: 2 }, log: '사장님이 머쓱하게 봉투를 내밀었다.' },
          fail: { effects: { money: -50, happy: -3 }, log: '"그럼 그만두든가." 결국 반만 받았다.' } },
        { text: '노동청에 신고한다', effects: { money: 500, smarts: 2, happy: 1 }, log: '서류는 복잡했지만 결국 다 받아 냈다. 권리를 배웠다.' },
        { text: '믿고 기다린다', effects: { happy: -1, flags: ['boss_owes'] }, log: '사장님은 고맙다며 어깨를 두드렸다.', schedule: { id: 'life_teen_boss_pays', years: 1 } }
      ]
    },
    {
      id: 'life_teen_boss_pays', age: [16, 24], weight: 1, once: true,
      cond: { flags: ['boss_owes'] },
      text: '예전 아르바이트 사장님에게서 연락이 왔다.',
      choices: [
        { text: '전화를 받는다', check: { stat: 'happy', diff: 45 },
          success: { effects: { money: 700, happy: 4, unflags: ['boss_owes'] }, log: '"늦어서 미안하다." 이자까지 쳐서 보내 줬다. 세상은 아직 살 만했다.' },
          fail: { effects: { happy: -3, unflags: ['boss_owes'] }, log: '가게가 망했다는 소식이었다. 그 돈은 영영 돌아오지 않았다.' } },
        { text: '무시한다', effects: { unflags: ['boss_owes'] }, log: '스팸인 줄 알았다. 무슨 연락이었는지는 영원한 미스터리다.' }
      ]
    },
    {
      id: 'life_teen_social_media', age: [13, 19], once: true,
      text: '처음으로 SNS 계정을 만들었다. 프로필 사진은 무엇으로 할까?',
      choices: [
        { text: '셀카 100장 중 베스트', effects: { looks: 1, happy: 2, fame: 1 }, log: '좋아요 37개. 그 숫자를 하루에 50번 확인했다.' },
        { text: '축구공 사진', effects: { football: 1, happy: 1 }, log: '팔로워는 동네 축구 친구 열두 명.' },
        { text: '{food} 사진', effects: { happy: 2 }, log: '맛집 계정으로 오해받아 낯선 팔로워가 생겼다.' }
      ]
    },
    {
      id: 'life_teen_rebellion', age: [14, 18], once: true,
      text: '갑자기 모든 게 짜증 난다. 머리를 탈색하고 싶어졌다.',
      choices: [
        { text: '탈색한다', check: { stat: 'looks', diff: 50 },
          success: { effects: { looks: 3, happy: 4, rel: { mother: -2 } }, log: '생각보다 잘 어울렸다. {mother}[은/는] 결국 "예쁘네" 했다.' },
          fail: { effects: { looks: -3, happy: -2, rel: { mother: -2 } }, log: '노란 수세미가 됐다. 학교에서 "병아리"로 불렸다.' } },
        { text: '방문 쾅 닫기로 만족한다', effects: { happy: 1, rel: { family: -2 } }, log: '{bro}[이/가] "나도 그 나이 땐 그랬어"라며 웃었다.' }
      ]
    },
    {
      id: 'life_teen_skip_school', age: [13, 18], cooldown: 3,
      cond: { edu: ['middle', 'high'] },
      text: '친구들이 수업 땡땡이치고 바닷가에 가자고 한다.',
      choices: [
        { text: '따라간다', check: { stat: 'smarts', diff: 50 },
          success: { effects: { happy: 5, smarts: -1 }, log: '완벽한 하루. 아무도 몰랐다.' },
          fail: { effects: { happy: -2, smarts: -2, rel: { mother: -4 } }, log: '담임 선생님이 같은 바닷가에서 산책 중이었다.' } },
        { text: '수업을 듣는다', effects: { smarts: 2 }, log: '그날 배운 내용이 기말고사에 나왔다.' }
      ]
    },
    {
      id: 'life_teen_breakup', age: [14, 19], cooldown: 3,
      cond: { rel: { partner: 'yes' }, flags: ['!married'] },
      text: '{partner}[이/가] 할 말이 있다며 방과 후 놀이터로 불렀다. 표정이 심상치 않다.',
      choices: [
        { text: '먼저 붙잡는다', check: { stat: 'looks', diff: 50 },
          success: { effects: { happy: 3, rel: { partner: 6 } }, log: '오해였다. 둘은 아이스크림을 나눠 먹으며 화해했다.' },
          fail: { effects: { happy: -6, fx: ['breakup'] }, log: '"우리 그냥 친구로 지내자." 그날 밤 이별 노래만 들었다.' } },
        { text: '쿨하게 보내 준다', effects: { happy: -3, grit: 2, fx: ['breakup'] }, log: '쿨한 척은 집 현관까지만 유지됐다.' }
      ]
    },
    {
      id: 'life_teen_driving_test', age: [17, 19], once: true,
      text: '운전면허 시험 날. 주차 코스 앞에서 손에 땀이 난다.',
      choices: [
        { text: '침착하게 한다', check: { stat: 'smarts', diff: 40 },
          success: { effects: { happy: 4, grit: 1, flags: ['license'] }, log: '한 번에 합격! 첫 드라이브는 {mother}[과/와] 함께였다.' },
          fail: { effects: { happy: -3, money: -60 }, log: '연석을 밟았다. 감독관의 한숨이 길었다.' } },
        { text: '다음에 본다', effects: { happy: 1 }, log: '아직 버스가 좋다.' }
      ]
    },
    {
      id: 'life_teen_gym_mirror', age: [15, 19], cooldown: 3,
      cond: { stats: { grit: [50, 100] } },
      text: '매일 밤 팔굽혀펴기 100개. 거울 속 몸이 조금씩 달라진다.',
      effects: { looks: 2, health: 2, grit: 1 },
      log: '{sis2}[이/가] "또 거울 봐?"라며 문을 닫았다.'
    },
    {
      id: 'life_teen_attention', age: [15, 25], cooldown: 3,
      cond: { stats: { looks: [75, 100] } },
      text: '길거리 캐스팅 담당자가 명함을 내밀었다. "모델 해 볼 생각 없어요?"',
      choices: [
        { text: '촬영에 가 본다', check: { stat: 'looks', diff: 70 },
          success: { effects: { money: 600, fame: 3, happy: 4 }, log: '잡지 구석에 사진이 실렸다. 동네에서 사인 요청을 받았다.' },
          fail: { effects: { money: -200, happy: -3 }, log: '"프로필 촬영비"를 내라고 했다. 낌새가 이상해 도망쳤다.' } },
        { text: '명함을 버린다', effects: { smarts: 1 }, log: '세상에 공짜 명함은 없다.' }
      ]
    },
    {
      id: 'life_teen_part_scooter', age: [16, 19], once: true,
      cond: { money: [1500, 99999999] },
      text: '모은 돈으로 중고 스쿠터를 살 수 있을 것 같다.',
      choices: [
        { text: '산다', effects: { happy: 5, money: -1200, flags: ['scooter'] }, log: '바람을 가르며 {hometown} 해안 도로를 달렸다.' },
        { text: '저축한다', effects: { smarts: 1, money: 0 }, log: '통장 잔액을 보며 미래의 나에게 감사했다.' }
      ]
    },
    {
      id: 'life_teen_crush_friend', age: [14, 19], once: true,
      cond: { rel: { friend: 'yes', partner: 'no' } },
      text: '{friend}[이/가] 좋아하는 사람이 생겼다며 고백 편지를 대신 전해 달라고 한다. 그런데 그 사람은 {name}도 좋아하던 사람이다.',
      choices: [
        { text: '편지를 전해 준다', effects: { grit: 2, rel: { friend: 6 }, happy: -2 }, log: '둘은 사귀게 됐다. 우정은 지켰다.' },
        { text: '솔직하게 털어놓는다', check: { stat: 'smarts', diff: 45 },
          success: { effects: { rel: { friend: 3 }, happy: 2 }, log: '둘 다 웃음이 터졌다. 결국 아무도 고백 안 하기로 했다.' },
          fail: { effects: { rel: { friend: -8 }, fx: ['loseFriend'] }, log: '"너 진짜 최악이다." 우정에 금이 갔다.' } }
      ]
    },
    {
      id: 'life_teen_phone_broken', age: [13, 19], cooldown: 5,
      text: '휴대폰을 변기에 떨어뜨렸다.',
      choices: [
        { text: '쌀통에 묻는다', check: { stat: 'happy', diff: 50 },
          success: { effects: { happy: 2 }, log: '다음 날 기적적으로 켜졌다. 쌀은 버렸다.' },
          fail: { effects: { happy: -3, money: -300 }, log: '영원히 잠들었다. 새 폰을 샀다.' } },
        { text: '바로 새 걸 산다', effects: { money: -300, happy: 1 }, log: '사진 백업을 안 해 놨다는 걸 그때 깨달았다.' }
      ]
    },
    {
      id: 'life_teen_volunteer', age: [14, 19], cooldown: 4,
      text: '동네 복지관에서 주말 봉사자를 구한다.',
      choices: [
        { text: '어르신 급식 봉사', effects: { happy: 3, grit: 1, smarts: 1 }, log: '할머니 한 분이 매주 {name}[을/를] 손자라고 불렀다.' },
        { text: '아이들 공차기 지도', effects: { football: 1, happy: 3, fame: 1 }, log: '꼬마들이 {name}[을/를] "코치님"이라고 불렀다.' }
      ]
    },
    {
      id: 'life_teen_father_talk', age: [13, 19], once: true,
      cond: { rel: { father: 'alive' }, flags: ['father_drinking'] },
      text: '밤늦게 {father}[이/가] 마당에 혼자 앉아 있다. 처음으로 아들에게 속마음을 털어놓으려는 것 같다.',
      choices: [
        { text: '옆에 앉아 끝까지 듣는다', effects: { grit: 2, rel: { father: 8 }, fx: ['fatherSeekHelp'] }, log: '{father}[은/는] 젊은 날의 꿈과 실패를 이야기했다. "병원 한번 가 볼까." 작은 문이 열렸다.' },
        { text: '"술 냄새 나요" 하고 들어간다', effects: { happy: -2, rel: { father: -4 } }, log: '등 뒤로 들린 한숨이 오래 귓가에 맴돌았다.' }
      ]
    },
    {
      id: 'life_teen_father_sober_match', age: [13, 25], once: true,
      cond: { rel: { father: 'alive' }, flags: ['father_sober'] },
      text: '술을 끊은 {father}[이/가] 맑은 눈으로 {name}의 경기를 보러 왔다. 관중석 맨 앞줄이다.',
      effects: { happy: 7, rel: { father: 8 }, grit: 2 },
      log: '경기가 끝나고 {father}[은/는] 아무 말 없이 {name}[을/를] 오래 안아 줬다.'
    },
    {
      id: 'life_teen_homesick_letter', age: [13, 18], once: true,
      cond: { flags: ['moved_alone'] },
      text: '기숙사 우편함에 {mother}의 편지가 와 있다. 봉투에서 고향 냄새가 난다.',
      effects: { happy: 4, rel: { mother: 5 }, unflags: ['homesick'] },
      log: '편지 끝에는 {siblings}의 서툰 낙서가 있었다. 베개 밑에 넣고 잤다.'
    },
    {
      id: 'life_teen_accent_tease', age: [12, 17], once: true,
      cond: { flags: ['moved_alone'] },
      text: '새 학교 아이들이 {region} 사투리를 흉내 내며 키득거린다.',
      choices: [
        { text: '같이 웃어 넘긴다', effects: { happy: 1, grit: 2, fx: ['newFriend'] }, log: '사투리를 가르쳐 주다 보니 오히려 인기인이 됐다.' },
        { text: '실력으로 보여 준다', effects: { grit: 4, football: 2, happy: -1 }, log: '말 대신 땀으로 답했다. 몇 달 뒤 아무도 웃지 않았다.' }
      ]
    },
    {
      id: 'life_teen_band', age: [14, 19], once: true,
      text: '친구들이 밴드를 만든다며 {name}[을/를] 영입하려 한다.',
      choices: [
        { text: '보컬을 맡는다', check: { stat: 'looks', diff: 45 },
          success: { effects: { happy: 5, fame: 2 }, log: '학교 축제 무대에서 떼창이 나왔다.' },
          fail: { effects: { happy: -2 }, log: '음 이탈 영상이 반 단톡방에 돌았다.' } },
        { text: '탬버린 담당', effects: { happy: 3 }, log: '가장 열정적인 탬버린 연주자로 기억됐다.' }
      ]
    },
    {
      id: 'life_teen_late_night_game', age: [13, 19], cooldown: 3,
      cond: { stats: { grit: [0, 50] } },
      text: '새벽 4시. 게임 한 판만 더 하면 랭크가 오른다.',
      choices: [
        { text: '한 판만 더', effects: { happy: 3, health: -2, smarts: -1 }, log: '랭크는 올랐고 1교시는 기억에 없다.' },
        { text: '끄고 잔다', effects: { health: 2, grit: 2 }, log: '아침이 이렇게 개운할 수가.' }
      ]
    },
    {
      id: 'life_teen_graduation', age: [18, 19], once: true,
      cond: { edu: ['high'] },
      text: '{school} 졸업식. 가족들이 꽃다발을 들고 왔다.',
      effects: { happy: 5, rel: { family: 5 } },
      log: '{mother}[은/는] 사진을 백 장도 넘게 찍었다. 반은 흔들렸다.'
    }
  ]);

  // ───────────────────────── Young adult (20–35) ─────────────────────────
  add([
    {
      id: 'life_ya_move_out', age: [19, 28], once: true,
      cond: { flags: ['!moved_out'] },
      text: '드디어 독립할 때가 된 것 같다. 원룸 매물을 보러 다닌다.',
      choices: [
        { text: '작은 원룸을 얻는다', effects: { happy: 5, money: -1500, grit: 2, flags: ['moved_out'] }, log: '첫날 밤, 너무 조용해서 오히려 잠이 안 왔다.' },
        { text: '집에 더 붙어 있는다', effects: { money: 500, rel: { mother: 3 }, happy: -1 }, log: '{mother}[은/는] 겉으로 투덜대면서도 반찬을 더 만들었다.' }
      ]
    },
    {
      id: 'life_ya_first_rent', age: [19, 30], once: true,
      cond: { flags: ['moved_out'] },
      text: '첫 월세 날. 통장 잔고가 순식간에 반토막 났다.',
      effects: { smarts: 2, happy: -2 },
      log: '그날 저녁 라면을 끓이며 어른이 된다는 것의 의미를 곱씹었다.'
    },
    {
      id: 'life_ya_dating_app', age: [20, 35], cooldown: 3,
      cond: { rel: { partner: 'no', spouse: 'no' } },
      text: '친구가 데이팅 앱을 깔아 줬다. 프로필 사진을 골라야 한다.',
      choices: [
        { text: '열심히 스와이프한다', check: { stat: 'looks', diff: 50 },
          success: { effects: { happy: 6, fx: ['newPartner'], flags: ['dated'] }, log: '첫 만남에 대화가 끊이지 않았다. 두 번째 만남이 잡혔다.' },
          fail: { effects: { happy: -3 }, log: '매칭 0건. 알고리즘이 나를 미워하는 게 분명하다.' } },
        { text: '앱을 지운다', effects: { happy: 1 }, log: '인연은 우연히 오는 거라고 믿기로 했다.' }
      ]
    },
    {
      id: 'life_ya_blind_date', age: [22, 38], cooldown: 4,
      cond: { rel: { partner: 'no', spouse: 'no' } },
      text: '{mother}[이/가] 지인의 지인을 소개해 주겠다며 날짜를 잡아 버렸다.',
      choices: [
        { text: '나가 본다', check: { stat: 'smarts', diff: 40 },
          success: { effects: { happy: 5, fx: ['newPartner'], rel: { mother: 3 } }, log: '{food} 이야기로 세 시간을 떠들었다. 의외의 인연이었다.' },
          fail: { effects: { happy: -2, money: -80 }, log: '상대가 식사 내내 전 애인 이야기만 했다.' } },
        { text: '아프다고 한다', effects: { rel: { mother: -3 } }, log: '{mother}[은/는] 일주일 동안 서운해했다.' }
      ]
    },
    {
      id: 'life_ya_partner_trip', age: [20, 40], cooldown: 4,
      cond: { rel: { partner: 'yes' } },
      text: '{partner}[이/가] 주말에 바닷가로 여행을 가자고 한다.',
      choices: [
        { text: '떠난다', effects: { happy: 6, money: -500, rel: { partner: 7 } }, log: '노을 아래서 찍은 사진이 서로의 배경화면이 됐다.' },
        { text: '일이 바빠 미룬다', effects: { money: 200, rel: { partner: -5 } }, log: '{partner}[은/는] "또?"라고만 했다.' }
      ]
    },
    {
      id: 'life_ya_proposal', age: [22, 45], once: true,
      cond: { rel: { partner: 'yes' }, flags: ['!married'] },
      text: '{partner}[과/와] 함께한 지 꽤 됐다. 반지를 살까 고민된다.',
      choices: [
        { text: '무릎을 꿇는다', check: { stat: 'happy', diff: 40 },
          success: { effects: { happy: 10, money: -2000, fx: ['marry'] }, log: '"응!" 주변 사람들이 박수를 쳤다. 결혼식은 {holiday} 다음 주로 정했다.' },
          fail: { effects: { happy: -8, rel: { partner: -6 } }, log: '"아직은… 잘 모르겠어." 반지는 서랍 속에 들어갔다.' } },
        { text: '아직 때가 아니다', effects: { happy: -1 }, log: '조금 더 서로를 알아 가기로 했다.' }
      ]
    },
    {
      id: 'life_ya_wedding_cost', age: [22, 50], once: true,
      cond: { flags: ['married'] },
      text: '결혼식 비용 견적서를 받았다. 숫자에 0이 하나 더 붙은 것 같다.',
      choices: [
        { text: '성대하게 한다', effects: { happy: 5, money: -12000, fame: 1, rel: { family: 4 } }, log: '{bro}의 축사가 너무 길어 하객 절반이 졸았다.' },
        { text: '작은 마당 결혼식', effects: { happy: 6, money: -2000, rel: { spouse: 5 } }, log: '{mother}[이/가] 만든 {food}[이/가] 최고의 피로연 음식이었다.' },
        { text: '혼인신고만 한다', effects: { happy: 2, money: 0, rel: { mother: -3 } }, log: '구청 앞에서 둘이 셀카를 찍었다. 그걸로 충분했다.' }
      ]
    },
    {
      id: 'life_ya_friend_wedding', age: [24, 38], cooldown: 3,
      cond: { rel: { friend: 'yes' } },
      text: '{friend}[이/가] 결혼한다며 축사를 부탁했다.',
      choices: [
        { text: '감동적인 축사를 준비한다', check: { stat: 'smarts', diff: 45 },
          success: { effects: { happy: 4, rel: { friend: 8 }, fame: 1 }, log: '신부 어머니까지 울렸다. 영상이 친척 단톡방에 퍼졌다.' },
          fail: { effects: { happy: -2, rel: { friend: 2 } }, log: '흑역사 폭로가 너무 셌다. 신부 측 표정이 굳었다.' } },
        { text: '축의금만 두둑이', effects: { money: -300, rel: { friend: 3 } }, log: '봉투에 진심을 담았다.' }
      ]
    },
    {
      id: 'life_ya_friend_drift', age: [24, 45], cooldown: 6,
      cond: { rel: { friend: 'yes' } },
      text: '{friend}에게서 마지막으로 연락 온 게 언제였더라. 단톡방이 몇 달째 조용하다.',
      choices: [
        { text: '먼저 전화를 건다', effects: { happy: 3, rel: { friend: 6 } }, log: '"야, 살아 있었냐!" 두 시간 동안 수다를 떨었다.' },
        { text: '그냥 둔다', effects: { happy: -2, fx: ['loseFriend'] }, log: '어느새 생일 축하 메시지만 주고받는 사이가 됐다.' }
      ]
    },
    {
      id: 'life_ya_friend_loan', age: [20, 55], cooldown: 8,
      cond: { rel: { friend: 'yes' }, money: [2000, 99999999] },
      text: '{friend}[이/가] 사업이 급하다며 돈을 빌려 달라고 한다. "딱 석 달만."',
      choices: [
        { text: '빌려준다', effects: { money: -2000, rel: { friend: 5 }, flags: ['lent_friend'] }, log: '{friend}[은/는] 몇 번이나 고맙다고 했다.', schedule: { id: 'life_ya_friend_loan_back', years: 3 } },
        { text: '정중히 거절한다', effects: { rel: { friend: -4 } }, log: '어색한 침묵이 흘렀다. 그래도 통장은 지켰다.' },
        { text: '조금만 보태 준다', effects: { money: -300, rel: { friend: 2 } }, log: '"갚지 않아도 돼." 마음 편한 선택이었다.' }
      ]
    },
    {
      id: 'life_ya_friend_loan_back', age: [23, 70], weight: 1, once: true,
      cond: { flags: ['lent_friend'] },
      text: '3년 전 돈을 빌려 간 친구 소식이 들려왔다.',
      choices: [
        { text: '연락해 본다', check: { stat: 'happy', diff: 45 },
          success: { effects: { money: 2600, happy: 6, unflags: ['lent_friend'] }, log: '사업이 잘 풀렸다며 이자까지 얹어 갚았다. 소고기도 샀다.' },
          fail: { effects: { happy: -6, fx: ['loseFriend'], unflags: ['lent_friend'] }, log: '번호가 바뀌어 있었다. 돈과 친구를 한꺼번에 잃었다.' } },
        { text: '잊기로 한다', effects: { grit: 2, happy: -1, unflags: ['lent_friend'] }, log: '수업료라 생각하기로 했다.' }
      ]
    },
    {
      id: 'life_ya_credit_card', age: [20, 35], once: true,
      text: '첫 신용카드가 나왔다. 반짝이는 플라스틱 한 장이 무한한 가능성처럼 보인다.',
      choices: [
        { text: '마음껏 긁는다', effects: { happy: 5, money: -3000, flags: ['card_debt'] }, log: '새 옷, 새 신발, 새 이어폰. 명세서는 다음 달의 내가 걱정하겠지.', schedule: { id: 'life_ya_debt_bill', years: 1 } },
        { text: '꼭 필요할 때만 쓴다', effects: { smarts: 2 }, log: '카드는 지갑 깊숙이 잠들었다.' }
      ]
    },
    {
      id: 'life_ya_debt_bill', age: [21, 40], weight: 1, once: true,
      cond: { flags: ['card_debt'] },
      text: '카드 명세서가 날아왔다. 이자가 이자를 낳고 있다.',
      choices: [
        { text: '투잡으로 갚는다', effects: { health: -4, grit: 4, money: -1500, unflags: ['card_debt'] }, log: '1년간 주말이 없었다. 마지막 할부를 갚던 날 혼자 케이크를 샀다.' },
        { text: '가족에게 도움을 청한다', effects: { money: -800, rel: { family: -2 }, happy: -2, unflags: ['card_debt'] }, log: '{bro}[이/가] 말없이 돈을 보내 줬다. 고맙고 부끄러웠다.' },
        { text: '돌려막기 한다', effects: { money: -3500, happy: -5 }, log: '빚의 늪이 더 깊어졌다. 결국 다 갚기까지 몇 년이 걸렸다.' }
      ]
    },
    {
      id: 'life_ya_travel', age: [20, 40], cooldown: 4,
      cond: { money: [3000, 99999999] },
      text: '통장에 여유가 생겼다. 비행기 표 특가 알림이 울린다.',
      choices: [
        { text: '배낭여행을 떠난다', effects: { happy: 7, smarts: 2, money: -2000, flags: ['traveler'] }, log: '낯선 도시의 골목에서 길을 잃고, 그 덕에 최고의 식당을 찾았다.' },
        { text: '{mother}[과/와] 함께 간다', effects: { happy: 5, money: -2500, rel: { mother: 10 } }, log: '{mother}[은/는] 비행기가 처음이라 이륙할 때 {name}의 손을 꼭 잡았다.' },
        { text: '참는다', effects: { money: 0, smarts: 1 }, log: '알림을 끄고 적금을 들었다.' }
      ]
    },
    {
      id: 'life_ya_lost_abroad', age: [18, 70], cooldown: 8,
      cond: { flags: ['traveler'] },
      text: '해외 여행 중 휴대폰 배터리가 꺼졌다. 숙소 이름도 기억나지 않는다.',
      choices: [
        { text: '현지인에게 손짓 발짓으로 묻는다', check: { stat: 'looks', diff: 40 },
          success: { effects: { happy: 5, fx: ['newFriend'] }, log: '한 가족이 숙소까지 데려다주고 저녁까지 먹여 줬다. 지금도 연락한다.' },
          fail: { effects: { happy: -4, money: -200 }, log: '택시 기사가 도시를 세 바퀴 돌았다.' } },
        { text: '기억을 더듬어 걷는다', check: { stat: 'smarts', diff: 50 },
          success: { effects: { smarts: 2, happy: 2 }, log: '시계탑을 기준으로 숙소를 찾아냈다. 탐험가의 피가 흐른다.' },
          fail: { effects: { health: -2, happy: -3 }, log: '새벽 두 시에야 겨우 도착했다. 발바닥이 불이 났다.' } }
      ]
    },
    {
      id: 'life_ya_roommate', age: [19, 30], once: true,
      cond: { flags: ['moved_out'] },
      text: '룸메이트가 냉장고에 넣어 둔 {food}[을/를] 또 먹었다. 세 번째다.',
      choices: [
        { text: '이름표를 붙인다', effects: { smarts: 1, happy: -1 }, log: '이름표 붙인 반찬통만 정확히 비어 있었다.' },
        { text: '대화로 푼다', effects: { happy: 2, fx: ['newFriend'] }, log: '알고 보니 굶고 다니고 있었다. 그날부터 같이 밥을 해 먹었다.' }
      ]
    },
    {
      id: 'life_ya_job_interview', age: [20, 35], cooldown: 3,
      cond: { career: 'none', flags: ['!jailed'] },
      text: '면접관이 묻는다. "본인의 단점은 무엇인가요?"',
      choices: [
        { text: '"너무 열심히 일하는 겁니다"', check: { stat: 'looks', diff: 50 },
          success: { effects: { happy: 3, smarts: 1 }, log: '면접관이 피식 웃었다. 분위기는 나쁘지 않았다.' },
          fail: { effects: { happy: -2 }, log: '면접관이 그 답을 오늘만 열두 번째 들었다고 했다.' } },
        { text: '솔직하게 말한다', effects: { grit: 2, smarts: 1 }, log: '진솔함이 통했는지 2차 면접 연락이 왔다.' }
      ]
    },
    {
      id: 'life_ya_burnout', age: [24, 45], cooldown: 4,
      cond: { career: 'any', stats: { happy: [0, 35] } },
      text: '아침마다 출근길 지하철에서 숨이 막힌다. {job} 일이 버겁다.',
      choices: [
        { text: '휴가를 낸다', effects: { happy: 6, health: 3, money: -400 }, log: '일주일간 휴대폰을 끄고 {hometown}에서 쉬었다.' },
        { text: '사표를 던진다', effects: { happy: 8, money: -1000, fx: ['quitJob'] }, log: '사직서를 낸 날, 하늘이 그렇게 넓은 줄 처음 알았다.' },
        { text: '그냥 버틴다', effects: { happy: -4, health: -3, grit: 3 }, log: '커피가 하루 다섯 잔으로 늘었다.' }
      ]
    },
    {
      id: 'life_ya_promotion_party', age: [25, 50], cooldown: 5,
      cond: { career: 'any', stats: { grit: [60, 100] } },
      text: '팀장이 {name}의 성실함을 칭찬하며 회식에서 건배사를 시킨다.',
      choices: [
        { text: '짧고 굵게', effects: { happy: 3, fame: 1 }, log: '"오늘도 내일도 한 팀!" 반응이 좋았다.' },
        { text: '술은 사양하고 음료로', effects: { health: 2, grit: 1 }, log: '아무도 개의치 않았다. 시대가 바뀌었다.' }
      ]
    },
    {
      id: 'life_ya_side_hustle', age: [20, 45], cooldown: 5,
      cond: { stats: { smarts: [45, 100] } },
      text: '주말에 {food2} 노점을 해 보자는 친구의 제안이 들어왔다.',
      choices: [
        { text: '해 본다', check: { stat: 'grit', diff: 50 },
          success: { effects: { money: 3000, happy: 4, grit: 2 }, log: '줄이 길게 늘어섰다. 동네 맛집 지도에 올랐다.' },
          fail: { effects: { money: -1200, happy: -3 }, log: '첫 주말에 비가 왔다. 둘째 주말에도.' } },
        { text: '사양한다', effects: { happy: 1 }, log: '주말엔 쉬는 게 남는 거다.' }
      ]
    },
    {
      id: 'life_ya_crypto', age: [20, 50], once: true,
      cond: { money: [2000, 99999999] },
      text: '동료가 이름도 처음 듣는 코인으로 열 배를 벌었다며 자랑한다.',
      choices: [
        { text: '전 재산의 절반을 넣는다', effects: { money: -1000, flags: ['crypto_in'] }, log: '매일 밤 차트를 보며 잠들었다.', schedule: { id: 'life_ya_crypto_result', years: 2 } },
        { text: '구경만 한다', effects: { smarts: 1 }, log: '동료의 자랑은 일주일 뒤 조용해졌다.' }
      ]
    },
    {
      id: 'life_ya_crypto_result', age: [22, 60], weight: 1, once: true,
      cond: { flags: ['crypto_in'] },
      text: '2년 전 산 코인의 가격을 확인할 시간이다. 손가락이 떨린다.',
      choices: [
        { text: '앱을 연다', check: { stat: 'happy', diff: 55 },
          success: { effects: { money: 9000, happy: 8, unflags: ['crypto_in'] }, log: '로켓이었다! 바로 팔고 {mother}에게 새 냉장고를 사 드렸다.' },
          fail: { effects: { happy: -6, fx: ['scam'], unflags: ['crypto_in'] }, log: '개발자가 잠적했다. 코인 이름이 검색조차 안 됐다.' } },
        { text: '아직 안 본다', effects: { happy: -1, unflags: ['crypto_in'] }, log: '슈뢰딩거의 코인. 열어 보지 않으면 아직 부자다.' }
      ]
    },
    {
      id: 'life_ya_reunion', age: [25, 40], once: true,
      text: '{hometown} 동창회 초대장이 왔다.',
      choices: [
        { text: '간다', effects: { happy: 4, fx: ['newFriend'] }, log: '반장은 그대로였고, 말썽쟁이는 선생님이 되어 있었다.' },
        { text: '안 간다', effects: { happy: -1 }, log: '단톡방에 올라온 사진을 보며 혼자 웃었다.' }
      ]
    },
    {
      id: 'life_ya_cooking', age: [20, 40], cooldown: 4,
      cond: { flags: ['moved_out'] },
      text: '혼자 {food}[을/를] 만들어 보기로 했다. {mother}의 맛이 기억난다.',
      choices: [
        { text: '전화로 레시피를 묻는다', effects: { happy: 3, rel: { mother: 5 } }, log: '"적당히 넣어." 적당히의 기준은 끝내 알 수 없었다.' },
        { text: '감으로 한다', check: { stat: 'smarts', diff: 45 },
          success: { effects: { happy: 4, health: 2 }, log: '첫 숟가락에 고향이 떠올랐다.' },
          fail: { effects: { happy: -2, health: -1 }, log: '연기 탐지기가 먼저 맛을 평가했다.' } }
      ]
    },
    {
      id: 'life_ya_baby', age: [24, 44], cooldown: 4,
      cond: { flags: ['married'], rel: { spouse: 'yes' } },
      text: '{spouse}[이/가] 조심스럽게 말을 꺼낸다. "우리… 아이 가질까?"',
      choices: [
        { text: '좋아!', effects: { happy: 6, money: -1000, fx: ['haveChild'] }, log: '새벽 세 시의 울음소리마저 음악처럼 들렸다. 거의.' },
        { text: '조금 더 생각해 보자', effects: { rel: { spouse: -2 } }, log: '대화는 다음으로 미뤄졌다.' }
      ]
    },
    {
      id: 'life_ya_wedding_ex', age: [25, 45], once: true,
      cond: { flags: ['dated'] },
      text: '옛 연인의 결혼 소식을 SNS에서 봤다.',
      choices: [
        { text: '"좋아요"를 누른다', effects: { grit: 2, happy: 1 }, log: '진심으로 행복하길 바랐다. 어른이 된 기분이었다.' },
        { text: '밤새 사진을 훑어본다', effects: { happy: -4 }, log: '새벽 3시, 3년 전 사진에 실수로 하트를 눌렀다.' }
      ]
    },
    {
      id: 'life_ya_gym', age: [20, 45], cooldown: 4,
      cond: { stats: { health: [0, 50] } },
      text: '계단 두 층에 숨이 찬다. 헬스장 1년 회원권 할인 전단지가 눈에 들어온다.',
      choices: [
        { text: '등록하고 꾸준히 간다', check: { stat: 'grit', diff: 50 },
          success: { effects: { health: 6, looks: 2, money: -400 }, log: '6개월 뒤, 계단을 뛰어 올라갔다.' },
          fail: { effects: { money: -400, happy: -2 }, log: '세 번 갔다. 기부 천사가 됐다.' } },
        { text: '공원 달리기부터', effects: { health: 3, grit: 1 }, log: '공짜인데 효과는 같았다.' }
      ]
    },
    {
      id: 'life_ya_mother_call', age: [20, 40], cooldown: 3,
      cond: { rel: { mother: 'alive' }, flags: ['moved_out'] },
      text: '{mother}에게서 부재중 전화 세 통. 별일은 아니고 그냥 목소리가 듣고 싶었단다.',
      choices: [
        { text: '한 시간 통화한다', effects: { happy: 3, rel: { mother: 6 } }, log: '동네 소식, {sis1} 소식, 옆집 개 소식까지 다 들었다.' },
        { text: '바빠서 문자만 보낸다', effects: { rel: { mother: -3 } }, log: '"그래, 밥 잘 챙겨 먹어." 짧은 답장이 조금 쓸쓸했다.' }
      ]
    },
    {
      id: 'life_ya_sibling_wedding', age: [14, 30], once: true,
      text: '{sis1}[이/가] 결혼한다! 가족 모두가 들떠 있다.',
      effects: { happy: 5, rel: { sis1: 5, family: 3 } },
      log: '피로연에서 {name}[이/가] 춤추는 영상이 가족 단톡방의 전설이 됐다.'
    },
    {
      id: 'life_ya_father_grave', age: [20, 60], cooldown: 6,
      cond: { flags: ['father_dead'] },
      text: '{father}의 기일이다. {fatherJob} 일을 하던 공원에 꽃이 피었다.',
      choices: [
        { text: '묘소에 꽃을 놓는다', effects: { happy: 2, grit: 2, rel: { family: 3 } }, log: '"아빠, 저 잘 지내요." 바람이 대답하듯 불었다.' },
        { text: '아빠가 가꾸던 화단에 물을 준다', effects: { happy: 3, rel: { mother: 3 } }, log: '{mother}[과/와] 나란히 서서 오래도록 꽃을 바라봤다.' }
      ]
    },
    {
      id: 'life_ya_housewarming', age: [25, 60], once: true,
      cond: { flags: ['homeowner'] },
      text: '내 집이다. 열쇠를 돌리는 손이 떨린다.',
      effects: { happy: 8, rel: { family: 5 } },
      log: '집들이 날, {mother}[이/가] 거실 한가운데 서서 "우리 막내가…" 하고 말을 잇지 못했다.'
    },
    {
      id: 'life_ya_house_buy', age: [27, 60], once: true,
      cond: { money: [60000, 99999999], flags: ['!homeowner'] },
      text: '오래 모은 돈이면 작은 집을 살 수 있을 것 같다. 부동산 사장님이 웃는다.',
      choices: [
        { text: '계약한다', effects: { fx: ['buyHouse'], happy: 4 }, log: '도장을 찍는 순간, {house}에서 자라던 날들이 스쳐 지나갔다.' },
        { text: '아직 전세로 버틴다', effects: { smarts: 1 }, log: '집값이 오를지 내릴지 아무도 몰랐다.' }
      ]
    },
    {
      id: 'life_ya_car', age: [20, 50], once: true,
      cond: { money: [12000, 99999999], flags: ['!car_owner'] },
      text: '중고차 매장. 판매원이 "사장님께만 특별히"를 다섯 번째 말하고 있다.',
      choices: [
        { text: '산다', effects: { fx: ['buyCar'], happy: 4 }, log: '첫 드라이브로 {hometown}까지 달렸다. 창문을 다 열고.' },
        { text: '대중교통이 최고다', effects: { health: 1, smarts: 1 }, log: '버스 안에서 책을 읽는 시간이 좋았다.' }
      ]
    },
    {
      id: 'life_ya_car_accident', age: [20, 80], cooldown: 8,
      cond: { flags: ['car_owner'] },
      text: '빗길에 앞차가 급정거했다!',
      choices: [
        { text: '브레이크를 밟는다', check: { stat: 'health', diff: 40 },
          success: { effects: { grit: 1 }, log: '간발의 차로 멈췄다. 한동안 심장이 쿵쾅거렸다.' },
          fail: { effects: { health: -6, money: -1500 }, log: '쿵. 목에 깁스를 했다. 보험사와 긴 통화를 했다.' } },
        { text: '핸들을 꺾는다', check: { stat: 'smarts', diff: 50 },
          success: { effects: { happy: 2 }, log: '영화처럼 피해 갔다. 블랙박스 영상이 꽤 멋있었다.' },
          fail: { effects: { health: -4, money: -2500 }, log: '가드레일에 긁혔다. 차는 정비소에서 2주를 보냈다.' } }
      ]
    },
    {
      id: 'life_ya_monk_retreat', age: [22, 70], once: true,
      cond: { stats: { happy: [0, 30] } },
      text: '모든 게 공허하다. 산속 수도원에서 일주일 체험 프로그램을 연다고 한다.',
      choices: [
        { text: '체험만 해 본다', effects: { happy: 6, health: 2, smarts: 1 }, log: '새벽 종소리에 눈을 떴다. 마음이 조금 고요해졌다.' },
        { text: '아예 출가한다', effects: { happy: 4, fx: ['becomeMonk'] }, log: '휴대폰을 반납했다. 가족들은 놀랐지만 {name}의 결심을 존중했다.' },
        { text: '가지 않는다', effects: { happy: -1 }, log: '대신 동네 산에 올랐다. 그것도 나쁘지 않았다.' }
      ]
    }
  ]);

  // ───────────────────────── Middle age (36–60) ─────────────────────────
  add([
    {
      id: 'life_mid_checkup', age: [36, 60], cooldown: 5,
      text: '건강검진 안내 문자가 왔다. 벌써 몇 년째 미루고 있다.',
      choices: [
        { text: '검진을 받는다', effects: { health: 3, money: -200, smarts: 1 }, log: '의사가 "운동 좀 하세요"라고 했다. 그 정도면 다행이었다.' },
        { text: '또 미룬다', effects: { flags: ['skipped_checkup'] }, log: '바쁘다는 핑계는 늘 있었다.', schedule: { id: 'life_mid_checkup_regret', years: 4 } }
      ]
    },
    {
      id: 'life_mid_checkup_regret', age: [40, 80], weight: 1, once: true,
      cond: { flags: ['skipped_checkup'] },
      text: '요즘 쉽게 피곤하고 체중이 이유 없이 줄었다. 결국 병원을 찾았다.',
      choices: [
        { text: '정밀 검사를 받는다', check: { stat: 'health', diff: 40 },
          success: { effects: { health: -2, money: -800, unflags: ['skipped_checkup'] }, log: '초기에 발견했다. 의사는 "조금만 늦었어도"라고 했다.' },
          fail: { effects: { health: -8, money: -3000, fx: ['getSick'], unflags: ['skipped_checkup'] }, log: '긴 치료가 시작됐다. 진작 올걸.' } },
        { text: '영양제로 버틴다', effects: { health: -6, fx: ['getSick'], unflags: ['skipped_checkup'] }, log: '증상은 점점 심해졌다.' }
      ]
    },
    {
      id: 'life_mid_chest_pain', age: [38, 75], cooldown: 8,
      cond: { stats: { health: [0, 60] } },
      text: '계단을 오르다 가슴이 조이는 느낌이 들었다. 잠시 쉬니 괜찮아졌다.',
      choices: [
        { text: '바로 병원에 간다', effects: { health: 4, money: -1200 }, log: '혈관이 좁아져 있었다. 시술 후 의사가 "잘 오셨다"고 했다.' },
        { text: '별일 아니겠지', effects: { flags: ['ignored_chest'] }, log: '그날 밤도 늦게까지 일했다.', schedule: { id: 'life_mid_chest_er', years: 2 } }
      ]
    },
    {
      id: 'life_mid_chest_er', age: [40, 80], weight: 1, once: true,
      cond: { flags: ['ignored_chest'] },
      text: '새벽, 가슴을 쥐어짜는 통증에 잠에서 깼다. 식은땀이 흐른다.',
      choices: [
        { text: '구급차를 부른다', check: { stat: 'health', diff: 35 },
          success: { effects: { health: -6, money: -4000, grit: 2, unflags: ['ignored_chest'] }, log: '응급 시술로 고비를 넘겼다. 병상에서 생활을 바꾸겠다고 다짐했다.' },
          fail: { effects: { health: -14, money: -6000, fx: ['getSick'], unflags: ['ignored_chest'] }, log: '중환자실에서 사흘을 보냈다. 2년 전의 그 계단이 떠올랐다.' } },
        { text: '가족을 깨운다', effects: { health: -8, money: -4000, rel: { family: 5 }, unflags: ['ignored_chest'] }, log: '가족이 밤새 병원 복도를 지켰다.' }
      ]
    },
    {
      id: 'life_mid_crisis', age: [40, 55], once: true,
      text: '거울 속 흰머리를 발견했다. 갑자기 인생이 이대로 끝나는 건가 싶다.',
      choices: [
        { text: '스포츠카를 지른다', req: { money: 30000 }, effects: { money: -30000, happy: 6, looks: 1, flags: ['car_owner'] }, log: '빨간 오픈카. 주차할 곳이 없다는 건 사고 나서 알았다.' },
        { text: '기타를 배운다', effects: { happy: 4, smarts: 2, money: -300 }, log: '1년 뒤, 세 곡을 완벽하게 칠 수 있게 됐다.' },
        { text: '마라톤에 도전한다', check: { stat: 'grit', diff: 55 },
          success: { effects: { health: 6, grit: 3, happy: 5, achieve: 'marathoner' }, log: '42.195km. 결승선에서 울었다.' },
          fail: { effects: { health: -3, happy: -2 }, log: '25km 지점에서 구급차를 탔다. 내년에 다시.' } }
      ]
    },
    {
      id: 'life_mid_investment_bubble', age: [35, 65], cooldown: 10,
      cond: { money: [10000, 99999999] },
      text: '뉴스마다 "{city} 땅값 폭등"이야기다. 친척이 "지금 아니면 늦는다"며 개발 예정지를 권한다.',
      choices: [
        { text: '크게 투자한다', effects: { money: -8000, flags: ['land_bet'] }, log: '지도 위 빈 땅에 동그라미를 쳤다.', schedule: { id: 'life_mid_bubble_pop', years: 3 } },
        { text: '안전한 적금이 최고', effects: { money: 300, smarts: 1 }, log: '이자는 쥐꼬리였지만 잠은 잘 잤다.' }
      ]
    },
    {
      id: 'life_mid_bubble_pop', age: [38, 80], weight: 1, once: true,
      cond: { flags: ['land_bet'] },
      text: '3년 전 투자한 땅의 개발 계획 발표가 났다.',
      choices: [
        { text: '결과를 확인한다', check: { stat: 'smarts', diff: 55 },
          success: { effects: { money: 22000, happy: 7, flags: ['rich_land'], unflags: ['land_bet'] }, log: '역이 들어선단다! 친척에게 {food2} 한 상을 거하게 샀다.' },
          fail: { effects: { money: -2000, happy: -7, unflags: ['land_bet'] }, log: '계획이 백지화됐다. 그 땅에는 지금도 염소만 산다.' } },
        { text: '그냥 팔아 버린다', effects: { money: 7000, unflags: ['land_bet'] }, log: '본전은 건졌다. 이 정도면 승리다.' }
      ]
    },
    {
      id: 'life_mid_child_school', age: [35, 55], cooldown: 4,
      cond: { rel: { children: 'yes' } },
      text: '{child}[이/가] 학교에서 상장을 받아 왔다.',
      effects: { happy: 5, rel: { children: 5 } },
      log: '냉장고에 붙였다. {mother}[이/가] 예전에 그랬던 것처럼.'
    },
    {
      id: 'life_mid_child_teen', age: [40, 60], cooldown: 4,
      cond: { rel: { children: 'yes' } },
      text: '사춘기가 된 {child}[이/가] 방문을 쾅 닫았다. 데자뷔다.',
      choices: [
        { text: '문 앞에 간식만 놓는다', effects: { happy: 1, rel: { children: 5 } }, log: '한 시간 뒤 빈 접시와 "고마워"라는 쪽지가 나왔다.' },
        { text: '문을 두드리며 잔소리', effects: { rel: { children: -5 }, happy: -2 }, log: '이어폰 볼륨이 더 커졌다.' }
      ]
    },
    {
      id: 'life_mid_child_football', age: [36, 60], once: true,
      cond: { rel: { children: 'yes' } },
      text: '{child}[이/가] 주말 동네 축구 경기에 와 달라고 한다.',
      choices: [
        { text: '목이 쉬도록 응원한다', effects: { happy: 6, rel: { children: 8 } }, log: '{child}[이/가] 골을 넣고 관중석을 향해 손가락을 뻗었다. {name}[을/를] 향해.' },
        { text: '일이 있어 못 간다', effects: { money: 300, rel: { children: -6 } }, log: '저녁 식탁에서 {child}[은/는] 경기 이야기를 하지 않았다.' }
      ]
    },
    {
      id: 'life_mid_parent_aging', age: [36, 65], cooldown: 5,
      cond: { rel: { mother: 'alive' } },
      text: '{mother}[이/가] 요즘 자꾸 같은 이야기를 반복한다. 걸음도 느려졌다.',
      choices: [
        { text: '함께 살자고 한다', effects: { happy: 2, money: -1500, rel: { mother: 10 } }, log: '{mother}[은/는] 손사래를 치다가 결국 짐을 쌌다.' },
        { text: '매주 찾아뵙는다', effects: { happy: 2, rel: { mother: 6 }, health: -1 }, log: '매주 일요일은 {mother}의 {food}[을/를] 먹는 날이 됐다.' },
        { text: '용돈을 넉넉히 보낸다', effects: { money: -2000, rel: { mother: 3 } }, log: '"돈보다 얼굴이 보고 싶다." 전화 너머 목소리가 작았다.' }
      ]
    },
    {
      id: 'life_mid_father_aging', age: [30, 65], cooldown: 6,
      cond: { rel: { father: 'alive' }, flags: ['father_sober'] },
      text: '맑은 정신으로 늙어 가는 {father}[이/가] 손주들에게 화단 가꾸는 법을 가르친다.',
      effects: { happy: 5, rel: { father: 6 } },
      log: '"그때 네가 내 손을 잡아 줘서 고맙다." {father}[이/가] 처음으로 그 이야기를 꺼냈다.'
    },
    {
      id: 'life_mid_mother_funeral', age: [1, 120], once: true, priority: true,
      cond: { recent: { mother_dead: 2 } },
      text: '{mother}[이/가] 떠난 뒤 첫 {holiday}. 식탁에 빈자리가 크다.',
      choices: [
        { text: '엄마의 {food}[을/를] 만들어 본다', effects: { happy: 2, grit: 2, rel: { siblings: 6 } }, log: '맛은 달랐지만, 형제들이 한 숟가락씩 뜨며 울고 웃었다.' },
        { text: '사진첩을 꺼낸다', effects: { happy: -2, smarts: 1, rel: { family: 4 } }, log: '사진 속 {mother}[은/는] 늘 웃고 있었다. 늘.' }
      ]
    },
    {
      id: 'life_mid_back_pain', age: [38, 70], cooldown: 5,
      text: '아침에 양말을 신다가 허리가 삐끗했다.',
      choices: [
        { text: '한의원/물리치료', effects: { health: 3, money: -300 }, log: '일주일 만에 다시 허리를 폈다.' },
        { text: '파스로 버틴다', effects: { health: -2, happy: -1 }, log: '파스 냄새가 사무실 전체에 퍼졌다.' }
      ]
    },
    {
      id: 'life_mid_smoker_cough', age: [30, 80], cooldown: 5,
      cond: { flags: ['smoker'] },
      text: '아침마다 기침이 멎지 않는다. 계단 한 층에도 숨이 가쁘다.',
      choices: [
        { text: '금연을 결심한다', check: { stat: 'grit', diff: 55 },
          success: { effects: { health: 6, happy: 2, unflags: ['smoker'], achieve: 'quit_smoking' }, log: '석 달째 금연 중. 음식 맛이 돌아왔다.' },
          fail: { effects: { health: -2, happy: -3 }, log: '사흘 만에 편의점 앞에 서 있었다.' } },
        { text: '한 대만 더', effects: { health: -4, flags: ['smoker_long'] }, log: '연기와 함께 걱정도 날려 보냈다. 적어도 그런 척했다.', schedule: { id: 'life_old_lung_scan', years: 6 } }
      ]
    },
    {
      id: 'life_mid_drinker_liver', age: [30, 80], cooldown: 5,
      cond: { flags: ['drinker'] },
      text: '검진표에 간 수치가 빨간 글씨로 찍혀 나왔다. 문득 {father}의 얼굴이 떠오른다.',
      choices: [
        { text: '술을 끊는다', check: { stat: 'grit', diff: 50 },
          success: { effects: { health: 6, happy: 2, unflags: ['drinker'] }, log: '모임에서는 탄산수를 들었다. 아침이 맑아졌다.' },
          fail: { effects: { health: -3, happy: -3 }, log: '"오늘만"이 계속 이어졌다. 도움이 필요하다는 걸 알았다.' } },
        { text: '상담 프로그램에 등록한다', effects: { health: 4, grit: 3, money: -400, unflags: ['drinker'], rel: { family: 4 } }, log: '모임에서 처음으로 "저는 도움이 필요합니다"라고 말했다. 부끄럽지 않았다.' }
      ]
    },
    {
      id: 'life_mid_spouse_anniv', age: [30, 80], cooldown: 5,
      cond: { flags: ['married'], rel: { spouse: 'yes' } },
      text: '결혼기념일이다. 그런데… 오늘이었나?',
      choices: [
        { text: '깜짝 저녁을 준비한다', effects: { happy: 5, money: -200, rel: { spouse: 8 } }, log: '{spouse}[이/가] 촛불 앞에서 눈시울을 붉혔다.' },
        { text: '까먹었다', effects: { rel: { spouse: -8 }, happy: -3 }, log: '{spouse}의 달력에는 빨간 동그라미가 세 개나 쳐져 있었다.' }
      ]
    },
    {
      id: 'life_mid_marriage_trouble', age: [30, 65], cooldown: 6,
      cond: { flags: ['married'], rel: { spouse: 'yes' }, stats: { happy: [0, 40] } },
      text: '{spouse}[과/와] 요즘 대화가 없다. 식탁에는 수저 소리만 들린다.',
      choices: [
        { text: '부부 상담을 받는다', effects: { money: -600, rel: { spouse: 8 }, happy: 3 }, log: '상담사 앞에서 처음으로 서로의 외로움을 이야기했다.' },
        { text: '이혼을 이야기한다', effects: { happy: -6, money: -5000, fx: ['divorce'] }, log: '서류에 도장을 찍는 날, 둘 다 "잘 살아"라고만 했다.' },
        { text: '그냥 지낸다', effects: { happy: -3, rel: { spouse: -4 } }, log: '침묵이 집 안의 가구처럼 자리 잡았다.' }
      ]
    },
    {
      id: 'life_mid_reunion_crush', age: [36, 60], once: true,
      cond: { flags: ['dated'] },
      text: '20년 만의 동창회. 첫사랑이 반갑게 손을 흔든다.',
      choices: [
        { text: '추억 이야기만 나눈다', effects: { happy: 4, smarts: 1 }, log: '그 시절 쪽지 이야기에 둘 다 웃음이 터졌다.' },
        { text: '연락처를 교환한다', check: { stat: 'looks', diff: 50 },
          success: { effects: { happy: 3, fx: ['newFriend'] }, log: '좋은 친구가 됐다. 딱 거기까지.' },
          fail: { effects: { happy: -2 }, log: '답장은 오지 않았다. 그게 맞았다.' } }
      ]
    },
    {
      id: 'life_mid_hobby_garden', age: [40, 75], once: true,
      text: '베란다에 작은 화분을 들였다. 문득 {father}[이/가] 가꾸던 꽃들이 생각난다.',
      effects: { happy: 4, health: 1 },
      log: '토마토 세 알을 수확했다. 세상에서 가장 비싼 토마토였다.'
    },
    {
      id: 'life_mid_layoff', age: [40, 60], cooldown: 8,
      cond: { career: 'any' },
      text: '회사에 구조조정 소문이 돈다. 인사팀이 면담을 하자고 한다.',
      choices: [
        { text: '희망퇴직을 받아들인다', effects: { money: 15000, happy: -3, fx: ['quitJob'] }, log: '퇴직금을 받고 처음으로 평일 낮의 공원을 걸었다.' },
        { text: '버틴다', check: { stat: 'grit', diff: 55 },
          success: { effects: { grit: 3, happy: 1 }, log: '살아남았다. 대신 업무가 두 배가 됐다.' },
          fail: { effects: { happy: -5, fx: ['fired'] }, log: '결국 짐 상자를 들고 나왔다.' } }
      ]
    },
    {
      id: 'life_mid_debt_collector', age: [25, 70], cooldown: 5,
      cond: { money: [-999999, 0] },
      text: '현관문에 빨간 독촉장이 붙어 있다. 전화벨이 무섭다.',
      choices: [
        { text: '채무 상담 센터에 간다', effects: { smarts: 2, happy: 1, money: 500 }, log: '상환 계획을 짜고 나니 밤에 잠이 왔다.' },
        { text: '가족에게 털어놓는다', effects: { money: 1000, rel: { family: -2 }, happy: 2 }, log: '{sis2}[이/가] "왜 이제 말해"라며 등을 때렸다.' },
        { text: '사채를 쓴다', effects: { money: 2000, happy: -4, flags: ['loan_shark'] }, log: '급한 불은 껐다. 더 큰 불이 남았다.', schedule: { id: 'life_mid_loan_shark', years: 2 } }
      ]
    },
    {
      id: 'life_mid_loan_shark', age: [27, 80], weight: 1, once: true,
      cond: { flags: ['loan_shark'] },
      text: '덩치 큰 남자 둘이 집 앞에 서 있다. 이자가 원금의 세 배가 됐단다.',
      choices: [
        { text: '경찰에 신고한다', effects: { happy: 2, money: -1000, unflags: ['loan_shark'] }, log: '불법 대부업 단속에 걸렸다. 원금만 갚고 끝났다.' },
        { text: '시키는 일을 해 준다', check: { stat: 'smarts', diff: 60 },
          success: { effects: { money: 0, happy: -4, unflags: ['loan_shark'] }, log: '아슬아슬하게 빠져나왔다. 다시는 그쪽 동네에 가지 않았다.' },
          fail: { effects: { fx: ['jail'], happy: -8, unflags: ['loan_shark'] }, log: '심부름 상자 안에 무엇이 들었는지 몰랐다. 법원은 사정을 봐주지 않았다.' } }
      ]
    },
    {
      id: 'life_mid_volunteer_coach', age: [36, 70], cooldown: 6,
      cond: { stats: { football: [40, 100] } },
      text: '동네 꼬마 축구팀 감독이 그만뒀다. 아이들이 {name}[을/를] 쳐다본다.',
      choices: [
        { text: '감독을 맡는다', effects: { happy: 6, fame: 1, health: 1 }, log: '0승 7패. 그래도 마지막 경기 후 아이들이 {name}[을/를] 헹가래 쳤다.' },
        { text: '시간이 없다', effects: { happy: -1 }, log: '주말마다 운동장을 지나며 마음이 쓰였다.' }
      ]
    },
    {
      id: 'life_mid_fame_recognized', age: [25, 90], cooldown: 4,
      cond: { stats: { fame: [60, 100] } },
      text: '{food} 가게에서 주인이 {name}[을/를] 알아보고 사진을 부탁한다.',
      choices: [
        { text: '웃으며 찍어 준다', effects: { happy: 3, fame: 1 }, log: '사진이 가게 벽에 걸렸다. 서비스 반찬이 평생 무료가 됐다.' },
        { text: '모자를 눌러쓴다', effects: { happy: -1 }, log: '"닮은 사람이네" 하는 소리가 들렸다.' }
      ]
    }
  ]);

  // ───────────────────────── Old age (61–110) ─────────────────────────
  add([
    {
      id: 'life_old_retire_party', age: [60, 70], once: true,
      cond: { career: 'any' },
      text: '{job} 일을 마치는 마지막 날. 동료들이 작은 파티를 열어 줬다.',
      choices: [
        { text: '정년퇴직한다', effects: { happy: 5, fx: ['quitJob'] }, log: '케이크에 "그동안 고생 많으셨습니다"라고 적혀 있었다.' },
        { text: '몇 년 더 일하겠다', effects: { money: 3000, health: -2 }, log: '"아직 쌩쌩하다고!" 다들 웃었다.' }
      ]
    },
    {
      id: 'life_old_grandchild', age: [55, 90], once: true,
      cond: { rel: { children: 'yes' } },
      text: '{child}[이/가] 갓난아기를 품에 안겨 준다. 손주가 생겼다.',
      effects: { happy: 10, rel: { children: 8 }, achieve: 'grandparent' },
      log: '아기가 손가락을 꽉 쥐었다. 세상에서 가장 힘센 악력이었다.'
    },
    {
      id: 'life_old_grandkid_visit', age: [60, 105], cooldown: 3,
      cond: { rel: { children: 'yes' } },
      text: '손주들이 놀러 와서 {name}의 옛날이야기를 졸라 댄다.',
      choices: [
        { text: '{hometown} 시절 이야기를 한다', effects: { happy: 5, rel: { children: 4 } }, log: '{house} 이야기에 손주들이 "진짜요?"를 연발했다.' },
        { text: '공차기를 가르친다', check: { stat: 'health', diff: 40 },
          success: { effects: { happy: 6, health: 1 }, log: '왼발 감각은 아직 살아 있었다. 손주가 "최고!"를 외쳤다.' },
          fail: { effects: { health: -3, happy: 2 }, log: '무릎에서 "뚝" 소리가 났다. 그래도 웃었다.' } }
      ]
    },
    {
      id: 'life_old_memoir', age: [62, 100], once: true,
      cond: { stats: { smarts: [40, 100] } },
      text: '평생의 이야기를 책으로 남겨 보면 어떨까.',
      choices: [
        { text: '회고록을 쓴다', check: { stat: 'smarts', diff: 55 },
          success: { effects: { fame: 5, happy: 6, money: 4000, achieve: 'memoir' }, log: '『{hometown}에서 온 아이』가 서점 매대에 깔렸다.' },
          fail: { effects: { happy: 3, money: -500 }, log: '자비 출판으로 50부를 찍었다. 가족들이 한 권씩 소중히 간직했다.' } },
        { text: '손주에게 구술한다', effects: { happy: 4, rel: { family: 5 } }, log: '녹음 파일이 가족의 보물이 됐다.' }
      ]
    },
    {
      id: 'life_old_illness', age: [65, 110], cooldown: 5,
      cond: { stats: { health: [0, 40] } },
      text: '요즘 몸이 예전 같지 않다. 의사가 정밀 검사를 권한다.',
      choices: [
        { text: '치료를 받는다', effects: { money: -3000, health: 4, fx: ['cure'] }, log: '긴 치료였지만 창밖 나무에 새잎이 돋을 무렵 퇴원했다.' },
        { text: '남은 시간을 즐긴다', effects: { happy: 6, health: -4 }, log: '병원 대신 {hometown} 바닷가를 걸었다.' }
      ]
    },
    {
      id: 'life_old_lung_scan', age: [36, 110], weight: 1, once: true,
      cond: { flags: ['smoker_long'] },
      text: '폐 사진에 그림자가 보인다며 의사가 표정을 굳혔다.',
      choices: [
        { text: '수술을 받는다', check: { stat: 'health', diff: 45 },
          success: { effects: { health: -4, money: -5000, unflags: ['smoker', 'smoker_long'] }, log: '수술은 성공했다. 퇴원하던 날 마지막 담뱃갑을 버렸다.' },
          fail: { effects: { health: -12, money: -6000, fx: ['getSick'], unflags: ['smoker_long'] }, log: '항암 치료가 시작됐다. 그 학교 뒤편의 한 개비가 떠올랐다.' } },
        { text: '가족에게 숨긴다', effects: { health: -8, fx: ['getSick'], rel: { family: -4 }, unflags: ['smoker_long'] }, log: '결국 다 알게 됐다. {sis1}[이/가] 화를 내며 울었다.' }
      ]
    },
    {
      id: 'life_old_reconcile_sibling', age: [55, 100], once: true,
      text: '오래전 사소한 일로 말을 끊은 {bro}. 그도 이제 백발이 됐다는 소식을 들었다.',
      choices: [
        { text: '먼저 찾아간다', effects: { happy: 7, rel: { bro: 15 } }, log: '현관문이 열리자 둘 다 아무 말 없이 서로를 안았다. 30년이 3초 만에 녹았다.' },
        { text: '편지를 쓴다', effects: { happy: 4, rel: { bro: 8 } }, log: '답장에는 어린 시절 테이프 운동화 사진이 들어 있었다.' },
        { text: '자존심을 지킨다', effects: { happy: -4 }, log: '전화기를 들었다 놓기를 몇 번이고 반복했다.' }
      ]
    },
    {
      id: 'life_old_widowed', age: [60, 110], once: true,
      cond: { flags: ['married'], rel: { spouse: 'yes' }, stats: { health: [0, 50] } },
      text: '{spouse}[이/가] 병상에서 {name}의 손을 잡고 젊은 시절 첫 데이트 이야기를 꺼낸다.',
      effects: { happy: -3, rel: { spouse: 10 }, grit: 2 },
      log: '둘은 그날 밤 오래도록 웃었다. 함께한 세월이 방 안을 가득 채웠다.'
    },
    {
      id: 'life_old_smartphone', age: [65, 100], once: true,
      text: '손주가 스마트폰 영상통화 하는 법을 알려 준다.',
      choices: [
        { text: '열심히 배운다', check: { stat: 'smarts', diff: 40 },
          success: { effects: { happy: 5, smarts: 2 }, log: '이제 매일 밤 손주 얼굴을 본다. 콧구멍 각도로.' },
          fail: { effects: { happy: 1 }, log: '실수로 동창회 단톡방에 셀카 30장을 보냈다. 반응은 뜨거웠다.' } },
        { text: '전화면 충분하다', effects: { happy: 1 }, log: '목소리만으로도 충분히 행복했다.' }
      ]
    },
    {
      id: 'life_old_park_chess', age: [62, 105], cooldown: 4,
      text: '공원 정자에서 동네 어르신들이 장기판을 벌였다.',
      choices: [
        { text: '도전한다', check: { stat: 'smarts', diff: 50 },
          success: { effects: { happy: 4, fx: ['newFriend'], fame: 1 }, log: '공원의 새 고수로 등극했다. 매일 도전자가 줄을 섰다.' },
          fail: { effects: { happy: 1 }, log: '훈수꾼이 더 많았다. 그래도 재밌었다.' } },
        { text: '훈수만 둔다', effects: { happy: 2, rel: { friend: 1 } }, log: '훈수는 장기보다 재밌다.' }
      ]
    },
    {
      id: 'life_old_hometown_return', age: [62, 100], once: true,
      text: '수십 년 만에 {hometown}[을/를] 찾았다. {house}[이/가] 있던 자리에는 새 건물이 섰다.',
      effects: { happy: 3, grit: 1, rel: { family: 3 } },
      log: '골목 끝 그 담벼락만은 그대로였다. 어릴 적 공을 차던 자국이 희미하게 남아 있었다.'
    },
    {
      id: 'life_old_will', age: [70, 110], once: true,
      cond: { money: [20000, 99999999] },
      text: '변호사가 유언장 작성을 권한다. 재산을 어떻게 남길까.',
      choices: [
        { text: '가족에게 고루', effects: { rel: { family: 6 }, happy: 2 }, log: '서류에 서명하고 나니 마음이 가벼워졌다.' },
        { text: '{hometown} 아이들 장학금으로', effects: { fame: 4, happy: 5, money: -10000, achieve: 'philanthropist' }, log: '"{name} 장학금"이 생겼다. 첫 수혜자는 낡은 운동화를 신은 아이였다.' }
      ]
    },
    {
      id: 'life_old_fall', age: [70, 110], cooldown: 4,
      cond: { stats: { health: [0, 55] } },
      text: '화장실 문턱에 걸려 넘어졌다.',
      choices: [
        { text: '도움을 청한다', effects: { health: -3, money: -500, rel: { family: 3 } }, log: '{child}[이/가] 바로 달려왔다. 손잡이를 설치했다.' },
        { text: '혼자 일어난다', check: { stat: 'grit', diff: 50 },
          success: { effects: { grit: 1 }, log: '"아직 멀쩡하다!" 아무도 못 봤다.' },
          fail: { effects: { health: -7, money: -1500 }, log: '골반에 금이 갔다. 두 달간 병원 신세를 졌다.' } }
      ]
    },
    {
      id: 'life_old_centenarian', age: [100, 110], once: true,
      text: '100번째 생일! 시장이 축하 화환을 보내왔고, 지역 방송국이 취재를 왔다.',
      choices: [
        { text: '장수 비결을 밝힌다', effects: { fame: 5, happy: 8, achieve: 'century' }, log: '"매일 {food} 먹고, 매일 걸었소. 그리고 원망은 금방 잊었지." 방송이 전국에 나갔다.' },
        { text: '"비결 같은 건 없소"', effects: { fame: 3, happy: 6, achieve: 'century' }, log: '그 무심한 한마디가 유행어가 됐다.' }
      ]
    },
    {
      id: 'life_old_last_friend', age: [80, 110], cooldown: 6,
      cond: { rel: { friend: 'yes' } },
      text: '{friend}[과/와] 공원 벤치에 나란히 앉았다. 둘 다 귀가 잘 안 들려 대화가 엉뚱하게 흐른다.',
      effects: { happy: 5, rel: { friend: 5 } },
      log: '무슨 이야기를 했는지는 몰라도, 해 질 녘까지 웃었다.'
    },
    {
      id: 'life_old_lonely', age: [70, 110], cooldown: 5,
      cond: { rel: { friend: 'no' }, stats: { happy: [0, 40] } },
      text: '하루 종일 아무와도 말하지 않았다. 텔레비전 소리만 집 안을 채운다.',
      choices: [
        { text: '경로당에 나가 본다', effects: { happy: 4, fx: ['newFriend'] }, log: '첫날부터 노래 교실 반장이 됐다.' },
        { text: '동물을 들인다', effects: { happy: 5, money: -200, fx: ['adoptPet'] }, log: '늙은 강아지를 입양했다. 둘은 산책 속도가 똑같았다.' }
      ]
    },
    {
      id: 'life_old_dementia_fear', age: [75, 110], cooldown: 6,
      cond: { stats: { smarts: [0, 45] } },
      text: '열쇠를 냉장고에서 찾았다. 이번 달만 세 번째다.',
      choices: [
        { text: '병원 검사를 받는다', effects: { health: 1, money: -300, smarts: 1 }, log: '"아직은 괜찮습니다. 퍼즐을 하세요." 퍼즐이 취미가 됐다.' },
        { text: '웃어넘긴다', effects: { happy: 2, smarts: -2 }, log: '냉장고는 열쇠를 시원하게 보관해 줬다.' }
      ]
    },
    {
      id: 'life_old_mother_memory', age: [61, 110], once: true,
      cond: { flags: ['mother_dead'] },
      text: '{food} 냄새가 골목에서 풍겨 온다. 순간 {mother}[이/가] 부엌에서 부르는 것만 같다.',
      effects: { happy: 2, grit: 1 },
      log: '그 자리에 오래 서 있었다. 나이가 들어도 엄마는 늘 엄마였다.'
    }
  ]);

  // ───────────────────────── Any age / emergent ─────────────────────────
  add([
    {
      id: 'life_any_lottery', age: [18, 110], cooldown: 6,
      text: '편의점에서 잔돈으로 복권 한 장을 샀다.',
      choices: [
        { text: '긁는다', check: { stat: 'happy', diff: 92, min: 0.004, max: 0.01 },
          success: { effects: { fx: ['lottery'], happy: 10, achieve: 'lottery' }, log: '숫자가 하나, 둘, 셋… 전부 맞았다! 편의점 사장님과 부둥켜안았다.' },
          fail: { effects: { money: -5, happy: -1 }, log: '꽝. 다음 주에 또 사겠지.' } },
        { text: '{mother}에게 선물한다', effects: { rel: { mother: 2 } }, log: '{mother}[은/는] 당첨되면 {house}에 새 지붕을 올리겠다고 했다. 꽝이었다.' }
      ]
    },
    {
      id: 'life_any_ufo', age: [8, 110], once: true,
      text: '밤하늘에 이상한 빛 세 개가 삼각형을 그리며 떠 있다. 소리도 없다.',
      choices: [
        { text: '영상을 찍어 올린다', check: { stat: 'looks', diff: 50 },
          success: { effects: { fame: 4, happy: 4 }, log: '조회수 300만! 다음 날 전문가가 "드론 쇼 리허설"이라고 해명했다.' },
          fail: { effects: { happy: -1 }, log: '흔들려서 아무것도 안 보였다. 댓글: "손떨림 외계인".' } },
        { text: '손을 흔들어 본다', effects: { happy: 3, smarts: -1 }, log: '빛 하나가 깜빡였다. 기분 탓이겠지. 아마도.' },
        { text: '커튼을 친다', effects: { happy: -1 }, log: '그날 밤 이상하게 꿈이 생생했다.' }
      ]
    },
    {
      id: 'life_any_viral', age: [13, 80], cooldown: 8,
      text: '버스 정류장에서 비둘기와 같은 박자로 고개를 까딱이는 {name}의 영상이 퍼졌다.',
      choices: [
        { text: '밈을 즐긴다', effects: { fame: 4, happy: 4 }, log: '비둘기 탈을 쓰고 후속 영상을 찍었다. 광고 문의가 왔다.' },
        { text: '삭제 요청을 한다', effects: { happy: -3, fame: 1 }, log: '삭제할수록 더 퍼졌다. 인터넷은 원래 그렇다.' }
      ]
    },
    {
      id: 'life_any_wallet', age: [7, 110], cooldown: 6,
      text: '길에서 두툼한 지갑을 주웠다. 현금이 꽤 들어 있다.',
      choices: [
        { text: '경찰서에 맡긴다', effects: { grit: 2, flags: ['returned_wallet'] }, log: '주인이 꼭 연락하겠다며 번호를 남겼다.', schedule: { id: 'life_any_wallet_reward', years: 1 } },
        { text: '현금만 챙긴다', check: { stat: 'smarts', diff: 55 },
          success: { effects: { money: 400, happy: -2 }, log: '아무도 몰랐다. 하지만 지갑 속 가족사진이 자꾸 떠올랐다.' },
          fail: { effects: { money: -300, happy: -5, fame: -1 }, log: 'CCTV에 다 찍혔다. 점유이탈물횡령죄로 벌금을 냈다.' } }
      ]
    },
    {
      id: 'life_any_wallet_reward', age: [8, 110], weight: 1, once: true,
      cond: { flags: ['returned_wallet'] },
      text: '1년 전 지갑을 돌려준 사람에게서 연락이 왔다.',
      effects: { money: 500, happy: 5, fx: ['newFriend'], unflags: ['returned_wallet'] },
      log: '알고 보니 작은 회사 사장님이었다. 사례금과 함께 평생의 인연이 생겼다.'
    },
    {
      id: 'life_any_wrong_number', age: [12, 110], once: true,
      text: '모르는 번호로 문자가 왔다. "할머니, 저 시험 붙었어요!" 잘못 보낸 것 같다.',
      choices: [
        { text: '"축하한다, 손주야" 답한다', effects: { happy: 4, flags: ['wrong_number_pal'] }, log: '사정을 알고 둘 다 빵 터졌다. 그 뒤로 명절마다 안부를 주고받는다.', schedule: { id: 'life_any_wrong_number_meet', years: 5 } },
        { text: '"잘못 보내셨어요"', effects: { smarts: 1 }, log: '"앗 죄송합니다!" 대화는 거기서 끝났다.' }
      ]
    },
    {
      id: 'life_any_wrong_number_meet', age: [17, 110], weight: 1, once: true,
      cond: { flags: ['wrong_number_pal'] },
      text: '5년째 문자 친구인 "가짜 손주"가 {city}에 온다며 만나자고 한다.',
      effects: { happy: 6, fx: ['newFriend'], unflags: ['wrong_number_pal'] },
      log: '{food}[을/를] 사 줬다. 진짜 할머니도 같이 나와서 셋이 사진을 찍었다.'
    },
    {
      id: 'life_any_fraud_offer', age: [18, 70], once: true, weight: 6,
      cond: { money: [-999999, 4000] },
      text: '"통장만 빌려주면 한 달에 2000 줄게." 낯선 메시지가 왔다.',
      choices: [
        { text: '응한다', effects: { money: 2000, flags: ['fraud_mule'] }, log: '돈이 들어왔다. 쉬웠다. 너무 쉬웠다.', schedule: { id: 'life_any_fraud_caught', years: 1 } },
        { text: '차단하고 신고한다', effects: { smarts: 2, grit: 1 }, log: '경찰서에서 "잘하셨다"는 말을 들었다.' }
      ]
    },
    {
      id: 'life_any_fraud_caught', age: [19, 75], weight: 1, once: true,
      cond: { flags: ['fraud_mule'] },
      text: '아침 일곱 시, 현관문을 두드리는 소리. "경찰입니다."',
      choices: [
        { text: '모든 걸 자백한다', check: { stat: 'grit', diff: 45 },
          success: { effects: { money: -3000, happy: -6, flags: ['criminal_record'], unflags: ['fraud_mule'] }, log: '수사에 협조해 집행유예로 끝났다. 전과 기록은 남았다.' },
          fail: { effects: { fx: ['jail'], happy: -8, unflags: ['fraud_mule'] }, log: '보이스피싱 조직의 계좌였다. 피해자가 수십 명이었다.' } },
        { text: '모른다고 버틴다', effects: { fx: ['jail'], happy: -10, unflags: ['fraud_mule'] }, log: '거래 내역이 모든 걸 말해 줬다.' }
      ]
    },
    {
      id: 'life_any_shoplift_adult', age: [16, 60], cooldown: 8,
      cond: { money: [-999999, 500] },
      text: '배가 고프다. 마트 진열대의 {food2}[이/가] 눈앞에 있다. 직원은 등을 돌리고 있다.',
      choices: [
        { text: '주머니에 넣는다', check: { stat: 'smarts', diff: 55 },
          success: { effects: { health: 1, happy: -2, flags: ['petty_thief'] }, log: '무사히 나왔다. 먹으면서 목이 메었다.' },
          fail: { effects: { happy: -6, money: -200, flags: ['petty_thief'] }, log: '출구에서 붙잡혔다. 사정을 들은 점장이 신고 대신 벌금으로 끝내 줬다.' } },
        { text: '무료 급식소를 찾는다', effects: { health: 2, grit: 2 }, log: '자원봉사자가 따뜻한 국을 두 그릇 퍼 줬다.' }
      ]
    },
    {
      id: 'life_any_repeat_thief', age: [16, 70], cooldown: 6,
      cond: { flags: ['petty_thief'], stats: { grit: [0, 50] } },
      text: '예전 그 짜릿함이 다시 생각난다. 이번엔 전자제품 매장이다.',
      choices: [
        { text: '한 번만 더', check: { stat: 'smarts', diff: 70 },
          success: { effects: { money: 600, happy: -1 }, log: '빠져나왔다. 하지만 운은 무한하지 않다.' },
          fail: { effects: { fx: ['jail'], happy: -8 }, log: '보안 게이트가 울렸다. 상습범으로 기록됐다.' } },
        { text: '이제 그만둔다', effects: { grit: 4, happy: 2, unflags: ['petty_thief'] }, log: '그날 처음으로 가게 앞을 그냥 지나쳤다.' }
      ]
    },
    {
      id: 'life_any_jail_life', age: [16, 100], cooldown: 2,
      cond: { flags: ['jailed'] },
      text: '교도소의 하루. 같은 방 수감자가 장기를 두자고 한다.',
      choices: [
        { text: '같이 둔다', effects: { happy: 2, smarts: 1, fx: ['newFriend'] }, log: '교도소에서 만난 친구는 의외로 의리가 있었다.' },
        { text: '검정고시 책을 편다', effects: { smarts: 4, grit: 2 }, log: '교도소 도서관 사서가 {name}[을/를] 눈여겨봤다.' },
        { text: '운동장을 달린다', effects: { health: 4, grit: 2 }, log: '매일 50바퀴. 몸만큼은 자유로웠다.' }
      ]
    },
    {
      id: 'life_any_jail_visit', age: [16, 100], cooldown: 3,
      cond: { flags: ['jailed'], rel: { mother: 'alive' } },
      text: '면회실 유리창 너머로 {mother}[이/가] 앉아 있다. 머리가 많이 하얘졌다.',
      effects: { happy: -3, grit: 3, rel: { mother: 5 } },
      log: '"밥은 잘 나오니?" 끝까지 그것만 물었다. 출소하면 꼭 갚겠다고 다짐했다.'
    },
    {
      id: 'life_any_ex_con', age: [18, 100], once: true,
      cond: { flags: ['ever_jailed', '!jailed'] },
      text: '출소 후 이력서의 빈칸을 어떻게 채워야 할지 막막하다.',
      choices: [
        { text: '솔직하게 쓴다', check: { stat: 'grit', diff: 50 },
          success: { effects: { happy: 5, grit: 3 }, log: '"두 번째 기회를 믿습니다." 한 공장 사장님이 손을 내밀었다.' },
          fail: { effects: { happy: -4 }, log: '서른 곳에서 연락이 없었다. 서른한 번째를 준비했다.' } },
        { text: '재활 프로그램에 참여한다', effects: { smarts: 2, happy: 3, fx: ['newFriend'] }, log: '같은 처지의 사람들과 서로의 등을 밀어 주었다.' }
      ]
    },
    {
      id: 'life_any_stray_dog_follow', age: [10, 100], once: true,
      cond: { flags: ['!has_pet'] },
      text: '산책길에 떠돌이 개 한 마리가 집까지 졸졸 따라왔다.',
      choices: [
        { text: '키운다', effects: { happy: 6, money: -300, fx: ['adoptPet'] }, log: '이름은 "{food}". 부르면 꼬리가 날개처럼 돌았다.' },
        { text: '보호소에 연락한다', effects: { happy: 1, smarts: 1 }, log: '일주일 뒤 좋은 가족에게 입양됐다는 사진이 왔다.' }
      ]
    },
    {
      id: 'life_any_power_outage_city', age: [6, 110], cooldown: 10,
      text: '{city} 전체가 정전됐다. 동네 사람들이 하나둘 밖으로 나온다.',
      effects: { happy: 3, fx: ['newFriend'] },
      log: '별이 쏟아졌다. 처음 인사한 이웃과 평상에 앉아 밤새 이야기했다.'
    },
    {
      id: 'life_any_tv_quiz', age: [15, 90], once: true,
      cond: { stats: { smarts: [65, 100] } },
      text: 'TV 퀴즈쇼 예심에 붙었다! 최종 문제 앞에 섰다.',
      choices: [
        { text: '정답을 외친다', check: { stat: 'smarts', diff: 70 },
          success: { effects: { money: 10000, fame: 4, happy: 7 }, log: '빵빠레가 울렸다! {country} 전역에 얼굴이 나갔다.' },
          fail: { effects: { fame: 2, happy: -2 }, log: '틀렸다. 그래도 "가장 유쾌한 참가자"로 뽑혔다.' } },
        { text: '중간 상금을 받고 포기', effects: { money: 2000, happy: 2 }, log: '현명한 선택이었다. 아마도.' }
      ]
    },
    {
      id: 'life_any_scam_call', age: [50, 110], cooldown: 6,
      text: '"고객님 계좌가 범죄에 연루됐습니다. 안전 계좌로 옮기세요." 다급한 목소리다.',
      choices: [
        { text: '시키는 대로 한다', check: { stat: 'smarts', diff: 55 },
          success: { effects: { smarts: 2 }, log: '송금 직전에 은행 직원이 이상한 낌새를 채고 막아 줬다.' },
          fail: { effects: { fx: ['scam'], happy: -6 }, log: '돈이 사라졌다. 너무 부끄러워 한동안 아무에게도 말하지 못했다.' } },
        { text: '끊고 가족에게 묻는다', effects: { smarts: 1, rel: { family: 2 } }, log: '"그거 사기야!" {child}[이/가] 아니라 {sis2}[이/가] 먼저 외쳤다.' }
      ]
    },
    {
      id: 'life_any_leader_handshake', age: [10, 100], once: true,
      text: '{leader}[이/가] {city} 시장을 방문했다. 우연히 바로 앞에 서게 됐다.',
      choices: [
        { text: '악수를 청한다', effects: { fame: 2, happy: 3 }, log: '사진이 지역 신문 1면에 실렸다. 정작 {name}[은/는] 눈을 감고 있었다.' },
        { text: '{food2} 한번 드셔 보시라고 권한다', effects: { fame: 3, happy: 4 }, log: '{leader}[이/가] 진짜로 먹었다. 그 가게는 다음 날부터 줄이 섰다.' }
      ]
    },
    {
      id: 'life_any_move_abroad', age: [20, 60], once: true,
      cond: { flags: ['!abroad'], stats: { happy: [0, 45] } },
      text: '해외 취업 박람회 전단지가 눈에 띈다. 완전히 새로운 곳에서 시작해 볼까?',
      choices: [
        { text: '떠난다', effects: { fx: ['moveAbroad'], happy: 4, money: -3000, flags: ['traveler'] }, log: '공항에서 가족들이 손을 흔들었다. {mother}[은/는] 끝내 울음을 참지 못했다.' },
        { text: '{country}에 남는다', effects: { rel: { family: 3 } }, log: '익숙한 것들의 소중함을 다시 느꼈다.' }
      ]
    },
    {
      id: 'life_any_abroad_homesick', age: [18, 90], cooldown: 4,
      cond: { flags: ['abroad'] },
      text: '타국의 슈퍼마켓에서 {food}[과/와] 비슷한 걸 발견했다. 가격표를 보고 눈을 의심했다.',
      choices: [
        { text: '그래도 산다', effects: { happy: 4, money: -60 }, log: '한 입 먹고 {hometown}의 골목이 떠올랐다.' },
        { text: '직접 만들어 본다', check: { stat: 'smarts', diff: 45 },
          success: { effects: { happy: 5, fx: ['newFriend'] }, log: '이웃들에게 나눠 줬더니 다음 주에 레시피를 물으러 왔다.' },
          fail: { effects: { happy: -2, flags: ['homesick'] }, log: '전혀 다른 음식이 됐다. 그날 밤 고향 생각이 더 났다.' } }
      ]
    },
    {
      id: 'life_any_homesick_cure', age: [14, 90], cooldown: 5,
      cond: { flags: ['homesick'] },
      text: '향수병이 깊어졌다. {holiday}인데 가족 사진만 들여다본다.',
      choices: [
        { text: '고향행 표를 끊는다', effects: { money: -1200, happy: 7, rel: { family: 6 }, unflags: ['homesick'] }, log: '{mother}[이/가] 버선발로 뛰어나왔다.' },
        { text: '영상통화로 함께한다', effects: { happy: 3, rel: { family: 3 } }, log: '화면 너머로 다 같이 {food}[을/를] 먹었다. 반은 위안이 됐다.' }
      ]
    },
    {
      id: 'life_any_hospital_roommate', age: [20, 110], cooldown: 6,
      cond: { stats: { health: [0, 35] } },
      text: '입원한 병실의 옆 침대 환자가 매일 아침 썰렁한 농담을 한다.',
      effects: { happy: 4, health: 2, fx: ['newFriend'] },
      log: '퇴원하는 날 둘은 번호를 교환했다. 농담은 끝까지 썰렁했다.'
    },
    {
      id: 'life_any_sick_rest', age: [5, 110], cooldown: 4,
      cond: { stats: { health: [0, 30] } },
      text: '몸살이 심하게 왔다. 온몸이 쑤시고 열이 난다.',
      choices: [
        { text: '푹 쉰다', effects: { health: 5, money: -100 }, log: '사흘을 내리 잤다. 깨어나니 세상이 조금 밝아 보였다.' },
        { text: '참고 할 일을 한다', effects: { health: -4, grit: 2 }, log: '결국 일주일을 더 앓았다.' }
      ]
    },
    {
      id: 'life_any_rich_charity', age: [25, 110], cooldown: 6,
      cond: { money: [100000, 99999999] },
      text: '{hometown}의 낡은 동네 운동장이 철거 위기라는 소식을 들었다.',
      choices: [
        { text: '보수 비용을 기부한다', effects: { money: -20000, fame: 4, happy: 6, rel: { family: 3 } }, log: '새 잔디가 깔린 운동장에서 아이들이 공을 찼다. 벤치에 {father}의 이름을 새겼다.' },
        { text: '모른 척한다', effects: { happy: -2 }, log: '그 운동장에는 주차장이 들어섰다.' }
      ]
    },
    {
      id: 'life_any_rich_friends', age: [25, 90], cooldown: 6,
      cond: { money: [80000, 99999999] },
      text: '갑자기 연락 없던 친척과 동창들이 줄줄이 안부를 묻는다.',
      choices: [
        { text: '선을 긋는다', effects: { smarts: 2, happy: 1 }, log: '진짜 친구가 누군지 알게 됐다.' },
        { text: '다 도와준다', effects: { money: -8000, happy: 2, rel: { family: 4 } }, log: '감사 인사는 많았지만 갚겠다는 사람은 없었다.' }
      ]
    },
    {
      id: 'life_any_marathon_charity', age: [16, 70], cooldown: 7,
      cond: { stats: { health: [60, 100] } },
      text: '자선 마라톤에 {holiday2} 분장을 하고 참가하자는 제안이 왔다.',
      effects: { health: 2, fame: 1, happy: 4 },
      log: '분장 탓에 결승선 사진이 지역 신문 웃음 코너에 실렸다. 모금액은 기록을 깼다.'
    },
    {
      id: 'life_any_rainbow_proposal', age: [20, 60], once: true,
      cond: { rel: { partner: 'yes' }, flags: ['!married'], stats: { fame: [40, 100] } },
      text: '팬들이 {partner}에게 공개 프러포즈를 하라며 SNS에서 난리다.',
      choices: [
        { text: '조용히 둘만의 자리에서', effects: { happy: 6, rel: { partner: 8 } }, log: '{partner}[은/는] 사람들 앞이 아니라서 더 좋았다고 했다.' },
        { text: '전광판 프러포즈', check: { stat: 'looks', diff: 55 },
          success: { effects: { fx: ['marry'], fame: 3, happy: 8 }, log: '"응!" 수천 명이 환호했다.' },
          fail: { effects: { fame: 2, happy: -5, rel: { partner: -6 } }, log: '{partner}[은/는] 당황해서 도망쳤다. 영상이 영원히 박제됐다.' } }
      ]
    },
    {
      id: 'life_any_neighbor_noise', age: [18, 100], cooldown: 6,
      text: '윗집에서 매일 밤 11시마다 쿵쿵 소리가 난다.',
      choices: [
        { text: '정중한 쪽지를 붙인다', effects: { happy: 2 }, log: '다음 날 귤 한 봉지와 사과 쪽지가 문 앞에 있었다.' },
        { text: '올라가서 따진다', check: { stat: 'grit', diff: 45 },
          success: { effects: { happy: 3 }, log: '알고 보니 홈트 중이었다. 같이 운동하는 사이가 됐다.' },
          fail: { effects: { happy: -4 }, log: '언성이 높아졌다. 엘리베이터가 세상에서 가장 어색한 공간이 됐다.' } }
      ]
    },
    {
      id: 'life_any_good_samaritan', age: [12, 90], cooldown: 8,
      cond: { stats: { health: [40, 100] } },
      text: '눈앞에서 노인이 쓰러졌다. 주변 사람들은 머뭇거린다.',
      choices: [
        { text: '심폐소생술을 한다', check: { stat: 'smarts', diff: 45 },
          success: { effects: { fame: 3, happy: 7, grit: 2, achieve: 'lifesaver' }, log: '구급대원이 "덕분에 사셨다"고 했다. 지역 뉴스에 나왔다.' },
          fail: { effects: { happy: -2, grit: 2 }, log: '순서가 기억나지 않았다. 다행히 곧 구급차가 왔다. 다음 날 응급처치 교육을 신청했다.' } },
        { text: '119에 신고하고 곁을 지킨다', effects: { happy: 3, grit: 1 }, log: '할아버지가 정신을 차리고 {name}의 손을 꼭 잡았다.' }
      ]
    },
    {
      id: 'life_any_fortune_teller', age: [15, 90], once: true,
      text: '시장 골목 점쟁이가 {name}[을/를] 불러 세운다. "자네 관상이 범상치 않아."',
      choices: [
        { text: '복채를 낸다', effects: { money: -30, happy: 3, flags: ['fortune_told'] }, log: '"몇 해 안에 큰 귀인을 만난다." 반신반의했다.', schedule: { id: 'life_any_fortune_true', years: 3 } },
        { text: '그냥 지나간다', effects: { smarts: 1 }, log: '"후회할 거야!" 뒤에서 외치는 소리가 들렸다.' }
      ]
    },
    {
      id: 'life_any_fortune_true', age: [17, 95], weight: 1, once: true,
      cond: { flags: ['fortune_told'] },
      text: '3년 전 점쟁이의 말이 떠올랐다. 오늘 버스에서 옆자리 사람이 말을 건다.',
      choices: [
        { text: '대화를 나눈다', check: { stat: 'looks', diff: 40 },
          success: { effects: { happy: 6, fx: ['newFriend'], money: 500, unflags: ['fortune_told'] }, log: '정말 귀인이었다! 좋은 일자리를 소개받았다.' },
          fail: { effects: { happy: -1, unflags: ['fortune_told'] }, log: '다단계 영업이었다. 점쟁이에게 따지러 갔지만 가게는 사라졌다.' } },
        { text: '이어폰을 낀다', effects: { unflags: ['fortune_told'] }, log: '귀인이었을지도 모를 사람은 다음 정류장에서 내렸다.' }
      ]
    },
    {
      id: 'life_any_time_capsule', age: [10, 14], once: true,
      text: '반 친구들과 학교 뒷산에 타임캡슐을 묻었다. 20년 뒤에 열기로 했다.',
      choices: [
        { text: '미래의 나에게 편지를 쓴다', effects: { happy: 3, smarts: 1, flags: ['time_capsule'] }, log: '"미래의 나, 꿈은 이뤘니?"', schedule: { id: 'life_any_time_capsule_open', years: 20 } },
        { text: '아끼는 구슬을 넣는다', effects: { happy: 2, flags: ['time_capsule'] }, log: '가장 반짝이는 구슬을 골랐다.', schedule: { id: 'life_any_time_capsule_open', years: 20 } }
      ]
    },
    {
      id: 'life_any_time_capsule_open', age: [28, 40], weight: 1, once: true,
      cond: { flags: ['time_capsule'] },
      text: '20년 만에 뒷산에 모였다. 녹슨 통 안에 어린 날의 {name}[이/가] 들어 있다.',
      effects: { happy: 6, fx: ['newFriend'], unflags: ['time_capsule'] },
      log: '삐뚤빼뚤한 글씨를 읽다 모두 말이 없어졌다. 그리고 한꺼번에 웃음이 터졌다.'
    },
    {
      id: 'life_any_sibling_debt', age: [20, 60], once: true,
      cond: { money: [3000, 99999999] },
      text: '{bro}[이/가] 가게를 열고 싶다며 조심스럽게 투자를 부탁한다.',
      choices: [
        { text: '투자한다', effects: { money: -3000, rel: { bro: 8 }, flags: ['bro_shop'] }, log: '{bro}[은/는] 간판에 {name}의 이름 한 글자를 넣겠다고 했다.', schedule: { id: 'life_any_sibling_shop', years: 3 } },
        { text: '어렵다고 말한다', effects: { rel: { bro: -5 } }, log: '{bro}[은/는] "이해해"라고 했지만 한동안 연락이 뜸했다.' }
      ]
    },
    {
      id: 'life_any_sibling_shop', age: [23, 70], weight: 1, once: true,
      cond: { flags: ['bro_shop'] },
      text: '{bro}의 가게가 문을 연 지 3년이 됐다.',
      choices: [
        { text: '가게에 들러 본다', check: { stat: 'happy', diff: 45 },
          success: { effects: { money: 5000, happy: 6, rel: { bro: 8 }, unflags: ['bro_shop'] }, log: '가게 앞에 줄이 서 있었다. {bro}[이/가] 수익금을 봉투에 담아 내밀었다.' },
          fail: { effects: { happy: -3, rel: { bro: 4 }, unflags: ['bro_shop'] }, log: '폐업 안내문이 붙어 있었다. {bro}[은/는] 미안해했지만, 같이 소주잔을 기울이며 다시 시작하자고 했다.' } },
        { text: '돈 얘기는 꺼내지 않는다', effects: { rel: { bro: 6 }, unflags: ['bro_shop'] }, log: '형제 사이에 돈보다 중요한 게 있었다.' }
      ]
    },
    {
      id: 'life_any_promise_mother_house', age: [18, 60], once: true,
      cond: { rel: { mother: 'alive' }, money: [50000, 99999999] },
      text: '어릴 적 {house}에서 했던 다짐이 떠오른다. "엄마, 내가 커서 집 사 줄게."',
      choices: [
        { text: '약속을 지킨다', effects: { money: -40000, happy: 10, rel: { mother: 15 }, achieve: 'house_for_mom' }, log: '{mother}[은/는] 새집 현관에서 신발도 못 벗고 한참을 울었다.' },
        { text: '아직은 이르다', effects: { rel: { mother: 1 } }, log: '"엄마는 지금도 충분해." 그 말이 더 마음에 걸렸다.' }
      ]
    },
    {
      id: 'life_any_jealous_ex', age: [20, 50], once: true,
      cond: { flags: ['married'], stats: { looks: [70, 100] } },
      text: '옛 연인이 결혼한 걸 알면서도 자꾸 연락을 해 온다.',
      choices: [
        { text: '{spouse}에게 바로 말한다', effects: { rel: { spouse: 6 }, happy: 2 }, log: '{spouse}[은/는] "말해 줘서 고마워"라며 손을 잡았다.' },
        { text: '몰래 만나 본다', check: { stat: 'smarts', diff: 75 },
          success: { effects: { happy: -2, grit: -1 }, log: '아무 일도 없었다. 하지만 마음 한구석이 무거웠다.' },
          fail: { effects: { happy: -8, fx: ['divorce'], money: -6000 }, log: '들켰다. 신뢰는 한순간에 무너졌다.' } }
      ]
    },
    {
      id: 'life_any_ice_cream_truck', age: [5, 10], cooldown: 3,
      cond: { money: [-999999, 1500] },
      text: '아이스크림 트럭 음악이 골목에 울린다. 주머니엔 동전 하나.',
      choices: [
        { text: '{sis2}[과/와] 반씩 나눈다', effects: { happy: 3, rel: { sis2: 5 } }, log: '반으로 나눈 아이스크림이 한 통보다 맛있었다.' },
        { text: '혼자 다 먹는다', effects: { happy: 2, rel: { sis2: -2 } }, log: '{sis2}의 원망 어린 눈빛이 아이스크림보다 차가웠다.' }
      ]
    },
    {
      id: 'life_any_marathon_tv', age: [5, 18], cooldown: 4,
      cond: { stats: { football: [50, 100] } },
      text: '{league} 결승전이 TV에서 한다. 동네 아이들이 {name}네 작은 TV 앞에 모였다.',
      effects: { happy: 4, football: 1, rel: { siblings: 2 } },
      log: '골이 들어갈 때마다 거실 바닥이 들썩였다. 아랫집에서 올라왔다.'
    },
    {
      id: 'life_any_monk_return', age: [25, 100], cooldown: 6,
      cond: { flags: ['monk'] },
      text: '수행 중인 산사에 {mother}[이/가] 반찬 보따리를 들고 찾아왔다.',
      choices: [
        { text: '수행을 이어 간다', effects: { happy: 3, grit: 2, rel: { mother: 3 } }, log: '{mother}[은/는] 평온해진 얼굴을 보고 안심하며 돌아갔다.' },
        { text: '속세로 돌아간다', effects: { happy: 4, rel: { mother: 8 }, fx: ['leaveMonastery'] }, log: '산문을 나서며 깊게 숨을 쉬었다. 세상의 소음이 반가웠다.' }
      ]
    },
    {
      id: 'life_any_lost_luggage', age: [18, 90], cooldown: 8,
      cond: { flags: ['traveler'] },
      text: '공항 수하물 벨트가 멈췄다. {name}의 가방만 안 나왔다.',
      choices: [
        { text: '분실 신고를 한다', check: { stat: 'happy', diff: 40 },
          success: { effects: { happy: 2 }, log: '사흘 뒤 가방이 세계 일주를 마치고 돌아왔다. 스티커가 세 장 늘었다.' },
          fail: { effects: { money: -600, happy: -3 }, log: '가방은 끝내 돌아오지 않았다. 어딘가에서 누군가 내 옷을 입고 있겠지.' } },
        { text: '현지에서 다 새로 산다', effects: { money: -800, happy: 3, looks: 1 }, log: '덕분에 현지 스타일로 변신했다.' }
      ]
    },
    {
      id: 'life_any_fame_scandal', age: [18, 80], cooldown: 7,
      cond: { stats: { fame: [50, 100] } },
      text: '인터넷에 {name}에 대한 가짜 루머가 퍼지고 있다.',
      choices: [
        { text: '법적 대응한다', effects: { money: -2000, happy: 2, fame: 1 }, log: '악플러들이 줄줄이 사과문을 올렸다.' },
        { text: '유머로 받아친다', check: { stat: 'smarts', diff: 50 },
          success: { effects: { fame: 3, happy: 4 }, log: '센스 있는 해명 영상이 루머보다 더 퍼졌다.' },
          fail: { effects: { fame: -3, happy: -4 }, log: '농담이 오해를 샀다. 기사가 하나 더 났다.' } },
        { text: '무시한다', effects: { happy: -2 }, log: '시간이 지나자 사람들은 다른 이야기로 넘어갔다.' }
      ]
    },
    {
      id: 'life_any_sister_advice', age: [16, 40], cooldown: 6,
      cond: { stats: { happy: [0, 40] } },
      text: '{sis1}[이/가] 기분 전환하자며 {food2} 맛집으로 끌고 갔다.',
      effects: { happy: 5, rel: { sis1: 5 } },
      log: '"넌 어릴 때부터 혼자 끙끙 앓더라." {sis1}의 잔소리가 이상하게 위로가 됐다.'
    },
    {
      id: 'life_any_gambling', age: [19, 80], cooldown: 6,
      cond: { money: [1000, 99999999] },
      text: '친구가 "확실한 정보"라며 경마장에 같이 가자고 한다.',
      choices: [
        { text: '크게 건다', check: { stat: 'happy', diff: 70 },
          success: { effects: { money: 3000, happy: 5, flags: ['gambler'] }, log: '7번 말이 기적처럼 들어왔다. 그게 함정이었다.' },
          fail: { effects: { money: -1500, happy: -5, flags: ['gambler'] }, log: '"확실한 정보"는 꼴찌로 들어왔다.' } },
        { text: '구경만 한다', effects: { happy: 2 }, log: '핫도그가 제일 맛있었다.' }
      ]
    },
    {
      id: 'life_any_gambler_spiral', age: [20, 90], cooldown: 4,
      cond: { flags: ['gambler'] },
      text: '"이번엔 진짜 딴다." 손가락이 또 베팅 앱을 열었다.',
      choices: [
        { text: '도박 상담 전화를 건다', effects: { grit: 4, happy: 2, unflags: ['gambler'] }, log: '앱을 지우고 통장을 가족에게 맡겼다. 첫걸음이었다.' },
        { text: '한 번만 더', check: { stat: 'happy', diff: 75 },
          success: { effects: { money: 1500 }, log: '땄다. 그래서 더 위험해졌다.' },
          fail: { effects: { money: -4000, happy: -6, rel: { family: -4 } }, log: '전세 보증금까지 손댔다. 가족의 얼굴을 볼 수 없었다.' } }
      ]
    },
    {
      id: 'life_any_school_crush_letter', age: [9, 12], once: true,
      cond: { stats: { looks: [60, 100] } },
      text: '책상 서랍에 하트 스티커가 붙은 편지가 들어 있다. 보낸 사람은 비밀.',
      effects: { happy: 4, looks: 1 },
      log: '범인을 찾느라 한 달 내내 반 아이들의 글씨체를 분석했다. 끝내 못 찾았다.'
    },
    {
      id: 'life_any_father_illness_visit', age: [15, 40], once: true,
      cond: { rel: { father: 'alive' }, flags: ['father_drinking'] },
      text: '{father}[이/가] 병원에 입원했다. 의사는 간이 많이 상했다고 조용히 말했다.',
      choices: [
        { text: '병실을 지킨다', effects: { happy: -3, grit: 3, rel: { father: 10 }, fx: ['fatherSeekHelp'] }, log: '{father}[은/는] 창밖을 보며 "네가 자라는 걸 더 보고 싶다"고 했다. 둘 다 울었다.' },
        { text: '치료비를 보탠다', effects: { money: -2000, rel: { father: 6, mother: 5 } }, log: '{mother}[이/가] 봉투를 받고 아무 말 없이 {name}의 손을 쥐었다.' }
      ]
    },
    {
      id: 'life_any_siblings_reunion', age: [30, 90], cooldown: 7,
      text: '{siblings}[과/와] 오랜만에 한자리에 모였다. 다들 흰머리가 늘었다.',
      effects: { happy: 6, rel: { siblings: 6 } },
      log: '{house} 시절 이불 쟁탈전 이야기에 {siblingsAll} 다 눈물이 나도록 웃었다.'
    }
  ]);
})(typeof globalThis !== 'undefined' ? globalThis : this);
