# v4.5.7 OCCT cache + box constructor repair

The hosted screenshot points to `occt-adapter.mjs?v=4.5.5`, which is the obsolete 4-argument MakeBox implementation.

Upload the complete updated package, not only the new adapter. The versioned `occt-adapter-v457.mjs` is referenced by `occt-ui.mjs` and `occt-test.html`, and the build script now includes that file in the deployed site.

Make sure GitHub Actions runs the custom OCCT workflow. Inspect `deployment-status.json` for adapterVersion `4.5.7-box-overload`. Hard refresh your page, or open it in a private window.

The corrected MakeBox uses gp_Pnt_3 start and end positions with BRepPrimAPI_MakeBox_3(p0,p1). Kernel runtime validation is still needed.
