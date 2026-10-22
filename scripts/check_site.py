#!/usr/bin/env python3
"""Validate static pages and local navigation without dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
PAGES = ["index.html", "notes.html", "projects.html", "about.html", "404.html"]
NAV = PAGES[:-1]

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.ids = set()
        self.nav = set()
        self.in_nav = 0
        self.has_viewport = self.has_description = self.has_title = False
        self.lang = ""
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == "html":
            self.lang = d.get("lang", "")
        elif tag == "meta":
            self.has_viewport |= d.get("name") == "viewport"
            self.has_description |= d.get("name") == "description"
        elif tag == "title":
            self.has_title = True
        elif tag == "nav":
            self.in_nav += 1
        if d.get("id"):
            assert d["id"] not in self.ids, "duplicate id"
            self.ids.add(d["id"])
        value = d.get("href") if tag in ("a","link") else d.get("src") if tag in ("img","script") else None
        if value:
            self.links.append(value)
            if self.in_nav and tag == "a":
                self.nav.add(value)
    def handle_endtag(self, tag):
        if tag == "nav":
            self.in_nav -= 1

def main():
    errors = []
    for file in PAGES:
        path = ROOT / file
        if not path.is_file():
            errors.append(f"missing page: {file}")
            continue
        try:
            parsed = Links()
            parsed.feed(path.read_text(encoding="utf-8"))
            if parsed.lang != "zh-CN" or not parsed.has_viewport or not parsed.has_title:
                errors.append(f"missing base metadata: {file}")
            if file != "404.html" and not parsed.has_description:
                errors.append(f"missing description: {file}")
            if set(NAV) - parsed.nav:
                errors.append(f"missing navigation targets: {file}")
            for href in parsed.links:
                uri = urlsplit(href)
                if uri.scheme or uri.netloc:
                    if uri.scheme not in ("https","http","mailto"):
                        errors.append(f"invalid scheme {href}")
                    continue
                if href.startswith("//") or uri.path.startswith("/"):
                    errors.append(f"root/protocol-relative link not Pages-safe: {file} {href}")
                    continue
                target = unquote(uri.path) or file
                absolute = (ROOT / target).resolve()
                if not absolute.is_relative_to(ROOT) or not absolute.is_file():
                    errors.append(f"broken local link: {file} {href}")
        except (AssertionError, ValueError) as e:
            errors.append(f"{file}: {e}")
    sitemap = ROOT / "sitemap.xml"
    try:
        paths = [urlsplit(e.text or "").path for e in ET.parse(sitemap).findall(".//{*}loc")]
        expected = ["/", "/notes.html", "/projects.html", "/about.html"]
        if sorted(paths) != sorted(expected):
            errors.append("invalid sitemap paths")
    except (OSError,ET.ParseError):
        errors.append("missing/invalid sitemap")
    if errors:
        raise SystemExit("FAIL:\n" + "\n".join(errors))
    print(f"PASS: {len(PAGES)} HTML pages, local links, navigation and sitemap")

if __name__ == "__main__":
    main()
