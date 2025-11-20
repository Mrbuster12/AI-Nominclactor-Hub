(function(){
  if (typeof window==='undefined') return;
  function pill(color,text){
    var b=document.createElement('div');
    b.style.position='fixed'; b.style.right='12px'; b.style.bottom='12px';
    b.style.padding='8px 10px'; b.style.borderRadius='999px';
    b.style.background=color; b.style.color='#fff'; b.style.font='12px system-ui,sans-serif';
    b.style.zIndex=999999; b.textContent=text; return b;
  }
  function todayStr(d){ return (new Date(d)).toDateString(); }
  function hasTodayStamp(){
    try {
      var L = JSON.parse(localStorage.getItem('bio:consent:ledger')||'[]');
      var today = todayStr(Date.now());
      return L.some(function(s){ return todayStr(s.ts)===today && s.phase && s.textHash; });
    } catch(e){ return false; }
  }
  function render(){
    var ok = hasTodayStamp();
    var el = pill(ok ? 'green' : 'crimson', ok ? 'Consent OK' : 'Consent Needed');
    document.body.appendChild(el);
  }
  if (document && document.addEventListener){
    document.addEventListener('DOMContentLoaded', function(){
      if (window.AIEngine && AIEngine.Consent && AIEngine.Consent.ensure){
        AIEngine.Consent.ensure('group:join',{path:location.pathname}).then(render);
      } else {
        render();
      }
    });
  }
})();
