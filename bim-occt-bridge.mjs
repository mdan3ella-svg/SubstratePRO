/* SUBSTRATE PRO 4.6 — BIM/OCCT feature synchronization.
 * The original BIM document is the authoritative record. B-reps are rebuilt from parameters.
 * Only axis-aligned prismatic element mappings are allowed; never silently approximate diagonals.
 */
export const BRIDGE_VERSION='4.6.0';
const num=x=>Number(x);
const finite=(...xs)=>xs.every(Number.isFinite);
export function elementBounds(e){
 if(!e || !['wall','slab','beam','column'].includes(e.type))return {reason:'Unsupported element type'};
 const [x1,y1,x2,y2,z,h,t]=[e.x1,e.y1,e.x2,e.y2,e.z??0,e.height,e.thickness].map(num);
 if(!finite(x1,y1,x2,y2,z,h,t)||h<=0)return {reason:'Invalid coordinates, height, or elevation'};
 const dx=x2-x1,dy=y2-y1,axisX=Math.abs(dy)<1e-6,axisY=Math.abs(dx)<1e-6;
 let b;
 if(e.type==='wall'||e.type==='beam'){
  if(t<=0)return {reason:'Invalid thickness'};
  if(!axisX&&!axisY)return {reason:'Diagonal centerline needs oriented B-rep support'};
  if(Math.hypot(dx,dy)<1e-6)return {reason:'Zero-length centerline'};
  b=axisX?[Math.min(x1,x2),y1-t/2,z,Math.max(x1,x2),y1+t/2,z+h]:[x1-t/2,Math.min(y1,y2),z,x1+t/2,Math.max(y1,y2),z+h];
 }else if(e.type==='slab'||e.type==='column'){
  b=[Math.min(x1,x2),Math.min(y1,y2),z,Math.max(x1,x2),Math.max(y1,y2),z+h];
 }else return {reason:'Unsupported kind'};
 if(!(b[3]>b[0]&&b[4]>b[1]&&b[5]>b[2]))return {reason:'Non-positive solid dimensions'};
 return {bounds:b};
}
export function exportBIMFeatures(doc){
 const features=[],skipped=[];for(const e of doc?.elements||[]){const mapped=elementBounds(e);if(mapped.reason){skipped.push({id:String(e.id??'?'),reason:mapped.reason});continue;}
 features.push({id:String(e.id),kind:e.type,params:{bounds:mapped.bounds},metadata:{discipline:e.discipline||'architectural',material:e.material||'Generic',level:e.level||'L1',name:e.name||e.type,bimId:String(e.id),source:'substrate-bim'},revision:1});}
 return {schema:'substrate-occt-features/1',units:'mm',features,operations:[],skipped};
}
export function applyFeatureEdits(doc,record){
 if(!doc||!Array.isArray(doc.elements)||!Array.isArray(record?.features))throw Error('Missing BIM source or CAD features');
 const byId=new Map(doc.elements.map(e=>[String(e.id),e]));const changes=[],rejected=[];
 for(const f of record.features){const e=byId.get(String(f.metadata?.bimId||f.id));if(!e){rejected.push({id:f.id,reason:'Feature not found in source BIM model'});continue;}
  const b=f.params?.bounds;if(!Array.isArray(b)||b.length!==6||!b.every(x=>Number.isFinite(Number(x)))){rejected.push({id:f.id,reason:'Invalid bounds'});continue;}
  const [x0,y0,z0,x1,y1,z1]=b.map(Number);if(x1<=x0||y1<=y0||z1<=z0){rejected.push({id:f.id,reason:'Invalid solid envelope'});continue;}
  if(e.type==='wall'||e.type==='beam'){
   const wasX=Math.abs(Number(e.y2)-Number(e.y1))<1e-6,wasY=Math.abs(Number(e.x2)-Number(e.x1))<1e-6;
   if(!wasX&&!wasY){rejected.push({id:f.id,reason:'Oriented beam/wall editing unsupported'});continue;}
   if(wasX){const cy=(y0+y1)/2;e.x1=x0;e.x2=x1;e.y1=cy;e.y2=cy;e.thickness=y1-y0;}
   else {const cx=(x0+x1)/2;e.x1=cx;e.x2=cx;e.y1=y0;e.y2=y1;e.thickness=x1-x0;}
  }else if(e.type==='slab'||e.type==='column'){e.x1=x0;e.y1=y0;e.x2=x1;e.y2=y1;}
  else {rejected.push({id:f.id,reason:'Unsupported authored BIM object'});continue;}
  e.z=z0;e.height=z1-z0;if(f.metadata?.material)e.material=String(f.metadata.material);changes.push(e.id);
 }
 return {changes,rejected};
}
