import test from 'node:test';import assert from 'node:assert/strict';
import {element,blank} from '../src/core/document-model/index.js';
import {tagFor,drawingStyle,descriptorFor} from '../src/detailcore/annotations/index.js';
import {planSVG} from '../src/plot/index.js';
test('discipline specific model-derived tag',()=>{const wall=element('wall',{id:'SP-A123',x:0,y:0,x2:3600,y2:0});assert.match(tagFor(wall),/^A-W/);assert.match(descriptorFor(wall),/3600/);assert.notEqual(drawingStyle(wall).stroke,drawingStyle(element('beam')).stroke)});
test('export SVG includes wall length, hatch and tag',()=>{let doc=blank();doc.objects.push(element('wall',{id:'SP-TEST',x:0,y:0,x2:3600,y2:0}));const svg=planSVG(doc);assert.match(svg,/3600 mm/);assert.match(svg,/A-W/);assert.match(svg,/pattern/);assert.match(svg,/data-element-id/)});
