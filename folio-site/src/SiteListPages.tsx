import { FolioListPage, type FolioListEntry } from "@uichat-mira/folio";
import { validateFeed, selectNotes, selectIssues, publishedDate, type PublishedItem, type JsonFeed } from "./publication-contract.mjs";
import { usePublicationResource, type SubscriptionStatus } from "./use-publication-resource";
import source from "./lists.generated.json";

export type SiteListSection = "notes" | "engineering" | "weekly" | "projects";
const definitions: Record<SiteListSection, {
  title: string; description: string; eyebrow: string;
}> = {
  notes: {
    title: "记录与文字",
    description: "生活、阅读、随笔与个人思考。正文仍在 tomz.io。",
    eyebrow: "NOTES / 记录",
  },
  engineering: {
    title: "工程与产品",
    description: "Mira 的研发实践、产品设计与技术复盘。正文仍在 mira.tomz.io。",
    eyebrow: "ENGINEERING / 工程",
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

type SourceRow = { title: string; url: string; description?: string; date?: string; cover?: string };
function projectRows(rows: readonly SourceRow[], host: string): FolioListEntry[] {
  return rows.map((row) => ({
    id: row.url,
    href: row.url,
    title: row.title,
    ...(row.cover ? { cover: row.cover } : {}),
    description: row.description || "",
    ...(row.date ? { date: row.date } : {}),
    meta: host,
  }));
}
function publishRows(items: readonly PublishedItem[]): FolioListEntry[] {
  return items.map((item) => ({
    id: item.id,
    href: item.url,
    title: item.title,
    ...(item._tomzio.kind === "issue" && item.image ? { cover: item.image } : {}),
    description: (item.summary || item.content_text || "").trim().slice(0, 120),
    ...(publishedDate(item) ? { date: publishedDate(item) ?? undefined } : {}),
    meta: "tomz.io",
  }));
}
function sourceStatus(status: SubscriptionStatus, liveBuild: boolean) {
  if (status === "fresh") return null;
  if (status === "cached") return "显示上次成功订阅的 Tomz.io 内容，联网后自动检查更新。";
  return liveBuild
    ? "母站订阅暂不可用，显示构建时已验证的文章索引。"
    : "母站订阅暂不可用，显示 2026 年 10 月留存的旧索引，不代表最新发布。";
}

function PublicationListPage({ section }: { section: "notes" | "weekly" }) {
  // Only Tomz.io publications. Mira engineering RSS is independent.
  const { data: live, status } = usePublicationResource<JsonFeed | null>("json-feed", validateFeed, null);
  const mother = section === "notes" ? source.sources.life : source.sources.weekly;
  const current = live
    ? (section === "notes" ? selectNotes(live, 12) : selectIssues(live, 12))
    : null;
  const rows = current
    ? publishRows(current)
    : projectRows(mother.entries, "tomz.io");
  const alert = sourceStatus(status, mother.live);
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

function EngineeringListPage() {
  const engineering = source.sources.engineering;
  const rows = projectRows(engineering.entries, "mira.tomz.io");
  return (
    <>
      <FolioListPage {...definitions.engineering} entries={rows} variant="shelf"
        showNumbers={false} emptyMessage="当前没有经过验证的工程记录。" />
      {!engineering.live ? <p className="site-list-source-status" role="status">
        工程站 RSS 暂不可用，显示 2026 年 10 月留存的旧索引，不代表最新发布。
      </p> : null}
    </>
  );
}

function ProjectListPage() {
  const rows = projectRows(source.sources.projects.entries, "tomz.io");
  return <FolioListPage {...definitions.projects} entries={rows} variant="shelf" showNumbers={false}
    emptyMessage="尚无经过验证的项目记录。" />;
}

/** Same Folio list React tree is used by browser routes and static build. */
export function SiteListPage({ section }: { section: SiteListSection }) {
  if (section === "projects") return <ProjectListPage />;
  if (section === "engineering") return <EngineeringListPage />;
  return <PublicationListPage section={section} />;
}
