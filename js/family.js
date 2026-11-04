/* Pure creation helpers: never consume the life simulation's random stream. */
(function (G) {
  var RA = G.RA = G.RA || {}, F = RA.Family = {};
  function copy(x) { return JSON.parse(JSON.stringify(x)); }
  function data() { return RA.data.parents; }
  F.bootsOpening = function (s) {
    if (F.matches(s,{parent:{role:'any',exposure:['football','sports'],alive:true}})) return 'boots_open_job';
    if (F.matches(s,{parent:{role:'any',talent:{sports:[2,3]},alive:true}})) return 'boots_open_talent';
    s.flags.boots_friend_opening = s.age; return 'boots_open_friend';
  };
  F.infancyScenes = function (s) {
    if (s.age === 4) {
      var transitions = ['infancy_move','infancy_job_change','infancy_illness'];
      var selected = RA.RNG.pick(RA.RNG.create(s.seed+'|transition'),transitions);
      transitions.forEach(function (id) { delete s.flags[id]; }); s.flags[selected] = 4;
    }
    var groups = {};
    (RA.data.infancy || []).filter(function (m) { return m.age === s.age && RA.Engine.condMatches(s,m.cond); }).sort(function(a,b){return a.id.localeCompare(b.id);}).forEach(function(m){
      var id=m.id.slice(4), slot=id;
      if (/^(father|mother)_/.test(id)) slot=s.age===0?'night':'work';
      if (/^play_|^ordinary_play$/.test(id)) slot='play';
      if (/^discipline_/.test(id)) slot='discipline';
      if (/^(care|supplies)$/.test(id)) slot='care';
      if (/^(kr_day|home_day)$/.test(id)) slot='day';
      if(s.age===4 && /^(move_four|new_sibling_four|job_change|illness)$/.test(id)) slot='transition';
      if(!groups[slot]) groups[slot]=m;
    });
    return Object.values(groups).sort(function(a,b){return (a.id==='inf_birth'?-2:a.id==='inf_friend'?-1:0)-(b.id==='inf_birth'?-2:b.id==='inf_friend'?-1:0)||a.id.localeCompare(b.id);});
  };
  F.adultYear = function (s) {
    var ps = s.people.filter(function (p) { return p.v2 && p.alive; });
    ps.forEach(function (p) {
      if (p.adultYear === s.age) return;
      p.adultYear = s.age;
      var r = RA.RNG.create(s.seed + '|adult|' + p.id + '|' + s.age);
      var spouse = ps.find(function (other) { return other.id !== p.id; });
      var relative = s.people.filter(function (other) { return other.alive && other.role === 'sibling' && other.age >= 18; }).length;
      var support = (spouse ? spouse.v2.bright.warmth : 0) + Math.min(2, relative);
      p.outsideHelp = RA.RNG.chance(r, 0.12 + support * 0.04);
      ['alcohol','gambling','temper'].forEach(function (issue) {
        var prefix='adult_'+p.role+'_'+issue+'_', stages=['support','stable','relapse','protected'];
        var previous=stages.find(function(stage){return !!s.flags[prefix+stage];});
        stages.forEach(function(stage){delete s.flags[prefix+stage];});
        if(p.v2.dark[issue]<2) return;
        var adult=RA.RNG.create(s.seed+'|adult-stage|'+p.id+'|'+issue+'|'+s.age);
        var stage = p.outsideHelp && previous!=='support' ? 'support' : previous==='support' && RA.RNG.chance(adult,0.3+support*0.06) ? 'stable' : RA.RNG.chance(adult,0.25) ? 'relapse' : 'protected';
        s.flags[prefix+stage]=s.age||1;
      });
      var gain = p.v2.bright.grit + p.v2.bright.warmth + support + (p.outsideHelp ? 18 : -7);
      p.recovery = Math.max(0, Math.min(100, (p.recovery || 0) + gain));
      if (p.sober && RA.RNG.chance(r, Math.max(0.02, 0.12 - support * 0.015))) { p.sober = false; p.recovery = 55; p.relapseYears = (p.relapseYears || 0) + 1; }
      else if (p.recovery >= 100) p.sober = true;
      else if (!p.sober) p.relapseYears = (p.relapseYears || 0) + 1;
      if (p.role === 'father') {
        if (p.sober) s.flags.father_sober = s.age;
        else delete s.flags.father_sober;
      }
    });
  };
  F.combos = function (s) {
    var ps = (s.people || []).filter(function (p) { return p.v2 && p.alive; }).map(function (p) { return p.v2; });
    function any(f) { return ps.some(f); }
    return {
      edu_pressure: any(function (p) { return p.bright.education >= 3 && p.dark.control >= 3; }),
      warm_unreliable: any(function (p) { return p.bright.warmth >= 3 && p.dark.alcohol >= 2; }),
      cold_strict: any(function (p) { return p.dark.neglect >= 2 && p.dark.temper >= 2; }),
      debt: ['gambling', 'spending'].every(function (k) { return ps.reduce(function (n, p) { return n + (p.dark[k] || 0); }, 0) >= 2; })
    };
  };
  F.parentForEvent = function (s, ev) {
    var cond = ev && ev.cond || {}, ids = cond.combo || [], candidates = (s.people || []).filter(function(p){
      if(!p.v2 || !['father','mother'].includes(p.role))return false;
      if(cond.parent && !F.matches(s,{parent:Object.assign({},cond.parent,{role:p.role})}))return false;
      if(cond.parent && !['any','both',p.role].includes(cond.parent.role))return false;
      if(ids.length && (!p.alive || !ids.every(function(id){
        var v=p.v2;
        if(!F.combos(s)[id])return false;
        if(id==='edu_pressure')return v.bright.education>=3&&v.dark.control>=3;
        if(id==='warm_unreliable')return v.bright.warmth>=3&&v.dark.alcohol>=2;
        if(id==='cold_strict')return v.dark.neglect>=2&&v.dark.temper>=2;
        return id==='debt'&&(v.dark.gambling>0||v.dark.spending>0);
      })))return false;
      return true;
    });
    var remembered=(cond.memory||[]).filter(function(tag){return tag[0]!=='!';}).map(function(tag){return (s.memories||{})[tag];}).find(function(mem){return mem&&mem.parentId!=null;});
    if(remembered)return candidates.find(function(p){return p.id===remembered.parentId;})||null;
    return candidates[0]||null;
  };
  F.matches = function (s, cond) {
    function range(v, r) { return v >= r[0] && v <= r[1]; }
    var parents = (s.people || []).filter(function (p) { return p.v2 && (!cond.parent || cond.parent.role === 'any' || cond.parent.role === 'both' || p.role === cond.parent.role); });
    if (cond.parent) {
      var q = cond.parent, hits = parents.filter(function (p) {
        var v = p.v2, job = data().jobs.find(function (j) { return j.id === v.jobId; });
        return (q.alive == null || p.alive === q.alive) && (!q.job || q.job.includes(v.jobId)) && (!q.time || job && q.time.includes(job.time)) && (!q.exposure || job && q.exposure.some(function (x) { return job.exposure.includes(x); })) &&
          ['bright', 'dark', 'talent'].every(function (group) { return Object.keys(q[group] || {}).every(function (k) { return range((v[group === 'talent' ? 'talents' : group] || {})[k] || 0, q[group][k]); }); });
      });
      if (q.role === 'both' ? hits.length !== 2 : !hits.length) return false;
    }
    var h = s.household;
    if (cond.household) {
      if (!h) return false;
      var c = cond.household;
      if (c.tier && !range(h.tier, c.tier) || c.siblings && !range(h.siblings, c.siblings)) return false;
      if (['preset', 'residence'].some(function (k) { return c[k] && !c[k].includes(h[k]); })) return false;
      if (c.mixed != null && c.mixed !== (new Set((s.people || []).filter(function (p) { return p.v2; }).map(function (p) { return p.v2.nationality; })).size > 1)) return false;
    }
    if ((cond.memory || []).some(function (tag) { return tag[0] === '!' ? !!(s.memories || {})[tag.slice(1)] : !(s.memories || {})[tag]; })) return false;
    if ((cond.combo || []).some(function (id) { return !F.combos(s)[id]; })) return false;
    if ((cond.parent || cond.combo) && (cond.memory || []).some(function(tag){return tag[0]!=='!' && (s.memories||{})[tag] && (s.memories||{})[tag].parentId!=null;}) && !F.parentForEvent(s,{cond:cond})) return false;
    return true;
  };
  F.effects = function (s, eff, out, ev) {
    var E = RA.Engine;
    if (eff.memory && eff.memory.who === 'friend' && !E.person(s,'friend')) E.FX.newFriend(s);
    if (eff.moment) {
      var m = copy(eff.moment); ['title', 'sub'].forEach(function (k) { if (m[k]) m[k] = E.render(s, m[k], ev); }); E.emitMoment(s, m);
    }
    if (eff.memory) {
      var mem = { tag: eff.memory.tag, text: E.render(s, eff.memory.text || '', ev), year: s.year, age: s.age };
      var who = eff.memory.who === 'parent' ? F.parentForEvent(s,ev) : E.person(s, eff.memory.who);
      if(who){mem.personId=who.id;if(['father','mother'].includes(who.role))mem.parentId=who.id;}
      (s.memories = s.memories || {})[mem.tag] = mem;
      if(mem.tag==='first_boots'){
        if(s.flags.boots_partial) s.pending.push({id:'boots_reserve_review',age:s.age+1});
        ['warmth','control','neglect','alcohol'].forEach(function(id){s.pending.push({id:'boots_parent_'+id,age:s.age+1});});
      }
      if (who) (who.memories = who.memories || []).push(copy(mem));
      (s.chronicle = s.chronicle || []).push({ id: 'memory_' + mem.tag + '_' + s.age, kind: 'memory', tier: 'A', tone: 'tender', title: mem.text, age: s.age, year: s.year, people: who ? [who.id] : [], seen: true });
    }
    if (eff.household && s.household) {
      s.household.cash = (s.household.cash || 0) + (eff.household.cash || 0);
      var payer = eff.household.payer || 'both';
      out.push({ k: 'msg', t: (payer === 'father' ? '아버지' : payer === 'mother' ? '어머니' : '부모님') + '의 가계 현금 ' + (eff.household.cash || 0) });
    }
    if (typeof eff.wallet === 'number') {
      var before = s.wallet || 0; s.wallet = Math.max(0, before + eff.wallet);
      out.push({ k: 'msg', t: '내 지갑 ' + (s.wallet - before) });
    }
  };
  F.normalize = function (p) {
    p = copy(p); ['talents', 'bright', 'dark'].forEach(function (group) {
      var values = p[group] || {}; p[group] = {};
      data()[group].forEach(function (t) { p[group][t.id] = Math.max(0, Math.min(3, Math.round(Number(values[t.id]) || 0))); });
    }); return p;
  };
  F.preset = function (id) {
    if (id === 'random') return F.randomParents('random');
    var p = data().presets[id === 'custom' ? 'canon' : id];
    if (!p || !p.father) throw new Error('unknown family preset ' + id);
    return { parents: [F.normalize(p.father), F.normalize(p.mother)], siblings: p.siblings, preset: id, residence: p.father.nationality, note: p.note };
  };
  function randomParent(r) {
    var R = RA.RNG, p = { nationality: R.pick(r, Object.keys(RA.data.countries)), jobId: R.pick(r, data().jobs).id, talents: {}, bright: {}, dark: {} };
    ['bright', 'dark'].forEach(function (k) { data()[k].forEach(function (t) { p[k][t.id] = R.int(r, 0, 3); }); });
    var pool = data().talents.slice();
    for (var i = 0; i < 2; i++) { var at = R.int(r, 0, pool.length - 1); p.talents[pool.splice(at, 1)[0].id] = R.int(r, 1, 3); }
    return F.normalize(p);
  }
  F.randomParents = function (seed) {
    var r = RA.RNG.create(String(seed) + '|parents');
    var parents = [randomParent(r), randomParent(r)];
    return { parents: parents, siblings: RA.RNG.int(r, 0, 3), residence: parents[0].nationality, preset: 'random' };
  };
  F.rerollParent = function (spec, index, seed) {
    var out = copy(spec); out.parents[index] = randomParent(RA.RNG.create(String(seed) + '|parent|' + index)); out.preset = 'custom'; return out;
  };
  F.rerollField = function (spec, index, field, seed) {
    var out = copy(spec), fresh = randomParent(RA.RNG.create(String(seed) + '|field|' + index + '|' + field)), parts = field.split('.');
    if (parts.length === 2) out.parents[index][parts[0]][parts[1]] = fresh[parts[0]][parts[1]];
    else out.parents[index][field] = copy(fresh[field]);
    out.preset = 'custom'; return out;
  };
  F.tier = function (spec) {
    return Math.round(spec.parents.reduce(function (n, p) {
      var job = data().jobs.find(function (j) { return j.id === p.jobId; });
      if (!job) throw new Error('unknown parent job ' + p.jobId);
      return n + job.tier;
    }, 0) / 2);
  };
  F.preview = function (spec) {
    var opportunity = [], pressure = [];
    spec.parents.forEach(function (p, i) {
      var who = i ? '어머니' : '아버지', job = data().jobs.find(function (j) { return j.id === p.jobId; });
      if (job) opportunity.push(who + '가 ' + job.name + ': ' + job.exposure.map(function (id) { var t = data().talents.find(function (x) { return x.id === id; }); return t ? t.name : id === 'football' ? '축구' : '의료'; }).join('·') + '를 가까이에서 배울 기회');
      data().bright.forEach(function (t) { if ((p.bright || {})[t.id] >= 2) opportunity.push(who + '의 ' + t.name + ': ' + t.levels[p.bright[t.id]]); });
      data().dark.forEach(function (t) { if ((p.dark || {})[t.id] > 0) pressure.push(who + ' ' + t.name + ' ' + p.dark[t.id] + ': ' + t.levels[p.dark[t.id]]); });
    });
    pressure.push('형편 ' + F.tier(spec) + ': 돈과 시간을 어디에 쓸지 함께 고민하는 해가 있다');
    return { opportunity: opportunity, pressure: pressure, unknown: ['부모와 닮을 수도 다를 수도 있어요. 무엇을 좋아할지는 살아 보며 알게 됩니다.'] };
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
