import test from 'node:test';import assert from 'node:assert/strict';
import {element,blank} from '../src/core/document-model/index.js';
import {tagFor,drawingStyle,descriptorFor,labelPointFor} from '../src/detailcore/annotations/index.js';
import {planSVG} from '../src/plot/index.js';
import {svgSymbol} from '../src/detailcore/symbol-registry/index.js';
test('discipline specific model-derived tag',()=>{const wall=element('wall',{id:'SP-A123',x:0,y:0,x2:3600,y2:0});assert.match(tagFor(wall),/^A-W/);assert.match(descriptorFor(wall),/3600/);assert.notEqual(drawingStyle(wall).stroke,drawingStyle(element('beam')).stroke)});
test('export SVG includes wall length, hatch and tag',()=>{let doc=blank();doc.objects.push(element('wall',{id:'SP-TEST',x:0,y:0,x2:3600,y2:0}));const svg=planSVG(doc);assert.match(svg,/3600 mm/);assert.match(svg,/A-W/);assert.match(svg,/pattern/);assert.match(svg,/data-element-id/)});
test('door and window export dedicated symbols and labels',()=>{let doc=blank();const wall=element('wall',{x:0,y:0,x2:4000,y2:0,thickness:200});doc.objects.push(wall);doc.objects.push(element('door',{hostId:wall.id,x:800,y:0,x2:1700,y2:0,width:900,thickness:200}));doc.objects.push(element('window',{hostId:wall.id,x:2200,y:0,x2:3400,y2:0,width:1200,thickness:200,z:900,height:1200}));const svg=planSVG(doc);assert.match(svg,/class="symbol door"/);assert.match(svg,/class="symbol window"/);assert.match(svg,/A-D/);assert.match(svg,/A-WIN/)});
test('furniture tag and label point are defined',()=>{const o=element('furniture',{x:0,y:0,x2:1800,y2:900});assert.match(tagFor(o),/^A-FUR/);const p=labelPointFor(o);assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));assert.match(svgSymbol(o),/symbol furniture/)});
