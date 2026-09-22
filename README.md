# Vlad Filon — Portfolio

Portfolio website for **Vlad Filon, UX / Product Designer & Design Engineer**. It presents selected product-design case studies and demonstrates the full path from research and design files to functional prototypes and applications.

[View the live portfolio](https://vladfilon.com) · [LinkedIn](https://www.linkedin.com/in/vladyslav-filon/) · [Email](mailto:filon.design.ux@gmail.com)

## Selected case studies

- [Mocktail Finder](https://vladfilon.com/mocktail-finder.html) — mobile product design and React Native implementation
- [Drug Dozy](https://vladfilon.com/drug-dozy.html) — smart pill organiser and rule-gated AI concept
- [Race Planner](https://vladfilon.com/race-planner.html) — event-planning product experience
- [Bookworm Community](https://vladfilon.com/bookworm-community.html) — community reading platform
- [My Eco Pharmacy](https://vladfilon.com/my-eco-pharmacy.html) — product and brand experience

## Repository structure

```text
.
├── index.html                 # Portfolio homepage
├── *.html                    # Stable public case-study routes
├── assets/
│   ├── documents/            # Downloadable documents
│   ├── images/               # Images grouped by page or case study
│   ├── js/                   # Shared browser scripts
│   ├── meta/                 # Favicon and social-sharing images
│   └── video/                # Project videos grouped by case study
├── docs/                     # Deployment and historical notes
└── scripts/                  # Repository validation utilities
```

Case-study HTML files intentionally remain at the repository root so existing public URLs continue to work.

## Local preview

The site is static and requires no build step:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Validation

Check that local pages, scripts and media references resolve correctly:

```bash
node scripts/validate-static-site.mjs
```

Responsive, language and theme checks cover desktop and mobile layouts, English and Ukrainian content, and light and dark themes.

## Deployment

See [docs/deployment.md](docs/deployment.md).
