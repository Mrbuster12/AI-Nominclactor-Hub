(function(){
  function q(sel){ try{return document.querySelector(sel)}catch(_){return null} }
  async function boot(){
    // only attach if elements actually exist
    var host = q('#care-tier-panel') || q('[data-care-tier-panel]');
    if (!host){ console.warn('care_tier_attach_safe: host not found; skipping'); return; }
    var btn = q('#care-tier-toggle') || q('[data-care-tier-toggle]');
    if (btn && btn.addEventListener){
      btn.addEventListener('click', function(){ host.classList.toggle('open'); });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot,0);
})();
