# tomzlab.cn 首页改版 · 视觉与接入说明

> 设计候选，非已部署产物。内容依据 `uichat-mira/tomzlab-web` 的 `prod` 分支（Git tree SHA `6a34c9fc69f8456bb01a416fc538a88604ef8745`）。Folio 能力依据 `uichat-mira/folio` 当前 `dev` 已公开的 React Slots、Build Adapter 和静态构建文档。预览不代表产品验收。

## 定位与原则

站名、主标语、简介、文章标题、摘要、周刊、四个项目及「这个站」全文均以国内官网生产 HTML 为内容依据。**网站仍然是一座长期可访问的个人入口**，不是拷贝 `tomz.io` 的博客，也不创造本站不存在的全文或订阅承诺。

### 视觉

- 珍珠白 `#fbfaf7`；中文衬线强调个人叙事；内容正文保持干净的无衬线。
- 主视觉是根据生产首页原有 notebook 意象精炼的纸页，不引用新图或假封面。
- 尽可能避免整页卡片：目录、作品、文字以表格化序号和细线建立层级；只有首屏保留纸页形态。
- 首页小屏单栏阅读，保留完整主标语、四个项目、外部来源和页脚备案，不因手机宽度隐藏内容。

## 信息架构

1. Header：`tomzlab.cn` 生产图形标识；首页 / 记录 / 周刊 / 项目 / 关于。
2. 主视觉：**党靖涛的记事本**、`Personal notes, projects & experiments.`、生产原句「写一点生活……」。
3. **最近的记录**：生产 `notes.html` 的三篇生活长文，来源明确标为 `TOMZ.IO`；保留原文链接。
4. **见π 周刊**：生产 `weekly.html` 的 `007` 为静态回退示例，正文仍由母站提供；明确「周刊目录」站内入口。
5. **工程与产品**：生产 `notes.html` 的三条 `mira.tomz.io` 文章，不假装为本站全文。
6. **做出来的东西**：生产 `projects.html` 的 UIChat Mira / Mira Mobile / ComDesign / UIChat，保持原有文字及目标链接。
7. **这个站**：保持生产首页的完整角色边界与「没有广告……」原句，最后以「希望十年后它还在……」作结。
8. Footer：母站、工程站、联系地址、备案。ICP 末尾 `-1` 和公安备案查询链来自最新备案信息，应经上游权威文件核对后再上线；公安平台备案图标需使用官方素材，不能自制。

## Folio 运行机制

- **UI**：使用 `FolioApp` 的 `slots.home` 注入门户首页，`headerBrand` 接入生产标识，`footer` 统一合法页脚；`ui.theme` 可开启主题切换。
- **内容**：主首页属于站点主导的 portal 页面，不强行建成 `article`；局部索引可以继续读取已有跨站 feed，**失败保持生产代码中已有的三条静态回退**。Folio `docs` 仅存放本站自主发布、审核过的 Markdown。
- **搜索**：若没有足够本站 `docs`，不显示只搜索本地 Markdown 的全站搜索按钮，以免让访客误以为它能搜索 `tomz.io` 和 `mira.tomz.io`。
- **构建**：`slots.home` 只影响 React，不生成服务器可见 HTML。对应的 `staticRoutes.home` 必须使用**同一份内容数据和结构**输出 HTML、canonical、description 和真实正文。不得维护两份独立文案。
- **发布**：先在独立候选分支验证，根路径稳定后，再调整独立 `mira-cloud-infra` 的 `_site` 产物打包逻辑；不直接更改 Caddy 或 `prod`。

## 验收重点

- 390 px 手机屏和 1440 px 桌面：无横向滚动，header 可达，文章标题没有截断。
- 无 JavaScript 时保留主视觉文字、全部栏目和项目真实链接。
- 访客点击外站文章，能明确知道跳到原站；失败 feed 不导致空白。
- SEO canonical、站点地图、公安备案和 ICP 不冲突。
- 运行时 React 与静态 HTML 采用同一个数据源；不能出现上线版本内容与页面不一致。

## 本候选的边界

`tomzlab-homepage-preview.html` 是可离线检查结构的单页视觉原型，**并非已经挂载 Folio Runtime 的完整应用**，也不代表本次修改了 GitHub 仓库或生产网站。它用于让用户先审阅实际布局与文案，再进行 Folio 消费者工程实现。