;(function(){
  if (window.RETINA_STATE) return; // idempotent

  const listeners = [];

  const state = {
    status: 'PENDING',
    lastScanTs: null,
    source: null
  };

  function emit(type, payload){
    const evt = {
      ts: new Date().toISOString(),
      type,
      payload
    };

    listeners.forEach(fn => {
      try { fn(evt); } catch(e){}
    });

    // non-PHI telemetry into RDL if available
    try {
      if (window.RDL && typeof RDL.log === 'function'){
        RDL.log('retina', evt);
      }
    } catch(e){}
  }

  function setStatus(status, meta){
    const allowed = ['PENDING','VERIFIED','FAILED','OVERRIDE'];
    if (allowed.indexOf(status) === -1) return;

    state.status = status;
    state.lastScanTs = new Date().toISOString();
    state.source = (meta && meta.source) || state.source || 'unknown';

    emit('retina.update', {
      status: state.status,
      source: state.source
    });
  }

  const api = {
    get status(){ return state.status; },
    get lastScanTs(){ return state.lastScanTs; },
    get source(){ return state.source; },

    setStatus,
    markVerified(meta){ setStatus('VERIFIED', meta); },
    markFailed(meta){ setStatus('FAILED', meta); },
    markOverride(meta){ setStatus('OVERRIDE', meta); },
    reset(meta){ setStatus('PENDING', meta); },

    on(fn){
      if (typeof fn === 'function') listeners.push(fn);
    }
  };

  window.RETINA_STATE = api;

  emit('retina.init', { status: state.status });

  try {
    console.log('[RETINA_STATE] ready', { status: state.status });
  } catch(e){}
})();

