window.ProjectionRuntime = (function () {
  const state = { lastFired: {}, countThisSession: 0 };
  function canFire(key, cooldownSec, maxPerSession) {
    const now = Date.now();
    const last = state.lastFired[key] || 0;
    const okCooldown = (now - last) > cooldownSec * 1000;
    const okCount = state.countThisSession < (maxPerSession || 99);
    return okCooldown && okCount;
  }
  function markFired(key) {
    state.lastFired[key] = Date.now();
    state.countThisSession++;
  }
  return { canFire, markFired, state };
})();
