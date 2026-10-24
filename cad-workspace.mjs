import {initializeKernel,makeBox,booleanShape,validateShape,volumeMm3} from './occt-adapter.mjs';

export const KERNEL_VERSION='1.1.1';
export function checkedBounds(input){
 const a=Array.from(input,Number);
 if(a.length!==6||!a.every(Number.isFinite)||a.some((v,i)=>i<3&&a[i+3]<=v))throw Error('Bounds must be finite min/max XYZ pairs');
 return a;
}
export function feature(id,kind,bounds,metadata={}){
 if(!id||!['wall','slab','beam','column','solid'].includes(kind))throw Error('Unknown BIM feature');
 return {id,kind,params:{bounds:checkedBounds(bounds)},metadata:{discipline:'architectural',material:'Concrete',level:'L1',...metadata},revision:1};
}
export class CADDocument{
 constructor(record){this.record=record||{schema:'substrate-occt-features/1',units:'mm',features:[],operations:[]};this.shapes=new Map();this.meshes=new Map();}
 addFeature(f){if(this.record.features.some(x=>x.id===f.id))throw Error('Duplicate feature ID');this.record.features.push(f);return f;}
 editFeature(id,bounds){const f=this.record.features.find(x=>x.id===id);if(!f)throw Error('Feature not found');f.params.bounds=checkedBounds(bounds);f.revision++;this.invalidate(id);return f;}
 addBoolean({id,operation,a,b}){if(this.record.operations.some(x=>x.id===id)||a===b)throw Error('Invalid Boolean record');if(!['union','difference','intersection'].includes(operation))throw Error('Unsupported Boolean');this.record.operations.push({id,operation,a,b,revision:1});return id;}
 invalidate(id){const invalid=new Set([id]);let changed=true;while(changed){changed=false;for(const op of this.record.operations){if(!invalid.has(op.id)&&(invalid.has(op.a)||invalid.has(op.b))){invalid.add(op.id);changed=true;}}}for(const key of invalid){this.shapes.delete(key);this.meshes.delete(key);}}
 async rebuild(oc){this.shapes.clear();this.meshes.clear();for(const f of this.record.features)this.shapes.set(f.id,makeBox(oc,checkedBounds(f.params.bounds)));
 for(const op of this.record.operations){const a=this.shapes.get(op.a),b=this.shapes.get(op.b);if(!a||!b)throw Error('Boolean operand missing: '+op.id);const r=booleanShape(oc,a,b,op.operation);if(!validateShape(oc,r))throw Error('Invalid OCCT B-rep: '+op.id);this.shapes.set(op.id,r);}return this.shapes;}
 toJSON(){return JSON.stringify(this.record,null,2);}
 static fromJSON(json){const o=JSON.parse(json);if(o.schema!=='substrate-occt-features/1'||!Array.isArray(o.features)||!Array.isArray(o.operations))throw Error('Unknown CAD document format');for(const f of o.features)checkedBounds(f.params.bounds);return new CADDocument(o);}
}
export function sectionData(doc,{axis='x',position=0}={}){
 if(!['x','y'].includes(axis)||!Number.isFinite(+position))throw Error('Section requires X or Y datum');
 const a=axis==='x'?0:1,b=axis==='x'?1:0;return doc.record.features.flatMap(f=>{const v=f.params.bounds;if(+position<v[a]||+position>v[a+3])return [];return [{id:f.id,kind:f.kind,material:f.metadata.material,level:f.metadata.level,section:{u0:v[b],u1:v[b+3],z0:v[2],z1:v[5]}}]});
}
export function scheduleData(doc){return doc.record.features.map(f=>{const b=f.params.bounds;const dx=b[3]-b[0],dy=b[4]-b[1],dz=b[5]-b[2];return {id:f.id,type:f.kind,material:f.metadata.material,level:f.metadata.level,volumeMm3:dx*dy*dz,revision:f.revision};});}
function findClass(oc,name){const c=Object.keys(oc).filter(k=>k===name||k.startsWith(name+'_'));return c.filter(k=>typeof oc[k]==='function');}
function instantiate(oc,name,variants){let err;for(const args of variants){for(const key of findClass(oc,name)){try{return new oc[key](...args)}catch(e){err=e}}}throw Error('OCCT '+name+' binding unavailable: '+(err?.message||'no exported binding'));}
function call(oc,name,args){for(const k of [name,...Object.keys(oc).filter(x=>x.startsWith(name+'_'))])if(typeof oc[k]==='function'){try{return oc[k](...args)}catch{}}throw Error('OCCT function '+name+' binding unavailable')}
function triangulate(oc,shape,deflection=1){
 instantiate(oc,'BRepMesh_IncrementalMesh',[[shape,deflection,false,0.5,true],[shape,deflection,false,0.5],[shape,deflection]]);
 const explorer=instantiate(oc,'TopExp_Explorer',[[shape,oc.TopAbs_ShapeEnum?.TopAbs_FACE??oc.TopAbs_FACE,oc.TopAbs_ShapeEnum?.TopAbs_SHAPE??oc.TopAbs_SHAPE],[shape,oc.TopAbs_FACE]]);
 const positions=[],indices=[];let faceCount=0;
 while(explorer.More()){
  const face=call(oc,'TopoDS_Face', [explorer.Current()]);
  const location=instantiate(oc,'TopLoc_Location',[[]]);
  let poly;
  for(const key of ['Triangulation_2','Triangulation_1','Triangulation']){try{if(typeof oc.BRep_Tool?.[key]==='function'){poly=oc.BRep_Tool[key](face,location);break}if(typeof oc['BRep_Tool_'+key]==='function'){poly=oc['BRep_Tool_'+key](face,location);break}}catch{}}
  if(!poly||poly.IsNull?.())throw Error('OCCT face has no accessible triangulation; check generated package bindings');
  const tr=typeof poly.get==='function'?poly.get():poly;
  const offset=positions.length/3;
  for(let i=1;i<=tr.NbNodes();i++){const p=tr.Node(i);positions.push(p.X(),p.Y(),p.Z())}
  for(let i=1;i<=tr.NbTriangles();i++){const t=tr.Triangle(i);let ids;if(typeof t.Get==='function'){const o1={current:0},o2={current:0},o3={current:0};t.Get(o1,o2,o3);ids=[o1.current,o2.current,o3.current]}else{ids=[t.Value(1),t.Value(2),t.Value(3)]}if(ids.some(x=>!Number.isInteger(x)||x<1||x>tr.NbNodes()))throw Error('OCCT triangle indices unavailable in this build');indices.push(offset+ids[0]-1,offset+ids[1]-1,offset+ids[2]-1)}
  faceCount++;explorer.Next();
 }
 if(!faceCount||!indices.length)throw Error('OCCT produced no triangles');return {positions,indices,faces:faceCount};
}
export function tessellateOCCT(oc,shape,deflection=1){return triangulate(oc,shape,deflection)}
export async function loadCADKernel(){return initializeKernel()}
export function diagnostics(oc,doc){return [...doc.shapes].map(([id,shape])=>({id,valid:validateShape(oc,shape),volumeMm3:volumeMm3(oc,shape)}))}
