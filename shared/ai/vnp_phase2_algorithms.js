(function (w) {
  // Avoid double wiring
  if (w.__VNP_PHASE2_WIRED__) return;
  w.__VNP_PHASE2_WIRED__ = true;

  // Root algorithm map – reuse existing if present
  const root = w.AI_ALGOS = w.AI_ALGOS || {};

  // Optional adapter into the real VNP engine (from your standalone build)
  const adapter = (w.VNPAdapter && typeof w.VNPAdapter.route === 'function')
    ? w.VNPAdapter
    : null;

  function safeEmit(evt, payload) {
    try {
      if (w.AIEngine && w.AIEngine.bus && typeof w.AIEngine.bus.emit === 'function') {
        w.AIEngine.bus.emit(evt, payload);
      }
    } catch (e) {}
    try {
      w.dispatchEvent(new CustomEvent(evt, { detail: payload }));
    } catch (e) {}
  }

  function makeStub(id, meta) {
    return function runVNPPhase2(payload) {
      const packet = {
        algorithm: id,
        phase: 'VNP_PHASE2',
        at: Date.now(),
        payload: payload || {},
        meta: meta || {}
      };

      // Hand off to real VNP adapter if present
      if (adapter) {
        try {
          const res = adapter.route(packet);
          packet.adapterResult = res || null;
        } catch (e) {
          packet.adapterError = String(e);
        }
      }

      safeEmit('vnp:phase2:invoke', packet);
      return packet;
    };
  }

  function register(id, description) {
    if (!id) return;
    if (!root[id]) {
      root[id] = {
        id,
        phase: 'VNP_PHASE2',
        description: description || '',
        run: makeStub(id, { description })
      };
    }
  }

  // ---------- Algorithms from VNP Phase 2 breadcrumb ----------

  register(
    'vnp_psy_specifier_cluster_engine',
    'Classifies specifier sets into diagnostic clusters.'
  );

  register(
    'vnp_psy_affect_reflex_tree',
    'Evaluates emotional / affective indicators for the VNP psychiatrist shell.'
  );

  register(
    'vnp_psy_group_sensitivity_injector',
    'Determines group-level risk bands / sensitivity thresholds based on inputs.'
  );

  register(
    'vnp_psy_phase3_scenario_driver',
    'Drives Phase 3 scenario progression logic for the psychiatric evaluation.'
  );

  register(
    'vnp_psy_signature_engine',
    'Provides contextual signature markers and output bundles for VNP reports.'
  );

  register(
    'vnp_psy_correctional_overrides',
    'Applies correctional-facility-specific overrides to VNP routing and risk.'
  );

  register(
    'VNP_DSM_SPLINTER',
    'Produces DSM-adjacent risk and scoring outputs (splinter overlay).'
  );

  const keys = Object.keys(root).filter(
    k => root[k] && root[k].phase === 'VNP_PHASE2'
  );

  // Breadcrumb for you in the console
  console.log('[VNP_PHASE2] registered algorithms →', keys);

  // Event breadcrumb if anything else cares
  safeEmit('vnp:phase2:ready', {
    source: 'vnp_phase2_algorithms.js',
    keys
  });
})(window);

