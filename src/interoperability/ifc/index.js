/** web-ifc IFC4/2x3 ingestion and lossless source-file re-export.
 * Schema-aware semantic extraction is intentionally limited; geometry and edits
 * are NOT silently advertised as full IFC reconstruction.
 */
let api=null;
let originalBytes=null;
let originalFingerprint=null;
export async function initIfc(){if(api)return api;const m=await import('web-ifc');api=new m.IfcAPI();await api.Init();return api}
export async function readIfc(file){const engine=await initIfc();const bytes=new Uint8Array(await file.arrayBuffer());const id=engine.OpenModel(bytes);const records=[];
  try{
    const types=['IFCWALL','IFCWALLSTANDARDCASE','IFCSLAB','IFCCOLUMN','IFCBEAM','IFCDOOR','IFCWINDOW','IFCFLOWSEGMENT','IFCBUILDINGELEMENTPROXY'];
    const seen=new Set();
    for(const type of types){const code=(await import('web-ifc'))[type];if(code===undefined)continue;const ids=engine.GetLineIDsWithType(id,code);
      for(let i=0;i<ids.size();i++){const expressID=ids.get(i);if(seen.has(expressID))continue;seen.add(expressID);
        const item=engine.GetLine(id,expressID);records.push({expressID,ifcType:type,guid:item?.GlobalId?.value||'',name:item?.Name?.value||`${type} #${expressID}`,description:item?.Description?.value||''});
      }
    }
  }finally{engine.CloseModel(id)}
  originalBytes=bytes;
  originalFingerprint=JSON.stringify(records);
  return records;
}
export function originalIfcAvailable(){return Boolean(originalBytes)}
export function exportUnmodifiedIfc(){if(!originalBytes)throw new Error('No imported IFC file available');return new Uint8Array(originalBytes)}
export function getImportedFingerprint(){return originalFingerprint}
