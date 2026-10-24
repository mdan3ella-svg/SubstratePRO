import assert from 'node:assert/strict';
import {validateShape,OCCT_ADAPTER_VERSION} from '../occt-adapter-v458.mjs';
assert.equal(OCCT_ADAPTER_VERSION,'4.5.8-isvalid-overload');
let deleted=false;
class BRepCheck_Analyzer_2{ constructor(shape, flag){assert.equal(flag,true);assert.equal(shape.ok,true)} IsValid_2(){return true} delete(){deleted=true} }
assert.equal(validateShape({BRepCheck_Analyzer_2},{ok:true}),true);
assert.equal(deleted,true);
class BRepCheck_AnalyzerAlt{ constructor(){} IsValid_1(shape){return shape.ok} }
assert.equal(validateShape({BRepCheck_Analyzer_2:BRepCheck_AnalyzerAlt},{ok:false}),false);
assert.equal(validateShape({},null),false);
console.log('OCCT validity overload tests passed');
