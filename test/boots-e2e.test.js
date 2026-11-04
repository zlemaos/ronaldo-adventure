'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load}=require('../tools/sim-helpers');
const RA=load(),E=RA.Engine,F=RA.Family;
function play(spec,seed){
  const s=E.newGame({...spec,seed}),trace=[];
  for(let year=0;year<10&&s.alive;year++){
    for(let guard=0;s.queue.length&&guard<80;guard++){
      const ev=E.currentEvent(s);if(!ev)break;
      const ch=ev.choices.find(c=>c.enabled),result=E.choose(s,ch.i);
      trace.push({age:s.age,id:ev.id,text:ev.text,choice:ch,result});
    }
    for(let ap=0;ap<3&&s.ap>0;ap++){
      const acts=E.activities(s),a=acts.find(a=>a.id==='football'&&a.ok&&!a.ui)||acts.find(a=>a.id==='exercise'&&a.ok&&!a.ui);
      if(!a)break;E.doActivity(s,a.id);
    }
    if(s.queue.length)continue;
    E.ageUp(s);
  }
  return {s,trace,seed};
}
for(const type of ['canon','custom'])test(type+' boots chain carries family opportunity, paid consequences and recalled memory',()=>{
  const spec=F.preset('canon');
  if(type==='custom'){spec.preset='custom';spec.parents[0].jobId='teacher';spec.parents[1].jobId='cook';}
  const played=play(spec,type==='canon'?'boots-e2e-canon-5':'boots-e2e-custom-8');
  assert.ok(played.s.memories?.first_boots&&played.s.memories?.boots_friend_recalled&&played.s.log.some(t=>(t.ev||'').startsWith('boots_parent_')),'seeded family must reach acquisition, parent reaction and recall');
  const {s,trace,seed}=played;
  const opening=trace.find(t=>t.id.startsWith('boots_open_'));
  assert.equal(opening.id,type==='canon'?'boots_open_job':'boots_open_talent');
  const tryout=trace.find(t=>t.id==='boots_tryout');
  assert.equal(tryout.choice.retry,'improve');
  assert.ok(Math.abs(Object.values(tryout.choice.probabilities).reduce((a,b)=>a+b,0)-1)<1e-9);
  const cost=trace.find(t=>t.id==='boots_cost'&&t.result?.appliedChanges.some(c=>c.path==='household.cash'&&c.d<0));
  assert.ok(cost,'purchase must report actual money source');
  const reaction=s.log.find(t=>(t.ev||'').startsWith('boots_parent_'));
  assert.ok(/아버지|어머니/.test(reaction.t),reaction.ev+' must render the matching parent');
  assert.ok(!reaction.t.includes('{parent}'));
  const elapsed=s.memories.boots_friend_recalled.age-s.memories.first_boots.age;
  assert.ok(elapsed>=1&&elapsed<=3);
  console.log(JSON.stringify({preset:type,seed,opening:opening.id,outcome:tryout.result.outcome,paidAt:cost.age,reaction:reaction.ev,recallYears:elapsed}));
});
