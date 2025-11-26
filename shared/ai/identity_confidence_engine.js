(function () {
  var ICF_VERSION = "icf-v1";

  var DEFAULT_WEIGHTS = {
    osBiometricPass: 30,      // FaceID / TouchID success
    localFaceMatch: 20,       // local template match
    voiceMatch: 25,           // voiceprint match
    behaviorMatch: 15,        // behavior vs history
    deviceRecognized: 10,     // known device
    geoMismatch: -20,         // large geo drift
    deviceSwitch: -20,        // rapid device switching
    badIpReputation: -30      // known bad network
  };

  function bandForScore(score) {
    if (score >= 70) return "LOW";
    if (score >= 50) return "MEDIUM";
    if (score >= 30) return "HIGH";
    return "BLOCK";
  }

  function scoreSignals(signals, weightsOverride) {
    var w = Object.assign({}, DEFAULT_WEIGHTS, weightsOverride || {});
    signals = signals || {};

    var score = 0;

    if (signals.osBiometricPass) score += w.osBiometricPass;
    if (signals.localFaceMatch) score += w.localFaceMatch;
    if (signals.voiceMatch) score += w.voiceMatch;
    if (signals.behaviorMatch) score += w.behaviorMatch;
    if (signals.deviceRecognized) score += w.deviceRecognized;

    if (signals.geoMismatch) score += w.geoMismatch;
    if (signals.deviceSwitch) score += w.deviceSwitch;
    if (signals.badIpReputation) score += w.badIpReputation;

    var band = bandForScore(score);

    return {
      score: score,
      riskBand: band,
      signals: signals,
      weights: w
    };
  }

  // helper for quick console testing
  function fromContext(ctx) {
    ctx = ctx || {};
    var signals = {
      osBiometricPass: !!ctx.osBiometricPass,
      localFaceMatch: !!ctx.localFaceMatch,
      voiceMatch: !!ctx.voiceMatch,
      behaviorMatch: !!ctx.behaviorMatch,
      deviceRecognized: !!ctx.deviceRecognized,
      geoMismatch: !!ctx.geoMismatch,
      deviceSwitch: !!ctx.deviceSwitch,
      badIpReputation: !!ctx.badIpReputation
    };
    return scoreSignals(signals);
  }

  if (!window.AIEngine) window.AIEngine = {};
  if (!AIEngine.IdentityConfidence) {
    AIEngine.IdentityConfidence = {
      version: ICF_VERSION,
      weights: DEFAULT_WEIGHTS,
      scoreSignals: scoreSignals,
      fromContext: fromContext
    };
  }

  console.log("[ICF] identity_confidence_engine.js ready →", ICF_VERSION);
})();

