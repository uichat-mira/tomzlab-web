# tomzlab-web — Repository Instructions

Follow current uichat-mira/.github/AGENTS.md and its routed policies.

- Individual noncommercial website "党靖涛的记事本"; official production hostname `tomzlab.cn`. Do not fabricate entries, expose filing PII, or duplicate mother-site text.
- Current owner-approved candidate: Folio controls root Header, Footer, Pearl theme, navigation, client router, and static site generation. Only home **content** is owned by consumer `SiteHome`; content copy lives in `site-content.ts`. Existing root HTML source is retired from this branch to avoid dual homepage truths.
- Preserve existing `notes.html`, `weekly.html`, `projects.html`, `about.html` and original cross-site feed behavior. All navigation to legacy HTML must be a real full-document load, not a Folio router 404. No production database/server needed.
- Folio dev candidate is not published to npm: use pinned dev SHA via temporary tarball for **test only**; do not call `npm ci` alone evidence of the new API. This Draft cannot promote before an audited Folio release and infra allowlist change.
- Branches `feat/* → dev → test → prod`; `main` bootstrap. Never assume CI equals actual T4/T5. New homepage cannot deploy through the old raw source-file release workflow.
