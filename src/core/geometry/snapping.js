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


// Geometry-level snap candidates, in millimetres; filters preserve original object ownership.
export function nearestOnSegment(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy;if(d<1e-10)return {...a,t:0};const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/d));return{x:a.x+t*dx,y:a.y+t*dy,t};}
export function segmentIntersection(a,b,c,d){const r={x:b.x-a.x,y:b.y-a.y},s={x:d.x-c.x,y:d.y-c.y};const det=r.x*s.y-r.y*s.x;if(Math.abs(det)<1e-8)return null;const u=((c.x-a.x)*r.y-(c.y-a.y)*r.x)/det,t=((c.x-a.x)*s.y-(c.y-a.y)*s.x)/det;return t>=-1e-7&&t<=1+1e-7&&u>=-1e-7&&u<=1+1e-7?{x:a.x+t*r.x,y:a.y+t*r.y}:null;}
export function precisionSnap(p,{objects=[],step=250,grid=true,scale=1,endpoint=true,midpoint=true,intersection=true,perpendicular=true,origin=null,tolerancePixels=13}={}){
 const tolerance=Math.min(500,Math.max(2,tolerancePixels/Math.max(scale,0.00001)));const candidates=[];
 const segments=objects.filter(o=>o.visible!==false&&['wall','beam','line','pipe','duct','conduit','road','dimension'].includes(o.type)).map(o=>({a:{x:o.x,y:o.y},b:{x:o.x2,y:o.y2},id:o.id}));
 const add=(q,mode,id,rank)=>{const d=Math.hypot(q.x-p.x,q.y-p.y);if(d<=tolerance)candidates.push({...q,mode,owner:id,rank,dist:d})};
 for(const seg of segments){if(endpoint){add(seg.a,'endpoint',seg.id,0);add(seg.b,'endpoint',seg.id,0)}if(midpoint)add({x:(seg.a.x+seg.b.x)/2,y:(seg.a.y+seg.b.y)/2},'midpoint',seg.id,2);if(perpendicular&&origin){const q=nearestOnSegment(origin,seg.a,seg.b);add(q,'perpendicular',seg.id,3)}}
 if(intersection)for(let i=0;i<segments.length;i++)for(let j=i+1;j<segments.length;j++){const q=segmentIntersection(segments[i].a,segments[i].b,segments[j].a,segments[j].b);if(q)add(q,'intersection',segments[i].id,1)}
 candidates.sort((a,b)=>a.rank-b.rank||a.dist-b.dist);if(candidates.length)return candidates[0];
 if(grid&&step>0)return{x:roundGrid(p.x,step),y:roundGrid(p.y,step),mode:'grid'};
 return{x:Math.round(p.x),y:Math.round(p.y),mode:'free'};
}
export function wallJoinReport(objects,tolerance=2){const walls=objects.filter(o=>o.type==='wall'&&o.visible!==false);const joins=[];for(let i=0;i<walls.length;i++)for(let j=i+1;j<walls.length;j++){
 const a=walls[i],b=walls[j],endsA=[{x:a.x,y:a.y},{x:a.x2,y:a.y2}],endsB=[{x:b.x,y:b.y},{x:b.x2,y:b.y2}];let joined=false;
 for(let ai=0;ai<2;ai++)for(let bi=0;bi<2;bi++){if(Math.hypot(endsA[ai].x-endsB[bi].x,endsA[ai].y-endsB[bi].y)<=tolerance){joins.push({wallA:a.id,wallB:b.id,kind:'endpoint',point:endsA[ai]});joined=true}}
 if(!joined){const hit=segmentIntersection(endsA[0],endsA[1],endsB[0],endsB[1]);if(hit)joins.push({wallA:a.id,wallB:b.id,kind:'crossing',point:hit});else for(const pt of endsA){const q=nearestOnSegment(pt,endsB[0],endsB[1]);if(q.t>.00001&&q.t<.99999&&Math.hypot(pt.x-q.x,pt.y-q.y)<=tolerance)joins.push({wallA:a.id,wallB:b.id,kind:'tee',point:q})}}
 }return joins;}
export function alignEndpointToWalls(p,objects,tolerance=2){for(const w of objects.filter(o=>o.type==='wall')){for(const q of [{x:w.x,y:w.y},{x:w.x2,y:w.y2}])if(Math.hypot(p.x-q.x,p.y-q.y)<=tolerance)return q;}return p;}
