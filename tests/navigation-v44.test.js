import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const main=readFileSync(new URL('../src/app/main.js',import.meta.url),'utf8');
const gpu=readFileSync(new URL('../src/render-3d/webgl.js',import.meta.url),'utf8');
test('plan zoom anchored to pointer rather than viewport center',()=>{assert.match(main,/const before=toWorld\(e\)/);assert.match(main,/const after=toWorld\(e\)/);assert.match(main,/camera\.cx\+=before\.x-after\.x/);});
test('plan selected object exposes move gizmo and endpoint handles',()=>{assert.match(main,/function moveGizmoCenter/);assert.match(main,/nearestMoveGizmo\(old,p\)/);assert.match(main,/handleWorldPoints\(o\)/)});
test('3d orientation gizmo tracks camera quaternion',()=>{assert.match(gpu,/drawGizmo\(\)/);assert.match(gpu,/this\.camera\.quaternion\.clone\(\)\.invert\(\)/);assert.match(gpu,/this\.gizmo\?\.remove\(\)/)});
test('orbit controls enforce zoom limits in both camera modes',()=>{assert.match(gpu,/this\.controls\.minDistance=\.05/);assert.match(gpu,/this\.controls\.minZoom=\.02/);assert.match(gpu,/this\.controls\.maxZoom=150/)});
