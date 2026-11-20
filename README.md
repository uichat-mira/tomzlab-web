# 党靖涛的记事本 · tomzlab-web

Personal, noncommercial, multi-page static website for `tomzlab.cn`. Restrained pearl-white styling, independent HTML files, shared native CSS. Native HTML/CSS with small dependency-free browser subscriptions. No Folio, bundler, backend or database.

## Pages

- `index.html`: homepage
- `notes.html`: personal writing index; no fake articles
- `projects.html`: links to existing personal projects
- `about.html`: site description
- `404.html`: not-found page

## Local preview and validation

```sh
python3 -m http.server 8000
python3 scripts/check_site.py
```

## Promotion and deployment

Mira flow: `feat/* → dev → test → prod`. The retained `main` is only a bootstrap/default branch, not production.

- `test` triggers **GitHub Pages preview** via `.github/workflows/pages-preview.yml` at https://uichat-mira.github.io/tomzlab-web/ (once enabled). In repo Settings → Pages → Source select **GitHub Actions**; no custom domain. The preview is public but marked noindex.
- `prod` will be the only source for the future Alibaba Cloud / Caddy production site. **No production deployment until ICP approval and owner authorization.** No server secrets are needed for preview.
- CI exposes the `Mira Gate` static-contract check.

See `docs/deployment.md` for specific release gates. No personal identity numbers, phone numbers, or street address from filing paperwork belong here.


## PUB-03: direct publication consumption

The static pages consume Tomz.io directly through its published `/feeds.json`
discovery contract. `/notes.html` uses JSON Feed `_tomzio.kind=article`
and `section=blogs`; `/weekly.html` uses `kind=issue` and explicit
`issue.number`; the homepage bookshelf consumes `/books/catalog.json`
as a state snapshot. No path-based content classification, cloned full texts,
or Folio dependency. Mira engineering entries retain their own RSS publisher.

Browser updates are validated before painting, with a successful copy cached
for 15 minutes. Invalid responses or outages retain the last validated copy;
without that copy, dated static HTML content (or the bookshelf link) remains.
These pages do not offer push or background subscriptions.

Contract regression: `node --test tests/publication-contract.test.mjs`.
