(function(){
  if (typeof window==='undefined') return;
  window.DSMCTC = window.DSMCTC || {};
  var base = DSMCTC.compose || function(p){ return { plan:{ objectives:[], interventions:[] } } };
  DSMCTC.compose = function(payload){
    var p = payload || {};
    p.ai = p.ai || {};
    if (!p.ai.introspective && window.AIEngine && AIEngine.Introspective) p.ai.introspective = AIEngine.Introspective.analyze(p);
    if (!p.ai.projection && window.AIEngine && AIEngine.Projection)     p.ai.projection     = AIEngine.Projection.plan(p);
    var res = base(p) || {};
    res.plan = res.plan || {};
    var proj = p.ai.projection || {};
    res.plan.objectives = (res.plan.objectives||[]).concat(proj.objectives||[]);
    res.plan.interventions = (res.plan.interventions||[]).concat(proj.interventions||[]);
    if (!res.plan.cadence && proj.cadence) res.plan.cadence = proj.cadence;
    if (!res.plan.path && proj.path)       res.plan.path    = proj.path;
    try { AIEngine.bus && AIEngine.bus.emit('tplan:update', { ts:Date.now(), payload:p, result:res }) } catch(e){}
    return res;
  };
})();
