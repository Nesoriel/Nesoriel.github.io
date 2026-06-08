# AGENTS.md

This file defines the rules for AI agents working on the Nesoriel website.

Nesoriel is an open-source organization website deployed to two domains from one codebase.

The two sites should have the same main content:

- `https://nesoriel.com`
  - Global site
  - Deployed to GitHub Pages
  - Built by GitHub Actions

- `https://nesoriel.cn`
  - Mainland China site
  - Deployed to EdgeOne Pages
  - Built by CNB / EdgeOne Pages
  - Shows ICP record information in the footer

There is no separate “technical notes mode” anymore. Both domains are Nesoriel official websites.

## 1. Core principle

Do not create a separate beian content mode.

The domestic site and the global site should share the same main pages, same project portfolio, same notes, and same organization identity.

Allowed differences between the two builds:

- `SITE_URL`
- `SITE_DOMAIN`
- default locale for unprefixed routes (`en` on `nesoriel.com`, `zh-cn` on `nesoriel.cn`)
- canonical URLs
- sitemap URLs
- Open Graph URLs
- localized alternate URLs
- deployment provider
- generated `CNAME`
- ICP / PSB records shown in the footer
- minor wording required for footer compliance

Not allowed differences:

- Hiding the organization identity on `nesoriel.cn`
- Turning `nesoriel.cn` into “Nesoriel 的技术笔记”
- Removing project portfolio from only one target
- Removing either supported language from only one target
- Using runtime cloaking
- Switching content by IP, region, user-agent, URL parameter, hidden button, or localStorage

If content must differ in the future, make it explicit and document why.

## 2. Tech stack

Use:

- Astro
- TypeScript
- Tailwind CSS
- MDX
- Astro Content Collections
- pnpm
- Static output

Avoid unless explicitly requested:

- React
- Vue
- Svelte
- Next.js
- Nuxt
- Databases
- Backend services
- Authentication systems
- Admin dashboards
- Comment systems
- Heavy CMS
- External search services
- Heavy animation libraries

The site should remain static, fast, portable, and easy to deploy.

## 3. Site configuration

Centralize site configuration in:

```txt
src/config/site.ts
```

Recommended environment variables:

```txt
SITE_URL=https://nesoriel.com
SITE_NAME=Nesoriel
SITE_DOMAIN=nesoriel.com
SITE_TARGET=global
ICP_RECORD=
PSB_RECORD=
```

For the China site:

```txt
SITE_URL=https://nesoriel.cn
SITE_NAME=Nesoriel
SITE_DOMAIN=nesoriel.cn
SITE_TARGET=cn
ICP_RECORD=请替换为真实备案号
PSB_RECORD=请替换为真实公安备案号，可选
```

Rules:

- Do not scatter `process.env` or `import.meta.env` reads throughout components.
- Do not hardcode `nesoriel.com` or `nesoriel.cn` in many files.
- Use typed config exports.
- `SITE_TARGET` should only control metadata, deployment-related output, record display, and the default locale of unprefixed routes.
- `SITE_TARGET` must not be used to create separate content modes.
- Both builds must statically generate English and Simplified Chinese pages.

## 4. Expected pages

The site should provide:

```txt
/
 /projects/
 /projects/[slug]/
 /notes/
 /notes/[slug]/
 /about/
 /rss.xml
 /sitemap-index.xml
 /search.json
 /en/
 /en/projects/
 /en/projects/[slug]/
 /en/notes/
 /en/notes/[slug]/
 /en/about/
 /en/search/
 /en/rss.xml
 /en/search.json
 /zh-cn/
 /zh-cn/projects/
 /zh-cn/projects/[slug]/
 /zh-cn/notes/
 /zh-cn/notes/[slug]/
 /zh-cn/about/
 /zh-cn/search/
 /zh-cn/rss.xml
 /zh-cn/search.json
```

Main content and both supported languages should be available on both domains. The unprefixed routes are English on `nesoriel.com` and Simplified Chinese on `nesoriel.cn`.

## 5. Content model

Use Astro Content Collections.

### 5.1 Projects

Suggested location:

```txt
src/content/projects/
```

Recommended fields:

```ts
locale: "en" | "zh-cn"
translationKey: string
title: string
slug: string
description: string
longDescription?: string
status: "idea" | "active" | "paused" | "archived"
featured: boolean
tags: string[]
techStack: string[]
repoUrl?: string
demoUrl?: string
docsUrl?: string
cover?: string
startedAt?: Date
updatedAt?: Date
visibility: "public" | "hidden"
```

Rules:

- Hide `visibility: hidden`.
- Featured projects should appear first where appropriate.
- Project pages should include status, tags, tech stack, and relevant links.
- English and Simplified Chinese entries for the same project should share `translationKey` and `slug`.
- Do not add mode-specific project filtering unless explicitly requested.

### 5.2 Notes

Suggested location:

```txt
src/content/notes/
```

Recommended fields:

```ts
locale: "en" | "zh-cn"
translationKey: string
title: string
slug: string
description: string
publishedAt: Date
updatedAt?: Date
tags: string[]
category: string
draft: boolean
featured: boolean
```

Rules:

- Do not render drafts in production builds.
- Generate note list pages.
- Generate note detail pages.
- Support table of contents.
- Support code highlighting.
- Support reading time.
- Support RSS.
- English and Simplified Chinese entries for the same note should share `translationKey` and `slug`.
- Do not add mode-specific note filtering unless explicitly requested.

## 6. Search

The search system must be static.

Allowed approaches:

- Generate a JSON search index at build time.
- Use Pagefind if it does not complicate deployment.
- Use small client-side JavaScript.

Requirements:

- Search projects and notes for the current locale.
- Do not index hidden projects.
- Do not index draft notes.
- Do not require a backend service.
- Do not require a third-party search service.

## 7. Design direction

The visual language should be simple, premium, restrained, and slightly futuristic.

Use:

- Dark-first design
- Light theme support
- Large spacing
- Fine borders
- Subtle gradients
- Low-saturation blue / purple accents
- Slight noise or grid texture
- Clear typography scale
- Carefully designed cards
- Calm motion

Avoid:

- Cheap glassmorphism
- Heavy shadows
- Overly colorful gradients
- Template-looking sections
- Too many animations
- Cluttered layouts
- Low-contrast text

The site should feel like a serious open-source lab, not a generic personal blog template.

## 8. Theme

Support:

- `dark`
- `light`
- `system`

Rules:

- Default to dark.
- Store preference in localStorage.
- Prevent first-paint flicker where practical.
- Keep content readable without JavaScript.
- Respect accessibility and contrast requirements.

## 8.1 Internationalization

Support:

- English (`en`)
- Simplified Chinese (`zh-cn`)

Rules:

- `nesoriel.com` should use English for unprefixed routes.
- `nesoriel.cn` should use Simplified Chinese for unprefixed routes.
- Both domains must expose both `/en/` and `/zh-cn/` routes.
- Language switching must be explicit links, not IP, region, user-agent, localStorage, or hidden runtime switching.
- Canonical URLs should point to the preferred route for the current build and locale.
- Alternate links should expose both supported locales.
- Do not use i18n to create a separate beian content mode.

## 9. SEO

Every page should have:

- title
- description
- canonical URL
- Open Graph metadata
- Twitter Card metadata where reasonable

Generate:

- sitemap
- RSS feed
- robots.txt

SEO URLs must be based on `SITE_URL`.

## 10. GitHub Pages deployment

Expected workflow file:

```txt
.github/workflows/deploy.yml
```

Requirements:

- Trigger on push to `main`.
- Support manual `workflow_dispatch`.
- Use pnpm.
- Build with `pnpm build:github`.
- Deploy `dist`.
- Set permissions:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

The GitHub Pages build must generate:

```txt
dist/CNAME
```

with this content:

```txt
nesoriel.com
```

## 11. EdgeOne Pages / CNB deployment

Expected deployment settings:

```txt
Install command: pnpm install --frozen-lockfile
Build command: pnpm build:edgeone
Output directory: dist
```

Expected environment variables:

```txt
SITE_URL=https://nesoriel.cn
SITE_NAME=Nesoriel
SITE_DOMAIN=nesoriel.cn
SITE_TARGET=cn
ICP_RECORD=请替换为真实备案号
PSB_RECORD=请替换为真实公安备案号，可选
```

If adding CNB configuration files, keep them minimal and maintainable.

Do not invent complex unsupported syntax. If the exact CNB configuration cannot be verified, document the required EdgeOne Pages build settings in `README.md`.

## 12. Package scripts

The project should provide at least:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "build:github": "cross-env SITE_URL=https://nesoriel.com SITE_NAME=Nesoriel SITE_DOMAIN=nesoriel.com SITE_TARGET=global astro build && node scripts/write-cname.mjs nesoriel.com",
    "build:edgeone": "cross-env SITE_URL=https://nesoriel.cn SITE_NAME=Nesoriel SITE_DOMAIN=nesoriel.cn SITE_TARGET=cn astro build",
    "preview": "astro preview",
    "check": "astro check",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

If these scripts fail because of shell compatibility, fix them with `cross-env-shell` or Node wrapper scripts.

Do not leave broken scripts.

## 13. Accessibility

Requirements:

- Semantic HTML.
- Proper heading order.
- Keyboard-accessible navigation.
- Visible focus states.
- Good color contrast.
- Respect reduced motion when possible.
- Images should have alt text.

## 14. Performance

Requirements:

- Static output.
- Optimized images where practical.
- Minimal JavaScript.
- Avoid large dependencies.
- Avoid blocking third-party scripts.
- Do not add analytics unless explicitly requested.
- Lighthouse performance should be treated as important.

## 15. Content style

Writing style:

- Clear
- Technical
- Calm
- Premium but not exaggerated
- Open-source oriented
- Not marketing-heavy

Avoid filler text.

Do not use lorem ipsum.

## 16. Example content

If real content is unavailable, create realistic placeholders for these projects:

- LWE
- Proxio
- Nesoriel Site

Create realistic placeholder notes:

1. 为什么选择 Astro 构建静态组织官网
2. GitHub Pages 与 EdgeOne Pages 双站点部署记录
3. 开源项目作品集的信息架构设计

The placeholders should look like real technical content and be easy to replace.

## 17. README requirements

README must document:

- Project purpose
- Tech stack
- Local development
- Content management
- How to add a project
- How to add a note
- GitHub Pages deployment
- EdgeOne Pages deployment
- Environment variables
- ICP / PSB record configuration
- Maintenance rules

README should read like a serious technical document, not a toy project note.

## 18. Acceptance checklist

Before finishing, ensure:

- `pnpm install` works.
- `pnpm dev` works.
- `pnpm build:github` works.
- `pnpm build:edgeone` works.
- `dist` is static.
- GitHub Pages workflow exists.
- EdgeOne Pages deployment instructions exist.
- The global and China builds have the same main content.
- `SITE_TARGET` does not create a separate content mode.
- Projects collection works.
- Notes collection works.
- Search works.
- RSS works.
- Sitemap works.
- README documents local development and deployment.
- This AGENTS.md remains accurate after implementation.

## 19. Do not do

Do not add:

- Backend database
- Login system
- Admin panel
- Comment system
- Payment
- Sponsorship workflow
- Heavy CMS
- Runtime mode switching
- Region-based cloaking
- IP-based cloaking
- User-agent-based cloaking
- A separate “Nesoriel 的技术笔记” site mode

Keep the site simple, elegant, static, and maintainable.
