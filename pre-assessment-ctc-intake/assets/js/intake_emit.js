(function(){
  if (window.__CTC_EMIT_WIRED__) return;
  window.__CTC_EMIT_WIRED__=true;

  let lastKey="", t=null;
  function keyOf(arr){ return JSON.stringify((arr||[]).slice().sort()); }

  function emit(specifiers){
    const k = keyOf(specifiers);
    if (k===lastKey) return;      // no-change, skip
    lastKey = k;
    const evt = new CustomEvent('ctc_update', { detail:{ specifiers: specifiers } });
    Object.defineProperty(evt, '__sanitized', { value:false }); // raw; ctc_guard will sanitize
    window.dispatchEvent(evt);
  }

  // hook up your UI → call scheduleEmit([...specifiers])
  window.scheduleCTCEmit = function(specs){
    clearTimeout(t);
    t = setTimeout(()=>emit(specs), 100);
  };

  // if there is an existing function like computeSpecifiers(), wrap it:
  if (typeof window.computeSpecifiers === 'function') {
    const orig = window.computeSpecifiers;
    window.computeSpecifiers = function(){
      const s = orig.apply(this, arguments);
      window.scheduleCTCEmit(s);
      return s;
    };
  }
})();
