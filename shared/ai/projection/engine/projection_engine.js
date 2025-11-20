(async function () {
  const policiesUrl = '/shared/ai/projection/engine/projection_policies.json';
  let policies = { enabled: false, policies: {}, default_policy: 'baseline' };

  async function loadPolicies() {
    try { policies = await (await fetch(policiesUrl, {cache:'no-store'})).json(); }
    catch (_e) { policies.enabled = false; }
  }

  async function project(context, policyName) {
    if (!policies.enabled) return null;
    const policyKey = policyName || policies.default_policy;
    const policy = policies.policies[policyKey] || policies.policies[policies.default_policy];
    if (!policy) return null;

    for (const ruleKey of policy.rulesets) {
      const rs = window.ProjectionRules.get(ruleKey);
      if (!rs) continue;
      const out = await rs(context);
      if (!out) continue;
      const cd = (policy.cooldowns && (policy.cooldowns[out.key] || policy.cooldowns[ruleKey])) || 180;
      if (!window.ProjectionRuntime.canFire(out.key || ruleKey, cd, policy.max_per_session)) continue;
      window.ProjectionRuntime.markFired(out.key || ruleKey);
      window.dispatchEvent(new CustomEvent('projection:suggestion', { detail: out }));
      return out; // one suggestion at a time; change if you want multi
    }
    return null;
  }

  await loadPolicies();
  window.ProjectionEngine = { project, reload: loadPolicies };
})();
