# Clinician Dropdown Completed — Rooted Build

- Site files at repository ROOT
- `netlify.toml` sets publish to "." for GitHub→Netlify deploys
- `_redirects` for SPA routing
- Legacy BOP button auto-removed; Clinician Tendencies overlay stays visible

## Deploy via Netlify (Git link)
1) Commit everything in this ZIP to the repo root.
2) In Netlify: New site from Git → select repo → (no build command) → (publish dir blank; Netlify reads netlify.toml).
3) Deploy.