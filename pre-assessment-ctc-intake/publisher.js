
(function(){
  function collectSignals(){
    const s = [];
    if (document.getElementById('flag_si').checked) s.push('suicide');
    if (document.getElementById('flag_hi').checked) s.push('homicide');
    if (document.getElementById('flag_psy').checked) s.push('psychosis');
    const p = document.getElementById('intro_primary').value;
    if (p) s.push(p);
    return s;
  }
  function computeTier(signals){
    if (signals.includes('psychosis')) return 'CTC-5';
    if (signals.includes('suicide') || signals.includes('homicide')) return 'CTC-4';
    if (signals.includes('relapse')) return 'CTC-3';
    return 'CTC-2';
  }
  function buildEnv(){
    const env = {
      source: 'PREASSESS',
      dsmText: document.getElementById('dsm_codes').value || '',
      riskText: document.getElementById('risk_notes').value || '',
      signals: collectSignals()
    };
    env.careTier = computeTier(env.signals);
    return env;
  }
  function render(env){
    document.getElementById('tier').textContent = env.careTier;
    document.getElementById('signals').textContent = JSON.stringify(env.signals||[]);
  }
  function publish(){
    const env = buildEnv();
    render(env);
    if (window.VSCBridge) window.VSCBridge.publish('ctc_update', env);
  }
  document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('publish').addEventListener('click', publish);
    ['flag_si','flag_hi','flag_psy','dsm_codes','risk_notes','intro_primary'].forEach(id=>{
      const el = document.getElementById(id); el && el.addEventListener('change', publish);
    });
  });
})();
