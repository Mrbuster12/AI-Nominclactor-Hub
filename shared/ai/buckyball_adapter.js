(function(){
  if (typeof window==='undefined') return;
  if (!window.DSMCTC) return;
  if (DSMCTC.__buckyPatched) return;
  DSMCTC.__buckyPatched = true;

  var base = DSMCTC.compose || function(p){ return { plan:{} }; };

  function influenceFromBucky(){
    try {
      var s = window.AIEngine && AIEngine.Bucky && AIEngine.Bucky.snapshot ? AIEngine.Bucky.snapshot() : null;
      if (!s) return null;
      var out = { path:null, cadence:null, interventions:[] };
      if (s.metrics.arousalAvg>0.7 || s.metrics.distressAvg>0.6){
        out.path = 'stabilization';
        out.cadence = { sessionsPerWeek:2, reviewInDays:7 };
        out.interventions.push('Group de-escalation protocol');
      }
      return out;
    } catch(e){ return null; }
  }

  DSMCTC.compose = function(payload){
    var res = base(payload||{}) || {};
    res.plan = res.plan || {};
    var inf = influenceFromBucky();
    if (inf){
      res.plan.interventions = (res.plan.interventions||[]).concat(inf.interventions||[]);
      if (!res.plan.path && inf.path) res.plan.path = inf.path;
      if (!res.plan.cadence && inf.cadence) res.plan.cadence = inf.cadence;
    }
    try {
      if (window.AIEngine && AIEngine.bus && AIEngine.bus.emit) AIEngine.bus.emit('tplan:update',{ts:Date.now(), payload:payload, result:res});
    } catch(e){}
    return res;
  };
})();
