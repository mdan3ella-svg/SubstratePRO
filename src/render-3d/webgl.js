import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {viewDefinition,framingDimensions} from './camera-views.js';
import {footprint} from '../core/geometry/index.js';
import {wallSections} from '../core/geometry/openings.js';
import {MATERIALS,VIEW_STYLES,resolveMaterial,makeHatchCanvas} from './material-styles.js';
import {buildExactElements,kernelReady,tessellate} from '../core/geometry/brep/index.js';

export class GPUViewer{
 constructor(canvas,{onSelect=()=>{}}={}){
  this.canvas=canvas;this.onSelect=onSelect;
  this.renderer=new THREE.WebGLRenderer({canvas,antialias:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
  this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.1;
  this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0xf9fbfc);
  this.perspectiveCamera=new THREE.PerspectiveCamera(45,1,.005,100000);this.orthoCamera=new THREE.OrthographicCamera(-8,8,8,-8,.005,100000);this.camera=this.perspectiveCamera;for(const c of [this.perspectiveCamera,this.orthoCamera])c.up.set(0,0,1);this.camera.position.set(8,-10,8);this.activeView='perspective';this.modelSpan=15;
  this.controls=new OrbitControls(this.camera,canvas);this.controls.enableDamping=true;this.controls.dampingFactor=.1;
  this.controls.screenSpacePanning=true;this.controls.target.set(0,0,0);this.controls.minDistance=.05;this.controls.maxDistance=10000;this.controls.minZoom=.02;this.controls.maxZoom=150;
  this.scene.add(new THREE.HemisphereLight(0xffffff,0x8196a3,2.3));
  const light=new THREE.DirectionalLight(0xffffff,2.8);light.position.set(8,-12,16);light.castShadow=true;light.shadow.mapSize.set(2048,2048);light.shadow.camera.left=-50;light.shadow.camera.right=50;light.shadow.camera.top=50;light.shadow.camera.bottom=-50;light.shadow.bias=-.0002;this.scene.add(light);this.keyLight=light;
  this.scene.add(new THREE.AmbientLight(0xffffff,.3));
  this.grid=new THREE.GridHelper(100,100,0x95aab1,0xe2e8eb);this.grid.rotation.x=Math.PI/2;this.scene.add(this.grid);
  this.axis=new THREE.AxesHelper(1.25);this.scene.add(this.axis);
  this.group=new THREE.Group();this.scene.add(this.group);this.style='shaded';this.ao=0.55;this.textures=new Map();this.edgeColor=0x263a43;this.ground=new THREE.Mesh(new THREE.PlaneGeometry(500,500),new THREE.ShadowMaterial({opacity:.28}));this.ground.receiveShadow=true;this.ground.position.z=-.025;this.scene.add(this.ground);
  this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();this._start=null;this.mode='mesh';
  this.gizmo=document.createElement('canvas');this.gizmo.width=110;this.gizmo.height=110;this.gizmo.setAttribute('aria-label','3D orientation axes');Object.assign(this.gizmo.style,{position:'absolute',right:'12px',bottom:'12px',width:'110px',height:'110px',pointerEvents:'none',zIndex:'4'});if(getComputedStyle(canvas.parentElement).position==='static')canvas.parentElement.style.position='relative';canvas.parentElement.appendChild(this.gizmo);

  canvas.addEventListener('pointerdown',e=>{this._start={x:e.clientX,y:e.clientY}});
  canvas.addEventListener('pointerup',e=>{if(!this._start||Math.hypot(e.clientX-this._start.x,e.clientY-this._start.y)>5)return;this.pick(e)});
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas.parentElement);
  this.running=true;const tick=()=>{if(!this.running)return;this.resize();this.controls.update();this.renderer.render(this.scene,this.camera);this.drawGizmo();requestAnimationFrame(tick)};requestAnimationFrame(tick);
 }
 resize(){const w=this.canvas.clientWidth,h=this.canvas.clientHeight;if(w<2||h<2)return;if(this.renderer.domElement.width!==Math.floor(w*this.renderer.getPixelRatio())||this.renderer.domElement.height!==Math.floor(h*this.renderer.getPixelRatio()))this.renderer.setSize(w,h,false);this.perspectiveCamera.aspect=w/h;this.perspectiveCamera.updateProjectionMatrix();this.updateOrthoFrustum(w/h)}
 updateOrthoFrustum(aspect){
  const a=Math.max(0.1,aspect||1);const half=Math.max(.01,this.modelSpan/2);const cam=this.orthoCamera;
  cam.left=-half*a;cam.right=half*a;cam.top=half;cam.bottom=-half;cam.updateProjectionMatrix();
 }
 switchCamera(projection){
  const next=projection==='perspective'?this.perspectiveCamera:this.orthoCamera;if(next===this.camera)return;
  const old=this.camera,target=this.controls.target.clone(),distance=Math.max(1,old.position.distanceTo(target));
  const dir=old.position.clone().sub(target).normalize();next.position.copy(target).addScaledVector(dir,distance);
  this.controls.dispose();this.camera=next;this.controls=new OrbitControls(this.camera,this.canvas);
  this.controls.enableDamping=true;this.controls.dampingFactor=.1;this.controls.screenSpacePanning=true;this.controls.target.copy(target);this.controls.minDistance=.05;this.controls.maxDistance=10000;this.controls.minZoom=.02;this.controls.maxZoom=150;
  this.controls.mouseButtons={LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.PAN};
  this.resize();
 }
 drawGizmo(){
  const ctx=this.gizmo.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,110,110);
  const q=this.camera.quaternion.clone().invert(),origin={x:55,y:55};
  const axes=[{vec:new THREE.Vector3(1,0,0),label:'X',color:'#ce5260'},{vec:new THREE.Vector3(0,1,0),label:'Y',color:'#38a777'},{vec:new THREE.Vector3(0,0,1),label:'Z',color:'#4b83d6'}];
  axes.sort((a,b)=>a.vec.clone().applyQuaternion(q).z-b.vec.clone().applyQuaternion(q).z);
  for(const axis of axes){const v=axis.vec.applyQuaternion(q);const x=origin.x+v.x*31,y=origin.y-v.y*31;ctx.strokeStyle=axis.color;ctx.fillStyle=axis.color;ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(origin.x,origin.y);ctx.lineTo(x,y);ctx.stroke();ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 11px Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(axis.label,x,y+.5)}
 }
 pick(e){const r=this.canvas.getBoundingClientRect();this.pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.raycaster.setFromCamera(this.pointer,this.camera);const hit=this.raycaster.intersectObjects(this.group.children,true)[0];if(hit){let o=hit.object;while(o&&!o.userData.id)o=o.parent;this.onSelect(o?.userData.id||null)}}
 clear(){for(const obj of [...this.group.children]){this.group.remove(obj);obj.traverse(n=>{n.geometry?.dispose();if(n.material)Array.isArray(n.material)?n.material.forEach(m=>m.dispose()):n.material.dispose()})}}
 addReferenceModel(root,name='Imported model'){
  if(!this.references){this.references=new THREE.Group();this.scene.add(this.references)}
  root.name=name;this.references.add(root);this.fit();return root;
 }
 clearReferences(){if(!this.references)return;for(const root of [...this.references.children]){this.references.remove(root);root.traverse(o=>{o.geometry?.dispose()})}}
 exportRoot(includeReferences=true){const group=new THREE.Group();group.name='SUBSTRATE PRO BIM';this.group.children.forEach(o=>group.add(o.clone(true)));if(includeReferences&&this.references)this.references.children.forEach(o=>group.add(o.clone(true)));return group}
 setGrid(visible){this.grid.visible=Boolean(visible)}
 addElement(o,geometry,origin){
  const spec=resolveMaterial(o.material),material=new THREE.MeshStandardMaterial({color:spec.color,roughness:spec.roughness,metalness:spec.metalness,transparent:o.material==='Glass',opacity:spec.opacity??1,side:THREE.DoubleSide});
  const mesh=new THREE.Mesh(geometry,material);mesh.position.set(...origin.map(n=>n/1000));mesh.userData.id=o.id;mesh.userData.materialName=o.material||'Default';mesh.castShadow=true;mesh.receiveShadow=true;this.group.add(mesh);this.applyStyleToMesh(mesh);
 }
 textureFor(name){if(!this.textures.has(name)){const texture=new THREE.CanvasTexture(makeHatchCanvas(name));texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(2,2);this.textures.set(name,texture)}return this.textures.get(name)}
 applyStyleToMesh(mesh){const st=VIEW_STYLES[this.style]||VIEW_STYLES.shaded,spec=resolveMaterial(mesh.userData.materialName),mat=mesh.material;
  mat.color.setHex(this.style==='hidden'?0xffffff:this.style==='wire'?0xffffff:this.style==='xray'?0xa7c3cf:spec.color);
  mat.roughness=spec.roughness;mat.metalness=st.lighting?spec.metalness:0;
  mat.map=st.pattern&&spec.pattern!=='none'?this.textureFor(mesh.userData.materialName):null;
  mat.transparent=st.opacity<1||spec.opacity!=null;mat.opacity=Math.min(st.opacity,spec.opacity??1);mat.depthWrite=this.style!=='xray'&&this.style!=='wire';mat.visible=this.style!=='wire';mat.needsUpdate=true;
  const old=mesh.getObjectByName('style-edges');if(old){mesh.remove(old);old.geometry.dispose();old.material.dispose()}
  if(st.edge){const edges=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry,26),new THREE.LineBasicMaterial({color:this.edgeColor,transparent:this.style==='xray',opacity:this.style==='xray'?.65:1,depthTest:this.style!=='xray'}));edges.name='style-edges';mesh.add(edges)}
  mesh.castShadow=st.lighting&&this.ao>0;mesh.receiveShadow=st.lighting&&this.ao>0;
 }
 setVisualStyle(style){if(!VIEW_STYLES[style])throw Error('Unknown visual style: '+style);this.style=style;this.scene.background=new THREE.Color(VIEW_STYLES[style].background);this.group.children.forEach(m=>this.applyStyleToMesh(m));this.updateAO()}
 setAO(value){this.ao=Math.max(0,Math.min(1,Number(value)||0));this.updateAO()}
 updateAO(){const active=VIEW_STYLES[this.style].lighting&&this.ao>0;this.renderer.shadowMap.enabled=active;this.keyLight.castShadow=active;this.ground.visible=active;this.ground.material.opacity=this.ao*.5;this.group.children.forEach(m=>{m.castShadow=active;m.receiveShadow=active})}

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
  this.updateAO();return errors;
 }
 fit(){
  const box=this.group.children.length?new THREE.Box3().setFromObject(this.group):null;
  const center=box?box.getCenter(new THREE.Vector3()):new THREE.Vector3();
  const size=box?box.getSize(new THREE.Vector3()):new THREE.Vector3(7,7,4);
  const aspect=Math.max(.1,this.canvas.clientWidth/Math.max(1,this.canvas.clientHeight));
  this.modelSpan=framingDimensions(size,aspect).span;
  this.orthoCamera.zoom=1;this.perspectiveCamera.zoom=1;
  const distance=Math.max(5,this.modelSpan*1.5);
  this.controls.target.copy(center);
  const def=viewDefinition(this.activeView);
  const dir=new THREE.Vector3(...def.direction).normalize();this.camera.up.set(...def.up);this.camera.position.copy(center).addScaledVector(dir,distance);
  for(const c of [this.perspectiveCamera,this.orthoCamera]){c.near=.005;c.far=Math.max(1000,distance*100);c.updateProjectionMatrix()}
  this.updateOrthoFrustum(aspect);this.controls.update();
 }
 preset(which){
  const def=viewDefinition(which);this.activeView=which;
  const target=this.controls.target.clone();
  this.switchCamera(def.projection);
  const dist=Math.max(5,this.camera.position.distanceTo(target));
  const dir=new THREE.Vector3(...def.direction).normalize();
  this.camera.position.copy(target).addScaledVector(dir,dist);
  this.camera.up.set(...def.up);
  this.camera.lookAt(target);
  // Elevations remain orthographic but can be freely navigated with OrbitControls.
  this.controls.enableRotate=true;this.controls.target.copy(target);this.controls.update();
 }
 resetOrbit(){this.preset(this.activeView)}
 dispose(){this.running=false;this.gizmo?.remove();this.clearReferences();this.observer.disconnect();this.controls.dispose();this.clear();for(const tex of this.textures.values())tex.dispose();this.ground.geometry.dispose();this.ground.material.dispose();this.renderer.dispose()}
}
