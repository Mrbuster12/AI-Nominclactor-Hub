(function(){
  if (typeof window==='undefined') return;
  function ensureBtn(){
    if (document.getElementById('aiQuickButton')) return;
    var b=document.createElement('button');
    b.id='aiQuickButton';
    b.textContent='AI';
    b.title='Run Introspective + Projection and publish';
    b.onclick = async function(){
      try{
        var payload = window.__psychPayload || {};
        payload.hub = payload.hub || { origin: location.pathname };
        if (window.AIEngine){
          if (AIEngine.Introspective && typeof AIEngine.Introspective.analyze==='function'){
            payload.ai = payload.ai || {};
            payload.ai.introspective = AIEngine.Introspective.analyze(payload);
          }
          if (AIEngine.Projection && typeof AIEngine.Projection.plan==='function'){
            payload.ai = payload.ai || {};
            payload.ai.projection = AIEngine.Projection.plan(payload);
          }
          if (AIEngine.bus && typeof AIEngine.bus.emit==='function'){
            AIEngine.bus.emit('ctc_update', { ts: Date.now(), payload: payload });
          }
        }
        if (window.VSCBridge && typeof VSCBridge.publish==='function'){
          VSCBridge.publish('ctc_update', payload, { module:'ai:quick' });
        }
        console.log('[AI Quick] payload', payload);
        alert('AI ran: introspective + projection merged and published');
      }catch(e){
        console.error('[AI Quick] error', e);
        alert('AI button error: '+e.message);
      }
    };
    document.body.appendChild(b);
  }
  if (document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', ensureBtn); } else { ensureBtn(); }
})();
