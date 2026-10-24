# SUBSTRATE PRO — GitHub Pages core fix (v0.6.1)

## Deploy without npm (working essential drafting tools)
Upload the **contents** of this folder to the GitHub repository root, including `index.html` and `src/`, then set **Settings → Pages → Deploy from a branch → main / (root)**. Do not open `index.html` via `file://`; use HTTPS or a local web server. The page must load `src/app/main.js` over HTTP with status 200.

**Core buttons no longer depend on the OpenCascade, Three.js, or IFC packages to initialize.** The default 3D is the existing CPU-drawn projected view, not a GPU renderer. Click **Enable Exact 3D** only in an npm/Vite-built deployment that bundles the optional packages. If unavailable, the application stays functional in core mode and shows diagnostics.

## Advanced build
Run `npm install && npm run build`, then publish the **generated `dist/` contents**, not source files. The Vite configuration sets `base: './'` for GitHub Pages project paths. `npm run dev` supports development.

**Limitations:** this release repairs static hosting and controls. It does not certify the prior exact-B-rep adapter, IFC parsing, Boolean correctness or editable IFC round-trip; these still need runtime integration tests.

# SUBSTRATE PRO | Vertascan AEC Detail Studio

Modular, static-hosted AEC **conceptual BIM** application. Unlike a purely decorative dashboard, this build shares a validated semantic document among drawing, editing, viewport projection, detail extraction, quantities, audit, and publishing actions.

## Run locally

Use a local HTTP server because JavaScript ES modules cannot reliably load from `file://`:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`. For GitHub Pages, publish the repository root (`index.html` and `src/` together). No build step, login, server API or paid dependency is necessary.

## Implemented

- Semantic objects (AEC discipline labels, type, material, IDs, level, dimensions, coordinates)
- Parametric prism / footprint geometry kernel with deterministic 2D, isometric and elevation projections
- Creation (plan drag), selection, move, duplicate, delete, editable properties
- Grid visibility, snapping and interval; pan, fit, mouse wheel zoom
- Transaction history with undo/redo; validated project JSON save/open
- Material colors, basic sections, conceptual quantities, consistency audit
- SVG plan output, 4-projection review sheet and print/PDF using the browser
- Six discipline tool libraries and tests for core behavior

## Capability boundaries — important

This is **not an exact B-rep solid modeling kernel**. It supports limited parametric extrusion prisms and semantic BIM-like metadata; it does not provide OpenCascade Booleans, surface/NURBS operations, topologically correct wall joins, hosted door openings, true IFC round-trip or certified construction-document quantities. The isometric view is a projected 3D solid preview, not a GPU/WebGL orbiting camera. Architectural/MEP element types beyond the basic prisms are geometric placeholders and should not be mistaken for fully engineered components. Exported drawings require professional verification.

The folder hierarchy provides stable boundaries for adding OpenCascade.js, web-ifc, true host relationships, drawing standards and more sophisticated specialty engines in future iterations.

## Tests

```bash
npm test
```

See `docs/ARCHITECTURE.md` for interfaces and expansion strategy.

## v0.6 — GPU / exact kernel integration (experimental)

**Dependency installation is required.** The source now imports `three`, `brepjs`, `occt-wasm`, and `web-ifc` through npm/Vite, with a real `WebGLRenderer` and `OrbitControls`, OpenCascade-backed B-rep adapter, and a web-ifc STEP parser. These packages are not checked into the archive. GitHub Pages must publish the **built `dist/` output**, not the unbundled root modules.

```bash
npm install
npm run dev
npm run build
```

For GitHub Pages configure Vite's base path according to the actual repository path and deploy `dist/`. Without successful npm installation and WASM loading, exact geometry and the GPU viewport cannot run. No synthetic or mesh-only Boolean fallback is presented as exact geometry.

### Current exact modeling implementation

- Runtime B-rep primitives and solid subtraction via `brepjs` backed by `occt-wasm`; host cutters are identified by `hostId` and represented as elements of type `opening` or `void` in the document.
- Tessellation strictly for GPU display, with orbit, pan, zoom, picking and orthographic-direction camera presets.
- Current document construction tools are still axis-aligned rectangular/linear footprint elements. Complex rotated solids, profile sweeps, manifold healing, and complete host/edit workflows remain incomplete.
- Full B-rep topology and application geometry conversion **have not been tested against an installed WASM runtime in this environment**; compatibility or B-rep validity at runtime is not guaranteed until tested with the locked packages.

### IFC and schedules: explicit scope

- The web-ifc command parses an uploaded source IFC and lists recognized entity IDs, classes, GUIDs, and names; you can export that **unchanged original** IFC byte-for-byte. This is **not editable IFC round-trip** and is not an IFC geometry importer/exporter.
- The existing quantity report is indicative. It is **not certified** and must not be used as a code-compliance or signed takeoff schedule. Engineering certification is not a feature a geometry library can provide automatically.

### Verified in this delivery

- Static JS syntax checking and original Node tests run without third-party dependencies.
- `npm install`, WebAssembly startup, WebGL camera interaction, exact solid subtraction, and full IFC geometry conversion could not be executed here because package-registry network resolution failed.


## v0.7 startup and engine repair

The application starts in **Plan** view; select **Wall** or **Slab**, then click and drag in the white canvas. A **Load Sample** button creates a BIM document with walls, slab, column and beam so view changes, selection and schedules can be checked immediately. This core runs without external packages when served over HTTPS or localhost.

**Exact 3D remains optional and must be built with npm.** `npm install && npm run build` and deploy `dist/`. The exact adapter now verifies a 10×10×10 mm B-rep solid's volume, uses shape-local meshing, translates Boolean cutters correctly and rejects unsupported oblique prisms instead of silently substituting boxes. Hosted openings remain at adapter level; editable IFC round-trip and certification remain unavailable.

If the engine fails, the error appears in DetailCore & Audit. Drawing continues in 2D/isometric model mode. Test the built WASM runtime on the deployed domain before relying on the exact results.

## v0.8 Interactive WebGL and Exact B-rep

- On launch, Three.js is loaded separately from the exact CAD kernel. 3D Iso and elevation presets use WebGL (drag to orbit, right/middle drag to pan, wheel to zoom, click to select).
- `Enable Exact 3D` initializes `brepjs/quick` / OpenCascade WASM and runs box-volume and Boolean-cut self-tests. An explicit engine-status label distinguishes **WebGL mesh preview** from **exact OCCT active**.
- Exact B-rep model conversion currently covers axis-aligned geometry; oblique wall runs report an error and are not silently converted to false solids.
- Run `npm install`, `npm test`, `npm run build`; deploy the **dist** output. Direct hosting of unbundled source files does not resolve bare npm imports.
- npm installation, browser WebGL rendering and WASM execution could not be validated in the authoring environment because the npm registry was unreachable. Do not designate the exact engine production-verified until the hosted self-test passes.

## v0.9 — Wall snapping and axes

In Plan, wall starts snap to existing wall/line endpoints before grid intersections (12-screen-pixel tolerance). New walls are constrained to horizontal or vertical axes by default; hold **Shift** while drawing to create a diagonal wall. The Drawing Standards panel has independent Endpoint Snap, Grid Snap and Orthogonal Walls toggles. The snap indicator displays the active mode and wall length during dragging. Snapping operates in millimetres in the shared document model and is independent of WebGL preview.

Tests: `npm test`. For hosting run `npm install && npm run build`, then deploy `dist/`. Exact B-rep and GPU runtime support remains dependent on installed third-party modules and browser capabilities.

## v1.1 interaction repair and deployment

- Select a discipline (Architecture, Structure, Mechanical, Plumbing, Electrical or Civil), then choose a tool.
- In Plan, **click a start point then click an end point**, or press and drag. Press Escape to cancel. Wall axis-lock defaults on; hold Shift for a diagonal wall.
- Model changes update the single shared document. Grid snap, endpoint snap, thickness and height are editable in the left rail.
- If OpenCascade initialization fails, the Plan editor remains usable; an exact B-rep claim requires a successful live Boolean/volume self-test.
- For GitHub Pages and comparable static hosts, run `npm install && npm run build` and publish **dist/** with an appropriate Vite base. Do **not** deploy the raw development `src/` directory as a substitute for the built bundle.
- `npm test` checks geometry and tool connections. Live WebGL/WASM end-to-end tests are still required before a production certification.

## v1.2 Workflow controls

The PROJECT, MODEL, DETAIL, ANNOTATE, REVIEW and PUBLISH navigation entries are interactive buttons. Each opens a context panel of real actions connected to the shared model commands. Click an entry again or choose Close to collapse its panel. The Publish panel clearly distinguishes unmodified IFC source export from editable IFC round-trip (not implemented).


## v1.4 construction and deployment repairs
- Door/window creation in **Plan**: choose Door or Window, click/drag along an existing wall. Openings are hosted with `hostId`, width, z/sill elevation, and height. Start within 350 mm of a wall centerline.
- A wall with hosted openings is rebuilt as segmented Three.js solids, leaving an actual clear opening in the WebGL preview. This is an explicitly **mesh preview**, not exact B-rep. Oblique host walls work in this preview.
- Exact mode is independently tested with a 10×10×10 mm box volume and a Boolean cut. A Vite build and WASM initialization are required. Exact B-rep remains limited to axis-aligned solids, and the browser self-test must pass; unsupported components report warnings.
- GitHub Pages must be set to **GitHub Actions** publishing **dist/**. Publishing repository-root source yields "uncompiled source deployment"; do not upload raw source as a Pages branch site.
- `npm test` checks hosted opening placement and segmentation; `npm run build` requires dependencies installed via `npm install`.
- **Not certified**: IFC edit roundtrip, regulated construction drawings, structural analysis, and certified quantity schedules.
