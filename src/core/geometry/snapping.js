// All geometry coordinates in millimetres; screen tolerance converted by viewport scale.
export const roundGrid=(v,step)=>Math.round(v/step)*step;
export function endpoints(objects,excludeId=null){return objects.filter(o=>o.visible!==false&&o.id!==excludeId&&['wall','beam','line','duct','pipe','conduit','road'].includes(o.type)).flatMap(o=>[{x:o.x,y:o.y,owner:o.id},{x:o.x2,y:o.y2,owner:o.id}]);}
export function snapPoint(p,{objects=[],step=250,grid=true,endpoint=true,scale=1,excludeId=null,tolerancePixels=12}={}){
 const tol=Math.min(500,Math.max(1,tolerancePixels/Math.max(scale,.000001)));
 if(endpoint){let best=null,dist=Infinity;for(const q of endpoints(objects,excludeId)){const d=Math.hypot(p.x-q.x,p.y-q.y);if(d<=tol&&d<dist){best=q;dist=d;}}if(best)return{x:best.x,y:best.y,mode:'endpoint',owner:best.owner};}
 if(grid&&Number.isFinite(step)&&step>0)return{x:roundGrid(p.x,step),y:roundGrid(p.y,step),mode:'grid'};
 return{x:Math.round(p.x),y:Math.round(p.y),mode:'free'};
}
export function wallEnd(start,p,opts={}){
 const axisLocked=opts.orthogonal!==false&&!opts.diagonalOverride;
 let q={...p};
 if(axisLocked){const dx=p.x-start.x,dy=p.y-start.y;
  if(Math.abs(dx)>=Math.abs(dy))q.y=start.y;else q.x=start.x;
 }
 // Endpoint snapping must respect a locked axis, never turn a wall diagonal.
 if(opts.endpoint!==false){const tol=Math.min(500,12/Math.max(opts.scale||1,.000001));let best=null,dist=Infinity;
  for(const e of endpoints(opts.objects||[])){const dx=e.x-q.x,dy=e.y-q.y;
   if(axisLocked&&(q.y===start.y?Math.abs(e.y-start.y)>0.001:Math.abs(e.x-start.x)>0.001))continue;
   const d=Math.hypot(dx,dy);if(d<=tol&&d<dist){best=e;dist=d;}
  }
  if(best)return{x:best.x,y:best.y,mode:'endpoint'};
 }
 if(opts.grid&&opts.step>0){if(!axisLocked||q.x!==start.x)q.x=roundGrid(q.x,opts.step);if(!axisLocked||q.y!==start.y)q.y=roundGrid(q.y,opts.step);}
 return{x:Math.round(q.x),y:Math.round(q.y),mode:axisLocked?'axis':'free'};
}
