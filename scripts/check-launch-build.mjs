/**
 * Fails the launch build if anything review-only reached the output.
 *
 * Every review-only element (fixtures, photo placeholders, draft and
 * awaiting-confirmation markers) renders with a data-review-only attribute.
 * A launch build must contain none of them, and no fixture routes.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'dist/client';
const problems = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name.startsWith('fixture-')) problems.push(`fixture route emitted: ${path}`);
      walk(path);
    } else if (name.endsWith('.html')) {
      const html = readFileSync(path, 'utf8');
      if (html.includes('data-review-only')) problems.push(`review-only markup in ${path}`);
    } else if (/fixture/i.test(name)) {
      problems.push(`fixture asset emitted: ${path}`);
    }
  }
}

walk(ROOT);

if (problems.length > 0) {
  console.error('\nLaunch build check FAILED. Review-only content reached the output:\n');
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error('\nUse `npm run build:review` for a build that is meant to include it.\n');
  process.exit(1);
}

console.log('Launch build check passed: no fixtures or review-only content in dist/.');
