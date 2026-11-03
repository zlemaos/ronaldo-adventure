/* Route moments (round 7): decisions that belong to one route and fire only on it (ev.routes).
 * Every ladder route also gets a yearly line per stage (data/routes.js lines) and the engine's
 * entry / crossroads / next-route events (js/routes.js). Ids: rt_<route>_<n>.
 * FX: rtSkill (+route skill), rtBig (big step + fame), rtSetback, rtInjury, rtScandal, rtBurnout. */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};
  var EV = RA.data.events = RA.data.events || [];
  var n = {};
  function M(route, age, text, choices, extra) {
    n[route] = (n[route] || 0) + 1;
    var ev = { id: 'rt_' + route + '_' + n[route], routes: [route], age: age, cooldown: 3, weight: 14, decision: true, text: text, choices: choices };
    for (var k in extra || {}) ev[k] = extra[k];
    EV.push(ev);
  }
  var SAFE = { health: 2, happy: 1 };

  // ---------------------------------------------------------------- 농구
  M('basketball', [11, 24], '연습 경기 막판, 동점 상황에서 공이 내게 왔다. 슛 각이 애매하다.', [
    { text: '그대로 3점 슛을 던진다', check: { stat: 'grit', diff: 45 },
      success: { effects: { fame: 2, happy: 5, fx: ['rtSkill'] }, log: '버저와 함께 그물이 출렁였다. 벤치가 뛰쳐나왔다.' },
      fail: { effects: { happy: -3 }, log: '림을 맞고 튀었다. 그날 밤 슛 연습을 오백 개 더 했다.' } },
    { text: '골밑 동료에게 패스한다', effects: { social: 2, fx: ['rtSkill'] }, log: '어시스트가 기록됐다. 감독이 고개를 끄덕였다.' }
  ]);
  M('basketball', [18, 36], '착지하다 발목이 꺾였다. 플레이오프가 2주 남았다.', [
    { text: '진통제를 맞고 뛴다', risky: true, check: { stat: 'health', diff: 60 },
      success: { effects: { fame: 3, fx: ['rtBig'] }, log: '절뚝이며 20득점. 팬들이 기립 박수를 쳤다.' },
      fail: { effects: { fx: ['rtInjury'] }, log: '2쿼터에 다시 쓰러졌다. 들것이 들어왔다.' } },
    { text: '재활에 전념한다', effects: SAFE, log: '플레이오프는 벤치에서 봤다. 대신 다음 시즌을 온전히 뛰었다.' }
  ], { stages: ['rookie', 'starter', 'star', 'veteran'] });
  M('basketball', [20, 38], '해외 리그에서 영입 제안이 왔다. 연봉은 두 배, 말은 하나도 안 통한다.', [
    { text: '간다', check: { stat: 'grit', diff: 55 },
      success: { effects: { money: 20000, fame: 4, fx: ['rtBig'] }, log: '낯선 체육관이 내 이름을 외쳤다.' },
      fail: { effects: { happy: -5, fx: ['rtSetback'] }, log: '벤치만 지키다 한 시즌 만에 돌아왔다.' } },
    { text: '익숙한 팀에 남는다', effects: { social: 2, happy: 2 }, log: '팬들이 "의리"라는 현수막을 걸었다.' }
  ], { stages: ['starter', 'star'] });

  // ---------------------------------------------------------------- 야구
  M('baseball', [10, 24], '감독이 투수와 타자 중 하나를 고르라고 한다.', [
    { text: '마운드에 선다', check: { stat: 'health', diff: 40 },
      success: { effects: { grit: 2, fx: ['rtSkill'] }, log: '불펜에서 공 백 개를 던졌다. 어깨가 뜨겁다.' },
      fail: { effects: { health: -4, grit: 1 }, log: '공을 너무 많이 던져 팔꿈치가 붓기 시작했다. 감독이 한 달 투구 금지를 내렸다.' } },
    { text: '방망이를 잡는다', effects: { health: 1, fx: ['rtSkill'] }, log: '배팅 케이지에서 손바닥 물집이 터졌다.' }
  ]);
  M('baseball', [18, 38], '9회 말 2사 만루, 풀카운트. 다음 공이 인생을 바꿀 수 있다.', [
    { text: '노리던 공을 기다린다', check: { stat: 'grit', diff: 50 },
      success: { effects: { fame: 4, happy: 6, fx: ['rtBig'] }, log: '끝내기 안타! 더그아웃에서 물세례를 받았다.' },
      fail: { effects: { happy: -4 }, log: '헛스윙 삼진. 관중석의 한숨이 오래 들렸다.' } },
    { text: '무조건 방망이를 낸다', check: { odds: 0.35 },
      success: { effects: { fame: 3, fx: ['rtSkill'] }, log: '빗맞은 공이 내야를 넘어갔다. 운도 실력이다.' },
      fail: { effects: { happy: -3 }, log: '내야 땅볼. 경기 끝.' } }
  ], { stages: ['first', 'regular', 'ace', 'veteran'] });
  M('baseball', [24, 40], '팔꿈치에서 찌릿한 통증이 계속된다. 수술하면 1년을 쉰다.', [
    { text: '수술을 받는다', effects: { health: 4, happy: -3, fx: ['rtSetback'] }, log: '재활 끝에 경기장으로 돌아왔다. 공을 던지는 팔에 다시 힘이 붙었다.' },
    { text: '참고 던진다', risky: true, check: { stat: 'health', diff: 62 },
      success: { effects: { fame: 2, fx: ['rtSkill'] }, log: '통증을 안고 시즌을 버텼다.' },
      fail: { effects: { fx: ['rtInjury'] }, log: '공을 놓는 순간 팔꿈치에서 소리가 났다.' } }
  ], { stages: ['regular', 'ace', 'veteran'] });

  // ---------------------------------------------------------------- 격투가
  M('fighter', [13, 26], '관장님이 체급을 한 단계 내려 보자고 한다. 감량은 지옥이다.', [
    { text: '감량한다', effects: { health: -3, grit: 3, fx: ['rtSkill'] }, log: '계량대 위에서 숫자가 딱 맞았다.' },
    { text: '지금 체급에서 힘으로 붙는다', effects: { health: 1, fx: ['rtSkill'] }, log: '덩치 큰 상대와 스파링하며 맷집이 붙었다.' }
  ]);
  M('fighter', [18, 36], '타이틀전 전날 밤. 상대는 무패의 챔피언이다.', [
    { text: '정면 승부를 건다', check: { stat: 'grit', diff: 60 },
      success: { effects: { fame: 6, money: 8000, fx: ['rtBig'] }, log: '3라운드 KO! 링 위에서 두 팔을 들었다.' },
      fail: { effects: { health: -10, fx: ['rtSetback'] }, log: '판정패. 거울 속 얼굴이 퉁퉁 부었다.' } },
    { text: '거리를 두며 판정을 노린다', check: { stat: 'smarts', diff: 50 },
      success: { effects: { fame: 3, fx: ['rtSkill'] }, log: '심판 세 명 중 둘이 내 손을 들었다.' },
      fail: { effects: { happy: -4 }, log: '야유 속에 판정패했다.' } }
  ], { stages: ['ranker', 'champ'] });
  M('fighter', [20, 37], '프로모터가 "져 주면 큰돈을 주겠다"고 속삭인다.', [
    { text: '거절하고 이긴다', effects: { rep: 5, fx: ['rtSkill'] }, log: '이겼다. 프로모터는 다시 연락하지 않았다.' },
    { text: '돈을 받는다', risky: true, check: { odds: 0.5 },
      success: { effects: { money: 15000, mischief: 5, rep: -4 }, log: '쓰러지는 연기를 했다. 통장은 불었고 마음은 텅 비었다.' },
      fail: { effects: { record: 1, fx: ['rtScandal'] }, log: '승부 조작이 들통났다.' } }
  ], { stages: ['debut', 'ranker', 'champ', 'veteran'] });

  // ---------------------------------------------------------------- 아이돌
  M('idol', [12, 24], '월말 평가 전날. 안무 한 소절이 계속 틀린다.', [
    { text: '밤새 연습한다', effects: { health: -2, grit: 2, fx: ['rtSkill'] }, log: '새벽 다섯 시, 거울 속 동작이 드디어 맞았다.' },
    { text: '푹 자고 컨디션을 챙긴다', effects: { health: 2, happy: 1 }, log: '평가는 무난했다. 트레이너가 "기본이 됐다"고 했다.' }
  ], { stages: ['trainee'] });
  M('idol', [16, 33], '음악 방송 생방송 중 인이어가 빠지고 반주가 끊겼다.', [
    { text: '라이브로 끝까지 부른다', check: { stat: 'grit', diff: 50 },
      success: { effects: { fame: 5, fx: ['rtBig'] }, log: '"찐 라이브" 영상이 천만 조회수를 넘었다.' },
      fail: { effects: { happy: -5, fx: ['rtSetback'] }, log: '음이탈 장면이 하루 종일 돌았다.' } },
    { text: '멤버들과 웃으며 넘긴다', effects: { social: 3, happy: 2 }, log: '팬들은 그 웃음을 더 좋아했다.' }
  ], { stages: ['debut', 'rookie', 'hot', 'top'] });
  M('idol', [17, 33], '소속사가 쉬는 날 없이 해외 투어 일정을 잡았다.', [
    { text: '버틴다', check: { stat: 'health', diff: 55 },
      success: { effects: { money: 10000, fame: 3, fx: ['rtSkill'] }, log: '열두 도시를 돌았다. 공항이 집 같았다.' },
      fail: { effects: { fx: ['rtBurnout'] }, log: '무대 뒤에서 숨이 막혀 주저앉았다.' } },
    { text: '휴식을 요구한다', effects: { happy: 3, health: 3, rep: -1 }, log: '소속사는 투덜댔지만 한 달을 쉬었다.' }
  ], { stages: ['rookie', 'hot', 'top'] });
  M('idol', [17, 34], '비밀 연애 사진을 찍었다며 기자가 연락해 왔다.', [
    { text: '솔직하게 인정한다', check: { stat: 'social', diff: 55 },
      success: { effects: { rep: 3, happy: 2 }, log: '팬들 대부분이 축하해 줬다.' },
      fail: { effects: { fx: ['rtScandal'] }, log: '팬덤이 둘로 갈라졌다.' } },
    { text: '소속사에 맡긴다', effects: { happy: -2 }, log: '"사실무근" 공식 입장이 나왔다. 마음이 무거웠다.' }
  ], { stages: ['rookie', 'hot', 'top', 'late'], cond: { rel: { partner: 'yes' } } });

  // ---------------------------------------------------------------- 가수
  M('singer', [15, 35], '오디션 프로그램 예선. 자작곡을 부를까, 유명한 노래를 부를까?', [
    { text: '자작곡을 부른다', check: { stat: 'grit', diff: 45 },
      success: { effects: { fame: 3, fx: ['rtBig'] }, log: '심사위원이 "이 노래 음원으로 내자"고 했다.' },
      fail: { effects: { happy: -3 }, log: '"좋은데, 아직 덜 익었다."' } },
    { text: '유명한 노래로 안전하게 간다', effects: { fx: ['rtSkill'] }, log: '무난하게 다음 라운드에 올랐다.' }
  ], { stages: ['busking', 'debut'] });
  M('singer', [18, 70], '목이 쉬었다. 내일은 큰 공연이다.', [
    { text: '공연을 강행한다', risky: true, check: { stat: 'health', diff: 55 },
      success: { effects: { fame: 2, fx: ['rtSkill'] }, log: '관객의 떼창이 내 목소리를 채워 줬다.' },
      fail: { effects: { health: -4, fx: ['rtSetback'] }, log: '고음에서 목소리가 갈라졌다. 성대 결절 진단을 받았다.' } },
    { text: '공연을 미루고 쉰다', effects: { health: 3, happy: -1 }, log: '사과문을 올렸다. 팬들은 "푹 쉬라"고 했다.' }
  ], { stages: ['rising', 'hit', 'national', 'veteran'] });
  M('singer', [20, 70], '드라마 OST 제안이 왔다. 내 스타일과는 다른 곡이다.', [
    { text: '부른다', effects: { money: 3000, fame: 3, fx: ['rtSkill'] }, log: '드라마가 뜨면서 노래도 차트에 올랐다.' },
    { text: '내 음악만 한다', effects: { happy: 2, rep: 2 }, log: '앨범 작업실에 다시 틀어박혔다.' }
  ], { stages: ['debut', 'rising', 'hit'] });

  // ---------------------------------------------------------------- 밴드
  M('band', [14, 40], '드러머가 밴드를 그만두겠다고 한다. 직장에 들어갔단다.', [
    { text: '새 드러머를 구한다', check: { stat: 'social', diff: 45 },
      success: { effects: { fx: ['rtSkill'] }, log: '합주 첫날 소리가 맞았다. 운명 같은 만남.' },
      fail: { effects: { happy: -3, fx: ['rtSetback'] }, log: '석 달 동안 오디션만 봤다.' } },
    { text: '붙잡아 설득한다', effects: { rel: { friend: 3 }, happy: 1 }, log: '주말 합주만 하기로 했다. 그래도 같이 간다.' }
  ]);
  M('band', [16, 60], '페스티벌 무대 직전, 기타 줄이 끊어졌다.', [
    { text: '남은 줄에 맞춰 다 같이 연주를 이어 간다', check: { stat: 'grit', diff: 50 },
      success: { effects: { fame: 4, fx: ['rtBig'] }, log: '그 무대가 전설이 됐다. "다섯 줄의 기적."' },
      fail: { effects: { happy: -3 }, log: '음이 계속 어긋났다. 그래도 끝까지 했다.' } },
    { text: '양해를 구하고 줄을 갈 시간을 번다', effects: { social: 2 }, log: '관객들이 박자에 맞춰 박수로 기다려 줬다.' }
  ], { stages: ['club', 'album', 'festival', 'headliner'] });
  M('band', [18, 60], '대형 기획사가 "말 잘 듣는 밴드"로 만들어 주겠다고 한다.', [
    { text: '계약한다', effects: { money: 8000, fame: 3, happy: -2, fx: ['rtSkill'] }, log: '방송 출연이 늘었다. 곡은 조금 둥글어졌다.' },
    { text: '인디로 남는다', effects: { happy: 3, rep: 3 }, log: '작은 공연장 관객들이 더 크게 소리 질렀다.' }
  ], { stages: ['album', 'festival'] });

  // ---------------------------------------------------------------- 배우
  M('actor', [12, 40], '오디션 대본이 전날 밤에 바뀌었다.', [
    { text: '밤새 외운다', effects: { health: -1, fx: ['rtSkill'] }, log: '한 글자도 틀리지 않았다. 감독이 메모를 했다.' },
    { text: '외우지 말고 감정으로 간다', check: { stat: 'social', diff: 50 },
      success: { effects: { fame: 2, fx: ['rtBig'] }, log: '즉흥 연기에 감독이 웃었다. "이 사람이다."' },
      fail: { effects: { happy: -3 }, log: '대사가 엉켰다. "다음 기회에요."' } }
  ], { stages: ['aspiring', 'extra'] });
  M('actor', [18, 75], '악역 제안이 왔다. 이미지가 망가질 수도 있다.', [
    { text: '맡는다', check: { stat: 'grit', diff: 50 },
      success: { effects: { fame: 5, fx: ['rtBig'] }, log: '"인생 연기"라는 평이 쏟아졌다.' },
      fail: { effects: { rep: -3, fx: ['rtSetback'] }, log: '시청자들이 길에서 째려봤다.' } },
    { text: '착한 역할만 한다', effects: { rep: 2 }, log: '비슷한 배역이 계속 들어왔다.' }
  ], { stages: ['supporting', 'lead', 'star', 'veteran'] });
  M('actor', [20, 80], '촬영장에서 스태프가 위험한 장면을 대역 없이 찍자고 한다.', [
    { text: '직접 한다', risky: true, check: { stat: 'health', diff: 55 },
      success: { effects: { fame: 3, fx: ['rtSkill'] }, log: '그 장면이 예고편의 하이라이트가 됐다.' },
      fail: { effects: { fx: ['rtInjury'] }, log: '착지에 실패했다. 촬영이 두 달 밀렸다.' } },
    { text: '안전 장비를 요구한다', effects: { rep: 2, health: 1 }, log: '하루 늦어졌지만 모두 무사했다.' }
  ], { stages: ['extra', 'supporting', 'lead', 'star'] });

  // ---------------------------------------------------------------- 개그맨
  M('comedian', [17, 40], '준비한 코너가 리허설에서 하나도 안 웃겼다.', [
    { text: '밤새 새로 짠다', effects: { health: -2, fx: ['rtSkill'] }, log: '새벽에 짠 마지막 대사에서 터졌다.' },
    { text: '그대로 밀고 간다', check: { odds: 0.4 },
      success: { effects: { fame: 3, fx: ['rtBig'] }, log: '본방에서는 웃음이 터졌다. 리허설은 리허설일 뿐.' },
      fail: { effects: { happy: -4 }, log: '방청석이 조용했다. 편집됐다.' } }
  ]);
  M('comedian', [20, 70], '예능에서 선배가 짓궂은 농담을 던졌다. 받아칠까?', [
    { text: '재치 있게 받아친다', check: { stat: 'smarts', diff: 50 },
      success: { effects: { fame: 4, fx: ['rtSkill'] }, log: '그 장면이 "명장면 모음"에 들어갔다.' },
      fail: { effects: { rep: -3 }, log: '분위기가 싸해졌다. 편집이 나를 살렸다.' } },
    { text: '웃으며 리액션만 한다', effects: { social: 2 }, log: '선배가 나중에 밥을 샀다.' }
  ], { stages: ['corner', 'catchphrase', 'mc'] });
  M('comedian', [22, 70], '유행어가 너무 뜨는 바람에 다른 걸 해도 아무도 안 본다.', [
    { text: '새 캐릭터에 도전한다', check: { stat: 'grit', diff: 55 },
      success: { effects: { fame: 3, fx: ['rtBig'] }, log: '두 번째 전성기가 왔다.' },
      fail: { effects: { fx: ['rtBurnout'] }, log: '아무도 웃지 않는 무대가 이어졌다.' } },
    { text: '유행어로 끝까지 간다', effects: { money: 3000, happy: 1 }, log: '행사 섭외는 끊이지 않았다.' }
  ], { stages: ['catchphrase', 'mc', 'veteran'] });

  // ---------------------------------------------------------------- 모델
  M('model', [15, 30], '에이전시가 체중을 5kg 빼라고 한다.', [
    { text: '건강하게 운동으로 뺀다', effects: { health: 2, grit: 2, fx: ['rtSkill'] }, log: '석 달 만에 라인이 살아났다.' },
    { text: '굶어서 뺀다', risky: true, effects: { health: -6, fx: ['rtSkill'] }, log: '사진은 잘 나왔다. 계단에서 어지러웠다.' },
    { text: '거절한다', effects: { happy: 2, rep: 1 }, log: '"지금 모습 그대로"를 원하는 브랜드를 찾았다.' }
  ], { stages: ['hopeful', 'rookie', 'exclusive'] });
  M('model', [17, 38], '해외 컬렉션 캐스팅 날. 대기 줄이 끝이 없다.', [
    { text: '끝까지 기다린다', check: { stat: 'looks', diff: 65 },
      success: { effects: { fame: 5, money: 5000, fx: ['rtBig'] }, log: '오프닝 룩을 받았다!' },
      fail: { effects: { happy: -3 }, log: '"다음 시즌에 봐요."' } },
    { text: '다른 쇼 오디션으로 옮긴다', effects: { fx: ['rtSkill'] }, log: '작은 쇼 두 개를 따냈다.' }
  ], { stages: ['exclusive', 'runway', 'top'] });
  M('model', [18, 40], '백스테이지에서 디자이너가 다른 모델에게 소리를 지른다.', [
    { text: '동료 편을 든다', effects: { rep: 4, social: 2 }, log: '그 모델과 평생 친구가 됐다.' },
    { text: '조용히 내 순서를 기다린다', effects: { fx: ['rtSkill'] }, log: '쇼는 완벽하게 끝났다. 마음은 불편했다.' }
  ], { stages: ['rookie', 'exclusive', 'runway', 'top', 'late'] });

  // ---------------------------------------------------------------- 미술
  M('art', [16, 80], '공모전 마감이 내일인데, 그림이 마음에 들지 않는다.', [
    { text: '처음부터 다시 그린다', effects: { health: -2, fx: ['rtSkill'] }, log: '새벽 네 시에 완성했다. 손이 떨렸다.' },
    { text: '그대로 낸다', check: { odds: 0.45 },
      success: { effects: { fame: 2, fx: ['rtBig'] }, log: '입상! 내 눈에만 부족해 보였나 보다.' },
      fail: { effects: { happy: -3 }, log: '낙선. 다음엔 후회 없이 그리겠다.' } }
  ]);
  M('art', [20, 90], '갤러리가 잘 팔리는 그림만 그려 달라고 한다.', [
    { text: '팔리는 그림을 그린다', effects: { money: 6000, happy: -2 }, log: '빨간 스티커가 줄줄이 붙었다. 붓이 무거웠다.' },
    { text: '내 그림을 고집한다', check: { stat: 'grit', diff: 55 },
      success: { effects: { fame: 4, fx: ['rtBig'] }, log: '평론가가 "새로운 언어"라고 썼다.' },
      fail: { effects: { money: -1500, happy: -2 }, log: '전시가 끝나도 그림은 그대로 벽에 남았다.' } }
  ], { stages: ['emerging', 'first_show', 'established', 'master'] });
  M('art', [25, 90], '내 그림과 똑같은 위작이 경매에 나왔다.', [
    { text: '공개적으로 문제를 제기한다', check: { stat: 'social', diff: 50 },
      success: { effects: { rep: 4, fame: 3 }, log: '위작이 밝혀졌다. 진품 값이 올랐다.' },
      fail: { effects: { happy: -4 }, log: '소송이 길어졌다. 작업할 시간이 줄었다.' } },
    { text: '모른 척하고 작업에 집중한다', effects: { fx: ['rtSkill'] }, log: '새 연작이 위작 소동을 덮었다.' }
  ], { stages: ['established', 'master', 'elder'] });

  // ---------------------------------------------------------------- 요식업
  M('cook', [15, 50], '피크 타임에 주문이 밀리고, 셰프가 소리를 지른다.', [
    { text: '이를 악물고 접시를 낸다', effects: { grit: 2, fx: ['rtSkill'] }, log: '마지막 접시가 나갔다. 셰프가 어깨를 툭 쳤다.' },
    { text: '실수한 접시를 다시 만든다', effects: { rep: 2, fx: ['rtSkill'] }, log: '늦었지만 손님은 맛있다고 했다.' }
  ], { stages: ['helper', 'line', 'sous'] });
  M('cook', [22, 75], '미식 평론가가 예고 없이 찾아왔다는 귀띔이 왔다.', [
    { text: '시그니처 코스를 낸다', check: { stat: 'grit', diff: 55 },
      success: { effects: { fame: 5, money: 5000, fx: ['rtBig'] }, log: '"올해의 발견"이라는 리뷰가 실렸다.' },
      fail: { effects: { happy: -4, fx: ['rtSetback'] }, log: '"소스가 무겁다." 한 줄이 아팠다.' } },
    { text: '평소처럼 낸다', effects: { fx: ['rtSkill'] }, log: '무난한 평이 나왔다. 단골들은 그대로였다.' }
  ], { stages: ['sous', 'head', 'star'] });
  M('cook', [22, 75], '재료값이 크게 올랐다. 싼 재료로 바꾸면 이문이 남는다.', [
    { text: '좋은 재료를 지킨다', effects: { money: -2000, rep: 4 }, log: '맛은 그대로였다. 손님도 그대로였다.' },
    { text: '싼 재료로 바꾼다', risky: true, check: { odds: 0.5 },
      success: { effects: { money: 3000 }, log: '아무도 눈치채지 못했다. 당분간은.' },
      fail: { effects: { rep: -6, fx: ['rtSetback'] }, log: '"맛이 변했다"는 리뷰가 줄을 이었다.' } }
  ], { stages: ['head', 'star', 'elder'] });

  // ---------------------------------------------------------------- 법조계
  M('law', [20, 45], '시험이 석 달 남았다. 친구 결혼식과 모의고사가 겹쳤다.', [
    { text: '모의고사를 본다', effects: { smarts: 2, rel: { friend: -4 }, fx: ['rtSkill'] }, log: '점수는 올랐고, 축하 문자는 늦었다.' },
    { text: '결혼식에 간다', effects: { happy: 3, rel: { friend: 5 } }, log: '오랜만에 웃었다. 밤에 두 배로 공부했다.' }
  ], { stages: ['exam'] });
  M('law', [25, 72], '의뢰인이 불리한 증거를 숨기자고 한다.', [
    { text: '원칙대로 한다', effects: { rep: 5, fx: ['rtSkill'] }, log: '사건은 졌지만 법정은 나를 믿게 됐다.' },
    { text: '모른 척한다', risky: true, check: { odds: 0.5 },
      success: { effects: { money: 8000, mischief: 3 }, log: '이겼다. 거울을 보기 싫었다.' },
      fail: { effects: { record: 1, fx: ['rtScandal'] }, log: '증거 은닉이 드러나 징계 위원회에 섰다.' } }
  ], { stages: ['associate', 'senior', 'top'], cond: { career: ['lawyer', 'patent_attorney'] } });
  M('law', [28, 72], '모두가 피하는 큰 사건이 배당됐다. 언론이 지켜본다.', [
    { text: '맡는다', check: { stat: 'smarts', diff: 65 },
      success: { effects: { fame: 5, fx: ['rtBig'] }, log: '판결문에 내 논리가 그대로 실렸다.' },
      fail: { effects: { happy: -5, fx: ['rtBurnout'] }, log: '석 달 동안 집에 들어가지 못했다.' } },
    { text: '후배와 나눠 맡는다', effects: { social: 2, fx: ['rtSkill'] }, log: '후배가 크게 성장했다.' }
  ], { stages: ['senior', 'top'] });

  // ---------------------------------------------------------------- 의료계
  M('medical', [22, 45], '36시간째 당직. 응급 환자가 또 들어왔다.', [
    { text: '내가 본다', check: { stat: 'health', diff: 50 },
      success: { effects: { rep: 3, fx: ['rtSkill'] }, log: '환자는 살았다. 나는 복도 의자에서 쓰러져 잤다.' },
      fail: { effects: { fx: ['rtBurnout'] }, log: '손이 떨려 선배를 불렀다. 집에 가서 울었다.' } },
    { text: '동료에게 부탁하고 잠깐 눈을 붙인다', effects: { health: 2 }, log: '20분의 잠이 다음 응급 처치에 큰 도움이 됐다.' }
  ], { stages: ['intern', 'resident'], cond: { career: ['doctor', 'surgeon', 'nurse', 'paramedic'] } });
  M('medical', [28, 75], '아무도 손대지 않으려는 고위험 수술이 들어왔다.', [
    { text: '집도한다', check: { stat: 'smarts', diff: 65 },
      success: { effects: { fame: 5, fx: ['rtBig'] }, log: '열두 시간 뒤, 모니터가 안정됐다. 보호자가 무릎을 꿇었다.' },
      fail: { effects: { happy: -8, fx: ['rtSetback'] }, log: '최선을 다했지만 환자를 잃었다. 그날 밤을 잊지 못한다.' } },
    { text: '더 큰 병원으로 보낸다', effects: { rep: 1 }, log: '옳은 판단이었다고 스스로를 다독였다.' }
  ], { stages: ['specialist', 'chief'], cond: { career: ['doctor', 'surgeon'] } });
  M('medical', [30, 75], '제약회사 영업사원이 두툼한 봉투를 내민다.', [
    { text: '돌려보낸다', effects: { rep: 4 }, log: '복도 끝에서 그가 다른 진료실로 들어갔다.' },
    { text: '받는다', risky: true, check: { odds: 0.5 },
      success: { effects: { money: 5000, mischief: 3 }, log: '처방전에 그 회사 약 이름이 늘었다.' },
      fail: { effects: { record: 1, fx: ['rtScandal'] }, log: '리베이트 수사가 시작됐다.' } }
  ], { stages: ['specialist', 'chief', 'elder'], cond: { career: ['doctor', 'surgeon', 'dentist'] } });
})(typeof globalThis !== 'undefined' ? globalThis : this);
