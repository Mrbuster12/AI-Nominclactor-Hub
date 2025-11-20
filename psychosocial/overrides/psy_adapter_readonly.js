(() => {
  if (window.__PSY_ADAPTER_LOADED__) { return; }
  window.__PSY_ADAPTER_LOADED__ = true;

  const has = k => !!k.split('.').reduce((o,p)=>o&&o[p], window);
  const nowISO = () => new Date().toISOString();
  const emit = (name, detail={}) => { try { window.dispatchEvent(new CustomEvent(name,{detail:{ts:nowISO(),...detail}})); } catch(e){} };

  window.PSYCHOSOC_ADAPTERS = Object.freeze({ vnp:false, consent:false, group:false });

  const S = {
    scenario: document.getElementById('scenarioSelect') || document.querySelector('#scenarioSelect, select[name*="scenario"]'),
    biometric: document.getElementById('biometric'),
    signature: document.getElementById('signature'),
    dapData: document.getElementById('dapData'),
    dapAssessment: document.getElementById('dapAssessment'),
    dapPlan: document.getElementById('dapPlan'),
    sessionNote: document.getElementById('sessionNote')
  };

  if (S.scenario) {
    const fire = () => emit('psychosocial.scenario.selected',{key:S.scenario.value,where:'psychosocial'});
    S.scenario.addEventListener('change', fire);
    if (S.scenario.value) fire();
  }

  const debounce = (fn, ms=250) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; };
  const onDapTouch = debounce(() => {
    const changed = ['dapData','dapAssessment','dapPlan','sessionNote'].filter(k => S[k] && S[k].value);
    if (changed.length) emit('psychosocial.dap.autofill', { fields: changed });
  }, 300);

  ['dapData','dapAssessment','dapPlan','sessionNote'].forEach(k => { if (S[k]) S[k].addEventListener('input', onDapTouch, {passive:true}); });
  try { const mo = new MutationObserver(debounce(onDapTouch,200)); mo.observe(document.body,{subtree:true,childList:true,characterData:true}); } catch(e){}

  try { if (has('hookRegistry') && hookRegistry && typeof hookRegistry.on==='function') { hookRegistry.on('checkpoint', ck => emit('psychosocial.checkpoint',{checkpoint:ck})); } } catch(e){}

  const BASE = new URL('./', location.href);
  const j = p => fetch(new URL(p, BASE), {cache:'no-store'}).then(r => r.ok ? r.json() : Promise.reject(p+' HTTP '+r.status));

  const Logic = {
    data:{treatment_logic:null,scenarios:null,dialogue:null},
    async load(){
      try{
        const [tl,sc,dg] = await Promise.all([
          j('treatment_logic.json').catch(()=>null),
          j('vsc_scenarios.json').catch(()=>null),
          j('vsc_dialogue.json').catch(()=>null)
        ]);
        this.data.treatment_logic=tl; this.data.scenarios=sc; this.data.dialogue=dg;
        return true;
      }catch(e){ return false; }
    },
    derivePlan(ctc){
      const tl=this.data.treatment_logic||{};
      const sc=this.data.scenarios||{};
      const key=(ctc.scenarioKey && sc[ctc.scenarioKey])? ctc.scenarioKey : Object.keys(sc)[0];
      const scenario=key? sc[key] : null;
      const tags=new Set([
        ...(scenario?.goals||[]).map(x=>String(x).toLowerCase()),
        ...(scenario?.biometric_flags||[]).map(x=>String(x).toLowerCase()),
        ...(scenario?.scrl_checkpoints||[]).map(x=>String(x).toLowerCase())
      ]);
      const pick=(arr=[],n=3)=>arr.slice(0,n);
      const goals=scenario? pick(scenario.goals,3) : [];
      const objectives=(tl?.objectives_by_flag ? [...tags].flatMap(t => tl.objectives_by_flag[t] || []) : []).slice(0,4);
      const homeworkRefs=(tl?.homework_by_flag ? [...tags].flatMap(t => tl.homework_by_flag[t] || []) : []).slice(0,3);
      return { scenarioKey:key||null, goals, objectives, homeworkRefs, rationale:[...tags].slice(0,6) };
    }
  };

  window.PsychoSocBridge = Object.freeze({
    derivePlan: ctc => Logic.derivePlan(ctc),
    status: () => ({
      flags: window.PSYCHOSOC_ADAPTERS,
      buses: { VNPBridge: has('VNPBridge'), VNPBus: !!window.VNPBus, ConsentBus: has('ConsentBus') },
      engines: { DSMCTC: has('DSMCTC'), AIEngine: has('AIEngine') }
    })
  });

  window.psychosocialEmitPlan = function(opts={}){
    const get = id => document.getElementById(id)?.value || null;
    const scenarioKey = opts.scenarioKey ?? get('scenarioSelect');
    const biometric   = opts.biometric   ?? (get('biometric') || 'Moderate');
    if (!window.PsychoSocBridge || typeof PsychoSocBridge.derivePlan!=='function') return null;
    const plan = PsychoSocBridge.derivePlan({scenarioKey,biometric}) || {};
    const payload = { ts: nowISO(), source:'psychosocial', scenarioKey, biometric, plan };
    try { window.dispatchEvent(new CustomEvent('psychosocial.plan.ready',{detail:payload})); } catch(e){}
    return payload;
  };

  (async()=>{ await Logic.load(); const ctc={ scenarioKey:S.scenario?.value||null, biometric:S.biometric?.value||'Moderate' }; const suggestion=Logic.derivePlan(ctc); emit('psychosocial.session.suggestedPlan', suggestion); })();
})();
