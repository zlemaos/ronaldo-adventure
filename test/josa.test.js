'use strict';
/* Every template is rendered with every country's values. Wherever an inserted value is directly
 * followed by a Korean particle, the particle must match the value's final consonant. Hard-coded
 * particles after a placeholder (e.g. "{hometown}을") are therefore caught for at least one country. */
const test = require('node:test');
const assert = require('node:assert');
const { load } = require('../tools/sim-helpers.js');
const RA = load();
const E = RA.Engine, T = RA.Text;
const COUNTRIES = ['pt', 'kr', 'jp', 'cn', 'us', 'br', 'ar', 'za', 'in'];

function templates() {
  const out = [];
  const add = (where, t) => { if (typeof t === 'string' && t.includes('{')) out.push({ where, t }); };
  for (const ev of E.allEvents()) {
    add(ev.id, ev.text); add(ev.id, ev.log);
    (ev.textVariants || []).forEach(t => add(ev.id + ' variant', t)); (ev.logVariants || []).forEach(t => add(ev.id + ' variant', t));
    (ev.choices || []).forEach((ch, i) => { add(ev.id + '#' + i, ch.text); add(ev.id + '#' + i, ch.log); (ch.logVariants || []).forEach(t => add(ev.id + '#' + i + 'v', t)); if (ch.success) add(ev.id + '#' + i + 's', ch.success.log); if (ch.fail) add(ev.id + '#' + i + 'f', ch.fail.log); });
  }
  for (const k of RA.data.careers) { add('career ' + k.id, k.desc); k.ladder.forEach(l => add('career ' + k.id, l)); }
  for (const m of RA.data.milestones) add('milestone ' + m.id, m.text);
  for (const [key, list] of Object.entries(E.ACTIVITY_LINES)) list.forEach(t => add('line ' + key, t));
  return out;
}

// particle immediately after an inserted value → which pair it belongs to
function particleAfter(rest) {
  const m = rest.match(/^(을|를|은|는|이|가|와|과|으로|로|아|야|이라|라)(?=$|[^가-힣]|서|부터|의|도|만|는|써|고|며)/);
  if (!m) return null;
  const p = m[1];
  const pair = { 을: '을/를', 를: '을/를', 은: '은/는', 는: '은/는', 이: '이/가', 가: '이/가', 와: '과/와', 과: '과/와', 으로: '으로/로', 로: '으로/로', 아: '아/야', 야: '아/야', 이라: '이/', 라: '이/' }[p];
  return { p, pair };
}

test('no hard-coded particle directly after a placeholder in any template', () => {
  const bad = templates().filter(x => /\{[a-zA-Z0-9]+\}(을|를|은|는|이|가|와|과|으로|로|아|야)(?![가-힣])/.test(x.t));
  assert.deepStrictEqual(bad.map(b => b.where + ': ' + b.t), []);
});

test('particles after inserted values match the final consonant for every country', () => {
  const problems = [];
  for (const c of COUNTRIES) {
    const s = E.newGame({ country: c, seed: 'josa' });
    s.age = 30;
    const vars = E.vars(s);
    for (const { where, t } of templates()) {
      const re = /\{([a-zA-Z0-9]+)\}(\[[^\]]*\])?/g; let m;
      while ((m = re.exec(t))) {
        const v = vars[m[1]];
        if (v == null) { problems.push(c + ' ' + where + ': unknown token ' + m[1]); continue; }
        if (m[2]) {
          // marker form: the rendered particle must be the one particle() chooses
          const out = T.render(m[0], vars);
          const pair = m[2].slice(1, -1);
          if (out !== String(v) + T.particle(String(v), pair)) problems.push(c + ' ' + where + ': ' + out);
          continue;
        }
        const pa = particleAfter(t.slice(m.index + m[0].length));
        if (!pa) continue;
        let want = T.particle(String(v), pa.pair);
        if (pa.pair === '이/') { if (pa.p === '라' && want === '이') problems.push(c + ' ' + where + ': "' + v + pa.p + '"'); continue; }
        if (want !== pa.p) problems.push(c + ' ' + where + ': "' + v + pa.p + '" should be "' + v + want + '"');
      }
    }
  }
  assert.deepStrictEqual(problems.slice(0, 20), [], problems.length + ' mismatch(es)');
});

test('the academy farewell line reads correctly in every country', () => {
  for (const c of COUNTRIES) {
    const s = E.newGame({ country: c, seed: 'farewell' });
    const ev = E.eventIndex().canon_academy_offer;
    const line = E.render(s, ev.choices[0].log);
    const home = RA.data.countries[c].places.hometown;
    assert.ok(line.includes(home + T.particle(home, '을/를') + ' 떠나는 날'), line);
  }
});
