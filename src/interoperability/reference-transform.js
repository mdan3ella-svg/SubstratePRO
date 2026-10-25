/** Import calibration independent of Three.js, with mm as the project authoring unit. */
export function referenceTransform({unit='m',up='z',scale=1,x=0,y=0,z=0,rotation=0}={}){
 const units={m:1,mm:.001,cm:.01,in:.0254,ft:.3048};
 if(!(unit in units))throw Error('Unsupported source units');
 const vals=[scale,x,y,z,rotation].map(Number);
 if(vals.some(v=>!Number.isFinite(v))||vals[0]<=0)throw Error('Invalid reference transform');
 if(!['y','z'].includes(up))throw Error('Invalid up axis');
 return {unit,up,scale:vals[0],x:vals[1],y:vals[2],z:vals[3],rotation:vals[4],meterScale:units[unit]*vals[0]};
}
export function applyReferenceTransform(root,opts){const t=referenceTransform(opts);root.scale.multiplyScalar(t.meterScale);if(t.up==='y')root.rotation.x+=Math.PI/2;root.rotation.z+=t.rotation*Math.PI/180;root.position.set(t.x/1000,t.y/1000,t.z/1000);root.updateMatrixWorld(true);return root}
