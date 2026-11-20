#!/usr/bin/env python3
"""Project original publishers' RSS and local projects into FolioListEntry data.

Folio owns rendering, React routes and SEO. No duplicate Markdown list markup.
"""
from __future__ import annotations

import concurrent.futures
import datetime as dt
import email.utils
import html
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import urllib.parse
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "folio-site" / "content"
SNAPSHOT = json.loads((ROOT / "folio-site" / "snapshots" / "feed-fallback.json").read_text(encoding="utf-8"))
SOURCES = {
    "engineering": ("https://mira.tomz.io/blogs/feed.xml", "mira.tomz.io"),
}
MODE = os.getenv("TOMZLAB_FEED_MODE", "auto").lower()
if MODE not in {"auto", "offline", "required"}:
    raise SystemExit("TOMZLAB_FEED_MODE must be auto, offline, or required")

def plain(value: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]*>", " ", value or ""))).strip()

def short(value: str, limit: int = 120) -> str:
    value = plain(value)
    return value if len(value) <= limit else value[:limit].rstrip(" ，、；。") + "…"

def valid_url(url: str, host: str) -> bool:
    try:
        parsed = urllib.parse.urlparse(url)
        return parsed.scheme == "https" and parsed.hostname == host and bool(parsed.path)
    except ValueError:
        return False

def parse_feed(xml_bytes: bytes, host: str) -> list[dict[str, str]]:
    root = ET.fromstring(xml_bytes)
    rows = []
    seen = set()
    for item in root.findall(".//item"):
        url = plain(item.findtext("link") or "")
        title = plain(item.findtext("title") or "")
        if not title or not valid_url(url, host) or url in seen:
            continue
        raw_date = plain(item.findtext("pubDate") or "")
        try:
            when = email.utils.parsedate_to_datetime(raw_date)
            if when.tzinfo is None:
                continue
            date = when.astimezone(dt.timezone.utc).date().isoformat()
        except (TypeError, ValueError, OverflowError):
            continue
        seen.add(url)
        rows.append({
            "title": title,
            "url": url,
            "date": date,
            "description": short(item.findtext("description") or ""),
        })
    return sorted(rows, key=lambda x: (x["date"], x["url"]), reverse=True)

def load_feed(source: str) -> tuple[list[dict[str, str]] | None, str]:
    url, host = SOURCES[source]
    if MODE == "offline":
        return None, "offline mode"
    try:
        proc = subprocess.run(
            ["curl", "--fail", "--silent", "--show-error", "--location",
             "--max-time", "16", "--retry", "1", url],
            capture_output=True, check=True, timeout=35,
        )
        rows = parse_feed(proc.stdout, host)
        if not rows:
            raise ValueError("RSS contained no valid dated entries")
        return rows, f"live RSS ({len(rows)} valid items)"
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired,
            OSError, ET.ParseError, ValueError) as exc:
        if MODE == "required":
            raise RuntimeError(f"Required RSS unavailable: {url}: {exc}") from exc
        print(f"WARNING: {url} unavailable ({exc}); using explicitly labeled production snapshot", file=sys.stderr)
        return None, str(exc)

def select_notes(rows: list[dict[str, str]], host: str) -> list[dict[str, str]]:
    result = [row for row in rows
              if urllib.parse.urlparse(row["url"]).path.startswith("/blogs/")]
    return result[:12]

def load_publication() -> tuple[dict[str, list[dict[str, str]]] | None, str]:
    """The publisher's JSON Feed + discovery are validated by the shared JS contract."""
    if MODE == "offline":
        return None, "offline mode"
    try:
        proc = subprocess.run(
            ["node", str(ROOT / "scripts" / "project-publication-index.mjs")],
            capture_output=True, text=True, check=True, timeout=45, cwd=ROOT,
        )
        data = json.loads(proc.stdout)
        if not all(isinstance(data.get(key), list) and data[key] for key in ("life", "weekly")):
            raise ValueError("Publisher returned no verified blog/issues")
        return data, "live JSON Feed /feeds.json"
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired,
            json.JSONDecodeError, OSError, ValueError) as exc:
        if MODE == "required":
            raise RuntimeError("Required JSON publication unavailable: " + str(exc)) from exc
        print("WARNING: Tomz.io JSON Feed unavailable; retaining dated snapshot: " + str(exc), file=sys.stderr)
        return None, str(exc)


# Public list entries are data, never a second HTML or Markdown renderer.
# Retain lightweight Folio type:page documents for route metadata/SEO;
# the same FolioListPage component renders their interactive and static bodies.

def write_index(name: str, title: str, description: str) -> None:
    dest = CONTENT / name / "index.md"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(
        "---\n" + "title: " + title + "\n" + "description: " + description +
        "\ntype: page\npath: /" + name +
        "\nstatus: published\n---\n\n列表由 FolioListPage 从结构化源数据渲染。\n",
        encoding="utf-8",
    )


def projects_from_source() -> list[dict[str, str]]:
    """Original production project Markdown remains the *only* authored source."""
    source = (CONTENT / "projects.md").read_text(encoding="utf-8")
    sections = re.findall(
        r"(?m)^### \[([^\]\n]+)\]\((https://[^)]+)\)\s*\n\s*\n([^\n]+)",
        source,
    )
    if len(sections) != 4:
        raise RuntimeError("Project list source changed: expected 4 verified Markdown records")
    seen = set()
    results = []
    for title, url, description in sections:
        host = urllib.parse.urlparse(url).hostname
        if not valid_url(url, host or "") or host not in {"mira.tomz.io", "tomz.io"} or url in seen:
            raise RuntimeError("Untrusted/duplicate project URL: " + url)
        seen.add(url)
        results.append({
            "title": plain(title), "url": url,
            "description": plain(description), "category": "个人项目",
            "meta": host,
        })
    return results


with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    future_mira = pool.submit(load_feed, "engineering")
    future_publication = pool.submit(load_publication)
    mira, mira_reason = future_mira.result()
    publication, mother_reason = future_publication.result()

life_rows = publication["life"] if publication is not None else SNAPSHOT["life"]
weekly_rows = publication["weekly"] if publication is not None else SNAPSHOT["weekly"]
engineering_rows = select_notes(mira, "mira.tomz.io") if mira is not None else SNAPSHOT["engineering"]
if not life_rows or not engineering_rows or not weekly_rows:
    raise SystemExit("No verified source entries for Folio list pages")


def project_feed(rows: list[dict[str, str]], category: str, host: str, fresh: bool) -> list[dict[str, str]]:
    return [{
        "title": row["title"], "url": row["url"],
        "description": row.get("description", ""),
        **({"date": row["date"]} if row.get("date") else {}),
        "category": category, "meta": host,
    } for row in rows]


sources = {
    "life": {"entries": project_feed(life_rows, "生活与长文", "tomz.io", publication is not None), "live": publication is not None},
    "engineering": {"entries": project_feed(engineering_rows, "工程与产品", "mira.tomz.io", mira is not None), "live": mira is not None},
    "weekly": {"entries": project_feed(weekly_rows, "见π 周刊", "tomz.io", publication is not None), "live": publication is not None},
    "projects": {"entries": projects_from_source(), "live": True},
}

out = ROOT / "folio-site" / "src" / "lists.generated.json"
out.write_text(json.dumps({
    "snapshotDate": "2026-10", "sources": sources,
}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
write_index("notes", "记录", "一些读过的、经历过的、想过的事。正文仍在原站。")
write_index("weekly", "见π 周刊", "每周一期的编辑桌，正文、配图和目录在 tomz.io。")
print("Folio native list data:", ", ".join(f"{key}={len(value['entries'])} ({'live' if value['live'] else '2026-10 snapshot'})" for key,value in sources.items()),
      "Source states:", mother_reason, "/", mira_reason)
