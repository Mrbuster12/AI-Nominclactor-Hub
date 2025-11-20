(function(){
  function q(sel){ try{ return document.querySelector(sel); }catch(_){ return null; } }

  async function mountSafe(){
    var host = q('#care-tier-panel') || q('[data-care-tier-panel]');
    var btn  = q('#care-tier-toggle') || q('[data-care-tier-toggle]');
    if (!(host && btn && btn.addEventListener)){
      console.warn('care_tier_attach.js: missing nodes; skipping attach');
      return;
    }
    try {
      btn.addEventListener('click', function(){ host.classList.toggle('open'); });
    } catch(e){
      console.warn('care_tier_attach.js: guarded addEventListener', e);
    }
  }

  // Replace any existing exports with safe versions
  window.mountPanel = mountSafe;
  window.boot = window.boot || mountSafe;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountSafe);
  } else {
    setTimeout(mountSafe, 0);
  }
})();
