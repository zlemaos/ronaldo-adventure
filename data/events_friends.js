/* Shared continuity during the academy years. */
(function(G){
  var RA=G.RA=G.RA||{};RA.data=RA.data||{};var E=RA.data.events=RA.data.events||[];
  function add(id,age,cond,text,choices,once){cond.fb=['academy','youth','pro'];E.push({id:id,own:'shared:academy',age:age,cond:cond,text:text,choices:choices,once:once!==false,cooldown:1,weight:25});}
  function c(text,log,tag,fx){var effects=Object.assign({memory:{tag:tag,who:'friend',text:log}},fx||{});var delta=effects.rel&&effects.rel.friend;delete effects.rel;effects.relationship={role:'friend',closeness:delta||0,trust:delta||0,contact:tag!=='acad_friend_drift',memory:{tag:tag,text:log}};return {text:text,log:log,effects:effects};}
  add('friends_acad_contact',[10,18],{flags:['acad_active'],memory:['first_friend']},'{friend}에게서 메시지가 왔다. “예전에 같이 공 차던 곳, 그물 새로 달았어.” 숙소 창밖에는 벌써 불이 켜졌다.',[
    c('새 그물 사진을 부탁하고 오늘 훈련도 이야기한다','{friend}[과/와] 동네 골대와 숙소 이야기를 주고받았다.','acad_friend_contact',{rel:{friend:3},flags:['acad_friend_contacted']}),
    c('지금 바빠서 주말에 연락하겠다고 한다','연락할 날을 알려 주고 오늘은 과제를 폈다.','acad_friend_busy',{smarts:2,flags:['acad_friend_delayed']})],false);
  add('friends_acad_callback',[11,18],{flags:['acad_friend_contacted'],memory:['acad_friend_contact']},'“그날 사진 보냈던 골대 기억나?” {friend}[이/가] 다시 물었다. 먼 곳의 훈련 이야기에도 아는 얼굴이 등장하기 시작했다.',[
    c('이번에는 친구의 학교 이야기를 듣는다','경기 이야기만 하지 않고 {friend}의 발표회 이야기도 들었다.','acad_friend_listened',{rel:{friend:3}}),
    c('방학에 골대 앞에서 만나자고 한다','둘 다 가능한 날짜를 확인해 달력에 적었다.','acad_friend_visit',{happy:2,rel:{friend:1}})]);
  add('friends_acad_distance',[11,18],{flags:['acad_friend_delayed'],memory:['!acad_friend_contact']},'대화창의 마지막 인사가 오래전 날짜에 멈춰 있다. {friend}의 하루에도 모르는 이름들이 늘었다.',[
    c('늦은 답장을 사과하고 안부를 묻는다','바로 예전처럼 될 거라 재촉하지 않고 답을 기다렸다.','acad_friend_reconnect',{rel:{friend:2},flags:['acad_friend_contacted']}),
    c('오늘은 보내지 않고 편지에 마음을 적는다','멀어진 아쉬움을 적었다. 연락이 뜸해도 함께 놀았던 시간은 남았다.','acad_friend_drift',{grit:2})]);
  var reactions={
    warmth:['평가 뒤 {parent}[이/가] 전화했다. 결과보다 오늘 밥을 먹었는지 먼저 물었다.','기억에 남는 패스를 이야기한다','{parent}[은/는] 끝까지 듣고 다음에 또 들려 달라고 했다.','오늘은 쉬고 싶다고 말한다','짧게 인사하고 편히 쉴 시간을 가졌다.'],
    control:['{parent}[이/가] 평가표에서 경고 표시를 먼저 짚었다. {name}[은/는] 코치와 정한 목표도 설명하고 싶었다.','직접 정한 목표를 설명한다','평가 숫자 외에 연습하고 있는 움직임도 말했다.','담당 코치와 함께 이야기하자고 한다','혼자 압박을 받지 않도록 면담을 부탁했다.'],
    neglect:['평가일에 {parent}[은/는] 오지 않았다. 텅 빈 의자를 보고 숙소 담당 어른에게 말을 걸었다.','기다린 마음을 담당 어른에게 말한다','의자 옆에서 오래 기다렸던 일을 이야기했다.','평가 내용을 믿는 어른과 읽는다','혼자 해석하기 어려운 평가표를 함께 읽었다.'],
    alcohol:['방문하겠다던 {parent}[이/가] 술자리 때문에 약속을 잊었다. 숙소 담당 어른이 오늘 저녁을 함께 먹자고 했다.','저녁을 먹으며 속상했던 일을 말한다','기다린 마음을 전했다. 어른의 음주를 해결하는 일은 맡지 않았다.','믿는 어른과 다음 연락 방법을 정한다','방문 약속이 바뀌면 누구에게 알릴지 확인했다.']
  };
  Object.keys(reactions).forEach(function(id){var a=reactions[id],p={role:'any',alive:true};p[id==='warmth'?'bright':'dark']={};p[id==='warmth'?'bright':'dark'][id]=[2,3];
    add('friends_acad_parent_'+id,[10,18],{flags:['acad_active'],parent:p},a[0],[{text:a[1],log:a[2],effects:{happy:2,memory:{tag:'acad_parent_'+id,who:'parent',text:a[0]}}},{text:a[3],log:a[4],effects:{grit:2,memory:{tag:'acad_parent_'+id,who:'parent',text:a[0]}}}]);});
  E.push({id:'friends_peer_crush',own:'shared:teen',once:true,weight:25,age:[13,18],cond:{peer:{},memory:['!peer_confessed']},text:'수업 뒤 {peer}[과/와] 우산을 쓰고 정류장까지 걸었다. 헤어지고 나서도 아까 함께 웃던 말이 떠올랐다.',choices:[
    {text:'다음에도 같이 걸어가자고 묻는다',log:'{peer}에게 다음에도 함께 걷고 싶다고 말했다.',effects:{relationship:{role:'peer',romance:'crush',contact:true,memory:{tag:'peer_walk',text:'비 오는 날 함께 정류장까지 걸었다.'}},memory:{tag:'peer_walk',who:'peer',text:'{peer}[과/와] 우산을 쓰고 정류장까지 걸었다.'}},schedule:{id:'friends_peer_confession',years:1}},
    {text:'오늘은 반가웠던 마음만 일기에 적는다',log:'당장 이름 붙이지 않고 함께 웃은 일을 적었다.',effects:{happy:2,memory:{tag:'peer_quiet',who:'peer',text:'함께 웃었던 말을 일기에 적었다.'}}}
  ]});
  E.push({id:'friends_peer_confession',own:'shared:teen',once:true,weight:25,age:[13,18],cond:{peer:{romance:'crush'}},text:'{peer}[과/와] 걷다가 정류장 앞에 멈췄다. 마음을 말할 수는 있지만 대답은 {peer}의 몫이다.',choices:[
    {text:'좋아한다고 말하고 대답을 기다린다',check:{stat:'social',diff:50,min:0.2,max:0.7,partial:0.6},
      success:{log:'{peer}도 좋아한다고 했다. 둘 다 괜찮다고 한 뒤 잠깐 손을 잡았다.',effects:{relationship:{role:'peer',romance:'dating',closeness:3,trust:2,contact:true,memory:{tag:'peer_yes',text:'서로 마음을 확인하고 손을 잡았다.'}},memory:{tag:'peer_confessed',who:'peer',text:'{peer}[과/와] 서로 좋아하는 마음을 확인했다.'}},schedule:{id:'friends_peer_after',years:1}},
      partial:{log:'{peer}[은/는] 아직 마음을 모르겠다고 했다. 답을 재촉하지 않기로 했다.',effects:{relationship:{role:'peer',trust:2,contact:true,memory:{tag:'peer_wait',text:'마음을 정할 시간을 존중했다.'}},memory:{tag:'peer_confessed',who:'peer',text:'{peer}에게 마음을 말하고 생각할 시간을 주었다.'}},schedule:{id:'friends_peer_after',years:1}},
      fail:{log:'{peer}[은/는] 친구로 지내고 싶다고 했다. 아쉬웠지만 대답을 바꾸라고 하지 않았다.',effects:{relationship:{role:'peer',romance:'none',trust:2,contact:true,memory:{tag:'peer_no',text:'친구로 지내고 싶다는 대답을 존중했다.'}},memory:{tag:'peer_confessed',who:'peer',text:'{peer}의 거절을 존중했다.'}},schedule:{id:'friends_peer_after',years:1}}},
    {text:'지금은 말하지 않고 함께 버스를 기다린다',log:'고백을 서두르지 않고 버스가 오는 쪽을 함께 바라봤다.',effects:{happy:2,relationship:{role:'peer',contact:true,memory:{tag:'peer_bus',text:'함께 버스를 기다렸다.'}}}}
  ]});
  E.push({id:'friends_peer_after',own:'shared:teen',once:true,weight:25,age:[14,19],cond:{peer:{},memory:['peer_confessed']},text:'{peer}[과/와] 복도에서 마주쳤다. 정류장에서 나눴던 말이 떠올랐지만 오늘도 서로 편한 거리를 물을 수 있다.',choices:[
    {text:'지금 이야기해도 괜찮은지 묻는다',log:'{peer}의 대답을 듣고 이야기를 나눌 시간을 정했다.',effects:{relationship:{role:'peer',trust:2,contact:true,memory:{tag:'peer_boundaries',text:'서로 편한 대화 시간을 물었다.'}}}},
    {text:'가볍게 인사하고 각자 일정으로 간다',log:'눈인사를 나누고 수업으로 향했다. 더 긴 대화를 요구하지 않았다.',effects:{grit:2,relationship:{role:'peer',contact:true,memory:{tag:'peer_space',text:'가볍게 인사하고 각자의 시간을 존중했다.'}}}}
  ]});
})(typeof globalThis!=='undefined'?globalThis:this);
