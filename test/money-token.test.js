'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const RA=require('../tools/sim-helpers').load(),E=RA.Engine,F=RA.Family,T=RA.Text;
for(const country of ['pt','kr'])test(country+' boots text and log use the same conversion as the applied household debit',()=>{
  const s=E.newGame({...F.preset('canon'),residence:country,seed:'money-'+country});
  s.age=6;s.fb.stage='local';s.queue=['boots_cost'];s.household.cash=100;
  const c=RA.data.countries[country],unit=n=>T.money(n*c.wage,c);
  const ev=E.currentEvent(s);
  assert.ok(ev.text.includes(unit(40))&&ev.text.includes(unit(10)));
  assert.ok(ev.choices[0].text.includes(unit(50)));
  const result=E.choose(s,0),change=result.appliedChanges.find(x=>x.path==='household.cash');
  assert.equal(change.d,-50);
  assert.equal(change.displayAmount,unit(-50));
  assert.ok(result.log.includes(unit(40))&&result.log.includes(unit(10)));
  assert.equal(T.render('{money:50}[을/를]',{},null,null,c),unit(50)+T.particle(c.currency.unit,'을/를'));
});

test('validator warns about unmarked reference numbers in new content but not money tokens',()=>{
  const {validate}=require('../tools/validate-data');
  const a=RA.data.events.find(e=>e.id==='boots_cost'),before=a.text;
  try {
    a.text='회비 50';assert.ok(validate(RA).warns.some(w=>w.includes('boots_cost')&&w.includes('bare multi-digit')));
    a.text='회비 {money:50}';assert.ok(!validate(RA).warns.some(w=>w.includes('boots_cost')&&w.includes('bare multi-digit')));
  } finally { a.text=before; }
});
