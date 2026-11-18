import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "_site");
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const item of ["index.html", "notes.html", "weekly.html", "projects.html", "about.html", "404.html", "robots.txt", "sitemap.xml", "assets"]) {
  await cp(path.join(root, item), path.join(out, item), { recursive: true });
}
