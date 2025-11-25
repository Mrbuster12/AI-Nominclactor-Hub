(function (window) {
  var engine = {
    id: 'HOLO_REFLEX_ENGINE_STUB',
    route: function (ctx) {
      try {
        if (window.console) {
          console.log('[HOLO_REFLEX_ENGINE] stub route called', ctx || {});
        }
      } catch (e) {}
      return {
        channel: 'DEFAULT',
        reason: 'stub-hologram-router'
      };
    }
  };

  window.HOLO_REFLEX_ENGINE = engine;

  try {
    if (window.console) console.log('[HOLO_REFLEX_ENGINE] stub ready');
  } catch (e) {}
})(window);

