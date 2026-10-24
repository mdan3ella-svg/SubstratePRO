/* SUBSTRATE PRO v4.7.1: branded entry, original launcher and BIM workspace retained. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const cover = $('substrateStart');
  const dash = $('splashScreen');
  if (!cover || !dash) return;
  const hide = () => { cover.hidden = true; };
  const enter = () => { hide(); dash.hidden = true; };
  const dashboard = () => { hide(); dash.hidden = false; };
  $('substrateStartWorkspace')?.addEventListener('click', enter);
  $('substrateStartDashboard')?.addEventListener('click', dashboard);
  $('substrateStartNew')?.addEventListener('click', () => {
    dashboard();
    const newButton = $('projectNew');
    if (newButton) newButton.click();
    else enter();
  });
  $('substrateStartSample')?.addEventListener('click', () => {
    dashboard();
    const btn = $('projectSample');
    if (btn) btn.click();
  });
  const params = new URLSearchParams(location.search);
  if (params.get('workspace') === '1') enter();
  else if (params.get('dashboard') === '1') dashboard();
  else { cover.hidden = false; }
})();
