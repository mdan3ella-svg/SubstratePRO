import {length} from '../../core/geometry/index.js';
export const dimensionText=o=>`${Math.round(length(o))} mm`;
export const layerFor=o=>({architecture:'A',structure:'S',mechanical:'M',plumbing:'P',electrical:'E',civil:'C',documentation:'G'})[o.discipline]||'G';
export const tagFor=o=>`${layerFor(o)}-${({wall:'W',slab:'SL',door:'D',window:'WIN',beam:'B',column:'C',duct:'DU',equipment:'EQ',pipe:'P',fixture:'F',conduit:'EC',road:'RD',dimension:'DIM'})[o.type]||o.type.toUpperCase().slice(0,3)} · ${String(o.id||'').slice(-4).toUpperCase()}`;
export const descriptorFor=o=>`${Math.round(length(o))} × ${Math.round(Number(o.thickness)||0)} × ${Math.round(Number(o.height)||0)} mm`;
export const drawingStyle=o=>({architecture:{stroke:'#283d48',fill:'#dce6ea',line:1.65},structure:{stroke:'#713e33',fill:'#e8dad2',line:2.3},mechanical:{stroke:'#26717a',fill:'#dcebed',line:1.65},plumbing:{stroke:'#2675ae',fill:'#dce9f5',line:1.55},electrical:{stroke:'#a0781f',fill:'#faf0d9',line:1.45},civil:{stroke:'#596b40',fill:'#e3e8d9',line:1.6},documentation:{stroke:'#374151',fill:'#fff',line:1.2}})[o.discipline]||{stroke:'#344654',fill:'#e8ecee',line:1.5};
