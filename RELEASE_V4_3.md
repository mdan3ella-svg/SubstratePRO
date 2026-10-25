# SUBSTRATE PRO v4.3 — Section Camera, LOD 350 Detail Graphics

Based on the existing v4.2 coordinated BIM source, retaining original tools.

## Improvements

- Section camera placed in Plan now automatically fits a local clip volume around nearby elements, with 140 mm buffer and a configurable search-radius default of 1700 mm. Width, depth, height, base elevation and rotation remain editable.
- New **Auto-fit clip to connection** button recalculates the close-range view from the chosen camera point.
- Four coordinated local projections: isometric, front, right and plan.
- SVG detail views now contain overall horizontal/vertical measurement strings, dimension extension lines, source-linked element labels and a scale designation selector (1:5, 1:10, 1:20, 1:50).
- Existing BIM element identities, materials and detail readiness issues remain in the generated detail schedule.

## Engineering limitations

- LOD 350 is a *target*. Fasteners, plates, welds and reinforcement cannot be inferred reliably from beam/column envelopes; the detail generator reports missing authored specifications.
- Clip boundaries operate on display polygons. They are not capped B-rep cut faces and cannot establish a watertight section solid.
- The scale selector is a **nominal annotation** on current browser-rendered SVG. True 1:n plotting needs explicit millimetre viewports in a calibrated SVG/PDF sheet renderer.
- Automatic layout uses basic side labels and overall bounding dimensions; complex overlap-free dimension chains, detail callouts, datum levels and material keynote standards need additional work.

## Verification

`npm test` passes 90 / 90 tests, including 2 new section camera tests. JS syntax checks pass. Browser interaction and production Vite build are not verified in this environment.

## Deployment

Copy the complete folder contents into the SubstratePRO repository root; preserve all nested source paths and your functioning GitHub Pages Actions workflow. Run `npm install`, `npm test`, `npm run build` in CI and verify the Plan → Section Detail Camera → Auto-fit → Front/Right/Iso/Plan → SVG export workflow in a browser.
