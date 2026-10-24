import {BRIDGE_VERSION,exportBIMFeatures,applyFeatureEdits} from './bim-occt-bridge.mjs';
const host=document.querySelector('.mainactions')||document.querySelector('header');
const launch=document.createElement('button');launch.textContent='BIM ↔ OCCT';launch.title='Synchronize supported BIM solids with native OpenCascade B-rep workspace';host?.append(launch);
const overlay=document.createElement('div');overlay.id='bimOcctDock';overlay.hidden=true;overlay.style.cssText='position:fixed;inset:0;z-index:700;background:#102b34da;padding:16px;display:flex;align-items:center;justify-content:center';
overlay.innerHTML=`<section style="width:min(1480px,99vw);height:min(95vh,950px);background:white;border-radius:12px;display:flex;flex-direction:column;min-height:0;color:#173c43;font:13px system-ui;overflow:hidden"><div style="padding:12px 16px;border-bottom:1px solid #dae7e9;display:flex;gap:9px;align-items:center;flex-wrap:wrap"><strong style="margin-right:auto">SUBSTRATE PRO · Native B-rep Coordination</strong><button id="bimOcctSync">Send BIM → OCCT</button><button id="bimOcctApply">Apply CAD parameters → BIM</button><button id="bimOcctClose">Close</button></div><div id="bimOcctStatus" role="status" style="padding:9px 14px;background:#ecf5f6;border-bottom:1px solid #dae7e9;font-size:12px">No model synchronized. Native CAD operations require the pinned OCCT WASM bundle.</div><iframe id="bimOcctFrame" title="Native OpenCascade CAD workspace" style="border:0;flex:1;width:100%;min-height:0" src="./cad-workspace.html?bridge=4.6"></iframe></section>`;
document.body.append(overlay);
const frame=document.getElementById('bimOcctFrame'),stat=document.getElementById('bimOcctStatus');
let ready=false,received=null,expectedOrigin=location.origin;
function notice(s){stat.textContent=s}
function send(){const app=window.SUBSTRATE?.App;if(!app?.initialized){notice('Main BIM application has not initialized.');return;}const exported=exportBIMFeatures(app.doc);const msg={channel:'SUBSTRATE_OCCT_BRIDGE_V1',action:'load',document:exported};if(!ready){notice('CAD frame initializing; synchronize again after ready message.');return;}frame.contentWindow.postMessage(msg,expectedOrigin);notice(`Sent ${exported.features.length} BIM elements; ${exported.skipped.length} unsupported skipped. ${exported.skipped.slice(0,3).map(x=>x.id+': '+x.reason).join(' | ')}`)}
window.addEventListener('message',event=>{if(event.origin!==expectedOrigin||event.source!==frame.contentWindow||event.data?.channel!=='SUBSTRATE_OCCT_BRIDGE_V1')return;
 const d=event.data;if(d.action==='ready'){ready=true;notice('CAD workspace ready. Choose Send BIM → OCCT to build native solids.');}
 if(d.action==='changed'){received=d.document;notice(`CAD parametric edits available (${received.features.length} features); use Apply CAD parameters → BIM to update source.`)}
 if(d.action==='document'){received=d.document;notice(`Received ${received.features.length} CAD features.`)}
 if(d.action==='error')notice('CAD workspace: '+d.message);
});
launch.onclick=()=>{overlay.hidden=false;};document.getElementById('bimOcctClose').onclick=()=>overlay.hidden=true;
document.getElementById('bimOcctSync').onclick=send;
document.getElementById('bimOcctApply').onclick=()=>{if(!received){frame.contentWindow.postMessage({channel:'SUBSTRATE_OCCT_BRIDGE_V1',action:'export'},expectedOrigin);notice('Requested current CAD features. Click Apply again after received.');return;}const app=window.SUBSTRATE?.App;if(!app){notice('BIM model unavailable');return;}
 const before=JSON.stringify(app.doc);try{const outcome=applyFeatureEdits(app.doc,received);app.doc.occtBridge={version:BRIDGE_VERSION,features:received.features,operations:received.operations||[]};
  if(!outcome.changes.length){notice('No BIM changes applied. '+JSON.stringify(outcome.rejected));return;}
  const n=document.getElementById('projectName');if(n)n.textContent=app.doc.title||'BIM Project';window.SUBSTRATE.setView(app.view||'plan');notice(`Applied ${outcome.changes.length} edits to the BIM model; ${outcome.rejected.length} rejected. Save the project to persist. Note: B-rep Boolean result topology is not converted back into BIM element envelopes.`);
 }catch(e){app.doc=JSON.parse(before);notice('Application failed: '+e.message)} };
