/** Three.js model interchange. Mesh formats are visual references, never editable IFC/BIM. */
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {STLLoader} from 'three/addons/loaders/STLLoader.js';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {OBJExporter} from 'three/addons/exporters/OBJExporter.js';
import {STLExporter} from 'three/addons/exporters/STLExporter.js';
export const IMPORT_3D=['glb','gltf','obj','stl','fbx'];
export const EXPORT_3D=['glb','gltf','obj','stl'];
export function extension(name){return String(name).split('.').pop().toLowerCase()}
export function ensureFormat(name,allowed){const ext=extension(name);if(!allowed.includes(ext))throw Error('Unsupported 3D format: '+ext);return ext}
export function summarizeModel(root){let meshes=0,triangles=0;root.traverse(o=>{if(o.isMesh){meshes++;const geometry=o.geometry,indices=geometry?.index?.count,positions=geometry?.getAttribute('position')?.count;triangles+=Math.floor((indices||positions||0)/3)}});return {meshes,triangles}}
function normalized(root){root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});return root}
export async function load3DFile(file){const ext=ensureFormat(file.name,IMPORT_3D),data=await file.arrayBuffer(),url=URL.createObjectURL(file);try{
 if(ext==='glb'||ext==='gltf'){const loader=new GLTFLoader();const result=await loader.loadAsync(url);return normalized(result.scene)}
 if(ext==='obj'){const text=new TextDecoder().decode(data);return normalized(new OBJLoader().parse(text))}
 if(ext==='stl'){const geo=new STLLoader().parse(data);geo.computeVertexNormals();return normalized(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0x95a7b0,side:THREE.DoubleSide})))}
 if(ext==='fbx'){const loader=new FBXLoader();return normalized(loader.parse(data,''))}
 throw Error('Unsupported model extension');
 }finally{URL.revokeObjectURL(url)}}
export async function export3D(root,format){if(!root)throw Error('3D workspace is not ready');ensureFormat('model.'+format,EXPORT_3D);
 const scene=new THREE.Group();root.updateMatrixWorld(true);for(const child of root.children){const copy=child.clone(true);scene.add(copy)}
 if(format==='glb'||format==='gltf'){const binary=format==='glb';const data=await new GLTFExporter().parseAsync(scene,{binary,onlyVisible:true,trs:false});return {data:binary?data:JSON.stringify(data,null,2),mime:binary?'model/gltf-binary':'model/gltf+json'}}
 if(format==='obj'){return {data:new OBJExporter().parse(scene),mime:'text/plain'}}
 return {data:new STLExporter().parse(scene,{binary:true}),mime:'model/stl'}
}
export function downloadModel(filename,result){const blob=new Blob([result.data],{type:result.mime});const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000)}
