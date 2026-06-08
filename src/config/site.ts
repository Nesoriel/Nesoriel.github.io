export type SiteTarget = 'global' | 'cn';
export type Locale = 'en' | 'zh-cn';

export const supportedLocales = ['en', 'zh-cn'] as const satisfies readonly Locale[];

export const localeConfig = {
  en: {
    label: 'English',
    shortLabel: 'EN',
    htmlLang: 'en',
    ogLocale: 'en_US',
  },
  'zh-cn': {
    label: '简体中文',
    shortLabel: '中',
    htmlLang: 'zh-CN',
    ogLocale: 'zh_CN',
  },
} as const satisfies Record<
  Locale,
  {
    label: string;
    shortLabel: string;
    htmlLang: string;
    ogLocale: string;
  }
>;

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const siteUrl = trimTrailingSlash(import.meta.env.SITE_URL ?? 'https://nesoriel.com');
const siteDomain = import.meta.env.SITE_DOMAIN ?? new URL(siteUrl).hostname;
const siteTarget = (import.meta.env.SITE_TARGET ?? 'global') as SiteTarget;
const defaultLocale: Locale = siteTarget === 'cn' ? 'zh-cn' : 'en';

export const isLocale = (value: string | undefined): value is Locale =>
  supportedLocales.includes(value as Locale);

export const siteConfig = {
  name: import.meta.env.SITE_NAME ?? 'Nesoriel',
  url: siteUrl,
  domain: siteDomain,
  target: siteTarget,
  defaultLocale,
  locales: supportedLocales,
  icpRecord: import.meta.env.ICP_RECORD ?? '',
  psbRecord: import.meta.env.PSB_RECORD ?? '',
  description:
    'Nesoriel is an open-source software lab building durable tools, static web systems, and deployment infrastructure.',
} as const;

export const absoluteUrl = (path = '/') => new URL(path, `${siteConfig.url}/`).toString();

export const ensureTrailingSlash = (path: string) => {
  if (path === '') return '/';
  const [pathname, search = ''] = path.split('?');
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const withSlash = normalized.endsWith('/') || normalized.includes('.') ? normalized : `${normalized}/`;
  return search ? `${withSlash}?${search}` : withSlash;
};

export const stripLocaleFromPath = (pathname: string) => {
  const normalized = ensureTrailingSlash(pathname).split('?')[0] ?? '/';
  const segments = normalized.split('/').filter(Boolean);

  if (isLocale(segments[0])) {
    const rest = segments.slice(1).join('/');
    return rest ? ensureTrailingSlash(`/${rest}`) : '/';
  }

  return normalized;
};

export const localeFromPath = (pathname: string) => {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return isLocale(firstSegment) ? firstSegment : siteConfig.defaultLocale;
};

export const localizedPath = (locale: Locale, pathname = '/') => {
  const basePath = stripLocaleFromPath(pathname);

  if (locale === siteConfig.defaultLocale) {
    return basePath;
  }

  return basePath === '/' ? `/${locale}/` : `/${locale}${basePath}`;
};

export const absoluteLocalizedUrl = (locale: Locale, pathname = '/') =>
  absoluteUrl(localizedPath(locale, pathname));
