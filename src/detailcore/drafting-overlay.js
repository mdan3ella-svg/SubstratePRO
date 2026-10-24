import {footprint,length} from '../core/geometry/index.js';
import {drawingStyle,tagFor,descriptorFor,dimensionText,labelPointFor} from './annotations/index.js';
import {drawHatchPattern,hatchFor} from './hatch-engine/index.js';
import {drawPlanSymbol} from './symbol-registry/index.js';
export const defaultDrafting={lod:'detail',autoDimensions:true,autoTags:true,materialHatches:true};
const SYMBOL_TYPES=new Set(['door','window','fixture','equipment','furniture']);
export function draftingOverlay(ctx,objects,view,map,settings=defaultDrafting,opts={}){
 if(view!=='plan'&&view!=='top')return;
 const detail=settings.lod==='detail', schematic=settings.lod==='schematic', coordination=settings.lod==='coordination';
 ctx.save();ctx.lineJoin='miter';ctx.lineCap='square';
 for(const o of objects){
  const style=drawingStyle(o);
  if(o.type==='dimension'){
   if(settings.autoDimensions) drawDimension(ctx,map({x:o.x,y:o.y}),map({x:o.x2,y:o.y2}),dimensionText(o),style.stroke,18);
   continue;
  }
  if(SYMBOL_TYPES.has(o.type)){
   drawPlanSymbol(ctx,o,map,style);
   if(settings.autoTags){
    const a=labelPointFor(o);const p=map(a);label(ctx,tagFor(o),p.x,p.y-6,style.stroke,true);
    if(detail)label(ctx,descriptorFor(o),p.x,p.y+11,style.stroke,false);
   }
   continue;
  }
  const ptsWorld=footprint(o).map(([x,y])=>({x,y}));
  const footprintPoints=ptsWorld.map(map);
  if(footprintPoints.length!==4)continue;
  ctx.beginPath();footprintPoints.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=style.fill;ctx.fill();ctx.strokeStyle=o.id===opts.selected?'#e17d25':style.stroke;ctx.lineWidth=schematic?1:style.line;ctx.stroke();
  if(detail&&settings.materialHatches){drawHatchPattern(ctx,footprintPoints,hatchFor(o.material),map({x:ptsWorld[0].x,y:ptsWorld[0].y}))}
  const p1=map({x:o.x,y:o.y}),p2=map({x:o.x2,y:o.y2});
  const distance=Math.hypot(p2.x-p1.x,p2.y-p1.y);
  if(settings.autoTags&&(!schematic||distance>65)){
   const anchor=labelPointFor(o),mid=map(anchor);
   label(ctx,tagFor(o),mid.x,mid.y-6,style.stroke,true);
   if((detail||coordination)&&distance>90)label(ctx,`${o.material} · ${Math.round(o.thickness||0)} mm`,mid.x,mid.y+11,style.stroke,false);
  }
  if(settings.autoDimensions&&detail&&['wall','beam','duct','pipe','road','conduit'].includes(o.type)&&distance>38){drawDimension(ctx,p1,p2,`${Math.round(length(o)).toLocaleString('en-US')} mm`,style.stroke,23);}
 }
 ctx.restore();
}
function label(ctx,value,x,y,color,strong){ctx.font=`${strong?'600':'400'} ${strong?11:10}px Arial, sans-serif`;const width=ctx.measureText(value).width;ctx.fillStyle='rgba(255,255,255,.92)';ctx.fillRect(x-width/2-3,y-10,width+6,13);ctx.fillStyle=color;ctx.textAlign='center';ctx.fillText(value,x,y);ctx.textAlign='start'}
export function drawDimension(ctx,a,b,value,color='#374151',offset=22){const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy);if(L<16)return;const nx=-dy/L,ny=dx/L,ex=nx*offset,ey=ny*offset;ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(a.x+nx*7,a.y+ny*7);ctx.lineTo(a.x+ex+nx*7,a.y+ey+ny*7);ctx.moveTo(b.x+nx*7,b.y+ny*7);ctx.lineTo(b.x+ex+nx*7,b.y+ey+ny*7);ctx.moveTo(a.x+ex,a.y+ey);ctx.lineTo(b.x+ex,b.y+ey);for(const p of [a,b]){const x=p.x+ex,y=p.y+ey;ctx.moveTo(x-3*nx-3*dx/L,y-3*ny-3*dy/L);ctx.lineTo(x+3*nx+3*dx/L,y+3*ny+3*dy/L)}ctx.stroke();label(ctx,value,(a.x+b.x)/2+ex,(a.y+b.y)/2+ey-4,color,false);ctx.restore()}
