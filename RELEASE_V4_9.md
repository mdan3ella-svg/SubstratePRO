# SUBSTRATE PRO v4.9 — Annotation Overrides and Global Scaling

The Dimension & Annotation Control panel provides a global label-size multiplier of 65–220% (model coordinates and measurement values remain unchanged), per-selected-dimension text override, screen-space offset, positive/negative placement side and individual suppression. Restore Auto clears all four fields. Canvas and SVG exports call the shared annotation layout function.

Dimension text overrides are presentation-only: they **do not** alter physical measurements. Verify overridden labels before construction issue. The global size multiplier primarily applies to canvas; standalone SVG plotting continues to use its independent model-unit typography. Collision avoidance is heuristic, not guaranteed in dense drawings. Live browser testing and a Vite production build have not been completed in this environment.
