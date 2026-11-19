import { siteHomeCopy as copy } from "./site-content";

/** Consumer-owned home body. Folio still owns Header, Footer, theme, routes and mobile navigation. */
export function SiteHome({ basePath = "/" }: { basePath?: string }) {
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
            <a className="site-home__primary" href={basePath + "notes.html"}>翻开记事本 <span aria-hidden="true">↗</span></a>
            <a className="site-home__about-link" href={basePath + "about.html"}>关于这里 <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <div className="site-home__notebook" aria-hidden="true">
          <div className="site-home__paper">
            <span>TOMZLAB.CN <span>2026</span></span>
            <i/><i/><i/>
            <small>NOTES / 001</small>
          </div>
        </div>
      </section>
      <section className="site-home__section" aria-labelledby="site-home-entries">
        <div className="site-home__section-heading">
          <div><span>INDEX</span><h2 id="site-home-entries">从这里开始</h2></div>
        </div>
        <div className="site-home__entries">
          {copy.entries.map((entry) => (
            <a className="site-home__entry" key={entry.id} href={basePath + entry.url}>
              <span className="site-home__entry-label">{entry.id}<b aria-hidden="true">↗</b></span>
              <h3>{entry.title}</h3>
              <p>{entry.description}</p>
              <span className="site-home__entry-action">{entry.action} →</span>
            </a>
          ))}
        </div>
        <a className="site-home__weekly" href={basePath + "weekly.html"}>
          <strong>{copy.weekly}</strong><span>{copy.weeklyDescription}</span>
          <span>前往周刊 ↗</span>
        </a>
      </section>
      <section className="site-home__about" aria-labelledby="site-home-about">
        <span className="site-home__eyebrow">COLOPHON</span>
        <h2 id="site-home-about">{copy.aboutTitle}</h2>
        <p>{copy.about}</p>
        <p>{copy.aboutSecond}</p>
      </section>
      <aside className="site-home__closing">
        <p>{copy.closing}</p><small>KEEP IT SIMPLE.</small>
      </aside>
    </main>
  );
}
