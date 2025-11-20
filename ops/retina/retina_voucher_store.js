(()=>{ if (window.RetinaVoucher) return;
  const save=(k,o)=>{const a=JSON.parse(localStorage.getItem(k)||'[]');a.push({...o,_saved:new Date().toISOString()});localStorage.setItem(k,JSON.stringify(a));return a[a.length-1];};
  if(!window.VSCRepo) window.VSCRepo={write:(key,obj)=>save('vsc:repo:'+key,obj)};
  window.RetinaVoucher={
    issue({userId,intent}){
      const voucher={token:(crypto.randomUUID?crypto.randomUUID():String(Date.now())),userId:userId||null,intent:intent||'unknown',ts:new Date().toISOString()};
      const stored=save('vsc:retina:vouchers',voucher);
      VSCRepo.write('retina_voucher',voucher);
      RetinaBus.emit('retina.voucher.issued',{voucher:stored});
      return stored;
    },
    last(){return JSON.parse(localStorage.getItem('vsc:retina:vouchers')||'[]').slice(-1)[0]||null;}
  };
})();
