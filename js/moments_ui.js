/* Persistent moments are displayed one at a time and acknowledged only on dismissal. */
(function (G) {
  'use strict';
  var RA = G.RA = G.RA || {};
  // "이런 쓸데 없는 게 너무 많네 스킵 좀 가능하게해": once the player turns the full-screen moments off, every moment
  // becomes a short banner (still written to the 연대기). Kept in localStorage, across lives.
  var SKIP_KEY = 'ra.skipMoments';
  var skipAll = function () { try { return G.localStorage.getItem(SKIP_KEY) === '1'; } catch (e) { return false; } };
  RA.MomentsUI = {
    skipAll: skipAll,
    setSkipAll: function (on) { try { if (on) G.localStorage.setItem(SKIP_KEY, '1'); else G.localStorage.removeItem(SKIP_KEY); } catch (e) { /* storage blocked: this life only */ } },
    show: function (ctx) {
      var s = ctx.state, moment = RA.Engine.pendingMoments(s)[0]; if (!moment) return false;
      while (moment && (moment.tier !== 'S' || skipAll())) {
        var banner = G.document.createElement('aside');
        banner.className = 'v2-moment-banner'; banner.setAttribute('role', 'status');
        banner.textContent = moment.title + ' · ' + (moment.sub || '');
        G.document.querySelector('#fx-root').appendChild(banner);
        RA.Engine.ackMoment(s, moment.id); ctx.save();
        setTimeout(function (shown) { return function () { shown.remove(); }; }(banner), 4500);
        moment = RA.Engine.pendingMoments(s)[0];
      }
      if (!moment) return false;
      if (moment.tier === 'S') ctx.pause();
      var doc = G.document, esc = ctx.esc, sad = moment.tone === 'sad', football = moment.tone === 'triumph' && /pro|goal|transfer|national|trophy|ballon|worldcup/.test(moment.kind);
      doc.querySelectorAll('.age-flash').forEach(function (el) { el.remove(); });
      doc.querySelector('#toast-root').innerHTML = '';
      var el = doc.createElement('section'); el.className = 'v2-moment tier-' + moment.tier + ' tone-' + moment.tone;
      el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', moment.title);
      el.innerHTML = '<div class="v2-moment-inner"><p class="muted">' + moment.age + '살 · ' + moment.year + '년</p><div class="v2-moment-scene"><canvas class="px" width="160" height="96" role="img" aria-label="' + esc(moment.title) + '"></canvas>' + (football ? '<strong class="v2-siuu">SIUUU!</strong>' : '') + (!sad && moment.tone === 'triumph' && !RA.V2.reduced() ? '<div class="v2-confetti" aria-hidden="true">▪　▪　▪　▪　▪</div>' : '') + '</div><h1>' + esc(moment.title) + '</h1><p>' + esc(moment.sub) + '</p><p class="hint">' + (moment.tier === 'B' ? '작은 순간도 기억해요.' : '연대기에 이 순간을 남겨요.') + '</p><button class="btn btn-gold">계속하기</button><button class="btn btn-ghost v2-skip">이런 화면 앞으로 건너뛰기 (연대기에는 남아요)</button></div>';
      doc.querySelector('#fx-root').appendChild(el);
      var canvas = el.querySelector('canvas');
      if (moment.kind === 'birth') RA.Pixel.drawMilestone(canvas.getContext('2d'), 'birth', 0, RA.data.countries[s.country], ctx.look());
      else RA.Pixel.drawPortrait(canvas, ctx.look(), sad ? 'grave' : football ? 'pitch' : moment.scene || 'home', RA.data.countries[s.country], 0);
      if (football) { if (!RA.Audio.siuu()) RA.Audio.play('goal'); }
      else RA.Audio.play(sad ? 'sorrow' : moment.sfx || (moment.tone === 'triumph' ? 'trophy' : 'good'));
      var done = function () { RA.Engine.ackMoment(s, moment.id); ctx.save(); el.remove(); ctx.resume(); };
      el.querySelector('.btn-gold').onclick = done;
      el.querySelector('.v2-skip').onclick = function () { RA.MomentsUI.setSkipAll(true); done(); };
      // a tap anywhere outside the buttons also continues (the dialog is the whole screen)
      el.onclick = function (ev) { if (!ev.target.closest('button')) done(); };
      el.querySelector('.btn-gold').focus(); return true;
    },
    chronicle: function (root, state, esc) {
      root.innerHTML = '<h2>연대기</h2>' + ((state.chronicle || []).map(function (m) { return '<article class="v2-memory"><p class="hint">' + m.age + '살 · ' + m.year + '년</p><h3>' + esc(m.title) + '</h3><p>' + esc(m.sub) + '</p></article>'; }).join('') || '<p>아직 기록된 큰 순간이 없어요. 내 이야기는 이제 시작이에요.</p>');
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
