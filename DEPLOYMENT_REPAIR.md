# GitHub Actions deployment repair

The earlier deployment failed because `deploy.yml` invoked `npm run build:site`, a missing script. The old `scripts/build-site.mjs` was written for a separate launcher/OCCT release and must not be used for the original BIM workspace.

This release restores the original modular SUBSTRATE PRO drafting code and publishes it through `npm run build` (Vite) to the `dist` directory.

## Installing

1. Upload **all files from the archive root** to the repository root (`index.html`, `src/`, `package.json`, `vite.config.js`, `.github/workflows/deploy.yml`, etc.).
2. **Delete** the obsolete `.github/workflows/pages.yml` if it exists, and ensure there is only one Pages workflow.
3. Keep GitHub Settings > Pages > Source set to `GitHub Actions`.
4. Commit to `main`, view the `Deploy SUBSTRATE PRO Original BIM Workspace` action.
5. Open `https://mdan3ella-svg.github.io/SubstratePRO-Toolworks/build-identity.txt`: it should say `original-modular-bim`.
6. Open the app and test Architecture > Plan > wall endpoints > 3D Iso.

This release restores the original modular BIM app and deploy mechanism. It does not bundle the older 65 MB `opencascade.js` WASM distribution or the v4.x separate OCCT demo. Do not claim exact B-rep rendering has been re-integrated unless separately tested.
