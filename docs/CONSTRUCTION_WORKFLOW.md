# SUBSTRATE PRO — construction workflow (v1.4)

1. Switch to Plan and draw a Wall between two points; walls default to an orthogonal axis lock; hold Shift to create diagonal walls.
2. Choose Door or Window and start on the wall centerline, then drag/click to its other edge. The tool creates a hosted element, not an independent wall. For windows the default sill is 900 mm and height is 1200 mm; door height is 2100 mm.
3. Switch to 3D Iso: walls are visually segmented around the hosted openings. The displayed void is genuinely absent from the preview mesh, but **mesh preview does not certify an OpenCascade Boolean cut**.
4. Edit host wall or opening data in Properties; host linkage persists in native project JSON.
5. Use Enable Exact 3D after a Vite build; read the status and per-element warnings. Axis-aligned components may be supported; diagonal exact extrusion and certified BIM exchanges are outstanding.

Do not use the generated drawing, quantities, or unmodified IFC export for construction certification.
