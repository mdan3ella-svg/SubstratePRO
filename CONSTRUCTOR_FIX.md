# OpenCascade box constructor repair (v4.5.6)

The hosted OCCT kernel is now loading. The v4.5.5 adapter passed `(gp_Pnt, dx, dy, dz)` (four arguments) to `BRepPrimAPI_MakeBox_3`, but that constructor takes exactly two `gp_Pnt` objects.

The adapter now constructs `gp_Pnt_3(x0,y0,z0)` and `gp_Pnt_3(x1,y1,z1)` and passes those points into `BRepPrimAPI_MakeBox_3`. This preserves absolute model location.

Commit `occt-adapter.mjs` to repository root and ensure the GitHub Actions build publishes it. Open `occt-test.html`, initialize the kernel, and test Fuse / Cut / Common. The constructor change is syntax/unit-tested locally but actual browser Boolean tests need the deployed kernel.
