(function (window, document) {
  function initPanel() {
    try {
      if (window.console) {
        console.log('[LYRIA_PANEL] stub ready (UI placeholder)');
      }
    } catch (e) {}
  }

  window.LYRIA_PANEL = { init: initPanel };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPanel);
  } else {
    initPanel();
  }
})(window, document);

