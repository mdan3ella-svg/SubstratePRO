/* SUBSTRATE OCCT ADAPTER v4.5.6 — ES module factory, pinned 1.1.1 */
export const OCCT_ADAPTER_VERSION="4.5.6-box-overload";
let loadPromise;
function ctor(oc,name,preferred=[]){for(const n of preferred)if(typeof oc[n]==='function')return oc[n];const matches=Object.keys(oc).filter(n=>n===name||n.startsWith(name+'_')&&typeof oc[n]==='function');if(matches.length===1)return oc[matches[0]];throw Error(`OCCT constructor ${name} overload not resolved (${matches.join(',')})`)}
function create(oc,name,args,preferred=[]){return new (ctor(oc,name,preferred))(...args)}
export async function initializeKernel(){
 if(loadPromise)return loadPromise;
 loadPromise=(async()=>{
  const js=new URL('./vendor/opencascade/opencascade.js',import.meta.url);
  const wasm=new URL('./vendor/opencascade/opencascade.wasm',import.meta.url);
  const r=await fetch(new URL('./vendor/opencascade/manifest.json',import.meta.url));
  if(!r.ok)throw Error('OCCT assets missing. Run npm install && npm run build; upload vendor/opencascade/ with index.html.');
  const manifest=await r.json();if(manifest.version!=='1.1.1')throw Error('OCCT version mismatch');
  // opencascade.wasm.js in the pinned 1.1.1 package uses ES module exports.
  // Loading it as a classic <script> triggers "Unexpected token 'export'".
  const module=await import(js.href);
  const factory=[module.default,module.opencascade,module.initOpenCascade].find(v=>typeof v==='function');
  if(!factory)throw Error('OCCT factory export missing in v4.5.5 loader. Module exports: '+Object.keys(module).join(', ')+'; verify site/occt-adapter.mjs and vendor files deploy together.');
  const oc=await factory({locateFile:(file)=>file.endsWith('.wasm')?wasm.href:new URL(file,js).href});
  if(!oc||!Object.keys(oc).some(k=>k.startsWith('BRepPrimAPI_MakeBox')))throw Error('OCCT initialized without BRepPrimAPI');
  return oc;
 })().catch(e=>{loadPromise=null;throw e});
 return loadPromise;
}
export function makeBox(oc,b){const n=b.map(Number);if(n.length!==6||n.some(v=>!Number.isFinite(v))||n[3]<=n[0]||n[4]<=n[1]||n[5]<=n[2])throw Error('Invalid box bounds');const p0=create(oc,'gp_Pnt',n.slice(0,3),['gp_Pnt_3']);const p1=create(oc,'gp_Pnt',n.slice(3,6),['gp_Pnt_3']);const maker=create(oc,'BRepPrimAPI_MakeBox',[p0,p1],['BRepPrimAPI_MakeBox_3']);const result=maker.Shape();if(result?.IsNull?.())throw Error('OCCT box construction returned null shape');return result}
export function booleanShape(oc,a,b,op){const kind={union:'BRepAlgoAPI_Fuse',difference:'BRepAlgoAPI_Cut',intersection:'BRepAlgoAPI_Common'}[op];if(!kind)throw Error('Unknown Boolean operation');const builder=create(oc,kind,[a,b],[kind+'_3',kind+'_2',kind+'_1']);builder.Build?.();if(builder.IsDone&&!builder.IsDone())throw Error(kind+' failed');const result=builder.Shape();if(result.IsNull?.())throw Error('OCCT produced a null shape');return result}
export function validateShape(oc,shape){return create(oc,'BRepCheck_Analyzer',[shape,true],['BRepCheck_Analyzer_2']).IsValid()}
export function volumeMm3(oc,shape){try{const props=create(oc,'GProp_GProps',[],['GProp_GProps_1']);const api=oc.BRepGProp;if(api&&typeof api.VolumeProperties==='function'){api.VolumeProperties(shape,props);return props.Mass()}const v=Object.keys(oc).find(k=>k.startsWith('BRepGProp_VolumeProperties'));if(v){oc[v](shape,props);return props.Mass()}return null}catch{return null}}
export function createDocumentRecord({id,operation,boundsA,boundsB,volumeMm3=null}){if(!id||!['union','difference','intersection'].includes(operation))throw Error('Invalid record');return {id,type:'occt-brep',kernel:'opencascade.js',kernelVersion:'1.1.1',operation,parameters:{boundsA:[...boundsA],boundsB:[...boundsB]},volumeMm3,classification:'CAD Solid',discipline:'structural',revision:1}}
