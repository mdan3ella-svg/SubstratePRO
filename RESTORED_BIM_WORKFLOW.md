# SUBSTRATE PRO v4.6.1 — Plan → 3D BIM workflow restoration

This fixes the workflow visibility/regression in the v4.6 bridge. The original main workspace is still the authoring environment; OCCT is an optional precise-solid workspace.

## How to draw and see 3D walls
1. Choose **Start BIM Wall Drafting** from the launcher (or Enter Workspace and select **1 · Draft Walls** in the left panel).
2. Click connected corners in the plan. Use Finish Wall ↵ or press Enter to complete.
3. Choose **2 · View 3D** to see the walls with their configured thickness and height. Choose **Back to Plan** to edit them.
4. Use the existing Slab, Beam, Column, Door and Window tools, grid snaps, level controls and properties editor.
5. Use **BIM ↔ OCCT** separately to synchronize supported axis-aligned solids for exact CAD operations. The OCCT workspace does not replace the main drafting viewport.

## Changes
- New directly visible Plan → Parametric 3D BIM workflow inside left sidebar (not floating over the viewport).
- One-click startup shortcut to original Wall Polyline drawing tool, using the original app's controls.
- One-click Plan/3D view switching, and sample loading.
- Corrects old hardcoded on-screen label `B-REP NOT INSTALLED` to identify optional OCCT bridge.
- GitHub Pages build copies new `bim-workflow-restore.mjs` module.

## Verification
- 10 source regression tests pass.
- New ES module passes `node --check`.
- Live drawing gestures, 3D redraw, and OCCT runtime are not browser-tested in this package.
- Does not claim exact B-rep cuts in the primary BIM viewport or full native topology sharing.
