/** Exact OpenCascade-backed solids through brepjs/quick.
 * All B-rep coordinates are in millimetres, local to each element.
 * No silent fake CSG: failed exact shapes are reported by element ID.
 */
import {footprint} from '../index.js';
let cad=null;
const err=e=>String(e?.message||e);
export const kernelReady=()=>Boolean(cad);
export async function initializeBrep(){
  if(cad)return cad;
  // The quick entry point initializes the OCCT WASM runtime itself.
  // Use explicit initialization so the browser can report kernel errors separately.
  // This npm specifier must be rewritten by Vite during the production build.
  const api=await import('brepjs');
  const kernelId=await api.init();
  if(!kernelId)throw Error('No OpenCascade WASM kernel was initialized');
  const b=api.box(10,10,10);
  const volume=api.shape(b).volume();
  if(!Number.isFinite(volume)||Math.abs(volume-1000)>1e-2)throw Error(`Exact box self-test failed: ${volume}`);
  // Volume must decrease after subtracting a cutter intersecting the box.
  const cut=api.shape(b).cut(api.box(5,5,10,{at:[0,0,0]})).val;
  const cutVolume=api.shape(cut).volume();
  if(!Number.isFinite(cutVolume)||Math.abs(cutVolume-750)>0.05)throw Error(`Exact Boolean self-test failed: ${cutVolume} (expected 750)`);
  cad=api;return {volume,cutVolume};
}
const runTypes=new Set(['wall','beam','duct','pipe','conduit','road']);
function boxSpec(o){
 const height=Math.max(.01,Number(o.height)||.01),t=Math.max(.01,Number(o.thickness)||200);
 const x=Number(o.x),y=Number(o.y),x2=Number(o.x2),y2=Number(o.y2),z=Number(o.z)||0;
 if(![x,y,x2,y2,z].every(Number.isFinite))throw Error('Invalid non-finite geometry');
 if(runTypes.has(o.type)){
   const dx=x2-x,dy=y2-y,L=Math.hypot(dx,dy);
   if(L<.01)throw Error('Run length must be positive');
   if(Math.abs(dx)>.01&&Math.abs(dy)>.01)throw Error('Oblique run requires rotated extrusion; exact kernel will not substitute axis-aligned geometry');
   if(Math.abs(dx)>=Math.abs(dy))return {size:[L,t,height],origin:[Math.min(x,x2),y-t/2,z]};
   return {size:[t,L,height],origin:[x-t/2,Math.min(y,y2),z]};
 }
 const xmin=Math.min(x,x2),ymin=Math.min(y,y2);
 return {size:[Math.max(.01,Math.abs(x2-x)),Math.max(.01,Math.abs(y2-y)),height],origin:[xmin,ymin,z]};
}
export function elementBox(o){if(!cad)throw Error('Initialize the exact B-rep kernel first');const {size,origin}=boxSpec(o);return {solid:cad.box(...size),origin,size};}
export function booleanCut(host,cutters){if(!cad)throw Error('B-rep kernel not initialized');let shape=host.solid;
 for(const cutter of cutters){const at=cutter.origin.map((v,i)=>v-host.origin[i]);const cutterSolid=cad.box(...cutter.size,{at});shape=cad.shape(shape).cut(cutterSolid).val;}
 return {...host,solid:shape};}
export const getExactVolume=s=>{if(!cad)throw Error('B-rep not initialized');return cad.shape(s).volume()};
export function tessellate(solid,{tolerance=.3}={}){if(!cad)throw Error('B-rep not initialized');return cad.toBufferGeometryData(cad.shape(solid).mesh({tolerance}));}
export function buildExactElements(objects){const solids=new Map(),errors=[],ids=new Set(objects.map(o=>o.id));
 for(const o of objects){if(o.visible===false||['line','dimension','opening','void','door','window'].includes(o.type))continue;
 try{let host=elementBox(o);const cutterObjects=objects.filter(c=>['opening','void','door','window'].includes(c.type)&&c.hostId===o.id);
 const cutters=cutterObjects.map(c=>{const x0=Math.min(c.x,c.x2),x1=Math.max(c.x,c.x2),y0=Math.min(c.y,c.y2),y1=Math.max(c.y,c.y2);const horiz=Math.abs(c.x2-c.x)>=Math.abs(c.y2-c.y);const depth=(Number(o.thickness)||200)+20;const spec={size:horiz?[Math.max(1,x1-x0),depth,Number(c.height)]:[depth,Math.max(1,y1-y0),Number(c.height)],origin:horiz?[x0,(c.y+c.y2)/2-depth/2,Number(c.z)]:[(c.x+c.x2)/2-depth/2,y0,Number(c.z)]};return {...spec,solid:null}});
 solids.set(o.id,cutters.length?booleanCut(host,cutters):host);
 }catch(e){errors.push({id:o.id,error:err(e)});}}
 for(const o of objects){if(['opening','void','door','window'].includes(o.type)&&!ids.has(o.hostId))errors.push({id:o.id,error:'Missing host ID'});}
 return {solids,errors};}
