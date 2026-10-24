# SUBSTRATE PRO v4.7 — restored BIM entry point and startup patch

## Fixed
- Removed injected HTML script tags that interrupted construction-sheet window HTML string and crashed the main JS parser.
- Preserved all original inline drafting, wall polyline, slab/beam/column tools and 3D Iso engine.
- Kept BIM–OCCT bridge, CAD workspace, and verified 4.5.9 kernel test.
- Include `bim-workflow-restore.mjs` in static site deployment output; older build-site.mjs omitted it.

## Deploy
Push the full folder to GitHub main. GitHub Pages source must be GitHub Actions. The workflow runs npm ci/build:site and stages the `site/` output; OCCT WASM is fetched at GitHub build time.

## Quick QA
Open landing page; enter workspace; Start BIM Wall Drafting; click plan points; Finish Wall; select 3D Iso; inspect elevation; New Project / Sample / Save; open OCCT test for Fuse/Cut/Common.

## Scope
OCCT remains a separate CAD geometry engine; exact arbitrary BIM B-rep cuts and full construction-document topology coordination aren't implemented.
