import {footprint,length} from '../core/geometry/index.js';
import {drawingStyle,tagFor,descriptorFor,dimensionText,labelPointFor} from '../detailcore/annotations/index.js';
import {svgPatternDefs,svgFillFor} from '../detailcore/hatch-engine/index.js';
import {svgSymbol} from '../detailcore/symbol-registry/index.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const n=x=>Math.round(Number(x)*100)/100;
const LINEAR_DIM_TYPES=new Set(['wall','beam','duct','pipe','conduit','road']);
const SYMBOL_TYPES=new Set(['door','window','fixture','equipment','furniture']);
export function planSVG(doc){const a=doc.objects.filter(o=>o.visible!==false),minx=Math.min(0,...a.flatMap(o=>footprint(o).map(p=>p[0])))-1500,maxx=Math.max(3000,...a.flatMap(o=>footprint(o).map(p=>p[0])))+1500,miny=Math.min(0,...a.flatMap(o=>footprint(o).map(p=>p[1])))-1500,maxy=Math.max(3000,...a.flatMap(o=>footprint(o).map(p=>p[1])))+1500;
const defs=`<defs>${svgPatternDefs()}</defs>`;
let shapes=a.map(o=>{const style=drawingStyle(o),pts=footprint(o).map(([x,y])=>`${n(x)},${n(-y)}`).join(' '),anchor=labelPointFor(o),cx=n(anchor.x),cy=n(-anchor.y),l=Math.round(o.measuredMM ?? length(o));const tag=esc(tagFor(o));let geometry='';
if(o.type==='dimension'){
 const dx=o.x2-o.x,dy=o.y2-o.y,L=Math.hypot(dx,dy)||1,off=220,nx=-dy/L,ny=dx/L,ax=n(o.x+nx*off),ay=n(-o.y-ny*off),bx=n(o.x2+nx*off),by=n(-o.y2-ny*off);geometry+=`<g stroke="${style.stroke}" stroke-width="11" fill="none"><path d="M ${n(o.x)} ${n(-o.y)} L ${ax} ${ay} M ${n(o.x2)} ${n(-o.y2)} L ${bx} ${by} M ${ax} ${ay} L ${bx} ${by}"/></g><text x="${n((ax+bx)/2)}" y="${n((ay+by)/2-45)}" font-family="Arial,sans-serif" font-size="105" text-anchor="middle" fill="${style.stroke}">${esc(dimensionText(o))}</text>`;
 }else if(SYMBOL_TYPES.has(o.type)){
 geometry+=svgSymbol(o,style);
 geometry+=`<text x="${cx}" y="${cy-45}" font-family="Arial,sans-serif" font-size="92" text-anchor="middle" fill="${style.stroke}">${tag}</text>`;
 geometry+=`<text x="${cx}" y="${cy+58}" font-family="Arial,sans-serif" font-size="78" text-anchor="middle" fill="${style.stroke}">${esc(descriptorFor(o))}</text>`;
 }else{
 geometry+=`<polygon points="${pts}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="${n(style.line*12)}"/><polygon points="${pts}" fill="${svgFillFor(o.material)}"/>`;
 geometry+=`<text x="${cx}" y="${cy-45}" font-family="Arial,sans-serif" font-size="110" text-anchor="middle" fill="${style.stroke}">${tag}</text>`;
 if(LINEAR_DIM_TYPES.has(o.type)){
 const dx=o.x2-o.x,dy=o.y2-o.y,L=Math.hypot(dx,dy)||1,off=220,nx=-dy/L,ny=dx/L,ax=n(o.x+nx*off),ay=n(-o.y-ny*off),bx=n(o.x2+nx*off),by=n(-o.y2-ny*off);
 geometry+=`<g stroke="${style.stroke}" stroke-width="11" fill="none"><path d="M ${n(o.x)} ${n(-o.y)} L ${ax} ${ay} M ${n(o.x2)} ${n(-o.y2)} L ${bx} ${by} M ${ax} ${ay} L ${bx} ${by}"/></g><text x="${n((ax+bx)/2)}" y="${n((ay+by)/2-45)}" font-family="Arial,sans-serif" font-size="105" text-anchor="middle" fill="${style.stroke}">${l} mm</text>`;
 }
 }
 return `<g data-element-id="${esc(o.id)}" data-discipline="${esc(o.discipline)}" data-type="${esc(o.type)}">${geometry}</g>`}).join('');return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minx} ${-maxy} ${maxx-minx} ${maxy-miny}"><title>${esc(doc.name)}</title>${defs}<rect x="${minx}" y="${-maxy}" width="${maxx-minx}" height="${maxy-miny}" fill="white"/>${shapes}</svg>`}
