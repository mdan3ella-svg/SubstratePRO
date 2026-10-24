import {doorGeometry,windowFamily,furnitureFamily} from './index.js';
function c(o){return {x:(o.x+o.x2)/2,y:(o.y+o.y2)/2};}
function uv(o){const dx=o.x2-o.x,dy=o.y2-o.y,L=Math.hypot(dx,dy)||1;return {dx:dx/L,dy:dy/L,nx:-dy/L,ny:dx/L,L};}
export function drawFamilySymbol(ctx,o,map,stroke='#283d48'){
 ctx.save();ctx.strokeStyle=stroke;ctx.fillStyle='#fff';ctx.lineWidth=1.35;ctx.lineJoin='round';
 const {dx,dy,nx,ny,L}=uv(o),C=c(o),h=(Number(o.thickness)||200)/2;
 if(o.type==='door'||o.type==='window'){
  const edge=[{x:o.x+nx*h,y:o.y+ny*h},{x:o.x2+nx*h,y:o.y2+ny*h},{x:o.x2-nx*h,y:o.y2-ny*h},{x:o.x-nx*h,y:o.y-ny*h}].map(map);
  ctx.beginPath();edge.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();
  ctx.beginPath();for(const end of [{x:o.x,y:o.y},{x:o.x2,y:o.y2}]){const a=map({x:end.x+nx*h,y:end.y+ny*h}),b=map({x:end.x-nx*h,y:end.y-ny*h});ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y)}ctx.stroke();
  if(o.type==='door'){
   const g=doorGeometry(o),hinge=map(g.hinge),closed=map(g.closed),opened=map(g.opened),r=Math.hypot(closed.x-hinge.x,closed.y-hinge.y);
   ctx.beginPath();ctx.moveTo(hinge.x,hinge.y);ctx.lineTo(opened.x,opened.y);ctx.stroke();
   let start=Math.atan2(closed.y-hinge.y,closed.x-hinge.x),end=Math.atan2(opened.y-hinge.y,opened.x-hinge.x);
   let delta=((end-start+Math.PI*3)%(Math.PI*2))-Math.PI;
   ctx.save();ctx.setLineDash([5,3]);ctx.beginPath();ctx.arc(hinge.x,hinge.y,r,start,start+delta,delta<0);ctx.stroke();ctx.restore();
  }else{
   const family=windowFamily(o),a=map({x:o.x+nx*h*.3,y:o.y+ny*h*.3}),b=map({x:o.x2+nx*h*.3,y:o.y2+ny*h*.3});ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
   const a2=map({x:o.x-nx*h*.3,y:o.y-ny*h*.3}),b2=map({x:o.x2-nx*h*.3,y:o.y2-ny*h*.3});ctx.beginPath();ctx.moveTo(a2.x,a2.y);ctx.lineTo(b2.x,b2.y);ctx.stroke();
   if(family.panes===2){const s=map(C),p=map({x:C.x+nx*h*.7,y:C.y+ny*h*.7}),q=map({x:C.x-nx*h*.7,y:C.y-ny*h*.7});ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke()}
   if(family.type==='casement'||family.type==='awning'){const x=map({x:C.x+nx*h*1.25,y:C.y+ny*h*1.25});ctx.save();ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(x.x,x.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.restore()}
  }
 }else if(o.type==='furniture'){
  const fam=furnitureFamily(o),x1=Math.min(o.x,o.x2),x2=Math.max(o.x,o.x2),y1=Math.min(o.y,o.y2),y2=Math.max(o.y,o.y2),A=map({x:x1,y:y1}),B=map({x:x2,y:y2});let x=Math.min(A.x,B.x),y=Math.min(A.y,B.y),w=Math.abs(B.x-A.x),h2=Math.abs(B.y-A.y);ctx.strokeRect(x,y,w,h2);
  ctx.beginPath();if(fam.family==='bed'){ctx.rect(x+w*.08,y+h2*.07,w*.84,h2*.25);ctx.moveTo(x+w*.5,y+h2*.35);ctx.lineTo(x+w*.5,y+h2*.94)}else if(fam.family==='sofa'){ctx.rect(x+w*.07,y+h2*.10,w*.86,h2*.22);ctx.rect(x+w*.07,y+h2*.78,w*.86,h2*.14);ctx.moveTo(x+w*.5,y+h2*.30);ctx.lineTo(x+w*.5,y+h2*.77)}else if(fam.family==='chair'){ctx.rect(x+w*.17,y+h2*.10,w*.66,h2*.18);ctx.rect(x+w*.18,y+h2*.32,w*.64,h2*.57)}else if(fam.family==='table'){ctx.ellipse(x+w/2,y+h2/2,w*.42,h2*.42,0,0,Math.PI*2)}else if(fam.family==='cabinet'){ctx.moveTo(x+w*.15,y+h2*.5);ctx.lineTo(x+w*.85,y+h2*.5);ctx.moveTo(x+w*.5,y+h2*.15);ctx.lineTo(x+w*.5,y+h2*.85)}else{ctx.rect(x+w*.08,y+h2*.1,w*.84,h2*.80)}ctx.stroke();
 }
 ctx.restore();
}
export function familySVG(o,stroke='#283d48'){
  if(!['door','window','furniture'].includes(o.type))return '';
  const X=p=>`${p.x},${-p.y}`,path=(a,b)=>`M${X(a)} L${X(b)}`,u=uv(o),h=(Number(o.thickness)||200)/2;
  if(o.type==='door'||o.type==='window'){
   const quad=[{x:o.x+u.nx*h,y:o.y+u.ny*h},{x:o.x2+u.nx*h,y:o.y2+u.ny*h},{x:o.x2-u.nx*h,y:o.y2-u.ny*h},{x:o.x-u.nx*h,y:o.y-u.ny*h}];
   let body=`<polygon points="${quad.map(X).join(' ')}" fill="white"/><path d="${path(quad[0],quad[3])} ${path(quad[1],quad[2])}" stroke="${stroke}" stroke-width="17" fill="none"/>`;
   if(o.type==='door'){
    const g=doorGeometry(o),d1=g.closed.x-g.hinge.x,d2=g.closed.y-g.hinge.y,e1=g.opened.x-g.hinge.x,e2=g.opened.y-g.hinge.y,cross=d1*e2-d2*e1,flag=cross>0?0:1;
    body+=`<path d="${path(g.hinge,g.opened)}" fill="none" stroke="${stroke}" stroke-width="16"/><path d="M${X(g.closed)} A${g.width},${g.width} 0 0 ${flag} ${X(g.opened)}" fill="none" stroke="${stroke}" stroke-width="11" stroke-dasharray="50,30"/>`;
   }else{
    const f=windowFamily(o),C=c(o),a={x:o.x+u.nx*h*.3,y:o.y+u.ny*h*.3},b={x:o.x2+u.nx*h*.3,y:o.y2+u.ny*h*.3},d={x:o.x-u.nx*h*.3,y:o.y-u.ny*h*.3},e={x:o.x2-u.nx*h*.3,y:o.y2-u.ny*h*.3};body+=`<path d="${path(a,b)} ${path(d,e)}" fill="none" stroke="${stroke}" stroke-width="14"/>`;if(f.panes===2)body+=`<path d="${path({x:C.x+u.nx*h*.7,y:C.y+u.ny*h*.7},{x:C.x-u.nx*h*.7,y:C.y-u.ny*h*.7})}" stroke="${stroke}" stroke-width="13"/>`;
   }
   return `<g class="symbol ${o.type}" data-family="${o.windowType||o.hand||''}">${body}</g>`;
  }
  const family=furnitureFamily(o).family,pts=[{x:o.x,y:o.y},{x:o.x2,y:o.y},{x:o.x2,y:o.y2},{x:o.x,y:o.y2}],cx=(o.x+o.x2)/2,cy=(o.y+o.y2)/2;
  let ins='';if(family==='bed'||family==='sofa')ins=`<path d="M${X({x:o.x,y:cy})} L${X({x:o.x2,y:cy})}" stroke="${stroke}" stroke-width="12"/>`;
  if(family==='table')ins=`<circle cx="${cx}" cy="${-cy}" r="${Math.min(Math.abs(o.x2-o.x),Math.abs(o.y2-o.y))*.28}" fill="none" stroke="${stroke}" stroke-width="13"/>`;
  if(family==='desk'||family==='cabinet'||family==='chair')ins=`<path d="M${X({x:cx,y:o.y})} L${X({x:cx,y:o.y2})}" stroke="${stroke}" stroke-width="13"/>`;
  return `<g class="symbol furniture" data-family="${family}"><polygon points="${pts.map(X).join(' ')}" fill="white" stroke="${stroke}" stroke-width="20"/>${ins}</g>`;
}
