'use strict';
const {load}=require('./sim-helpers');
function orderedCheck(a,b){
 if(JSON.stringify(a)===JSON.stringify(b))return {ordered:true,strict:false};
 if(!a||!b)return {ordered:false};
 const shape=q=>Object.fromEntries(Object.entries(q).filter(([k])=>!['odds','min','max'].includes(k)));
 if(JSON.stringify(shape(a))!==JSON.stringify(shape(b)))return {ordered:false};
 if(a.odds!=null||b.odds!=null)return {ordered:a.odds!=null&&b.odds!=null&&b.odds>=a.odds,strict:b.odds>a.odds};
 const lo=q=>q.min==null?.05:q.min,hi=q=>q.max==null?.95:q.max;
 return {ordered:lo(b)>=lo(a)&&hi(b)>=hi(a),strict:lo(b)>lo(a)||hi(b)>hi(a)};
}
function noWorse(x,y){
 for(const k of new Set([...Object.keys(x||{}),...Object.keys(y||{})])){
  const u=(x||{})[k],v=(y||{})[k];
  if(typeof u==='number'||typeof v==='number'){if((u||0)>(v||0))return false;}
  else if(JSON.stringify(u)!==JSON.stringify(v))return false;
 }
 return true;
}
function audit(RA){
 const events=RA.data.events, findings=[];
 const readers=new Set();
 for(const e of events){
  for(const f of (e.cond&&e.cond.flags||[]))readers.add('flag:'+f.replace(/^!/,''));
  for(const m of (e.cond&&e.cond.memory||[]))readers.add('memory:'+m.replace(/^!/,''));
 }
 const fx=b=>b&&b.effects||{};
 const later=b=>b&&(b.schedule||fx(b).memory&&readers.has('memory:'+fx(b).memory.tag)||(fx(b).flags||[]).some(f=>readers.has('flag:'+f)));
 const unique=(b,c)=>b&&(
   b.schedule && ![c.schedule,c.fail&&c.fail.schedule,c.partial&&c.partial.schedule].some(s=>s&&s.id===b.schedule.id) ||
   ['memory','moment','rel','relationship','fx','academy','flags'].some(k=>fx(b)[k] && ![c.effects,fx(c.fail),fx(c.partial)].some(e=>e&&JSON.stringify(e[k])===JSON.stringify(fx(b)[k]))));
 for(const e of events.filter(e=>/^(route:football|shared:|family:|chain:)/.test(e.own||''))){
  const cs=e.choices||[];
  cs.forEach((c,i)=>{
   if(!c.check)return;
   const floor=c.check.odds!=null?c.check.odds:c.check.min==null?.05:c.check.min;
   if(floor<=.3&&!unique(c.success,c))findings.push({id:e.id,choice:i,issue:'low-success lacks distinct upside'});
   if(!later(c.fail))findings.push({id:e.id,choice:i,issue:'failure lacks consumed memory/flag or follow-up'});
  });
  // Ordered odds are comparable only when a probability shift cannot replace a better outcome.
  for(let i=0;i<cs.length;i++)for(let j=0;j<cs.length;j++){
   if(i===j)continue;
   const a=cs[i],b=cs[j];let strict=false,ok=true;
   const probability=orderedCheck(a.check,b.check);
   if(!probability.ordered)continue;
   if(probability.strict){
    const branches=b.partial?['fail','partial','success']:['fail','success'];
    if(branches.some((k,n)=>n&&(!noWorse(fx(b[branches[n-1]]),fx(b[k]))||JSON.stringify(b[branches[n-1]]&&b[branches[n-1]].schedule)!==JSON.stringify(b[k]&&b[k].schedule))))continue;
   }
   const stripped=c=>JSON.stringify({req:c.req,retry:c.retry,schedule:c.schedule,branches:['success','partial','fail'].map(k=>({present:!!c[k],schedule:c[k]&&c[k].schedule}))});
   if(stripped(a)!==stripped(b))continue;
   for(const branch of ['effects','success','partial','fail']){
    const x=branch==='effects'?a.effects:fx(a[branch]),y=branch==='effects'?b.effects:fx(b[branch]);
    for(const k of new Set([...Object.keys(x||{}),...Object.keys(y||{})])){
     const u=(x||{})[k],v=(y||{})[k];
     if(typeof u==='number'||typeof v==='number'){if((u||0)>(v||0))ok=false;if((u||0)<(v||0))strict=true;}
     else if(JSON.stringify(u)!==JSON.stringify(v))ok=false;
    }
   }
   if(ok&&strict)findings.push({id:e.id,choice:i,issue:'dominated by choice '+j});
  }
 }
 return findings;
}
module.exports={audit};
if(require.main===module){const f=audit(load());console.log(JSON.stringify(f,null,2));console.log('findings',f.length);}
