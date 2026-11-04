/* Presentation preferences and the non-random reincarnation opening. DOM access is deferred. */
(function (G) {
  'use strict';
  var RA = G.RA = G.RA || {}, V = RA.V2 = {}, key = 'ronaldo-adventure.preferences';
  V.settings = { text: 'normal', motion: false, skip: false, infantAuto: false };
  V.init = function () {
    try { Object.assign(V.settings, JSON.parse(G.localStorage.getItem(key) || '{}')); } catch (e) { /* defaults */ }
    V.apply();
  };
  V.reduced = function () { return V.settings.motion || G.matchMedia('(prefers-reduced-motion: reduce)').matches; };
  V.apply = function () {
    var d = G.document.documentElement;
    d.dataset.text = V.settings.text; d.classList.toggle('reduce-motion', V.reduced());
    try { G.localStorage.setItem(key, JSON.stringify(V.settings)); } catch (e) { /* preferences remain usable */ }
  };
  V.settingsPanel = function (ctx) {
    var m = ctx.modal('<div class="card-b v2-settings"><h2>설정</h2><label for="text-size">글자 크기</label><select id="text-size"><option value="normal">보통</option><option value="large">크게</option><option value="largest">아주 크게</option></select><label><input type="checkbox" id="motion"> 움직임 줄이기</label><label><input type="checkbox" id="sound"> 소리 켜기</label><label><input type="checkbox" id="skip-opening"> 오프닝 항상 건너뛰기</label><button class="btn btn-gold" id="settings-done">닫기</button></div>');
    var q = function (s) { return m.querySelector(s); };
    q('#text-size').value = V.settings.text; q('#motion').checked = V.settings.motion; q('#sound').checked = !RA.Audio.isMuted(); q('#skip-opening').checked = V.settings.skip;
    q('#text-size').onchange = function () { V.settings.text = this.value; V.apply(); };
    q('#motion').onchange = function () { V.settings.motion = this.checked; V.apply(); };
    q('#skip-opening').onchange = function () { V.settings.skip = this.checked; V.apply(); };
    q('#sound').onchange = function () { if (this.checked === RA.Audio.isMuted()) RA.Audio.toggle(); G.document.querySelector('#btn-mute').textContent = RA.Audio.isMuted() ? '🔇' : '🔊'; };
    q('#settings-done').onclick = function () { ctx.close(); ctx.resume(); };
  };
  V.openingLines = ['어.. 나는 누구..?', '아무것도 보이지 않는다. 아무 소리도 들리지 않는다.', '마지막 기억이 흐릿하다. 멀어지는 목소리들.', '아… 내가 죽었구나.', '(쿵… 쿵…) 어디선가 심장 소리가 들린다. 내 것이 아닌, 따뜻한 소리.', '다시 태어나는구나.', '이번 생은… 누구의 아이로 태어날까?'];
  V.opening = function (root, done) {
    if (V.settings.skip) return done();
    var i = 0, timer, delay, typing, n, ready = false;
    root.innerHTML = '<section class="v2-opening"><button class="btn opening-skip">건너뛰기 ▶▶</button><div class="opening-lines"><p class="opening-before"></p><p class="opening-current"></p></div><button class="btn opening-next">다음</button></section>';
    var el = root.firstChild, current = el.querySelector('.opening-current');
    function finish() { clearInterval(timer); clearTimeout(delay); done(); }
    function show() {
      clearInterval(timer); n = 0; current.textContent = '';
      el.querySelector('.opening-before').textContent = i ? V.openingLines[i - 1] : '';
      if (V.reduced()) { current.textContent = V.openingLines[i]; typing = false; return; }
      typing = true; timer = setInterval(function () {
        if (!G.document.body.contains(el)) { clearInterval(timer); return; }
        current.textContent = V.openingLines[i].slice(0, ++n);
        if (n >= V.openingLines[i].length) { clearInterval(timer); typing = false; }
      }, 45);
    }
    function next() { if (!ready) return; if (typing) { clearInterval(timer); typing = false; current.textContent = V.openingLines[i]; } else if (++i < V.openingLines.length) show(); else finish(); }
    el.querySelector('.opening-skip').onclick = finish;
    el.querySelector('.opening-lines').onclick = next; el.querySelector('.opening-next').onclick = next;
    delay = setTimeout(function () { ready = true; show(); }, 600);
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
