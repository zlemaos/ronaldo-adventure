'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {load}=require('../tools/sim-helpers');
test('seeded academy trials lead through annual reviews to release or paid first contract',()=>{
 const RA=load(),E=RA.Engine,F=RA.Family,endings=new Map();
 for(const seed of [0,2]){
  const s=E.newGame({...F.preset('canon'),seed:'academy-e2e-'+seed});
  // Eligible school-team applicant fixture; subsequent years, eligibility and rolls are real.
  s.age=12;s.born=true;s.queue=[];s.cards=[];
  s.route={id:'football',st:0,at:0,sk:70,since:12,branch:null};
  E.FX.joinLocalClub(s);s.flags.acad_invited=12;
  s.stats.football=85;s.talent.sport=85;s.stats.health=95;
  s.queue=['acad_trial'];
  const trace=[],reviews=[];
  while(s.alive&&s.age<=19){
   let guard=0;
   while(s.queue.length&&guard++<100){
    const ev=E.currentEvent(s);if(!ev)continue;
    const c=ev.choices.find(c=>c.enabled);assert.ok(c,ev.id);
    const r=E.choose(s,c.i);assert.ok(r,ev.id);
    trace.push(ev.id);
    if(ev.id==='acad_review')reviews.push({age:s.age,outcome:r.outcome});
   }
   assert.equal(s.queue.length,0);
   if(reviews.length&&s.fb.academy&&s.fb.academy.status==='released'){
    assert.ok(trace.includes('acad_alternatives'));
    assert.deepEqual(s.fb.academy.alternatives,['trial','school','amateur']);
    endings.set('release',{seed,trace,reviews});break;
   }
   if(s.fb.contract&&trace.includes('acad_contract_day')&&reviews.length){
    assert.ok(trace.indexOf('acad_trial')<trace.indexOf('acad_review'));
    assert.ok(trace.indexOf('acad_review')<trace.indexOf('acad_contract'));
    assert.equal(s.fb.contract.duration,2);
    assert.equal(s.fb.contract.end-s.fb.contract.start,2);
    assert.ok(s.fb.contract.netMonthly>0);
    E.ageUp(s);
    const pay=s.household.ledger.entries.find(e=>e.kind==='income'&&e.source==='hero'&&e.note==='net contract pay');
    assert.ok(pay,'annual professional pay reaches household ledger');
    assert.equal(pay.amount,Math.round(s.fb.contract.netMonthly*12/E.country(s).wage));
    assert.ok(F.checkLedger(s));
    endings.set('contract',{seed,trace,reviews});break;
   }
   E.ageUp(s);
  }
 }
 for(const [ending,run] of endings){
  assert.deepEqual(run.reviews.map(r=>r.age),[13,14,15,16]);
  assert.ok(run.trace.indexOf('acad_trial')<run.trace.indexOf('acad_review'));
  console.log(JSON.stringify({ending,seed:'academy-e2e-'+run.seed,reviews:run.reviews,sequence:run.trace.filter(id=>/^acad_/.test(id))}));
 }
 assert.deepEqual([...endings.keys()].sort(),['contract','release']);
});
