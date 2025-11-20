(()=>{ if (window.RetinaBus) return;
  const subs=new Set();
  window.RetinaBus={
    emit(type,payload={},meta={}){
      const evt={type,payload,meta:{...meta,ts:Date.now(),ver:'rv/1.0'}};
      try{document.dispatchEvent(new CustomEvent('vsc:retina',{detail:evt}))}catch{}
      subs.forEach(fn=>{try{fn(evt)}catch{}});
      (window.VSC_RETINA_LOG ||= []).push(evt);
      console.log('[retina:emit]',type,evt);return evt;
    },
    on(fn){subs.add(fn);return()=>subs.delete(fn);}
  };
})();
