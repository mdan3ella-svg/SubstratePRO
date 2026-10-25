/** BIM material metadata and viewport style presets. Appearance is indicative, not a physical simulation. */
export const MATERIALS={
 Concrete:{color:0xb9bec0,roughness:.94,metalness:0,pattern:'speckle',scale:1.8,hatch:'diagonal'},
 Steel:{color:0x78828d,roughness:.39,metalness:.75,pattern:'brushed',scale:3,hatch:'cross'},
 Masonry:{color:0xb79f87,roughness:.94,metalness:0,pattern:'brick',scale:1.5,hatch:'brick'},
 Timber:{color:0xb48b5d,roughness:.78,metalness:0,pattern:'grain',scale:2.3,hatch:'horizontal'},
 Glass:{color:0x8bc5d2,roughness:.09,metalness:.04,opacity:.32,pattern:'none',hatch:'solid'},
 Gypsum:{color:0xe5dfd6,roughness:.95,metalness:0,pattern:'none',hatch:'staggered'},
 Insulation:{color:0xd7c78e,roughness:1,metalness:0,pattern:'zigzag',scale:2,hatch:'zigzag'},
 Earth:{color:0x937f69,roughness:1,metalness:0,pattern:'speckle',scale:2.4,hatch:'dots'},
 Default:{color:0xc6d0d3,roughness:.8,metalness:0,pattern:'none',hatch:'solid'}
};
export const VIEW_STYLES={
 xray:{name:'X-Ray',opacity:.20,edge:true,lighting:false,pattern:false,background:0xf6fafb},
 wire:{name:'Wireframe',opacity:0,edge:true,lighting:false,pattern:false,background:0xffffff},
 hidden:{name:'Hidden Line',opacity:1,edge:true,lighting:false,pattern:false,background:0xffffff},
 shaded:{name:'Shaded',opacity:1,edge:false,lighting:true,pattern:false,background:0xf9fbfc},
 technical:{name:'Material Hatch',opacity:1,edge:true,lighting:true,pattern:true,background:0xffffff},
 rendered:{name:'Rendered + AO',opacity:1,edge:false,lighting:true,pattern:true,background:0xf4f6f7}
};
export const resolveMaterial=name=>MATERIALS[name]||MATERIALS.Default;
export function makeHatchCanvas(name,size=128){const spec=resolveMaterial(name),canvas=document.createElement('canvas');canvas.width=canvas.height=size;const c=canvas.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,size,size);c.strokeStyle='#808080';c.globalAlpha=.21;c.lineWidth=2;
 if(spec.pattern==='brick'){for(let y=0;y<=size;y+=24){c.beginPath();c.moveTo(0,y);c.lineTo(size,y);c.stroke();for(let x=(y/24%2)*24;x<=size;x+=48){c.beginPath();c.moveTo(x,y);c.lineTo(x,y+24);c.stroke()}}}
 if(spec.pattern==='grain'||spec.pattern==='brushed'){for(let y=4;y<size;y+=8){c.beginPath();c.moveTo(0,y);c.bezierCurveTo(size/3,y+2,size*2/3,y-2,size,y);c.stroke()}}
 if(spec.pattern==='speckle'){let seed=31;for(let i=0;i<110;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed%size;seed=(seed*1664525+1013904223)>>>0;const y=seed%size;c.fillStyle='#737373';c.fillRect(x,y,1.5,1.5)}}
 if(spec.pattern==='zigzag'){for(let y=0;y<size;y+=24){c.beginPath();for(let x=0;x<=size;x+=12){if(x===0)c.moveTo(x,y+12);else c.lineTo(x,y+(x/12%2?0:12))}c.stroke()}}
 c.globalAlpha=1;return canvas}
