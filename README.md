# SUBSTRATE PRO v4.5.2 — GitHub Pages OCCT asset deployment repair

Your screenshot shows **OCCT assets missing**. This is a deployment problem, not a geometry operation. The browser expects three files at `vendor/opencascade/` relative to the hosted repository's URL:

- `opencascade.js`
- `opencascade.wasm` (a large ~66 MB WASM file)
- `manifest.json`

The previous source ZIP does **not** contain these assets. Uploading files to a branch and choosing **Deploy from a branch** does not execute npm install/build. This package adds a mandatory Actions build that creates the final site in `site/` and refuses to publish if the WASM file is absent or truncated.

## GitHub installation

1. Unzip this package **and upload all files/folders in its root** to your repository's `main` branch. Ensure `.github/workflows/deploy.yml` is included; GitHub's web upload can omit hidden folders if you don't upload the directory contents correctly.
2. Repository **Settings → Pages → Build and deployment → Source → GitHub Actions** (not **Deploy from a branch**).
3. Repository **Actions → SUBSTRATE PRO — Build and deploy pinned OCCT WASM → Run workflow** (or commit to `main`).
4. Confirm that the workflow passes **Create GitHub Pages artifact with OCCT WASM**, **Verify deployment assets**, and **deploy-pages**. Any red step means the site was not successfully built.
5. Visit `https://USERNAME.github.io/REPOSITORY/deployment-status.json` and verify `ready:true` and a positive `wasmBytes` value.
6. Open `.../occt-test.html`, click **Initialize OCCT and test solid Boolean**, then test `.../cad-workspace.html` and the main app.

The upstream `opencascade.js@1.1.1` distribution supplies `dist/opencascade.wasm.js` and `dist/opencascade.wasm.wasm`. The build copies them to the filenames expected by the browser loader. The WASM binary is **not included in this ZIP**: GitHub Actions must download it from npm during build.

## Local build

```bash
npm install --no-audit --no-fund
npm run build:site
npm test
```

The deployable `site/` folder is then produced. Do not upload the **unbuilt source** as the production website. If your organization prohibits Github Actions/package installation, build locally first, and publish the *contents* of the `site/` folder instead.

## Distinguish these failures

- `OCCT assets missing`: deployment source or workflow did not publish the `vendor/` folder.
- `Emscripten JavaScript failed to load`: JS URL/asset missing or blocked.
- `WebAssembly` errors: incomplete file, MIME/network issue, or binary/runtime compatibility.
- `OCCT constructor ... overload not resolved`: API adapter mismatch; fix against actual runtime before claiming valid Boolean CAD modeling.

This package fixes the **deployment flow**, not the still-unverified OCCT runtime APIs, tessellation, or BIM synchronization. A successful artifact build verifies that the files are included; you must still run the actual browser kernel test.

## v4.5.3 fix
The build now creates site/.nojekyll automatically. GitHub web uploads may omit empty dotfiles, so .nojekyll is no longer a required repository input. OCCT WASM asset checks remain unchanged.


## v4.5.4 fix: Unexpected token `export` / factory not found

The installed `opencascade.wasm.js` is an ES module. The previous adapter injected the file as a *classic script*, causing a browser SyntaxError and no global factory. `occt-adapter.mjs` now imports it using `await import(js.href)` and calls the exported factory with the locally deployed WASM URL. Redeploy the updated module (the GitHub Actions build will copy it into `site/`).

Do not use the old classic-script global `window.opencascade` loader. After successful deployment, visit `occt-test.html` and explicitly run the real box/Boolean checks. This patch has been syntax tested, but runtime WASM initialization cannot be proven here without an installed distribution.
