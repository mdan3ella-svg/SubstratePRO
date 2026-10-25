# SUBSTRATE PRO v3.9 — Associative Annotation Layout

This upgrade replaces centered tags and fixed one-size dimension offsets with a common collision-aware annotation planner shared by Plan Canvas and SVG export.

- Auto dimensions reserve measurement lanes outside element footprints; offset is calculated in screen-space for the canvas and drawing-space for SVG.
- Tags are placed around object extents with multiple candidate sides and progressively larger spacing; leader lines reconnect them to their model elements.
- Dual-line material/size descriptions use a consistent text height with a white background mask to avoid linework crossing labels.
- Stored dimension objects still follow their source IDs through the existing transaction/dependency model, and SVG dimensions have data-associative-source attributes.
- SVG extents expand to fit annotation boxes, reducing cropping of external dimension strings.
- Existing construction drawing, BIM geometry, layers, materials, and 3D camera code remain in place.

## Important limitations

The collision planner uses bounding-box heuristics and can still produce overlaps in especially dense drawings (it marks overflow internally). It does not implement fully standardized dimension-chain selection, user-pinned draggable annotations, paper-space dimension styles, obstacle-aware leader routing, or certification to ISO 129-1/ISO 5455. Canvas and SVG calculate placement at different output scales, so line breaks and individual leader positions may vary. A production Vite build and live browser QA have not been verified.

## Deployment

Use your existing single GitHub Pages Actions deployment; extract the whole project into the root of `mdan3ella-svg/SubstratePRO` and publish Vite `dist` as before. Test two walls near each other, hosted doors/windows, a selected element dimension, then SVG export at several view zoom levels.
