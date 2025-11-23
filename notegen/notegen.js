// notegen/notegen.js
// Simple TP note generator hooked from Pre-Assessment / TP UI

(function () {
  function buildHeader(label) {
    return `# ${label.toUpperCase()}\n`;
  }

  function scrapeSection(id, label) {
    const el = document.getElementById(id);
    if (!el) return "";
    const txt = (el.innerText || "").trim();
    if (!txt) return "";
    return buildHeader(label) + txt + "\n\n";
  }

  function scrapePlanBlocks() {
    const parts = [];
    parts.push(scrapeSection("tp-problems", "problems"));
    parts.push(scrapeSection("tp-goals", "goals"));
    parts.push(scrapeSection("tp-objectives", "objectives"));
    parts.push(scrapeSection("tp-interventions", "interventions"));
    return parts.filter(Boolean).join("");
  }

  function scrapeFallback() {
    const txt = (document.body.innerText || "").trim();
    if (!txt) return "";
    // Just grab a chunk so the file doesn’t explode
    return txt.slice(0, 4000);
  }

  function appendEnvelopeInfo(baseText) {
    if (!window.VSCBridge || typeof VSCBridge.latestEnvelope !== "function") {
      return baseText;
    }
    try {
      const env = VSCBridge.latestEnvelope() || {};
      const triggers = (env.triggers || {});
      const tier = env.careTier || env.ctcTier || "CTC-1";

      const lines = [];
      lines.push("");
      lines.push("----");
      lines.push("VSC SNAPSHOT");
      lines.push(`CTC Tier: ${tier}`);
      lines.push(`SI: ${!!triggers.SI}`);
      lines.push(`HI: ${!!triggers.HI}`);
      lines.push(`Psychosis: ${!!triggers.Psychosis}`);
      lines.push("");

      return baseText + "\n" + lines.join("\n");
    } catch (e) {
      console.warn("[NOTEGEN] envelope append failed", e);
      return baseText;
    }
  }

  function buildNoteText() {
    let core = scrapePlanBlocks();
    if (!core) {
      core = scrapeFallback();
    }
    return appendEnvelopeInfo(core || "");
  }

  // Public hook for pages: attachNoteGenerator('#someButton')
  function attachNoteGenerator(selector) {
    const btn =
      typeof selector === "string"
        ? document.querySelector(selector)
        : selector;

    if (!btn) {
      console.warn("[NOTEGEN] attachNoteGenerator – button not found", selector);
      return;
    }

    btn.addEventListener("click", () => {
      try {
        const text = buildNoteText();
        if (!text) {
          alert("No plan content available to export yet.");
          return;
        }

        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const stamp = new Date().toISOString().replace(/[:.]/g, "-");

        a.href = url;
        a.download = `vsc-treatment-plan-note-${stamp}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log("[NOTEGEN] note file generated");
      } catch (e) {
        console.error("[NOTEGEN] failed to generate note", e);
        alert("Unable to generate note from the current plan.");
      }
    });

    console.log("[NOTEGEN] attached to", selector);
  }

  // Expose globally the same way the original build did
  window.attachNoteGenerator = attachNoteGenerator;
})();

