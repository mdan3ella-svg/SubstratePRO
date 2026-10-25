# SUBSTRATE PRO v3.6 · Plan Hierarchy & Drafting Clarity

- Architectural Plan uses the active building level and an editable cut height (default 1200 mm). Upper roof objects do not obscure walls until **Show overhead / roof elements** is enabled.
- Grids and other model objects remain in the shared project; this is a view filter, not destructive deletion.
- Selection/movement uses a 6 CSS-pixel drag threshold; clicking selects without immediately relocating an object. Endpoint grips also require actual drag motion. All committed edits retain undo/redo behavior.
- Screen-space dimension offset and annotation text are bounded for on-screen legibility, independent of model unit size; sheet scale remains a separate export concern.
- Source tests cover active storey, roof hiding, drag threshold and label metrics.

## Known limits
- Overhead roof display is a visibility toggle, not a dashed overhead line convention.
- Dimension text and offsets are screen-readable but plotting-scale typography, collision-free auto dimension chains and ISO-calibrated print size still require further implementation.
- The production Vite build and interactive WebGL/browser behavior were not verified in this environment.

## Deployment
Copy the complete folder contents to the root of the SubstratePRO GitHub repository, preserving the installed Pages Vite deployment workflow. Run `npm install`, `npm test`, `npm run build` in GitHub Actions. Open Plan, set Active Level to L1, and verify roof is hidden until the overhead checkbox is enabled.
