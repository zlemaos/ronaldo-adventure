'use strict';
const {test}=require('node:test'),a=require('node:assert/strict');
const {load}=require('../tools/sim-helpers');
// Replay the public result list onto an independent copy: omitted or spurious changes
// must prevent reconstruction of the real final state, regardless of the producer's diff logic.
function verifyChanges(before,after,changes){
 const normalize=s=>{
  const x=JSON.parse(JSON.stringify(s));
  for(const k of ['people','moments','chronicle'])if(Array.isArray(x[k]))x[k]=Object.fromEntries(x[k].map(p=>[String(p.id),p]));
  return x;
 };
 const start=normalize(before),end=normalize(after),replayed=normalize(before);
 const at=(x,parts)=>parts.reduce((v,k)=>v==null?undefined:v[k],x);
 for(const change of changes){
  const parts=change.path.split('.'),last=parts.pop(),old=at(start,parts.concat(last)),value=at(end,parts.concat(last));
  a.deepEqual(change.before,old==null?null:old,'reported before '+change.path);
  a.deepEqual(change.after,value==null?null:value,'reported after '+change.path);
  let node=replayed;
  for(const part of parts){if(node[part]==null)node[part]={};node=node[part];}
  if(value===undefined)delete node[last];else node[last]=JSON.parse(JSON.stringify(change.after));
 }
 a.deepEqual(replayed,end,'result changes must reconstruct the actual final state');
}
test('household ledger posts sources and academy net pay without double tax',()=>{
 const RA=load(),E=RA.Engine,F=RA.Family,s=E.newGame(Object.assign({seed:'ledger'},F.preset('canon')));
 F.ledger(s);const opening=s.household.cash;
 E.applyEffects(s,{household:{cash:-40,category:'club'}});
 a.equal(s.household.cash,opening-40);a.ok(F.checkLedger(s));
 F.academy(s,{action:'contract',duration:2,netMonthly:1200});const before=s.money;
 F.payHero(s,14400,true);a.equal(s.money,before+14400);a.ok(F.checkLedger(s));
 F.academy(s,{action:'warning'});a.equal(s.fb.academy.status,'warning');
 F.academy(s,{action:'release'});a.equal(s.flags.acad_active,undefined);a.equal(s.fb.stage,'regional');
 const loaded=RA.Save.deserialize(RA.Save.serialize(s));a.ok(F.checkLedger(loaded));
 delete loaded.household.ledger;delete loaded.household.cash;
 F.post(loaded,'income','other',1,'old save missing cash');a.equal(loaded.household.cash,1);a.ok(F.checkLedger(loaded));
});
test('resolved seeded choices expose exactly the snapshot delta',()=>{
 const RA=load(),E=RA.Engine,F=RA.Family;
 const covered=new Set();
 for(let seed=0;seed<40;seed++){
  const s=E.newGame(Object.assign({seed:'s2-diff-'+seed},F.preset('canon')));
  while(s.alive && s.age<=25){
   let guard=0;
   while(s.queue.length&&guard++<80){
    const ev=E.currentEvent(s);if(!ev)break;const c=ev.choices.find(c=>c.enabled);if(!c)break;
    const before=E.changeSnapshot(s),r=E.choose(s,c.i);
    verifyChanges(before,E.changeSnapshot(s),r.appliedChanges);
    if(/^(acad_|friends_|fam_|boots_)/.test(ev.id))covered.add(ev.id.split('_')[0]);
   }
   if(s.queue.length)throw new Error('unresolved seeded queue');
   if(!s.alive)break;
   const before=E.changeSnapshot(s),r=E.ageUp(s);
   verifyChanges(before,E.changeSnapshot(s),r.appliedChanges);
   if(s.household.ledger)a.ok(F.checkLedger(s));
  }
 }
 a.deepEqual([...covered].sort(),['acad','boots','fam','friends']);
});
test('v2 inheritance settles actual parent assets minus debt once, including while a minor',()=>{
 const RA=load(),E=RA.Engine,F=RA.Family,s=E.newGame(Object.assign({seed:'estate'},F.preset('canon')));
 const p=E.person(s,'father');p.assets=900;p.debts=250;
 const cash=s.household.cash;E.personDies(s,p,'병');
 a.equal(s.household.cash,cash+650);a.equal(p.assets,0);a.ok(F.checkLedger(s));
 F.inherit(s,p);a.equal(s.household.cash,cash+650);
 const m=E.person(s,'mother');m.assets=20;m.debts=30;
 E.personDies(s,m,'병');a.equal(s.household.cash,cash+650);
});
