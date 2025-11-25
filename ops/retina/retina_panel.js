(function (window, document) {
  if (!window.RETINA_PANEL) {
    window.RETINA_PANEL = {
      init: function () {
        try {
          if (window.console) {
            console.log('[RETINA_PANEL] stub ready (UI not implemented yet)');
          }
        } catch (e) {}
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.RETINA_PANEL.init);
  } else {
    window.RETINA_PANEL.init();
  }
})(window, document);

