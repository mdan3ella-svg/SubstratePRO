import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const source=readFileSync(new URL('../src/app/main.js',import.meta.url),'utf8');
for(const stage of ['project','model','detail','annotate','review','publish'])test(`${stage} workflow navigation is actionable`,()=>{
 assert.match(html,new RegExp(`data-stage="${stage}"`));
 assert.match(source,new RegExp(`\\b${stage}:\\{description:`));
});
test('workflow navigation calls shared tool, view and project handlers',()=>{
 assert.match(source,/setView\(route\.slice\(5\)\)/);
 assert.match(source,/setTool\(next\)/);
 assert.match(source,/control\.click\(\)/);
});
