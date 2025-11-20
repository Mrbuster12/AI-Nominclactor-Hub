(function(){
  if (window.__AI_DEBUG__) return; window.__AI_DEBUG__=true;
  function log(){ try{ console.log.apply(console, arguments); }catch(_){} }
  window.addEventListener('ai.request', function(e){ log('[AI DEBUG] ai.request received', e && e.detail); });
  if (typeof window.AI_BUS !== 'undefined'){
    try{ window.AI_BUS.on('ai.request', function(d){ log('[AI DEBUG] AI_BUS on(ai.request)', d); }); }catch(_){}
  }
  var hasAIButton = !!document.querySelector('.ai-toolbar button, button.ai-button, button[data-ai], button[data-action*="ai"], button[title*="AI"], button[id*="ai"], button[class*="ai"]');
  if (!hasAIButton){
    var btn = document.createElement('button');
    btn.textContent = 'AI Test Ping';
    btn.setAttribute('data-ai','test');
    btn.style.position='fixed'; btn.style.zIndex=2147483646; btn.style.bottom='12px'; btn.style.right='12px';
    btn.addEventListener('click', function(ev){
      ev.preventDefault();
      var ctx = { source: location.pathname, ts: Date.now(), probe:true };
      if (typeof window.AI_BUS !== 'undefined') window.AI_BUS.send('ai.request', { action:'test', ctx: ctx });
      log('[AI DEBUG] sent ai.request test', ctx);
    });
    document.body.appendChild(btn);
  }
})();
