# 党靖涛的记事本 · Folio dev 消费站

`tomzlab.cn` 是个人非经营性网站。本分支验证 Folio dev 的站点能力：Folio 负责 Header、Footer、Pearl 主题、搜索、路由、Markdown 和静态页面；本站通过公共接口提供首页、原站出版目录和配置。

## 栏目与内容归属

| 路由 | 内容来源 | 渲染 |
| --- | --- | --- |
| `/` | 本站 `site-content.ts`、四张栏目入口、Tomz.io 书架 | `FolioApp` + `slots.home`，同一 `SiteHome` 生成静态首屏 |
| `/notes/` | Tomz.io JSON Feed：生活、阅读、随笔与个人文字 | 原生 `FolioListPage` |
| `/engineering/` | Mira 工程博客 RSS：研发实践、产品设计与技术复盘 | 原生 `FolioListPage` |
| `/weekly/` | Tomz.io JSON Feed：按出版者标识选择《见π》期数与封面 | 原生 `FolioListPage` |
| `/projects/` | 本站 `folio-site/content/projects.md` 的四个项目 | 原生 `FolioListPage` |
| `/about/` | 本站 `folio-site/content/about.md` | Folio `type: page` Markdown |
| `/journal/` | 本站自有 Git Markdown，暂不作为首页卡片 | Folio `collection` + `doc` |

生活与工程**只按出版者来源分开**，不互相拼接。原站仍拥有文章、出版身份与正文；本站仅提供可信索引和跳转，项目的唯一人工内容源是 `projects.md`。

## 出版订阅与静态输出

- Tomz.io 使用 `https://tomz.io/feeds.json` 发现出版资源，再读取 `/feed.json`（JSON Feed 1.1）和 `/books/catalog.json`；`publication-contract.mjs` 负责验证，`usePublicationResource` 在浏览器内直连、缓存和刷新。Folio **不是**数据订阅层。
- 工程目录由 `scripts/sync-source-index.py` 构建时读取 `https://mira.tomz.io/blogs/feed.xml`，不会在客户端和生活文章混排。周刊封面采用 JSON Feed 的 `items[].image`，映射到 Folio 列表 `cover`。
- 失败时使用已验证的回退索引并向读者说明：文章目录快照为 **2026-10**，书架快照为 **2026-11-19**。不得把旧快照称为实时内容。构建数据存于 Git 忽略的 `folio-site/src/lists.generated.json`。
- Folio 的 `slots.pages` 暂未输出任意 React 页面的静态正文；`folio-site/list-static-plugin.ts` 在 Folio 生成 canonical、sitemap、robots 后，只以**同一套 `SiteListPage` / `FolioListPage` React 树**替换静态页面根正文。不复制页面壳或另造目录组件。
- 旧的 `notes.html`、`weekly.html`、`projects.html`、`about.html` 是 noindex 重定向兼容入口，不再拥有站点内容。非首页的无 JavaScript 静态页面**暂缺完整 Header/Footer**，属于 Folio 上游已知缺口，不在本站伪造第二套壳（详见 `docs/deployment.md`）。

## 本地验证

环境：Node.js ≥22.12、Python 3、curl。当前使用 Folio dev **`7d06408aa25bde1b00409366cf302883af67592f`** 的隔离打包候选；不能把 npm 0.1.1 误认为已具备该能力。**不再依赖旧的 Folio 订阅 Hook 候选。**

```sh
npm ci --no-audit --no-fund
# 在已检出上述 Folio dev 提交的独立目录里：
bash scripts/pack-folio-candidate.sh /path/to/folio-dev /tmp
npm install --no-save --package-lock=false /tmp/uichat-mira-folio-0.1.1.tgz
npm run test:contract
npm run typecheck
TOMZLAB_FEED_MODE=required npm run build
python3 scripts/check_site.py
python3 -m http.server 8784 --directory _site
```

`TOMZLAB_FEED_MODE=offline` 可验证已标明日期的回退路径；`TOMZLAB_PREVIEW=1` 生成 noindex 预览。保持上游候选的隔离工作树；不要在现有站点运行 Folio 初始化器覆盖内容。

## 发布边界

这里是 **`feat/pub03-integrated` 的本地候选**，预览不代表已发布或已合并。按 `feat/* → dev → test → prod` 晋级前，需要正式验收 Folio dev API、解决依赖包发布，以及更新 `mira-cloud-infra` 的受控部署清单，确保它只部署经过验证的 `_site/` 产物并保留回滚。不要由本地预览直接推断生产可用。
