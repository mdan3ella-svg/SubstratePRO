# SUBSTRATE PRO v1.0 — GitHub deployment repair

## What the screenshot diagnosed
The deployed source contains `import * as THREE from "three"` but GitHub Pages cannot resolve the package name. The browser therefore displays: `Failed to resolve module specifier "three"`. This does not mean wall drawing or the document model is defective.

## Option A (recommended): GitHub Actions
1. Upload the **contents** of this folder to your repository root, including `.github/workflows/pages.yml` (hidden `.github` folder).
2. GitHub → Settings → Pages → Source: **GitHub Actions**.
3. Push to main. The workflow runs `npm install`, `npm test`, and `npm run build`; then uploads the generated `dist` directory.
4. Check Actions build log. If the npm build fails, no working compiled deployment is available. Investigate errors before continuing.
5. Hard-refresh the Pages URL after successful deployment.

**Note:** Exact B-rep remains runtime-unverified. A passed Vite build only proves bundling, not kernel initialization or correct Boolean results.

## Option B (temporary, no build): source hosting
`index.html` now includes an import map for Three.js v0.180.0 from jsDelivr. A reachable CDN may allow WebGL to work on a source-hosted site, but this requires an Internet connection and does not guarantee WASM functionality. Use option A for reliable production delivery.

## Verification checklist
- Open browser DevTools → Network and Console. No `Failed to resolve module specifier "three"`.
- Plan → Wall: click-drag to draw. Model Browser count increases.
- 3D Iso: WebGL status should show `WebGL ACTIVE · Parametric mesh preview · Exact B-rep OFF`. Orbit with mouse.
- Press `Enable Exact 3D`: only accept an `EXACT OCCT ACTIVE` message when both box/Boolean self-tests pass. If it fails, collect full error from DetailCore & Audit.
- Save project JSON, reload, and open it; verify objects persist.

The exact B-rep adapter itself still needs testing with the installed brepjs version. Do not present these shapes or schedules as certified fabrication documentation.
