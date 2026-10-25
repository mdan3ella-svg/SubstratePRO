// Z-up architectural camera presets, expressed in a world-coordinate-independent way.
export const CAMERA_VIEWS=Object.freeze({
 iso:{projection:'orthographic',direction:[1,-1,1],up:[0,0,1]},
 plan3d:{projection:'orthographic',direction:[0,0,1],up:[0,1,0]},
 front:{projection:'orthographic',direction:[0,-1,0],up:[0,0,1]},
 rear:{projection:'orthographic',direction:[0,1,0],up:[0,0,1]},
 right:{projection:'orthographic',direction:[1,0,0],up:[0,0,1]},
 left:{projection:'orthographic',direction:[-1,0,0],up:[0,0,1]},
 perspective:{projection:'perspective',direction:[1,-1,0.85],up:[0,0,1]}
});
export function viewDefinition(key){return CAMERA_VIEWS[key]||CAMERA_VIEWS.iso}
export function framingDimensions(size,aspect=1.5,margin=1.35){
 const w=Math.max(0.5,Number(size?.x)||0),h=Math.max(0.5,Number(size?.y)||0),z=Math.max(0.5,Number(size?.z)||0);
 // Includes oblique projected footprint without relying on hidden camera state.
 const span=Math.max(Math.hypot(w,h),Math.hypot(w,z),Math.hypot(h,z))*margin;
 return {height:span,width:span*Math.max(0.1,aspect),span};
}
export function isOrthographicView(name){return viewDefinition(name).projection==='orthographic'}
