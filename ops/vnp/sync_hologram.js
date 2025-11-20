(()=>{ 
  if(!window.VNPBridge) return;
  const ensure=()=>{ let h=document.getElementById('vsc-projection');
    if(!h){ h=document.createElement('div'); h.id='vsc-projection'; document.body.appendChild(h); }
    Object.assign(h.style,{position:'fixed',left:'50%',bottom:'140px',transform:'translateX(-50%)',zIndex:99995,pointerEvents:'none'});
    return h;
  };
  const render=(state)=>{ const h=ensure(); const m=state?.message||'';
    h.innerHTML='<div style="min-width:280px;max-width:360px;padding:10px 14px;background:rgba(10,14,18,.85);color:#e0f2f1;border:1px solid rgba(0,0,0,.35);border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,.45);backdrop-filter:blur(6px);font:13px/1.35 system-ui">'+m+'</div>';
  };
  document.addEventListener('vsc:introspect',e=>{
    const p=e?.detail?.payload||{};
    const msg = p?.themes?.length ? ('Themes: '+p.themes.join(', ')) : 'Introspection ready';
    VNPBridge.emit('vnp.state',{ message: msg });
  });
  VNPBridge.on(evt=>{ if(evt.type==='vnp.state') render(evt.payload) });
  console.log('[vnp] sync ready');
})();
