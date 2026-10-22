# Deployment and acceptance contract

## Current boundary

`tomzlab.cn` is pending ICP review. No action in this repository deploys to or alters the existing Alibaba Cloud VPS, DNS, or Caddy configuration. The first production release requires confirmed ICP approval and explicit authorization.

## Environment model

- `feat/*`: isolated source changes; PR checks, no deployment.
- `dev`: integration and checks.
- `test`: checked candidate plus **GitHub Pages preview**, no separate paid server.
- `prod`: production source branch; not a deployment itself until a deployment mechanism is authorized.
- `main`: bootstrap only; does not trigger deployment.

## Test preview

1. Repository **Settings → Pages → Build and deployment → Source → GitHub Actions**. This is a one-time prerequisite and may require an owner/admin. Do not attach `tomzlab.cn` as a Pages custom domain.
2. Merge/promote the candidate to `test`; `.github/workflows/pages-preview.yml` deploys the allowlisted static HTML, CSS and favicon. Preview address: https://uichat-mira.github.io/tomzlab-web/.
3. Preview builds add `noindex, nofollow`, disallow crawling in `robots.txt`, and omit production sitemap. All links are relative for the Pages project subpath.
4. Verify desktop/mobile layouts, local navigation and actual Pages URL (T4). Pages is public; do not store private content.
5. For arbitrary deeply nested invalid URLs, relative assets/404 navigation may differ. This first version supports only root-level HTML pages and flat missing-page URLs.

## Production prerequisites

1. Confirm the filing approval and actual ICP number. Replace the provisional footer text with the issued number linked to https://beian.miit.gov.cn/.
2. Review existing live Caddy configuration before extending it. Use a dedicated web root and never overwrite the other sites.
3. Promote the reviewed exact candidate `dev → test → prod`. Release only the web asset allowlist, not repo internal files.
4. Verify HTTPS, pages, 404, links, viewport behavior, official footer and redirects; run deployed production smoke (T5). Keep a rollback anchor.
5. Handle any applicable public-security filing/display after release within the statutory timeframe.

`ops/Caddyfile.example` is **reference only**, not activated automatically.
