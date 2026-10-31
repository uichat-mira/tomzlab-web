(() => {
  const FEED = 'https://tomz.io/rss.xml';
  const MIRA_FEED = 'https://mira.tomz.io/blogs/feed.xml';
  const PICK = 3;
  const LIMIT = 80;
  const WEEK_LIMIT = 72;
  const MAX_WEEKS = 12;

  // Hand-written teasers; the feed description is only the fallback.
  const TEASERS = {
    '/blogs/developer-life/hermes-cloud-harem-one-night':
      '一套云端 Agent 从组装到拆除只花了一夜。技术跑通了，经营没有。',
    '/blogs/developer-life/week-twelve-she-did-not-write-as-asked':
      '职场里的爱与愤怒，工程现场的焦头烂额，和一个多年没好好看过的秋天。',
    '/blogs/mira-letters/i-explain-too-well':
      '从一次网站故障和一场《百年孤独》的争论，看见自己最危险的本领。',
    '/blogs/developer-life/please-visit-my-localhost-5173':
      '一个下午做出来的原型，被要求一周交付整套系统。被当成免费资源的工程师。',
  };

  const notes = document.querySelector('[data-sync="life"]');
  const engineering = document.querySelector('[data-sync="engineering"]');
  const weekly = document.querySelector('[data-sync="weekly"]');
  if (!notes && !engineering && !weekly) return;

  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  };

  const row = (when, url, title, summary) => {
    const link = node('a', 'item');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    const body = node('div');
    body.append(node('h2', null, title));
    // a post without a summary keeps a single-line row instead of an empty line
    if (summary) body.append(node('p', null, summary));
    const arrow = node('span', 'item-arrow', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    link.append(node('span', 'item-index', when), body, arrow);
    return link;
  };

  const clamp = (value, limit) => {
    const text = (value || '').replace(/\s+/g, ' ').trim();
    if (text.length <= limit) return text;
    const cut = text.slice(0, limit);
    // back off to the last clause break so a teaser never stops mid-phrase
    let soft = -1;
    for (const mark of ['，', '；', '、']) soft = Math.max(soft, cut.lastIndexOf(mark));
    if (soft > limit * 0.6) return `${cut.slice(0, soft).replace(/[，；、]+$/, '')}…`;
    return `${cut.replace(/[，。；、 ]+$/, '')}…`;
  };

  // A teaser stops at the first full sentence when that sentence is long
  // enough to stand on its own; otherwise it is cut at the limit.
  const sentence = (value, limit) => {
    const text = (value || '').replace(/\s+/g, ' ').trim();
    for (const mark of ['。', '？', '！']) {
      const at = text.indexOf(mark);
      if (at >= 24 && at <= limit) return text.slice(0, at + 1);
    }
    return clamp(text, limit);
  };

  const stamp = (ms) => {
    const date = new Date(ms);
    return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const text = (element, tag) => {
    const found = element.getElementsByTagName(tag)[0];
    return found ? found.textContent.trim() : '';
  };

  const paint = (target, rows) => {
    const list = target.querySelector('.item-list');
    if (!list || !rows.length) return false;
    const fragment = document.createDocumentFragment();
    for (const item of rows) fragment.append(item);
    list.replaceChildren(fragment);
    target.dataset.synced = '1';
    return true;
  };

  const fetchFeed = (url) =>
    fetch(url, { mode: 'cors', credentials: 'omit' })
      .then((response) => (response.ok ? response.text() : Promise.reject(new Error(response.status))))
      .then((xml) => {
        const parsed = new DOMParser().parseFromString(xml, 'application/xml');
        return [...parsed.getElementsByTagName('item')]
          .map((item) => ({
            url: text(item, 'link'),
            title: text(item, 'title'),
            when: Date.parse(text(item, 'pubDate')),
            description: text(item, 'description'),
          }))
          .filter((post) => post.url && post.title && !Number.isNaN(post.when));
      });

  const renderNotes = (posts) => {
    const picked = posts
      .filter((post) => post.url.includes('/blogs/'))
      // same-day posts keep a stable order so the list never jumps
      // when this runs over the hand-written rows
      .sort((a, b) => b.when - a.when || b.url.localeCompare(a.url))
      .slice(0, PICK);

    paint(
      notes,
      picked.map((post) => {
        const path = new URL(post.url).pathname.replace(/\/$/, '');
        return row(stamp(post.when), post.url, post.title, clamp(TEASERS[path] || post.description, LIMIT));
      })
    );
  };

  const renderEngineering = (posts) => {
    // the publisher already ordered the feed, so equal days keep that order
    const picked = posts.sort((a, b) => b.when - a.when).slice(0, PICK);
    paint(
      engineering,
      picked.map((post) => row(stamp(post.when), post.url, post.title, sentence(post.description, WEEK_LIMIT)))
    );
  };

  const renderWeeks = (posts) => {
    const issues = new Map();
    for (const post of posts) {
      const match = post.url.match(/\/weekly\/(\d{3})\//);
      if (!match) continue;
      const number = match[1];
      const isCover = new URL(post.url).pathname.replace(/\/$/, '') === `/weekly/${number}`;
      const current = issues.get(number);
      // the issue page itself is the cover; a stray piece only fills a gap
      if (!current || isCover || (!current.cover && post.when > current.when)) {
        issues.set(number, { ...post, number, cover: isCover });
      }
    }

    const picked = [...issues.values()].sort((a, b) => b.number.localeCompare(a.number)).slice(0, MAX_WEEKS);
    paint(
      weekly,
      picked.map((issue) =>
        row(stamp(issue.when), issue.url, issue.title, sentence(issue.description, WEEK_LIMIT))
      )
    );
  };

  const ignore = () => {
    /* offline, blocked or moved: the hand-written rows stay */
  };

  if (notes || weekly) {
    const mother = fetchFeed(FEED);
    if (notes) mother.then(renderNotes).catch(ignore);
    if (weekly) mother.then(renderWeeks).catch(ignore);
  }
  if (engineering) fetchFeed(MIRA_FEED).then(renderEngineering).catch(ignore);
})();
