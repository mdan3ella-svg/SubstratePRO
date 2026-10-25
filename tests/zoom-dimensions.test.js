import test from 'node:test';
import assert from 'node:assert/strict';
import {annotationMetrics,zoomAtPointer} from '../src/core/geometry/plan-visibility.js';
test('dimension annotation font size stays fixed through zoom',()=>{
 const a=annotationMetrics(50,.01),b=annotationMetrics(100,18);
 assert.equal(a.textPx,b.textPx);assert.equal(a.dimOffsetPx,b.dimOffsetPx);
 assert.equal(a.paperTextMM,2.5);
});
test('pointer-centered zoom preserves projected model coordinate',()=>{
 const camera={cx:150,cy:-200,scale:.25};const pt={x:480,y:110};const area={width:800,height:600};
 const before={x:(pt.x-400)/camera.scale+camera.cx,y:(pt.y-300)/camera.scale+camera.cy};
 const next=zoomAtPointer(camera,pt,area,-120,0);
 const after={x:(pt.x-400)/next.scale+next.cx,y:(pt.y-300)/next.scale+next.cy};
 assert.ok(next.scale>camera.scale);assert.ok(Math.abs(before.x-after.x)<1e-8);assert.ok(Math.abs(before.y-after.y)<1e-8);
});
test('wheel zoom honors extreme bounds and line mode',()=>{
 const cam={scale:1,cx:0,cy:0};const area={width:400,height:300};
 const next=zoomAtPointer(cam,{x:200,y:150},area,3,1);
 assert.ok(next.scale<1);assert.ok(next.scale>0);
 const bounded=zoomAtPointer({...cam,scale:20},{x:200,y:150},area,-999999);
 assert.equal(bounded.scale,20);
});
