(function(){
  const CH = 'vsc_bridge_channel';

  function publish(topic, payload){
    try{
      if (window.VSCBridge && typeof VSCBridge.publish === 'function') {
        return VSCBridge.publish(topic, payload);
      }
      const bc = new BroadcastChannel(CH);
      bc.postMessage({ topic, payload });
      try{ bc.close(); }catch{}
    }catch(e){ console.warn('[ai_intake:bridge_bus] publish error', e); }
  }

  function subscribe(topic, handler){
    let off = null;
    try{
      if (window.VSCBridge && typeof VSCBridge.subscribe === 'function') {
        off = VSCBridge.subscribe(topic, e => handler && handler(e.payload ?? e));
        return () => { try{ off && off(); }catch{} };
      }
      const bc = new BroadcastChannel(CH);
      bc.onmessage = ev => {
        const { topic: t, payload } = ev.data || {};
        if (t === topic) handler && handler(payload);
      };
      off = () => { try{ bc.close(); }catch{} };
      return off;
    }catch(e){ console.warn('[ai_intake:bridge_bus] subscribe error', e); }
    return () => {};
  }

  window.AIIntake = window.AIIntake || {};
  window.AIIntake.BridgeBus = { publish, subscribe };
})();
