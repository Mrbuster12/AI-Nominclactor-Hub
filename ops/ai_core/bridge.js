(()=>{ if (window.AIBus) return;
  const subs=new Set();
  window.AIBus={
    emit(type,payload={},meta={}){ const evt={type,payload,meta:{...meta,ts:Date.now(),ver:'ai/1.0'}};
      try{document.dispatchEvent(new CustomEvent('vsc:ai',{detail:evt}))}catch{}
      subs.forEach(fn=>{try{fn(evt)}catch{}});
      (window.VSC_AI_LOG ||= []).push(evt);
      console.log('[ai:emit]', type, evt); return evt;
    },
    on(fn){ subs.add(fn); return ()=>subs.delete(fn); }
  };
})();
