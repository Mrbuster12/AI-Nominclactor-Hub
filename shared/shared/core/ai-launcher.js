const btn = document.getElementById('vsc-ai-open');
function get(sel){ const el=document.querySelector(sel); if(!el) return ""; const v=el.type==="checkbox"? (el.checked?"yes":"no") : (el.value||el.textContent||""); return (v||"").toString().trim(); }
function getHashKey(){ try{ return (new URLSearchParams(location.hash.slice(1))).get('k')||""; }catch(e){ return ""; } }

const fieldHints = [
  '[name="presenting_problem"]',
  '[name="strengths"]',
  '[name="risk_factors"]',
  '[name="goals_hint"]',
  '[name="objectives_hint"]',
  '[name="methods_hint"]',
  'textarea[name="presenting_problem"]',
  'textarea[name="strengths"]',
  'textarea[name="risk_factors"]'
];

function harvest(){
  const data = {
    source: 'psychosocial',
    presenting_problem: get('[name="presenting_problem"]') || get('textarea[name="presenting_problem"]'),
    strengths: get('[name="strengths"]') || get('textarea[name="strengths"]'),
    risks: get('[name="risk_factors"]') || get('textarea[name="risk_factors"]'),
    goals_hint: get('[name="goals_hint"]'),
    objectives_hint: get('[name="objectives_hint"]'),
    methods_hint: get('[name="methods_hint"]'),
    ts: new Date().toISOString(),
    k: getHashKey()
  };
  if(!data.presenting_problem && !data.strengths && !data.risks){
    for(const sel of fieldHints){ const v=get(sel); if(v){ data.presenting_problem = data.presenting_problem || v; } }
  }
  return data;
}

function emit(name, detail){ window.dispatchEvent(new CustomEvent(name,{detail})); }
if(btn){
  btn.addEventListener('click', ()=>{
    const payload = harvest();
    emit('tp_intake_update', payload);
    emit('ctc_update', payload);
    btn.textContent = 'AI ✓';
    setTimeout(()=>{ btn.textContent='AI'; }, 1200);
  }, {passive:true});
}
