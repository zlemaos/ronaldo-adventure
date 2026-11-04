/* Run against an extracted git archive of 1dacf6e, never against current code. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = process.argv[2], output = process.argv[3];
const { load } = require(path.join(root, 'tools/sim-helpers.js'));
const RA = load(), E = RA.Engine;
const fixtures = {};
for (const [id, country, age] of [['portugal', 'pt', 10], ['korea', 'kr', 8], ['footballer', 'pt', 25]]) {
  const s = E.newGame({country, seed: 'v7-original-' + id});
  while (s.queue.length) E.choose(s, 0);
  s.age = age; s.year = s.birthYear + age;
  E.updateEducation(s, true);
  if (id === 'footballer') E.FX.turnPro(s);
  if (s.saveVersion !== 7) throw new Error('fixture source is not v7');
  fixtures[id] = s;
}
fs.mkdirSync(path.dirname(output), {recursive:true});
fs.writeFileSync(output, JSON.stringify(fixtures), 'utf8');
console.log('Generated genuine v7 states:', Object.keys(fixtures).join(', '));
