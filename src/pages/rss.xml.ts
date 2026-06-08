import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { absoluteUrl, localizedPath, siteConfig } from '../config/site';
import { getUi } from '../i18n/ui';
import { getPublishedNotes } from '../lib/content';

export async function GET(context: APIContext) {
  const locale = siteConfig.defaultLocale;
  const t = getUi(locale);
  const notes = await getPublishedNotes(locale);

  return rss({
    title: `${siteConfig.name} Notes`,
    description: t.notes.description,
    site: context.site ? new URL(localizedPath(locale, '/'), context.site).toString() : absoluteUrl(localizedPath(locale, '/')),
    items: notes.map((note) => ({
      title: note.data.title,
      description: note.data.description,
      pubDate: note.data.publishedAt,
      link: localizedPath(locale, `/notes/${note.data.slug}/`),
    })),
  });
}
