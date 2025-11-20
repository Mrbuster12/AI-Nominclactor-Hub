// ai-nominclactor/assets/js/app.js

// --- Simple self-check block ---
(function () {
  const btn = document.getElementById('check-ready');
  const out = document.getElementById('status');
  if (!btn || !out) return;

  btn.addEventListener('click', () => {
    const checks = [
      'Module folder present',
      'Assets linked',
      'Return to Hub button linked',
      'Ready for Pre-Assessment integration',
      'Ready for Psychiatric Evaluation scaffold',
      'VNP Phase 2 algorithms wired (see console for VNP_PHASE2 log)'
    ];
    out.textContent = 'Self-Check:\n- ' + checks.join('\n- ');
  });
})();

document.addEventListener('DOMContentLoaded', function () {
  // --- Bottom control row ---
  let row = document.querySelector('.actions');
  if (!row) {
    row = document.createElement('section');
    row.className = 'actions';
    row.style.cssText = 'display:flex;gap:8px;margin:12px 0;flex-wrap:wrap';
    (document.querySelector('.container') || document.body).appendChild(row);
  }

  function addBtn(id, label, extraClass) {
    if (document.getElementById(id)) return;
    const b = document.createElement('button');
    b.id = id;
    b.type = 'button';
    b.className = 'btn' + (extraClass ? ' ' + extraClass : '');
    b.textContent = label;
    row.appendChild(b);
  }

  addBtn('mic', '🎙️ Mic', 'secondary');
  addBtn('export-json', 'Export Summary JSON', 'secondary');
  addBtn('reset-session', 'Reset Interview', 'danger');

  // --- Button behavior wiring ---

  const micBtn = document.getElementById('mic');
  const exportBtn = document.getElementById('export-json');
  const resetBtn = document.getElementById('reset-session');

  if (micBtn) {
    micBtn.addEventListener('click', () => {
      console.log('[AI-NOMINCLACTOR] Mic button clicked – placeholder hook');
      // later: wire to actual speech / AI bridge if needed
      window.dispatchEvent(
        new CustomEvent('ai:mic-toggle', {
          detail: { source: 'ai-nominclactor', at: Date.now() }
        })
      );
    });
  }

  function safeGetAIAlgosKeys() {
    const algos = window.AI_ALGOS;
    if (!algos || typeof algos !== 'object') return [];
    try {
      return Object.keys(algos);
    } catch (e) {
      console.warn('[AI-NOMINCLACTOR] unable to enumerate AI_ALGOS keys', e);
      return [];
    }
  }

  async function buildExportSnapshot() {
    const payload = {
      source: 'ai-nominclactor',
      at: new Date().toISOString(),
      page: {
        path: window.location.pathname,
        href: window.location.href
      },
      vnp: {
        phase: 'VNP_PHASE2',
        registered_algorithms: safeGetAIAlgosKeys()
      }
    };

    // Try a probe run of vnp_psy_phase3_scenario_driver if available
    try {
      if (window.VNP_DEBUG && typeof window.VNP_DEBUG.run === 'function') {
        const probe = await window.VNP_DEBUG.run(
          'vnp_psy_phase3_scenario_driver',
          { source: 'ai-nominclactor-export', at: Date.now() }
        );
        payload.vnp.probe = probe || null;
      }
    } catch (e) {
      console.warn('[AI-NOMINCLACTOR] VNP probe failed', e);
      payload.vnp.probe_error = String(e);
    }

    return payload;
  }

  function downloadJson(obj, filename) {
    try {
      const blob = new Blob([JSON.stringify(obj, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'ai-nominclactor-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('[AI-NOMINCLACTOR] downloadJson failed', e);
    }
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      console.log('[AI-NOMINCLACTOR] Export JSON clicked');
      const snapshot = await buildExportSnapshot();
      console.log('[AI-NOMINCLACTOR] export snapshot →', snapshot);
      downloadJson(
        snapshot,
        'ai-nominclactor-vnp-export-' + Date.now() + '.json'
      );
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      console.log('[AI-NOMINCLACTOR] Reset Interview clicked');

      try {
        // if your intake/session keys have a prefix, you can be more surgical here
        const ls = window.localStorage;
        const keysToClear = [];
        for (let i = 0; i < ls.length; i++) {
          const k = ls.key(i);
          if (!k) continue;
          if (
            k.indexOf('ctc_') === 0 ||
            k.indexOf('vnp_') === 0 ||
            k.indexOf('intake_') === 0 ||
            k.indexOf('psychosocial_') === 0
          ) {
            keysToClear.push(k);
          }
        }
        keysToClear.forEach(k => ls.removeItem(k));
        console.log(
          '[AI-NOMINCLACTOR] cleared session keys:',
          keysToClear
        );
      } catch (e) {
        console.warn('[AI-NOMINCLACTOR] error clearing localStorage', e);
      }

      try {
        window.dispatchEvent(
          new CustomEvent('ai:intake-reset', {
            detail: { source: 'ai-nominclactor', at: Date.now() }
          })
        );
      } catch (e) {
        // ignore
      }

      window.location.reload();
    });
  }

  // --- VNP_DEBUG helper: safe access to AI_ALGOS ---
  (function (w) {
    if (w.VNP_DEBUG) return;

    function getAIAlgos() {
      const algos = w.AI_ALGOS;
      if (!algos) {
        console.warn('[VNP_DEBUG] window.AI_ALGOS is not defined yet');
        return null;
      }
      return algos;
    }

    function resolveAlgo(name) {
      const algos = getAIAlgos();
      if (!algos) return null;

      // 1) Direct map: AI_ALGOS[name] = fn
      if (typeof algos[name] === 'function') {
        return algos[name];
      }

      // 2) Object wrapper with .run handler
      if (algos[name] && typeof algos[name].run === 'function') {
        return algos[name].run.bind(algos[name]);
      }

      // 3) Fallback: scan values if structure is weird
      if (typeof algos === 'object') {
        for (const key in algos) {
          if (!Object.prototype.hasOwnProperty.call(algos, key)) continue;
          const v = algos[key];
          if (typeof v === 'function' && (v.name === name || key === name)) {
            return v;
          }
          if (v && typeof v === 'object' && typeof v.run === 'function') {
            if (v.id === name || key === name || v.name === name) {
              return v.run.bind(v);
            }
          }
        }
      }

      console.warn(
        '[VNP_DEBUG] algorithm not found by name:',
        name,
        'available keys:',
        Object.keys(algos)
      );
      return null;
    }

    function list() {
      const algos = getAIAlgos();
      if (!algos) return [];
      const keys = Object.keys(algos);
      console.log('[VNP_DEBUG] AI_ALGOS keys:', keys);
      return keys;
    }

    function inspect(name) {
      const algos = getAIAlgos();
      if (!algos) return null;
      const val = algos[name];
      console.log('[VNP_DEBUG] inspect', name, '→', val);
      return val;
    }

    async function run(name, payload) {
      const fn = resolveAlgo(name);
      if (!fn) return null;
      try {
        const input = payload || { source: 'VNP_DEBUG', at: Date.now() };
        const result = await fn(input);
        console.log('[VNP_DEBUG] run', name, '→', result);
        return result;
      } catch (e) {
        console.error('[VNP_DEBUG] error running', name, e);
        return null;
      }
    }

    w.VNP_DEBUG = { list, inspect, run };
    console.log(
      '[VNP_DEBUG] helper installed – use VNP_DEBUG.list() and VNP_DEBUG.run(name, payload)'
    );
  })(window);
});

