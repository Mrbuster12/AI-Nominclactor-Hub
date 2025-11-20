(()=>{ 
  const files=[
    '/ops/group/bus.js',
    '/ops/group/registry.js',
    '/ops/group/engine.js',
    '/ops/group/ui_panel.js',
    '/ops/group/buckyball.js',
    '/ops/group/notes.js'
  ];
  let i=0;
  const next=()=>{ 
    if(i>=files.length){ console.log('[group] loader complete'); return }
    const s=document.createElement('script');
    s.src = files[i++] + '?v=' + Date.now();
    s.onload = next;
    s.onerror = ()=>{ console.warn('missing', s.src); next() };
    document.head.appendChild(s);
  };
  next();
})();
