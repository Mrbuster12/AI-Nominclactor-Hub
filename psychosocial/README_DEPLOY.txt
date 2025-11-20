VSC DRAG-AND-DROP DEPLOY (Netlify)

WHAT THIS IS
- A flat bundle with index.html at the root, JSON at the root, and /homework/ subfolder.
- Includes _redirects, netlify.toml, 200.html fallback, and a health.json endpoint.

HOW TO DEPLOY
1) On Netlify -> Deploys -> 'Upload a site', drag this ZIP.
2) Netlify will serve from the ZIP root automatically.
3) After publish, open:
   - /vsc_scenarios.json  -> should be HTTP 200
   - /vsc_dialogue.json   -> should be HTTP 200
   - /health.json         -> should be HTTP 200
4) Refresh a subpath -> app should still render due to _redirects.
