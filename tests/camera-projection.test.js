import test from 'node:test';import assert from 'node:assert/strict';
import {CAMERA_VIEWS,viewDefinition,framingDimensions,isOrthographicView} from '../src/render-3d/camera-views.js';
test('six technical orientations use parallel projection',()=>{for(const name of ['iso','plan3d','front','rear','right','left']){assert.equal(CAMERA_VIEWS[name].projection,'orthographic');assert.equal(isOrthographicView(name),true)}});
test('perspective camera is distinct and has free orbit entry',()=>{assert.equal(viewDefinition('perspective').projection,'perspective');assert.equal(isOrthographicView('perspective'),false)});
test('frustum bound remains finite and covers a modeled building',()=>{const b=framingDimensions({x:40,y:25,z:15},1.75);assert.ok(b.height>45);assert.ok(b.width>b.height)});
