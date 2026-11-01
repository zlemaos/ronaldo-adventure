/* Activities menu (age-unlocked). Each costs 1 action point (행동력); effects use the seeded RNG. */
(function (G) {
  var RA = G.RA = G.RA || {};
  var E = RA.Engine, T = RA.Text;

  function W(s) { return E.country(s).wage; }
  function inSchool(s) { return ['elem', 'middle', 'high', 'univ', 'grad'].indexOf(s.edu.stage) >= 0; }
  function eff(s, e) { return E.applyEffects(s, e, []); }


  // ---------------------------------------------------------------- flavour lines
  // Lines are picked so the same sentence is not repeated within 3 years, and lines that name
  // a person are skipped when that person is not alive/present (same rule as storylets).
  var LINES = {
    play: ['블록으로 탑을 쌓았다가 와르르 무너뜨렸다.', '골목에서 술래잡기를 했다.', '빈 페트병을 공 삼아 찼다.', '모래성을 쌓았다.', '이불로 동굴을 만들어 탐험대 놀이를 했다.', '분필로 골목에 사방치기 판을 그렸다.', '종이비행기를 접어 창밖으로 날렸다.', '빗물 웅덩이마다 일부러 첨벙 뛰어들었다.', '개미 행렬을 한 시간 동안 따라다녔다.', '낡은 냄비를 두드리며 밴드 놀이를 했다.'],
    fb_child: ['골목 벽에 분필로 골대를 그려 놓고 슛을 했다.', '맨발로 모래밭을 뛰며 공을 몰았다.', '형들 경기에 끼워 달라고 졸라 골키퍼를 했다.', '테니스공으로 드리블 연습을 했다. 공이 작아서 더 어렵다.', '해 질 녘까지 리프팅 개수를 셌다. 오늘 기록은 스물세 개.', '빈 깡통 두 개를 골대 삼아 혼자 경기를 중계하며 찼다.', '비 오는 날 처마 밑에서 공을 발등에 올려 두는 연습을 했다.', '{coach}[이/가] 알려 준 대로 공을 보지 않고 드리블해 봤다.', '맨홀 뚜껑 두 개 사이로 공을 통과시키는 놀이를 했다.', '{father}[이/가] 장비실에서 가져온 콘으로 드리블 코스를 만들어 줬다.', '공을 머리에 이고 몇 걸음 가는지 세어 봤다.', '운동장 철망에 매달린 그물 사이로 공을 차 넣었다.'],
    fb_teen: ['학교 운동장에 남아 프리킥만 백 개를 찼다.', '계단을 오르내리며 하체 훈련을 했다.', '프로 경기 영상을 돌려 보며 움직임을 따라 해 봤다.', '약한 발로만 패스하는 벌칙을 스스로 줬다.', '동네 형들과 내기 경기를 했다. 이겼다.', '콘 열 개를 세워 두고 지그재그 드리블을 반복했다.', '헤딩 타이밍을 잡으려고 공을 벽에 던지고 받았다.', '가로등 불빛 아래서 슈팅 연습을 했다.', '한밤중 골목에서 가로등을 골대 삼아 슛을 했다.', '축구화 끈을 새로 갈고 감아 차기를 백 번 했다.', '하프라인부터 단독 돌파하는 상상을 하며 질주했다.', '친구에게 일대일 수비를 부탁해 돌파 연습을 했다.'],
    fb_academy: ['발목에 모래주머니를 차고 드리블 연습을 했다.', '모두 잠든 밤, 체육관에서 코어 운동을 했다.', '코치에게 비디오 분석을 부탁해 위치 선정을 고쳤다.', '스프린트 30미터를 스무 번 반복했다.', '선배의 무회전 킥을 따라 하다 공을 담장 밖으로 넘겼다.', '세트피스 훈련 뒤 혼자 남아 코너킥을 더 찼다.', '식단 일지를 쓰며 탄산음료를 끊었다.', '왼발 크로스만 한 시간 동안 올렸다.', '기숙사 복도에서 몰래 리프팅을 하다 사감에게 걸렸다.', '수영장에서 물속 달리기로 하체를 단련했다.', '동기들과 패스 정확도 내기를 했다. 저녁 간식을 땄다.', '경기 하이라이트를 보며 실수한 장면만 골라 메모했다.'],
    fb_pro: ['훈련장에 가장 먼저 나와 가장 늦게 나갔다.', '아이스 배스에 몸을 담그며 회복 루틴을 지켰다.', '전담 코치와 무회전 프리킥 궤적을 연구했다.', '상대 수비수의 습관을 영상으로 분석했다.', '점프 헤딩을 위해 플라이오메트릭 훈련을 추가했다.', '수면 시간을 기록하며 컨디션을 관리했다.', '유소년 선수들과 함께 훈련하며 기본기를 다시 다졌다.', '페널티킥 루틴을 처음부터 다시 만들었다.', '개인 트레이너와 반응 속도 훈련을 했다.', '비 오는 날 젖은 공으로 크로스를 받아 내는 연습을 했다.', '영양사와 시즌 식단을 다시 짰다.', '경기 없는 날에도 같은 시간에 일어나 루틴을 지켰다.'],
    fb_veteran: ['필라테스로 유연성을 챙겼다. 젊을 때 할 걸 그랬다.', '전력 질주 대신 위치 선정 훈련에 집중했다.', '회복 시간이 길어져 훈련량을 조절했다.', '후배들에게 슈팅 요령을 알려 주며 같이 찼다.', '물리치료사와 무릎 강화 운동을 했다.', '경기 전날 일찍 잠들었다. 몸이 먼저 알아서 눕는다.', '젊은 동료들의 스프린트를 지켜보며 짧은 침투 타이밍을 다듬었다.', '경기 전 루틴에 명상 10분을 넣었다.', '헤딩 위치 선정만 반복해서 연습했다.', '훈련 뒤 냉찜질을 하며 다음 경기를 그려 봤다.'],
    fb_amateur: ['주말 조기축구회에서 공을 찼다.', '공원에서 아이들과 미니 게임을 했다.', '풋살장을 빌려 옛 동료들과 뛰었다.', '퇴근길에 공 하나 들고 빈 운동장을 돌았다.', '리프팅 열 개에서 멈췄다. 예전엔 백 개였는데.', '동네 꼬마들에게 인사이드 패스를 가르쳐 줬다.', '회사 축구 동호회 경기에서 깔끔한 어시스트를 했다.', '아침 일찍 운동장 트랙을 돌고 슈팅 몇 번을 했다.', '옛날 축구화를 꺼내 신어 봤다. 아직 맞는다.', 'TV 중계를 보다 참지 못하고 공을 들고 나갔다.'],
    study: ['도서관 문 닫을 때까지 버텼다.', '문제집 한 권을 끝냈다.', '졸면서도 단어장을 넘겼다.', '인터넷 강의를 2배속으로 정주행했다.', '오답 노트를 처음부터 다시 정리했다.', '친구와 서로 문제를 내 주며 공부했다.', '좋아하는 분야의 책을 밤새 읽었다.', '모르는 걸 선생님께 끝까지 물어봤다.', '타이머를 맞춰 놓고 집중 50분, 휴식 10분을 반복했다.', '외국어 라디오를 들으며 받아쓰기를 했다.'],
    exercise: ['새벽 달리기를 했다.', '팔굽혀펴기 100개. 내일 팔이 안 올라갈 것 같다.', '수영장에서 몇 바퀴를 돌았다.', '줄넘기 2단 뛰기에 성공했다.', '동네 뒷산을 뛰어서 올라갔다.', '헬스장에서 스쿼트 자세를 처음부터 다시 배웠다.', '자전거를 타고 강변을 한 바퀴 돌았다.', '요가 매트를 펴고 스트레칭을 했다.', '계단으로만 출퇴근했다.', '공원 철봉에서 턱걸이 기록을 하나 늘렸다.'],
    family: ['{mother}[이/가] 만들어 준 {food}[을/를] 다 같이 먹었다.', '{bro}[과/와] 낡은 소파에서 TV로 축구를 봤다.', '{sis1}[이/가] 머리를 땋아 주겠다며 쫓아왔다.', '{sis2}[과/와] 옛날 사진첩을 넘기며 깔깔 웃었다.', '{father}[과/와] 함께 화단에 물을 줬다.', '{mother}[과/와] 시장에 다녀왔다. 덤을 두 번이나 받았다.', '{siblings}[과/와] 보드게임을 하다가 판을 엎었다.', '가족 단체 대화방에 오래된 사진을 올렸다.', '가족과 둘러앉아 옛날 이야기를 했다.', '오랜만에 고향 집에 전화를 걸어 한참 수다를 떨었다.', '가족 식사 자리에서 설거지를 도맡았다.', '가족과 동네 시장 구경을 했다.', '명절 사진을 정리해 앨범을 만들었다.', '가족들 생일을 달력에 하나하나 적어 두었다.', '집안 고장 난 곳을 손봤다. 박수를 받았다.'],
    family_own: ['{spouse}[과/와] 동네 산책을 했다.', '{child}[과/와] 마주 앉아 {food}[을/를] 먹었다.', '{spouse}[과/와] 오랜만에 영화를 봤다.', '아이들 숙제를 봐 주다 같이 졸았다.', '가족과 주말 피크닉을 갔다.', '온 가족이 거실에서 영화를 보다 하나둘 잠들었다.', '저녁 식탁에서 오늘 있었던 일을 돌아가며 이야기했다.', '가족 텃밭에 상추를 심었다.', '가족사진을 찍었다. 다들 눈을 감은 사진만 남았다.', '함께 대청소를 하고 짜장면을 시켜 먹었다.'],
    family_memory: ['오래된 가족 앨범을 꺼내 한 장씩 넘겼다.', '고향 동네 사진을 보며 그 시절 골목을 떠올렸다.', '부모님이 즐겨 부르던 노래를 흥얼거렸다.', '집안 대대로 내려온 방식으로 {food}[을/를] 만들어 봤다.', '가족 묘소를 찾아 풀을 뽑고 꽃을 놓았다.', '조카들에게 안부 전화를 돌렸다.', '집안 족보 같은 낡은 공책을 정리했다.', '어릴 적 살던 {house} 이야기를 일기에 적었다.', '가족들에게 보낼 손편지를 썼다.'],
    family_jail: ['면회 온 가족과 유리창 너머로 손을 맞댔다.', '가족에게 편지를 썼다. 지우고 다시 쓰기를 여러 번 했다.', '면회실에서 짧은 30분 동안 웃는 얼굴만 보여 줬다.', '면회 온 가족이 영치금을 넣고 갔다.', '가족이 보낸 사진을 벽에 붙여 두었다.', '전화 통화 5분. 하고 싶은 말의 반도 못 했다.', '가족에게 출소하면 하고 싶은 일 목록을 적어 보냈다.', '면회 시간에 조카 이야기를 듣고 한참 웃었다.', '가족이 넣어 준 책을 밤새 읽었다.'],
    friends: ['{friend}[과/와] 밤새 수다를 떨었다.', '{friend}[과/와] 길거리 음식으로 배를 채웠다.', '{friend}[과/와] 게임을 하다가 싸우고 다시 화해했다.', '{friend}[과/와] 노래방에서 목이 쉬도록 불렀다.', '{friend}의 이사를 도와주고 짜장면을 얻어먹었다.', '{friend}[과/와] 옛날 이야기를 하다 배꼽이 빠지게 웃었다.', '{friend}[과/와] 경기장에 가서 목청껏 응원했다.', '{friend}[과/와] 산에 올라 컵라면을 먹었다.', '{friend}에게 고민을 털어놓았다. 말없이 들어 줬다.', '{friend}[과/와] 옛 학교 운동장을 걸었다.'],
    work: ['야근을 자청했다. 상사가 처음으로 이름을 기억했다.', '미뤄 둔 서류를 하루 만에 정리했다.', '새벽같이 출근해 아무도 없는 사무실에서 집중했다.', '어려운 고객 응대를 맡아 깔끔하게 마무리했다.', '동료의 실수를 조용히 메워 줬다.', '업무 매뉴얼을 새로 만들어 팀에 돌렸다.', '주말에 관련 자격증 강의를 들었다.', '회의에서 준비한 아이디어를 발표했다. 반응이 좋았다.', '점심을 거르고 밀린 일을 끝냈다.', '후배의 업무를 봐 주며 같이 남았다.'],
    look: ['새 헤어스타일로 바꿨다. 거울 앞에서 한참 서 있었다.', '단골 미용실에서 "늘 하던 대로요"를 외쳤다.', '처음으로 피부과 상담을 받아 봤다.', '옷장 정리를 하고 새 셔츠를 한 벌 샀다.', '머리를 짧게 잘랐다. 가족들이 한참 웃었다.', '안경을 바꿨더니 인상이 달라 보인다.', '눈썹 정리를 받았다. 이런 세계가 있었구나.', '젤을 바르고 머리를 세웠다. 바람이 불어도 끄떡없다.', '처음으로 맞춤 정장을 맞춰 봤다.', '수염을 정리하고 향수를 바꿨다.'],
    parttime: ['편의점 야간 알바를 했다.', '전단지를 돌렸다.', '식당에서 설거지를 했다.', '이삿짐을 날랐다.', '물류 창고에서 상자를 옮겼다.', '축제 행사장 안내 요원을 했다.', '과외를 했다. 학생이 나보다 똑똑했다.', '카페 주말 근무를 했다.', '주차 안내 알바를 했다.', '편의점 재고 정리를 도왔다.'],
    meditate: ['눈을 감고 호흡에 집중했다. 마음이 잔잔해졌다.', '아무 생각 없이 바다를 바라봤다.', '오늘 고마웠던 일 세 가지를 적었다.', '휴대폰을 끄고 한 시간 동안 걸었다.', '촛불 하나 켜 두고 조용히 앉아 있었다.', '복잡한 생각을 종이에 다 적고 찢어 버렸다.', '일기장에 오늘의 마음을 적었다.', '공원 벤치에 앉아 나뭇잎 소리를 들었다.', '따뜻한 차를 천천히 마시며 숨을 골랐다.', '명상 앱의 안내를 따라 몸을 하나씩 이완했다.'],
    exercise_jail: ['운동장 한 귀퉁이에서 팔굽혀펴기를 했다.', '좁은 방에서 스쿼트를 반복했다.', '배식 시간 전까지 제자리 달리기를 했다.', '운동 시간에 농구 골대 아래서 슛을 쐈다.', '복도 끝까지 오리걸음을 했다.', '플랭크 3분을 버텼다.', '동료 수감자에게 줄넘기 대신 뛰는 법을 배웠다.', '침상에 발을 걸고 윗몸일으키기를 했다.', '운동장 트랙을 스무 바퀴 돌았다.'],
    doctor: ['건강검진을 받았다. "운동 꾸준히 하세요."', '혈압을 쟀다. 의사가 짠 음식을 줄이라고 했다.', '치과 정기 검진을 받았다. 무서웠지만 충치는 없었다.', '종합검진 결과지를 받아 형광펜으로 줄을 그었다.', '한의원에서 침을 맞았다. 어깨가 가벼워졌다.', '안과 검진을 받았다. 시력이 조금 떨어졌다.', '피검사를 받았다. 콜레스테롤을 조심하라고 한다.', '물리치료를 받았다. 허리가 시원하다.', '독감 예방 주사를 맞았다.', '심전도 검사를 받았다. 심장은 튼튼하다.'],
    blood: ['헌혈을 했다. 간호사가 건넨 과자가 유난히 달았다.', '헌혈의 집에서 영화표를 받았다.', '헌혈을 했다. 내 피가 누군가에게 닿기를.', '헌혈 증서가 한 장 더 늘었다.', '혈장 헌혈을 했다. 생각보다 오래 걸렸다.', '헌혈 후 주스를 두 잔 마셨다.', '헌혈 버스에서 반가운 이웃을 만났다.', '헌혈 기념품으로 우산을 받았다.', '긴급 헌혈 문자를 받고 바로 달려갔다.', '헌혈 50회 달성자의 사진을 보고 결심을 다졌다.'],
    family_dad: ['{father} 곁에 앉아 오래 이야기를 나눴다. 오늘은 술병 대신 내 경기 이야기를 하셨다.', '{father}[과/와] 공원 벤치에서 탄산수를 나눠 마셨다.', '{father}의 일터에 따라가 화단 정리를 도왔다.', '{father}에게 내 경기 영상을 보여 드렸다. 한참을 말없이 보셨다.', '{father}[과/와] 함께 장비실 유니폼을 갰다.', '{father}[이/가] 오늘은 일찍 들어오셨다. 저녁을 같이 먹었다.', '{father}의 손을 잡고 바닷가를 걸었다.', '{father}에게 편지를 썼다. "아빠가 자랑스러워요."', '{father}[과/와] 낚시를 갔다. 물고기는 못 잡았지만 많이 웃었다.', '{father}[과/와] 상담 센터 앞까지 같이 걸어갔다.'],
    kids: ['{child}[과/와] 공원에서 공을 찼다. 슈팅 자세가 누굴 닮았다.', '{child}에게 자전거 타는 법을 가르쳤다. 손을 놓은 줄도 모르고 달려갔다.', '{child}[과/와] 그림을 그렸다. 내 얼굴이 감자처럼 생겼다.', '{child}의 학교 발표회에 갔다. 맨 앞줄에서 제일 크게 박수 쳤다.', '{child}[과/와] 동물원에 갔다.', '{child}[과/와] 마주 앉아 숙제를 했다.', '아이들과 베개 싸움을 했다. 졌다.', '아이들에게 어릴 적 동네 축구 이야기를 해 줬다.', '아이들과 김밥을 싸서 소풍을 갔다.', '아이들의 키를 문틀에 표시했다.']
  };
  E.ACTIVITY_LINES = LINES;
  // Pick a line for a key avoiding repeats within 3 years; returns the rendered sentence.
  E.line = function (s, key, list) {
    list = list || LINES[key];
    s.lines = s.lines || {};
    var used = (s.lines[key] || []).filter(function (u) { return s.age - u.age < 3; });
    var ok = list.filter(function (t) { return E.personsOk(s, { text: t }) && !used.some(function (u) { return u.t === t; }); });
    if (!ok.length) ok = list.filter(function (t) { return E.personsOk(s, { text: t }); });
    if (!ok.length) return '';
    var t = E.pick(s, ok);
    used.push({ t: t, age: s.age });
    s.y.lineKey = key;
    s.lines[key] = used.slice(-12);
    return E.render(s, t);
  };
  function fbKey(s) {
    var st = s.fb.stage;
    if (st === 'pro') return s.age >= 31 ? 'fb_veteran' : 'fb_pro';
    if (st === 'academy' || st === 'youth') return 'fb_academy';
    if (s.age >= 18) return 'fb_amateur';
    return s.age < 12 ? 'fb_child' : 'fb_teen';
  }

  // id, label, icon, minAge, maxAge, available(s) -> true | reason string, run(s, arg) -> text
  var A = [
    { id: 'play', label: '놀기', icon: '🧸', min: 1, max: 12, run: function (s) {
      eff(s, { happy: E.rint(s, 3, 6), smarts: E.chance(s, 0.3) ? 1 : 0 });
      return E.line(s, 'play');
    } },
    { id: 'football', label: '축구 연습', icon: '⚽', min: 3, max: 60, run: function (s) {
      var g = s.age < 30 ? E.rint(s, 1, 3) + (s.stats.grit > 60 ? 1 : 0) : E.rint(s, 0, 1);
      var cap = E.Football.cap(s);
      if (s.stats.football + g > cap) g = Math.max(0, cap - s.stats.football);
      eff(s, { football: g, health: 1, grit: E.chance(s, 0.5) ? 1 : 0, happy: 1 });
      s.y.trainedFb = (s.y.trainedFb || 0) + 1;
      var key = fbKey(s);
      return E.line(s, key) + (g ? ' (축구 실력 +' + g + ')' : (s.age < 30 ? ' 재능의 한계에 가까워졌다. 근성을 기르면 한계가 조금 올라간다.' : ' 몸이 예전 같지 않다.'));
    } },
    { id: 'study', label: '공부', icon: '📚', min: 6, max: 120, run: function (s) {
      var g = E.rint(s, 2, 4);
      eff(s, { smarts: g, happy: -1 });
      s.edu.grades = E.clamp(s.edu.grades + E.rint(s, 3, 8), 0, 100);
      s.y.studied = (s.y.studied || 0) + 1;
      if (s.job) s.job.perf = E.clamp(s.job.perf + 3, 0, 100);
      return E.line(s, 'study') + ' (지능 +' + g + ')';
    } },
    { id: 'exercise', label: '운동', icon: '🏋️', min: 5, max: 120, run: function (s) {
      eff(s, { health: E.rint(s, 2, 4), looks: E.chance(s, 0.5) ? 1 : 0, grit: 1, happy: 1 });
      return s.jail > 0 ? E.line(s, 'exercise_jail') : E.line(s, 'exercise');
    } },
    { id: 'family', label: '가족과 시간', icon: '🏠', min: 1, max: 120, run: function (s) {
      eff(s, { happy: 2, rel: { family: E.rint(s, 3, 6) } });
      if (s.jail > 0) return E.line(s, 'family_jail');
      var dad = E.person(s, 'father');
      if (dad && dad.alive && s.flags.father_drinking && !s.flags.father_sober && s.age >= 8) {
        dad.recovery = Math.min(100, (dad.recovery || 0) + 6);
        return E.line(s, 'family_dad');
      }
      // one pool: family of origin + own family + memories (lines naming someone gone are skipped)
      var own = E.person(s, 'spouse') || E.peopleByRel(s, 'children').length;
      var pool = LINES.family.concat(own ? LINES.family_own : [], LINES.family_memory);
      return E.line(s, 'family', pool);
    } },
    { id: 'friends', label: '친구 만나기', icon: '🤝', min: 5, max: 120, run: function (s) {
      var f = E.person(s, 'friend');
      if (!f) {
        if (E.chance(s, 0.55 + s.stats.looks / 300)) return E.FX.newFriend(s);
        eff(s, { happy: -1 });
        return '놀이터에 갔지만 말을 걸 용기가 나지 않았다.';
      }
      eff(s, { happy: 3, rel: { friend: E.rint(s, 4, 8) } });
      return E.line(s, 'friends');
    } },
    { id: 'date', label: '데이트', icon: '💘', min: 15, max: 100, run: function (s) {
      var p = E.person(s, 'partner') || E.person(s, 'spouse');
      if (!p) {
        if (E.chance(s, 0.25 + s.stats.looks / 160 + s.stats.fame / 300)) return E.FX.newPartner(s);
        eff(s, { happy: -2 });
        return E.pick(s, ['소개팅 상대가 화장실 간다더니 돌아오지 않았다.', '고백했지만 "좋은 친구로 지내자"는 답을 들었다.', '데이트 앱을 깔았다가 지웠다.']);
      }
      eff(s, { happy: 4, rel: { partner: 7, spouse: 7 } });
      if (p.role === 'partner' && s.age >= 20 && p.rel >= 70 && E.chance(s, 0.35)) { E.queueSys(s, 'sys_proposal', 2); }
      var who = p.role === 'spouse' ? '{spouse}' : '{partner}';
      return E.line(s, 'date_' + p.role, ['바닷가를 걸었다.', '영화를 보다 둘 다 졸았다.', '놀이공원에서 회전목마를 탔다.', '손을 잡고 야시장을 걸었다.', '처음 만난 장소에 다시 가 봤다.', '밤새 통화를 하다 같이 잠들었다.', '자전거를 빌려 강변을 달렸다.', '서로의 어릴 적 사진을 보여 주며 웃었다.', '빗속에서 우산 하나를 나눠 썼다.', '전시회에 갔다. 작품보다 서로를 더 오래 봤다.'].map(function (t) { return who + '[과/와] ' + t; }).concat([who + '에게 {food}[을/를] 만들어 줬다. 맛은… 마음이 중요하다.']));
    } },
    { id: 'parttime', label: '아르바이트', icon: '🧾', min: 14, max: 120, avail: function (s) { return s.job && E.careerIndex()[s.job.id].sector !== 'parttime' ? '이미 직장이 있다' : true; }, run: function (s) {
      var pay = Math.round(E.rint(s, 400, 1200) * W(s));
      s.money += pay; eff(s, { happy: -1, grit: 1 });
      return E.line(s, 'parttime') + ' +' + T.money(pay, E.country(s));
    } },
    { id: 'work', label: '열심히 일하기', icon: '💼', min: 14, max: 120, avail: function (s) { return s.job ? true : '직장이 없다'; }, run: function (s) {
      s.y.workHard = true;
      s.job.perf = E.clamp(s.job.perf + E.rint(s, 6, 12), 0, 100);
      eff(s, { health: -1, happy: -1, grit: 1 });
      return E.line(s, 'work');
    } },
    { id: 'doctor', label: '병원 가기', icon: '🏥', min: 1, max: 120, run: function (s) {
      var cost = Math.round(150 * W(s));
      if (s.age >= 18) s.money -= cost;
      if (s.sick && E.chance(s, 0.55)) return E.FX.cure(s);
      eff(s, { health: E.rint(s, 3, 7) });
      return s.sick ? s.sick.name + ' 치료를 받았다. 조금 나아졌다.' : E.line(s, 'doctor');
    } },
    { id: 'look', label: '외모 가꾸기', icon: '💇', min: 12, max: 120, run: function (s) {
      var cost = Math.round(120 * W(s)); if (s.age >= 18) s.money -= cost;
      s.hero.hair = (s.hero.hair + 1) % 5;
      eff(s, { looks: E.rint(s, 1, 3), happy: 2 });
      return E.line(s, 'look');
    } },
    { id: 'meditate', label: '명상', icon: '🧘', min: 8, max: 120, run: function (s) {
      eff(s, { happy: E.rint(s, 2, 5), health: 1, grit: 1 });
      return E.line(s, 'meditate');
    } },
    { id: 'travel', label: '여행', icon: '✈️', min: 16, max: 100, avail: function (s) { return s.money >= 1500 * W(s) ? true : '돈이 부족하다'; }, run: function (s) {
      s.money -= Math.round(1500 * W(s)); s.flags.traveler = s.flags.traveler || s.age;
      eff(s, { happy: E.rint(s, 6, 10), smarts: 1 });
      return E.pick(s, ['배낭 하나 메고 이웃 나라를 돌았다.', '바닷가 마을에서 일주일을 보냈다.', '처음 보는 음식에 도전했다.']);
    } },
    { id: 'invest', label: '투자', icon: '📈', min: 20, max: 110, avail: function (s) { return s.money >= 1000 * W(s) ? true : '투자할 돈이 없다'; }, run: function (s) {
      var stake = Math.round(Math.max(1000 * W(s), s.money * 0.2));
      var r = E.rnd(s), mult = r < 0.05 ? 2 : r < 0.5 ? 1 + E.rnd(s) * 0.3 : r < 0.88 ? 1 - E.rnd(s) * 0.35 : 0.2;
      mult += (s.stats.smarts - 50) / 500;
      var gain = Math.round(stake * (mult - 1));
      s.money += gain;
      eff(s, { happy: gain > 0 ? 3 : -4 });
      return (gain >= 0 ? '투자 수익 +' : '투자 손실 ') + T.money(gain, E.country(s)) + (mult > 2 ? ' 대박이다!' : mult < 0.3 ? ' 휴지 조각이 됐다…' : '');
    } },
    { id: 'lotto', label: '복권 사기', icon: '🎟️', min: 18, max: 120, run: function (s) {
      s.money -= Math.round(5 * W(s));
      if (E.chance(s, 0.0015)) return E.FX.lottery(s);
      if (E.chance(s, 0.05)) { var w = Math.round(200 * W(s)); s.money += w; return '4등 당첨! +' + T.money(w, E.country(s)); }
      return '꽝. 다음 주엔 될 것 같다.';
    } },
    { id: 'crime', label: '범죄', icon: '🦹', min: 14, max: 100, opts: [['shoplift', '가게 물건 훔치기'], ['pickpocket', '소매치기'], ['burglary', '빈집 털기'], ['fraud', '사기 치기']], run: function (s, arg) {
      var t = { shoplift: [0.25, 80], pickpocket: [0.3, 300], burglary: [0.4, 3000], fraud: [0.35, 8000] }[arg || 'shoplift'];
      var catchP = t[0] - (s.stats.smarts - 50) / 250;
      eff(s, { happy: -1 });
      s.flags.criminal = s.flags.criminal || s.age;
      if (E.chance(s, catchP)) {
        if (s.age < 18) { eff(s, { rel: { mother: -12, father: -8 }, fame: 1 }); return '현장에서 붙잡혔다. 경찰서에 엄마가 울면서 왔다.'; }
        return '현장에서 체포됐다. ' + E.FX.jail(s);
      }
      var loot = Math.round(t[1] * (0.5 + E.rnd(s)) * W(s));
      s.money += loot;
      return '들키지 않았다. +' + T.money(loot, E.country(s)) + '. 심장이 아직도 쿵쾅거린다.';
    } },
    { id: 'jobs', label: '구직/이직', icon: '🔎', min: 14, max: 75, ui: 'jobs' },
    { id: 'quitjob', label: '퇴사', icon: '🚪', min: 14, max: 120, avail: function (s) { return s.job ? true : '직장이 없다'; }, ap: 0, run: function (s) { return E.FX.quitJob(s); } },
    { id: 'joinclub', label: '동네 축구클럽 입단', icon: '🥅', min: 5, max: 16, avail: function (s) { return s.fb.stage === 'none' && !s.flags.fb_quit ? true : '이미 소속팀이 있다'; }, run: function (s) { return E.FX.joinLocalClub(s); } },
    { id: 'quitfb', label: '축구 그만두기', icon: '🥾', min: 8, max: 45, avail: function (s) { return ['local', 'regional', 'academy', 'youth', 'pro'].indexOf(s.fb.stage) >= 0 ? true : '소속팀이 없다'; }, ap: 0, run: function (s) { return s.fb.stage === 'pro' ? E.FX.retireFootball(s) : E.FX.quitFootball(s); } },
    { id: 'kids', label: '아이와 놀기', icon: '👶', min: 18, max: 120, avail: function (s) { return E.peopleByRel(s, 'children').length ? true : '아이가 없다'; }, run: function (s) {
      eff(s, { happy: 4, rel: { children: 7 } });
      return E.line(s, 'kids');
    } },
    { id: 'baby', label: '아이 갖기', icon: '🍼', min: 20, max: 50, avail: function (s) { return E.person(s, 'spouse') ? true : '배우자가 필요하다'; }, run: function (s) {
      if (E.chance(s, 0.6)) return E.FX.haveChild(s);
      return '아직 소식이 없다. 조급해하지 않기로 했다.';
    } },
    { id: 'pet', label: '반려동물 입양', icon: '🐶', min: 8, max: 100, avail: function (s) { return s.flags.has_pet ? '이미 반려동물이 있다' : true; }, run: function (s) {
      eff(s, { happy: 6 }); return E.FX.adoptPet(s) + ' 이름은 "' + E.pick(s, ['골키퍼', '드리블', '코너킥', '뭉치', '보리']) + '".';
    } },
    { id: 'house', label: '집 사기', icon: '🏡', min: 25, max: 100, avail: function (s) { return s.flags.homeowner ? '이미 집이 있다' : true; }, run: function (s) { return E.FX.buyHouse(s); } },
    { id: 'car', label: '차 사기', icon: '🚗', min: 18, max: 100, avail: function (s) { return s.flags.car_owner ? '이미 차가 있다' : true; }, run: function (s) { return E.FX.buyCar(s); } },
    { id: 'donate', label: '기부', icon: '🎁', min: 18, max: 120, avail: function (s) { return s.money > 2000 * W(s) ? true : '여윳돈이 없다'; }, run: function (s) {
      var d = Math.round(s.money * 0.1); s.money -= d;
      eff(s, { happy: 5, fame: s.stats.fame > 30 ? 3 : 1 });
      s.donated = (s.donated || 0) + d;
      return T.money(d, E.country(s)) + '을(를) 어린이 병원에 기부했다.';
    } },
    { id: 'blood', label: '헌혈', icon: '🩸', min: 16, max: 69, run: function (s) {
      eff(s, { happy: 3, health: -1 });
      s.bloodDonations = (s.bloodDonations || 0) + 1;
      return E.line(s, 'blood');
    } }
  ];
  E.ACTIVITIES = A;

  E.activities = function (s) {
    return A.filter(function (a) { return s.age >= a.min && s.age <= a.max; }).map(function (a) {
      var av = a.avail ? a.avail(s) : true;
      var cost = a.ap === 0 ? 0 : 1;
      if (av === true && s.jail > 0 && ['study', 'exercise', 'meditate', 'family'].indexOf(a.id) < 0) av = '수감 중에는 할 수 없다';
      if (av === true && cost && s.ap <= 0) av = '올해 행동력을 다 썼다';
      return { id: a.id, label: a.label, icon: a.icon, ok: av === true, reason: av === true ? '' : av, opts: a.opts || null, ui: a.ui || null, cost: cost };
    });
  };

  E.doActivity = function (s, id, arg) {
    var a = A.filter(function (x) { return x.id === id; })[0];
    if (!a || !s.alive || s.queue.length) return null;
    var list = E.activities(s).filter(function (x) { return x.id === id; })[0];
    if (!list || !list.ok || !a.run) return { ok: false, log: list ? list.reason : '지금은 할 수 없다.' };
    if (list.cost) s.ap--;
    var before = JSON.parse(JSON.stringify(s.stats)), m0 = s.money;
    s.y.lineKey = null;
    var text = a.run(s, arg) || '';
    var changes = [];
    Object.keys(before).forEach(function (k) { if (s.stats[k] !== before[k]) changes.push({ k: k, d: s.stats[k] - before[k] }); });
    if (s.money !== m0) changes.push({ k: 'money', d: s.money - m0 });
    E.addLog(s, a.icon + ' ' + text, 'act', { line: s.y.lineKey || null });
    E.checkAchievements(s);
    E.checkDeath(s, true);
    return { ok: true, log: T.fixJosa(text), changes: changes };
  };
  void inSchool;
})(typeof globalThis !== 'undefined' ? globalThis : this);
