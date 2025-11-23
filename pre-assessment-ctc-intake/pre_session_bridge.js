// pre_session_bridge.js
// Pre-Assessment → session_bridge snapshot for Treatment Plan

(function () {
  const SOURCE_NS = "preassessment-repo";   // existing intake repo
  const SESSION_NS = "session_bridge";      // what TP expects
  const TTL_MS = parseInt(
    localStorage.getItem("session_bridge:ttl") || String(2 * 60 * 60 * 1000),
    10
  );

  function log() {
    if (!console || !console.log) return;
    console.log.apply(console, arguments);
  }

  async function loadFromRepo() {
    if (!window.Bridge || !Bridge.load) {
      log("[PRE→SESSION] Bridge.load not available, skipping snapshot");
      return null;
    }

    try {
      const frag = new URLSearchParams(location.hash.slice(1));
      const k =
        frag.get("k") ||
        sessionStorage.getItem("session_bridge_key") ||
        localStorage.getItem("session_bridge:last_k");

      if (!k) {
        log("[PRE→SESSION] no session key found in hash/session/localStorage");
        return null;
      }

      const env = await Bridge.load(SOURCE_NS, k, TTL_MS);
      log("[PRE→SESSION] loaded from", SOURCE_NS, "key =", k, "→", env);
      return { key: k, env: env || {} };
    } catch (err) {
      console.error("[PRE→SESSION] error loading from repo:", err);
      return null;
    }
  }

  function buildSessionSnapshot(env) {
    env = env || {};
    const client =
      (env.client && env.client.id) ||
      env.client_id ||
      "ANON";

    const dxCode =
      env.dx_code ||
      env.dsm_code ||
      env.dsm_text ||
      "R69";

    const dxText =
      env.dx_text ||
      env.dsm_label ||
      "Unspecified condition";

    const tier =
      env.ctcTier ||
      env.plan_ctcTier ||
      "CTC-1";

    const track =
      env.plan_track ||
      env.route_track ||
      "General";

    // Seed arrays for TP autopop
    const goals = []
      .concat(env.plan_goals || [])
      .map(String)
      .map(s => s.trim())
      .filter(Boolean);

    const objectives = []
      .concat(env.plan_objectives || [])
      .map(String)
      .map(s => s.trim())
      .filter(Boolean);

    const interventions = []
      .concat(env.plan_interventions || [])
      .map(String)
      .map(s => s.trim())
      .filter(Boolean);

    const snapshot = {
      client_id: client,
      client: env.client || null,
      ctcTier: tier,
      plan_track: track,
      dx_code: dxCode,
      dx_text: dxText,
      dsm_code: dxCode,
      dsm_label: dxText,
      plan_goals: goals,
      plan_objectives: objectives,
      plan_interventions: interventions,
      // pass through any trigger bundle if present
      triggers: env.triggers || env.ctcTriggers || null,
      ts: new Date().toISOString(),
      source: "pre-assessment-ctc-intake"
    };

    log("[PRE→SESSION] built snapshot →", snapshot);
    return snapshot;
  }

  async function saveSessionSnapshot() {
    if (!window.Bridge || !Bridge.save) {
      log("[PRE→SESSION] Bridge.save not available, aborting snapshot");
      return;
    }

    const loaded = await loadFromRepo();
    if (!loaded || !loaded.env) {
      log("[PRE→SESSION] nothing loaded from repo, skipping save");
      return;
    }

    const snapshot = buildSessionSnapshot(loaded.env);
    const key = loaded.key || snapshot.client_id || "ANON";

    try {
      await Bridge.save(SESSION_NS, key, snapshot, TTL_MS);
      log(
        "[PRE→SESSION] saved snapshot to",
        SESSION_NS,
        "key =",
        key
      );
    } catch (err) {
      console.error("[PRE→SESSION] error saving snapshot:", err);
    }
  }

  async function init() {
    log("[PRE→SESSION] init");
    await saveSessionSnapshot();

    // If the intake broadcasts updates via Bridge / bus, we can listen later.
    // For now we do a single snapshot on load to keep it simple & safe.
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

