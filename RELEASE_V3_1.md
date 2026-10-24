# SUBSTRATE PRO v3.1 — Families, Symbols, Documentation

## New
- Model-persistent door hand (`LH`, `RH`, `LHR`, `RHR`) and `in`/`out` swing-side choices, using symbolic plan arcs.
- Window-family selection: fixed, casement, sliding, double-hung, awning; 2D symbols are schematic and do not yet model hardware or full 3D casements.
- Furniture-family selection: desk, sofa, double bed, dining table, chair, cabinet; adjustable 2D boundaries and family-specific schematic graphics.
- Selected door/window/furniture Properties include family-specific fields. Family selections are committed through the existing model transaction system and appear in SVG and A3 schedules.
- Printable A3 landscape HTML construction sheet with model plan SVG, door/window/furniture schedule, metadata, scale label, sheet number, and title. Open exported HTML in a browser to print to PDF.
- ISO-style metric, Ontario Building Code (OBC) review, and International Building Code (IBC) review presets are **templates, not verified compliance or certified documentation**. Standards rules and jurisdictional amendments are not encoded here.

## Limitations
- `LH/RH` and `LHR/RHR` are stored separately; reverse handing must be checked against the project's adopted convention. Geometric swing direction is controlled by hand side + `swingSide`.
- Family graphics are schematic drafting symbols, not manufactured BIM family libraries or full 3D assemblies.
- A3 sheet scale is a nominal title-block field; printed dimensions must be independently confirmed. This package does not implement calibrated plotting or multi-sheet associative callouts.
- Hosted openings are only placed through existing wall snap/host logic and do not have certified construction details.
- The GitHub Pages Vite build requires npm dependencies; automated source tests do not prove a working browser deployment.

## GitHub
Deploy this folder's *contents* to the root of the `SubstratePRO` repository, preserving `src`, `public`, `tests`, and the existing working workflow. Vite uses `base: './'` to support the project path.
