# SUBSTRATE PRO v3.3 — Professional Modeling & Drafting Workflow

This release extends the existing v3.2 modular BIM authoring source. It does not replace the original canvas, modeling tools, levels, grids, roof, facade, room, layers or document save workflow.

## Integrated additions
- Searchable **Assembly / Block / Symbol Library** in the left dock, organized by category. Entries have unique stable catalog codes, BIM discipline, type, dimensions, material, and classification.
- Inserts are committed to the shared document model and therefore participate in native project save/open, undo/redo, level assignment, 2D plan, 3D visualization, model browser, element properties, and schedules.
- Hosted door/window library entries route to the existing host-wall placement tool instead of placing invalid unhosted objects.
- **Edit Handles:** With Select active in Plan, click an object, then drag a square endpoint/corner handle to change geometry; drag its body to move. The final operation is committed once through the transaction system so linked dimensions update through the existing association updater.
- Layer locks respected when selecting for handle editing; previously defined visibility remains active.
- **Assembly Table of Contents:** model-derived report command plus construction-sheet table of contents; reports contain catalog reference, object name/type, level, and material.

## Workflow
1. Select Architecture/Structure/MEP discipline as appropriate or search the library.
2. Select a catalog entry; choose **Insert Selected**. Non-hosted assemblies initially insert at origin in the current level; move them with the Select tool. Door/window entries activate the hosted opening placement tool.
3. In Plan, click an element; toggle **Show editable end/corner handles** and drag either square to change its endpoints (diagonal or rectangular depending on object type). Drag its body to translate the entire object.
4. Use **Assembly Contents** and **Generate Sheet** to inspect the model-derived components list.
5. Continue through 3D Iso, schedules, audit, and plot. Existing v3.2 building system creators remain accessible.

## Important limitations
- This is a functional workflow improvement, not a certified professional BIM/CAD system. End/corner handles are geometry controls; no automatic geometric constraints/host reflow from handle edits are promised.
- One-click catalog entries are schematic parametric blocks, not manufacturer-certified Revit families or construction-ready engineering assemblies.
- IFC editable STEP round-trip, exact topology checks, field-calibrated plotting, drawing issue management, and automated compliance approvals are not part of this release.
- Current project copy has no installed node_modules; the Vite production build and live browser gesture testing were not performed here. Run `npm install`, `npm test`, `npm run build` in the cloned project and verify in Chrome before using construction documents.

## Deployment
Extract folder contents into your SubstratePRO repository root, preserving `.github/workflows/pages.yml`, `src`, `public`, and `tests`. GitHub Pages must publish the **Vite-generated `dist`** folder using the existing workflow. Vite uses relative assets (`base: './'`).
