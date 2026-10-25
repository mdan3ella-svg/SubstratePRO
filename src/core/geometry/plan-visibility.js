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
/** Canvas annotations are measured in CSS pixels. Model dimensions remain mm.
 * Drawing scale is metadata until a physical paper sheet is rendered.
 */
export function annotationMetrics(scale=100,zoom=1){
 const drawingScale=Math.max(5,Math.min(1000,Number(scale)||100));
 return {drawingScale,textPx:12,dimOffsetPx:34,clearancePx:12,
   extensionGapPx:6,arrowPx:5,paperTextMM:2.5,paperDimOffsetMM:8};
}
/** Stable pointer-centered zoom independent of browser wheel delta units. */
export function zoomAtPointer(cam,point,viewport,deltaY,deltaMode=0){
 const {width,height}=viewport;
 const scale=Number(cam?.scale)||1;
 const magnitude=Math.max(-500,Math.min(500,deltaY*(deltaMode===1?16:deltaMode===2?height:1)));
 const next=Math.max(0.0001,Math.min(20,scale*Math.exp(-magnitude*.0015)));
 // screen coordinates match projected plan (world Y reversed).
 const px=point.x-width/2,py=point.y-height/2;
 const worldX=px/scale+cam.cx,worldY=py/scale+cam.cy;
 return {...cam,scale:next,cx:worldX-px/next,cy:worldY-py/next};
}
