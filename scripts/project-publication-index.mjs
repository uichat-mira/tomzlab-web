import { execFileSync } from "node:child_process";
import { discover, validateFeed, selectNotes, selectIssues, publishedDate, PUBLISHER } from "../folio-site/src/publication-contract.mjs";

// Build-time projection uses exactly the browser's publisher contract, not RSS URL guesses.
function jsonFromPublisher(endpoint) {
  const response = execFileSync("curl", [
    "--fail", "--silent", "--show-error", "--location", "--max-time", "16",
    endpoint,
  ], { encoding: "utf8", timeout: 22000, maxBuffer: 2_000_000 });
  return JSON.parse(response);
}
const endpoints = discover(jsonFromPublisher(PUBLISHER + "feeds.json"));
const feed = validateFeed(jsonFromPublisher(endpoints["json-feed"]));
const project = (item) => ({
  title: item.title,
  url: item.url,
  ...(publishedDate(item) ? { date: publishedDate(item) } : {}),
  description: String(item.summary || item.content_text || "").replace(/\s+/g, " ").trim().slice(0, 120),
});
const life = selectNotes(feed, 12).map(project);
const weekly = selectIssues(feed, 12).map(project);
if (!life.length || !weekly.length) throw new Error("Publisher did not provide verified blog posts and issues");
process.stdout.write(JSON.stringify({ life, weekly }));
