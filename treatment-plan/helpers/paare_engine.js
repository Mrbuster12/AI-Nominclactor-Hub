(function(global){
  function firstQuote(intake){
    const arr = (intake && Array.isArray(intake.quotes)) ? intake.quotes : [];
    return arr.length ? arr[0] : null;
  }

  function riskFlags(intake){
    const r = (intake && intake.risk) || {};
    const out = [];
    if (r.dv_risk) out.push('DV risk');
    if (r.suicide_current) out.push('Active suicidality');
    return out;
  }

  function goalsAndObjectives(intake){
    const s = (intake && intake.specifiers) || {};
    const out = { goals:[], objectives:[] };
    const q = firstQuote(intake);

    if (s.insomnia) {
      const g = q ? `Improve sleep hygiene (Client: '${q}')` : 'Improve sleep hygiene';
      out.goals.push(g);
      out.objectives.push('Complete a 14-day sleep diary');
      out.objectives.push('Establish fixed sleep/wake window for 2 weeks');
    }

    if (s.anxiety) {
      out.goals.push('Reduce social anxiety symptoms');
      out.objectives.push('Practice two exposure exercises per week');
      out.objectives.push('Daily breathing practice (5 minutes) for 14 days');
    }

    return out;
  }

  function buildPlan(intake){
    const built = goalsAndObjectives(intake);
    const risk_flags = riskFlags(intake);
    return {
      meta: { version:'v1', source:(intake && intake.source) || 'intake' },
      goals: built.goals,
      objectives: built.objectives,
      risk_flags
    };
  }

  global.PAARE_ENGINE = Object.freeze({ buildPlan });
})(window);
