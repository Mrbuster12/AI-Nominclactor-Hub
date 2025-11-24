(function (global) {
  /**
   * Minimal TS runtime stub for browser execution.
   * - No ES module syntax
   * - Exposes a global TSRuntime object
   * - Safe no-op helpers for anything that calls into it
   */

  var root = global || (typeof window !== "undefined" ? window : this);

  var TSRuntime = root.TSRuntime || {};

  TSRuntime.version = "intake-docs-stub-20251123";

  /**
   * Register a named helper/transform.
   * Example usage (if any real helpers are added later):
   *   TSRuntime.register("example", fn)
   */
  TSRuntime.register = function register(name, impl) {
    try {
      if (!name) return TSRuntime;
      TSRuntime._registry = TSRuntime._registry || {};
      TSRuntime._registry[name] = impl || function () {};
    } catch (e) {
      console.warn("[ts_runtime:register] stub error for", name, e);
    }
    return TSRuntime;
  };

  /**
   * Require a previously registered helper.
   */
  TSRuntime.require = function require(name) {
    try {
      TSRuntime._registry = TSRuntime._registry || {};
      return TSRuntime._registry[name] || null;
    } catch (e) {
      console.warn("[ts_runtime:require] stub error for", name, e);
      return null;
    }
  };

  /**
   * Safe eval wrapper for any runtime transforms.
   */
  TSRuntime.run = function run(fn) {
    if (typeof fn !== "function") return null;
    try {
      return fn();
    } catch (e) {
      console.warn("[ts_runtime:run] stub caught error", e);
      return null;
    }
  };

  /**
   * Simple log so we can confirm it actually loaded.
   */
  try {
    if (!TSRuntime._logged) {
      TSRuntime._logged = true;
      console.log("[ts_runtime] core stub ready →", TSRuntime.version);
    }
  } catch (e) {
    // ignore
  }

  root.TSRuntime = TSRuntime;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this));

