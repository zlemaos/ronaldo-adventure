'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const RA=require('../tools/sim-helpers').load(),E=RA.Engine,F=RA.Family;
test('living combo parent owns memories and follow-ups never silently switch parent',()=>{
  const spec=F.preset('canon');
  spec.parents[0].bright.education=0;spec.parents[0].dark.control=0;
  spec.parents[1].bright.education=3;spec.parents[1].dark.control=3;
  const s=E.newGame({...spec,seed:'combo-owner'});
  E.choose(s,0);s.age=6;s.queue=[];
  const first=E.eventIndex().fam_combo_edu_pressure_0,next=E.eventIndex().fam_combo_edu_pressure_1;
  assert.equal(E.vars(s,first).parent,'어머니');
  E.fireEvent(s,first);E.choose(s,0);
  const memory=s.memories.fam_combo_edu_pressure_0,mother=E.person(s,'mother'),father=E.person(s,'father');
  assert.equal(memory.parentId,mother.id);assert.equal(memory.personId,mother.id);
  assert.ok(mother.memories.some(m=>m.tag===memory.tag));
  father.v2.bright.education=3;father.v2.dark.control=3;
  assert.equal(E.vars(s,next).parent,'어머니');
  mother.alive=false;
  assert.equal(E.condMatches(s,next.cond),false);
  father.alive=false;
  assert.equal(F.combos(s).edu_pressure,false);
});
test('any parent binding honours alive and every trait/job field',()=>{
  const spec=F.preset('canon');spec.parents[1].jobId='kitman';spec.parents[1].dark.alcohol=2;
  const s=E.newGame({...spec,seed:'any-parent'});
  E.person(s,'father').alive=false;
  const ev={cond:{parent:{role:'any',alive:true,job:['kitman'],dark:{alcohol:[2,3]}}}};
  assert.equal(E.vars(s,ev).parent,'어머니');
});
test('consequence entries identify the person, memory, chronicle title and Korean stat label',()=>{
  const s=E.newGame({...F.preset('canon'),seed:'details'}),before=E.changeSnapshot(s),father=E.person(s,'father');
  E.applyEffects(s,{happy:-5,rel:{father:3},memory:{tag:'detail',who:'father',text:'함께 기억한 오후'}},[]);
  const changes=E.diffChanges(before,E.changeSnapshot(s));
  const rel=changes.find(c=>c.kind==='relationship');
  assert.equal(rel.person.id,father.id);assert.equal(rel.person.name,father.name);assert.equal(rel.d,3);
  assert.equal(changes.find(c=>c.kind==='memory').text,'함께 기억한 오후');
  assert.equal(changes.find(c=>c.kind==='chronicle').title,'함께 기억한 오후');
  const stat=changes.find(c=>c.kind==='stat');
  assert.equal(stat.stat,'happy');assert.equal(stat.label,'행복');
  assert.ok(changes.every(c=>!/^생활 변화|^사람들 변화/.test(c.t||'')));
});
test('neighbourhood tryout favours reserves for ordinary children and rewards practice and talent',()=>{
  const s=E.newGame({...F.preset('canon'),seed:'ordinary'}),check=E.eventIndex().boots_tryout.choices[0].check;
  s.stats.football=6;s.talent.sport=20;
  const success=E.checkChance(s,check),partial=Math.min(check.partial,1-success),fail=1-success-partial;
  assert.ok(partial>success&&partial>fail&&success>=0.15&&fail<0.3);
  s.stats.football+=10;assert.ok(E.checkChance(s,check)>success);
  s.stats.football=6;s.talent.sport+=20;assert.ok(E.checkChance(s,check)>success);
});
