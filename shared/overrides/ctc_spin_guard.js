(function(w){
  var seen = new Set();
  function sig(o){ try{ return JSON.stringify(o); }catch(e){ return String(o); } }
  var B = w.VSCBridge;
  if (!B || typeof B.emit!=='function') return;
  var orig = B.emit.bind(B);
  B.emit = function(type, payload){
    if (type === 'ctc_update'){
      var s = sig(payload);
      if (seen.has(s)){ console.warn('[ctc_spin_guard] drop duplicate'); return; }
      seen.add(s); setTimeout(function(){ seen.delete(s); }, 800);
    }
    return orig(type, payload);
  };
})(window);
