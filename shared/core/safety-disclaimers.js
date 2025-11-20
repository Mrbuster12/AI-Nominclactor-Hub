(function(){
  if (window.__VSC_SAFETY_BOOT__) return;
  window.__VSC_SAFETY_BOOT__ = true;
  function whenBody(fn){
    if (document.body && document.documentElement) return fn();
    var i = setInterval(function(){
      if (document.body && document.documentElement){ clearInterval(i); fn(); }
    }, 20);
  }
  function boot(){
    if (document.getElementById('vsc-safety-banner')) return;
    var body = document.body, html = document.documentElement;
    var bar = document.createElement('div');
    bar.id = 'vsc-safety-banner';
    bar.style.position='fixed';
    bar.style.top='0'; bar.style.left='0'; bar.style.right='0';
    bar.style.zIndex='2147483647';
    bar.style.font='14px/1.4 system-ui,-apple-system,Segoe UI,Arial';
    bar.style.background='#fff3cd'; bar.style.color='#664d03';
    bar.style.borderBottom='1px solid #ffe69c';
    bar.style.padding='8px 12px';
    bar.textContent='⚠️ Educational simulation. No clinical advice, diagnosis, or treatment. In crisis (US) call 988.';
    try{ html.style.scrollPaddingTop='44px'; }catch(_){}
    try{
      var cur = parseInt(getComputedStyle(body).paddingTop||'0',10)||0;
      body.style.paddingTop=(cur+44)+'px';
    }catch(_){}
    body.appendChild(bar);
    window.VSC_SAFETY_READY = true;
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', function(){ whenBody(boot); });
  else whenBody(boot);
})();
