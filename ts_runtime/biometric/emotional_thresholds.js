(function (global) {
  /**
   * Browser-safe biometric emotional thresholds stub.
   * Replaces broken ES module version.
   * No export syntax. No imports. No bundler requirements.
   */

  var root = global || window;
  var TSRuntime = root.TSRuntime || (root.TSRuntime = {});

  // Create namespace if missing
  TSRuntime.emotion = TSRuntime.emotion || {};

  /**
   * Storage for thresholds
   */
  var thresholds = {
    sadness: 0,
    anger: 0,
    fear: 0,
    joy: 0,
    overwhelm: 0
  };

  /**
   * Set threshold safely
   */
  TSRuntime.emotion.set = function (key, value) {
    try {
      if (thresholds.hasOwnProperty(key)) {
        thresholds[key] = Number(value) || 0;
      }
    } catch (e) {
      console.warn("[ts_runtime:emotion.set] error", e);
    }
  };

  /**
   * Get threshold
   */
  TSRuntime.emotion.get = function (key) {
    try {
      return thresholds[key] || 0;
    } catch (e) {
      console.warn("[ts_runtime:emotion.get] error", e);
      return 0;
    }
  };

  /**
   * Bulk load thresholds from an object
   */
  TSRuntime.emotion.load = function (obj) {
    try {
      if (!obj) return;
      Object.keys(obj).forEach(function (k) {
        if (thresholds.hasOwnProperty(k)) {
          thresholds[k] = Number(obj[k]) || 0;
        }
      });
    } catch (e) {
      console.warn("[ts_runtime:emotion.load] error", e);
    }
  };

  /**
   * Expose raw map if needed
   */
  TSRuntime.emotion.dump = function () {
    return Object.assign({}, thresholds);
  };

  console.log("[ts_runtime] emotional_thresholds stub ready");

})(typeof window !== "undefined" ? window : this);

