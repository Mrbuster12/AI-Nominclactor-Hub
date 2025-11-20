(function(){
  if (window.__CTC_GUARD_INSTALLED__) return;
  window.__CTC_GUARD_INSTALLED__ = true;

  let t=null, merged=null;
  const once = (cb,ms)=>{ clearTimeout(t); t=setTimeout(cb,ms||120); };
  const merge = (a,b)=>{
    const A=(a&&a.specifiers)||[], B=(b&&b.specifiers)||[];
    return { specifiers:[...new Set([...A,...B])] };
  };

  function onCTC(e){
    if (e.__sanitized) return;             // already sanitized
    e.stopImmediatePropagation();           // swallow raw bursts
    merged = merged ? merge(merged, e.detail) : e.detail;
    once(function(){
      const evt = new CustomEvent('ctc_update', { detail: merged });
      Object.defineProperty(evt, '__sanitized', { value:true });
      window.dispatchEvent(evt);
      merged = null;
    }, 120);
  }
  window.addEventListener('ctc_update', onCTC, true); // capture
})();
