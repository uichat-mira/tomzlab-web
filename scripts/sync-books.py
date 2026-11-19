#!/usr/bin/env python3
"""Project tomz.io's public bookshelf into a Folio home-data module.

Only the public source owns books, titles, cover URLs and destinations.
The generated module is not a second book catalogue or a copy of book content.
"""
from __future__ import annotations

from datetime import datetime, timezone
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import subprocess
from urllib.parse import urljoin, urlparse

ROOT = Path(__file__).resolve().parents[1]
SOURCE = "https://tomz.io/books/"
FALLBACK = ROOT / "folio-site" / "snapshots" / "books-fallback.json"
OUTPUT = ROOT / "folio-site" / "src" / "books.generated.json"
MODE = os.getenv("TOMZLAB_BOOK_MODE", os.getenv("TOMZLAB_FEED_MODE", "auto")).lower()
if MODE not in {"auto", "offline", "required"}:
    raise SystemExit("TOMZLAB_BOOK_MODE must be auto, offline, or required")


class BookListParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.books = []
        self.article = None
        self.depth = 0
        self.in_title = False
        self.current_title = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "article" and "area-overview-card" in attrs.get("class", "").split():
            if self.article is not None:
                raise ValueError("Nested bookshelf articles are not supported")
            self.article = {"title": "", "url": "", "cover": "", "alt": ""}
            self.depth = 1
            return
        if self.article is None:
            return
        if tag == "article":
            self.depth += 1
        if tag == "img" and not self.article["cover"]:
            self.article["cover"] = attrs.get("src", "")
            self.article["alt"] = attrs.get("alt", "")
        if tag == "h2":
            self.in_title = True
            self.current_title = []
        if tag == "a" and self.in_title:
            self.article["url"] = attrs.get("href", "")

    def handle_data(self, data):
        if self.article is not None and self.in_title:
            self.current_title.append(data)

    def handle_endtag(self, tag):
        if self.article is None:
            return
        if tag == "h2" and self.in_title:
            self.article["title"] = " ".join("".join(self.current_title).split())
            self.in_title = False
        if tag == "article":
            self.depth -= 1
            if self.depth == 0:
                self.books.append(self.article)
                self.article = None


def validated(rows):
    if not isinstance(rows, list) or not (1 <= len(rows) <= 20):
        raise ValueError("Book source returned an implausible catalog size")
    seen = set()
    cleaned = []
    for row in rows:
        title = row.get("title", "").strip()
        url = urljoin(SOURCE, row.get("url", ""))
        cover = urljoin(SOURCE, row.get("cover", ""))
        alt = row.get("alt", "").strip() or (f"《{title}》封面")
        dest = urlparse(url)
        image = urlparse(cover)
        if not title or len(title) > 120 or len(alt) > 160:
            raise ValueError("Empty or excessively long book title")
        if dest.scheme != "https" or dest.hostname != "tomz.io" or not re.fullmatch(r"/books/[a-z0-9-]+/?", dest.path):
            raise ValueError("Invalid book destination: " + url)
        if image.scheme != "https" or image.hostname not in {"tomz.io", "assets.tomz.io"} or not re.search(r"\.(?:webp|png|jpe?g|svg)$", image.path, flags=re.I):
            raise ValueError("Invalid cover origin: " + cover)
        if url in seen:
            raise ValueError("Duplicate book in catalog: " + url)
        seen.add(url)
        cleaned.append({"title": title, "url": url, "cover": cover, "alt": alt})
    return cleaned


def scrape():
    output = subprocess.run(
        ["curl", "--fail", "--silent", "--show-error", "--location",
         "--max-time", "16", "--retry", "1", SOURCE],
        check=True, capture_output=True, timeout=38,
    )
    parser = BookListParser()
    parser.feed(output.stdout.decode("utf-8"))
    return validated(parser.books)


try:
    if MODE == "offline":
        raise RuntimeError("forced offline mode")
    books = scrape()
    status = "live"
    print(f"Book source: {len(books)} books from {SOURCE}")
except (OSError, ValueError, RuntimeError, UnicodeError, subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
    if MODE == "required":
        raise SystemExit(f"Required bookshelf unavailable: {exc}") from exc
    if not FALLBACK.is_file():
        raise SystemExit(f"Book source unavailable and no audited fallback: {exc}") from exc
    data = json.loads(FALLBACK.read_text(encoding="utf-8"))
    books = validated(data["books"])
    status = "snapshot"
    print(f"WARNING: bookshelf unavailable ({exc}); using {data['captured_on']} snapshot", flush=True)

if os.getenv("TOMZLAB_UPDATE_BOOK_SNAPSHOT") == "1":
    if status != "live":
        raise SystemExit("Do not overwrite verified book fallback from an offline build")
    FALLBACK.write_text(json.dumps({
        "source": SOURCE,
        "captured_on": datetime.now(timezone.utc).date().isoformat(),
        "books": books,
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated fallback from live source: {FALLBACK}")

payload = {
    "source": SOURCE,
    "status": status,
    "snapshotDate": None if status == "live" else json.loads(FALLBACK.read_text(encoding="utf-8"))["captured_on"],
    "books": books,
}
OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Generated {OUTPUT.relative_to(ROOT)} with {len(books)} official cover links")
