import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "_site");
const configuredBase = process.env.TOMZLAB_SITE_BASE ?? "/";
const base = "/" + configuredBase.replace(/^\/+|\/+$/g, "");
const normalizedBase = base === "/" ? "/" : base + "/";
const aliases = [
  ["notes", "记录"],
  ["weekly", "见π 周刊"],
  ["projects", "项目"],
  ["about", "关于"],
];

// Old .html bookmarks remain accessible; these are redirects, not another
// set of hand-built pages. Folio alone renders the destination's content.
for (const [slug, title] of aliases) {
  const href = normalizedBase + slug + "/";
  const canonical = "https://tomzlab.cn/" + slug + "/";
  const html = [
    '<!doctype html><html lang="zh-CN"><head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="robots" content="noindex,follow">',
    '<meta http-equiv="refresh" content="0;url=' + href + '">',
    '<link rel="canonical" href="' + canonical + '">',
    '<title>' + title + ' · 党靖涛的记事本</title>',
    '</head><body><main><p>该页面已迁入 Folio：',
    '<a href="' + href + '">前往' + title + '</a></p></main></body></html>',
  ].join("\n");
  await writeFile(path.join(out, slug + ".html"), html, "utf8");
}
