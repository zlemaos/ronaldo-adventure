'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const RA=require('../tools/sim-helpers').load(),E=RA.Engine,F=RA.Family;
test('same-age peer persists and crush eligibility excludes under-thirteen people',()=>{
 const s=E.newGame(Object.assign({seed:'peer-v1'},F.preset('canon')));
 s.age=12;const p=F.ensurePeer(s);assert.equal(p.age,12);assert.equal(F.ensurePeer(s).id,p.id);
 E.applyEffects(s,{relationship:{id:p.id,romance:'crush'}});
 assert.equal(p.romance,'none');assert.equal(E.condMatches(s,{peer:{romance:'crush'}}),false);
 s.age=13;p.age=13;E.applyEffects(s,{relationship:{id:p.id,romance:'crush'}});
 assert.ok(E.condMatches(s,{peer:{romance:'crush'}}));
 assert.equal(E.render(s,'{peer}'),E.displayName(s,p));
 p.alive=false;assert.equal(E.condMatches(s,{peer:{romance:'crush'}}),false);
 const next=F.ensurePeer(s);assert.notEqual(next.id,p.id);
 assert.equal(E.render(s,'{peer}'),E.displayName(s,next));
});
