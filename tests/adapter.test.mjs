import test from 'node:test';import assert from 'node:assert/strict';import{makeBox,booleanShape,createDocumentRecord}from '../occt-adapter.mjs';
test('rejects degenerate shapes',()=>assert.throws(()=>makeBox({},[0,0,0,0,1,1])));
test('records B-rep provenance and parameters',()=>{const r=createDocumentRecord({id:'S1',operation:'union',boundsA:[0,0,0,1,2,3],boundsB:[1,0,0,2,2,3]});assert.equal(r.kernelVersion,'1.1.1');assert.equal(r.parameters.boundsB[3],2)});
test('rejects unsupported operation',()=>assert.throws(()=>booleanShape({},null,null,'fake')));
