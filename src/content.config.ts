import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const localizedId = ({ data }: { data: Record<string, unknown> }) => `${data.locale}/${data.slug}`;

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}', generateId: localizedId }),
  schema: z.object({
    locale: z.enum(['en', 'zh-cn']),
    translationKey: z.string(),
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    longDescription: z.string().optional(),
    status: z.enum(['idea', 'active', 'paused', 'archived']),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    techStack: z.array(z.string()).default([]),
    repoUrl: z.union([z.url(), z.string().startsWith('/')]).optional(),
    demoUrl: z.union([z.url(), z.string().startsWith('/')]).optional(),
    docsUrl: z.union([z.url(), z.string().startsWith('/')]).optional(),
    cover: z.string().optional(),
    startedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    visibility: z.enum(['public', 'hidden']).default('public'),
  }),
});

const notes = defineCollection({
  loader: glob({ base: './src/content/notes', pattern: '**/*.{md,mdx}', generateId: localizedId }),
  schema: z.object({
    locale: z.enum(['en', 'zh-cn']),
    translationKey: z.string(),
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    category: z.string(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }),
});

export const collections = { projects, notes };
