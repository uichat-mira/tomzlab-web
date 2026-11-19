import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "_site");
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
// Folio owns index.html and its generated static routes. Legacy documents and
// assets stay byte-identical until their own migration acceptance.
for (const item of ["notes.html", "weekly.html", "projects.html", "about.html", "assets"]) {
  await cp(path.join(root, item), path.join(out, item), { recursive: true });
}
