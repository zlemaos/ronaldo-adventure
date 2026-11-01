# Data schemas (호날두의 모험)

All data files are classic scripts (no `import`, no `fetch`) that attach to the global `RA`
namespace. Every data file starts with this wrapper:

```js
(function (G) {
  var RA = G.RA = G.RA || {}; RA.data = RA.data || {};
  // ... push data here
})(typeof globalThis !== 'undefined' ? globalThis : this);
```

Allowed enum values (stats, majors, sectors, outfits, football stages, FX names, text tokens,
relationship keys) live in `data/constants.js` (`RA.C`). The validator `node tools/validate-data.js`
checks every pack against these rules. Player-facing text is Korean; code/comments English.

## Money

All money numbers in data are in a **reference unit (≈ 1 USD of US purchasing power)**.
The engine multiplies by `country.wage` (cost-of-living/wage factor) and displays with
`country.currency`. So write salaries/prices as if the game were set in the USA, e.g. a trip = 1500,
a doctor's salary = [90000, 400000].

## Text tokens

Any text may contain `{token}` from `RA.C.TOKENS`. Meaning:
`name` hero given name, `nick` hero nickname, `father`/`mother` parent names, `bro`/`sis1`/`sis2`
siblings, `friend` best friend, `partner` current partner, `spouse`, `child` (first child),
`coach` youth coach, `city` current city, `hometown`, `region` home region/island, `bigcity`
(city of the big academy), `capital`, `house` (description of family home), `localClub`,
`regionalClub`, `academy`, `bigClub`, `rivalClub`, `league` (domestic pro league), `nationalTeam`,
`abroadClub` (current/likely foreign big club), `food`/`food2` (random local dishes),
`holiday`/`holiday2` (local holidays), `school` (current school name), `exam` (big national exam),
`univ` (university name), `job` (current job title), `fatherJob`, `fatherJob2`, `motherJob`,
`currency` (currency unit word), `leader` (head-of-government title, e.g. 대통령/총리), `country`.

Korean particles after tokens: the engine supports `{name}[이/가]`, `[은/는]`, `[을/를]`,
`[과/와]`, `[으로/로]`, `[아/야]`, `[이/]` right after a token and picks the correct form by the last
syllable (e.g. `{father}[은/는] 웃었다.`). Use them whenever a particle follows a token.

## Country (`data/countries.js`)

```js
RA.data.countries = RA.data.countries || {};
RA.data.countries.kr = {
  id: 'kr', name: '한국', adjective: '한국',
  flag: ['#ffffff', '#c60c30', '#003478'],    // 3 colors used for a pixel flag
  skin: ['#f1c9a5', '#e0ac85'],               // 2 plausible hero skin tones (pixel portrait); vary by country
  hair: '#1b1b1f',                            // default hair color
  currency: { unit: '원', symbol: '₩', rate: 1300 }, // display = reference * wage * rate
  wage: 0.7,                                  // wage / price factor vs USA (0.15 .. 1.0)
  leader: '대통령',                            // head of government title
  hero: { surname: '오', given: '날두', nick: '날두' },  // default hero name (player can edit)
  family: {
    father: { name: '오진수', job: '구청 공원 정원사', job2: '제비 FC 장비 담당' },
    mother: { name: '정미자', job: '식당 조리원 겸 청소원' },
    siblings: [ // exactly 3, all older: brother then two sisters (canon: Hugo, Elma, Kátia)
      { key: 'bro', name: '오현우', gender: 'm', gap: 10 },
      { key: 'sis1', name: '오은미', gender: 'f', gap: 8 },
      { key: 'sis2', name: '오가람', gender: 'f', gap: 6 }
    ]
  },
  places: {
    hometown: '제주 서귀포 바닷가 동네', region: '제주', city: '서귀포',
    bigcity: '서울', capital: '서울',
    house: '방 두 칸에 여섯 식구가 사는 낡은 슬레이트 지붕 집'
  },
  clubs: {
    local: '제비 FC',                // Andorinha analog (amateur neighbourhood club)
    regional: '탐라 유나이티드',       // Nacional analog
    academy: '서울 라이온즈 유스',      // Sporting academy analog (far from home)
    big: '서울 라이온즈',              // its senior club
    rival: '부산 갈매기스',
    league: 'K-프로리그'
  },
  nationalTeam: '대한민국 대표팀',
  school: {
    elem: { name: '초등학교', from: 7, to: 12, school: '서귀포 바다초등학교' },
    middle: { name: '중학교', from: 13, to: 15, school: '서귀포 한라중학교' },
    high: { name: '고등학교', from: 16, to: 18, school: '서귀포 해송고등학교' },
    exam: { name: '수능', age: 18 },  // big exam at end of high school (age = the year it happens)
    univTop: '한빛대학교', univMid: '바다시립대학교', univAbroad: '보스턴 공과대학',
    sportsClub: '방과후 축구부',       // the school football club culture word
    notes: '초·중·고 6-3-3, 수능, 대학'
  },
  foods: ['고기국수', '김치찌개', '떡볶이', '갈치조림', '귤'],   // >= 5
  holidays: ['설날', '추석', '어린이날'],                     // >= 3
  footballCulture: '...one Korean sentence about local football culture...',
  names: {                       // for friends, partners, coaches, children: >= 12 each
    m: ['민준', ...], f: ['서연', ...], surnames: ['김', '이', ...]
  },
  nameOrder: 'surname-first'     // or 'given-first' (used to compose full names)
};
```

Countries: `kr` 한국, `jp` 일본, `cn` 중국, `us` 미국, `br` 브라질, `ar` 아르헨티나,
`za` 남아공, `in` 인도. All club/school/university names are fictional parodies.

## Career (`data/careers.js`)

```js
RA.data.careers = RA.data.careers || [];
RA.data.careers.push({
  id: 'doctor',               // unique snake_case
  name: '의사',
  sector: 'medical',          // RA.C.SECTORS key
  outfit: 'whitecoat',        // RA.C.OUTFITS key
  desc: '사람을 살리는 일. 밤샘 당직은 덤.',
  req: {
    minAge: 26, maxAge: 60,       // age window to be hired
    degree: 'bachelor',           // minimum RA.C.DEGREES value
    majors: ['medicine'],         // optional: one of these majors required
    stats: { smarts: 70 },        // optional minimum stats
    flags: ['!jailed']            // optional flag requirements ('!' = must not have)
  },
  salary: [60000, 400000],        // reference units per year: level 0 .. top level (interpolated)
  ladder: ['인턴', '레지던트', '전문의', '과장', '병원장'],   // 3..7 job titles, low to high
  keyStat: 'smarts',              // stat that drives performance/promotion
  promoteYears: 3,                // min years at a level before promotion
  difficulty: 4,                  // 1 (easy hire) .. 5 (very hard)
  stress: 3,                      // 1..5 yearly happiness/health strain
  fame: 0,                        // 0..5 yearly fame gain at top levels
  risk: 0,                        // 0..5 chance of arrest/injury etc (crime, soldier, stunt)
  special: undefined              // optional: 'football' | 'politics' | 'crime' | 'religion' | 'space'
});
```

## Event / storylet (`data/events_*.js`)

```js
RA.data.events = RA.data.events || [];
RA.data.events.push({
  id: 'kr_chuseok_rice',      // unique; prefix with pack (kr_, life_, car_, fb_ ...)
  age: [6, 17],               // inclusive age window (default [1, 120])
  countries: ['kr'],          // optional list of country ids
  weight: 10,                 // relative pick weight (default 10)
  once: true,                 // fire at most once per life (default false)
  cooldown: 4,                // years before it can recur (default 6 when not once)
  priority: false,            // true = always fires the first year it is eligible (canon only)
  cond: {                     // all optional, all must hold
    stats: { football: [60, 100], happy: [0, 30] },   // inclusive ranges
    money: [0, 2000],         // reference units (state money / wage)
    flags: ['dated', '!married'],
    fb: ['academy', 'youth', 'pro'],      // current football stage
    edu: ['elem', 'middle'],              // current school stage ('none' = not in school)
    degree: 'bachelor',                   // minimum degree held
    career: ['doctor', 'nurse'],          // current career id, or 'any' (employed) / 'none'
    sector: ['medical'],                  // current career sector
    level: [2, 9],                        // current ladder level index range
    rel: { father: 'alive', partner: 'yes', spouse: 'no', children: 'yes', friend: 'yes' },
    gender: 'm'
  },
  text: '{holiday}, {mother}[이/가] 송편 빚는 법을 알려 준다.',
  // EITHER choiceless: effects + log
  effects: { happy: 3 }, log: '송편을 터뜨렸지만 다들 웃었다.',
  // OR 2..4 choices
  choices: [
    {
      text: '열심히 따라 한다',
      req: { stats: { grit: 20 }, money: 0 },   // optional; choice disabled if unmet
      effects: { happy: 4, rel: { mother: 6 } },
      log: '{mother}[이/가] "우리 막내 손이 야무지네" 하고 웃었다.'
    },
    {
      text: '몰래 축구공 들고 나간다',
      check: { stat: 'football', diff: 40 },   // success chance rises with stat - diff
      success: { effects: { football: 2 }, log: '골목에서 드리블 연습을 했다.' },
      fail: { effects: { rel: { mother: -5 } }, log: '들켜서 혼났다.' },
      schedule: { id: 'kr_some_followup', years: 2 }   // delayed consequence (optional)
    }
  ]
});
```

Effects object keys:
- stat deltas: `health`, `happy`, `smarts`, `looks`, `football`, `grit`, `fame` (typical ±1..10),
- `money` (reference units, may be negative),
- `rel: { father: 5, siblings: -3, ... }` (keys from `RA.C.REL_KEYS`),
- `flags: ['x']` set flags, `unflags: ['y']` clear flags,
- `fx: ['newFriend']` named special effects from `RA.C.FX`,
- `achieve: 'id'` unlock an achievement id (optional).

Flags are free-form snake_case strings. Commonly read flags set by the engine:
`moved_alone`, `heart_fixed`, `heart_hidden`, `father_drinking`, `father_sober`, `father_dead`,
`mother_dead`, `jailed`, `ever_jailed`, `married`, `divorced`, `has_pet`, `homeowner`,
`car_owner`, `monk`, `famous`, `rich`, `nat_team`, `abroad`, `fb_quit`, `dropout`, `smoker`,
`drinker`, `bullied`, `homesick`, `scholarship`, `vegan`, `traveler`.

Writing guidelines: every event should react to state (cond), be 1–3 sentences, situational humour,
no national/ethnic stereotypes, father's alcoholism/illness handled seriously and respectfully.

## FX reference (named special effects, implemented in `js/engine.js`)

| fx | meaning |
|---|---|
| joinLocalClub / joinRegionalClub / joinAcademy | advance football stage (joinAcademy also moves hero alone to `bigcity`, sets `moved_alone`) |
| promoteYouth / turnPro | academy → youth reserve → professional contract (career becomes `footballer`) |
| quitFootball / retireFootball | leave football (sets `fb_quit`) / retire as pro |
| injury / seriousInjury | football or general injury (health down, may miss season) |
| transferAbroad | pro moves to a big foreign club (sets `abroad`) |
| nationalCallup | called to the national team (sets `nat_team`) |
| heartProcedure / heartIgnore | canon heart scare at 15: treat (sets `heart_fixed`) or hide (sets `heart_hidden`, later risk) |
| fatherSeekHelp / fatherRelapse / fatherRecover | father's alcoholism arc (raises/lowers father's recovery; `father_sober` on recovery) |
| newFriend / loseFriend | add a new best friend / lose the best friend |
| newPartner / breakup / marry / divorce / haveChild | romance & family |
| jail | go to prison (sets `jailed`, `ever_jailed`; loses job) |
| fired / promote / demote / quitJob | career changes for the current job |
| getSick / cure | catch an illness (health drain each year) / cure it |
| adoptPet | sets `has_pet` |
| buyHouse / buyCar | buy (if affordable) – sets `homeowner` / `car_owner` |
| lottery / scam | random big win / lose a chunk of money |
| moveAbroad | emigrate (sets `abroad`) |
| becomeMonk / leaveMonastery | religious life (career `monk`, sets/clears `monk`) |
