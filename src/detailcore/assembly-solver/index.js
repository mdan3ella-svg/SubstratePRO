import{length}from'../../core/geometry/index.js';
export function quantities(doc){return doc.objects.map(o=>({id:o.id,type:o.type,discipline:o.discipline,lengthMM:Math.round(length(o)),volumeM3:Math.round((Math.max(0,length(o))*o.thickness*o.height/1e9)*1e4)/1e4,material:o.material}));}
export function assemblyWarnings(doc){return doc.objects.flatMap(o=>o.type==='wall'&&length(o)<o.thickness?[`${o.id}: wall length shorter than thickness`]:[])}
