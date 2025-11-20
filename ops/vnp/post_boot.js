(function(){
  if (window.VNPBridge) {
    if (VNPBridge.bus && typeof VNPBridge.bus.emit === 'function') {
      window.VNPBus = window.VNPBus || VNPBridge.bus;
    } else if (typeof VNPBridge.emit === 'function') {
      window.VNPBus = window.VNPBus || VNPBridge;
    } else {
      var bus={_l:{},on:function(n,f){(this._l[n]=this._l[n]||[]).push(f)},off:function(n,f){this._l[n]=(this._l[n]||[]).filter(function(x){return x!==f})},emit:function(n,d){(this._l[n]||[]).forEach(function(fn){try{fn(d)}catch(e){}});console.log('[VNPBus] emit',n,d)}};
      VNPBridge.bus=VNPBridge.bus||bus;
      VNPBridge.emit=VNPBridge.emit||bus.emit.bind(bus);
      VNPBridge.on=VNPBridge.on||bus.on.bind(bus);
      window.VNPBus=window.VNPBus||bus;
    }
  } else if (!window.VNPBus) {
    var bus2={_l:{},on:function(n,f){(this._l[n]=this._l[n]||[]).push(f)},off:function(n,f){this._l[n]=(this._l[n]||[]).filter(function(x){return x!==f})},emit:function(n,d){(this._l[n]||[]).forEach(function(fn){try{fn(d)}catch(e){}});console.log('[VNPBus] emit',n,d)}};
    window.VNPBus=bus2;
  }
  if (!window.VNPSync) {
    window.VNPSync={hologram:function(p){try{window.VNPBus&&VNPBus.emit&&VNPBus.emit('vnp.hologram',p)}catch(e){}try{localStorage.setItem('vsc:vnp:hologram',JSON.stringify(p))}catch(e){}console.log('[VNPSync shim] hologram',p)}};
  }
  try{ localStorage.setItem('vnp:last_init', new Date().toISOString()); }catch(e){}
  console.log('[vnp] post_boot ok',{bus:!!window.VNPBus,sync:!!window.VNPSync});
})();
