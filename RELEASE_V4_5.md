# SUBSTRATE PRO v4.5 — 3D Interchange

## Supported interchange formats

| Format | Import | Export | Representation |
|---|---|---|---|
| Native `.substratepro` / `.json` | Yes | Yes | Editable parametric application data |
| `.glb` | Yes | Yes | Triangulated 3D mesh, embedded materials where supported |
| `.gltf` | Yes* | Yes* | glTF JSON mesh scene, materials |
| `.obj` | Yes | Yes | Triangle/polygon mesh geometry; no MTL companion written |
| `.stl` | Yes | Yes | Untextured mesh; geometry-only |
| `.fbx` | Yes* | No | Imported reference geometry; no Autodesk FBX exporter |
| `.ifc` | Source read only | Original, unmodified IFC only | Not edited IFC round-trip |
| STEP / IGES / DWG / RVT / 3MF / USD / USDZ | No | No | Requires separate conversion libraries and testing |

\* `.gltf` import is self-contained glTF or data URI-based; sidecar `.bin`/texture references are not packaged automatically. FBX import supports the subset understood by Three.js FBXLoader; external textures, custom rigs and complex FBX features may not survive. Textures in OBJ `.mtl` sidecar files are not automatically loaded. Imports are reference meshes and do not get converted into editable walls, slabs or hosted BIM components.

## Workflow

1. In the WebGL model view click **Import 3D**; select one or more GLB, glTF, OBJ, STL or FBX files.
2. Imported meshes are shown as 3D reference assets. The original file should be retained; these meshes are **session-only** and are **not serialized into native `.substratepro` saves**.
3. Click **Export 3D**, select GLB, glTF JSON, OBJ or STL, and decide whether to include reference meshes.
4. Use **Save** for fully editable native BIM source data. GLB and OBJ are geometric representations, not semantic BIM or exact B-rep solids.
5. Use **Import IFC** to inspect IFC records; **Export IFC** re-downloads the original unmodified IFC source, never a fabricated editable IFC output.

## Units and accuracy

The authoring engine stores geometry in millimetres; the WebGL scene uses metres. Exports are expressed in the WebGL scene's metre units. External imported mesh files may use different authoring units, and there is no automated reliable unit normalization in this release. Check model scale and orientation with a known reference measurement after import.

## Checks

- `node --check` on modified JS files
- Existing 94 source tests
- Format-specific browser export/import round-trips and Vite production build require verification with npm dependencies installed.
