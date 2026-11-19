import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { FolioHeader, FolioFooter } from "@uichat-mira/folio";
import type { FolioStaticBuildContext } from "@uichat-mira/folio/vite";
import { SiteHome } from "./SiteHome";

/**
 * One React home component is shared with FolioApp's slots.home.
 * Folio's own Header/Footer are used for the no-JS projection as well.
 */
export function renderStaticSiteHome(context: FolioStaticBuildContext): string {
  const basePath = context.base;
  const basename = basePath === "/" ? undefined : basePath.replace(/\/$/, "");
  const brand = createElement("span", { className: "site-brand" },
    createElement("img", { src: basePath + "assets/icons/logo.svg", alt: "" }),
    createElement("span", null, "tomzlab.cn"),
  );
  const tree = createElement(MemoryRouter, { basename, initialEntries: [basePath] },
    createElement("div", { className: "folio-shell" },
      createElement(FolioHeader, {
        config: context.config,
        docs: context.docs,
        brand,
        searchEnabled: false,
        themeEnabled: false,
        shareEnabled: false,
      }),
      createElement("div", { className: "folio-content" },
        createElement(SiteHome, { basePath }),
        createElement(FolioFooter, { footer: context.config.footer, siteTitle: context.config.title }),
      ),
    ),
  );
  // JavaScript-disabled mobile visitors still get an immediately accessible
  // navigation row even though the interactive header's drawer cannot open.
  const staticBody = renderToStaticMarkup(tree);
  const nav = ['index.html','notes.html','weekly.html','projects.html','about.html'];
  const labels = ['首页','记录','周刊','项目','关于'];
  const links = nav.map((page, i) => '<a href="' + basePath + page + '">' + labels[i] + '</a>').join("");
  return staticBody.replace("</header>", "</header><noscript><nav class=\"site-nojs-nav\" aria-label=\"无脚本导航\">" + links + "</nav></noscript>");
}
