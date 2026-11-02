/* Shared constants used by data packs and the engine.
 * Classic script (no modules) so the game runs from file://.
 * Every file attaches to the global RA namespace. */
(function (G) {
  var RA = G.RA = G.RA || {};
  RA.data = RA.data || {};

  RA.C = {
    SAVE_VERSION: 5,
    HERO_NAME: '호날두',          // the hero is always 호날두 (male or female)
    STATS: ['health', 'happy', 'smarts', 'looks', 'football', 'grit', 'social', 'fame'],
    STAT_LABELS: {
      health: '건강', happy: '행복', smarts: '지능', looks: '외모',
      football: '축구 실력', grit: '체력/근성', social: '공감/사교', fame: '명성', money: '돈'
    },
    STAT_SHORT: {
      health: '건강', happy: '행복', smarts: '지능', looks: '외모', football: '축구', grit: '근성', social: '공감', fame: '명성', money: '돈'
    },
    // the same icons are used for stat bars, change chips and pick previews
    STAT_ICONS: {
      health: '❤️', happy: '😊', smarts: '🧠', looks: '✨', football: '⚽', grit: '💪', social: '🤝', fame: '⭐', money: '💰'
    },
    // School stages (ages per country live in data/countries.js)
    EDU_STAGES: ['none', 'elem', 'middle', 'high', 'univ', 'grad'],
    // Degrees, ordered
    DEGREES: ['none', 'high', 'bachelor', 'master', 'phd'],
    DEGREE_LABELS: { none: '무학', high: '고졸', bachelor: '학사', master: '석사', phd: '박사' },
    MAJORS: {
      medicine: '의학', nursing: '간호학', law: '법학', cs: '컴퓨터공학', engineering: '공학',
      business: '경영학', economics: '경제학', education: '교육학', arts: '미술', music: '음악',
      science: '자연과학', humanities: '인문학', sports: '체육학', agriculture: '농학',
      architecture: '건축학', media: '언론정보학', theology: '종교학', aerospace: '항공우주공학'
    },
    SECTORS: {
      sports: '스포츠', medical: '의료', law: '법률', tech: 'IT/기술', science: '과학/연구',
      education: '교육', arts: '예술', entertainment: '연예', business: '기업/경영',
      finance: '금융', government: '정치/행정', military: '군', public: '공공안전',
      agri: '농림어업', trade: '기술직/제조', service: '서비스/요식', transport: '운송',
      religion: '종교', crime: '범죄', media: '미디어', parttime: '아르바이트'
    },
    // Outfit keys the pixel renderer knows how to draw
    OUTFITS: ['casual', 'kit', 'suit', 'whitecoat', 'scrubs', 'chef', 'farmer', 'hardhat',
      'military', 'police', 'firefighter', 'idol', 'robe', 'lab', 'space', 'prison',
      'uniform', 'apron', 'artist', 'pilot', 'judge', 'hoodie'],
    // Football stages, ordered
    FB_STAGES: ['none', 'local', 'regional', 'academy', 'youth', 'pro', 'retired'],
    FB_STAGE_LABELS: {
      none: '-', local: '동네 클럽', regional: '지역 클럽', academy: '명문 유스 아카데미',
      youth: '유스 리저브', pro: '프로 선수', retired: '은퇴'
    },
    // Named special effects (implemented in js/engine.js -> FX)
    FX: [
      'joinLocalClub', 'joinRegionalClub', 'joinAcademy', 'promoteYouth', 'turnPro',
      'quitFootball', 'retireFootball', 'injury', 'seriousInjury', 'transferAbroad',
      'nationalCallup', 'heartProcedure', 'heartIgnore',
      'fatherSeekHelp', 'fatherRelapse', 'fatherRecover',
      'newFriend', 'loseFriend', 'recordFriendLoan', 'repayFriendLoan', 'forgetFriendLoan', 'friendDebtLost', 'acceptFriendReturn', 'newPartner', 'breakup', 'marry', 'divorce', 'haveChild',
      'jail', 'fired', 'promote', 'demote', 'quitJob', 'getSick', 'cure', 'adoptPet',
      'buyHouse', 'buyCar', 'lottery', 'scam', 'moveAbroad', 'becomeMonk', 'leaveMonastery',
      // round 5: failure routes and life decisions
      'suspend', 'expel', 'holdBack', 'careerEndingInjury', 'deport', 'bankrupt', 'rehab', 'fbBan', 'quickJob',
      'dropOut', 'enlist'
    ],
    // Traits: hidden/visible tendencies that bad (and good) choices build up. Effects and cond.traits use these keys.
    TRAITS: ['mischief', 'rep', 'gamble', 'alcohol', 'record'],
    TRAIT_LABELS: { mischief: '악동 기질', rep: '평판', gamble: '도박 중독', alcohol: '음주', record: '전과' },
    TRAIT_ICONS: { mischief: '😈', rep: '🗣️', gamble: '🎲', alcohol: '🍺', record: '⛓️' },
    // 도박 중독 stages (min value, label)
    GAMBLE_STAGES: [[0, '없음'], [1, '재미 삼아'], [20, '1단계 · 습관'], [45, '2단계 · 중독'], [75, '3단계 · 심각']],
    BET_STAKES: ['tiny', 'small', 'medium', 'big', 'all'],
    // Text tokens available in any event/career text: {token}
    TOKENS: ['name', 'nick', 'father', 'mother', 'bro', 'sis1', 'sis2', 'friend', 'partner',
      'spouse', 'child', 'coach', 'city', 'hometown', 'region', 'bigcity', 'capital', 'house',
      'localClub', 'regionalClub', 'academy', 'bigClub', 'rivalClub', 'league', 'nationalTeam',
      'abroadClub', 'food', 'food2', 'holiday', 'holiday2', 'school', 'exam', 'univ', 'job',
      'fatherJob', 'fatherJob2', 'motherJob', 'currency', 'leader', 'country', 'sportsClub', 'houseLong', 'siblings', 'siblingsAll'],
    // pixel pictures for milestone cards (drawn in js/pixel.js → Pixel.drawMilestone)
    MILESTONE_PICS: ['birth', 'smile', 'steps', 'word', 'ball', 'move', 'sibling', 'birthday', 'ceremony', 'festival',
      'preschool', 'prenatal', 'focus_lang', 'focus_music', 'focus_play', 'focus_sports'],
    MILESTONE_PROPS: ['doljabi', 'zhuazhou', 'mochi', 'smash', 'cake', 'baekseolgi', 'redeggs', 'okuizome', 'baptism',
      'imbeleko', 'shichigosan', 'halloween', 'carnival', 'asado', 'beach', 'fireworks'],
    REL_KEYS: ['father', 'mother', 'siblings', 'bro', 'sis1', 'sis2', 'friend', 'partner',
      'spouse', 'children', 'coach', 'family']
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
