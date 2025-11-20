(function(){
  function ready(fn){ if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn); else fn(); }
  function ensureBar(){
    if(document.getElementById('ai-bottom-bar')) return;
    var bar=document.createElement('div'); bar.id='ai-bottom-bar';
    function btn(label,cls,ev){
      var b=document.createElement('button'); b.className='ai-pill '+cls; b.type='button'; b.textContent=label;
      b.addEventListener('click',ev); return b;
    }
    // Adjust labels/actions if you want; these mirror the classic green/red setup
    bar.appendChild(btn('Run Assist','blue', ()=>console.log('AI: Run Assist')));
    bar.appendChild(btn('Draft Summary','green', ()=>console.log('AI: Draft Summary')));
    bar.appendChild(btn('Review Output','amber', ()=>console.log('AI: Review Output')));
    bar.appendChild(btn('Clear','red', ()=>console.log('AI: Clear')));
    document.body.appendChild(bar);
  }
  ready(ensureBar);
})();
