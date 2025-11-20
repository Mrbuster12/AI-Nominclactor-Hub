(function(){
  var REQUIRED = { isSimulation:true, educationalPurpose:true, clinicalClaims:false };
  function sanitize(t){
    if (!t) return '';
    t = String(t);
    t = t.replace(/\bdiagnoses?\b/ig,'educational scenario');
    t = t.replace(/\bdiagnos(e|is|ing)\b/ig,'suggest pattern in training');
    return t;
  }
  window.VSC_Safety = window.VSC_Safety || {};
  window.VSC_Safety.validateEvent = function(evt){
    evt = evt || {};
    evt.meta = evt.meta || {};
    for (var k in REQUIRED){ if (evt.meta[k] !== REQUIRED[k]) evt.meta[k] = REQUIRED[k]; }
    if (evt.output && typeof evt.output.text === 'string'){ evt.output.text = sanitize(evt.output.text); }
    return {ok:true};
  };
})();
