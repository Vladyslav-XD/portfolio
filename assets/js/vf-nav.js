/* Vlad Filon — soft navigation.
   Internal links swap the page in place (fetch + remount through the design-code runtime),
   so the window, and the header music, keep running. Load it in <head> BEFORE support.js.
   Anything unexpected falls back to a normal navigation. */
(function () {
  if (window.__vfNav) return; window.__vfNav = 1;

  /* ---------- 1. React roots: remember every root the runtime mounts, so it can be unmounted ---------- */
  var roots = [];
  function wrapRD(rd) {
    if (!rd || rd.__vfWrapped || typeof rd.createRoot !== 'function') return rd;
    var orig = rd.createRoot;
    rd.createRoot = function (el, opts) { var r = orig.call(rd, el, opts); roots.push(r); return r; };
    rd.__vfWrapped = 1;
    return rd;
  }
  function trap(name, onSet) {                 // wrap a global the moment it is set, and again when read
    if (window[name] !== undefined) { window[name] = onSet(window[name]) || window[name]; return; }
    var val;
    try {
      Object.defineProperty(window, name, { configurable: true, enumerable: true,
        get: function () { return val === undefined ? val : (onSet(val) || val); },
        set: function (v) { val = (v === undefined ? v : (onSet(v) || v)); } });
    } catch (e) {}
  }
  trap('ReactDOM', wrapRD);

  /* ---------- 2. Page-scoped side effects: listeners, intervals, helmet styles ---------- */
  var inMount = false;                       // true while a page's componentDidMount runs
  var pageListeners = [], pageIntervals = [];
  var SHARED = /vf-music\.js|vf-nav\.js|vf-analytics\.js|clarity|_vercel|insights|image-slot\.js|react/;
  var PAGE = /vf-shared\.js|eval at|> eval|> Function|eval code/;
  function pageScoped() {
    var st = ''; try { st = String(new Error().stack || ''); } catch (e) {}
    if (PAGE.test(st)) return true;
    return inMount && !SHARED.test(st);
  }
  function patch(target) {
    var add = target.addEventListener;
    target.addEventListener = function (type, fn, opts) {
      if (fn && pageScoped()) pageListeners.push({ t: target, type: type, fn: fn, opts: opts });
      return add.call(this, type, fn, opts);
    };
  }
  patch(window); patch(document);
  var setInt = window.setInterval;
  window.setInterval = function () { var id = setInt.apply(window, arguments); if (pageScoped()) pageIntervals.push(id); return id; };

  // bracket the mounted page's logic class, so listeners it adds in componentDidMount are page-scoped
  function wrapLogic() {
    try {
      var name = window.__dcRootName && window.__dcRootName();
      var entry = name && window.__dcRegistry && window.__dcRegistry[name];
      var L = entry && entry.Logic;
      if (L && L.prototype && !L.prototype.__vfWrapped) {
        var cdm = L.prototype.componentDidMount;
        if (typeof cdm === 'function') L.prototype.componentDidMount = function () {
          inMount = true; try { return cdm.apply(this, arguments); } finally { inMount = false; }
        };
        L.prototype.__vfWrapped = 1;
      }
    } catch (e) {}
  }
  trap('__dcBoot', function (orig) {
    if (typeof orig !== 'function' || orig.__vfWrapped) return orig;
    var wrapped = function () { var r = orig.apply(this, arguments); wrapLogic(); return r; };
    wrapped.__vfWrapped = 1;
    return wrapped;
  });
  // the first page boots through the runtime's own reference, so try to wrap it right after boot
  document.addEventListener('DOMContentLoaded', function () { wrapLogic(); setTimeout(wrapLogic, 0); });

  window.__vfNavDebug = function () { return { listeners: pageListeners.length, intervals: pageIntervals.length, roots: roots.length, page: page, styles: styleOwner.size }; };

  function cleanupPage() {
    pageListeners.forEach(function (l) { try { l.t.removeEventListener(l.type, l.fn, l.opts); } catch (e) {} });
    pageListeners = [];
    pageIntervals.forEach(function (id) { try { clearInterval(id); } catch (e) {} });
    pageIntervals = [];
    roots.forEach(function (r) { try { r.unmount(); } catch (e) {} });
    roots = [];
  }

  // The runtime appends each page's <helmet> <style> blocks to <head> and never removes them.
  // Remember which page a block belongs to and disable the blocks of pages that are not shown.
  var page = null;
  var styleOwner = new Map();                // <style> -> page key
  var pageStyleTexts = {};                   // page key -> Set of style texts
  function rememberStyleTexts(key, doc) {
    var set = new Set();
    [].forEach.call(doc.querySelectorAll('x-dc helmet style'), function (s) { set.add(s.textContent); });
    pageStyleTexts[key] = set;
  }
  function tagStyles(key) {
    var texts = pageStyleTexts[key]; if (!texts || !texts.size) return;
    [].forEach.call(document.head.querySelectorAll('style'), function (st) {
      if (!styleOwner.has(st) && texts.has(st.textContent)) styleOwner.set(st, key);
    });
  }
  function switchStyles(key) { styleOwner.forEach(function (owner, st) { st.disabled = owner !== key; }); }
  function syncStyles() { if (page) { tagStyles(page); switchStyles(page); } }
  new MutationObserver(syncStyles).observe(document.head, { childList: true });

  /* ---------- 3. Navigation ---------- */
  var cache = {};                            // url -> { t: time, html }
  var TTL = 10 * 60 * 1000;
  var navId = 0;
  var scrollPos = {};                        // history entry id -> scrollY
  var curId = uid();
  function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
  function keyOf(url) { return new URL(url, location.href).pathname; }

  function eligible(a, e) {
    if (!a) return false;
    if (e && (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download') || a.hasAttribute('data-no-soft')) return false;
    if (!a.getAttribute('href')) return false;
    var u; try { u = new URL(a.href, location.href); } catch (err) { return false; }
    if (u.origin !== location.origin) return false;
    if (!/^\/[A-Za-z0-9_-]*(\.html)?$/.test(u.pathname)) return false;      // root-level pages only
    if (/\.dc\.html$/i.test(u.pathname)) return false;
    if (u.pathname === location.pathname && u.hash) return false;           // in-page anchor
    return true;
  }

  function fetchPage(url) {
    var c = cache[url];
    if (c && Date.now() - c.t < TTL) return Promise.resolve(c.html);
    return fetch(url, { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok || !/text\/html/.test(r.headers.get('content-type') || '')) throw new Error('bad response');
        return r.text();
      })
      .then(function (html) { cache[url] = { t: Date.now(), html: html }; return html; });
  }

  function syncHead(doc) {
    var t = doc.querySelector('head > title') || doc.querySelector('x-dc helmet title');
    var og = doc.querySelector('meta[property="og:title"]');
    var title = t ? t.textContent : (og && og.getAttribute('content')) || document.title;
    [].forEach.call(document.head.querySelectorAll('title'), function (n) { n.remove(); });
    document.title = title;
    var sel = 'meta[name="description"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"]';
    [].forEach.call(document.head.querySelectorAll(sel), function (n) { n.remove(); });
    [].forEach.call(doc.head.querySelectorAll(sel), function (n) { document.head.appendChild(document.importNode(n, true)); });
    var lang = doc.documentElement.getAttribute('lang');            // same as a fresh load of that page
    if (lang) document.documentElement.setAttribute('lang', lang); else document.documentElement.removeAttribute('lang');
    [].slice.call(document.body.attributes).forEach(function (a) { if (!doc.body.hasAttribute(a.name)) document.body.removeAttribute(a.name); });
    [].slice.call(doc.body.attributes).forEach(function (a) { document.body.setAttribute(a.name, a.value); });
  }

  function restoreScroll(y, hash) {
    var tries = 0;
    window.scrollTo(0, y);
    (function tick() {
      if (hash) {
        var el = null; try { el = document.getElementById(decodeURIComponent(hash.slice(1))); } catch (e) {}
        if (el) { el.scrollIntoView(); return; }
        if (tries > 90) return;
      } else {
        var fits = document.body.scrollHeight - window.innerHeight >= y;
        if (fits || tries > 90) { window.scrollTo(0, y); return; }
      }
      tries++; requestAnimationFrame(tick);
    })();
  }

  function swap(html, url, y) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var newDc = doc.querySelector('x-dc');
    var isDc = newDc && doc.querySelector('script[src*="support.js"]');
    if (!isDc || typeof window.__dcBoot !== 'function' || !document.getElementById('dc-root')) throw new Error('not a runtime page');
    var key = keyOf(url);
    rememberStyleTexts(key, doc);

    cleanupPage();                                                           // leave the current page
    var old = document.getElementById('dc-root');
    var oldScript = document.querySelector('script[data-dc-script]');
    syncHead(doc);
    old.replaceWith(document.importNode(newDc, true));                       // scripts from DOMParser never run
    if (oldScript) oldScript.remove();
    var newScript = doc.querySelector('script[data-dc-script]');
    if (newScript) document.body.appendChild(document.importNode(newScript, true));

    page = key;
    switchStyles(key);
    window.__dcBoot();                                                       // the runtime mounts the new page
    syncStyles();
    restoreScroll(y || 0, y ? '' : new URL(url, location.href).hash);
    document.dispatchEvent(new CustomEvent('vf:navigate', { detail: { url: url } }));
  }

  function go(url, y) {
    var id = ++navId;
    fetchPage(url).then(function (html) {
      if (id !== navId) return;                                              // a newer navigation won
      swap(html, url, y);
    }).catch(function () {
      if (id !== navId) return;
      location.href = url;                                                   // fallback: ordinary navigation
    });
  }

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!eligible(a, e)) return;
    var url = new URL(a.href, location.href);
    e.preventDefault();
    if (url.href === location.href) { restoreScroll(0); return; }
    scrollPos[curId] = window.scrollY;
    curId = uid();
    try { history.pushState({ vf: 1, id: curId }, '', url.href); } catch (err) { location.href = url.href; return; }
    go(url.href, 0);
  }, true);

  document.addEventListener('pointerenter', function (e) {                   // prefetch so the swap is instant
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!eligible(a, null)) return;
    var url = new URL(a.href, location.href).href;
    if (url !== location.href) fetchPage(url).catch(function () {});
  }, true);

  window.addEventListener('popstate', function (e) {
    var st = e.state || {};
    if (keyOf(location.href) === page && (!st.vf || st.id === curId)) return;   // hash change on the same page
    scrollPos[curId] = window.scrollY;
    curId = st.id || uid();
    go(location.href, scrollPos[curId] || 0);
  });

  try { history.scrollRestoration = 'manual'; } catch (e) {}
  try { history.replaceState({ vf: 1, id: curId }, ''); } catch (e) {}

  /* ---------- 4. The first page ---------- */
  page = keyOf(location.href);
  fetch(location.href, { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (html) {
    if (!html) return;
    cache[location.href] = { t: Date.now(), html: html };
    rememberStyleTexts(page, new DOMParser().parseFromString(html, 'text/html'));
    syncStyles();
  }).catch(function () {});
})();

/* Paintings on art.html: block the context menu and drag on the artworks only. */
(function () {
  function isArt(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.tagName !== 'IMG') return false;
    return el.classList.contains('na-img') || !!(el.closest && el.closest('#na-lightbox'));
  }
  function block(e) { if (isArt(e.target)) e.preventDefault(); }
  document.addEventListener('contextmenu', block, true);
  document.addEventListener('dragstart', block, true);
})();
