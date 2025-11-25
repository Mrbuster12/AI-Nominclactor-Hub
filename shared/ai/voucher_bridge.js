(function (window) {
  if (!window.VSC_STUBS) window.VSC_STUBS = {};

  var bridge = {
    id: 'VOUCHER_BRIDGE_STUB',
    init: function () {
      try {
        if (window.console) {
          console.log('[VOUCHER_BRIDGE] stub ready');
        }
      } catch (e) {}
    }
  };

  window.VSC_STUBS.voucher_bridge = bridge;
  bridge.init();
})(window);

