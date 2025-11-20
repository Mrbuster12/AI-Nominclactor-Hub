(function(){
  function moveBtn(el){
    el.style.position = 'fixed';
    el.style.top = '12px';
    el.style.right = '12px';
    el.style.bottom = '';
    el.style.left = '';
    el.style.zIndex = '2147483647';
  }
  function isBPIRL(el){
    var id = (el.id||'').toLowerCase();
    var cls = (el.className||'').toString().toLowerCase();
    return id.includes('bpirl') || cls.includes('bpirl');
  }
  function hideBottomDropdowns(){
    document.querySelectorAll('#bpirl-split-dropdown,.bpirl-split-dropdown,select,.dropdown,.select').forEach(function(el){
      var r = el.getBoundingClientRect();
      if (r.bottom > (innerHeight - 60)) el.style.display = 'none';
    });
  }
  function sweep(){
    // move any BPIRL button
    document.querySelectorAll('button,[role="button"]').forEach(function(el){
      var cs = getComputedStyle(el);
      if (isBPIRL(el) || (cs.position === 'fixed' && parseInt(cs.bottom||'0',10) >= 0 && parseInt(cs.bottom||'0',10) < 140)){
        moveBtn(el);
      }
    });
    hideBottomDropdowns();
  }
  var mo = new MutationObserver(function(){ sweep(); });
  function start(){
    sweep();
    mo.observe(document.documentElement, {childList:true, subtree:true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
