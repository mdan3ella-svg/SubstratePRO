import {footprint} from '../core/geometry/index.js';
import {drawingStyle} from './annotations/index.js';
import {layoutAnnotations} from './annotations/layout.js';
import {drawHatchPattern,hatchFor} from './hatch-engine/index.js';
import {drawPlanSymbol} from './symbol-registry/index.js';
export const defaultDrafting={lod:'detail',autoDimensions:true,autoTags:true,materialHatches:true};
const SYMBOL_TYPES=new Set(['door','window','fixture','equipment','furniture']);
export function draftingOverlay(ctx,objects,view,map,settings=defaultDrafting,opts={}){
 if(view!=='plan'&&view!=='top')return;
 const detail=settings.lod==='detail',schematic=settings.lod==='schematic';
 const textPx=settings.metrics?.textPx||11;
 ctx.save();ctx.lineJoin='miter';ctx.lineCap='square';
 for(const o of objects){
  const style=drawingStyle(o);
  if(o.type==='dimension')continue;
  if(SYMBOL_TYPES.has(o.type)){drawPlanSymbol(ctx,o,map,style);continue;}
  const pWorld=footprint(o).map(([x,y])=>({x,y}));const pts=pWorld.map(map);if(pts.length<3)continue;
  ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=style.fill;ctx.fill();ctx.strokeStyle=o.id===opts.selected?'#e17d25':style.stroke;ctx.lineWidth=schematic?1:style.line;ctx.stroke();
  if(detail&&settings.materialHatches)drawHatchPattern(ctx,pts,hatchFor(o.material),map(pWorld[0]));
 }
 const laid=layoutAnnotations(objects,map,{...settings,textPx});
 for(const d of laid.dimensions){const style=drawingStyle(d.object);drawDimension(ctx,d.a,d.b,d.text,style.stroke,d.offset,d.label,textPx);}
 for(const t of laid.tags){const style=drawingStyle(t.object),h=t.lines.length*(textPx+4)+7;
   ctx.save();ctx.strokeStyle=style.stroke;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(t.anchor.x,t.anchor.y);const bend={x:(t.anchor.x+t.x)/2,y:t.y};ctx.lineTo(bend.x,bend.y);ctx.lineTo(t.x,t.y);ctx.stroke();
   ctx.fillStyle='rgba(255,255,255,.97)';ctx.fillRect(t.box.x1,t.box.y1,t.box.x2-t.box.x1,t.box.y2-t.box.y1);
   ctx.textAlign='center';ctx.textBaseline='middle';t.lines.forEach((line,i)=>{ctx.font=`${i?'400':'600'} ${textPx}px Arial,sans-serif`;ctx.fillStyle=style.stroke;ctx.fillText(line,t.x,t.box.y1+8+i*(textPx+4)+textPx/2)});ctx.restore();
 }
 ctx.restore();
}
export function drawDimension(ctx,a,b,value,color='#374151',offset=28,labelPoint=null,textPx=11){const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy);if(L<16)return;const nx=-dy/L,ny=dx/L,ex=nx*offset,ey=ny*offset;ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(a.x+nx*7,a.y+ny*7);ctx.lineTo(a.x+ex+nx*7,a.y+ey+ny*7);ctx.moveTo(b.x+nx*7,b.y+ny*7);ctx.lineTo(b.x+ex+nx*7,b.y+ey+ny*7);ctx.moveTo(a.x+ex,a.y+ey);ctx.lineTo(b.x+ex,b.y+ey);for(const p of [a,b]){const x=p.x+ex,y=p.y+ey;ctx.moveTo(x-3*nx-3*dx/L,y-3*ny-3*dy/L);ctx.lineTo(x+3*nx+3*dx/L,y+3*ny+3*dy/L)}ctx.stroke();const x=labelPoint?.x??(a.x+b.x)/2+ex,y=labelPoint?.y??(a.y+b.y)/2+ey-8;ctx.font=`${textPx}px Arial,sans-serif`;ctx.textAlign='center';const width=ctx.measureText(value).width+10;ctx.fillStyle='white';ctx.fillRect(x-width/2,y-textPx,width,textPx+5);ctx.fillStyle=color;ctx.fillText(value,x,y);ctx.restore()}
