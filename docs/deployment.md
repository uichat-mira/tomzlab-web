# Folio dev 消费者验收与发布边界

## 目标及路线

当前候选直接消费 `uichat-mira/folio/dev@36547bd` 的公开 API。首页是唯一 `slots.home` 自定义正文；`/notes/`、`/weekly/`、`/projects/`、`/about/` 使用 Folio 统一解析的 `type: page`，`/journal/` 使用 Folio `collection` 和 `doc`。

站点采用 Folio 原生 Header、Footer、搜索、Pearl、React Router、Markdown、SEO、404 和构建输出。**不要恢复原有四个 HTML 页面**，唯一允许的旧 URL 实体是 build 生成的 noindex redirect stub。

项目与关于文案取自正式站 `prod@6a34c9fc`，不虚构新的项目或个人介绍。记录/见π周刊索引不搬运正文：`scripts/sync-source-index.py` 在构建期从两个可信 RSS 读取标题、摘要、日期和原站 URL，生成 `folio-site/content/notes/index.md` 与 `weekly/index.md`，再由 Folio 自动解析、渲染、生成静态 HTML。两文件被 gitignore 忽略，不应手工编辑。

外部 RSS 的 fallback 是 `folio-site/snapshots/feed-fallback.json`，只在拉取失败时使用，且页面**必须清晰说明离线和快照日期**。不要把旧版 007 当成实时最新。确认页面真实包含母站 URL、构建版本和发行状态。

## 实际验证

本地：
```sh
npm run typecheck
npm run build
python3 scripts/check_site.py
# test offline fallback:
TOMZLAB_FEED_MODE=offline npm run build
python3 scripts/check_site.py
```

GitHub Pages 子路径：
```sh
TOMZLAB_SITE_BASE=/tomzlab-web/ TOMZLAB_PREVIEW=1 npm run build
python3 scripts/check_site.py
```

每个构建均检查 `_site/notes/index.html`、`weekly`、`projects`、`about`、`journal` 与根页、Page SEO、sitemap、noindex 的旧 URL redirect、资源路径、双备案。用真实 Chrome 检查桌面和 390px：Header/Footer 各一份、搜索、菜单、主题、首页到记录的 SPA 跳转及旧 `notes.html` 进入新 Folio 内容的路径。

## 观察到的 Folio dev 真实边界

Folio 原生 React runtime 在所有页面都能呈现 Header/Footer；但是其**默认静态写出**在非首页路由只含内容正文和 SEO，并不 SSR 完整 Header/Footer。首页使用公开的 `staticRoutes.home` + 同一 `SiteHome` + Folio 原生 Header/Footer SSR 做到无 JS 全壳；默认文档页尚未做到。这个缺口应该在 Folio 本体修正，不能为了展示消费成功，给本站添加四套单独 HTML 模板。

Folio 对外站 RSS 没有导入插件，`FolioEntryList` 默认内链；在**不重复全文**的产品约束下使用构建期数据适配 + Folio 原生 `page` 是现有公开 API 的正确边界，不能宣称它是 Folio 原生 RSS 导入器。

## 生产发布阻塞

目前 `mira-cloud-infra` 的 `tomzlab-release.yml` 仍只从 site `prod` 拷贝老的静态文件 allowlist，无法部署 `_site/`。必须先审查、实施、验证新的 pinned site SHA 构建发布程序，保持现有 Caddy 行为与原子回滚，再允许环境晋级。

Folio 开发版需要由其仓库正常走 `feat → dev → test → prod` 并发布新 npm 包后才能成为生产依赖。当前 Draft 不动生产 DNS、站点或服务器。公安备案标识图片需要官方备案平台提供，不能用自制素材代替。
