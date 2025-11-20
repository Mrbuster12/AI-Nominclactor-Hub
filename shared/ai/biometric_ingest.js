(function(){
  if (typeof window==='undefined') return;
  window.AIEngine = window.AIEngine || {};
  AIEngine.Sensors = AIEngine.Sensors || {};
  function normalize(s){ s=s||{}; return {
    hr:Number(s.hr||0), hrv:Number(s.hrv||0), gsr:Number(s.gsr||0),
    ekg:s.ekg||null, gaze:s.gaze||{}, textSentiment:s.textSentiment||null, voiceArousal:s.voiceArousal||null
  }; }
  function mapToClinical(f){ var crdpss={}, risk={};
    if (f.hr>110 && f.hrv>0 && f.hrv<15 && f.gsr>0.8){ crdpss.agitationScore=Math.min(5,3+Math.round((f.hr-110)/20)); risk.Agitation=true; }
    if (f.voiceArousal && f.voiceArousal>0.75){ crdpss.arousal=Math.round(5*f.voiceArousal); risk.Escalation=true; }
    if (f.textSentiment && f.textSentiment<-0.7){ crdpss.distress=Math.min(5,3+Math.round(2*(-f.textSentiment))); }
    return { crdpss:crdpss, risk:risk };
  }
  AIEngine.Sensors.ingest = function(payload, meta){
    try{
      payload = payload||{}; payload.sensors = payload.sensors||{};
      var f = normalize(payload.sensors); var m = mapToClinical(f);
      var out = Object.assign({}, payload, { sensors:f });
      out.crdpss = Object.assign({}, payload.crdpss||{}, m.crdpss);
      out.risk   = Object.assign({}, payload.risk||{},   m.risk);
      if (window.VSCBridge && VSCBridge.publish) VSCBridge.publish('ctc_update', out, Object.assign({ module:'biometric:ingest' }, meta||{}));
      if (window.DSMCTC && DSMCTC.compose) try{ DSMCTC.compose(out); }catch(e){}
      return out;
    }catch(e){ return payload||{}; }
  };
})();
