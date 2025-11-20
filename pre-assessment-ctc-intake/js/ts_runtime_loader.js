;(function(w){
  if(!w.AIEngine||!w.AIEngine.bus){ console.warn('[ts_runtime_loader] bus missing'); return; }
  console.log('[ts_runtime_loader] active in', location.pathname);
  w.AIEngine.bus.emit('ts_runtime:ready', {module:location.pathname, ts:Date.now()});
})(window);
