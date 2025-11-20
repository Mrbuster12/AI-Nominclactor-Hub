(()=>{ const files=[
  '/ops/projection/bridge.js',
  '/ops/projection/projector.js',
  '/ops/projection/engine.js'
]; let i=0; const next=()=>{ if(i>=files.length) return console.log('[projection] loaded');
  const s=document.createElement('script'); s.src=files[i++]; s.onload=next; document.head.appendChild(s); }; next();})();
