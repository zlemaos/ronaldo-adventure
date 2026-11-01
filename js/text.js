/* Text helpers: token substitution with Korean particle selection, money formatting. */
(function (G) {
  var RA = G.RA = G.RA || {};

  // Does the last Hangul syllable have a final consonant (batchim)?
  function lastInfo(word) {
    word = String(word || '').replace(/[\s\)\]"'’”.!?·]+$/, '');
    var ch = word.charCodeAt(word.length - 1);
    if (ch >= 0xAC00 && ch <= 0xD7A3) {
      var jong = (ch - 0xAC00) % 28;
      return { batchim: jong !== 0, rieul: jong === 8 };
    }
    // digits / latin: rough reading
    var last = word.slice(-1);
    if (/[0-9]/.test(last)) return { batchim: '013678'.indexOf(last) >= 0, rieul: '178'.indexOf(last) >= 0 };
    if (/[a-zA-Z]/.test(last)) return { batchim: /[lmnr]/i.test(last), rieul: /[lr]/i.test(last) };
    return { batchim: false, rieul: false };
  }

  function particle(word, p) {
    var i = lastInfo(word);
    switch (p) {
      case '이/가': return i.batchim ? '이' : '가';
      case '은/는': return i.batchim ? '은' : '는';
      case '을/를': return i.batchim ? '을' : '를';
      case '과/와': return i.batchim ? '과' : '와';
      case '으로/로': return (i.batchim && !i.rieul) ? '으로' : '로';
      case '아/야': return i.batchim ? '아' : '야';
      case '이/': return i.batchim ? '이' : '';
    }
    return '';
  }

  // Replace {token}[x/y] patterns. `vars` maps token -> string.
  function render(text, vars) {
    if (!text) return '';
    return String(text).replace(/\{([a-zA-Z0-9]+)\}(\[(이\/가|은\/는|을\/를|과\/와|으로\/로|아\/야|이\/)\])?/g, function (m, key, _p, part) {
      var v = vars && vars[key] != null ? String(vars[key]) : key;
      return part ? v + particle(v, part) : v;
    });
  }

  // Resolve fallback particles written as 을(를), (으)로, (이)가, 와(과), (이) after a word.
  // Closing quotes, brackets and similar punctuation between the word and the particle are skipped
  // when looking for the last syllable: '"장례지도사"(으)로' → '"장례지도사"로'.
  var JOSA_RE = /([가-힣A-Za-z0-9])(["'”’」』》〉)\]]*)(을\(를\)|를\(을\)|\(으\)로|\(이\)가|와\(과\)|과\(와\)|\(이\)|\(아\)야|은\(는\)|는\(은\))/g;
  var JOSA_MAP = { '을(를)': '을/를', '를(을)': '을/를', '(으)로': '으로/로', '(이)가': '이/가', '와(과)': '과/와', '과(와)': '과/와', '(이)': '이/', '(아)야': '아/야', '은(는)': '은/는', '는(은)': '은/는' };
  function fixJosa(text) {
    if (!text) return text;
    return String(text).replace(JOSA_RE, function (m, ch, close, j) { return ch + close + particle(ch, JOSA_MAP[j]); });
  }
  // Leftover particle markers that should never reach the player
  var LEFTOVER_RE = /\(으\)로|\(이\)가|와\(과\)|과\(와\)|을\(를\)|를\(을\)|은\(는\)|는\(은\)/;
  function hasLeftoverJosa(text) { return LEFTOVER_RE.test(String(text || '')); }

  function joinNames(list) { return list.join(', '); }
  function countWord(n) { return ['아무도', '혼자', '둘', '셋', '넷', '다섯', '여섯', '일곱'][n] || String(n) + '명'; }

  function groupDigits(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // Format a reference-unit amount (already wage-scaled internal money) in local currency.
  function money(amount, country) {
    var cur = (country && country.currency) || { unit: '달러', symbol: '$', rate: 1 };
    var v = amount * cur.rate;
    var neg = v < 0; v = Math.abs(v);
    // Korean reading units: 만 / 억 / 조
    var s;
    if (v >= 1e12) s = (v / 1e12).toFixed(1).replace(/\.0$/, '') + '조';
    else if (v >= 1e8) s = (v / 1e8).toFixed(1).replace(/\.0$/, '') + '억';
    else if (v >= 1e4) s = groupDigits(v / 1e4) + '만';
    else s = groupDigits(v);
    return (neg ? '-' : '') + s + ' ' + cur.unit;
  }

  RA.Text = { render: render, particle: particle, fixJosa: fixJosa, hasLeftoverJosa: hasLeftoverJosa, joinNames: joinNames, countWord: countWord, money: money, groupDigits: groupDigits };
})(typeof globalThis !== 'undefined' ? globalThis : this);
