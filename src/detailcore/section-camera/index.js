import {prism,footprint} from '../../core/geometry/index.js';
/** Authoring units are millimetres. The clip volume is axis-aligned; it is a
 * geometric intersection of display polygons, NOT an OpenCascade solid cut. */
const EPS=1e-8;
export function makeDetailCamera(point,{width=4000,depth=4000,height=4200,base=0,rotation=0,name='Detail 01',scale=20}={}){
 if(![point.x,point.y,width,depth,height,base,rotation,scale].every(v=>Number.isFinite(Number(v)))||width<=0||depth<=0||height<=0||scale<=0)throw Error('Invalid detail clip');
 return {id:`DT-${Date.now().toString(36)}`,name,anchor:{x:Number(point.x),y:Number(point.y)},width:+width,depth:+depth,height:+height,base:+base,rotation:+rotation,scale:+scale,lod:'350'};
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
