import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "_site");
const baseName = (process.env.TOMZLAB_SITE_BASE || "/").replace(/^\/+|\/+$/g, "");
const base = baseName ? "/" + baseName + "/" : "/";
const site = "https://tomzlab.cn";
async function file(name) {
  const p = path.join(out, name);
  if (!(await stat(p)).isFile()) throw new Error("Missing Folio output: " + name);
  return readFile(p, "utf8");
}
function mustContain(value, items, page) {
  for (const item of items) if (!value.includes(item))
    throw new Error(page + " missing " + JSON.stringify(item));
}
const pages = {
  "index.html": ["党靖涛的记事本", "希望十年后它还在。不管我在不在。", "site-home__notebook-art", "<svg", "folio-notebook-paper"],
  "notes/index.html": ["<h1>记录</h1>", "生活与长文", "工程与产品", "https://tomz.io/blogs/", "https://mira.tomz.io/blogs/"],
  "weekly/index.html": ["<h1>见π 周刊</h1>", "https://tomz.io/weekly/"],
  "projects/index.html": ["<h1>项目</h1>", "UIChat Mira", "UIChat Mira Mobile", "ComDesign", "UIChat"],
  "about/index.html": ["<h1>关于这里</h1>", "你好，我是党靖涛", "hello@tomz.io"],
  "journal/index.html": ["阅读空间"],
  "journal/notes/this-site/index.html": ["从门牌到阅读空间", "非经营性的个人网站"],
};
for (const [name, fragments] of Object.entries(pages)) {
  const page = await file(name);
  mustContain(page, [...fragments,
    'lang="zh-CN"', 'data-folio-preset="pearl"', 'rel="canonical"',
    'name="description"', 'name="viewport"'
  ], name);
  if (page.includes("assets/js/feed-sync.js") || page.includes("assets/css/site.css"))
    throw new Error("Legacy page runtime leaked into " + name);
  const slug = name === "index.html" ? "" : name.replace(/index\.html$/, "");
  mustContain(page, ['href="' + site + base + slug + '"'], "canonical " + name);
}
const home = await file("index.html");
mustContain(home, ["folio-header", "folio-footer--structured",
  "粤ICP备2026168682号-1", "粤公网安备44020302000372号", "NOTES / 001"], "home");
// The initial HTML is a valid, server-visible snapshot. Once React mounts,
// Folio's subscription hook replaces it with validated publisher JSON.
const bookSnapshot = JSON.parse(await readFile(path.join(root, "folio-site/snapshots/books-fallback.json"), "utf8"));
mustContain(home, ['id="site-home-books"', 'class="site-home__book-list"',
  'href="https://tomz.io/books/"', bookSnapshot.captured_on], "book subscription fallback");
for (const book of bookSnapshot.books) {
  mustContain(home, [book.url, book.cover, book.title], "book subscription fallback");
}
if (home.includes("src/books.generated.json")) throw new Error("Old book scraper output leaked into Folio consumer");
if (home.includes("feTurbulence") || home.includes("site-home__paper"))
  throw new Error("Notebook must stay Pearl-compatible flat vector");
for (const slug of ["notes", "weekly", "projects", "about"]) {
  const redirect = await file(slug + ".html");
  mustContain(redirect, ['content="noindex,follow"', 'url=' + base + slug + '/',
    'href="' + base + slug + '/"', 'rel="canonical"'], slug + ".html");
  if (redirect.includes("folio-markdown") || redirect.includes("site-header"))
    throw new Error("Legacy alias contains a duplicate page body: " + slug);
}
const xml = await file("sitemap.xml");
for (const slug of ["", "notes/", "weekly/", "projects/", "about/", "journal/"]) {
  mustContain(xml, ["<loc>" + site + base + slug + "</loc>"], "sitemap.xml");
}
await file("404.html");
await file("assets/icons/logo.svg");
await file("assets/icons/favicon.svg");
if (process.env.TOMZLAB_PREVIEW === "1")
  for (const name of Object.keys(pages))
    mustContain(await file(name), ['content="noindex,nofollow"'], name);
console.log("PASS Folio native routes, Pearl home, publisher links, redirects, sitemap, SEO and no-JS bodies");
