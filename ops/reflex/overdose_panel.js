(function (window, document) {
  function initPanel() {
    try {
      if (window.console) {
        console.log('[OVERDOSE_PANEL] stub ready (no DOM bindings yet)');
      }
    } catch (e) {}
  }

  window.OVERDOSE_PANEL = { init: initPanel };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPanel);
  } else {
    initPanel();
  }
})(window, document);

