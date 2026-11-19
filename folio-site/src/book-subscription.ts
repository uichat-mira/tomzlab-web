import fallback from "../snapshots/books-fallback.json";

export type SubscribedBook = {
  id: string;
  title: string;
  description: string;
  url: string;
  cover: string | null;
  entryCount: number;
  entries: { title: string; url: string; position: number }[];
};

export type BookCatalog = {
  schemaVersion: 1;
  source: "https://tomz.io/books/";
  books: SubscribedBook[];
};

const publisher = "https://tomz.io";
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function publisherUrl(value: unknown, prefix: string): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.origin === publisher && url.pathname.startsWith(prefix)
      && !url.username && !url.password && !url.search && !url.hash;
  } catch {
    return false;
  }
}

function coverUrl(value: unknown): value is string | null {
  if (value === null) return true;
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && !url.username && !url.password;
  } catch {
    return false;
  }
}

/** Consumers validate remote protocol data before handing it to React. */
export function isBookCatalog(value: unknown): value is BookCatalog {
  if (!isRecord(value) || value.schemaVersion !== 1 || value.source !== "https://tomz.io/books/"
      || !Array.isArray(value.books) || value.books.length < 1 || value.books.length > 40) return false;
  const ids = new Set<string>();
  for (const book of value.books) {
    if (!isRecord(book) || typeof book.id !== "string"
        || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(book.id)
        || ids.has(book.id) || typeof book.title !== "string" || !book.title.trim()
        || book.title.length > 150 || typeof book.description !== "string"
        || !publisherUrl(book.url, "/books/" + book.id)
        || new URL(book.url).pathname.replace(/\/$/, "") !== "/books/" + book.id
        || !coverUrl(book.cover)
        || !Number.isInteger(book.entryCount) || (book.entryCount as number) < 0
        || !Array.isArray(book.entries) || book.entries.length !== book.entryCount
        || book.entries.length > 1000) return false;
    ids.add(book.id);
    const entries = new Set<string>();
    for (const [i, entry] of book.entries.entries()) {
      if (!isRecord(entry) || typeof entry.title !== "string" || !entry.title.trim()
          || !(publisherUrl(entry.url, "/books/" + book.id + "/")
            || publisherUrl(entry.url, "/blogs/"))
          || entry.position !== i + 1 || entries.has(entry.url)) return false;
      entries.add(entry.url);
    }
  }
  return true;
}

/** The tracked snapshot is for SSR/no-JS and network failure only. */
export const initialBookCatalog: BookCatalog = {
  schemaVersion: 1,
  source: "https://tomz.io/books/",
  books: fallback.books.map((book) => ({
    id: new URL(book.url).pathname.split("/")[2],
    title: book.title,
    description: "",
    url: book.url,
    cover: book.cover,
    entryCount: 0,
    entries: [],
  })),
};

export const bookSnapshotDate = fallback.captured_on;

/** A localhost override is used only by the isolated cross-origin integration POC. */
export const bookCatalogUrl = import.meta.env?.VITE_TOMZLAB_BOOK_CATALOG_URL
  || "https://tomz.io/books/catalog.json";
