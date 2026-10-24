import test from 'node:test';import assert from 'node:assert/strict';
import {blank,element} from '../src/core/document-model/index.js';
import {Store} from '../src/core/transactions/index.js';
import {projectedBounds} from '../src/core/geometry/index.js';
import {planSVG} from '../src/plot/index.js';
test('AEC drawing creation and undo/redo retains geometry',()=>{const store=new Store();const wall=element('wall',{x:0,y:0,x2:4500,y2:0,height:3000});store.commit(d=>d.objects.push(wall));assert.equal(store.doc.objects[0].id,wall.id);assert.ok(projectedBounds(store.doc.objects,'iso').x2>0);assert.match(planSVG(store.doc),/svg/i);assert.equal(store.undo(),true);assert.equal(store.doc.objects.length,0);assert.equal(store.redo(),true);assert.equal(store.doc.objects.length,1)});
test('B-rep facade remains a lazy import, avoiding hard startup dependency',async()=>{const {kernelReady}=await import('../src/core/geometry/brep/index.js');assert.equal(kernelReady(),false)});
