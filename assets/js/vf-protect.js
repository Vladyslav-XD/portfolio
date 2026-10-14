/* VF — image protection for every page: blocks "Save image as…" (right-click), drag-to-desktop
   and the iOS/Android long-press menu on photos and video. A deterrent, not DRM: screenshots still work. */
(function () {
  var MEDIA = 'img, picture, video, canvas, svg image, [data-protect]';
  function media(e) { var t = e.target; return t && t.closest ? t.closest(MEDIA) : null; }
  document.addEventListener('contextmenu', function (e) { if (media(e)) e.preventDefault(); }, true);
  document.addEventListener('dragstart', function (e) { if (media(e)) e.preventDefault(); }, true);
  var s = document.createElement('style');
  s.setAttribute('data-vf-protect', '');
  s.textContent = 'img,video,picture{-webkit-user-drag:none;user-drag:none;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;}';
  (document.head || document.documentElement).appendChild(s);
})();
