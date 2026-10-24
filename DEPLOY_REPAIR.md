# SUBSTRATE PRO BIM Detail — deployment and corrections

The GitHub Pages base path is `/SubstratePRO-Toolworks/`, not `/SubstratePRO/`.
The main workspace is the original modular BIM drafting environment.

Updated drafting-mode selection, model-derived tag/dimension overlay, and SVG/export plus orthographic review now share the selected drafting settings.
These are schematic graphics and not verified ISO/IBC regulatory documentation.

## Deployment
Copy the contents of this folder to the root of the GitHub repository. Remove any *other* Pages-publishing workflow. Choose GitHub Actions in Settings > Pages. The included workflow runs `npm install`, `npm test`, `npm run build`, and publishes Vite `dist/` without a nonexistent npm-cache lockfile or `build:site` command.

After deploy visit `/SubstratePRO-Toolworks/build-identity.txt`, then test Plan > Wall, drag a 4m wall, select it and adjust thickness, switch to 3D Iso, and export SVG. Test each LOD and annotation toggle with the exported file.

Remaining limitations: WebGL interaction and OCCT live runtime are not verified here; material hatches and dimensions are provisional graphics, not professional construction-document validation.
