import { defineFolioConfig } from "@uichat-mira/folio";

/** All first-party links use stable source routes; FolioApp owns the actual shell. */
export default defineFolioConfig({
  title: "党靖涛的记事本",
  description: "广州，独立开发者。记录 AI 产品、UIChat Mira，和一些没想完的事。",
  siteUrl: "https://tomzlab.cn",
  logo: "assets/og.png",
  navigation: [
    { label: "首页", href: "/" },
    { label: "记录", href: "/notes" },
    { label: "工程", href: "/engineering" },
    { label: "周刊", href: "/weekly" },
    { label: "项目", href: "/projects" },
    { label: "关于", href: "/about" },
  ],
  collections: [{ path: "/journal", title: "阅读空间", description: "本站独立发表的记录与说明。" }],
  appearance: { preset: "pearl", scheme: "light", codePalette: "auto" },
  footer: {
    // The navigation is already in the header and About; keep only the legal signature.
    legal: {
      copyright: "© 2026 · 党靖涛的记事本",
      registrations: [
        { label: "粤ICP备2026168682号-1", href: "https://beian.miit.gov.cn/", newTab: true },
        { label: "粤公网安备44020302000372号", href: "https://beian.mps.gov.cn/#/query/webSearch?code=44020302000372", newTab: true },
      ],
    },
  },
});
