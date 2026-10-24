# SUBSTRATE PRO — Drawing detail and intelligent annotation upgrade

This package is based on the original modular BIM drafting workspace, not the alternative launcher/legacy dashboard.

## Implemented
- Visual drawing-detail presets in Plan: schematic (LOD 200 equivalent), coordination (LOD 300 equivalent) and detailed (LOD 350 equivalent). These are display presets, not certified BIM LOD designations.
- Discipline-specific line color, weight and fill for architectural, structural, mechanical, plumbing, electrical, civil and general objects.
- Plan tags derived from each object's BIM discipline, type and persistent ID.
- Associative on-screen dimensions for linear building objects; rendered lengths update when their endpoints change.
- Material hatch overlays clipped to each parametric footprint.
- Exported SVG plans include discipline tags, line styling, hatches and wall/linear dimensions.
- Existing drawing, object property, Plan/3D, and project save workflows preserved.

## Limitations
- Hatches are schematic; ISO 128/129, CSA, IBC, NBC, AIA/NCS layer conventions and professional documentation standards are **not** automatically certified or fully implemented.
- Tags are automatically generated on Plan; manual leaders, collision avoidance, per-discipline symbol libraries and detail bubbles are not implemented here.
- The existing 3D renderer remains an approximate prism/mesh display; the Plan LOD setting does not add tessellation or B-rep topology detail to the 3D renderer.
- The SVG output carries model-derived annotations but does not yet provide a full sheet/title block or scaled PDF print specification.

## Deployment
Extract at repo root, preserving `src/`, `tests/`, `public/`, `.github/`. Use one GitHub Actions Vite deploy workflow publishing `dist/`. Run `npm install && npm test && npm run build`.
