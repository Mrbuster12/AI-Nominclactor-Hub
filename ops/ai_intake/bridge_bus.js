(()=>{ if(window.AIBridge) return;
  const ch = new BroadcastChannel('vsc-bridge');
  const listeners = new Set();
  const schemaLite = (evt)=> evt && typeof evt.type==='string' && evt.ts && evt.sessionId;
  window.AIBridge = {
    emit(evt){
      evt.ts = evt.ts || new Date().toISOString();
      evt.sessionId = evt.sessionId || (window.VSC_SESSION_ID ||= (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())+'-'+Math.random().toString(36).slice(2)));
      if(!schemaLite(evt)){ console.warn('[bridge] schema fail', evt); return; }
      try{ ch.postMessage(evt); }catch(_){}
      listeners.forEach(fn=>{ try{ fn(evt); }catch(_){ } });
      try{ document.dispatchEvent(new CustomEvent('vsc:bridge',{detail:evt})) }catch(_){}
      (window.VSC_BRIDGE_LOG ||= []).push(evt);
      console.log('[bridge:emit]', evt.type, evt);
    },
    on(fn){ listeners.add(fn); return ()=>listeners.delete(fn); }
  };
})();
