# 党靖涛的记事本 · Folio dev 消费站

`tomzlab.cn` 是个人非经营性网站。本分支用于**真实验证 Folio dev 的完整站点能力**：Folio 提供原生 Header、Footer、Pearl、搜索、页面与静态构建；本站定制首页 `SiteHome`，而其他出版栏目直接消费 Folio 公共 `FolioListPage`。

## 页面及内容所有权

| Route | 页面来源 | 页面渲染 |
| --- | --- | --- |
| `/` | `site-content.ts` 的生产首页文字 + SVG 笔记本；Folio dev 在浏览器中消费 tomz.io 公共书架 JSON；首屏带静态快照 | `FolioApp` + `slots.home`，静态首页复用 `SiteHome` |
| `/notes/` | 构建时从 `tomz.io/rss.xml`、`mira.tomz.io/blogs/feed.xml` 取真实文章数据 | **Folio 原生 `FolioListPage`** (`shelf`) |
| `/weekly/` | 构建时从母站 RSS 选择至多 12 个真实周刊期数 | **Folio 原生 `FolioListPage`** (`shelf`) |
| `/projects/` | 正式站保留的 `projects.md` 为四个项目的唯一人工编辑来源 | **Folio 原生 `FolioListPage`** (`shelf`) |
| `/about/` | 正式站生产分支的介绍、联系与非经营声明 | Folio 原生 `type: page` Markdown |
| `/journal/` | 本站自有 Git Markdown | Folio 原生 `collection` + `doc` |

外部作者与原文仍由各自站点负责。现在使用 Folio #196 的公共 `FolioListEntry`（原始 URL + 标题、摘要、分类、日期），不伪造本地 Article，不复制正文。`lists.generated.json` 是构建期自动产生并被 Git 忽略的临时投影；`projects.md` 是四个项目的唯一人工数据源。

`slots.pages` 在浏览器内注册原生路由；Folio 目前尚不能直接把任意 React 插槽生成静态页，因此 `folio-site/list-static-plugin.ts` 只把 **相同的 `SiteListPage` / `FolioListPage` React 树**写入 Folio 已生成的静态 HTML root。Folio 继续负责 canonical、sitemap、robots、Header/Footer 和主题。上游具备原生 `slots.pages` 静态输出后删除此薄适配器，不另造 CSS/HTML 模板。

首页书架由 Folio dev 的 `useFolioJsonSubscription` 运行时订阅 `https://tomz.io/books/catalog.json`，消费者只提供严格 Schema 校验、静态快照以及封面视觉。网络失败保留注明 2026-11-19 的 `snapshots/books-fallback.json`；成功收到更新则无需重建国内官网。篇章标题、数量和 URL 来自生产书籍 `CollectionPage / ItemList` 派生的同一份 JSON，不复制原文，也不继续抓取 HTML。书封直接使用 tomz.io 或 assets.tomz.io 的公共地址。发布者接口未正式部署前，默认生产 URL 会返回 404 并保持快照；**跨仓库订阅只在隔离本地端口完成端到端验证，不能宣称线上生效**。

旧 `*.html` 链接会自动重定向到新路由，仅留下构建时生成的 noindex 兼容页。原来的 HTML 主页/栏目、feed-sync.js、nav.js 和 site.css 已从消费候选删除，不再拥有站点功能。

## 本地验证

需要 Node 24、Python 3 和 curl。当前开发 API 仍未公开发行，测试包来自**两个精确上游提交**（Folio `dev@7d06408`、未合并的书架订阅 Hook `c012ea6`），由 `scripts/pack-folio-candidate.sh` 管理，不假装 0.1.1 已具备所有功能：

```sh
npm ci --no-audit --no-fund
# 在已检出 Folio dev@7d06408 的隔离目录中：
bash scripts/pack-folio-candidate.sh /path/to/folio-dev /tmp
npm install --no-save --package-lock=false /tmp/uichat-mira-folio-0.1.1.tgz
npm run typecheck
npm run build
python3 scripts/check_site.py
python3 -m http.server 8784 --directory _site
```

Folio 的独立项目初始化器已经合入 `dev`，但 `@uichat-mira/create-folio` **尚未发布 npm**。用当前源码打包后可以通过 `npx --package=/path/to/uichat-mira-create-folio-0.1.1.tgz -- create-folio new-site` 验证新项目；**不要对现有国内官网执行初始化器以免替换内容**。现有网站继续通过 npm tarball overlay 消费包本身。

`npm run build` 在构建时同步文章 RSS，并生成条目 JSON、原生 FolioListPage 静态正文和旧 URL 跳转；书架目录由 Folio 在浏览器运行时订阅，静态首屏只使用已验证快照。获取不到 RSS 时使用显式注明**2026 年 10 月**来源的生产快照，不伪称是最新文章。也可以指定 `TOMZLAB_FEED_MODE=offline`（不控制书架订阅）测试回退，或者 `required` 要求真实 RSS，失败则构建失败。

## 发布限制

这是 Draft 消费者验证，**没有发布生产**。当前 Folio 0.1.1 不含本项目消费的完整 dev API；必须先验收与发布新版包，才可调整 lockfile。生产发布仓库 `mira-cloud-infra` 也必须适配 `_site/` 构建结果并保留原子回滚。

仍存在的 Folio 本体缺口：默认静态生成的**非首页**页面含列表正文/Markdown、canonical、sitemap 和 robots 信息，却**不包含完整的 Header/Footer**；在 React 加载后才有完整外壳。站点消费层不伪造第二套页面外壳，详见 `docs/deployment.md`。

本地跨域联调可以使用 `VITE_TOMZLAB_BOOK_CATALOG_URL=http://127.0.0.1:8770/books/catalog.json` 构建消费者，出版者在 8770 提供 CORS JSON。此变量只属于隔离测试构建，绝不用于生产部署。
