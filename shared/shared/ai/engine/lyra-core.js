window.LyraCore = {
  init({ mount, context, bus }){
    const el=document.createElement('div');
    el.style.padding='12px'; el.style.font='14px system-ui,sans-serif';
    el.innerHTML=
      '<div><strong>Context</strong></div>'+
      '<pre style="white-space:pre-wrap;background:#f7f7f7;border:1px solid #eee;padding:8px;">'+
      JSON.stringify(context,null,2)+'</pre>'+
      '<div style="margin:8px 0;">Ask a question (demo):</div>'+
      '<input id="lyra-q" style="width:100%;padding:8px;border:1px solid #ccc;">'+
      '<div id="lyra-a" style="margin-top:10px;"></div>';
    mount.innerHTML=''; mount.appendChild(el);
    const input=el.querySelector('#lyra-q'); const out=el.querySelector('#lyra-a');
    input.addEventListener('keydown', e=>{
      if(e.key==='Enter'){
        const q=input.value.trim(); if(!q) return;
        bus.send('ai_user_query',{ q, context });
        out.textContent='Demo response: acknowledging "'+q+'".';
      }
    });
  }
};
