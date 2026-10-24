import {length} from '../../core/geometry/index.js';
import {symbolLabelPoint} from '../symbol-registry/index.js';
export const dimensionText=o=>`${Math.round(o.measuredMM ?? length(o))} mm`;
export const layerFor=o=>({architecture:'A',structure:'S',mechanical:'M',plumbing:'P',electrical:'E',civil:'C',documentation:'G'})[o.discipline]||'G';
export const tagFor=o=>`${layerFor(o)}-${({wall:'W',slab:'SL',door:'D',window:'WIN',beam:'B',column:'C',duct:'DU',equipment:'EQ',pipe:'P',fixture:'F',conduit:'EC',road:'RD',dimension:'DIM',furniture:'FUR'})[o.type]||o.type.toUpperCase().slice(0,3)} · ${String(o.id||'').slice(-4).toUpperCase()}`;
export const descriptorFor=o=>{
  if(o.type==='door') return `${Math.round(o.width||length(o))} × ${Math.round(Number(o.height)||2100)} mm · ${o.hand||'LH'} / ${o.swingSide||'in'}`;
  if(o.type==='window') return `${Math.round(o.width||length(o))} × ${Math.round(Number(o.height)||1200)} mm · ${o.windowType||'fixed'} · sill ${Math.round(Number(o.z)||0)} mm`;
  if(o.type==='fixture'||o.type==='equipment'||o.type==='furniture') return `${o.family||o.name||o.type} · ${Math.round(length(o)||Math.abs((o.x2||0)-(o.x||0)))} mm`;
  return `${Math.round(length(o))} × ${Math.round(Number(o.thickness)||0)} × ${Math.round(Number(o.height)||0)} mm`;
};
export const drawingStyle=o=>({architecture:{stroke:'#283d48',fill:'#dce6ea',line:1.65},structure:{stroke:'#713e33',fill:'#e8dad2',line:2.3},mechanical:{stroke:'#26717a',fill:'#dcebed',line:1.65},plumbing:{stroke:'#2675ae',fill:'#dce9f5',line:1.55},electrical:{stroke:'#a0781f',fill:'#faf0d9',line:1.45},civil:{stroke:'#596b40',fill:'#e3e8d9',line:1.6},documentation:{stroke:'#374151',fill:'#fff',line:1.2}})[o.discipline]||{stroke:'#344654',fill:'#e8ecee',line:1.5};
export function labelPointFor(o){
  if(['door','window','fixture','equipment','furniture'].includes(o.type)) return symbolLabelPoint(o, o.type==='window'?250:300);
  return {x:(Number(o.x||0)+Number(o.x2||0))/2, y:(Number(o.y||0)+Number(o.y2||0))/2};
}
