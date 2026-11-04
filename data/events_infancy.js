/* Conditional montage cards; the engine retains the first friend person. */
(function(G){
  var RA=G.RA=G.RA||{};RA.data=RA.data||{};
  var M=RA.data.milestones=RA.data.milestones||[];
  RA.data.infancy = [];
  function card(id,age,pic,text,cond,effects){var c={id:'inf_'+id,own:'family:infancy',age:age,pic:pic,text:text,cond:cond,effects:effects||{happy:1}};M.push(c);RA.data.infancy.push(c);}
  card('birth',0,'birth','작은 손이 손가락 하나를 꼭 쥐었다. 어른들이 목소리를 낮추고 {name}의 이름을 불렀다.',{household:{tier:[1,5]}},{moment:{kind:'birth',tier:'S',tone:'tender',title:'처음 만난 날',sub:'{name}의 이름을 불렀다'},memory:{tag:'birth_hands',who:'family',text:'처음 {name}의 이름을 부르던 목소리.'}});
  ['father','mother'].forEach(function(role){
    card(role+'_song',0,'smile','{'+role+'}[이/가] 같은 자장가를 작게 불렀다. 울음 사이로 숨 고르는 소리가 잦아들었다.',{parent:{role:role,bright:{warmth:[2,3]},alive:true}});
    card(role+'_shift',0,'smile','{'+role+'}의 근무가 끝나기 전 다른 어른이 아기를 안았다. 돌아온 뒤에는 씻은 손으로 조심스레 품을 바꿨다.',{parent:{role:role,time:['shift'],alive:true}});
    card(role+'_noise',0,'smile','술을 마신 {'+role+'}의 목소리에 아기가 깼다. 다른 어른이 조용한 방으로 옮겨 달래고 밤을 지켰다.',{parent:{role:role,dark:{alcohol:[2,3]},alive:true}});
    card(role+'_work',1,'move','{'+role+'}의 출근 시간이 달라졌다. 맡아 주는 어른에게 좋아하는 담요와 잠드는 순서를 알려 주었다.',{parent:{role:role,time:['shift','away','regular'],alive:true}});
  });
  card('siblings',0,'sibling','형제가 이불 끝에서 작은 발을 구경했다. 안아 보기 전에는 어른에게 손을 받쳐 달라고 했다.',{household:{siblings:[1,3]}});
  card('only',0,'smile','집 안의 어른들이 처음 맡는 밤 당번을 나눴다. 아기가 잠들자 서로 눈짓으로 안부를 물었다.',{household:{siblings:[0,0]}});
  card('steps',1,'steps','탁자에서 손을 떼고 한 걸음, 또 한 걸음. 넘어져 앉은 자리까지 손뼉 소리가 따라왔다.',{household:{tier:[1,5]}},{health:1,moment:{kind:'first_steps',tier:'A',tone:'tender',title:'처음 내디딘 발'},memory:{tag:'first_steps',who:'family',text:'손을 놓고 걸었던 오후.'}});
  card('words',1,'word','컵을 가리키며 짧은 소리를 냈다. 어른은 뜻을 알아듣고 컵 이름을 천천히 되풀이했다.',{household:{tier:[1,5]}});
  card('supplies',1,'smile','어른들이 분유와 기저귀의 남은 양을 세었다. 필요한 것을 먼저 사고 서로 맡을 시간을 조정했다.',{household:{tier:[1,2]}});
  card('care',1,'smile','익숙한 돌봄 어른에게 안기자 울음이 조금 잦아들었다. 헤어질 때 쥐여 준 담요는 낮잠 때도 곁에 있었다.',{household:{tier:[3,5]}});
  var play={sports:'부드러운 공을 굴리면 발끝으로 다시 밀었다.',music:'작은 북을 두드리자 어른이 같은 박자로 답했다.',art:'크레파스 선이 종이 밖으로 나왔다. 바닥에는 큰 종이를 한 장 더 깔았다.',logic:'큰 블록을 아래에 놓으니 탑이 조금 더 오래 섰다.',language:'그림 속 동물을 가리키며 이름을 주고받았다.',cooking:'차가운 빈 그릇에 나무 숟가락을 넣고 휘저었다.',stage:'커튼 뒤에서 인형이 나오자 다른 목소리로 대답했다.'};
  Object.keys(play).forEach(function(id){var q={};q[id]=[1,3];card('play_'+id,2,'word',play[id],{parent:{role:'any',alive:true,talent:q}},{happy:1,memory:{tag:'play_'+id,who:'family',text:play[id]}});});
  card('ordinary_play',2,'word','상자를 뒤집어 작은 집을 만들었다. 안에 들어갈 때마다 어른에게 문을 열어 달라고 했다.',{household:{tier:[1,5]}});
  card('share',2,'sibling','형제와 같은 장난감을 붙잡고 울었다. 어른이 번갈아 쓸 자리를 마련하자 조금씩 손을 놓았다.',{household:{siblings:[1,3]}});
  card('move',2,'move','이삿짐 상자에 익숙한 담요가 맨 위에 놓였다. 새 방에서도 그 담요부터 찾아 안았다.',{flags:['infancy_move'],household:{tier:[1,5]}});
  card('new_sibling',2,'sibling','새 아기가 집에 왔다. 어른은 {name}의 옆자리를 비워 두고 둘을 차례로 안아 주었다.',{flags:['infancy_new_sibling'],household:{siblings:[1,3]}});
  card('friend',3,'preschool','집 밖에서 처음 긴 하루를 보냈다. 같은 블록을 고른 아이와 나란히 앉아 길을 만들었다.',{household:{tier:[1,5]},memory:['!first_friend']},{fx:['newFriend'],memory:{tag:'first_friend',who:'friend',text:'세 살에 함께 블록 길을 만든 첫 친구.'}});
  card('kr_day',3,'preschool','어린이집 적응 시간을 보내며 신발장 그림을 외웠다. 데리러 올 어른이 문 밖에서 한 번 더 손을 흔들었다.',{household:{residence:['kr']}});
  card('home_day',3,'preschool','집에서 돌봄을 받는 날에도 동네 놀이 모임에 갔다. 낯선 문 앞에서는 손을 조금 더 꼭 잡았다.',{parent:{role:'any',alive:true,time:['home']},household:{tier:[1,5]}});
  card('friend_again',4,'sibling','{friend}[이/가] 작년에 만들었던 블록 길을 기억했다. 오늘은 {name}의 집 앞까지 길을 늘리자고 했다.',{memory:['first_friend']},{rel:{friend:3},memory:{tag:'friend_blocks',who:'friend',text:'한 해 뒤에도 함께 늘린 블록 길.'}});
  var discipline={warmth:'쏟아진 물을 보고 {parent}[이/가] 걸레를 가져왔다. 놀랐는지 먼저 묻고 함께 닦았다.',control:'{parent}[은/는] {name}[이/가] 고른 그림 대신 다른 것을 그리라고 했다. {name}[은/는] 원래 그리려던 것을 종이 뒤에 남겼다.',neglect:'{parent}에게 완성한 그림을 보여 줬지만 대답이 없었다. 돌봐 주는 어른에게 다시 보여 주었다.',temper:'물이 쏟아지자 {parent}의 목소리가 커졌다. 다른 어른이 곁에 앉아 진정할 자리를 마련했다.'};
  Object.keys(discipline).forEach(function(id){var q={role:'any',alive:true};q[id==='warmth'?'bright':'dark']={};q[id==='warmth'?'bright':'dark'][id]=[2,3];card('discipline_'+id,4,'word',discipline[id],{parent:q});});
  card('learning',4,'preschool','놀이 수업 안내를 펼쳐 놓고 무엇이 재미있을지 골랐다. 오늘의 선택이 평생의 직업을 정하는 것은 아니었다.',{household:{tier:[1,5]}});
  card('job_change',4,'move','{parent}의 근무 시간이 바뀌어 데리러 오는 어른도 달라졌다. 새 약속을 그림 달력에 표시했다.',{parent:{role:'any',alive:true},flags:['infancy_job_change'],household:{tier:[1,5]}});
  card('illness',4,'smile','가족이 진료를 받는 동안 다른 어른과 저녁을 먹었다. 아픈 사람을 낫게 하는 일 대신 다음 날 챙길 가방을 준비했다.',{flags:['infancy_illness'],household:{tier:[1,5]}});
  card('move_four',4,'move','새집 창문에서 보이는 길이 낯설었다. {friend}에게 보여 주려고 작은 지도를 그렸다.',{flags:['infancy_move'],memory:['first_friend'],household:{tier:[1,5]}});
})(typeof globalThis!=='undefined'?globalThis:this);
