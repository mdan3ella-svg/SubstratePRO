# v4.5.5 OCCT factory loading fix

The hosted error `OCCT factory not found after loading the pinned JavaScript bundle` is produced by an older `occt-adapter.mjs`, not by the corrected v4.5.5 adapter. The pinned opencascade.js 1.1.1 glue ends in `export default opencascade;`, so it must be imported as an ES module rather than injected via a classic script.

Replace the repository-root `occt-adapter.mjs` AND `occt-test.html` with this package. Commit on `main`. GitHub Actions must succeed and publish the `site/` output. Confirm `deployment-status.json` includes `adapterVersion: 4.5.5-esm-factory`. The test page must display `Adapter 4.5.5-esm-factory loaded` before initialization. If it still reports the old error, the old adapter is what is deployed or cached.

Actual OCCT runtime initialization and B-rep operations are not verified in this environment.
