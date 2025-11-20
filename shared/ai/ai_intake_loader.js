(function () {
  console.log('[AI Intake Loader] queued');
  try{
    var raw = localStorage.getItem('VSC_SNAPSHOT');
    if(raw){
      var obj = JSON.parse(raw);
      try{ new BroadcastChannel('vsc_bridge_channel').postMessage({ type:'ctc_update', payload: obj, ts: Date.now() }); }catch{}
    }
  }catch{}
})();
