(function(){
  if (typeof window==='undefined') return;
  window.AIEngine = window.AIEngine || {};
  AIEngine.VNP = AIEngine.VNP || {};
  AIEngine.VNP.evaluate = function(input){
    return { tier:'Tier 2 (Focused)', flags:{ SI:false, HI:false, Psychosis:false }, riskSummary:'moderate', dsm:(input && input.dsm) || ['F32.9'] };
  };
  AIEngine.VNP.publish = function(input){
    var ev = AIEngine.VNP.evaluate(input||{});
    var env = { tier:ev.tier, flags:ev.flags, riskNote:ev.riskSummary, ts:Date.now(), dsm:ev.dsm };
    try{ if (window.Bridge) Bridge.save('vnp:last', env); }catch(e){}
    try{ if (window.VSCBridge && VSCBridge.publish) VSCBridge.publish('ctc_update', env, { module:'vnp' }); }catch(e){}
    return env;
  };
})();
