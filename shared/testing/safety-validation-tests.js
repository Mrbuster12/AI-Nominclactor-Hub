(function(){
  try{
    const meta = { isSimulation:true, educationalPurpose:true, clinicalClaims:false };
    const evt = { meta, output:{ text:"This educational scenario avoids diagnosis language." } };
    const ok = window.VSC_Safety && window.VSC_Safety.validateEvent && window.VSC_Safety.validateEvent(evt);
    console.log('[VSC Safety Test] schema flags ok =', !!(ok && ok.ok));
  }catch(e){
    console.warn('[VSC Safety Test] failed', e);
  }
})();
