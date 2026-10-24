/** Concept connection schedule: descriptive geometry, not a fabricated bolt/weld design. */
import {wallMiterPolygons} from '../../core/geometry/wall-miters.js';
export function connectionSchedule(doc,{tolerance=5}={}){
 const structural=doc.objects.filter(o=>['beam','column'].includes(o.type));const entries=[];
 for(const beam of structural.filter(o=>o.type==='beam'))for(const column of structural.filter(o=>o.type==='column')){
  const cx=(column.x+column.x2)/2,cy=(column.y+column.y2)/2;
  const dx=beam.x2-beam.x,dy=beam.y2-beam.y,l2=dx*dx+dy*dy||1;
  const t=Math.max(0,Math.min(1,((cx-beam.x)*dx+(cy-beam.y)*dy)/l2));
  const dist=Math.hypot(cx-(beam.x+t*dx),cy-(beam.y+t*dy));
  if(dist>Math.max(Number(column.thickness)||100,Number(beam.thickness)||100)/2+tolerance)continue;
  const topC=Number(column.z)+Number(column.height),baseB=Number(beam.z),topB=baseB+Number(beam.height);
  const elevationGap=Math.min(Math.abs(baseB-topC),Math.abs(topB-topC));
  entries.push({id:`CON-${beam.id}-${column.id}`,beamId:beam.id,columnId:column.id,station:t,xy:{x:cx,y:cy},gapMM:elevationGap,status:elevationGap<=tolerance?'connection-candidate':'review-elevation',plateThicknessMM:null,bolts:null,weld:null,loads:null,designStatus:'ENGINEERING REQUIRED'});
 }
 const miters=wallMiterPolygons(doc.objects);
 return {connections:entries,wallMiters:miters.pairs,issues:miters.issues};
}
