(function(){
  function pick(arr, idx){ return Array.isArray(arr) ? arr[idx] : undefined; }
  function text(x){ return x ? (x.label || x.name || x.toString()) : ''; }

  function tierClassifier(intake){
    const d = intake || {};
    if (d.risk && d.risk.tier) return d.risk.tier;

    const primaryDx = pick(d.diagnostics && d.diagnostics.candidates, 0);
    const hasSevere = /F3[2-3]\.2|F33\.3|F20|F31|F43\.1|F10\.2|F11\.2/i.test(text(primaryDx));
    if (hasSevere) return 'CTC-3';

    const problems = d.presenting && d.presenting.problems || [];
    if ((problems||[]).length >= 3) return 'CTC-2';

    return 'CTC-1';
  }

  window.AIIntake = window.AIIntake || {};
  window.AIIntake.tierClassifier = tierClassifier;
})();
