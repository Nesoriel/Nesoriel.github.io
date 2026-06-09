import { siteConfig, type Locale } from '../config/site';

export type PulseActivity = {
  repo: string;
  message?: string;
  title?: string;
  url: string;
  author?: string;
  timestamp: string;
  state?: string;
};

export type PulseRepository = {
  name: string;
  owner: string;
  repo: string;
  url: string;
  commits: number;
  issues: number;
  pullRequests: number;
  total: number;
};

export type PulseEntry = {
  date: string;
  generatedAt: string;
  windowHours: number;
  source: string;
  summary: string;
  repositories: PulseRepository[];
  commits: PulseActivity[];
  issues: PulseActivity[];
  pullRequests: PulseActivity[];
  metrics: {
    commits: number;
    issues: number;
    pullRequests: number;
    activeRepositories: number;
    totalActivities: number;
  };
  highlights: string[];
};

const pulseModules = import.meta.glob('../data/pulse/*.json', { eager: true }) as Record<
  string,
  { default: PulseEntry }
>;

const entries = Object.entries(pulseModules)
  .filter(([path]) => !path.endsWith('/latest.json'))
  .map(([, module]) => module.default)
  .sort((a, b) => b.date.localeCompare(a.date));

export const getPulseEntries = () => entries;

export const getLatestPulse = () => entries[0] ?? null;

export const getPulseByDate = (date: string) => entries.find((entry) => entry.date === date) ?? null;

export const getPulseActivityStrip = (days = 7) => {
  const latest = getLatestPulse();
  const start = latest ? new Date(`${latest.date}T00:00:00.000Z`) : new Date();

  return Array.from({ length: days }, (_, index) => {
    const current = new Date(start);
    current.setUTCDate(start.getUTCDate() - (days - index - 1));
    const date = current.toISOString().slice(0, 10);
    const entry = getPulseByDate(date);
    return {
      date,
      count: entry?.metrics.totalActivities ?? 0,
      href: entry ? `/pulse/${date}/` : undefined,
    };
  });
};

export function formatPulseDate(date: string, locale: Locale = siteConfig.defaultLocale) {
  return new Intl.DateTimeFormat(locale === 'zh-cn' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: locale === 'zh-cn' ? '2-digit' : 'short',
    day: '2-digit',
  }).format(new Date(`${date}T00:00:00.000Z`));
}

export function localizePulseSummary(entry: PulseEntry, locale: Locale) {
  if (locale === 'en') return entry.summary;
  if (entry.metrics.totalActivities === 0) {
    return '过去 24 小时没有新的公开活动。实验室保持安静，系统继续稳定运行。';
  }
  return `过去 24 小时记录到 ${entry.metrics.totalActivities} 条公开活动，涉及 ${entry.metrics.activeRepositories} 个仓库。`;
}
