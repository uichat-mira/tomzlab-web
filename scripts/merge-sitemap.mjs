import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const paths = [path.join(root, "sitemap.xml"), path.join(root, "_site/sitemap.xml")];
const source = await Promise.all(paths.map(p => readFile(p, "utf8")));
const urls = [...new Set(source.flatMap(xml => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x => x[1])))];
if (urls.length < 7 || urls.some(url => !url.startsWith("https://tomzlab.cn/"))) {
  throw new Error("Invalid merged domestic and Folio sitemap");
}
await writeFile(path.join(root, "_site/sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(u => '  <url><loc>' + u + '</loc></url>').join("\n") + '\n</urlset>\n');
