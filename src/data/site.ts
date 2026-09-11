import { load } from 'js-yaml';
// `?raw` inlines the file contents at build time. Reading them with fs at
// runtime does not survive bundling -- the .yml files are not emitted next to
// the generated chunk, so prerendering fails with ENOENT.
import textEnRaw from './text.en.yml?raw';
import textDeRaw from './text.de.yml?raw';
import pagedataRaw from './pagedata.yml?raw';

/**
 * The `site` object the Twig templates used to read.
 *
 * Under Sculpin this was assembled by the build config: each of the six
 * `sculpin_site_<env>_<lang>.yml` files set `language`/`domain` and imported one
 * `translations/text_<lang>.yml` plus the shared `pagedata.yml`, and the whole
 * merged map was exposed to Twig as `site`. The site was then generated twice,
 * once per language.
 *
 * Astro builds once, so the language is a parameter instead. Keeping the same
 * shape means template expressions port across unchanged:
 *   {{ site.text.navigation.contact|raw }}  ->  <Fragment set:html={site.text.navigation.contact} />
 *
 * `domain` used to be `/` in the local env and `https://rokka.io/` in prod,
 * which made dev and prod canonicals disagree. It is now always the real site.
 */

export const LANGUAGES = ['en', 'de'] as const;
export type Language = (typeof LANGUAGES)[number];

const parse = (raw: string) => load(raw) as Record<string, any>;

const TEXT: Record<Language, Record<string, any>> = {
  en: parse(textEnRaw),
  de: parse(textDeRaw),
};
const PAGEDATA = parse(pagedataRaw);

export interface Site {
  language: Language;
  domain: string;
  title: string;
  subtitle: string;
  keywords: string;
  sharing_title: string;
  text: Record<string, any>;
  rokka_more_links: { title: string; alt: string; link: string }[];
  rokka_libraries: { title: string; alt: string; link: string }[];
  rokka_framework_plugins: { title: string; alt: string; link: string }[];
}

export function getSite(language: Language): Site {
  return {
    language,
    domain: 'https://rokka.io/',
    ...TEXT[language],
    ...PAGEDATA,
  } as Site;
}

/**
 * The two static language params for the `[lang]` routes.
 *
 * A function, not a shared constant: Astro annotates the objects a route's
 * getStaticPaths() returns, so handing the same array to several routes makes
 * them collide and the build fails with NoMatchingStaticPathFound.
 */
export const languagePaths = () => LANGUAGES.map((lang) => ({ params: { lang } }));

/**
 * Twig's `|title` filter, which `default.html` applied to every `<title>`.
 *
 * Twig implements it as `mb_convert_case($s, MB_CASE_TITLE)` -- Unicode title
 * case, where every non-letter is a word boundary. That is not `ucwords()`:
 * "AI Auto Descriptions (Automatic Alt Text)" is published as
 * "Ai Auto Descriptions (Automatic Alt Text)", which lowercases the acronym and
 * capitalises after the opening parenthesis. `ucwords()` would do neither.
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/(^|\P{L})(\p{L})/gu, (_m, before, ch) => before + ch.toUpperCase());
}

/**
 * Canonical URL, reproducing the two branches at the top of `default.html`:
 *
 *   multilang : site.domain ~ site.language ~ page.url   -> https://rokka.io/en/contact
 *   otherwise : site.domain|trim('/') ~ page.url          -> https://rokka.io/documentation
 *
 * Pass `lang` only for the multilang pages (index, contact, signup). Leaving it
 * out reproduces a pre-existing quirk worth knowing about: /en/pagenotfound/ and
 * /de/pagenotfound/ both declare `https://rokka.io/pagenotfound` as canonical,
 * a URL that does not exist. Kept as-is so the migration changes no metadata.
 */
export function canonicalUrl(pageUrl: string, lang?: Language): string {
  return lang ? `https://rokka.io/${lang}${pageUrl}` : `https://rokka.io${pageUrl}`;
}
