/* 공감/사교 (social) storylets: friendship, romance, coworkers and teammates react to empathy. */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};
  var EV = RA.data.events = RA.data.events || [];
  EV.push(
    { id: 'soc_lonely_lunch', age: [7, 16], cooldown: 4, cond: { stats: { social: [0, 30] } },
      text: '점심시간, 끼어들 자리가 보이지 않는다.',
      choices: [
        { text: '옆자리에 "같이 먹어도 돼?"', check: { stat: 'social', diff: 25 },
          success: { effects: { social: 3, happy: 3 }, log: '"당연하지!" 생각보다 쉬웠다.' },
          fail: { effects: { happy: -3 }, log: '대답이 없었다. 다음엔 다른 자리로.' } },
        { text: '운동장에서 혼자 공을 찬다', alt: { text: '혼자 {hobbyAct}[을/를] 한다', log: '혼자인 게 오히려 편했다.' }, effects: { football: 1, happy: -1 }, log: '공은 말이 없어서 편했다.' }
      ] },
    { id: 'soc_team_heart', age: [14, 38], cooldown: 5, cond: { fb: ['academy', 'youth', 'pro'], stats: { social: [60, 100] } },
      text: '연패 뒤 라커룸이 조용하다. 다들 고개를 숙였다.',
      choices: [
        { text: '한 명씩 어깨를 두드린다', effects: { social: 2, grit: 2, fame: 1, rel: { coach: 4 } }, log: '다음 경기, 모두가 한 발 더 뛰었다.' },
        { text: '혼자 개인 훈련을 한다', effects: { football: 1 }, log: '실력은 늘었지만 팀은 그대로였다.' }
      ] },
    { id: 'soc_team_feud', age: [16, 38], cooldown: 6, cond: { fb: ['academy', 'youth', 'pro'], stats: { social: [0, 35] } },
      text: '동료가 패스를 안 준다며 언성을 높인다.',
      choices: [
        { text: '먼저 사과하고 이야기한다', check: { stat: 'social', diff: 30 },
          success: { effects: { social: 3, happy: 2 }, log: '오해였다. 그 뒤로 둘의 호흡이 좋아졌다.' },
          fail: { effects: { happy: -3, rel: { coach: -3 } }, log: '말이 엇나가 더 싸웠다. 감독이 둘을 불렀다.' } },
        { text: '무시한다', effects: { happy: -2, football: -1 }, log: '경기 중 둘 사이로 공이 자꾸 끊겼다.' }
      ] },
    { id: 'soc_coworker_help', age: [20, 64], cooldown: 5, cond: { career: 'any', stats: { social: [60, 100] } },
      text: '일하며 알게 된 사람이 힘든 일을 털어놓는다.',
      choices: [
        { text: '끝까지 들어 준다', effects: { social: 2, happy: 2 }, log: '이야기를 마치자 상대의 표정이 한결 부드러워졌다.' },
        { text: '일이 바빠 다음에', effects: { social: -1 }, log: '상대는 "괜찮아"라고 했지만 표정이 어두웠다.' }
      ] },
    { id: 'soc_office_cold', age: [20, 64], cooldown: 6, cond: { career: 'any', stats: { social: [0, 30] } },
      text: '회식 자리에서 대화에 끼지 못하고 겉돈다.',
      choices: [
        { text: '질문 하나를 던져 본다', check: { stat: 'social', diff: 25 },
          success: { effects: { social: 3, happy: 2 }, log: '그 질문 덕에 한 시간 동안 이야기꽃이 폈다.' },
          fail: { effects: { happy: -2 }, log: '정적. 휴대폰만 만지작거렸다.' } },
        { text: '일찍 자리를 뜬다', effects: { happy: 1 }, log: '집에 와서 혼자 라면을 끓였다.' }
      ] },
    { id: 'soc_love_read', age: [16, 60], cooldown: 5, cond: { rel: { partner: 'yes' }, stats: { social: [60, 100] } },
      text: '{partner}의 표정이 어딘가 어둡다.',
      choices: [
        { text: '말없이 따뜻한 차를 건넨다', effects: { social: 1, happy: 2, rel: { partner: 10 } }, log: '"어떻게 알았어?" {partner}[이/가] 그제야 웃었다.' },
        { text: '기분 전환하러 나가자고 한다', effects: { happy: 2, rel: { partner: 5 } }, log: '바람을 쐬니 둘 다 기분이 풀렸다.' }
      ] },
    { id: 'soc_love_miss', age: [16, 60], cooldown: 6, cond: { rel: { partner: 'yes' }, stats: { social: [0, 30] } },
      text: '오늘이 {partner}[과/와]의 기념일이었다. 까맣게 잊었다.',
      choices: [
        { text: '솔직하게 사과한다', check: { stat: 'social', diff: 20 },
          success: { effects: { rel: { partner: 2 }, social: 2 }, log: '"다음엔 꼭 기억해." 겨우 넘어갔다.' },
          fail: { effects: { rel: { partner: -10 }, happy: -3 }, log: '{partner}[이/가] 문을 쾅 닫았다.' } },
        { text: '선물로 때운다', effects: { money: -100, rel: { partner: -3 } }, log: '선물은 받았지만 서운한 눈치였다.' }
      ] },
    { id: 'soc_volunteer', age: [13, 80], cooldown: 6, cond: { stats: { social: [50, 100] } },
      text: '동네 무료 급식소에 일손이 모자란다고 한다.',
      choices: [
        { text: '주말마다 돕는다', effects: { social: 2, happy: 4, fame: 1 }, log: '배식대에서 이웃들의 이름을 하나씩 외웠다.' },
        { text: '이번엔 쉰다', effects: { health: 1 }, log: '푹 잤다. 다음엔 꼭 가 보기로 했다.' }
      ] }
  );
  RA.ownEvents(RA.data.events);
})(typeof globalThis !== 'undefined' ? globalThis : this);
