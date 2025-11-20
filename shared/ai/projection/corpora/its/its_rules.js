(function () {
  // Engagement Disruption Loop (EDL)
  ProjectionRules.register('its:edl', async (ctx) => {
    if (!ctx || !ctx.signals) return null;
    const trigger = (ctx.signals.dropoutRisk || ctx.signals.drift || ctx.signals.avoidance);
    if (!trigger) return null;
    return {
      key: 'edl',
      type: 'intervention',
      label: 'Engagement Disruption Loop',
      payload: {
        steps: [
          'Pattern-interrupt: brief unexpected prompt',
          'Redirect: refocus on a micro-goal already named by client',
          'Affirm: reflect one strength or effort shown'
        ],
        rationale: 'Detected disengagement markers; EDL resets attention with low friction.'
      }
    };
  });

  // Comfort-to-Challenge Escalation Sequence (CCES)
  ProjectionRules.register('its:cces', async (ctx) => {
    if (!ctx || !ctx.session || !ctx.session.phase) return null;
    const okPhase = (ctx.session.phase === 'mid' || ctx.session.phase === 'late');
    const lowChallenge = (ctx.metrics && typeof ctx.metrics.challengeIndex === 'number') ? (ctx.metrics.challengeIndex < 0.4) : true;
    if (!(okPhase && lowChallenge)) return null;
    return {
      key: 'cces',
      type: 'coaching',
      label: 'Comfort-to-Challenge Escalation',
      payload: {
        nudge: 'Introduce one level-up objective tied to stated values.',
        microTask: '1 concrete step before next session.',
        guardrails: 'Avoid exceeding client’s window of tolerance.'
      }
    };
  });
})();
