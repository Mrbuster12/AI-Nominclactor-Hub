(()=>{ if(window.ProjectionBus) return;
  const subs=new Set();
  window.ProjectionBus={
    emit(type,payload={},meta={}){ const evt={type,payload,meta:{...meta,ts:Date.now(),ver:'proj/1.0'}};
      try{ document.dispatchEvent(new CustomEvent('vsc:projection',{detail:evt})) }catch{}
      subs.forEach(fn=>{ try{ fn(evt) }catch{} });
      (window.VSC_PROJECTION_LOG ||= []).push(evt);
      console.log('[projection:emit]', type, evt);
      return evt;
    },
    on(fn){ subs.add(fn); return ()=>subs.delete(fn); }
  };
  console.log('[projection] bus ready');
})();
