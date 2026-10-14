# Validator clean: Fixel fonts, Widgetbook catalog, local scratch skipped (2026-10-14)

Repo: Vladyslav-XD/portfolio · branch main. Built on main after commit 34bad2c.

## Why
`node scripts/validate-static-site.mjs` failed on main: 12 errors from the gitignored `_to_delete/` scratch folder, the Fixel `@font-face` files of `pace-tape.html`, which were never in the repo, and the hero link to `/pace-tape/widgetbook/`, which was never deployed (both 404 on www.vladfilon.com).

## Changes
- `scripts/validate-static-site.mjs`: skips `_to_delete/` (e2ac67c).
- `assets/fonts/FixelText-Medium.woff2`, `FixelText-Bold.woff2` (84 KB each) and `Fixel-OFL.txt`: from the Pace Tape app (`assets/fonts/fixel/`, the same files the app ships), converted from OTF to WOFF2 with fontTools, glyphs unchanged. Fixel is MacPaw's open font, SIL OFL 1.1, no Reserved Font Name. Decision 05 on `pace-tape.html` ("Settings · Haptics · Ticker jokes", EN and UK) now renders in Fixel instead of falling back to Hanken Grotesk / the system font. Only weight 500 is used, so the browser never downloads Bold.
- `pace-tape/widgetbook/`: the Pace Tape component catalog, copied unchanged from the app repo's site build (`tool/build_widgetbook.sh --site`, built 2026-10-09; 34 files, 13 MB). Base href `/pace-tape/widgetbook/`; CanvasKit is served from the site, so it makes no request to another host. Its fonts (Fixel, Sofia Sans, Poppins, Roboto) carry their licences in the font metadata. To update it, rebuild in the app repo and replace the folder.
- `scripts/validate-static-site.mjs`: links to `pace-tape/widgetbook/` are still checked, but the folder's minified Flutter code is not scanned (the patterns misread it as 10 broken references).

## Not changed
- Privacy modal on `index.html` still says the catalog "loads the Flutter web engine from Google's servers (gstatic.com)". The build in this folder does not; the sentence is now stricter than needed. Copy change left to Vlad.

## Check before merging
- `pace-tape.html`, decision 05: the sample line is in Fixel in EN and UK; no 404 for `assets/fonts/` in the network panel.
- `pace-tape.html` hero → "Component catalog (Widgetbook) ↗" opens `/pace-tape/widgetbook/` in a new tab; deep link `/pace-tape/widgetbook/#/?path=calculator/keypad/clock` opens the keypad case; theme and locale addons work.

---

# Page titles and page language (2026-10-14)

Repo: Vladyslav-XD/portfolio · branch main. Built on main after commit e2ac67c.

## Why
- Nine case pages had no `<title>`: the browser tab showed the address, and screen readers announced no page name (WCAG 2.2 · 2.4.2 Page Titled).
- Thirteen pages had no `lang` on `<html>`, and switching to Ukrainian set `lang="ua"`, which is a country code, not a language. Screen readers kept reading Ukrainian text with the English voice (WCAG 2.2 · 3.1.1 Language of Page).

## Changes
- `<title>` added to `art.html`, `bookworm-community.html`, `charon.html`, `drug-dozy.html`, `language-course.html`, `my-eco-pharmacy.html`, `race-planner.html`, `smart-school.html`, `tverdokhlib.html`. Each one is the page's own `og:title`: no new copy. Soft navigation already reads `head > title`, so tab names also update without a reload.
- `<html lang="en">` on every page that lacked it (all of them open in English): `art`, `bookworm-community`, `charon`, `coffee-audit`, `drug-dozy`, `index`, `language-course`, `mocktail-finder`, `my-eco-pharmacy`, `pace-tape`, `race-planner`, `smart-school`, `tverdokhlib`. The `*.dc.html` fragments are not touched.
- Ukrainian now sets `lang="uk"` (`vf-shared.js`, `index.html`, `art.html`). The switch's own value stays `ua`, so the `data-ua` copy and every `=== 'ua'` check work as before.
- Code that reads the page language follows: `vf-music.js` (button label "Музика"), `coffee-audit.html` (`html[lang="uk"]`, the phone label "НА ЦЬОМУ САЙТІ"). `pace-tape.html` already accepted both. `index.html` already checked for `uk`, so the hint under the phone hero quote now reads "ЩЕ →" in Ukrainian; before, it always said "NEXT →".
- `vf-analytics.js`: the Clarity `lang` tag and the `lang_toggle` event still send `ua`, so old and new reports match.

## Check before merging
- Every case page: the browser tab shows the page name, also after moving between pages from the home page.
- EN → UA → EN on the home page, a case page and `art.html`: `<html lang>` goes `en` → `uk` → `en`; the music button reads "Музика" in UA.
- Phone, home in UA: tap the hero quote, the hint reads "ЩЕ →".
- VoiceOver in Safari on a case page in UA: the Ukrainian text is read with a Ukrainian voice.

---

# Handoff — Beyond the desk album, image protection, IT Smart School page, NDA rows (2026-10-14)

Repo: Vladyslav-XD/portfolio · branch main. Built on main as of 2026-10-14 (`index.html` and `sitemap.xml` on main were checked against this package's base: no other changes). Copy this folder over the repo root, keeping the paths. One file is deleted (see Delete).

## Files
Add:
- `assets/js/vf-protect.js`: blocks the context menu ("Save image as…"), drag-to-desktop and the iOS / Android long-press menu on every img, video and canvas. A deterrent, not DRM: screenshots still work. Text stays selectable. Its listeners are added before any page mounts, so vf-nav.js never treats them as page-scoped (they survive soft navigation).
- `assets/images/smart-school/`: 5 screens, WebP, 2000 px wide.
- `assets/images/home/end-*.webp`: 16 photos for the Beyond the desk album, WebP, max 1600 px.

Replace:
- `index.html`: see below.
- `smart-school.html`: the IT Smart School case. It replaces the old 4.6 MB bundled export of the same page. Same header as the other cases (music toggle, no Blog); vf-nav.js before support.js and vf-shared.js in the helmet, like the other design-code pages. Phones (≤ 700 px) get the layout rules of the previous page back: the hero and the grids stack in one column, the user-flow steps stay in two. Without them the two-column hero widened the page to ~550 px and the hero screenshot shrank to ~20 px. The design-process cards now stack too; on the previous page they stayed in two columns and were cut off at the right edge.
- `sitemap.xml`: lastmod 2026-10-14 for `/` and `smart-school.html` (the entry already existed).

Delete:
- `scripts/repair-smart-school-bundle.mjs`: it patched the analytics tag inside the old bundled export. The new `smart-school.html` has no bundle, so the script no longer applies and would throw on it.

Edit, one line right before `</head>` (not in this package, so nothing else in these files is overwritten): `art.html`, `bookworm-community.html`, `charon.html`, `coffee-audit.html`, `drug-dozy.html`, `language-course.html`, `mocktail-finder.html`, `mocktail-finder-privacy.html`, `mocktail-finder-support.html`, `my-eco-pharmacy.html`, `pace-tape.html`, `pace-tape-privacy.html`, `pace-tape-support.html`, `race-planner.html`, `tverdokhlib.html`:
`<script src="./assets/js/vf-protect.js" defer></script>`

`404.html`: the same line with a root path, `<script src="/assets/js/vf-protect.js" defer></script>`, and the favicon and `vf-analytics.js` paths changed to `/assets/...` too. The host serves this page at any missing URL, nested ones included: on `/a/b` a relative `./assets/...` resolved to `/a/assets/...` and got the 404 page back instead of the file, so the favicon, analytics and protection never loaded there. The page's "Restore balance" button already goes to `/`.

## index.html
- **Work list**: rows 13 Pharmacy Prescription Reservation and 14 MARI CRM show "UNDER NDA" / "ПІД NDA" in the empty READ slot (muted, row ink on hover, under the title on mobile). MARI CRM year 2026 → 2025.
- **Beyond the desk → album** (11 entries): London, Chicago, Fastlane 10K Dublin, Lake Orta, Oceanman Stari Grad, Oceanman Kyiv 5 km, Oceanman Kyiv finish + relay, KropSwim, Dzharylhach → Skadovsk, with Mykhailo Romanchuk, Dnipro winter 2024.
  - Navigation: ← / → buttons, a row of colour squares (hidden below 520 px), counter, click on the photo = next, swipe, ← / → keys. The event chips in the data column still open their entry.
  - Entries with several frames show dots; Kyiv and Skadovsk switch the caption with the frame. Skadovsk frame 4 links to `my-eco-pharmacy.html`.
  - Photos load lazily (current entry ± 1). Chicago gets the line "Retrospective in progress." Intro paragraph: one sentence about the arrows.
- **The Sub-3 project chart**: the track is the goal (3:00:00, red line); each bar is the finish time from zero, the part past the line in light red. Label row "CITY · country", PB chip + time. Axis under the bars: 0:00:00 … 3:00:00.
- **Selected open water chart**: sorted by distance; "City · water" (Gozzano · Lake Orta, Stari Grad · Adriatic Sea, Skadovsk · Black Sea, Kyiv · Dnipro River); PB chip + time on 14.5, 10 and 5 km; distance at the end of the bar; axis 0 km … 22 km (Gibraltar). UA uses the decimal comma (14,5).

## Check before merging
- Home → More about me → Beyond the desk: arrows, squares, swipe on a phone; all 16 new photos load; captions in EN and UA.
- Right-click / long-press a photo on any page (including after a soft navigation): no "Save image" menu.
- Home row 10 → `smart-school.html` opens; theme, EN / UA and the music keep working. At 375 px it is one column and nothing is cut off at the right edge.
- 375 px and 1440 px, light and dark.
- A nested missing URL such as `/a/b`: the 404 page shows its favicon, and its scripts load without errors.

---

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
