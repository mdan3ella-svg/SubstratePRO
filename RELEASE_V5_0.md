# SUBSTRATE PRO v5.0 — Vector Construction Documentation

## Changes
- Fixed plot-scale logic: SVG physical output dimensions use millimetres and `data-plot-scale="1:N"`; model coordinates remain mm.
- 2.5 mm printed dimension / tag typography is converted to model units using `2.5 × plotScale`. Line weights, leader lines, layout clearances, and dimension lanes also follow the chosen plot scale.
- Shared annotation-layout engine remains associative with wall measurements, overrides, hatches and notes.
- Construction sheets preserve the natural physical SVG size instead of stretching drawings to fit. The sheet includes print-at-100% instruction. Oversize drawings are *not* silently shrunk; choose an appropriate scale or sheet.
- Added technical vector SVG export of front, rear, left and right orthographic views and the isometric axonometric view. These are parallel projections of native BIM primitives at the same plot scale. Use the new **Export Ortho SVG** toolbar control.
- Maintains material-specific hatch patterns in Plan; 3D orthographic exports retain model edge linework and identifiers rather than using material-free flat rectangular poche.

## Constraints
- Technical SVG projection currently displays projected mesh edges, including edges that a professional hidden-line solver should conceal. It does not include exact B-rep visible-edge extraction, section fill caps, fabrication-level connection graphics, or automatically dimensioned elevations. Material hatching on elevation faces is not yet implemented.
- Documented drafting styles are graphical conventions rather than an ISO certification. LOD 350 requires actual modeled connection-level data.
- Browser print dialogs must use **Actual size / 100%**; disable fit-to-page and verify using a physical scale bar before issue.
- Browser testing and Vite production build were not completed in this environment; source tests and JS syntax checks were run.
