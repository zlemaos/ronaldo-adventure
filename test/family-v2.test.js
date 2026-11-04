'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('../tools/sim-helpers');
const RA = load(), E = RA.Engine, F = RA.Family;

test('parent creation is deterministic and preserves independently edited fields', () => {
  const spec = F.randomParents('v2');
  assert.deepEqual(spec, F.randomParents('v2'));
  const changed = F.rerollField(spec, 0, 'dark.alcohol', 'roll');
  assert.deepEqual(changed.parents[1], spec.parents[1]);
  assert.deepEqual(changed.parents[0].bright, spec.parents[0].bright);
  assert.deepEqual(E.newGame({ ...spec, seed: 'life' }), E.newGame({ ...spec, seed: 'life' }));
  const p = F.preset('canon'); p.parents[0].dark.alcohol = 2; p.parents[1].jobId = 'cook';
  assert.ok(F.preview(p).pressure.some(x => x.includes('주말마다 술자리')));
  assert.ok(F.preview(p).opportunity.some(x => x.includes('요리')));
});

test('residence precedence and persistent family membership', () => {
  const spec = F.preset('canon');
  assert.equal(E.newGame({ ...spec, residence: 'kr' }).country, 'kr');
  delete spec.residence;
  assert.equal(E.newGame({ ...spec, country: 'kr' }).country, 'pt');
  spec.parents[1].nationality = 'kr';
  const s = E.newGame({ ...spec, country: 'kr' });
  assert.equal(s.country, 'kr');
  assert.equal(s.household.parentIds.length, 2);
  assert.ok(s.household.parentIds.every(id => s.people.find(p => p.id === id).v2));
});

test('moments survive save and acknowledgement archives once immediately', () => {
  const s = E.newGame({ seed: 'moments' }), store = RA.Save.memStorage();
  E.triumph(s, 'pro'); E.triumph(s, 'national');
  RA.Save.save(2, s, store);
  const loaded = RA.Save.load(2, store), ms = E.pendingMoments(loaded);
  assert.equal(ms.length, 2); assert.notEqual(ms[0].id, ms[1].id);
  E.ackMoment(loaded, ms[0].id); E.ackMoment(loaded, ms[0].id);
  const again = RA.Save.load(2, store);
  assert.equal(again.chronicle.length, 1);
  assert.equal(E.pendingMoments(again).length, 1);
});

test('child help or disappointment cannot directly set adult recovery', () => {
  const s = E.newGame({ seed: 'adult' }), d = E.person(s, 'father');
  const before = d.recovery;
  E.FX.fatherSeekHelp(s); E.FX.fatherRelapse(s);
  assert.equal(d.recovery, before);
});

test('football-only teen cannot receive a band invitation and decline does not join', () => {
  const s = E.newGame({ seed: 'band' }); s.age = 17; s.hobbies = ['football'];
  const ev = E.eventIndex().life_teen_band;
  assert.equal(E.careerStoryOk(s, ev), false);
  s.hobbies = ['music']; s.queue = [ev.id];
  const decline = ev.choices.findIndex(c => c.decline);
  E.choose(s, decline);
  assert.deepEqual(s.hobbies, ['music']);
});

test('v7 saves preserve identity, people, RNG, history and routes', () => {
  for (const s of Object.values(require('./fixtures/v7-saves.json'))) {
    const before = JSON.parse(JSON.stringify(s)), migrated = RA.Save.deserialize(JSON.stringify(s));
    assert.equal(migrated.saveVersion, 8); assert.equal(migrated.born, true);
    for (const field of ['rng', 'hero', 'log', 'route']) assert.deepEqual(migrated[field], before[field]);
    assert.deepEqual(migrated.people.map(p => [p.id, p.alive, p.name]), before.people.map(p => [p.id, p.alive, p.name]));
  }
});

test('content conditions apply to events and infancy milestones, with independent memories and wallet effects', () => {
  const spec = F.preset('canon');
  spec.parents[0].bright.education = 3; spec.parents[0].dark.control = 3;
  const s = E.newGame({ ...spec, seed: 'contract' });
  const cond = {parent:{role:'father',job:['kitman'],dark:{alcohol:[2,3]}},household:{preset:['canon'],siblings:[3,3]},combo:['edu_pressure'],memory:['!test_memory']};
  assert.equal(E.condMatches(s, cond), true);
  for (const own of ['family:alcohol','family:combo:edu_pressure','family:job:kitman','family:talent:sports','family:infancy','chain:first_boots']) {
    assert.equal(E.careerStoryOk(s, {id:'contract',own,cond}), true);
  }
  const m = {id:'contract_infant',age:0,cond,pic:'birth',text:'가족이 곁에 있다.',effects:{wallet:10}};
  RA.data.infancy.push(m);
  try { E.selectMilestones(s); assert.equal(s.wallet,10); } finally { RA.data.infancy.pop(); }
  E.applyEffects(s,{wallet:-100,memory:{tag:'test_memory',who:'father',text:'함께 기억한 날'},household:{cash:-40,payer:'father'},moment:{kind:'test',tier:'A',tone:'tender',title:'기억'}},[]);
  assert.equal(s.wallet,0);
  assert.equal(E.condMatches(s,cond),false);
  assert.ok(E.person(s,'father').memories.some(m=>m.tag==='test_memory'));
  assert.ok(E.pendingMoments(s).some(m=>m.kind==='test'));
});

test('adult recovery and relapse use the same adult stream despite child RNG and choices', () => {
  const spec=F.preset('canon'), a=E.newGame({...spec,seed:'adult-year'}), b=E.newGame({...spec,seed:'adult-year'});
  for(let age=1;age<40;age++){
    a.age=b.age=age;
    E.FX.fatherSeekHelp(a); E.FX.fatherRelapse(b); E.rnd(b);
    F.adultYear(a); F.adultYear(b);
    assert.deepEqual(a.people.filter(p=>p.v2).map(p=>[p.recovery,p.sober,p.relapseYears,p.outsideHelp]),b.people.filter(p=>p.v2).map(p=>[p.recovery,p.sober,p.relapseYears,p.outsideHelp]));
  }
});

test('Node loader excludes screen modules', () => {
  const { scriptOrder } = require('../tools/sim-helpers');
  assert.ok(scriptOrder().every(p => !/^js\/(opening|parents_ui|moments_ui|ui|pixel|audio)\.js$/.test(p)));
  assert.ok(E.newGame({ ...F.preset('canon'), seed: 'loader' }).household);
});

test('v2 infancy selects alternatives deterministically, keeps birth first and the same first friend', () => {
  for(let i=0;i<20;i++){
    const s=E.newGame({...F.randomParents('infancy-'+i),seed:'infancy-'+i});
    E.choose(s,0);
    assert.equal(s.cards[0].id,'inf_birth');
    assert.equal(new Set(s.cards.map(c=>c.id)).size,s.cards.length);
    while(s.age<5){
      while(s.queue.length){const ev=E.currentEvent(s);if(!ev)break;E.choose(s,ev.choices.find(c=>c.enabled).i);}
      E.ageUp(s);
      if(s.age===1) assert.ok(!s.queue.includes('sys_edu_focus'));
      if(s.age===3){
        const friend=E.person(s,'friend');
        assert.ok(friend && friend.memories.some(m=>m.tag==='first_friend'));
        s.testFriend=friend.id;
      }
      if(s.age===4){
        assert.ok(s.queue.includes('sys_edu_focus'));
        assert.equal(s.cards.filter(c=>['inf_move_four','inf_job_change','inf_illness'].includes(c.id)).length,1);
      }
    }
    assert.equal(E.person(s,'friend').id,s.testFriend);
  }
});

test('boots ownership chooses one opening and zero-year delivery queues a real affordable cost decision', () => {
  const s=E.newGame({...F.preset('canon'),seed:'boots-integration'});
  E.choose(s,0);s.age=5;s.year=s.birthYear+5;s.queue=[];s.stats.football=100;E.Routes.sync(s,true);
  assert.equal(F.bootsOpening(s),'boots_open_job');
  assert.equal(E.careerStoryOk(s,E.eventIndex().boots_open_talent),false);
  E.fireEvent(s,E.eventIndex().boots_open_job);E.choose(s,0);
  assert.ok(s.queue.includes('boots_tryout'));
  E.choose(s,0);
  const cost=E.currentEvent(s);
  assert.equal(cost.id,'boots_cost');
  assert.ok(cost.choices[0].text.includes(RA.data.countries[s.country].currency.unit));
  s.household.cash=0;s.wallet=0;
  assert.equal(E.currentEvent(s).choices[0].enabled,false);
  assert.equal(E.currentEvent(s).choices[2].enabled,false);
  s.household.cash=100;
  const result=E.choose(s,0);
  assert.equal(s.household.cash,50);
  assert.ok(s.memories.first_boots);
  assert.ok(result.appliedChanges.some(c=>c.path==='household.cash'&&c.d===-50));
  assert.ok(s.pending.some(p=>p.id==='boots_friend_reaction'&&p.age===6));
});

test('adult flags are exclusive and cannot be authored by child effects', () => {
  const s=E.newGame({...F.preset('canon'),seed:'adult-flags'});
  F.adultYear(s);
  const flags=Object.keys(s.flags).filter(k=>k.startsWith('adult_father_alcohol_'));
  assert.equal(flags.length,1);
  E.applyEffects(s,{flags:['adult_father_alcohol_relapse'],unflags:flags},[]);
  assert.deepEqual(Object.keys(s.flags).filter(k=>k.startsWith('adult_father_alcohol_')),flags);
});

test('direct activity results expose all final applied changes, not just declared effects', () => {
  const s=E.newGame({seed:'activity-results',country:'kr'});
  E.choose(s,0);s.age=10;s.queue=[];E.updateEducation(s,true);
  const activity=E.activities(s).find(a=>a.ok&&!a.ui);
  const result=E.doActivity(s,activity.id,activity.opts?activity.opts[0][0]:undefined);
  assert.ok(Array.isArray(result.appliedChanges));
  assert.deepEqual(result.appliedChanges,E.lastChanges(s));
  assert.ok(result.appliedChanges.some(change=>change.path==='ap'));
});

test('birth moment is owned by the v2 infancy scene and remains available for legacy births',()=>{
  for(const options of [F.preset('canon'),{}]){
    const s=E.newGame({...options,seed:'single-birth'});E.choose(s,0);
    const moments=E.pendingMoments(s).filter(m=>m.kind==='birth');
    assert.equal(moments.length,1);
    assert.equal(moments[0].title,options.parents?'처음 만난 날':'태어난 날');
  }
});

test('parent token binds kinship rather than personal names in choiceless text and stored memory',()=>{
  for(const role of ['father','mother']){
    const spec=F.preset('canon');
    spec.parents.forEach((p,i)=>p.bright.warmth=(i===0?'father':'mother')===role?3:0);
    const s=E.newGame({...spec,seed:'parent-token-'+role});
    E.choose(s,0);s.age=7;s.queue=[];s.memories.first_boots={age:6};
    const ev=E.eventIndex().boots_parent_warmth,word=role==='father'?'아버지':'어머니';
    assert.equal(E.vars(s,ev).parent,word);
    E.fireEvent(s,ev);
    assert.ok(s.log.find(e=>e.ev===ev.id).t.includes(word));
    assert.ok(s.memories.boots_parent_warmth.text.includes(word));
    assert.ok(!s.memories.boots_parent_warmth.text.includes(E.person(s,role).name));
  }
});
