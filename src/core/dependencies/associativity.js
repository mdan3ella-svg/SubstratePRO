/** All transactional edits pass through this constraint-update path. */
export function refreshAssociations(doc){const byId=new Map(doc.objects.map(o=>[o.id,o]));const warnings=[];
 for(const o of doc.objects){if(o.type!=='dimension'||!o.sourceId)continue;const s=byId.get(o.sourceId);
  if(!s){o.orphaned=true;warnings.push(`Dimension ${o.id} lost source ${o.sourceId}`);continue;}
  o.orphaned=false;for(const field of ['x','y','x2','y2','z'])o[field]=Number(s[field])||0;
  o.measuredMM=Math.hypot(o.x2-o.x,o.y2-o.y);
  o.label=`${Math.round(o.measuredMM)} mm`;
 }
 return warnings;
}
