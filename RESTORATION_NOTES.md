# SUBSTRATE PRO — Original intelligent BIM workspace restored

This package restores the **modular AEC Detail Studio interface** matching the user's uploaded `index(20261024-204753).html`, rather than the unrelated large dashboard/launcher releases. The HTML layout is preserved and enhanced by the prior v1.4 source family.

## Drawing workflow
1. Open the site: it launches directly into the modeling workspace.
2. Select **Plan** then Architecture → **Wall** in the left Drawing & Modeling panel.
3. Click wall start and wall endpoint (or click-and-drag). Snapping and orthogonal wall settings are in Drawing Standards.
4. Repeat for adjacent segments. Select **3D Iso** to inspect the shared model.
5. Select elements and edit coordinates, height, and thickness in **Element Properties**.
6. Use **4 Ortho Review** and the print/plot controls for preliminary drawings.

## Build and deploy
On GitHub Pages, commit this package's **contents at repository root** including `.github/workflows/pages.yml`, select GitHub Actions as the Pages source. Workflow runs `npm install`, `npm test`, `npm run build`, and deploys `dist/`.
For local build, run `npm install`, `npm test`, `npm run dev` or `npm run build`.

The uploaded HTML alone is insufficient because it imports `src/app/main.js` and `src/interface/style.css`. This ZIP includes the full source tree. It is **not** a single-file offline HTML.

## Scope and caveats
The 2D drafting, snapping, editable object parameters, 3D WebGL viewport, and conceptual annotation/quantity features are restored from the original modular code lineage. Exact B-rep requires separate WASM libraries installed at build time and success of its runtime initialization. Tested: 31 Node source tests. Not tested in live GitHub Pages or with mouse-driven browser interactions. No claims of regulatory-code compliance or manufacturing-grade BIM output.
