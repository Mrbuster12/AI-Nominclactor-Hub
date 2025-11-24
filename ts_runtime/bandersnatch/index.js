(function (global) {
  /**
   * Browser-safe Bandersnatch stub.
   * Replaces broken ES module version.
   * No export syntax. No imports. No bundler requirements.
   */

  var root = global || window;
  var TSRuntime = root.TSRuntime || (root.TSRuntime = {});

  // Namespace for branching / scenario logic
  var bandersnatch = TSRuntime.bandersnatch || (TSRuntime.bandersnatch = {});

  /**
   * Internal registry of scenarios / branches.
   * Shape is intentionally generic so callers don't crash:
   * {
   *   [id]: {
   *     id,
   *     label,
   *     meta,
   *     createdAt,
   *     lastChosenAt,
   *     stats: { chosenCount }
   *   }
   * }
   */
  var registry = {};

  /**
   * Register a scenario in a safe way.
   * Callers can pass whatever meta they want.
   */
  bandersnatch.registerScenario = function (id, meta) {
    if (!id) return;
    var now = new Date().toISOString();
    if (!registry[id]) {
      registry[id] = {
        id: String(id),
        label: (meta && meta.label) || String(id),
        meta: meta || {},
        createdAt: now,
        lastChosenAt: null,
        stats: { chosenCount: 0 }
      };
    } else {
      // shallow merge meta
      registry[id].meta = registry[id].meta || {};
      if (meta) {
        Object.keys(meta).forEach(function (k) {
          registry[id].meta[k] = meta[k];
        });
      }
    }
  };

  /**
   * Choose a branch. Returns the scenario entry (or null).
   */
  bandersnatch.choose = function (id, context) {
    if (!id || !registry[id]) {
      console.warn("[ts_runtime:bandersnatch.choose] unknown id", id);
      return null;
    }
    var now = new Date().toISOString();
    var entry = registry[id];
    entry.lastChosenAt = now;
    entry.stats.chosenCount = (entry.stats.chosenCount || 0) + 1;
    // Optionally log context for debugging
    if (context) {
      try {
        entry.lastContext = context;
      } catch (e) {
        console.warn("[ts_runtime:bandersnatch.choose] context error", e);
      }
    }
    return entry;
  };

  /**
   * Get a scenario by id.
   */
  bandersnatch.get = function (id) {
    return registry[id] || null;
  };

  /**
   * Dump all scenarios (for debug / introspect).
   */
  bandersnatch.dump = function () {
    // Return a shallow clone so callers can't mutate internals easily
    var out = {};
    Object.keys(registry).forEach(function (k) {
      out[k] = Object.assign({}, registry[k]);
    });
    return out;
  };

  console.log("[ts_runtime] bandersnatch stub ready");

})(typeof window !== "undefined" ? window : this);

