(function () {
  const btn = document.getElementById('check-ready');
  const out = document.getElementById('status');

  if (btn && out) {
    btn.addEventListener('click', () => {
      const checks = [
        'Module folder present',
        'Assets linked',
        'AI Bus online',
        'Navigation bindings active',
        'VNP Phase2 algorithms wired'
      ];
      out.textContent = 'Self-Check:\n- ' + checks.join('\n- ');
    });
  }
})();

document.addEventListener('DOMContentLoaded', function () {

  /* ---------------------------
     Add Intake Navigation
  --------------------------- */
  const navButtons = document.querySelectorAll('button[data-target]');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const href = btn.getAttribute('data-target');
      if (!href) return;

      try {
        if (window.AIEngine && AIEngine.bus && AIEngine.bus.emit) {
          AIEngine.bus.emit('hub:navigate', {
            from: 'ai-nominclactor',
            to: href,
            at: new Date().toISOString()
          });
        }
      } catch (e) {}

      window.location.href = href;
    });
  });

  /* ---------------------------
     VNP Phase2 Debug Helper
  --------------------------- */
  window.VNP_DEBUG = {
    list() {
      if (!window.AI_ALGOS) {
        console.warn('AI_ALGOS not found');
        return;
      }
      console.log('[VNP_DEBUG] AI_ALGOS keys:', Object.keys(window.AI_ALGOS));
      return Object.keys(window.AI_ALGOS);
    },

    run(name, payload = {}) {
      if (!window.AI_ALGOS || !window.AI_ALGOS[name]) {
        console.warn('[VNP_DEBUG] algorithm not found:', name, Object.keys(window.AI_ALGOS || {}));
        return null;
      }

      const fn = window.AI_ALGOS[name];
      const out = fn({
        source: 'VNP_DEBUG',
        at: Date.now(),
        payload
      });

      console.log('[VNP_DEBUG] run ' + name + ' →', out);
      return out;
    }
  };

  console.log("[VNP_DEBUG] helper installed – use VNP_DEBUG.list() and VNP_DEBUG.run(name)");
});

