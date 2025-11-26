(function () {
  var LEDGER_KEY = "vsc_cbl_ledger_v1";
  var LEDGER_VERSION = "cbl-v1";

  function nowISO() {
    return new Date().toISOString();
  }

  function safeParse(raw) {
    if (!raw) return [];
    try {
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn("[CBL] parse error", e);
      return [];
    }
  }

  function loadLedger() {
    try {
      return safeParse(localStorage.getItem(LEDGER_KEY));
    } catch (e) {
      console.warn("[CBL] load error", e);
      return [];
    }
  }

  function saveLedger(list) {
    try {
      localStorage.setItem(LEDGER_KEY, JSON.stringify(list || []));
    } catch (e) {
      console.warn("[CBL] save error", e);
    }
  }

  // ultra-simple hash just to make tampering obvious; not cryptographic
  function simpleHash(str) {
    var hash = 0, i, chr;
    if (!str || !str.length) return "0";
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return String(hash);
  }

  function append(entry) {
    var ledger = loadLedger();
    var prev = ledger.length ? ledger[ledger.length - 1] : null;
    var prevHash = prev && prev.hash ? prev.hash : null;

    var base = {
      id: "cbl-" + Date.now(),
      version: LEDGER_VERSION,
      ts: nowISO(),
      prevHash: prevHash
    };

    var full = Object.assign({}, base, entry || {});
    // compute hash over a subset for integrity
    var material = JSON.stringify({
      id: full.id,
      ts: full.ts,
      version: full.version,
      prevHash: full.prevHash || null,
      phase: full.phase || null,
      outcome: full.outcome || null,
      userKey: full.userKey || null
    });
    full.hash = simpleHash(material);

    ledger.push(full);
    saveLedger(ledger);

    if (window.AI_BUS && typeof AI_BUS.publish === "function") {
      try {
        AI_BUS.publish("cbl:append", { payload: full });
      } catch (e) {
        console.warn("[CBL] bus publish error", e);
      }
    }

    return full;
  }

  function clear() {
    saveLedger([]);
  }

  function findByUserKey(userKey) {
    if (!userKey) return [];
    return loadLedger().filter(function (row) {
      return row.userKey === userKey;
    });
  }

  // expose on AIEngine
  if (!window.AIEngine) window.AIEngine = {};
  if (!AIEngine.ConsentLedger) {
    AIEngine.ConsentLedger = {
      append: append,
      load: loadLedger,
      clear: clear,
      findByUserKey: findByUserKey,
      version: LEDGER_VERSION
    };
  }

  console.log("[CBL] consent_biometric_ledger.js ready →", LEDGER_VERSION);
})();

