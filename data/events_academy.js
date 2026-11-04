/* Academy route: selection, school and life beyond a roster. */
(function(G){
  var RA=G.RA=G.RA||{};RA.data=RA.data||{};var E=RA.data.events=RA.data.events||[];
  function mem(tag,text){return {tag:tag,who:'family',text:text};}
  function add(id,age,cond,text,choices,once){
    E.push({id:id,own:'route:football',age:age,cond:cond,text:text,choices:choices,once:once!==false,cooldown:1,weight:30,
      manual:['acad_regional','acad_growth','acad_injury','acad_contract'].indexOf(id)<0,
      priority:id==='acad_contract',
      when:function(s){
        if(s.age<age[0]||s.age>age[1])return false;
        if(id==='acad_contract')return !s.fb.contract&&(!s.fb.academy||s.fb.academy.status!=='released');
        return true;
      }});
  }
  function choice(text,log,fx,next){return {text:text,log:log,effects:fx||{},schedule:next?{id:next,years:0}:undefined};}
  function outcome(log,tag,fx,next){return {log:log,effects:Object.assign({memory:mem(tag,log)},fx||{}),schedule:{id:next,years:0}};}
  add('acad_regional',[10,13],{fb:['local','regional'],memory:['first_boots','!acad_entered']},'지역 대회 명단이 붙었다. 코치는 공을 오래 갖는 것보다 동료가 받을 자리를 보라고 했다.',[
    {text:'동료와 움직임을 맞춰 출전한다',check:{stat:'football',talent:'sport',diff:45,min:0.2,max:0.8,partial:0.6},
      success:outcome('스카우트가 경기 뒤 이름을 물었다. 다음 시험 초대장을 받았다.','acad_noticed',{flags:['acad_invited']},'acad_trial'),
      partial:outcome('후반의 패스를 눈여겨봤다는 말을 들었다. 연습 경기에 한 번 더 오라고 했다.','acad_second_look',{flags:['acad_second_ready']},'acad_second_look'),
      fail:outcome('오늘은 이름을 묻는 사람이 없었다. 코치가 공을 받기 전 고개를 드는 연습을 짚어 주었다.','acad_unnoticed',{flags:['acad_second_ready']},'acad_second_look')},
    choice('이번에는 기록을 맡아 경기를 본다','패스가 이어진 자리를 공책에 그렸다.',{grit:2,flags:['acad_second_ready'],memory:mem('acad_observer','동료의 움직임을 공책에 그렸다.')},'acad_second_look')]);
  add('acad_second_look',[10,15],{fb:['local','regional'],flags:['acad_second_ready'],memory:['first_boots','!acad_entered']},'다음 공개 시험 안내가 왔다. 앞선 경기에서 적어 둔 움직임을 연습할 시간이 있다.',[
    choice('부족했던 첫 터치를 연습한다','벽에서 돌아오는 공을 멈추며 공개 시험을 준비했다.',{football:3,flags:['acad_invited']},'acad_trial'),
    choice('학교 팀에서 더 뛰고 결정한다','당장 떠나지 않고 익숙한 팀에서 한 시즌을 보내기로 했다.',{smarts:2,memory:mem('acad_school_team','학교 팀에서 더 뛰기로 했다.')})]);
  add('acad_trial',[10,16],{fb:['local','regional'],flags:['acad_invited'],memory:['!acad_entered']},'아카데미 시험장에서는 처음 만난 선수들과 한 팀이 됐다. 코치는 공이 없을 때의 움직임도 적고 있었다.',[
    {text:'연습한 패스와 위치 선정으로 시험을 본다',retry:'improve',check:{stat:'football',talent:'sport',diff:57,min:0.15,max:0.8,partial:0.65},
      success:outcome('입단 제안을 받았다. 숙소와 학교를 먼저 함께 확인하기로 했다.','acad_entered',{fx:['joinAcademy'],flags:['acad_active','!acad_invited','!acad_retry_ready']},'acad_move'),
      partial:outcome('보류 명단에 올랐다. 다음 시험에서 수비 전환을 다시 보겠다고 했다.','acad_trial_pending',{flags:['acad_retry_ready']},'acad_retry'),
      fail:outcome('이번 명단에는 없었다. 코치가 시험 기록을 건네며 다른 팀 공개 시험도 알려 주었다.','acad_trial_failed',{flags:['acad_retry_ready']},'acad_retry')},
    choice('시험장을 둘러보고 다음 기회를 택한다','학교 일정과 이동 거리를 확인한 뒤 돌아왔다.',{smarts:2,flags:['acad_retry_ready'],memory:mem('acad_trial_deferred','학교 일정 때문에 시험을 미뤘다.')},'acad_retry')],false);
  add('acad_retry',[10,16],{fb:['local','regional'],flags:['acad_retry_ready'],memory:['!acad_entered']},'시험 기록에는 고쳐 볼 움직임이 표시돼 있다. 같은 날 다시 치르는 시험은 없고 다음 모집까지 연습해야 한다.',[
    {text:'한 해 동안 보완하고 다시 신청한다',log:'학교 팀에서 수비 전환을 연습하며 다음 모집을 기다렸다.',effects:{football:4,flags:['acad_invited'],memory:mem('acad_retry_practice','수비 전환을 보완해 다시 신청했다.')},schedule:{id:'acad_trial',years:1}},
    choice('다른 팀과 학교 진로를 알아본다','한 구단의 명단과 앞으로의 삶을 같은 것으로 보지 않기로 했다.',{smarts:3,flags:['acad_exit_options','!acad_invited','!acad_retry_ready']},'acad_alternatives')],false);
  add('acad_move',[10,16],{fb:['academy','youth'],flags:['acad_active'],memory:['acad_entered']},'숙소 침대 옆에 책가방을 놓았다. 이동 교통비 {money:20}[은/는] 가계에서 지출하고 학교에는 훈련 시간표를 보냈다.',[
    choice('담임과 밀릴 수업을 먼저 확인한다','가계에서 교통비 {money:20}[이/가] 나갔다. 수업과 훈련 시간을 나란히 적었다.',{household:{cash:-20,category:'club'},smarts:3,memory:mem('acad_school_plan','담임과 수업 계획을 세웠다.')},'acad_homesick'),
    choice('숙소 동료에게 생활 규칙을 묻는다','가계에서 교통비 {money:20}[이/가] 나갔다. 세탁하는 곳과 불을 끄는 시간을 함께 확인했다.',{household:{cash:-20,category:'club'},happy:3,memory:mem('acad_dorm_help','동료가 숙소 생활을 알려 주었다.')},'acad_homesick')]);
  add('acad_homesick',[10,17],{fb:['academy','youth'],flags:['acad_active'],memory:['acad_entered']},'불이 꺼지니 집의 익숙한 소리가 그리웠다. 내일은 훈련 전에 제출할 숙제도 있다.',[
    choice('그리운 마음을 일기에 쓰고 숙제를 편다','집에서 들리던 소리를 적은 뒤 한 문제씩 풀었다.',{happy:2,smarts:1,memory:mem('acad_called_home','숙소 첫날 집이 그리운 마음을 적었다.')}),
    choice('생활 담당 어른에게 잠들기 어렵다고 한다','쉴 곳과 다음 날 수업 도움을 함께 확인했다.',{health:2,grit:1,memory:mem('acad_sleep_help','잠들기 어려울 때 도움을 구했다.')})]);
  add('acad_growth',[12,16],{fb:['academy','youth'],flags:['acad_active'],memory:['acad_entered']},'지난달 맞던 운동화가 발끝을 눌렀다. 키가 빨리 큰 동료와 늦게 크는 동료의 달리기 모습도 달라졌다.',[
    choice('불편한 곳을 코치에게 알린다','몸이 변하는 속도에 맞춰 훈련량과 신발을 확인했다.',{health:3,memory:mem('acad_growth_adjust','성장 중 불편함에 맞춰 훈련을 조절했다.')}),
    choice('몸싸움 대신 공 받는 위치를 연습한다','체격만 비교하지 않고 빈 공간을 찾았다.',{football:3,memory:mem('acad_growth_space','빈 공간을 찾는 연습을 했다.')})]);
  add('acad_injury',[13,16],{fb:['academy','youth'],flags:['acad_active'],memory:['acad_entered']},'착지하다 발목을 가볍게 접질렀다. 의료진은 잠깐 쉬고 통증을 확인한 뒤 복귀하자고 했다.',[
    choice('회복 계획을 적고 쉬는 동안 수업을 챙긴다','운동을 쉬는 날에도 학교 과제는 이어 갔다.',{smarts:2,flags:['acad_recovery_due'],memory:mem('acad_injury_plan','발목 회복 계획을 따랐다.')},'acad_recovery'),
    choice('가능한 재활 동작을 의료진에게 묻는다','통증 없는 범위의 동작만 확인했다.',{grit:2,flags:['acad_recovery_due'],memory:mem('acad_injury_care','의료진과 재활 동작을 확인했다.')},'acad_recovery')]);
  add('acad_recovery',[13,17],{fb:['academy','youth'],flags:['acad_active','acad_recovery_due'],memory:['acad_entered']},'발목 상태를 다시 확인하는 날이다. 쉬었던 훈련을 하루 만에 모두 채울 필요는 없다고 했다.',[
    choice('허락받은 훈련부터 천천히 한다','통증을 살피며 팀 훈련에 조금씩 합류했다.',{health:3,football:1,memory:mem('acad_recovered','단계적으로 발목 훈련에 복귀했다.')}),
    choice('불편함이 남았다고 알리고 더 쉰다','복귀 날짜보다 몸 상태를 먼저 확인했다.',{health:4,memory:mem('acad_extended_rest','불편함을 숨기지 않고 회복을 더 기다렸다.')})]);
  add('acad_review',[12,16],{fb:['academy','youth'],flags:['acad_active'],memory:['acad_entered']},'연말 평가표에 경기 기록과 수업 출석이 함께 놓였다. 오늘 결과가 지난 한 해의 모든 가치를 정하는 것은 아니다.',[
    {text:'훈련 기록을 펴고 다음 시즌 평가를 받는다',check:{stat:'football',talent:'sport',diff:62,min:0.2,max:0.85,partial:0.65},
      success:outcome('잔류 명단에 들었다. 다음 시즌에는 경기 운영도 맡아 보자고 했다.','acad_kept',{academy:{action:'keep'},flags:['acad_plan_due'],football:2},'acad_review_plan'),
      partial:outcome('경고를 받았다. 다음 평가까지 보완할 항목을 함께 적었다.','acad_warning',{academy:{action:'warning'},flags:['acad_plan_due']},'acad_review_plan'),
      fail:outcome('다음 시즌 명단에서 빠졌다. 학교를 이어 갈 서류와 다른 팀 연락처를 받았다.','acad_released',{academy:{action:'release'},flags:['acad_exit_options']},'acad_alternatives')},
    choice('평가를 받지 않고 학교 팀으로 돌아간다','숙소를 나갈 일정과 전학 서류를 확인했다.',{academy:{action:'release'},flags:['acad_exit_options'],smarts:3,memory:mem('acad_review_school','학교 팀으로 돌아가기로 했다.')},'acad_alternatives')],false);
  add('acad_review_plan',[12,16],{fb:['academy','youth'],flags:['acad_active','acad_plan_due'],memory:['acad_entered']},'평가 뒤 코치와 다음 훈련표를 폈다. 잘한 점과 고칠 점을 따로 적을 칸이 있다.',[
    choice('수비 전환을 다음 목표로 쓴다','공을 빼앗긴 뒤 돌아서는 움직임을 연습했다.',{football:3,flags:['!acad_plan_due'],memory:mem('acad_next_goal','수비 전환을 다음 목표로 정했다.')}),
    choice('수업을 따라갈 시간을 확보한다','보충 수업 시간은 훈련표에서 비워 두었다.',{smarts:3,flags:['!acad_plan_due'],memory:mem('acad_tutor_time','보충 수업 시간을 확보했다.')})],false);
  add('acad_contract',[17,18],{fb:['academy','youth'],flags:['acad_active'],memory:['acad_entered','!acad_first_contract']},'첫 프로 계약을 결정할 면담이다. 계약 기간과 세후 월급을 확인하고 서명 전 설명을 들을 수 있다.',[
    {text:'경기 기록으로 첫 계약 심사를 받는다',check:{stat:'football',talent:'sport',diff:82,min:0.1,max:0.7,partial:0.6},
      success:outcome('기간은 이 년, 세후 월급은 {money:1200}인 제안이다. 설명을 듣고 첫 계약에 서명했다.','acad_first_contract',{academy:{action:'contract',duration:2},fx:['turnPro'],flags:['!acad_active']},'acad_contract_day'),
      partial:outcome('당장 계약하지는 못했지만 다른 팀 시험 추천서를 받았다.','acad_contract_referral',{academy:{action:'release'},flags:['acad_exit_options']},'acad_alternatives'),
      fail:outcome('이번 구단에서는 계약을 제안하지 않았다. 학교 기록과 훈련 기록을 챙겨 다음 길을 찾았다.','acad_contract_release',{academy:{action:'release'},flags:['acad_exit_options']},'acad_alternatives')},
    choice('서명 대신 학교 진로를 먼저 이어 간다','숙소를 나갈 일정과 다음 학기 등록을 확인했다.',{academy:{action:'release'},flags:['acad_exit_options'],smarts:4,memory:mem('acad_chose_school','계약보다 학교 진로를 먼저 택했다.')},'acad_alternatives')]);
  add('acad_contract_day',[17,18],{fb:['pro'],memory:['acad_first_contract']},'첫 계약서 사본을 가방에 넣었다. 프로라는 이름이 붙어도 다음 월급과 다음 계약은 별도로 확인해야 한다.',[
    choice('급여일과 공제 항목을 다시 묻는다','계약서의 지급 날짜에 밑줄을 그었다.',{grit:2,memory:mem('acad_payday_checked','첫 계약의 급여일을 확인했다.')}),
    choice('학교를 마칠 방법도 남겨 둔다','훈련 밖에서 이어 갈 공부 계획을 적었다.',{smarts:2,memory:mem('acad_keep_learning','프로 계약 뒤에도 공부 계획을 남겼다.')})]);
  add('acad_alternatives',[10,18],{fb:['local','regional'],flags:['acad_exit_options','!acad_active']},'구단 시험을 마친 뒤에도 공을 찰 곳과 배울 곳은 남아 있다. 기록을 챙겨 다음 일정을 골랐다.',[
    choice('다른 구단의 공개 시험을 준비한다','이전 평가 기록을 새 구단에 보낼 준비를 했다.',{football:2,memory:mem('acad_other_club','다른 구단 시험을 준비했다.')},'acad_other_trial'),
    choice('학교 수업과 아마추어 팀을 병행한다','수업이 없는 날에 뛸 수 있는 팀을 찾았다.',{smarts:2,happy:1,memory:mem('acad_amateur','학교와 아마추어 축구를 병행했다.')}),
    choice('축구 밖의 진로 체험을 신청한다','공책에 다른 일을 배워 볼 날짜도 적었다.',{smarts:3,memory:mem('acad_other_path','축구 밖의 진로 체험을 신청했다.')})]);
  add('acad_other_trial',[10,18],{fb:['local','regional'],flags:['!acad_active'],memory:['acad_other_club']},'다른 구단의 공개 시험장에 섰다. 이전 구단의 명단이 아니라 오늘의 움직임을 보겠다고 했다.',[
    {text:'새 동료에게 패스를 요청하며 시험을 본다',retry:'final',check:{stat:'football',diff:55,min:0.2,max:0.8,partial:0.6},
      success:outcome('지역 팀 명단에 들었다. 학교를 계속 다닐 수 있는 훈련 시간을 확인했다.','acad_other_signed',{fx:['joinRegionalClub']},'acad_other_settle'),
      partial:outcome('훈련 참가 제안을 받았다. 등록 전 학교 일정과 맞는지 살피기로 했다.','acad_other_guest',{},'acad_other_settle'),
      fail:outcome('이번에도 제안은 없었다. 학교와 아마추어 팀을 이어 갈 계획을 다시 폈다.','acad_other_no',{},'acad_other_settle')},
    choice('시험을 멈추고 학교 일정을 확인한다','학교로 돌아갈 시간을 먼저 확인했다.',{smarts:2,memory:mem('acad_other_stop','새 시험보다 학교 일정을 먼저 택했다.')},'acad_other_settle')]);
  add('acad_other_settle',[10,18],{fb:['local','regional'],flags:['!acad_active'],memory:['acad_other_club']},'새 시험을 마치고 다음 주 달력을 폈다. 축구를 이어 가는 날에도 수업과 쉬는 시간을 남겨 둘 수 있다.',[
    choice('학교 담당 선생님과 다음 주를 정리한다','수업과 공을 차는 시간을 겹치지 않게 적었다.',{smarts:2,memory:mem('acad_new_week','새 시험 뒤 학교 일정을 정리했다.')}),
    choice('지역 무료 운동 시간을 확인한다','소속 명단과 별개로 몸을 움직일 시간을 찾았다.',{health:2,memory:mem('acad_open_play','새 시험 뒤 무료 운동 시간을 찾았다.')})]);
})(typeof globalThis!=='undefined'?globalThis:this);
