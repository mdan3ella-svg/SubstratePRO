import test from 'node:test';import assert from 'node:assert/strict';
import {newUnderlay,underlayCorners,updateUnderlay} from '../src/detailcore/underlay/index.js';
import {blank,parseDocument} from '../src/core/document-model/index.js';
const src='data:image/png;base64,aGVsbG8=';
test('underlay sizes retain image aspect ratio in millimetres',()=>{const u=newUnderlay({src,naturalWidth:2000,naturalHeight:1000,widthMM:6000});assert.equal(u.heightMM,3000);assert.equal(u.locked,true)});
test('underlay changes calibrate geometry without changing source pixels',()=>{const u=newUnderlay({src,naturalWidth:1000,naturalHeight:500,widthMM:2000});const changed=updateUnderlay(u,{widthMM:4000,opacity:0.75});assert.equal(changed.heightMM,2000);assert.equal(changed.opacity,.75);assert.equal(underlayCorners(changed)[1].x,4000)});
test('native project document retains embedded underlays',()=>{const d=blank();d.underlays.push(newUnderlay({src,naturalWidth:100,naturalHeight:100,widthMM:1000}));assert.equal(parseDocument(JSON.stringify(d)).underlays[0].src,src)});
test('only supported embedded image sources accepted',()=>assert.throws(()=>newUnderlay({src:'data:image/svg+xml;base64,aaaa',naturalWidth:20,naturalHeight:20}),/JPEG\/PNG/));
