(()=>{ 
  if(document.getElementById('vsc-projection-badge')) return;
  const id='vsc-projection-badge';
  const b=document.createElement('div');
  b.id=id; b.textContent='Projection online';
  Object.assign(b.style,{
    position:'fixed', top:'10px', right:'140px',
    padding:'6px 10px', background:'#37474f', color:'#fff',
    font:'12px system-ui', borderRadius:'10px',
    boxShadow:'0 2px 8px rgba(0,0,0,.35)', zIndex:99990, opacity:.95,
    transition:'transform .18s ease'
  });
  document.body.appendChild(b);
  const pulse=()=>{ b.style.transform='scale(1.07)'; setTimeout(()=>b.style.transform='scale(1)',180); };
  document.addEventListener('vsc:projection', pulse);
  document.addEventListener('vsc:ai', pulse);
  document.addEventListener('vsc:consent', pulse);
  console.log('[projection] badge persistent');
})();
