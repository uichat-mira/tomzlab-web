import React from "react";
import ReactDOM from "react-dom/client";
import { FolioApp, type FolioDoc } from "@uichat-mira/folio";
import "@uichat-mira/folio/styles.css";
import docs from "virtual:folio/content";
import config from "../folio.config";
import { SiteHome } from "./SiteHome";
import { SiteListPage } from "./SiteListPages";
import "./home.css";
import "./list-pages.css";

const basePath = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FolioApp
      config={config}
      docs={(docs as FolioDoc[]).filter((doc) => !["/notes", "/weekly", "/projects"].includes(doc.path))}
      basePath={basePath}
      ui={{ defaultTheme: "light" }}
      slots={{
        headerBrand: <span className="site-brand"><img src={basePath + "assets/icons/logo.svg"} alt="" /><span>tomzlab.cn</span></span>,
        home: <SiteHome />,
        pages: [
          { path: "/notes", element: <SiteListPage section="notes" /> },
          { path: "/weekly", element: <SiteListPage section="weekly" /> },
          { path: "/projects", element: <SiteListPage section="projects" /> },
        ],
      }}
    />
  </React.StrictMode>,
);
