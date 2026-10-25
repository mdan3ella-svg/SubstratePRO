# SUBSTRATE PRO v3.4 — Branded Startup, About & Tutorial

The homepage launches an accessible Vertascan startup overlay before the existing BIM drafting canvas. Available actions: New BIM Project, Enter Workspace, Open Existing Project, Load Sample Model. About describes scope and limitations. Tutorial has contextual buttons that activate existing controls (Wall, 3D Iso, sheet generation and Help).

The `About / Start` button in the top toolbar reopens the launch screen. The SVG brand mark at `public/brand/substrate-icon.svg` supplies the favicon; the stylesheet `src/interface/startup.css` and startup controller `src/app/startup.js` are required alongside updated `index.html`.

## GitHub Pages deployment

Copy the root contents of this folder to your **SubstratePRO** repository, preserving `src/`, `public/` and `.github/`. Keep a single Vite-based GitHub Pages workflow. The existing relative Vite base path remains unchanged. Test production build in GitHub Actions and check favicon, launcher, About, Tutorial, wall drawing, and 3D view after deployment.

## Verification limits

All 58 existing Node source tests pass and the new controller passes `node --check`. No production Vite build or interactive browser test was completed in this environment. The splash does not certify the implementation of BIM authoring, code checking or IFC round-trip functionality.
