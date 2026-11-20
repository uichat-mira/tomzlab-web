import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import type { Plugin } from "vite";
import { SiteListPage, type SiteListSection } from "./src/SiteListPages";

/**
 * Folio #196 exposes public React list pages, but does not yet serialize
 * arbitrary slots.pages during the default static build.
 *
 * The Folio Vite plugin first owns each route, canonical, sitemap and SEO.
 * This consumer build adapter replaces ONLY the pre-rendered root body with
 * the EXACT FolioListPage React component also used by the browser.
 * It neither forks HTML templates nor creates a second site shell.
 *
 * Remove this adapter when Folio exposes static slots.pages directly.
 */
export function siteFolioListStaticPlugin(outDir: string): Plugin {
  return {
    name: "tomzlab-folio-list-static",
    apply: "build",
    closeBundle() {
      for (const section of ["notes", "weekly", "projects"] as const satisfies readonly SiteListSection[]) {
        const file = path.join(outDir, section, "index.html");
        const html = readFileSync(file, "utf8");
        const root = '<div id="root">';
        const begin = html.indexOf(root);
        const bodyEnd = html.indexOf("</body>");
        const end = html.lastIndexOf("</div>", bodyEnd);
        if (begin < 0 || bodyEnd < 0 || end <= begin ||
            html.indexOf(root, begin + 1) !== -1 ||
            !html.includes('rel="canonical"') ||
            !html.slice(begin, end).includes('class="folio-prerender"')) {
          throw new Error("Folio static route template changed: " + section);
        }
        const page = createElement(MemoryRouter, {
          initialEntries: ["/" + section],
        }, createElement(SiteListPage, { section }));
        const rendered = renderToStaticMarkup(page);
        if (!rendered.includes("folio-entry-list--shelf") || !rendered.includes("<h1>")) {
          throw new Error("FolioListPage did not render: " + section);
        }
        writeFileSync(file,
          html.slice(0, begin) + root + rendered + "</div>" + html.slice(end + "</div>".length),
        );
      }
    },
  };
}
