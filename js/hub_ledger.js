;(function(w,d){
  if(!w.DSMCTC){
    w.DSMCTC = { ledger:{
      load:function(){ try{return JSON.parse(localStorage.getItem('vsc:dsmctc:ledger:v1')||'[]'); }catch(e){ return []; } },
      save:function(arr){ localStorage.setItem('vsc:dsmctc:ledger:v1', JSON.stringify(arr)); },
      add:function(entry){ var arr=this.load(); arr.push(entry); this.save(arr); if(w.AIEngine&&w.AIEngine.bus){ w.AIEngine.bus.emit('dsmctc:ledger:update',{size:arr.length}); } }
    }};
  }
  function wire(){
    if(!(w.AIEngine&&w.DSMCTC&&w.DSMCTC.ledger)) return console.warn('[hub] ledger missing');
    var el=d.getElementById('ctc-ledger-count');
    function paint(){ var n=(w.DSMCTC.ledger.load()||[]).length; if(el) el.textContent=String(n); }
    paint();
    w.AIEngine.bus.on('dsmctc:ledger:update', function(){ paint(); });
  }
  (d.readyState==='loading')? d.addEventListener('DOMContentLoaded', wire): wire();
})(window,document);
