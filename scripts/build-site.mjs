import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const target=path.join(root,'site');
const vendor=path.join(root,'vendor/opencascade');
for(const file of ['opencascade.js','opencascade.wasm','manifest.json']){
 const location=path.join(vendor,file);
 if(!fs.existsSync(location) || fs.statSync(location).size<10)throw Error(`Missing required OCCT asset ${location}. Run npm run build first.`);
}
if(fs.statSync(path.join(vendor,'opencascade.wasm')).size<10_000_000)throw Error('OCCT WASM appears truncated');
fs.rmSync(target,{recursive:true,force:true});fs.mkdirSync(target,{recursive:true});
const pages=['index.html','cad-workspace.html','occt-test.html'];
const modules=['occt-adapter.mjs','occt-adapter-v459.mjs','occt-ui.mjs','cad-workspace.mjs','cad-workspace-ui.mjs','bim-occt-bridge.mjs','bim-occt-main.mjs','bim-workflow-restore.mjs'];
for(const f of [...pages,...modules]){if(!fs.existsSync(path.join(root,f)))throw Error('Missing site file: '+f);fs.copyFileSync(path.join(root,f),path.join(target,f));}
// Generate this marker in the published output: GitHub's web uploader often omits empty dotfiles.
// Deployment guard: never publish an old adapter with the pinned ES-module kernel.
const adapter=fs.readFileSync(path.join(root,'occt-adapter.mjs'),'utf8');
if(!adapter.includes('OCCT_ADAPTER_VERSION="4.5.9-validated-overload"') || !adapter.includes('import(js.href)')){
  throw Error('Wrong OCCT adapter version; expected v4.5.9 ES module loader.');
}
const glue=fs.readFileSync(path.join(vendor,'opencascade.js'),'utf8');
if(!/export\s+default\s+opencascade/.test(glue.slice(-5000))){
  throw Error('Pinned OCCT glue does not expose expected ES module default factory. Inspect package.');
}
fs.writeFileSync(path.join(target,'.nojekyll'),'');
fs.mkdirSync(path.join(target,'vendor/opencascade'),{recursive:true});
for(const f of ['opencascade.js','opencascade.wasm','manifest.json'])fs.copyFileSync(path.join(vendor,f),path.join(target,'vendor/opencascade',f));
const m=JSON.parse(fs.readFileSync(path.join(vendor,'manifest.json'),'utf8'));
fs.writeFileSync(path.join(target,'deployment-status.json'),JSON.stringify({ready:true,version:m.version,wasmBytes:fs.statSync(path.join(vendor,'opencascade.wasm')).size,build:'github-actions',adapterVersion:'4.5.9-validated-overload',assetPath:'vendor/opencascade/'},null,2));
console.log('Prepared site with pinned OCCT assets. Total WASM bytes:',fs.statSync(path.join(vendor,'opencascade.wasm')).size);

// Deployment regression guard: pages must never reference the retired v457 adapter.
for(const rel of ['index.html','occt-ui.mjs','occt-test.html','cad-workspace.html']){
 const content=fs.readFileSync(path.join(target,rel),'utf8');
 if(/occt-adapter-v457\.mjs|occt-ui\.mjs\?v=4\.5\.7/.test(content))throw Error('Stale OCCT import in '+rel);
}
const newTest=fs.readFileSync(path.join(target,'occt-test.html'),'utf8');
if(!newTest.includes('occt-adapter-v459.mjs'))throw Error('OCCT acceptance test does not use v459 adapter');
