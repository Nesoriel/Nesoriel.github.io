import type { APIRoute } from 'astro';
import { localizedPath, supportedLocales, type Locale } from '../../config/site';
import { getPublicProjects, getPublishedNotes } from '../../lib/content';

export function getStaticPaths() {
  return supportedLocales.map((locale) => ({ params: { locale }, props: { locale } }));
}

export const GET: APIRoute = async ({ props }) => {
  const locale = props.locale as Locale;
  const projects = await getPublicProjects(locale);
  const notes = await getPublishedNotes(locale);
  const items = [
    ...projects.map((project) => ({
      type: 'project',
      title: project.data.title,
      description: project.data.description,
      href: localizedPath(locale, `/projects/${project.data.slug}/`),
      tags: project.data.tags,
      techStack: project.data.techStack,
      status: project.data.status,
    })),
    ...notes.map((note) => ({
      type: 'note',
      title: note.data.title,
      description: note.data.description,
      href: localizedPath(locale, `/notes/${note.data.slug}/`),
      tags: note.data.tags,
      category: note.data.category,
    })),
  ];

  return new Response(JSON.stringify(items, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
