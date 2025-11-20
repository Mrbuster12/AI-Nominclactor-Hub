(function(){
  try { localStorage.setItem('VSC_DISABLE_BPIRL','1'); } catch(_){}
  const kill = el => { try{ el.remove(); }catch(_){ if(el){ el.style.display='none'; el.style.visibility='hidden'; el.setAttribute('data-nuked','1'); } } };

  function sweep(){
    document.querySelectorAll('#bpirl-toggle, .bpirl-toggle, .bpirl-debug-toggle, #bpirl-button, #bpirl-split-dropdown, .bpirl-split-dropdown').forEach(kill);
  }

  const mk = Document.prototype.createElement;
  Document.prototype.createElement = function(tag){
    const el = mk.call(this, tag);
    const oset = Object.getOwnPropertyDescriptor(Element.prototype,'outerHTML')?.set;
    if (oset) {
      try {
        oset.call(el, '');
      } catch(_){}
    }
    const setAttr = el.setAttribute;
    el.setAttribute = function(k, v){
      try {
        const val = String(v||'').toLowerCase();
        if ((k==='id'||k==='class') && (val.includes('bpirl') || val.includes('split-dropdown'))) {
          kill(el);
          return;
        }
      } catch(_){}
      return setAttr.call(this, k, v);
    };
    return el;
  };

  new MutationObserver(sweep).observe(document.documentElement, {childList:true, subtree:true});
  addEventListener('DOMContentLoaded', sweep);
  setInterval(sweep, 500);
  sweep();
})();
