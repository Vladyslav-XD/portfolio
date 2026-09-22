/* Vlad Filon — shared page chrome (theme, lang, cursor ring, reveal, mobile nav).
   Usage: VFChrome.init('mf', {nextcard:1,theme:1,ring:1,hover:1,nav:1,navred:1,reveal:1,lang:1})
   Only modules flagged 1 are activated (pages with custom versions keep their own inline code). */
(function () {
  function init(prefix, mods) {
    mods = mods || {};
    var root = document.getElementById(prefix + '-root');
    if (!root) return null;
    var api = { root: root, lang: 'en' };
    var reduced = false;
    try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) {}

    if (mods.nextcard) (function () {
      var c = document.querySelector('a[data-nextcard]');
      if (!c) return;
      var h = c.getAttribute('href') || '';
      if (!h || h.charAt(0) === '#' || /index\.html|Vlad Filon\.dc\.html/.test(h)) return;
      var sec = c.closest('section') || c;
      fetch(h, { method: 'HEAD' }).then(function (r) { if (!r.ok) sec.style.display = 'none'; }).catch(function () { sec.style.display = 'none'; });
    })();

    if (mods.theme) (function () {
      var btn = document.getElementById(prefix + '-theme'), icon = document.getElementById(prefix + '-theme-icon');
      var theme = 'light';
      try { theme = localStorage.getItem('vf-theme') || 'light'; } catch (_) {}
      var apply = function () { root.setAttribute('data-theme', theme === 'dark' ? 'dark' : ''); if (icon) icon.textContent = theme === 'dark' ? '\u2600' : '\u263E'; };
      apply();
      if (btn) btn.addEventListener('click', function () { theme = theme === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('vf-theme', theme); } catch (_) {} apply(); });
    })();

    var ring = document.getElementById(prefix + '-ring');
    if (mods.ring && ring) (function () {
      var rx = innerWidth / 2, ry = innerHeight / 2, tx = rx, ty = ry;
      addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; ring.style.opacity = '1'; });
      var loop = function () { rx += (tx - rx) * 0.25; ry += (ty - ry) * 0.25; ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)'; requestAnimationFrame(loop); };
      loop();
    })();

    if (mods.hover && ring) (function () {
      var grow = function () { ring.style.width = '40px'; ring.style.height = '40px'; ring.style.marginLeft = '-20px'; ring.style.marginTop = '-20px'; };
      var shrink = function () { ring.style.width = '12px'; ring.style.height = '12px'; ring.style.marginLeft = '-6px'; ring.style.marginTop = '-6px'; };
      root.querySelectorAll('[data-cursor],a,button').forEach(function (el) { el.addEventListener('mouseenter', grow); el.addEventListener('mouseleave', shrink); });
    })();

    if (mods.nav) (function () {
      var burger = document.getElementById(prefix + '-burger'), nav = document.getElementById(prefix + '-nav'), mobile = document.getElementById(prefix + '-mobile');
      var open = false;
      var sync = function () { var m = innerWidth < 900; if (nav) nav.style.display = m ? 'none' : 'flex'; if (burger) burger.style.display = m ? 'flex' : 'none'; if (mobile && burger) { var h = burger.closest('header'); if (h) mobile.style.top = h.offsetHeight + 'px'; } if (!m && mobile) { mobile.style.display = 'none'; open = false; } };
      sync(); addEventListener('resize', sync);
      if (burger) burger.addEventListener('click', function () { open = !open; if (mobile) mobile.style.display = open ? 'block' : 'none'; });
      if (mobile) mobile.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { open = false; mobile.style.display = 'none'; }); });
    })();

    if (mods.navred) (function () {
      root.querySelectorAll('#' + prefix + '-nav a[style*="var(--red)"]').forEach(function (el) { el.style.transition = 'filter .15s'; el.addEventListener('mouseenter', function () { el.style.filter = 'brightness(0.93)'; }); el.addEventListener('mouseleave', function () { el.style.filter = 'none'; }); });
      root.querySelectorAll('#' + prefix + '-nav a:not([style*="var(--red)"])').forEach(function (el) { el.style.transition = 'color .15s'; el.addEventListener('mouseenter', function () { el.style.color = 'var(--red)'; }); el.addEventListener('mouseleave', function () { el.style.color = ''; }); });
    })();

    if (mods.reveal) (function () {
      var reveals = Array.prototype.slice.call(root.querySelectorAll('[data-reveal]'));
      if (reduced) { reveals.forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; }); return; }
      reveals.forEach(function (el) {
        var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.hasAttribute('data-reveal'); });
        var i = sibs.indexOf(el);
        el.dataset.revealDelay = (i > 0 ? Math.min(i, 8) * 70 : 0);
        el.style.opacity = '0'; el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity .7s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1)';
      });
      var show = function (el) { if (el.dataset.revealDone) return; el.dataset.revealDone = '1'; var d = +(el.dataset.revealDelay || 0); setTimeout(function () { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, d); };
      var sweep = function () { var h = innerHeight; reveals.forEach(function (el) { if (el.dataset.revealDone) return; var r = el.getBoundingClientRect(); if (r.top < h * 0.92 && r.bottom > 0) show(el); }); };
      if ('IntersectionObserver' in window) { var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } }); }, { threshold: 0.1 }); reveals.forEach(function (el) { io.observe(el); }); }
      var bands = Array.prototype.slice.call(root.querySelectorAll('[data-band]'));
      bands.forEach(function (b) { b.style.transition = 'clip-path .9s cubic-bezier(.6,0,.2,1)'; });
      var bandSweep = function () { var h = innerHeight; bands.forEach(function (b) { if (b.dataset.bandDone) return; var r = b.getBoundingClientRect(); if (r.top < h * 0.82 && r.bottom > 0) { b.dataset.bandDone = '1'; b.style.clipPath = 'inset(0 0 0 0)'; } }); };
      if ('IntersectionObserver' in window) { var bio = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.dataset.bandDone = '1'; en.target.style.clipPath = 'inset(0 0 0 0)'; bio.unobserve(en.target); } }); }, { threshold: 0.2 }); bands.forEach(function (b) { bio.observe(b); }); }
      bandSweep(); addEventListener('scroll', bandSweep, { passive: true });
      setTimeout(function () { bands.forEach(function (b) { b.style.clipPath = 'inset(0 0 0 0)'; }); }, 1600);
      sweep(); addEventListener('scroll', sweep, { passive: true }); addEventListener('resize', sweep); setTimeout(sweep, 400);
      setTimeout(function () { reveals.forEach(function (el) { el.dataset.revealDone = '1'; el.style.transition = 'none'; el.style.opacity = '1'; el.style.transform = 'none'; }); }, 1500);
    })();

    if (mods.lang) (function () {
      var applyLang = function () {
        root.querySelectorAll('[data-en]').forEach(function (el) { var v = api.lang === 'ua' ? el.getAttribute('data-ua') : el.getAttribute('data-en'); if (v != null) el.innerHTML = v; });
        var en = document.getElementById(prefix + '-lang-en'), ua = document.getElementById(prefix + '-lang-ua');
        if (en && ua) { en.style.opacity = api.lang === 'en' ? '1' : '.4'; ua.style.opacity = api.lang === 'ua' ? '1' : '.4'; }
        try { document.documentElement.lang = api.lang; } catch (_) {}
      };
      api.applyLang = applyLang;
      root.querySelectorAll('[data-cta]').forEach(function (el) { el.addEventListener('mouseenter', function () { el.style.filter = 'brightness(0.93)'; el.style.transform = 'translateY(-1px)'; }); el.addEventListener('mouseleave', function () { el.style.filter = 'none'; el.style.transform = 'none'; }); });
      var lb = document.getElementById(prefix + '-lang');
      if (lb) lb.addEventListener('click', function () { api.lang = api.lang === 'en' ? 'ua' : 'en'; applyLang(); });
    })();

    return api;
  }
  window.VFChrome = { init: init };
})();
