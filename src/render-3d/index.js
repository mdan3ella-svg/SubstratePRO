// Lightweight parametric-solid viewer: the 3D projection is generated from the
// document model on every redraw, never maintained as a second geometry store.
import{render}from'../render-2d/index.js';
export function render3D(canvas,doc,options={}){return render(canvas,doc,'iso',options)}
export const kernelCapabilities={parametricPrisms:true,semanticBIM:true,exactBRep:false,IFCRoundTrip:false,solidBooleans:false};
