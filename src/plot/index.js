import {footprint} from '../core/geometry/index.js';
import {drawingStyle} from '../detailcore/annotations/index.js';
import {layoutAnnotations} from '../detailcore/annotations/layout.js';
import {svgPatternDefs,svgFillFor} from '../detailcore/hatch-engine/index.js';
import {svgSymbol} from '../detailcore/symbol-registry/index.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const n=x=>Math.round(Number(x)*100)/100;
const SYMBOL_TYPES=new Set(['door','window','fixture','equipment','furniture']);
export function planSVG(doc,options={}){
 const scale=[5,10,20,50,100,200,500].includes(Number(options.scale))?Number(options.scale):100;
 const paper=paperDraftingStyle(scale,options);
 const a=doc.objects.filter(o=>o.visible!==false);
 const map=p=>({x:p.x,y:-p.y});
 // SVG model units are millimetres; 100 mm text height is appropriate for a nominal 1:100 drawing.
 const textPx=paper.text,settings={lod:options.lod||'detail',autoDimensions:options.autoDimensions!==false,autoTags:options.autoTags!==false,textPx,dimOffsetPx:paper.dimensionOffset,clearancePx:paper.clearance};
 const annotations=layoutAnnotations(a,map,settings);
 const shapes=a.map(o=>{
  const style=drawingStyle(o),pts=footprint(o).map(([x,y])=>`${n(x)},${n(-y)}`).join(' ');
  let g='';if(o.type==='dimension')return '';
  if(SYMBOL_TYPES.has(o.type))g=svgSymbol(o,style);
  else g=`<polygon points="${pts}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="${n(style.line*scale*0.18)}"/><polygon points="${pts}" fill="${svgFillFor(o.material)}"/>`;
  return `<g data-element-id="${esc(o.id)}" data-discipline="${esc(o.discipline)}" data-type="${esc(o.type)}">${g}</g>`
 }).join('');
 const dimSVG=annotations.dimensions.map(d=>{
  const style=drawingStyle(d.object),dx=d.b.x-d.a.x,dy=d.b.y-d.a.y,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,off=d.offset;
  const ax=n(d.a.x+nx*off),ay=n(d.a.y+ny*off),bx=n(d.b.x+nx*off),by=n(d.b.y+ny*off);
  const p=d.label, width=Math.max(paper.text*3.5,d.text.length*paper.text*.63);
  return `<g data-associative-source="${esc(d.object.sourceId||d.object.id)}" stroke="${style.stroke}" fill="none" stroke-width="${n(paper.dimLine)}"><path d="M ${n(d.a.x+nx*50)} ${n(d.a.y+ny*50)} L ${ax} ${ay} M ${n(d.b.x+nx*50)} ${n(d.b.y+ny*50)} L ${bx} ${by} M ${ax} ${ay} L ${bx} ${by}"/></g><rect x="${n(p.x-width/2)}" y="${n(p.y-paper.text)}" width="${n(width)}" height="${n(paper.text*1.35)}" fill="white"/><text x="${n(p.x)}" y="${n(p.y)}" font-family="Arial,sans-serif" font-size="${n(paper.text)}" text-anchor="middle" fill="${style.stroke}">${esc(d.text)}</text>`;
 }).join('');
 const tagSVG=annotations.tags.map(t=>{
  const style=drawingStyle(t.object),w=t.box.x2-t.box.x1,h=t.box.y2-t.box.y1;
  return `<g data-tag-for="${esc(t.object.id)}"><path d="M ${n(t.anchor.x)} ${n(t.anchor.y)} L ${n((t.anchor.x+t.x)/2)} ${n(t.y)} L ${n(t.x)} ${n(t.y)}" stroke="${style.stroke}" stroke-width="${n(paper.leaderLine)}" fill="none"/><rect x="${n(t.box.x1)}" y="${n(t.box.y1)}" width="${n(w)}" height="${n(h)}" fill="white"/><text x="${n(t.x)}" y="${n(t.box.y1+paper.text*1.15)}" text-anchor="middle" font-family="Arial,sans-serif" font-size="${n(paper.text)}" font-weight="600" fill="${style.stroke}">${esc(t.lines[0])}</text>${t.lines[1]?`<text x="${n(t.x)}" y="${n(t.box.y1+paper.text*2.45)}" text-anchor="middle" font-family="Arial,sans-serif" font-size="${n(paper.text)}" fill="${style.stroke}">${esc(t.lines[1])}</text>`:''}</g>`;
 }).join('');
 const xy=a.flatMap(o=>footprint(o).map(([x,y])=>({x,y:-y})));
 for(const d of annotations.dimensions){xy.push(d.label,{x:d.box.x1,y:d.box.y1},{x:d.box.x2,y:d.box.y2})}
 for(const t of annotations.tags)xy.push({x:t.box.x1,y:t.box.y1},{x:t.box.x2,y:t.box.y2});
 const padding=paper.clearance*3;const minx=Math.min(0,...xy.map(p=>p.x))-padding,maxx=Math.max(3000,...xy.map(p=>p.x))+padding,miny=Math.min(0,...xy.map(p=>p.y))-padding,maxy=Math.max(3000,...xy.map(p=>p.y))+padding;
 return `<svg xmlns="http://www.w3.org/2000/svg" data-plot-scale="1:${scale}" width="${n((maxx-minx)/scale)}mm" height="${n((maxy-miny)/scale)}mm" viewBox="${n(minx)} ${n(miny)} ${n(maxx-minx)} ${n(maxy-miny)}"><title>${esc(doc.name)}</title><defs>${svgPatternDefs()}</defs><rect x="${n(minx)}" y="${n(miny)}" width="${n(maxx-minx)}" height="${n(maxy-miny)}" fill="white"/>${shapes}${dimSVG}${tagSVG}</svg>`;
}

/** Sheet conventions use actual millimetres. Paper text at 2.5mm becomes 250 model units at 1:100. */
export function paperDraftingStyle(scale, options={}){
 const s=Math.max(1,Number(scale)||100),textMM=Math.min(5,Math.max(1.8,Number(options.textMM)||2.5));
 return {scale:s,text:textMM*s,dimLine:.18*s,leaderLine:.13*s,dimensionOffset:Math.max(7*s,3*textMM*s),clearance:Math.max(2*s,textMM*s)};
}

/** Technical vector review for elevation / axonometric views.
 * Parallel projection, no perspective scaling. No certified hidden-line removal.
 */
export function technicalViewSVG(doc,view='front',options={}){
 if(view==='plan'||view==='top')return planSVG(doc,options);
 const allowed=['front','rear','left','right','iso'];if(!allowed.includes(view))throw Error('Invalid technical projection');
 const scale=[5,10,20,50,100,200,500].includes(Number(options.scale))?Number(options.scale):100;
 const elements=doc.objects.filter(o=>o.visible!==false&&o.type!=='dimension');
 const all=[],parts=[];const projection=p=>{
  if(view==='front')return {x:p.x,y:-p.z};if(view==='rear')return{x:-p.x,y:-p.z};
  if(view==='right')return{x:p.y,y:-p.z};if(view==='left')return{x:-p.y,y:-p.z};
  return{x:(p.x-p.y)*Math.SQRT1_2,y:(p.x+p.y)*.408248-p.z*.816496};
 };
 for(const o of elements){const p=prismForTechnical(o),vertices=[...p.bottom,...p.top];const pts=vertices.map(projection);all.push(...pts);const style=drawingStyle(o);const edges=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
 const paths=edges.map(([i,j])=>`M${n(pts[i].x)} ${n(pts[i].y)}L${n(pts[j].x)} ${n(pts[j].y)}`).join(' ');
 parts.push(`<g data-element-id="${esc(o.id)}" data-level="${esc(o.level||'')}" fill="none" stroke="${style.stroke}" stroke-width="${n(.18*scale)}"><path d="${paths}"/></g>`);
 }
 const fallback=[{x:-1500,y:-1000},{x:1500,y:1000}],pts=all.length?all:fallback;
 const p=paperDraftingStyle(scale,options).clearance*4;
 const minx=Math.min(...pts.map(t=>t.x))-p,maxx=Math.max(...pts.map(t=>t.x))+p,miny=Math.min(...pts.map(t=>t.y))-p,maxy=Math.max(...pts.map(t=>t.y))+p;
 return `<svg xmlns="http://www.w3.org/2000/svg" data-projection="${view}" data-plot-scale="1:${scale}" width="${n((maxx-minx)/scale)}mm" height="${n((maxy-miny)/scale)}mm" viewBox="${n(minx)} ${n(miny)} ${n(maxx-minx)} ${n(maxy-miny)}"><title>${esc(doc.name)} ${view.toUpperCase()}</title><rect x="${n(minx)}" y="${n(miny)}" width="${n(maxx-minx)}" height="${n(maxy-miny)}" fill="white"/>${parts.join('')}</svg>`;
}
function prismForTechnical(o){const polygon=footprint(o),z=Number(o.z)||0,h=Math.max(0,Number(o.height)||0);return {bottom:polygon.map(([x,y])=>({x,y,z})),top:polygon.map(([x,y])=>({x,y,z:z+h}))}}
