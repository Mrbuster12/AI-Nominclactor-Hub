(()=>{ if(window.VNPBridge) return;
  const subs=new Set();
  window.VNPBridge={
    emit(type,payload={},meta={}){ const evt={type,payload,meta:{...meta,ts:Date.now(),ver:'vnp/1.0'}};
      try{document.dispatchEvent(new CustomEvent('vsc:vnp',{detail:evt}))}catch{}
      subs.forEach(fn=>{try{fn(evt)}catch{}});
      (window.VSC_VNP_LOG ||= []).push(evt);
      console.log('[vnp] emit', type, evt); return evt;
    },
    on(fn){ subs.add(fn); return ()=>subs.delete(fn); }
  };
  console.log('[vnp] bridge ready');
})();
