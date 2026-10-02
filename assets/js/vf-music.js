/* Vlad Filon — header music toggle (direction 1a). Spec: Music Toggle.dc.html */
(function () {
  if (window.__vfMusic) return; window.__vfMusic = 1;
  var TRACK = 'assets/audio/vf-theme.mp3';   // MP3 192 kbps, loops from the track's loop point; see CHANGELOG
  var VOL = 0.4;
  var S = { en: { off: 'Music', on: 'Music on', resume: 'Tap to play', play: 'Play' },
            ua: { off: 'Музика', on: 'Музика грає', resume: 'Натисни, щоб грала', play: 'Грати' } };
  var C = ['#E1251B', '#1E3FCF', '#F2C200'], P = [0.9, 1.15, 0.75], F = [0, 1.9, 3.7], FZ = [0.55, 1, 0.75], TAU = Math.PI * 2;
  var state = 'off', amp = 0, last = 0, audio = null, btns = [], fr = 0, healT = 0;
  var mqR = window.matchMedia('(prefers-reduced-motion: reduce)'), mqN = window.matchMedia('(max-width: 639px)');
  function lang() { return document.documentElement.getAttribute('lang') === 'ua' ? 'ua' : 'en'; }
  function store(v) { try { localStorage.setItem('vf-music', v); } catch (e) {} }
  function expected(b) { var L = S[lang()], narrow = b.hasAttribute('data-mt-mobile') && mqN.matches; return narrow ? (state === 'resume' ? L.play : '') : L[state]; }
  function bind(b) { if (b._vfMt) return; b._vfMt = 1; b.addEventListener('click', function () { if (state === 'on') stop(); else play(); }); }
  function heal() {
    var now = [].slice.call(document.querySelectorAll('[data-mt]'));
    var swapped = now.length !== btns.length || now.some(function (b, i) { return b !== btns[i]; });
    if (swapped) { btns = now; btns.forEach(bind); }
    var bad = swapped || btns.some(function (b) {
      var inner = b.querySelector('[data-mt-text]'), box = b.querySelector('[data-mt-label]');
      if (!inner || !box) return false;
      var txt = expected(b);
      return inner.textContent !== txt || (txt && box.style.width === '0px') || b.getAttribute('aria-pressed') !== (state === 'off' ? 'false' : 'true');
    });
    if (bad) render(true);
  }
  function render(instant) {
    var L = S[lang()];
    btns.forEach(function (b) {
      var narrow = b.hasAttribute('data-mt-mobile') && mqN.matches;
      var txt = narrow ? (state === 'resume' ? L.play : '') : L[state];
      var box = b.querySelector('[data-mt-label]'), inner = b.querySelector('[data-mt-text]');
      if (!box || !inner) return;
      if (inner.textContent !== txt) inner.textContent = txt;
      inner.style.paddingRight = txt ? (narrow ? '8px' : '10px') : '0';
      if (instant) box.style.transition = 'none';
      box.style.width = (txt ? inner.offsetWidth : 0) + 'px';
      if (instant) { void box.offsetWidth; box.style.transition = ''; }
      b.setAttribute('aria-pressed', state === 'off' ? 'false' : 'true');
      if (narrow) b.setAttribute('aria-label', L[state]); else b.removeAttribute('aria-label');
      b.querySelectorAll('[data-mt-bar]').forEach(function (el, i) { el.style.background = state === 'off' ? 'currentColor' : C[i]; });
    });
  }
  function wave(i, t) { return 0.30 * Math.sin(TAU * t / P[i] + F[i]) + 0.13 * Math.sin(TAU * t / (0.53 * P[i]) + 1.7 * F[i]); }
  function loop(now) {
    requestAnimationFrame(loop);
    var dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (now - healT > 300) { healT = now; heal(); }
    var rm = mqR.matches, target = state === 'on' && !rm ? 1 : 0;
    amp = rm ? target : target + (amp - target) * Math.exp(-dt / 0.12);
    btns.forEach(function (b) {
      b.querySelectorAll('[data-mt-bar]').forEach(function (el, i) {
        var s = rm ? (state === 'on' ? FZ[i] : 0.57) : 0.57 + amp * wave(i, now / 1000);
        el.style.transform = 'scaleY(' + s.toFixed(3) + ')';
      });
    });
  }
  function fade(to, ms, done) {
    if (!audio) { if (done) done(); return; }
    cancelAnimationFrame(fr);
    var from = audio.volume, t0 = performance.now();
    (function step(n) { var k = Math.min(1, (n - t0) / ms); try { audio.volume = from + (to - from) * k; } catch (e) {} if (k < 1) fr = requestAnimationFrame(step); else if (done) done(); })(t0);
  }
  function play() {
    state = 'on'; store('on'); render();
    if (!TRACK) return;
    if (!audio) {
      audio = new Audio(TRACK); audio.loop = true; audio.preload = 'none';
      try { var pos = parseFloat(sessionStorage.getItem('vf-music-pos')); if (pos > 0) audio.currentTime = pos; } catch (e) {}
    }
    audio.volume = 0;
    var p = audio.play();
    if (p && p.then) p.then(function () { fade(VOL, mqR.matches ? 1 : 400); }).catch(function () { state = 'resume'; render(); });
  }
  function stop() { state = 'off'; store('off'); render(); if (audio) fade(0, mqR.matches ? 1 : 300, function () { audio.pause(); }); }
  var CSS = '#vf-music-dcell{display:flex !important}'
    + '@media (max-width:899px){#vf-music-mcell{display:flex !important}}'
    + '[data-mt]:hover{background:var(--paper) !important}'
    + '[data-mt]:active{background:var(--ink) !important;color:var(--paper) !important;transition:none !important}'
    + '[data-mt]:focus-visible{outline:3px solid #1E3FCF;outline-offset:2px}'
    + '@media (prefers-reduced-motion: reduce){[data-mt],[data-mt] *{transition-duration:1ms !important}}';
  function boot() {
    btns = [].slice.call(document.querySelectorAll('[data-mt]'));
    if (!btns.length) { setTimeout(boot, 60); return; }
    var st = document.createElement('style'); st.id = 'vf-music-css'; st.textContent = CSS; document.head.appendChild(st);
    btns.forEach(bind);
    var saved = 'off'; try { saved = localStorage.getItem('vf-music') || 'off'; } catch (e) {}
    render(true);
    if (saved === 'on') { if (TRACK) play(); else { state = 'on'; render(true); } }
    new MutationObserver(function () { render(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    (mqN.addEventListener ? mqN.addEventListener('change', function () { render(true); }) : mqN.addListener(function () { render(true); }));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { render(true); });
    window.addEventListener('pagehide', function () { if (audio) try { sessionStorage.setItem('vf-music-pos', String(audio.currentTime)); } catch (e) {} });
    last = performance.now(); requestAnimationFrame(loop);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
