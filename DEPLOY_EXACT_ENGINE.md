# SUBSTRATE PRO — Exact OpenCascade deployment repair

The error `Failed to resolve module specifier 'brepjs/quick'` means GitHub Pages is serving raw JavaScript rather than a production bundle. Do not add bare npm imports directly to `index.html`.

## Required deployment

1. Keep the **contents of SUBSTRATE** at the GitHub repository root, including the hidden `.github/workflows/pages.yml` file. The workflow expects `package.json` at the root.
2. In GitHub **Settings → Pages**, select **GitHub Actions** as the source (not **Deploy from a branch**).
3. Commit and push to `main`, then inspect **Actions → Build and deploy SUBSTRATE PRO**. All steps must succeed.
4. Visit `https://mdan3ella-svg.github.io/SubstratePRO/` after successful deployment; hard-refresh (`Ctrl+Shift+R`).
5. In DevTools → Network, confirm JavaScript loads under `/SubstratePRO/assets/`, not `/SubstratePRO/src/`.
6. Select **Enable Exact 3D**. It should run the box volume (1000 mm³) and Boolean-cut (750 mm³) checks. If a test fails, keep mesh-preview mode; collect the error for geometry API correction.

## Local verification

```
npm install
npm test
npm run build
npm run preview
```

A successful build verifies bundling, not OpenCascade functionality. A successful *browser* self-test is still required to claim an exact engine.

## Troubleshooting

- `Cannot find module 'brepjs'`: package installation or lockfile issue.
- `Failed to resolve module specifier 'brepjs'`: raw-source deployment; switch to GitHub Actions.
- WASM `404`: check Vite base URL and emitted asset paths.
- WASM initialization error: check console and actual API compatibility.
