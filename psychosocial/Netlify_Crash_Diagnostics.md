# Netlify Crash Diagnostics — VSC Merged Build
Generated: 2025-08-09T13:24:09

## What I inspected
- **index.html** (inline script, fetches `vsc_scenarios.json` and `vsc_dialogue.json`)
- **vsc_scenarios.json** and **vsc_dialogue.json** (valid JSON, 3 scenarios each)
- **/homework/** PDFs (present; links in `index.html` use `target="_blank"`)

## Likely Crash / Blank-Select Causes on Netlify
1) **Relative fetch path resolution**: `fetch('vsc_scenarios.json')` and `fetch('vsc_dialogue.json')` depend on how Netlify serves the page path.
   - If `index.html` is accessed as `/some/subpath/`, a redirect or path change could cause fetch to look in the wrong directory.
2) **Race on re-entry from PDFs**: On browser "Back", the DOM may restore before the JSON fetch resolves; `loadScenarioDetails()` can run with no `select.value`, leaving UI blank.
3) **Silent fetch/JSON failures**: If a content-type or caching quirk causes fetch to fail, there is no error handler—resulting in a silent no-op and empty UI.
4) **Case/path differences across builds**: The `Enhanced_VSC_Build_7_18_25.zip` includes multiple sub-`index.html` files (`/homework/index.html`, `/vsm/index.html`). If the Netlify publish folder is mis-set, assets resolve relative to a different root and 404.

## Proof checks done here
- JSON parses locally without error.
- All linked homework PDFs exist in `/homework` and match case exactly.
- The main `index.html` has proper IDs for script queries (e.g., `scenarioSelect`, `dialogueList`).

## Fixes packaged in the patch
- **Robust base-URL resolution** for fetch:
  ```js
  const BASE = new URL('.', window.location.href);
  fetch(new URL('vsc_scenarios.json', BASE))
  ```
- **Error handling & UI fallback**:
  - `window.addEventListener('error')` and `unhandledrejection` to capture stack traces.
  - Try/catch around fetch + JSON parsing with inline status output.
- **Deterministic selection after load**:
  - If no saved selection, auto-select the first scenario once data is loaded.
  - Guard `loadScenarioDetails()` against missing data.
- **SPAs & routes**: Added a `_redirects` file to route all paths to `/index.html` (harmless for this static app; prevents 404s if subpaths occur).
- **`netlify.toml`** with sensible headers for JSON/PDF and short cache to avoid stale loads during testing.

## Deploy notes
- Netlify **Publish directory** must be the folder that contains `index.html`, `vsc_*.json`, and `/homework` directly (no extra nesting).
- If you deploy via drag-and-drop, upload the **patched zip** here.

