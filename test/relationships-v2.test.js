'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const RA=require('../tools/sim-helpers').load(),E=RA.Engine,F=RA.Family;
test('relationship contact, remembered trust and distance affect the same persistent person',()=>{
  const s=E.newGame(Object.assign({seed:'relationship-v1',country:'pt'},F.preset('canon')));
  const p=E.person(s,'father');
  E.applyEffects(s,{relationship:{id:p.id,closeness:-5,trust:-10,conflict:8,romance:'none',contact:true,place:'kr',memory:{tag:'call',text:'목소리를 기억했다.'}}});
  assert.equal(p.lastContact,s.age);assert.equal(p.conflict,8);
  assert.ok(E.condMatches(s,{relationship:{id:p.id,memories:['call'],conflict:[8,8],alive:true}}));
  const close=p.closeness;s.age+=2;F.relationshipYear(s);
  assert.equal(p.closeness,close-3);
  E.applyEffects(s,{relationship:{id:p.id,contact:true,trust:1000}});
  assert.equal(p.trust,100);const now=p.closeness;F.relationshipYear(s);assert.equal(p.closeness,now);
});
