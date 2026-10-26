# SUBSTRATE PRO v5.2 — Plan Hierarchy and BIM Datum Repair

Based on the v5.1 project. Changes:

- Architectural plan visibility uses explicit **below-cut / cut / overhead / annotation** classes relative to active level, next-level elevation and cut-height.
- Slabs render beneath cut walls instead of hiding them; upper-level walls and roof geometry are hidden from lower floor plans by default.
- Optional overhead visibility retains a distinct `overhead` class for future dashed overhead graphic treatment.
- BIM grids now draw in the Plan viewport as axes with grid bubbles/labels derived from project grid coordinates, not a visual-only pixel grid.
- Plan draw order is stable; mitered wall footprints are preserved after filtering.
- Level elevation creation rejects non-numeric input, and missing level references are reported rather than silently treated as zero elevation.
- Three new focused tests added; all 124 source tests pass.

## Limitations

- Overhead elements are classified and ordered but not yet fully restyled as dashed edge-only projections in every drawing mode.
- Grid labels are screen-space plan aids; paper-space model-based grid bubble plotting still requires dedicated sheet logic.
- True hidden-line removal, building-code certification, and full bidirectional IFC level/grids are not established by these changes.
- Production Vite build and live browser checks are not verified in this environment.

## Deployment

Copy project contents to the GitHub SubstratePRO repository and build with the existing GitHub Actions Vite workflow. Verify active level switching and cut-height changes against a two-level test project.
