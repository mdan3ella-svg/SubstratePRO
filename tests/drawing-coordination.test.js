import test from 'node:test';
import assert from 'node:assert/strict';
import {blank,element} from '../src/core/document-model/index.js';
import {auditDrawing,drawingRegister,issueReportText} from '../src/audit/drawing-coordination.js';
function fixture(){const d=blank();d.grids=[{id:'x',axis:'X',label:'1',coordinate:0},{id:'y',axis:'Y',label:'A',coordinate:0}];return d;}
test('live drawing audit finds loose wall endpoints and duplicate geometry',()=>{const d=fixture();d.objects=[element('wall',{x:0,y:0,x2:2000,y2:0}),element('wall',{x:0,y:0,x2:2000,y2:0})];const a=auditDrawing(d);assert.ok(a.issues.some(x=>x.code==='DUPLICATE_GEOMETRY'));d.objects[1].x=3000;d.objects[1].x2=5000;assert.ok(auditDrawing(d).issues.some(x=>x.code==='LOOSE_WALL_END'));});
test('audit catches broken dimension association',()=>{const d=fixture();d.objects=[element('dimension',{sourceId:'not-found'})];assert.ok(auditDrawing(d).issues.some(x=>x.code==='ORPHAN_DIMENSION'))});
test('drawing register includes a review status and discipline counts',()=>{const d=fixture();d.objects=[element('wall',{x:0,y:0,x2:2000,y2:0})];const report=auditDrawing(d);const reg=drawingRegister(d,report);assert.ok(reg.some(x=>x.id==='A-101'&&x.elementCount===1));assert.match(issueReportText(report,reg),/DRAWING REGISTER/)});
test('auditing does not mutate the source model',()=>{const d=fixture();d.objects=[element('wall')];const before=JSON.stringify(d);auditDrawing(d);assert.equal(JSON.stringify(d),before)});
