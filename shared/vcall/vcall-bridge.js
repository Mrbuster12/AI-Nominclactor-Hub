(function(){
  if (typeof window==='undefined') return;
  window.AIEngine = window.AIEngine || {};
  AIEngine.bus = AIEngine.bus || { on:function(){}, emit:function(){} };

  function publish(topic, payload){
    try {
      if (AIEngine.bus && AIEngine.bus.emit) AIEngine.bus.emit(topic, payload||{});
      if (window.VSCBridge && VSCBridge.publish) VSCBridge.publish(topic, payload||{}, {module:'vcall-bridge'});
    } catch(e){}
  }

  window.VCall = window.VCall || {};
  VCall.onJoin = function(meta){ publish('vcall:join', meta); };
  VCall.onLeave = function(meta){ publish('vcall:leave', meta); };
  VCall.onSpeaking = function(meta){ publish('vcall:speaking', meta); };
  VCall.onSilence = function(meta){ publish('vcall:silence', meta); };
  VCall.onQuality = function(meta){ publish('vcall:quality', meta); };

  console.log('[vcall-bridge] ready');
})();
