import test from 'node:test';
import assert from 'node:assert/strict';
import {layoutAnnotations} from '../src/detailcore/annotations/layout.js';
import {annotationMetrics} from '../src/core/geometry/plan-visibility.js';
const map=p=>({...p});
const dim={id:'D1',type:'dimension',x:0,y:0,x2:2000,y2:0,measuredMM:2000,thickness:1};
test('custom dimension text overrides measurement without modifying geometry',()=>{
 const input={...dim,dimensionTextOverride:'VERIFY ON SITE'};
 const out=layoutAnnotations([input],map,{autoTags:false});
 assert.equal(out.dimensions[0].text,'VERIFY ON SITE');assert.equal(input.x2,2000);
});
test('manual side and offset govern first dimension lane',()=>{
 const out=layoutAnnotations([{...dim,dimensionOffsetPx:90,dimensionSide:-1}],map,{autoTags:false});
 assert.equal(out.dimensions[0].offset,-90);
});
test('suppressed dimensions are omitted',()=>{
 const out=layoutAnnotations([{...dim,dimHidden:true}],map,{autoTags:false});
 assert.equal(out.dimensions.length,0);
});
test('global annotation setting adjusts text and clearance without changing drawing scale',()=>{
 const a=annotationMetrics(100,1,1),b=annotationMetrics(100,1,1.5);
 assert.equal(a.drawingScale,b.drawingScale);assert.equal(b.textPx,a.textPx*1.5);
});
