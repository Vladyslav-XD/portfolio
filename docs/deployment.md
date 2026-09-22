# Deployment notes

This repository is a static multi-page website. The public HTML filenames are also public routes, so they should remain at the repository root unless redirects are introduced first.

## Safe update process

1. Create a separate branch.
2. Preview the branch locally or through a hosting preview.
3. Run `node scripts/validate-static-site.mjs`.
4. Check the homepage and every case study on desktop and mobile.
5. Test English and Ukrainian content in light and dark themes.
6. Merge only after the preview passes these checks.

## Important constraints

- Keep `index.html` and case-study HTML filenames stable.
- Update every HTML reference when moving an asset.
- Keep social-sharing URLs aligned with files in `assets/meta/`.
- Do not commit generated caches, local server files or credentials.

The earlier manual-upload instructions are preserved in `legacy-upload-notes.txt` for historical context only.
