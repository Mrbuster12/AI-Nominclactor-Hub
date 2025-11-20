(function(){
  function setRole(sel, newText, title, role, color){
    var a=document.querySelector(sel); if(!a) return;
    a.querySelector('.vsc-hub-name')?.remove();
    var name=document.createElement('span');
    name.className='vsc-hub-name'; name.textContent=newText;
    name.style.fontWeight='600'; name.style.marginRight='8px';
    a.prepend(name);

    a.querySelector('.vsc-hub-role')?.remove();
    var tag=document.createElement('span');
    tag.className='vsc-hub-role'; tag.textContent=role;
    Object.assign(tag.style,{
      marginLeft:'4px', padding:'2px 6px', background:color, color:'#fff',
      borderRadius:'10px', font:'11px system-ui'
    });
    a.appendChild(tag);

    a.title = title; a.setAttribute('aria-label', title);
  }
  setRole('a[href*="pre-assessment-ctc-intake"]','Pre-Assessment CTC Intake','Pre-Assessment CTC Intake (Emitter)','EMITTER','#0b5');
  setRole('a[href*="preassessment-repo"], a[href*="releases-consents"]','VSC Repository','VSC Repository (Storage/PPI Vault)','STORAGE','#4caf50');
  setRole('a[href*="/releases/"]','Releases AND Consents','Releases AND Consents (Capture)','CAPTURE','#1e88e5');
  console.log('[Hub] module roles labeled');
})();
