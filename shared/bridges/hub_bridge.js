(function(){
  const ORIGIN = location.origin;
  const STATE = { last:null };
  function isIntakeMessage(e){
    try{
      if(e.origin !== ORIGIN) return false;
      if(!e.data || typeof e.data !== 'object') return false;
      if(e.data.type !== 'ctc_update') return false;
      return true;
    }catch(_){return false;}
  }
  function rebroadcast(detail){
    STATE.last = detail;
    window.dispatchEvent(new CustomEvent('ctc_update', { detail }));
    window.dispatchEvent(new CustomEvent('ctc_risk_update', { detail }));
    window.dispatchEvent(new CustomEvent('ctc_specifiers_update', { detail }));
  }
  window.addEventListener('message', (e)=>{
    if(isIntakeMessage(e)){ rebroadcast(e.data.detail); }
  }, false);

  window.addEventListener('ctc_update', (e)=>{
    // If other parts of core emit ctc_update directly, keep single source-of-truth
    STATE.last = e.detail;
  });

  // Optional quick API for modules to query last state without listeners
  window.CTC_BUS = Object.freeze({
    getLast:()=>STATE.last,
    emit:(detail)=>rebroadcast(detail)
  });
})();
