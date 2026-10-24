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
const pages=['index.html','cad-workspace.html','occt-test.html','.nojekyll'];
const modules=['occt-adapter.mjs','occt-ui.mjs','cad-workspace.mjs','cad-workspace-ui.mjs'];
for(const f of [...pages,...modules]){if(!fs.existsSync(path.join(root,f)))throw Error('Missing site file: '+f);fs.copyFileSync(path.join(root,f),path.join(target,f));}
fs.mkdirSync(path.join(target,'vendor/opencascade'),{recursive:true});
for(const f of ['opencascade.js','opencascade.wasm','manifest.json'])fs.copyFileSync(path.join(vendor,f),path.join(target,'vendor/opencascade',f));
const m=JSON.parse(fs.readFileSync(path.join(vendor,'manifest.json'),'utf8'));
fs.writeFileSync(path.join(target,'deployment-status.json'),JSON.stringify({ready:true,version:m.version,wasmBytes:fs.statSync(path.join(vendor,'opencascade.wasm')).size,build:'github-actions',assetPath:'vendor/opencascade/'},null,2));
console.log('Prepared site with pinned OCCT assets. Total WASM bytes:',fs.statSync(path.join(vendor,'opencascade.wasm')).size);
