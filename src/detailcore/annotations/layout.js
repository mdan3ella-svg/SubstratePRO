import {footprint,length} from '../../core/geometry/index.js';
import {tagFor,descriptorFor,dimensionText} from './index.js';
const linear=new Set(['wall','beam','duct','pipe','conduit','road']);
const rect=(x,y,w,h)=>({x1:x-w/2,y1:y-h/2,x2:x+w/2,y2:y+h/2});
const overlap=(a,b,gap=3)=>a.x1<b.x2+gap&&a.x2+gap>b.x1&&a.y1<b.y2+gap&&a.y2+gap>b.y1;
function bbox(poly){return {x1:Math.min(...poly.map(p=>p.x)),y1:Math.min(...poly.map(p=>p.y)),x2:Math.max(...poly.map(p=>p.x)),y2:Math.max(...poly.map(p=>p.y))}}
const centers=o=>({x:(o.x+o.x2)/2,y:(o.y+o.y2)/2});
export function layoutAnnotations(objects,map,{autoTags=true,autoDimensions=true,lod='detail',textPx=11,dimOffsetPx=28,clearancePx=12,globalScale=1}={}){
 const obstacles=objects.filter(o=>o.type!=='dimension').map(o=>bbox(footprint(o).map(([x,y])=>map({x,y}))));
 const occupied=[];const dimensions=[],tags=[];const reserve=(box)=>{occupied.push(box)};
 const collides=(box,ignore=[])=>occupied.some(b=>overlap(box,b,4))||obstacles.some((b,i)=>!ignore.includes(i)&&overlap(box,b,clearancePx));
 // Dimensions are positioned first, followed by tags to prioritize measurement legibility.
 if(autoDimensions){
   objects.forEach((o,i)=>{
     if(o.type!=='dimension'&&(!linear.has(o.type)||lod!=='detail'))return;
     const a=map({x:o.x,y:o.y}),b=map({x:o.x2,y:o.y2}),dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy);if(L<24)return;
     const nx=-dy/L,ny=dx/L;
     if(o.type==='dimension'&&o.dimHidden===true)return;
     const text=(o.dimensionTextOverride&&String(o.dimensionTextOverride).trim())||(o.type==='dimension'?dimensionText(o):`${Math.round(length(o))} mm`);
     const width=Math.max(42,text.length*textPx*.59+12),height=textPx+9;
     const manual=Number(o.dimensionOffsetPx);const preferred=o.type==='dimension'&&Number.isFinite(manual)&&manual>0?manual:Math.max(dimOffsetPx,28);
     let chosen=null;
     for(const side of (o.dimensionSide===-1?[-1]:o.dimensionSide===1?[1]:[1,-1])){for(let lane=0;lane<12;lane++){
       const offset=side*(preferred+lane*(height+12));const x=(a.x+b.x)/2+nx*offset,y=(a.y+b.y)/2+ny*offset;
       const labelBox=rect(x,y-8,width,height);
       // Do not count source geometry as a collision if the dimension originates at its boundary.
       if(!collides(labelBox,[i])){chosen={object:o,a,b,offset,label:{x,y:y-8},text,box:labelBox};break}
     }if(chosen)break}
     if(!chosen){const offset=preferred+9*(height+12);const x=(a.x+b.x)/2+nx*offset,y=(a.y+b.y)/2+ny*offset;chosen={object:o,a,b,offset,label:{x,y:y-8},text,box:rect(x,y-8,width,height),overflow:true}}
     dimensions.push(chosen);reserve(chosen.box);
   });
 }
 if(autoTags){
   objects.forEach((o,i)=>{
     if(o.type==='dimension')return;
     const c=centers(o),anchor=map(c),lines=[tagFor(o)];
     if(lod==='detail')lines.push(descriptorFor(o));
     const width=Math.max(...lines.map(x=>x.length))*textPx*.58+16,height=lines.length*(textPx+4)+7;
     const poly=footprint(o).map(([x,y])=>map({x,y})),b=bbox(poly);
     const spots=[
       {x:(b.x1+b.x2)/2,y:b.y1-height/2-clearancePx-8},
       {x:b.x2+width/2+clearancePx+8,y:(b.y1+b.y2)/2},
       {x:(b.x1+b.x2)/2,y:b.y2+height/2+clearancePx+8},
       {x:b.x1-width/2-clearancePx-8,y:(b.y1+b.y2)/2}
     ];
     let chosen;
     for(let ring=0;ring<14&&!chosen;ring++)for(const p of spots){const shift=ring*(height+12);const x=p.x+(p.x>anchor.x?shift:p.x<anchor.x?-shift:0),y=p.y+(p.y>anchor.y?shift:p.y<anchor.y?-shift:0);const box=rect(x,y,width,height);if(!collides(box)){chosen={object:o,lines,x,y,box,anchor};break}}
     if(!chosen){const x=spots[0].x,y=spots[0].y-10*(height+12);chosen={object:o,lines,x,y,box:rect(x,y,width,height),anchor,overflow:true}}
     reserve(chosen.box);tags.push(chosen);
   });
 }
 return {dimensions,tags};
}
