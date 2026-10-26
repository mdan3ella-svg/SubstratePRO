/** BIM plan-view visibility. All z values are millimetres above project datum. */
export function planClassification(o,{base,cut,top,upper,level,showOverhead=false}){
  if(o.visible===false)return 'hidden';
  if(['dimension','line','grid','annotation'].includes(o.type))return (!o.level||o.level===level)?'annotation':'hidden';
  const z=Number(o.z)||0,h=Math.max(0,Number(o.height)||0),end=z+h;
  const assigned=o.level===level;
  const overhead=['roof','canopy'].includes(o.type);
  if(overhead && !showOverhead)return 'hidden';
  if(o.type==='room')return assigned?'symbol':'hidden';
  if(['slab','floor','foundation','road','landscape'].includes(o.type)){
    if(z>cut+1)return showOverhead?'overhead':'hidden';
    if(end<base-600)return 'hidden';
    return 'below';
  }
  if(z>=upper-0.01)return showOverhead?'overhead':'hidden';
  if(z>cut+0.01)return showOverhead?'overhead':'hidden';
  if(end<base-0.01)return 'hidden';
  // Crosses the horizontal plan cut = heavy poche. Below cut = projected.
  if(z<=cut && end>=cut && h>0)return 'cut';
  return 'below';
}
export function planObjects(doc,{level='L1',cutHeight=1200,showOverhead=false}={}){
 const levels=[...(doc.levels||[])].sort((a,b)=>Number(a.elevation)-Number(b.elevation));
 const selected=levels.find(l=>l.id===level||l.name===level);
 const base=Number(selected?.elevation)||0;
 const next=levels.find(l=>Number(l.elevation)>base+0.01);
 const upper=next?Number(next.elevation):base+Math.max(2500,Number(selected?.height)||3000);
 const cut=base+Math.max(100,Math.min(upper-base-1,Number(cutHeight)||1200));
 const context={base,upper,cut,level,showOverhead};
 const ranks={below:0,cut:1,overhead:2,annotation:3,symbol:3};
 return (doc.objects||[]).map((o,i)=>({...o,__planClass:planClassification(o,context),__originalIndex:i}))
 .filter(o=>o.__planClass!=='hidden')
 .sort((a,b)=>ranks[a.__planClass]-ranks[b.__planClass]||a.__originalIndex-b.__originalIndex);
}
export function shouldStartMove(down,current,thresholdPx=6){return Math.hypot((current.sx||0)-(down.sx||0),(current.sy||0)-(down.sy||0))>=thresholdPx}
export function annotationMetrics(scale=100,zoom=1,globalScale=1){const drawingScale=Math.max(5,Math.min(1000,Number(scale)||100)),size=Math.max(.65,Math.min(2.2,Number(globalScale)||1));return {drawingScale,globalScale:size,textPx:12*size,dimOffsetPx:34*size,clearancePx:12*size,extensionGapPx:6,arrowPx:5,paperTextMM:2.5,paperDimOffsetMM:8};}
export function zoomAtPointer(cam,point,viewport,deltaY,deltaMode=0){const {width,height}=viewport,scale=Number(cam?.scale)||1,magnitude=Math.max(-500,Math.min(500,deltaY*(deltaMode===1?16:deltaMode===2?height:1))),next=Math.max(0.0001,Math.min(20,scale*Math.exp(-magnitude*.0015))),px=point.x-width/2,py=point.y-height/2,worldX=px/scale+cam.cx,worldY=py/scale+cam.cy;return {...cam,scale:next,cx:worldX-px/next,cy:worldY-py/next};}
