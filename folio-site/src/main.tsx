import React from "react";
import ReactDOM from "react-dom/client";
import { FolioApp, type FolioDoc } from "@uichat-mira/folio";
import "@uichat-mira/folio/styles.css";
import docs from "virtual:folio/content";
import config from "../folio.config";
import { SiteHome } from "./SiteHome";
import "./home.css";

const basePath = import.meta.env.BASE_URL;

// Folio navigation uses React Router links. These pre-existing *.html pages
// remain native documents until they are migrated; force a document navigation
// so a router intercept never turns a valid legacy URL into Folio's SPA 404.
const legacyPaths = new Set(["/notes.html", "/weekly.html", "/projects.html", "/about.html"]);
document.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  const anchor = target.closest<HTMLAnchorElement>("a[href]");
  if (!anchor || anchor.target && anchor.target !== "_self" || anchor.hasAttribute("download")) return;
  const url = new URL(anchor.href);
  const within = url.pathname.startsWith(basePath) ? url.pathname.slice(basePath.length - 1) : "";
  if (url.origin === window.location.origin && legacyPaths.has(within)) {
    event.preventDefault();
    event.stopPropagation();
    window.location.assign(url.href);
  }
}, true);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FolioApp
      config={config}
      docs={docs as FolioDoc[]}
      basePath={basePath}
      ui={{ search: false, defaultTheme: "light" }}
      slots={{
        headerBrand: <span className="site-brand"><img src={basePath + "assets/icons/logo.svg"} alt="" /><span>tomzlab.cn</span></span>,
        home: <SiteHome basePath={basePath} />,
      }}
    />
  </React.StrictMode>,
);
