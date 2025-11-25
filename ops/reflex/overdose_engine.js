(function (window) {
  var engine = {
    id: 'OVERDOSE_ENGINE_STUB',
    evaluate: function (ctx) {
      try {
        if (window.console) {
          console.log('[OVERDOSE_ENGINE] stub evaluate called', ctx || {});
        }
      } catch (e) {}
      return {
        risk: 'UNKNOWN',
        reason: 'stub-engine',
        flags: []
      };
    }
  };

  window.OVERDOSE_ENGINE = engine;

  try {
    if (window.console) console.log('[OVERDOSE_ENGINE] stub ready');
  } catch (e) {}
})(window);

