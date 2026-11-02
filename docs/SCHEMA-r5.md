# Round 5 schema additions (choices, mischief, gambling, careers, endings)

Read docs/DESIGN.md section 4 ("Data schemas") first; everything there still applies. This file lists only the additions.
Validate with `node tools/validate-data.js` and `node --test test/josa.test.js test/data.test.js`.

## Traits (`RA.C.TRAITS`)
Tendencies that build up from choices. Use them in `effects` and in `cond.traits` like stats.

| key | label | range / meaning |
|---|---|---|
| `mischief` | 😈 악동 기질 | 0-100, grows with pranks, lies, fights, theft |
| `rep` | 🗣️ 평판 | 0-100, starts at 50; bad public behaviour lowers it, good deeds raise it |
| `gamble` | 🎲 도박 중독 | 0-100. Stages: 1+ 재미 삼아, 20+ 1단계 습관, 45+ 2단계 중독 (unlocks the 겜블러 career), 75+ 3단계 심각 |
| `alcohol` | 🍺 음주 | 0-100. 50+ drains health every year |
| `record` | ⛓️ 전과 | count of convictions (jail adds 1 automatically). Use +1 for a caught crime that does not jail |

Example: `effects: { mischief: 4, rep: -3, money: 50 }`, `cond: { traits: { gamble: [45, 100] } }`.

## New choice fields
- `risky: true` marks the bad-boy / risky option of a decision. The "악동 봇" in tests always takes it, so give
  most decisions one risky option and one safe option. Risky options should sometimes pay off (money, fame, fun).
- `check: { odds: 0.35 }` is a fixed success chance (not stat based), shown to the player as "성공 35%".
  `check: { stat, diff }` still works.
- `bet: { odds: 0.35, mult: 2, stake: 'small', addict: 3 }` is a gamble decided by fixed odds. Needs `success` and
  `fail` like a check (their `effects` may be empty `{}`, and the logs describe the result; the engine appends the
  money amount). On a win the engine pays `stake × (mult − 1)`; on a loss the stake is lost (money may go negative =
  debt). Stake sizes: `tiny` (child pocket money, no real money moved; win gives a little), `small` (~2% of savings,
  min 20), `medium` (~10%, min 200), `big` (~30%, min 1000), `all` (everything you have, min 2000). Each play raises
  `gamble` by `addict` (default 3); a win at `mult >= 3` raises it by 5 more.
- `career: 'id'` starts that career right after the choice (only the age window is checked). Use it for 진로 결정,
  part-time job offers, 창업, 가업, 은퇴 후 2막. The id must exist.

## New event fields
- `decision: true` puts the event in the "올해의 결정" pool: when a year has fewer decisions than the target
  (ages 5-12: 1, 13-19: 2-3, 20+: 1-2), the engine adds decision events. Decision events must have 2-4 choices.
- `cond.jailed: true` marks prison-only events (shown while in prison).

## New FX
| fx | meaning |
|---|---|
| `suspend` | 정학: grades and happiness drop; a second suspension can lead to expulsion |
| `expel` | 퇴학: leaves school without a diploma (flag `expelled`) |
| `holdBack` | 유급: grades reset, smarts −, flag `held_back` |
| `dropOut` | 자퇴 by choice (flag `dropout`) |
| `careerEndingInjury` | ends a football/sport career for good (flag `career_injury`) |
| `deport` | 추방 when living abroad: loses the job, returns home (flag `deported`) |
| `bankrupt` | 파산: money set to 0, flag `bankrupt` |
| `rehab` | treatment for addiction: gamble −30, alcohol −30 |
| `fbBan` | 출전 정지 / suspension in football (misses part of a season) |
| `quickJob` | gets a random job the hero qualifies for |
| `enlist` | joins the army (flag `mil_done`, grit +) |

## Careers
Career rows may use `req.traits: { gamble: 45 }` together with `req.unlockHint: '도박 중독 2단계 이상'` (the hint is shown
in the 진로 panel for locked paths), and `special: 'gamble'` (income swings wildly each year, keeps raising `gamble`).
