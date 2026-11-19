# 党靖涛的记事本 · Folio dev 消费站

`tomzlab.cn` 是个人非经营性网站。本分支用于**真实验证 Folio dev 的完整站点能力**：Folio 提供原生 Header、Footer、Pearl、搜索、文章/页面阅读与静态构建；本站只定制首页 `SiteHome` 和品牌。

## 页面及内容所有权

| Route | 页面来源 | 页面渲染 |
| --- | --- | --- |
| `/` | `site-content.ts` 的生产首页文字 + SVG 笔记本；构建时从 tomz.io 书架采集封面、标题和入口 | `FolioApp` + `slots.home`，静态首页复用 `SiteHome` |
| `/notes/` | 构建时从 `tomz.io/rss.xml` 和 `mira.tomz.io/blogs/feed.xml` 取最近文章及原文链接 | Folio 原生 `type: page` Markdown |
| `/weekly/` | 构建时从母站 RSS 提取真实期数的封面 URL（最多 12 期） | Folio 原生 `type: page` Markdown |
| `/projects/` | 正式站生产分支的四个项目与原始链接 | Folio 原生 `type: page` Markdown |
| `/about/` | 正式站生产分支的介绍、联系与非经营声明 | Folio 原生 `type: page` Markdown |
| `/journal/` | 本站自有 Git Markdown | Folio 原生 `collection` + `doc` |

外部作者与原文仍由各自站点负责。Folio 的 `CollectionIndex / EntryList` 默认链接站内文档，因此不能伪造一组本地 Article 来承接母站 RSS；这里采用**仅生成 Markdown 外链索引**的适配层，不引入第二套 React 页面或 DOM 渲染器。

首页书架不另建本地书籍正文：`scripts/sync-books.py` 在构建时读取 `https://tomz.io/books/` 的公开封面与书籍链接，生成被忽略的 `books.generated.json`，Folio 首页 `slots.home` 只负责展示一排封面及跳转。离线时回退到有采集日期的 `snapshots/books-fallback.json` 并在页面标注。书封图直接引用 tomz.io / assets.tomz.io 公共地址，不提交或篡改原图。

旧 `*.html` 链接会自动重定向到新路由，仅留下构建时生成的 noindex 兼容页。原来的 HTML 主页/栏目、feed-sync.js、nav.js 和 site.css 已从消费候选删除，不再拥有站点功能。

## 本地验证

需要 Node 24、Python 3 和 curl。Folio dev API 尚未正式发布，暂用精确 commit 打包：

```sh
npm ci --no-audit --no-fund
git clone https://github.com/uichat-mira/folio.git /tmp/folio-consumer-source
cd /tmp/folio-consumer-source
git checkout 36547bd4818d63268ae5e9d88f79e34861642e87
npm ci --no-audit --no-fund
npm pack --workspace @uichat-mira/folio --pack-destination /tmp
cd /path/to/tomzlab-web
npm install --no-save --package-lock=false /tmp/uichat-mira-folio-0.1.1.tgz
npm run typecheck
npm run build
python3 scripts/check_site.py
python3 -m http.server 8768 --directory _site
```

`npm run build` 会同步 RSS 及 tomz.io 的书架封面目录、生成 Folio Markdown 数据页、执行 Vite/Folio 静态输出、写入旧 URL 跳转和校验产物。获取不到 RSS 时使用显式注明**2026 年 10 月**来源的生产快照，不伪称是最新文章。也可以指定 `TOMZLAB_FEED_MODE=offline`（也控制书架）测试回退，或者 `required` 要求真实 RSS，失败则构建失败。

## 发布限制

这是 Draft 消费者验证，**没有发布生产**。当前 Folio 0.1.1 不含本项目消费的完整 dev API；必须先验收与发布新版包，才可调整 lockfile。生产发布仓库 `mira-cloud-infra` 也必须适配 `_site/` 构建结果并保留原子回滚。

已发现的 Folio 本体缺口：默认静态生成的**非首页**页面含 Markdown 正文、canonical、sitemap 和 robots 信息，却**不包含完整的 Header/Footer**；在 React 加载后才有完整外壳。站点消费层不伪造第二套页面外壳，详见 `docs/deployment.md`。
