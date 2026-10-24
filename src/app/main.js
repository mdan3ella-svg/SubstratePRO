// Optional engines must never prevent core controls from binding.
let ifcModule=null;
import{blank,element}from'../core/document-model/index.js';
import{Store}from'../core/transactions/index.js';
import{hit,project,projectedBounds}from'../core/geometry/index.js';
import{snapPoint,wallEnd}from'../core/geometry/snapping.js';
import{openingOnWall}from'../core/geometry/openings.js';
import{render,makeCamera}from'../render-2d/index.js';
import{updateReview}from'../presentation/index.js';
import{runAudit}from'../audit/index.js';
import{quantities}from'../detailcore/assembly-solver/index.js';
import{sectionAt}from'../detailcore/section-engine/index.js';
import{removeWithDependents}from'../core/dependencies/index.js';
import{importJSON,exportJSON,download}from'../interoperability/index.js';
import{planSVG}from'../plot/index.js';
import{tools as architecture}from'../disciplines/architecture/index.js';
import{tools as structure}from'../disciplines/structure/index.js';
import{tools as mechanical}from'../disciplines/mechanical/index.js';
import{tools as plumbing}from'../disciplines/plumbing/index.js';
import{tools as electrical}from'../disciplines/electrical/index.js';
import{tools as civil}from'../disciplines/civil/index.js';
const $=id=>document.getElementById(id),store=new Store(),canvas=$('stage'),names={iso:'3D Model Workspace',plan:'2D Plan & Drafting',front:'Front Orthographic',right:'Right Orthographic',rear:'Rear Orthographic',left:'Left Orthographic'};
const disciplines={architecture,structure,mechanical,plumbing,electrical,civil};let discipline='architecture',tool='select',view='plan',selected=null,gesture=null,preview=null,camera=null,customCamera=false;
let gpu=null,exactReady=false,latestErrors=[],pendingStart=null;
const diagnostic=msg=>{console.error('[SUBSTRATE]',msg);report(String(msg));};
const setEngineStatus=msg=>{const el=$("engineStatus");if(el)el.textContent=msg;};
const visible=()=>store.doc.objects.filter(o=>o.visible!==false);const active=()=>store.doc.objects.find(o=>o.id===selected);
function notice(msg){$('status').textContent=msg;const el=$('toast');el.textContent=msg;el.style.display='block';clearTimeout(notice.timer);notice.timer=setTimeout(()=>el.style.display='none',2400)}
function report(txt){$('report').textContent=txt}
function draw(){if(gpu && view!=='plan'){gpu.setGrid(store.doc.settings.gridVisible);return;}if(!canvas.clientWidth||!canvas.clientHeight)return;if(!camera||!customCamera)camera=makeCamera(visible(),view,canvas.clientWidth,canvas.clientHeight);render(canvas,store.doc,view,{camera,selected});if(preview&&view==='plan'){const c=canvas.getContext('2d'),d=Math.min(2,devicePixelRatio||1),w=canvas.clientWidth,h=canvas.clientHeight; c.setTransform(d,0,0,d,0,0);let a=screen(preview.x,preview.y),b=screen(preview.x2,preview.y2);c.save();c.strokeStyle='#16a092';c.lineWidth=2;c.setLineDash([6,4]);c.strokeRect(Math.min(a.x,b.x),Math.min(a.y,b.y),Math.abs(a.x-b.x),Math.abs(a.y-b.y));c.restore()}}
function screen(x,y){const p=project({x,y,z:0},'plan');return{x:(p.x-camera.cx)*camera.scale+canvas.clientWidth/2,y:(p.y-camera.cy)*camera.scale+canvas.clientHeight/2}}
function toWorld(e){let b=canvas.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;return{x:(x-b.width/2)/camera.scale+camera.cx,y:-((y-b.height/2)/camera.scale+camera.cy),sx:x,sy:y}}
function pointSnap(p,excludeId=null){return snapPoint(p,{objects:visible(),step:store.doc.settings.grid,grid:store.doc.settings.snap,endpoint:$('endpointSnap').checked,scale:camera?.scale||1,excludeId})}
function resolvedEnd(start,p,e){if(tool!=='wall')return pointSnap(p);const axis=$('orthogonalWalls').checked&&!e.shiftKey;const snapped=axis?p:pointSnap(p);return wallEnd(start,snapped,{objects:visible(),step:store.doc.settings.grid,grid:store.doc.settings.snap,endpoint:$('endpointSnap').checked,scale:camera?.scale||1,orthogonal:axis,diagonalOverride:false})}
function setView(v){pendingStart=null;preview=null;gesture=null;view=v;const useGPU=!!(gpu&&v!=='plan');canvas.hidden=useGPU;$('gpuStage').hidden=!useGPU;if(useGPU)gpu.preset(v);camera=null;customCamera=false;$('viewTitle').textContent=names[v];document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));draw();$('hint').textContent=v==='plan'?'Walls: endpoint/grid snap · orthogonal lock ON · hold Shift for diagonal · mouse wheel zoom':'Model remains shared across projections · Choose Plan to draw or edit elements'}
function setTool(t){tool=t;pendingStart=null;gesture=null;preview=null;document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('active',b.dataset.tool===t));if(t!=='select'&&t!=='pan')setView('plan');notice(t+' tool active')}
function refreshTools(){const root=$('tools');root.replaceChildren();for(const t of [...disciplines[discipline],'line','dimension']){let b=document.createElement('button');b.textContent=t[0].toUpperCase()+t.slice(1);b.dataset.tool=t;b.title='Draw '+t+' in Plan view';b.onclick=()=>setTool(t);root.append(b)}document.querySelectorAll('[data-discipline]').forEach(b=>b.classList.toggle('active',b.dataset.discipline===discipline))}
function sync(){if(gpu){try{latestErrors=gpu.setModel(store.doc,{exact:exactReady});if(latestErrors.length)report('B-REP WARNINGS\n'+latestErrors.map(x=>x.id+': '+x.error).join('\n'));}catch(error){exactReady=false;diagnostic('3D model update failed; drawing tools remain available: '+error.message);try{gpu.setModel(store.doc,{exact:false})}catch(second){diagnostic(second.message)}}}const o=active();$('objectCount').textContent=store.doc.objects.length+' objects';$('projectName').textContent=store.doc.name;$('propertyPanel').hidden=!o;$('selectionNote').textContent=o?o.name+' · '+o.discipline+' · '+o.id:'Select a model element to edit.';if(o)document.querySelectorAll('[data-prop]').forEach(el=>el.value=o[el.dataset.prop]??'');const list=$('objectList');list.replaceChildren();for(const item of store.doc.objects){let b=document.createElement('button');b.textContent=item.name+'  ·  '+item.type;b.classList.toggle('active',item.id===selected);b.onclick=()=>{selected=item.id;sync()};list.append(b)}draw()}
store.subscribe(sync);
canvas.addEventListener('pointerdown',e=>{if(!camera)return;canvas.setPointerCapture(e.pointerId);let p=toWorld(e);if(e.button===1||tool==='pan'){gesture={kind:'pan',p,cx:camera.cx,cy:camera.cy};return}if(e.button!==0)return;if(view!=='plan'){notice('Switch to Plan to draw and select geometry');return}if(tool==='select'){let o=[...visible()].reverse().find(o=>hit(o,p.x,p.y,Math.max(50,9/camera.scale)));selected=o?.id||null;sync();if(o){gesture={kind:'move',p,original:structuredClone(o)};}return}if(pendingStart){const end=resolvedEnd(pendingStart,{x:p.x,y:p.y},e);const start=pendingStart;pendingStart=null;preview=null;if(Math.hypot(end.x-start.x,end.y-start.y)>=1){let placement;try{placement=['door','window'].includes(tool)?openingOnWall(tool,start,end,visible()):{x:start.x,y:start.y,x2:end.x,y2:end.y,height:Number($('height').value)||3000,thickness:Number($('thickness').value)||200};}catch(err){notice(err.message);report(err.message);return;}const obj=element(tool,placement);store.commit(d=>d.objects.push(obj));selected=obj.id;notice(obj.type+' created');}draw();return;}gesture={kind:'draw',p,start:pointSnap(p),moved:false};$('snapStatus').textContent='SNAP '+gesture.start.mode.toUpperCase();preview={x:gesture.start.x,y:gesture.start.y,x2:gesture.start.x,y2:gesture.start.y,type:tool};draw()});
canvas.addEventListener('pointermove',e=>{if(!camera)return;let p=toWorld(e);if(pendingStart&&!gesture&&view==='plan'){const q=resolvedEnd(pendingStart,p,e);preview={...pendingStart,x2:q.x,y2:q.y,type:tool};draw();}$('coord').textContent=`X ${Math.round(p.x)} | Y ${Math.round(p.y)} mm`;if(!gesture){if(view==='plan'&&tool==='wall'){$('snapStatus').textContent='SNAP '+pointSnap(p).mode.toUpperCase();}return;}if(gesture.kind==='pan'){camera.cx=gesture.cx-(p.sx-gesture.p.sx)/camera.scale;camera.cy=gesture.cy-(p.sy-gesture.p.sy)/camera.scale;customCamera=true}else if(gesture.kind==='draw'){if(Math.hypot(p.sx-gesture.p.sx,p.sy-gesture.p.sy)>4)gesture.moved=true;const end=resolvedEnd(gesture.start,p,e);preview.x2=end.x;preview.y2=end.y;$('snapStatus').textContent='SNAP '+end.mode.toUpperCase()+' · '+Math.round(Math.hypot(end.x-preview.x,end.y-preview.y))+' mm'}else if(gesture.kind==='move'){const o=active();if(o){const resolved=pointSnap({x:gesture.original.x+p.x-gesture.p.x,y:gesture.original.y+p.y-gesture.p.y},gesture.original.id);const ox=resolved.x-gesture.original.x,oy=resolved.y-gesture.original.y;o.x=gesture.original.x+ox;o.x2=gesture.original.x2+ox;o.y=gesture.original.y+oy;o.y2=gesture.original.y2+oy}}draw()});
function finish(){if(!gesture)return;let g=gesture;gesture=null;if(g.kind==='draw'&&preview){const p=preview;if(!g.moved){pendingStart={x:g.start.x,y:g.start.y};$('snapStatus').textContent='START SET · CLICK END POINT';$('hint').textContent='Start placed. Click an endpoint to finish, or Escape to cancel.';return;}preview=null;if(Math.hypot(p.x2-p.x,p.y2-p.y)>=1){let placement;try{placement=['door','window'].includes(tool)?openingOnWall(tool,{x:p.x,y:p.y},{x:p.x2,y:p.y2},visible()):{...p,height:Number($('height').value)||3000,thickness:Number($('thickness').value)||200};}catch(err){notice(err.message);report(err.message);return;}const obj=element(tool,placement);store.commit(d=>d.objects.push(obj));selected=obj.id;sync();notice(obj.type+' created')}}else if(g.kind==='move'&&active()){const modified=structuredClone(active());const before=g.original;Object.assign(active(),before);store.commit(d=>Object.assign(d.objects.find(o=>o.id===before.id),modified));notice('Move applied')}draw()}
canvas.addEventListener('pointerup',e=>{if(gesture?.kind==='draw'&&preview){const p=toWorld(e),q=resolvedEnd(gesture.start,p,e);preview.x2=q.x;preview.y2=q.y;}finish()});canvas.addEventListener('pointercancel',()=>{gesture=null;preview=null;draw()});
canvas.addEventListener('wheel',e=>{e.preventDefault();if(!camera)return;camera.scale=Math.max(.001,Math.min(3,camera.scale*Math.exp(-e.deltaY*.001)));customCamera=true;draw()},{passive:false});
for(const b of document.querySelectorAll('[data-view]'))b.onclick=()=>setView(b.dataset.view);
for(const b of document.querySelectorAll('[data-discipline]'))b.onclick=()=>{discipline=b.dataset.discipline;refreshTools()};
for(const b of document.querySelectorAll('[data-tool]'))b.onclick=()=>setTool(b.dataset.tool);
$('fit').onclick=$('fitView').onclick=()=>{camera=null;customCamera=false;if(gpu&&view!=='plan')gpu.fit();draw()};
$('gridVisible').onchange=e=>store.commit(d=>d.settings.gridVisible=e.target.checked);
$('snap').onchange=e=>store.commit(d=>d.settings.snap=e.target.checked);
$('endpointSnap').onchange=()=>notice('Endpoint snap '+($('endpointSnap').checked?'enabled':'disabled'));
$('orthogonalWalls').onchange=()=>notice('Orthogonal wall lock '+($('orthogonalWalls').checked?'enabled':'disabled'));
$('gridStep').onchange=e=>{const x=Number(e.target.value);if(!Number.isFinite(x)||x<25){notice('Grid interval must be ≥25 mm');return}store.commit(d=>d.settings.grid=x)};
$('thickness').onchange=()=>notice('Thickness preset updated');$('height').onchange=()=>notice('Height preset updated');
$('undo').onclick=()=>{if(store.undo()){selected=null;notice('Undo applied')}else notice('Nothing to undo')};
$('redo').onclick=()=>{if(store.redo()){selected=null;notice('Redo applied')}else notice('Nothing to redo')};
$('clearSelection').onclick=()=>{selected=null;sync()};
$('delete').onclick=()=>{if(!active()){notice('Select an element first');return}store.commit(d=>removeWithDependents(d,selected));selected=null;notice('Element removed')};
$('duplicate').onclick=()=>{const o=active();if(!o){notice('Select an element first');return}const clone=element(o.type,{...o,id:undefined,x:o.x+500,x2:o.x2+500,y:o.y+500,y2:o.y2+500,name:o.name+' copy'});store.commit(d=>d.objects.push(clone));selected=clone.id;notice('Element duplicated')};
$('applyProps').onclick=()=>{if(!active())return;const id=selected,fields={};document.querySelectorAll('[data-prop]:not([disabled])').forEach(el=>fields[el.dataset.prop]=el.type==='number'?Number(el.value):el.value);if(['x','y','x2','y2','z','height','thickness'].some(k=>!Number.isFinite(fields[k]))){notice('Invalid numeric property');return}store.commit(d=>Object.assign(d.objects.find(o=>o.id===id),fields));notice('Properties committed')};
$('new').onclick=()=>{if(store.doc.objects.length&&!confirm('Create a new project and clear the current workspace?'))return;store.replace(blank());selected=null;camera=null;customCamera=false;notice('New project')};
$('save').onclick=()=>{download('SUBSTRATE_PRO_Project.substratepro',exportJSON(store.doc),'application/json');notice('Native project downloaded')};
$('open').onclick=()=>$('file').click();$('file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const doc=importJSON(await f.text());store.replace(doc);selected=null;camera=null;customCamera=false;notice('Project opened · '+doc.objects.length+' elements')}catch(err){report('IMPORT ERROR\n'+err.message);notice('Could not open file')}e.target.value=''};
$('export').onclick=()=>{download('SUBSTRATE_PRO_Plan.svg',planSVG(store.doc),'image/svg+xml');notice('Plan SVG downloaded')};
$('review').onclick=()=>{const modal=$('reviewModal');modal.hidden=false;requestAnimationFrame(()=>updateReview(modal,store.doc))};$('closeReview').onclick=()=>$('reviewModal').hidden=true;
$('printReview').onclick=$('plot').onclick=()=>{if($('reviewModal').hidden){$('review').click()}requestAnimationFrame(()=>{updateReview($('reviewModal'),store.doc);window.print()})};
$('audit').onclick=()=>{const results=runAudit(store.doc);report(results.length?'VALIDATION WARNINGS\n'+results.join('\n'):'PASS: model structure and basic assembly rules. '+store.doc.objects.length+' elements checked.\nThis is not a regulatory/code compliance certification.');notice('Audit completed')};
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
$('help').onclick=()=>report('SUBSTRATE PRO — QUICK GUIDE\n1. Choose Architecture, Structure, MEP or Civil tools.\n2. Select an element type; the viewport switches to Plan.\n3. Drag to create a component, click it to select, drag again to move.\n4. Edit right-side properties, then Apply.\n5. Use 3D Iso / elevations to review a shared model.\n6. Print the 4 Ortho Review sheet, or export SVG / save native project.\n\nGeometry: conceptual parametric prisms, NOT exact B-rep, not certified IFC.');
window.addEventListener('keydown',e=>{if(e.key==='Escape'){gesture=null;pendingStart=null;preview=null;draw();notice('Drawing cancelled')}if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName))return;if(e.key==='Delete')$('delete').click();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();$('undo').click()}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();$('redo').click()}});
window.addEventListener('error',e=>report('RUNTIME ERROR: '+e.message));window.addEventListener('unhandledrejection',e=>report('ASYNC ERROR: '+e.reason));
new ResizeObserver(()=>draw()).observe(canvas);
// Essential controls are functional independently of external 3D / IFC libraries.
// GPU and exact B-rep are opt-in; failure leaves 2D/isometric projections available.
async function enableWebGL(){
 if(gpu)return true;
 try{notice('Starting GPU viewport…');const {GPUViewer}=await import('../render-3d/webgl.js');
  gpu=new GPUViewer($('gpuStage'),{onSelect:id=>{selected=id;sync()}});
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
 }catch(e){exactReady=false;gpu.setModel(store.doc,{exact:false});setView(view);
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
