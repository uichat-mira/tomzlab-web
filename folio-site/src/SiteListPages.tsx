import { FolioListPage, type FolioListEntry } from "@uichat-mira/folio";
import source from "./lists.generated.json";

export type SiteListSection = "notes" | "weekly" | "projects";
const definitions: Record<SiteListSection, {
  title: string; description: string; eyebrow: string;
}> = {
  notes: {
    title: "记录",
    description: "一些读过的、经历过的、想过的事。正文仍在原站。",
    eyebrow: "NOTES / 记录",
  },
  weekly: {
    title: "见π 周刊",
    description: "每周一期的编辑桌。专题、封面、正文与全部目录仍在 tomz.io。",
    eyebrow: "WEEKLY / 见π",
  },
  projects: {
    title: "项目",
    description: "把做过的事情留一个入口。个人创作与开放工程，不提供商业服务。",
    eyebrow: "PROJECTS / 项目",
  },
};

export function siteListDefinition(section: SiteListSection) {
  return definitions[section];
}

function listEntries(section: SiteListSection): FolioListEntry[] {
  const sources = section === "notes"
    ? [source.sources.life, source.sources.engineering]
    : [source.sources[section]];
  return sources.flatMap((item) => item.entries.map((entry) => ({
    id: entry.url,
    href: entry.url,
    title: entry.title,
    description: entry.description,
    category: entry.category,
    ...("date" in entry && typeof entry.date === "string" ? { date: entry.date } : {}),
    meta: entry.meta,
  })));
}

/** A single native Folio component owns the browser and static presentation. */
export function SiteListPage({ section }: { section: SiteListSection }) {
  const definition = definitions[section];
  const sources = section === "notes"
    ? [source.sources.life, source.sources.engineering]
    : [source.sources[section]];
  const stale = sources.some((entry) => !entry.live);
  return (
    <>
      <FolioListPage
        {...definition}
        entries={listEntries(section)}
        variant="shelf"
        showNumbers={false}
        emptyMessage="尚无经过验证的出版条目。"
      />
      {stale ? (
        <p className="site-list-source-status" role="status">
          部分订阅源暂不可用。这是 {source.snapshotDate} 留存的旧索引，不代表最新发布。
        </p>
      ) : null}
    </>
  );
}
