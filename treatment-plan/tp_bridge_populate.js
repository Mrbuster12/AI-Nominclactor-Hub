(() => {
  if (window.__TP_BRIDGE_INSTALLED__) return;
  window.__TP_BRIDGE_INSTALLED__ = true;

  const $ = (s, r=document) => r.querySelector(s);
  const tryFill = (arr, v) => { for (const sel of arr){ const el=$(sel); if(el){ if('value' in el) el.value = v ?? ''; else el.textContent = v ?? ''; return true; } } return false; };
  let lastSig = null;
  const sig = o => { try { return JSON.stringify(o); } catch { return String(Date.now()); } };

  function normalize(ctc){
    if(!ctc) return null;
    const dx = (ctc.diagnostics?.candidates || ctc.dx?.candidates || []).slice(0,3);
    const probs = (ctc.presenting?.problems || ctc.symptoms || []).slice(0,5);
    const goals = (ctc.goals || ctc.mi?.goals || []).slice(0,5);
    return {
      client:{ name: ctc.demographics?.fullName || ctc.client?.name || '', dob: ctc.demographics?.dob || ctc.client?.dob || '', mrn: ctc.demographics?.mrn || ctc.client?.mrn || '' },
      risk:{ tier: ctc.risk?.tier || ctc.ctcTier || '', notes: ctc.risk?.notes || '' },
      diagnosis:{
        primary:  dx[0] ? (dx[0].code ? `${dx[0].code} — ${dx[0].label||dx[0].name||''}` : (dx[0].label||dx[0].name||'')) : '',
        secondary:dx[1] ? (dx[1].code ? `${dx[1].code} — ${dx[1].label||dx[1].name||''}` : (dx[1].label||dx[1].name||'')) : '',
        tertiary: dx[2] ? (dx[2].code ? `${dx[2].code} — ${dx[2].label||dx[2].name||''}` : (dx[2].label||dx[2].name||'')) : ''
      },
      presenting:{ problems: probs },
      goals,
      modality:{ primary: ctc.modality?.primary || 'CBT', secondary: ctc.modality?.secondary || 'MI' }
    };
  }

  function populate(tp){
    if(!tp) return;
    tryFill(['#tp-client-name','[name="tp-client-name"]','.tp-client-name'], tp.client?.name);
    tryFill(['#tp-dob','[name="tp-dob"]','.tp-dob'], tp.client?.dob);
    tryFill(['#tp-mrn','[name="tp-mrn"]','.tp-mrn'], tp.client?.mrn);
    tryFill(['#tp-risk-tier','[name="tp-risk-tier"]','.tp-risk-tier'], tp.risk?.tier);
    tryFill(['#tp-risk-notes','[name="tp-risk-notes"]','.tp-risk-notes'], tp.risk?.notes);
    tryFill(['#tp-dx-primary','[name="tp-dx-primary"]','.tp-dx-primary'], tp.diagnosis?.primary);
    tryFill(['#tp-dx-secondary','[name="tp-dx-secondary"]','.tp-dx-secondary'], tp.diagnosis?.secondary);
    tryFill(['#tp-dx-tertiary','[name="tp-dx-tertiary"]','.tp-dx-tertiary'], tp.diagnosis?.tertiary);
    (tp.presenting?.problems||[]).slice(0,3).forEach((p,i)=>{
      const v = p?.label || p?.name || p || '';
      tryFill([`#tp-problem-${i+1}`, `[name="tp-problem-${i+1}"]`, `.tp-problem-${i+1}`], v);
    });
    (tp.goals||[]).slice(0,3).forEach((g,i)=>{
      tryFill([`#tp-goal-${i+1}`, `[name="tp-goal-${i+1}"]`, `.tp-goal-${i+1}`], g?.goal || g?.title || g || '');
      tryFill([`#tp-metric-${i+1}`, `[name="tp-metric-${i+1}"]`, `.tp-metric-${i+1}`], g?.metric || '');
      tryFill([`#tp-horizon-${i+1}`, `[name="tp-horizon-${i+1}"]`, `.tp-horizon-${i+1}`], g?.horizon || '');
    });
    tryFill(['#tp-modality-primary','[name="tp-modality-primary"]','.tp-modality-primary'], tp.modality?.primary);
    tryFill(['#tp-modality-secondary','[name="tp-modality-secondary"]','.tp-modality-secondary'], tp.modality?.secondary);
  }

  function handle(payload){
    const tp = payload?.tpModel ? payload.tpModel : normalize(payload);
    const s = sig(tp);
    if (s === lastSig) return;
    lastSig = s;
    populate(tp);
  }

  try {
    const bc = new BroadcastChannel('vsc_bridge_channel');
    bc.onmessage = ev => { if (ev?.data?.type === 'ctc_update') handle(ev.data.payload); };
    window.__TP_BRIDGE_BC__ = bc;
  } catch(e){}

  const evt = e => handle(e.detail);
  document.addEventListener('ctc_update', evt);
  window.addEventListener('ctc_update', evt);

  try {
    const snap = localStorage.getItem('VSC_SNAPSHOT');
    if (snap) {
      const obj = JSON.parse(snap);
      handle(obj.treatmentPlanDraft || obj.ctc);
    }
  } catch(e){}
})();
