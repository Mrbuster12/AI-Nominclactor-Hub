window.ProjectionRules = (function () {
  const registry = new Map();  // key -> function(context) => {type, payload}
  function register(key, fn) { registry.set(key, fn); }
  function get(key) { return registry.get(key); }
  function list() { return Array.from(registry.keys()); }
  return { register, get, list };
})();
