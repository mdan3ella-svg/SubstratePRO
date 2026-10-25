// SUBSTRATE PRO startup controller: presentation only, leaves BIM store and engine untouched.
const launcher=document.getElementById('spLauncher');
const tabs=[...launcher.querySelectorAll('[data-sp-tab]')];
const panels=[...launcher.querySelectorAll('[data-sp-view]')];
export function showLauncher(section='start'){
  launcher.hidden=false;
  document.body.classList.add('sp-startup-open');
  tabs.forEach(b=>b.setAttribute('aria-selected',String(b.dataset.spTab===section)));
  panels.forEach(p=>p.hidden=p.dataset.spView!==section);
  launcher.querySelector('[data-sp-tab="'+section+'"]')?.focus();
}
export function closeLauncher(){launcher.hidden=true;document.body.classList.remove('sp-startup-open');document.getElementById('stage')?.focus();}
function clickExisting(id){const e=document.getElementById(id);if(!e||e.disabled){const status=document.getElementById('spStartupStatus');if(status)status.textContent='This workspace control is not available.';return false;}closeLauncher();e.click();return true;}
launcher.addEventListener('click',e=>{
  const tab=e.target.closest('[data-sp-tab]');if(tab){showLauncher(tab.dataset.spTab);return;}
  const act=e.target.closest('[data-sp-action]');if(!act)return;
  switch(act.dataset.spAction){
    case 'enter':closeLauncher();break;
    case 'new':clickExisting('new');break;
    case 'open':clickExisting('open');break;
    case 'sample':clickExisting('sampleModel');break;
    case 'plan':closeLauncher();document.querySelector('[data-view="plan"]')?.click();break;
    case 'wall':closeLauncher();document.querySelector('[data-discipline="architecture"]')?.click();document.querySelector('#tools [data-tool="wall"]')?.click();document.querySelector('[data-view="plan"]')?.click();break;
    case 'iso':closeLauncher();document.querySelector('[data-view="iso"]')?.click();break;
    case 'sheet':clickExisting('generateSheet');break;
    case 'help':clickExisting('help');break;
    default:closeLauncher();break;
  }
});
document.getElementById('spOpenLauncher')?.addEventListener('click',()=>showLauncher('start'));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!launcher.hidden){closeLauncher();e.preventDefault();}});
showLauncher('start');
