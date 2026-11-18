# 党靖涛的记事本 · tomzlab.cn

Noncommercial personal website. The existing home and indexes remain hand-built static HTML with the established pearl-white identity. **Folio 0.1.1** is installed as an independent, build-time consumer for a new local Markdown reading area at /journal/.

## Ownership

- Static entrypoint and existing SEO URLs: root HTML/CSS/JS.
- Reviewed domestic-first Markdown content: folio-site/content/.
- Folio runtime and static publishing: @uichat-mira/folio@0.1.1, only public entrypoints.
- Build output: _site/ (never commit or copy source/node_modules to production).

Existing links to tomz.io and mira.tomz.io remain links, not imported/duplicated content. The one local starter document is a factual site explanation derived from existing published site copy; it is not a fake blog post.

## Local verification

Use Node 24:

```sh
npm ci --no-audit --no-fund
npm run build
python3 scripts/check_site.py
python3 -m http.server -d _site 8000
```

Test / (legacy home), /notes.html, /journal/, and /journal/notes/this-site/. The Folio reading area uses Vite 7/React 19 but produces static documents; it needs no production Node process, API, or database.

For Pages preview, build with TOMZLAB_FOLIO_BASE=/tomzlab-web/journal/ and mark **all** HTML (including nested Folio pages) noindex. See docs/deployment.md.

## Promotion

feat/* → dev → test → prod. main is bootstrap only.

**Do not promote the Folio candidate to prod before adapting the independent mira-cloud-infra production release allowlist to package the verified _site/ output instead of raw source files.** Never run npm on the production host. Review target Caddy's directory-index and clean-route handling before promoting.

The footer must carry the verified ICP and public-security registrations. Use the real public-security badge from the approved filing portal when providing a logo asset; do not invent one.
