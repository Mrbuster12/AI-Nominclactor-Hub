(function(){
  // Strong guard: block ctc_update during apply, suppress input/change bubbling, and drop duplicates/bursts.
  var APPLY = false, DEBOUNCE_MS = 150, t = null, lastHash = "";
  function hash(obj){ try{return JSON.stringify(obj);}catch(_){return "";} }

  // Patch all dispatches: swallow ctc_update while applying
  var origDispatch = EventTarget.prototype.dispatchEvent;
  EventTarget.prototype.dispatchEvent = function(ev){
    if (APPLY && ev && ev.type === 'ctc_update') return true;
    return origDispatch.call(this, ev);
  };

  // While applying, stop input/change from bubbling up to any publishers
  function block(e){ if (APPLY) e.stopImmediatePropagation(); }
  ['input','change'].forEach(function(type){ window.addEventListener(type, block, true); });

  function setField(sel, val){
    var el = document.querySelector(sel);
    if (!el) return;
    var nv = (val == null) ? '' : String(val);
    if (el.value !== nv) {
      APPLY = true;
      try { el.value = nv; }
      finally { clearTimeout(t); t = setTimeout(function(){ APPLY = false; }, DEBOUNCE_MS); }
    }
  }

  window.addEventListener('ctc_update', function(e){
    var det = e && e.detail || {};
    var d   = det.demographics || {};
    // Drop identical consecutive payloads
    var h = hash(det);
    if (h && h === lastHash) return;
    lastHash = h;

    setField('#firstName', d.firstName);
    setField('#lastName',  d.lastName);
    setField('#dob',       d.dob);
    setField('#phone',     d.phone);
    setField('#email',     d.email);
  }, true);
})();
