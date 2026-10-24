# SUBSTRATE PRO GitHub Pages deployment repair

The repository has the original modular BIM `index.html` and `src/app/main.js`, but the active OCCT GitHub Pages deploy workflow calls `npm run build:site`, whose `scripts/build-site.mjs` published only a narrow list of legacy files. As a result, deployed Pages did not match the repository main page and lacked the BIM `src/` tree.

Replace `scripts/build-site.mjs` with the included version, preserving the repository-relative path. This publishes the original modular BIM HTML, its `src/` assets, and the optional OCCT artifacts. `vite.config.js` also corrects the project's base path, but the current Actions workflow uses the custom site builder, not Vite.

Commit to `main`, verify the GitHub Pages Actions run succeeds, then visit `/SubstratePRO-Toolworks/deployment-status.json`. It should show `"app":"original-modular-bim"`. Then load the homepage and test wall drafting and 3D Iso. This is a publication repair, not a certification of runtime drawing and 3D features.
