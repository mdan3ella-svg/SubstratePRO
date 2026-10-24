# SUBSTRATE PRO · Precision BIM v3 (development edition)

## Implemented and source-tested

- **Mitered wall-chain polygon geometry**: when successive wall segments share a chain ID and endpoint, the planar edges terminate on common miter positions (up to a configured miter limit). Wall polygons are recomputed from their edit parameters for Plan, 3D mesh extrusion, SVG and 4-view review. Cases with collinear/very acute geometry generate issues instead of silently claiming a clean joint. Only end-to-start and start-to-end joints within a chain are mitered; T-junctions and global unions are not resolved.
- **Transaction-level associative axis dimensions**: commits, replace, undo and redo update dimensions linked with sourceId, including their measurement labels, independent of which UI editing command changed an element. Orphaned dimensions are flagged.
- **Structural connection candidate schedule**: identifies proximity of beams and columns, elevation discrepancies, and persistent parent element IDs. Deliberately leaves bolts, plates, welds, applied loads and structural design blank and marks ENGINEERING REQUIRED.
- **Building-code information review**: reports missing occupancy, jurisdiction, edition, construction type, sprinkler, load, fire separation, egress and door data. There is NO claimed automatic regulatory compliance, and NO PASS result is issued.
- **IFC semantic mapping JSON**: export editable native element attributes with an IFC class mapping, and an API for round-tripping mapped attributes by stable SUBSTRATE element ID. This is **not an IFC STEP or IFC4 export**. The existing `web-ifc` importer still extracts selected source entities and can re-export the *unaltered original* IFC bytes; it does not reconstruct arbitrary imported IFC solids into editable objects.
- **UI additions**: Right panel now contains documentation checks, beam-to-column candidates, and neutral JSON semantic export. All prior v2 tools and GitHub Pages workflow retained.

## NOT implemented / validation required

1. A closed, watertight **fused multi-wall solid** and persistent OCCT face IDs. Individual extruded walls are closed meshes but share coincident miter faces; they are not a single topological manifold. True fused B-reps require OCCT Boolean union and watertight validation in the browser.
2. Geometry-hosted, editable complex steel or concrete connections, including reinforcement, bolts and welds, tolerances and certified shop drawings.
3. Certified ISO 128 / ISO 129 / ISO 19650 drawing/management compliance, because notation, sheet sets, dimensional tolerances, naming, approval, and jurisdictional requirements have not been fully implemented or assessed.
4. Complete jurisdiction/edition-specific IBC or NBCC code checks. This release only performs data-completeness screening.
5. Full lossless **editable IFC** import and IFC STEP export preserving GUIDs, psets, placements, materials, containment, assemblies and shape representations.

## Verification

`npm test` passes all 42 current source tests, including 5 additional tests for v3. JavaScript syntax checked using `node --check`. Production Vite build needs dependencies installed first (`npm install` or `npm ci`) and has not been completed in this container (no local `vite` executable). Browser interaction is unverified.

## GitHub Pages deployment

Extract ZIP contents into the `SubstratePRO` repository root. Keep the original `src/` tree and only one active Pages workflow (`.github/workflows/pages.yml`). The Vite config uses relative `base: './'` for deployment under either repository name. Actions should install npm dependencies and build `dist/`.
