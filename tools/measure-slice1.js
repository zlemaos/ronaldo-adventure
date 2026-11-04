'use strict';
/* Reuses the shipped model bot; observation never consumes simulation randomness. */
const {load,autoplay}=require('./sim-helpers');
const RA=load(),E=RA.Engine,F=RA.Family;
const observations=new WeakMap(),counts=new Map(),flagged=new Map();
const sexual=/성관계|섹스|콘돔|성매매|매춘|몸을\s*팔|옷을\s*벗|입맞춤|키스|임신|스폰서/;
function scan(s,text,source){
  if(s.age>=19||!text)return;
  const hit=String(text).match(sexual);
  if(hit){const key=source+'|'+hit[0];if(!flagged.has(key))flagged.set(key,{source,term:hit[0],age:s.age,text:String(text)});}
}
const current=E.currentEvent,choose=E.choose,ageUp=E.ageUp;
E.currentEvent=function(s){const ev=current(s);if(ev){scan(s,ev.text,ev.id);ev.choices.forEach(c=>scan(s,c.text,ev.id));}return ev;};
E.choose=function(s,i){const id=s.queue[0],res=choose(s,i);if(res){scan(s,res.log,id);(res.changes||[]).forEach(c=>scan(s,c.t,id));}(s.cards||[]).forEach(c=>scan(s,c.text,c.id));return res;};
E.ageUp=function(s){
  const result=ageUp(s),o=observations.get(s);
  if(o){
    if(s.age===12)o.friendAt12=!!s.people.find(p=>p.id===o.firstFriend&&p.alive&&p.role==='friend'&&!p.estrangedAt);
    if(s.age===18)o.route18=s.route.id;
    if(s.age===25)o.route25=s.route.id;
    if(s.age===3)o.firstFriend=(E.person(s,'friend')||{}).id;
    if(s.age<19)s.people.filter(p=>p.role==='partner').forEach(p=>{
      if(p.age<14||Math.abs(p.age-s.age)>3)flagged.set('partner|'+s.seed,{source:'generated partner age',seed:s.seed,heroAge:s.age,partnerAge:p.age});
    });
  }return result;
};
for(let i=0;i<2000;i++){
  const seed='v2-path-'+i,s=E.newGame({...F.randomParents(seed),seed});
  const o={friendAt12:'not_reached',route18:'not_reached',route25:'not_reached'};
  observations.set(s,o);autoplay(RA,{state:s,seed,bot:'model'});
  const stories=[...new Set(s.log.filter(e=>e.age<=25&&/^fam_/.test(e.ev||'')).map(e=>e.ev.replace(/_(?:light|start|support|stable|relapse|protected|\d+)$/,'')))].sort();
  const outcome=s.flags.boots_success?'success':s.flags.boots_partial?'partial':s.flags.boots_failed?'fail':'not_reached';
  const signature={stories,chain:outcome,friendAt12:o.friendAt12,route18:o.route18,route25:o.route25,moments:s.moments.filter(m=>m.age<=25).map(m=>m.kind)};
  const key=JSON.stringify(signature);counts.set(key,(counts.get(key)||0)+1);
}
const index=E.eventIndex(),reachable=new Set(E.allEvents().filter(ev=>(ev.age||[0,120])[0]<19).map(ev=>ev.id)),todo=[...reachable];
while(todo.length){
  const ev=index[todo.pop()];if(!ev)continue;
  for(const c of ev.choices||[])for(const branch of [c,c.success,c.partial,c.fail]){
    const id=branch&&branch.schedule&&branch.schedule.id;
    if(id&&!reachable.has(id)){reachable.add(id);todo.push(id);}
  }
}
for(const id of reachable){
  const ev=index[id];if(!ev)continue;
  const texts=[ev.text,ev.log,...ev.textVariants||[],...ev.logVariants||[]];
  for(const c of ev.choices||[])for(const b of [c,c.success,c.partial,c.fail])if(b)texts.push(b.text,b.log,...b.logVariants||[]);
  for(const text of texts){
    const hit=String(text||'').match(sexual);
    if(hit)flagged.set('static|'+id+'|'+hit[0],{source:id,term:hit[0],ageWindow:ev.age,text,review:'conservative closure: scheduled follow-ups ignore authored age windows'});
  }
}
const exclusions=[];
for(const group of ['bright','dark'])for(const trait of RA.data.parents[group]){
  const candidates=RA.data.events.filter(ev=>ev.own==='family:'+trait.id&&ev.cond&&ev.cond.parent&&ev.cond.parent[group]&&ev.cond.parent[group][trait.id]&&ev.cond.parent[group][trait.id][0]>=2&&!ev.cond.memory?.length);
  let eligible=0;
  for(const ev of candidates){
    const spec=F.preset('canon');spec.parents.forEach(p=>p[group][trait.id]=1);
    const s=E.newGame({...spec,preset:'custom',seed:'level1-'+trait.id});s.age=ev.age[0];s.year=s.birthYear+s.age;s.queue=[];E.updateEducation(s,true);E.Routes.sync(s,true);
    if(E.eventMatches(s,ev))eligible++;
  }
  exclusions.push({trait:trait.id,openings:candidates.length,eligibleAtOne:eligible});
}
console.log(JSON.stringify({lives:2000,distinct:counts.size,topTen:[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,10).map(([key,count])=>({count,share:count/2000,signature:JSON.parse(key)})),levelOneExclusions:exclusions,under19ConservativeEvents:reachable.size,flags:[...flagged.values()]},null,2));
