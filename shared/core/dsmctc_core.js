;(function(w){
  var Core = {
    aslt_mapRatingsToSpecifiers: function(r){
      var out=[];
      Object.keys(r||{}).forEach(function(domain){
        var v=+r[domain]||0;
        if(v>=3) out.push('Severe '+domain);
        else if(v===2) out.push('Moderate '+domain);
        else if(v===1) out.push('Mild '+domain);
      });
      return out;
    },
    scrl_adapt: function(spec, profile){
      var tone=(profile&&profile.style)||'supportive';
      return (tone==='supportive'?'Focus on ':'Address ')+spec.toLowerCase();
    },
    dsil_objective: function(spec, lang){
      return 'Client will '+(lang||('address '+spec.toLowerCase()))+' with weekly check-ins.';
    },
    rrle_detectHighRisk: function(spec, ratings, risk){
      var sev=/Severe/i.test(spec);
      var flags=risk||{};
      return !!(sev||flags.SI||flags.HI||flags.Agitation||flags.Intoxication);
    },
    composeTreatmentPlan: function(payload){
      var p={ problems:[], goals:[], objectives:[], interventions:[], tier:'Tier 1 (Routine)' };
      var ratings=payload.crdpss||{};
      var risk=payload.risk||{};
      var specifiers=(payload.dsm&&payload.dsm.length)?payload.dsm.slice():Core.aslt_mapRatingsToSpecifiers(ratings);
      specifiers.forEach(function(spec){
        var lang=Core.scrl_adapt(spec, payload.profile||{style:'supportive'});
        var obj=Core.dsil_objective(spec, lang);
        if(Core.rrle_detectHighRisk(spec, ratings, risk)){
          p.goals.push('Ensure immediate safety and stabilization');
          p.interventions.push('Activate safety plan module');
          p.tier='Tier 3+';
        }
        p.problems.push(spec);
        p.goals.push('Reduce impact of '+spec+' over next 90 days.');
        p.objectives.push(obj);
        p.interventions.push('Introduce CBT strategies and monitoring to address '+spec+'.');
      });
      return p;
    }
  };

  w.DSMCTC=w.DSMCTC||{};
  w.DSMCTC.core=Core;

  if(!w.DSMCTC.ledger){
    w.DSMCTC.ledger={
      load:function(){try{return JSON.parse(localStorage.getItem('vsc:dsmctc:ledger:v1')||'[]');}catch(e){return[];}},
      save:function(a){localStorage.setItem('vsc:dsmctc:ledger:v1',JSON.stringify(a));},
      add:function(entry){var a=this.load();a.push(entry);this.save(a);if(w.AIEngine&&w.AIEngine.bus){w.AIEngine.bus.emit('dsmctc:ledger:update',{size:a.length});}}
    };
  }

  function wire(){
    if(!(w.VSCBridge&&w.AIEngine&&w.AIEngine.bus))return;
    if(w.__DSMCTC_CORE_WIRED__)return;w.__DSMCTC_CORE_WIRED__=true;
    w.VSCBridge.subscribe('ctc_update',function(evt){
      try{
        var payload=evt&&evt.payload||{};
        var plan=Core.composeTreatmentPlan(payload);
        w.AIEngine.bus.emit('tplan:update',plan);
        w.DSMCTC.ledger.add({ts:Date.now(),payload:payload,plan:plan});
      }catch(e){console.warn('[DSMCTC core] compose error',e);}
    });
    console.log('[DSMCTC core] wired on',location.pathname);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
})(window);

// Convenience wrapper: direct call
if (!window.DSMCTC.compose) {
  window.DSMCTC.compose = function(payload) {
    try { return window.DSMCTC.core.composeTreatmentPlan(payload); }
    catch(e){ console.warn('[DSMCTC compose error]', e); return null; }
  };
}

// --- Direct compose helper with ledger save ---
if (!window.DSMCTC.compose) {
  window.DSMCTC.compose = function(payload) {
    try {
      var plan = window.DSMCTC.core.composeTreatmentPlan(payload);
      // also push into ledger
      if (window.DSMCTC.ledger) {
        window.DSMCTC.ledger.add({ ts: Date.now(), payload: payload, plan: plan });
      }
      // emit just like bus wiring would
      if (window.AIEngine && window.AIEngine.bus) {
        window.AIEngine.bus.emit('tplan:update', plan);
      }
      return plan;
    } catch (e) {
      console.warn('[DSMCTC.compose error]', e);
      return null;
    }
  };
}
