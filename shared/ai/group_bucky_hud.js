(function(){
  if (typeof window==='undefined') return;

  function node(txt){
    var b=document.createElement('div');
    b.style.position='fixed'; b.style.left='12px'; b.style.bottom='12px';
    b.style.padding='8px 10px'; b.style.borderRadius='10px';
    b.style.background='#102'; b.style.color='#fff'; b.style.font='12px system-ui,sans-serif';
    b.style.zIndex=999999; b.id='__bucky_hud__'; b.textContent=txt; return b;
  }

  function text(s){
    if (!s) return 'Bucky — no state';
    var m = s.metrics||{};
    return 'Bucky arousalAvg='+ (m.arousalAvg||0).toFixed(2)+' distressAvg='+(m.distressAvg||0).toFixed(2)+' members='+(s.members||[]).length;
  }

  function render(){
    var s = window.AIEngine && AIEngine.Bucky && AIEngine.Bucky.snapshot ? AIEngine.Bucky.snapshot() : null;
    var t = text(s);
    var n = document.getElementById('__bucky_hud__');
    if (!n){ n=node(t); document.body.appendChild(n); } else { n.textContent=t; }
  }

  document.addEventListener('DOMContentLoaded', function(){
    render();
    if (window.AIEngine && AIEngine.bus && AIEngine.bus.on){
      AIEngine.bus.on('bucky:update', render);
      AIEngine.bus.on('tplan:update', function(e){
        var pl=e && e.result && e.result.plan || {};
        console.log('[BUCKY→PLAN]', { path:pl.path, cadence:pl.cadence });
      });
    }
  });
})();
