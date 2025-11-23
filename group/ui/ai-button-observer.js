// group/ui/ai-button-observer.js
// Lightweight observer to mark AI-related buttons for the hologram / badge layer.

(function () {
  const ATTR = "data-ai-button";

  function mark(el) {
    if (!el) return;
    if (el.hasAttribute(ATTR)) return;
    el.setAttribute(ATTR, "1");
  }

  function scanRoot(root) {
    const buttons = root.querySelectorAll("button, [role='button']");
    buttons.forEach(btn => {
      const txt = (btn.innerText || btn.textContent || "").toLowerCase();
      if (!txt) return;
      if (
        txt.includes("ai") ||
        txt.includes("virtual clinician") ||
        txt.includes("simulated clinician")
      ) {
        mark(btn);
      }
    });
  }

  function bootstrap() {
    const root = document.body || document.documentElement;
    if (!root) return;

    // Initial pass
    scanRoot(root);

    // Observe future DOM changes
    const obs = new MutationObserver(muts => {
      muts.forEach(m => {
        if (m.addedNodes && m.addedNodes.length) {
          m.addedNodes.forEach(node => {
            if (!(node instanceof Element)) return;
            scanRoot(node);
          });
        }
      });
    });

    obs.observe(root, { childList: true, subtree: true });
    console.log("[AI-BUTTON-OBSERVER] active");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})();

