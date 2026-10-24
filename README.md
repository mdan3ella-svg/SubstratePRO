# SUBSTRATE PRO — GitHub Pages HTML + OpenCascade.js build

This project contains **two HTML entrypoints**:

- `index.html` — existing SUBSTRATE PRO BIM/drafting application.
- `cad-workspace.html` — separate experimental OCCT parametric CAD workspace (feature records, B-rep assembly, Boolean attempts, WebGL tessellation, section preview).
- `occt-test.html` — kernel verification page.

The HTML and application code are included in this ZIP, but **the OpenCascade.js WASM runtime is not included**. GitHub Actions runs `npm install --no-audit --no-fund && npm run build && npm test`, then publishes the resulting JavaScript/WASM to GitHub Pages. Do not upload the ZIP as if it were a fully operational offline OCCT application. A local filesystem `file://` URL is not a suitable way to load WASM; use a local HTTP server or GitHub Pages.

## Deploy with GitHub Actions

1. Create a GitHub repository and upload **all files including the hidden `.github/workflows/deploy.yml` and `.nojekyll`** to the root of the `main` branch.
2. Go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push a commit to `main` (or run **Actions → Build and deploy SUBSTRATE PRO with pinned OCCT → Run workflow**).
4. The workflow installs the pinned `opencascade.js@1.1.1`, bundles its distribution in `vendor/opencascade/`, checks source tests and deploys.
5. Open `https://USERNAME.github.io/REPOSITORY/occt-test.html` and **test actual runtime operations**. Then open `.../cad-workspace.html`. The main drafting UI remains at the site root.

A green GitHub Actions workflow means build and source tests succeeded; **it does not prove the OCCT JavaScript API bindings work in your browser**, nor does it certify tessellation or editing. The OCCT test page is the next required check. If it fails, the API adapter must be corrected to match that installed distribution before the engine is usable.

## Run locally

```bash
npm install
npm run build
npm test
npm run serve
```

Then navigate to `http://localhost:4173/occt-test.html` and `http://localhost:4173/cad-workspace.html`.

## Current scope

This package is a **GitHub-Pages-ready build project**, not a completed manufacturing-grade CAD/BIM system. OCCT live execution and face tessellation have not been independently verified in this environment. Persisted topology is a feature/Boolean dependency graph; exact stable face-name tracking is absent. Generated section preview currently uses feature envelopes rather than exact OCCT section topology, and the CAD workspace is not automatically synchronized with the legacy BIM document.

GitHub Pages has a file size limit; inspect the final WASM and deployment artifact limits, and if necessary host the WASM at an allowed location using a matching loader.
