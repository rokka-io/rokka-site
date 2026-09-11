/**
 * Reproduces Sculpin's heading treatment on the rokka documentation.
 *
 * Two behaviours from the old PHP build are merged here, because both have to
 * happen before Astro's own `heading-ids` plugin runs:
 *
 *  1. The id, from Sculpin's MarkdownConverter::generateHeaderId()
 *     (vendor/sculpin/.../MarkdownBundle/MarkdownConverter.php):
 *
 *         $result = strip_tags($headerText);
 *         $result = preg_replace('%(?<=\])(\([^\)]*\))%x', '', $result);
 *         $map = [' ' => '-', '(' => '', ')' => '', '[' => '', ']' => ''];
 *         return rawurlencode(strtolower(strtr($result, $map)));
 *
 *  2. The self-link, from src/SculpinTools/AddLinksToId.php, which moved a
 *     heading's children inside `<a href="#id" class="anchorLink">`.
 *
 * Why this must run first: `@astrojs/markdown-satteri`'s `heading-ids` plugin
 * slugs with github-slugger AND deduplicates (`-1`, `-2`, ...). Sculpin does
 * neither -- `references/operations.html` legitimately carries `id="properties"`
 * 21 times. That plugin does respect an id that is already set, and reuses it
 * for the `headings` array that `render()` exposes, so claiming the id here
 * gets both the markup and the TOC right. Astro runs user `hastPlugins` before
 * its own (see markdown-satteri/dist/satteri-processor.js, where
 * `hastPlugins.push(...userHastPlugins)` precedes `createHeadingIdsPlugin()`).
 *
 * The encoding has three traps:
 *  - PHP rawurlencode() escapes !'()* ; encodeURIComponent() leaves them. The
 *    %27 in `#general-info-about-rokka%27s-render-caches` depends on it.
 *  - PHP strtolower() is ASCII-only; JS toLowerCase() folds more than that.
 *  - PHP saw the *raw markdown* of the heading and ran strip_tags() plus a
 *    link-target strip over it. Here the markdown is already parsed, so the
 *    node's text content is the equivalent input. (Verified: no heading in the
 *    corpus contains inline code, emphasis or a link, so the two agree.)
 *
 * Verified against the pre-migration Sculpin build: 293 headings, 263 distinct
 * ids, 22 percent-encoded, identical multiplicity.
 */

const HEADINGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

/** PHP rawurlencode(): escapes everything outside [A-Za-z0-9-_.~]. */
function rawurlencode(str) {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase()
  );
}

/** PHP strtolower(): byte-wise, ASCII only. */
function asciiLower(str) {
  return str.replace(/[A-Z]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 32));
}

export function sculpinHeaderId(text) {
  let result = text.replace(/(?<=\])\([^)]*\)/g, '');
  result = result.replace(/[ ()[\]]/g, (c) => (c === ' ' ? '-' : ''));
  return rawurlencode(asciiLower(result));
}

export default function satteriSculpinHeadings() {
  return {
    name: 'sculpin-headings',
    element: {
      filter: HEADINGS,
      visit(node, ctx) {
        const id =
          typeof node.properties?.id === 'string'
            ? node.properties.id
            : sculpinHeaderId(ctx.textContent(node));

        // Rebuild the heading with its children moved inside the anchor.
        // `href` is declared before `className` so the serialised attribute
        // order matches the old output: <a href="#id" class="anchorLink">.
        ctx.replaceNode(node, {
          type: 'element',
          tagName: node.tagName,
          properties: { ...node.properties, id },
          children: [
            {
              type: 'element',
              tagName: 'a',
              properties: { href: '#' + id, className: ['anchorLink'] },
              children: node.children,
            },
          ],
        });
      },
    },
  };
}
