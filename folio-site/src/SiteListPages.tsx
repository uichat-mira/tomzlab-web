import { FolioListPage, type FolioListEntry } from "@uichat-mira/folio";
import { validateFeed, selectNotes, selectIssues, publishedDate, type PublishedItem, type JsonFeed } from "./publication-contract.mjs";
import { usePublicationResource, type SubscriptionStatus } from "./use-publication-resource";
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

type SourceRow = { title: string; url: string; description?: string; date?: string; category?: string; meta?: string; cover?: string };
function projectRows(rows: readonly SourceRow[], category: string, host: string): FolioListEntry[] {
  return rows.map((row) => ({
    id: row.url,
    href: row.url,
    title: row.title,
    ...(row.cover ? { cover: row.cover } : {}),
    description: row.description || "",
    category,
    ...(row.date ? { date: row.date } : {}),
    meta: host,
  }));
}
function publishRows(items: readonly PublishedItem[], category: string): FolioListEntry[] {
  return items.map((item) => ({
    id: item.id,
    href: item.url,
    title: item.title,
    ...(item._tomzio.kind === "issue" && item.image ? { cover: item.image } : {}),
    description: (item.summary || item.content_text || "").trim().slice(0, 120),
    category,
    ...(publishedDate(item) ? { date: publishedDate(item) ?? undefined } : {}),
    meta: "tomz.io",
  }));
}
function sourceStatus(status: SubscriptionStatus, stale: boolean) {
  if (status === "fresh") return stale ? "工程站目录暂不可用，显示旧版工程索引。" : null;
  if (status === "cached") return stale
    ? "母站使用上次成功同步的数据；工程站目录是旧快照。"
    : "母站使用上次成功同步的数据；联网后自动检查更新。";
  return stale
    ? "部分出版源暂不可用，显示 2026 年 10 月留存的旧索引，不代表最新发布。"
    : "母站出版接口暂不可用，显示构建时的已验证索引。";
}

function PublicationListPage({ section }: { section: "notes" | "weekly" }) {
  // Both consumers use the canonical Tomz.io publication protocol, not Folio's
  // network subscription Hook. The existing FolioListPage still owns UI.
  const { data: live, status } = usePublicationResource<JsonFeed | null>("json-feed", validateFeed, null);
  const engineering = source.sources.engineering;
  const mother = section === "notes" ? source.sources.life : source.sources.weekly;
  const current = live
    ? (section === "notes" ? selectNotes(live, 12) : selectIssues(live, 12))
    : null;
  const motherRows = current
    ? publishRows(current, section === "notes" ? "生活与长文" : "见π 周刊")
    : projectRows(mother.entries, section === "notes" ? "生活与长文" : "见π 周刊", "tomz.io");
  const rows = section === "notes"
    ? [...motherRows, ...projectRows(engineering.entries, "工程与产品", "mira.tomz.io")]
    : motherRows;
  const fallback = !mother.live || (section === "notes" && !engineering.live);
  const alert = sourceStatus(status, fallback);
  return (
    <>
      <FolioListPage
        {...definitions[section]}
        entries={rows}
        variant="shelf"
        showNumbers={false}
        emptyMessage="当前没有经过验证的出版条目。"
      />
      {alert ? <p className="site-list-source-status" role="status">{alert}</p> : null}
    </>
  );
}

function ProjectListPage() {
  const rows = projectRows(source.sources.projects.entries, "个人项目", "tomz.io");
  return <FolioListPage {...definitions.projects} entries={rows} variant="shelf" showNumbers={false}
    emptyMessage="尚无经过验证的项目记录。" />;
}

/** Same Folio list React tree is used by browser routes and static build. */
export function SiteListPage({ section }: { section: SiteListSection }) {
  if (section === "projects") return <ProjectListPage />;
  return <PublicationListPage section={section} />;
}
