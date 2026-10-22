# tomzlab-web — Repository Instructions

Follow the current `uichat-mira/.github/AGENTS.md` and its routed policy; do not duplicate organization governance here.

## Product and code

- Site name: **党靖涛的记事本**, official production hostname `tomzlab.cn`.
- Noncommercial individual site for personal notes and public observations. No company/enterprise landing pages, paid offerings, public account system, or API gateway.
- Pearl-white, restrained design inspired by developer tools, with real content only; do not invent articles.
- Keep independent static HTML documents and native shared CSS. No framework, bundler, dependencies, backend, or database unless the owner specifically changes scope.
- Use semantic HTML, `zh-CN`, good focus states and responsive layout; keep all first-party references **relative** for GitHub Pages subpath compatibility.
- Never publish personal identification numbers, phone numbers, or precise addresses from ICP filing material.

## Engineering

- `feat/* → dev → test → prod`. Retained `main` is bootstrap, not production.
- CI: `python3 scripts/check_site.py` checks HTML, navigation and local links. `Mira Gate` must be meaningful.
- `test` may deploy a public noindex GitHub Pages preview **only after Pages is enabled in GitHub settings**. No custom-domain binding for preview.
- `prod` only may deploy the Alibaba Cloud production site, after actual ICP approval, explicit release decision, and validation against existing server configuration. There is no live deployment workflow until then.
- Static contracts cover T1/T2 as relevant; T3 backend integration does not apply. Preview browser verification is T4, production HTTP smoke is T5. Do not claim tests or deployment without evidence.
