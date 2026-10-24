import {drawFamilySymbol,familySVG} from '../families/symbols.js';
import {footprint} from '../../core/geometry/index.js';
export const SYMBOLS={
  door:'Door swing',
  window:'Window glazing',
  fixture:'Plumbing fixture',
  equipment:'Mechanical equipment',
  conduit:'Electrical raceway',
  furniture:'Furniture layout'
};
const mid=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
export function axisOf(o){const dx=(o.x2||0)-(o.x||0),dy=(o.y2||0)-(o.y||0),L=Math.hypot(dx,dy)||1;return {dx:dx/L,dy:dy/L,nx:-dy/L,ny:dx/L,L};}
export function symbolAnchor(o){const f=footprint(o),xs=f.map(p=>p[0]),ys=f.map(p=>p[1]);return {x:(Math.min(...xs)+Math.max(...xs))/2,y:(Math.min(...ys)+Math.max(...ys))/2};}
export function symbolLabelPoint(o,distance=320){
  const a=axisOf(o),c=symbolAnchor(o),dir=(o.swing||1)>=0?1:-1;
  if(o.type==='door'||o.type==='window') return {x:c.x+a.nx*distance*dir,y:c.y+a.ny*distance*dir};
  return {x:c.x,y:c.y-(distance*0.35)};
}
export function drawPlanSymbol(ctx,o,map,style={stroke:'#334155'}){
  if(!['door','window','fixture','equipment','furniture'].includes(o.type))return;
  ctx.save();ctx.strokeStyle=style.stroke;ctx.fillStyle='#ffffff';ctx.lineWidth=Math.max(1,style.line||1.2);ctx.lineJoin='miter';ctx.lineCap='round';
  if(['door','window','furniture'].includes(o.type))drawFamilySymbol(ctx,o,map,style.stroke); else drawComponentSymbol(ctx,o,map);
  ctx.restore();
}
function drawOpeningSymbol(ctx,o,map){
  const {dx,dy,nx,ny,L}=axisOf(o);const w=Math.max(120,o.width||L);const t=Math.max(80,Number(o.thickness)||180);const c={x:(o.x+o.x2)/2,y:(o.y+o.y2)/2};const half=w/2;const halfT=t/2;
  const p1=map({x:c.x-dx*half+nx*halfT,y:c.y-dy*half+ny*halfT});
  const p2=map({x:c.x+dx*half+nx*halfT,y:c.y+dy*half+ny*halfT});
  const p3=map({x:c.x+dx*half-nx*halfT,y:c.y+dy*half-ny*halfT});
  const p4=map({x:c.x-dx*half-nx*halfT,y:c.y-dy*half-ny*halfT});
  // clear host wall portion first
  ctx.save();ctx.beginPath();[p1,p2,p3,p4].forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle='rgba(255,255,255,1)';ctx.fill();ctx.restore();
  const jambA=map({x:c.x-dx*half,y:c.y-dy*half});const jambB=map({x:c.x+dx*half,y:c.y+dy*half});
  const jambA1=map({x:c.x-dx*half+nx*halfT,y:c.y-dy*half+ny*halfT});const jambA2=map({x:c.x-dx*half-nx*halfT,y:c.y-dy*half-ny*halfT});
  const jambB1=map({x:c.x+dx*half+nx*halfT,y:c.y+dy*half+ny*halfT});const jambB2=map({x:c.x+dx*half-nx*halfT,y:c.y+dy*half-ny*halfT});
  ctx.beginPath();ctx.moveTo(jambA1.x,jambA1.y);ctx.lineTo(jambA2.x,jambA2.y);ctx.moveTo(jambB1.x,jambB1.y);ctx.lineTo(jambB2.x,jambB2.y);ctx.stroke();
  if(o.type==='door'){
    const side=(o.swing||1)>=0?1:-1;const hinge={x:o.x,y:o.y};const leafEnd={x:o.x+dx*w+nx*w*side,y:o.y+dy*w+ny*w*side};
    const hs=map(hinge), he=map(leafEnd), openEnd=map({x:o.x+dx*w,y:o.y+dy*w});
    ctx.beginPath();ctx.moveTo(hs.x,hs.y);ctx.lineTo(openEnd.x,openEnd.y);ctx.stroke();
    const radius=Math.hypot(openEnd.x-hs.x,openEnd.y-hs.y);const base=Math.atan2(openEnd.y-hs.y,openEnd.x-hs.x), sweep=side>0?Math.PI/2:-Math.PI/2;
    ctx.save();ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(hs.x,hs.y,radius,base,base+sweep,side<0);ctx.stroke();ctx.restore();
  }else{
    const g1=map({x:c.x-dx*half*0.8+nx*halfT*0.45,y:c.y-dy*half*0.8+ny*halfT*0.45});
    const g2=map({x:c.x+dx*half*0.8+nx*halfT*0.45,y:c.y+dy*half*0.8+ny*halfT*0.45});
    const g3=map({x:c.x-dx*half*0.8-nx*halfT*0.45,y:c.y-dy*half*0.8-ny*halfT*0.45});
    const g4=map({x:c.x+dx*half*0.8-nx*halfT*0.45,y:c.y+dy*half*0.8-ny*halfT*0.45});
    ctx.beginPath();ctx.moveTo(g1.x,g1.y);ctx.lineTo(g2.x,g2.y);ctx.moveTo(g3.x,g3.y);ctx.lineTo(g4.x,g4.y);ctx.stroke();
  }
}
function drawComponentSymbol(ctx,o,map){
  const poly=footprint(o).map(([x,y])=>map({x,y}));
  const xs=poly.map(p=>p.x),ys=poly.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),w=maxX-minX,h=maxY-minY;
  ctx.beginPath();poly.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();ctx.stroke();
  if(o.type==='fixture'){
    const cx=(minX+maxX)/2,cy=(minY+maxY)/2,r=Math.min(w,h)*0.22;ctx.beginPath();ctx.ellipse(cx,cy,w*0.24,h*0.30,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
  }else if(o.type==='equipment'){
    ctx.beginPath();ctx.rect(minX+w*0.18,minY+h*0.18,w*0.64,h*0.64);ctx.stroke();ctx.beginPath();ctx.moveTo(minX+w*0.18,minY+h*0.18);ctx.lineTo(minX+w*0.82,maxY-h*0.18);ctx.moveTo(maxX-w*0.18,minY+h*0.18);ctx.lineTo(minX+w*0.18,maxY-h*0.18);ctx.stroke();
  }else if(o.type==='furniture'){
    ctx.beginPath();ctx.rect(minX+w*0.12,minY+h*0.12,w*0.76,h*0.76);ctx.stroke();ctx.beginPath();ctx.moveTo(minX+w*0.5,minY+h*0.12);ctx.lineTo(minX+w*0.5,maxY-h*0.12);ctx.moveTo(minX+w*0.12,minY+h*0.5);ctx.lineTo(maxX-w*0.12,minY+h*0.5);ctx.stroke();
  }
}
export function svgSymbol(o,style={stroke:'#334155'}){
  const s=style.stroke||'#334155';
  const f=footprint(o);const xs=f.map(p=>p[0]),ys=f.map(p=>-p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),w=maxX-minX,h=maxY-minY;
  if(['door','window','furniture'].includes(o.type))return familySVG(o,s);
  if(o.type==='fixture') return `<g class="symbol fixture"><polygon points="${f.map(([x,y])=>`${x},${-y}`).join(' ')}" fill="#fff" stroke="${s}" stroke-width="20"/><ellipse cx="${(minX+maxX)/2}" cy="${(minY+maxY)/2}" rx="${w*0.24}" ry="${h*0.30}" fill="none" stroke="${s}" stroke-width="18"/><circle cx="${(minX+maxX)/2}" cy="${(minY+maxY)/2}" r="${Math.min(w,h)*0.22}" fill="none" stroke="${s}" stroke-width="14"/></g>`;
  if(o.type==='equipment') return `<g class="symbol equipment"><polygon points="${f.map(([x,y])=>`${x},${-y}`).join(' ')}" fill="#fff" stroke="${s}" stroke-width="20"/><rect x="${minX+w*0.18}" y="${minY+h*0.18}" width="${w*0.64}" height="${h*0.64}" fill="none" stroke="${s}" stroke-width="16"/><path d="M ${minX+w*0.18} ${minY+h*0.18} L ${minX+w*0.82} ${maxY-h*0.18} M ${maxX-w*0.18} ${minY+h*0.18} L ${minX+w*0.18} ${maxY-h*0.18}" fill="none" stroke="${s}" stroke-width="14"/></g>`;
  if(o.type==='furniture') return `<g class="symbol furniture"><polygon points="${f.map(([x,y])=>`${x},${-y}`).join(' ')}" fill="#fff" stroke="${s}" stroke-width="20"/><rect x="${minX+w*0.12}" y="${minY+h*0.12}" width="${w*0.76}" height="${h*0.76}" fill="none" stroke="${s}" stroke-width="14"/><path d="M ${minX+w*0.5} ${minY+h*0.12} L ${minX+w*0.5} ${maxY-h*0.12} M ${minX+w*0.12} ${minY+h*0.5} L ${maxX-w*0.12} ${minY+h*0.5}" fill="none" stroke="${s}" stroke-width="12"/></g>`;
  return '';
}
function svgOpeningSymbol(o,stroke){
  const {dx,dy,nx,ny,L}=axisOf(o);const w=Math.max(120,o.width||L),t=Math.max(80,Number(o.thickness)||180),c={x:(o.x+o.x2)/2,y:(o.y+o.y2)/2},half=w/2,halfT=t/2;
  const quad=[
    [c.x-dx*half+nx*halfT,-(c.y-dy*half+ny*halfT)],
    [c.x+dx*half+nx*halfT,-(c.y+dy*half+ny*halfT)],
    [c.x+dx*half-nx*halfT,-(c.y+dy*half-ny*halfT)],
    [c.x-dx*half-nx*halfT,-(c.y-dy*half-ny*halfT)]
  ];
  const jambA1=[c.x-dx*half+nx*halfT,-(c.y-dy*half+ny*halfT)], jambA2=[c.x-dx*half-nx*halfT,-(c.y-dy*half-ny*halfT)], jambB1=[c.x+dx*half+nx*halfT,-(c.y+dy*half+ny*halfT)], jambB2=[c.x+dx*half-nx*halfT,-(c.y+dy*half-ny*halfT)];
  let g=`<g class="symbol ${o.type}"><polygon points="${quad.map(p=>p.join(',')).join(' ')}" fill="#fff" stroke="none"/><path d="M ${jambA1[0]} ${jambA1[1]} L ${jambA2[0]} ${jambA2[1]} M ${jambB1[0]} ${jambB1[1]} L ${jambB2[0]} ${jambB2[1]}" fill="none" stroke="${stroke}" stroke-width="18"/>`;
  if(o.type==='door'){
    const side=(o.swing||1)>=0?1:-1;const openEnd=[o.x+dx*w,-(o.y+dy*w)], leafEnd=[o.x+dx*w+nx*w*side,-(o.y+dy*w+ny*w*side)];
    const r=w;const base=Math.atan2(openEnd[1]+o.y,openEnd[0]-o.x);const sweep=side>0?1:0; // just sign flag for arc path choice
    const arcEnd=leafEnd;g+=`<path d="M ${o.x} ${-o.y} L ${openEnd[0]} ${openEnd[1]}" fill="none" stroke="${stroke}" stroke-width="16"/>`;
    const laf=0, sf=side>0?0:1;g+=`<path d="M ${openEnd[0]} ${openEnd[1]} A ${r} ${r} 0 ${laf} ${sf} ${arcEnd[0]} ${arcEnd[1]}" fill="none" stroke="${stroke}" stroke-width="14"/>`;
  }else{
    const a=[c.x-dx*half*0.8+nx*halfT*0.45,-(c.y-dy*half*0.8+ny*halfT*0.45)], b=[c.x+dx*half*0.8+nx*halfT*0.45,-(c.y+dy*half*0.8+ny*halfT*0.45)], c1=[c.x-dx*half*0.8-nx*halfT*0.45,-(c.y-dy*half*0.8-ny*halfT*0.45)], d=[c.x+dx*half*0.8-nx*halfT*0.45,-(c.y+dy*half*0.8-ny*halfT*0.45)];
    g+=`<path d="M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} M ${c1[0]} ${c1[1]} L ${d[0]} ${d[1]}" fill="none" stroke="${stroke}" stroke-width="14"/>`;
  }
  return g+'</g>';
}
