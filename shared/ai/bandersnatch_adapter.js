(function(){
  if (typeof window==='undefined') return;
  if (!window.DSMCTC) return;
  if (DSMCTC.__bandersnatchPatched) return;
  DSMCTC.__bandersnatchPatched = true;

  var base = DSMCTC.compose || function(p){ return { plan:{} }; };

  DSMCTC.compose = function(payload){
    var p = payload || {};
    var res = base(p) || {};
    res.plan = res.plan || {};

    try {
      if (window.AIEngine && AIEngine.Bandersnatch && typeof AIEngine.Bandersnatch.route==='function'){
        var route = AIEngine.Bandersnatch.route(p) || {};
        res.plan.objectives = (res.plan.objectives||[]).concat(route.objectives||[]);
        res.plan.interventions = (res.plan.interventions||[]).concat(route.interventions||[]);
        if (!res.plan.cadence && route.cadence) res.plan.cadence = route.cadence;
        if (!res.plan.path && route.path)       res.plan.path = route.path;
      }
    } catch(e){}

    try {
      if (window.AIEngine && AIEngine.bus && typeof AIEngine.bus.emit==='function'){
        AIEngine.bus.emit('tplan:update', { ts:Date.now(), payload:p, result:res });
      }
    } catch(e){}

    return res;
  };
})();
