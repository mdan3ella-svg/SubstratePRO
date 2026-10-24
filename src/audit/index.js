import{validateDocument}from'../core/validation/index.js';import{assemblyWarnings}from'../detailcore/assembly-solver/index.js';
export function runAudit(doc){return [...validateDocument(doc),...assemblyWarnings(doc)]}
