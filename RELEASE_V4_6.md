# SUBSTRATE PRO v4.6 — Zoom and Dimension Scale Repair

## Repairs
- Replaced Plan mouse-wheel arithmetic with pointer-anchored zoom, using the same projected model coordinate before/after scaling; handles pixel, line and page wheel modes.
- Added consistent hard bounds on Plan zoom (0.0001 through 20 drawing pixels/model mm).
- Prevented annotation font size and leader/dimension clearance from changing with zoom. The on-screen layout uses CSS pixels, not a square-root of scene magnification.
- Maintained native model measurements in millimetres; this upgrade does not redefine element geometry, associative source IDs or length values.
- Passed scale and clearance metrics through the shared annotation planner rather than leaving offsets at disconnected defaults.

## Caveats
- Printed drawing scales remain *nominal*: this is a canvas zoom and on-screen readability correction, not an ISO-calibrated PDF plotting engine.
- The 3D camera already uses separate OrbitControls distance and orthographic zoom limits, which are retained.
- Browsers should still be exercised with actual mouse wheel/touchpad input, especially zoom behavior after switching views and resizing.
