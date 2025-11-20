(function(){
  if (window.__TP_CTC_INSTALLED) return;
  window.__TP_CTC_INSTALLED = 1;

  function normalize(detail){
    const a = Array.isArray(detail?.specifiers) ? detail.specifiers.slice() : [];
    const fromTriggers = detail?.triggers ? Object.keys(detail.triggers).filter(k => detail.triggers[k]) : [];
    const specifiers = Array.from(new Set(a.concat(fromTriggers)));
    const careTier = detail?.careTier || null;
    return { specifiers, careTier };
  }

  window.addEventListener('ctc_update', function(ev){
    const n = normalize(ev.detail || {});
    window._lastCTC = n; // <- used by helpers

    try {
      const evt = new CustomEvent('ctc_update', { detail: n });
      Object.defineProperty(evt,'__sanitized',{ value:true });
      window.dispatchEvent(evt);
    } catch(e){}
  }, true);
})();
