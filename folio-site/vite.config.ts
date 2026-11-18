import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { folio } from "@uichat-mira/folio/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import config from "./folio.config";

const here = path.dirname(fileURLToPath(import.meta.url));
const base = process.env.TOMZLAB_FOLIO_BASE || "/journal/";

export default defineConfig({
  root: here,
  base,
  plugins: [
    react(),
    folio({
      contentDir: path.resolve(here, "content"),
      config,
      staticRoutes: true
    })
  ],
  build: {
    outDir: path.resolve(here, "../_site/journal"),
    emptyOutDir: true
  }
});
