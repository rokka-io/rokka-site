import type { APIRoute } from 'astro';
import { execFileSync } from 'node:child_process';
import { canonicalUrl, LANGUAGES } from '../data/site';
import { docEntries, docUrl, type DocType } from '../data/docs';

/**
 * The sitemap.
 *
 * Hand-generated rather than via @astrojs/sitemap, because that integration
 * assumes `build.format` is 'file' or 'directory'. Under 'preserve' it strips
 * the .html from every documentation URL, so it advertised
 * /documentation/references/render — a page that does not exist.
 *
 * Every entry is built with the same `canonicalUrl()` and `docUrl()` helpers
 * the pages themselves use for their <link rel="canonical">, so a sitemap URL
 * cannot drift from the canonical it points at.
 *
 * Deliberately absent:
 *  - `https://rokka.io/`, a byte-identical copy of /en/ that declares /en/ as
 *    its canonical. Listing both would offer two URLs for one page.
 *  - /pagenotfound and /error in both languages: not content, and their
 *    canonical (https://rokka.io/pagenotfound) does not resolve.
 */

const DOC_TYPES: DocType[] = ['guides', 'references', 'demos'];

const BUILD_DATE = new Date().toISOString().replace(/\.\d+Z$/, '+00:00');

/**
 * `lastmod` for a page: the date of the last commit that touched its source.
 *
 * Falls back to the build date when git cannot answer — no repository, or a
 * shallow clone, where `git log` only sees the checkout commit. CI therefore
 * checks out with `fetch-depth: 0`; without it every page would claim the same
 * (meaningless) date.
 */
function lastModified(...files: string[]): string {
  const dates = files
    .map((file) => {
      try {
        return execFileSync('git', ['log', '-1', '--format=%cI', '--', file], {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
      } catch {
        return '';
      }
    })
    .filter(Boolean);
  return dates.length ? dates.sort().at(-1)! : BUILD_DATE;
}

export const GET: APIRoute = async () => {
  const entries: { url: string; lastmod: string }[] = [];

  // Bilingual marketing pages. `/` is intentionally not listed; /en/ is its
  // canonical. Their copy lives in the translation files, so a text-only change
  // still moves the date.
  const translations = (lang: string) => [`src/data/text.${lang}.yml`];
  for (const lang of LANGUAGES) {
    entries.push({
      url: canonicalUrl('/', lang),
      lastmod: lastModified('src/layouts/Landing.astro', ...translations(lang)),
    });
    entries.push({
      url: canonicalUrl('/contact', lang),
      lastmod: lastModified('src/pages/[lang]/contact/index.astro', ...translations(lang)),
    });
    entries.push({
      url: canonicalUrl('/signup', lang),
      lastmod: lastModified('src/pages/[lang]/signup/index.astro', ...translations(lang)),
    });
  }

  // Documentation, English only by design.
  entries.push({
    url: canonicalUrl('/documentation'),
    lastmod: lastModified('src/pages/documentation/index.astro'),
  });
  for (const type of DOC_TYPES) {
    for (const entry of await docEntries(type)) {
      entries.push({
        url: canonicalUrl(docUrl(type, entry.data.slug)),
        lastmod: lastModified(entry.filePath ?? `src/content/${type}/${entry.id}.md`),
      });
    }
  }

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(
      ({ url, lastmod }) => `  <url><loc>${url}</loc><lastmod>${lastmod}</lastmod></url>`
    ),
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
