(function(){
  const KEY = 'ctc_ai_boot';

  function read(){
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch(_) { return null; }
  }

  function consume(){
    const boot = read();
    if (!boot) return;
    try { window.dispatchEvent(new CustomEvent('ctc_ai_boot', { detail: boot })); } catch(_){}
    try { console.log('[AI] boot payload', boot); } catch(_){}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', consume);
  } else {
    consume();
  }
})();
