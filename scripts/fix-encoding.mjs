/**
 * Surgically repairs the specific mojibake sequences produced when UTF-8 text
 * is round-tripped through Windows-1252 (what PowerShell 5.1 does by default).
 *
 * Only exact known sequences are replaced, so the script cannot damage healthy
 * files the way a blanket re-decode would.
 *
 * Run: node scripts/fix-encoding.mjs [--write]
 */
import { readFileSync, writeFileSync, globSync } from 'node:fs';

const WRITE = process.argv.includes('--write');

// Each entry: the three-or-two char sequence seen after corruption -> intended char.
const REPAIRS = [
  ['â€”', '—'], // em dash
  ['â€“', '–'], // en dash
  ['â€™', '’'], // right single quote
  ['â€œ', '“'], // left double quote
  ['â€', '”'], // right double quote
  ['â€¦', '…'], // ellipsis
  ['Â®', '®'], // registered
  ['Â ', ' '], // nbsp
];

const files = globSync('src/**/*.{astro,ts,css,md}').filter(
  (f) => !f.includes('node_modules'),
);

let touched = 0;

for (const file of files) {
  const original = readFileSync(file, 'utf8');
  let next = original;
  let count = 0;

  for (const [broken, fixed] of REPAIRS) {
    const parts = next.split(broken);
    if (parts.length > 1) {
      count += parts.length - 1;
      next = parts.join(fixed);
    }
  }

  if (count > 0) {
    console.log(`${file}  ${count} sequence(s)`);
    if (WRITE) writeFileSync(file, next, 'utf8');
    touched++;
  }
}

console.log(
  touched === 0
    ? 'No mojibake found.'
    : `${touched} file(s) ${WRITE ? 'repaired' : 'need repair — re-run with --write'}`,
);
