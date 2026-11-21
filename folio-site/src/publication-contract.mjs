// PUB-03: consumer-side validation only; Tomz.io owns publication facts.
export const PUBLISHER = "https://tomz.io/";
const ENDPOINTS = {
  "json-feed": ["feed.json", "jsonfeed1.1", "activity"],
  books: ["books/catalog.json", "tomzio-book-catalog-v1", "state"],
};

function record(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function url(value, origins = ["https://tomz.io"]) {
  if (typeof value !== "string") throw new Error("Missing resource URL");
  const parsed = new URL(value);
  if (parsed.protocol !== "https:" || !origins.includes(parsed.origin) ||
      parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error("Untrusted publication URL");
  }
  return parsed.href;
}
function text(value) {
  if (typeof value !== "string" || !value.trim()) throw new Error("Missing published text");
  return value.trim();
}
function day(value) {
  if (value == null) return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      new Date(value + "T00:00:00Z").toISOString().slice(0, 10) !== value) {
    throw new Error("Invalid publication date");
  }
  return value;
}
export function discover(manifest) {
  if (!record(manifest) || manifest.schemaVersion !== 1 ||
      manifest.publisher !== PUBLISHER || !Array.isArray(manifest.resources)) {
    throw new Error("Unsupported publication discovery contract");
  }
  const entries = new Map();
  for (const item of manifest.resources) {
    if (!record(item) || typeof item.id !== "string" || entries.has(item.id)) {
      throw new Error("Duplicate or malformed discovery entry");
    }
    entries.set(item.id, item);
  }
  const result = {};
  for (const [id, [path, format, semantics]] of Object.entries(ENDPOINTS)) {
    const item = entries.get(id);
    if (!item || item.format !== format || item.semantics !== semantics ||
        url(item.href) !== new URL(path, PUBLISHER).href) {
      throw new Error("Missing or unexpected " + id + " publication endpoint");
    }
    result[id] = item.href;
  }
  return result;
}
export function validateFeed(feed) {
  if (!record(feed) || feed.version !== "https://jsonfeed.org/version/1.1" ||
      feed.home_page_url !== PUBLISHER || feed.feed_url !== PUBLISHER + "feed.json" ||
      !Array.isArray(feed.items) || feed.items.length > 500) {
    throw new Error("Unsupported JSON Feed");
  }
  const ids = new Set();
  for (const item of feed.items) {
    if (!record(item) || url(item.url) !== item.id || ids.has(item.id)) {
      throw new Error("Duplicate or unsafe publication identity");
    }
    ids.add(item.id);
    text(item.title);
    if (item.image != null) {
      url(item.image, ["https://tomz.io", "https://assets.tomz.io"]);
    }
    if (!record(item._tomzio) || !["article", "issue"].includes(item._tomzio.kind) ||
        typeof item._tomzio.section !== "string" ||
        (typeof item.content_text !== "string" && typeof item.content_html !== "string")) {
      throw new Error("Incomplete published article");
    }
    if (item._tomzio.publishedDate != null) day(item._tomzio.publishedDate);
    if (item.date_published != null &&
        (typeof item.date_published !== "string" ||
        !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(item.date_published))) {
      throw new Error("Invalid precise publication date");
    }
    if (item._tomzio.kind === "issue" &&
        (!Number.isInteger(item._tomzio.issue?.number) || item._tomzio.issue.number < 1 ||
        url(item._tomzio.issue.url) !== item.url)) {
      throw new Error("Issue requires publisher-supplied identity");
    }
  }
  return feed;
}
export function validateBooks(catalog) {
  if (!record(catalog) || catalog.schemaVersion !== 1 ||
      catalog.source !== PUBLISHER + "books/" ||
      !Array.isArray(catalog.books) || catalog.books.length > 100) {
    throw new Error("Unsupported Book Catalog");
  }
  const ids = new Set();
  for (const book of catalog.books) {
    if (!record(book) || typeof book.id !== "string" || !/^[a-z0-9-]+$/.test(book.id) ||
        ids.has(book.id) || url(book.url) !== PUBLISHER + "books/" + book.id ||
        !Array.isArray(book.entries) || book.entries.length > 5000 ||
        !Number.isInteger(book.entryCount) || book.entries.length !== book.entryCount) {
      throw new Error("Invalid book identity or chapter count");
    }
    ids.add(book.id);
    text(book.title);
    if (book.cover != null) url(book.cover, ["https://tomz.io", "https://assets.tomz.io"]);
    const urls = new Set();
    for (const [i, entry] of book.entries.entries()) {
      if (!record(entry) || entry.position !== i + 1 || urls.has(entry.url)) {
        throw new Error("Invalid Book Catalog ordering");
      }
      text(entry.title);
      url(entry.url);
      urls.add(entry.url);
    }
  }
  return catalog;
}
export function publishedDate(item) {
  const raw = item._tomzio?.publishedDate || item.date_published?.slice(0, 10);
  return raw ? day(raw) : null;
}
export function selectNotes(feed, count = 3) {
  return validateFeed(feed).items
    .filter(item => item._tomzio.kind === "article" && item._tomzio.section === "blogs")
    .sort((a, b) => (publishedDate(b) || "").localeCompare(publishedDate(a) || "") ||
      a.id.localeCompare(b.id)).slice(0, count);
}
export function selectIssues(feed, count = 12) {
  return validateFeed(feed).items
    .filter(item => item._tomzio.kind === "issue" && item._tomzio.section === "weekly")
    .sort((a, b) => b._tomzio.issue.number - a._tomzio.issue.number).slice(0, count);
}
