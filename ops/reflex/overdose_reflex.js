// ops/reflex/overdose_reflex.js
// Minimal, non-destructive overdose reflex evaluator for DSM-CTC + psychosocial shell.

(function (global) {
  'use strict';

  /**
   * ctx is a lightweight snapshot that *calling* code will build.
   * Expected shape (all optional):
   * {
   *   sdsnScore: number,          // composite risk from SDSN/Tier IX, 0–100
   *   recentFlags: Array<string>, // e.g. ['OD_HISTORY', 'BENZO_COMBO']
   *   dsmState: object,           // DSM_GATE.getState() or similar
   *   retinaState: object,        // RETINA_STATE.getState() if exposed
   *   voucher: object             // current voucher snapshot, if any
   * }
   */

  function normalizeScore(raw) {
    var n = Number(raw);
    if (!isFinite(n)) return 0;
    if (n < 0) return 0;
    if (n > 100) return 100;
    return n;
  }

  function hasFlag(list, flag) {
    if (!Array.isArray(list)) return false;
    return list.indexOf(flag) !== -1;
  }

  function evaluate(ctx) {
    ctx = ctx || {};

    var score = normalizeScore(ctx.sdsnScore);
    var flags = ctx.recentFlags || [];

    var mode = 'NONE';
    var reason = 'no emergency criteria met';

    // Tiered decision-making – conservative default.
    if (score >= 90 || hasFlag(flags, 'ACTIVE_OVERDOSE')) {
      mode = 'OVERDOSE_EMERGENCY';
      reason = 'extreme risk score or explicit overdose flag';
    } else if (score >= 75 || hasFlag(flags, 'OD_HISTORY')) {
      mode = 'RESIDENTIAL_ELIGIBLE';
      reason = 'very high composite risk / overdose history';
    } else if (score >= 50 || hasFlag(flags, 'POLY_SUBSTANCE')) {
      mode = 'OP_HIGH_RISK';
      reason = 'elevated risk indicators or polysubstance pattern';
    } else {
      mode = 'OP_STANDARD';
      reason = 'baseline or moderate risk profile';
    }

    var payload = {
      mode: mode,
      reason: reason,
      score: score,
      flags: flags,
      dsmState: ctx.dsmState || null,
      retinaState: ctx.retinaState || null,
      voucher: ctx.voucher || null,
      timestamp: new Date().toISOString()
    };

    console.log('[OverdoseReflex] evaluation →', payload);

    return payload;
  }

  var OverdoseReflex = {
    evaluate: evaluate
  };

  // Export onto window for orchestrator + dev console.
  global.OverdoseReflex = OverdoseReflex;

  console.log('[OverdoseReflex] installed');

})(window);

