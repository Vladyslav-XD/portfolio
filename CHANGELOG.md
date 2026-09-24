# Handoff — Mocktail Finder case update (2026-09-24)

Repo: Vladyslav-XD/portfolio · branch main. Copy this folder over the repo root, keeping the paths. Nothing needs deleting: the old mf-1…12.png and mocktail-demo4.mp4 stay, the new page just no longer uses them.

## Files

Replace:
- `mocktail-finder.html` — the whole case, rewritten
- `index.html` — only Work row 01 (Mocktail Finder) changed; built on the current live file

Add, in `assets/images/mocktail-finder/`:
- `mf11-glyph.png` — glyph for the launch animation
- iPhone 1.1 screens, 800 px WebP: `mf11-home`, `mf11-home-dark`, `mf11-warm-dark`, `mf11-recipe`, `mf11-recipe-dark`, `mf11-recipe-actions`, `mf11-favourites`, `mf11-add`, `mf11-add-steps`
- App Store slides, 600 px WebP, in panorama order: `mf11-store-01-hero` … `mf11-store-07-theme`

Every image is under 80 KB.

## What changed on the page

- **Hero**
  - Status chip "Live on the App Store".
  - Links:
    - App Store button → apps.apple.com/app/id6811610325 (drawn in the site's style, not Apple's badge);
    - GitHub, Privacy (mocktail-finder-privacy.html), Support (mocktail-finder-support.html).
  - Meta row: Design engineer · iOS · App Store · Expo · React Native · TypeScript · 2026.
  - Right panel: a full-size animated launch screen instead of the video. It loops and shows a static frame under prefers-reduced-motion.
- **Sections**:
  01 Context → 02 Product goal → 03 From course project to App Store (7 dated stages; horizontal on desktop, vertical ≤1100px) → numbers strip (14 days · 173 · 2 releases · 0 data) → 04 My role (Product / Design / Build / Ship) → 05 User flow (2 paths) → 06 IA (3 tabs, 5 screens) → 07 Key screens (9 screens of 1.1) → 08 Decisions (6 cards) → 09 Stack and why (8 cards) → 10 On the App Store (panorama, scrolls sideways on mobile, plus facts and the App Store link) → CTA → Next: Race Planner → footer.
- **No drink counts anywhere** — not in the copy and not in meta/og.
- `<meta name="description">` added; `og:description` updated.
- **Mobile menu** gained Theme + EN/UA buttons.
- **Cursor ring** is off on touch devices.
- **`--muted` text colour** is #6f6a59, which passes WCAG AA.
- **EN/UA** on every text, via data-en / data-ua. Light and dark both work.

## index.html — Work row 01

- Description (EN/UA): course project → App Store; designed, built and released.
- Type: "iOS app · App Store".
- Hover details:
  - Role: Design engineer;
  - Tools: Figma · Expo · React Native · TypeScript · Claude Code;
  - Key features: updated list.

## Unchanged

- Scripts: `./assets/js/support.js`, `vf-shared.js`, `vf-analytics.js`.
- og image: `assets/meta/og-cover.png`.
- URL: `/mocktail-finder.html`.

## Later

1. **Done 24 Sep:** 1.1 released; timeline stage 7 now reads "24 SEP · Version 1.1 released" (UA: "Версію 1.1 випущено").
2. **When the screen recording is ready:** inside `#mf-demo-slot`, replace `{{ splash }}` with
   `<video id="mf-demo" src="assets/video/mocktail-finder/<file>.mp4" muted loop autoplay playsinline style="width:100%;height:100%;object-fit:cover;"></video>`.
   Playback (autoplay, click to pause, saving the position) is already wired in `componentDidMount`.
3. **When the screenshots are ready:** add two more screens to 07 Key screens, the camera/library sheet and Edit/Delete, in the same `<figure>` format.

## Check before merging

- 375 px and 1440 px, EN and UA, light and dark.
- The App Store panorama scrolls sideways on mobile.
- Links: App Store, GitHub, Privacy, Support, Next → race-planner.html.
