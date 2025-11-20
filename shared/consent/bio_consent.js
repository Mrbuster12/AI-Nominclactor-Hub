(function(){
  if (typeof window==='undefined') return;
  window.AIEngine = window.AIEngine || {};
  AIEngine.Consent = AIEngine.Consent || {};
  var KEY = "bio:consent:v1";
  var LEDG = "bio:consent:ledger";
  var TEXT = "/shared/consent/bio_consent_text.json";
  function djb2(s){ var h=5381,i=s.length; while(i){ h=(h*33) ^ s.charCodeAt(--i); } return (h>>>0).toString(16); }
  function now(){ return new Date().toISOString(); }
  function load(k){ try{ var v=localStorage.getItem(k); return v? JSON.parse(v): null; }catch(e){ return null; } }
  function save(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ return false; } }
  function appendLedger(stamp){ var L = load(LEDG) || []; L.push(stamp); save(LEDG,L); return L; }
  function publish(topic,payload,meta){ try{
    if (window.VSCBridge && VSCBridge.publish) VSCBridge.publish(topic,payload,meta||{});
    if (window.AIEngine && AIEngine.bus && AIEngine.bus.emit) AIEngine.bus.emit(topic,payload);
  }catch(e){} }
  function stampPhase(consentObj, phase, ctx){
    var s = { ts: now(), phase: phase||"unspecified", textHash: consentObj.textHash||"n/a", version: consentObj.version||"1.0", ctx: ctx||{} };
    appendLedger(s); publish('consent:stamp',{ consent:consentObj, stamp:s },{ module:'consent' }); return s;
  }
  AIEngine.Consent.get = function(){ return load(KEY); };
  AIEngine.Consent.ledger = function(){ return load(LEDG) || []; };
  AIEngine.Consent.ensure = function(phase, ctx){
    return fetch(TEXT,{cache:'no-store'}).then(function(r){ return r.json(); }).then(function(j){
      var text = String(j && j.text || "");
      var base = load(KEY) || { granted:true, version:String(j.version||"1.0"), title:j.title||"Consent", textHash:djb2(text), tsFirst:now(), scope:{ sensors:true, mic:true, camera:false } };
      base.tsUpdated = now(); save(KEY, base);
      var today = (new Date()).toDateString();
      var stampedToday = (load(LEDG)||[]).some(function(x){ return x.phase===phase && (new Date(x.ts)).toDateString()===today && x.textHash===base.textHash; });
      var stamped = stampedToday ? null : stampPhase(base, phase, ctx||{});
      publish('ai_engine_ready', { consent:base, stamped:stamped }, { module:'consent' });
      return { consent:base, stamped:stamped };
    }).catch(function(){ return { error:true }; });
  };
  if (document && document.addEventListener){
    document.addEventListener('DOMContentLoaded', function(){ AIEngine.Consent.ensure('hub:init',{ path: location.pathname }); });
  }
})();
