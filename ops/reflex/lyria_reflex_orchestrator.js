// ops/reflex/lyria_reflex_orchestrator.js
// Lyria-style reflex orchestrator – turns risk signals into named modes.

(function (global) {
  'use strict';

  var MODES = {
    OP_STANDARD: 'OP_STANDARD',
    OP_HIGH_RISK: 'OP_HIGH_RISK',
    RESIDENTIAL_ELIGIBLE: 'RESIDENTIAL_ELIGIBLE',
    OVERDOSE_EMERGENCY: 'OVERDOSE_EMERGENCY'
  };

  function safeOverdoseEval(ctx) {
    if (global.OverdoseReflex && typeof global.OverdoseReflex.evaluate === 'function') {
      return global.OverdoseReflex.evaluate(ctx);
    }
    console.warn('[LyriaReflex] OverdoseReflex not available, defaulting to OP_STANDARD');
    return {
      mode: MODES.OP_STANDARD,
      reason: 'OverdoseReflex not installed'
    };
  }

  /**
   * selectMode(ctx)
   * Returns the operational mode string based on current state.
   */
  function selectMode(ctx) {
    ctx = ctx || {};

    var result = safeOverdoseEval(ctx);
    var mode = result && result.mode ? result.mode : MODES.OP_STANDARD;

    console.log('[LyriaReflex] selectMode →', {
      input: ctx,
      overdoseResult: result,
      mode: mode
    });

    return mode;
  }

  /**
   * applyToIPX(mode)
   * Optional helper – if an IPX presence API is exposed, we nudge it.
   * Otherwise we only log.
   */
  function applyToIPX(mode) {
    mode = mode || MODES.OP_STANDARD;

    var ipx = global.IPX || (global.HoloBundle && global.HoloBundle.ipx) || null;

    if (!ipx || typeof ipx.setPresenceMode !== 'function') {
      console.log('[LyriaReflex] IPX presence API not available; mode =', mode);
      return;
    }

    ipx.setPresenceMode(mode);
    console.log('[LyriaReflex] applied mode to IPX →', mode);
  }

  var LyriaReflex = {
    MODES: MODES,
    selectMode: selectMode,
    applyToIPX: applyToIPX
  };

  global.LyriaReflex = LyriaReflex;

  console.log('[LyriaReflex] installed');

})(window);

