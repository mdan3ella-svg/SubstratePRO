import test from 'node:test';import assert from 'node:assert/strict';
import {snapPoint,wallEnd} from '../src/core/geometry/snapping.js';
const walls=[{id:'a',type:'wall',x:0,y:0,x2:3000,y2:0,visible:true}];
test('endpoint priority over grid',()=>{const {x,y,mode}=snapPoint({x:2992,y:8},{objects:walls,grid:true,step:250,scale:1});assert.deepEqual({x,y,mode},{x:3000,y:0,mode:'endpoint'});});
test('walls stay axis aligned despite pointer drift',()=>{let p=wallEnd({x:3000,y:0},{x:4201,y:114},{orthogonal:true,grid:true,step:250,objects:walls,scale:.1});assert.equal(p.y,0);assert.equal(p.x,4250)});
test('vertical wall axis lock',()=>{let p=wallEnd({x:2000,y:0},{x:2040,y:1780},{orthogonal:true,grid:true,step:250,objects:[],scale:.1});assert.equal(p.x,2000);assert.equal(p.y,1750)});
test('shift override permits diagonal geometry',()=>{let p=wallEnd({x:0,y:0},{x:1231,y:940},{orthogonal:true,diagonalOverride:true,grid:true,step:250,objects:[]});assert.equal(p.x,1250);assert.equal(p.y,1000)});
test('snapping disabled supports accurate non-grid coordinates',()=>{let p=snapPoint({x:123.4,y:675.6},{objects:[],grid:false,endpoint:false});assert.equal(p.x,123);assert.equal(p.y,676)});
test('axis lock retains exact existing wall endpoint when eligible',()=>{let p=wallEnd({x:0,y:0},{x:2995,y:3},{objects:walls,orthogonal:true,grid:true,step:250,scale:1});assert.equal(p.x,3000);assert.equal(p.y,0)});
