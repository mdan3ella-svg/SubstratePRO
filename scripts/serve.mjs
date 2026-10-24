import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.wasm':'application/wasm','.json':'application/json','.css':'text/css'};
http.createServer((req,res)=>{let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return}
const file=path.resolve(root,'.'+pathname);if(!(file===root||file.startsWith(root+path.sep))){res.writeHead(403).end();return}
let full=file;try{if(fs.statSync(full).isDirectory()) full=path.join(full,'index.html');const s=fs.statSync(full);res.writeHead(200,{'Content-Type':types[path.extname(full)]||'application/octet-stream','Content-Length':s.size,'Cache-Control':'no-cache'});fs.createReadStream(full).pipe(res)}catch{res.writeHead(404).end('Not found')}}).listen(4173,()=>console.log('http://localhost:4173/'));
