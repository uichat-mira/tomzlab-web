# 党靖涛的记事本 · tomzlab-web

Personal, noncommercial, multi-page static website for `tomzlab.cn`. Restrained pearl-white styling, independent HTML files, shared native CSS. No JavaScript, bundler, backend or database.

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
