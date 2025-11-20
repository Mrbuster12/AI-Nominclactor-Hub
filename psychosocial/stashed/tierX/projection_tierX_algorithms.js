(function (global){
  var api = {
    project: function(payload){
      payload = payload || {};
      return { ok: true, input: payload, ts: Date.now() };
    }
  };
  global.TierXProjection = api;
  if (typeof module === 'object' && module && module.exports) module.exports = api;
  try { eval('export {}'); } catch(_) {}
})(typeof window!=='undefined' ? window : globalThis);
