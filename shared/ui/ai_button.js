(function(){
  if (typeof window==='undefined') return;

  function el(id){ return document.getElementById(id); }
  function ensureStyles(){
    if (el('__ai_btn_css__')) return;
    var s=document.createElement('style'); s.id='__ai_btn_css__';
    s.textContent='#__ai_button__{position:fixed;top:12px;right:12px;padding:8px 12px;border-radius:10px;background:#0b5;color:#fff;font:13px system-ui,sans-serif;z-index:100001;border:none;cursor:pointer}#__ai_toast__{position:fixed;top:52px;right:12px;background:#111;color:#fff;padding:8px 10px;border-radius:8px;font:12px system-ui;z-index:100002;opacity:.95}';
    document.head.appendChild(s);
  }
  function toast(msg){
    var n=el('__ai_toast__'); if(!n){ n=document.createElement('div'); n.id='__ai_toast__'; document.body.appendChild(n); }
    n.textContent=msg; clearTimeout(n.__t); n.style.display='block';
    n.__t=setTimeout(function(){ n.style.display='none'; }, 3000);
  }
  function payloadFromContext(){
    var p = window.__session || {};
    p.dsm = p.dsm || ['F41.1'];
    p.crdpss = p.crdpss || {};
    p.bps = p.bps || {};
    p.risk = p.risk || {};
    p.hub = p.hub || { origin: location.pathname };
    return p;
  }
  function runAI(){
    try{
      var p = payloadFromContext();
      if (window.AIEngine && AIEngine.Introspective) p.ai = Object.assign({}, p.ai, {introspective: AIEngine.Introspective.analyze(p)});
      if (window.AIEngine && AIEngine.Projection)     p.ai = Object.assign({}, p.ai, {projection: AIEngine.Projection.plan(p)});
      if (window.VSCBridge && VSCBridge.publish) VSCBridge.publish('ctc_update', p, {module:'ai:button'});
      toast('AI ran and published update');
    }catch(e){
      console.error('[AI BUTTON] error', e);
      toast('AI error: check console');
    }
  }
  function ensureButton(){
    if (el('__ai_button__')) return;
    var b=document.createElement('button');
    b.id='__ai_button__';
    b.type='button';
    b.textContent='AI';
    b.addEventListener('click', runAI);
    document.body.appendChild(b);
  }
  function boot(){
    ensureStyles();
    ensureButton();
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
