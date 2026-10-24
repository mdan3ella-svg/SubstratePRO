/** Preliminary, jurisdiction-agnostic missing-data screening only.
 * It is NOT an IBC/NBCC/ISO compliance determination. */
export function codeScreen(doc,{jurisdiction='Unspecified',edition='Unspecified'}={}){
 const checks=[],add=(key,status,detail)=>checks.push({key,status,detail});
 add('jurisdiction',jurisdiction==='Unspecified'?'missing':'manual',jurisdiction);
 add('code-edition',edition==='Unspecified'?'missing':'manual',edition);
 const md=doc.metadata||{};
 for(const field of ['occupancy','constructionType','sprinklerSystem','egressStrategy','fireResistanceBasis','designLoads'])add(field,md[field]?'manual':'missing',md[field]||'Input required for code review');
 const doors=doc.objects.filter(o=>o.type==='door');
 add('door-clear-width',doors.length?'manual':'missing',doors.length?`${doors.length} modeled doors; clear opening and egress capacity not assessed`:'No doors modeled');
 add('fire-ratings',doc.objects.some(o=>o.fireRating)?'manual':'missing','Fire ratings require approved assemblies and jurisdiction-specific verification');
 return {jurisdiction,edition,checks,disclaimer:'Preliminary data sufficiency screen only. No automated code PASS or design approval.'};
}
