(function (window) {
  var engine = {
    id: 'PROJECTION_REFLEX_STUB',
    apply: function (ctx) {
      try {
        if (window.console) {
          console.log('[PROJECTION_REFLEX] stub apply called', ctx || {});
        }
      } catch (e) {}
      return {
        hologram: 'DEFAULT',
        env: 'DEFAULT_ENV',
        reason: 'stub-projection'
      };
    }
  };

  window.PROJECTION_REFLEX = engine;

  try {
    if (window.console) console.log('[PROJECTION_REFLEX] stub ready');
  } catch (e) {}
})(window);

