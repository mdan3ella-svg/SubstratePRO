# SUBSTRATE PRO v4.7 — 3D Import and Raster Tracing Underlays

## Implemented
- New **Image Underlay** action in the main toolbar; PNG and JPEG are accepted.
- Raster references are embedded in the native `.substratepro` project as data URLs (up to 12 MB per source file).
- Underlays appear beneath the project plan graphics and grid and can be shown/hidden.
- Set real-world width in millimetres; height follows the image pixel aspect ratio. Specify X and Y origin, rotation, opacity, and lock state.
- Underlays do not take part in snapping or BIM element selection, enabling wall/line tools to trace cleanly over the reference.
- Existing 3D Import retains GLB, glTF, OBJ, STL and FBX session reference capabilities through the WebGL renderer. **3D mesh references are not persisted in the native document** in this release.
- Native drawing save/open retains image underlays. The SVG and sheet exports remain BIM-vector focused and do not currently package raster underlays.

## Usage
1. Click **Image Underlay** > **Add PNG / JPG**, then choose a source drawing or plan.
2. Set its real-world width using a known dimension. For example if the entire drawing spans 12 metres, enter `12000` mm. Rotation and origin can be changed later.
3. Set opacity (30–50% works well for most linework), keep Locked enabled, and click **Apply Placement**.
4. Use Plan drawing tools with snaps/grid; raster pixels themselves are not automatically vectorized or snapped.
5. Save the `.substratepro` file to retain the embedded image and its calibration.

## Scope and limitations
- This is a calibration-by-known-width workflow, not a two-point reference-distance calibration tool.
- JPEG/PNG underlays are visually aligned for tracing. They are **not** IFC/BIM objects, and no OCR or auto-tracing is claimed.
- Embedding images increases native project size. Large underlays can affect performance.
- Importing 3D geometry is still a reference-only process; editable parametric BIM conversion and native project persistence for imported meshes are not implemented.
- Existing v4.6 features are retained; regression tests pass but a live production build/browser test has not been completed in this environment.
