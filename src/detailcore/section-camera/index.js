import {prism,footprint} from '../../core/geometry/index.js';
/** Authoring units are millimetres. The clip volume is axis-aligned; it is a
 * geometric intersection of display polygons, NOT an OpenCascade solid cut. */
const EPS=1e-8;
export function makeDetailCamera(point,{width=4000,depth=4000,height=4200,base=0,rotation=0,name='Detail 01',scale=20,hatchMultiplier=1}={}){
 if(![point.x,point.y,width,depth,height,base,rotation,scale].every(v=>Number.isFinite(Number(v)))||width<=0||depth<=0||height<=0||scale<=0)throw Error('Invalid detail clip');
 return {id:`DT-${Date.now().toString(36)}`,name,anchor:{x:Number(point.x),y:Number(point.y)},width:+width,depth:+depth,height:+height,base:+base,rotation:+rotation,scale:+scale,hatchMultiplier:Number(hatchMultiplier)||1,lod:'350'};
}
export function localPoint(p,detail){const a=detail.rotation*Math.PI/180,c=Math.cos(a),s=Math.sin(a),dx=p.x-detail.anchor.x,dy=p.y-detail.anchor.y;return{x:dx*c+dy*s,y:-dx*s+dy*c,z:p.z||0};}
export function worldPoint(p,detail){const a=detail.rotation*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return{x:detail.anchor.x+p.x*c-p.y*s,y:detail.anchor.y+p.x*s+p.y*c,z:p.z};}
export function clipPolygon(points,axis,min,max){let out=points;
 for(const [limit,isMin] of [[min,true],[max,false]]){
  const input=out;out=[];if(!input.length)break;
  const inside=p=>isMin?p[axis]>=limit-EPS:p[axis]<=limit+EPS;
  for(let i=0;i<input.length;i++){
   const a=input[i],b=input[(i+1)%input.length],ai=inside(a),bi=inside(b);
   const cross=()=>{const d=b[axis]-a[axis],t=Math.abs(d)<EPS?0:(limit-a[axis])/d;return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t}};
   if(ai&&bi)out.push(b);else if(ai&&!bi)out.push(cross());else if(!ai&&bi){out.push(cross(),b)}
  }
 }
 return out;
}
export function clipFace(points,detail){let p=points.map(v=>localPoint(v,detail));for(const [axis,min,max] of [['x',-detail.width/2,detail.width/2],['y',-detail.depth/2,detail.depth/2],['z',detail.base,detail.base+detail.height]])p=clipPolygon(p,axis,min,max);return p;}
export function facesFor(o){const p=prism(o),b=p.bottom,t=p.top,faces=[t,b];for(let i=0;i<b.length;i++)faces.push([b[i],b[(i+1)%b.length],t[(i+1)%b.length],t[i]]);return faces;}
export function detailGeometry(doc,detail){const faces=[],items=[],issues=[];
 for(const o of doc.objects||[]){if(o.visible===false||['dimension','line'].includes(o.type))continue;const f=facesFor(o).map(poly=>clipFace(poly,detail)).filter(poly=>poly.length>=3);if(f.length){items.push(o);for(const poly of f)faces.push({id:o.id,type:o.type,material:o.material||'Default',polygon:poly});}}
 for(const o of items.filter(o=>['beam','column','foundation'].includes(o.type))){if(!o.sectionSize&&!o.profile)issues.push(`${o.name||o.id}: section/profile not specified`);if(!o.connectionType)issues.push(`${o.name||o.id}: engineered joint details not specified`);}
 return {faces,items,issues};
}
export function sectionProjection(p,view){if(view==='front')return{x:p.x,y:-p.z};if(view==='right')return{x:p.y,y:-p.z};if(view==='plan')return{x:p.x,y:-p.y};if(view==='iso')return{x:(p.x-p.y)*Math.SQRT1_2,y:(p.x+p.y)*.408248-p.z*.816497};throw Error('Unknown section projection');}
export function projectFaces(geometry,view){return geometry.faces.map(f=>({...f,points:f.polygon.map(p=>sectionProjection(p,view))}));}
export function detailSchedule(doc,detail){return detailGeometry(doc,detail).items.map(o=>({id:o.id,type:o.type,material:o.material||'Unspecified',level:o.level||'',name:o.name||o.type}));}
/** Fit the detail volume to nearby solid geometry, with a small consistent buffer.
 * Returns a new detail; source elements remain unchanged. */
export function closeFitDetail(doc,point,{radius=1700,padding=140,heightPadding=140,rotation=0,scale=20,name='Connection Detail'}={}){
 const nearby=(doc.objects||[]).filter(o=>o.visible!==false&&!['dimension','line'].includes(o.type)).filter(o=>{
  const poly=footprint(o),minx=Math.min(...poly.map(v=>v[0])),maxx=Math.max(...poly.map(v=>v[0])),miny=Math.min(...poly.map(v=>v[1])),maxy=Math.max(...poly.map(v=>v[1]));
  return point.x>=minx-radius&&point.x<=maxx+radius&&point.y>=miny-radius&&point.y<=maxy+radius;
 });
 if(!nearby.length)return makeDetailCamera(point,{width:1200,depth:1200,height:2600,base:0,rotation,scale,name});
 const a=rotation*Math.PI/180,c=Math.cos(a),s=Math.sin(a);let xs=[],ys=[],zs=[];
 for(const o of nearby){for(const p of [...prism(o).bottom,...prism(o).top]){const dx=p.x-point.x,dy=p.y-point.y;xs.push(dx*c+dy*s);ys.push(-dx*s+dy*c);zs.push(p.z)}}
 const x0=Math.max(-radius,Math.min(...xs)-padding),x1=Math.min(radius,Math.max(...xs)+padding),y0=Math.max(-radius,Math.min(...ys)-padding),y1=Math.min(radius,Math.max(...ys)+padding);
 const localX=(x0+x1)/2,localY=(y0+y1)/2;
 const anchor={x:point.x+localX*c-localY*s,y:point.y+localX*s+localY*c};
 const base=Math.min(...zs)-heightPadding,top=Math.max(...zs)+heightPadding;
 return makeDetailCamera(anchor,{width:Math.max(250,x1-x0),depth:Math.max(250,y1-y0),height:Math.max(400,top-base),base,rotation,scale,name});
}
export function detailViewMeasurements(geometry,view){
 const faces=projectFaces(geometry,view),pts=faces.flatMap(f=>f.points);if(!pts.length)return null;
 return {x0:Math.min(...pts.map(p=>p.x)),x1:Math.max(...pts.map(p=>p.x)),y0:Math.min(...pts.map(p=>p.y)),y1:Math.max(...pts.map(p=>p.y))};
}
