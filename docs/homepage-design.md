# tomzlab.cn 首页设计候选 · Folio Pearl

**内容唯一基线**：`uichat-mira/tomzlab-web` `prod@6a34c9fc`，不引入新文章、不改写生产文案、不把 `tomz.io` 和 `mira.tomz.io` 的外站内容复制过来。

**主题唯一基线**：`uichat-mira/folio` `dev` 的 `packages/folio/src/core/appearance.ts` 与 `packages/folio/src/styles.css`。正式接入时须从 `@uichat-mira/folio/styles.css` 导入原生样式，配置 `appearance: { preset: 'pearl', scheme: 'system' }`；不再自建第二套“珍珠白”主题。独立 HTML 设计稿为方便手机离线预览，内嵌对应版本 Pearl 语义 Token 的静态快照，并非已经运行 FolioApp。

## 首页内容收敛

1. **Header**：生产站 Logo、导航：首页 / 记录 / 周刊 / 项目 / 关于。
2. **Hero**：生产站名、原本英文副标题、原本「写一点生活，记一点工作……」原句；「翻开记事本」「关于这里」两个操作。
3. **从这里开始**：只保留生产首页已有的「记录与文字」「项目与实验」两条入口，各自引用原文案。
4. **见π 周刊**：一条轻量入口，无过期的“最新一期”、无复制目录。
5. **这个站**：原生产首页全文、末尾「希望十年后它还在。不管我在不在。」原句。
6. **Footer**：独立官网、母站、工程站与备案号；公安备案标识图片仍须采用官方资源。

不在首页堆三篇生活、三篇工程、四个项目、期刊封面和额外介绍。它们各有独立栏目，首页只负责让访客找到方向。

## Folio 组合与静态构建

- `FolioApp` 消费站：`appearance.preset = 'pearl'`，通过 `slots.home` 定制官网首页，通过 Folio 原生 `headerBrand` 和 `footer` 处理品牌与法律信息。
- 对应 `staticRoutes.home` 与 React `slots.home` 必须共用同一份生产内容数据；仅改 React 的页面不算 SEO 交付。
- Folio `docs` 只纳入本站审核过的 Markdown。原有站外记录和周刊保持真实来源链接，保留 `notes.html` 等稳定 URL 和源站 feed 同步逻辑。
- 此 PR 为**视觉设计稿**，不是完整 Folio 消费者实施；不变更 `prod` 或基础设施发布流程。

## 验收

- 390px 手机和 1440px 桌面均无横向滚动。
- 本机 Chrome 能渲染、折叠菜单和主题切换能运行，无 JS 仍可读核心内容。
- 所有导航和外链有真实目标；备案编号正确；项目/文章未虚构。
- 实际 Folio Runtime 和静态 HTML 一致性将在工程接入后验收。