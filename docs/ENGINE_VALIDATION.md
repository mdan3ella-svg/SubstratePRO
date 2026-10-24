# SUBSTRATE PRO v0.8 — Engine validation

- WebGL loads independently of OpenCascade. The bottom status explicitly identifies whether WebGL is active and whether exact geometry is enabled.
- `Enable Exact 3D` lazily initializes OpenCascade via `brepjs/quick`.
- Exact B-rep self-test: 10×10×10 mm box = 1000 mm³; subtract a 5×5×10 mm corner box = 750 mm³.
- The exact engine is opt-in because WASM can be expensive. Failed initialization preserves the interactive GPU *mesh preview* without mislabeling it as exact geometry.
- Exact kernel currently supports orthogonal wall/beam runs and axis-aligned solid elements. Oblique profiles are refused by the exact converter, not silently approximated.
- Hosted openings are only exact when the object has a valid `hostId` and its cutter size intersects its host.
- This release does not certify IFC round-trip or fabrication drawings.

## Deploy
`npm install && npm test && npm run build` then publish `dist/`. Validate browser console and exact engine status on deployed URL.
