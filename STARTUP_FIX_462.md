# SUBSTRATE PRO v4.6.2 — Startup and BIM workflow repair

Issue: in v4.6.1, the BIM workflow script tag was accidentally inserted into the Construction Documents Print/PDF JavaScript string. This corrupted an inline script and caused `Uncaught SyntaxError: Invalid or unexpected token`.

Repair: restores the syntactically valid v4.6 application index, copies the BIM workflow controller and styles, and adds the workflow script **after** the main app scripts at the actual end of the HTML document. The original Plan/Wall Polyline/3D Iso tools remain the model authority. OCCT stays a separate bridge for supported solids.

Deployment: replace the repo files with this complete package (the contents of the folder, not a nested folder), commit and confirm GitHub Actions is green. Hard-refresh the hosted site. Use Start BIM Wall Drafting → click plan points → Finish Wall → 3D Iso. The WebGL view and OCCT integration require separate live acceptance testing.

Validation: extracted inline scripts parsed with Node; the encoded app module also checked; local JS source tests run where available. No claim of live browser testing.
