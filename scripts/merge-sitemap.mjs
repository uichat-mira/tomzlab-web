import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "_site/sitemap.xml");
const nested = path.join(root, "_site/journal/sitemap.xml");
const xmls = await Promise.all([target, nested].map(file => readFile(file, "utf8")));
const urls = [...new Set(xmls.flatMap(xml =>
  [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1])
))];
if (urls.length < 7 || urls.some(url => !url.startsWith("https://tomzlab.cn/"))) {
  throw new Error("Invalid merged domestic sitemap");
}
await writeFile(target,
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(url => '  <url><loc>' + url + '</loc></url>').join("\n") +
  '\n</urlset>\n'
);
