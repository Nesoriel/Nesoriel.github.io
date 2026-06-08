import { getCollection, type CollectionEntry } from 'astro:content';
import { siteConfig, type Locale } from '../config/site';

export type ProjectEntry = CollectionEntry<'projects'>;
export type NoteEntry = CollectionEntry<'notes'>;

export async function getPublicProjects(locale: Locale = siteConfig.defaultLocale) {
  const projects = await getCollection(
    'projects',
    ({ data }) => data.locale === locale && data.visibility === 'public',
  );

  return projects.sort((a, b) => {
    if (a.data.featured !== b.data.featured) return a.data.featured ? -1 : 1;
    return (b.data.updatedAt?.getTime() ?? 0) - (a.data.updatedAt?.getTime() ?? 0);
  });
}

export async function getPublishedNotes(locale: Locale = siteConfig.defaultLocale) {
  const notes = await getCollection('notes', ({ data }) => data.locale === locale && !data.draft);
  return notes.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export function readingTimeMinutes(body = '') {
  const chineseChars = (body.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const words = (body.replace(/[\u4e00-\u9fff]/g, '').match(/[\w-]+/g) ?? []).length;
  return Math.max(1, Math.ceil(chineseChars / 350 + words / 220));
}

export function readingTime(body = '', locale: Locale = siteConfig.defaultLocale) {
  const minutes = readingTimeMinutes(body);
  return locale === 'zh-cn' ? `${minutes} 分钟阅读` : `${minutes} min read`;
}

export function formatDate(date: Date, locale: Locale = siteConfig.defaultLocale) {
  return new Intl.DateTimeFormat(locale === 'zh-cn' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: locale === 'zh-cn' ? '2-digit' : 'short',
    day: '2-digit',
  }).format(date);
}

export function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}
