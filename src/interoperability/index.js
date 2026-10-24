import{parseDocument}from'../core/document-model/index.js';
export function importJSON(text){return parseDocument(text)}
export function exportJSON(doc){return JSON.stringify(doc,null,2)}
export function download(name,text,type='text/plain'){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([text],{type}));a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000)}
