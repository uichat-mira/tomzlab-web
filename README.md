# 党靖涛的记事本 · tomzlab.cn

个人非经营性网站。首页以 Folio dev candidate 作为原生站点外壳：Folio Header、Footer、移动菜单、主题、React Router 和 Pearl 主题均归 Folio；只有首页主体由消费站拥有。旧链接和内容均来自 **tomzlab-web/prod**，未复制母站全文。

## Single ownership

- `folio-site/src/SiteHome.tsx`：唯一首页 React 组件；`site-content.ts`：唯一首页文本；`src/static-home.tsx` 使用同一组件与公开 Folio Header/Footer 生成静态 HTML。
- `folio-site/folio.config.ts`：唯一导航、Pearl、Footer 与备案配置；React 与静态构建共用。
- `notes.html`、`weekly.html`、`projects.html`、`about.html`：原有稳定文档、真实 feed 逻辑，保持原路径与内容。
- `folio-site/content/`：本站独立的 Git Markdown；Folio 负责 `/journal/` 与静态内容输出。
- `_site/`：唯一构建输出；不提交 node_modules，生产主机不执行 npm。

## Candidate setup

Folio 目前在 dev 存在尚未发布到 npm 0.1.1 的 Header/Footer/Slots API。**此分支只是可审阅候选，不可直接晋级 prod**。CI 精确拉取 dev commit `36547bd4818d63268ae5e9d88f79e34861642e87`、打包后覆盖安装在 npm 0.1.1 上，直到 Folio 新版经过独立发布验证。

局部运行：Node 24，`npm ci`，在 Folio dev worktree 中 `npm ci && npm pack --workspace @uichat-mira/folio`，然后本站 `npm install --no-save --package-lock=false /path/to/folio-dev.tgz`、`npm run typecheck && npm run build`；`python3 -m http.server --directory _site 8768`。

## Release block

当前 mira-cloud-infra 的生产发布脚本仍只打包旧的静态根文件清单；它不会发布 Folio Vite build。因此在修改并独立验证它对 `_site/` 的 allowlist/固定 SHA/原子回滚之前 **不得晋级 test → prod**。本站历史旧根 HTML 已从新构建源中移除；开发者不得把旧 `index.html` 当 Folio 官网真相。
