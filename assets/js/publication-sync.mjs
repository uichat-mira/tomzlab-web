import {
  PUBLISHER, discover, validateFeed, validateBooks,
  selectNotes, selectIssues, publishedDate,
} from "./publication-contract.mjs";

const life = document.querySelector('[data-sync="life"]');
const weekly = document.querySelector('[data-sync="weekly"]');
const bookshelf = document.querySelector('[data-sync="books"]');
if (life || weekly || bookshelf) {
  const MAX_BYTES = 700_000;
  const CACHE_TTL = 15 * 60_000;
  const KEY = "tomzlab-publication-v1:";
  const status = (target, label) => {
    const place = target?.querySelector("[data-source-status]");
    if (place) place.textContent = label;
  };
  const dateLabel = (item) => {
    const date = publishedDate(item);
    return date ? date.slice(5).replace("-", ".") : "—";
  };
  const summary = (item) =>
    String(item.summary || item.content_text || "")
      .replace(/\s+/g, " ").trim().slice(0, 95);
  const element = (tag, cls, value) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (value != null) node.textContent = String(value);
    return node;
  };
  const articleRow = (item) => {
    const link = element("a", "item");
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    const body = element("div");
    body.append(element("h2", null, item.title));
    if (summary(item)) body.append(element("p", null, summary(item)));
    const arrow = element("span", "item-arrow", "↗");
    arrow.setAttribute("aria-hidden", "true");
    link.append(element("span", "item-index", dateLabel(item)), body, arrow);
    return link;
  };
  function replace(target, items, build) {
    const list = target?.querySelector(".item-list");
    if (!list) return false;
    const fragment = document.createDocumentFragment();
    if (!items.length) {
      fragment.append(element("p", "source-status", "当前更新流没有近期条目，请到原站查看完整归档。"));
    } else items.forEach(item => fragment.append(build(item)));
    list.replaceChildren(fragment);
    return true;
  }
  const renderFeed = (feed, age) => {
    if (life && replace(life, selectNotes(feed, 3), articleRow)) status(life, age);
    if (weekly && replace(weekly, selectIssues(feed, 12), articleRow)) status(weekly, age);
  };
  const renderBooks = (catalog, age) => {
    if (!bookshelf) return;
    const list = bookshelf.querySelector("[data-book-list]");
    if (!list) return;
    const fragment = document.createDocumentFragment();
    if (!catalog.books.length) {
      fragment.append(element("p", "source-status", "当前目录没有公开书目；完整内容请访问母站。"));
    }
    for (const book of catalog.books) {
      const link = element("a", "book-entry");
      link.href = book.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      if (book.cover) {
        const cover = element("img", "book-cover");
        cover.src = book.cover;
        cover.alt = book.title + "封面";
        cover.loading = "lazy";
        link.append(cover);
      }
      link.append(element("span", "book-title", book.title),
                  element("span", "book-meta", book.entryCount + " 篇"));
      fragment.append(link);
    }
    list.replaceChildren(fragment);
    status(bookshelf, age);
  };
  const cache = (kind, validate) => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY + kind));
      if (!saved || !Number.isFinite(saved.capturedAt) || saved.capturedAt > Date.now()) return null;
      return { data: validate(saved.data), capturedAt: saved.capturedAt };
    } catch { return null; }
  };
  const store = (kind, data) => {
    try { localStorage.setItem(KEY + kind, JSON.stringify({ data, capturedAt: Date.now() })); }
    catch { /* Storage may be unavailable; current verified response still renders. */ }
  };
  async function getJson(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);
    try {
      const response = await fetch(url, { credentials: "omit", mode: "cors", signal: controller.signal });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const size = Number(response.headers.get("content-length") || 0);
      if (size > MAX_BYTES) throw new Error("Publication payload too large");
      const raw = await response.text();
      if (raw.length > MAX_BYTES) throw new Error("Publication payload too large");
      return JSON.parse(raw);
    } finally { clearTimeout(timer); }
  }
  async function load(kind, endpoint, validate, render) {
    const saved = cache(kind, validate);
    if (saved) render(saved.data, "上次成功同步：" + new Date(saved.capturedAt).toLocaleDateString("zh-CN"));
    const current = !saved || Date.now() - saved.capturedAt >= CACHE_TTL;
    if (!current) return;
    try {
      const data = validate(await getJson(endpoint));
      render(data, "已从 tomz.io 同步");
      store(kind, data);
    } catch {
      // Stale verified data stays visible; otherwise the dated HTML fallback remains.
      const fallback = saved ? "同步失败 · 保留上次成功数据" : "连接失败 · 保留页面内的静态内容";
      if (kind === "feed") {
        status(life, fallback);
        status(weekly, fallback);
      } else status(bookshelf, fallback);
    }
  }
  const localFeed = cache("feed", validateFeed);
  const localBooks = cache("books", validateBooks);
  if (localFeed) renderFeed(localFeed.data, "上次成功同步：" + new Date(localFeed.capturedAt).toLocaleDateString("zh-CN"));
  if (localBooks) renderBooks(localBooks.data, "上次成功同步：" + new Date(localBooks.capturedAt).toLocaleDateString("zh-CN"));
  getJson(PUBLISHER + "feeds.json")
    .then(discover)
    .then(endpoints => Promise.all([
      life || weekly ? load("feed", endpoints["json-feed"], validateFeed, renderFeed) : undefined,
      bookshelf ? load("books", endpoints.books, validateBooks, renderBooks) : undefined,
    ]))
    .catch(() => {
      const message = "发现入口不可用 · " + (localFeed || localBooks ? "保留已验证的数据" : "保留页面静态内容");
      status(life, message);
      status(weekly, message);
      status(bookshelf, message);
    });
}
