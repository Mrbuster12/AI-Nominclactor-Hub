(function(){
  if (typeof window==='undefined') return;

  if (!window.VSCBridge) window.VSCBridge = {
    _h:{},
    publish:function(t,p){(this._h[t]||[]).forEach(function(fn){try{fn(p)}catch(e){}})},
    subscribe:function(t,fn){(this._h[t]=this._h[t]||[]).push(fn); return function(){ var a=VSCBridge._h[t]||[], i=a.indexOf(fn); if(i>-1)a.splice(i,1); } }
  };

  if (typeof VSCBridge.save!=='function') VSCBridge.save = function(key,data){ try{ localStorage.setItem('bridge:'+key, JSON.stringify(data)); return true; } catch(e){ return false; } };
  if (typeof VSCBridge.load!=='function') VSCBridge.load = function(key){ try{ var v=localStorage.getItem('bridge:'+key); return v?JSON.parse(v):null; } catch(e){ return null; } };

  if (!window.bridge) window.bridge = VSCBridge;
  if (!window.publisher) window.publisher = VSCBridge;

  if (!window.Bridge) window.Bridge = {};
  if (typeof Bridge.save!=='function') Bridge.save = VSCBridge.save;
  if (typeof Bridge.load!=='function') Bridge.load = VSCBridge.load;
  if (typeof Bridge.publish!=='function') Bridge.publish = VSCBridge.publish;
  if (typeof Bridge.subscribe!=='function') Bridge.subscribe = VSCBridge.subscribe;

  if (typeof window.saveBridge!=='function') window.saveBridge = function(key,data){ return Bridge.save(key,data); };

  try { console.log('[interop polyfill] bridge/Bridge/publisher/saveBridge ready'); } catch(e){}
})();
