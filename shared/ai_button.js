(function(){
  function lastState(){
    try {
      if (window.CTC_BUS && typeof CTC_BUS.getLast === 'function') return CTC_BUS.getLast();
    }catch(_){}
    return null;
  }
  function build(){
    if (document.getElementById('ai-fab')) return;
    const b = document.createElement('button');
    b.id = 'ai-fab';
    b.setAttribute('type','button');
    b.textContent = 'AI';
    Object.assign(b.style,{
      position:'fixed', right:'16px', bottom:'16px', zIndex:99999,
      padding:'10px 14px', borderRadius:'999px', border:'1px solid #111827',
      background:'#111827', color:'#e5e7eb', fontWeight:'600', cursor:'pointer',
      boxShadow:'0 6px 20px rgba(0,0,0,0.20)'
    });
    b.addEventListener('click', ()=>{
      const detail = {
        source: 'ai_button',
        at: new Date().toISOString(),
        page: { path: location.pathname, title: document.title||'' },
        intake: lastState() || {}
      };
      try { window.dispatchEvent(new CustomEvent('ai_launch_request', { detail })); } catch(_){}
    });
    document.body.appendChild(b);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
