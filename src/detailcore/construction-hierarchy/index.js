/** Model coordination rules. Assists design; does not certify BIM/code/engineering. Units mm. */
import {element} from '../../core/document-model/index.js';
import {ensureSystems,levelElevation} from '../building-systems/index.js';
export const STAGES=[
 {id:'datum',label:'01 · Project datums',types:[]},
 {id:'foundation',label:'02 · Substructure / foundations',types:['foundation']},
 {id:'frame',label:'03 · Structural columns / beams',types:['column','beam']},
 {id:'floor',label:'04 · Floor decks / slabs',types:['slab']},
 {id:'envelope',label:'05 · Walls / partitions',types:['wall','panel','mullion']},
 {id:'openings',label:'06 · Doors / windows',types:['door','window']},
 {id:'roof',label:'07 · Roof / enclosure',types:['roof']},
 {id:'services',label:'08 · MEP services',types:['duct','pipe','conduit','fixture','equipment']},
 {id:'interiors',label:'09 · Rooms / furnishings',types:['room','furniture']},
 {id:'site',label:'10 · Civil / landscape',types:['road','landscape']},
 {id:'document',label:'11 · Documentation / QA',types:['dimension','line']}
];
const typeStage=Object.fromEntries(STAGES.flatMap(s=>s.types.map(t=>[t,s.id])));
const layerForType={foundation:'S-FOUND',column:'S-FRAME',beam:'S-FRAME',slab:'A-FLOOR',wall:'A-WALL',door:'A-OPEN',window:'A-OPEN',roof:'A-ROOF',room:'A-ROOM',furniture:'A-FURN',panel:'A-FACADE',mullion:'A-FACADE',duct:'M-HVAC',equipment:'M-EQUIP',pipe:'P-PIPE',fixture:'P-FIX',conduit:'E-POWER',road:'C-SITE',landscape:'C-LAND',dimension:'G-ANNO',line:'G-ANNO'};
const disciplineForType={foundation:'structure',landscape:'civil'};
export function stageForType(type){return typeStage[type]||'document'}
export function modelLayerFor(type){return layerForType[type]||'G-ANNO'}
export function ensureHierarchy(doc){
 ensureSystems(doc);doc.construction ||= {activeStage:'datum',phase:'New Construction',gridSnap:true};
 const layers=[
 ['S-FOUND','Foundations','structure'],['S-FRAME','Structural frame','structure'],['A-FLOOR','Floor slabs','architecture'],['A-OPEN','Doors & windows','architecture'],['A-FURN','Furnishings','architecture'],['M-HVAC','HVAC distribution','mechanical'],['M-EQUIP','Mechanical equipment','mechanical'],['P-PIPE','Pipework','plumbing'],['P-FIX','Plumbing fixtures','plumbing'],['E-POWER','Electrical routing','electrical'],['C-SITE','Civil works','civil'],['C-LAND','Landscape','civil'],['G-ANNO','Annotations','documentation']
 ];
 for(const [id,name,discipline] of layers)if(!doc.layers.some(l=>l.id===id))doc.layers.push({id,name,discipline,visible:true,locked:false});
 for(const l of doc.levels){if(!Number.isFinite(Number(l.height))||Number(l.height)<=0)l.height=3000;}
 return doc;
}
export function prepareElement(doc,o){ensureHierarchy(doc);const layer=modelLayerFor(o.type);const active=doc.levels.find(l=>l.id===o.level)||doc.levels[0];o.level=active.id;o.layer ||= layer;o.stage ||=stageForType(o.type);o.phase ||=doc.construction.phase;o.discipline ||=disciplineForType[o.type]||'architecture';if(!Number.isFinite(Number(o.z)))o.z=Number(active.elevation);if(!o.hostLevelId)o.hostLevelId=o.level;return o;}
export function gridIntersections(doc){const g=doc.grids||[],xs=g.filter(a=>a.axis==='X').sort((a,b)=>a.coordinate-b.coordinate),ys=g.filter(a=>a.axis==='Y').sort((a,b)=>a.coordinate-b.coordinate);return xs.flatMap(x=>ys.map(y=>({x:x.coordinate,y:y.coordinate,ref:`${x.label}/${y.label}`,xGrid:x.id,yGrid:y.id})));}
export function nearestGridIntersection(doc,p,maxDistance=300){let best=null;for(const node of gridIntersections(doc)){const d=Math.hypot(node.x-p.x,node.y-p.y);if(d<=maxDistance&&(!best||d<best.distance))best={...node,distance:d};}return best;}
export function makeGridFoundation(doc,{level='L1',width=950,depth=950,thickness=400}={}){ensureHierarchy(doc);const pts=gridIntersections(doc);if(!pts.length)throw Error('Create X/Y structural grids before foundations');const z=levelElevation(doc,level)-thickness;return pts.map(p=>prepareElement(doc,element('foundation',{name:`Pad foundation ${p.ref}`,x:p.x-width/2,y:p.y-depth/2,x2:p.x+width/2,y2:p.y+depth/2,z,height:thickness,thickness,level,gridRef:p.ref,material:'Concrete',classification:'Conceptual pad footing'})));}
export function makeGridFrame(doc,{level='L1',columnSize=300,beamDepth=450,beamWidth=250}={}){ensureHierarchy(doc);const nodes=gridIntersections(doc);if(!nodes.length)throw Error('Create X/Y grids before framing');const z=levelElevation(doc,level),h=Number(doc.levels.find(l=>l.id===level)?.height)||3000;const cols=nodes.map(p=>prepareElement(doc,element('column',{name:`Column ${p.ref}`,x:p.x-columnSize/2,y:p.y-columnSize/2,x2:p.x+columnSize/2,y2:p.y+columnSize/2,z,height:h,thickness:columnSize,level,gridRef:p.ref,material:'Steel'})));const beams=[];for(const axis of ['X','Y']){const groups=new Map();for(const p of nodes){const key=axis==='X'?p.y:p.x;groups.set(key,[...(groups.get(key)||[]),p]);}for(const arr of groups.values()){arr.sort((a,b)=>axis==='X'?a.x-b.x:a.y-b.y);for(let i=1;i<arr.length;i++){const a=arr[i-1],b=arr[i];beams.push(prepareElement(doc,element('beam',{name:`Beam ${a.ref}–${b.ref}`,x:a.x,y:a.y,x2:b.x,y2:b.y,z:z+h-beamDepth,height:beamDepth,thickness:beamWidth,level,fromGrid:a.ref,toGrid:b.ref,material:'Steel'})))}}}return [...cols,...beams];}
export function makeGridSlab(doc,{level='L1',thickness=200}={}){ensureHierarchy(doc);const xs=doc.grids.filter(g=>g.axis==='X').map(g=>g.coordinate),ys=doc.grids.filter(g=>g.axis==='Y').map(g=>g.coordinate);if(xs.length<2||ys.length<2)throw Error('Create at least two grids along each axis');return prepareElement(doc,element('slab',{name:`Floor slab · ${level}`,x:Math.min(...xs),y:Math.min(...ys),x2:Math.max(...xs),y2:Math.max(...ys),z:levelElevation(doc,level),height:thickness,thickness,level,material:'Concrete'}));}
export function coordinationReport(doc){ensureHierarchy(doc);const levels=new Set(doc.levels.map(l=>l.id)),ids=new Set(doc.objects.map(o=>o.id)),byStage=STAGES.map(s=>({stage:s.id,title:s.label,count:doc.objects.filter(o=>stageForType(o.type)===s.id).length}));const issues=[];if(!(doc.grids||[]).some(g=>g.axis==='X')||!(doc.grids||[]).some(g=>g.axis==='Y'))issues.push({code:'NO_GRID',message:'Define X/Y project grids before grid-constrained framing',severity:'warning'});
 for(const o of doc.objects){if(!levels.has(o.level))issues.push({code:'BAD_LEVEL',id:o.id,message:`${o.name}: assigned level is missing`,severity:'error'});if(o.hostId&&!ids.has(o.hostId))issues.push({code:'MISSING_HOST',id:o.id,message:`${o.name}: host is missing`,severity:'error'});if(['door','window'].includes(o.type)&&!o.hostId)issues.push({code:'UNHOSTED_OPENING',id:o.id,message:`${o.name}: not associated with wall`,severity:'warning'});if(o.layer&&!doc.layers.some(l=>l.id===o.layer))issues.push({code:'BAD_LAYER',id:o.id,message:`${o.name}: assigned layer is missing`,severity:'warning'});}
 for(const g of doc.grids||[]){if(!Number.isFinite(Number(g.coordinate)))issues.push({code:'BAD_GRID',message:'Grid coordinate is nonnumeric',severity:'error'});}
 const cross=gridIntersections(doc);const members=doc.objects.filter(o=>o.type==='column'&&o.gridRef);for(const m of members){const node=cross.find(p=>p.ref===m.gridRef);if(node&&Math.hypot((m.x+m.x2)/2-node.x,(m.y+m.y2)/2-node.y)>25)issues.push({code:'OFF_GRID',id:m.id,message:`${m.name}: >25 mm from grid ${m.gridRef}`,severity:'warning'});}
 return {byStage,issues,levels:doc.levels.map(l=>({...l})),gridNodes:cross.length};}
