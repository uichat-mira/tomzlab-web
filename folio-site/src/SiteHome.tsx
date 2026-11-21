import { Link } from "react-router-dom";
import { siteHomeCopy as copy } from "./site-content";
import { NotebookIllustration } from "./NotebookIllustration";
import { bookSnapshotDate, initialBookCatalog } from "./book-subscription";
import { validateBooks } from "./publication-contract.mjs";
import { usePublicationResource } from "./use-publication-resource";

/** Consumer-owned home body. Folio still owns Header, Footer, theme, routes and mobile navigation. */
export function SiteHome() {
  const { data: catalog, status: bookStatus } = usePublicationResource(
    "books", validateBooks, initialBookCatalog,
  );
  const splitAt = copy.lede.indexOf("。");
  const ledeFirst = copy.lede.slice(0, splitAt + 1);
  const ledeSecond = copy.lede.slice(splitAt + 1);
  return (
    <main className="site-home" id="main">
      <section className="site-home__hero" aria-labelledby="site-home-title">
        <div>
          <p className="site-home__kicker">{copy.kicker}</p>
          <h1 id="site-home-title">{copy.name}</h1>
          <p className="site-home__english" lang="en">{copy.english}</p>
          <p className="site-home__lede">{ledeFirst}<span>{ledeSecond}</span></p>
          <div className="site-home__actions">
            <Link className="site-home__primary" to="/notes">翻开记事本 <span aria-hidden="true">↗</span></Link>
            <Link className="site-home__about-link" to="/about">关于这里 <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <div className="site-home__notebook" aria-hidden="true">
          <NotebookIllustration />
        </div>
      </section>
      <section className="site-home__section" aria-labelledby="site-home-entries">
        <div className="site-home__section-heading">
          <h2 id="site-home-entries">从这里开始</h2>
          <span>INDEX</span>
        </div>
        <div className="site-home__entries">
          {copy.entries.map((entry) => (
            <Link className="site-home__entry" key={entry.id} to={entry.url}>
              <span className="site-home__entry-label">{entry.id}<b aria-hidden="true">↗</b></span>
              <h3>{entry.title}</h3>
              <p>{entry.description}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="site-home__books" aria-labelledby="site-home-books">
        <div className="site-home__books-heading">
          <div>
            <h2 id="site-home-books">书架</h2>
            <p>一些写成了书的内容，仍在 tomz.io 阅读。</p>
          </div>
          <a className="site-home__books-all" href={catalog.source} target="_blank" rel="noopener noreferrer">
            查看完整书架 <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="site-home__book-list" aria-label="来自 tomz.io 的书籍">
          {catalog.books.map((book) => (
            <a className="site-home__book" key={book.url} href={book.url} data-entry-count={book.entryCount} target="_blank" rel="noopener noreferrer">
              {book.cover ? <img src={book.cover} alt={`《${book.title}》封面`} loading="lazy" decoding="async" width="200" height="267" /> : null}
              <span>{book.title}</span>
            </a>
          ))}
        </div>
        {bookStatus !== "fresh" && (
          <p className="site-home__books-status">
            {bookStatus === "cached" ? "当前展示上次成功订阅的真实书目，联网后自动检查更新。" :
              bookStatus === "unavailable" ? `出版接口暂不可用，展示 ${bookSnapshotDate} 的书架快照。` :
              `书架索引快照：${bookSnapshotDate}。`}
          </p>
        )}
      </section>
      <section className="site-home__about" aria-labelledby="site-home-about">
        <span className="site-home__eyebrow">COLOPHON</span>
        <h2 id="site-home-about">{copy.aboutTitle}</h2>
        <p>{copy.aboutIntro}</p>
        <p>{copy.about}</p>
        <p>{copy.aboutSecond}</p>
      </section>
      <aside className="site-home__closing">
        <p>{copy.closing}</p><small>KEEP IT SIMPLE.</small>
      </aside>
    </main>
  );
}
