# SUBSTRATE PRO v3.5 · BIM Material & Visualization Studio

## Material workflow
- The existing BIM `material` field remains authoritative for both 2D plan hatch conventions and 3D material display.
- 3D appearance definitions for concrete, steel, masonry, timber, glass, gypsum, insulation, earth and a default fallback provide surface color, roughness, metallic response and opacity.
- Procedural material patterns help distinguish surfaces in the **Material Hatch** and **Rendered + AO** style modes. These are presentation patterns, not surveyed manufactured textures or calibrated construction hatches.
- Visual styles: **X-Ray, Wireframe, Hidden Line, Shaded, Material Hatch, Rendered + AO**.
- The AO slider controls WebGL shadow softness/strength on a studio ground plane through soft directional/contact-style shadows; it is **not true screen-space ambient occlusion (SSAO)** and not a path-traced renderer.
- The BIM drawing workspace, element editing, documentation, model types and the existing deployment configuration are retained.

## Installation
Upload the complete project files to the SubstratePRO GitHub repository, preserving folders; run the existing GitHub Pages Vite deployment.

## Testing
`npm test` passes 61 source-level tests including the new material presets and visualization control wiring. `node --check` passes for the changed modules. A complete production build and hosted browser/WebGL rendering test are still required; this environment has no installed Vite dependencies.

## Current limitations
- No physically scanned textures, UV unwrapping, actual SSAO postprocessing or ray-traced global illumination.
- Real-world material assemblies still require detailed layer/section modeling for quantity takeoffs and certified plotting.
- Drawing hatches and 3D patterns are stylistically coordinated but are not a single standardized physical hatch scale across all projections.
