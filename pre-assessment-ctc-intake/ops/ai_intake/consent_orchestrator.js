(function(){
  const Bus = (window.AIIntake && window.AIIntake.BridgeBus) || { publish(){}, subscribe(){ return ()=>{} } };
  const probe = (window.AIIntake && window.AIIntake.capabilityProbe) || (function(){ return {}; });
  const classify = (window.AIIntake && window.AIIntake.tierClassifier) || (function(){ return 'CTC-1'; });
  const PM = (window.AIIntake && window.AIIntake.PermissionManager) || { requiredPermissions(){return[]}, summarize(){return{}} };

  function snapshot(key, obj){
    try{ localStorage.setItem(key, JSON.stringify(obj)); }catch(e){}
  }

  function runOrchestrator(intake){
    const caps = probe();
    const tier = classify(intake||{});
    const needs = PM.requiredPermissions(caps);

    const model = {
      tier,
      capabilities: caps,
      requiredConsents: needs,
      ts: Date.now()
    };

    snapshot('AI_INTAKE_ORCH', model);
    Bus.publish('ai_intake:orchestrated', model);
    return model;
  }

  function wire(){
    try{
      Bus.subscribe('ctc_update', payload => {
        const m = runOrchestrator(payload||{});
        console.log('[ai_intake] orchestrated', m);
      });
    }catch(e){ console.warn('[ai_intake] wire error', e); }
  }

  window.AIIntake = window.AIIntake || {};
  window.AIIntake.Orchestrator = { run: runOrchestrator, wire };
})();
