import test from 'node:test';import assert from 'node:assert/strict';
import {openingOnWall,wallSections,nearestWall} from '../src/core/geometry/openings.js';
const wall={id:'w1',type:'wall',x:0,y:0,x2:6000,y2:0,z:0,height:3000,thickness:200};
test('Hosted door locates wall',()=>{const o=openingOnWall('door',{x:2000,y:30},{x:2900,y:30},[wall]);assert.equal(o.hostId,'w1');assert.equal(o.height,2100);assert.equal(o.z,0)});
test('Hosted window has sill elevation',()=>{const o=openingOnWall('window',{x:2000,y:20},{x:3200,y:20},[wall]);assert.equal(o.z,900);assert.equal(o.height,1200)});
test('Wall segmentation removes door volume',()=>{const door={...openingOnWall('door',{x:1000,y:0},{x:2000,y:0},[wall]),type:'door'};const parts=wallSections(wall,[door]);let area=parts.reduce((a,p)=>a+(p.end-p.start)*(p.top-p.bottom),0);assert.equal(area,6000*3000-1000*2100)});
test('Missing host rejected',()=>assert.throws(()=>openingOnWall('door',{x:3000,y:2500},{x:3900,y:2500},[wall]),/host/));
