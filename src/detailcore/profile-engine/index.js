import{footprint}from'../../core/geometry/index.js';
export const profileFor=o=>footprint(o);
export function profileArea(o){const p=profileFor(o);let sum=0;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];sum+=a[0]*b[1]-b[0]*a[1]}return Math.abs(sum)/2;}
