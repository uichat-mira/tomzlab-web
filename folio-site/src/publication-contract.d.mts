export interface PublishedItem {
  id: string;
  url: string;
  title: string;
  summary?: string;
  content_text?: string;
  date_published?: string;
  _tomzio: {
    kind: "article" | "issue";
    section: string;
    publishedPrecision?: string;
    publishedDate?: string;
    issue?: { number: number; url: string };
  };
}
export interface JsonFeed {
  version: string;
  home_page_url: string;
  feed_url: string;
  items: PublishedItem[];
}
export interface BookCatalog {
  schemaVersion: 1;
  source: "https://tomz.io/books/";
  books: Array<{
    id: string;
    title: string;
    description: string;
    url: string;
    cover: string | null;
    entryCount: number;
    entries: Array<{ title: string; url: string; position: number }>;
  }>;
}
export const PUBLISHER: "https://tomz.io/";
export function discover(value: unknown): { "json-feed": string; books: string };
export function validateFeed(value: unknown): JsonFeed;
export function validateBooks(value: unknown): BookCatalog;
export function publishedDate(item: PublishedItem): string | null;
export function selectNotes(feed: JsonFeed, count?: number): PublishedItem[];
export function selectIssues(feed: JsonFeed, count?: number): PublishedItem[];
