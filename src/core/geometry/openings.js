/** Hosted rectangular openings and preview wall segmentation. All dimensions in mm. */
export function nearestWall(point,objects,maxDistance=350){
 let best=null,dist=Infinity;
 for(const wall of objects.filter(o=>o.type==='wall'&&o.visible!==false)){
  const dx=wall.x2-wall.x,dy=wall.y2-wall.y,L=Math.hypot(dx,dy);
  if(L<1)continue;
  const u=Math.max(0,Math.min(1,((point.x-wall.x)*dx+(point.y-wall.y)*dy)/(L*L)));
  const d=Math.hypot(point.x-wall.x-u*dx,point.y-wall.y-u*dy);
  if(d<dist&&d<=Math.max(maxDistance,(wall.thickness||200)/2+100)){best={wall,u,d,L};dist=d;}
 }
 return best;
}
export function openingOnWall(type,start,end,objects){
 const host=nearestWall(start,objects);if(!host)throw Error('Door/window needs an existing host wall: start on a wall in Plan');
 const {wall,L}=host;const dx=(wall.x2-wall.x)/L,dy=(wall.y2-wall.y)/L;
 const s0=(start.x-wall.x)*dx+(start.y-wall.y)*dy;
 const s1=(end.x-wall.x)*dx+(end.y-wall.y)*dy;
 const width=Math.max(100,Math.abs(s1-s0));const center=Math.max(width/2,Math.min(L-width/2,(s0+s1)/2));
 const h=type==='door'?2100:1200;const sill=type==='door'?0:900;
 return {hostId:wall.id,x:wall.x+dx*(center-width/2),y:wall.y+dy*(center-width/2),x2:wall.x+dx*(center+width/2),y2:wall.y+dy*(center+width/2),z:(wall.z||0)+sill,height:h,thickness:wall.thickness,width};
}
export function wallSections(wall,objects){
 const L=Math.hypot(wall.x2-wall.x,wall.y2-wall.y),h=Math.max(0,Number(wall.height)||0);
 if(L<1||h<1)return [];
 const openings=objects.filter(o=>(o.type==='door'||o.type==='window'||o.type==='opening'||o.type==='void')&&o.hostId===wall.id);
 const cuts=[];
 for(const o of openings){
  const dx=(wall.x2-wall.x)/L,dy=(wall.y2-wall.y)/L;
  const a=(o.x-wall.x)*dx+(o.y-wall.y)*dy,b=(o.x2-wall.x)*dx+(o.y2-wall.y)*dy;
  const left=Math.max(0,Math.min(L,Math.min(a,b))),right=Math.max(0,Math.min(L,Math.max(a,b)));
  const bottom=Math.max(0,Math.min(h,(o.z||0)-(wall.z||0))),top=Math.max(0,Math.min(h,bottom+(Number(o.height)||0)));
  if(right-left>1&&top-bottom>1)cuts.push({left,right,bottom,top});
 }
 const xs=[0,L,...cuts.flatMap(c=>[c.left,c.right])].sort((a,b)=>a-b);const result=[];
 for(let i=1;i<xs.length;i++){
  const a=xs[i-1],b=xs[i];if(b-a<.01)continue;
  const active=cuts.filter(c=>c.left<(a+b)/2&&c.right>(a+b)/2).sort((a,b)=>a.bottom-b.bottom);
  let z=0;for(const c of active){if(c.bottom>z+.01)result.push({start:a,end:b,bottom:z,top:c.bottom});z=Math.max(z,c.top);}
  if(h>z+.01)result.push({start:a,end:b,bottom:z,top:h});
 }
 return result;
}
