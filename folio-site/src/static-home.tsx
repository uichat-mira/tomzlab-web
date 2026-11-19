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
        createElement(SiteHome),
        createElement(FolioFooter, { footer: context.config.footer, siteTitle: context.config.title }),
      ),
    ),
  );
  // JavaScript-disabled mobile visitors still get an immediately accessible
  // navigation row even though the interactive header's drawer cannot open.
  const staticBody = renderToStaticMarkup(tree);
  // Keep the no-JS fallback derived from the same Folio navigation config.
  const links = (context.config.navigation ?? [])
    .filter((item) => item.href && item.href.startsWith("/"))
    .map((item) => renderToStaticMarkup(createElement("a", {
      href: basePath + item.href!.replace(/^\/+/, ""),
    }, item.label)))
    .join("");
  return staticBody.replace("</header>", "</header><noscript><nav class=\"site-nojs-nav\" aria-label=\"无脚本导航\">" + links + "</nav></noscript>");
}
