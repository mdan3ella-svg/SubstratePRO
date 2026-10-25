# SUBSTRATE PRO v4.4 — Zoom and Gizmo Repairs

Based on v4.3 section LOD 350 release. Retains original BIM document and application structure.

## Fixed
- Pointer-anchored 2D Plan wheel zoom (keeps the location beneath the cursor stable).
- Increased Plan zoom range with finite limits, while preserving panning and Fit.
- Separate move gizmo at selected object's geometric center, plus existing endpoint resize handles.
- 3D viewport orientation gizmo fixed to the bottom-right corner, following camera rotation, with world X/Y/Z labels.
- Stable OrbitControls pan/dolly zoom limits for both perspective and orthographic projections.
- Model Fit resets projection framing and uses the preset view up direction.
- Gizmo overlays are visual (3D orientation axes do not modify BIM geometry); 2D center grab uses the existing transaction-based move handler.

## Testing
- 94/94 Node source tests pass, including four v4.4 regression tests.
- Changed main.js and webgl.js pass node --check.
- A live WebGL/browser test and Vite production build have not been run here.

## Installation
Copy the contents of this project directory to the root of your SubstratePRO repository, not the enclosing directory. Preserve `.github/`, `src/`, `public/`, and `tests/`. Continue publishing Vite dist/ using one GitHub Pages Actions workflow.
