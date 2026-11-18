import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "_site");
for (const item of [
  "index.html", "notes.html", "weekly.html", "about.html",
  "assets/css/site.css", "journal/index.html",
  "journal/notes/this-site/index.html", "journal/sitemap.xml", "sitemap.xml"
]) {
  const file = path.join(output, item);
  if (!(await stat(file)).isFile()) throw new Error("Missing published asset: " + item);
}
const home = await readFile(path.join(output, "index.html"), "utf8");
const notes = await readFile(path.join(output, "notes.html"), "utf8");
const article = await readFile(path.join(output, "journal/notes/this-site/index.html"), "utf8");
if (!home.includes("党靖涛的记事本")) throw new Error("Legacy home lost");
if (!notes.includes('href="journal/"')) throw new Error("Missing Folio navigation");
if (!article.includes("从门牌到阅读空间") || !article.includes("粤ICP备2026168682号")) {
  throw new Error("Folio static body / legal identity missing");
}
const sitemap = await readFile(path.join(output, "sitemap.xml"), "utf8");
if (!sitemap.includes("https://tomzlab.cn/journal/notes/this-site/")) throw new Error("Root sitemap lacks Folio content");
if (!article.includes("canonical")) throw new Error("Folio page lacks SEO canonical");
console.log("PASS: legacy pages preserved, Folio static article and metadata generated");
