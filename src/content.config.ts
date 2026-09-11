import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * The documentation collections.
 *
 * Filenames keep their numeric prefixes (00-, 05-, 10-, ...). That prefix is
 * the ordering mechanism, exactly as it was under Sculpin, whose DefaultSorter
 * fell through to `strnatcmp` on the relative pathname because no entry has a
 * date. Sort with `byFilename` below to reproduce it.
 *
 * `slug` is mandatory and is the public URL. Under Sculpin it was derived from
 * the *title* unless overridden, which meant renaming a heading silently moved
 * a published page -- `03-upload-an-image.md` is served as
 * `upload-and-render-an-image.html`. Every slug is now pinned to the URL the
 * old build produced.
 */
const docSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  /** Key into the per-page <head> fragments in src/components/head/. */
  head: z.enum(['templates', 'watermark', 'signurl', 'iiif', 'autodescriptions']).optional(),
  /** Raw attribute string spliced onto <body>, e.g. `onload="updateImage()"`. */
  body_attributes: z.string().optional(),
});

const collection = (dir: string) =>
  defineCollection({
    loader: glob({ pattern: '*.md', base: `./src/content/${dir}` }),
    schema: docSchema,
  });

export const collections = {
  guides: collection('guides'),
  references: collection('references'),
  demos: collection('demos'),
};

/**
 * Sculpin's ordering: natural sort on the filename, so 05- precedes 10-.
 *
 * Sorts on `filePath`, not `id`: the glob loader lets front matter `slug`
 * override the generated `id`, so `id` here is the URL slug and sorting on it
 * would silently produce an alphabetical sidebar instead of the curated one.
 */
export function byFilename<T extends { filePath?: string; id: string }>(a: T, b: T) {
  return (a.filePath ?? a.id).localeCompare(b.filePath ?? b.id, undefined, { numeric: true });
}
