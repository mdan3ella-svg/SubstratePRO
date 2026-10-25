# HTML header repair

Restored a well-structured semantic `<header>`, with correctly nested branding and navigation markup and all existing button IDs preserved for JavaScript listeners. Retained Import 3D and Export 3D introduced in v4.5. Buttons have explicit `type="button"` to prevent accidental form submission.

The original header source was valid HTML, but minified to a single line; its being visibly printed in the app could also mean it was pasted into a text context or the wrong server response was loaded. This patch cleans markup; it does not prove or address a live GitHub Pages rendering defect.

Use the Vite build GitHub Actions output `dist/`, not unbuilt repository source.
