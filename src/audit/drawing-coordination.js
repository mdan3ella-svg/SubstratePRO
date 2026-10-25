/** Non-certifying model and drawing coordination checker. Units: mm. No document mutations. */
import {footprint} from '../core/geometry/index.js';
import {coordinationReport} from '../detailcore/construction-hierarchy/index.js';
const finite=v=>Number.isFinite(Number(v));
const linear=new Set(['wall','beam','pipe','duct','conduit','line']);
const services=new Set(['pipe','duct','conduit']);
const bounds=o=>{const p=footprint(o);return {x:Math.min(...p.map(q=>q[0])),y:Math.min(...p.map(q=>q[1])),x2:Math.max(...p.map(q=>q[0])),y2:Math.max(...p.map(q=>q[1])),z:Number(o.z)||0,z2:(Number(o.z)||0)+(Number(o.height)||0)}};
const overlap=(a,b,tol=0)=>a.x<=b.x2+tol&&a.x2>=b.x-tol&&a.y<=b.y2+tol&&a.y2>=b.y-tol;
const mid=o=>({x:(o.x+o.x2)/2,y:(o.y+o.y2)/2});
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const endpoints=o=>[{x:o.x,y:o.y},{x:o.x2,y:o.y2}];
function makeIssue(code,severity,message,ids=[],discipline='coordination',view='plan'){return {code,severity,message,ids,discipline,view};}
export function auditDrawing(doc,{tolerance=25,clearance=100}={}){
 const o=(doc.objects||[]).filter(x=>x.visible!==false),issues=[];
 const add=(...args)=>issues.push(makeIssue(...args));
 const idMap=new Map();for(const x of o){if(idMap.has(x.id))add('DUPLICATE_ID','error',`Duplicate object ID ${x.id}`,[x.id],x.discipline);idMap.set(x.id,x)}
 const base=coordinationReport(structuredClone(doc));for(const x of base.issues)add(x.code,x.severity,x.message,x.id?[x.id]:[]);
 for(const x of o){
  if(![x.x,x.y,x.x2,x.y2,x.z,x.height].every(finite))add('INVALID_COORDINATE','error',`${x.name||x.id}: invalid geometric coordinate`,[x.id],x.discipline);
  if(linear.has(x.type)&&dist({x:x.x,y:x.y},{x:x.x2,y:x.y2})<1)add('ZERO_LENGTH','error',`${x.name||x.id}: zero-length member`,[x.id],x.discipline);
  if(['wall','beam','column','slab','roof'].includes(x.type)&&Number(x.height)<=0)add('INVALID_HEIGHT','warning',`${x.name||x.id}: nonpositive height`,[x.id],x.discipline);
  if(['door','window'].includes(x.type)&&x.hostId){const host=idMap.get(x.hostId);if(host&&host.type!=='wall')add('INVALID_OPENING_HOST','error',`${x.name||x.id}: opening hosted on non-wall`,[x.id,host.id],x.discipline)}
  if(x.type==='dimension'&&x.sourceId&&!idMap.has(x.sourceId))add('ORPHAN_DIMENSION','error',`${x.name||x.id}: missing dimension source`,[x.id],'documentation');
 }
 const seen=new Set();
 for(let i=0;i<o.length;i++)for(let j=i+1;j<o.length;j++){
  const a=o[i],b=o[j];if(a.id===b.id)continue;
  if(a.type===b.type&&a.level===b.level&&Math.abs((a.z||0)-(b.z||0))<tolerance){
   const same=dist({x:a.x,y:a.y},{x:b.x,y:b.y})<tolerance&&dist({x:a.x2,y:a.y2},{x:b.x2,y:b.y2})<tolerance;
   const reverse=dist({x:a.x,y:a.y},{x:b.x2,y:b.y2})<tolerance&&dist({x:a.x2,y:a.y2},{x:b.x,y:b.y2})<tolerance;
   if(same||reverse)add('DUPLICATE_GEOMETRY','warning',`${a.type} elements overlap at matching endpoints`,[a.id,b.id],a.discipline);
  }
  if(services.has(a.type)&&services.has(b.type)&&a.discipline!==b.discipline){const A=bounds(a),B=bounds(b);if(overlap(A,B)&&A.z<=B.z2&&B.z<=A.z2)add('POTENTIAL_MEP_CLASH','warning',`${a.type}/${b.type} envelopes overlap; inspect 3D`,[a.id,b.id],'coordination','iso')}
  }
 // A free wall endpoint is a review warning, not an error: exterior and partial walls can end intentionally.
 const walls=o.filter(x=>x.type==='wall');for(const w of walls){const ps=endpoints(w);for(let k=0;k<ps.length;k++){
  const point=ps[k],connected=walls.some(v=>v.id!==w.id&&endpoints(v).some(q=>dist(point,q)<=tolerance));
  if(!connected&&walls.length>1){const key=`${w.id}/${k}`;if(!seen.has(key)){seen.add(key);add('LOOSE_WALL_END','info',`${w.name||w.id}: unjoined wall endpoint ${k+1}`,[w.id],'architecture')}}
 }}
 const severity={error:0,warning:0,info:0};for(const i of issues)severity[i.severity]++;
 return {issues,counts:severity,checked:o.length,generatedAt:new Date().toISOString(),passed:severity.error===0&&severity.warning===0,caveat:'Coordination screening only; no certified geometric clash, code compliance, drawing standards or engineering approval.'};
}
export const DEFAULT_VIEW_REGISTER=[
 {id:'A-101',title:'Floor Plan',view:'plan',discipline:'architecture',scale:'1:100'},
 {id:'A-201',title:'Elevations',view:'front',discipline:'architecture',scale:'1:100'},
 {id:'A-301',title:'Sections / Details',view:'iso',discipline:'architecture',scale:'1:50'},
 {id:'S-101',title:'Structural Plan',view:'plan',discipline:'structure',scale:'1:100'},
 {id:'M-101',title:'Mechanical Coordination',view:'plan',discipline:'mechanical',scale:'1:100'},
 {id:'P-101',title:'Plumbing Coordination',view:'plan',discipline:'plumbing',scale:'1:100'},
 {id:'E-101',title:'Electrical Coordination',view:'plan',discipline:'electrical',scale:'1:100'},
 {id:'C-101',title:'Site Plan',view:'plan',discipline:'civil',scale:'1:200'}
];
export function drawingRegister(doc,report=auditDrawing(doc)){const objects=doc.objects||[];return DEFAULT_VIEW_REGISTER.map(v=>{const n=objects.filter(o=>o.discipline===v.discipline).length;const findings=report.issues.filter(i=>i.discipline===v.discipline||i.discipline==='coordination');return {...v,elementCount:n,issueCount:findings.length,status:n===0?'NOT STARTED':findings.some(i=>i.severity==='error')?'REVIEW REQUIRED':findings.length?'COORDINATION REVIEW':'READY FOR MANUAL QA'}})}
export function issueReportText(report,register){return ['SUBSTRATE PRO · LIVE DRAWING COORDINATION',`Checked objects: ${report.checked}`,`Findings: ${report.counts.error} errors, ${report.counts.warning} warnings, ${report.counts.info} advisories`,'',...report.issues.map(x=>`${x.severity.toUpperCase()} | ${x.code} | ${x.message} | ${x.ids.join(', ')}`),'','DRAWING REGISTER',...register.map(x=>`${x.id} | ${x.title} | ${x.scale} | ${x.status} | ${x.issueCount} findings`),'',report.caveat].join('\n')}
