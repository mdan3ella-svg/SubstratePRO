import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
test('Three.js source hosting import map exists',()=>{const s=readFileSync(new URL('../index.html',import.meta.url),'utf8');assert.match(s,/type="importmap"/);assert.match(s,/three\/addons\//);});
test('GitHub Actions compiles Vite before deployment',()=>{const s=readFileSync(new URL('../.github/workflows/pages.yml',import.meta.url),'utf8');assert.match(s,/npm run build/);assert.match(s,/path: dist/);});
