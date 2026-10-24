# SUBSTRATE PRO — Precision Drafting v2

This update keeps the original modular BIM workspace and adds snap candidates (endpoint, midpoint, crossing/intersection, nearest perpendicular from wall start), continuous clicked Wall Polyline with Enter to finish, wall centerline connection analysis (endpoint / tee / crossing), and axis dimensions linked to element parameter changes made in Properties.

## Test workflow
1. Choose **Plan**, click **Wall Polyline**, and click start + three consecutive corners. Press Enter. Each wall becomes an independent editable BIM object in the same model.
2. Turn on/off grid, endpoint, midpoint and intersection snapping. Inspect the snap status. Shift allows diagonal walls.
3. Click **Analyze Joins** to list wall-centerline connections.
4. Select a wall and choose **Dimension Selected**. Change its endpoints using Properties; the linked dimension updates.
5. Use 3D Iso to inspect geometry, then export SVG for basic plan annotations.

## Boundaries
This is a targeted BIM authoring improvement, not a complete construction-document certification. Join analysis does **not** generate true watertight miter geometry; walls remain independently authored solids. Source-linked dimensions currently update on Properties edits, not all geometry modification paths. Dimension offsets are schematic. True discipline annotation schedules, ISO graphic certification, code checks, hosted wall compound layers and IFC edit/export remain future work.

## Deployment
Use your working GitHub Actions Vite workflow. This package has a relative asset base for GitHub Pages repositories, including /SubstratePRO/ and /SubstratePRO-Toolworks/. Upload the contents to repository root, preserving src/, public/, tests/.
