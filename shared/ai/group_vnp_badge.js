(function(){
  if (typeof window==='undefined') return;

  function badge(txt){
    var b=document.createElement('div');
    b.style.position='fixed'; b.style.right='12px'; b.style.bottom='48px';
    b.style.padding='8px 10px'; b.style.borderRadius='10px';
    b.style.background='#223'; b.style.color='#fff'; b.style.font='12px system-ui,sans-serif';
    b.style.zIndex=999999; b.textContent=txt; return b;
  }

  function readVNP(){ try{ return (Bridge && Bridge.load && Bridge.load('vnp:last')) || null; }catch(e){ return null; } }

  function planText(pl){
    var p = pl || {};
    var cad = p.cadence ? (p.cadence.sessionsPerWeek+'x/w '+p.cadence.reviewInDays+'d') : '—';
    return 'path='+(p.path||'—')+' | cadence='+cad;
  }

  function render(){
    var env = readVNP();
    var base = env ? ('VNP '+(env.tier||'—')+' '+JSON.stringify(env.flags||{})) : 'VNP none';
    var text = base;
    if (window.__lastPlan) text += ' • '+planText(window.__lastPlan);
    var node = document.getElementById('__vnp_badge_node__');
    if (!node){ node = badge(text); node.id='__vnp_badge_node__'; document.body.appendChild(node); }
    else { node.textContent = text; }
  }

  document.addEventListener('DOMContentLoaded', function(){
    render();
    if (window.AIEngine && AIEngine.bus && typeof AIEngine.bus.on==='function'){
      AIEngine.bus.on('tplan:update', function(e){
        var pl = e && e.result && e.result.plan || {};
        window.__lastPlan = pl;
        render();
        console.log('[GROUP PLAN]', { path:pl.path, cadence:pl.cadence, objectives:pl.objectives, interventions:pl.interventions });
      });
    }
  });
})();
