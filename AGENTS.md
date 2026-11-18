# tomzlab-web — Repository Instructions

Follow the current uichat-mira/.github/AGENTS.md and its routed policy.

## Product boundary

- Official production hostname: tomzlab.cn; noncommercial, individual site “党靖涛的记事本”. No business landing pages, paid offerings, account system or public API gateway.
- Pearl-white identity, reviewed real content only, accessible zh-CN navigation and responsive design. Do not fabricate posts or duplicate mother-site articles without explicit content ownership.
- Root entrypoint and existing stable HTML URLs remain handcrafted static pages. **Owner-approved Folio integration** is scoped initially to a self-contained /journal/ reading area, built from reviewed Git Markdown with published @uichat-mira/folio public APIs. This replaces the previous blanket “no framework/bundler” restriction **only** for that isolated consumer.
- No production Node service, database, new public endpoint or Folio internals fork. Keep existing root-level relative links Pages-safe; nested Folio links use the configured Vite base.
- Never publish filing ID documents, phone numbers, personal identity numbers or precise residential addresses. Publicly approved ICP/public-security website registration numbers are allowed in the legal footer.

## Engineering and release

- feat/* → dev → test → prod. main remains bootstrap.
- Locked Node 24/npm build plus python3 scripts/check_site.py and generated output checks are T2; Mira Gate must remain meaningful.
- Test preview is public GitHub Pages with all pages noindex and its real project base. Check browser and no-JS rendering (T4).
- Prod deployment is **not** a build from source on the server. Existing mira-cloud-infra allowlist must be changed to the exact, verified _site/ artifact before the Folio candidate can promote. This cross-repo gate is mandatory. Keep rollback and verify actual public HTTPS (T5).
- Existing site and its release pipeline stay untouched until the matching infra change is verified. Do not claim Folio is live from merely building or merging a PR.
