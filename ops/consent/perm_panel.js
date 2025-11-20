(()=>{ 
  if (window.PermPanel) return;
  window.PermPanel = {
    mount(target=document.body){
      try{
        const id='perm-panel-badge';
        if (document.getElementById(id)) return;
        const el=document.createElement('div');
        el.id=id;
        el.textContent='Consent Panel';
        el.style.cssText='position:fixed;bottom:16px;left:16px;padding:6px 10px;border-radius:8px;background:#10b981;color:#0b1220;font:12px system-ui;z-index:99998';
        target.appendChild(el);
        console.log('[perm_panel] mounted');
      }catch(e){ console.warn('[perm_panel] mount error', e); }
    }
  };
  console.log('[perm_panel] ready');
})();
