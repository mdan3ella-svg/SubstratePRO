# SUBSTRATE PRO v3.8 — Orthographic & Perspective Camera Upgrade

## Actual changes

- Added a dedicated Three.js OrthographicCamera and switched the existing WebGL viewport to parallel projection for **Iso, 3D Top, Front, Rear, Right, Left**.
- Added a dedicated **Perspective** view using PerspectiveCamera with OrbitControls (left drag orbit, right drag pan, mouse wheel dolly/zoom).
- Added **Reset Camera** control and extended Fit to frame model extents in both camera types.
- Added Z-up camera preset definitions, a shared orbit target across projection switches, and resize-aware orthographic frustum.
- Preserved the existing 2D Plan canvas for drafting, including levels, cut plane and annotations. The new 3D Top is a distinct 3D parallel-projection view.
- The 2D orthographic review sheet renderer remains as before; it is a vector-style projected view, not a hidden-line solver.

## Validation

- `node --check` passed on modified JavaScript.
- `npm test`: **72 passed, zero failed**, including three new camera tests.
- Production Vite bundle and interactive browser-level rendering have **not** been verified in this environment.

## Known technical limitations

- The existing 2D elevation/review renderer can show projected interior/rear outlines; no robust occlusion or edge classification is added in this release.
- Three.js free orbit is available only after the WebGL viewer initializes successfully.
- Orbit changes the camera orientation but not the project's BIM geometry, level, or view metadata.
- The camera preset framing uses a conservative whole-model bound and may leave additional margins on long narrow buildings.

## Install

Upload the extracted project contents to the `mdan3ella-svg/SubstratePRO` repository, preserving `src`, `public`, `tests` and `.github`, with GitHub Pages deployed from Vite `dist` through Actions. Check 3D Iso -> Front -> Right -> Perspective -> Fit -> Reset Camera and switch to Plan to confirm drafting input remains active.
