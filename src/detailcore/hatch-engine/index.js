const defs={
  concrete:{color:'#a5c1c7',pattern:'diagonal',step:12,angle:45},
  steel:{color:'#8fabb1',pattern:'cross',step:8,angle:45},
  masonry:{color:'#cfbca2',pattern:'brick',step:16,angle:0},
  timber:{color:'#d5b38c',pattern:'horizontal',step:14,angle:0},
  glass:{color:'#b4e2e8',pattern:'solid',step:12,angle:0},
  gypsum:{color:'#efe7da',pattern:'staggered',step:12,angle:45},
  insulation:{color:'#eadf8a',pattern:'zigzag',step:14,angle:0},
  earth:{color:'#d8c3a0',pattern:'dots',step:16,angle:0},
  default:{color:'#c9d7da',pattern:'solid',step:15,angle:0}
};
export const HATCHES=Object.fromEntries(Object.entries(defs).map(([k,v])=>[k[0].toUpperCase()+k.slice(1),v]));
export function hatchFor(material='Default'){const key=String(material||'Default').toLowerCase();return defs[key]||defs.default}
function line(ctx,x1,y1,x2,y2){ctx.moveTo(x1,y1);ctx.lineTo(x2,y2)}
export function drawHatchPattern(ctx,polygon,spec,origin={x:0,y:0}){
  if(!polygon?.length||spec.pattern==='solid')return;
  const xs=polygon.map(p=>p.x),ys=polygon.map(p=>p.y);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  const width=maxX-minX,height=maxY-minY;if(width<2||height<2)return;
  const step=Math.max(6,Number(spec.step)||12);ctx.save();ctx.beginPath();polygon.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.clip();
  ctx.strokeStyle=spec.color;ctx.globalAlpha=.36;ctx.lineWidth=.8;ctx.beginPath();
  const ox=((origin.x%step)+step)%step, oy=((origin.y%step)+step)%step;
  if(spec.pattern==='diagonal'||spec.pattern==='cross'||spec.pattern==='staggered'){
    const span=Math.max(width,height)*2;
    for(let d=minX-span+ox;d<maxX+span;d+=step){line(ctx,d,minY-span,d+span,maxY)}
    if(spec.pattern==='cross')for(let d=minX-span+ox;d<maxX+span;d+=step){line(ctx,d,maxY+span,d+span,minY)}
    if(spec.pattern==='staggered')for(let d=minX-span+ox+step/2;d<maxX+span;d+=step){line(ctx,d,maxY+span,d+span,minY)}
  }else if(spec.pattern==='horizontal'){
    for(let y=minY+oy;y<=maxY+step;y+=step)line(ctx,minX-step,y,maxX+step,y)
  }else if(spec.pattern==='brick'){
    for(let y=minY+oy;y<=maxY+step;y+=step){line(ctx,minX-step,y,maxX+step,y)}
    for(let y=minY+oy;y<=maxY+step;y+=step){const row=Math.round((y-minY)/step)%2;for(let x=minX+(row?step:step/2)+ox;x<=maxX+step;x+=step){line(ctx,x,y-step,x,y)}}
  }else if(spec.pattern==='dots'){
    ctx.fillStyle=spec.color;ctx.globalAlpha=.28;ctx.fill();ctx.beginPath();
    for(let y=minY+oy;y<=maxY;y+=step){for(let x=minX+ox;x<=maxX;x+=step){ctx.moveTo(x+1,y);ctx.arc(x,y,1.2,0,Math.PI*2)}}
    ctx.fill();ctx.restore();return;
  }else if(spec.pattern==='zigzag'){
    for(let y=minY+oy;y<=maxY+step;y+=step){for(let x=minX-step;x<=maxX+step;x+=step){ctx.moveTo(x,y);ctx.lineTo(x+step/2,y-step/2);ctx.lineTo(x+step,y)}}
  }
  ctx.stroke();ctx.restore();
}
export function svgPatternDefs(){
  return `
  <pattern id="hatch-diagonal" patternUnits="userSpaceOnUse" width="16" height="16" patternTransform="rotate(45)"><path d="M 0 0 L 0 16" stroke="#617880" stroke-opacity="0.28" stroke-width="1.2"/></pattern>
  <pattern id="hatch-cross" patternUnits="userSpaceOnUse" width="10" height="10"><path d="M0 0 L10 10 M10 0 L0 10" stroke="#617880" stroke-opacity="0.30" stroke-width="0.9"/></pattern>
  <pattern id="hatch-horizontal" patternUnits="userSpaceOnUse" width="14" height="14"><path d="M0 7 L14 7" stroke="#617880" stroke-opacity="0.26" stroke-width="1"/></pattern>
  <pattern id="hatch-brick" patternUnits="userSpaceOnUse" width="24" height="12"><path d="M0 0 L24 0 M0 12 L24 12 M12 0 L12 12 M0 6 L12 6 M12 6 L24 6" stroke="#7d6953" stroke-opacity="0.24" stroke-width="0.9" fill="none"/></pattern>
  <pattern id="hatch-staggered" patternUnits="userSpaceOnUse" width="16" height="16"><path d="M0 0 L16 16 M8 0 L24 16" stroke="#7a6a56" stroke-opacity="0.22" stroke-width="0.9"/></pattern>
  <pattern id="hatch-dots" patternUnits="userSpaceOnUse" width="14" height="14"><circle cx="3" cy="3" r="1.1" fill="#8a755d" fill-opacity="0.28"/></pattern>
  <pattern id="hatch-zigzag" patternUnits="userSpaceOnUse" width="16" height="12"><path d="M0 12 L8 6 L16 12" stroke="#978b57" stroke-opacity="0.28" stroke-width="0.9" fill="none"/></pattern>`;
}
export function svgFillFor(material='Default'){const spec=hatchFor(material);if(spec.pattern==='solid')return spec.color;return `url(#hatch-${spec.pattern})`;}
