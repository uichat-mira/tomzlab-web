import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "_site");
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
// The production domain is now entirely Folio-rendered. Only actual static
// brand assets come from the host; Folio owns every route, 404 and sitemap.
await cp(path.join(root, "assets"), path.join(out, "assets"), { recursive: true });
