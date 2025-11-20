(function(w){
  if (w.AIEngine && w.AIEngine.bus) return;
  function Emitter(){
    const m=new Map();
    return {
      on:(t,f)=>{ if(!m.has(t)) m.set(t,new Set()); m.get(t).add(f); },
      off:(t,f)=>{ const s=m.get(t); if(s) s.delete(f); },
      emit:(t,p)=>{ const s=m.get(t); if(s) s.forEach(fn=>{ try{fn(p);}catch(_){}}); }
    };
  }
  const bus = Emitter();
  const bcName = 'vsc_ai_bus';
  try{
    const bc = new BroadcastChannel(bcName);
    bus.on('*', pkt=> bc.postMessage(pkt));
    bc.onmessage = e => { const pkt=e && e.data; if(pkt && pkt.type) bus.emit(pkt.type, pkt.payload); };
  }catch(_){}
  const shim = {
    on:(t,f)=> bus.on(t,f),
    emit:(t,p)=>{ bus.emit(t,p); try{ bus.emit('*',{type:t,payload:p}); }catch(_){ } }
  };
  w.AIEngine = w.AIEngine || {};
  w.AIEngine.bus = shim;
})(window);
