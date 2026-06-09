import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pulseRepositories as defaultRepositories } from './pulse-repositories.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outputDir = join(root, 'src', 'data', 'pulse');
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const now = process.env.PULSE_NOW ? new Date(process.env.PULSE_NOW) : new Date();
const windowHours = Number.parseInt(process.env.PULSE_WINDOW_HOURS || '24', 10);
const since = new Date(now.getTime() - windowHours * 60 * 60 * 1000);
const date = process.env.PULSE_DATE || now.toISOString().slice(0, 10);

const repositories = process.env.PULSE_REPOSITORIES
  ? JSON.parse(process.env.PULSE_REPOSITORIES)
  : defaultRepositories;

const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

const clamp = (value, length = 180) => {
  const singleLine = String(value || '').replace(/\s+/g, ' ').trim();
  return singleLine.length > length ? `${singleLine.slice(0, length - 1)}…` : singleLine;
};

async function github(path, params = {}) {
  const url = new URL(`https://api.github.com${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, { headers });
  if (response.status === 404) return [];
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API request failed ${response.status} ${url.pathname}: ${body.slice(0, 300)}`);
  }
  return response.json();
}

async function collectRepository(repository) {
  const { owner, repo, name = repo } = repository;
  const slug = `${owner}/${repo}`;
  const repoUrl = `https://github.com/${slug}`;

  const commitsRaw = await github(`/repos/${owner}/${repo}/commits`, {
    since: since.toISOString(),
    until: now.toISOString(),
    per_page: 100,
  });

  const issuesRaw = await github(`/repos/${owner}/${repo}/issues`, {
    state: 'all',
    since: since.toISOString(),
    per_page: 100,
  });

  const commits = commitsRaw.map((commit) => ({
    repo: slug,
    message: clamp(commit.commit?.message?.split('\n')[0] || 'Commit update'),
    url: commit.html_url || repoUrl,
    author: clamp(commit.author?.login || commit.commit?.author?.name || 'unknown', 80),
    timestamp: commit.commit?.author?.date || commit.commit?.committer?.date || now.toISOString(),
  }));

  const issues = [];
  const pullRequests = [];

  for (const item of issuesRaw) {
    const timestamp = item.updated_at || item.created_at || now.toISOString();
    const activity = {
      repo: slug,
      title: clamp(item.title || 'GitHub activity'),
      url: item.html_url || repoUrl,
      author: clamp(item.user?.login || 'unknown', 80),
      timestamp,
      state: item.state,
    };

    if (item.pull_request) pullRequests.push(activity);
    else issues.push(activity);
  }

  return {
    repository: {
      name,
      owner,
      repo,
      url: repoUrl,
      commits: commits.length,
      issues: issues.length,
      pullRequests: pullRequests.length,
      total: commits.length + issues.length + pullRequests.length,
    },
    commits,
    issues,
    pullRequests,
  };
}

const byTimestampDesc = (a, b) => b.timestamp.localeCompare(a.timestamp) || a.repo.localeCompare(b.repo);

function buildSummary(metrics) {
  if (metrics.totalActivities === 0) {
    return 'No public GitHub activity was recorded in the last 24 hours. The lab stayed quiet while the static systems continued to run.';
  }

  const parts = [
    `${metrics.totalActivities} public activities`,
    `${metrics.commits} commits`,
    `${metrics.issues} issues`,
    `${metrics.pullRequests} pull requests`,
    `${metrics.activeRepositories} active repositories`,
  ];
  return `Nesoriel Pulse captured ${parts.join(', ')} across the tracked repositories in the last 24 hours.`;
}

function buildHighlights(metrics, repositories) {
  if (metrics.totalActivities === 0) {
    return [
      'No public commits, issues, or pull requests were recorded during this window.',
      'The tracked repositories remain part of the daily Pulse watchlist.',
      'This no-activity report is generated intentionally so the public rhythm stays auditable.',
    ];
  }

  const mostActive = repositories.filter((repo) => repo.total > 0).sort((a, b) => b.total - a.total)[0];
  return [
    `${metrics.commits} commits were captured from public repositories.`,
    `${metrics.issues + metrics.pullRequests} issue or pull request updates were recorded.`,
    mostActive ? `${mostActive.name} was the most active tracked repository with ${mostActive.total} activities.` : 'Activity was distributed across the tracked repository set.',
  ];
}

const collected = await Promise.all(repositories.map(collectRepository));
const commits = collected.flatMap((item) => item.commits).sort(byTimestampDesc);
const issues = collected.flatMap((item) => item.issues).sort(byTimestampDesc);
const pullRequests = collected.flatMap((item) => item.pullRequests).sort(byTimestampDesc);
const repositoryStats = collected
  .map((item) => item.repository)
  .filter((repo) => repo.total > 0)
  .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

const metrics = {
  commits: commits.length,
  issues: issues.length,
  pullRequests: pullRequests.length,
  activeRepositories: repositoryStats.length,
  totalActivities: commits.length + issues.length + pullRequests.length,
};

const pulse = {
  date,
  generatedAt: now.toISOString(),
  windowHours,
  source: 'github',
  summary: buildSummary(metrics),
  repositories: repositoryStats,
  commits,
  issues,
  pullRequests,
  metrics,
  highlights: buildHighlights(metrics, repositoryStats),
};

await mkdir(outputDir, { recursive: true });
const json = `${JSON.stringify(pulse, null, 2)}\n`;
await writeFile(join(outputDir, `${date}.json`), json, 'utf8');
await writeFile(join(outputDir, 'latest.json'), json, 'utf8');

console.log(`Pulse written for ${date}: ${metrics.totalActivities} activities across ${metrics.activeRepositories} repositories.`);
