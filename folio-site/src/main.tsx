import React from "react";
import ReactDOM from "react-dom/client";
import { FolioApp, type FolioDoc } from "@uichat-mira/folio";
import "@uichat-mira/folio/styles.css";
import docs from "virtual:folio/content";
import config from "../folio.config";
import { SiteHome } from "./SiteHome";
import "./home.css";

const basePath = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FolioApp
      config={config}
      docs={docs as FolioDoc[]}
      basePath={basePath}
      ui={{ defaultTheme: "light" }}
      slots={{
        headerBrand: <span className="site-brand"><img src={basePath + "assets/icons/logo.svg"} alt="" /><span>tomzlab.cn</span></span>,
        home: <SiteHome />,
      }}
    />
  </React.StrictMode>,
);
