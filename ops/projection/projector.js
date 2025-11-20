(()=>{ if(window.VSCProjector) return;
  window.VSCProjector = {
    showPrompt(text){
      const id='vsc-proj-prompt'; document.getElementById(id)?.remove();
      const el=document.createElement('div'); el.id=id;
      Object.assign(el.style,{
        position:'fixed', left:'12px', bottom:'12px', maxWidth:'320px',
        padding:'8px 10px', background:'#212121', color:'#fff',
        font:'12px system-ui', borderRadius:'10px',
        boxShadow:'0 2px 10px rgba(0,0,0,.35)', zIndex:99992, opacity:.98
      });
      el.textContent = text;
      document.body.appendChild(el);
      setTimeout(()=>{ el.style.opacity='0.0'; setTimeout(()=>el.remove(),600); }, 3500);
    },
    cue(event){ this.showPrompt(`👩‍⚕️ Virtual Clinician: ${event}`); }
  };
})();
