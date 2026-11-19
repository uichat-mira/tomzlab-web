#!/usr/bin/env python3
"""Create Folio-native index pages from the original publishers' RSS feeds.

This is a build-time DATA adapter, not a second page renderer. Folio owns
parsing, React routing, Markdown, SEO, site shell, and static HTML.
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
    "life": ("https://tomz.io/rss.xml", "tomz.io"),
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
    return result[:3]

def select_weekly(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    covers: dict[str, dict[str, str]] = {}
    for row in rows:
        path = urllib.parse.urlparse(row["url"]).path
        match = re.fullmatch(r"/weekly/(\d{3})/?", path)
        if match:
            covers[match.group(1)] = row
    return [covers[k] for k in sorted(covers, reverse=True)[:12]]

def md_text(value: str) -> str:
    return re.sub(r"([\\\[\]])", r"\\\1", value).replace("<", "&lt;").replace(">", "&gt;")

def listing(rows: list[dict[str, str]], host: str) -> str:
    if not rows:
        return "暂无已验证的订阅源内容。请前往 [原站](https://" + host + "/) 浏览。\n"
    lines: list[str] = []
    for row in rows:
        url = row["url"].replace(")", "%29")
        lines.append(f"### [{md_text(row['title'])}]({url})")
        lines.append("")
        lines.append(f"_{row['date']}_")
        lines.append("")
        if row.get("description"):
            lines.append(md_text(row["description"]))
            lines.append("")
    return "\n".join(lines).rstrip() + "\n"

def write_index(name: str, body: str) -> None:
    dest = CONTENT / name / "index.md"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(body, encoding="utf-8")

with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    futures = {name: pool.submit(load_feed, name) for name in SOURCES}
    feed = {name: future.result() for name, future in futures.items()}

mother, mother_reason = feed["life"]
mira, mira_reason = feed["engineering"]
life_rows = select_notes(mother, "tomz.io") if mother is not None else SNAPSHOT["life"]
engineering_rows = select_notes(mira, "mira.tomz.io") if mira is not None else SNAPSHOT["engineering"]
weekly_rows = select_weekly(mother) if mother is not None else SNAPSHOT["weekly"]
if not life_rows or not engineering_rows or not weekly_rows:
    raise SystemExit("No verified source entries for Folio index")

life_status = "根据母站 RSS 于构建时更新。" if mother is not None else "订阅源不可用；以下为 2026 年 10 月生产站保存的离线快照，并非最新列表。"
mira_status = "根据工程站 RSS 于构建时更新。" if mira is not None else "订阅源不可用；以下为 2026 年 10 月生产站保存的离线快照，并非最新列表。"
weekly_status = "根据母站 RSS 于构建时更新。" if mother is not None else "订阅源不可用；以下为 2026 年 10 月生产站保存的离线快照，并非最新期数。"

write_index("notes", """---
title: 记录
description: 一些读过的、经历过的、想过的事。正文仍在原站。
type: page
path: /notes
status: published
---

一些读过的、经历过的、想过的事。通勤、楼梯间、床上，想到就记下来。下面分两组，各取几篇；正文都在原站。

## 生活与长文

""" + life_status + "\n\n" + listing(life_rows, "tomz.io") + """
[浏览母站全部文章](https://tomz.io/blogs/)

## 工程与产品

""" + mira_status + "\n\n" + listing(engineering_rows, "mira.tomz.io") + """
[浏览 Mira 工程文章](https://mira.tomz.io/blogs/)

---

这一页是索引，不是副本。文章、配图与评论仍在原站，不会在这里复制全文。
""")

write_index("weekly", """---
title: 见π 周刊
description: 每周一期的编辑桌，正文、配图和目录在 tomz.io。
type: page
path: /weekly
status: published
---

每周一期的编辑桌：本周值得知道的事、人的现场、工程与阅读，还有一些没想透的问题。

""" + weekly_status + "\n\n" + listing(weekly_rows, "tomz.io") + """
每期封面有一个主题，旁边是几篇当周写下的短文；正文、配图和目录都在母站。

[浏览全部期数](https://tomz.io/weekly/)
""")

print("Folio native pages: notes life=", len(life_rows),
      "engineering=", len(engineering_rows),
      "weekly=", len(weekly_rows),
      "RSS states:", mother_reason, "/", mira_reason)
