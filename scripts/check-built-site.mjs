import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "_site");
for (const item of [
  "index.html", "notes.html", "weekly.html", "projects.html", "about.html",
  "assets/icons/logo.svg", "assets/css/site.css",
  "journal/index.html", "journal/notes/this-site/index.html",
  "sitemap.xml",
]) {
  const f = path.join(dir, item);
  if (!(await stat(f)).isFile()) throw new Error("Missing built file: "+item);
}
const html = await readFile(path.join(dir, "index.html"), "utf8");
const article = await readFile(path.join(dir, "journal/notes/this-site/index.html"), "utf8");
const sitemap = await readFile(path.join(dir, "sitemap.xml"), "utf8");
for(const expected of [
  "党靖涛的记事本", "希望十年后它还在。不管我在不在。",
  'class="folio-header', "folio-footer--structured",
  'data-folio-preset="pearl"', "粤ICP备2026168682号-1",
  "粤公网安备44020302000372号", "记录与文字", "项目与实验",
  'rel="canonical"',
]) if(!html.includes(expected))throw new Error("Missing Folio homepage contract: "+expected);
const base = (process.env.TOMZLAB_SITE_BASE || "/").replace(/^\/+|\/+$/g, "");
const expectedArticleUrl = `https://tomzlab.cn/${base ? base + "/" : ""}journal/notes/this-site/`;
if(!sitemap.includes(expectedArticleUrl)) throw new Error("Folio article missing from sitemap");
// The notebook must stay a real vector in both hydrated and no-JS home HTML.
for (const token of ['<svg', 'site-home__notebook-art', 'folio-notebook-paper', 'NOTES / 001']) {
  if (!html.includes(token)) throw new Error('Vector notebook lost from static homepage: ' + token);
}
if (html.includes('feTurbulence')) throw new Error('Photorealistic paper-grain filter must not return');
if (html.includes('site-home__paper')) throw new Error('Deprecated CSS notebook remains in static homepage');
if(!sitemap.includes("https://tomzlab.cn/notes.html")) throw new Error("Legacy entries missing from sitemap");
if(!article.includes("从门牌到阅读空间"))throw new Error("Folio content not server readable");
console.log("PASS Folio header/footer + Pearl home SSR + legacy routes + canonical/sitemap");
