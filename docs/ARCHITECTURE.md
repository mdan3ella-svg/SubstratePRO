# Architecture and upgrade pathway

- `core/document-model`: one document, persistent object IDs and material/dimension/discipline metadata.
- `core/transactions`: copy-on-write document transactions, undo and redo.
- `core/geometry`: simple parametric footprint polygons and extruded prisms (NOT exact solids).
- `core/dependencies`: host/reference traversal for safe dependent deletion; hosting UI remains a future milestone.
- `detailcore`: profile/hatch/section primitives, quantity formulas and basic annotations.
- `disciplines`: tool registry by AEC discipline. Equipment/MEP are concept geometry, not fabrication models.
- `render-2d`, `render-3d`: deterministic projections from shared document; no duplicated geometry.
- `interoperability`: validated native JSON import/export. IFC/DXF not implemented.
- `plot`, `presentation`: SVG and 4-view print review.
- `audit`: document-schema and basic geometric diagnostics, NOT IBC/NBC compliance.

**True-BIM production roadmap**: (1) integrate WASM B-rep kernel, store solids as document assets with stable topology naming, (2) constraint solving and openings, (3) IFC semantic entity mapping and round-trip QA, (4) spatial clash detection and schedules with classification libraries, (5) drawing scale / hatches / sections using exact geometry, (6) broad browser and CI testing. Do not label this build an IFC-certified BIM authoring system.
