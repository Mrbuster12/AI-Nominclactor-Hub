(function () {
  console.log('[intake→repo] bridge active');
  function emitCTC(ctc){
    if(!ctc) return;
    if(window.VSCBridge && typeof VSCBridge.publish==='function'){ VSCBridge.publish('ctc_update', ctc); }
    else {
      try{ new BroadcastChannel('vsc_bridge_channel').postMessage({ type:'ctc_update', payload: ctc, ts: Date.now() }); }catch{}
      try{ localStorage.setItem('VSC_SNAPSHOT', JSON.stringify(ctc)); }catch{}
    }
  }
  document.addEventListener('ctc_update', function(e){ emitCTC(e.detail); });
  try{ window.AIEngine && AIEngine.bus && AIEngine.bus.on && AIEngine.bus.on('ctc_update', emitCTC); }catch{}
  window.__emit_ctc_to_tp = emitCTC;
})();
