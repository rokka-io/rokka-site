import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import satteriSculpinHeadings from './plugins/satteri-sculpin-headings.mjs';

export default defineConfig({
  site: 'https://rokka.io',

  // 'preserve' emits files exactly as they sit in src/pages/, which is the only
  // format that reproduces the URL contract the Sculpin build had:
  //   src/pages/[lang]/contact/index.astro -> /en/contact/index.html   (pretty)
  //   src/pages/documentation/guides/[slug].astro -> /documentation/guides/x.html
  // 'directory' would turn the docs into .../x/index.html and 'file' would turn
  // /en/contact/ into /en/contact.html. Both would break live URLs.
  build: { format: 'preserve' },

  markdown: {
    // Sculpin shipped bare `<pre><code class="language-bash">` and left the
    // colouring to CSS (rokka.scss carries Prism token styles). Astro would
    // otherwise inline a full Shiki github-dark theme, which is a visible
    // redesign of every code block on the site.
    syntaxHighlight: false,

    processor: satteri({
      // Runs before Astro's own heading-ids plugin -- see the plugin's header.
      hastPlugins: [satteriSculpinHeadings()],
      features: {
        // Sculpin ran plain PhpMarkdownExtraParser with no SmartyPants, so the
        // published pages contain straight quotes and literal dashes: zero “ ”
        // in the whole documentation tree. Satteri defaults this on, which
        // rewrote body copy and, worse, changed an anchor
        // (#using-a-temporary-%22_preview%22-stack) that is a live URL.
        smartPunctuation: false,
      },
    }),
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // The vendored Liip styleguide is legacy Sass: it relies on global
          // @import scope and pulls in a precompiled toolkit.css as if it were
          // a partial. Neither works under @use, and there is no upstream to
          // update, so the deprecation warnings are silenced rather than fixed.
          quietDeps: true,
          silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'legacy-js-api'],
        },
      },
    },
  },
});
