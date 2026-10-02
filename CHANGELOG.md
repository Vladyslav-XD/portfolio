# Handoff — soft navigation (2026-10-02)

Repo: Vladyslav-XD/portfolio · branch main. Built on main after commit 65ec355.

## Why
The music toggle (vf-music.js) kept the position between pages but could not resume after a page change: Safari, Firefox and often Chrome block sound on a freshly loaded page until the visitor taps it. The fix removes the reload itself.

## Files
Add:
- `assets/js/vf-nav.js`: soft navigation. A click on an internal link fetches the page, swaps the `<x-dc>` template and the `data-dc-script` logic, updates title / meta / `<html lang>`, calls `window.__dcBoot()` (the design-code runtime remounts the page) and pushes the URL. The window never reloads, so the header music keeps playing on every page, in every browser.

Replace (one line in `<head>`, right before `support.js`): `art.html`, `bookworm-community.html`, `charon.html`, `coffee-audit.html`, `drug-dozy.html`, `index.html`, `language-course.html`, `mocktail-finder.html`, `my-eco-pharmacy.html`, `pace-tape.html`, `race-planner.html`, `tverdokhlib.html`:
`<script src="./assets/js/vf-nav.js"></script>`

## How it behaves
- Only root-level `*.html` links on the same origin are intercepted. Links with `target`, `download`, modifier keys, `data-no-soft`, `.dc.html`, folders (`/pace-tape/widgetbook/`) and in-page anchors are left to the browser.
- Pages without the runtime (`*-privacy.html`, `*-support.html`, `smart-school.html`, `404.html`) are not design-code pages: the script sees that and falls back to a normal navigation. Any other failure (network, missing `<x-dc>`) also falls back to a normal navigation, so the worst case is today's behaviour.
- Back / forward work (`popstate`), scroll positions are restored, `index.html#cta` and `#works` links scroll to the section after the swap.
- Per page the script unmounts the old React root, removes the window/document listeners and intervals the page logic and `VFChrome` added, and disables the previous page's `<helmet>` styles (the runtime appends them to `<head>` and never removes them).
- Pages are prefetched on hover and cached for 10 minutes.
- Language and theme behave exactly as on a fresh load of each page (`<html lang>` is reset per page); nothing new is stored.

## Check before merging
- Play the music on the home page, open any case study: the music does not stop (Safari, Chrome, Firefox, iPhone).
- Back and forward buttons, "Start a project →" (index.html#cta) and "← Back to works" from a case.
- Privacy / Support pages still open (normal navigation).
- Theme, EN/UA, hover rows and the mobile menu on the page you arrived at.
- Vercel Analytics and Clarity still count page views after a soft navigation (both track `pushState`; confirm in the dashboards after a day).

---

# Handoff — Pace Tape case, home row, music toggle (2026-10-01 / 02)

Repo: Vladyslav-XD/portfolio · branch main. Copy this folder over the repo root, keeping the paths. Nothing needs deleting.

## Files

Add:
- `pace-tape.html`: the full case study, at the new URL `/pace-tape.html`.
- `assets/images/pace-tape/`: 38 images. PNGs were converted to WebP, the TestFlight and Figma shots are JPEG.

- `assets/js/vf-music.js`: the header music toggle (new).
- `assets/audio/vf-theme.mp3`: the track (new). MP3 192 kbps, 4:34, 6.6 MB.

Replace (all built on main as of 2026-10-02):
- `index.html`: Work row 01, the other rows renumbered, one Privacy sentence, music toggle in the header.
- `sitemap.xml`: one new entry, `https://www.vladfilon.com/pace-tape.html` (lastmod 2026-10-01).
- Music toggle in the header only (no other change): `art.html`, `bookworm-community.html`, `charon.html`, `coffee-audit.html`, `drug-dozy.html`, `language-course.html`, `mocktail-finder.html`, `mocktail-finder-privacy.html`, `mocktail-finder-support.html`, `my-eco-pharmacy.html`, `pace-tape-privacy.html`, `pace-tape-support.html`, `race-planner.html`, `tverdokhlib.html`.

## pace-tape.html

- **Hero**:
  - Status chip "Live on the App Store" / "Уже в App Store", plus "Released 1 October 2026".
  - Links:
    - App Store button → apps.apple.com/app/id6815571424 (drawn in the site's style, not Apple's badge);
    - Privacy → `pace-tape-privacy.html`;
    - Support → `pace-tape-support.html`;
    - Component catalog (Widgetbook) ↗ → `/pace-tape/widgetbook/`, opens in a new tab.
- **Catalog**: linked from the hero only. The case has no catalog section and no screenshots of it.
- **08 Design system**: retitled "Figma ↔ code". The "From the catalog" screenshot grid is removed.
- **Timeline**:
  - "How it was built" ends with "1 OCT · Version 1.0 released" / "1 ЖОВТ · Версію 1.0 випущено".
  - The launch list in 05 TestFlight ends the same way.
- **10 How it was built**: 9-card timeline (two rows on desktop, sideways scroll below 1100 px) ending with 1 OCT · Version 1.0 released; "about three weeks" intro; the 3.5-hours claim removed.
- **11 Results**: line under the title (version, release date, 173 countries, no ads/account/data) + 4 tiles: 3 weeks · 1 day · 0 rejections · 139 tests.
- **12 What’s next** (new, before the CTA): 1.0.1 backlog — launch intro fix, runner feedback, more languages, Android.
- **Results / CTA**: real App Store links instead of the placeholders.
- **Meta**: `<meta name="description">` and `og:description`, facts only. og:image is the shared `assets/meta/og-cover.png`.
- **Next project**: Mocktail Finder.
- **EN/UA** on every text (data-en / data-ua). Light and dark both work.
- **Mobile**: "SWIPE SIDEWAYS ← →" hint above the competitor table (below 1000 px); build-1 / after screenshots in 07 stack one above the other below 520 px (max 240 px wide).

## index.html

- **Work row 01 — Pace Tape** (yellow hover): pace calculator for swim, bike, run and triathlon, designed, built and released on the App Store.
  - Type: "iOS app · App Store".
  - Hover details:
    - Role: Design engineer;
    - Tools: Illustrator · Figma · Claude Design · Flutter · Claude Code · Widgetbook;
    - Key features: pace, speed and finish time for swim, bike and run, triathlon total with transitions, EN/UA, light / dark theme, no ads, no account.
- **Other rows**: shifted to 02–14. To keep six rows above "Expand all projects", Language Course (now 07) moved into the expandable part.
- **Privacy modal → Analytics**: added "The Pace Tape component catalog (/pace-tape/widgetbook/) loads the Flutter web engine from Google's servers (gstatic.com)." with its UA version. "Last updated" changed to October 2026.

## Music toggle (every page with the site header)

- Pill in the header: after the last nav link, before ☾ and EN / UA. Below 900 px it sits left of MENU; below 640 px only the bars (the label is the accessible name).
- States: Music / Music on / Tap to play · Музика / Музика грає / Натисни, щоб грала. Spec: `Music Toggle.dc.html` in the design project.
- **Live.** `TRACK = 'assets/audio/vf-theme.mp3'`, `VOL = 0.4` (the track is loud, −14.7 LUFS; 0.6 was too much for a background). The file starts at the track's loop point, so `loop` closes the circle without a gap; the piano ending runs into the intro.
- Storage: localStorage `vf-music` = on | off; sessionStorage `vf-music-pos` (seconds). The Privacy modal on `index.html` has one sentence about it, EN and UA.

## Not in this package

- `/pace-tape/widgetbook/`, the Flutter web build of the catalog. The hero link expects it at that path.
- Scripts are unchanged and not included: `assets/js/support.js`, `vf-shared.js`, `vf-analytics.js`.
- `404.html` has no site header, so no toggle.

## Check before merging

- 375 px and 1440 px, EN and UA, light and dark.
- Links: App Store, Privacy, Support, Widgetbook (new tab), Next → mocktail-finder.html.
- Home: row 01 hover, rows 02–06 visible, "Expand all projects" reveals 07–14.
- Every page: music pill after the last nav link (left of MENU on mobile), toggles on/off, label follows EN/UA, sound plays, and it continues from the same position after a page change (Safari may show "Tap to play" until the next tap).
