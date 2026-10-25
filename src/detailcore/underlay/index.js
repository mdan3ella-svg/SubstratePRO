/** Image underlays are project-embedded reference data, not snap targets or BIM geometry. */
export const ACCEPTED_IMAGE_TYPES=['image/jpeg','image/png'];
export function newUnderlay({name,src,naturalWidth,naturalHeight,widthMM=5000,x=0,y=0,opacity=0.42,visible=true,locked=true}){
 if(!/^data:image\/(png|jpeg);base64,/.test(src))throw Error('Underlay must be a JPEG/PNG data URL');
 const nw=Number(naturalWidth),nh=Number(naturalHeight),width=Number(widthMM);
 if(!(nw>0&&nh>0&&width>0))throw Error('Invalid image dimensions or calibration width');
 return {id:`UL-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`,name:String(name||'Drawing underlay'),src,x:Number(x)||0,y:Number(y)||0,widthMM:width,heightMM:width*nh/nw,opacity:Math.min(1,Math.max(0,Number(opacity))),visible:!!visible,locked:!!locked,rotation:0,sourcePixels:[nw,nh]};
}
export function underlayCorners(o){const angle=(Number(o.rotation)||0)*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),w=Number(o.widthMM),h=Number(o.heightMM);return [[0,0],[w,0],[w,h],[0,h]].map(([a,b])=>({x:o.x+a*c-b*s,y:o.y+a*s+b*c}));}
export function updateUnderlay(o,fields){const next={...o,...fields};if(!(next.widthMM>0))throw Error('Width must exceed zero');next.heightMM=next.widthMM*next.sourcePixels[1]/next.sourcePixels[0];next.opacity=Math.min(1,Math.max(0,Number(next.opacity)));return next}
const cache=new Map();
export function drawUnderlays(ctx,underlays,map){
 for(const o of underlays||[]){if(!o.visible||!o.src)continue;
  let img=cache.get(o.src);if(!img){img=new Image();img.onload=()=>window.dispatchEvent(new Event('substrate-underlay-loaded'));img.src=o.src;cache.set(o.src,img)}
  if(!img.complete||!img.naturalWidth)continue;
  const a=map({x:o.x,y:o.y});
  const th=(Number(o.rotation)||0)*Math.PI/180,c=Math.cos(th),s=Math.sin(th);
  const b=map({x:o.x+o.widthMM*c,y:o.y+o.widthMM*s});
  const d=map({x:o.x-o.heightMM*s,y:o.y+o.heightMM*c});
  ctx.save();ctx.globalAlpha=o.opacity;
  const ex=(b.x-a.x)/img.naturalWidth,ey=(b.y-a.y)/img.naturalWidth;
  const fx=(d.x-a.x)/img.naturalHeight,fy=(d.y-a.y)/img.naturalHeight;
  ctx.transform(ex,ey,fx,fy,a.x,a.y);ctx.drawImage(img,0,0);ctx.restore();
 }
}
