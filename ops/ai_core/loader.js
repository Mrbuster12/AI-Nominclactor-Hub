(()=>{ const files=['/ops/ai_core/registry.js','/ops/ai_core/bridge.js','/ops/ai_core/runner.js'];
  let i=0; const next=()=>{ if(i>=files.length) return console.log('[ai_core] loaded');
    const s=document.createElement('script'); s.src=files[i++]; s.onload=next; document.head.appendChild(s); };
  next();
})();
