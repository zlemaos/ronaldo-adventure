/* Career-specific storylets (호날두의 모험). Ids prefixed car_.
 * Delayed consequences: a choice sets a flag and schedules a follow-up whose cond
 * requires that flag (the follow-up clears it), so it only fires when earned. */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};
  RA.data.events = RA.data.events || [];
  function E(e) { RA.data.events.push(e); }

  /* ================= SPORTS ================= */
  E({
    id: 'car_coach_losing_streak', age: [28, 75], cooldown: 4,
    cond: { career: ['football_coach'] },
    text: '팀이 5연패에 빠졌다. 기자회견장에서 마이크 열두 개가 {name}[을/를] 노려본다.',
    choices: [
      { text: '전술을 확 바꿔 공격 축구로 간다', check: { stat: 'smarts', diff: 55 },
        success: { effects: { fame: 4, happy: 5 }, log: '과감한 4-2-4가 먹혔다. 연패 탈출, 팬들이 이름을 연호했다.' },
        fail: { effects: { fame: -3, happy: -5 }, log: '수비가 텅 비었다. 0-4 대패 후 "용감했다"는 평만 남았다.' } },
      { text: '"선수들을 믿습니다"라고 말한다', effects: { happy: -2, rel: { coach: 2 } }, log: '진부한 답변이었지만 라커룸 분위기는 조금 나아졌다.' },
      { text: '심판 탓을 한다', effects: { fame: 2, money: -3000 }, log: '벌금과 함께 "분노의 감독" 짤이 유행했다.' }
    ]
  });
  E({
    id: 'car_coach_board_pressure', age: [30, 75], cooldown: 5,
    cond: { career: ['football_coach'], level: [2, 9] },
    text: '구단주가 사무실로 불렀다. "다음 다섯 경기, 결과가 없으면 알지?"',
    choices: [
      { text: '훈련장에 침대를 들여놓는다', check: { stat: 'grit', diff: 55 },
        success: { effects: { fame: 3, health: -3, fx: ['promote'] }, log: '다섯 경기 4승 1무. 구단주가 연장 계약서를 들고 왔다.' },
        fail: { effects: { happy: -6, fx: ['fired'] }, log: '1승 4패. 짐 상자를 들고 훈련장을 나왔다.' } },
      { text: '먼저 사임한다', effects: { happy: 2, fame: -1, fx: ['quitJob'] }, log: '"가족과 시간을 보내겠다"는 말을 남겼다. 실제로 그랬다.' }
    ]
  });
  E({
    id: 'car_pundit_live_gaffe', age: [24, 80], cooldown: 5,
    cond: { career: ['sports_pundit'] },
    text: '생방송 중 결정적 순간에 선수 이름을 완전히 틀리게 외쳤다. 채팅창이 폭발한다.',
    choices: [
      { text: '바로 정정하고 웃어넘긴다', effects: { fame: 2, happy: 2 }, log: '"제 혀가 오프사이드였네요." 이 말이 그날의 명대사가 됐다.' },
      { text: '끝까지 틀린 이름으로 밀고 간다', check: { stat: 'looks', diff: 50 },
        success: { effects: { fame: 5 }, log: '시청자들이 그 이름을 별명으로 쓰기 시작했다. 선수 본인도 좋아했다.' },
        fail: { effects: { fame: -3, happy: -3 }, log: '다음 주 해설석에 다른 사람이 앉아 있었다.' } }
    ]
  });
  E({
    id: 'car_referee_var', age: [20, 60], cooldown: 4,
    cond: { career: ['referee'] },
    text: '{rivalClub} 홈 경기, 추가시간 페널티 판정. VAR 모니터 앞에 선 {name}의 등 뒤로 4만 명이 숨을 죽인다.',
    choices: [
      { text: '화면을 꼼꼼히 다시 본다', check: { stat: 'smarts', diff: 45 },
        success: { effects: { fame: 2, happy: 3, fx: ['promote'] }, log: '정확한 판정이었다. 다음 시즌 1부 리그 배정표에 이름이 올랐다.' },
        fail: { effects: { fame: -2, happy: -4 }, log: '각도에 속았다. 사흘 내내 판정 논란 기사가 쏟아졌다.' } },
      { text: '처음 판정을 그대로 밀고 간다', effects: { grit: 2, happy: -2 }, log: '양쪽 팬 모두에게 욕을 먹었다. 공평하다면 공평했다.' }
    ]
  });
  E({
    id: 'car_boxer_title_fight', age: [18, 36], cooldown: 3,
    cond: { career: ['boxer'], level: [1, 9] },
    text: '타이틀전이 잡혔다. 상대는 무패의 챔피언. 체중계 숫자가 0.2kg 넘는다.',
    choices: [
      { text: '사우나에서 마지막 땀을 뺀다', check: { stat: 'health', diff: 60 },
        success: { effects: { fame: 6, money: 40000, fx: ['promote'] }, log: '12라운드 판정승. 벨트가 생각보다 무거웠다.' },
        fail: { effects: { health: -6, fx: ['injury'] }, log: '7라운드에 다운. 링 바닥이 그렇게 차가운 줄 몰랐다.' } },
      { text: '경기를 미룬다', effects: { fame: -2, happy: -2 }, log: '"겁쟁이"라는 댓글을 봤지만 몸은 지켰다.' }
    ]
  });
  E({
    id: 'car_baduk_vs_ai', age: [14, 80], cooldown: 6,
    cond: { career: ['baduk_player'] },
    text: '최신 바둑 AI와의 공개 대국 제안이 왔다. 이기면 세계 뉴스, 지면 세계 밈.',
    choices: [
      { text: '수락한다', check: { stat: 'smarts', diff: 80 },
        success: { effects: { fame: 8, money: 50000, fx: ['promote'] }, log: '78수째 묘수로 AI가 기권했다. 개발자들이 밤새 로그를 뒤졌다.' },
        fail: { effects: { fame: 2, smarts: 2 }, log: '졌지만 AI가 "흥미로운 수"라고 평했다. 그게 위로가 됐다.' } },
      { text: '"바둑은 사람끼리 두는 것"이라며 거절', effects: { happy: 1 }, log: '멋있는 말이었다. 다들 핑계인 걸 알았지만.' }
    ]
  });
  E({
    id: 'car_progamer_final', age: [16, 32], cooldown: 3,
    cond: { career: ['pro_gamer'] },
    text: '결승전 마지막 세트. 손에 땀이 나서 마우스가 미끄러진다.',
    choices: [
      { text: '숨 고르고 침착하게', check: { stat: 'grit', diff: 55 },
        success: { effects: { fame: 6, money: 60000, happy: 6, fx: ['promote'] }, log: '역전 우승! 트로피를 들고 엄마에게 영상통화를 걸었다.' },
        fail: { effects: { happy: -5 }, log: '한 끗 차이 준우승. 리플레이를 백 번 봤다.' } },
      { text: '도박수를 던진다', check: { stat: 'smarts', diff: 60 },
        success: { effects: { fame: 8, money: 60000 }, log: '아무도 예상 못 한 전략에 해설진이 일어섰다.' },
        fail: { effects: { fame: -2, happy: -6 }, log: '도박수는 도박으로 끝났다. 커뮤니티에 "그 수" 밈이 생겼다.' } }
    ]
  });
  E({
    id: 'car_trainer_celebrity', age: [19, 60], cooldown: 5,
    cond: { career: ['personal_trainer'] },
    text: '유명 배우가 3개월 안에 복근을 만들어 달라고 한다. 촬영일은 이미 정해져 있다.',
    choices: [
      { text: '지옥의 식단표를 짠다', check: { stat: 'grit', diff: 45 },
        success: { effects: { fame: 4, money: 15000, fx: ['promote'] }, log: '포스터 속 복근이 화제가 됐고, 예약이 반년 치 찼다.' },
        fail: { effects: { happy: -3 }, log: '배우가 몰래 {food}[을/를] 시켜 먹었다. 복근은 CG가 됐다.' } },
      { text: '"건강하게 천천히"를 고집한다', effects: { happy: 2, money: 5000 }, log: '배우는 투덜댔지만 1년 뒤 고맙다는 문자를 보냈다.' }
    ]
  });

  /* ================= MEDICAL ================= */
  E({
    id: 'car_med_night_shift', age: [22, 65], cooldown: 3,
    cond: { sector: ['medical'] },
    text: '36시간째 당직. 응급실 문이 또 열리고 구급차 불빛이 벽에 번진다.',
    choices: [
      { text: '커피를 한 잔 더 마신다', effects: { health: -3, grit: 2 }, log: '심장이 커피 박자로 뛰었지만 환자는 무사히 넘겼다.' },
      { text: '5분만 눈을 붙인다', check: { stat: 'grit', diff: 40 },
        success: { effects: { health: 1 }, log: '정확히 5분 뒤 알람 없이 눈이 떠졌다. 몸이 이 일에 맞춰졌다.' },
        fail: { effects: { happy: -4 }, log: '40분을 잤다. 수간호사의 눈빛이 오래 기억에 남았다.' } }
    ]
  });
  E({
    id: 'car_doctor_save_life', age: [26, 68], cooldown: 4,
    cond: { career: ['doctor', 'surgeon'] },
    text: '심정지 환자가 실려 왔다. 모두의 시선이 {name}에게 쏠린다.',
    choices: [
      { text: '직접 지휘한다', check: { stat: 'smarts', diff: 60 },
        success: { effects: { fame: 3, happy: 8 }, log: '모니터에 다시 파형이 그려졌다. 보호자가 {name}의 손을 잡고 울었다.' },
        fail: { effects: { happy: -8, health: -2 }, log: '최선을 다했지만 돌아오지 못했다. 그날 밤 옥상에서 오래 서 있었다.' } },
      { text: '선배를 호출한다', effects: { smarts: 2, happy: 1 }, log: '선배 옆에서 손을 보탰다. 다음엔 내가 할 수 있을 것 같았다.' }
    ]
  });
  E({
    id: 'car_doctor_mistake', age: [26, 68], cooldown: 8,
    cond: { career: ['doctor', 'surgeon', 'dentist'], flags: ['!hid_malpractice'] },
    text: '피곤에 절어 처방 용량을 잘못 썼다. 다행히 약사가 잡아냈지만, 기록은 남아 있다.',
    choices: [
      { text: '솔직히 보고하고 사과한다', effects: { happy: -3, smarts: 2 }, log: '징계 대신 당직 시스템 개선으로 이어졌다. 동료들이 조용히 고마워했다.' },
      { text: '기록을 슬쩍 고친다', effects: { happy: -2, flags: ['hid_malpractice'] }, log: '아무도 모르는 것 같았다. 아직은.',
        schedule: { id: 'car_malpractice_exposed', years: 2 } }
    ]
  });
  E({
    id: 'car_malpractice_exposed', age: [26, 80], weight: 1,
    cond: { flags: ['hid_malpractice'] },
    text: '2년 전 고쳐 쓴 기록이 병원 감사에서 드러났다. 법무팀이 {name}[을/를] 찾는다.',
    choices: [
      { text: '모든 걸 털어놓는다', effects: { money: -20000, fame: -3, unflags: ['hid_malpractice'], fx: ['demote'] }, log: '면허는 지켰지만 한 단계 내려앉았다. 마음은 오히려 가벼워졌다.' },
      { text: '끝까지 부인한다', check: { stat: 'smarts', diff: 70 },
        success: { effects: { happy: -4, unflags: ['hid_malpractice'] }, log: '증거 불충분. 하지만 복도의 시선은 예전 같지 않았다.' },
        fail: { effects: { fame: -6, money: -40000, unflags: ['hid_malpractice'], fx: ['fired'] }, log: '거짓말이 더 큰 문제가 됐다. 흰 가운을 반납했다.' } }
    ]
  });
  E({
    id: 'car_nurse_letter', age: [22, 65], cooldown: 5,
    cond: { career: ['nurse'] },
    text: '퇴원한 할머니가 삐뚤빼뚤한 손편지와 {food}[을/를] 두고 갔다.',
    effects: { happy: 6, grit: 1 }, log: '"우리 천사 간호사님." 편지는 사물함 문 안쪽에 붙여 두었다.'
  });
  E({
    id: 'car_nurse_burnout', age: [24, 62], cooldown: 5,
    cond: { career: ['nurse', 'paramedic'], stats: { happy: [0, 40] } },
    text: '세 번째 연속 밤 근무. 거울 속 얼굴이 낯설다.',
    choices: [
      { text: '휴가를 낸다', effects: { happy: 5, money: -1500 }, log: '{hometown}에 내려가 사흘 동안 잠만 잤다. 살 것 같았다.' },
      { text: '버틴다', effects: { health: -4, grit: 3 }, log: '버텼다. 하지만 몸이 기억해 두겠다고 말하는 것 같았다.' },
      { text: '사직서를 쓴다', effects: { happy: 3, fx: ['quitJob'] }, log: '동료들이 케이크를 사 왔다. 다들 부러워하는 눈치였다.' }
    ]
  });
  E({
    id: 'car_vet_chihuahua', age: [24, 70], cooldown: 6,
    cond: { career: ['veterinarian'] },
    text: '2kg짜리 치와와가 진료대 위에서 세상 모든 것에 분노하고 있다.',
    effects: { health: -1, happy: 3 }, log: '손가락을 물렸다. 보호자는 "얘가 원래 순한데…"라고 했다. 다들 그렇게 말한다.'
  });
  E({
    id: 'car_med_epidemic', age: [24, 65], once: true, weight: 4,
    cond: { sector: ['medical'] },
    text: '{city}에 독한 전염병이 돌기 시작했다. 병원이 지원자를 찾는다.',
    choices: [
      { text: '최전선에 자원한다', check: { stat: 'health', diff: 50 },
        success: { effects: { fame: 4, happy: 4, grit: 4, fx: ['promote'] }, log: '석 달 동안 방호복 속에서 살았다. 시민들이 병원 앞에 꽃을 두고 갔다.' },
        fail: { effects: { health: -6, fx: ['getSick'] }, log: '결국 감염됐다. 환자에서 다시 의료진으로 돌아오기까지 오래 걸렸다.' } },
      { text: '가족을 위해 후방에 남는다', effects: { rel: { family: 3 }, happy: -2 }, log: '가족은 안도했다. 마음 한구석은 계속 응급실에 가 있었다.' }
    ]
  });
  E({
    id: 'car_physio_star_player', age: [22, 65], cooldown: 6,
    cond: { career: ['physical_therapist'] },
    text: '{bigClub}의 에이스가 무릎을 부여잡고 재활실에 들어왔다. "월드컵까지 석 달이요."',
    choices: [
      { text: '맞춤 재활 프로그램을 짠다', check: { stat: 'smarts', diff: 50 },
        success: { effects: { fame: 4, money: 10000, fx: ['promote'] }, log: '그는 월드컵 첫 경기에서 골을 넣고 {name} 쪽을 가리켰다.' },
        fail: { effects: { happy: -3 }, log: '복귀는 했지만 예전 같지 않았다. 신문에는 "재활 실패"라고 났다.' } },
      { text: '"무리하면 안 됩니다"라고 단호하게 말한다', effects: { happy: 2, smarts: 1 }, log: '선수는 화를 냈지만, 5년 뒤 은퇴 인터뷰에서 {name}에게 감사했다.' }
    ]
  });

  /* ================= LAW ================= */
  E({
    id: 'car_lawyer_dirty_client', age: [25, 75], cooldown: 6,
    cond: { career: ['lawyer'], flags: ['!dirty_client'] },
    text: '재벌 2세가 수임료 백지수표를 내밀었다. 유죄가 너무 확실한 사건이다.',
    choices: [
      { text: '수임한다', effects: { money: 60000, happy: -3, flags: ['dirty_client'] }, log: '이겼다. 판결문을 읽는 동안 피해자 가족을 똑바로 보지 못했다.',
        schedule: { id: 'car_lawyer_backfire', years: 2 } },
      { text: '거절하고 국선 사건을 맡는다', effects: { happy: 4, money: -2000, fame: 1 }, log: '돈은 안 됐지만, 그날 잠은 잘 잤다.' }
    ]
  });
  E({
    id: 'car_lawyer_backfire', age: [25, 85], weight: 1,
    cond: { flags: ['dirty_client'] },
    text: '그 재벌 2세가 또 사고를 쳤다. 기사마다 "그때 그를 풀어 준 변호사"로 {name}의 이름이 실렸다.',
    choices: [
      { text: '공개 사과를 한다', effects: { fame: -2, happy: 2, unflags: ['dirty_client'] }, log: '사과문은 조롱도 받았지만 몇몇 후배가 존경한다고 연락해 왔다.' },
      { text: '"변호는 직업일 뿐"이라고 해명한다', effects: { fame: -4, money: 20000, unflags: ['dirty_client'] }, log: '틀린 말은 아니었다. 그래서 더 미움받았다.' }
    ]
  });
  E({
    id: 'car_judge_bribe_offer', age: [26, 70], cooldown: 8,
    cond: { career: ['judge', 'prosecutor'], flags: ['!took_bribe'] },
    text: '퇴근길 주차장, 낯선 사람이 묵직한 종이 가방을 내민다. "선처 부탁드립니다."',
    choices: [
      { text: '가방을 돌려주고 신고한다', effects: { fame: 3, happy: 3 }, log: '다음 날 뉴스에 "청렴 법조인"으로 짧게 소개됐다.' },
      { text: '말없이 받는다', effects: { money: 80000, happy: -4, flags: ['took_bribe'] }, log: '트렁크가 무거워졌다. 마음은 더 무거워졌다.',
        schedule: { id: 'car_bribe_caught', years: 3 } }
    ]
  });
  E({
    id: 'car_bribe_caught', age: [20, 90], weight: 1,
    cond: { flags: ['took_bribe'] },
    text: '감찰반이 사무실 문을 두드렸다. 3년 전 그 종이 가방 사진을 들고.',
    choices: [
      { text: '최고의 변호사를 선임한다', check: { stat: 'smarts', diff: 70 },
        success: { effects: { money: -50000, fame: -3, unflags: ['took_bribe'], fx: ['fired'] }, log: '감옥은 피했다. 직장과 명예는 피하지 못했다.' },
        fail: { effects: { money: -50000, fame: -6, unflags: ['took_bribe'], fx: ['jail'] }, log: '판사석 대신 피고인석에 앉았다. 그리고 실형.' } },
      { text: '자백한다', effects: { fame: -4, unflags: ['took_bribe'], fx: ['jail'] }, log: '짧은 형기를 받았다. {mother}[은/는] 면회 때마다 {food}[을/를] 싸 왔다.' }
    ]
  });
  E({
    id: 'car_judge_landmark', age: [32, 70], once: true,
    cond: { career: ['judge'], level: [2, 9] },
    text: '사회를 둘로 가른 사건이 {name}의 재판부에 배당됐다. 법정 밖엔 시위대가 양쪽으로 섰다.',
    choices: [
      { text: '양심과 법리대로 판결한다', check: { stat: 'smarts', diff: 70 },
        success: { effects: { fame: 6, happy: 4, fx: ['promote'] }, log: '판결문이 법대 교과서에 실렸다.' },
        fail: { effects: { fame: 2, happy: -4 }, log: '상급심에서 뒤집혔다. 판결문의 한 문단이 계속 마음에 걸렸다.' } },
      { text: '여론을 살핀다', effects: { fame: -2, happy: -3 }, log: '무난했다. 아무도 기억하지 않는 판결이 됐다.' }
    ]
  });
  E({
    id: 'car_lawyer_probono', age: [25, 75], cooldown: 6,
    cond: { career: ['lawyer', 'paralegal'] },
    text: '{hometown} 시장 상인들이 재개발 업체에 쫓겨날 처지라며 찾아왔다. 돈은 없단다.',
    choices: [
      { text: '무료로 맡는다', check: { stat: 'smarts', diff: 55 },
        success: { effects: { fame: 4, happy: 6 }, log: '승소! 상인들이 1년 내내 {food}[을/를] 공짜로 줬다.' },
        fail: { effects: { happy: -2, money: -3000 }, log: '졌다. 그래도 상인들은 "고생했다"며 손을 잡아 줬다.' } },
      { text: '정중히 거절한다', effects: { money: 3000, happy: -2 }, log: '그 주에 맡은 기업 사건 보수가 유난히 씁쓸했다.' }
    ]
  });

  /* ================= TECH ================= */
  E({
    id: 'car_tech_outage', age: [18, 65], cooldown: 3,
    cond: { sector: ['tech'] },
    text: '금요일 밤 11시, 서비스 전체가 멈췄다. 슬랙 알림이 폭죽처럼 터진다.',
    choices: [
      { text: '노트북을 연다', check: { stat: 'smarts', diff: 55 },
        success: { effects: { happy: 3, money: 2000, fx: ['promote'] }, log: '새벽 3시, 한 줄짜리 오타를 찾아냈다. 월요일 회의에서 박수를 받았다.' },
        fail: { effects: { happy: -5, health: -2 }, log: '아침이 되어서야 복구됐다. 원인은 끝내 "일시적 현상"으로 정리됐다.' } },
      { text: '"제 담당 아닌데요" 하고 잔다', effects: { happy: 2, rel: { friend: -1 } }, log: '푹 잤다. 월요일의 공기가 차가웠다.' }
    ]
  });
  E({
    id: 'car_tech_startup_offer', age: [22, 55], cooldown: 6,
    cond: { career: ['programmer', 'game_developer', 'data_scientist', 'white_hacker', 'web_designer'], flags: ['!startup_bet'] },
    text: '대학 동기가 창업했다며 연락해 왔다. "연봉은 반, 지분은 5%. 같이 세상 바꾸자."',
    choices: [
      { text: '뛰어든다', effects: { money: -10000, happy: 4, flags: ['startup_bet'], fx: ['quitJob'] }, log: '공유 오피스 구석 책상 하나. 심장이 오랜만에 빨리 뛰었다.',
        schedule: { id: 'car_startup_result', years: 3 } },
      { text: '안정이 최고다', effects: { happy: -1 }, log: '정중히 거절했다. 가끔 그 회사 뉴스를 검색해 본다.' }
    ]
  });
  E({
    id: 'car_startup_result', age: [22, 70], weight: 1,
    cond: { flags: ['startup_bet'] },
    text: '3년이 지났다. 동기의 회사에 대기업 인수 제안이 들어왔다는 소문이 돈다.',
    choices: [
      { text: '끝까지 지분을 쥐고 있는다', check: { stat: 'grit', diff: 55 },
        success: { effects: { money: 400000, happy: 8, unflags: ['startup_bet'] }, log: '인수 성사! 통장 잔고의 0 개수를 세다 손이 떨렸다.' },
        fail: { effects: { money: -5000, happy: -6, unflags: ['startup_bet'] }, log: '인수가 무산되고 회사는 문을 닫았다. 남은 건 후드티 열 벌.' } },
      { text: '지분을 지금 팔아 버린다', effects: { money: 40000, unflags: ['startup_bet'] }, log: '적당히 챙겼다. 그 후 일은 뉴스로 보지 않기로 했다.' }
    ]
  });
  E({
    id: 'car_hacker_big_bug', age: [18, 60], cooldown: 6,
    cond: { career: ['white_hacker'], flags: ['!sold_exploit'] },
    text: '대형 은행 앱에서 치명적인 보안 구멍을 발견했다. 다크웹 게시판엔 벌써 군침 흘리는 글들이 보인다.',
    choices: [
      { text: '은행에 제보한다', effects: { money: 30000, fame: 3, happy: 3, fx: ['promote'] }, log: '버그 바운티 상금과 함께 감사패를 받았다.' },
      { text: '익명으로 판다', effects: { money: 150000, happy: -3, flags: ['sold_exploit'] }, log: '코인 지갑에 숫자가 찍혔다. VPN을 세 겹 켰다.',
        schedule: { id: 'car_exploit_traced', years: 2 } }
    ]
  });
  E({
    id: 'car_exploit_traced', age: [18, 80], weight: 1,
    cond: { flags: ['sold_exploit'] },
    text: '새벽 6시, 현관문 너머로 "사이버수사대입니다"라는 목소리가 들린다.',
    choices: [
      { text: '노트북을 전자레인지에 넣는다', check: { stat: 'smarts', diff: 70 },
        success: { effects: { happy: -4, unflags: ['sold_exploit'], fx: ['fired'] }, log: '증거는 녹았고 혐의는 흐려졌다. 업계에서는 이름이 녹아 버렸다.' },
        fail: { effects: { fame: -3, unflags: ['sold_exploit'], fx: ['jail'] }, log: '전자레인지에서 불꽃이 튀었고, 증거 인멸 혐의가 추가됐다.' } },
      { text: '문을 열고 협조한다', effects: { money: -60000, unflags: ['sold_exploit'], fx: ['fired'] }, log: '벌금과 집행유예. 이제 보안 강연에서 "실패 사례"로 소개된다.' }
    ]
  });
  E({
    id: 'car_gamedev_crunch', age: [19, 60], cooldown: 4,
    cond: { career: ['game_developer'] },
    text: '출시 6주 전, 회사가 "자율적 야근"을 공지했다. 자율적이라는 단어에 따옴표가 보인다.',
    choices: [
      { text: '게임을 위해 불태운다', effects: { health: -5, smarts: 2, money: 5000 }, log: '출시일 아침, 엔딩 크레딧에서 자기 이름을 찾고 울컥했다.' },
      { text: '칼퇴근한다', check: { stat: 'grit', diff: 45 },
        success: { effects: { happy: 4 }, log: '정시 퇴근의 아이콘이 됐다. 의외로 동료들이 따라 하기 시작했다.' },
        fail: { effects: { happy: -2, fx: ['demote'] }, log: '평가 시즌에 그 대가가 돌아왔다.' } }
    ]
  });
  E({
    id: 'car_tech_ai_coworker', age: [22, 65], cooldown: 6,
    cond: { career: ['programmer', 'web_designer', 'it_support', 'data_scientist'] },
    text: '회사가 AI 코딩 도구를 도입했다. 팀장이 "이제 인원이 좀 덜 필요하겠네"라고 중얼거렸다.',
    choices: [
      { text: 'AI를 누구보다 잘 다루는 사람이 된다', check: { stat: 'smarts', diff: 50 },
        success: { effects: { smarts: 3, fx: ['promote'] }, log: 'AI에게 일을 시키는 사람이 됐다. 그게 새 직책이 됐다.' },
        fail: { effects: { happy: -3 }, log: 'AI가 짠 코드를 고치느라 야근이 늘었다.' } },
      { text: '"사람 손맛"을 강조한다', effects: { happy: 1, fame: 1 }, log: '사내 블로그 글이 의외로 공감을 얻었다.' }
    ]
  });
  E({
    id: 'car_it_turn_off_on', age: [18, 65], cooldown: 5,
    cond: { career: ['it_support'] },
    text: '사장님 컴퓨터가 "완전히 망가졌다"는 긴급 호출. 가 보니 모니터 전원이 꺼져 있다.',
    effects: { happy: 3, smarts: 1 }, log: '버튼 하나 누르고 "기술적 조치 완료"라고 보고했다. 사장님은 천재라며 감탄했다.'
  });

  /* ================= SCIENCE ================= */
  E({
    id: 'car_sci_breakthrough', age: [25, 80], cooldown: 6,
    cond: { career: ['scientist', 'ai_researcher', 'astronomer'] },
    text: '실험 데이터가 이론과 정확히 일치한다. 혹시 몰라 세 번 다시 돌려 봐도 같다.',
    choices: [
      { text: '바로 논문을 쓴다', check: { stat: 'smarts', diff: 75 },
        success: { effects: { fame: 7, happy: 8, fx: ['promote'] }, log: '세계적 학술지 표지에 실렸다. 노벨상 예측 기사에 이름이 올랐다.' },
        fail: { effects: { happy: -5, fame: -1 }, log: '측정 장비의 오류였다. 정정 논문을 쓰는 손이 무거웠다.' } },
      { text: '1년 더 검증한다', effects: { smarts: 3, happy: -1 }, log: '그 사이 다른 연구팀이 비슷한 결과를 먼저 냈다. 그래도 내 데이터가 더 깨끗했다.' }
    ]
  });
  E({
    id: 'car_sci_grant_rejected', age: [25, 75], cooldown: 4,
    cond: { sector: ['science'] },
    text: '3년짜리 연구비 신청이 탈락했다. 심사평은 단 한 줄, "흥미롭지 않음".',
    choices: [
      { text: '심사평을 액자에 넣고 다시 쓴다', effects: { grit: 3, happy: -1 }, log: '다음 해에 통과했다. 액자는 연구실 명물이 됐다.' },
      { text: '자비로 실험을 이어 간다', effects: { money: -8000, smarts: 2 }, log: '라면 먹는 날이 늘었지만 데이터는 쌓였다.' }
    ]
  });
  E({
    id: 'car_astro_centrifuge', age: [27, 50], once: true,
    cond: { career: ['astronaut'], level: [0, 1] },
    text: '훈련의 끝판왕, 고중력 원심분리기. 9G에서 버티면 우주로 한 걸음 더 다가간다.',
    choices: [
      { text: '이를 악문다', check: { stat: 'health', diff: 70 },
        success: { effects: { grit: 4, fame: 2, fx: ['promote'] }, log: '얼굴이 찌그러진 사진이 남았지만, 미션 명단에 이름이 올랐다.' },
        fail: { effects: { health: -3, happy: -4 }, log: '기절했다. 교관이 "다음 기수에 보자"며 어깨를 두드렸다.' } },
      { text: '호흡법을 먼저 연구한다', check: { stat: 'smarts', diff: 70 },
        success: { effects: { smarts: 2, fx: ['promote'] }, log: '논리로 중력을 이겼다. 교관들이 그 호흡법을 매뉴얼에 넣었다.' },
        fail: { effects: { happy: -3 }, log: '이론은 완벽했다. 몸이 이론을 안 읽었다.' } }
    ]
  });
  E({
    id: 'car_astro_launch', age: [28, 55], once: true,
    cond: { career: ['astronaut'], level: [2, 9] },
    text: '카운트다운 10초 전. 헤드셋 너머 관제실 목소리 사이로 {country} 전체가 숨죽이는 게 느껴진다.',
    choices: [
      { text: '창밖으로 지구를 보며 손을 흔든다', effects: { fame: 8, happy: 10 }, log: '파란 구슬 위 어딘가에 {hometown}[이/가] 있다. 눈물이 둥둥 떠다녔다.' },
      { text: '{mother}에게 남긴 편지를 다시 읽는다', effects: { fame: 6, happy: 8, rel: { mother: 8 } }, log: '"엄마, 우주에서도 밥 잘 먹을게." 궤도에서 보낸 영상에 온 나라가 울었다.' }
    ]
  });
  E({
    id: 'car_astro_spacewalk', age: [28, 58], cooldown: 4,
    cond: { career: ['astronaut'], level: [2, 9] },
    text: '우주유영 중 공구가 손을 떠나 천천히 멀어진다. 산소 잔량 경고가 깜빡인다.',
    choices: [
      { text: '침착하게 예비 공구로 수리한다', check: { stat: 'smarts', diff: 70 },
        success: { effects: { fame: 5, grit: 3, fx: ['promote'] }, log: '수리 성공. 놓친 공구는 이제 "인공위성"으로 등록됐다.' },
        fail: { effects: { health: -5, happy: -4 }, log: '임무를 중단하고 복귀했다. 산소 2%가 남아 있었다.' } },
      { text: '즉시 복귀를 요청한다', effects: { happy: -1, smarts: 1 }, log: '현명한 판단이었다. 영웅담은 없었지만 살아 있었다.' }
    ]
  });
  E({
    id: 'car_archaeo_tomb', age: [25, 80], cooldown: 6,
    cond: { career: ['archaeologist'] },
    text: '발굴 현장 붓질 끝에 금빛이 반짝인다. 인부 한 명이 "이거 저주 같은 거 있는 거 아니죠?"라고 묻는다.',
    choices: [
      { text: '조심스럽게 발굴을 이어 간다', check: { stat: 'grit', diff: 50 },
        success: { effects: { fame: 6, happy: 6, fx: ['promote'] }, log: '천 년 묵은 왕관이었다. 박물관 개관식에서 테이프를 잘랐다.' },
        fail: { effects: { happy: -3 }, log: '금빛은 1990년대 음료수 캔이었다.' } },
      { text: '저주가 무서워서 일단 덮는다', effects: { happy: 1, smarts: -1 }, log: '다음 날 다른 팀이 그 자리를 팠다. 저주는 {name}에게 내린 셈이다.' }
    ]
  });
  E({
    id: 'car_meteo_wrong_forecast', age: [24, 70], cooldown: 4,
    cond: { career: ['meteorologist'] },
    text: '"맑음"이라고 예보한 날, {city}에 물폭탄이 쏟아졌다. 시민 게시판이 불탄다.',
    effects: { fame: -1, happy: -3, smarts: 1 }, log: '사과 방송 중에도 비가 그치지 않았다. 다음 날부터 강수 확률을 10% 올려 말하기로 했다.'
  });
  E({
    id: 'car_lab_tech_explosion', age: [20, 65], cooldown: 6,
    cond: { career: ['lab_tech', 'scientist'] },
    text: '박사님이 시약 두 병을 섞으려는 순간, 라벨이 거꾸로 붙어 있는 게 보였다.',
    choices: [
      { text: '몸을 날려 막는다', effects: { fame: 1, happy: 4, fx: ['promote'] }, log: '아슬아슬했다. 그날 이후 연구실 안전 책임자가 됐다.' },
      { text: '"박사님…?"이라고 소심하게 말한다', effects: { health: -2, happy: -1 }, log: '작은 펑 소리와 함께 박사님 눈썹이 사라졌다. 다들 무사했다.' }
    ]
  });

  /* ================= EDUCATION ================= */
  E({
    id: 'car_teacher_old_student', age: [32, 75], cooldown: 7,
    cond: { career: ['teacher', 'pe_teacher', 'kindergarten_teacher', 'professor'] },
    text: '어엿한 어른이 된 옛 제자가 교무실 문을 두드렸다. "선생님 덕분에 버텼어요."',
    effects: { happy: 8 }, log: '그 아이가 누구였는지 기억해 내는 데 3초 걸렸다. 그 3초가 평생 미안할 것 같다.'
  });
  E({
    id: 'car_teacher_parent_complaint', age: [22, 65], cooldown: 4,
    cond: { sector: ['education'] },
    text: '학부모가 밤 11시에 전화했다. "우리 애가 왜 반장이 아니죠?"',
    choices: [
      { text: '차분히 설명한다', check: { stat: 'smarts', diff: 45 },
        success: { effects: { happy: 2 }, log: '통화가 끝날 무렵엔 학부모가 학급 행사를 돕겠다고 했다.' },
        fail: { effects: { happy: -4 }, log: '교육청 민원이 접수됐다. 경위서 세 장을 썼다.' } },
      { text: '휴대폰을 끄고 잔다', effects: { happy: 2, rel: { family: 1 } }, log: '아침에 부재중 전화 17통. 그래도 잘 잤다.' }
    ]
  });
  E({
    id: 'car_professor_tenure', age: [32, 65], once: true,
    cond: { career: ['professor'], level: [1, 2] },
    text: '정년 보장 심사. 논문 수, 강의 평가, 그리고 학과장님 기분까지 모두 변수다.',
    choices: [
      { text: '논문으로 승부한다', check: { stat: 'smarts', diff: 72 },
        success: { effects: { happy: 8, fx: ['promote'] }, log: '통과! 연구실 문패를 새로 달았다.' },
        fail: { effects: { happy: -6 }, log: '1년 유예. 학과장님이 커피를 사 주며 "다음엔 되겠지"라고 했다.' } },
      { text: '학생들의 지지를 모은다', check: { stat: 'looks', diff: 55 },
        success: { effects: { happy: 6, fame: 1, fx: ['promote'] }, log: '학생 서명 1천 장이 심사위원회 책상에 올라갔다.' },
        fail: { effects: { happy: -4 }, log: '서명은 많았지만 심사는 논문만 봤다.' } }
    ]
  });
  E({
    id: 'car_tutor_viral_lecture', age: [21, 65], cooldown: 5,
    cond: { career: ['cram_tutor'] },
    text: '{exam} 대비 특강 중 던진 비유가 영상으로 퍼졌다. 조회수가 미쳤다.',
    choices: [
      { text: '유명 강사로 브랜드화한다', effects: { fame: 5, money: 30000, fx: ['promote'] }, log: '수강 신청이 3초 만에 마감됐다.' },
      { text: '그냥 하던 대로 한다', effects: { happy: 3, smarts: 1 }, log: '그 반 학생들 성적이 올랐다. 그게 더 기뻤다.' }
    ]
  });
  E({
    id: 'car_kinder_why', age: [21, 60], cooldown: 5,
    cond: { career: ['kindergarten_teacher'] },
    text: '여섯 살 아이가 물었다. "선생님은 왜 어른이 됐어요?"',
    effects: { happy: 5, smarts: 1 }, log: '대답을 못 했다. 퇴근길 내내 그 질문을 생각했다.'
  });

  /* ================= ARTS ================= */
  E({
    id: 'car_art_first_exhibit', age: [18, 80], once: true,
    cond: { career: ['painter', 'photographer', 'tattoo_artist'] },
    text: '드디어 첫 개인전. 오프닝에 온 사람은 {mother}, {friend}, 그리고 길을 잘못 든 배달원.',
    choices: [
      { text: '배달원에게 작품 설명을 한다', check: { stat: 'smarts', diff: 45 },
        success: { effects: { fame: 4, money: 5000, happy: 6 }, log: '그가 SNS에 올린 사진이 퍼졌다. 다음 날 그림이 다 팔렸다.' },
        fail: { effects: { happy: -2 }, log: '배달원은 공손히 고개를 끄덕이고 떠났다. {mother}[이/가] 제일 큰 그림을 샀다.' } },
      { text: '{mother}[과/와] 전시장에서 {food}[을/를] 먹는다', effects: { happy: 5, rel: { mother: 5 } }, log: '텅 빈 갤러리가 그날만큼은 제일 따뜻한 식당이었다.' }
    ]
  });
  E({
    id: 'car_webtoon_deadline', age: [16, 70], cooldown: 3,
    cond: { career: ['webtoon_artist'] },
    text: '마감 6시간 전, 남은 컷 40개. 손목이 비명을 지른다.',
    choices: [
      { text: '밤을 새운다', check: { stat: 'grit', diff: 50 },
        success: { effects: { health: -3, fame: 2 }, log: '업로드 1분 전 완성. 베스트 댓글 "작가님 손목 괜찮으세요?"' },
        fail: { effects: { health: -5, fame: -2 }, log: '배경을 흰색으로 채웠다. 독자들이 "미니멀리즘 회차"라고 불렀다.' } },
      { text: '휴재 공지를 올린다', effects: { happy: 3, fame: -1 }, log: '"작가님 쉬세요" 댓글이 3천 개. 눈물 날 뻔했다.' }
    ]
  });
  E({
    id: 'car_webtoon_drama', age: [18, 70], once: true,
    cond: { career: ['webtoon_artist'], level: [3, 9] },
    text: '연재작의 드라마 판권 계약 제안이 왔다. 주인공 역에 톱스타 이름이 거론된다.',
    effects: { money: 120000, fame: 6, happy: 6 }, log: '첫 촬영장에서 내가 그린 대사가 실제 사람 입으로 나왔다. 소름이 돋았다.'
  });
  E({
    id: 'car_novel_rejection', age: [18, 90], cooldown: 6,
    cond: { career: ['novelist'], level: [0, 1], flags: ['!novel_persist'] },
    text: '출판사에서 50번째 거절 메일이 왔다. "좋은 원고지만 저희와는 맞지 않아…"',
    choices: [
      { text: '51번째 원고를 쓴다', effects: { grit: 4, happy: -2, flags: ['novel_persist'] }, log: '거절 메일을 폴더에 모았다. 폴더 이름은 "나중에 자서전 부록".',
        schedule: { id: 'car_novel_breakthrough', years: 3 } },
      { text: '펜을 꺾는다', effects: { happy: -3, fx: ['quitJob'] }, log: '원고는 서랍 속으로 들어갔다. 가끔 서랍이 덜컥거리는 것 같다.' }
    ]
  });
  E({
    id: 'car_novel_breakthrough', age: [18, 95], weight: 1,
    cond: { flags: ['novel_persist'], career: ['novelist'] },
    text: '작은 출판사 편집자가 새벽 2시에 메일을 보냈다. "이 원고, 저희가 꼭 내고 싶습니다."',
    effects: { fame: 6, money: 30000, happy: 10, unflags: ['novel_persist'], fx: ['promote'] },
    log: '서점 매대에 내 이름이 있다. 사진을 백 장 찍었다.'
  });
  E({
    id: 'car_art_forgery_offer', age: [20, 80], cooldown: 8,
    cond: { career: ['painter'], money: [0, 5000], flags: ['!forged_art'] },
    text: '월세가 석 달 밀렸다. 수상한 화상이 "거장 그림 하나만 똑같이 그려 달라"고 한다.',
    choices: [
      { text: '단호히 거절한다', effects: { happy: 2, money: -500 }, log: '그날 저녁도 {food} 한 그릇이었다. 그래도 내 그림은 내 이름으로 남는다.' },
      { text: '"딱 한 번만"이라며 붓을 든다', effects: { money: 40000, happy: -3, flags: ['forged_art'] }, log: '완벽했다. 너무 완벽해서 무서웠다.',
        schedule: { id: 'car_forgery_exposed', years: 3 } }
    ]
  });
  E({
    id: 'car_forgery_exposed', age: [20, 90], weight: 1,
    cond: { flags: ['forged_art'] },
    text: '경매에 나온 "거장의 그림"을 감정사가 엑스레이로 찍었다. 밑그림에 {name}의 낙서 습관이 남아 있었다.',
    choices: [
      { text: '수사에 협조한다', effects: { fame: -3, money: -20000, unflags: ['forged_art'] }, log: '집행유예. 오히려 "천재 위작가"로 전시 제안이 왔다.' },
      { text: '해외로 도망친다', check: { stat: 'smarts', diff: 65 },
        success: { effects: { happy: -4, unflags: ['forged_art'], fx: ['moveAbroad'] }, log: '새 나라, 새 이름. 붓은 다시는 잡지 않았다.' },
        fail: { effects: { fame: -5, unflags: ['forged_art'], fx: ['jail'] }, log: '공항 출국 심사대에서 체포됐다.' } }
    ]
  });
  E({
    id: 'car_architect_award', age: [30, 80], cooldown: 8,
    cond: { career: ['architect'], level: [2, 9] },
    text: '{city}에 설계한 도서관이 국제 건축상 후보에 올랐다. 정작 아이들은 그 도서관 계단을 미끄럼틀로 쓴다.',
    effects: { fame: 4, happy: 5 }, log: '시상식 연설에서 "미끄럼틀도 설계 의도였다"고 말했다. 거짓말이었다.'
  });
  E({
    id: 'car_violin_audition', age: [18, 60], cooldown: 4,
    cond: { career: ['violinist'], level: [0, 3] },
    text: '세계적인 오케스트라의 블라인드 오디션. 커튼 너머 심사위원의 기침 소리만 들린다.',
    choices: [
      { text: '가장 자신 있는 곡으로', check: { stat: 'grit', diff: 60 },
        success: { effects: { fame: 3, happy: 6, fx: ['promote'] }, log: '커튼이 걷히자 심사위원들이 일어서 있었다.' },
        fail: { effects: { happy: -4 }, log: '두 번째 마디에서 줄이 끊어졌다. 그날의 끊어진 줄은 아직 케이스에 있다.' } },
      { text: '모험적인 현대곡으로', check: { stat: 'smarts', diff: 65 },
        success: { effects: { fame: 5, fx: ['promote'] }, log: '"신선하다"는 평과 함께 합격했다.' },
        fail: { effects: { happy: -3 }, log: '심사위원들이 서로 눈치를 봤다. 아무도 그 곡을 몰랐다.' } }
    ]
  });

  /* ================= ENTERTAINMENT ================= */
  E({
    id: 'car_ent_scandal', age: [16, 80], cooldown: 6,
    cond: { sector: ['entertainment'], level: [2, 9] },
    text: '새벽 연예 뉴스에 {name}의 학창 시절 흑역사 사진이 대문짝만하게 실렸다.',
    choices: [
      { text: '손편지 사과문을 올린다', effects: { fame: -1, happy: -2 }, log: '맞춤법 하나 틀려서 그게 또 기사가 됐다.' },
      { text: '그 사진을 직접 패러디한다', check: { stat: 'looks', diff: 55 },
        success: { effects: { fame: 6, happy: 4 }, log: '패러디 사진이 더 유명해졌다. 광고가 두 개 들어왔다.' },
        fail: { effects: { fame: -3, happy: -4 }, log: '"반성을 안 한다"는 여론이 들끓었다.' } },
      { text: '잠수 탄다', effects: { happy: 1, fame: -2 }, log: '한 달 뒤 사람들은 다른 스캔들로 이동했다.' }
    ]
  });
  E({
    id: 'car_ent_viral_hit', age: [14, 80], cooldown: 5,
    cond: { sector: ['entertainment'], stats: { fame: [0, 60] } },
    text: '별생각 없이 올린 30초짜리 영상이 하룻밤 새 천만 뷰를 찍었다.',
    effects: { fame: 7, happy: 6, money: 8000 }, log: '모르는 사람이 길에서 영상 속 대사를 따라 했다. 묘한 기분이었다.'
  });
  E({
    id: 'car_idol_monthly_eval', age: [15, 25], cooldown: 1,
    cond: { career: ['idol'], level: [0, 1] },
    text: '연습생 월말 평가. 대표님이 팔짱을 끼고 앉아 있다. 오늘 하루 섭취 칼로리는 바나나 반 개.',
    choices: [
      { text: '칼군무로 승부', check: { stat: 'grit', diff: 55 },
        success: { effects: { looks: 1, fame: 1, fx: ['promote'] }, log: '대표님이 처음으로 고개를 끄덕였다. 데뷔조 명단에 이름이 올라갔다.' },
        fail: { effects: { happy: -5, health: -2 }, log: '턴에서 미끄러졌다. 연습실 거울 앞에서 새벽까지 다시 돌았다.' } },
      { text: '보컬로 승부', check: { stat: 'looks', diff: 55 },
        success: { effects: { fame: 1, happy: 3, fx: ['promote'] }, log: '고음 한 방에 연습생들이 박수를 쳤다.' },
        fail: { effects: { happy: -4 }, log: '긴장해서 삑사리가 났다. 대표님이 볼펜으로 뭔가를 적었다.' } }
    ]
  });
  E({
    id: 'car_idol_contract', age: [18, 32], once: true,
    cond: { career: ['idol'], level: [2, 9] },
    text: '재계약 시즌. 회사는 정산 비율 1:9를 제시했다. 9가 누구 몫인지는 묻지 않아도 안다.',
    choices: [
      { text: '버티며 협상한다', check: { stat: 'grit', diff: 60 },
        success: { effects: { money: 100000, happy: 5 }, log: '5:5로 합의했다. 멤버들과 {food} 회식을 했다.' },
        fail: { effects: { happy: -4 }, log: '협상은 결렬 직전까지 갔다가 3:7로 끝났다.' } },
      { text: '1인 기획사를 차린다', effects: { money: -30000, fame: 2, happy: 4, fx: ['quitJob'] }, log: '팬들이 "드디어 자유"라며 응원 광고를 지하철에 걸었다.' }
    ]
  });
  E({
    id: 'car_youtuber_haters', age: [14, 80], cooldown: 4,
    cond: { career: ['youtuber', 'comedian', 'singer'] },
    text: '댓글창에 악플이 쏟아진다. "이 사람 왜 뜸?" 그 댓글에 좋아요가 3천 개.',
    choices: [
      { text: '악플 읽기 영상을 찍는다', check: { stat: 'looks', diff: 45 },
        success: { effects: { fame: 4, happy: 2 }, log: '여유로운 리액션에 구독자가 오히려 늘었다.' },
        fail: { effects: { happy: -5 }, log: '찍다가 진짜로 상처받았다. 영상은 비공개로 돌렸다.' } },
      { text: '고소장을 준비한다', effects: { money: -3000, happy: 2 }, log: '선처를 호소하는 메일이 줄줄이 왔다. 그중 하나는 사촌이었다.' },
      { text: '한 달간 인터넷을 끊는다', effects: { happy: 5, fame: -2 }, log: '산책을 했다. 하늘이 생각보다 넓었다.' }
    ]
  });
  E({
    id: 'car_youtuber_football_collab', age: [14, 60], cooldown: 5,
    cond: { career: ['youtuber'] },
    text: '{bigClub} 선수와의 합동 콘텐츠가 잡혔다. 주제는 "크로스바 맞히기 챌린지".',
    choices: [
      { text: '진지하게 도전한다', check: { stat: 'football', diff: 45 },
        success: { effects: { fame: 6, football: 1 }, log: '세 번 연속 크로스바! 선수가 진심으로 놀랐다.' },
        fail: { effects: { fame: 3, happy: 1 }, log: '공이 카메라맨에게 날아갔다. 조회수는 그게 제일 높았다.' } },
      { text: '예능으로 간다', effects: { fame: 3, happy: 3 }, log: '선수에게 {food} 먹방을 시켰다. 의외의 케미였다.' }
    ]
  });
  E({
    id: 'car_actor_audition', age: [14, 60], cooldown: 2,
    cond: { career: ['actor'], level: [0, 2] },
    text: '유명 감독의 신작 오디션. 대본에 쓰인 대사는 단 하나, "…아니야."',
    choices: [
      { text: '울면서 말한다', check: { stat: 'looks', diff: 55 },
        success: { effects: { fame: 4, happy: 6, fx: ['promote'] }, log: '감독이 "됐다"라고만 말했다. 그게 합격이었다.' },
        fail: { effects: { happy: -3 }, log: '"다음 분이요."' } },
      { text: '웃으면서 말한다', check: { stat: 'smarts', diff: 55 },
        success: { effects: { fame: 3, fx: ['promote'] }, log: '예상 밖 해석에 감독이 대본을 고쳤다.' },
        fail: { effects: { happy: -3 }, log: '감독이 고개를 갸웃했다. 본인도 왜 웃었는지 모른다.' } }
    ]
  });
  E({
    id: 'car_stunt_big_jump', age: [19, 55], cooldown: 3,
    cond: { career: ['stuntman', 'circus_performer'] },
    text: '오늘 장면은 불붙은 다리 위 오토바이 점프. 감독이 "한 번에 가자"고 외친다.',
    choices: [
      { text: '간다', check: { stat: 'health', diff: 60 },
        success: { effects: { fame: 3, money: 10000, happy: 4, fx: ['promote'] }, log: '완벽했다. 예고편 맨 앞에 그 장면이 실렸다. 얼굴은 안 나왔지만.' },
        fail: { effects: { health: -6, fx: ['injury'] }, log: '착지에서 발목이 돌아갔다. 영화는 대역의 대역을 썼다.' } },
      { text: '안전장치 보강을 요구한다', effects: { grit: 1, happy: 1 }, log: '촬영이 두 시간 밀렸다. 다들 툴툴댔지만 아무도 안 다쳤다.' }
    ]
  });
  E({
    id: 'car_comedian_bomb', age: [18, 80], cooldown: 4,
    cond: { career: ['comedian', 'magician'] },
    text: '공연장 객석에 정적이 흐른다. 회심의 한 방이 완전히 빗나갔다. 누군가 기침을 한다.',
    choices: [
      { text: '정적 자체를 개그로 만든다', check: { stat: 'smarts', diff: 55 },
        success: { effects: { fame: 3, happy: 5 }, log: '"방금 그 기침, 오늘 최고의 리액션입니다." 객석이 터졌다.' },
        fail: { effects: { happy: -4 }, log: '정적이 두 배가 됐다.' } },
      { text: '빨리 다음으로 넘어간다', effects: { happy: -1, grit: 1 }, log: '프로답게 넘어갔다. 밤새 그 장면을 곱씹었다.' }
    ]
  });
  E({
    id: 'car_magician_pigeon', age: [16, 85], cooldown: 6,
    cond: { career: ['magician'] },
    text: '모자에서 나와야 할 비둘기가 공연 직전 탈출해 공연장 천장에 앉아 있다.',
    effects: { fame: 2, happy: 2 }, log: '"오늘의 마술은 사라진 비둘기입니다!" 관객들은 그것도 마술인 줄 알았다.'
  });
  E({
    id: 'car_model_runway', age: [16, 45], cooldown: 4,
    cond: { career: ['model'] },
    text: '해외 패션위크 런웨이 마지막 순서. 구두 굽이 흔들린다.',
    choices: [
      { text: '구두를 벗고 맨발로 걷는다', check: { stat: 'looks', diff: 65 },
        success: { effects: { fame: 6, fx: ['promote'] }, log: '"맨발 워킹"이 그 시즌의 화제가 됐다.' },
        fail: { effects: { fame: -1, happy: -3 }, log: '맨발이 런웨이 끝에서 미끄러졌다.' } },
      { text: '그대로 걷는다', check: { stat: 'grit', diff: 50 },
        success: { effects: { fame: 3 }, log: '표정 하나 안 변했다. 디자이너가 백스테이지에서 안아 줬다.' },
        fail: { effects: { health: -2, happy: -3 }, log: '삐끗했다. 사진은 영원히 남았다.' } }
    ]
  });

  /* ================= BUSINESS ================= */
  E({
    id: 'car_biz_vc_pitch', age: [18, 70], cooldown: 3,
    cond: { career: ['entrepreneur'] },
    text: '투자사 대회의실, 15분의 피칭. 슬라이드 첫 장 제목에 오타가 보인다.',
    choices: [
      { text: '오타를 농담으로 승화한다', check: { stat: 'smarts', diff: 55 },
        success: { effects: { money: 50000, fame: 2, happy: 5, fx: ['promote'] }, log: '"디테일보다 비전"이라는 평과 함께 투자가 확정됐다.' },
        fail: { effects: { happy: -4 }, log: '심사역이 오타 개수를 세기 시작했다.' } },
      { text: '숫자로만 승부한다', check: { stat: 'grit', diff: 55 },
        success: { effects: { money: 40000, fx: ['promote'] }, log: '건조했지만 설득력 있었다. 계약서가 이메일로 왔다.' },
        fail: { effects: { happy: -3 }, log: '"좀 더 성장하면 다시 봅시다." 업계 언어로 "아니요"다.' } }
    ]
  });
  E({
    id: 'car_biz_cash_crunch', age: [20, 70], cooldown: 5,
    cond: { career: ['entrepreneur', 'restaurant_owner'] },
    text: '통장 잔고로 버틸 수 있는 날이 딱 두 달 남았다. 직원들 눈빛이 불안하다.',
    choices: [
      { text: '사업 방향을 확 튼다', check: { stat: 'smarts', diff: 55 },
        success: { effects: { money: 30000, happy: 4, fx: ['promote'] }, log: '버리려던 부가 기능이 대박을 쳤다.' },
        fail: { effects: { money: -10000, happy: -6, fx: ['quitJob'] }, log: '결국 폐업 신고서를 냈다. 마지막 날 직원들과 {food}[을/를] 먹었다.' } },
      { text: '내 돈을 털어 넣는다', effects: { money: -20000, grit: 3 }, log: '석 달을 더 벌었다. 그 석 달이 회사를 살릴지는 아직 모른다.' },
      { text: '가족에게 손을 벌린다', effects: { money: 8000, rel: { family: -3 } }, log: '{mother}[이/가] 적금을 깼다. 꼭 갚겠다고 다짐했다.' }
    ]
  });
  E({
    id: 'car_ceo_cook_books', age: [35, 80], cooldown: 8,
    cond: { career: ['ceo', 'accountant'], flags: ['!cooked_books'] },
    text: '분기 실적이 엉망이다. 재무 담당자가 속삭인다. "숫자를 조금만… 예쁘게 만들 수 있습니다."',
    choices: [
      { text: '있는 그대로 발표한다', effects: { money: -10000, fame: 1, happy: 1 }, log: '주가가 떨어졌지만 투자자들이 "정직한 경영"이라며 남았다.' },
      { text: '"알아서 하세요"라고 말한다', effects: { money: 80000, happy: -2, flags: ['cooked_books'] }, log: '주가가 올랐다. 이사회가 박수를 쳤다. 그 박수 소리가 이상하게 불안했다.',
        schedule: { id: 'car_books_audit', years: 3 } }
    ]
  });
  E({
    id: 'car_books_audit', age: [30, 90], weight: 1,
    cond: { flags: ['cooked_books'] },
    text: '금융감독 당국이 특별 감사를 시작했다. 3년 전 그 분기 장부가 책상 위에 펼쳐져 있다.',
    choices: [
      { text: '재무 담당자에게 책임을 돌린다', check: { stat: 'smarts', diff: 70 },
        success: { effects: { fame: -4, unflags: ['cooked_books'], fx: ['quitJob'] }, log: '빠져나왔다. 하지만 업계 전체가 {name}의 이름을 기억했다.' },
        fail: { effects: { fame: -6, money: -100000, unflags: ['cooked_books'], fx: ['jail'] }, log: '그 담당자가 녹음 파일을 갖고 있었다.' } },
      { text: '모든 책임을 진다', effects: { fame: -3, money: -150000, unflags: ['cooked_books'], fx: ['fired'] }, log: '전 재산에 가까운 과징금을 냈다. 그래도 감옥은 피했다.' }
    ]
  });
  E({
    id: 'car_ceo_power_trip', age: [35, 80], cooldown: 6,
    cond: { career: ['ceo'], level: [1, 9] },
    text: '비서가 조심스럽게 말한다. "회장님, 어제 회식 영상이 온라인에 돌고 있습니다."',
    choices: [
      { text: '직원들 앞에서 진심으로 사과한다', effects: { fame: -1, happy: -2 }, log: '사과문 대신 직접 구내식당에서 배식을 했다. 반응은 반반이었다.' },
      { text: '홍보팀에 덮으라고 지시한다', check: { stat: 'smarts', diff: 65 },
        success: { effects: { money: -20000 }, log: '기사는 내려갔다. 사람들 기억은 안 내려갔다.' },
        fail: { effects: { fame: -5, fx: ['demote'] }, log: '덮으려던 시도까지 폭로됐다. 이사회가 대표직을 내려놓으라 했다.' } }
    ]
  });
  E({
    id: 'car_office_hoesik', age: [20, 62], cooldown: 3,
    cond: { career: ['office_worker', 'marketer', 'hr_manager', 'sales_rep'] },
    text: '금요일 저녁 7시, 부장님이 외친다. "오늘 다 같이 한잔 어때?" 아무도 대답하지 않는다.',
    choices: [
      { text: '분위기를 살린다', effects: { health: -2, happy: -1, fx: ['promote'] }, log: '노래방 3차까지 갔다. 다음 인사 평가에서 효과가 있었다.' },
      { text: '"선약이 있어서요" 하고 퇴근한다', effects: { happy: 4 }, log: '선약은 침대였다. 최고의 약속이었다.' },
      { text: '부장님께 "강제 회식 그만"이라고 말한다', check: { stat: 'grit', diff: 55 },
        success: { effects: { happy: 5, fame: 1 }, log: '의외로 부장님이 "나도 사실 집에 가고 싶었어"라고 털어놨다.' },
        fail: { effects: { happy: -3, fx: ['demote'] }, log: '다음 주 {name}의 자리가 창가에서 복사기 옆으로 옮겨졌다.' } }
    ]
  });
  E({
    id: 'car_office_promotion_review', age: [24, 62], cooldown: 4,
    cond: { career: ['office_worker', 'marketer', 'hr_manager'], level: [0, 4] },
    text: '연말 인사 평가. 동기 세 명 중 한 명만 진급한다는 소문이 돈다.',
    choices: [
      { text: '성과 보고서를 다듬는다', check: { stat: 'smarts', diff: 50 },
        success: { effects: { happy: 5, money: 3000, fx: ['promote'] }, log: '명함에 새 직급이 찍혔다. {mother}에게 사진을 보냈다.' },
        fail: { effects: { happy: -4 }, log: '동기가 진급했다. 축하 문자를 쓰는 데 20분 걸렸다.' } },
      { text: '그냥 내 할 일 한다', effects: { happy: 1 }, log: '진급은 안 됐지만 칼퇴는 지켰다.' }
    ]
  });
  E({
    id: 'car_lotto_jackpot_store', age: [25, 90], cooldown: 6,
    cond: { career: ['lotto_shop_owner'] },
    text: '{name}의 가게에서 1등 당첨자가 나왔다! 아침부터 가게 앞에 줄이 끝도 없다.',
    choices: [
      { text: '"1등 명당" 현수막을 건다', effects: { money: 15000, fame: 2, fx: ['promote'] }, log: '매출이 세 배가 됐다. 정작 비결은 아무것도 없다.' },
      { text: '나도 한 장 사 본다', effects: { fx: ['buyLottery'] }, log: '남의 꿈만 팔다가 처음으로 내 꿈을 하나 샀다.' }
    ]
  });
  E({
    id: 'car_realestate_boom', age: [22, 80], cooldown: 5,
    cond: { career: ['real_estate_agent'] },
    text: '{city} 집값이 미친 듯이 오른다. 손님들이 계약서도 안 읽고 도장을 찍는다.',
    choices: [
      { text: '"지금 사야 해요"라고 부추긴다', effects: { money: 40000, happy: -2 }, log: '수수료가 쏟아졌다. 그 손님들 대출 이자가 가끔 떠오른다.' },
      { text: '냉정하게 위험을 설명한다', effects: { money: 5000, fame: 1, happy: 2 }, log: '계약은 줄었지만 "믿을 수 있는 중개사"라는 입소문이 났다.' }
    ]
  });
  E({
    id: 'car_sales_client_drinks', age: [20, 62], cooldown: 4,
    cond: { career: ['sales_rep', 'insurance_agent'] },
    text: '큰 거래처 사장님이 "이 잔 비우면 계약해 주지"라며 잔을 채운다.',
    choices: [
      { text: '원샷한다', effects: { health: -4, money: 8000, fx: ['promote'] }, log: '계약서와 숙취를 동시에 얻었다.' },
      { text: '"대신 노래 한 곡 하겠습니다"', check: { stat: 'looks', diff: 50 },
        success: { effects: { money: 6000, happy: 3 }, log: '사장님이 탬버린을 쳤다. 계약 성사.' },
        fail: { effects: { happy: -3 }, log: '음이탈. 사장님이 조용히 잔을 내려놨다.' } }
    ]
  });

  /* ================= FINANCE ================= */
  E({
    id: 'car_fin_market_crash', age: [21, 75], cooldown: 6,
    cond: { sector: ['finance'] },
    text: '장 시작 10분 만에 시장이 8% 빠졌다. 사무실 전화가 동시에 울린다.',
    choices: [
      { text: '버틴다', check: { stat: 'grit', diff: 55 },
        success: { effects: { money: 30000, happy: 4, fx: ['promote'] }, log: '석 달 뒤 반등. "강철 멘탈"이라는 별명이 생겼다.' },
        fail: { effects: { money: -15000, happy: -6, health: -2 }, log: '바닥 밑에 지하실이 있었다.' } },
      { text: '전부 손절한다', effects: { money: -5000, happy: -2 }, log: '다음 날 시장이 반등했다. 그게 시장이다.' }
    ]
  });
  E({
    id: 'car_banker_embezzle', age: [22, 65], cooldown: 8,
    cond: { career: ['banker', 'accountant', 'insurance_agent'], flags: ['!embezzled'], money: [0, 20000] },
    text: '휴면 계좌 하나가 수년째 아무도 건드리지 않은 채 잠들어 있다. 마침 {name}의 카드값이 밀렸다.',
    choices: [
      { text: '못 본 척한다', effects: { happy: 1 }, log: '카드값은 분할로 갚기로 했다. 마음은 편했다.' },
      { text: '"잠깐만 빌리는 거야"', effects: { money: 30000, happy: -3, flags: ['embezzled'] }, log: '아무도 몰랐다. 매일 아침 출근하는 발걸음이 무거웠다.',
        schedule: { id: 'car_embezzle_caught', years: 2 } },
      { text: '내부 감사팀에 신고한다', effects: { fame: 1, fx: ['promote'] }, log: '관리 허점을 찾아낸 공로로 승진했다.' }
    ]
  });
  E({
    id: 'car_embezzle_caught', age: [22, 80], weight: 1,
    cond: { flags: ['embezzled'] },
    text: '휴면 계좌의 주인이 기적처럼 나타났다. 잔고를 본 그가 은행을 뒤집어 놓는다.',
    choices: [
      { text: '돈을 메우고 자수한다', effects: { money: -35000, fame: -2, unflags: ['embezzled'], fx: ['fired'] }, log: '해고됐지만 실형은 면했다.' },
      { text: '버티며 부인한다', check: { stat: 'smarts', diff: 75 },
        success: { effects: { happy: -5, unflags: ['embezzled'] }, log: '전산 오류로 결론 났다. 하지만 {name}[은/는] 진실을 안다.' },
        fail: { effects: { fame: -5, unflags: ['embezzled'], fx: ['jail'] }, log: 'CCTV에 다 찍혀 있었다.' } }
    ]
  });
  E({
    id: 'car_crypto_moon', age: [18, 80], cooldown: 3,
    cond: { career: ['crypto_trader', 'stock_trader'] },
    text: '친구가 추천한 이름 모를 코인이 하루 만에 400% 올랐다. 단톡방이 "가즈아"로 도배된다.',
    choices: [
      { text: '지금 익절한다', effects: { money: 20000, happy: 4 }, log: '다음 날 그 코인이 0이 됐다. 인생 최고의 클릭이었다.' },
      { text: '존버한다', check: { stat: 'grit', diff: 60 },
        success: { effects: { money: 120000, happy: 8, fx: ['promote'] }, log: '1000%! 집 근처 강변을 뛰며 소리를 질렀다.' },
        fail: { effects: { money: -20000, happy: -8 }, log: '0이 됐다. 차트를 보며 강변을 걸었다. 조용히.' } }
    ]
  });
  E({
    id: 'car_insurance_family_party', age: [20, 75], cooldown: 4,
    cond: { career: ['insurance_agent'] },
    text: '{holiday} 가족 모임. {name}[이/가] 들어서자 친척들이 하나둘 화장실로 흩어진다.',
    choices: [
      { text: '오늘은 영업을 쉰다', effects: { rel: { family: 4 }, happy: 3 }, log: '처음으로 친척들과 편하게 {food}[을/를] 먹었다.' },
      { text: '삼촌을 화장실 앞에서 기다린다', effects: { money: 3000, rel: { family: -3 } }, log: '계약 하나 성사. 다음 모임 초대장은 오지 않았다.' }
    ]
  });

  /* ================= GOVERNMENT / POLITICS ================= */
  E({
    id: 'car_pol_election', age: [25, 85], cooldown: 4,
    cond: { career: ['politician'], level: [0, 3] },
    text: '선거철이다. 상대 후보는 {city} 토박이에 웃는 상까지 완벽하다.',
    choices: [
      { text: '정책 토론으로 정면 승부', check: { stat: 'smarts', diff: 55 },
        success: { effects: { fame: 4, happy: 6, fx: ['promote'] }, log: '토론 하이라이트가 퍼지며 역전승! 당선 소감에서 {mother}[을/를] 불렀다.' },
        fail: { effects: { happy: -6, money: -10000 }, log: '좋은 말만 했는데 졌다. 선거 빚만 남았다.' } },
      { text: '시장 바닥을 돌며 악수한다', check: { stat: 'looks', diff: 50 },
        success: { effects: { fame: 3, health: -2, fx: ['promote'] }, log: '{food} 시식만 200번. 체중과 득표율이 함께 올랐다.' },
        fail: { effects: { health: -2, happy: -4 }, log: '손에 굳은살만 생겼다.' } },
      { text: '상대 후보 흑색선전을 돌린다', effects: { fame: -2, flags: ['pol_dirty'], fx: ['promote'] }, log: '이겼다. 이기긴 했다.',
        schedule: { id: 'car_pol_coverup_exposed', years: 2 } }
    ]
  });
  E({
    id: 'car_pol_scandal', age: [28, 85], cooldown: 6,
    cond: { career: ['politician'], level: [1, 9], flags: ['!pol_dirty'] },
    text: '보좌관이 불법 후원금을 받아 왔다는 제보가 들어왔다. 기자들이 사무실 앞에 진을 쳤다.',
    choices: [
      { text: '먼저 공개하고 수사에 협조한다', effects: { fame: -2, happy: -2, grit: 2 }, log: '지지율이 잠깐 떨어졌다가, "정직한 정치인" 이미지로 다시 올랐다.' },
      { text: '조용히 덮는다', effects: { money: 20000, flags: ['pol_dirty'] }, log: '기자들은 흩어졌다. 일단은.',
        schedule: { id: 'car_pol_coverup_exposed', years: 2 } }
    ]
  });
  E({
    id: 'car_pol_coverup_exposed', age: [25, 95], weight: 1,
    cond: { flags: ['pol_dirty'] },
    text: '탐사보도 프로그램이 {name}의 2년 전 일을 특집으로 다뤘다. 증거 자료가 화면 가득 이어진다.',
    choices: [
      { text: '눈물의 기자회견', check: { stat: 'looks', diff: 60 },
        success: { effects: { fame: -3, unflags: ['pol_dirty'], fx: ['demote'] }, log: '한 계단 내려왔지만 정치 생명은 붙어 있다.' },
        fail: { effects: { fame: -6, unflags: ['pol_dirty'], fx: ['fired'] }, log: '눈물이 너무 연기 같았다. 당에서 제명됐다.' } },
      { text: '"정치 공작"이라고 맞선다', check: { stat: 'grit', diff: 65 },
        success: { effects: { fame: 2, unflags: ['pol_dirty'] }, log: '지지층이 결집했다. 진실은 영원히 논쟁거리가 됐다.' },
        fail: { effects: { fame: -5, money: -30000, unflags: ['pol_dirty'], fx: ['jail'] }, log: '검찰이 녹취 파일을 공개했다.' } }
    ]
  });
  E({
    id: 'car_pol_leader_crisis', age: [35, 95], cooldown: 5,
    cond: { career: ['politician'], level: [4, 9] },
    text: '{leader} 취임 후 첫 국가적 위기. 대형 태풍이 {region}[을/를] 덮쳤다. 참모들이 {name}만 쳐다본다.',
    choices: [
      { text: '현장으로 직접 간다', check: { stat: 'grit', diff: 55 },
        success: { effects: { fame: 6, health: -3 }, log: '장화를 신고 이재민과 {food}[을/를] 먹는 사진이 역사 교과서에 실렸다.' },
        fail: { effects: { fame: -3 }, log: '경호 때문에 복구 작업이 오히려 늦어졌다는 비판을 받았다.' } },
      { text: '상황실에서 지휘한다', check: { stat: 'smarts', diff: 55 },
        success: { effects: { fame: 4 }, log: '침착한 지휘로 피해가 최소화됐다. 지지율이 15% 올랐다.' },
        fail: { effects: { fame: -4, happy: -3 }, log: '보고 체계가 꼬였다. "골든타임" 논란이 1년 내내 이어졌다.' } }
    ]
  });
  E({
    id: 'car_pol_leader_worldcup', age: [35, 95], once: true,
    cond: { career: ['politician'], level: [4, 9] },
    text: '{nationalTeam}[이/가] 월드컵 결승에 올랐다. {leader}[으로/로]서 경기장 VIP석에 앉게 됐다.',
    choices: [
      { text: '응원 유니폼을 입고 관중석으로 내려간다', effects: { fame: 5, happy: 8 }, log: '골이 터지자 옆자리 시민과 얼싸안았다. 그 사진이 임기 최고의 지지율을 만들었다.' },
      { text: '라커룸을 찾아가 연설한다', check: { stat: 'football', diff: 40 },
        success: { effects: { fame: 4, happy: 5 }, log: '"축구를 아는 {leader}"라며 선수들이 진심으로 웃었다.' },
        fail: { effects: { fame: -2 }, log: '오프사이드를 잘못 설명했다. 주장이 조용히 고개를 저었다.' } }
    ]
  });
  E({
    id: 'car_pol_leader_approval', age: [35, 95], cooldown: 4,
    cond: { career: ['politician'], level: [4, 9], stats: { happy: [0, 50] } },
    text: '{leader} 지지율이 역대 최저. 참모가 "인기 유튜버 채널에 나가 보시죠"라고 제안한다.',
    choices: [
      { text: '먹방에 도전한다', check: { stat: 'looks', diff: 50 },
        success: { effects: { fame: 4, happy: 4 }, log: '{food} 다섯 그릇 완식. "의외로 귀엽다"는 댓글이 달렸다.' },
        fail: { effects: { fame: -2, health: -1 }, log: '체해서 국무회의를 미뤘다.' } },
      { text: '정책 성과로 답한다', check: { stat: 'smarts', diff: 60 },
        success: { effects: { fame: 3 }, log: '경제 지표가 개선되며 지지율이 천천히 회복됐다.' },
        fail: { effects: { happy: -4 }, log: '아무도 정책 브리핑을 끝까지 보지 않았다.' } }
    ]
  });
  E({
    id: 'car_pol_debate_meme', age: [25, 85], cooldown: 5,
    cond: { career: ['politician'], level: [0, 3] },
    text: 'TV 토론 중 계란값을 묻는 질문에 {name}[이/가] 너무 비싼 가격을 말해 버렸다.',
    choices: [
      { text: '다음 날 장바구니 들고 시장에 간다', effects: { fame: 2, happy: 1 }, log: '직접 장 보는 영상으로 반전 여론을 만들었다.' },
      { text: '"인플레이션을 예측한 것"이라 우긴다', effects: { fame: -2, happy: 2 }, log: '그 말이 밈이 됐다. 1년 뒤 실제로 계란값이 그만큼 올랐다.' }
    ]
  });
  E({
    id: 'car_diplomat_toast', age: [24, 70], cooldown: 4,
    cond: { career: ['diplomat'] },
    text: '국빈 만찬에서 갑자기 건배사를 부탁받았다. 상대국 언어로.',
    choices: [
      { text: '외워 둔 속담으로 도전', check: { stat: 'smarts', diff: 60 },
        success: { effects: { fame: 3, happy: 4, fx: ['promote'] }, log: '상대국 장관이 박수를 치며 일어섰다. 무역 협상이 순조로워졌다.' },
        fail: { effects: { happy: -3 }, log: '"우정"을 "오징어"로 발음했다. 다행히 다들 웃었다.' } },
      { text: '자국어로 정중히', effects: { happy: 1 }, log: '무난했다. 외교에서 무난함은 미덕이다.' }
    ]
  });
  E({
    id: 'car_spy_mission', age: [23, 58], cooldown: 3,
    cond: { career: ['spy'] },
    text: '해외 작전 지령이 내려왔다. 위장 신분은 "{food} 수입업자".',
    choices: [
      { text: '완벽한 위장으로 접근한다', check: { stat: 'smarts', diff: 60 },
        success: { effects: { grit: 3, happy: 3, fx: ['promote'] }, log: '임무 성공. 아무도 모를 훈장을 받았다. 정말 아무도 모른다.' },
        fail: { effects: { health: -5, fx: ['injury'] }, log: '추격전 끝에 간신히 탈출했다. 위장 사업은 의외로 흑자였다.' } },
      { text: '현지 동료에게 맡기고 지원한다', effects: { smarts: 1 }, log: '조용히 끝났다. 보고서에는 이름조차 없다.' }
    ]
  });
  E({
    id: 'car_spy_cover_question', age: [23, 60], cooldown: 5,
    cond: { career: ['spy'], rel: { friend: 'yes' } },
    text: '{friend}[이/가] 술자리에서 묻는다. "너 무역회사 다닌다며. 근데 무역 얘기를 한 번도 안 하더라?"',
    choices: [
      { text: '무역 이야기를 30분 동안 한다', check: { stat: 'smarts', diff: 50 },
        success: { effects: { happy: 2 }, log: '{friend}[이/가] 지루해서 졸았다. 완벽한 위장이다.' },
        fail: { effects: { rel: { friend: -4 } }, log: '"관세"를 "관심"이라고 했다. {friend}[이/가] 묘한 눈으로 봤다.' } },
      { text: '"사실은…" 하고 웃어넘긴다', effects: { rel: { friend: 3 }, happy: 1 }, log: '"하하, 네가 무슨 스파이냐." 그게 제일 안전한 대답이었다.' }
    ]
  });
  E({
    id: 'car_civil_servant_complaint', age: [20, 62], cooldown: 3,
    cond: { career: ['civil_servant', 'tax_auditor', 'customs_officer', 'city_mayor_aide'] },
    text: '민원인이 서류 한 장 때문에 한 시간째 고함을 친다. 뒤로는 대기 번호가 37번까지 밀렸다.',
    choices: [
      { text: '규정을 차근차근 설명한다', check: { stat: 'smarts', diff: 40 },
        success: { effects: { happy: 2 }, log: '민원인이 결국 "고맙다"며 음료수를 두고 갔다.' },
        fail: { effects: { happy: -4 }, log: '"내가 낸 세금으로 월급 받으면서!" 오늘만 다섯 번째 들었다.' } },
      { text: '규정을 살짝 융통성 있게 적용한다', effects: { happy: 2, flags: ['bent_rules'] }, log: '모두가 만족했다. 감사실만 빼고.' }
    ]
  });
  E({
    id: 'car_customs_suspicious_bag', age: [21, 62], cooldown: 4,
    cond: { career: ['customs_officer', 'coast_guard'] },
    text: '엑스레이 화면에 수상한 덩어리가 보인다. 가방 주인은 지나치게 침착하다.',
    choices: [
      { text: '직접 열어 본다', check: { stat: 'smarts', diff: 50 },
        success: { effects: { fame: 3, happy: 4, fx: ['promote'] }, log: '이중 바닥 속 밀수품을 적발했다. 뉴스에 뒷모습이 나왔다.' },
        fail: { effects: { happy: -2 }, log: '할머니가 손주에게 보내는 {food}였다. 정중히 사과했다.' } },
      { text: '그냥 통과시킨다', effects: { happy: -1 }, log: '사흘 뒤 다른 공항에서 같은 사람이 잡혔다는 뉴스를 봤다.' }
    ]
  });

  /* ================= MILITARY ================= */
  E({
    id: 'car_mil_winter_drill', age: [18, 55], cooldown: 3,
    cond: { sector: ['military'] },
    text: '영하 20도 혹한기 훈련. 반합에 담긴 라면이 먹기도 전에 얼어 간다.',
    effects: { health: -2, grit: 4 }, log: '얼어붙은 라면을 나눠 먹은 동기들과 평생 친구가 됐다.'
  });
  E({
    id: 'car_mil_disaster_relief', age: [18, 55], cooldown: 5,
    cond: { sector: ['military'] },
    text: '{region}에 산불이 번졌다. 부대에 대민 지원 명령이 떨어졌다.',
    choices: [
      { text: '최전선 방화선 작업에 자원한다', check: { stat: 'health', diff: 55 },
        success: { effects: { fame: 2, grit: 3, happy: 4, fx: ['promote'] }, log: '마을 하나를 지켜 냈다. 할머니들이 부대로 {food}[을/를] 보내 왔다.' },
        fail: { effects: { health: -5, fx: ['injury'] }, log: '연기를 너무 많이 마셨다. 사흘간 의무대 신세.' } },
      { text: '보급과 이재민 지원을 맡는다', effects: { happy: 3, rel: { family: 1 } }, log: '대피소에서 아이들과 놀아 주었다.' }
    ]
  });
  E({
    id: 'car_mil_promotion_board', age: [20, 55], cooldown: 4,
    cond: { career: ['soldier', 'army_officer', 'navy_sailor', 'special_forces'] },
    text: '진급 심사 체력 검정 날. 3km 달리기 기록이 진급을 가른다.',
    choices: [
      { text: '전력 질주', check: { stat: 'health', diff: 55 },
        success: { effects: { grit: 2, fx: ['promote'] }, log: '1등으로 들어왔다. 계급장이 하나 늘었다.' },
        fail: { effects: { happy: -3 }, log: '마지막 바퀴에서 다리가 풀렸다. 내년을 기약했다.' } },
      { text: '꾸준한 페이스로', check: { stat: 'grit', diff: 50 },
        success: { effects: { health: 1, fx: ['promote'] }, log: '조용히, 그러나 확실히 통과했다.' },
        fail: { effects: { happy: -2 }, log: '기준 기록보다 4초 늦었다.' } }
    ]
  });
  E({
    id: 'car_pilot_engine_failure', age: [22, 63], cooldown: 6,
    cond: { career: ['fighter_pilot', 'airline_pilot'] },
    text: '고도 3만 피트, 경고음이 조종석을 가득 채운다. 엔진 하나가 멈췄다.',
    choices: [
      { text: '침착하게 비상 착륙한다', check: { stat: 'smarts', diff: 60 },
        success: { effects: { fame: 5, happy: 5, fx: ['promote'] }, log: '활주로에 안착했다. 승객들의 박수 소리가 기장실까지 들렸다.' },
        fail: { effects: { health: -6, happy: -5, fx: ['injury'] }, log: '거친 착륙이었다. 모두 살았지만 조사 위원회 앞에 서야 했다.' } },
      { text: '매뉴얼을 한 줄씩 따른다', check: { stat: 'grit', diff: 50 },
        success: { effects: { grit: 2, fame: 2 }, log: '교과서 같은 대응. 이후 훈련 영상으로 쓰였다.' },
        fail: { effects: { health: -4 }, log: '매뉴얼 17페이지가 빠져 있었다. 간신히 내려왔다.' } }
    ]
  });
  E({
    id: 'car_special_forces_secret', age: [20, 45], cooldown: 5,
    cond: { career: ['special_forces', 'spy'] },
    text: '가족에게도 말할 수 없는 작전에서 돌아왔다. {mother}[이/가] "어디 갔다 왔냐"고 묻는다.',
    choices: [
      { text: '"출장"이라고만 말한다', effects: { happy: -2, rel: { mother: -1 } }, log: '{mother}[은/는] 더 묻지 않고 {food}[을/를] 차려 줬다. 그게 더 미안했다.' },
      { text: '말없이 꼭 안아 드린다', effects: { happy: 4, rel: { mother: 4 } }, log: '오래 안고 있었다. {mother}[은/는] 아무것도 묻지 않았다.' }
    ]
  });

  /* ================= PUBLIC SAFETY ================= */
  E({
    id: 'car_police_chase', age: [20, 58], cooldown: 3,
    cond: { career: ['police', 'detective'] },
    text: '오토바이 날치기범이 골목으로 꺾었다. 순찰차로는 못 들어가는 길이다.',
    choices: [
      { text: '뛰어서 쫓는다', check: { stat: 'health', diff: 55 },
        success: { effects: { fame: 2, grit: 2, fx: ['promote'] }, log: '세 블록 만에 잡았다. 다리가 아직 살아 있다.' },
        fail: { effects: { health: -3, happy: -2 }, log: '놓쳤다. 숨이 차서 무전으로 차량 번호도 제대로 못 불렀다.' } },
      { text: '골목 출구를 머리로 계산한다', check: { stat: 'smarts', diff: 50 },
        success: { effects: { smarts: 2, fx: ['promote'] }, log: '반대편 출구에서 기다렸다. 범인이 제 발로 들어왔다.' },
        fail: { effects: { happy: -2 }, log: '계산은 맞았는데 출구가 공사 중이었다.' } }
    ]
  });
  E({
    id: 'car_police_bribe', age: [20, 60], cooldown: 8,
    cond: { career: ['police', 'detective', 'prison_guard', 'customs_officer'], flags: ['!took_bribe'] },
    text: '단속에 걸린 업주가 봉투를 슬쩍 내민다. "형님, 이번 한 번만 봐주세요."',
    choices: [
      { text: '봉투를 돌려주고 원칙대로 처리한다', effects: { happy: 2, fame: 1 }, log: '업주는 투덜댔지만 다음부터 단속 기준을 지켰다.' },
      { text: '주머니에 넣는다', effects: { money: 10000, happy: -3, flags: ['took_bribe'] }, log: '퇴근길 편의점에서 비싼 맥주를 샀다. 맛이 없었다.',
        schedule: { id: 'car_bribe_caught', years: 3 } }
    ]
  });
  E({
    id: 'car_fire_rescue_child', age: [20, 55], cooldown: 5,
    cond: { career: ['firefighter'] },
    text: '불길 속 3층 창문에서 아이 울음소리가 들린다. 사다리차는 아직 오는 중이다.',
    choices: [
      { text: '계단으로 뛰어 들어간다', check: { stat: 'grit', diff: 60 },
        success: { effects: { fame: 5, happy: 8, fx: ['promote'] }, log: '아이를 안고 나오는 사진이 1면에 실렸다. 아이 손에 곰인형까지 쥐여 있었다.' },
        fail: { effects: { health: -7, fx: ['injury'] }, log: '동료가 아이를 구했다. {name}[은/는] 화상으로 한 달을 쉬었다.' } },
      { text: '매트 설치를 지휘한다', check: { stat: 'smarts', diff: 50 },
        success: { effects: { fame: 3, happy: 5 }, log: '아이가 매트 위로 무사히 뛰어내렸다.' },
        fail: { effects: { happy: -5 }, log: '시간이 조금 걸렸다. 아이는 무사했지만 그 몇 초가 계속 떠올랐다.' } }
    ]
  });
  E({
    id: 'car_fire_cat_tree', age: [20, 55], cooldown: 4,
    cond: { career: ['firefighter', 'coast_guard', 'police'] },
    text: '오늘의 출동: 가로수 꼭대기에 올라가서 내려오지 않는 고양이 한 마리.',
    effects: { happy: 3, health: -1 }, log: '사다리를 올라가자 고양이는 혼자 뛰어내려 사라졌다. 손등에 발톱 자국만 남았다.'
  });
  E({
    id: 'car_detective_cold_case', age: [26, 60], once: true,
    cond: { career: ['detective'], level: [1, 9] },
    text: '20년 된 미제 사건 파일에서 아무도 보지 못한 사진 한 장을 발견했다.',
    choices: [
      { text: '주말을 바쳐 다시 수사한다', check: { stat: 'smarts', diff: 60 },
        success: { effects: { fame: 6, happy: 6, fx: ['promote'] }, log: '범인을 잡았다. 유족이 20년 만에 처음으로 웃었다.' },
        fail: { effects: { happy: -3, health: -2 }, log: '단서는 끊겼다. 파일을 다시 상자에 넣으며 언젠가를 약속했다.' } },
      { text: '팀장에게 보고만 한다', effects: { smarts: 1 }, log: '팀장이 공을 가져갔다. 그래도 사건은 풀렸다.' }
    ]
  });
  E({
    id: 'car_lifeguard_rescue', age: [16, 50], cooldown: 3,
    cond: { career: ['lifeguard', 'lifeguard_parttime', 'coast_guard'] },
    text: '먼바다 쪽에서 허우적거리는 손이 보인다. 파도가 높다.',
    choices: [
      { text: '구조 튜브를 들고 뛰어든다', check: { stat: 'health', diff: 50 },
        success: { effects: { fame: 3, happy: 7 }, log: '무사히 구조했다. 구조된 사람이 다음 날 가족과 함께 {food}[을/를] 들고 왔다.' },
        fail: { effects: { health: -5 }, log: '동료와 함께 간신히 끌어냈다. 바닷물을 한 바가지 마셨다.' } },
      { text: '구조 보트를 호출한다', effects: { smarts: 1, happy: 2 }, log: '보트가 빨리 왔다. 정석이 가장 빠를 때도 있다.' }
    ]
  });
  E({
    id: 'car_postal_dog', age: [19, 62], cooldown: 4,
    cond: { career: ['postal_worker', 'delivery_rider', 'newspaper_carrier'] },
    text: '골목 끝 집 개가 오늘도 철문 너머로 {name}[을/를] 기다린다. 이빨을 드러내고.',
    choices: [
      { text: '간식으로 매수한다', effects: { money: -10, happy: 3 }, log: '석 달 만에 꼬리를 흔든다. 이제 그 집이 하루 중 제일 반가운 곳이다.' },
      { text: '전력 질주로 배달한다', check: { stat: 'health', diff: 40 },
        success: { effects: { health: 1 }, log: '오늘도 승리. 개와 묘한 라이벌 관계가 됐다.' },
        fail: { effects: { health: -2 }, log: '바짓단을 물렸다. 개 주인이 바지값을 줬다.' } }
    ]
  });

  /* ================= AGRICULTURE / FISHING ================= */
  E({
    id: 'car_agri_typhoon', age: [16, 90], cooldown: 4,
    cond: { sector: ['agri'] },
    text: '역대급 태풍이 {region}[으로/로] 북상 중이라는 예보. 수확까지는 2주가 남았다.',
    choices: [
      { text: '밤새 시설을 보강한다', check: { stat: 'grit', diff: 50 },
        success: { effects: { money: 5000, health: -2 }, log: '이웃 밭은 쓰러졌지만 {name}의 밭은 버텼다. 수확물을 나눠 줬다.' },
        fail: { effects: { money: -8000, health: -3 }, log: '보강한 비닐하우스째 날아갔다.' } },
      { text: '덜 익었어도 미리 수확한다', effects: { money: -2000, smarts: 1 }, log: '맛은 덜했지만 손실은 줄였다.' },
      { text: '하늘에 맡긴다', check: { stat: 'happy', diff: 50 },
        success: { effects: { money: 6000, happy: 3 }, log: '태풍이 직전에 방향을 틀었다. 운도 실력이다.' },
        fail: { effects: { money: -12000, happy: -6 }, log: '모든 게 쓸려 갔다. 농작물 재해보험을 알아봤다. 너무 늦게.' } }
    ]
  });
  E({
    id: 'car_agri_drought', age: [16, 90], cooldown: 5,
    cond: { career: ['farmer', 'rancher', 'smart_farmer', 'beekeeper'] },
    text: '석 달째 비가 오지 않는다. 땅이 거북이 등처럼 갈라졌다.',
    choices: [
      { text: '관정을 판다', effects: { money: -6000, grit: 2 }, log: '지하수가 터졌다. 동네 사람들이 물을 받으러 왔다.' },
      { text: '가뭄에 강한 작물로 바꾼다', check: { stat: 'smarts', diff: 50 },
        success: { effects: { money: 4000, smarts: 2, fx: ['promote'] }, log: '새 작물이 시장에서 대박이 났다.' },
        fail: { effects: { money: -3000 }, log: '이번엔 비가 너무 많이 왔다.' } }
    ]
  });
  E({
    id: 'car_agri_bumper_crop', age: [16, 90], cooldown: 4,
    cond: { career: ['farmer', 'smart_farmer'] },
    text: '올해는 하늘이 도왔다. 창고가 넘칠 만큼 대풍년이다.',
    effects: { money: 8000, happy: 6 }, log: '수확한 첫 상자는 {mother}에게 보냈다. 남은 건… 너무 많아서 가격이 떨어졌다.'
  });
  E({
    id: 'car_fisher_big_catch', age: [16, 85], cooldown: 3,
    cond: { career: ['fisher', 'haenyeo', 'ship_captain'] },
    text: '그물이 끊어질 듯 무겁다. 배 위의 모두가 숨을 죽인다.',
    choices: [
      { text: '힘으로 끌어올린다', check: { stat: 'health', diff: 55 },
        success: { effects: { money: 12000, happy: 6 }, log: '어판장에서 경매가 신기록을 세웠다. 오늘 저녁은 {food}다.' },
        fail: { effects: { health: -3, money: -2000 }, log: '그물이 찢어졌다. 대어는 유유히 사라졌다.' } },
      { text: '그물을 천천히 감는다', effects: { money: 5000, grit: 1 }, log: '느렸지만 확실했다. 평범한 풍어였다.' }
    ]
  });
  E({
    id: 'car_haenyeo_breath', age: [16, 85], cooldown: 3,
    cond: { career: ['haenyeo'] },
    text: '바위틈에 손바닥만 한 전복이 보인다. 숨이 거의 바닥났다.',
    choices: [
      { text: '한 번만 더 손을 뻗는다', check: { stat: 'health', diff: 60 },
        success: { effects: { money: 3000, grit: 2, fx: ['promote'] }, log: '수면 위로 솟구치며 숨비소리를 냈다. 선배들이 엄지를 들었다.' },
        fail: { effects: { health: -6, happy: -3 }, log: '눈앞이 하얘졌다. 선배가 끌어올려 줬다. 바다 욕심은 금물이다.' } },
      { text: '욕심을 버리고 올라간다', effects: { happy: 2, health: 1 }, log: '"바다는 내일도 있다." 대상군 할머니의 말이 맞았다.' }
    ]
  });
  E({
    id: 'car_bee_swarm', age: [18, 85], cooldown: 4,
    cond: { career: ['beekeeper'] },
    text: '분봉이 났다! 벌 수만 마리가 옆집 빨랫줄에 공 모양으로 매달렸다.',
    choices: [
      { text: '맨손으로 조용히 포획한다', check: { stat: 'grit', diff: 50 },
        success: { effects: { money: 2000, fame: 1 }, log: '옆집 아이가 영상을 찍었다. "벌의 아버지"라는 별명이 생겼다.' },
        fail: { effects: { health: -4, looks: -2 }, log: '얼굴이 {food}처럼 부었다.' } },
      { text: '옆집에 꿀 한 통을 들고 사과하러 간다', effects: { money: -50, rel: { family: 1 }, happy: 2 }, log: '옆집 사람이 그 꿀을 마음에 들어 해 단골이 됐다.' }
    ]
  });

  /* ================= TRADES ================= */
  E({
    id: 'car_trade_safety_gear', age: [17, 70], cooldown: 4,
    cond: { sector: ['trade'] },
    text: '찜통더위. 안전모와 장비가 오늘따라 유난히 무겁다. 반장도 잠깐 자리를 비웠다.',
    choices: [
      { text: '그래도 장비를 다 갖춘다', effects: { health: 1, grit: 1 }, log: '땀범벅이었지만, 오후에 떨어진 공구가 안전모를 때리고 튕겨 나갔다.' },
      { text: '잠깐만 벗는다', check: { stat: 'health', diff: 50 },
        success: { effects: { happy: 2 }, log: '시원했다. 아무 일도 없었다. 오늘은.' },
        fail: { effects: { health: -6, fx: ['injury'] }, log: '머리 위에서 볼트가 떨어졌다. 병원에서 반성문 대신 진단서를 받았다.' } }
    ]
  });
  E({
    id: 'car_trade_own_shop', age: [25, 70], once: true,
    cond: { career: ['electrician', 'plumber', 'carpenter', 'mechanic', 'welder'], level: [1, 2] },
    text: '단골 고객들이 "따로 차리면 다 그쪽으로 가겠다"고 한다. 통장 잔고를 확인해 본다.',
    choices: [
      { text: '독립한다', check: { stat: 'grit', diff: 50 },
        success: { effects: { money: -10000, happy: 6, fx: ['promote'] }, log: '간판에 내 이름을 걸었다. 첫 손님은 {father}였다.' },
        fail: { effects: { money: -15000, happy: -5 }, log: '고객들이 말과 달리 오지 않았다. 1년 만에 다시 직원이 됐다.' } },
      { text: '지금 자리에 남는다', effects: { happy: 1 }, log: '안정적이다. 가끔 간판 디자인을 상상해 본다.' }
    ]
  });
  E({
    id: 'car_factory_strike', age: [18, 65], cooldown: 6,
    cond: { career: ['factory_worker', 'construction_worker', 'welder'] },
    text: '노조가 파업을 결의했다. 동료들이 {name}의 대답을 기다린다.',
    choices: [
      { text: '함께 파업에 참여한다', check: { stat: 'grit', diff: 45 },
        success: { effects: { money: 4000, happy: 4 }, log: '임금이 올랐고 안전 설비가 늘었다. 연대의 맛을 알았다.' },
        fail: { effects: { money: -3000, happy: -2 }, log: '협상이 길어졌다. 두 달 치 월급이 비었다.' } },
      { text: '조용히 출근한다', effects: { money: 1000, rel: { friend: -3 } }, log: '식당에서 혼자 밥을 먹었다.' }
    ]
  });
  E({
    id: 'car_engineer_design_flaw', age: [22, 65], cooldown: 6,
    cond: { career: ['engineer', 'architect'] },
    text: '납품 직전, 설계에서 아주 작은 결함을 발견했다. 고치면 일정이 한 달 밀린다.',
    choices: [
      { text: '일정을 미루고 고친다', effects: { happy: -2, smarts: 2, fx: ['promote'] }, log: '상사에게 깨졌지만, 1년 뒤 경쟁사 리콜 뉴스를 보며 상사가 커피를 샀다.' },
      { text: '"이 정도는 괜찮겠지"', check: { stat: 'smarts', diff: 65 },
        success: { effects: { money: 5000 }, log: '정말 괜찮았다. 운이 좋았다.' },
        fail: { effects: { fame: -3, happy: -5, fx: ['fired'] }, log: '괜찮지 않았다. 리콜 공지에 {name}의 이름이 들어갔다.' } }
    ]
  });
  E({
    id: 'car_mechanic_supercar', age: [17, 70], cooldown: 5,
    cond: { career: ['mechanic', 'car_wash_parttime'] },
    text: '{bigClub} 스타 선수의 슈퍼카가 들어왔다. 열쇠를 건네며 "조심해 주세요"라고 한다.',
    choices: [
      { text: '완벽하게 정비한다', effects: { money: 2000, fame: 1, happy: 3 }, log: '선수가 사인 유니폼을 두고 갔다. 정비소 벽에 걸렸다.' },
      { text: '동네 한 바퀴만 시운전한다', check: { stat: 'grit', diff: 55 },
        success: { effects: { happy: 6 }, log: '인생 최고의 3분이었다. 아무도 모른다.' },
        fail: { effects: { money: -8000, happy: -5 }, log: '과속 카메라에 찍혔다. 고지서는 선수 집으로 갔다.' } }
    ]
  });

  /* ================= SERVICE ================= */
  E({
    id: 'car_chef_critic', age: [20, 80], cooldown: 4,
    cond: { career: ['chef', 'restaurant_owner'] },
    text: '홀 직원이 사색이 되어 주방으로 뛰어왔다. "3번 테이블, 그 유명한 미식 평론가예요!"',
    choices: [
      { text: '시그니처 메뉴로 정면 승부', check: { stat: 'grit', diff: 55 },
        success: { effects: { fame: 5, money: 20000, happy: 6, fx: ['promote'] }, log: '별점 만점 리뷰가 실렸다. 예약 전화가 멈추지 않는다.' },
        fail: { effects: { fame: -2, happy: -5 }, log: '"성의는 느껴졌다." 업계 언어로 혹평이다.' } },
      { text: '{mother}의 집밥 레시피로', check: { stat: 'smarts', diff: 50 },
        success: { effects: { fame: 4, happy: 8, rel: { mother: 3 } }, log: '평론가가 "어머니가 생각났다"며 울컥했다는 리뷰를 썼다.' },
        fail: { effects: { happy: -3 }, log: '"소박하다." 칭찬인지 아닌지 아직도 모르겠다.' } }
    ]
  });
  E({
    id: 'car_chef_kitchen_burn', age: [17, 75], cooldown: 5,
    cond: { career: ['chef'], level: [0, 2] },
    text: '저녁 피크 타임, 기름 튄 팬에 팔목을 데었다. 주문표는 아직 스무 장.',
    effects: { health: -2, grit: 3 }, log: '찬물에 10초 대고 다시 불 앞에 섰다. 셰프가 처음으로 이름을 불러 줬다.'
  });
  E({
    id: 'car_service_rude_customer', age: [17, 80], cooldown: 3,
    cond: { sector: ['service'] },
    text: '손님이 "내가 누군지 알아?"를 세 번째 외친다. 줄 선 사람들이 한숨을 쉰다.',
    choices: [
      { text: '미소로 끝까지 응대한다', effects: { grit: 2, happy: -2 }, log: '손님은 결국 사과도 없이 떠났지만, 뒷사람들이 팁을 두고 갔다.' },
      { text: '"모르겠습니다, 누구세요?"', check: { stat: 'looks', diff: 50 },
        success: { effects: { happy: 5, fame: 1 }, log: '줄 선 사람들이 박수를 쳤다. 사장님도 몰래 웃었다.' },
        fail: { effects: { happy: -2, fx: ['demote'] }, log: '알고 보니 건물주였다.' } }
    ]
  });
  E({
    id: 'car_barista_latte_art', age: [17, 70], cooldown: 4,
    cond: { career: ['barista', 'cafe_parttime'] },
    text: '라떼아트 대회 출전 권유를 받았다. 하트 성공률은 아직 반반이다.',
    choices: [
      { text: '출전한다', check: { stat: 'grit', diff: 45 },
        success: { effects: { fame: 2, happy: 5, fx: ['promote'] }, log: '백조를 그려 입상했다. 사실 하트를 그리려던 거였다.' },
        fail: { effects: { happy: -2 }, log: '심사위원이 "추상화군요"라고 했다.' } },
      { text: '연습만 더 한다', effects: { grit: 2, health: -1 }, log: '카페인 과다로 손이 떨려서 연습이 더 어려워졌다.' }
    ]
  });
  E({
    id: 'car_dogtrainer_tv', age: [20, 75], once: true,
    cond: { career: ['dog_trainer'], level: [1, 9] },
    text: '"세상에 나쁜 개는 없다" 류의 방송 섭외가 들어왔다. 첫 출연견은 소파를 일곱 개 먹은 대형견.',
    choices: [
      { text: '출연한다', check: { stat: 'grit', diff: 50 },
        success: { effects: { fame: 6, money: 20000, fx: ['promote'] }, log: '개가 처음으로 "앉아"를 했다. 보호자가 울고, 시청자도 울었다.' },
        fail: { effects: { fame: 2, happy: -2 }, log: '방송 중 {name}의 신발을 먹었다. 의외로 시청률은 좋았다.' } },
      { text: '현장 훈련에 집중한다', effects: { happy: 2, grit: 1 }, log: '조용히 개들의 인생을 바꿨다.' }
    ]
  });
  E({
    id: 'car_funeral_last_wish', age: [21, 80], cooldown: 5,
    cond: { career: ['funeral_director'] },
    text: '고인의 마지막 소원은 장례식장에서 {localClub} 응원가를 틀어 달라는 것이었다.',
    effects: { happy: 4, grit: 1 }, log: '조문객들이 울다가 웃다가 결국 따라 불렀다. 가장 따뜻한 장례식이었다.'
  });
  E({
    id: 'car_hair_disaster', age: [17, 75], cooldown: 4,
    cond: { career: ['hairdresser'] },
    text: '"다듬기만 해 주세요." 가위질 세 번 만에 손님 앞머리가 생각보다 짧아졌다.',
    choices: [
      { text: '"요즘 유행이에요"라고 한다', check: { stat: 'looks', diff: 50 },
        success: { effects: { fame: 2, happy: 3 }, log: '그 손님이 SNS에 올린 사진이 진짜로 유행이 됐다.' },
        fail: { effects: { money: -200, happy: -3 }, log: '환불해 드렸다. 모자도 하나 드렸다.' } },
      { text: '솔직히 사과하고 무료 관리를 약속한다', effects: { money: -100, happy: 1 }, log: '손님이 단골이 됐다. 정직이 최고의 마케팅이다.' }
    ]
  });
  E({
    id: 'car_flight_attendant_turbulence', age: [20, 55], cooldown: 4,
    cond: { career: ['flight_attendant', 'hotel_concierge'] },
    text: '{abroadClub} 선수단이 단체로 탑승했다. 그중 한 명이 계속 무리한 요구를 한다.',
    choices: [
      { text: '프로답게 응대한다', effects: { grit: 2, money: 300 }, log: '착륙 후 그 선수가 미안하다며 사인볼을 줬다.' },
      { text: '팀 주장에게 조용히 일러 준다', effects: { happy: 3 }, log: '주장 한마디에 기내가 조용해졌다. 리더십이 무엇인지 봤다.' }
    ]
  });

  /* ================= TRANSPORT ================= */
  E({
    id: 'car_taxi_lost_bag', age: [21, 80], cooldown: 8,
    cond: { career: ['taxi_driver'], flags: ['!kept_bag'] },
    text: '손님이 내린 뒷좌석에 묵직한 가방이 남아 있다. 지퍼 틈으로 현금 다발이 보인다.',
    choices: [
      { text: '경찰서에 맡긴다', effects: { happy: 4, fame: 2 }, log: '주인이 찾아와 사례금을 건넸다. 지역 뉴스에 "양심 택시"로 나왔다.' },
      { text: '조용히 집에 가져간다', effects: { money: 25000, happy: -3, flags: ['kept_bag'] }, log: '장판 밑에 숨겼다. 밤새 택시 블랙박스가 신경 쓰였다.',
        schedule: { id: 'car_taxi_bag_owner', years: 1 } }
    ]
  });
  E({
    id: 'car_taxi_bag_owner', age: [21, 90], weight: 1,
    cond: { flags: ['kept_bag'] },
    text: '검은 정장 차림의 남자 둘이 집 앞에 서 있다. "가방, 기억나시죠?"',
    choices: [
      { text: '가방을 돌려주며 사정한다', effects: { money: -25000, health: -2, unflags: ['kept_bag'] }, log: '돈은 돌려줬고, 다행히 이도 다 붙어 있다.' },
      { text: '경찰에 신고한다', check: { stat: 'grit', diff: 55 },
        success: { effects: { money: -25000, fame: 2, unflags: ['kept_bag'] }, log: '그들은 수배 중인 조직원이었다. 돈은 잃었지만 포상금 얘기가 나왔다.' },
        fail: { effects: { health: -6, money: -25000, unflags: ['kept_bag'], fx: ['injury'] }, log: '경찰이 오기 전에 그들이 먼저 "대화"를 했다.' } }
    ]
  });
  E({
    id: 'car_transport_drowsy', age: [21, 80], cooldown: 4,
    cond: { sector: ['transport'] },
    text: '새벽 4시, 연속 운행 12시간째. 눈꺼풀이 천근만근이다.',
    choices: [
      { text: '다음 휴게소에서 무조건 쉰다', effects: { health: 1, money: -200 }, log: '20분 쪽잠을 잤다. 배차는 늦었지만 살아서 집에 갔다.' },
      { text: '창문 열고 버틴다', check: { stat: 'health', diff: 55 },
        success: { effects: { money: 500 }, log: '무사히 도착했다. 운이 좋았다는 걸 안다.' },
        fail: { effects: { health: -8, money: -5000, fx: ['injury'] }, log: '가드레일을 긁었다. 큰 사고가 아니어서 다행이었다.' } }
    ]
  });
  E({
    id: 'car_ship_storm', age: [22, 80], cooldown: 5,
    cond: { career: ['ship_captain', 'fisher', 'navy_sailor'] },
    text: '예보에 없던 폭풍이 몰려온다. 파도가 갑판을 넘는다.',
    choices: [
      { text: '항구로 회항한다', effects: { money: -3000, smarts: 1 }, log: '조업은 망쳤지만 선원 모두 무사히 돌아왔다.' },
      { text: '폭풍을 정면으로 뚫는다', check: { stat: 'grit', diff: 60 },
        success: { effects: { money: 8000, fame: 2, fx: ['promote'] }, log: '아침 해와 함께 무사히 목적지에 닿았다. 선원들이 {name}[을/를] 다시 봤다.' },
        fail: { effects: { health: -6, money: -10000, fx: ['injury'] }, log: '배가 크게 상했다. 해경에 구조됐다.' } }
    ]
  });
  E({
    id: 'car_trucker_rest_stop', age: [21, 75], cooldown: 4,
    cond: { career: ['truck_driver', 'bus_driver'] },
    text: '단골 휴게소 식당 이모님이 오늘도 {food}에 반찬 하나를 더 얹어 준다.',
    effects: { happy: 4, health: 1 }, log: '"오늘도 조심히 가." 이 한마디가 커피보다 정신이 번쩍 들게 한다.'
  });
  E({
    id: 'car_bus_lost_kid', age: [22, 70], cooldown: 6,
    cond: { career: ['bus_driver', 'train_driver', 'taxi_driver'] },
    text: '종점에 도착했는데 맨 뒷자리에 혼자 남은 아이가 울먹이고 있다.',
    choices: [
      { text: '경찰에 연락하고 곁을 지킨다', effects: { happy: 5, fame: 1 }, log: '부모가 달려와 아이를 안았다. 다음 주에 회사로 감사 편지가 왔다.' },
      { text: '아이 말을 듣고 직접 데려다준다', check: { stat: 'smarts', diff: 45 },
        success: { effects: { happy: 6 }, log: '"저기 빨간 지붕이요!" 정확히 찾아갔다.' },
        fail: { effects: { happy: -2, fx: ['demote'] }, log: '노선 이탈로 징계를 받았다. 아이는 무사히 집에 갔다.' } }
    ]
  });
  E({
    id: 'car_drone_footage', age: [18, 65], cooldown: 5,
    cond: { career: ['drone_pilot'] },
    text: '{bigClub} 홈구장 상공 촬영 의뢰가 들어왔다. 바람이 심상치 않다.',
    choices: [
      { text: '그래도 띄운다', check: { stat: 'smarts', diff: 50 },
        success: { effects: { fame: 3, money: 3000, fx: ['promote'] }, log: '석양 속 경기장 영상이 구단 공식 채널에 걸렸다.' },
        fail: { effects: { money: -4000 }, log: '드론이 골대 그물에 걸렸다. 골키퍼가 꺼내 줬다.' } },
      { text: '촬영을 연기한다', effects: { happy: -1 }, log: '다음 날 더 좋은 하늘이 왔다.' }
    ]
  });

  /* ================= RELIGION ================= */
  E({
    id: 'car_monk_chicken', age: [16, 90], cooldown: 4,
    cond: { career: ['monk'] },
    text: '산 아래 마을 축제에서 {food} 냄새가 산사까지 올라온다. 새벽 예불이 길게 느껴진다.',
    choices: [
      { text: '더 깊이 참선한다', check: { stat: 'grit', diff: 45 },
        success: { effects: { happy: 4, smarts: 1 }, log: '냄새가 바람이 되고, 바람이 고요가 됐다.' },
        fail: { effects: { happy: -2 }, log: '참선 중 배에서 목탁 같은 소리가 났다. 큰스님이 웃었다.' } },
      { text: '내려가서 축제를 구경만 한다', effects: { happy: 3, rel: { family: 1 } }, log: '아이들이 {name}의 민머리를 쓰다듬고 갔다. 그것도 수행이다.' }
    ]
  });
  E({
    id: 'car_monk_awakening', age: [30, 95], once: true,
    cond: { career: ['monk'], level: [2, 9] },
    text: '십 년째 같은 화두를 붙잡고 앉아 있다. 오늘 새벽, 계곡물 소리가 유난히 또렷하다.',
    choices: [
      { text: '그 소리에 마음을 놓는다', check: { stat: 'happy', diff: 55 },
        success: { effects: { happy: 10, fame: 3, fx: ['promote'] }, log: '웃음이 터졌다. 이유는 설명할 수 없었다. 큰스님이 고개를 끄덕였다.' },
        fail: { effects: { grit: 2 }, log: '아직이다. 계곡물은 내일도 흐른다.' } },
      { text: '{mother}[을/를] 떠올린다', effects: { happy: 4, rel: { mother: 4 } }, log: '출가하던 날 {mother}의 뒷모습이 떠올랐다. 그날 처음으로 편지를 썼다.' }
    ]
  });
  E({
    id: 'car_priest_confession', age: [25, 85], cooldown: 6,
    cond: { career: ['priest', 'pastor'] },
    text: '고해소 너머 목소리가 떨린다. 동네에서 일어난 큰 사건의 진범인 것 같다.',
    choices: [
      { text: '자수하도록 끝까지 설득한다', check: { stat: 'smarts', diff: 55 },
        success: { effects: { happy: 5, fame: 2 }, log: '다음 날 그 사람이 경찰서에 걸어 들어갔다는 소식이 들렸다.' },
        fail: { effects: { happy: -5 }, log: '그는 사라졌다. 비밀은 {name}의 가슴속에 영원히 남았다.' } },
      { text: '조용히 기도해 준다', effects: { happy: -2, grit: 2 }, log: '맡은 일을 했다. 그날 밤은 오래 잠들지 못했다.' }
    ]
  });
  E({
    id: 'car_shaman_prophecy', age: [18, 95], cooldown: 4,
    cond: { career: ['shaman'] },
    text: '굿판을 찾은 손님이 묻는다. "{nationalTeam}, 이번 대회 우승할까요?"',
    choices: [
      { text: '"우승한다!"고 외친다', check: { stat: 'smarts', diff: 55 },
        success: { effects: { fame: 6, money: 15000, fx: ['promote'] }, log: '진짜로 우승했다. 점집 앞에 줄이 세 블록 섰다.' },
        fail: { effects: { fame: -3 }, log: '조별 예선 탈락. "기운이 바뀌었다"고 해명했다.' } },
      { text: '"공은 둥글다"고 모호하게 답한다', effects: { money: 300, happy: 1 }, log: '어떤 결과가 나와도 틀리지 않는 명답이었다.' }
    ]
  });
  E({
    id: 'car_religion_doubt', age: [25, 85], cooldown: 8,
    cond: { sector: ['religion'], stats: { happy: [0, 35] } },
    text: '기도가 텅 빈 방에 울리는 것 같은 날들이 이어진다. 처음으로 이 길이 맞는지 묻는다.',
    choices: [
      { text: '스승을 찾아간다', effects: { happy: 5, smarts: 1 }, log: '"의심도 신앙의 일부다." 스승의 차 한 잔이 길을 다시 밝혀 줬다.' },
      { text: '세속으로 돌아간다', effects: { happy: 2, fx: ['quitJob'] }, log: '오래된 옷을 다시 입었다. {mother}[이/가] 말없이 {food}[을/를] 끓여 줬다.' }
    ]
  });
  E({
    id: 'car_missionary_clinic', age: [22, 75], cooldown: 5,
    cond: { career: ['missionary', 'pastor'] },
    text: '오지 마을에 작은 진료소를 세우자는 이야기가 나왔다. 모금액은 목표의 절반.',
    choices: [
      { text: '내 저축을 보탠다', effects: { money: -5000, happy: 7, fame: 1 }, log: '진료소 문 앞에 아이들이 줄을 섰다. 간판엔 이름을 넣지 않았다.' },
      { text: '{city}에서 자선 축구 경기를 연다', alt: { text: '{city}에서 자선 바자회를 연다', check: { stat: 'social', diff: 40 },
        success: { log: '바자회가 북적였고, 모금액이 다 찼다.' }, fail: { log: '손님이 생각보다 적었다. 그래도 모금은 꽤 됐다.' } }, check: { stat: 'football', diff: 40 },
        success: { effects: { fame: 3, happy: 5 }, log: '{name}의 헤딩골에 관중이 열광했고, 모금액이 다 찼다.' },
        fail: { effects: { happy: 2 }, log: '자책골을 넣었다. 그래도 모금은 꽤 됐다.' } }
    ]
  });

  /* ================= CRIME ================= */
  E({
    id: 'car_crime_police_raid', age: [14, 80], cooldown: 3,
    cond: { sector: ['crime'] },
    text: '새벽, 아지트 밖에 경광등 불빛이 번쩍인다. "경찰이다! 꼼짝 마!"',
    choices: [
      { text: '뒷창문으로 도망친다', check: { stat: 'health', diff: 55 },
        success: { effects: { health: -1, grit: 2 }, log: '지붕을 세 개 넘었다. 축구로 단련한 다리가 이럴 때 쓰일 줄이야.' },
        fail: { effects: { health: -3, fx: ['jail'] }, log: '빨랫줄에 걸려 넘어졌다. 수갑이 차가웠다.' } },
      { text: '아는 경찰에게 돈을 찔러준다', req: { money: 5000 }, check: { stat: 'smarts', diff: 50 },
        success: { effects: { money: -5000 }, log: '이번엔 넘어갔다. 그 경찰의 미소가 오래 기억에 남았다.' },
        fail: { effects: { money: -5000, fx: ['jail'] }, log: '하필 감찰반 앞에서 봉투를 내밀었다.' } },
      { text: '순순히 손을 든다', effects: { happy: -3, fx: ['jail'] }, log: '반항하지 않아 형량이 줄었다. {mother}[이/가] 면회 오는 길을 생각하니 마음이 무너졌다.' }
    ]
  });
  E({
    id: 'car_crime_betrayal', age: [16, 80], cooldown: 5,
    cond: { career: ['gangster', 'drug_smuggler', 'con_artist', 'cat_burglar', 'counterfeiter', 'loan_shark'] },
    text: '오른팔처럼 믿던 동료가 경찰과 거래했다는 소문이 들린다.',
    choices: [
      { text: '먼저 정리한다', check: { stat: 'grit', diff: 55 },
        success: { effects: { money: 10000, happy: -4, fx: ['promote'] }, log: '조직 안 입지는 단단해졌다. 잠은 더 얕아졌다.' },
        fail: { effects: { health: -5, fx: ['injury'] }, log: '역으로 당했다. 누구도 믿을 수 없다는 걸 배웠다.' } },
      { text: '직접 만나서 묻는다', check: { stat: 'smarts', diff: 50 },
        success: { effects: { happy: 2, rel: { friend: 2 } }, log: '오해였다. 그는 {name} 대신 형을 살겠다고까지 했다.' },
        fail: { effects: { happy: -2, fx: ['jail'] }, log: '그 자리에 녹음기가 있었다.' } },
      { text: '모든 걸 버리고 사라진다', effects: { money: -5000, happy: 1, fx: ['quitJob'] }, log: '새 도시, 새 이름. 뒤를 돌아보는 버릇만 남았다.' }
    ]
  });
  E({
    id: 'car_crime_go_straight', age: [16, 80], cooldown: 6,
    cond: { sector: ['crime'], flags: ['!went_straight'] },
    text: '{mother}[이/가] {name}의 방에서 현금 뭉치를 발견하고 아무 말 없이 울고 있다.',
    choices: [
      { text: '손을 씻겠다고 약속한다', effects: { happy: 3, rel: { mother: 8 }, flags: ['went_straight'], fx: ['quitJob'] }, log: '{mother}[이/가] {name}의 손을 오래 잡았다. 이제 정직하게 살아 볼 거다.',
        schedule: { id: 'car_crime_old_crew', years: 2 } },
      { text: '"엄마는 몰라도 돼"', effects: { money: 3000, rel: { mother: -8 }, happy: -4 }, log: '방문이 닫혔다. 그날 이후 집밥이 식어 있었다.' }
    ]
  });
  E({
    id: 'car_crime_old_crew', age: [18, 85], weight: 1, once: true,
    cond: { flags: ['went_straight'] },
    text: '정직하게 산 지 2년. 옛 동료가 일터 앞에 나타났다. "딱 한 건만. 너 없인 안 돼."',
    choices: [
      { text: '단호하게 돌려보낸다', check: { stat: 'grit', diff: 50 },
        success: { effects: { happy: 5, grit: 3 }, log: '그의 뒷모습을 보며 진짜로 끝났다는 걸 알았다.' },
        fail: { effects: { happy: -3, health: -3 }, log: '거절은 했지만 그들은 경고를 남기고 갔다. 한동안 불을 켜고 잤다.' } },
      { text: '"딱 한 번만"', check: { stat: 'smarts', diff: 60 },
        success: { effects: { money: 30000, happy: -4, unflags: ['went_straight'] }, log: '성공했다. 그리고 다시 그 세계에 한 발이 걸쳐졌다.' },
        fail: { effects: { unflags: ['went_straight'], fx: ['jail'] }, log: '함정이었다. 동료는 이미 경찰과 손잡고 있었다.' } }
    ]
  });
  E({
    id: 'car_crime_big_score', age: [18, 75], cooldown: 4,
    cond: { career: ['gangster', 'cat_burglar', 'con_artist', 'cyber_criminal'], level: [1, 9] },
    text: '인생을 바꿀 "마지막 한 건" 제안이 들어왔다. 다들 그게 마지막이라고 말한다.',
    choices: [
      { text: '치밀하게 계획한다', check: { stat: 'smarts', diff: 65 },
        success: { effects: { money: 120000, fame: 2, fx: ['promote'] }, log: '완벽했다. 뉴스는 "미스터리 사건"이라고만 불렀다.' },
        fail: { effects: { money: -10000, fx: ['jail'] }, log: '계획서를 휴대폰 메모장에 써 둔 게 실수였다.' } },
      { text: '이번엔 빠진다', effects: { happy: 2 }, log: '사흘 뒤 그 일당이 전원 체포됐다는 뉴스를 봤다.' }
    ]
  });
  E({
    id: 'car_pickpocket_photo', age: [14, 60], cooldown: 5,
    cond: { career: ['pickpocket'] },
    text: '훔친 지갑 안에 돈은 몇 푼 없고, 아이와 찍은 낡은 가족사진 한 장이 들어 있다.',
    choices: [
      { text: '우체통에 지갑을 넣는다', effects: { happy: 4 }, log: '지갑이 주인에게 돌아갔다는 걸 확인할 길은 없지만, 그렇게 믿기로 했다.' },
      { text: '돈만 빼고 버린다', effects: { money: 40, happy: -3 }, log: '그 사진 속 아이의 얼굴이 계속 떠올랐다.' },
      { text: '이 일을 그만둔다', effects: { happy: 3, grit: 2, fx: ['quitJob'] }, log: '빠른 손을 다른 데 쓰기로 했다. 일단 {food} 가게 아르바이트부터.' }
    ]
  });
  E({
    id: 'car_gangster_turf_war', age: [16, 65], cooldown: 4,
    cond: { career: ['gangster'] },
    text: '라이벌 조직이 {city} 유흥가 구역을 넘보고 있다. 형님이 "네가 앞장서라"고 한다.',
    choices: [
      { text: '앞장선다', check: { stat: 'health', diff: 60 },
        success: { effects: { money: 20000, fame: 1, fx: ['promote'] }, log: '구역을 지켰다. 다음 날부터 다들 고개를 숙였다.' },
        fail: { effects: { health: -8, fx: ['seriousInjury'] }, log: '병원에서 깨어났다. 형님은 병문안을 오지 않았다.' } },
      { text: '협상 테이블을 마련한다', check: { stat: 'smarts', diff: 55 },
        success: { effects: { money: 10000, smarts: 1, fx: ['promote'] }, log: '피 한 방울 없이 끝냈다. "머리 쓰는 놈"이라는 평판이 생겼다.' },
        fail: { effects: { fame: -1, happy: -3, fx: ['demote'] }, log: '"약해 빠졌다"며 형님이 막내 일을 다시 시켰다.' } }
    ]
  });
  E({
    id: 'car_smuggler_airport', age: [18, 60], cooldown: 3,
    cond: { career: ['drug_smuggler'] },
    text: '공항 검색대 앞. 탐지견이 {name}의 가방 쪽으로 코를 킁킁거린다.',
    choices: [
      { text: '태연하게 개를 쓰다듬는다', check: { stat: 'grit', diff: 60 },
        success: { effects: { money: 40000, fx: ['promote'] }, log: '개가 하품을 하고 지나갔다. 다리가 풀린 건 비행기 화장실에서였다.' },
        fail: { effects: { happy: -6, fx: ['jail'] }, log: '개는 거짓말을 하지 않는다.' } },
      { text: '가방을 버리고 돌아선다', effects: { money: -20000, happy: -2, flags: ['owes_cartel'] }, log: '살았다. 대신 조직에 큰 빚을 졌다.' }
    ]
  });
  E({
    id: 'car_conartist_conscience', age: [18, 80], cooldown: 5,
    cond: { career: ['con_artist', 'loan_shark'] },
    text: '이번 "고객"은 평생 모은 돈을 손에 쥔 할머니. {mother}[과/와] 같은 미소를 짓는다.',
    choices: [
      { text: '계획대로 진행한다', effects: { money: 30000, happy: -6, fx: ['promote'] }, log: '돈은 들어왔다. 그날 {mother}의 전화를 받지 못했다.' },
      { text: '그냥 차만 마시고 나온다', effects: { happy: 4, money: -100 }, log: '할머니가 손주 자랑을 한 시간 했다. 이상하게 마음이 편했다.' },
      { text: '할머니에게 사기 수법을 경고해 준다', effects: { happy: 6, grit: 2, fx: ['quitJob'] }, log: '"자네 같은 사람이 있어 세상이 살 만하네." 그 말에 이 일을 그만뒀다.' }
    ]
  });
  E({
    id: 'car_cyber_trace', age: [16, 65], cooldown: 4,
    cond: { career: ['cyber_criminal'] },
    text: '해킹 중 화면에 메시지가 뜬다. "재밌네. 우리랑 일해 볼래? — 사이버수사대"',
    choices: [
      { text: '제안을 받아들인다', effects: { happy: 3, smarts: 2, fx: ['quitJob'] }, log: '어둠의 해커에서 공식 보안 자문이 됐다. 월급은 적지만 숙면은 길다.' },
      { text: '서버를 날리고 잠적한다', check: { stat: 'smarts', diff: 70 },
        success: { effects: { money: 20000, grit: 1 }, log: '흔적 하나 없이 사라졌다. 적어도 그렇게 믿는다.' },
        fail: { effects: { fame: -2, fx: ['jail'] }, log: '그 메시지 자체가 추적 프로그램이었다.' } }
    ]
  });
  E({
    id: 'car_loanshark_childhood_friend', age: [22, 75], cooldown: 6,
    cond: { career: ['loan_shark'] },
    text: '오늘 수금 대상은 {hometown} 시절 같이 공을 차던 친구다. 그가 고개를 못 든다.',
    choices: [
      { text: '빚을 탕감해 준다', effects: { money: -10000, happy: 6, rel: { friend: 4 } }, log: '친구가 울며 "언젠가 꼭 갚겠다"고 했다. 이번엔 이자 없이.' },
      { text: '일은 일이다', effects: { money: 10000, happy: -6 }, log: '돈은 받았다. {hometown}에는 다시 내려가지 못할 것 같다.' }
    ]
  });

  /* ================= MEDIA ================= */
  E({
    id: 'car_media_scoop', age: [22, 70], cooldown: 5,
    cond: { career: ['journalist', 'tv_producer'] },
    text: '대기업 비리를 증명할 내부 문서를 손에 넣었다. 그날 밤 윗선에서 전화가 온다. "그 기사, 내리지?"',
    choices: [
      { text: '보도를 강행한다', check: { stat: 'grit', diff: 55 },
        success: { effects: { fame: 6, happy: 6, fx: ['promote'] }, log: '1면 특종. 국정조사가 열렸다. 기자상을 받으며 {mother}에게 트로피를 바쳤다.' },
        fail: { effects: { happy: -5, fx: ['demote'] }, log: '기사는 나갔지만 {name}[은/는] 지방 지국으로 발령 났다.' } },
      { text: '기사를 묻는다', effects: { money: 5000, happy: -5 }, log: '석 달 뒤 다른 매체가 그 기사를 썼다. 서랍 속 문서가 무거웠다.' }
    ]
  });
  E({
    id: 'car_anchor_blooper', age: [20, 75], cooldown: 4,
    cond: { career: ['news_anchor', 'radio_dj', 'sports_pundit'] },
    text: '생방송 중 웃음이 터졌다. 멈추려고 할수록 더 웃긴다. 카메라가 계속 돌아간다.',
    choices: [
      { text: '솔직하게 "죄송합니다, 잠시만요" 한다', effects: { fame: 3, happy: 3 }, log: '그 영상은 "올해의 방송사고"로 뽑히며 오히려 호감도를 올렸다.' },
      { text: '입술을 깨물고 버틴다', check: { stat: 'grit', diff: 55 },
        success: { effects: { grit: 2 }, log: '끝까지 버텼다. 눈물이 고였지만 목소리는 떨리지 않았다.' },
        fail: { effects: { fame: 2, happy: -2 }, log: '코로 웃음이 새어 나왔다. 그 소리가 밈이 됐다.' } }
    ]
  });
  E({
    id: 'car_paparazzi_big_shot', age: [20, 65], cooldown: 4,
    cond: { career: ['paparazzi'] },
    text: '잠복 12시간째, 톱스타가 동네 {food} 집에서 혼자 울며 밥을 먹는 장면을 포착했다.',
    choices: [
      { text: '특종으로 판다', effects: { money: 15000, happy: -4, fx: ['promote'] }, log: '조회수는 대박이었다. 그 스타의 공백기가 길어졌다.' },
      { text: '카메라를 내린다', effects: { happy: 5, rel: { friend: 1 } }, log: '대신 옆 테이블에서 같은 메뉴를 시켰다. 맛있었다.' }
    ]
  });
  E({
    id: 'car_director_premiere', age: [25, 85], cooldown: 4,
    cond: { career: ['film_director'], level: [2, 9] },
    text: '신작 시사회. 상영이 끝나고 불이 켜지는 3초, 객석의 반응이 모든 걸 결정한다.',
    choices: [
      { text: '객석 맨 뒤에서 지켜본다', check: { stat: 'smarts', diff: 60 },
        success: { effects: { fame: 7, money: 200000, happy: 8, fx: ['promote'] }, log: '기립 박수. 천만 관객 돌파 축하 현수막이 걸렸다.' },
        fail: { effects: { fame: -2, money: -20000, happy: -6 }, log: '하품 소리가 들렸다. 평론가는 "야심은 컸다"고 썼다.' } },
      { text: '로비에서 {mother}[과/와] 기다린다', effects: { happy: 5, rel: { mother: 4 } }, log: '흥행은 몰라도 {mother}[은/는] 세 번 울었다고 했다.' }
    ]
  });
  E({
    id: 'car_radio_sad_story', age: [20, 80], cooldown: 5,
    cond: { career: ['radio_dj'] },
    text: '사연 엽서 한 장. "아버지가 아프신데, 아버지가 좋아하던 노래를 신청합니다."',
    effects: { happy: 3, fame: 1 }, log: '노래가 흐르는 동안 마이크를 끄고 잠시 울었다. 그날 청취자 문자가 평소의 세 배였다.'
  });

  /* ================= PART-TIME ================= */
  E({
    id: 'car_pt_first_paycheck', age: [14, 25], once: true,
    cond: { sector: ['parttime'] },
    text: '태어나 처음 받은 월급. 통장 알림을 다섯 번은 다시 봤다.',
    choices: [
      { text: '{mother}에게 내복을 사 드린다', effects: { money: -100, happy: 6, rel: { mother: 8 } }, log: '{mother}[은/는] 내복을 장롱 깊숙이 넣어 두고 "아까워서 못 입겠다"고 했다.' },
      { text: '꿈의 축구화를 산다', effects: { money: -200, happy: 5, football: 1 }, log: '새 축구화 냄새를 맡으며 잠들었다.' },
      { text: '전부 저금한다', effects: { grit: 2, smarts: 1 }, log: '통장 숫자를 보며 혼자 흐뭇해했다.' }
    ]
  });
  E({
    id: 'car_pt_rude_customer', age: [14, 40], cooldown: 3,
    cond: { sector: ['parttime'] },
    text: '손님이 계산대에 동전을 던지며 "빨리빨리 안 해?"라고 소리친다.',
    choices: [
      { text: '꾹 참고 웃는다', effects: { grit: 2, happy: -2 }, log: '퇴근길에 {friend}[과/와] 그 손님 흉내를 내며 실컷 웃었다.' },
      { text: '"던지지 말아 주세요"라고 또박또박 말한다', check: { stat: 'grit', diff: 40 },
        success: { effects: { happy: 4 }, log: '손님이 머쓱해하며 동전을 주웠다. 뒤에 선 할머니가 엄지를 들었다.' },
        fail: { effects: { happy: -3, fx: ['fired'] }, log: '본사에 항의 전화가 갔다. 사장님은 손님 편이었다.' } }
    ]
  });
  E({
    id: 'car_pt_unpaid_wage', age: [14, 30], cooldown: 5,
    cond: { sector: ['parttime'] },
    text: '사장님이 "요즘 장사가 안 돼서"라며 이번 달 알바비를 다음 달로 미룬다. 벌써 두 번째다.',
    choices: [
      { text: '노동청에 신고한다', check: { stat: 'smarts', diff: 40 },
        success: { effects: { money: 600, happy: 3, fx: ['quitJob'] }, log: '밀린 돈을 다 받았다. 그 가게 문은 다시 열지 않았다.' },
        fail: { effects: { happy: -2 }, log: '서류가 복잡해서 포기했다. 대신 친구들에게 그 가게를 조심하라고 알렸다.' } },
      { text: '한 달 더 믿어 본다', effects: { happy: -2, rel: { family: -1 } }, log: '다음 달에 반만 받았다.' },
      { text: '{father}에게 말한다', effects: { rel: { father: 4 }, money: 400 }, log: '{father}[이/가] 가게에 찾아가 조용히 이야기했다. 다음 날 돈이 들어왔다.' }
    ]
  });
  E({
    id: 'car_pt_conv_night', age: [15, 40], cooldown: 3,
    cond: { career: ['convenience_clerk'] },
    text: '새벽 3시, 정장 차림 손님이 컵라면 하나를 들고 계산대 앞에서 한참을 서 있다.',
    choices: [
      { text: '"오늘 힘드셨죠" 하고 삼각김밥을 덤으로 준다', effects: { money: -2, happy: 5 }, log: '손님이 아무 말 없이 고개를 숙였다. 다음 주에 음료수 한 박스가 배달됐다.' },
      { text: '그냥 계산만 한다', effects: { smarts: 1 }, log: '세상엔 다들 각자의 새벽이 있다.' }
    ]
  });
  E({
    id: 'car_pt_delivery_storm', age: [16, 50], cooldown: 3,
    cond: { career: ['delivery_rider'] },
    text: '폭우 경보. 배달 요금이 세 배로 올랐다. 도로는 강이 됐다.',
    choices: [
      { text: '우비를 입고 달린다', check: { stat: 'health', diff: 45 },
        success: { effects: { money: 400, grit: 2 }, log: '하룻밤에 일주일 치를 벌었다. 손님이 수건을 건네줬다.' },
        fail: { effects: { health: -5, money: -300, fx: ['injury'] }, log: '빗길에 미끄러졌다. 음식과 함께 무릎도 날아갔다.' } },
      { text: '오늘은 쉰다', effects: { happy: 2 }, log: '창밖 빗소리를 들으며 직접 {food}[을/를] 시켜 먹었다. 배달 기사님께 팁을 넉넉히 줬다.' }
    ]
  });
  E({
    id: 'car_pt_cafe_scout', age: [15, 30], once: true,
    cond: { career: ['cafe_parttime', 'fastfood_crew', 'cinema_parttime'], stats: { looks: [60, 100] } },
    text: '단골손님이 명함을 내민다. "연예기획사 실장입니다. 혹시 오디션 볼 생각 없어요?"',
    choices: [
      { text: '오디션을 보러 간다', check: { stat: 'looks', diff: 65 },
        success: { effects: { fame: 3, happy: 6, flags: ['scouted'] }, log: '2차까지 붙었다. 연습생 계약 이야기가 오갔다.' },
        fail: { effects: { happy: -2 }, log: '"다음에 연락드릴게요." 연락은 오지 않았다.' } },
      { text: '"전 커피가 좋아요"', effects: { happy: 2 }, log: '명함은 계산대 밑에 붙여 뒀다. 가끔 쳐다본다.' }
    ]
  });
  E({
    id: 'car_pt_ballboy_star', age: [14, 19], cooldown: 2,
    cond: { career: ['ballboy'] },
    text: '{bigClub} 경기, 터치라인 밖으로 나온 공을 건네자 에이스가 윙크하며 "고마워, 꼬마"라고 한다.',
    choices: [
      { text: '공을 기가 막히게 발로 띄워 건넨다', check: { stat: 'football', diff: 40 },
        success: { effects: { football: 2, fame: 1, happy: 6 }, log: '중계 카메라에 잡혔다. 해설진이 "볼보이 기술 좋네요!"라고 했다.' },
        fail: { effects: { happy: -1 }, log: '공이 엉뚱하게 관중석으로 날아갔다. 관중이 웃었다.' } },
      { text: '교과서처럼 손으로 건넨다', effects: { happy: 3, grit: 1 }, log: '경기 후 그 선수가 장갑을 던져 줬다. 평생의 보물이 됐다.' }
    ]
  });
  E({
    id: 'car_pt_exam_week', age: [14, 19], cooldown: 2,
    cond: { sector: ['parttime'], edu: ['middle', 'high'] },
    text: '시험이 사흘 남았는데 알바 사장님이 주말 대타를 부탁한다.',
    choices: [
      { text: '공부를 택한다', effects: { smarts: 3, money: -100 }, log: '시험은 생각보다 잘 봤다. 사장님은 조금 서운해했다.' },
      { text: '돈을 택한다', effects: { money: 200, smarts: -2 }, log: '주말 수당은 짭짤했다. 성적표는 짭짤하지 않았다.' },
      { text: '계산대 밑에서 몰래 공부한다', check: { stat: 'grit', diff: 45 },
        success: { effects: { smarts: 2, money: 200 }, log: '두 마리 토끼를 다 잡았다.' },
        fail: { effects: { smarts: -1, fx: ['fired'] }, log: '사장님에게 들켰다.' } }
    ]
  });
  E({
    id: 'car_pt_mascot_heat', age: [16, 50], cooldown: 3,
    cond: { career: ['mascot_parttime'] },
    text: '한여름 {localClub} 경기장, 인형탈 속 온도가 40도를 넘었다. 아이들이 사진을 찍자며 몰려온다.',
    choices: [
      { text: '끝까지 춤을 춘다', check: { stat: 'health', diff: 50 },
        success: { effects: { fame: 1, happy: 5, fx: ['promote'] }, log: '아이들 환호에 구단이 정식 마스코트 계약을 제안했다.' },
        fail: { effects: { health: -4 }, log: '어지러워서 주저앉았다. 아이들이 "인형이 잔다"고 했다.' } },
      { text: '그늘에서 손만 흔든다', effects: { health: 1, happy: 1 }, log: '최소한의 동작으로 최대한의 귀여움을 연출했다.' }
    ]
  });
  E({
    id: 'car_pt_tutor_student', age: [16, 40], cooldown: 3,
    cond: { career: ['tutor_parttime'] },
    text: '과외 학생이 문제를 풀다 말고 묻는다. "쌤, 공부 왜 해야 돼요?"',
    choices: [
      { text: '진지하게 인생 이야기를 해 준다', check: { stat: 'smarts', diff: 45 },
        success: { effects: { happy: 4, money: 300 }, log: '학생 성적이 올랐고, 학부모가 동생 과외까지 부탁했다.' },
        fail: { effects: { happy: -1 }, log: '이야기가 길어져서 진도를 하나도 못 나갔다.' } },
      { text: '"나도 몰라. 일단 풀자"', effects: { happy: 2 }, log: '솔직함에 학생이 웃었다. 그날따라 문제를 잘 풀었다.' }
    ]
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
