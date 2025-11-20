(function(){
  const CH = new BroadcastChannel('ctc_bus');

  function postAll(detail){
    try{
      CH.postMessage({ type:'ctc_update', detail });
      CH.postMessage({ type:'ctc_risk_update', detail });
      CH.postMessage({ type:'ctc_specifiers_update', detail });
    }catch(e){ console.error('[broadcast_bus] post', e); }
  }

  // When this page sees local updates, broadcast to other tabs
  window.addEventListener('ctc_update',        e => postAll(e.detail));
  window.addEventListener('ctc_risk_update',   e => CH.postMessage({ type:'ctc_risk_update', detail:e.detail }));
  window.addEventListener('ctc_specifiers_update', e => CH.postMessage({ type:'ctc_specifiers_update', detail:e.detail }));

  // When this page hears channel messages, re-emit locally
  CH.onmessage = (e)=>{
    const { type, detail } = e.data || {};
    if(!type || !detail) return;
    try{ window.dispatchEvent(new CustomEvent(type, { detail })); }
    catch(err){ console.error('[broadcast_bus] dispatch', err); }
  };

  // Optional helper
  window.CTC_CH = Object.freeze({
    emit: (detail)=> postAll(detail)
  });
})();
