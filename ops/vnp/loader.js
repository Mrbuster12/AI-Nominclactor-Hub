(()=>{ 
  const files=['/ops/vnp/bridge.js','/ops/vnp/sync_hologram.js','/ops/vnp/post_boot.js'];
  let i=0;
  const next=()=>{ 
    if(i>=files.length){console.log('[vnp] loaded');return}
    const s=document.createElement('script');
    s.src=files[i++]+'?v='+Date.now();
    s.onload=next;
    s.onerror=()=>{ console.warn('missing', s.src); next(); };
    document.head.appendChild(s);
  };
  next();
})();
