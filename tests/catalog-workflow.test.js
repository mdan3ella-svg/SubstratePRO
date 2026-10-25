import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogEntries,createCatalogObjects,catalogTableOfContents} from '../src/detailcore/catalog/index.js';
import {Store} from '../src/core/transactions/index.js';
import {blank} from '../src/core/document-model/index.js';
import {buildSheetHTML} from '../src/detailcore/sheets/index.js';
test('catalog contents cover assemblies, openings, furniture, symbols and drafting',()=>{
 const categories=new Set(catalogEntries().map(item=>item.category));
 assert.deepEqual([...categories].sort(),['Assemblies','Drafting','Furniture','Openings','Symbols']);
});
test('catalog insert creates editable BIM objects and retains metadata on undo/redo',()=>{
 const store=new Store(blank());const [wall]=createCatalogObjects('A-WALL-200',{x:500,y:200,level:'L1'});
 store.commit(d=>d.objects.push(wall));
 assert.equal(wall.x,500);assert.equal(wall.x2,4700);assert.equal(wall.catalogId,'A-WALL-200');
 assert.equal(catalogTableOfContents(store.doc).length,1);
 store.undo();assert.equal(catalogTableOfContents(store.doc).length,0);
 store.redo();assert.equal(catalogTableOfContents(store.doc)[0].ref,'A-WALL-200');
});
test('hosted door catalog refuses unhosted insertion',()=>{
 assert.throws(()=>createCatalogObjects('A-DOOR-900',{x:200,y:0}),/require an existing host/);
});
test('construction sheet includes model-derived assembly contents',()=>{
 const doc=blank();doc.objects.push(...createCatalogObjects('A-FUR-DESK',{x:100,y:200}));
 const sheet=buildSheetHTML(doc,{standard:'ISO'});
 assert.match(sheet,/ASSEMBLY \/ BLOCK TABLE OF CONTENTS/);
 assert.match(sheet,/A-FUR-DESK/);
});
