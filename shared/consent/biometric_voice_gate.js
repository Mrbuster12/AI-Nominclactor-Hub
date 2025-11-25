(function () {
  var GATE_VERSION = "voice-v1";
  var STORAGE_KEY = "vsc_voice_gate_" + GATE_VERSION;

  function nowISO() {
    return new Date().toISOString();
  }

  function getStored() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn("[VOICE-GATE] load error", e);
      return null;
    }
  }

  function setStored(payload) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("[VOICE-GATE] store error", e);
    }
  }

  function hasGrant() {
    var s = getStored();
    return !!(s && s.granted === true && s.version === GATE_VERSION);
  }

  function publish(topic, payload) {
    if (window.AI_BUS && typeof AI_BUS.publish === "function") {
      AI_BUS.publish(topic, { payload: payload });
    }
  }

  function stampGrant(ctx) {
    var stamp = {
      granted: true,
      version: GATE_VERSION,
      tsFirst: nowISO(),
      ctx: ctx || {}
    };
    setStored(stamp);

    // Bus events – specific + generic
    publish("voicegate:granted", stamp);
    publish("biometric:gate:granted", stamp);

    // Optional ledger hook (no UI)
    if (window.AIEngine && AIEngine.ConsentLedger && typeof AIEngine.ConsentLedger.append === "function") {
      try {
        AIEngine.ConsentLedger.append({
          phase: "voice-gate",
          version: GATE_VERSION,
          ts: stamp.tsFirst,
          ctx: stamp.ctx,
          outcome: "granted"
        });
      } catch (e) {
        console.warn("[VOICE-GATE] ledger append error", e);
      }
    }

    return stamp;
  }

  function buildOverlay() {
    var overlay = document.createElement("div");
    overlay.id = "vsc-voice-gate-overlay";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(15,23,42,0.95)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "99999";

    var box = document.createElement("div");
    box.style.background = "#020617";
    box.style.border = "1px solid #1f2937";
    box.style.borderRadius = "16px";
    box.style.padding = "24px";
    box.style.maxWidth = "520px";
    box.style.width = "100%";
    box.style.color = "#e5e7eb";
    box.style.fontFamily = "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif";

    box.innerHTML = [
      "<h2 style='margin:0 0 8px 0;font-size:20px;'>Secure Voice Consent</h2>",
      "<p style='margin:0 0 8px 0;font-size:14px;line-height:1.5;'>",
      "Before you can access any virtual clinician modules, we need to verify that you are a real human ",
      "and record your consent to AI-assisted, biometric-linked services.",
      "</p>",
      "<p style='margin:0 0 8px 0;font-size:13px;line-height:1.5;'>",
      "Step 1: Press <strong>Begin Voice Check</strong> and read the phrase out loud.",
      "<br>Step 2: Confirm the statement to continue.",
      "</p>",
      "<div id='vsc-voice-status' style='margin:8px 0 12px 0;font-size:13px;color:#9ca3af;'>",
      "Awaiting voice check…",
      "</div>",
      "<div style='display:flex;flex-direction:column;gap:8px;'>",
      "<button id='vsc-voice-begin'",
      " style='border:none;border-radius:999px;padding:8px 12px;background:#22c55e;color:#020617;font-weight:600;cursor:pointer;width:max-content;'>",
      "Begin Voice Check</button>",
      "<button id='vsc-voice-confirm'",
      " style='border:1px solid #4b5563;border-radius:999px;padding:8px 12px;background:#111827;color:#9ca3af;font-weight:500;cursor:not-allowed;width:max-content;'",
      " disabled>",
      "I confirm this is my secure session</button>",
      "</div>"
    ].join("");

    overlay.appendChild(box);
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    var statusEl = box.querySelector("#vsc-voice-status");
    var btnBegin = box.querySelector("#vsc-voice-begin");
    var btnConfirm = box.querySelector("#vsc-voice-confirm");

    function setStatus(msg) {
      if (statusEl) statusEl.textContent = msg;
    }

    // Stub: where real mic / recognition would go later
    btnBegin.addEventListener("click", function () {
      setStatus("Listening for your voice… (simulated stub)");
      btnBegin.disabled = true;
      btnBegin.style.cursor = "default";

      setTimeout(function () {
        setStatus("Voice sample received (simulated). You may now confirm this secure session.");
        btnConfirm.disabled = false;
        btnConfirm.style.cursor = "pointer";
        btnConfirm.style.color = "#e5e7eb";
      }, 1200);
    });

    btnConfirm.addEventListener("click", function () {
      if (btnConfirm.disabled) return;
      setStatus("Securing this session and unlocking modules…");
      var ctx = {
        path: location.pathname,
        userAgent: navigator.userAgent,
        ts: nowISO()
      };
      var stamp = stampGrant(ctx);

      setTimeout(function () {
        try {
          document.body.style.overflow = "";
          overlay.remove();
        } catch (e) {}
      }, 200);

      console.log("[VOICE-GATE] granted", stamp);
    });
  }

  function requireGate(context) {
    context = context || {};
    if (hasGrant()) {
      var existing = getStored();
      publish("voicegate:ready", existing);
      publish("biometric:gate:granted", existing);
      return;
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        buildOverlay();
      });
    } else {
      buildOverlay();
    }
  }

  if (!window.AIEngine) window.AIEngine = {};
  if (!AIEngine.VoiceGate) {
    AIEngine.VoiceGate = {
      require: requireGate,
      getState: getStored,
      version: GATE_VERSION
    };
  }

  console.log("[VOICE-GATE] biometric_voice_gate.js ready →", GATE_VERSION);
})();

