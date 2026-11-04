'use strict';
const RA=require('./sim-helpers').load(),E=RA.Engine,F=RA.Family,R=RA.RNG;
const before={stat:'football',diff:35,partial:0.25},after=E.eventIndex().boots_tryout.choices[0].check;
const summary={};
for(const type of ['canon','random']){
  const counts={before:{success:0,partial:0,fail:0},after:{success:0,partial:0,fail:0}},rates={before:0,after:0};
  for(let i=0;i<1000;i++){
    const seed='boots-calibration-'+type+'-'+i,s=E.newGame({...F[type==='canon'?'preset':'randomParents'](type==='canon'?'canon':seed),seed});
    while(s.age<5&&s.alive){
      for(let q=0;s.queue.length&&q<80;q++){const ev=E.currentEvent(s);if(!ev)break;E.choose(s,ev.choices.find(c=>c.enabled).i);}
      E.ageUp(s);
    }
    if(!s.alive || s.age!==5)continue;
    // Explicit ordinary age-five invitation fixture: no boosted stats or practice.
    const roll=R.next(R.create(seed+'|tryout'));
    for(const [name,check]of [['before',before],['after',after]]){
      const p=E.checkChance(s,check),partial=Math.min(check.partial,1-p);
      counts[name][roll<p?'success':roll<p+partial?'partial':'fail']++;rates[name]+=p;
    }
  }
  const lives=Object.values(counts.before).reduce((a,b)=>a+b,0);
  summary[type]={seeds:1000,lives,counts,meanSuccess:{before:rates.before/lives,after:rates.after/lives}};
}
console.log(JSON.stringify({method:'Standard infancy to age five, first enabled choices, no activities; same independent invitation roll for before/after; 1000 seeds per preset.',before,after,summary},null,2));
