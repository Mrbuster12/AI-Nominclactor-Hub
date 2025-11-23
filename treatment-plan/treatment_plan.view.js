(function () {
  // Namespaces for bridge payloads
  const DRAWER_NS = "tp_drawers";
  const SESSION_NS = "session_bridge";
  const PSYCH_NS = "bps_bridge";
  const MSE_NS = "mse_bridge";
  const DAP_NS = "dap_bridge";

  // TTL for session bridge (fallback 2h)
  const TTL = parseInt(
    localStorage.getItem("session_bridge:ttl") || String(2 * 60 * 60 * 1000),
    10
  );

  let currentClientId = null;
  let currentPlan = null;
  let planVersion = 1;

  function $(id) {
    return document.getElementById(id);
  }

  function arr(x) {
    return Array.isArray(x) ? x : x ? [x] : [];
  }

  function nonEmpty(v) {
    return v && String(v).trim().length > 0;
  }

  async function loadBridge(ns) {
    try {
      const frag = new URLSearchParams(location.hash.slice(1));
      const k =
        frag.get("k") ||
        sessionStorage.getItem("session_bridge_key") ||
        localStorage.getItem("session_bridge:last_k");
      if (!window.Bridge || typeof window.Bridge.load !== "function") {
        console.warn("[TP] Bridge.load not available for ns:", ns);
        return null;
      }
      return await window.Bridge.load(ns, k, TTL);
    } catch (e) {
      console.warn("[TP] loadBridge error for ns:", ns, e);
      return null;
    }
  }

  async function gather() {
    const env = (await loadBridge(SESSION_NS)) || {};
    const bps = (await loadBridge(PSYCH_NS)) || {};
    const mse = (await loadBridge(MSE_NS)) || {};
    const dap = (await loadBridge(DAP_NS)) || {};

    const client =
      (env.client && env.client.id) ||
      (bps.client && bps.client.id) ||
      env.client_id ||
      bps.client_id ||
      "ANON";

    currentClientId = client;

    const dx = {
      code:
        bps.dx_code ||
        env.dx_code ||
        env.dsm_code ||
        env.dsm_text ||
        "R69",
      text:
        bps.dx_text ||
        env.dx_text ||
        env.dsm_label ||
        "Unspecified condition",
      tier: env.ctcTier || bps.ctcTier || "CTC-1",
    };

    const seed = {
      goals: arr(env.plan_goals).concat(arr(bps.plan_goals)),
      objectives: arr(env.plan_objectives).concat(arr(bps.plan_objectives)),
      interventions: arr(env.plan_interventions).concat(
        arr(bps.plan_interventions)
      ),
    };

    const mseFlags = mse.flags || {};
    const dapLast =
      (dap.sessions && dap.sessions[dap.sessions.length - 1]) || dap.last || null;

    return { dx, seed, mseFlags, dapLast, env };
  }

  function fillList(id, items) {
    const ul = $(id);
    if (!ul) return;
    ul.innerHTML = "";
    (items || []).forEach((t) => {
      if (!nonEmpty(t)) return;
      const li = document.createElement("li");
      li.textContent = t;
      ul.appendChild(li);
    });
  }

  function render(plan, meta) {
    if (!plan || !meta) return;
    if ($("planClient")) {
      $("planClient").textContent = "Client: " + (currentClientId || "ANON");
    }
    if ($("planTrack")) {
      $("planTrack").textContent = "Track: " + (meta.track || "—");
    }
    if ($("planTier")) {
      $("planTier").textContent = meta.tier || "CTC-1";
    }
    if ($("planVersion")) {
      $("planVersion").textContent = "v" + planVersion;
    }

    if ($("tpDx")) {
      $("tpDx").textContent =
        (meta.dx_code ? meta.dx_code + " — " : "") +
        (meta.dx_text || "Unspecified condition");
    }

    fillList("tpGoals", plan.goals);
    fillList("tpObjectives", plan.objectives);
    fillList("tpInterventions", plan.interventions);
  }

  function loadDrawers() {
    try {
      return JSON.parse(localStorage.getItem(DRAWER_NS) || "{}");
    } catch (e) {
      console.warn("[TP] loadDrawers error", e);
      return {};
    }
  }

  function saveDrawers(store) {
    try {
      localStorage.setItem(DRAWER_NS, JSON.stringify(store));
    } catch (e) {
      console.warn("[TP] saveDrawers error", e);
    }
  }

  function paintDrawer(arrList) {
    const list = $("drawerList");
    if (!list) return;
    list.innerHTML = "";
    (arrList || []).forEach((e, idx) => {
      const li = document.createElement("li");
      li.innerHTML =
        '<div class="meta">v' +
        e.v +
        " · " +
        new Date(e.at).toLocaleString() +
        " · " +
        (e.meta.tier || "CTC-1") +
        " · " +
        (e.meta.dx_code || "") +
        '</div><div><button data-idx="' +
        idx +
        '" class="btnLoad">Load</button> <button data-idx="' +
        idx +
        '" class="btnDel">Delete</button></div>';
      list.appendChild(li);
    });

    list.querySelectorAll(".btnLoad").forEach((b) => {
      b.onclick = () => {
        const store = loadDrawers();
        const arr = store[currentClientId] || [];
        const e = arr[parseInt(b.dataset.idx, 10)];
        if (!e) return;
        planVersion = e.v;
        currentPlan = e.plan;
        if ($("tpNotes")) $("tpNotes").value = e.notes || "";
        render(currentPlan, e.meta);
      };
    });

    list.querySelectorAll(".btnDel").forEach((b) => {
      b.onclick = () => {
        const store = loadDrawers();
        const arr = store[currentClientId] || [];
        arr.splice(parseInt(b.dataset.idx, 10), 1);
        store[currentClientId] = arr;
        saveDrawers(store);
        paintDrawer(arr);
      };
    });
  }

  function dedup(a) {
    return Array.from(
      new Set(
        (a || [])
          .map((x) => String(x).trim())
          .filter(Boolean)
      )
    );
  }

  // Hybrid merge: seeds from bridges + safety logic + relapse + overdose hooks
  function merge(seed, mseFlags, dapLast, env) {
    const plan = {
      goals: dedup(seed.goals),
      objectives: dedup(seed.objectives),
      interventions: dedup(seed.interventions),
    };

    // MSE: psychosis flag → add stabilization goal/intervention
    if (mseFlags && mseFlags.psychosis) {
      plan.goals.unshift("Stabilize thought content and reduce psychotic symptoms");
      plan.interventions.unshift(
        "Coordinate with psychiatric services for antipsychotic medication management and ongoing monitoring"
      );
    }

    // MSE: suicidal / self-harm signals
    if (mseFlags && (mseFlags.suicidal || mseFlags.selfHarm)) {
      plan.goals.unshift("Maintain safety and reduce risk of self-harm");
      plan.objectives.unshift(
        "Develop and review a written safety plan including at least 3 coping strategies and 3 emergency contacts"
      );
      plan.interventions.unshift(
        "Complete safety planning intervention and schedule increased clinical check-ins until risk decreases"
      );
    }

    // DAP: relapse / use risk from last session
    if (dapLast && dapLast.risk && /relapse|use|overdose/i.test(dapLast.risk)) {
      plan.objectives.unshift(
        "Identify at least 3 personal relapse triggers and 3 coping responses"
      );
      plan.interventions.unshift(
        "Provide relapse prevention skills session and assign recovery-focused homework between visits"
      );
    }

    // ENV / DSMCTC: overdose / OD_HISTORY / similar flags from triggers
    const triggers = (env && env.triggers) || {};
    const triggerFlags = [];
    Object.keys(triggers || {}).forEach((k) => {
      if (triggers[k]) triggerFlags.push(k);
    });

    const hasOD =
      triggers.overdose ||
      triggers.odHistory ||
      triggers.OD_HISTORY ||
      triggers.overdoseRisk ||
      (dapLast && dapLast.risk && /overdose/i.test(dapLast.risk));

    if (hasOD) {
      plan.goals.unshift(
        "Reduce risk of overdose and increase engagement in medically supervised care"
      );
      plan.objectives.unshift(
        "Engage in medication-assisted treatment or detox level of care as recommended and attend all scheduled appointments for at least 30 days"
      );
      plan.interventions.unshift(
        "Initiate overdose risk management protocol, including linkage to detox or residential level of care when available"
      );
    }

    // Future retina/voucher hook — non-breaking placeholder
    const rvaas = env && env.retinaVoucher;
    if (rvaas && rvaas.active && !plan.goals.some((g) => /voucher/i.test(g))) {
      plan.goals.unshift(
        "Leverage biometric-verified access to care to stabilize acute symptoms"
      );
      plan.interventions.unshift(
        "Activate voucher-based admission pathway when biometric flags are present and criteria are met"
      );
    }

    return plan;
  }

  async function refresh() {
    const { dx, seed, mseFlags, dapLast, env } = await gather();
    const track = env.plan_track || env.route_track || "General";
    const tier = dx.tier || "CTC-1";

    const plan = merge(seed, mseFlags, dapLast, env);
    const meta = {
      dx_code: dx.code,
      dx_text: dx.text,
      track,
      tier,
    };

    currentPlan = plan;
    render(plan, meta);

    const store = loadDrawers();
    paintDrawer(store[currentClientId] || []);
  }

  function saveVersion() {
    if (!currentPlan) return;
    planVersion += 1;

    const dxText = ($("tpDx") && $("tpDx").textContent) || "";
    const parts = dxText.split("—");
    const meta = {
      dx_code: (parts[0] || "").trim(),
      dx_text: (parts.slice(1).join("—") || "").trim(),
      track:
        (($("planTrack") && $("planTrack").textContent) || "")
          .replace(/^Track:\s*/, "")
          .trim() || "General",
      tier: ($("planTier") && $("planTier").textContent) || "CTC-1",
    };

    const store = loadDrawers();
    const key = currentClientId || "ANON";
    store[key] = store[key] || [];

    store[key].unshift({
      at: new Date().toISOString(),
      v: planVersion,
      meta,
      plan: currentPlan,
      notes: ($("tpNotes") && $("tpNotes").value) || "",
    });

    saveDrawers(store);
    paintDrawer(store[key]);
  }

  async function init() {
    if ($("btnRefreshFromBridges")) {
      $("btnRefreshFromBridges").addEventListener("click", refresh);
    }
    if ($("btnNewVersion")) {
      $("btnNewVersion").addEventListener("click", saveVersion);
    }

    // React to bridge updates (session / BPS / MSE / DAP)
    window.addEventListener("vsc:bridge:update", (e) => {
      const ns = (e.detail && e.detail.ns) || "";
      if ([SESSION_NS, PSYCH_NS, MSE_NS, DAP_NS].includes(ns)) {
        refresh();
      }
    });

    // First paint from current bridges
    await refresh();
  }

  document.addEventListener("DOMContentLoaded", init);
})();

