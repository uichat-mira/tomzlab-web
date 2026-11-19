import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { folio } from "@uichat-mira/folio/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import config from "./folio.config";
import { renderStaticSiteHome } from "./src/static-home";

const here = path.dirname(fileURLToPath(import.meta.url));
const base = process.env.TOMZLAB_SITE_BASE || "/";

export default defineConfig({
  root: here,
  base,
  plugins: [
    react(),
    folio({
      contentDir: path.resolve(here, "content"),
      config,
      staticRoutes: {
        locale: "zh_CN",
        siteName: config.title,
        siteIndexing: process.env.TOMZLAB_PREVIEW === "1" ? "noindex" : "index",
        home: (context) => ({ body: renderStaticSiteHome(context) }),
      },
    }),
  ],
  build: {
    outDir: path.resolve(here, "../_site"),
    emptyOutDir: false,
  },
});
