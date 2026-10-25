# SUBSTRATE PRO v4.1 — Multi-object Modify & Curved Wall

Base: v4.0 inspectView3D modular BIM project. All earlier BIM workspaces, views, annotations, section-detail cameras and splash functionality retained.

## Modify panel

- Crossing Select: draw a rectangle; any element whose plan bounding box intersects the rectangle is selected.
- Window Select: only elements fully enclosed by the rectangle are selected.
- Select Visible: selects all active plan-visible, unlocked elements.
- Shift+click: extends selection; subsequent rectangle selections replace it.
- Move Group: numeric ΔX/ΔY, persistent object IDs.
- Copy / Paste: application clipboard, pasted components get fresh persistent IDs, prompted placement offset.
- Mirror: reflect chosen components about X=constant or Y=constant, with basic door-hand reversal.
- Rectangular Array: rows, columns and X/Y pitch, copies receive new IDs.
- Chamfer: two connected linear elements (first end touches second start); trims endpoints and inserts a diagonal connector.
- Fillet: two connected linear elements; inserts 10 short straight segments approximating the fillet arc; not a native analytic circular arc.
- Curved Wall: pick start and end of chord and specify arc rise/sagitta; generates 16 linked parametric wall segments for 2D/3D model and schedules.

All transactions use the existing Store.commit, keeping undo/redo and associative updates.

## Limitations / QA

- Crossing selection currently tests plan footprints by AABB, not full polygon intersection.
- Copy/paste deliberately drops sourceId/hostId relationships to avoid pointing to unrelated objects. Hosting relationships must be re-established where required.
- Chamfer/fillet require endpoint-connected objects in forward order. No general arbitrary trim/extend solver yet.
- Curved walls are faceted 16-segment polyline assemblies, not watertight curved B-reps or true analytic arcs. The 3D viewer follows segments.
- Multiple elements are moved by numeric offset, not by a multi-object drag gizmo. Existing single-element grab handles remain.
- 84 source tests passed. Production build not run (Vite not installed in this environment). No claim of browser UI validation.

## Deployment

Copy the contents of the version folder to the root of https://github.com/mdan3ella-svg/SubstratePRO and let the existing Vite + GitHub Actions workflow publish it. Verify Select Visible > Move Group > Undo, Crossing Selection, array, mirror and curve creation on the deployed site.
