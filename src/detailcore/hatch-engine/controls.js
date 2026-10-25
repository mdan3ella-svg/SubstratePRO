/** Shared, bounded hatch specifications: on-screen pixels and model-paper plotting share material identity. */
import {hatchFor} from './index.js';
export const HATCH_LODS=['schematic','coordination','detail'];
export function hatchSpec(material,{scale=100,lod='detail',multiplier=1,override}={}){
 if(!Number.isFinite(+scale)||+scale<=0||!Number.isFinite(+multiplier)||+multiplier<=0)throw Error('Invalid hatch scale');
 const base=hatchFor(override||material);
 const density=lod==='schematic'?1.7:lod==='coordination'?1.25:1;
 return {...base,step:Math.max(3,Math.min(800,base.step*(+multiplier)*density)),material:override||material,lod,scale:+scale};
}
export function svgHatchFill(material,settings={}){
 const spec=hatchSpec(material,settings);return spec.pattern==='solid'?spec.color:`url(#hatch-${spec.pattern})`;
}
