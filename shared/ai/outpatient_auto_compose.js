(function(){
  function ready(fn){ if(document.readyState!=='loading'){fn();} else {document.addEventListener('DOMContentLoaded',fn);} }
  ready(function(){
    if (!(window.DSMCTC && DSMCTC.compose)) { console.warn('[Outpatient AutoCompose] DSMCTC missing'); return; }
    if (!(window.IOP && IOP.snapshot)) { console.warn('[Outpatient AutoCompose] IOP missing'); return; }
    console.log('[Outpatient AutoCompose] Hook installed');
    var oldBump = IOP.bump;
    IOP.bump = function(ev){
      var res = oldBump.call(IOP, ev);
      try {
        var plan = DSMCTC.compose({ dsm:['F41.1'], iop: IOP.snapshot(), hub:{origin:'outpatient:auto'} });
        console.log('[Outpatient AUTO-PLAN]', plan);
        if (AIEngine && AIEngine.bus) AIEngine.bus.emit('tplan:update', {ts:Date.now(), payload:ev, result:plan});
      } catch(e){ console.error('[Outpatient AutoCompose ERROR]', e); }
      return res;
    };
  });
})();
