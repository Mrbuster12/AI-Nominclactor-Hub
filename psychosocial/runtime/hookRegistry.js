
window.hooks = (function(){
  const map = new Map();
  function register(name, fn){ map.set(name, fn); }
  async function run(name, ctx){ const fn = map.get(name); return fn ? await fn(ctx) : "continue"; }
  return { register, run };
})();
// auto-register bpirlGate (loaded via script tag)
if (window.bpirlGate) { window.hooks.register("bpirlGate", window.bpirlGate); }
