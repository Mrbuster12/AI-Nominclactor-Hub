(function () {
  // ------------------------
  // Helpers
  // ------------------------
  function $(selector) {
    return document.querySelector(selector);
  }

  function $all(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }

  function writeStatus(lines) {
    var pre = $("#status");
    if (!pre) return;

    if (!Array.isArray(lines)) {
      lines = [String(lines)];
    }

    pre.textContent = lines.join("\n");
  }

  // Small helper to append a short line without nuking the whole log
  function appendStatusLine(line) {
    var pre = $("#status");
    if (!pre) return;

    var existing = pre.textContent || "";
    if (existing.trim().length === 0) {
      pre.textContent = line;
      return;
    }
    pre.textContent = existing + "\n" + line;
  }

  // ------------------------
  // Internal hub health snapshot
  // ------------------------
  var hubState = {
    vscBridgePresent: false,
    vscBridgePublish: false,
    vscBridgeSubscribe: false,
    vnpAlgorithmsSeen: false,
    lastCareTier: null,
    lastTriggers: null,
    lastConsent: null,
    lastConsentStamped: null,
    lastAiReadyTs: null
  };

  // ------------------------
  // Self-check
  // ------------------------
  function runSelfCheck() {
    var lines = [];
    var now = new Date().toISOString();

    lines.push("AI Nominclactor — Self Check");
    lines.push("Timestamp: " + now);
    lines.push("Path: " + location.pathname);
    lines.push("");

    // VSCBridge snapshot
    var hasVSCBridge = typeof window.VSCBridge !== "undefined";
    var hasPublish =
      hasVSCBridge && typeof window.VSCBridge.publish === "function";
    var hasSubscribe =
      hasVSCBridge && typeof window.VSCBridge.subscribe === "function";

    hubState.vscBridgePresent = hasVSCBridge;
    hubState.vscBridgePublish = hasPublish;
    hubState.vscBridgeSubscribe = hasSubscribe;

    lines.push("VSCBridge present: " + hasVSCBridge);
    lines.push("VSCBridge.publish: " + hasPublish);
    lines.push("VSCBridge.subscribe: " + hasSubscribe);

    // VNP / algorithm snapshot (best-effort only)
    var vnpSeen = false;
    try {
      if (window.VNP_PHASE2 && Array.isArray(window.VNP_PHASE2.algorithms)) {
        vnpSeen = true;
        hubState.vnpAlgorithmsSeen = true;
        lines.push("");
        lines.push(
          "VNP_PHASE2 algorithms registered: " +
            window.VNP_PHASE2.algorithms.length
        );
      }
    } catch (e) {
      // best effort only
      lines.push("");
      lines.push("VNP_PHASE2 check error → " + e.message);
    }

    if (!vnpSeen) {
      lines.push("");
      lines.push("VNP_PHASE2 algorithms: not detected (or not exposed globally).");
    }

    // Consent snapshot if available
    if (window.AIEngine && AIEngine.Consent) {
      try {
        var consent = AIEngine.Consent.get && AIEngine.Consent.get();
        if (consent) {
          hubState.lastConsent = consent;

          lines.push("");
          lines.push("Consent engine: detected");
          lines.push("Consent.granted: " + !!consent.granted);
          lines.push("Consent.version: " + (consent.version || "n/a"));
          lines.push("Consent.title: " + (consent.title || "n/a"));
        } else {
          lines.push("");
          lines.push("Consent: no active consent object found.");
        }
      } catch (e2) {
        lines.push("");
        lines.push("Consent: error reading consent → " + e2.message);
      }
    } else {
      lines.push("");
      lines.push("Consent engine: not detected on this page.");
    }

    // Any CTC info captured from upstream events
    if (hubState.lastCareTier || hubState.lastTriggers) {
      lines.push("");
      lines.push("Last CTC snapshot (from ctc_update):");
      lines.push("  Care tier: " + (hubState.lastCareTier || "n/a"));
      if (hubState.lastTriggers) {
        try {
          lines.push("  Triggers: " + JSON.stringify(hubState.lastTriggers));
        } catch (_) {
          lines.push("  Triggers: [object]");
        }
      }
    }

    // Quick check that the module buttons exist
    var btns = $all(".actions .btn[data-target]");
    lines.push("");
    lines.push("Module buttons detected: " + btns.length);
    btns.forEach(function (btn, idx) {
      var target = btn.getAttribute("data-target") || "";
      lines.push("  [" + idx + "] → " + target);
    });

    writeStatus(lines.join("\n"));
  }

  // ------------------------
  // Navigation wiring
  // ------------------------
  function wireNavButtons() {
    var btns = $all(".actions .btn[data-target]");
    if (!btns.length) {
      return;
    }

    btns.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();

        var target = btn.getAttribute("data-target");
        if (!target) return;

        // Emit navigation event on AI bus if present
        if (window.VSCBridge && typeof window.VSCBridge.publish === "function") {
          try {
            window.VSCBridge.publish("hub:navigate", {
              source: "ai-nominclactor",
              target: target,
              ts: new Date().toISOString()
            });
          } catch (err) {
            // Fail silently – navigation should still occur
            console.warn("[AI-HUB] publish error:", err);
          }
        }

        // Hard navigation to the selected module
        window.location.href = target;
      });
    });
  }

  // ------------------------
  // AI bus / bridge wiring
  // ------------------------
  function wireBridgeEvents() {
    if (!window.VSCBridge) {
      console.warn("[AI-HUB] VSCBridge not present; hub will still function locally.");
      return;
    }

    // Basic hub init ping
    if (typeof VSCBridge.publish === "function") {
      try {
        VSCBridge.publish("hub:init", {
          source: "ai-nominclactor",
          path: location.pathname,
          ts: new Date().toISOString()
        });

        VSCBridge.publish("hub:ready", {
          source: "ai-nominclactor",
          modules: [
            "/pre-assessment-ctc-intake/",
            "/psychosocial/",
            "/treatment-plan/",
            "/releases-consents/"
          ],
          ts: new Date().toISOString()
        });

        console.log("[AI-HUB] hub:init + hub:ready published.");
      } catch (e) {
        console.warn("[AI-HUB] error publishing hub events:", e);
      }
    }

    // Listen for upstream events if subscribe exists
    if (typeof VSCBridge.subscribe === "function") {
      try {
        // CTC / care-tier updates
        VSCBridge.subscribe("ctc_update", function (payload) {
          try {
            hubState.lastCareTier = payload && payload.careTier;
            hubState.lastTriggers = payload && payload.triggers;
            appendStatusLine(
              "[AI-HUB] ctc_update → " +
                (hubState.lastCareTier || "unknown tier")
            );
          } catch (e) {
            console.warn("[AI-HUB] ctc_update handler error:", e);
          }
        });

        // Consent engine ready / stamped
        VSCBridge.subscribe("ai_engine_ready", function (payload) {
          try {
            hubState.lastAiReadyTs = new Date().toISOString();
            if (payload && payload.consent) {
              hubState.lastConsent = payload.consent;
            }
            if (payload && payload.stamped) {
              hubState.lastConsentStamped = payload.stamped;
            }
            appendStatusLine("[AI-HUB] ai_engine_ready event received.");
          } catch (e) {
            console.warn("[AI-HUB] ai_engine_ready handler error:", e);
          }
        });

        // Explicit consent stamp events
        VSCBridge.subscribe("consent:stamp", function (payload) {
          try {
            if (payload && payload.consent) {
              hubState.lastConsent = payload.consent;
            }
            if (payload && payload.stamp) {
              hubState.lastConsentStamped = payload.stamp;
            }
            appendStatusLine("[AI-HUB] consent:stamp recorded.");
          } catch (e) {
            console.warn("[AI-HUB] consent:stamp handler error:", e);
          }
        });

        // VNP phase notifications (optional)
        VSCBridge.subscribe("vnp:ready", function (payload) {
          try {
            hubState.vnpAlgorithmsSeen = true;
            appendStatusLine("[AI-HUB] vnp:ready received.");
          } catch (e) {
            console.warn("[AI-HUB] vnp:ready handler error:", e);
          }
        });

        console.log("[AI-HUB] VSCBridge.subscribe handlers wired.");
      } catch (e) {
        console.warn("[AI-HUB] error wiring VSCBridge subscriptions:", e);
      }
    } else {
      console.log(
        "[AI-HUB] VSCBridge.subscribe not available; running publish-only mode."
      );
    }
  }

  // ------------------------
  // Init
  // ------------------------
  function init() {
    // Wire self-check button
    var checkBtn = $("#check-ready");
    if (checkBtn) {
      checkBtn.addEventListener("click", function () {
        runSelfCheck();
      });
    }

    // Wire the module navigation buttons
    wireNavButtons();

    // Wire AI bus / events
    wireBridgeEvents();

    // Initial status line
    writeStatus(
      "AI Nominclactor hub ready.\n" +
        "Click 'Run Self-Check' for details.\n" +
        "Hub events are published to VSCBridge when available."
    );

    console.log("[AI-HUB] initialized.");
  }

  document.addEventListener("DOMContentLoaded", init);
})();

