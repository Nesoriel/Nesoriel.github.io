const normalizeValue = (value: string) => value.trim().toLowerCase();

const parseTokens = (value: string | undefined) =>
  (value ?? '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);

const updatePressedState = (buttons: HTMLButtonElement[], activeValue: string) => {
  buttons.forEach((button) => {
    const isActive = (button.dataset.filterValue ?? 'all') === activeValue;
    button.setAttribute('aria-pressed', String(isActive));
    button.dataset.active = String(isActive);
    button.classList.toggle('border-site-accent', isActive);
    button.classList.toggle('bg-site-accent/10', isActive);
    button.classList.toggle('text-site', isActive);
    button.classList.toggle('text-site-muted', !isActive);
  });
};

export function setupCollectionFilters(rootSelector = '[data-filter-root]') {
  const roots = document.querySelectorAll<HTMLElement>(rootSelector);

  roots.forEach((root) => {
    const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-filter-item]'));
    const groups = Array.from(root.querySelectorAll<HTMLElement>('[data-filter-group]'));
    const liveRegion = root.querySelector<HTMLElement>('[data-filter-results]');
    const emptyState = root.querySelector<HTMLElement>('[data-filter-empty]');
    const state = new Map<string, string>();

    groups.forEach((group) => {
      const groupName = group.dataset.filterGroup;
      if (!groupName) return;

      const buttons = Array.from(group.querySelectorAll<HTMLButtonElement>('[data-filter-value]'));
      const defaultValue = buttons.find((button) => button.dataset.filterValue === 'all')?.dataset.filterValue ?? 'all';

      state.set(groupName, defaultValue);
      updatePressedState(buttons, defaultValue);

      buttons.forEach((button) => {
        button.addEventListener('click', () => {
          const value = button.dataset.filterValue ?? 'all';
          state.set(groupName, value);
          updatePressedState(buttons, value);
          applyFilters();
        });
      });
    });

    const applyFilters = () => {
      let visibleCount = 0;

      cards.forEach((card) => {
        const matches = Array.from(state.entries()).every(([groupName, selectedValue]) => {
          if (selectedValue === 'all') return true;

          const rawValue = card.dataset[groupName];
          if (!rawValue) return false;

          if (rawValue.includes('|')) {
            return parseTokens(rawValue).includes(selectedValue);
          }

          return normalizeValue(rawValue) === selectedValue;
        });

        card.hidden = !matches;
        if (matches) visibleCount += 1;
      });

      if (liveRegion) {
        const label = root.dataset.filterLabel ?? 'items';
        const locale = root.dataset.filterLocale ?? 'en';
        liveRegion.textContent = locale === 'zh-cn' ? `${visibleCount} ${label}` : `Showing ${visibleCount} ${label}`;
      }

      if (emptyState) {
        emptyState.hidden = visibleCount > 0;
      }
    };

    applyFilters();
  });
}
