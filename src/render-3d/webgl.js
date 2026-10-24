import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {footprint} from '../core/geometry/index.js';
import {wallSections} from '../core/geometry/openings.js';
import {buildExactElements,kernelReady,tessellate} from '../core/geometry/brep/index.js';
const palette={Concrete:0xb7c8c9,Steel:0x637986,Masonry:0xc6b39e,Timber:0xb58f62,Glass:0x92c8cb};
export class GPUViewer{
 constructor(canvas,{onSelect=()=>{}}={}){
  this.canvas=canvas;this.onSelect=onSelect;
  this.renderer=new THREE.WebGLRenderer({canvas,antialias:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
  this.renderer.outputColorSpace=THREE.SRGBColorSpace;
  this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0xf9fbfc);
  this.camera=new THREE.PerspectiveCamera(45,1,.005,100000);this.camera.up.set(0,0,1);this.camera.position.set(8,-10,8);
  this.controls=new OrbitControls(this.camera,canvas);this.controls.enableDamping=true;this.controls.dampingFactor=.1;
  this.controls.screenSpacePanning=true;this.controls.target.set(0,0,0);
  this.scene.add(new THREE.HemisphereLight(0xffffff,0x8196a3,2.3));
  const light=new THREE.DirectionalLight(0xffffff,2.8);light.position.set(8,-12,16);this.scene.add(light);
  this.scene.add(new THREE.AmbientLight(0xffffff,.3));
  this.grid=new THREE.GridHelper(100,100,0x95aab1,0xe2e8eb);this.grid.rotation.x=Math.PI/2;this.scene.add(this.grid);
  this.axis=new THREE.AxesHelper(1.25);this.scene.add(this.axis);
  this.group=new THREE.Group();this.scene.add(this.group);
  this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();this._start=null;this.mode='mesh';
  canvas.addEventListener('pointerdown',e=>{this._start={x:e.clientX,y:e.clientY}});
  canvas.addEventListener('pointerup',e=>{if(!this._start||Math.hypot(e.clientX-this._start.x,e.clientY-this._start.y)>5)return;this.pick(e)});
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas.parentElement);
  this.running=true;const tick=()=>{if(!this.running)return;this.resize();this.controls.update();this.renderer.render(this.scene,this.camera);requestAnimationFrame(tick)};requestAnimationFrame(tick);
 }
 resize(){const w=this.canvas.clientWidth,h=this.canvas.clientHeight;if(w<2||h<2)return;if(this.renderer.domElement.width!==Math.floor(w*this.renderer.getPixelRatio())||this.renderer.domElement.height!==Math.floor(h*this.renderer.getPixelRatio()))this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix()}
 pick(e){const r=this.canvas.getBoundingClientRect();this.pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.raycaster.setFromCamera(this.pointer,this.camera);const hit=this.raycaster.intersectObjects(this.group.children,true)[0];if(hit){let o=hit.object;while(o&&!o.userData.id)o=o.parent;this.onSelect(o?.userData.id||null)}}
 clear(){for(const obj of [...this.group.children]){this.group.remove(obj);obj.traverse(n=>{n.geometry?.dispose();if(n.material)Array.isArray(n.material)?n.material.forEach(m=>m.dispose()):n.material.dispose()})}}
 setGrid(visible){this.grid.visible=Boolean(visible)}
 addElement(o,geometry,origin){const material=new THREE.MeshStandardMaterial({color:palette[o.material]||0x97b4bd,roughness:.69,metalness:o.material==='Steel'?.22:0,transparent:o.material==='Glass',opacity:o.material==='Glass'?.62:1,side:THREE.DoubleSide});const mesh=new THREE.Mesh(geometry,material);mesh.position.set(...origin.map(n=>n/1000));mesh.userData.id=o.id;this.group.add(mesh)}
 setModel(doc,{exact=false}={}){
  this.clear();this.mode=exact?'exact':'mesh';const errors=[];
  if(exact){if(!kernelReady())throw Error('OpenCascade exact kernel not initialized');const result=buildExactElements(doc.objects);errors.push(...result.errors);
   for(const [id,{solid,origin}] of result.solids){try{const data=tessellate(solid);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(data.position,3));if(data.normal?.length)geo.setAttribute('normal',new THREE.BufferAttribute(data.normal,3));else geo.computeVertexNormals();if(data.index?.length)geo.setIndex(new THREE.BufferAttribute(data.index,1));geo.scale(.001,.001,.001);this.addElement(doc.objects.find(o=>o.id===id),geo,origin)}catch(e){errors.push({id,error:String(e.message||e)})}}
  }else{
   for(const o of doc.objects){if(o.visible===false||['line','dimension','opening','void'].includes(o.type))continue;
    if(o.type==='wall' && doc.objects.some(c=>c.hostId===o.id)){
      const dx=o.x2-o.x,dy=o.y2-o.y,L=Math.hypot(dx,dy),theta=Math.atan2(dy,dx);
      for(const piece of wallSections(o,doc.objects)){
       const len=(piece.end-piece.start)*.001,height=(piece.top-piece.bottom)*.001;
       const geo=new THREE.BoxGeometry(len,(o.thickness||200)*.001,height);
       geo.rotateZ(theta);const mid=(piece.start+piece.end)/2;
       this.addElement(o,geo,[(o.x+Math.cos(theta)*mid)*.001*1000,(o.y+Math.sin(theta)*mid)*.001*1000,((o.z||0)+(piece.bottom+piece.top)/2)]);
      }continue;
    }
    const poly=footprint(o),z=Number(o.z)||0,h=Math.max(1,Number(o.height)||1);
    // Generic extruded polygon, including diagonal walls. Units converted to metres.
    const shape=new THREE.Shape();poly.forEach(([x,y],i)=>i?shape.lineTo(x*.001,y*.001):shape.moveTo(x*.001,y*.001));shape.closePath();
    const geo=new THREE.ExtrudeGeometry(shape,{depth:h*.001,bevelEnabled:false,steps:1});geo.translate(0,0,z*.001);geo.computeVertexNormals();this.addElement(o,geo,[0,0,0]);
   }
  }
  return errors;
 }
 fit(){if(!this.group.children.length){this.controls.target.set(0,0,0);this.camera.position.set(8,-10,8);return}const box=new THREE.Box3().setFromObject(this.group),center=box.getCenter(new THREE.Vector3()),ext=Math.max(box.getSize(new THREE.Vector3()).length(),2);this.controls.target.copy(center);this.camera.position.copy(center).add(new THREE.Vector3(ext,-ext,ext));this.camera.near=Math.max(.001,ext/10000);this.camera.far=Math.max(500,ext*100);this.camera.updateProjectionMatrix();this.controls.update()}
 preset(which){const target=this.controls.target.clone(),dist=Math.max(3,this.camera.position.distanceTo(target));const dir={iso:[1,-1,1],plan:[0,0,1],front:[0,-1,0],rear:[0,1,0],right:[1,0,0],left:[-1,0,0]}[which]||[1,-1,1];this.camera.position.copy(target.add(new THREE.Vector3(...dir).normalize().multiplyScalar(dist)));this.controls.update()}
 dispose(){this.running=false;this.observer.disconnect();this.controls.dispose();this.clear();this.renderer.dispose()}
}
