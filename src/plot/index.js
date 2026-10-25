import {footprint} from '../core/geometry/index.js';
import {drawingStyle} from '../detailcore/annotations/index.js';
import {layoutAnnotations} from '../detailcore/annotations/layout.js';
import {svgPatternDefs,svgFillFor} from '../detailcore/hatch-engine/index.js';
import {svgSymbol} from '../detailcore/symbol-registry/index.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const n=x=>Math.round(Number(x)*100)/100;
const SYMBOL_TYPES=new Set(['door','window','fixture','equipment','furniture']);
export function planSVG(doc){
 const a=doc.objects.filter(o=>o.visible!==false);
 const map=p=>({x:p.x,y:-p.y});
 // SVG model units are millimetres; 100 mm text height is appropriate for a nominal 1:100 drawing.
 const textPx=100,settings={lod:'detail',autoDimensions:true,autoTags:true,textPx,dimOffsetPx:340,clearancePx:80};
 const annotations=layoutAnnotations(a,map,settings);
 const shapes=a.map(o=>{
  const style=drawingStyle(o),pts=footprint(o).map(([x,y])=>`${n(x)},${n(-y)}`).join(' ');
  let g='';if(o.type==='dimension')return '';
  if(SYMBOL_TYPES.has(o.type))g=svgSymbol(o,style);
  else g=`<polygon points="${pts}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="${n(style.line*12)}"/><polygon points="${pts}" fill="${svgFillFor(o.material)}"/>`;
  return `<g data-element-id="${esc(o.id)}" data-discipline="${esc(o.discipline)}" data-type="${esc(o.type)}">${g}</g>`
 }).join('');
 const dimSVG=annotations.dimensions.map(d=>{
  const style=drawingStyle(d.object),dx=d.b.x-d.a.x,dy=d.b.y-d.a.y,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,off=d.offset;
  const ax=n(d.a.x+nx*off),ay=n(d.a.y+ny*off),bx=n(d.b.x+nx*off),by=n(d.b.y+ny*off);
  const p=d.label, width=Math.max(350,d.text.length*60);
  return `<g data-associative-source="${esc(d.object.sourceId||d.object.id)}" stroke="${style.stroke}" fill="none" stroke-width="11"><path d="M ${n(d.a.x+nx*50)} ${n(d.a.y+ny*50)} L ${ax} ${ay} M ${n(d.b.x+nx*50)} ${n(d.b.y+ny*50)} L ${bx} ${by} M ${ax} ${ay} L ${bx} ${by}"/></g><rect x="${n(p.x-width/2)}" y="${n(p.y-100)}" width="${n(width)}" height="130" fill="white"/><text x="${n(p.x)}" y="${n(p.y)}" font-family="Arial,sans-serif" font-size="100" text-anchor="middle" fill="${style.stroke}">${esc(d.text)}</text>`;
 }).join('');
 const tagSVG=annotations.tags.map(t=>{
  const style=drawingStyle(t.object),w=t.box.x2-t.box.x1,h=t.box.y2-t.box.y1;
  return `<g data-tag-for="${esc(t.object.id)}"><path d="M ${n(t.anchor.x)} ${n(t.anchor.y)} L ${n((t.anchor.x+t.x)/2)} ${n(t.y)} L ${n(t.x)} ${n(t.y)}" stroke="${style.stroke}" stroke-width="7" fill="none"/><rect x="${n(t.box.x1)}" y="${n(t.box.y1)}" width="${n(w)}" height="${n(h)}" fill="white"/><text x="${n(t.x)}" y="${n(t.box.y1+118)}" text-anchor="middle" font-family="Arial,sans-serif" font-size="100" font-weight="600" fill="${style.stroke}">${esc(t.lines[0])}</text>${t.lines[1]?`<text x="${n(t.x)}" y="${n(t.box.y1+250)}" text-anchor="middle" font-family="Arial,sans-serif" font-size="100" fill="${style.stroke}">${esc(t.lines[1])}</text>`:''}</g>`;
 }).join('');
 const xy=a.flatMap(o=>footprint(o).map(([x,y])=>({x,y:-y})));
 for(const d of annotations.dimensions){xy.push(d.label,{x:d.box.x1,y:d.box.y1},{x:d.box.x2,y:d.box.y2})}
 for(const t of annotations.tags)xy.push({x:t.box.x1,y:t.box.y1},{x:t.box.x2,y:t.box.y2});
 const minx=Math.min(0,...xy.map(p=>p.x))-550,maxx=Math.max(3000,...xy.map(p=>p.x))+550,miny=Math.min(0,...xy.map(p=>p.y))-550,maxy=Math.max(3000,...xy.map(p=>p.y))+550;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${n(minx)} ${n(miny)} ${n(maxx-minx)} ${n(maxy-miny)}"><title>${esc(doc.name)}</title><defs>${svgPatternDefs()}</defs><rect x="${n(minx)}" y="${n(miny)}" width="${n(maxx-minx)}" height="${n(maxy-miny)}" fill="white"/>${shapes}${dimSVG}${tagSVG}</svg>`;
}
