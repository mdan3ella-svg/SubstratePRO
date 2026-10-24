import assert from 'node:assert/strict';
import {makeBox} from '../occt-adapter.mjs';
let log=[];
class Point{constructor(...a){ assert.equal(a.length,3); this.a=a; }}
class Box{constructor(...a){ assert.equal(a.length,2); log.push(a); } Shape(){return {IsNull:()=>false}}}
const oc={gp_Pnt_3:Point,BRepPrimAPI_MakeBox_3:Box};
makeBox(oc,[11,12,13,21,42,63]);
assert.deepEqual(log[0].map(x=>x.a),[[11,12,13],[21,42,63]]);
assert.throws(()=>makeBox(oc,[0,0,0,1,0,1]),/Invalid box bounds/);
console.log('OCCT box overload regression passed');
