# SUBSTRATE PRO OCCT 4.5.9 — stale-module repair

Your error trace references `occt-adapter-v457.mjs`; it proves the hosted test page still imports the old file.

Upload this **entire package**, including `index.html`, `occt-test.html`, `occt-ui.mjs`, `occt-adapter-v459.mjs`, and `scripts/build-site.mjs`, at repository root. Preserve `.github/workflows/deploy.yml`. Commit all changes to main, and allow the custom GitHub Actions build to complete.

Verify the deployed source at `/occt-test.html`; it must import `./occt-adapter-v459.mjs`. Verify `/deployment-status.json` includes `adapterVersion: 4.5.9-validated-overload`. Run the test and share any next exception. The kernel runtime itself was not available for local execution.
