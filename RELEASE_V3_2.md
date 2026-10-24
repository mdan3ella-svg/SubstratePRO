# SUBSTRATE PRO v3.2 — Building Systems

This release builds on the original v3.1 BIM workspace.

## New controls
- Building Systems (left sidebar): add level, generate structural grids, create roof envelope, facade panels/mullions, rectangular room, parametric column-and-beam framing, and schedules.
- Editable inputs: active level, bay spacing, bays X/Y, footprint width/depth, level height, roof type.
- Layers (right sidebar): visibility, locks, create layer, assign selected object.
- Live 2D plan grid axis labels, separate from snap grid.
- Construction sheet: adds room/area and structural framing schedules.

## Data
All objects are saved with persistent IDs and level/layer/group metadata. Store transactions retain undo/redo.

## Scope boundaries
- Roof mono-pitch and gable types are stored as metadata, but generated geometry is still a rectangular flat roof envelope.
- Room tools create rectangular areas; automatic enclosed-space/wall-boundary inference is not implemented.
- Facade panels are separate simplified solids; no true structural curtainwall hosting/Booleans.
- Framing generates straight parametric beams and columns; no engineered connections or load calculations.
- Schedules are conceptual BIM quantity lists, not certified procurement quantities.
- Level and layer metadata are stored natively; complete IFC and exact topology round-tripping are not included.

## Testing
Run `npm test`; for production, install dependencies and run `npm run build` and publish the Vite `dist` directory through GitHub Actions. JavaScript syntax and 54 source tests were checked locally. The full Vite build and interactive browser rendering have not been verified in this environment.
