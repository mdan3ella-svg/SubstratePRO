import {rotateElements} from '../core/geometry/rotate-selection.js';
import {applyReferenceTransform} from '../interoperability/reference-transform.js';
import {modelPlanSegments,combinedPlanBounds,planCameraForBounds} from '../detailcore/reference-plan/index.js';
import {attachUnderlayManager} from '../detailcore/underlay/browser.js';
import {auditDrawing,drawingRegister,issueReportText} from '../audit/drawing-coordination.js';
import {idsInRectangle,translateObject,reflectObject,clonesOf,arrayOffsets,chamferCorner,roundedCornerPoints,arcWallSegments} from '../detailcore/modify/index.js';
import {installDetailCamera} from '../detailcore/section-camera/dialog.js';
import {ensureHierarchy,prepareElement,nearestGridIntersection,makeGridFoundation,makeGridFrame,makeGridSlab,coordinationReport,STAGES,stageForType} from '../detailcore/construction-hierarchy/index.js';
import {planObjects,shouldStartMove,annotationMetrics,zoomAtPointer} from '../core/geometry/plan-visibility.js';
import {catalogEntries,findCatalogItem,createCatalogObjects,catalogTableOfContents} from '../detailcore/catalog/index.js';
import {ensureSystems,addLevel,levelElevation,gridArray,makeRoof,makeRoom,makeFacade,makeFraming,schedules,layerVisible,layerLocked} from '../detailcore/building-systems/index.js';
import {buildSheetHTML} from '../detailcore/sheets/index.js';
import {applyFamilyDefaults} from '../detailcore/families/index.js';
// Optional engines must never prevent core controls from binding.
let ifcModule=null;
import{blank,element}from'../core/document-model/index.js';
import{Store}from'../core/transactions/index.js';
import{hit,project,projectedBounds}from'../core/geometry/index.js';
import{wallMiterPolygons}from'../core/geometry/wall-miters.js';
import{snapPoint,wallEnd,precisionSnap,wallJoinReport}from'../core/geometry/snapping.js';
import{openingOnWall}from'../core/geometry/openings.js';
import{render,makeCamera}from'../render-2d/index.js';
import{updateReview}from'../presentation/index.js';
import{runAudit}from'../audit/index.js';
import{codeScreen}from'../audit/code-screen.js';
import{connectionSchedule}from'../detailcore/connections/index.js';
import{exportEditableMapping}from'../interoperability/ifc/mapping.js';
import{load3DFile,export3D,downloadModel,summarizeModel}from'../interoperability/model-formats.js';
import{quantities}from'../detailcore/assembly-solver/index.js';
import{sectionAt}from'../detailcore/section-engine/index.js';
import{removeWithDependents}from'../core/dependencies/index.js';
import{importJSON,exportJSON,download}from'../interoperability/index.js';
import{planSVG,technicalViewSVG}from'../plot/index.js';
import{tools as architecture}from'../disciplines/architecture/index.js';
import{tools as structure}from'../disciplines/structure/index.js';
import{tools as mechanical}from'../disciplines/mechanical/index.js';
import{tools as plumbing}from'../disciplines/plumbing/index.js';
import{tools as electrical}from'../disciplines/electrical/index.js';
import{tools as civil}from'../disciplines/civil/index.js';
const $=id=>document.getElementById(id),store=new Store(),canvas=$('stage'),names={iso:'Isometric · Orthographic',perspective:'3D Perspective · Free Orbit',plan3d:'3D Top · Orthographic',plan:'2D Plan & Drafting',front:'Front Orthographic',right:'Right Orthographic',rear:'Rear Orthographic',left:'Left Orthographic'};
const disciplines={architecture,structure,mechanical,plumbing,electrical,civil};let discipline='architecture',tool='select',view='plan',selected=null,gesture=null,preview=null,camera=null,customCamera=false;
const referencePlans=[];
let gpu=null,exactReady=false,latestErrors=[],pendingStart=null,wallChain=false,chainGroup=null;
let selectedIds=new Set(),selectionMode=null,clipboard=[],moveGroupMode=false,curveStart=null;
const draftingSettings={lod:'detail',autoDimensions:true,autoTags:true,materialHatches:true,globalScale:1};
const visualization={style:'shaded',ao:.55};
$('visualStyle')?.addEventListener('change',e=>{visualization.style=e.target.value;if(gpu)gpu.setVisualStyle(visualization.style)});
$('aoStrength')?.addEventListener('input',e=>{visualization.ao=Number(e.target.value)/100;$('aoValue').textContent=e.target.value+'%';if(gpu)gpu.setAO(visualization.ao)});
const diagnostic=msg=>{console.error('[SUBSTRATE]',msg);report(String(msg));};
const setEngineStatus=msg=>{const el=$("engineStatus");if(el)el.textContent=msg;};
const visible=()=>store.doc.objects.filter(o=>layerVisible(store.doc,o));
const planVisible=()=>planObjects({...store.doc,objects:visible()},{level:$('activeLevel')?.value||'L1',cutHeight:Number($('planCutHeight')?.value)||1200,showOverhead:!!$('showOverhead')?.checked});
$('showOverhead')?.addEventListener('change',()=>{camera=null;draw()});$('planCutHeight')?.addEventListener('change',()=>{camera=null;draw()});
function renderDoc(){const {polygons}=wallMiterPolygons(store.doc.objects);return {...store.doc,objects:store.doc.objects.filter(o=>layerVisible(store.doc,o)).map(o=>polygons.has(o.id)?{...o,joinPolygon:polygons.get(o.id)}:o)}}const active=()=>store.doc.objects.find(o=>o.id===selected);
const multiActive=()=>store.doc.objects.filter(o=>selectedIds.has(o.id));
function setMulti(ids){selectedIds=new Set(ids);selected=ids[0]||null;const el=$('multiSelectionStatus');if(el)el.textContent=ids.length+' selected';sync()}
function selectedForModify(){return multiActive().length?multiActive():(active()?[active()]:[])}
function notice(msg){$('status').textContent=msg;const el=$('toast');el.textContent=msg;el.style.display='block';clearTimeout(notice.timer);notice.timer=setTimeout(()=>el.style.display='none',2400)}
function report(txt){$('report').textContent=txt}
function draw(){if(gpu && view!=='plan'){gpu.setGrid(store.doc.settings.gridVisible);return;}if(!canvas.clientWidth||!canvas.clientHeight)return;if(!camera||!customCamera)camera=(view==='plan'?planCameraForBounds(combinedPlanBounds(planVisible(),store.doc.underlays||[],referencePlans),canvas.clientWidth,canvas.clientHeight):null)||makeCamera(view==='plan'?planVisible():visible(),view,canvas.clientWidth,canvas.clientHeight);render(canvas,view==='plan'?{...renderDoc(),objects:planVisible().map(o=>{const geometry=renderDoc().objects.find(g=>g.id===o.id);return geometry?{...geometry,__planClass:o.__planClass}:o})}:renderDoc(),view,{camera,selected,drafting:{...draftingSettings,metrics:annotationMetrics($('drawingScale')?.value,camera?.scale,draftingSettings.globalScale)},underlays:store.doc.underlays||[],referencePlans});if(preview&&view==='plan'){const c=canvas.getContext('2d'),d=Math.min(2,devicePixelRatio||1),w=canvas.clientWidth,h=canvas.clientHeight; c.setTransform(d,0,0,d,0,0);let a=screen(preview.x,preview.y),b=screen(preview.x2,preview.y2);c.save();c.strokeStyle='#16a092';c.lineWidth=2;c.setLineDash([6,4]);c.strokeRect(Math.min(a.x,b.x),Math.min(a.y,b.y),Math.abs(a.x-b.x),Math.abs(a.y-b.y));c.restore()}renderHandles();if(gesture?.kind==='rect'){const c=canvas.getContext('2d'),d=Math.min(2,devicePixelRatio||1),a=screen(gesture.start.x,gesture.start.y),b=screen(gesture.end.x,gesture.end.y);c.save();c.setTransform(d,0,0,d,0,0);c.strokeStyle=gesture.mode==='crossing'?'#178c7b':'#3269b1';c.setLineDash(gesture.mode==='crossing'?[6,4]:[]);c.strokeRect(Math.min(a.x,b.x),Math.min(a.y,b.y),Math.abs(a.x-b.x),Math.abs(a.y-b.y));c.restore()}}
function screen(x,y){const p=project({x,y,z:0},'plan');return{x:(p.x-camera.cx)*camera.scale+canvas.clientWidth/2,y:(p.y-camera.cy)*camera.scale+canvas.clientHeight/2}}
function toWorld(e){let b=canvas.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;return{x:(x-b.width/2)/camera.scale+camera.cx,y:-((y-b.height/2)/camera.scale+camera.cy),sx:x,sy:y}}
function pointSnap(p,excludeId=null){const v=precisionSnap(p,{objects:visible().filter(o=>o.id!==excludeId),step:store.doc.settings.grid,grid:store.doc.settings.snap,endpoint:$('endpointSnap').checked,midpoint:$('midpointSnap').checked,intersection:$('intersectionSnap').checked,perpendicular:$('perpSnap').checked,origin:pendingStart,scale:camera?.scale||1});const gn=store.doc.construction?.gridSnap&&nearestGridIntersection(store.doc,p,12/(camera?.scale||1));return gn&&['grid','none','free'].includes(v.mode)?{x:gn.x,y:gn.y,mode:'grid intersection',ref:gn.ref}:v;}
function resolvedEnd(start,p,e){if(tool!=='wall')return pointSnap(p);const axis=$('orthogonalWalls').checked&&!e.shiftKey;const snapped=axis?p:pointSnap(p);return wallEnd(start,snapped,{objects:visible(),step:store.doc.settings.grid,grid:store.doc.settings.snap,endpoint:$('endpointSnap').checked,scale:camera?.scale||1,orthogonal:axis,diagonalOverride:false})}
function setView(v){pendingStart=null;preview=null;gesture=null;view=v;const useGPU=!!(gpu&&v!=='plan');canvas.hidden=useGPU;$('gpuStage').hidden=!useGPU;if(useGPU)gpu.preset(v);camera=null;customCamera=false;$('viewTitle').textContent=names[v];document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));draw();$('hint').textContent=v==='plan'?'2D Plan · snap and create geometry · mouse wheel zoom':'3D · left drag orbit · right drag pan · wheel zoom · Fit for extents · perspective or parallel projection'}
function setTool(t){wallChain=false;chainGroup=null;tool=t;pendingStart=null;gesture=null;preview=null;document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('active',b.dataset.tool===t));if(t!=='select'&&t!=='pan')setView('plan');notice(t+' tool active')}
function refreshTools(){const root=$('tools');root.replaceChildren();for(const t of [...disciplines[discipline],'line','dimension']){let b=document.createElement('button');b.textContent=t[0].toUpperCase()+t.slice(1);b.dataset.tool=t;b.title='Draw '+t+' in Plan view';b.onclick=()=>setTool(t);root.append(b)}document.querySelectorAll('[data-discipline]').forEach(b=>b.classList.toggle('active',b.dataset.discipline===discipline))}
function pruneSelection(){const validIds=new Set(store.doc.objects.map(o=>o.id));if(selected&&!validIds.has(selected))selected=null;for(const id of [...selectedIds])if(!validIds.has(id))selectedIds.delete(id);const multi=$('multiSelectionStatus');if(multi)multi.textContent=selectedIds.size+' selected';}
function sync(){if(gpu){try{latestErrors=gpu.setModel(renderDoc(),{exact:exactReady});if(latestErrors.length)report('B-REP WARNINGS\n'+latestErrors.map(x=>x.id+': '+x.error).join('\n'));}catch(error){exactReady=false;diagnostic('3D model update failed; drawing tools remain available: '+error.message);try{gpu.setModel(renderDoc(),{exact:false})}catch(second){diagnostic(second.message)}}}updateSystemsUI();const o=active();$('objectCount').textContent=store.doc.objects.length+' objects';$('projectName').textContent=store.doc.name;$('propertyPanel').hidden=!o;$('selectionNote').textContent=o?o.name+' · '+o.discipline+' · '+o.id:'Select a model element to edit.';if(o)document.querySelectorAll('[data-prop]').forEach(el=>el.value=o[el.dataset.prop]??'');for(const [rid,type] of [['doorHandRow','door'],['doorSwingRow','door'],['windowTypeRow','window'],['furnitureFamilyRow','furniture']])$(rid).hidden=!o||o.type!==type; if(o)document.querySelectorAll('[data-family]').forEach(el=>el.value=o[el.dataset.family]||({hand:'LH',swingSide:'in',windowType:'fixed',family:'desk'}[el.dataset.family]));const list=$('objectList');list.replaceChildren();for(const item of store.doc.objects){let b=document.createElement('button');b.textContent=item.name+'  ·  '+item.type;b.classList.toggle('active',item.id===selected);b.onclick=()=>{selected=item.id;sync()};list.append(b)}draw()}
document.getElementById('draftingLOD')?.addEventListener('change',e=>{draftingSettings.lod=e.target.value;draw()});
for(const [id,key] of [['autoDim','autoDimensions'],['autoTags','autoTags'],['materialHatches','materialHatches']])document.getElementById(id)?.addEventListener('change',e=>{draftingSettings[key]=e.target.checked;draw()});

// Unified model-linked component catalog. It adds objects through Store transactions,
// so every insertion is undoable, schedulable, and saved in the native document.
let chosenCatalogId='A-WALL-200';
function refreshCatalog(){
 const q=($('catalogSearch').value||'').trim().toLowerCase(),category=$('catalogCategory').value;
 const list=$('catalogResults');list.replaceChildren();
 for(const item of catalogEntries().filter(item=>(category==='all'||item.category===category)&&[item.id,item.label,item.type,item.discipline].join(' ').toLowerCase().includes(q))){
  const b=document.createElement('button');b.type='button';b.textContent=item.label+' · '+item.id;
  b.classList.toggle('active',chosenCatalogId===item.id);b.title=`${item.discipline} · ${item.width} × ${item.depth} × ${item.height} mm`;
  b.onclick=()=>{chosenCatalogId=item.id;refreshCatalog();$('catalogHelp').textContent=b.title};list.append(b);
 }
}
$('catalogSearch').addEventListener('input',refreshCatalog);$('catalogCategory').addEventListener('change',refreshCatalog);refreshCatalog();
$('insertCatalog').onclick=()=>{
 const item=findCatalogItem(chosenCatalogId);if(!item)return notice('Select a catalog entry');
 if(item.type==='door'||item.type==='window'){
  discipline='architecture';refreshTools();setTool(item.type);notice('Hosted opening: click start and end on an existing wall');return;
 }
 const level=$('activeLevel').value||'L1';const objects=createCatalogObjects(item.id,{x:0,y:0,level,z:levelElevation(store.doc,level)});
 store.commit(d=>d.objects.push(...objects));selected=objects[0].id;camera=null;customCamera=false;setView('plan');sync();notice('Inserted '+item.label+' · Select / Move to position');
};
$('catalogTOC').onclick=()=>{
 const rows=catalogTableOfContents(store.doc);report('MODEL ASSEMBLY / BLOCK CONTENTS\n'+(rows.length?rows.map((r,i)=>`${i+1}. ${r.ref} | ${r.name} | ${r.level} | ${r.material} | ${r.id}`).join('\n'):'No catalog components placed'));
};
const editableTypes=new Set(['wall','beam','duct','pipe','road','conduit','line','dimension','panel','mullion','door','window']);
function handleWorldPoints(o){return editableTypes.has(o.type)?[{x:o.x,y:o.y,index:0},{x:o.x2,y:o.y2,index:1}]:[{x:o.x,y:o.y,index:0},{x:o.x2,y:o.y2,index:1}];}
function nearestHandle(o,point){if(!o||!$('showHandles').checked)return null;const pts=handleWorldPoints(o);let closest=null,dist=Infinity;for(const h of pts){const a=screen(h.x,h.y),d=Math.hypot(a.x-point.sx,a.y-point.sy);if(d<dist&&d<=12){dist=d;closest=h}}return closest;}
function moveGizmoCenter(o){return {x:(o.x+o.x2)/2,y:(o.y+o.y2)/2}}
function nearestMoveGizmo(o,p){if(!o||!$('showHandles').checked)return false;const c=moveGizmoCenter(o),q=screen(c.x,c.y);return Math.hypot(p.sx-q.x,p.sy-q.y)<=13}
function renderHandles(){if(view!=='plan'||!$('showHandles').checked||!active()||!camera)return;const o=active(),ctx=canvas.getContext('2d'),dpr=Math.min(2,devicePixelRatio||1);ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);for(const h of handleWorldPoints(o)){const p=screen(h.x,h.y);ctx.fillStyle='#fff';ctx.strokeStyle='#087b87';ctx.lineWidth=2;ctx.fillRect(p.x-5,p.y-5,10,10);ctx.strokeRect(p.x-5,p.y-5,10,10);}const c=moveGizmoCenter(o),q=screen(c.x,c.y);ctx.fillStyle='#fff';ctx.strokeStyle='#167d82';ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x,q.y,7,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(q.x+10,q.y);ctx.lineTo(q.x+27,q.y);ctx.moveTo(q.x+27,q.y);ctx.lineTo(q.x+22,q.y-4);ctx.moveTo(q.x+27,q.y);ctx.lineTo(q.x+22,q.y+4);ctx.moveTo(q.x,q.y-10);ctx.lineTo(q.x,q.y-27);ctx.moveTo(q.x,q.y-27);ctx.lineTo(q.x-4,q.y-22);ctx.moveTo(q.x,q.y-27);ctx.lineTo(q.x+4,q.y-22);ctx.stroke();ctx.beginPath();ctx.strokeStyle='#bd6831';ctx.arc(q.x,q.y,39,-Math.PI*.75,Math.PI*.7);ctx.stroke();ctx.fillStyle='#bd6831';ctx.font='bold 11px Arial';ctx.fillText('↻',q.x+31,q.y-25);ctx.restore()}
$('showHandles').addEventListener('change',draw);

// Rotation uses a model-coordinate pivot; all values are committed in a single undoable transaction.
const rotatePane=document.createElement('section');rotatePane.className='precision-controls';rotatePane.innerHTML=`<h2>Rotate Gizmo / 3D Reference</h2><label>Selection angle (degrees)<input id="rotateAngle" type="number" value="90" step="15"/></label><button type="button" id="rotateSelected">Rotate Selected About Centre</button><p>Selection centre is the rotation pivot; positive angle turns counterclockwise in Plan.</p><label>3D import source units<select id="importModelUnits"><option value="m">Metres</option><option value="mm">Millimetres</option><option value="cm">Centimetres</option><option value="ft">Feet</option><option value="in">Inches</option></select></label><label>Source up axis<select id="importModelUp"><option value="z">Z up</option><option value="y">Y up</option></select></label><label>Imported model multiplier<input id="importModelScale" type="number" min="0.000001" step="0.1" value="1"/></label>`;
(document.querySelector('#showHandles')?.closest('section')||document.querySelector('aside.rail.left')).append(rotatePane);
$('rotateSelected').onclick=()=>{const items=multiActive().length?multiActive():active()?[active()]:[];if(!items.length){notice('Select a model element first');return;}const deg=Number($('rotateAngle').value);if(!Number.isFinite(deg)){notice('Enter a valid angle');return;}const pivot={x:items.reduce((a,o)=>a+(o.x+o.x2)/2,0)/items.length,y:items.reduce((a,o)=>a+(o.y+o.y2)/2,0)/items.length};const updates=new Map(rotateElements(items,deg,pivot).map(o=>[o.id,o]));store.commit(d=>d.objects.forEach(o=>{if(updates.has(o.id))Object.assign(o,updates.get(o.id))}));notice('Rotated '+items.length+' elements · '+deg+'°')};


// User-configurable annotation settings; model measurements remain authoritative.
const settingsBox=document.createElement('section');settingsBox.className='precision-controls';settingsBox.innerHTML=`<h2>Dimension & Annotation Control</h2><label>Global annotation size <input id="globalAnnotationScale" type="range" min="0.65" max="2.2" value="1" step="0.05"></label><output id="annotationScaleValue">100%</output><p>Applies to on-screen labels and spacing, not model size.</p><label>Selected dimension text override <input id="dimensionTextOverride" type="text" placeholder="Auto (measured mm)"></label><label>Selected dimension offset (screen px) <input id="dimensionOffsetPx" type="number" min="8" max="400" value="34"></label><label>Dimension side <select id="dimensionSide"><option value="0">Auto</option><option value="1">Positive</option><option value="-1">Negative</option></select></label><label class="check"><input id="dimensionHidden" type="checkbox"> Suppress selected automatic dimension</label><div class="toolgrid"><button id="applyDimensionOverride" type="button">Apply Selected</button><button id="clearDimensionOverride" type="button">Restore Auto</button></div>`;
(document.querySelector('#autoDim')?.closest('section')||document.querySelector('aside.rail.left')||document.body).after(settingsBox);
$('globalAnnotationScale').addEventListener('input',e=>{draftingSettings.globalScale=Number(e.target.value);$('annotationScaleValue').textContent=Math.round(draftingSettings.globalScale*100)+'%';draw()});
function selectedDimensionSource(){const o=active();return o?.type==='dimension'?o:null}
$('applyDimensionOverride').onclick=()=>{const d=selectedDimensionSource();if(!d){notice('Select a dimension element first');return;}const text=$('dimensionTextOverride').value.trim();const offset=Number($('dimensionOffsetPx').value);if(!Number.isFinite(offset)||offset<8||offset>400){notice('Offset must be 8–400 px');return;}store.commit(doc=>{const obj=doc.objects.find(x=>x.id===d.id);obj.dimensionTextOverride=text;obj.dimensionOffsetPx=offset;obj.dimensionSide=Number($('dimensionSide').value);obj.dimHidden=$('dimensionHidden').checked;});notice('Dimension override applied')};
$('clearDimensionOverride').onclick=()=>{const d=selectedDimensionSource();if(!d)return;store.commit(doc=>{const obj=doc.objects.find(x=>x.id===d.id);delete obj.dimensionTextOverride;delete obj.dimensionOffsetPx;delete obj.dimensionSide;delete obj.dimHidden;});$('dimensionTextOverride').value='';$('dimensionHidden').checked=false;notice('Automatic dimension restored')};
store.subscribe(pruneSelection);store.subscribe(sync);
canvas.addEventListener('pointerdown',e=>{if(!camera)return;canvas.setPointerCapture(e.pointerId);let p=toWorld(e);if(e.button===1||tool==='pan'){gesture={kind:'pan',p,cx:camera.cx,cy:camera.cy};return}if(e.button!==0)return;if(view!=='plan'){notice('Switch to Plan to draw and select geometry');return}if(selectionMode){gesture={kind:'rect',start:{x:p.x,y:p.y},end:{x:p.x,y:p.y},mode:selectionMode};return;}if(curveStart===null&&tool==='curve-wall'){curveStart={x:p.x,y:p.y};notice('Curved wall: click chord end');return;}if(tool==='curve-wall'){const start=curveStart;curveStart=null;try{const rise=Number(prompt('Curved-wall sagitta / rise in mm','600'));const pts=arcWallSegments(start,{x:p.x,y:p.y},rise,16);const group='CW-'+Date.now().toString(36);const objects=pts.slice(1).map((q,i)=>prepareElement(store.doc,element('wall',{x:pts[i].x,y:pts[i].y,x2:q.x,y2:q.y,thickness:Number($('thickness').value)||200,height:Number($('height').value)||3000,level:$('activeLevel').value,chainId:group,curveGroup:group,curveRise:rise})));store.commit(d=>d.objects.push(...objects));setMulti(objects.map(o=>o.id));notice('Curved wall created as '+objects.length+' linked segments')}catch(err){notice(err.message)}return;}if(tool==='select'){const old=active();if(old&&nearestMoveGizmo(old,p)&&!layerLocked(store.doc,old)){gesture={kind:'move',p,original:structuredClone(old),moved:false};return;}const handle=nearestHandle(old,p);if(handle&&!layerLocked(store.doc,old)){gesture={kind:'handle',p,original:structuredClone(old),index:handle.index,moved:false};return;}let o=[...planVisible()].reverse().find(o=>!layerLocked(store.doc,o)&&hit(o,p.x,p.y,Math.max(50,9/camera.scale)));selected=o?.id||null;selectedIds=o?new Set(e.shiftKey?[...selectedIds,o.id]:[o.id]):new Set();sync();if(o&&!layerLocked(store.doc,o)){gesture={kind:'move',p,original:structuredClone(o),moved:false};}return}if(pendingStart){const end=resolvedEnd(pendingStart,{x:p.x,y:p.y},e);const start=pendingStart;pendingStart=null;preview=null;if(Math.hypot(end.x-start.x,end.y-start.y)>=1){let placement;try{placement=['door','window'].includes(tool)?openingOnWall(tool,start,end,visible()):{x:start.x,y:start.y,x2:end.x,y2:end.y,height:Number($('height').value)||3000,thickness:Number($('thickness').value)||200};}catch(err){notice(err.message);report(err.message);return;}const obj=prepareElement(store.doc,applyFamilyDefaults(element(tool,{...placement,level:$('activeLevel').value,z:($('activeLevel').value&&tool!=='door'&&tool!=='window'?levelElevation(store.doc,$('activeLevel').value):placement.z||0),...(wallChain&&tool==='wall'?{chainId:chainGroup}:{})})));store.commit(d=>d.objects.push(obj));selected=obj.id;if(wallChain&&tool==='wall'){pendingStart={x:end.x,y:end.y};$('hint').textContent='Wall polyline continuing · click next corner · Enter to finish';notice('Wall segment added · continue chain');}else notice(obj.type+' created');}draw();return;}gesture={kind:'draw',p,start:pointSnap(p),moved:false};$('snapStatus').textContent='SNAP '+gesture.start.mode.toUpperCase();preview={x:gesture.start.x,y:gesture.start.y,x2:gesture.start.x,y2:gesture.start.y,type:tool};draw()});
canvas.addEventListener('pointermove',e=>{if(!camera)return;let p=toWorld(e);if(pendingStart&&!gesture&&view==='plan'){const q=resolvedEnd(pendingStart,p,e);preview={...pendingStart,x2:q.x,y2:q.y,type:tool};draw();}$('coord').textContent=`X ${Math.round(p.x)} | Y ${Math.round(p.y)} mm`;if(!gesture){if(view==='plan'&&tool==='wall'){$('snapStatus').textContent='SNAP '+pointSnap(p).mode.toUpperCase();}return;}if(gesture.kind==='rect'){gesture.end={x:p.x,y:p.y};draw();return;}if(gesture.kind==='pan'){camera.cx=gesture.cx-(p.sx-gesture.p.sx)/camera.scale;camera.cy=gesture.cy-(p.sy-gesture.p.sy)/camera.scale;customCamera=true}else if(gesture.kind==='draw'){if(Math.hypot(p.sx-gesture.p.sx,p.sy-gesture.p.sy)>4)gesture.moved=true;const end=resolvedEnd(gesture.start,p,e);preview.x2=end.x;preview.y2=end.y;$('snapStatus').textContent='SNAP '+end.mode.toUpperCase()+' · '+Math.round(Math.hypot(end.x-preview.x,end.y-preview.y))+' mm'}else if(gesture.kind==='handle'){if(!shouldStartMove(gesture.p,p))return;gesture.moved=true;const o=active();if(o){const q=pointSnap(p,o.id);if(gesture.index===0){o.x=q.x;o.y=q.y}else{o.x2=q.x;o.y2=q.y}}}else if(gesture.kind==='move'){if(!shouldStartMove(gesture.p,p))return;gesture.moved=true;const o=active();if(o){const resolved=pointSnap({x:gesture.original.x+p.x-gesture.p.x,y:gesture.original.y+p.y-gesture.p.y},gesture.original.id);const ox=resolved.x-gesture.original.x,oy=resolved.y-gesture.original.y;o.x=gesture.original.x+ox;o.x2=gesture.original.x2+ox;o.y=gesture.original.y+oy;o.y2=gesture.original.y2+oy}}draw()});
function finish(){if(!gesture)return;let g=gesture;gesture=null;if(g.kind==='rect'){const ids=idsInRectangle(planVisible().filter(o=>!layerLocked(store.doc,o)),g.start,g.end,g.mode);setMulti(ids);selectionMode=null;notice(ids.length+' objects selected');return;}if(g.kind==='draw'&&preview){const p=preview;if(!g.moved){pendingStart={x:g.start.x,y:g.start.y};$('snapStatus').textContent='START SET · CLICK END POINT';$('hint').textContent='Start placed. Click an endpoint to finish, or Escape to cancel.';return;}preview=null;if(Math.hypot(p.x2-p.x,p.y2-p.y)>=1){let placement;try{placement=['door','window'].includes(tool)?openingOnWall(tool,{x:p.x,y:p.y},{x:p.x2,y:p.y2},visible()):{...p,height:Number($('height').value)||3000,thickness:Number($('thickness').value)||200};}catch(err){notice(err.message);report(err.message);return;}const obj=prepareElement(store.doc,applyFamilyDefaults(element(tool,{...placement,level:$('activeLevel').value,z:($('activeLevel').value&&tool!=='door'&&tool!=='window'?levelElevation(store.doc,$('activeLevel').value):placement.z||0),...(wallChain&&tool==='wall'?{chainId:chainGroup}:{})})));store.commit(d=>d.objects.push(obj));selected=obj.id;sync();if(wallChain&&tool==='wall'){pendingStart={x:p.x2,y:p.y2};notice('Wall segment added · click next corner')}else notice(obj.type+' created')}}else if(g.kind==='handle'&&active()&&g.moved){const modified=structuredClone(active());const before=g.original;Object.assign(active(),before);store.commit(d=>Object.assign(d.objects.find(o=>o.id===before.id),modified));notice('Endpoint/size handle updated')}else if(g.kind==='move'&&active()&&g.moved){const modified=structuredClone(active());const before=g.original;Object.assign(active(),before);store.commit(d=>Object.assign(d.objects.find(o=>o.id===before.id),modified));notice('Move applied')}draw()}
canvas.addEventListener('pointerup',e=>{if(gesture?.kind==='draw'&&preview){const p=toWorld(e),q=resolvedEnd(gesture.start,p,e);preview.x2=q.x;preview.y2=q.y;}finish()});canvas.addEventListener('pointercancel',()=>{gesture=null;preview=null;draw()});
canvas.addEventListener('wheel',e=>{e.preventDefault();if(!camera)return;const bounds=canvas.getBoundingClientRect();camera=zoomAtPointer(camera,{x:e.clientX-bounds.left,y:e.clientY-bounds.top},{width:bounds.width,height:bounds.height},e.deltaY,e.deltaMode);customCamera=true;draw()},{passive:false});
for(const b of document.querySelectorAll('[data-view]'))b.onclick=()=>setView(b.dataset.view);
$('resetCamera')?.addEventListener('click',()=>{if(gpu&&view!=='plan'){gpu.preset(view);notice('Camera orientation reset')}else {camera=null;customCamera=false;draw();notice('Plan camera reset')}});
for(const b of document.querySelectorAll('[data-discipline]'))b.onclick=()=>{discipline=b.dataset.discipline;refreshTools()};
for(const b of document.querySelectorAll('[data-tool]'))b.onclick=()=>setTool(b.dataset.tool);
$('fit').onclick=$('fitView').onclick=()=>{camera=null;customCamera=false;if(gpu&&view!=='plan')gpu.fit();draw()};
$('gridVisible').onchange=e=>store.commit(d=>d.settings.gridVisible=e.target.checked);
$('snap').onchange=e=>store.commit(d=>d.settings.snap=e.target.checked);
$('endpointSnap').onchange=()=>notice('Endpoint snap '+($('endpointSnap').checked?'enabled':'disabled'));
$('orthogonalWalls').onchange=()=>notice('Orthogonal wall lock '+($('orthogonalWalls').checked?'enabled':'disabled'));
$('gridStep').onchange=e=>{const x=Number(e.target.value);if(!Number.isFinite(x)||x<25){notice('Grid interval must be ≥25 mm');return}store.commit(d=>d.settings.grid=x)};
$('thickness').onchange=()=>notice('Thickness preset updated');$('height').onchange=()=>notice('Height preset updated');

function commitTranslate(ids,dx,dy){store.commit(d=>d.objects.filter(o=>ids.includes(o.id)).forEach(o=>translateObject(o,dx,dy)));notice(ids.length+' objects moved');}
function promptDelta(){const dx=Number(prompt('Horizontal offset ΔX (mm)','500')),dy=Number(prompt('Vertical offset ΔY (mm)','0'));return Number.isFinite(dx)&&Number.isFinite(dy)?[dx,dy]:null}
$('crossSelect').onclick=()=>{selectionMode='crossing';setTool('select');selectionMode='crossing';notice('Drag a crossing rectangle: touching objects included')};
$('windowSelect').onclick=()=>{setTool('select');selectionMode='window';notice('Drag a window: fully enclosed objects only')};
$('selectVisible').onclick=()=>{setView('plan');setMulti(planVisible().filter(o=>!layerLocked(store.doc,o)).map(o=>o.id));notice(selectedIds.size+' visible objects selected')};
$('moveGroup').onclick=()=>{const arr=selectedForModify();if(!arr.length)return notice('Select elements first');const delta=promptDelta();if(delta)commitTranslate(arr.map(o=>o.id),...delta)};
$('copyGroup').onclick=()=>{clipboard=selectedForModify().map(o=>structuredClone(o));notice(clipboard.length+' elements copied to app clipboard')};
$('pasteGroup').onclick=()=>{if(!clipboard.length)return notice('Clipboard empty');const delta=promptDelta();if(!delta)return;const copies=clonesOf(clipboard,[delta]);store.commit(d=>d.objects.push(...copies));setMulti(copies.map(o=>o.id));notice(copies.length+' pasted')};
$('mirrorGroup').onclick=()=>{const arr=selectedForModify();if(!arr.length)return notice('Select elements first');const axis=prompt('Mirror across x=constant (vertical) or y=constant (horizontal)?','x');if(!['x','y'].includes(axis))return;const at=Number(prompt('Mirror axis coordinate (mm)','0'));if(!Number.isFinite(at))return;store.commit(d=>d.objects.filter(o=>arr.some(x=>x.id===o.id)).forEach(o=>reflectObject(o,axis,at)));notice(arr.length+' elements mirrored')};
$('arrayGroup').onclick=()=>{const arr=selectedForModify();if(!arr.length)return notice('Select elements first');const rows=Number(prompt('Array rows','2')),cols=Number(prompt('Array columns','3')),dx=Number(prompt('Column spacing (mm)','3000')),dy=Number(prompt('Row spacing (mm)','3000'));try{const offsets=arrayOffsets(rows,cols,dx,dy);const copies=clonesOf(arr,offsets);store.commit(d=>d.objects.push(...copies));setMulti(copies.map(o=>o.id));notice(copies.length+' array objects created')}catch(e){notice(e.message)}};
function applyCorner(type){const arr=selectedForModify().filter(o=>['wall','line','beam'].includes(o.type));if(arr.length!==2)return notice('Select exactly two connected linear objects');const a=arr[0],b=arr[1];if(Math.hypot(a.x2-b.x,a.y2-b.y)>1)return notice('First element end must meet second start');const r=Number(prompt(type==='chamfer'?'Chamfer setback (mm)':'Fillet setback (mm)','300'));try{const points=type==='chamfer'?chamferCorner(a,b,r):roundedCornerPoints(a,b,r,10);const group='CORNER-'+Date.now().toString(36);const extensions=points.slice(1).map((p,i)=>{const fields={...a,x:points[i].x,y:points[i].y,x2:p.x,y2:p.y,chainId:group,hostId:undefined,sourceId:undefined};delete fields.id;return element(a.type,fields)});store.commit(d=>{const aa=d.objects.find(o=>o.id===a.id),bb=d.objects.find(o=>o.id===b.id);aa.x2=points[0].x;aa.y2=points[0].y;bb.x=points.at(-1).x;bb.y=points.at(-1).y;d.objects.push(...extensions)});setMulti(extensions.map(o=>o.id));notice(type+' constructed with '+extensions.length+' connector segment(s)')}catch(e){notice(e.message)}}
$('chamferGroup').onclick=()=>applyCorner('chamfer');$('filletGroup').onclick=()=>applyCorner('fillet');
$('curveWall').onclick=()=>{setTool('curve-wall');notice('Click start, click end, then specify arc rise')};
$('undo').onclick=()=>{if(store.undo()){selected=null;notice('Undo applied')}else notice('Nothing to undo')};
$('redo').onclick=()=>{if(store.redo()){selected=null;notice('Redo applied')}else notice('Nothing to redo')};
$('clearSelection').onclick=()=>{selected=null;selectedIds.clear();sync()};
function forceRedraw(){gesture=null;preview=null;pendingStart=null;camera=null;customCamera=false;sync();if(gpu&&view!=='plan')gpu.resize();notice('Plan and 3D model refreshed');}
$('redrawWorkspace')?.addEventListener('click',forceRedraw);

$('delete').onclick=()=>{const ids=selectedIds.size?[...selectedIds]:selected?[selected]:[];if(!ids.length)return notice('Select an element first');store.commit(d=>{for(const id of ids)removeWithDependents(d,id)});selected=null;selectedIds.clear();gesture=null;preview=null;pendingStart=null;sync();notice(ids.length+' element(s) removed · views refreshed')};
$('duplicate').onclick=()=>{const o=active();if(!o){notice('Select an element first');return}const clone=element(o.type,{...o,id:undefined,x:o.x+500,x2:o.x2+500,y:o.y+500,y2:o.y2+500,name:o.name+' copy'});store.commit(d=>d.objects.push(clone));selected=clone.id;notice('Element duplicated')};
$('applyProps').onclick=()=>{if(!active())return;const id=selected,fields={};document.querySelectorAll('[data-prop]:not([disabled])').forEach(el=>fields[el.dataset.prop]=el.type==='number'?Number(el.value):el.value);if(['x','y','x2','y2','z','height','thickness'].some(k=>!Number.isFinite(fields[k]))){notice('Invalid numeric property');return}document.querySelectorAll('[data-family]').forEach(el=>{if(!el.closest('[hidden]'))fields[el.dataset.family]=el.value});store.commit(d=>{Object.assign(d.objects.find(o=>o.id===id),fields);for(const dim of d.objects.filter(x=>x.type==='dimension'&&x.sourceId===id)){dim.x=fields.x;dim.y=fields.y;dim.x2=fields.x2;dim.y2=fields.y2;}});notice('Properties committed')};
function resetWorkspace({clearReferences=false}={}){
 selected=null;selectedIds.clear();gesture=null;preview=null;pendingStart=null;wallChain=false;chainGroup=null;clipboard=[];moveGroupMode=false;selectionMode=null;curveStart=null;
 if(clearReferences){referencePlans.length=0;gpu?.clearReferences();const input=$('model3DFile');if(input)input.value='';}
 camera=null;customCamera=false;const chain=$('wallChain');chain?.classList.remove('active');
 const status=$('multiSelectionStatus');if(status)status.textContent='0 selected';
}
$('new').onclick=()=>{
 if((store.doc.objects.length||store.doc.underlays?.length||referencePlans.length)&&!confirm('New project? This clears the model, image underlays, and session-only 3D references.'))return;
 resetWorkspace({clearReferences:true});store.startNew(blank());setView('plan');notice('New blank project · references cleared');
};
// 3D mesh interchange: imported meshes are independent scene references (not editable BIM).
// Meshes persist in the current browser session. Save original interchange files separately.
$('import3D').onclick=()=>{if(!gpu){notice('Enable WebGL before importing 3D meshes');return;}$('model3DFile').click()};
$('model3DFile').onchange=async e=>{const files=Array.from(e.target.files||[]);for(const f of files){try{const root=await load3DFile(f);const unit=($('importModelUnits')?.value||'m'),up=($('importModelUp')?.value||'z'),scale=Number($('importModelScale')?.value||1);applyReferenceTransform(root,{unit,up,scale});const info=summarizeModel(root);gpu.addReferenceModel(root,f.name);try{const projection=modelPlanSegments(root);referencePlans.push({...projection,name:f.name,visible:true});}catch(error){report('Plan projection warning: '+error.message)}camera=null;customCamera=false;draw();notice(`Imported ${f.name}: ${info.meshes} meshes`);report(`3D REFERENCE IMPORT\n${f.name}\n${info.meshes} meshes · ${info.triangles} triangles\nGeometry is a scene reference and is not editable parametric BIM. Store the original file separately.`)}catch(error){report('3D IMPORT ERROR: '+f.name+'\n'+error.message);notice('Import failed: '+f.name)}}e.target.value=''};
$('export3D').onclick=()=>{$('modelExportDialog').hidden=false};
$('close3DExport').onclick=()=>{$('modelExportDialog').hidden=true};
$('run3DExport').onclick=async()=>{const b=$('run3DExport');b.disabled=true;try{if(!gpu)throw Error('WebGL viewer unavailable');const format=$('modelExportFormat').value;const root=gpu.exportRoot($('include3DReferences').checked);if(!root.children.length)throw Error('Nothing to export');$('modelExportStatus').textContent='Preparing '+format.toUpperCase()+'…';const result=await export3D(root,format);downloadModel('SUBSTRATE_PRO_Model.'+format,result);$('modelExportStatus').textContent='Mesh export created ('+format.toUpperCase()+')';notice('3D mesh exported')}catch(error){$('modelExportStatus').textContent='Export failed: '+error.message;report('3D EXPORT ERROR\n'+error.stack)}finally{b.disabled=false}};
const underlayManager=attachUnderlayManager({documentModel:()=>store.doc,onCommit:mutation=>store.commit(mutation),draw,notice,$,setPlan:()=>setView('plan')});
window.addEventListener('substrate-underlay-loaded',()=>{if(view==='plan')draw()});
window.__substrateReferencePlans=referencePlans;
$('save').onclick=()=>{download('SUBSTRATE_PRO_Project.substratepro',exportJSON(store.doc),'application/json');notice('Native project downloaded')};
$('open').onclick=()=>$('file').click();$('file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const doc=importJSON(await f.text());resetWorkspace({clearReferences:true});store.startNew(doc);camera=null;customCamera=false;notice('Project opened · '+doc.objects.length+' elements')}catch(err){report('IMPORT ERROR\n'+err.message);notice('Could not open file')}e.target.value=''};
$('exportOrthoSVG').onclick=()=>{const scale=Number(document.getElementById('drawingScale')?.value)||100;for(const viewName of ['front','rear','right','left','iso'])download(`SUBSTRATE_PRO_${viewName.toUpperCase()}_1-${scale}.svg`,technicalViewSVG(renderDoc(),viewName,{scale}),'image/svg+xml');notice('Orthographic and isometric vector views exported');};
$('export').onclick=()=>{download('SUBSTRATE_PRO_Plan.svg',planSVG(renderDoc(),{scale:Number(document.getElementById('drawingScale')?.value)||100}),'image/svg+xml');notice('Plan SVG downloaded')};
$('generateSheet').onclick=()=>{const html=buildSheetHTML(renderDoc(),{standard:$('sheetStandard').value,number:$('sheetNumber').value,title:$('sheetTitle').value,scale:$('sheetScale').value});const blob=new Blob([html],{type:'text/html'}),url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='SUBSTRATE_PRO_'+$('sheetNumber').value.replace(/[^A-Za-z0-9-]/g,'_')+'.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);notice('Construction sheet HTML exported · open and print to PDF')};
$('review').onclick=()=>{const modal=$('reviewModal');modal.hidden=false;requestAnimationFrame(()=>updateReview(modal,renderDoc()))};$('closeReview').onclick=()=>$('reviewModal').hidden=true;
$('printReview').onclick=$('plot').onclick=()=>{if($('reviewModal').hidden){$('review').click()}requestAnimationFrame(()=>{updateReview($('reviewModal'),renderDoc());window.print()})};
$('audit').onclick=()=>{const results=runAudit(store.doc);report(results.length?'VALIDATION WARNINGS\n'+results.join('\n'):'PASS: model structure and basic assembly rules. '+store.doc.objects.length+' elements checked.\nThis is not a regulatory/code compliance certification.');notice('Audit completed')};
$('codeScreen')?.addEventListener('click',()=>{const result=codeScreen(store.doc,{jurisdiction:$('codeJurisdiction').value||'Unspecified',edition:$('codeEdition').value||'Unspecified'});report('BUILDING CODE DATA SCREEN · NOT CERTIFIED\n'+result.checks.map(c=>c.status.toUpperCase()+' | '+c.key+' | '+c.detail).join('\n')+'\n'+result.disclaimer)});
$('connectionReview')?.addEventListener('click',()=>{const r=connectionSchedule(store.doc);report('STRUCTURAL CONNECTION CANDIDATES · ENGINEER REVIEW REQUIRED\n'+r.connections.map(c=>c.id+' | gap '+c.gapMM.toFixed(1)+' mm | '+c.status).join('\n')+'\n'+r.connections.length+' candidates; fasteners/welds/forces NOT DESIGNED')});
$('exportIfcMap')?.addEventListener('click',()=>{download('SUBSTRATE_Editable_IFC_Mapping.json',JSON.stringify(exportEditableMapping(store.doc),null,2),'application/json');notice('Editable mapping JSON exported (NOT an IFC STEP file)')});
$('schedule').onclick=()=>report('ELEMENT QUANTITIES (conceptual)\n'+quantities(store.doc).map(o=>`${o.id} | ${o.type} | ${o.lengthMM} mm | ${o.volumeM3} m³ | ${o.material}`).join('\n'));
$('section').onclick=()=>{const axis=prompt('Cut plane normal axis: x or y','x');if(!['x','y'].includes(axis))return;const at=Number(prompt('Cut plane coordinate (mm)','0'));if(!Number.isFinite(at))return;const cuts=sectionAt(store.doc,axis,at);report('SECTION '+axis.toUpperCase()+' = '+at+' mm\n'+(cuts.length?cuts.map(c=>`${c.type}: ${Math.round(c.from)}–${Math.round(c.to)} mm, Z ${Math.round(c.bottom)}–${Math.round(c.top)} mm`).join('\n'):'No elements intersect the specified plane.'));notice('Section analysis generated')};
let importedIfcState=null;
$('ifcOpen').onclick=()=>$('ifcFile').click();
$('ifcFile').onchange=async event=>{const file=event.target.files?.[0];if(!file)return;try{
  notice('Parsing IFC with web-ifc WASM…');if(!ifcModule)ifcModule=await import('../interoperability/ifc/index.js');const records=await ifcModule.readIfc(file);
  importedIfcState={filename:file.name,revision:store.doc.objects.length,records};
  report('IFC SOURCE IMPORT\n'+records.length+' semantic elements identified.\n'+records.slice(0,90).map(r=>r.expressID+' | '+r.ifcType+' | '+r.name).join('\n')+'\n\nImported IFC remains a SOURCE reference; its geometry has not been converted into editable SUBSTRATE solids. Export original file only.');
  notice('IFC parsed: '+records.length+' elements');
}catch(error){report('IFC IMPORT ERROR\n'+String(error?.stack||error));notice('IFC import failed')}event.target.value=''};
$('ifcSave').onclick=()=>{if(!ifcModule?.originalIfcAvailable()){notice('Import an IFC file first');return}
  if(!confirm('Export the original, unmodified IFC file? SUBSTRATE geometry edits are NOT written into this file.'))return;
  const bytes=ifcModule.exportUnmodifiedIfc();const a=document.createElement('a'),url=URL.createObjectURL(new Blob([bytes],{type:'application/x-step'}));a.href=url;a.download='SUBSTRATE_original_unmodified.ifc';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  notice('Unmodified source IFC exported');};
$('help').onclick=()=>report('SUBSTRATE PRO — QUICK GUIDE\n1. Choose Architecture, Structure, MEP or Civil tools.\n2. Select an element type; the viewport switches to Plan.\n3. Drag to create a component, click it to select, drag again to move.\n4. Edit right-side properties, then Apply.\n5. Use 3D Iso / elevations to review a shared model.\n6. Print the 4 Ortho Review sheet, or export SVG / save native project.\n\nWall Polyline creates sequential intelligent wall elements. Endpoint, midpoint and intersection snaps are available. Analyze Joins reports centerline connections. Dimension Selected adds an associative axis dimension.\nConceptual parametric solids; NOT a certified construction-document, building-code, or exact connection-detail system.');
function stopWallChain(){wallChain=false;chainGroup=null;pendingStart=null;preview=null;$('wallChain').classList.remove('active');$('hint').textContent='Wall polyline finished. Select any wall to edit dimensions.';draw()}
$('wallChain').onclick=()=>{tool='wall';setView('plan');wallChain=true;chainGroup='CHAIN-'+Date.now().toString(36);pendingStart=null;$('wallChain').classList.add('active');$('hint').textContent='Wall Polyline: click start, then consecutive vertices · Enter to finish';notice('Continuous wall polyline enabled')};
$('finishChain').onclick=()=>{stopWallChain();notice('Wall chain finished')};
$('autoJoin').onclick=()=>{const {pairs,issues}=wallMiterPolygons(visible());const joins=wallJoinReport(visible(),Math.max(2,(camera?.scale?8/camera.scale:10)));report('MITERED CHAIN JOINS '+pairs.length+'; issues: '+issues.length+'\n'+issues.map(x=>x.reason).join('\n')+'\n'+'WALL CONNECTIONS (centerline analysis)\n'+(joins.length?joins.map(j=>`${j.kind.toUpperCase()}  ${j.wallA} / ${j.wallB} @ ${Math.round(j.point.x)}, ${Math.round(j.point.y)} mm`).join('\n'):'No joined centerlines found. Endpoints can be joined using snap.'));notice(`${joins.length} wall connections analyzed`)};
$('dimensionSelected').onclick=()=>{const o=active();if(!o){notice('Select a linear element first');return;}if(Math.hypot(o.x2-o.x,o.y2-o.y)<1){notice('This element has no measurable axis');return;}const item=element('dimension',{name:'Dimension '+o.name,discipline:'documentation',x:o.x,y:o.y,x2:o.x2,y2:o.y2,z:o.z,height:0,thickness:1,sourceId:o.id});store.commit(d=>d.objects.push(item));selected=item.id;setView('plan');notice('Associative axis dimension added')};
window.addEventListener('keydown',e=>{if(e.key==='Escape'){gesture=null;pendingStart=null;preview=null;wallChain=false;$('wallChain').classList.remove('active');draw();notice('Drawing cancelled')}if(e.key==='Enter'&&wallChain){stopWallChain();notice('Wall polyline completed')}if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName))return;if(e.key==='Delete')$('delete').click();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();$('undo').click()}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();$('redo').click()}});
window.addEventListener('error',e=>report('RUNTIME ERROR: '+e.message));window.addEventListener('unhandledrejection',e=>report('ASYNC ERROR: '+e.reason));
new ResizeObserver(()=>draw()).observe(canvas);
// Essential controls are functional independently of external 3D / IFC libraries.
// GPU and exact B-rep are opt-in; failure leaves 2D/isometric projections available.
async function enableWebGL(){
 if(gpu)return true;
 try{notice('Starting GPU viewport…');const {GPUViewer}=await import('../render-3d/webgl.js');
  gpu=new GPUViewer($('gpuStage'),{onSelect:id=>{selected=id;sync()}});gpu.setVisualStyle(visualization.style);gpu.setAO(visualization.ao);
  const errors=gpu.setModel(store.doc);gpu.fit();setView(view);setEngineStatus('WebGL ACTIVE · Parametric mesh preview · Exact B-rep OFF');
  if(errors.length)report('WEBGL WARNINGS\n'+errors.map(e=>e.error).join('\n'));
  notice('WebGL orbit / pan / zoom active');return true;
 }catch(e){if(gpu){gpu.dispose();gpu=null;}setEngineStatus('WebGL FAILED · 2D projection mode');report('WEBGL INITIALIZATION FAILED\n'+String(e?.stack||e)+'\nIf hosting source files directly, verify the Three.js CDN is reachable. For production, deploy the Vite dist/ output using GitHub Actions, not source files.');setView(view);return false;}
}
async function enableExactGPU(){
 if(!(await enableWebGL()))return false;
 if(exactReady){notice('Exact B-rep already active');return true;}
 try{setEngineStatus('OpenCascade WASM initializing…');notice('Running exact solid and Boolean verification…');
  // GitHub Pages raw-source deployment cannot resolve npm specifiers.
  // Never mark exact mode active if this is an unbuilt source deployment.
  if (document.querySelector('script[type=module][src*=\"src/app/main.js\"]')) {
    throw Error('Uncompiled source deployment detected. Configure GitHub Pages to use GitHub Actions and publish Vite dist/, not the repository root.');
  }
  const {initializeBrep}=await import('../core/geometry/brep/index.js');
  const test=await initializeBrep();
  exactReady=true;const warnings=gpu.setModel(store.doc,{exact:true});gpu.fit();setView(view);
  setEngineStatus(warnings.length?`OCCT SELF-TEST PASSED · ${warnings.length} elements not exact (preview incomplete)`:`EXACT OCCT ACTIVE · box ${test.volume} mm³ · cut ${test.cutVolume} mm³`);
  if(warnings.length)report('EXACT B-REP MODEL WARNINGS\n'+warnings.map(x=>x.id+': '+x.error).join('\n'));
  notice('OpenCascade verified · WebGL active');return true;
 }catch(e){exactReady=false;gpu.setModel(renderDoc(),{exact:false});setView(view);
  setEngineStatus('WebGL ACTIVE · Exact kernel FAILED (mesh preview only)');report('EXACT OPEN CASCADE FAILURE\n'+String(e?.stack||e)+'\nWebGL remains functional without falsely claiming exact Booleans.');notice('Exact kernel unavailable · WebGL stays active');return false;}
}
const advancedButton=document.createElement('button');
advancedButton.id='enableGPU';advancedButton.textContent='Enable Exact 3D';advancedButton.title='Exact B-rep requires a successfully compiled Vite build and passing runtime verification. The normal Three.js viewer can load independently.';
document.querySelector('header nav').append(advancedButton);
advancedButton.addEventListener('click',enableExactGPU);
window.addEventListener('error',event=>{if(event.message)report('RUNTIME ERROR: '+event.message)});
const quick=document.createElement('button');quick.id='sampleModel';quick.textContent='Load Sample';quick.title='Create a sample AEC assembly for verifying drawing, views and schedules';
$('tools').before(quick);
quick.onclick=()=>{
  const samples=[
    element('slab',{name:'Foundation slab',x:-2500,y:-1500,x2:3500,y2:2500,z:-250,height:250,material:'Concrete'}),
    element('wall',{name:'North wall',x:-2500,y:2500,x2:3500,y2:2500,z:0,height:3000,thickness:200}),
    element('wall',{name:'West wall',x:-2500,y:-1500,x2:-2500,y2:2500,z:0,height:3000,thickness:200}),
    element('column',{name:'Steel column',x:500,y:300,x2:850,y2:650,z:0,height:3200,thickness:350,material:'Steel'}),
    element('beam',{name:'Roof beam',x:-2000,y:1000,x2:3000,y2:1000,z:2800,height:300,thickness:250,material:'Steel'})
  ];
  store.commit(d=>d.objects.push(...samples));selected=samples[0].id;camera=null;customCamera=false;sync();setView('plan');notice('Sample AEC model created');
};

function updateSystemsUI(){
 ensureSystems(store.doc);const level=$('activeLevel');const chosen=level.value||'L1';level.replaceChildren();for(const l of store.doc.levels){const op=document.createElement('option');op.value=l.id;op.textContent=`${l.name} · ${l.elevation} mm`;level.append(op)}level.value=store.doc.levels.some(l=>l.id===chosen)?chosen:store.doc.levels[0].id;
 const area=$('layerList');area.replaceChildren();for(const layer of store.doc.layers){const row=document.createElement('div');row.style.cssText='display:flex;gap:5px;align-items:center;justify-content:space-between;padding:4px 0';const name=document.createElement('span');name.textContent=layer.name;name.style.cssText='font-size:11px;flex:1';const vis=document.createElement('input');vis.type='checkbox';vis.checked=layer.visible!==false;vis.title='Layer visible';vis.onchange=()=>store.commit(d=>{d.layers.find(x=>x.id===layer.id).visible=vis.checked});const lock=document.createElement('input');lock.type='checkbox';lock.checked=!!layer.locked;lock.title='Layer locked';lock.onchange=()=>store.commit(d=>{d.layers.find(x=>x.id===layer.id).locked=lock.checked});row.append(vis,name,lock);area.append(row)}
}
function sysInputs(){const n=id=>Number($(id).value)||0;const spacing=n('baySize'),nx=n('baysX'),ny=n('baysY');return {spacing,nx,ny,width:n('envelopeWidth'),depth:n('envelopeDepth'),height:n('systemHeight'),level:$('activeLevel').value}}
function sysRun(label,act){try{let output;store.commit(d=>{ensureSystems(d);output=act(d)});notice(label);return output;}catch(e){report('BUILDING SYSTEMS: '+e.message);notice(e.message);return null}}
$('addLevel').onclick=()=>{const i=sysInputs(),name=prompt('Level name','Level '+(store.doc.levels.length+1));if(name===null)return;const elevation=Number(prompt('Elevation (mm)',String(Math.max(...store.doc.levels.map(l=>l.elevation))+i.height)));if(!Number.isFinite(elevation))return;const level=sysRun('Level added',d=>addLevel(d,{name,elevation,height:i.height}));if(level)$('activeLevel').value=level.id;};
$('createGrids').onclick=()=>{const i=sysInputs();sysRun('Parametric grid created',d=>gridArray(d,{spacingX:i.spacing,spacingY:i.spacing,baysX:i.nx,baysY:i.ny}));};
$('makeRoof').onclick=()=>{const i=sysInputs();sysRun('Roof envelope added',d=>d.objects.push(makeRoof(d,{x:0,y:0,x2:i.width,y2:i.depth,level:i.level,kind:$('roofType').value,thickness:200})));};
$('makeRoom').onclick=()=>{const i=sysInputs(),name=prompt('Room name','Room '+(store.doc.objects.filter(o=>o.type==='room').length+1));if(name===null)return;sysRun('Room object added',d=>d.objects.push(makeRoom(d,{x:0,y:0,x2:i.width,y2:i.depth,level:i.level,name,clearHeight:i.height})));};
$('makeFacade').onclick=()=>{const i=sysInputs();sysRun('Facade panels and mullions added',d=>d.objects.push(...makeFacade(d,{x:0,y:0,x2:i.width,y2:0,level:i.level,height:i.height,bays:i.nx})));};
$('makeFrame').onclick=()=>{const i=sysInputs();sysRun('Structural frame populated',d=>d.objects.push(...makeFraming(d,{x:0,y:0,x2:i.spacing*i.nx,y2:i.spacing*i.ny,baysX:i.nx,baysY:i.ny,level:i.level,height:i.height})));};
$('buildingSchedules').onclick=()=>{const s=schedules(store.doc);report('BUILDING SYSTEMS SCHEDULE · CONCEPTUAL\n'+s.counts.map(x=>x.type+' : '+x.count).join('\n')+'\n\nLEVELS\n'+s.levels.map(x=>x.id+' '+x.name+' '+x.elevation+' mm').join('\n')+'\n\nROOMS\n'+s.rooms.map(x=>x.name+' · '+x.level+' · '+x.areaM2+' m²').join('\n')+'\n\nSTRUCTURAL FRAMING\n'+s.frames.map(x=>x.type+' · '+x.level+' · '+x.sectionMM+' mm').join('\n')+'\n\nFACADE ITEMS: '+s.facade.length);};
$('addLayer').onclick=()=>{const name=prompt('Layer name','A-DETAIL');if(!name)return;sysRun('Layer created',d=>{const id=name.toUpperCase().replace(/[^A-Z0-9-]/g,'-');if(d.layers.some(l=>l.id===id))throw Error('Layer ID already exists');d.layers.push({id,name,visible:true,locked:false})});};
$('assignLayer').onclick=()=>{const o=active();if(!o){notice('Select element to assign layer');return}const id=prompt('Target layer ID\n'+store.doc.layers.map(l=>l.id).join(', '),o.layer||'A-WALL');if(!id)return;if(!store.doc.layers.some(l=>l.id===id)){notice('Unknown layer ID');return}sysRun('Element assigned to layer',d=>{const x=d.objects.find(e=>e.id===o.id);if(x)x.layer=id;});};

refreshTools();setView('plan');sync();$('hint').textContent='Choose Wall, Slab or Column on the left, then CLICK + DRAG in this Plan canvas. Use 3D Iso to review.';
window.__substrate={store,setView,setTool,draw,enableWebGL,enableExactGPU};

// GPU viewer starts independently; exact kernel remains explicitly opt-in.
requestAnimationFrame(()=>enableWebGL());


// Workflow navigation is a set of actionable controllers, never decorative labels.
// All actions are routed through existing application commands and the shared Store.
const workflowSpec={
 project:{description:'Create a project, open an existing model, or save a native SUBSTRATE file.',actions:[['New project','new'],['Open project','open'],['Save project','save'],['Load example','sampleModel']]},
 model:{description:'Create or modify coordinated architecture, structure and MEP objects in Plan, then inspect in 3D.',actions:[['Plan / Draw','view:plan'],['3D Isometric','view:iso'],['Wall','tool:wall'],['Slab','tool:slab'],['Select / Move','tool:select'],['Fit model','fit']]},
 detail:{description:'Inspect sections, material properties and calculated conceptual component quantities.',actions:[['Cut section','section'],['Element quantities','schedule'],['Select element','tool:select'],['Show properties','focus:propertyPanel']]},
 annotate:{description:'Create linework or dimensions in Plan and export the drawing as SVG.',actions:[['Dimension','tool:dimension'],['Line','tool:line'],['Plan view','view:plan'],['Export plan SVG','export']]},
 review:{description:'Review the coordinated model, run validation and generate an orthographic sheet.',actions:[['4 ortho sheet','review'],['Run model audit','audit'],['3D Iso','view:iso'],['Front','view:front'],['Right','view:right']]},
 publish:{description:'Save the project, export SVG, or print a review sheet to PDF. IFC export currently preserves only the original imported IFC.',actions:[['Save native model','save'],['Export SVG','export'],['Print / PDF','plot'],['Export original IFC','ifcSave']]}
};
const workflowPanel=$('workflowPanel');let currentStage=null;
function stageAction(route){
 if(route.startsWith('view:')){setView(route.slice(5));workflowPanel.hidden=true;return;}
 if(route.startsWith('tool:')){const next=route.slice(5);if(!['select','pan','line','dimension'].includes(next)&&!disciplines[discipline].includes(next)){
  const match=Object.entries(disciplines).find(([,tools])=>tools.includes(next));if(match){discipline=match[0];refreshTools()}
 }setTool(next);workflowPanel.hidden=true;return;}
 if(route.startsWith('focus:')){const el=$(route.slice(6));el?.scrollIntoView({behavior:'smooth',block:'nearest'});workflowPanel.hidden=true;notice('Select an element to edit its properties');return;}
 const control=$(route);if(!control){notice('Command unavailable: '+route);return;}workflowPanel.hidden=true;control.click();
}
function openWorkflow(stage){
 const spec=workflowSpec[stage];if(!spec)return;
 if(stage===currentStage&&!workflowPanel.hidden){workflowPanel.hidden=true;currentStage=null;}else{
  currentStage=stage;workflowPanel.hidden=false;$('workflowPanelTitle').textContent=stage.toUpperCase()+' WORKFLOW';$('workflowPanelDescription').textContent=spec.description;
  const area=$('workflowPanelActions');area.replaceChildren();spec.actions.forEach(([label,route])=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=()=>stageAction(route);area.append(b)});
 }
 document.querySelectorAll('#workflowNav [data-stage]').forEach(b=>{const on=b.dataset.stage===currentStage&&!workflowPanel.hidden;b.classList.toggle('active',on);b.setAttribute('aria-expanded',String(on))});
}
document.querySelectorAll('#workflowNav [data-stage]').forEach(b=>{b.setAttribute('aria-controls','workflowPanel');b.setAttribute('aria-expanded','false');b.addEventListener('click',()=>openWorkflow(b.dataset.stage))});
$('closeWorkflow').addEventListener('click',()=>{workflowPanel.hidden=true;currentStage=null;document.querySelectorAll('#workflowNav button').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-expanded','false')})});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!workflowPanel.hidden)$('closeWorkflow').click()});
window.__substrate.openWorkflow=openWorkflow;

// Construction sequence coordinator: project datums -> structural frame -> architectural enclosure -> services -> site.
const hierarchyPanel=document.getElementById('constructionHierarchy');
if(hierarchyPanel){
 const step=document.getElementById('constructionStage'),gridSnap=document.getElementById('gridIntersectionSnap');
 STAGES.forEach(s=>{const op=document.createElement('option');op.value=s.id;op.textContent=s.label;step.append(op)});
 const restore=()=>{ensureHierarchy(store.doc);step.value=store.doc.construction.activeStage||'datum';gridSnap.checked=store.doc.construction.gridSnap!==false;};
 restore();
 step.onchange=()=>store.commit(d=>{ensureHierarchy(d);d.construction.activeStage=step.value});
 gridSnap.onchange=()=>store.commit(d=>{ensureHierarchy(d);d.construction.gridSnap=gridSnap.checked});
 const run=(caption,fn)=>{try{store.commit(d=>{ensureHierarchy(d);fn(d)});notice(caption);draw()}catch(e){report('COORDINATION: '+e.message);notice(e.message)}};
 document.getElementById('gridFoundation').onclick=()=>run('Grid pad foundations created',d=>d.objects.push(...makeGridFoundation(d,{level:document.getElementById('activeLevel').value})));
 document.getElementById('gridFraming').onclick=()=>run('Grid-aligned framing created',d=>d.objects.push(...makeGridFrame(d,{level:document.getElementById('activeLevel').value})));
 document.getElementById('gridSlab').onclick=()=>run('Grid-aligned slab created',d=>d.objects.push(makeGridSlab(d,{level:document.getElementById('activeLevel').value})));
 document.getElementById('coordinationAudit').onclick=()=>{const c=coordinationReport(store.doc);report('BUILDING CONSTRUCTION HIERARCHY\n'+c.byStage.map(s=>s.title+' — '+s.count+' elements').join('\n')+'\n\nGRID NODES: '+c.gridNodes+'\nLEVELS: '+c.levels.length+'\n\nCOORDINATION ISSUES\n'+(c.issues.map(i=>i.severity.toUpperCase()+' · '+i.code+' · '+i.message).join('\n')||'No issues found in implemented checks')+'\n\nThis is a model-data audit, not engineering or regulatory certification.');};
 const oldNew=document.getElementById('new');oldNew?.addEventListener('click',()=>queueMicrotask(restore));
}

// Section detail camera is independent of the main BIM renderer.
installDetailCamera({canvas,getCamera:()=>camera,toWorld,getDoc:()=>renderDoc(),notice,setView});

// Live document-coordination workspace; updates on committed model transactions.
const auditSection=document.createElement('section');auditSection.className='drawingAuditPanel';
auditSection.innerHTML=`<h2>Live Drawing Auditor</h2><p>Connection, layer, level, dimension and discipline review. Screening only; no certified approval.</p><label class="check"><input type="checkbox" id="auditLive" checked> Live review on model edits</label><div class="toolgrid"><button type="button" id="auditNow">Audit Drawing</button><button type="button" id="auditRegister">Drawing Register</button><button type="button" id="auditExport">Export QA Report</button></div><p id="auditSummary" aria-live="polite">No drawing audit yet.</p><div id="auditIssueList" class="auditIssueList"></div>`;
(document.querySelector('.rail.right')||document.querySelector('.rail.left')||document.querySelector('main')).append(auditSection);
let lastAudit=null,lastRegister=null,auditHandle=null;
function refreshDrawingAudit(){try{const result=auditDrawing(store.doc);lastAudit=result;lastRegister=drawingRegister(store.doc,result);$('auditSummary').textContent=`${result.checked} objects · ${result.counts.error} errors · ${result.counts.warning} warnings · ${result.counts.info} notices`;const list=$('auditIssueList');list.replaceChildren();for(const finding of result.issues.slice(0,90)){const b=document.createElement('button');b.type='button';b.className='auditFinding';b.textContent=`${finding.severity.toUpperCase()} · ${finding.code} · ${finding.message}`;b.title='Select associated object and inspect in Plan';b.onclick=()=>{const id=finding.ids.find(id=>store.doc.objects.some(o=>o.id===id));if(!id)return;selected=id;selectedIds=new Set([id]);setView('plan');sync();};list.append(b)}if(result.issues.length>90){const note=document.createElement('p');note.textContent=`${result.issues.length-90} additional findings omitted from panel; export for all.`;list.append(note)}}catch(e){$('auditSummary').textContent='Audit error: '+e.message}}
$('auditNow').onclick=refreshDrawingAudit;
$('auditRegister').onclick=()=>{if(!lastAudit)refreshDrawingAudit();report(issueReportText(lastAudit,lastRegister));notice('Drawing register shown in report panel')};
$('auditExport').onclick=()=>{refreshDrawingAudit();const out=issueReportText(lastAudit,lastRegister);download('SUBSTRATE_PRO_Drawing_Audit.txt',out,'text/plain;charset=utf-8')};
store.subscribe(()=>{if($('auditLive').checked){if(auditHandle)clearTimeout(auditHandle);auditHandle=setTimeout(refreshDrawingAudit,240)}});
refreshDrawingAudit();
