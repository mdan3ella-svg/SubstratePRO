import test from 'node:test';
import assert from 'node:assert/strict';
import {element,blank} from '../src/core/document-model/index.js';
import {layoutAnnotations} from '../src/detailcore/annotations/layout.js';
import {planSVG} from '../src/plot/index.js';
const map=p=>({x:p.x/10,y:-p.y/10});
test('autodimension locates text away from wall body',()=>{
 const wall=element('wall',{id:'wall',x:0,y:0,x2:4000,y2:0,thickness:200});
 const layout=layoutAnnotations([wall],map,{lod:'detail',textPx:11,dimOffsetPx:28});
 assert.equal(layout.dimensions.length,1);assert.ok(Math.abs(layout.dimensions[0].offset)>=28);
 assert.ok(layout.dimensions[0].box.y2 < -10 || layout.dimensions[0].box.y1 >= 10);
});
test('different tags reserve separate rectangles',()=>{
 const a=element('wall',{id:'one',x:0,y:0,x2:3000,y2:0});const b=element('wall',{id:'two',x:0,y:300,x2:3000,y2:300});
 const out=layoutAnnotations([a,b],map,{textPx:11});assert.equal(out.tags.length,2);
 const [x,y]=out.tags.map(t=>t.box);assert.ok(x.x2<y.x1 || y.x2<x.x1 || x.y2<y.y1 || y.y2<x.y1);
});
test('SVG exports external associative dimensions, tags and full extents',()=>{
 const doc=blank(),wall=element('wall',{id:'W-A',x:0,y:0,x2:4000,y2:0});doc.objects.push(wall,element('dimension',{sourceId:wall.id,x:0,y:0,x2:4000,y2:0}));
 const svg=planSVG(doc);assert.match(svg,/data-associative-source="W-A"/);assert.match(svg,/data-tag-for="W-A"/);assert.match(svg,/4000 mm/);
});
