/** Versioned, data-driven conceptual AEC block and assembly catalog. Geometry in mm. */
import {element} from '../../core/document-model/index.js';
const CATALOG=[
 {id:'A-WALL-200',category:'Assemblies',discipline:'architecture',label:'Stud partition · 200',type:'wall',width:4200,depth:200,height:3000,material:'Gypsum',classification:'Partition assembly'},
 {id:'A-WALL-300',category:'Assemblies',discipline:'architecture',label:'Masonry wall · 300',type:'wall',width:4200,depth:300,height:3000,material:'Masonry',classification:'Masonry enclosure'},
 {id:'A-SLAB-200',category:'Assemblies',discipline:'architecture',label:'Concrete slab · 200',type:'slab',width:3600,depth:3600,height:200,material:'Concrete',classification:'Structural floor'},
 {id:'S-BEAM-300',category:'Assemblies',discipline:'structure',label:'Steel framing beam',type:'beam',width:4800,depth:250,height:300,material:'Steel',classification:'Primary framing'},
 {id:'S-COLUMN-400',category:'Assemblies',discipline:'structure',label:'Concrete column · 400',type:'column',width:400,depth:400,height:3200,material:'Concrete',classification:'Structural support'},
 {id:'A-DOOR-900',category:'Openings',discipline:'architecture',label:'Single door · 900',type:'door',width:900,depth:200,height:2100,material:'Timber',classification:'Single hinged door'},
 {id:'A-WIN-1200',category:'Openings',discipline:'architecture',label:'Fixed window · 1200',type:'window',width:1200,depth:180,height:1200,material:'Glass',classification:'Fixed glazing'},
 {id:'A-FUR-DESK',category:'Furniture',discipline:'architecture',label:'Workstation desk',type:'furniture',width:1600,depth:800,height:750,material:'Timber',family:'desk'},
 {id:'A-FUR-BED',category:'Furniture',discipline:'architecture',label:'Double bed',type:'furniture',width:2000,depth:1600,height:550,material:'Timber',family:'bed'},
 {id:'A-FUR-SOFA',category:'Furniture',discipline:'architecture',label:'Three-seat sofa',type:'furniture',width:2200,depth:900,height:850,material:'Timber',family:'sofa'},
 {id:'A-FUR-TABLE',category:'Furniture',discipline:'architecture',label:'Dining table',type:'furniture',width:1800,depth:950,height:750,material:'Timber',family:'table'},
 {id:'P-FIX-SINK',category:'Symbols',discipline:'plumbing',label:'Lavatory fixture',type:'fixture',width:650,depth:520,height:850,material:'Glass',classification:'Plumbing fixture'},
 {id:'M-EQ-AHU',category:'Symbols',discipline:'mechanical',label:'Mechanical equipment',type:'equipment',width:1400,depth:800,height:1800,material:'Steel',classification:'Mechanical equipment'},
 {id:'E-CND-50',category:'Symbols',discipline:'electrical',label:'Electrical conduit run',type:'conduit',width:3200,depth:50,height:50,material:'Steel',classification:'Conduit'},
 {id:'G-LINE',category:'Drafting',discipline:'documentation',label:'Detail line',type:'line',width:2500,depth:1,height:0,material:'Default',classification:'Detail line'}
];
export const catalogEntries=()=>structuredClone(CATALOG);
export function findCatalogItem(id){return CATALOG.find(item=>item.id===id)||null}
export function createCatalogObjects(id,{x=0,y=0,level='L1',z=0,hostId=null}={}){
 const item=findCatalogItem(id);if(!item)throw Error('Unknown catalog identifier: '+id);
 if(['door','window'].includes(item.type)&&!hostId)throw Error('Door/window families require an existing host wall. Use the Door or Window tool on a wall.');
 const fields={name:item.label,discipline:item.discipline,classification:item.classification||item.label,material:item.material,level,z,thickness:item.depth,height:item.height,catalogId:item.id,catalogVersion:1};
 if(['wall','beam','conduit','line'].includes(item.type))Object.assign(fields,{x,y,x2:x+item.width,y2:y});
 else Object.assign(fields,{x,y,x2:x+item.width,y2:y+item.depth});
 if(item.family)fields.family=item.family;
 return [element(item.type,fields)];
}
export function catalogTableOfContents(doc){return (doc.objects||[]).filter(o=>o.catalogId).map(o=>({id:o.id,ref:o.catalogId,type:o.type,name:o.name,level:o.level||'L1',material:o.material,layer:o.layer||'',count:1}));}
