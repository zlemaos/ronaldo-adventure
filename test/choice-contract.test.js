'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {audit}=require('../tools/audit-choice-contract');
test('ordered odds and outcomes reject domination but preserve probability tradeoffs',()=>{
 const choice=(odds,success,fail)=>({check:{odds},success:{effects:{happy:success},schedule:{id:'follow',years:1}},fail:{effects:{happy:fail},schedule:{id:'follow',years:1}}});
 const scan=choices=>audit({data:{events:[{id:'ordered',own:'route:football',choices}]}}).filter(f=>f.issue.startsWith('dominated'));
 assert.deepEqual(scan([choice(.2,2,-4),choice(.8,4,-2)]),[{id:'ordered',choice:0,issue:'dominated by choice 1'}]);
 assert.deepEqual(scan([choice(.2,8,-4),choice(.8,4,-2)]),[]);
 assert.deepEqual(scan([choice(.8,2,-4),choice(.2,4,-2)]),[]);
});
