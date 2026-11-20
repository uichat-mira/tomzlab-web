(() => {
  // Mira engineering articles have a separate publisher and keep their RSS contract.
  const target = document.querySelector('[data-sync="engineering"]');
  if (!target) return;

  const feedUrl = 'https://mira.tomz.io/blogs/feed.xml';
  const summaryLimit = 72;
  const dateLabel = (timestamp) => {
    const d = new Date(timestamp);
    return String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0');
  };
  const value = (item, tag) => item.getElementsByTagName(tag)[0]?.textContent?.trim() || '';
  const node = (tag, cls, text) => {
    const result = document.createElement(tag);
    if (cls) result.className = cls;
    if (text != null) result.textContent = text;
    return result;
  };
  const validUrl = (input) => {
    try {
      const parsed = new URL(input);
      return parsed.protocol === 'https:' && parsed.origin === 'https://mira.tomz.io';
    } catch { return false; }
  };
  fetch(feedUrl, { mode: 'cors', credentials: 'omit' })
    .then(response => {
      if (!response.ok) throw new Error('Mira RSS HTTP ' + response.status);
      return response.text();
    })
    .then(xml => {
      const parsed = new DOMParser().parseFromString(xml, 'application/xml');
      if (parsed.querySelector('parsererror')) throw new Error('Invalid Mira RSS');
      const entries = [...parsed.getElementsByTagName('item')].map(item => ({
        title: value(item, 'title'),
        url: value(item, 'link'),
        description: value(item, 'description'),
        time: Date.parse(value(item, 'pubDate')),
      })).filter(item => item.title && validUrl(item.url) && Number.isFinite(item.time))
        .sort((a, b) => b.time - a.time).slice(0, 3);
      if (!entries.length) return;
      const list = target.querySelector('.item-list');
      if (!list) return;
      const fragment = document.createDocumentFragment();
      for (const item of entries) {
        const link = node('a', 'item');
        link.href = item.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        const body = node('div');
        body.append(node('h2', null, item.title));
        if (item.description) body.append(node('p', null, item.description.replace(/\s+/g, ' ').slice(0, summaryLimit)));
        const arrow = node('span', 'item-arrow', '↗');
        arrow.setAttribute('aria-hidden', 'true');
        link.append(node('span', 'item-index', dateLabel(item.time)), body, arrow);
        fragment.append(link);
      }
      list.replaceChildren(fragment);
    }).catch(() => { /* Existing static Mira entries are the offline fallback. */ });
})();
