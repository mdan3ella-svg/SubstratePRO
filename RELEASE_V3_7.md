# SUBSTRATE PRO v3.7 — Coordinated Building Hierarchy

## Implemented

- A model-level construction stage sequence: datum → foundations → frame → slabs → walls/envelope → hosted openings → roof → MEP → interiors → site → documentation.
- Named structural grid axes/bubbles in the Plan canvas, generated from the same grids as framing.
- Grid-intersection snapping when enabled, while preserving existing endpoint/grid snapping.
- Parametric foundation pads at structural grid intersections, columns/beams constructed from actual grid nodes, and slabs spanning the defined grid footprint.
- Discipline-default BIM layers for structural, architectural, mechanical, plumbing, electrical and civil elements.
- Each newly drafted element receives active level, layer, stage and phase information. Existing imported objects remain intact.
- Coordination report: missing grids, missing host relationships, unknown levels/layers, off-grid columns, nonnumeric grid axes, and per-stage element counts.
- Original 2D wall drafting, 3D views, rendering, material libraries, families, sheet production and undo/redo are retained.

## How to use

1. Start the existing project, choose Level 1, then Generate Grids in Building Systems.
2. Review X and Y structural grid bubbles on the plan. Add additional levels and their elevations/heights.
3. Under Project Hierarchy, use Grid Foundations → Grid Columns & Beams → Grid Floor Slab. These use the *same* generated grid axes.
4. Draw intelligent wall polylines; insert hosted doors/windows. Add roofs from Building Systems.
5. Create rooms, facades, furnishings and MEP elements in their discipline tabs, then add civil/landscape elements as available.
6. Run Coordination Audit to list stage quantities and missing level/host/grid associations.

## Limits

The construction stages aid workflow but do not force strict sequencing. Foundation geometry is a conceptual pad-footing envelope; loads, bearing capacities and pile systems are not engineered. Beams/columns are placed on the datums but joints, offsets and load paths are not structurally designed. Rooms are not automatically identified from wall loops. Roof slopes are metadata only in the existing generator. MEP connection topology and clash detection are not complete. Building code/IFC compliance are not certified. No production browser validation was performed in this environment.

## Verification

69 Node.js source tests passed. Modified JS modules passed `node --check`. Vite production build requires installing project dependencies in the deployment environment.
