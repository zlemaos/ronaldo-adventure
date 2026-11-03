/* Careers added with the route rebuild (round 7): positions for the new sport and music routes.
 * Same positional helper as data/careers.js. These are entered through their route (see data/routes.js). */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};
  RA.data.careers = RA.data.careers || [];
  function K(id, name, sector, outfit, req, salary, ladder, keyStat, n, desc) {
    RA.data.careers.push({ id: id, name: name, sector: sector, outfit: outfit, desc: desc, req: req, salary: salary, ladder: ladder,
      keyStat: keyStat, promoteYears: n[0], difficulty: n[1], stress: n[2], fame: n[3], risk: n[4] });
  }
  K('basketball_player', '프로 농구 선수', 'sports', 'kit', { minAge: 18, maxAge: 40, degree: 'none' },
    [30000, 9000000], ['유망주', '프로 신인', '주전 선수', '올스타', '리그 MVP', '농구 레전드'],
    'health', [2, 5, 4, 4, 2], '큰 키보다 큰 심장이 필요하다는 직업.');
  K('baseball_player', '프로 야구 선수', 'sports', 'kit', { minAge: 18, maxAge: 42, degree: 'none' },
    [25000, 8000000], ['육성 선수', '1군 백업', '주전 선수', '팀의 에이스', '리그 MVP', '야구 레전드'],
    'health', [2, 5, 4, 4, 2], '긴 시즌을 버티며 공 하나에 집중하는 직업.');
  K('band_musician', '밴드 뮤지션', 'entertainment', 'idol', { minAge: 15, maxAge: 75, degree: 'none' },
    [3000, 2000000], ['합주실 멤버', '인디 밴드', '인디 스타', '페스티벌 헤드라이너', '전설의 밴드'],
    'happy', [2, 4, 3, 3, 0], '앰프 소리와 셔틀버스, 그리고 끝나지 않는 합주.');
  K('rapper', '래퍼', 'entertainment', 'hoodie', { minAge: 13, maxAge: 75, degree: 'none' },
    [2000, 3000000], ['언더 래퍼', '믹스테이프 래퍼', '쇼 출신 래퍼', '차트 래퍼', '레이블 대표'],
    'social', [2, 4, 3, 3, 0], '비트 위에 내 인생을 얹는다. 라임 노트가 곧 일기장.');
  K('vocal_coach', '보컬·음악 트레이너', 'education', 'casual', { minAge: 20, maxAge: 80, degree: 'none' },
    [20000, 150000], ['보조 강사', '보컬 트레이너', '수석 트레이너', '스타 트레이너'],
    'social', [3, 2, 2, 1, 0], '남의 목소리를 무대 위로 올려 주는 사람.');
  K('sports_coach', '스포츠 코치', 'sports', 'suit', { minAge: 24, maxAge: 75, degree: 'none', flags: ['!jailed'] },
    [30000, 3000000], ['유소년 코치', '팀 코치', '수석 코치', '감독', '명장'],
    'smarts', [3, 3, 4, 2, 0], '선수의 가능성을 찾고 훈련으로 키워 주는 직업.');
})(typeof globalThis !== 'undefined' ? globalThis : this);
