# SUBSTRATE PRO v4.6 — BIM ↔ OpenCascade Integration

This edition adds **BIM ↔ OCCT** to the main SUBSTRATE PRO top toolbar.

## Workflow
1. Load/draw model in SUBSTRATE PRO `index.html`.
2. Choose `BIM ↔ OCCT`, then `Send BIM → OCCT`.
3. In the embedded CAD workspace select `Build OCCT shapes`; with the published OpenCascade WASM assets, it reconstructs real B-rep boxes from supported BIM elements and attempts per-face tessellation to WebGL. If meshing fails, the workspace shows a clear error rather than claiming success.
4. Update a feature envelope in CAD workspace; choose `Apply CAD parameters → BIM` on the main workspace. An initial click may request the CAD data, followed by a second click to apply the received record. Save the main BIM project to persist parameters.
5. The CAD workspace's quantities and section controls regenerate from parametric envelopes. They are **not exact B-rep Boolean-derived construction sections**.

## Supported shape mappings
Axis-aligned wall and beam centerlines (thickness + height), rectangular slabs, and rectangular columns. Diagonal walls, window and door cut-outs, roof profiles, compound wall assemblies, arbitrary face edits and Boolean-result topology are excluded from automatic synchronization. Unsupported objects are reported by ID. OCCT B-rep results remain in the CAD workspace; returning them as editable BIM topology is not implemented.

## Deployment
Upload all files preserving paths and `.github/workflows/deploy.yml`; use GitHub Actions to install and publish the pinned `opencascade.js@1.1.1` JS and 65 MB WASM. Do not upload only `index.html`. Test `occt-test.html` in the hosted browser before using the CAD workspace.

## Verified
Ten source tests including geometry mappings and overload regressions; JS syntax checks on changed modules; output packaging check. **Not verified here**: live Chromium WASM tessellation, main-to-CAD interaction, exact curved-solid topology, IFC exchange, or manufacturing-grade construction sections.
