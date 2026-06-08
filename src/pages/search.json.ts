import type { APIRoute } from 'astro';
import { localizedPath, siteConfig } from '../config/site';
import { getPublicProjects, getPublishedNotes } from '../lib/content';

export const GET: APIRoute = async () => {
  const locale = siteConfig.defaultLocale;
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
