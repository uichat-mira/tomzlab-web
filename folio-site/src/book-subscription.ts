import fallback from "../snapshots/books-fallback.json";
import type { BookCatalog } from "./publication-contract.mjs";

/** SSR/no-JS fallback: a dated publisher snapshot, not current publication state. */
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
