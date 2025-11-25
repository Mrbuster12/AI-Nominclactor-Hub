(function(){
  if (window.VOUCHER_ENGINE) return;

  const listeners = [];
  const state = {
    status: 'NONE', // NONE, ACTIVE, EXPIRED, BLOCKED
    activeVoucher: null,
    lastEventTs: null
  };

  function emit(type, payload){
    const evt = {
      ts: new Date().toISOString(),
      type,
      payload
    };
    state.lastEventTs = evt.ts;

    listeners.forEach(fn => {
      try { fn(evt); } catch(e){}
    });

    // Non-PHI telemetry into RDL if present
    try {
      if (window.RDL && typeof RDL.log === 'function'){
        RDL.log('voucher', evt);
      }
    } catch(e){}
  }

  function setActive(voucher){
    state.status = 'ACTIVE';
    state.activeVoucher = Object.assign({}, voucher || {});
    emit('voucher.active', { voucher: state.activeVoucher });
  }

  function clear(reason){
    state.status = 'NONE';
    state.activeVoucher = null;
    emit('voucher.cleared', { reason: reason || 'manual' });
  }

  function canAccessLevel(level){
    const v = state.activeVoucher;
    if (!v || state.status !== 'ACTIVE') return false;

    if (v.validFrom && Date.now() < Date.parse(v.validFrom)) return false;
    if (v.validTo   && Date.now() > Date.parse(v.validTo))   return false;

    if (Array.isArray(v.allowedLevels) && v.allowedLevels.length){
      return v.allowedLevels.indexOf(level) >= 0;
    }
    return true;
  }

  function getSummary(){
    const v = state.activeVoucher;
    if (!v){
      return {
        status: state.status,
        hasVoucher: false
      };
    }
    return {
      status: state.status,
      hasVoucher: true,
      voucherId: v.voucherId,
      fundingSource: v.fundingSource,
      allowedLevels: v.allowedLevels || [],
      validFrom: v.validFrom,
      validTo: v.validTo,
      utilization: v.utilization || {}
    };
  }

  const api = {
    get status(){ return state.status; },
    get activeVoucher(){ return state.activeVoucher; },
    setActive,
    clear,
    canAccessLevel,
    getSummary,
    on(fn){
      if (typeof fn === 'function') listeners.push(fn);
    },
    emit
  };

  window.VOUCHER_ENGINE = api;

  // Hook to RETINA_STATE if present: simulate a voucher after VERIFIED
  try {
    if (window.RETINA_STATE && typeof RETINA_STATE.on === 'function'){
      RETINA_STATE.on(evt => {
        if (!evt || evt.type !== 'retina.update') return;
        const status = evt.payload && evt.payload.status;

        if (status === 'VERIFIED'){
          const demoVoucher = {
            voucherId: 'DEMO-' + Date.now().toString(36),
            retinaId: (evt.payload && evt.payload.source) || 'retina-demo',
            fundingSource: 'DEMO_FUND',
            allowedLevels: ['outpatient', 'iop'],
            validFrom: new Date(Date.now() - 60000).toISOString(),
            validTo: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
            utilization: {
              sessionsUsed: 0,
              sessionsMax: 10
            }
          };
          setActive(demoVoucher);
        }

        if (status === 'FAILED'){
          clear('retina_failed');
        }

        if (status === 'OVERRIDE'){
          emit('voucher.override_flag', {
            source: evt.payload && evt.payload.source
          });
        }
      });
    }
  } catch(e){}

  try {
    console.log('[VOUCHER_ENGINE] ready', { status: state.status });
  } catch(e){}
})();

