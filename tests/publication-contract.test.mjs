import test from "node:test";
import assert from "node:assert/strict";
import {
  PUBLISHER, discover, validateFeed, validateBooks, publishedDate, selectNotes, selectIssues,
} from "../assets/js/publication-contract.mjs";

function discovery() {
  return { schemaVersion: 1, publisher: PUBLISHER, resources: [
    { id: "rss", href: PUBLISHER + "rss.xml", format: "rss2", semantics: "activity" },
    { id: "json-feed", href: PUBLISHER + "feed.json", format: "jsonfeed1.1", semantics: "activity" },
    { id: "books", href: PUBLISHER + "books/catalog.json", format: "tomzio-book-catalog-v1", semantics: "state" },
  ]};
}
function item(title, path, kind, section, publishedDate, number) {
  return { id: PUBLISHER + path, url: PUBLISHER + path, title, content_text: title,
    _tomzio: { kind, section, publishedDate, publishedPrecision: "date",
      ...(number ? { issue: { number, url: PUBLISHER + path } } : {}) } };
}
function feed() {
  return { version: "https://jsonfeed.org/version/1.1", home_page_url: PUBLISHER,
    feed_url: PUBLISHER + "feed.json", items: [
      item("issue 010", "weekly/010/", "issue", "weekly", "2026-11-15", 10),
      item("child article", "weekly/010/child/", "article", "weekly", "2026-11-15"),
      item("blog B", "blogs/b/", "article", "blogs", "2026-11-19"),
      item("blog A", "blogs/a/", "article", "blogs", "2026-11-20"),
      item("issue 009", "weekly/009/", "issue", "weekly", "2026-11-09", 9),
  ]};
}
function catalog() {
  return { schemaVersion: 1, source: PUBLISHER + "books/", books: [
    { id: "agent", title: "一起学智能体", url: PUBLISHER + "books/agent",
      cover: PUBLISHER + "books/covers/agent.webp", entryCount: 2,
      entries: [
        { title: "前言", url: PUBLISHER + "books/agent/preface", position: 1 },
        { title: "正文", url: PUBLISHER + "blogs/agent-body", position: 2 },
      ] },
  ]};
}
test("discover publisher-owned resources and distinguish activity/state", () => {
  assert.deepEqual(discover(discovery()), {
    "json-feed": PUBLISHER + "feed.json", books: PUBLISHER + "books/catalog.json",
  });
  assert.throws(() => discover({ ...discovery(), schemaVersion: 2 }));
  const duplicate = discovery();
  duplicate.resources.push(duplicate.resources[1]);
  assert.throws(() => discover(duplicate), /Duplicate/);
  const untrusted = discovery();
  untrusted.resources[1].href = "https://bad.example/feed.json";
  assert.throws(() => discover(untrusted), /Untrusted/);
  const wrong = discovery();
  wrong.resources[2].semantics = "activity";
  assert.throws(() => discover(wrong), /books/);
});
test("select publisher kind and issue, never pathname heuristic", () => {
  const data = feed();
  assert.deepEqual(selectNotes(data).map(x => x.title), ["blog A", "blog B"]);
  assert.deepEqual(selectIssues(data).map(x => x.title), ["issue 010", "issue 009"]);
  assert.equal(publishedDate(data.items[0]), "2026-11-15");
  assert.equal(data.items[0].date_published, undefined);
  data.items[2].url = "https://tomz.io/weekly/012/";
  assert.throws(() => selectNotes(data), /identity/);
});
test("preserve date-only precision, never fabricate a timestamp", () => {
  const data = feed();
  delete data.items[0]._tomzio.publishedDate;
  assert.equal(publishedDate(data.items[0]), null);
  assert.equal(selectIssues(data)[0].date_published, undefined);
  data.items[0]._tomzio.publishedDate = "2026-02-30";
  assert.throws(() => validateFeed(data), /date/);
  data.items[0]._tomzio.publishedDate = "2026-11-15";
  data.items[0].date_published = "2026-11-15T00:00:00";
  assert.throws(() => validateFeed(data), /precise/);
});
test("reject duplicate identities, unknown version, unsafe URL and missing content", () => {
  let value = feed(); value.items.push(value.items[0]);
  assert.throws(() => validateFeed(value), /Duplicate/);
  value = feed(); value.version = "https://jsonfeed.org/version/2";
  assert.throws(() => validateFeed(value), /Unsupported/);
  value = feed(); value.items[1].url = "javascript:alert(1)";
  assert.throws(() => validateFeed(value), /Untrusted/);
  value = feed(); delete value.items[2].content_text;
  assert.throws(() => validateFeed(value), /Incomplete/);
  value = feed(); delete value.items[0]._tomzio.issue;
  assert.throws(() => validateFeed(value), /Issue requires/);
});
test("Book snapshot accepts logical Blog references while enforcing state contract", () => {
  assert.equal(validateBooks(catalog()).books[0].entries[1].position, 2);
  const badCount = catalog(); badCount.books[0].entryCount = 3;
  assert.throws(() => validateBooks(badCount), /chapter count/);
  const unsafeCover = catalog(); unsafeCover.books[0].cover = "data:image/svg+xml,evil";
  assert.throws(() => validateBooks(unsafeCover), /URL/);
  const badOrder = catalog(); badOrder.books[0].entries[0].position = 2;
  assert.throws(() => validateBooks(badOrder), /ordering/);
  const badVersion = catalog(); badVersion.schemaVersion = 2;
  assert.throws(() => validateBooks(badVersion), /Unsupported/);
});


test("valid empty collections are distinct from request failure", () => {
  const noItems = feed(); noItems.items = [];
  assert.deepEqual(selectNotes(noItems), []);
  assert.deepEqual(selectIssues(noItems), []);
  const noBooks = catalog(); noBooks.books = [];
  assert.deepEqual(validateBooks(noBooks).books, []);
});
