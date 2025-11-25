(function (window) {
  var engine = {
    id: 'PSY_REFLEX_ENGINE_STUB',
    evaluate: function (ctx) {
      try {
        if (window.console) {
          console.log('[PSY_REFLEX_ENGINE] stub evaluate called', ctx || {});
        }
      } catch (e) {}
      return {
        severity: 'UNKNOWN',
        band: 'NEUTRAL',
        reason: 'stub-psy-reflex'
      };
    }
  };

  window.PSY_REFLEX_ENGINE = engine;

  try {
    if (window.console) console.log('[PSY_REFLEX_ENGINE] stub ready');
  } catch (e) {}
})(window);

