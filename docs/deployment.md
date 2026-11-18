# Domestic site deployment and acceptance

## Current reality

tomzlab.cn has ICP approval, and the owner's public-security registration is 粤公网安备44020302000372号. The existing Alibaba Cloud Caddy site serves the static homepage and indexes; the independent production workflow in uichat-mira/mira-cloud-infra pins a tomzlab-web prod SHA, packages a hardcoded list of raw source files, and atomically swaps /srv/www/tomzlab.cn/current with rollback. **That workflow does not yet support Folio build output.**

## Folio candidate (not yet deployed)

The first Folio consumer is intentionally isolated under /journal/. Root /, /notes.html, /weekly.html, /projects.html and /about.html remain stable. We use Folio's published 0.1.1 public API only; do not fork its CSS, runtime or Vite adapter. Real authored content must be reviewed before merging. External mother-site articles remain external links; do not silently duplicate them.

Build with Node 24 and `npm ci && npm run build`; output is `_site/`, with nested /journal/index.html, article/index.html and Folio's static SEO metadata. Only this generated public directory may become a release artifact. Nothing in node_modules, folio-site source, workflows or private project paths belongs in the origin webroot.

## Gates

1. feat/* PR → dev: CI builds and checks both stable legacy entrypoints and Folio's server-visible static content, route, canonical and assets.
2. dev → test: GitHub Pages preview at https://uichat-mira.github.io/tomzlab-web/. Use the project-base build for /journal and recursively add noindex/nofollow to every HTML page. Verify real desktop/mobile navigation and JS-disabled article reading (T4); this is public preview, not private storage.
3. Before test → prod: update mira-cloud-infra deploy workflow to fetch the exact approved site prod commit, install locked npm dependencies on CI, build for /journal/, validate the generated artifact and package only `_site/`. Extend the site origin T5 to /journal/, a nested article, bundled assets, existing weekly page and both filings. Retain atomic rollback and site-scoped Caddy configuration.
4. Do not interpret a CI-green PR, a prod branch merge, or a new Pages preview as a successful domestic deployment. Confirm the actual live hostname over HTTPS (T5) after authorized publishing.

Do not alter DNS, reverse proxy, certificate handling or other services as a side-effect of the application migration.
