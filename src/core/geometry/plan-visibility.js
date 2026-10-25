/** Architectural plan-cut filter. Model coordinates and levels are millimetres. */
export function planObjects(doc,{level='L1',cutHeight=1200,showOverhead=false}={}){
 const levels=doc.levels||[];
 const chosen=levels.find(l=>l.id===level||l.name===level);
 const base=Number(chosen?.elevation ?? chosen?.z ?? (level==='L1'?0:NaN));
 const elevation=Number.isFinite(base)?base:0;
 const cut=elevation+Number(cutHeight||1200);
 return (doc.objects||[]).filter(o=>{
   if(o.visible===false)return false;
   if(o.type==='dimension'||o.type==='line')return !o.level||o.level===level;
   const z=Number(o.z)||0,top=z+Math.max(0,Number(o.height)||0);
   if(o.type==='roof')return showOverhead?z>=cut:z<=cut&&top>=elevation;
   if(o.type==='room')return o.level===level||Math.abs(z-elevation)<100;
   if(!showOverhead&&z>cut+1)return false;
   if(top<elevation-1)return false;
   return true;
 });
}
export function shouldStartMove(down,current,thresholdPx=6){return Math.hypot((current.sx||0)-(down.sx||0),(current.sy||0)-(down.sy||0))>=thresholdPx}
export function annotationMetrics(scale=100,zoom=1){
 const s=Math.max(20,Math.min(500,Number(scale)||100));
 const paperText=2.5,minimumPixels=11;
 // At display zoom, keep typography legible; print-scale conversion belongs in the sheet renderer.
 return {drawingScale:s,textPx:Math.max(minimumPixels,Math.min(15,11.5*Math.sqrt(Math.max(.5,zoom)))),dimOffsetPx:Math.max(20,Math.min(34,24*Math.sqrt(Math.max(.5,zoom)))),paperTextMM:paperText};
}
