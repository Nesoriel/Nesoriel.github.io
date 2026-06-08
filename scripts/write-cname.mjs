import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const domain = process.argv[2];

if (!domain) {
  throw new Error('Usage: node scripts/write-cname.mjs <domain>');
}

await mkdir('dist', { recursive: true });
await writeFile(join('dist', 'CNAME'), `${domain}\n`, 'utf8');
