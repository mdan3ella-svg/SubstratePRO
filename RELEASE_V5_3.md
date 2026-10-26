# SUBSTRATE PRO v5.3 — Workspace Redraw and Project Isolation

- New project clears BIM selection, unfinished geometry gestures, clipboard, session-only 3D reference meshes and their Plan projections, and the existing embedded raster underlays through the blank document.
- Delete supports multi-selection and clears obsolete selection/preview state.
- Document refresh prunes selected element IDs that no longer exist after deletion, undo/redo or model replacement.
- New **Redraw** button reconstructs the scene and Plan from the document, and resets the viewport camera to extents.
- Header actions now scroll horizontally instead of wrapping over the drawing; rails scroll independently and are accessible at smaller widths.

This is a source-code repair. Test browser import/undo/new, keyboard access, and mobile layout after deployment.
