import test from 'node:test';import assert from 'node:assert/strict';
import {closeFitDetail,detailGeometry,detailViewMeasurements} from '../src/detailcore/section-camera/index.js';
import {detailViewSVG} from '../src/detailcore/section-camera/dialog.js';
const doc={objects:[{id:'W-A',type:'wall',x:0,y:0,x2:1800,y2:0,z:0,height:3000,thickness:200,material:'Concrete',visible:true},{id:'B-B',type:'beam',x:700,y:-100,x2:1100,y2:100,z:2700,height:300,thickness:200,material:'Steel',visible:true}]};
test('auto fit creates valid tight clip around local connection',()=>{const d=closeFitDetail(doc,{x:900,y:0},{radius:1200});assert.ok(d.width<=2400);assert.ok(d.depth<=2400);assert.ok(d.height>=3000);assert.ok(detailGeometry(doc,d).items.length>0)});
test('detail views render dimensions, tags and scale',()=>{const d=closeFitDetail(doc,{x:900,y:0},{scale:10});const svg=detailViewSVG(doc,d,'front');assert.match(svg,/1:10/);assert.match(svg,/mm/);assert.match(svg,/WALL/);assert.ok(detailViewMeasurements(detailGeometry(doc,d),'front'))});
