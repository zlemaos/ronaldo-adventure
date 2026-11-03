/* Canon milestones (the Ronaldo template, localized via tokens) and the football route.
 * Canon events require the flag '!heir' so later generations get their own story. */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};
  var EV = RA.data.events = RA.data.events || [];
  function dad(s) { return RA.Engine.person(s, 'father'); }

  EV.push(
    // ---------------------------------------------------------------- canon: early childhood

    // ---------------------------------------------------------------- canon: the father's illness arc
    { id: 'canon_father_talk', age: [10, 45], cooldown: 3, weight: 16, cond: { flags: ['!heir', 'father_drinking', '!father_sober'], rel: { father: 'alive' } },
      text: '{father}[은/는] 오늘도 방 한쪽에서 혼자 술잔을 들고 있었다. 지쳐 보이는 얼굴이다.',
      choices: [
        { text: '치료를 받아 보자고 진지하게 말한다', check: { stat: 'grit', diff: 35 },
          success: { effects: { rel: { father: 4 }, fx: ['fatherSeekHelp'] }, log: '{father}[은/는] 한참을 침묵하다 "…병원에 한번 가 보마"라고 했다.' },
          fail: { effects: { rel: { father: -2 }, happy: -3 }, log: '{father}[은/는] 창밖만 바라봤다. 오늘은 아닌가 보다. 그래도 포기하지 않기로 했다.' } },
        { text: '함께 도움받을 방법을 찾아보자고 한다', effects: { rel: { family: 3 }, fx: ['fatherSeekHelp'] }, log: '식탁에 마주 앉아 이야기를 나눴다. 말하다 눈물이 났다.' },
        { text: '아무 말 없이 곁에 앉아 있는다', effects: { rel: { father: 7 } }, log: '{father}[이/가] 잔을 내려놓고 내 안부를 물었다.' }
      ] },
    { id: 'canon_father_clinic', age: [16, 45], cooldown: 4, weight: 12, cond: { flags: ['!heir', 'father_drinking', '!father_sober'], rel: { father: 'alive' }, money: [1500, 1e12] },
      text: '알코올 의존증 전문 클리닉 이야기를 들었다. 치료비가 만만치 않다.',
      choices: [
        { text: '모아 둔 돈으로 치료비를 낸다', effects: { money: -1500, rel: { father: 8 }, fx: ['fatherSeekHelp', 'fatherSeekHelp'] }, log: '{father}[은/는] 입원 서류에 서명하며 "미안하다, 고맙다"를 반복했다.' },
        { text: '아직은 때가 아니다', effects: { happy: -2 }, log: '클리닉 전단지를 지갑 속에 접어 넣었다.' }
      ] },
    { id: 'canon_father_relapse', age: [10, 50], cooldown: 5, weight: 8, cond: { flags: ['!heir', 'father_drinking', '!father_sober'], rel: { father: 'alive' } },
      when: function (s) { var d = dad(s); return d && d.recovery >= 25; },
      text: '몇 달을 잘 버티던 {father}[이/가] 다시 술을 마셨다. 다음 날 아침, 고개를 들지 못한다.',
      choices: [
        { text: '"괜찮아요, 다시 하면 돼요"라고 말한다', check: { stat: 'social', diff: 40 },
          success: { effects: { rel: { father: 6 }, fx: ['fatherSeekHelp'] }, log: '회복은 직선이 아니다. {father}[은/는] 다시 모임에 나가기로 했다.' },
          fail: { effects: { rel: { father: -2 }, happy: -2, fx: ['fatherRelapse'] }, log: '"위로하지 마라. 더 비참하다." 그 주 내내 {father}[은/는] 모임에 나가지 않았다.' } },
        { text: '실망을 감추지 못한다', effects: { rel: { father: -4 }, happy: -3, fx: ['fatherRelapse'] }, log: '문이 닫히는 소리가 유난히 크게 들렸다.' }
      ] },
    { id: 'canon_father_hospital', manual: true, age: [1, 120], cond: { rel: { father: 'alive' } },
      text: '{father}[이/가] 간 질환으로 병원에 입원했다. 의사는 "지금부터의 치료와 금주가 정말 중요하다"고 말했다.',
      choices: [
        { text: '최고의 치료를 받게 한다', req: { money: 3000 }, effects: { money: -3000, rel: { father: 10 }, fx: ['fatherSeekHelp', 'fatherSeekHelp'] }, log: '전문 병동으로 옮겼다. {father}[이/가] 오랜만에 맑은 눈으로 웃었다.' },
        { text: '다른 일을 미루고 병상을 지킨다', effects: { rel: { father: 12 }, football: -2, happy: -2, fx: ['fatherSeekHelp'] }, log: '곁에서 손을 잡고 이야기를 나눴다.' },
        { text: '"가서 네 할 일을 해라"는 아버지의 부탁을 따른다', check: { stat: 'grit', diff: 40 },
          success: { effects: { rel: { father: 8 }, fame: 1 }, log: '맡은 일을 끝까지 해내고 병실에 소식을 전했다. {father}[이/가] 울었다고 한다.',
            run: function (s) { if (s.route && s.route.id === 'football' && s.fb.stage === 'pro') return '골을 넣고 하늘을 향해 두 손을 들었다. 병실 TV 앞에서 아버지가 울었다고 한다.'; } },
          fail: { effects: { happy: -4 }, log: '마음이 병실에 가 있어 일이 손에 잡히지 않았다. 그래도 {father}[은/는] "끝까지 버틴 게 좋았다"고 했다.' } }
      ] },
    { id: 'canon_father_farewell', manual: true, memorial: ['father'], jailOk: true, age: [1, 120],
      text: '장례식장에서 {father}의 사진을 바라봤다. 함께 보냈던 시간이 하나씩 떠올랐다.',
      choices: [
        { text: '아버지의 이름을 가슴에 새긴다', effects: { grit: 5, happy: 2 }, log: '그 뒤로 힘든 날마다 하늘을 올려다봤다.',
          run: function (s) { if (s.route && s.route.id === 'football') return '그 뒤로 골을 넣을 때마다 하늘을 가리켰다.'; } },
        { text: '한동안 아무것도 하지 못한다', effects: { happy: -5, health: -2, rel: { family: 6 } }, log: '슬픔을 견디는 데 시간이 필요했다. 서두르지 않기로 했다.' },
        { text: '술은 평생 입에 대지 않기로 맹세한다', check: { stat: 'grit', diff: 40 },
          success: { effects: { health: 3, flags: ['teetotal'], unflags: ['drinker'] }, log: '아버지를 떠올리며 내 몸을 소중히 돌보기로 했다. 술 없이 슬픔을 견뎌 보기로 했다.' },
          fail: { effects: { happy: -2, rel: { family: 2 } }, log: '평생의 맹세를 하기에는 마음이 너무 어지러웠다. 오늘의 슬픔부터 견디기로 했다.' } }
      ] },
    { id: 'canon_father_sober_year', age: [10, 70], once: true, weight: 40, cond: { flags: ['father_sober'], rel: { father: 'alive' } },
      text: '{father}의 금주를 축하하며 {food}[을/를] 차렸다.',
      effects: { happy: 8, rel: { father: 8, family: 4 } }, log: '{father}[은/는] 탄산수 잔을 들고 "곁에 있어 줘서 고맙다"고 했다.' },
    { id: 'canon_father_kitbag', age: [20, 70], once: true, weight: 20, cond: { flags: ['father_sober'], rel: { father: 'alive' } },
      text: '{father}[과/와] 오래된 사진을 꺼내 봤다. "이런 날도 있었지."',
      effects: { happy: 5, rel: { father: 5 } }, log: '사진 속 얼굴을 가리키며 한참 이야기를 나눴다.' },

    // ---------------------------------------------------------------- canon: clubs and the academy
    { id: 'canon_academy_second', age: [13, 15], once: true, weight: 40, cond: { fb: ['regional', 'local'], flags: ['!moved_alone'], stats: { football: [54, 100] } },
      text: '{academy} 스카우트가 찾아왔다. "재능은 기다려 주지 않는다. 지금 결정을 내려야 한다."',
      choices: [
        { text: '도전하러 간다', effects: { grit: 3, fx: ['joinAcademy'] }, log: '새로운 도전을 위해 가방을 쌌다.' },
        { text: '축구 말고 다른 미래를 생각한다', effects: { smarts: 2, fx: ['quitFootball'] }, log: '공 대신 다른 꿈을 품기로 했다.' }
      ] },
    { id: 'canon_warning', age: [12, 17], once: true, weight: 30, cond: { flags: ['academy_warning'], fb: ['academy'] },
      text: '{coach}[이/가] 사무실로 불렀다. "재능은 충분하다. 문제는 네 성질이다."',
      choices: [
        { text: '고개 숙여 사과한다', effects: { grit: 3, unflags: ['academy_warning'] }, log: '그날 이후로 분노를 슈팅에만 담기로 했다.' },
        { text: '"제가 왜요?"라고 대든다', check: { stat: 'football', diff: 60 },
          success: { effects: { fame: 1 }, log: '코치는 한숨을 쉬었다. 실력이 너무 좋아서 내보낼 수가 없다.' },
          fail: { effects: { fx: ['quitFootball'], happy: -8 }, log: '아카데미에서 퇴출됐다. 짐을 싸서 {hometown}[으로/로] 돌아왔다.' } }
      ] },
    { id: 'canon_homesick', age: [12, 16], cooldown: 3, weight: 18, cond: { flags: ['moved_alone'], fb: ['academy'], stats: { happy: [0, 42] } },
      text: '향수병이 심해졌다. 밤마다 {mother}[이/가] 해 주던 {food} 생각이 난다.',
      choices: [
        { text: '짐을 싸서 집으로 돌아간다', effects: { happy: 8, rel: { mother: 10 }, fx: ['quitFootball'], flags: ['went_home'] }, log: '{hometown}에 도착하자 익숙한 풍경에 긴장이 풀렸다.' },
        { text: '이를 악물고 버틴다', check: { stat: 'grit', diff: 45 },
          success: { effects: { grit: 4, happy: -2 }, log: '달력에 다음 방학까지 남은 날을 하나씩 지웠다.' },
          fail: { effects: { health: -4, happy: -3 }, log: '버티다 몸살이 났다. 사흘 동안 훈련에 빠져 명단 맨 아래로 밀렸다.' } },
        { text: '엄마가 다녀가시게 한다', req: { money: 200 }, effects: { money: -200, happy: 7, rel: { mother: 8 } }, log: '{mother}[이/가] 가방 가득 {food}[을/를] 싸 들고 왔다. 기숙사 친구들까지 배불리 먹었다.' }
      ] },
    { id: 'canon_heart', age: [15, 15], once: true, priority: true, cond: { flags: ['!heir'] },
      text: '정기 검진에서 의사가 고개를 갸웃했다. "쉬고 있는데도 심장이 너무 빨리 뛰네요. 검사가 필요합니다."',
      choices: [
        { text: '솔직하게 말하고 시술을 받는다', effects: { fx: ['heartProcedure'], happy: -2, rel: { mother: 5 } }, log: '시술을 마치고 회복에 집중했다. {mother}[은/는] 그제야 잠을 잤다.' },
        { text: '축구를 못 하게 될까 봐 숨긴다', alt: { text: '좋아하는 걸 못 하게 될까 봐 숨긴다' }, effects: { fx: ['heartIgnore'] }, log: '"괜찮아요, 긴장해서 그래요." 거짓말이 입에서 쉽게 나왔다.' }
      ] },
    { id: 'canon_heart_back', age: [15, 16], once: true, priority: true, cond: { flags: ['heart_fixed'] },
      text: '시술 후 몸 상태를 살폈다. 가슴에 손을 얹어 보니 심장이 차분하게 뛰고 있다.',
      effects: { happy: 6, grit: 2 }, log: '한결 편안해진 몸으로 일상에 돌아왔다.' },
    { id: 'canon_heart_scare', age: [16, 40], cooldown: 4, weight: 14, cond: { flags: ['heart_hidden'] },
      text: '전력 질주 후 가슴이 쿵쾅거리며 눈앞이 하얘졌다. 숨겨 온 심장이 다시 신호를 보낸다.',
      choices: [
        { text: '이번엔 병원에 간다', effects: { health: -3, fx: ['heartProcedure'] }, log: '의사는 "더 늦었으면 위험했다"며 시술을 마쳤다.' },
        { text: '괜찮다며 버틴다', check: { stat: 'health', diff: 55 },
          success: { effects: { happy: -2 }, log: '다행히 곧 진정됐다. 다행히… 아직은.' },
          fail: { effects: { health: -25, happy: -6 }, log: '바닥에 쓰러졌다. 들것에 실려 나가며 숨긴 것을 후회했다.' } }
      ] },
    { id: 'canon_work_ethic', age: [13, 20], cooldown: 2, weight: 16, cond: { fb: ['academy', 'youth'] },
      text: '모두가 잠든 밤, 기숙사 창밖으로 불 켜진 체육관이 보인다.',
      choices: [
        { text: '발목에 모래주머니를 차고 드리블한다', effects: { football: 2, grit: 2, health: -1 }, log: '모래주머니를 풀자 몸이 깃털처럼 가벼웠다.' },
        { text: '친구들과 몰래 시내에 나간다', effects: { happy: 5, grit: -2, rel: { friend: 5 } }, log: '{food}[을/를] 먹고 새벽에 담을 넘어 돌아왔다.' },
        { text: '푹 잔다. 회복도 훈련이다', effects: { health: 3, happy: 1 }, log: '9시간을 잤다. 다음 날 컨디션이 최고였다.' }
      ] },
    { id: 'canon_youth_promo', age: [16, 19], once: true, priority: true, cond: { fb: ['academy'], stats: { football: [58, 100] } },
      text: '{bigClub} 유스 리저브팀 승격 명단에 이름이 있다!',
      effects: { happy: 6, fx: ['promoteYouth'] }, log: '공중전화로 {father}에게 소리쳤다. "아빠, 나 올라갔어!"' },
    { id: 'canon_pro_debut', age: [17, 21], once: true, priority: true, cond: { fb: ['youth'], stats: { football: [64, 100] } },
      text: '{bigClub} 감독이 1군 훈련에 불렀다. 그리고 계약서를 내밀었다.',
      choices: [
        { text: '떨리는 손으로 사인한다', effects: { happy: 10, fx: ['turnPro'] }, log: '첫 연봉으로 가장 먼저 {mother}의 일을 그만두게 해 드리겠다고 다짐했다.' },
        { text: '해외 테스트를 기다리며 미룬다', check: { stat: 'football', diff: 72 },
          success: { effects: { fx: ['turnPro', 'transferAbroad'] }, log: '{abroadClub}[이/가] 직접 영입 제안을 했다! 곧바로 해외 무대로 간다.' },
          fail: { effects: { happy: -6, fx: ['turnPro'] }, log: '해외 테스트는 불발. 다행히 {bigClub}[이/가] 다시 손을 내밀었다.' } }
      ] },
    { id: 'fb_released', age: [20, 22], once: true, priority: true, cond: { fb: ['academy', 'youth'] },
      text: '{academy}[이/가] 방출을 통보했다. "미안하다. 프로의 문은 좁다."',
      choices: [
        { text: '하부 리그 공개 테스트에 도전한다', check: { stat: 'football', diff: 62 },
          success: { effects: { fx: ['turnPro'], happy: 5 }, log: '하부 리그를 거쳐 프로 계약을 따냈다! 돌아가는 길도 길이다.' },
          fail: { effects: { fx: ['quitFootball'], happy: -6 }, log: '테스트에서 떨어졌다. 축구화를 상자에 넣었다.' } },
        { text: '다른 인생을 시작한다', effects: { fx: ['quitFootball'], smarts: 2 }, log: '축구가 가르쳐 준 근성으로 새 길을 걷기로 했다.' }
      ] },
    { id: 'canon_late_tryout', age: [17, 24], once: true, weight: 30, cond: { fb: ['none', 'local', 'regional'], flags: ['!fb_retired'], stats: { football: [60, 100] } },
      text: '{bigClub}[이/가] 공개 입단 테스트를 연다는 공고를 봤다. 동네에선 이미 모르는 사람이 없는 실력이다.',
      choices: [
        { text: '도전한다', check: { stat: 'football', diff: 62 },
          success: { effects: { fx: ['promoteYouth'], happy: 6, unflags: ['fb_quit'] }, log: '늦깎이 합격! 유스 리저브팀에서 프로를 노린다.' },
          fail: { effects: { happy: -3 }, log: '"좋은 선수지만, 우리가 찾는 선수는 아니다."' } },
        { text: '그냥 동네 축구로 만족한다', effects: { happy: 2 }, log: '주말 조기축구회의 에이스로 살기로 했다.' }
      ] },

    // ---------------------------------------------------------------- football route: youth
    { id: 'fb_school_team', age: [8, 16], once: true, weight: 14, cond: { fb: ['none'], edu: ['elem', 'middle', 'high'], flags: ['!fb_quit'] },
      text: '{school} {sportsClub} 신입 부원 모집 공고가 붙었다.',
      choices: [
        { text: '입단 테스트를 본다', check: { stat: 'football', diff: 20 },
          success: { effects: { fx: ['joinLocalClub'], happy: 4 }, log: '합격! 학교 팀과 {localClub}에서 동시에 뛰게 됐다.' },
          fail: { effects: { happy: -3 }, log: '이번엔 떨어졌다. 공 차는 연습부터 다시 해야겠다.' } },
        { text: '관심 없다', effects: { smarts: 1 }, log: '방과 후엔 다른 걸 하기로 했다.' }
      ] },
    { id: 'fb_youth_tournament', age: [10, 16], cooldown: 2, weight: 14, cond: { fb: ['regional', 'academy'] },
      text: '전국 유소년 대회 결승전. 관중석에 {father}의 낡은 모자가 보인다.',
      choices: [
        { text: '팀을 위해 패스한다', check: { stat: 'smarts', diff: 35 },
          success: { effects: { football: 1, fame: 2, rel: { friend: 4 } }, log: '결정적인 어시스트! 우승 트로피를 함께 들었다.' },
          fail: { effects: { happy: -2 }, log: '패스가 끊겼다. 준우승 메달을 목에 걸었다.' } },
        { text: '혼자 해결한다', check: { stat: 'football', diff: 40 },
          success: { effects: { football: 2, fame: 3, happy: 5 }, log: '수비 다섯 명을 제치고 결승골! 다음 날 지역 신문에 이름이 실렸다.' },
          fail: { effects: { happy: -3, rel: { coach: -2 } }, log: '드리블하다 공을 뺏겼다. "축구는 혼자 하는 게 아니다."' } }
      ] },
    { id: 'fb_scout', age: [14, 18], once: true, weight: 16, cond: { fb: ['academy', 'youth'] },
      text: '연습 경기 관중석에 외국인 스카우트가 앉아 수첩에 뭔가를 적고 있다.',
      choices: [
        { text: '평소처럼 뛴다', check: { stat: 'football', diff: 55 },
          success: { effects: { fame: 3, flags: ['scouted'] }, log: '스카우트가 {abroadClub} 명함을 건넸다. "몇 년 뒤에 다시 보자."' },
          fail: { effects: { happy: -1 }, log: '스카우트는 하프타임에 떠났다.' } },
        { text: '화려한 개인기로 어필한다', check: { stat: 'football', diff: 62 },
          success: { effects: { fame: 4, flags: ['scouted'] }, log: '헛다리 일곱 번! 스카우트가 일어서서 박수를 쳤다.' },
          fail: { effects: { happy: -3, rel: { coach: -3 } }, log: '헛다리만 짚다 공을 잃었다. 코치의 한숨이 들렸다.' } }
      ] },
    { id: 'fb_bro_support', age: [12, 18], once: true, weight: 16, cond: { fb: ['academy', 'youth'], rel: { bro: 'alive' }, flags: ['!heir'] },
      text: '{bro}[이/가] 편지와 함께 용돈을 보냈다. "응원하고 있어. 힘내."',
      effects: { money: 100, happy: 5, rel: { bro: 8 } }, log: '편지를 축구화 상자에 넣어 두었다.' },
    { id: 'fb_sisters_cheer', age: [12, 20], once: true, weight: 12, cond: { fb: ['academy', 'youth', 'pro'], rel: { sis1: 'alive' }, flags: ['!heir'] },
      text: '{sis1}[과/와] {sis2}[이/가] 직접 만든 응원 현수막을 들고 경기장에 나타났다.',
      effects: { happy: 6, rel: { sis1: 6, sis2: 6 } }, log: '현수막 글씨 맞춤법이 틀렸지만 세상에서 제일 멋진 현수막이었다.' },
    { id: 'fb_quit_temptation', age: [13, 18], cooldown: 3, weight: 10, cond: { fb: ['academy', 'youth'], stats: { happy: [0, 35] } },
      text: '훈련, 훈련, 또 훈련. 친구들은 놀러 다니는데 나는 뭘 하고 있는 걸까.',
      choices: [
        { text: '축구를 그만둔다', effects: { happy: 6, fx: ['quitFootball'] }, log: '주말에 늦잠을 잤다. 그런데 조금 허전했다.' },
        { text: '목표를 종이에 적고 버틴다', effects: { grit: 3, happy: 2 }, log: '"세계 최고가 된다." 천장에 붙여 두었다.' }
      ] },

    // ---------------------------------------------------------------- football route: professional
    { id: 'fb_debut_goal', age: [17, 25], once: true, priority: true, cond: { fb: ['pro'] },
      text: '프로 데뷔전 후반 38분, 공이 발 앞에 떨어졌다.',
      choices: [
        { text: '점프하며 "시우!"를 외친다', check: { stat: 'football', diff: 50 },
          success: { effects: { fame: 5, happy: 6 }, log: '데뷔골! 공중에서 반 바퀴 돌아 착지한 세리머니가 하이라이트를 장식했다.' },
          fail: { effects: { happy: -2 }, log: '크로스바를 맞았다. 세리머니는 다음 기회에.' } },
        { text: '관중석의 가족을 가리킨다', check: { stat: 'football', diff: 45 },
          success: { effects: { fame: 3, rel: { family: 6 } }, log: '골! 관중석의 가족을 향해 두 팔을 벌렸다.' },
          fail: { effects: { happy: -1 }, log: '슛은 골키퍼 품에 안겼다. 그래도 가족은 일어서서 박수를 쳤다.' } }
      ] },
    { id: 'fb_bench', age: [17, 28], cooldown: 3, weight: 12, cond: { fb: ['pro'], level: [0, 1] },
      text: '이번 시즌도 벤치를 지키는 날이 많다. 감독은 경험을 이야기한다.',
      choices: [
        { text: '훈련장에 가장 먼저 나와 가장 늦게 나간다', effects: { football: 2, grit: 2 }, log: '감독이 훈련 영상을 다시 돌려 봤다고 한다.' },
        { text: '임대를 요청한다', check: { stat: 'football', diff: 60 },
          success: { effects: { football: 2, fame: 2 }, log: '임대 팀에서 주전으로 뛰며 경험을 쌓았다.' },
          fail: { effects: { happy: -3 }, log: '"아직은 우리 팀에 있어야 한다." 요청은 거절됐다.' } },
        { text: '불만을 SNS에 올린다', effects: { fame: 2, happy: 1, rel: { coach: -6 } }, log: '팬들은 응원했지만 감독은 기분이 상했다.' }
      ] },
    { id: 'fb_transfer_offer', age: [18, 31], once: true, weight: 40, cond: { fb: ['pro'], flags: ['!abroad'], stats: { football: [72, 100] } },
      text: '{abroadClub}[이/가] 기록적인 이적료를 제시했다. 친선 경기에서 상대 수비를 농락한 게 결정적이었다.',
      choices: [
        { text: '꿈의 무대로 간다', effects: { fx: ['transferAbroad'], happy: 6, rel: { mother: -2 } }, log: '공항에서 {mother}[은/는] "밥 잘 챙겨 먹어라"만 열 번 말했다.' },
        { text: '고향 팬들 곁에 남는다', effects: { happy: 3, fame: 2, flags: ['one_club'] }, log: '{bigClub} 팬들이 경기장에 "고마워"라는 대형 현수막을 걸었다.' }
      ] },
    { id: 'fb_transfer_second', age: [22, 31], once: true, weight: 25, cond: { fb: ['pro'], flags: ['!abroad', '!one_club'], stats: { football: [78, 100] } },
      text: '해외 빅클럽들이 문을 두드린다. 매력적인 제안이다.',
      choices: [
        { text: '수락한다', effects: { fx: ['transferAbroad'] }, log: '새 유니폼을 들고 사진을 찍었다.' },
        { text: '거절한다', effects: { flags: ['one_club'], happy: 2 }, log: '나는 이 팀의 심장이 되기로 했다.' }
      ] },
    { id: 'fb_number7', age: [18, 35], once: true, weight: 30, cond: { fb: ['pro'], flags: ['abroad'] },
      text: '{abroadClub} 감독이 등번호를 정하라며 웃었다. 전설들이 달던 7번이 비어 있다.',
      choices: [
        { text: '7번을 단다', effects: { fame: 4, grit: 2, flags: ['number7'] }, log: '부담스러운 번호다. 그래서 더 좋다.' },
        { text: '어릴 때 달던 번호를 고집한다', effects: { happy: 3 }, log: '{localClub} 시절의 번호를 달았다. 고향 꼬마들이 그 번호 유니폼을 샀다.' }
      ] },
    { id: 'fb_derby', age: [17, 40], cooldown: 2, weight: 12, cond: { fb: ['pro'] },
      text: '{rivalClub}[과/와]의 더비 매치. 경기장 전체가 흔들린다.',
      choices: [
        { text: '침착하게 기회를 기다린다', check: { stat: 'football', diff: 68 },
          success: { effects: { fame: 3, happy: 5 }, log: '후반 막판 헤딩 결승골! 그날 밤 도시가 잠들지 않았다.' },
          fail: { effects: { happy: -3 }, log: '0-1 패배. 팬들의 야유가 귓가를 맴돈다.' } },
        { text: '상대 수비수와 신경전을 벌인다', check: { stat: 'grit', diff: 60 },
          success: { effects: { fame: 2, football: 1 }, log: '상대가 먼저 흥분해 퇴장당했다. 여유롭게 승리했다.' },
          fail: { effects: { happy: -4, fame: -1 }, log: '경고 누적으로 퇴장당했다. 다음 날 신문 1면에 실렸다.' } }
      ] },
    { id: 'fb_penalty', age: [18, 40], cooldown: 3, weight: 10, cond: { fb: ['pro'], level: [2, 5] },
      text: '결승전 승부차기, 마지막 키커다. 이 한 번에 우승이 걸렸다.',
      choices: [
        { text: '골문 구석으로 강하게 찬다', check: { stat: 'grit', diff: 55 },
          success: { effects: { fame: 5, happy: 8 }, log: '골망이 출렁였다. 동료들이 한꺼번에 덮쳤다.' },
          fail: { effects: { happy: -8, fame: -2 }, log: '공이 하늘로 날아갔다. 그 장면은 한동안 꿈에 나왔다.' } },
        { text: '파넨카 칩슛으로 띄운다', check: { stat: 'football', diff: 80 },
          success: { effects: { fame: 8, happy: 8 }, log: '골키퍼가 넘어진 사이 공이 천천히 들어갔다. 전설적인 장면이 됐다.' },
          fail: { effects: { happy: -10, fame: -4 }, log: '골키퍼가 가만히 서서 공을 잡았다. 인터넷 밈이 됐다.' } }
      ] },
    { id: 'fb_freekick', age: [18, 36], once: true, weight: 14, cond: { fb: ['pro'] },
      text: '훈련 중 공을 회전 없이 차 봤더니 공이 미친 듯이 흔들리며 날아갔다.',
      choices: [
        { text: '무회전 프리킥을 완성한다', check: { stat: 'football', diff: 70 },
          success: { effects: { football: 2, fame: 4, flags: ['knuckleball'] }, log: '35미터 무회전 프리킥 골! 해설자가 할 말을 잃었다.' },
          fail: { effects: { happy: -1 }, log: '공이 관중석 3층으로 날아갔다. 연습이 더 필요하다.' } },
        { text: '안전하게 감아 차기를 고수한다', effects: { football: 1 }, log: '익숙한 게 제일 좋다.' }
      ] },
    { id: 'fb_rival_genius', age: [20, 35], once: true, weight: 30, cond: { fb: ['pro'], flags: ['abroad'], level: [3, 5] },
      text: '라이벌 클럽에 작은 체구의 왼발 천재가 있다. 언론은 매일 둘을 비교한다.',
      choices: [
        { text: '라이벌을 연료 삼아 더 훈련한다', effects: { grit: 4, football: 2, health: -1 }, log: '라이벌이 해트트릭을 하면, 나는 다음 경기에서 해트트릭을 했다.' },
        { text: '시상식에서 먼저 악수를 청한다', effects: { happy: 4, fame: 2 }, log: '둘이 웃으며 나눈 대화가 화제가 됐다. "서로 덕분에 더 잘하게 됐다."' },
        { text: '인터뷰에서 도발한다', effects: { fame: 3, happy: -1 }, log: '조회수는 폭발했지만 겸손하지 못했다는 비판도 따라왔다.' }
      ] },
    { id: 'fb_knee', age: [20, 38], cooldown: 5, weight: 10, cond: { fb: ['pro'] },
      text: '태클에 무릎이 꺾였다. 의료진은 최소 3개월 재활을 이야기한다.',
      choices: [
        { text: '조기 복귀를 강행한다', check: { stat: 'health', diff: 62 },
          success: { effects: { fame: 2, grit: 2 }, log: '6주 만에 복귀해 골까지 넣었다. 회복력이 괴물이다.' },
          fail: { effects: { fx: ['seriousInjury'] }, log: '무릎이 다시 꺾였다. 이번엔 수술대에 올랐다.' } },
        { text: '재활에 충실한다', effects: { health: 4, fx: ['injury'] }, log: '지루한 재활을 묵묵히 마쳤다. 몸은 더 단단해졌다.' }
      ] },
    { id: 'fb_contract', age: [20, 36], cooldown: 4, weight: 10, cond: { fb: ['pro'], level: [2, 5] },
      text: '재계약 협상 테이블. 에이전트가 숫자가 적힌 종이를 내밀며 눈짓을 한다.',
      choices: [
        { text: '최고 대우를 요구한다', check: { stat: 'fame', diff: 55 },
          success: { effects: { money: 400000, happy: 3 }, log: '구단이 백기를 들었다. 서명 보너스까지 챙겼다.' },
          fail: { effects: { fame: -2, happy: -2 }, log: '협상이 결렬 직전까지 갔다. 팬들의 시선이 싸늘하다.' } },
        { text: '팀을 위해 양보한다', effects: { happy: 2, fame: 3, money: 50000 }, log: '팬들 사이에서 "의리의 선수"라는 별명이 생겼다.' }
      ] },
    { id: 'fb_charity', age: [20, 60], cooldown: 4, weight: 12, cond: { fb: ['pro', 'retired'], stats: { fame: [45, 100] } },
      text: '어린이 병원에서 편지가 왔다. 수술비가 없어 치료를 기다리는 아이가 있다고 한다.',
      choices: [
        { text: '수술비 전액을 낸다', req: { money: 60000 }, effects: { money: -60000, happy: 7, fame: 3 }, log: '아이의 수술은 성공했다. 퇴원하는 날 내 유니폼을 입고 있었다.' },
        { text: '직접 병원을 찾아간다', effects: { happy: 5, rel: { family: 2 } }, log: '병동의 아이들과 풍선을 차며 놀았다. 간호사들이 울었다.' },
        { text: '구단 재단에 맡긴다', effects: { fame: 1 }, log: '재단이 절차를 밟기로 했다.' }
      ] },
    { id: 'fb_blood', age: [18, 40], once: true, weight: 12, cond: { fb: ['pro'] },
      text: '동료들이 너도나도 타투를 새긴다. "너도 하나 해!"',
      choices: [
        { text: '"헌혈을 못 하게 돼서 안 할래."', effects: { happy: 2, fame: 2, flags: ['no_tattoo'] }, log: '정기적으로 헌혈하는 선수로 알려졌다.' },
        { text: '팔에 가족 이름을 새긴다', effects: { looks: 2, rel: { family: 4 } }, log: '{mother}[은/는] 기겁했다가 자기 이름을 보고 조용해졌다.' }
      ] },
    { id: 'fb_mother_stands', age: [18, 40], cooldown: 5, weight: 10, cond: { fb: ['pro'], rel: { mother: 'alive' } },
      text: '{mother}[이/가] 큰 경기장에 왔다. 긴장해서 손을 꼭 쥐고 있다.',
      choices: [
        { text: '엄마를 위해 골을 넣는다', check: { stat: 'football', diff: 65 },
          success: { effects: { rel: { mother: 8 }, happy: 6 }, log: '골! 카메라가 잡은 {mother}[은/는] 기절 직전이었다.' },
          fail: { effects: { rel: { mother: 3 } }, log: '골은 없었지만 {mother}[은/는] "TV보다 훨씬 잘생겼더라"고 했다.' } },
        { text: '경기 후 엄마에게 유니폼을 건넨다', effects: { rel: { mother: 6 }, happy: 3 }, log: '{mother}[은/는] 그 유니폼을 빨지도 않고 액자에 넣었다.' }
      ] },
    { id: 'fb_mom_house', age: [18, 40], once: true, weight: 30, cond: { fb: ['pro'], flags: ['promised_house'], rel: { mother: 'alive' }, money: [80000, 1e12] },
      text: '어릴 적 약속이 떠올랐다. "나중에 큰 집 사 줄게."',
      choices: [
        { text: '{mother}에게 바다가 보이는 집을 선물한다', effects: { money: -80000, happy: 10, rel: { mother: 15, family: 5 } }, log: '{mother}[은/는] 새 집 부엌에서 제일 먼저 {food}[을/를] 끓였다.' },
        { text: '조금 더 모은 뒤에', effects: { happy: -1 }, log: '약속은 아직 마음속에 있다.' }
      ] },
    { id: 'fb_kid_pitch', age: [18, 40], cooldown: 6, weight: 8, cond: { fb: ['pro'], stats: { fame: [40, 100] } },
      text: '경기 도중 꼬마 팬이 경기장에 뛰어들어 휴대폰을 내밀었다.',
      choices: [
        { text: '같이 셀카를 찍어 준다', effects: { fame: 3, happy: 3 }, log: '그 사진은 그해 가장 많이 공유된 사진이 됐다.' },
        { text: '안전요원에게 살살 데려가 달라고 한다', effects: { happy: 1 }, log: '경기 후 꼬마에게 사인 유니폼을 보냈다.' }
      ] },
    { id: 'fb_aging', age: [30, 36], once: true, weight: 30, cond: { fb: ['pro'] },
      text: '예전처럼 측면을 폭발적으로 돌파하기 힘들다. 감독은 최전방 스트라이커 변신을 제안한다.',
      choices: [
        { text: '플레이 스타일을 바꾼다', check: { stat: 'grit', diff: 55 },
          success: { effects: { football: 3, fame: 2 }, log: '박스 안의 포식자로 다시 태어났다. 득점이 오히려 늘었다.' },
          fail: { effects: { happy: -3 }, log: '새 역할이 몸에 맞지 않는다. 출전 시간이 줄었다.' } },
        { text: '"나는 아직 윙어다!"', effects: { happy: 1, health: -2 }, log: '자존심은 지켰지만 몸이 비명을 지른다.' }
      ] },
    { id: 'fb_desert_league', age: [33, 39], once: true, weight: 25, cond: { fb: ['pro'] },
      text: '사막 리그의 부자 구단이 상상을 초월하는 연봉으로 마지막 2년을 제안했다.',
      choices: [
        { text: '받아들이고 은퇴 준비를 한다', effects: { money: 3000000, fame: -2, fx: ['retireFootball'] }, log: '모래바람 속에서 마지막 시즌들을 보내고 축구화를 벗었다.' },
        { text: '최고 수준에서 끝까지 뛴다', effects: { grit: 3 }, log: '"지금은 돈보다 트로피에 도전하고 싶다."' }
      ] },
    { id: 'fb_captain', age: [24, 37], once: true, weight: 25, cond: { fb: ['pro'], flags: ['nat_team'] },
      text: '{nationalTeam} 감독이 주장 완장을 건넸다.',
      effects: { fame: 5, grit: 3, happy: 5, flags: ['captain'] }, log: '완장을 찬 첫 경기, 국가가 울릴 때 울컥했다.' },
    { id: 'fb_worldcup_eve', age: [18, 40], cooldown: 3, weight: 40, cond: { fb: ['pro'], flags: ['nat_team'] },
      when: function (s) { return s.year % 4 === 2; },
      text: '월드컵 개막 전날 밤, 대표팀 숙소. 동료들이 긴장한 얼굴로 모여 있다.',
      choices: [
        { text: '라커룸에서 연설을 한다', check: { stat: 'grit', diff: 50 },
          success: { effects: { grit: 2, happy: 3, fame: 2 }, log: '"우리는 {hometown} 골목에서부터 여기까지 왔다." 모두가 일어섰다.' },
          fail: { effects: { happy: -1 }, log: '말이 꼬였다. 그래도 다들 웃으며 긴장이 풀렸다.' } },
        { text: '혼자 프리킥 연습을 한다', effects: { football: 1 }, log: '불 꺼진 훈련장에 공 차는 소리만 울렸다.' }
      ] },
    { id: 'fb_tax', age: [24, 40], once: true, weight: 10, cond: { fb: ['pro'], flags: ['abroad'], stats: { fame: [70, 100] } },
      text: '세무 당국이 초상권 수입을 조사하겠다고 나섰다.',
      choices: [
        { text: '벌금을 내고 조용히 끝낸다', effects: { money: -400000, fame: -1 }, log: '비싼 수업료를 냈다. 회계사를 바꿨다.' },
        { text: '법정에서 싸운다', check: { stat: 'smarts', diff: 60 },
          success: { effects: { fame: 1 }, log: '무혐의 판결. 기자 회견에서 미소를 지었다.' },
          fail: { effects: { money: -900000, fame: -4, happy: -5 }, log: '패소. 더 큰돈을 내야 했다.' } }
      ] },
    { id: 'fb_sponsor', age: [20, 38], once: true, weight: 20, cond: { fb: ['pro'], stats: { fame: [60, 100] } },
      text: '세계적인 스포츠 브랜드가 평생 후원 계약을 제안했다.',
      effects: { money: 1500000, fame: 3, happy: 4 }, log: '내 이름이 새겨진 축구화가 전 세계에 팔리기 시작했다.' },
    { id: 'fb_followers', age: [20, 45], once: true, weight: 15, cond: { fb: ['pro', 'retired'], stats: { fame: [80, 100] } },
      text: 'SNS 팔로워 수가 세계 1위가 됐다. 사진 한 장에 수천만 개의 하트가 달린다.',
      effects: { fame: 4, money: 300000 }, log: '아침 식사 사진 하나로 광고 수익이 들어왔다.' },
    { id: 'fb_hometown_kits', age: [20, 45], once: true, weight: 20, cond: { fb: ['pro', 'retired'], flags: ['!heir'] },
      text: '{localClub}에 새 유니폼과 축구공 수백 개를 보냈다. 장비실의 낡은 선반이 꽉 찼다.',
      effects: { happy: 6, fame: 2, money: -20000, rel: { father: 8 } }, log: '{father}[은/는] 새 유니폼을 한 장씩 정성껏 개었다고 한다.' },
    { id: 'fb_airport', age: [25, 80], once: true, weight: 15, cond: { stats: { fame: [82, 100] }, fb: ['pro', 'retired'] },
      text: '{region}의 공항에 내 이름이 붙었다.',
      effects: { fame: 3, happy: 6 }, log: '공항 로비의 흉상이… 음, 조금 다른 사람 같다. 그래도 고향 사람들이 좋아한다.' },
    { id: 'fb_retired_path', age: [30, 50], once: true, priority: true, cond: { fb: ['retired'] },
      text: '선수 생활을 마친 뒤의 시간을 돌아봤다. 축구와는 어떤 관계를 이어 갈까?',
      choices: [
        { text: '지도자 자격증 공부를 시작한다', check: { stat: 'smarts', diff: 35 },
          success: { effects: { smarts: 2, flags: ['coach_license'] }, log: '지도자 자격증을 땄다. 구직 메뉴에서 감독에 도전할 수 있다.' },
          fail: { effects: { happy: -2 }, log: '전술 이론 시험에서 떨어졌다. 운동장과 교실은 다르다.' } },
        { text: '방송 해설가로 나선다', effects: { fame: 2, money: 50000 }, log: '첫 해설에서 "제가 뛰었다면…"을 열한 번 말했다.' },
        { text: '주변 사람들과 시간을 보낸다', effects: { happy: 6, rel: { family: 8 } }, log: '경기 일정에 쫓기지 않고 느긋하게 이야기를 나눴다.' }
      ] },
    { id: 'fb_legend_match', age: [36, 60], once: true, weight: 20, cond: { fb: ['retired'], stats: { fame: [50, 100] } },
      text: '레전드 매치에 초대받았다. 배가 조금 나온 옛 동료들이 반갑게 손을 흔든다.',
      choices: [
        { text: '전성기처럼 뛴다', check: { stat: 'health', diff: 55 },
          success: { effects: { happy: 6, fame: 2 }, log: '헛다리 짚기 한 번에 관중석이 들썩였다.' },
          fail: { effects: { health: -4, happy: 2 }, log: '전반 10분 만에 햄스트링이 올라왔다. 다들 웃었다.' } },
        { text: '벤치에서 웃으며 즐긴다', effects: { happy: 4 }, log: '팬들과 사진을 찍느라 경기를 거의 못 봤다.' }
      ] },
    { id: 'fb_sunday_league', age: [25, 55], cooldown: 4, weight: 8, cond: { fb: ['none'], stats: { football: [30, 100] } },
      text: '동네 조기축구회에서 "용병"으로 뛰어 달라는 연락이 왔다.',
      choices: [
        { text: '나간다', check: { stat: 'football', diff: 35 },
          success: { effects: { happy: 5, health: 2 }, log: '해트트릭! 조기축구회 단톡방이 난리가 났다.' },
          fail: { effects: { health: -2, happy: 1 }, log: '다음 날 허벅지가 비명을 질렀다.' } },
        { text: '늦잠을 잔다', effects: { health: 1 }, log: '일요일 아침의 이불 속은 우승 트로피보다 소중하다.' }
      ] }
  );
})(typeof globalThis !== 'undefined' ? globalThis : this);
