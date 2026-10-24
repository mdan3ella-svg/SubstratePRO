import test from 'node:test';
import assert from 'node:assert/strict';
import {precisionSnap,segmentIntersection,wallJoinReport} from '../src/core/geometry/snapping.js';
const wall=(id,x,y,x2,y2)=>({id,type:'wall',x,y,x2,y2});
test('precision snap prioritizes endpoints over a nearby grid',()=>{const p=precisionSnap({x:98,y:99},{objects:[wall('w',100,100,900,100)],grid:true,step:250,scale:1});assert.equal(p.mode,'endpoint');assert.equal(p.x,100);});
test('midpoint snapping can be independently enabled',()=>{const p=precisionSnap({x:500,y:102},{objects:[wall('w',0,100,1000,100)],endpoint:false,midpoint:true,grid:false,scale:1});assert.equal(p.mode,'midpoint');assert.equal(p.x,500);});
test('crossing segments report a precise intersection',()=>{const p=segmentIntersection({x:0,y:0},{x:100,y:100},{x:0,y:100},{x:100,y:0});assert.deepEqual(p,{x:50,y:50});});
test('wall analyzer reports shared corner',()=>{const j=wallJoinReport([wall('a',0,0,1000,0),wall('b',1000,0,1000,1000)]);assert.equal(j.length,1);assert.equal(j[0].kind,'endpoint');});
