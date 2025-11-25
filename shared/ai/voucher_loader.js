(function (window) {
  if (!window.VSC_STUBS) window.VSC_STUBS = {};

  var loader = {
    id: 'VOUCHER_LOADER_STUB',
    load: function () {
      try {
        if (window.console) {
          console.log('[VOUCHER_LOADER] stub ready (no external config)');
        }
      } catch (e) {}
    }
  };

  window.VSC_STUBS.voucher_loader = loader;
  loader.load();
})(window);

