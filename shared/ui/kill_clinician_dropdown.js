(function(){
  var SEL = '#clinicianTendencies,.clinician-tendencies,.dropdown-clinician,[data-role="clinician-tendencies"],[aria-label*="Clinician Tendencies" i],[title*="Clinician Tendencies" i]';
  function nuke(root){
    try{
      (root||document).querySelectorAll(SEL).forEach(function(el){ try{ el.remove(); }catch(e){ el.style.display='none'; } });
      (root||document).querySelectorAll('*').forEach(function(el){
        try{
          var t=(el.innerText||'').trim();
          if (t && /clinician\s*tendenc/i.test(t)) { el.remove(); }
        }catch(e){}
      });
    }catch(e){}
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', function(){ nuke(); });
  else nuke();
  try{
    var mo=new MutationObserver(function(m){
      m.forEach(function(r){ nuke(r.target||document); });
    });
    mo.observe(document.documentElement, {subtree:true, childList:true});
  }catch(e){}
})();
