;(function(w){
w.AIEngine = w.AIEngine || {};
var events = {};
function on(t, fn){ (events[t]=events[t]||[]).push(fn); return fn; }
function off(t, fn){
if(events[t]) events[t] = events[t].filter(function(f){ return f!==fn; });
}
function emit(t, p){
(events[t]||[]).forEach(function(f){
try { f(p); } catch(e){ console.warn('bus handler', t, e); }
});
}
w.AIEngine.bus = { on:on, off:off, emit:emit, _events:events };
})(window);
