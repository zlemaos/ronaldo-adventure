# 호날두의 모험 (Ronaldo's Adventure) — Build Brief

You are building a complete, playable game from an empty repository. Work autonomously to the end:
research → design → implement → test → polish → push. Do not stop at a plan. Make reasonable decisions
yourself and record them in `docs/DESIGN.md`.

## 1. What the game is

A pixel-art (도트) life-simulation game in the style of BitLife-type "인생 게임" (life sim) titles.
The player lives the whole life of a Cristiano-Ronaldo-like hero, year by year, from age 1 until death.

- Before starting, the player picks the **birth country**: 한국, 일본, 중국, 미국, 브라질, 아르헨티나, 남아공(South Africa), 인도.
- The hero's real family background is **re-imagined to fit the chosen country** (see §3). Same family
  structure and the same kind of hardships, but names, city, jobs, schools, food, holidays, money,
  school system and football culture all match that country.
- **Every career route is possible**, not only football. Football is the signature, deepest route,
  but the hero can become a doctor, farmer, idol singer, programmer, chef, soldier, president, criminal,
  monk, astronaut, etc. Build a data-driven career system with a wide catalogue (target 120+ careers
  across all major sectors, each with requirements, salary range, promotion ladder and flavour events),
  easy to extend by adding data entries.
- UI language: **Korean** (all player-facing text). Code and comments in English.

## 2. Genre research (do your own too, then design)

Findings already gathered (verify/extend with your own research before designing):

- BitLife's core loop: choose activities → **Age +1 year** → respond to random events → live with
  consequences. Four core stats: Happiness, Health, Smarts, Looks. Age-unlocked activities, education,
  careers, relationships, assets, crime, achievements/ribbons at death, and continuing as a child
  (generations). Its appeal: simple text controls, outrageous emergent stories, real consequences,
  replay goals (achievements, ribbons, challenges). Sources: mobygames.com/game/152595/bitlife,
  bitlifeapp.com/help, bitlife-life-simulator.fandom.com/wiki/Stats and /wiki/Careers.
- Contextual "storylets" (events gated by state/qualities) beat disconnected randomness
  (Failbetter StoryNexus diaries). Delayed consequences and distinct endings drive replay with
  manageable writing cost (Choice of Games "End Game and Victory Design").
- Visible goals and progress (career ladder, trophy cabinet, life goals) sustain long-term play.

Design requirements derived from this:
- Core stats: 건강, 행복, 지능, 외모, plus 축구 실력 (football skill), 체력/근성 (discipline), 돈, 명성.
- A **storylet event engine**: every event has conditions (age range, country, stats, career, flags,
  relationships, cooldown, weight) and choices with effects and follow-up flags. Delayed consequences.
- Year log ("인생 기록") like BitLife's feed, with a pixel portrait that ages (baby → child → teen →
  adult → old).
- Activities menu unlocked by age (공부, 운동, 축구 연습, 데이트, 아르바이트, 병원, 여행, 투자, 범죄, 명상 …).
- Relationships: parents, 3 older siblings, friends, coach, partners, children. Each with a relationship bar.
- School system per country (e.g. Korea 초·중·고·수능·대학; Japan 部活 culture; USA high school/college
  scholarships; India board exams; Brazil/Argentina club academies (escolinha/inferiores)).
- Life goals & achievements (e.g. 발롱도르, 월드컵 우승, 국가대표, 노벨상, 대통령, 억만장자, 100세),
  and an end-of-life summary screen with ribbons/titles and a shareable life story text.
- Option to continue as your child after death (generations), keeping inherited money.
- Replayability: seeded RNG; show seed; "same seed replay".

## 3. The Ronaldo family template (real facts → localize per country)

Real background (Cristiano Ronaldo, born 5 Feb 1985, Funchal, Madeira, Portugal):
- Youngest of four children; older siblings Hugo (brother), Elma and Kátia (sisters).
- Father José Dinis Aveiro: municipal gardener and kit man at the local amateur club Andorinha;
  struggled with alcoholism; died in 2005 (hero aged 20). Mother Maria Dolores: cook and cleaner,
  very devoted. The family was poor; crowded small house.
- Started playing at local club Andorinha; then Nacional; at **12 moved alone** to Lisbon for Sporting's
  academy (homesick, teased for his accent). At **15** he had a heart condition (racing heartbeat)
  treated by a procedure and returned to training quickly. Famous for extreme work ethic.

Localize this into all 8 countries with care: a fitting poor-but-loving neighbourhood, the father's
equivalent jobs (e.g. park gardener + kit man of a neighbourhood amateur club), mother's job, local
given names for the 3 siblings, local amateur club → regional club → big academy far from home at 12,
the 15-year-old heart scare event, the father's illness arc (handled seriously and respectfully, not as a
joke; player choices can help the father seek treatment), and local football/food/holiday flavour.
Use fictional/parody club and school names (no real club logos or trademarks). Avoid national or ethnic
stereotypes and demeaning humour; humour should come from situations, not from cultures.

The real-life milestones are the "canon path" but outcomes are NOT fixed: the hero may fail, quit
football, choose another life, or exceed the real story.

## 4. Visual & audio direction

- Pixel art (도트). All art generated in code or drawn as pixel data in the repo by you (no copied
  sprites). Low-res canvas scaled with `image-rendering: pixelated`. A small consistent palette.
- Hero portrait: pixel face that changes with age, hairstyle choices, outfit by career. Background
  scenes per country/location (home, school, pitch, stadium, hospital, office).
- Use a free OFL Korean pixel font only if you include its licence file (e.g. Galmuri, OFL-1.1);
  otherwise a clean system font.
- Avoid beige/orange "default AI" palettes; prefer dark navy/black UI with vivid pitch-green and gold accents.
- Optional short chiptune SFX via WebAudio (generated, no external files), with a mute toggle.
- Make it feel alive: small animations (age-up transition, stat bar tweens, celebratory goal/trophy
  animation), not static slides.

## 5. Technical constraints (important)

- Plain HTML/CSS/JavaScript, **no build step and no runtime dependencies**. The game must run by
  **double-clicking `index.html`** from a local folder (`file://`). That means: no ES module imports
  across files and no `fetch()` of local JSON. Load data and code with classic `<script>` tags
  (data files can be `data/*.js` assigning to a global namespace).
- Desktop and mobile layout (portrait phone ≥ 360px wide).
- Save/load in `localStorage` with a `saveVersion` field and a migration function; autosave each year;
  multiple save slots are a plus. Old saves must still load after schema changes.
- Seeded, reproducible RNG for all outcome-affecting randomness.
- Keep the engine (pure logic) separate from rendering so it can be tested in Node.
- Tests: `node --test` (Node's built-in runner, no npm dependencies) covering: event condition matching,
  age-up effects, career requirements/promotion, country family generation for all 8 countries,
  save → load → migrate round trip, deterministic seeded replay, and a **simulation test** that plays
  ≥ 500 random full lives per country without throwing and reports distribution stats (age at death,
  career spread, % football pros) to catch balance bugs. Add a `package.json` with a `test` script only.
- Content volume target for v1: ≥ 300 storylet events total (shared + country-specific + career-specific),
  ≥ 120 careers, all 8 countries fully localized. Quality over raw count: events must react to state.

## 6. Done when

1. `index.html` opens directly (file://) and a full life can be played from country select → age 1 →
   death → life summary → (optional) continue as child, with no console errors.
2. All tests pass with `node --test`; the simulation test output is pasted in `docs/DESIGN.md`.
3. You have checked the game visually in a headless browser at desktop (1280×800) and phone (390×844)
   sizes, fixed visible layout problems, and saved a few screenshots to `docs/screenshots/`.
4. `README.md` (Korean) explains in plain words for a non-developer: what the game is, how to play
   (download ZIP → unzip → double-click `index.html`), and a disclaimer: unofficial fan parody, not
   affiliated with Cristiano Ronaldo or any club.
5. `docs/DESIGN.md` records research findings, design decisions, data schemas, and how to add new
   events/careers/countries.
6. Commit in logical steps and push your branch. Open a pull request to `main` titled
   `호날두의 모험 v1` with a short Korean summary of what was built and what is not done yet.
