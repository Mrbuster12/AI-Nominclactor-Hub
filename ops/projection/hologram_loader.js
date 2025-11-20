(()=>{ 
  if (document.getElementById('vsc-projection')) return;
  const holo=document.createElement('div');
  holo.id='vsc-projection';
  holo.textContent='◉ Hologram Active';
  Object.assign(holo.style,{
    position:'fixed',bottom:'30px',left:'50%',transform:'translateX(-50%)',
    font:'14px system-ui',color:'#00e5ff',
    background:'rgba(0,0,0,0.65)',padding:'8px 14px',borderRadius:'10px',
    boxShadow:'0 0 12px rgba(0,229,255,.6)',zIndex:99999
  });
  document.body.appendChild(holo);
  console.log('[projection] hologram element injected');
})();
