import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {MATERIALS,VIEW_STYLES,resolveMaterial} from '../src/render-3d/material-styles.js';
test('BIM materials provide semantic PBR properties',()=>{for(const name of ['Concrete','Steel','Masonry','Timber','Glass']){const m=resolveMaterial(name);assert.ok(Number.isInteger(m.color));assert.ok(m.roughness>=0&&m.roughness<=1);assert.ok(m.metalness>=0&&m.metalness<=1)}assert.ok(resolveMaterial('Unknown')===MATERIALS.Default)});
test('all six requested visual styles are declared',()=>{assert.deepEqual(Object.keys(VIEW_STYLES),['xray','wire','hidden','shaded','technical','rendered']);assert.ok(VIEW_STYLES.technical.pattern);assert.ok(VIEW_STYLES.rendered.lighting)});
test('visualization controls remain connected',()=>{const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'),app=fs.readFileSync(new URL('../src/app/main.js',import.meta.url),'utf8');assert.match(html,/id="visualStyle"/);assert.match(html,/id="aoStrength"/);assert.match(app,/setVisualStyle\(visualization\.style\)/);assert.match(app,/setAO\(visualization\.ao\)/)});
