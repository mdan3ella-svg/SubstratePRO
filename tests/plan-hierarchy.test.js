import test from 'node:test';import assert from 'node:assert/strict';
import {planObjects,shouldStartMove,annotationMetrics} from '../src/core/geometry/plan-visibility.js';
test('plan cut hides roof over ground-floor walls',()=>{const doc={levels:[{id:'L1',elevation:0}],objects:[{id:'w',type:'wall',z:0,height:3000},{id:'r',type:'roof',z:3100,height:180}]};assert.deepEqual(planObjects(doc).map(o=>o.id),['w']);assert.deepEqual(planObjects(doc,{showOverhead:true}).map(o=>o.id),['w','r'])});
test('changing floor selects local objects',()=>{const doc={levels:[{id:'L1',elevation:0},{id:'L2',elevation:3200}],objects:[{id:'w1',type:'wall',z:0,height:3000},{id:'w2',type:'wall',z:3200,height:3000}]};assert.deepEqual(planObjects(doc,{level:'L2'}).map(o=>o.id),['w2'])});
test('drag only after grab threshold',()=>{assert.equal(shouldStartMove({sx:10,sy:10},{sx:12,sy:12}),false);assert.equal(shouldStartMove({sx:10,sy:10},{sx:18,sy:10}),true)});
test('drafting annotation measures bounded legibility',()=>{assert.ok(annotationMetrics(100,1).textPx>=11);assert.ok(annotationMetrics(50,3).dimOffsetPx<=34)});
