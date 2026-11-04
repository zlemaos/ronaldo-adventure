'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('../tools/sim-helpers.js');

test('a named life can be renamed, saved and continued with grammatical story text', () => {
  const RA = load(), E = RA.Engine, S = RA.Save, store = S.memStorage();
  const s = E.newGame({ seed: 'character-name', given: '  민준  ' });
  assert.equal(E.heroName(s), '민준');
  assert.equal(s.hero.nick, '민준');
  const template = '{name}[이/가] {nick}[은/는] {name}[을/를] {name}[과/와] {name}[으로/로] {name}[아/야]';
  assert.equal(E.render(s, template), '민준이 민준은 민준을 민준과 민준으로 민준아');
  const prenatal = E.currentEvent(s);
  assert.match(prenatal.text, /민준을 품은/);
  const born = E.choose(s, prenatal.choices.find(c => c.enabled).i);
  assert.match(born.log, /민준이 태어났다/);
  E.addCard(s, { id: 'name-card', text: E.narrative(s, template) });
  const rng = JSON.stringify(s.rng), stats = JSON.stringify(s.stats);
  E.renameHero(s, '  하늘  ');
  assert.equal(E.render(s, template), '하늘이 하늘은 하늘을 하늘과 하늘로 하늘아');
  assert.equal(s.cards.at(-1).text, '하늘이 하늘은 하늘을 하늘과 하늘로 하늘아');
  assert.ok(s.log.some(e => /하늘이 태어났다/.test(e.t)));
  E.renameHero(s, '수아');
  assert.equal(s.cards.at(-1).text, '수아가 수아는 수아를 수아와 수아로 수아야');
  assert.equal(JSON.stringify(s.rng), rng);
  assert.equal(JSON.stringify(s.stats), stats);
  assert.equal(S.save(1, s, store), true);
  const loaded = S.load(1, store);
  assert.equal(E.heroName(loaded), '수아');
  assert.equal(loaded.hero.nick, '수아');
  assert.equal(S.list(store).slots[0].meta.name, '수아');
  loaded.alive = false; loaded.cause = '노환';
  const summary = E.summary(loaded);
  assert.equal(summary.name, '수아');
  assert.match(summary.story, /【수아 /);
  const kid = E.addPerson(loaded, { role: 'child', name: '아이 프레이타스', gender: 'f', age: 12, bornAt: 20 });
  const next = E.continueAsChild(loaded, kid.id);
  assert.equal(E.summary(next).name, '2대 호날두');
  assert.equal(next.legacy.parentName, '수아');
  const collision = E.newGame({ given: '나' });
  E.addLog(collision, '나는 나무를 봤다.', 'info');
  E.addLog(collision, E.narrative(collision, '{name}[은/는] 나무를 봤다.'), 'info');
  E.renameHero(collision, '민준');
  assert.equal(collision.log.at(-2).t, '나는 나무를 봤다.');
  assert.equal(collision.log.at(-1).t, '민준은 나무를 봤다.');
  assert.equal(E.person(next, 'father').name, '수아');
  E.renameHero(next, '보람');
  assert.equal(E.summary(next).name, '2대 보람');
  assert.ok(next.log.some(e => /2대 보람으로 삶을/.test(e.t)));
  assert.equal(next.legacy.parentName, '수아');
});

test('ordinary prose stays literal after an identical named passage was rendered', () => {
  const { Engine: E } = load(), s = E.newGame({ given: '나' });
  E.render(s, '{name}[은/는] 나무를 봤다.');
  E.addLog(s, '나는 나무를 봤다.');
  E.addCard(s, { id: 'literal', text: '나는 나무를 봤다.' });
  E.addLog(s, E.narrative(s, '{name}[은/는] 나무를 봤다.'));
  E.renameHero(s, '민준');
  assert.equal(s.log.at(-3).t, '나는 나무를 봤다.');
  assert.equal(s.cards.at(-1).text, '나는 나무를 봤다.');
  assert.equal(s.log.at(-1).t, '민준은 나무를 봤다.');
});

test('pronunciation choice persists and rerenders all particles in history', () => {
  const { Engine: E, Save: S } = load(), store = S.memStorage();
  let s = E.newGame({ given: 'Jane', nameBatchim: true });
  const t = '{name}[이/가] {name}[은/는] {name}[을/를] {name}[과/와] {name}[으로/로] {name}[아/야]';
  E.addLog(s, E.narrative(s, t));
  assert.equal(s.log.at(-1).t, 'Jane이 Jane은 Jane을 Jane과 Jane으로 Jane아');
  S.save(1, s, store); s = S.load(1, store);
  E.renameHero(s, 'Jane', false);
  assert.equal(s.log.at(-1).t, 'Jane가 Jane는 Jane를 Jane와 Jane로 Jane야');
  E.renameHero(s, '하늘', true);
  assert.equal(E.render(s, '{name}[으로/로]'), '하늘로');
  E.renameHero(s, '7', false);
  assert.equal(E.render(s, '{name}[은/는] {name}[으로/로]'), '7은 7로');
});

test('character names trim, limit to 20 characters, and default when blank', () => {
  const E = load().Engine;
  assert.equal(E.heroName(E.newGame({ given: '   ' })), '호날두');
  assert.equal(E.heroName(E.newGame({ given: '가'.repeat(30) })), '가'.repeat(20));
  const s = E.newGame({ given: '수아' });
  E.renameHero(s, '   ');
  assert.equal(E.heroName(s), '호날두');
  assert.equal(s.hero.nick, '호날두');
});

test('v7 saves and their slot labels default to 호날두 and keep working after renaming', () => {
  const RA = load(), E = RA.Engine, S = RA.Save, store = S.memStorage();
  const legacy = E.newGame({ seed: 'legacy-character' });
  legacy.saveVersion = 7;
  delete legacy.hero.given; delete legacy.hero.nick;
  legacy.log.push({ age: 0, t: '호날두가 호날두의 사진을 봤다. "호날두"와 만났다.', k: 'info' });
  store.setItem(S.KEY, JSON.stringify({ slots: { 1: {
    data: JSON.stringify(legacy), meta: { age: 0, country: 'pt', alive: true, gen: 1 }
  } } }));
  assert.equal(S.list(store).slots[0].meta.name, '호날두');
  const s = S.load(1, store);
  assert.equal(E.heroName(s), '호날두');
  assert.equal(s.hero.nick, '호날두');
  E.renameHero(s, '지민');
  S.save(1, s, store);
  assert.equal(E.heroName(S.load(1, store)), '지민');
  assert.equal(S.list(store).slots[0].meta.name, '지민');
  assert.equal(s.log.at(-1).t, '지민이 지민의 사진을 봤다. "지민"과 만났다.');
});
