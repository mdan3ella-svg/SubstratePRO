import {footprint,length} from '../core/geometry/index.js';
import {drawingStyle,tagFor} from '../detailcore/annotations/index.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const n=x=>Math.round(Number(x)*100)/100;
export function planSVG(doc,settings={lod:"detail",autoDimensions:true,autoTags:true,materialHatches:true}){const a=doc.objects.filter(o=>o.visible!==false),minx=Math.min(0,...a.flatMap(o=>[o.x,o.x2]))-1500,maxx=Math.max(3000,...a.flatMap(o=>[o.x,o.x2]))+1500,miny=Math.min(0,...a.flatMap(o=>[o.y,o.y2]))-1500,maxy=Math.max(3000,...a.flatMap(o=>[o.y,o.y2]))+1500;
const defs=`<defs><pattern id="hatch" patternUnits="userSpaceOnUse" width="140" height="140" patternTransform="rotate(45)"><path d="M 0 0 V 140" stroke="#384750" stroke-opacity=".18" stroke-width="9"/></pattern></defs>`;
let shapes=a.map(o=>{const style=drawingStyle(o),pts=footprint(o).map(([x,y])=>`${n(x)},${n(-y)}`).join(' '),cx=n((o.x+o.x2)/2),cy=n(-(o.y+o.y2)/2),l=Math.round(length(o));const tag=esc(tagFor(o)),dimTypes=['wall','beam','duct','pipe','conduit','road'];let geometry=`<polygon points="${pts}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="${n(style.line*12)}"/>`;
if(o.type==='dimension')geometry='';else if(settings.materialHatches&&settings.lod==='detail')geometry+=`<polygon points="${pts}" fill="url(#hatch)"/>`;
if(settings.autoTags&&settings.lod!=='schematic'&&o.type!=='dimension')geometry+=`<text x="${cx}" y="${cy-45}" font-family="Arial,sans-serif" font-size="110" text-anchor="middle" fill="${style.stroke}">${tag}</text>`;
if(settings.autoDimensions&&(dimTypes.includes(o.type)||o.type==='dimension')){
 const dx=o.x2-o.x,dy=o.y2-o.y,L=Math.hypot(dx,dy)||1,off=220,nx=-dy/L,ny=dx/L,ax=n(o.x+nx*off),ay=n(-o.y-ny*off),bx=n(o.x2+nx*off),by=n(-o.y2-ny*off);
 geometry+=`<g stroke="${style.stroke}" stroke-width="11" fill="none"><path d="M ${n(o.x)} ${n(-o.y)} L ${ax} ${ay} M ${n(o.x2)} ${n(-o.y2)} L ${bx} ${by} M ${ax} ${ay} L ${bx} ${by}"/></g><text x="${n((ax+bx)/2)}" y="${n((ay+by)/2-45)}" font-family="Arial,sans-serif" font-size="105" text-anchor="middle" fill="${style.stroke}">${l} mm</text>`;
}return `<g data-element-id="${esc(o.id)}" data-discipline="${esc(o.discipline)}">${geometry}</g>`}).join('');return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minx} ${-maxy} ${maxx-minx} ${maxy-miny}"><title>${esc(doc.name)}</title>${defs}<rect x="${minx}" y="${-maxy}" width="${maxx-minx}" height="${maxy-miny}" fill="white"/>${shapes}</svg>`}
