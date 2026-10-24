# SUBSTRATE PRO v4.7.1 — Branded startup restoration

The GitHub Pages root now displays the minimalist SUBSTRATE PRO startup screen. The former full launcher dashboard remains available via **Software Dashboard**. **Enter Workspace** bypasses the dashboard and opens the existing BIM drafting interface. **New BIM Project** and **Sample Project** dispatch to existing launch actions.

Paths: `/` branded startup; `/?dashboard=1` full dashboard; `/?workspace=1` BIM workspace. The URL `?utm_source=chatgpt.com` does not override startup selection.

Deployment: put the ZIP contents at the repository root and commit them. Confirm GitHub Actions deploys `site/index.html` and `site/startup-gate.js`. Verify page source contains `id="substrateStart"`.

This change restores routing/UI only; interactive BIM authoring and OCCT operations still need browser validation.
