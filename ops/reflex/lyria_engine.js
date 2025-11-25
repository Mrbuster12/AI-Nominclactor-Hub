(function (window) {
  var engine = {
    id: 'LYRIA_ENGINE_STUB',
    run: function (ctx) {
      try {
        if (window.console) {
          console.log('[LYRIA_ENGINE] stub run called', ctx || {});
        }
      } catch (e) {}
      return {
        state: 'NEUTRAL',
        notes: 'stub-only'
      };
    }
  };

  window.LYRIA_ENGINE = engine;

  try {
    if (window.console) console.log('[LYRIA_ENGINE] stub ready');
  } catch (e) {}
})(window);

