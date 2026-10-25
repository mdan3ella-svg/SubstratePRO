# SUBSTRATE PRO v4.0 — inspectView3D Section Detail Camera

## Authoring
- New **Section Detail Camera** command next to the existing 3D/plan view buttons.
- Click a location in **Plan** to place a camera; edit clip width, depth, bottom elevation, height, angle and detail title.
- Regenerate focused plan, front, right and isometric orthographic images from the same model geometry.
- Element IDs are retained in the local detail schedule. Missing structural profile and connection information produces explicit warnings.
- Save a standalone HTML construction detail sheet containing SVG drawings or print the view sheet at nominal A3 landscape dimensions.
- Press Escape to cancel camera placement.

## Limitations
The clipping algorithm intersects face polygons with a rectangular volume. It does not create capped watertight section solids or derive structural fabrication connections. The generated detail supports LOD 350 *review intent*, not verified BIMForum LOD compliance. It cannot synthesize anchor plates, bolts, weld sizes, reinforcement, concealed construction, manufacturer profiles, or code compliance absent source data. The exported HTML is standalone (no runtime CDN), but its sheet scale is not yet calibrated to actual 1:n print size.

## Verification
79 node source regression tests passed, including four new clipping / projection / schedule tests. JavaScript syntax checks passed. Browser interaction and Vite production build are not verified here.

## Manual QA
1. Choose Plan. Click **Section Detail Camera**; click at the junction of a column and beam.
2. Set clip width/depth to 2500 mm and regenerate; note schedule includes intersected objects.
3. Compare orthographic elevations with the model; confirm changing rotation changes the local view.
4. Save the HTML detail sheet, open it offline and test printing.
5. Verify Escape cancellation, and switch back to regular plan/wall drawing tools.
