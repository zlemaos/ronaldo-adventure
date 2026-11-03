'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('../tools/sim-helpers.js');

test('game title defaults, persists trimmed custom text, and resets when empty', () => {
  const S = load().Save, store = S.memStorage();
  assert.equal(S.gameName(store), '인생게임');
  assert.equal(S.setGameName('  나의 인생  ', store), true);
  assert.equal(load().Save.gameName(store), '나의 인생');
  assert.equal(S.setGameName('   ', store), true);
  assert.equal(S.gameName(store), '인생게임');
  S.setGameName('가'.repeat(40), store);
  assert.equal(S.gameName(store), '가'.repeat(20));
});
