# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static website for [rokka.io](https://rokka.io/) — marketing pages plus product documentation (guides + API reference). Built with [Astro](https://astro.build/) 7. Bilingual output (English + German). The rokka dashboard (a separate React app) is pulled in at build time and embedded under `/dashboard/`.

Migrated from Sculpin (PHP) + Gulp in 2026. There is no PHP, no Composer and no Gulp any more.

## Commands

Node 22 (`.nvmrc`). Install once with `npm ci`.

```bash
npm run dev        # dev server on :4321
npm run build      # production build into dist/
npm run preview    # serve the built dist/
```

Containerized build (image `docker.gitlab.liip.ch/rokka/rokka-site-build-docker:node22`; build it first with `./docker/build.sh` if missing):

```bash
./buildWithDocker.sh
```

Embed the dashboard into `dist/dashboard/` and `dist/assets/dashboard/` (separate step, run *after* `npm run build`):

```bash
./install-dashboard.sh
```

Deploy `dist/` to S3 + invalidate CloudFront (`./build.sh` does build + deploy together):

```bash
./deploy2aws.sh
```

Broken link check — run `npm run preview` first, then see the `blc` command in README.md.

There is no test suite. The migration was verified by diffing against the previous Sculpin output; see "Verifying output" below.

## Architecture

### The URL contract

This is the most important constraint in the repo. The URL shape is inherited from the Sculpin build and must not change:

| URL | Source |
| --- | --- |
| `/index.html` | English landing page |
| `/en/…`, `/de/…` | `index`, `contact/`, `signup/`, `pagenotfound/`, `error/` |
| `/documentation/index.html` | docs landing, **English only** |
| `/documentation/{guides,references,demos}/<slug>.html` | 26 docs, **English only**, flat `.html` files |

`/` and `/en/` are byte-identical copies of the landing page.

This mix of pretty directories and flat `.html` files only works because of **`build.format: 'preserve'`** in `astro.config.mjs`, which emits files exactly as they sit in `src/pages/`. Changing that setting breaks every documentation URL.

### Bilingual handling

Astro's `i18n` routing is deliberately **not** used — the `/` + `/en/` duplication and the English-only `/documentation/` tree don't fit it. Instead:

- `src/pages/[lang]/…` with `getStaticPaths()` returning `en` and `de` (see `languagePaths()` in `src/data/site.ts` — it is a *function*; returning a shared array makes several routes collide and the build fails with `NoMatchingStaticPathFound`).
- `src/pages/index.astro` renders the same `<Landing lang="en" />` as `/en/`.
- `src/data/site.ts` exposes `getSite(lang)`, which returns the same object shape the old Twig templates read as `site` — so `site.text.navigation.contact` still works.
- Translations live in `src/data/text.{en,de}.yml` and `src/data/pagedata.yml`, imported with `?raw` and parsed by js-yaml. **Use `?raw`, not `fs.readFileSync`** — the YAML files are not emitted next to the bundled chunk, so a runtime read fails during prerender.
- Many translation strings contain HTML (`<br>`, `<span class="nbsp">`), which is why templates use `set:html` — the Twig originals used `|raw`.

### Documentation content

`src/content/{guides,references,demos}/*.md`, wired up in `src/content.config.ts`.

Two things that bite:

- **The numeric filename prefix (`00-`, `05-`, `10-`…) is the sidebar order.** Sort with `byFilename` from `src/content.config.ts`, which sorts on `filePath` — *not* `id`, because a front-matter `slug` overrides the glob loader's generated `id` and sorting on `id` silently gives you an alphabetical sidebar.
- **`slug:` in front matter is the public URL** and is pinned for all 26 pages. Under Sculpin the URL was derived from the *title*, so renaming a heading used to move a published page (`03-upload-an-image.md` is still served as `upload-and-render-an-image.html`). Never change a slug.

Other front matter: `title`, `description`, `head` (selects a per-page `<head>` fragment), `body_attributes` (raw attributes spliced onto `<body>`, always an `onload=` for the demos).

### Heading IDs — do not touch without reading this

`plugins/satteri-sculpin-headings.mjs` reproduces Sculpin's heading-id algorithm and the self-linking `<a class="anchorLink">` wrapper.

Sculpin did **not** use GitHub-style slugs. It mapped spaces to dashes, deleted `()[]`, lowercased, then `rawurlencode`d the rest, so the live site has 22 percent-encoded anchors like `#deep-paging-beyond-10%2C000-hits` and `#general-info-about-rokka%27s-render-caches` that are linked from outside this repo. Three traps:

- PHP `rawurlencode()` escapes `!'()*`; `encodeURIComponent()` does not.
- PHP `strtolower()` is ASCII-only; JS `toLowerCase()` folds more.
- PHP Markdown Extra does **not** deduplicate ids (`references/operations.html` has `id="properties"` 21 times). Astro's own heading-ids plugin dedupes with github-slugger, so ours must run first and claim the id — user `hastPlugins` run before Astro's built-ins, and Astro's plugin respects an id that is already set (and reuses it for the `headings` array the ToC reads).

### Markdown engine settings that matter

Astro 7 uses **satteri**, not remark/rehype. `markdown.rehypePlugins` is ignored; extend the pipeline via `satteri({ hastPlugins: [...] })`.

Two non-default settings in `astro.config.mjs`, both needed to match the published site:

- `features.smartPunctuation: false` — Sculpin ran plain `PhpMarkdownExtraParser` with no SmartyPants. Leaving this on rewrites body copy *and* changed a live anchor (`#using-a-temporary-%22_preview%22-stack`).
- `syntaxHighlight: false` — the site ships bare `<pre><code class="language-bash">` and colours it with CSS. Shiki would restyle every code block.

Code fences use standard CommonMark (```` ```bash ````). They used to be written ```` ```language-bash ```` for PHP Markdown Extra, which used the info string verbatim as the class; CommonMark prefixes it, so that spelling now yields `language-language-bash`.

### Layouts and components

```text
src/layouts/Base.astro     # was _views/default.html; Twig blocks are named slots
src/layouts/DocLayout.astro  # was guide.html + reference.html (differ only by sidebar)
src/layouts/DemoLayout.astro # was demo.html
src/layouts/Landing.astro    # was landingpage.html
src/components/head/         # the five per-page <head> fragments
```

`src/components/head/PageHead.astro` maps the front-matter `head:` key to a component — Sculpin used a dynamic `{{ include(page.header_include) }}`, which Astro cannot do.

**Scripts in the demos and the pricing calculator must stay `is:inline`.** The markup calls `updateImage()`, `urlchange()`, `loaded()` and `calculatePrice()` from inline `onload=`/`onkeyup=`/`onchange=` attributes, which only reach globals. Note that `define:vars` wraps a script in an IIFE, so anything it declares needs an explicit `window.foo = foo` (see the calculator in `Landing.astro`).

### Styling

- `src/styles/rokka.scss` is the single entry point, imported once from `Base.astro`.
- `src/styles/vendor/liip-styleguide/` is a frozen 2018 snapshot with no upstream. It stays on legacy `@import` (it pulls a precompiled 406 KB `toolkit.css` in as if it were a partial and relies on global `@import` scope), so `astro.config.mjs` silences the Sass deprecations. Don't try to convert it to `@use`.
- `toolkit.css` resolves its `@font-face` as `url("../fonts/Archivo-*.woff2")`, so `dist/assets/toolkit/styles/` and `.../fonts/` must stay siblings.
- SVGs in `src/assets/images/` are imported as Astro components (`<RokkaLogo class="…" />`) and inlined. This is **load-bearing, not an optimisation**: `rokka.scss` recolours their internals via `currentColor`/`stroke` descendant selectors, which only works on inline SVG.

### Verifying output

The pre-migration Sculpin build is the reference. To check a change hasn't shifted the published markup, build the site and diff against a known-good copy — the scripts used during the migration compared normalised HTML per page, the full heading-id multiset, and the ToC href list. Anchor IDs are the highest-risk thing to regress.

## Conventions

- Documentation is English-only by design — don't add German translations under `src/content/`.
- When editing documentation prose, prefer fixing it in place rather than restructuring — the numeric-prefix ordering and existing anchor IDs are referenced from elsewhere.

## Known pre-existing quirks, deliberately preserved

- `/` declares `https://rokka.io/en/` as its canonical, not `/`.
- `/en/pagenotfound/` and `/de/pagenotfound/` both declare `https://rokka.io/pagenotfound`, which does not exist. Same for `/error/`.
- `/en/error/` and `/de/error/` render the site chrome around an *empty* content area: the original wrapped its text in `{% block header %}`, a block `default.html` never defined, so it was discarded.
- The pricing tiers are duplicated between the HTML tables and the calculator's JS objects in `Landing.astro`.
