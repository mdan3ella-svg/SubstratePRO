# SUBSTRATE PRO v4.2 — Live Drawing Coordination Auditor

## New features

- Model-transaction-triggered drawing audit (debounced 240 ms), with a manual Audit Drawing command.
- Error/warning/advisory review of duplicate identifiers, matching geometry, disconnected wall endpoints, missing hosts/levels/layers, invalid geometry, orphan dimensions, and potential MEP bounding-box overlaps.
- Finding rows select affected BIM objects and return the workspace to Plan.
- Dynamic drawing register for A-101, A-201, A-301, S-101, M-101, P-101, E-101, C-101 with nominal scale presets and review statuses.
- Downloadable plain-text report with all findings and drawing statuses.
- All work uses the existing shared document model and does not mutate model geometry during an audit.

## Limitations / next milestones

The analyzer is a screening tool. It cannot certify design-code compliance, IFC round-trip, engineered MEP connectivity or full 3D clash detection. Its service overlap test uses bounding envelopes and may create false positives. A loose wall endpoint may be intentional; it is marked informational. Drawing sheets are registered and assessed, but the existing sheet renderer is not replaced by a complete automatic multi-sheet generation/issue management engine. Manual review, jurisdiction-specific standards selections and print-scale verification remain required.

## Verification

Run `npm test` and `npm run build` after installing dependencies (`npm install`). The automated source suite is validated in the development environment; the production Vite build and live browser regression are not verified here because the working copy does not include node_modules. Deploy compiled `dist/` using the existing GitHub Actions workflow.
