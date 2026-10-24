/** Parametric miter endpoints for paired, end-to-end walls in the same chain.
 * Returns individual closed XY boundary polygons; exact watertight union of
 * multiple touching solids requires a B-rep fuse and topology validation.
 */
const V=(p,q)=>({x:q.x-p.x,y:q.y-p.y});
const cross=(a,b)=>a.x*b.y-a.y*b.x;
const add=(a,b,s=1)=>({x:a.x+b.x*s,y:a.y+b.y*s});
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const pnt=(o,k)=>k==='start'?{x:o.x,y:o.y}:{x:o.x2,y:o.y2};
const direction=o=>{const d=V(pnt(o,'start'),pnt(o,'end')),l=Math.hypot(d.x,d.y)||1;return{x:d.x/l,y:d.y/l}};
const normal=d=>({x:-d.y,y:d.x});
const half=o=>Math.max(1,Number(o.thickness)||200)/2;
const offset=(o,end,side)=>add(pnt(o,end),normal(direction(o)),half(o)*side);
const lineIntersection=(p,d,q,e)=>{const det=cross(d,e);if(Math.abs(det)<1e-9)return null;const t=cross(V(p,q),e)/det;return add(p,d,t)};
export function wallMiterPolygons(objects,{tolerance=1,miterLimit=6}={}){
 const walls=objects.filter(o=>o.type==='wall'&&o.visible!==false&&dist(pnt(o,'start'),pnt(o,'end'))>1e-6);
 const corners=new Map(walls.map(o=>[o.id,{start:{left:offset(o,'start',1),right:offset(o,'start',-1)},end:{left:offset(o,'end',1),right:offset(o,'end',-1)}}]));
 const issues=[];const pairs=[];
 for(let i=0;i<walls.length;i++)for(let j=i+1;j<walls.length;j++){
  const a=walls[i],b=walls[j];if(!a.chainId||a.chainId!==b.chainId)continue;
  const ends=[['end','start'],['start','end']];
  for(const [ae,be] of ends){const pa=pnt(a,ae),pb=pnt(b,be);if(dist(pa,pb)>tolerance)continue;pairs.push({a:a.id,b:b.id,at:pa});
   const da=direction(a),db=direction(b);
   for(const side of [-1,1]){
    // Reverse side for end->start vs start->end only if directions oppose; avoid inverted polygons.
    const ap=offset(a,ae,side),bp=offset(b,be,side);
    const hit=lineIntersection(ap,da,bp,db);
    const limit=miterLimit*Math.max(half(a),half(b));
    if(!hit||dist(hit,pa)>limit){issues.push({a:a.id,b:b.id,reason:'collinear, acute or excessive miter; butt boundary retained'});continue;}
    corners.get(a.id)[ae][side===1?'left':'right']=hit;
    corners.get(b.id)[be][side===1?'left':'right']=hit;
   }
  }
 }
 const polygons=new Map();for(const o of walls){const c=corners.get(o.id);polygons.set(o.id,[[c.start.left.x,c.start.left.y],[c.end.left.x,c.end.left.y],[c.end.right.x,c.end.right.y],[c.start.right.x,c.start.right.y]])}
 return{polygons,pairs,issues};
}
