(()=>{ if (window.ConsentBus) return;
  const ch=new BroadcastChannel('vsc-consent'); const subs=new Set();
  window.ConsentBus={
    emit(type,payload={},meta={}){ const evt={type,payload,meta:{...meta,ts:Date.now(),ver:'consent/1.0'}};
      try{ch.postMessage(evt)}catch{}; subs.forEach(fn=>{try{fn(evt)}catch{}});
      try{document.dispatchEvent(new CustomEvent('vsc:consent',{detail:evt}))}catch{};
      (window.VSC_CONSENT_LOG ||= []).push(evt); console.log('[consent:emit]', type, evt); return evt; },
    on(fn){ subs.add(fn); return ()=>subs.delete(fn); }
  };
})();
