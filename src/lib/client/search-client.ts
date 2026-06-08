type SearchItem = {
  title: string;
  href: string;
  description: string;
  type: string;
  meta?: string;
  terms?: string[];
};

const normalize = (value: string) => value.trim().toLowerCase();

const includesQuery = (item: SearchItem, query: string) => {
  const haystack = [item.title, item.description, item.type, item.meta ?? '', ...(item.terms ?? [])]
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
};

const renderResult = (item: SearchItem) => {
  const article = document.createElement('article');
  article.className = 'surface-card rounded-lg p-5 transition hover:border-site-border-strong';

  const link = document.createElement('a');
  link.href = item.href;
  link.className = 'focus-ring block rounded-md';
  link.setAttribute('aria-label', `${item.title} (${item.type})`);

  const type = document.createElement('p');
  type.className = 'text-xs font-medium uppercase tracking-[0.18em] text-site-accent';
  type.textContent = item.type;

  const title = document.createElement('h3');
  title.className = 'mt-3 text-xl font-semibold tracking-[-0.03em] text-site';
  title.textContent = item.title;

  const description = document.createElement('p');
  description.className = 'mt-2 text-sm leading-7 text-site-muted';
  description.textContent = item.description;

  link.append(type, title, description);

  if (item.meta) {
    const meta = document.createElement('p');
    meta.className = 'mt-4 text-xs text-site-subtle';
    meta.textContent = item.meta;
    link.append(meta);
  }

  article.append(link);
  return article;
};

export function setupSearchClient(rootSelector = '[data-search-root]') {
  const roots = document.querySelectorAll<HTMLElement>(rootSelector);

  roots.forEach((root) => {
    const input = root.querySelector<HTMLInputElement>('[data-search-input]');
    const results = root.querySelector<HTMLElement>('[data-search-results]');
    const summary = root.querySelector<HTMLElement>('[data-search-summary]');
    const empty = root.querySelector<HTMLElement>('[data-search-empty]');
    const payload = root.dataset.searchItems;
    const locale = root.dataset.searchLocale ?? 'en';
    const searchableLabel = root.dataset.searchSearchable ?? 'searchable entries';
    const resultLabel = root.dataset.searchResult ?? 'result';
    const resultsLabel = root.dataset.searchResults ?? 'results';
    const forQueryLabel = root.dataset.searchForQuery ?? 'for';

    if (!input || !results || !summary || !payload) return;

    const items = JSON.parse(payload) as SearchItem[];

    const render = () => {
      const query = normalize(input.value);
      const filtered = query ? items.filter((item) => includesQuery(item, query)) : items;

      results.replaceChildren(...filtered.map(renderResult));
      if (query) {
        const countLabel = filtered.length === 1 ? resultLabel : resultsLabel;
        summary.textContent =
          locale === 'zh-cn'
            ? `${filtered.length} ${countLabel}${forQueryLabel} "${input.value.trim()}"`
            : `${filtered.length} ${countLabel} ${forQueryLabel} "${input.value.trim()}"`;
      } else {
        summary.textContent = `${items.length} ${searchableLabel}`;
      }

      if (empty) {
        empty.hidden = filtered.length > 0;
      }
    };

    input.addEventListener('input', render);
    render();
  });
}
