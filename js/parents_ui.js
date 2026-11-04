/* Three-step family creator. Pure Family helpers own all parent generation. */
(function (G) {
  'use strict';
  var RA = G.RA = G.RA || {};
  RA.ParentsUI = { open: function (root, options) {
    var F = RA.Family, D = RA.data.parents, spec = F.preset('canon'), step = 0, rolls = 0;
    var child = { given: RA.C.HERO_NAME, gender: 'm', nameEnding: 'none', seed: RA.RNG.randomSeedString() };
    var esc = options.esc;
    function rerollSeed() { return child.seed + '|edit|' + (++rolls); }
    function field(label, path, values, value, parent) {
      var id = 'family-' + (parent == null ? 'house' : parent) + '-' + path.replace(/\./g, '-');
      return '<div class="v2-field"><label for="' + id + '">' + esc(label) + '</label><div class="v2-field-row"><select id="' + id + '" data-path="' + path + '"' + (parent == null ? '' : ' data-parent="' + parent + '"') + '>' + values.map(function (v) { return '<option value="' + esc(v.id) + '"' + (String(v.id) === String(value) ? ' selected' : '') + '>' + esc(v.name) + '</option>'; }).join('') + '</select>' + (parent == null ? '' : '<button class="btn" data-roll-field="' + path + '" data-parent="' + parent + '" aria-label="' + (parent ? '어머니 ' : '아버지 ') + esc(label) + '만 무작위로 바꾸기">' + esc(label) + '만 🎲</button>') + '</div></div>';
    }
    function parent(p, i) {
      var who = i ? '어머니' : '아버지', countries = Object.keys(RA.data.countries).map(function (id) { return { id: id, name: RA.data.countries[id].name }; });
      return '<article class="v2-parent"><div class="row"><h2>' + who + '</h2><button class="btn" data-roll-parent="' + i + '">' + who + ' 전체 무작위</button></div>' +
        field('국적', 'nationality', countries, p.nationality, i) + field('직업', 'jobId', D.jobs, p.jobId, i) +
        '<details><summary>재능과 성격 조절하기</summary><p>재능은 최대 2개 · 0 없음, 1 약함, 2 보통, 3 강함</p>' +
        ['talents', 'bright', 'dark'].map(function (group) {
          return '<h3>' + ({ talents: '재능', bright: '밝은 면', dark: '어두운 면' })[group] + '</h3>' +
            D[group].map(function (t) {
              var level = p[group][t.id] || 0;
              return field(t.name, group + '.' + t.id, [0, 1, 2, 3].map(function (n) { return { id: n, name: n + (t.levels ? ' · ' + t.levels[n] : '') }; }), level, i) + (t.levels ? '<p class="hint">' + esc(t.levels[level]) + '</p>' : '');
            }).join('');
        }).join('') + '</details></article>';
    }
    function normalizeResidence() {
      var ns = spec.parents.map(function (p) { return p.nationality; });
      if (ns.indexOf(spec.residence) < 0 || ns[0] === ns[1]) spec.residence = ns[0];
    }
    function tierWord() { return ['매우 빠듯함', '빠듯함', '보통', '넉넉함', '매우 넉넉함'][Math.max(0, Math.min(4, F.tier(spec) - 1))]; }
    function previewLines() {
      var lines = { opportunity: [], pressure: [], unknown: F.preview(spec).unknown };
      spec.parents.forEach(function (p, i) {
        var who = i ? '어머니' : '아버지', job = D.jobs.find(function (j) { return j.id === p.jobId; });
        if (job && job.exposure.length) lines.opportunity.push(job.exposure.map(function (id) { var t = D.talents.find(function (x) { return x.id === id; }); return t ? t.name : id === 'football' ? '축구' : '의료'; }).join('·') + '를 배울 기회 — ' + who + '의 직업: ' + job.name);
        D.bright.forEach(function (t) { var level = p.bright[t.id] || 0; if (level >= 2) lines.opportunity.push(t.levels[level] + ' — ' + who + '의 ' + t.name + ': ' + ['없음', '약함', '보통', '강함'][level] + '(' + level + '/3)'); });
        D.dark.forEach(function (t) { var level = p.dark[t.id] || 0; if (level) lines.pressure.push(t.levels[level] + ' — ' + who + '의 ' + t.name + ': ' + ['없음', '가끔', '잦음', '매우 잦음'][level] + '(' + level + '/3)'); });
      });
      lines.pressure.push('돈과 시간을 함께 고민해요 — 형편: ' + tierWord());
      return lines;
    }
    function draw() {
      normalizeResidence();
      var open = Array.prototype.map.call(root.querySelectorAll('details'), function (d) { return d.open; }), scroll = G.scrollY;
      var preview = previewLines(), ns = spec.parents.map(function (p) { return p.nationality; });
      root.innerHTML = '<div class="v2-creator"><h1>태어날 집 고르기</h1><nav class="v2-steps" aria-label="설정 단계">' + ['부모', '집과 아이', '미리보기'].map(function (name, i) { return '<button class="btn ' + (i === step ? 'btn-gold' : '') + '" data-step="' + i + '">' + (i + 1) + ' ' + name + '</button>'; }).join('') + '</nav><div class="v2-setup-content">' +
        (step === 0 ? '<div class="v2-presets"><button class="btn" data-preset="canon">호날두 이야기 기반</button><button class="btn" data-preset="random">🎲 무작위</button><button class="btn" data-preset="custom">직접 만들기</button></div><p class="hint">호날두 가족의 공개된 이야기에서 영감을 받은 허구 설정</p><p class="hint">아래로 내려 어머니 설정도 확인하세요 ↓</p>' + spec.parents.map(parent).join('') :
          step === 1 ? '<h2>우리 집과 아이</h2><p>' + (ns[0] === ns[1] ? '부모 국적이 같아 사는 나라가 고정돼요.' : '부모 국적이 달라요. 두 나라 중 사는 곳을 골라요.') + '</p>' +
            field('사는 나라', 'residence', ns.filter(function (n, i) { return ns.indexOf(n) === i; }).map(function (id) { return { id: id, name: RA.data.countries[id].name }; }), spec.residence) +
            field('형제자매 수 · 나를 제외', 'siblings', [0, 1, 2, 3].map(function (n) { return { id: n, name: n + '명' }; }), spec.siblings) +
            '<p>형편: ' + tierWord() + ' · 두 부모의 직업으로 계산돼요.</p><label class="v2-field">아이 이름<input id="family-given" maxlength="20" value="' + esc(child.given) + '"></label>' +
            field('성별', 'gender', [{ id: 'm', name: '남자' }, { id: 'f', name: '여자' }], child.gender) + field('이름의 마지막 소리', 'nameEnding', [{ id: 'none', name: '받침 없음' }, { id: 'rieul', name: 'ㄹ 받침' }, { id: 'other', name: '다른 받침' }], child.nameEnding) +
            '<details><summary>시드 · 같은 설정으로 다시 시작</summary><label class="v2-field">시드<input id="family-seed" value="' + esc(child.seed) + '"></label></details>' :
            '<h2>이 집에서 태어나면</h2>' + ['opportunity', 'pressure', 'unknown'].map(function (k) { return '<h3>' + ({ opportunity: '기회', pressure: '압박', unknown: '아직 모르는 것' })[k] + '</h3><ul>' + preview[k].slice(0, k === 'unknown' ? 1 : 3).map(function (line) { return '<li>' + esc(line) + '</li>'; }).join('') + '</ul>'; }).join('')) +
        '</div><footer class="v2-birth-dock">' + (step < 2 ? '<button class="btn btn-gold" data-step="' + (step + 1) + '">다음 · ' + (step === 0 ? '집과 아이' : '미리보기') + '</button><button class="btn" id="family-birth">현재 설정으로 바로 시작</button><small>바꾸지 않은 항목은 지금 보이는 값을 유지해요.</small>' : '<button class="btn btn-gold" id="family-birth">이 집에서 태어나기 ▶</button>') + '</footer></div>';
      Array.prototype.forEach.call(root.querySelectorAll('details'), function (d, i) { d.open = !!open[i]; });
      if (step === 1 && ns[0] === ns[1]) root.querySelector('[data-path="residence"]').disabled = true;
      root.querySelector('#family-birth').onclick = function () { options.birth(Object.assign({}, spec, child)); };
      root.querySelectorAll('[data-step]').forEach(function (b) { b.onclick = function () { step = +b.dataset.step; draw(); G.scrollTo(0, 0); }; });
      root.querySelectorAll('[data-preset]').forEach(function (b) { b.onclick = function () { if (b.dataset.preset === 'custom') spec.preset = 'custom'; else spec = b.dataset.preset === 'random' ? F.randomParents(rerollSeed()) : F.preset('canon'); draw(); }; });
      root.querySelectorAll('[data-roll-parent]').forEach(function (b) { b.onclick = function () { spec = F.rerollParent(spec, +b.dataset.rollParent, rerollSeed()); draw(); }; });
      root.querySelectorAll('[data-roll-field]').forEach(function (b) { b.onclick = function () { spec = F.rerollField(spec, +b.dataset.parent, b.dataset.rollField, rerollSeed()); trimTalents(spec.parents[+b.dataset.parent], b.dataset.rollField); draw(); }; });
      root.querySelectorAll('select[data-path]').forEach(function (el) { el.onchange = function () {
        var parts = el.dataset.path.split('.'), p = el.dataset.parent == null ? spec : spec.parents[+el.dataset.parent];
        if (el.dataset.path === 'gender' || el.dataset.path === 'nameEnding') child[el.dataset.path] = el.value;
        else if (parts.length === 2) { p[parts[0]][parts[1]] = +el.value; trimTalents(p, el.dataset.path); spec.preset = 'custom'; }
        else { p[parts[0]] = parts[0] === 'siblings' ? +el.value : el.value; if (el.dataset.parent != null) spec.preset = 'custom'; }
        draw();
      }; });
      ['given', 'seed'].forEach(function (k) { var input = root.querySelector('#family-' + k); if (input) input.oninput = function () { child[k] = input.value; }; });
      G.scrollTo(0, scroll);
    }
    function trimTalents(p, fieldPath) {
      var active = Object.keys(p.talents).filter(function (k) { return p.talents[k] > 0; });
      if (active.length > 2) { p.talents[fieldPath.split('.')[1]] = 0; options.notify('재능은 최대 두 개예요. 기존 재능 하나를 0으로 바꾸고 골라 주세요.'); }
    }
    draw();
  } };
})(typeof globalThis !== 'undefined' ? globalThis : this);
