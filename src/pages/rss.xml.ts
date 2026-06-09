import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { absoluteUrl, localizedPath, siteConfig } from '../config/site';
import { getUi } from '../i18n/ui';
import { getPublishedNotes } from '../lib/content';
import { getPulseEntries, localizePulseSummary } from '../lib/pulse';

export async function GET(context: APIContext) {
  const locale = siteConfig.defaultLocale;
  const t = getUi(locale);
  const notes = await getPublishedNotes(locale);
  const pulseEntries = getPulseEntries();

  return rss({
    title: `${siteConfig.name} Notes`,
    description: t.notes.description,
    site: context.site ? new URL(localizedPath(locale, '/'), context.site).toString() : absoluteUrl(localizedPath(locale, '/')),
    items: [
      ...notes.map((note) => ({
        title: note.data.title,
        description: note.data.description,
        pubDate: note.data.publishedAt,
        link: localizedPath(locale, `/notes/${note.data.slug}/`),
      })),
      ...pulseEntries.map((entry) => ({
        title: `${t.pulse.detailTitle} ${entry.date}`,
        description: localizePulseSummary(entry, locale),
        pubDate: new Date(`${entry.date}T00:00:00.000Z`),
        link: localizedPath(locale, `/pulse/${entry.date}/`),
      })),
    ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime()),
  });
}
