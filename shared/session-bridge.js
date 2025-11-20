/* Session Bridge Shim — compatible with subscriber.js expectations */
(function(){
  // simple in-page event bus
  var bus = window.__VSC_BUS__ || (window.__VSC_BUS__ = document.createElement('div'));

  function on(type, fn){ try{ bus.addEventListener(type, fn); }catch(e){} }
  function off(type, fn){ try{ bus.removeEventListener(type, fn); }catch(e){} }
  function emit(type, detail){ try{ bus.dispatchEvent(new CustomEvent(type,{detail})); }catch(e){} }

  // subscriber.js compatibility
  var Bridge = {
    // expected names:
    subscribe: on,
    publish: emit,
    // also keep our earlier names:
    on: on,
    off: off,
    emit: emit,
    // optional request/response pattern (noop passthrough for now)
    request: function(type, payload){ emit(type, payload); },
    start: function(){ /* no-op init for shim */ }
  };

  window.VSCBridge = window.VSCBridge || Bridge;
  // if already present, augment missing funcs to be safe
  if (!window.VSCBridge.subscribe) window.VSCBridge.subscribe = on;
  if (!window.VSCBridge.publish)   window.VSCBridge.publish   = emit;
  if (!window.VSCBridge.on)        window.VSCBridge.on        = on;
  if (!window.VSCBridge.emit)      window.VSCBridge.emit      = emit;
  if (!window.VSCBridge.start)     window.VSCBridge.start     = function(){};
})();
