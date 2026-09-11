import { getCollection, type CollectionEntry } from 'astro:content';
import { byFilename } from '../content.config';

export type DocType = 'guides' | 'references' | 'demos';

/** The permalinks Sculpin produced: `documentation/<type>/:slug_title.html`. */
export function docUrl(type: DocType, slug: string): string {
  return `/documentation/${type}/${slug}.html`;
}

/** Collection entries in the published order (natural sort on the 00-/05-/10- filename prefix). */
export async function docEntries(type: DocType): Promise<CollectionEntry<DocType>[]> {
  return (await getCollection(type)).sort(byFilename);
}

/** The `{url, title}` shape the sidebar and demo-strip partials iterate over. */
export async function docLinks(type: DocType): Promise<{ url: string; title: string }[]> {
  const entries = await docEntries(type);
  return entries.map((entry) => ({ url: docUrl(type, entry.data.slug), title: entry.data.title }));
}
