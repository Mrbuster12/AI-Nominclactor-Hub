(() => {
  function waitForHologram() {
    const el = document.getElementById('vsc-projection');
    if (el) {
      el.style.position = 'fixed';
      el.style.left = '50%';
      el.style.bottom = '12px';
      el.style.transform = 'translateX(-50%)';
      el.style.zIndex = '99990';
      console.log('[projection] hologram anchored bottom-center');
    } else {
      setTimeout(waitForHologram, 500);
    }
  }
  document.addEventListener('DOMContentLoaded', waitForHologram);
})();
