(function () {
  var CH = 'vsc_bridge_channel';
  var LS = 'VSC_SNAPSHOT';
  function saveSnapshot(o){ try{ localStorage.setItem(LS, JSON.stringify(o)); }catch{} }
  function loadSnapshot(){ try{ return JSON.parse(localStorage.getItem(LS)||'{}'); }catch{ return {}; } }
  function publish(type,payload){
    try{ new BroadcastChannel(CH).postMessage({type:type,payload:payload,ts:Date.now()}); }catch{}
    if(type==='ctc_update'){ saveSnapshot(payload && payload.tpModel ? payload.tpModel : payload); }
  }
  function subscribe(typeOrCb, maybeCb){
    var typeFilter = (typeof typeOrCb==='string') ? typeOrCb : null;
    var handler = (typeof typeOrCb==='function') ? typeOrCb : ((typeof maybeCb==='function')?maybeCb:null);
    if(!handler) return function(){};
    function route(msg){
      if(!msg) return;
      var t = msg.type || 'ctc_update';
      if(typeFilter && t!==typeFilter) return;
      var payload = (msg.payload!==undefined) ? msg.payload : msg;
      handler({ type:t, payload: payload });
    }
    var bc=null;
    try{ bc=new BroadcastChannel(CH); bc.onmessage=function(ev){ route(ev.data); }; }catch{}
    function onDom(e){ route({ type:'ctc_update', payload:e.detail }); }
    document.addEventListener('ctc_update', onDom);
    window.addEventListener('ctc_update', onDom);
    return function(){
      try{ if(bc) bc.close(); }catch{}
      document.removeEventListener('ctc_update', onDom);
      window.removeEventListener('ctc_update', onDom);
    };
  }
  window.VSCBridge = window.VSCBridge || {};
  window.VSCBridge.publish = window.VSCBridge.publish || publish;
  window.VSCBridge.subscribe = window.VSCBridge.subscribe || subscribe;
  if(!window.VSCBridge.on) window.VSCBridge.on = window.VSCBridge.subscribe;
  window.VSCBridge.getSnapshot = window.VSCBridge.getSnapshot || loadSnapshot;
  console.log('[bridge] installed');
})();
