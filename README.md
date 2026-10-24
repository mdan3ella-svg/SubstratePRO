# SUBSTRATE PRO — GitHub Actions Vite Deployment Repair

This patch replaces `.github/workflows/deploy.yml` to deploy the original modular BIM source.

## Root cause
The old workflow runs `npm run build:site` and publishes `site/`. Current `package.json` has only `npm run build` (Vite), which generates `dist/`.

## Apply
1. Replace `.github/workflows/deploy.yml` with the matching file from this package.
2. Remove or disable any *other* workflow publishing GitHub Pages (especially `pages.yml` or old OCCT workflows). Keep one deployment workflow.
3. Ensure `index.html`, `src/app/main.js`, `src/interface/style.css`, `package.json`, `package-lock.json`, and `vite.config.js` are present on `main`.
4. In Settings → Pages, select GitHub Actions as the build source.
5. Commit and inspect the new `SUBSTRATE PRO — Original BIM Vite Pages` workflow.
6. Once successful, verify https://mdan3ella-svg.github.io/SubstratePRO-Toolworks/build-identity.txt displays `original-modular-bim`.

The OCCT WASM installation is deliberately not part of this minimal repair. The original modular BIM app uses the dependencies defined in its package.json. Do not interpret successful deployment as proof of geometric behavior; test the Plan → Wall → 3D Iso workflow in a browser.

If `npm ci` fails because the current package-lock.json is absent or out of sync, regenerate it locally with `npm install` and commit the new lockfile. Do not replace `npm ci` with a silent fallback.
