import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'site');
const vendor = path.join(root, 'vendor', 'opencascade');
const copy = (src, dest) => { if (!fs.existsSync(src)) return false; fs.cpSync(src, dest, { recursive: true, force: true }); return true; };

// Always publish the original modular BIM authoring application.
const originalIndex = path.join(root, 'index.html');
const mainModule = path.join(root, 'src', 'app', 'main.js');
const theme = path.join(root, 'src', 'interface', 'style.css');
for (const required of [originalIndex, mainModule, theme]) {
  if (!fs.existsSync(required)) throw new Error(`Missing essential BIM app file: ${path.relative(root, required)}`);
}
fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(target, { recursive: true });

// Public static assets first; root files win in case of duplicates.
copy(path.join(root, 'public'), target);
copy(path.join(root, 'src'), path.join(target, 'src'));
for (const name of fs.readdirSync(root)) {
  if (/\.(?:html|mjs|js|css|json|svg|ico)$/i.test(name) && fs.statSync(path.join(root, name)).isFile()) {
    copy(path.join(root, name), path.join(target, name));
  }
}
fs.writeFileSync(path.join(target, '.nojekyll'), '');

// OCCT is optional for core 2D BIM startup, but retain the verified WASM
// when the GitHub Actions build has generated it.
const wasm = path.join(vendor, 'opencascade.wasm');
if (fs.existsSync(wasm)) {
  if (fs.statSync(wasm).size < 10_000_000) throw new Error('OCCT WASM appears truncated');
  copy(vendor, path.join(target, 'vendor', 'opencascade'));
}

for (const required of ['index.html','src/app/main.js','src/interface/style.css']) {
  if (!fs.existsSync(path.join(target, required))) throw new Error(`Publication omitted essential asset: ${required}`);
}
const html = fs.readFileSync(path.join(target, 'index.html'), 'utf8');
if (!html.includes('src/app/main.js')) throw new Error('Wrong index.html: expected original modular BIM entry point');
fs.writeFileSync(path.join(target, 'deployment-status.json'), JSON.stringify({
  ready: true,
  app: 'original-modular-bim',
  entry: 'src/app/main.js',
  occtWasmPresent: fs.existsSync(path.join(target,'vendor/opencascade/opencascade.wasm'))
}, null, 2));
console.log('Published original BIM app and modules to site/');
