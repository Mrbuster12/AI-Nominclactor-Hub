// shared/session-bridge.js
(function(){
  const KEY = "ctc.session";
  function read(){ try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch(e){ return {}; } }
  function write(obj){
    const now = new Date().toISOString();
    const next = Object.assign({}, read(), obj, { updatedAt: now });
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("ctc:session:update", { detail: next }));
  }
  window.ctcSession = { read, write, KEY };
  window.ctcPush = function(payload){ write(payload || {}); };
})();