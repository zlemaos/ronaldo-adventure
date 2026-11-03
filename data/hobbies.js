/* Round 8: hobbies, birth origin and content flavours (data). Engine: js/life.js, docs/DESIGN.md §2g.
 * - hobbies: picked at 5 (2-3 of them); they feed a talent, raise the fit of matching routes, open
 *   practice and events, and decide which hobby-specific content (football, basketball…) a life meets.
 * - origins: the neighbourhood a hero is born into (rolled from the seed; Portugal = canon, poor).
 * - flavours: words that make a text belong to one hobby/route; a hero without it never sees that text. */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};

  // noun: used for the {hobby} token ("공부보다 {hobby}에 걸어 본다" → "공부보다 밴드에 걸어 본다")
  RA.data.hobbies = [
    { id: 'football', act: '축구', name: '축구', noun: '축구', icon: '⚽', talent: 'sport', routes: ['football', 'sports_staff'], flavour: 'football', cost: 1, risk: { p: 0.07, label: '발목·무릎 부상', text: '공을 다투다 발목을 접질렸다. 한 달 동안 목발을 짚었다.', effects: { health: -5 } },
      desc: '공 하나로 해 질 때까지 뛰논다.', lines: [] },
    { id: 'basketball', act: '농구', name: '농구', noun: '농구', icon: '🏀', talent: 'sport', routes: ['basketball', 'sports_staff'], flavour: 'basketball', cost: 1, risk: { p: 0.07, label: '손가락 부상', text: '리바운드를 다투다 손가락이 꺾였다. 붕대를 감고 숙제를 했다.', effects: { health: -4 } },
      desc: '농구대 하나만 있으면 어디서든 슛을 쏜다.',
      lines: ['놀이터 농구대에서 자유투를 스무 개 던졌다.', '동네 형들과 길거리 3대3을 했다.', '공을 튕기며 집까지 뛰어갔다.', '농구공을 손가락 위에서 돌려 보려다 이마에 맞았다.', '레이업 스텝을 백 번 밟았다.', '비 오는 날 체육관 구석에서 슛을 쐈다.', '농구 경기 중계를 보며 같은 동작을 따라 했다.', '친구와 일대일 내기를 했다. 아이스크림을 땄다.'] },
    { id: 'baseball', act: '캐치볼', name: '야구', noun: '야구', icon: '⚾', talent: 'sport', routes: ['baseball', 'sports_staff'], flavour: 'baseball', cost: 2, risk: { p: 0.07, label: '공에 맞음', text: '파울 공에 눈두덩을 맞았다. 일주일 동안 판다처럼 다녔다.', effects: { health: -4, looks: -1 } },
      desc: '캐치볼과 방망이 소리가 좋다.',
      lines: ['공터에서 캐치볼을 했다. 글러브 소리가 경쾌했다.', '빈 페트병을 방망이 삼아 스윙 연습을 했다.', '벽에 공을 던지고 받으며 해가 졌다.', '동네 야구 경기에서 안타를 쳤다.', '야구 카드를 모아 앨범에 꽂았다.', '중계를 보며 투수의 폼을 따라 했다.', '배팅 센터에서 시속 100킬로 공을 맞혔다.', '글러브에 기름을 먹이며 길을 들였다.'] },
    { id: 'martial', act: '태권도 연습', name: '태권도·격투기', noun: '태권도', icon: '🥋', talent: 'sport', routes: ['fighter', 'performer', 'safety'], flavour: null, cost: 2, risk: { p: 0.07, label: '대련 중 다침', text: '대련에서 코를 맞아 코피가 멎지 않았다. 병원에서 솜을 틀어막았다.', effects: { health: -4 } },
      desc: '도장에서 기합을 넣고 발차기를 한다.',
      lines: ['도장에서 품새를 처음부터 끝까지 외웠다.', '발차기로 송판을 깼다. 발등이 얼얼했다.', '관장님이 띠를 고쳐 매 줬다.', '대련에서 처음으로 점수를 땄다.', '기합 소리가 커서 칭찬받았다.', '샌드백을 두드리며 땀을 흘렸다.', '승급 심사를 준비했다.', '스트레칭으로 다리 찢기를 연습했다.'] },
    { id: 'sing', act: '노래 부르기', name: '노래', noun: '노래', icon: '🎤', talent: 'music', routes: ['singer', 'idol'], flavour: null, cost: 0, risk: { p: 0.06, label: '목 상함', text: '노래방에서 목이 쉬도록 불렀다가 성대에 혹이 생겼다. 한 달 동안 말을 아꼈다.', effects: { health: -2, happy: -2 } },
      desc: '흥얼거림이 끊이지 않는다.',
      lines: ['좋아하는 노래를 열 번 따라 불렀다.', '노래방에서 고음에 도전했다. 반쯤 성공.', '샤워하며 콘서트를 열었다.', '합창단 연습에서 화음을 맞췄다.', '녹음해서 내 목소리를 들어 봤다. 어색했다.', '가사를 공책에 옮겨 적으며 외웠다.', '동네 행사에서 한 곡을 불렀다.', '호흡을 길게 늘이는 연습을 했다.'] },
    { id: 'band', act: '악기 연주', name: '악기·밴드', noun: '밴드', icon: '🎸', talent: 'music', routes: ['band', 'classical', 'singer'], flavour: null, cost: 3, risk: { p: 0.06, label: '소음 항의', text: '밤에 드럼 패드를 두드리다 이웃이 경찰을 불렀다. 연습할 곳을 잃었다.', effects: { happy: -3, rep: -1 } },
      desc: '기타·피아노·드럼, 손에 잡히는 대로 친다.',
      lines: ['기타 코드 세 개로 노래 한 곡을 쳤다.', '손가락 끝에 굳은살이 생겼다.', '친구 집 창고에서 합주를 했다.', '드럼 패드를 연필로 두드렸다.', '피아노로 좋아하는 곡의 첫 소절을 찾아냈다.', '악보 대신 귀로 곡을 따라 쳤다.', '줄이 끊어져 새 줄을 갈았다.', '메트로놈에 맞춰 같은 마디를 반복했다.'] },
    { id: 'dance', act: '춤 연습', name: '춤', noun: '춤', icon: '💃', talent: 'stage', routes: ['idol', 'performer'], flavour: null, cost: 1, risk: { p: 0.06, label: '발목 접질림', text: '회전 동작을 하다 발목을 접질렸다. 학예회 무대를 놓쳤다.', effects: { health: -4, happy: -1 } },
      desc: '음악이 나오면 몸이 먼저 움직인다.',
      lines: ['거실에서 아이돌 안무를 따라 췄다.', '친구들과 댄스 챌린지 영상을 찍었다.', '학교 축제 춤 연습을 했다.', '거울 앞에서 같은 동작을 스무 번 맞췄다.', '스트리트 댄스 영상을 보며 웨이브를 연습했다.', '춤추다 넘어졌는데 그것도 동작처럼 보였다.', '댄스 학원 체험 수업을 들었다.', '음악을 틀고 즉흥으로 춤을 췄다.'] },
    { id: 'rap', act: '랩 연습', name: '랩', noun: '랩', icon: '🎧', talent: 'lang', routes: ['rapper'], flavour: null, cost: 0, risk: { p: 0.06, label: '가사로 말썽', text: '선생님 흉을 본 가사가 반에 퍼졌다. 교무실에 불려 갔다.', effects: { rep: -3, mischief: 2 } },
      desc: '말장난과 박자, 가사 노트가 친구다.',
      lines: ['가사 노트에 라임을 열 줄 적었다.', '비트를 틀어 놓고 프리스타일을 했다.', '좋아하는 래퍼의 가사를 통째로 외웠다.', '친구들 앞에서 즉흥 랩을 했다. 다들 소리를 질렀다.', '휴대폰으로 첫 녹음을 했다.', '빠른 랩을 연습하다 혀가 꼬였다.', '동네 형의 비트에 가사를 붙였다.', '라임 사전을 만들었다.'] },
    { id: 'draw', act: '그림 그리기', name: '그림', noun: '그림', icon: '🎨', talent: 'art', routes: ['art', 'design', 'writer'], flavour: null, cost: 1, risk: { p: 0.05, label: '낙서로 혼남', text: '수업 시간 공책 낙서를 들켜 공책을 압수당했다. 몇 달 치 그림이 사라졌다.', effects: { happy: -3 } },
      desc: '연습장 귀퉁이마다 그림이 있다.',
      lines: ['연습장 한 권을 낙서로 채웠다.', '창밖 풍경을 크레파스로 그렸다.', '좋아하는 만화 주인공을 따라 그렸다.', '가족 얼굴을 그려 냉장고에 붙였다.', '수채화 물감이 번지는 게 신기했다.', '네 컷 만화를 그려 친구들에게 돌렸다.', '공원에서 나무를 스케치했다.', '색종이로 콜라주를 만들었다.'] },
    { id: 'game', act: '게임', name: '게임', noun: '게임', icon: '🎮', talent: 'logic', routes: ['esports', 'it'], flavour: null, cost: 3, risk: { p: 0.08, label: '밤샘·시력', text: '이불 속에서 밤새 게임을 하다 시력이 뚝 떨어졌다. 안경을 쓰게 됐다.', effects: { health: -2, looks: -1, smarts: -1 } },
      desc: '전략을 짜고 이기는 게 재밌다.',
      lines: ['어려운 판을 열 번 만에 깼다.', '친구와 협동 모드로 밤을 새웠다.', '게임 공략을 공책에 정리했다.', '랭킹전 점수가 올랐다.', '간단한 게임을 직접 만들어 보려 했다.', '보드게임으로 가족을 다 이겼다.', '게임 대회 영상을 보며 전략을 배웠다.', '오목 고수인 할아버지와 한 판 붙었다.'] },
    { id: 'cook', act: '요리', name: '요리', noun: '요리', icon: '🍳', talent: 'taste', routes: ['cook'], flavour: null, cost: 1, risk: { p: 0.07, label: '칼·불에 다침', text: '혼자 요리하다 칼에 손가락을 베었다. 네 바늘을 꿰맸다.', effects: { health: -3 } },
      desc: '부엌에서 뭔가 만들어 먹는 게 좋다.',
      lines: ['처음으로 혼자 계란말이를 만들었다.', '{food}[을/를] 만드는 법을 어깨너머로 배웠다.', '라면에 재료를 더해 나만의 레시피를 만들었다.', '반죽을 치대 쿠키를 구웠다. 반은 탔다.', '시장에서 제철 재료를 구경했다.', '가족을 위해 아침상을 차렸다.', '간을 보며 소금을 한 꼬집 더 넣었다.', '요리 영상을 보며 칼질을 따라 했다.'] },
    { id: 'read', act: '책 읽기', name: '독서', noun: '책', icon: '📚', talent: 'lang', routes: ['writer', 'law', 'media', 'teaching'], flavour: null, cost: 0, risk: { p: 0.05, label: '혼자 노는 아이', text: '쉬는 시간마다 책만 읽다 보니 놀자는 친구가 줄었다.', effects: { social: -3 } },
      desc: '책 속 세상에 빠져 시간 가는 줄 모른다.',
      lines: ['도서관에서 모험 소설 세 권을 빌렸다.', '이불 속에서 손전등을 켜고 책을 읽었다.', '좋아하는 문장을 공책에 옮겨 적었다.', '독서 감상문으로 상을 받았다.', '시리즈 마지막 권을 읽고 한참 멍했다.', '책 속 지도를 따라 그려 봤다.', '헌책방에서 보물 같은 책을 찾았다.', '동생에게 동화책을 읽어 줬다.'] },
    { id: 'act', act: '연극 연습', name: '연극·개그', noun: '연극', icon: '🎭', talent: 'stage', routes: ['actor', 'comedian'], flavour: null, cost: 1, risk: { p: 0.06, label: '무대 공포', text: '학예회 연극에서 대사를 통째로 잊었다. 한동안 사람들 앞에 서기가 무서웠다.', effects: { happy: -3, social: -1 } },
      desc: '흉내 내고 웃기고, 무대가 좋다.',
      lines: ['선생님 성대모사로 반을 뒤집어 놓았다.', '학예회 연극의 대사를 외웠다.', '거울 앞에서 표정 연기를 했다.', '친구들과 짧은 콩트를 짜서 보여 줬다.', '가족 앞에서 일인극을 했다.', '드라마 명장면을 따라 했다.', '마술 쇼처럼 꾸며 장기자랑을 했다.', '즉흥으로 이야기를 지어 연기했다.'] }
  ];

  // Words that tie a text to one hobby/route. A hero meets a text only when it fits their own life:
  // the hobby (now or before), the route, the school track, or (football) a club spell.
  RA.data.flavours = {
    football: { re: /축구|골대|골키퍼|드리블|리프팅|프리킥|코너킥|페널티킥|헤딩|풋살|월드컵|발롱도르|공을 차|공을 몰|공차기|\{regionalClub\}|\{academy\}|\{bigClub\}|\{rivalClub\}|\{league\}|\{nationalTeam\}|\{abroadClub\}|\{coach\}|\{sportsClub\}/,
      // the father works at the local club in every country: "{localClub} 장비실" next to {father} is family, not the hero's football
      clubRe: /\{localClub\}/, routes: ['football'], tracks: ['football'] },
    basketball: { re: /농구|덩크|리바운드|레이업|자유투/, routes: ['basketball'], tracks: [] },
    baseball: { re: /야구|고시엔|홈런|마운드|타석|배팅 케이지|캐치볼/, routes: ['baseball'], tracks: [] }
  };

  // ---------------------------------------------------------------- birth origin
  // roll weights (Portugal is the canon story: always 'poor'); house: shown on the birth line ("…에서 태어났다")
  RA.data.origins = {
    rich: { name: '부유한 동네', icon: '🏰', weight: 12, desc: '돈 걱정 없이 자란다. 대신 기대와 간섭이 따른다.' },
    middle: { name: '평범한 동네', icon: '🏘️', weight: 46, desc: '넉넉하진 않아도 모자라지 않는다.' },
    poor: { name: '가난한 동네', icon: '🏚️', weight: 28, desc: '월세와 끼니 걱정이 일상이다. 일찍 철든다.' },
    slum: { name: '빈민가', icon: '🧱', weight: 14, desc: '거리가 먼저 가르친다. 위험도 기회도 골목에 있다.' }
  };
  // per-country names of the neighbourhoods (parody-safe, generic place words)
  RA.data.originPlaces = {
    kr: { rich: ['언덕 위 고급 주택가', '정원 딸린 단독 주택 집'], slum: ['산비탈 달동네', '달동네 꼭대기 단칸방 집'] },
    jp: { rich: ['고급 주택가', '정원 딸린 이층 주택 집'], slum: ['쪽방촌(도야가이)', '쪽방촌 판잣집'] },
    cn: { rich: ['신도시 고급 단지', '경비가 지키는 고급 아파트 집'], slum: ['청중춘(도시 속 판자촌)', '청중춘 골목 셋방 집'] },
    us: { rich: ['교외 부촌', '수영장 딸린 교외 주택 집'], slum: ['사우스사이드 빈민가', '빈민가 낡은 임대 아파트 집'] },
    pt: { rich: ['언덕 위 저택가', '바다가 보이는 저택 집'], slum: ['항구 뒤 판자촌', '판자촌 양철 지붕 집'] },
    br: { rich: ['해변 고급 콘도 단지', '경비 초소가 있는 고급 콘도 집'], slum: ['언덕 위 파벨라', '파벨라 벽돌 집'] },
    ar: { rich: ['북부 고급 주택가', '정원이 넓은 주택 집'], slum: ['비야(빈민촌)', '비야의 함석 지붕 집'] },
    za: { rich: ['담장 높은 교외 주택가', '경비가 지키는 교외 주택 집'], slum: ['타운십 판자 구역', '타운십 판잣집'] },
    in: { rich: ['고급 주택 단지', '하인이 있는 큰 저택 집'], slum: ['바스티(빈민촌)', '바스티 골목 판잣집'] }
  };
  // origin words: content about the slum or the rich side of town is met only by heroes born there
  RA.data.originFlavours = {
    slum: /달동네|판자촌|빈민가|빈민촌|파벨라|타운십|바스티|쪽방촌|청중춘|비야\(/,
    rich: /저택|부촌|별장|고급 주택가|운전기사|가정부/
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
