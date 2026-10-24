import {footprint,project,length} from '../core/geometry/index.js';
import {drawingStyle,tagFor,descriptorFor,dimensionText} from './annotations/index.js';
export const defaultDrafting={lod:'detail',autoDimensions:true,autoTags:true,materialHatches:true};
export function draftingOverlay(ctx,objects,view,map,settings=defaultDrafting){
 if(view!=='plan'&&view!=='top')return;
 const detail=settings.lod==='detail', schematic=settings.lod==='schematic';
 ctx.save();ctx.lineJoin='miter';ctx.lineCap='square';
 for(const o of objects){
  const footprintPoints=footprint(o).map(([x,y])=>map(project({x,y,z:0},'plan')));
  const style=drawingStyle(o);if(o.type==='dimension'){
   if(settings.autoDimensions) drawDimension(ctx,map(project({x:o.x,y:o.y,z:0},'plan')),map(project({x:o.x2,y:o.y2,z:0},'plan')),dimensionText(o),style.stroke,18);
   continue;
  }
  if(footprintPoints.length!==4)continue;
  ctx.beginPath();footprintPoints.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=style.fill;ctx.fill();ctx.strokeStyle=style.stroke;ctx.lineWidth=schematic?1:style.line;ctx.stroke();
  if(detail&&settings.materialHatches){
   ctx.save();ctx.clip();const xs=footprintPoints.map(p=>p.x),ys=footprintPoints.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
   ctx.strokeStyle=style.stroke;ctx.globalAlpha=.24;ctx.lineWidth=.75;
   const span=Math.min(800,Math.max(maxX-minX,maxY-minY));const step=o.material==='Concrete'?12:o.material==='Steel'?8:o.material==='Timber'?17:15;
   if(span>2&&span<800){ctx.beginPath();for(let d=-span;d<2*span;d+=step){ctx.moveTo(minX+d,minY);ctx.lineTo(minX+d-span,maxY)}ctx.stroke();}
   ctx.restore();
  }
  const p1=map(project({x:o.x,y:o.y,z:0},'plan')),p2=map(project({x:o.x2,y:o.y2,z:0},'plan'));
  const distance=Math.hypot(p2.x-p1.x,p2.y-p1.y);
  if(settings.autoTags&&(!schematic||distance>65)){
   const mid={x:(p1.x+p2.x)/2,y:(p1.y+p2.y)/2};
   label(ctx,tagFor(o),mid.x,mid.y-6,style.stroke,true);
   if(detail&&distance>100)label(ctx,`${o.material} · ${Math.round(o.thickness||0)} mm`,mid.x,mid.y+11,style.stroke,false);
  }
  if(settings.autoDimensions&&detail&&['wall','beam','duct','pipe','road','conduit'].includes(o.type)&&distance>38){drawDimension(ctx,p1,p2,`${Math.round(length(o)).toLocaleString('en-US')} mm`,style.stroke,23);}
 }
 ctx.restore();
}
function label(ctx,value,x,y,color,strong){ctx.font=`${strong?'600':'400'} ${strong?11:10}px Arial, sans-serif`;const width=ctx.measureText(value).width;ctx.fillStyle='rgba(255,255,255,.92)';ctx.fillRect(x-width/2-3,y-10,width+6,13);ctx.fillStyle=color;ctx.textAlign='center';ctx.fillText(value,x,y);ctx.textAlign='start'}
export function drawDimension(ctx,a,b,value,color='#374151',offset=22){const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy);if(L<16)return;const nx=-dy/L,ny=dx/L,ex=nx*offset,ey=ny*offset;ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(a.x+nx*7,a.y+ny*7);ctx.lineTo(a.x+ex+nx*7,a.y+ey+ny*7);ctx.moveTo(b.x+nx*7,b.y+ny*7);ctx.lineTo(b.x+ex+nx*7,b.y+ey+ny*7);ctx.moveTo(a.x+ex,a.y+ey);ctx.lineTo(b.x+ex,b.y+ey);for(const p of [a,b]){const x=p.x+ex,y=p.y+ey;ctx.moveTo(x-3*nx-3*dx/L,y-3*ny-3*dy/L);ctx.lineTo(x+3*nx+3*dx/L,y+3*ny+3*dy/L)}ctx.stroke();label(ctx,value,(a.x+b.x)/2+ex,(a.y+b.y)/2+ey-4,color,false);ctx.restore()}
