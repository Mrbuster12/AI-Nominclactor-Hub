export async function loadManifests(){
  async function j(u){ try{ const r=await fetch(u); if(!r.ok) throw 0; return await r.json(); }catch(_){ return null; } }
  const pdfs = await j('/psychosocial/manifests/pdfs_manifest.json');
  const hw   = await j('/recovery-coach/manifests/homework_manifest.json');
  return { pdfs, hw };
}
export function suggestFrom(detail, manifests){
  const out = { goals:[], interventions:[], homework:[], references:[] };
  const risk = (detail && detail.risk) || {};
  const spec = (detail && detail.specifiers) || {};
  try{
    if(risk.suicide_current || risk.dv_risk){ out.goals.push('Immediate safety planning'); }
    if(spec.anxiety){ out.interventions.push('CBT anxiety protocol starter'); }
    if(manifests && manifests.hw && Array.isArray(manifests.hw.assignments)){
      out.homework.push(...manifests.hw.assignments.slice(0,3));
    }
    if(manifests && manifests.pdfs && Array.isArray(manifests.pdfs.packs)){
      out.references.push(...manifests.pdfs.packs.slice(0,3));
    }
  }catch(_){}
  return out;
}
