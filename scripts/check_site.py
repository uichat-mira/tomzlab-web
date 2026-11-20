#!/usr/bin/env python3
"""Independent HTML output checks. No legacy hand-built page is a route owner."""
from html.parser import HTMLParser
from pathlib import Path
import os
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "_site"
ROUTES = ["index.html", "notes/index.html", "weekly/index.html",
          "projects/index.html", "about/index.html", "journal/index.html",
          "journal/notes/this-site/index.html"]
class Inspect(HTMLParser):
    def __init__(self):
        super().__init__()
        self.lang = None
        self.ids = set()
        self.hrefs = []
        self.viewport = False
        self.description = False
        self.headings = 0
        self.errors = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "html":
            self.lang = a.get("lang")
        if tag == "meta":
            self.viewport |= a.get("name") == "viewport"
            self.description |= a.get("name") == "description"
        if tag == "h1":
            self.headings += 1
        if tag == "a":
            self.hrefs.append(a.get("href", ""))
        ident = a.get("id")
        if ident:
            if ident in self.ids:
                self.errors.append("duplicate id: " + ident)
            self.ids.add(ident)

def main():
    errors = []
    base = "/" + os.getenv("TOMZLAB_SITE_BASE", "/").strip("/")
    base = "/" if base == "/" else base + "/"
    for item in ROUTES:
        path = OUT / item
        if not path.is_file():
            errors.append("missing Folio route: " + item)
            continue
        content = path.read_text(encoding="utf-8")
        view = Inspect()
        view.feed(content)
        if view.lang != "zh-CN" or not view.viewport or not view.description:
            errors.append("missing metadata: " + item)
        if view.headings != 1:
            errors.append("wrong h1 count: " + item + ": " + str(view.headings))
        if view.errors:
            errors.extend(item + " " + err for err in view.errors)
        if item in {"notes/index.html", "weekly/index.html", "projects/index.html"}:
            if "folio-entry-list--shelf" not in content or "folio-markdown" in content:
                errors.append("FolioListPage not rendered at build: " + item)
        elif item not in {"index.html", "journal/index.html"} and "folio-markdown" not in content:
            errors.append("Folio markdown not rendered at build: " + item)
        if item == "notes/index.html":
            if not any(h.startswith("https://tomz.io/blogs/") for h in view.hrefs):
                errors.append("missing actual mother-site links")
            if not any(h.startswith("https://mira.tomz.io/blogs/") for h in view.hrefs):
                errors.append("missing actual engineering links")
        if item == "weekly/index.html":
            if not any(h.startswith("https://tomz.io/weekly/") for h in view.hrefs):
                errors.append("missing verified weekly covers")
        if item == "projects/index.html":
            for url in ("https://mira.tomz.io/", "https://tomz.io/projects/uichat-mira-mobile/",
                        "https://tomz.io/projects/com-design/", "https://tomz.io/projects/uichat/"):
                if url not in view.hrefs:
                    errors.append("missing production project link: " + url)
        if item == "about/index.html" and "mailto:hello@tomz.io" not in view.hrefs:
            errors.append("missing contact link")
        if os.getenv("TOMZLAB_PREVIEW") == "1" and 'content="noindex,nofollow"' not in content:
            errors.append("preview indexable: " + item)
    sitemap = OUT / "sitemap.xml"
    try:
        paths = [node.text for node in ET.parse(sitemap).findall(".//{*}loc")]
        for route in ("/", "/notes/", "/weekly/", "/projects/", "/about/",
                      "/journal/", "/journal/notes/this-site/"):
            absolute = "https://tomzlab.cn" + base + route.lstrip("/")
            if absolute not in paths:
                errors.append("missing sitemap URL: " + absolute)
        if any(u.endswith(".html") for u in paths):
            errors.append("legacy redirects should not be indexed")
    except (OSError, ET.ParseError):
        errors.append("invalid Folio sitemap")
    for slug in ("notes", "weekly", "projects", "about"):
        stub = OUT / (slug + ".html")
        if not stub.exists() or "noindex,follow" not in stub.read_text(encoding="utf-8"):
            errors.append("missing noindex legacy redirect: " + slug)
    if errors:
        raise SystemExit("FAIL:\n" + "\n".join(errors))
    print("PASS: native FolioListPage static and runtime routes, sources, SEO, sitemap and legacy redirects")

if __name__ == "__main__":
    main()
