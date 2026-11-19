# Folio consumer acceptance & publishing

## What this change owns

Folio dev `36547bd` provides the **real** Header, structured Footer, built-in Pearl and mobile interactions. The site supplies only `slots.home` / `headerBrand` and React text markup. Static `/` uses the same `SiteHome` component rendered under the actual public Folio Header and Footer, not a separately handwritten template. Core navigation and legal links live in `folio.config.ts`.

The current `prod` content at the time of design is the approved factual baseline. Legacy `notes.html`, `weekly.html`, `projects.html`, `about.html` and cross-site feed fallback remain unchanged. Existing page nav that points to legacy document routes is deliberately bridged to full-document navigation until those page bodies themselves are promoted into Folio.

## Verification

- T2: Node 24; checkout pinned Folio dev candidate + package build; site locked install and one nonpersistent tarball overlay; TS strict typecheck; production build; old route navigation checks; generated no-JS homepage and SEO checks.
- T4: desktop/mobile Chromium screenshot, mobile menu (real Folio), native theme toggle, legacy route hard navigation, no-JS home body and Footer, and article HTML.
- GitHub Pages test preview must set `TOMZLAB_SITE_BASE=/tomzlab-web/` and `TOMZLAB_PREVIEW=1`, plus mark legacy pages recursively noindex. It is **public**; do not place secrets. Direct /journal/ article links require site host to serve directory indexes.
- T5 on authorized release: host HTTPS, assets, root page, links, 404, one legacy page, /journal/ and article paths, ICP & police registration. Do not equate prod branch merge with deployment.

## Release blockers

**No production change is authorized by this Draft.** Before promotion: Folio dev API must ship in reviewed npm version (package-lock updated from 0.1.1); mira-cloud-infra fixed-allowlist workflow must deploy only validated `_site/` after pinned build; official police filing icon needs approved asset. Keep rollback and validate existing Caddy. Do not silently change DNS or other services.
