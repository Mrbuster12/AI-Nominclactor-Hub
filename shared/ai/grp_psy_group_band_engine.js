// shared/ai/grp_psy_group_band_engine.js
// Group-level psychiatric banding engine for sessions
//
// Responsibility:
// - Take multiple participant-level psychiatric summaries
// - Derive a group-level risk band and containment hints
// - Re-use existing VNP engines when available (non-breaking)
//
// This engine does NOT:
// - Modify vouchers
// - Modify routing directly
// - Write to any external stores
//
// It is a pure function that can be called from group session logic.

(function (global) {
  'use strict';

  var ENGINE_ID = 'GRP_PSY_GROUP_BAND_ENGINE';
  var VERSION = '0.1.0';

  /**
   * normalizeParticipant
   *
   * We accept flexible shapes because different modules may pass
   * slightly different bundles. We try to normalize without throwing.
   */
  function normalizeParticipant(p) {
    p = p || {};

    // Prefer VNP output format if present
    var reflex = p.reflexResult || p.psyReflex || {};
    var dsm    = p.dsmSummary   || p.dsmHelper || null;

    var severity = reflex.severity || (dsm && dsm.severity) || 'BASELINE';
    var band     = null;

    // If VNP_DSM_SPLINTER already provided a band, respect it
    if (p.dsmSplinter && typeof p.dsmSplinter.band === 'string') {
      band = p.dsmSplinter.band;
    } else if (dsm && typeof dsm.band === 'string') {
      band = dsm.band;
    }

    var flags = Array.isArray(reflex.flags) ? reflex.flags.slice() :
                Array.isArray(p.flags) ? p.flags.slice() : [];

    var clientId = p.clientId || p.id || null;

    return {
      clientId: clientId,
      severity: severity,
      band: band,          // e.g. 'LOW', 'MODERATE', 'HIGH', 'CRISIS', 'UNSTABLE'
      flags: flags,
      raw: p               // keep original for advanced engines
    };
  }

  function classifyGroupBand(participants) {
    if (!participants || !participants.length) {
      return {
        band: 'EMPTY',
        notes: ['no participants present'],
        unstable: false
      };
    }

    var hasCrisisOrEmergent = false;
    var highCount = 0;
    var moderateCount = 0;
    var total = participants.length;

    for (var i = 0; i < participants.length; i++) {
      var p = participants[i];
      var sev = p.severity || 'BASELINE';

      if (sev === 'CRISIS' || sev === 'EMERGENT' || sev === 'CRITICAL') {
        hasCrisisOrEmergent = true;
      } else if (sev === 'HIGH') {
        highCount++;
      } else if (sev === 'MODERATE') {
        moderateCount++;
      }
    }

    // If any crisis / emergent present → UNSTABLE group
    if (hasCrisisOrEmergent) {
      return {
        band: 'UNSTABLE',
        notes: ['at least one participant in CRISIS/EMERGENT/CRITICAL'],
        unstable: true
      };
    }

    // Many HIGH participants → HIGH_RISK group
    if (highCount >= 2 || (highCount === 1 && total <= 3)) {
      return {
        band: 'HIGH_RISK',
        notes: ['multiple or proportionally significant HIGH severity participants'],
        unstable: false
      };
    }

    // Mix of MODERATE/HIGH → MIXED
    if (highCount > 0 || moderateCount > 0) {
      return {
        band: 'MIXED',
        notes: ['combination of MODERATE and/or HIGH participants'],
        unstable: false
      };
    }

    // Everyone baseline / low → LOW group band
    return {
      band: 'LOW',
      notes: ['all participants BASELINE/LOW'],
      unstable: false
    };
  }

  /**
   * evaluateGroup
   *
   * @param {Object} ctx
   *   {
   *     participants: [
   *       {
   *         clientId: string,
   *         reflexResult: { severity, flags, ... },
   *         dsmSummary: { severity, band, ... } | null,
   *         dsmSplinter: { band, score, ... } | null
   *       },
   *       ...
   *     ]
   *   }
   *
   * @returns {Object}
   *   {
   *     engineId: ENGINE_ID,
   *     version: VERSION,
   *     band: 'LOW'|'MIXED'|'HIGH_RISK'|'UNSTABLE'|'EMPTY',
   *     unstable: boolean,
   *     notes: string[],
   *     participants: [
   *       {
   *         clientId,
   *         severity,
   *         band,
   *         flags
   *       },
   *       ...
   *     ]
   *   }
   */
  function evaluateGroup(ctx) {
    ctx = ctx || {};
    var list = Array.isArray(ctx.participants) ? ctx.participants : [];

    var normalized = [];
    for (var i = 0; i < list.length; i++) {
      normalized.push(normalizeParticipant(list[i]));
    }

    var bandInfo = classifyGroupBand(normalized);

    return {
      engineId: ENGINE_ID,
      version: VERSION,
      band: bandInfo.band,
      unstable: !!bandInfo.unstable,
      notes: bandInfo.notes || [],
      participants: normalized.map(function (p) {
        return {
          clientId: p.clientId,
          severity: p.severity,
          band: p.band,
          flags: p.flags
        };
      })
    };
  }

  var api = {
    ENGINE_ID: ENGINE_ID,
    VERSION: VERSION,
    evaluateGroup: evaluateGroup
  };

  // Register inside AI_ALGOS if present (non-breaking)
  if (!global.AI_ALGOS) {
    global.AI_ALGOS = {};
  }
  global.AI_ALGOS.grp_psy_group_band_engine = api;

  if (typeof console !== 'undefined' && console.log) {
    console.log('[GRP_PSY_GROUP_BAND_ENGINE] installed', {
      ENGINE_ID: ENGINE_ID,
      VERSION: VERSION
    });
  }

})(window);

