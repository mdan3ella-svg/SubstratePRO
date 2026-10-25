/** Plan projection of imported Three.js meshes. Units: scene metres -> BIM millimetres. */
export function modelPlanSegments(root,{maxSegments=15000}={}){
 if(!root?.traverse)throw Error('Expected a loaded 3D scene root');
 root.updateMatrixWorld?.(true);const segments=[];let bounds=null;
 root.traverse(node=>{
  if(!node.isMesh||!node.geometry?.getAttribute)return;
  const pos=node.geometry.getAttribute('position'),index=node.geometry.index;
  if(!pos)return;
  const at=i=>{const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),m=node.matrixWorld?.elements;
   if(!m)return {x:x*1000,y:y*1000,z:z*1000};
   const w=m[3]*x+m[7]*y+m[11]*z+m[15]||1;
   return {x:(m[0]*x+m[4]*y+m[8]*z+m[12])/w*1000,y:(m[1]*x+m[5]*y+m[9]*z+m[13])/w*1000,z:(m[2]*x+m[6]*y+m[10]*z+m[14])/w*1000};
  };
  const triCount=Math.floor((index?.count||pos.count)/3),stride=Math.max(1,Math.ceil(triCount*3/Math.max(1,maxSegments-segments.length)));
  for(let i=0;i<triCount&&segments.length<maxSegments;i+=stride){
   const ids=[0,1,2].map(j=>index?index.getX(i*3+j):i*3+j),pts=ids.map(at);
   for(const p of pts){if(!Number.isFinite(p.x+p.y))continue;if(!bounds)bounds={x:p.x,y:p.y,x2:p.x,y2:p.y};bounds.x=Math.min(bounds.x,p.x);bounds.x2=Math.max(bounds.x2,p.x);bounds.y=Math.min(bounds.y,p.y);bounds.y2=Math.max(bounds.y2,p.y)}
   for(let e=0;e<3&&segments.length<maxSegments;e++){const a=pts[e],b=pts[(e+1)%3];if(Number.isFinite(a.x+a.y+b.x+b.y))segments.push([a.x,a.y,b.x,b.y])}
  }
 });return {segments,bounds,units:'mm',source:'mesh top projection'};
}
export function combinedPlanBounds(objects,underlays=[],references=[]){
 const pts=[];for(const o of objects||[]){pts.push([o.x,o.y],[o.x2,o.y2])}
 for(const u of underlays||[]){if(u.visible===false)continue;const angle=(u.rotation||0)*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),x=u.x||0,y=u.y||0,w=u.widthMM||0,h=u.heightMM||0;for(const [px,py] of [[0,0],[w,0],[w,h],[0,h]])pts.push([x+c*px-s*py,y+s*px+c*py])}
 for(const r of references||[]){if(r.visible===false||!r.bounds)continue;pts.push([r.bounds.x,r.bounds.y],[r.bounds.x2,r.bounds.y2])}
 const a=pts.filter(p=>p.every(Number.isFinite));if(!a.length)return null;return {x:Math.min(...a.map(p=>p[0])),y:Math.min(...a.map(p=>p[1])),x2:Math.max(...a.map(p=>p[0])),y2:Math.max(...a.map(p=>p[1]))};
}
export function planCameraForBounds(b,w,h,padding=70){if(!b)return null;const dx=Math.max(250,b.x2-b.x),dy=Math.max(250,b.y2-b.y);return {scale:Math.min(2,Math.max(.00001,Math.min((w-2*padding)/dx,(h-2*padding)/dy))),cx:(b.x+b.x2)/2,cy:-(b.y+b.y2)/2}}
