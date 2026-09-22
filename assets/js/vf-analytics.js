/* Vlad Filon — analytics.
   Microsoft Clarity (page views, countries, devices, referrers, session replay, heatmaps)
   + Vercel Web Analytics if the site happens to be hosted on Vercel + optional GA4.
   Hosting-agnostic: Clarity alone covers everything, on any host.

   SETUP — paste your Clarity Project ID below. Empty = nothing loads.
   Never runs on localhost, file://, IP addresses or inside the design tool.

   Public API: window.vfTrack('event_name', { key: 'value' })
*/
(function () {
  var CFG = {
    CLARITY_ID: 'y1t5p0bp2z',                                   // clarity.microsoft.com → Settings → Project ID (e.g. 'sb1x9k2abc')
    GA4_ID: '',                                       // 'G-XXXXXXXXXX' — leave empty (GA4 needs a cookie banner in the EU)
    VERCEL: true                                      // opportunistic: loads only on *.vercel.app, or silently fails elsewhere
  };

  var host = location.hostname || '';
  /* A real, public deployment: has a dot, is not a local name, not an IP, not the design tool. */
  var live = /\./.test(host)
    && !/^(localhost|127\.|0\.0\.0\.0|\[?::1)/.test(host)
    && !/\.local$|^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(host)
    && !/^\d+\.\d+\.\d+\.\d+$/.test(host)
    && location.protocol !== 'file:';
  try { if (window.top !== window.self) live = false; } catch (_) { live = false; }  /* embedded preview */

  if (!live) {
    window.vfTrack = function (name, data) { try { console.debug('[vfTrack:offline]', name, data || {}); } catch (_) {} };
    return;
  }

  function load(src, attrs) {
    var s = document.createElement('script');
    s.async = true; s.src = src;
    if (attrs) Object.keys(attrs).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    (document.head || document.documentElement).appendChild(s);
    return s;
  }

  /* ---------- providers ---------- */
  /* Vercel Web Analytics — a bonus if the site is on Vercel; a silent 404 anywhere else. */
  if (CFG.VERCEL) {
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    var v = load('/_vercel/insights/script.js', { defer: 'true' });
    v.onerror = function () { window.va = null; };
  }

  if (CFG.CLARITY_ID) {
    window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    load('https://www.clarity.ms/tag/' + CFG.CLARITY_ID);
  }

  if (CFG.GA4_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', CFG.GA4_ID, { anonymize_ip: true });
    load('https://www.googletagmanager.com/gtag/js?id=' + CFG.GA4_ID);
  }

  /* ---------- unified event sender ---------- */
  function track(name, data) {
    data = data || {};
    try { if (window.va) window.va('event', { name: name, data: data }); } catch (_) {}
    try { if (window.clarity) window.clarity('event', name); } catch (_) {}
    try { if (window.gtag && CFG.GA4_ID) window.gtag('event', name, data); } catch (_) {}
  }
  window.vfTrack = track;

  /* Clarity segmentation tags — lets you filter recordings by page / theme / language */
  function tag(k, v) { try { if (window.clarity && v != null) window.clarity('set', k, String(v)); } catch (_) {} }
  var page = (location.pathname.replace(/^\//, '').replace(/\.html$/, '') || 'home');
  tag('page', page);

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var root = document.querySelector('[id$="-root"]');
    tag('theme', (root && root.getAttribute('data-theme')) === 'dark' ? 'dark' : 'light');
    tag('lang', document.documentElement.lang || 'en');

    var once = {};
    function first(key) { if (once[key]) return false; once[key] = 1; return true; }
    function label(el) {
      if (!el) return '';
      var t = el.getAttribute('data-en') || el.textContent || '';
      return t.trim().replace(/\s+/g, ' ').slice(0, 60);
    }

    /* ---------- clicks (capture, so it fires even when a handler stops propagation) ---------- */
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var hit;

      /* work rows → which case a visitor opens */
      if ((hit = t.closest('[data-work]'))) {
        var title = hit.querySelector('div div') || hit.querySelector('div');
        track('work_open', { project: label(title) || hit.getAttribute('href') || '?', clickable: hit.hasAttribute('data-clickable') ? 1 : 0 });
      }

      /* contact funnel */
      if (t.closest('[data-open-talk]')) track('talk_open', { page: page });
      if (t.closest('#vf-next')) track('talk_step2');
      if (t.closest('#vf-send')) track('talk_send');
      if (t.closest('#vf-privacy-open')) track('privacy_open');

      /* hero + work list interactions */
      if (t.closest('#vf-reset')) track('hero_restore');
      if (t.closest('#vf-showall')) track('work_show_all');

      /* Not Art lightbox */
      if ((hit = t.closest('[data-art]'))) track('art_open', { painting: hit.getAttribute('data-title-en') || hit.getAttribute('data-art') });

      /* theme / language */
      if ((hit = t.closest('[id$="-theme"]'))) setTimeout(function () {
        var r = document.querySelector('[id$="-root"]');
        var to = (r && r.getAttribute('data-theme')) === 'dark' ? 'dark' : 'light';
        tag('theme', to); track('theme_toggle', { to: to });
      }, 30);
      if (t.closest('[id$="-lang"]')) setTimeout(function () {
        var to = document.documentElement.lang || 'en';
        tag('lang', to); track('lang_toggle', { to: to });
      }, 30);

      /* CV, contact pills, outbound */
      var a = t.closest('a');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (a.hasAttribute('download') || /\.pdf($|\?)/i.test(href)) { track('cv_download', { file: href }); return; }
      if (/^mailto:/i.test(href)) { track('contact_click', { channel: 'email' }); return; }
      if (/wa\.me|whatsapp/i.test(href)) { track('contact_click', { channel: 'whatsapp' }); return; }
      if (/linkedin\.com/i.test(href)) { track('contact_click', { channel: 'linkedin' }); return; }
      if (/github\.com/i.test(href)) { track('contact_click', { channel: 'github' }); return; }
      if (/^https?:/i.test(href) && href.indexOf(host) === -1) track('outbound_click', { url: href.slice(0, 120) });
    }, true);

    /* ---------- work rows: which project holds attention (600ms dwell, once per row) ---------- */
    var hoverT = null;
    document.addEventListener('mouseover', function (e) {
      if (!e.target || !e.target.closest) return;
      var row = e.target.closest('[data-work]');
      if (!row) return;
      clearTimeout(hoverT);
      hoverT = setTimeout(function () {
        var title = row.querySelector('div div') || row.querySelector('div');
        var name = label(title) || '?';
        if (first('h:' + name)) track('work_hover', { project: name });
      }, 600);
    }, true);
    document.addEventListener('mouseout', function (e) {
      if (e.target && e.target.closest && e.target.closest('[data-work]')) clearTimeout(hoverT);
    }, true);

    /* ---------- hero: did they actually move the blocks? (once per page view) ---------- */
    document.addEventListener('pointerup', function (e) {
      if (!e.target || !e.target.closest) return;
      if (e.target.closest('[data-block]') && first('hero')) track('hero_arrange', { page: page });
    }, true);

    /* ---------- scroll depth + read-through ---------- */
    var marks = [25, 50, 75, 90];
    function depth() {
      var h = document.documentElement;
      var max = Math.max(h.scrollHeight, document.body.scrollHeight) - innerHeight;
      if (max < 200) return;
      var pct = Math.min(100, Math.round((h.scrollTop || window.scrollY) / max * 100));
      marks.forEach(function (m) {
        if (pct >= m && first('d' + m)) {
          if (m === 90) track('read_complete', { page: page });
          else track('scroll_depth', { percent: m, page: page });
        }
      });
    }
    addEventListener('scroll', depth, { passive: true });
    depth();

    /* ---------- engaged visit: 45s with the tab visible ---------- */
    var seen = 0, tick = setInterval(function () {
      if (document.visibilityState !== 'visible') return;
      seen += 5;
      if (seen >= 45) { clearInterval(tick); track('engaged_45s', { page: page }); }
    }, 5000);
  });
})();
