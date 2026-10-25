# SUBSTRATE PRO v5.1 — Detail Hatch / Import Calibration / Rotate

- Plan and section views share material-to-hatch identity. Detail section dialog has Fine / Normal / Coarse density and retains chosen density on regenerated detail views. The section's face display is a projected fill: exact cut-face classification and sealed cut profiles are not yet available.
- 3D mesh import now takes source units (metres, millimetres, centimetres, feet, inches), source vertical axis (Y or Z), and scale multiplier. They convert import coordinates into the WebGL scene's metre system before Plan reference projection. Imported meshes remain session-only.
- New Rotate Selected control rotates single or multiple selected BIM elements around the selection midpoint in Plan through an undoable document transaction. A ring cue is shown on the selection gizmo. This is a numeric rotation action, not a draggable 3D transform gizmo.
- Plotting uses v5.0 paper-space dimension text and vector lineweight rules. No additional certified CAD standard or paper-calibrated 3D section plotting is claimed.
- Rotate hosted openings, linked dimensions and parametric walls with caution: relationship rehosting, profile rebuilding and all dependency constraints are not fully resolved.
- To deploy, publish the Vite build through the existing GitHub Pages workflow. Do not publish bare source as static `dist`.
