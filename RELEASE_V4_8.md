# SUBSTRATE PRO v4.8 — Plan References & Underlay Alignment

- Fixes image-underlay rotation using an exact rotated affine basis, correctly following Plan's inverted Y axis.
- Plan Fit now includes BIM objects, visible calibrated PNG/JPEG underlays and imported 3D reference extents.
- GLB/glTF/OBJ/STL/FBX imports in the 3D viewer also create a plan-view projected mesh-edge overlay for tracing and alignment; edges are capped/sampled at 15,000 per imported model to limit drawing cost.
- This mesh projection is a geometry reference, not a BIM floor plan or section: it may contain hidden/back edges and does not cut the model at the active story height.
- Imported 3D meshes and the derived plan projections remain session-only; save their original files. Embedded raster underlays persist in native SUBSTRATE saves.
- Scale assumption: imported 3D scenes are interpreted in metres, multiplied by 1000 for SUBSTRATE's mm Plan coordinate system. STL/OBJ/FBX formats may require source-unit normalization.
- Check a known dimension on imported models before using their footprint as a drafting reference.
- Raster underlays remain image references and cannot be snapped to automatically.
