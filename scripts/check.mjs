// Quick project check: every local file referenced by index.html exists, and every JS file parses.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const root = new URL('../public/', import.meta.url).pathname;
const html = readFileSync(join(root, 'index.html'), 'utf8');
let bad = 0;

for (const m of html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)) {
  if (!existsSync(join(root, m[1]))) { console.error('MISSING:', m[1]); bad++; }
}
for (const f of readdirSync(join(root, 'assets/js')).filter(n => n.endsWith('.js'))) {
  try { execFileSync(process.execPath, ['--check', join(root, 'assets/js', f)], { stdio: 'pipe' }); }
  catch (e) { console.error('SYNTAX ERROR in', f, '\n' + e.stderr); bad++; }
}
console.log(bad ? `Check failed (${bad} problem${bad > 1 ? 's' : ''}).` : 'Check passed: all files found, all scripts parse.');
process.exit(bad ? 1 : 0);
