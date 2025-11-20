(function(){
  function isFixedBottom(el){
    const cs = getComputedStyle(el);
    if (cs.position !== 'fixed') return false;
    const b = parseInt(cs.bottom || '0', 10);
    return b >= 0 && b < 160; // near bottom edge
  }
  function moveButton(el){
    el.style.position = 'fixed';
    el.style.top = '12px';
    el.style.right = '12px';
    el.style.left = '';
    el.style.bottom = '';
    el.style.zIndex = '2147483647';
  }
  function sweep(){
    // Move obvious BPIRL toggles
    document.querySelectorAll('#bpirl-toggle, .bpirl-toggle, .bpirl-debug-toggle').forEach(moveButton);
    // Move any other fixed-bottom buttons
    document.querySelectorAll('button,[role="button"]').forEach(el => { if (isFixedBottom(el)) moveButton(el); });
    // Hide bottom-anchored dropdowns
    const cands = document.querySelectorAll('#bpirl-split-dropdown, .bpirl-split-dropdown, select, .dropdown, .select');
    cands.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom > (innerHeight - 60)) { el.style.display = 'none'; el.setAttribute('data-hidden-by','ui_overrule'); }
    });
  }
  function start(){
    sweep();
    setTimeout(sweep, 200);
    setTimeout(sweep, 800);
    new MutationObserver(() => sweep()).observe(document.documentElement, {childList:true, subtree:true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
