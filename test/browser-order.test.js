'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { scriptOrder } = require('../tools/sim-helpers');
const root = path.join(__dirname, '..');

test('every page script initializes in HTML order before DOM readiness', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const scripts = Array.from(html.matchAll(/<script\s+src="([^"]+)"/g), m => m[1]);
  const context = vm.createContext({
    console,
    document: { readyState: 'loading', addEventListener() {} }
  });
  for (const script of scripts) {
    assert.doesNotThrow(() => vm.runInContext(fs.readFileSync(path.join(root, script), 'utf8'), context, { filename: script }), script);
  }
  assert.equal(typeof context.RA.Family.preset, 'function');
  assert.equal(typeof context.RA.Engine.newGame, 'function');
  const s = context.RA.Engine.newGame({ ...context.RA.Family.preset('canon'), seed: 'browser-order' });
  assert.ok(s.household);
  context.RA.Engine.FX.turnPro(s);
  assert.equal(s.fb.contract.duration, 2);
  assert.ok(context.RA.Family.economy(s).wage);
  assert.deepEqual(scriptOrder(), scripts.filter(p => !/^js\/(ui|pixel|audio|fx|opening|parents_ui|moments_ui)\.js$/.test(p)));
});
