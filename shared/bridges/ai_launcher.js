(function(){
  const KEY = 'ctc_ai_boot';
  function stash(detail){
    try { localStorage.setItem(KEY, JSON.stringify(detail)); } catch(_) {}
  }
  function openAI(){
    try { window.open('/ai-nominclactor/?bridge=1','_blank'); } catch(_) {}
  }
  window.addEventListener('ai_launch_request', (e)=>{
    const detail = (e && e.detail) || {};
    stash(detail);
    window.dispatchEvent(new CustomEvent('ai_open', { detail }));
    openAI();
  });
  window.AI_LAUNCH = Object.freeze({
    send:(detail)=>window.dispatchEvent(new CustomEvent('ai_launch_request',{detail}))
  });
})();
