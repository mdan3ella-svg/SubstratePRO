import {newUnderlay,updateUnderlay} from './index.js';
export function attachUnderlayManager({documentModel,onCommit,draw,notice,$,setPlan}){
 const list=()=>documentModel().underlays||[];
 const selected=()=>list().find(o=>o.id===$('underlaySelect').value);
 function rebuild(){const s=$('underlaySelect'),before=s.value;s.replaceChildren();for(const o of list()){const option=document.createElement('option');option.value=o.id;option.textContent=o.name;s.append(option)}if(list().some(o=>o.id===before))s.value=before;sync()}
 function sync(){const o=selected();if(!o)return;$('underlayWidth').value=o.widthMM;$('underlayOpacity').value=Math.round(o.opacity*100);$('underlayX').value=o.x;$('underlayY').value=o.y;$('underlayRotation').value=o.rotation||0;$('underlayVisible').checked=o.visible;$('underlayLocked').checked=o.locked}
 $('underlayOpen').onclick=()=>{$('underlayDialog').hidden=false;rebuild()};$('closeUnderlay').onclick=()=>{$('underlayDialog').hidden=true};$('underlaySelect').onchange=sync;
 $('addUnderlay').onclick=()=>$('underlayFile').click();
 $('underlayFile').onchange=async e=>{
  const file=e.target.files?.[0];e.target.value='';if(!file)return;
  if(!['image/png','image/jpeg'].includes(file.type)){notice('Only PNG and JPEG files supported');return}
  if(file.size>12*1024*1024){notice('Image too large: maximum 12 MB');return}
  try{
   const url=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('Image read failed'));r.readAsDataURL(file)});
   const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('Could not decode image'));image.src=url});
   const width=Number($('underlayWidth').value)||5000;
   const o=newUnderlay({name:file.name,src:url,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,widthMM:width});
   onCommit(d=>{d.underlays||=[];d.underlays.push(o)});rebuild();$('underlaySelect').value=o.id;sync();setPlan();draw();notice('Tracing image embedded in project');
  }catch(error){$('underlayMessage').textContent=error.message;notice('Underlay import failed')}
 };
 $('applyUnderlay').onclick=()=>{const o=selected();if(!o)return notice('Select an underlay');
  try{const updated=updateUnderlay(o,{widthMM:Number($('underlayWidth').value),opacity:Number($('underlayOpacity').value)/100,x:Number($('underlayX').value),y:Number($('underlayY').value),rotation:Number($('underlayRotation').value)||0,visible:$('underlayVisible').checked,locked:$('underlayLocked').checked});onCommit(d=>Object.assign(d.underlays.find(v=>v.id===o.id),updated));draw();notice('Underlay placement saved')}
  catch(e){notice(e.message)}
 };
 $('removeUnderlay').onclick=()=>{const o=selected();if(!o)return;onCommit(d=>d.underlays=d.underlays.filter(x=>x.id!==o.id));rebuild();draw();notice('Underlay removed')};
 return {rebuild};
}
