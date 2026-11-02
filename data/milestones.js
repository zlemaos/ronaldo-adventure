/* Early-childhood milestones (ages 0-4). These play as a quick montage of picture cards: no choices.
 * pic: picture type drawn by Pixel.drawMilestone; props: country-specific details in that picture. */
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};
  RA.data.milestones = [
    // ---- shared
    { id: 'ms_birth', age: 0, pic: 'birth', cond: { flags: ['!heir'] }, text: '응애! {name}[이/가] 사남매의 막내로 태어났다.', effects: { happy: 2 } },
    { id: 'ms_smile', age: 0, pic: 'smile', text: '{mother}[을/를] 보고 처음으로 방긋 웃었다.', effects: { happy: 2, social: 1 } },
    { id: 'ms_steps', age: 1, pic: 'steps', text: '탁자를 붙잡고 일어나 첫걸음! 세 걸음 만에 엉덩방아.', effects: { health: 2, grit: 1 } },
    { id: 'ms_word', age: 2, pic: 'word', text: '첫 마디는 "엄마"가 아니라 "공!"이었다.', effects: { smarts: 2 } },
    { id: 'ms_bro', age: 2, pic: 'sibling', cond: { rel: { bro: 'alive' } }, text: '{bro}[이/가] 업고 골목을 한 바퀴 돌았다.', effects: { social: 2, rel: { bro: 5 } } },
    { id: 'ms_sisters', age: 3, pic: 'sibling', cond: { rel: { sis1: 'alive', sis2: 'alive' } }, text: '{sis1}[과/와] {sis2}[이/가] 번갈아 동화책을 읽어 줬다.', effects: { smarts: 1, social: 1, rel: { sis1: 4, sis2: 4 } } },
    { id: 'ms_first_ball', age: 3, pic: 'ball', cond: { flags: ['!heir'], rel: { father: 'alive' } }, text: '{father}[이/가] {localClub} 창고에서 낡은 공을 가져왔다. "우리 막내 거다."', effects: { football: 2, happy: 3, rel: { father: 5 } } },
    { id: 'ms_first_ball_heir', age: 3, pic: 'ball', cond: { flags: ['heir'] }, text: '집에 굴러다니던 공을 품에 안고 놓지 않았다.', effects: { football: 2, happy: 2 } },
    { id: 'ms_move', age: 4, pic: 'move', chance: 0.35, cond: { flags: ['!heir'] }, text: '집세가 올라 동네 안 더 좁은 집으로 이사했다. 짐은 리어카 한 대.', effects: { grit: 1, happy: -1 } },
    { id: 'ms_preschool', age: 4, pic: 'preschool', text: '처음 메 본 어린이집 가방이 몸보다 크다.', effects: { social: 2, smarts: 1 } },
    // ---- country ceremonies and festivals
    { id: 'ms_kr_baekil', age: 0, countries: ['kr'], pic: 'ceremony', props: 'baekseolgi', text: '백일. 백설기 탑 앞에서 기념사진을 찍었다.', effects: { happy: 2, health: 1 } },
    { id: 'ms_kr_dol', age: 1, countries: ['kr'], pic: 'birthday', props: 'doljabi', text: '돌잡이! 실도 연필도 아닌 축구공을 덥석 잡았다.', effects: { football: 2, happy: 2 } },
    { id: 'ms_jp_okuizome', age: 0, countries: ['jp'], pic: 'ceremony', props: 'okuizome', text: '오쿠이조메. 평생 먹을 걱정 없으라고 도미 상 앞에 앉았다.', effects: { health: 2 } },
    { id: 'ms_jp_mochi', age: 1, countries: ['jp'], pic: 'birthday', props: 'mochi', text: '첫 생일, 떡 한 되를 등에 지고 비틀비틀 걸었다.', effects: { grit: 2, health: 1 } },
    { id: 'ms_jp_753', age: 3, countries: ['jp'], pic: 'festival', props: 'shichigosan', text: '시치고산. 작은 하카마를 입고 지토세아메를 들었다.', effects: { looks: 2, happy: 1 } },
    { id: 'ms_cn_manyue', age: 0, countries: ['cn'], pic: 'ceremony', props: 'redeggs', text: '만월 잔치. 빨간 달걀이 이웃집마다 돌았다.', effects: { happy: 2, social: 1 } },
    { id: 'ms_cn_zhuazhou', age: 1, countries: ['cn'], pic: 'birthday', props: 'zhuazhou', text: '저우저우 상에서 붓과 주판 대신 공을 집었다.', effects: { football: 2, happy: 1 } },
    { id: 'ms_us_smash', age: 1, countries: ['us'], pic: 'birthday', props: 'smash', text: '첫 생일 케이크에 얼굴부터 박았다.', effects: { happy: 3 } },
    { id: 'ms_us_halloween', age: 2, countries: ['us'], pic: 'festival', props: 'halloween', text: '첫 핼러윈. 호박 바구니에 사탕이 한가득.', effects: { happy: 2, social: 1 } },
    { id: 'ms_br_batizado', age: 0, countries: ['br'], pic: 'ceremony', props: 'baptism', text: '세례식 날, 하얀 옷을 입고 성수에 깜짝 놀랐다.', effects: { happy: 1, social: 1 } },
    { id: 'ms_br_carnival', age: 2, countries: ['br'], pic: 'festival', props: 'carnival', text: '첫 카니발. 가족 어깨 위에서 색종이 비를 맞았다.', effects: { happy: 3 } },
    { id: 'ms_ar_bautismo', age: 0, countries: ['ar'], pic: 'ceremony', props: 'baptism', text: '세례식에서 대부가 작은 축구 유니폼을 선물했다.', effects: { football: 1, happy: 1 } },
    { id: 'ms_ar_asado', age: 2, countries: ['ar'], pic: 'festival', props: 'asado', text: '일요일 아사도. 숯불 냄새 속에서 이 무릎 저 무릎을 옮겨 다녔다.', effects: { social: 2 } },
    { id: 'ms_za_imbeleko', age: 0, countries: ['za'], pic: 'ceremony', props: 'imbeleko', text: '이음벨레코 의식. 친척들이 모여 새 식구를 조상께 알렸다.', effects: { social: 2 } },
    { id: 'ms_za_beach', age: 2, countries: ['za'], pic: 'festival', props: 'beach', text: '첫 크리스마스 바닷가 나들이. 모래를 한 움큼 먹었다.', effects: { happy: 2, health: 1 } },
    { id: 'ms_in_baptism', age: 0, countries: ['in'], pic: 'ceremony', props: 'baptism', text: '세례식 날, 손수 뜬 레이스 옷을 입었다.', effects: { happy: 1, looks: 1 } },
    { id: 'ms_in_carnival', age: 2, countries: ['in'], pic: 'festival', props: 'carnival', text: '고아 카니발을 처음 봤다. 북소리에 맞춰 몸을 흔들었다.', effects: { happy: 3 } },
    { id: 'ms_pt_batismo', age: 0, countries: ['pt'], pic: 'ceremony', props: 'baptism', text: '세례식 날, 성당 종소리에 깜짝 놀라 울음을 터뜨렸다.', effects: { happy: 1, social: 1 } },
    { id: 'ms_pt_fireworks', age: 2, countries: ['pt'], pic: 'festival', props: 'fireworks', text: '첫 새해 불꽃놀이. 항구 하늘이 온통 꽃밭 같았다.', effects: { happy: 3 } },
    { id: 'ms_first_bday', age: 1, countries: ['br', 'ar', 'za', 'in', 'pt'], pic: 'birthday', props: 'cake', text: '첫 생일. 초 하나를 끄려다 케이크에 손을 푹 넣었다.', effects: { happy: 2 } }
  ];
})(typeof globalThis !== 'undefined' ? globalThis : this);
