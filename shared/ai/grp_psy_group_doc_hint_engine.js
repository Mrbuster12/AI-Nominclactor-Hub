// shared/ai/grp_psy_group_doc_hint_engine.js
// Group-level documentation and containment hint engine
//
// Responsibility:
// - Take a group band (from grp_psy_group_band_engine)
// - Emit structured hints for:
//     * scenario selection
//     * containment requirements
//     * documentation emphasis
//
// This engine does NOT:
// - Start or stop sessions
// - Trigger routing directly
// - Mutate external state
//
// It is a pure helper that group modules can call.

(function (global) {
  'use strict';

  var ENGINE_ID = 'GRP_PSY_GROUP_DOC_HINT_ENGINE';
  var VERSION = '0.1.0';

  var BANDS = {
    EMPTY: 'EMPTY',
    LOW: 'LOW',
    MIXED: 'MIXED',
    HIGH_RISK: 'HIGH_RISK',
    UNSTABLE: 'UNSTABLE'
  };

  /**
   * deriveHints
   *
   * Maps a group band into concrete guidance for:
   * - scenarioIntensity: how emotionally loaded the content should be
   * - containmentLevel: how tightly the facilitator should keep structure
   * - documentationFocus: what should be emphasized in DAP/UR notes
   */
  function deriveHints(groupBand) {
    var band = groupBand || BANDS.LOW;

    // Defaults are intentionally conservative
    var scenarioIntensity = 'NEUTRAL';
    var containmentLevel = 'STANDARD';
    var documentationFocus = [
      'note overall group tone',
      'capture key themes'
    ];

    if (band === BANDS.EMPTY) {
      return {
        scenarioIntensity: 'NONE',
        containmentLevel: 'NONE',
        documentationFocus: ['no active group; verify enrollment and schedule'],
        flags: ['NO_PARTICIPANTS']
      };
    }

    if (band === BANDS.LOW) {
      scenarioIntensity = 'MILD_TO_MODERATE';
      containmentLevel = 'STANDARD';
      documentationFocus = [
        'track emerging themes',
        'note any first-time disclosures',
        'capture engagement level (willing vs. guarded)'
      ];
    } else if (band === BANDS.MIXED) {
      scenarioIntensity = 'MODERATE';
      containmentLevel = 'ELEVATED';
      documentationFocus = [
        'identify high-risk vs. lower-risk participants',
        'document redirection or boundary setting',
        'note any escalation triggers or diffusion attempts'
      ];
    } else if (band === BANDS.HIGH_RISK) {
      scenarioIntensity = 'LOW_TO_MODERATE';
      containmentLevel = 'HIGH';
      documentationFocus = [
        'document safety check-ins and responses',
        'note any direct references to harm, weapons, or severe distress',
        'capture interventions used to maintain safety and focus',
        'flag participants needing post-group follow-up'
      ];
    } else if (band === BANDS.UNSTABLE) {
      scenarioIntensity = 'LOW';
      containmentLevel = 'MAXIMUM';
      documentationFocus = [
        'document reason for session modification or early termination',
        'capture specific crisis cues and statements',
        'note referrals, alerts, or emergency pathways activated',
        'record coordination with on-site / on-call staff'
      ];
    }

    var flags = [];
    if (band === BANDS.MIXED || band === BANDS.HIGH_RISK || band === BANDS.UNSTABLE) {
      flags.push('REQUIRES_POST_GROUP_REVIEW');
    }
    if (band === BANDS.HIGH_RISK || band === BANDS.UNSTABLE) {
      flags.push('CONSIDER_COFACILITATOR_OR_SECURITY_PRESENT');
    }

    return {
      scenarioIntensity: scenarioIntensity,
      containmentLevel: containmentLevel,
      documentationFocus: documentationFocus,
      flags: flags
    };
  }

  /**
   * evaluate
   *
   * @param {Object} ctx
   *   {
   *     groupBandResult: {
   *       band: 'LOW'|'MIXED'|'HIGH_RISK'|'UNSTABLE'|'EMPTY',
   *       unstable: boolean,
   *       notes: string[],
   *       participants: [...]
   *     }
   *   }
   *
   * @returns {Object}
   *   {
   *     engineId: ENGINE_ID,
   *     version: VERSION,
   *     band: string,
   *     unstable: boolean,
   *     notes: string[],
   *     scenarioIntensity: string,
   *     containmentLevel: string,
   *     documentationFocus: string[],
   *     flags: string[]
   *   }
   */
  function evaluate(ctx) {
    ctx = ctx || {};
    var groupBandResult = ctx.groupBandResult || {};
    var band = groupBandResult.band || BANDS.LOW;

    var baseHints = deriveHints(band);

    return {
      engineId: ENGINE_ID,
      version: VERSION,
      band: band,
      unstable: !!groupBandResult.unstable,
      notes: Array.isArray(groupBandResult.notes) ? groupBandResult.notes.slice() : [],
      scenarioIntensity: baseHints.scenarioIntensity,
      containmentLevel: baseHints.containmentLevel,
      documentationFocus: baseHints.documentationFocus,
      flags: baseHints.flags
    };
  }

  var api = {
    ENGINE_ID: ENGINE_ID,
    VERSION: VERSION,
    BANDS: BANDS,
    evaluate: evaluate
  };

  if (!global.AI_ALGOS) {
    global.AI_ALGOS = {};
  }
  global.AI_ALGOS.grp_psy_group_doc_hint_engine = api;

  if (typeof console !== 'undefined' && console.log) {
    console.log('[GRP_PSY_GROUP_DOC_HINT_ENGINE] installed', {
      ENGINE_ID: ENGINE_ID,
      VERSION: VERSION
    });
  }

})(window);

