#!/usr/bin/env node
/**
 * Builds the Pagefind search index for dist/, with sub-results capped at h3.
 *
 * Why this is not just `pagefind --site dist`:
 *
 * Pagefind splits a page into sub-results on every h1-h6 that carries an `id`,
 * and the level is not configurable -- `calculate_sub_results` in pagefind.js
 * filters on /h\d/i, and the CLI has no flag for it. Left alone,
 * references/operations.html alone contributes 24 sub-results all titled
 * "Properties" and all pointing at the same `#properties`, because the docs use
 * `#### Properties` under each of the 22 operations and Sculpin's id algorithm
 * does not deduplicate. That is a lot of identical rows in the search box.
 *
 * Neither `data-pagefind-ignore` nor `--exclude-selectors` fixes it: both drop
 * the element's *words* from the index but still record it as an anchor, so the
 * sub-result survives (measured -- the anchor count did not move). The only
 * thing Pagefind keys on is the presence of the `id`.
 *
 * Removing those ids from the site is not an option: they are public URLs, held
 * to a snapshot in scripts/anchor-ids.txt. So the site keeps every id it has and
 * only the *copy Pagefind reads* has them stripped below h3. dist/ itself is
 * never modified; the bundle is written back into dist/pagefind/ with
 * --output-path, and Pagefind derives result URLs from paths relative to its
 * input root, which the copy preserves exactly.
 *
 * The h4 headings stay searchable -- only the `id` goes, not the text -- and
 * their content is attributed to the h3 above them, which is the section a
 * reader wants to land on anyway.
 */
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const DIST = 'dist';
/** Headings at or below this level do not get their own search chunk. */
const DEEPEST_CHUNK = 3;

const htmlFiles = (dir) =>
  execFileSync('find', [dir, '-name', '*.html'], { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(Boolean);

const staging = mkdtempSync(join(tmpdir(), 'rokka-pagefind-'));

try {
  // Copy rather than filter to a file list: Pagefind resolves result URLs from
  // each file's path relative to --site, so the tree has to match dist/ exactly.
  cpSync(DIST, staging, { recursive: true });

  const tooDeep = new RegExp(`<h[${DEEPEST_CHUNK + 1}-6] id="[^"]*"`, 'g');
  let stripped = 0;
  for (const file of htmlFiles(staging)) {
    const html = readFileSync(file, 'utf8');
    const out = html.replace(tooDeep, (tag) => {
      stripped++;
      return tag.replace(/ id="[^"]*"/, '');
    });
    if (out !== html) writeFileSync(file, out);
  }

  // Fragment filenames are content-hashed, so Pagefind leaves stale ones in
  // place rather than replacing them. `astro build` clears dist/ first, but
  // running this step on its own twice would otherwise accumulate orphans and
  // make the page count in verify-build.mjs drift upwards.
  rmSync(join(DIST, 'pagefind'), { recursive: true, force: true });

  execFileSync(
    'npx',
    ['pagefind', '--site', staging, '--output-path', join(DIST, 'pagefind')],
    { stdio: 'inherit' }
  );
  console.log(`\nSearch chunks capped at h${DEEPEST_CHUNK} (${stripped} deeper heading ids ignored).`);
} finally {
  rmSync(staging, { recursive: true, force: true });
}
