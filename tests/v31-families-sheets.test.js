import test from 'node:test';
import assert from 'node:assert/strict';
import {element,blank} from '../src/core/document-model/index.js';
import {DOOR_HANDS,windowFamily,furnitureFamily,doorGeometry} from '../src/detailcore/families/index.js';
import {svgSymbol} from '../src/detailcore/symbol-registry/index.js';
import {buildSheetHTML,scheduleRows} from '../src/detailcore/sheets/index.js';
test('all door handing settings create finite geometry',()=>{for(const hand of DOOR_HANDS){const o=element('door',{x:0,y:0,x2:900,y2:0,width:900,hand,swingSide:'out'}),g=doorGeometry(o);assert.ok(Number.isFinite(g.opened.x));assert.ok(Number.isFinite(g.opened.y));assert.match(svgSymbol(o),/class="symbol door"/);}});
test('window type library and furniture family selection',()=>{assert.equal(windowFamily({windowType:'sliding'}).panes,2);assert.equal(furnitureFamily({family:'sofa'}).width,2100);assert.match(svgSymbol(element('window',{windowType:'doubleHung'})),/data-family="doubleHung"/);assert.match(svgSymbol(element('furniture',{family:'sofa'})),/data-family="sofa"/);});
test('A3 sheet contains safe schedule with family fields and jurisdiction caveat',()=>{const d=blank();d.name='<Test> Model';d.objects.push(element('door',{hand:'RH',swingSide:'out',width:1000}),element('window',{windowType:'awning'}),element('furniture',{family:'desk'}));const html=buildSheetHTML(d,{standard:'OBC',number:'A-104'});assert.match(html,/A3 landscape/);assert.match(html,/A-104/);assert.match(html,/Ontario Building Code review/);assert.match(html,/RH · out/);assert.match(html,/&lt;Test&gt;/);assert.equal(scheduleRows(d).length,3)});
