(function () {
  const CONSENT_NS = "vsc:preassessment:consent-executions";
  const SEED_NS    = "vsc:preassessment:seed";
  const AI_RES_NS  = "vsc:ai:results:repo";
  const VOUCHER_NS = "vsc:ai:vouchers";

  function safeGetArray(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn("[repo] parse error for", key, e);
      return [];
    }
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("[repo] write error for", key, e);
    }
  }

  function storeConsentExecution(payload) {
    const record = {
      executionId: payload.executionId || crypto.randomUUID(),
      documentId: payload.documentId || null,
      documentVersion: payload.documentVersion || null,
      clientId: payload.clientId || null,
      signedAt: payload.signedAt || new Date().toISOString(),
      channel: payload.channel || "unknown",
      data: payload
    };

    const all = safeGetArray(CONSENT_NS);
    all.push(record);
    safeSet(CONSENT_NS, all);

    console.log("[repo] consent execution stored →", record.executionId);
    return record;
  }

  function storeSeed(payload) {
    safeSet(SEED_NS, payload);
  }

  function storeAiResults(payload) {
    safeSet(AI_RES_NS, payload);
  }

  function storeVouchers(payload) {
    safeSet(VOUCHER_NS, payload);
  }

  try {
    const ch = new BroadcastChannel("preassessment-repo");

    ch.onmessage = (ev) => {
      const { type, payload } = ev.data || {};
      if (!type) return;

      if (type === "assessment.seed") {
        storeSeed(payload);
      } else if (type === "consent.signed") {
        storeConsentExecution(payload);
      } else if (type === "ai.results") {
        storeAiResults(payload);
      } else if (type === "ai.voucher.ready") {
        storeVouchers(payload);
      }

      console.log("[repo] ←", type, payload);

      if (typeof updateHUD === "function") {
        updateHUD();
      }
    };

    console.log("[repo] BC listening (preassessment-repo)");
  } catch (e) {
    console.warn("[repo] BC unavailable", e);
  }
})();

