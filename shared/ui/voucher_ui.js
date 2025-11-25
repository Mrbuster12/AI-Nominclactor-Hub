(function (window, document) {
  if (!window.VSC_STUBS) window.VSC_STUBS = {};

  function safeLog(msg) {
    try {
      if (window.console) console.log(msg);
    } catch (e) {}
  }

  function initVoucherUI() {
    safeLog('[VOUCHER_UI] stub ready');
    // later: attach real buttons/panels to DOM
  }

  window.VSC_STUBS.voucher_ui = {
    init: initVoucherUI
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVoucherUI);
  } else {
    initVoucherUI();
  }
})(window, document);

