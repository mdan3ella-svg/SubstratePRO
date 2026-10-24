import{render}from'../render-2d/index.js';
export function updateReview(root,doc){root.querySelectorAll('canvas[data-view]').forEach(c=>render(c,doc,c.dataset.view,{grid:false}))}
