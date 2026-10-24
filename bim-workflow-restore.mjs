/* SUBSTRATE PRO 4.6.1 — restore the original plan-first BIM workflow.
 * Only dispatches the original application's tool/view controls: no duplicate geometry engine.
 */
export const WORKFLOW_VERSION='4.6.1';
const $=(s)=>document.querySelector(s);
function action(selector){const button=$(selector);if(!button)throw Error('Missing BIM control: '+selector);button.click();return button;}
function say(s){const el=$('#bimDraftStatus');if(el)el.textContent=s;}
function enter(){const splash=$('#splashScreen');if(splash)splash.hidden=true;}
function chooseTool(name){enter();action(`[data-view="plan"]`);action(`[data-tool="${name}"]`);say(name==='wall'?'WALL POLYLINE: click connected wall corners in plan. Enter or Finish Wall to complete. Switch to 3D Iso to view your walls.':'Draft '+name+' in plan, then choose 3D Iso.');}
function chooseView(name){enter();action(`[data-view="${name}"]`);say(name==='iso'?'3D BIM: walls, slabs, columns and beams are generated from the same BIM elements. Choose Plan to continue drawing.':'PLAN: draw with the left BIM tools and use snaps and numeric defaults.');}
function install(){
 const toolset=$('.left .toolset');if(!toolset||$('#bimDraftWorkflow'))return;
 const card=document.createElement('section');card.id='bimDraftWorkflow';card.setAttribute('aria-label','Plan to 3D BIM workflow');
 card.innerHTML=`<div class="bim-workflow-title">PLAN → PARAMETRIC 3D BIM</div><p>Draft connected walls and components in plan. Switch to 3D Iso to inspect the same model; continue editing in plan.</p><div class="bim-workflow-actions"><button type="button" id="bimDraftWall">1 · Draft Walls</button><button type="button" id="bimDraft3D">2 · View 3D</button><button type="button" id="bimDraftPlan">Back to Plan</button><button type="button" id="bimDraftSample">Load Sample</button></div><div id="bimDraftStatus" role="status">Wall Polyline → click corners → Finish Wall ↵ → 3D Iso.</div>`;
 toolset.insertAdjacentElement('afterend',card);
 $('#bimDraftWall').addEventListener('click',()=>chooseTool('wall'));
 $('#bimDraft3D').addEventListener('click',()=>chooseView('iso'));
 $('#bimDraftPlan').addEventListener('click',()=>chooseView('plan'));
 $('#bimDraftSample').addEventListener('click',()=>{enter();action('[data-action="sample"]');say('Sample model loaded. Choose 3D Iso to inspect the modeled walls and slabs.');});
 const splashStart=$('#enterWorkspace');if(splashStart&& !$('#startBimDraft')){const b=document.createElement('button');b.id='startBimDraft';b.type='button';b.className='splashPrimary';b.textContent='Start BIM Wall Drafting';splashStart.insertAdjacentElement('afterend',b);b.addEventListener('click',()=>chooseTool('wall'));}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
