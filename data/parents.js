/* Fictional family vocabulary; levels describe behaviour, not diagnoses. */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};
  RA.data.parents = {
    combos: ['edu_pressure', 'warm_unreliable', 'debt', 'cold_strict'],
    jobs: [
      { id: 'kitman', name: '구단 장비 담당', tier: 2, time: 'shift', exposure: ['football', 'sports'], desc: '선수들의 장비와 경기 준비를 맡는다.' },
      { id: 'cook', name: '요리사', tier: 2, time: 'shift', exposure: ['cooking'], desc: '식당 부엌에서 음식을 만든다.' },
      { id: 'teacher', name: '교사', tier: 3, time: 'regular', exposure: ['language', 'logic'], desc: '학교에서 아이들을 가르친다.' },
      { id: 'musician', name: '음악가', tier: 2, time: 'flexible', exposure: ['music', 'stage'], desc: '연습과 공연으로 생활한다.' },
      { id: 'artist', name: '미술가', tier: 2, time: 'flexible', exposure: ['art'], desc: '그림과 작품을 만든다.' },
      { id: 'doctor', name: '의사', tier: 5, time: 'shift', exposure: ['medical', 'logic'], desc: '환자를 진료하며 당직을 선다.' },
      { id: 'driver', name: '운전기사', tier: 2, time: 'away', exposure: ['language'], desc: '먼 길을 운전하며 집을 비우기도 한다.' },
      { id: 'engineer', name: '기술자', tier: 4, time: 'regular', exposure: ['logic'], desc: '기계와 기술 문제를 해결한다.' },
      { id: 'caregiver', name: '가정 돌봄', tier: 1, time: 'home', exposure: ['cooking'], desc: '집안 살림과 가족 돌봄을 맡는다.' },
      { id: 'farmer', name: '농부', tier: 2, time: 'flexible', exposure: ['cooking'], desc: '농작물을 기른다.' },
      { id: 'fisher', name: '어부', tier: 2, time: 'away', exposure: ['sports'], desc: '바다에서 고기를 잡는다.' },
      { id: 'factory', name: '공장 노동자', tier: 2, time: 'shift', exposure: ['logic'], desc: '생산 설비를 다룬다.' },
      { id: 'office', name: '사무직', tier: 3, time: 'regular', exposure: ['logic'], desc: '회사 문서와 업무를 처리한다.' },
      { id: 'shopkeeper', name: '가게 주인', tier: 3, time: 'flexible', exposure: ['language'], desc: '손님을 맞고 가게를 운영한다.' },
      { id: 'nurse', name: '간호사', tier: 3, time: 'shift', exposure: ['medical'], desc: '환자를 돌본다.' },
      { id: 'police', name: '경찰관', tier: 3, time: 'shift', exposure: ['sports'], desc: '지역의 안전을 지킨다.' },
      { id: 'soldier', name: '군인', tier: 3, time: 'away', exposure: ['sports'], desc: '부대에서 복무한다.' },
      { id: 'civil_servant', name: '공무원', tier: 3, time: 'regular', exposure: ['language'], desc: '공공 업무를 맡는다.' },
      { id: 'programmer', name: '개발자', tier: 4, time: 'regular', exposure: ['logic'], desc: '프로그램을 만든다.' },
      { id: 'construction', name: '건설 노동자', tier: 2, time: 'away', exposure: ['logic', 'sports'], desc: '건설 현장에서 일한다.' },
      { id: 'cleaner', name: '청소 노동자', tier: 1, time: 'shift', exposure: ['cooking'], desc: '일터와 공공장소를 깨끗하게 관리한다.' }
    ],
    talents: [{ id: 'sports', name: '운동' }, { id: 'music', name: '음악' }, { id: 'art', name: '미술' }, { id: 'logic', name: '논리' }, { id: 'language', name: '언어' }, { id: 'cooking', name: '요리' }, { id: 'stage', name: '끼' }],
    bright: [
      { id: 'warmth', name: '다정함', levels: ['표현은 적어도 곁에 있다', '가끔 먼저 안부를 묻는다', '속상한 말을 끝까지 들어 준다', '바쁜 날에도 마음을 살피고 안아 준다'] },
      { id: 'diligence', name: '성실함', levels: ['일정이 자주 바뀐다', '맡은 일을 기억하려 한다', '약속한 일을 꾸준히 해낸다', '힘든 날에도 책임을 나눠 끝낸다'] },
      { id: 'grit', name: '끈기', levels: ['막히면 다른 길을 찾는다', '한 번 더 시도해 본다', '실패 뒤에도 계획을 고쳐 도전한다', '오래 걸리는 목표도 차근차근 이어 간다'] },
      { id: 'humor', name: '유머', levels: ['말투가 차분하고 진지하다', '가끔 농담으로 웃긴다', '힘든 날에도 함께 웃을 일을 찾는다', '가족의 긴장을 풀되 아픈 마음은 놀리지 않는다'] },
      { id: 'curiosity', name: '호기심', levels: ['익숙한 것을 편하게 여긴다', '낯선 이야기에 귀를 기울인다', '새로운 곳과 놀이를 함께 찾아본다', '모르는 것을 아이와 함께 배운다'] },
      { id: 'education', name: '교육열', levels: ['배움의 방향을 아이에게 맡긴다', '학교생활을 가끔 묻는다', '배우고 싶은 것을 찾아 지원한다', '시간과 돈을 아껴 배울 기회를 마련한다'] },
      { id: 'social', name: '사교성', levels: ['가까운 사람들과 조용히 지낸다', '이웃에게 먼저 인사한다', '주변 사람들과 도움을 주고받는다', '여러 모임을 이어 가족에게도 사람을 소개한다'] }
    ],
    dark: [
      { id: 'alcohol', name: '술', levels: ['술 때문에 일상이 흔들리지 않는다', '술자리 다음 날 피곤해한다', '주말마다 술자리, 약속을 가끔 잊는다', '잦은 음주로 생활이 흔들려 어른들의 도움이 필요하다'] },
      { id: 'gambling', name: '도박', levels: ['돈을 걸고 놀지 않는다', '가끔 작은 돈을 걸고 후회한다', '판돈 때문에 생활비를 두고 다툰다', '잃은 돈을 되찾으려 빚을 내기도 한다'] },
      { id: 'temper', name: '다혈질', levels: ['화가 나도 말을 가다듬는다', '피곤하면 말이 날카로워진다', '작은 일에도 목소리가 커진다', '분노를 가라앉히기 어려워 주변의 도움이 필요하다'] },
      { id: 'neglect', name: '무관심', levels: ['아이의 일상을 챙긴다', '바쁠 때 아이의 말을 놓친다', '학교와 친구 이야기를 자주 흘려듣는다', '중요한 날에도 아이의 필요를 알아차리지 못한다'] },
      { id: 'control', name: '지나친 간섭', levels: ['아이의 선택을 존중한다', '선택 전에 조언을 많이 한다', '친구와 취미까지 대신 정하려 한다', '다른 의견을 받아들이기 어려워 자주 부딪힌다'] },
      { id: 'spending', name: '낭비', levels: ['필요한 돈을 남겨 둔다', '가끔 충동구매를 한다', '사고 싶은 것을 사느라 예산이 모자란다', '생활비까지 써 버려 가족이 함께 대책을 찾는다'] },
      { id: 'lying', name: '거짓말', levels: ['모르는 일과 실수를 솔직히 말한다', '곤란한 일을 작게 둘러댄다', '지키기 어려운 약속으로 상황을 넘긴다', '숨긴 일이 쌓여 가까운 사람의 믿음이 흔들린다'] }
    ],
    presets: {
      canon: {
        father: { nationality: 'pt', jobId: 'kitman', talents: { sports: 2 }, bright: { warmth: 2, grit: 1 }, dark: { alcohol: 2 } },
        mother: { nationality: 'pt', jobId: 'cook', talents: { cooking: 2 }, bright: { warmth: 3, diligence: 3, grit: 3 }, dark: {} },
        siblings: 3, note: '실제 공개된 이야기에서 영감을 받은 허구 설정'
      },
      random: { note: '시드에 따라 다른 가족을 만납니다.' },
      custom: { note: '직접 고른 가족입니다.' }
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
