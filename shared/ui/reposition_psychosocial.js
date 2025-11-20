(function(){
  function moveToTopLeft(el){
    if (!el) return;
    el.classList.add('psych-left-corner');
  }

  function tryFindClinicianTendencies(){
    var candidates = [];
    document.querySelectorAll('*').forEach(function(el){
      try{
        var txt = (el.innerText || '').trim().toLowerCase();
        var idc = ((el.id || '') + ' ' + (el.className || '')).toLowerCase();
        if (txt.includes('clinician tendencies') || idc.includes('clinician-tendencies') || idc.includes('tendencies')){
          candidates.push(el);
        }
      }catch(e){}
    });
    if (candidates.length === 0) return null;
    // Prefer a container-ish element
    candidates.sort(function(a,b){ return (b.offsetWidth*b.offsetHeight) - (a.offsetWidth*a.offsetHeight); });
    var el = candidates[0];
    // climb to a container if tiny node
    var n = el;
    for (var i=0;i<3 && n && (n.offsetWidth<180 || n.offsetHeight<32);i++) n = n.parentElement;
    return n || el;
  }

  function run(){
    var target = tryFindClinicianTendencies();
    if (target) moveToTopLeft(target);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
