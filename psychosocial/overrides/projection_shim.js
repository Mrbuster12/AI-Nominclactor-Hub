(function () {
  const enabled = /[?&]proj=1\b/.test(location.search);
  if (!enabled) return;

  function currentContext() {
    return {
      module: 'psychosocial',
      session: { phase: 'mid' },
      metrics: { challengeIndex: (window.aiMetrics && typeof window.aiMetrics.challengeIndex === 'number') ? window.aiMetrics.challengeIndex : 0.3 },
      signals: (window.aiSignals) || { dropoutRisk: false, drift: true }
    };
  }

  async function maybeProject() {
    if (!window.ProjectionEngine) return;
    const ctx = currentContext();
    await window.ProjectionEngine.project(ctx, 'psychosocial_focus');
  }

  window.addEventListener('ai:ready', maybeProject);
  window.addEventListener('ai:summary', maybeProject);
  window.addEventListener('ai:note:composed', maybeProject);
  window.addEventListener('ai:button', maybeProject);

  window.addEventListener('projection:suggestion', (e) => {
    const s = e.detail;
    console.log('[Projection]', s.label, s.payload);
  });
})();
