# 호날두의 모험 — Design document

This document records the research behind the game, the design decisions taken while building v1,
the data schemas, and how to extend the game (events, careers, countries). Code and comments are in
English; all player-facing text is Korean.

## 1. Research findings

Sources reviewed (from the brief, verified against general genre knowledge):
mobygames.com/game/152595/bitlife, bitlifeapp.com/help, bitlife-life-simulator.fandom.com (Stats, Careers),
Failbetter Games' StoryNexus/"storylet" design diaries, Choice of Games "End Game and Victory Design".

| Finding | How it shaped the design |
|---|---|
| BitLife's loop is *choose activities → Age +1 → react to random events → live with consequences*. | Same loop: an Activities menu with 3 action points per year (행동력), a big "+1살" button, then event modals. Action points add a light resource decision that BitLife lacks (it has unlimited activities with diminishing returns). |
| Four core stats (Happiness, Health, Smarts, Looks) are legible and enough to gate content. | Seven 0–100 stats: 건강·행복·지능·외모 + 축구 실력, 체력/근성, 명성, plus money. Gains soften near 100 (soft cap) so stats stay meaningful gates. |
| Age-unlocked activities, education, careers, relationships, assets, crime, ribbons at death, generations. | All present: 27 activities unlocked by age, per-country school system, 156 careers, relationships with bars, house/car, crime + prison, ribbons/titles at death, continue as a child. |
| Emergent stories come from contextual, state-gated "storylets" rather than flat randomness. | Every event has conditions (age, country, stats, flags, football stage, school stage, career/sector/level, relationships, money, gender), once/cooldown, weight, and choices with effects, skill checks and follow-up flags. |
| Delayed consequences and distinct endings drive replay at manageable writing cost. | `schedule: {id, years}` queues follow-ups (52 scheduled follow-ups: lending money, fraud mule → police, hidden heart condition, father's treatment…). Endings are expressed as ribbons/titles + a generated life story. |
| Visible goals and progress sustain long play. | Career ladder view, trophy cabinet, 38 achievements (발롱도르, 월드컵 우승, 국가대표, 노벨상, 대통령/총리, 억만장자, 100세…), end-of-life ribbons, seed sharing. |

## 2. Key design decisions

- **Canon path, not fixed outcome.** The Ronaldo template (youngest of four, poor home, father = gardener +
  kit man at the swallow-named local club, local club → regional club → alone to a big-city academy at 12,
  accent teasing, heart procedure at 15, work ethic, father's alcoholism) is encoded as *priority*
  storylets (`canon_*`). Each needs a stat threshold and offers refusals, so the hero may stay home, quit,
  get released at 20, try a late open trial, or exceed the real story.
- **Father's illness arc is handled seriously.** Drinking is described as an illness. The father has hidden
  `recovery` and `liver` meters; supportive choices (talking, family meeting, paying for a clinic, spending
  "가족과 시간") raise recovery; at 100 he recovers (`father_sober`) and can live a long life. Otherwise his
  liver fails around the hero's early 20s (sim average ≈ 24, the real father died when Ronaldo was 20).
  No choice ridicules him; relapse is framed as part of recovery.
- **Localization by data, not by forks.** One shared event can say `{father}[은/는] {localClub} 장비실…`
  and becomes correct in all 8 countries. Korean particles are resolved automatically from the final
  syllable (`[이/가]`, `[은/는]`, `[을/를]`, `[과/와]`, `[으로/로]`, plus `을(를)` style fallbacks).
- **Fictional names only.** Clubs are parody names (제비 FC, FC 쓰바메, 옌쯔 FC, 힐로 스왈로스 SC,
  안도리냐스 FC, 골론드리나스 FC, 인콘자네 FC, 아바빌 FC — all "swallow", echoing Andorinha); foreign clubs are
  invented (마드리드 왕관 FC, 토리노 흑백 FC…). Humour is situational; no national stereotypes.
- **Money** is stored in a reference unit (≈ 1 USD of US purchasing power) scaled by each country's wage
  factor; display converts to local currency with 만/억/조. Pros abroad earn unscaled wages.
- **Football simulation.** Skill grows fast until 20, plateaus, declines after 31 (slower with high 근성),
  capped by a hidden talent (55–100) + grit. Pro seasons simulate apps/goals from a rating, ladder level
  (유스 계약 → 레전드), league/cup/continental titles, 발롱도르 (rating ≥ 89, abroad, 30+ goals), national
  team call-up, World Cups every 4 years (`year % 4 == 2`, win chance from a national-strength table),
  continental cups, injuries, retirement 33–41.
- **Careers** are data rows with requirements, salary range (geometric interpolation along the ladder),
  key stat, promotion years, difficulty, stress, fame, risk and a `special` hook (football, politics,
  crime, religion, space). Promotion to the top rung needs key stat ≥ 72; politics also needs fame and
  elections.
- **Determinism.** All outcome-affecting randomness uses a serialisable mulberry32 RNG stored in the save
  (`state.rng`). Same seed + same choices = same life (tested). UI-only effects (confetti) use Math.random.
- **Engine/UI split.** `js/rng.js, text.js, engine.js, systems.js, football.js, activities.js, save.js`
  are DOM-free and run in Node; `js/pixel.js, audio.js, ui.js` render. Everything is classic `<script>` tags
  on the global `RA` namespace so `index.html` works from `file://` with no build step.
- **Saves.** 3 localStorage slots + autosave every year; `saveVersion` (now 3) and a migration chain
  (v1: `discipline`→`grit`, string logs → objects, person ids; v2: pending/cooldowns/history/trophy fields).
  If localStorage is blocked the game falls back to memory.
- **Visuals.** 160×96 canvases scaled with `image-rendering: pixelated`. The hero sprite is drawn from
  rectangles: 6 age stages (baby→old, grey hair & wrinkles), 5+2 hairstyles, 22 outfits chosen by career
  sector/football stage/school/prison, moods (sad/celebrate), blinking and breathing. 9 scenes (home,
  school, pitch, stadium with crowd in flag colours, hospital with heart monitor, office, farm, prison,
  grave). Dark navy UI with pitch green and gold; Galmuri11 pixel font (OFL-1.1, licence in
  `assets/fonts/OFL-Galmuri.txt`). Animations: age-up zoom, stat bar tweens + flashes, trophy/ballon/World
  Cup celebration with confetti, chiptune SFX (WebAudio) with mute toggle.
- **Mobile.** ≤ 860px: single column, portrait + stats on top, tabs (기록/활동/관계/학업·직업/축구/업적),
  newest-first log, sticky bottom age button. Checked at 390×844.

## 2b. Narrative-consistency rules (review round 1)

- **Person gating.** Before an event can fire, the engine collects every person it names: the tokens
  `{father} {mother} {bro} {sis1} {sis2} {spouse} {partner} {child} {friend} {coach} {siblings}`, plus the plain
  words 아버지/아빠 and 어머니/엄마. Words like 할아버지 or 시어머니 are removed first, and events about the hero's
  own children are exempt. The event is eligible only while each named person is alive and present
  (`Engine.personsOk`). The same check runs on scheduled follow-ups, on queued modal events (`currentEvent` drops an event
  that became invalid), and on activity flavour lines.
- **Memorial tag.** `memorial: true` or `memorial: ['father']` lets an event name people who have died. A condition
  `rel: { mother: 'dead' }` or the flags `father_dead`/`mother_dead` imply it. Log lines written by memorial events
  carry `mem: 1`, which the narrative test uses.
- **Siblings as a group.** `{siblings}` renders only living siblings ("현우, 가람"), and `{siblingsAll}` gives a count
  word that includes the hero ("셋"). An event that uses either is skipped when no sibling is alive.
- **Deaths.** `Engine.relWord` gives the correct kinship word: 형/오빠/누나/언니/남동생/여동생 from the hero's
  gender and birth order, plus 아내/남편/아들/딸. A death in the family queues a seriously written grief event
  (`sys_grief`; the father keeps `canon_father_farewell`). That year no random storylets fire, only due follow-ups and
  priority events. A "first holiday after a death" event uses `cond.recent: { mother_dead: 2 }`, so it fires at most
  once and only within 2 years of the death. Present-tense texts that say "여섯 식구" use `cond.family: 'all'`, which
  requires both parents and all three siblings to be alive.
- **Jail gating.** While the hero is in prison, only events flagged `jailOk`, `anyState`, or with `cond.flags`
  containing `jailed` may fire. Grief and farewell events count as family visits. Queued events are filtered the moment
  a sentence starts (`dropJailBlocked`). A scheduled follow-up that comes due during the sentence waits until release.
  Only study, exercise, meditation and family visits remain as activities, with prison-specific lines.
- **homeShort.** Each country has `places.homeShort`, a short noun such as "서귀포 돌담집". `{house}` now renders
  this short form, so it reads naturally inside sentences ("어릴 적 {house}에서 했던 다짐"). The long description is
  `{houseLong}` and is used only in the birth line.
- **Particles.** `Text.fixJosa` looks past closing quotes and brackets to find the last syllable:
  `"장례지도사"(으)로` → `"장례지도사"로`. `Text.hasLeftoverJosa` detects any marker that slipped through.
- **Repetition.** Activity flavour lines come from per-stage pools: football has child, teen, academy, pro, veteran
  and amateur pools of 10–12 lines, and work, exercise, haircut, family, kids, doctor and others have 9–15 each.
  `Engine.line` never repeats a line within 3 years. Family time draws from one pool covering the family of origin,
  the hero's own family and memories, so there is always something left to say.
- **Names.** New friends, partners, coaches and children get given names that nobody in the hero's life already has,
  which avoids confusing namesakes.
- **Test.** `test/narrative.test.js` plays 100 seeded lives per country with three autoplayer archetypes. It asserts
  zero non-memorial mentions of a person after their death, zero leftover particle markers, zero non-prison events
  while jailed (the log marks entries written in prison with `j: 1`), and no activity line repeated within 3 years.
  It also includes unit tests for each rule above.
- **Particles after inserted values (round 2).** A particle is never written directly after a placeholder
  (`{hometown}을`); templates use the marker form (`{hometown}[을/를]`). `test/josa.test.js` renders every event,
  choice, career and activity template with each of the 8 countries' values. It fails on any hard-coded particle after
  a placeholder, and on any particle that does not match the inserted value's final consonant, covering
  을/를, 이/가, 은/는, 와/과, 으로/로, (이)라 and 아/야.
- **Memorial frequency (round 2).** One-time memorial acts (the bench donation, finding the father's old bag, the
  headstone unveiling) are `once`. Recurring rituals (제사/기일, 오봉, 청명절, 망자의 날, 위령의 날) have a 5-year
  cooldown and wording that changes on each occurrence: `textVariants`/`logVariants` on the event, and `logVariants`
  on a choice. `maxTimes` caps an event per life; the "smell of the alley reminds me of mother" memory has
  `maxTimes: 2`. Scheduled follow-ups now respect `once` and `maxTimes` as well. The narrative test checks that
  once/maxTimes limits hold, that rituals are at least 3 years apart, and that no ritual repeats the same sentence.
- **Start screen.** The family preview lists "형제자매" with each sibling's kinship word for the chosen hero gender
  (남: 형/누나, 여: 오빠/언니).

## 2c. UI notes (review round 1, part B)

- Resizing the viewport or rotating the phone rebuilds the current screen after a 150 ms debounce, with fresh 160×96
  canvases that keep `image-rendering: pixelated`. Height-only resizes, such as the mobile address bar appearing or
  hiding, only trigger a redraw.
- Unavailable activities are not `disabled`; they are marked `aria-disabled` with an `is-off` style. Tapping one
  shows the reason in a toast. Desktop keeps the hover tooltip, and the hint text depends on
  `(hover: none)` / `(pointer: coarse)`.
- On the title banner the hero stands at x=128 and the title is limited to 64% of the width, so they no longer
  overlap at 360–430 px.
- The South African flag is drawn pixel by pixel from its geometry: green Y bands, white edges outside the Y, gold
  edges inside, and the black hoist triangle.

## 2d. Round 3: mobile-first, early childhood, auto-play, SIUU, Portugal

- **Mobile-first.** The main target is a phone held upright, 360–430 px wide.
  - Every button is at least 44 px tall and wide; the browser test checks this.
  - The primary actions (+1살, ▶ 자동 진행, 1x/2x) sit in a fixed bottom bar inside the safe area. Event cards open as
    bottom sheets, so the choices are within thumb reach.
  - Base text is 15 px, Korean wraps between words (`word-break: keep-all`), there is no horizontal scrolling, and no
    information is available only on hover.
  - Landscape works: the event picture hides and montage cards sit side by side.
  - On desktop the same action bar sits in the side column.
- **Home screen.** `manifest.webmanifest` sets fullscreen, the icons are rendered from the game's own pixel art, and
  Apple meta tags are included. The manifest link is added by JavaScript only over http(s), because a manifest cannot
  load from `file://` and would log an error there. Double-clicking `index.html` still works.
- **SIUU.** `assets/audio/siuu.mp3` plays through one `HTMLAudioElement`; no `fetch`, so it works from `file://`. It is
  created and unlocked on the first tap, as phones require.
  - It plays on "인생 시작하기" and whenever the engine sets the presentation-only cue `s.y.triumph`: turning pro, a
    transfer, a national call-up, trophies and the Ballon d'Or, a successful football moment that raises fame by 3 or
    more, any promotion, a Nobel prize, becoming head of state, and a lottery win.
  - Sad events never set it, and the mute button covers it too.
- **Fixed name.** The hero is always 호날두, for both male and female heroes; the name input is gone. Later
  generations are shown as "2대 호날두", while family members keep their own names. Save migration v3→v4 sets the
  name on old saves and fills in the new fields.
- **Prenatal care (태교).** A life starts at age 0 with one pick (`sys_prenatal`) from 5 options, each with a different
  head start shown as icon chips. Birth happens right after the pick.
- **Ages 0–4 montage.** There are no storylets and no activities. Each year, `Engine.selectMilestones` turns matching
  entries of `data/milestones.js` into cards: a picture type drawn by `Pixel.drawMilestone`, one short sentence (60
  characters at most, checked by the validator) and stat chips. Countries add their own ceremonies, birthdays and
  festivals. The UI shows the cards full-screen, advancing every 1.7 s (1.0 s at 2x); tapping skips ahead. The only
  decisions before age 5 are the prenatal pick and the early-education pick.
- **Early-education focus.** Picked at age 1 (`sys_edu_focus`): 언어 🧠, 음악 😊🧠, 소꿉놀이 🤝, 스포츠 ❤️⚽. Each comes with
  a one-line plain explanation. The effect applies every year through age 7 and is shown as a card (ages 1–4) or a log
  line with chips (5–7). It can be changed once, at age 5 (`sys_edu_change`).
- **New stat 공감/사교 (`social`).** It affects:
  - making friends and dating;
  - job performance, strongly in people-facing sectors and slightly everywhere else;
  - football team chemistry (season rating);
  - 9 `soc_` storylets about friendship, teammates, coworkers and romance, plus checks on `social` in other events.
- **Event categories.** `Engine.eventCategory` gives every event an icon, colour and label: 선택, 추모, 범죄·사건, 축구,
  일, 학교, 사랑, 가족, 건강, 돈, 친구·관계, 고향·명절, 일상. Event cards show it as a coloured badge and coloured top
  border, together with the scene picture. Stat changes are always shown as icon chips such as "🧠 +3", in results,
  pick previews, log lines and montage cards.
- **Auto-play.** `Engine.autoStep(s)` ages one year, or returns `'choose'` without advancing while anything waits in the
  queue. The UI toggle (▶ 자동 진행 / ⏸ 자동 진행 중, 1x/2x) advances every 1.8 s or 0.9 s. It pauses at every choice
  (event choices, career picks, the two early picks) and continues after the player chooses. It can be stopped at any
  time from the bar or from the "⏸ 자동 진행 끄기" button inside an open card.
- **Portugal (`pt`), 원작 루트.** A 9th country, first and selected by default on the start screen, shown as a wide card
  with a "원작 루트" badge. It follows the canon closely:
  - Madeira (Funchal) and a poor family of six on a steep stairway lane;
  - a father who is a park gardener and kit man at the parody club 안도리뉴 푼샬;
  - island club 이줄라르 FC, then alone at 12 to 사자단 유스 아카데미 in Lisbon;
  - the heart scare at 15 and the father's illness.

  It has full country data (€, 총리, a national exam at 18, foods, holidays, school ages), 17 storylets (`data/events_pt.js`),
  3 milestones, a pixel flag, a national-team strength and 유럽 선수권. Portugal is included in every test loop.
  The other 8 countries are unchanged.
- **New data fields.** `RA.data.milestones[]` holds `{ id, age 0..4, pic, props?, countries?, cond?, chance?, text,
  effects }`; `pic` comes from `C.MILESTONE_PICS` and `props` from `C.MILESTONE_PROPS`. Events can carry `pick: true`
  and `pic`. Choices can carry `desc` and `preview`, which drive the pick screens. `C.STAT_ICONS` and `C.STAT_SHORT`
  are shared by the UI. To add a milestone, push an entry; to add a picture type, add a function to `MS` in
  `js/pixel.js` and its name to `C.MILESTONE_PICS`.
- **Tests (round 3).** `test/early.test.js` covers:
  - the fixed name and josa (호날두가/를/는/와/로), plus migration of old saves;
  - the prenatal pick and the montage (only two decisions before age 5, no storylets or activities, a
    country-specific card in every country);
  - the early-education focus (applied every year from 1 to 7, changed once at 5);
  - auto-play stopping at choices and continuing after them;
  - event categories, the 공감 stat and triumph cues;
  - a full life played end to end.

## 2e. Round 5: decisions, the 악동 route, gambling, failure endings, careers

Owner's ask: mischievous choices, routes that can fail, 오락실 뽑기 → 도박 중독 → 겜블러, and real career
choices. The full schema for content writers is in `docs/SCHEMA-r5.md`.

- 올해의 결정 (decision quota). Events marked `decision: true` form a pool. After the normal storylets run,
  `selectEvents` tops up the year until it reaches `E.decisionTarget`: at least 1 a year at ages 5–12,
  2–3 for teens, 1–2 for adults. `s.dec[age]` counts what the player actually chose. Auto-play stops at
  every choice, as before. A "🧭 올해의 결정" badge marks them.
- Traits (`s.traits`): 😈 악동, 🗣️ 평판 (starts at 50 and drifts back toward it), 🎲 도박, 🍺 음주, ⛓️ 전과
  (each jail sentence adds 1). They show as a strip under the stats and as chips on choices. Drinking at 50+
  drains health every year. Gambling at 45+ eats 8–15% of savings every year. A habit of 20+ no longer decays.
  Both raise mortality.
- Risk is visible. Choices show "⚠️ 위험한 선택" when the author flags them, when they bet, when they use a
  failure FX, when they raise a bad trait, or when they schedule a bad follow-up (`E.isRisky`). Fixed-odds
  checks show "성공 35%".
- Gambling (`data/events_gamble.js`, 28 events). A `bet` has odds, a payout multiplier and a stake size
  (tiny / small / medium / big / all). The choice shows "40% · 💰×2.5", the stake and the payout before the
  player picks, and the result line appends the amount. The path runs from childhood claw machines, gacha
  and ddakji, through teen toto, lottery, racetrack, casino and online betting, to debt, loan sharks,
  losing a job, family intervention, treatment (`rehab`) and relapse. Addiction stages are 재미 삼아 → 1단계
  습관 (20) → 2단계 중독 (45, unlocks 겜블러) → 3단계 심각 (75). Gambling events come more often as the
  habit grows (`E.habitWeight`).
- 악동 route (`data/events_mischief.js`, 59 events): pranks, lies, fights, shoplifting, skipping class,
  forged signatures, street racing, scams. Risky options often pay off with money, fame, friends or fun, so
  the route is a real choice and not just a trap.
- Failure FX: `suspend` (정학), `expel` (퇴학), `holdBack` (유급), `dropOut` (자퇴), `careerEndingInjury`,
  `deport`, `bankrupt`, `rehab`, `fbBan`, `quickJob`, `enlist`. Bankruptcy is not triggered by student
  debt while studying, within 4 years after graduating, or while the hero has a job.
- Endings (`data/endings.js`, 31 endings: 18 win and 13 fall). The first match in list order wins, from
  `young_death` and `goat` down to `ordinary`, the catch-all. The summary shows an ending card. The 📖 엔딩
  도감 (menu and summary) lists every ending, with a hint for the ones not yet seen. It is stored in
  localStorage (`ronaldo-adventure.endings`) per browser.
- Careers. There are 17 unusual careers in `data/careers_r5.js`: 겜블러, 야바위꾼, 밀수꾼, 사이비 교주, 점술가,
  용병, 현상금 사냥꾼, 심마니, 스트리머, 먹방 크리에이터, 해적 방송 DJ, 노점상, 전당포, 골동품상, 기수, 스턴트 드라이버
  and 대리기사. Each has 2+ events of its own. A row can be locked by a trait (`req.traits`) and show an
  `unlockHint`.
- Career discovery (`data/events_path.js`, 59 events):
  - 진로 고민 milestones at 13–14, 16–17 (plus a football version) and 19–20;
  - talent-discovery events;
  - part-time job offers;
  - adult career changes, including a dark offer;
  - 가업 (the family trade).

  A choice with `career: 'id'` starts that career straight away. The 🧭 진로 panel (menu and career tab)
  shows the current path, the number of jobs open now, the open special paths (with "N세부터" when the hero
  is too young) and the locked ones with their hints.
- Real-life texture (`data/events_reallife.js`, 92 events): rent and moving, loans, insurance, health
  check-ups, friendships and fallings-out, dating and breakups, inheritance, and military service
  (`enlist`).
- Save v5 (migration 4→5 adds traits, the decision counter, the gamble log and the ending; a past jail
  sentence becomes 전과 1).

Bots (`test/rascal.test.js`, 500 lives each across 9 countries):
- The 악동 bot always takes the risky option, then a bet, then the lowest-odds option.
- The 모범생 bot takes safe options and studies.

The test checks:
- no ending is above 60%;
- each bot reaches 6+ endings;
- the decision quota is met;
- 겜블러 is unlocked and taken in some 악동 lives;
- the 악동 bot has more prison and more failure endings than the 모범생 bot.

Results are in section 7.

Phone screenshots: `docs/screenshots/phone-r5-bet.png` (a bet with odds and chips), `phone-r5-bet-result.png`,
`phone-r5-traits.png`, `phone-r5-paths.png` (진로 panel), `phone-r5-ending.png` and `phone-r5-hall.png` (엔딩 도감).

## 3. Architecture

```
index.html            loads everything with classic <script> tags (order matters)
css/style.css         theme tokens, layout, responsive rules, animations
data/constants.js     enums: stats, majors, sectors, outfits, FX names, text tokens (RA.C)
data/countries.js     8 localized countries
data/careers.js       156 careers
data/achievements.js  achievements + end-of-life ribbons (with test functions)
data/events_*.js      storylets: football/canon, life, country, career
js/rng.js             seeded RNG
js/text.js            token rendering, Korean particles, currency formatting
js/engine.js          state, conditions, events, education, careers, yearly simulation, death
js/systems.js         FX effects, system events (exam, major, grad school, retire, proposal), generations, summary
js/football.js        football growth and pro seasons
js/activities.js      activities menu
js/save.js            slots + migrations
js/pixel.js           pixel renderer (sprites, scenes, flags, trophies)
js/audio.js           chiptune SFX
js/ui.js              DOM screens: start, game, event modal, job finder, summary, menu
tools/validate-data.js  schema validator (also used by tests)
tools/sim-helpers.js    loads the scripts in Node and auto-plays lives
test/*.test.js          node --test suites
```

Yearly order inside `Engine.ageUp`: age/year +1 → prison & illness → stat drift (soft cap) → school
progression / university / exam → career income & promotion → football season → living costs & interest
→ relatives ageing, father's arc, partner drift → death check → delayed + priority + random storylets
(1–3 per year) → achievements.

## 4. Data schemas
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

Additional event fields: `memorial: true | [persons]`, `maxTimes`, `textVariants`, `logVariants` (event or choice), `jailOk: true`, `cond.recent: { flag: years }`, `cond.family: 'all'`, country `places.homeShort`, tokens `{houseLong}`, `{siblings}`, `{siblingsAll}`. Engine-only (canon/system events): `manual: true` (never picked
randomly; queued by the engine), `when: function (s) {…}` (extra condition), `textFn`, `choicesFn`,
choice `run: function (s) {…}`, choice `reqFn`, and `check.min/max` to clamp a skill-check chance.

## 5. How to extend

**Add an event.** Append an object to any `data/events_*.js` (or a new `data/events_mypack.js` added to
`index.html` before `js/rng.js`). Give it a unique prefixed id, an `age` window, `cond` so it reacts to
state, and either `effects`+`log` or 2–4 `choices`. Use tokens (`{father}`, `{food}`, `{exam}`…) and
particle helpers. Run `node tools/validate-data.js`, then `npm test`.

**Add a career.** Push a row into `data/careers.js` with `req`, `salary`, `ladder` (3–7 titles, tokens
like `{leader}` allowed), `keyStat`, `promoteYears`, `difficulty`, `stress`, `fame`, `risk`, `sector`,
`outfit`. It appears automatically in the job finder; add `car_` events with `cond.career: ['your_id']`
for flavour.

**Add a country.** Add an entry to `data/countries.js` following the Country schema (family, places,
clubs, school ages and exam, foods, holidays, names, currency, wage, leader, flag colours, skin tones), add
its id to `COUNTRIES` in `tools/validate-data.js` and the tests, draw its flag in `Pixel.drawFlag`, add a
national strength and continental cup in `js/football.js`, and write ≥ 10 country events with
`countries: ['xx']`.

**Add an achievement or ribbon.** Push to `data/achievements.js`; give it a `test(s, E)` or unlock it from
an event with `effects.achieve`.

**Change the save schema.** Bump `RA.C.SAVE_VERSION` and add `MIGRATIONS[oldVersion]` in `js/save.js`;
add a test that loads a fabricated old save.

## 6. Content volume (v1)

- Storylets: **595** (round 3 added 9 공감 `soc_` events and 17 Portugal events) and 30 early-childhood milestones; earlier counts: (canon 28, football 37, shared life 203, country-specific 141 — kr 19, jp 17, cn 17,
  us 19, br 18, ar 17, za 17, in 17 — career-specific 161) + 6 engine system events.
- Round 5: **833** data storylets (843 with the engine system events), adding 59 악동 (`mis_`), 92 real-life (`rl_`), 28 gambling (`gam_`) and
  59 진로 (`path_`) events. 158 events are decisions and 24 have bets.
- Careers: **173** (156 + 17 unusual round-5 careers) across 21+ sectors (each ≥ 4 careers, each covered by events).
- Endings: 31 (13 failure endings).
- Achievements: 38; ribbons/titles: 20; activities: 27.

## 7. Simulation test output

`npm test` runs `test/simulation.test.js`: 500 full lives per country (4,500 lives, 9 countries), rotating three
player archetypes (random, football-focused, study-focused). Seeds are fixed, so the numbers are
reproducible. Guards fail the build if average death age leaves 55–92, pro share leaves 5–70 %, Ballon
d'Or share exceeds 20 %, fewer than 12 career sectors are used, any stat leaves 0–100, money is not
finite, or any life throws. Latest output:

| country | avgDeath | median | min | max | pro | natTeam | ballon | worldCup | topOfCareer | degree | married | kidsAvg | jailed | fatherSober | fatherDiedAtAvg | achievementsAvg | sectorsUsed |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| pt | 69.6 | 70 | 3 | 97 | 14.4% | 12.4% | 2.8% | 0.6% | 62.2% | 43.4% | 46.4% | 0.40 | 42.6% | 4.0% | 24.0 | 5.3 | 20 |
| kr | 69.1 | 70 | 1 | 99 | 14.8% | 11.8% | 3.2% | 0.2% | 62.6% | 41.0% | 39.6% | 0.27 | 45.8% | 0.4% | 22.7 | 5.3 | 22 |
| jp | 69.5 | 70 | 1 | 100 | 13.4% | 10.0% | 2.4% | 0.4% | 63.8% | 41.4% | 40.4% | 0.31 | 48.6% | 2.4% | 23.3 | 5.3 | 21 |
| cn | 69.8 | 71 | 3 | 100 | 15.4% | 12.2% | 2.8% | 0.4% | 60.6% | 44.2% | 37.0% | 0.27 | 44.6% | 0.6% | 23.2 | 5.3 | 21 |
| us | 68.2 | 69 | 6 | 99 | 13.6% | 10.4% | 1.6% | 0.6% | 59.4% | 40.2% | 39.6% | 0.27 | 47.0% | 0.4% | 22.9 | 5.2 | 19 |
| br | 68.8 | 71 | 2 | 100 | 13.4% | 10.8% | 3.2% | 2.0% | 62.4% | 42.0% | 40.8% | 0.32 | 40.4% | 1.2% | 23.0 | 5.3 | 21 |
| ar | 69.2 | 70 | 1 | 98 | 15.6% | 11.4% | 2.6% | 2.0% | 66.0% | 41.6% | 38.4% | 0.28 | 45.2% | 0.6% | 23.1 | 5.3 | 21 |
| za | 68.5 | 70 | 4 | 95 | 16.4% | 12.2% | 2.2% | 0.0% | 63.0% | 40.8% | 36.4% | 0.26 | 44.0% | 0.4% | 22.9 | 5.3 | 21 |
| in | 70.1 | 71 | 2 | 100 | 12.6% | 10.4% | 3.4% | 0.0% | 59.4% | 42.4% | 42.8% | 0.32 | 47.0% | 0.4% | 22.8 | 5.2 | 18 |

Top career sectors by country:
- pt: service 18.8%, business 17.8%, sports 13.4%, parttime 13.0%, entertainment 5.8%, trade 4.8%
- kr: business 19.8%, service 16.4%, sports 12.8%, parttime 10.8%, entertainment 7.6%, agri 5.4%
- jp: business 18.0%, service 17.0%, parttime 13.0%, sports 10.4%, trade 6.8%, entertainment 6.4%
- cn: business 19.6%, sports 14.8%, service 14.6%, parttime 12.6%, entertainment 7.4%, agri 4.6%
- us: business 18.6%, service 15.8%, parttime 13.8%, sports 12.6%, entertainment 7.6%, trade 6.4%
- br: business 17.8%, service 15.2%, parttime 13.2%, sports 11.2%, entertainment 7.4%, agri 6.6%
- ar: service 17.0%, business 16.0%, parttime 13.6%, sports 12.4%, entertainment 8.2%, agri 6.2%
- za: business 18.8%, sports 14.2%, service 13.6%, parttime 13.2%, trade 6.2%, entertainment 6.0%
- in: business 19.0%, parttime 15.8%, service 14.0%, sports 13.0%, entertainment 6.4%, trade 6.2%

Reading: about a quarter of lives turn pro (higher for the football-focused archetype), roughly one in five
pros wins a Ballon d'Or, and World Cups are realistic by country (Brazil/Argentina ≈ 4–5 %, India ≈ 0.4 %).
The random archetype commits crimes and accepts shady offers, which is why ≈ 20 % end up jailed; a careful
player rarely does. The father recovers in ≈ 4 % of random lives but reliably when the player keeps
choosing support (talks, family time, clinic). Balance changes made from these runs: lottery jackpot
chance clamped (it fired in ~10 % of lives), debt spiral replaced by bankruptcy, lifestyle costs scale with
income, stat soft cap (stats had saturated at ~95 by 40), top-rung promotion gate, Ballon d'Or and World
Cup odds lowered, fraud-offer event made once-per-life.

Round 5 changes these numbers. The random archetype now meets 1–3 decisions a year, and about half of them
have a risky option, so it goes to prison in about 45 % of lives (20 % before). It also turns pro less often
(13–16 %), because the 악동 and gambling routes pull it away from football. Business and service careers
grew because of the new part-time and 진로 events. A deliberate player still controls the outcome; the two
bots below show the range.

Round 5 bots (`test/rascal.test.js`, 500 lives each, 9 countries):

| bot | top endings | kinds | decisions/yr (5–12 / 13–19 / 20+) | jailed | bankrupt | fall endings | 겜블러 unlocked / taken |
|---|---|---|---|---|---|---|---|
| 악동 | fallen_genius 40.6 %, jailbird 38.4 %, legend 7 %, broke_gambler 4.8 %, kingpin 2.2 %, casino_king 2.2 % | 15 | 1.85 / 2.84 / 1.72 | 95 % | 42 % | 90 % | 47 / 25 |
| 모범생 | top_career 34.6 %, local_legend 13.2 %, comeback 11.4 %, star 10.2 %, ordinary 7.6 %, tycoon 5 % | 19 | 1.83 / 2.92 / 1.79 | 2.6 % | 13 % | 16 % | 0 / 0 |

Balance changes made from these runs:
- the 겜블러 habit no longer decays above 20, and gambling events come more often as the habit grows;
- `fallen_genius` was tightened, and the endings were reordered so no ending is above 60 %;
- student debt has a grace period;
- people with a job are not declared bankrupt;
- people in debt cut lifestyle spending (20 % of income instead of 50 %). This alone cut 모범생 bankruptcies
  from 22 % to 13 %. Most of the rest come right after retirement, when the pension no longer covers old
  debt.

## 8. Verification

- `npm test` → all tests pass (66 tests, including the narrative-consistency suite and the round-5 bot suite) (schema, volume, conditions, age-up, checks, careers/promotion, 8-country
  family generation, particles, save round trip, v1 migration, deterministic replay, delayed events,
  generations, football route, 8 × 500-life simulation).
- Headless Chromium (Playwright) at 1280×800 and 390×844 from `file://`: country select → age 1 → events
  → activities → pro contract → job finder → death → summary → continue as child → reload restores the
  slot, with **no console errors or warnings**. Screenshots in `docs/screenshots/`.

## 9. Not done yet / ideas

- No translation of events beyond Korean; no accessibility audit beyond keyboard (Enter = age up) and
  reduced-motion support.
- Assets (house/car) are flags rather than an itemised inventory; no stock market screen.
- A female hero is supported (and heirs may be daughters), but canon text was written with the original "youngest son" story in mind; some lines (e.g. 막내) are neutral, others could be reviewed.
- Content ideas: rival-genius storyline across seasons, coaching career simulation, more country events
  for old age, events for heirs' childhood, challenges ("의사로 100세", "감옥 없이 발롱도르").
