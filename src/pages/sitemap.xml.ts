import type { APIRoute } from 'astro';
import { canonicalUrl, LANGUAGES } from '../data/site';
import { docLinks, type DocType } from '../data/docs';

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

export const GET: APIRoute = async () => {
  const urls: string[] = [];

  // Bilingual marketing pages. `/` is intentionally not listed; /en/ is its canonical.
  for (const lang of LANGUAGES) {
    urls.push(canonicalUrl('/', lang));
    urls.push(canonicalUrl('/contact', lang));
    urls.push(canonicalUrl('/signup', lang));
  }

  // Documentation, English only by design.
  urls.push(canonicalUrl('/documentation'));
  for (const type of DOC_TYPES) {
    for (const { url } of await docLinks(type)) urls.push(canonicalUrl(url));
  }

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${url}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
