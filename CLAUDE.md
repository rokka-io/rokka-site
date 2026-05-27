# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static website for [rokka.io](https://rokka.io/) — marketing pages plus product documentation (guides + API reference). Built with [Sculpin](https://sculpin.io/) (PHP static site generator) and orchestrated through Gulp. Bilingual output (English + German). The rokka dashboard (a separate React app) is pulled in at build time and embedded under `/dashboard/`.

## Commands

Requires Node 18 (see `.nvmrc` says 18) and PHP 8.0 with Composer. Install once:

```bash
composer install && npm ci
```

Local development (clean → compile → copy → inject SVGs → BrowserSync on :3000, with file watchers):

```bash
./node_modules/.bin/gulp           # default task
```

Production build (writes to `dist/`, used by the deploy scripts):

```bash
./node_modules/.bin/gulp build:prod
```

Containerized build (uses prebuilt image `docker.gitlab.liip.ch/rokka/rokka-site-build-docker:node22`; build the image first with `./docker/build.sh` if missing):

```bash
./buildWithDocker.sh
```

Embed the dashboard build into `dist/dashboard/` and `dist/assets/dashboard/`:

```bash
./install-dashboard.sh             # clones rokka-io/rokka-dashboard and runs its prod build
```

Deploy `dist/` to S3 and invalidate CloudFront (requires AWS creds):

```bash
./deploy2aws.sh                    # prod bucket s3://rokka-io/
# or use build.sh which builds AND deploys
```

Broken link check (run dev server first):

```bash
./node_modules/.bin/blc http://localhost:3000/documentation --filter-level 3 -ro \
  --exclude https://www.liip.ch/en/blog/tags/rokka \
  --exclude https://www.drupal.org/project/rokka \
  --exclude http://localhost:3000/dashboard/#/signup
```

There is no test suite.

## Architecture

### Content sources (`source/`)

Sculpin reads markdown and HTML from `source/`. Content types are configured in `app/config/sculpin_kernel.yml`:

- `source/_guides/*.md` → `documentation/guides/:slug_title.html`
- `source/_references/*.md` → `documentation/references/:slug_title.html`
- `source/_demos/*.md` → `documentation/demos/:slug_title.html`
- Sculpin's default `posts` content type is **disabled** — do not add `_posts/`.
- Layout templates live in `source/_views/` (`default.html`, `guide.html`, `reference.html`, `demo.html`, `landingpage.html`, `library.html`).
- Reusable HTML fragments live in `source/_partials/` (footer, navbar, tag_manager, article_list, demos_list).
- Numeric filename prefixes (`00-`, `05-`, `10-`…) control the ordering of guides/references in navigation. Keep the prefix scheme intact when adding new pages and pick a number that slots into the desired position.

### Bilingual build

The site is built twice, once per language, and the outputs are stitched together in `gulpfile.js → compile:html`:

- Sculpin envs `local_en`, `local_de`, `stage_*`, `prod_*` correspond to configs in `app/config/sculpin_site_<env>_<lang>.yml`.
- Each env imports `translations/text_<lang>.yml` and `pagedata.yml`.
- Build pipeline runs `sculpin generate --env=<env>_<lang>` once per language, producing `output_<env>_en/` and `output_<env>_de/`.
- These are then copied into `dist/`:
  - `output_*_en/index.html` → `dist/index.html` (English is the root)
  - `output_*_en/documentation/**` → `dist/documentation/` (docs only exist in English)
  - `output_*_en/**` → `dist/en/`
  - `output_*_de/**` → `dist/de/`
- After the copy step, `dist/{en,de}/documentation/` is deleted so docs are only served from `/documentation/`.

When adding pages, remember the path will be reachable at both `/<page>` (en, via `dist/en/`) and `/de/<page>`, *except* documentation which lives only at `/documentation/`.

### Assets (`source-assets/`)

- SCSS entry: `source-assets/styles/rokka.scss` → `dist/assets/styles/` (autoprefixed; no minification step is enabled).
- JS entry: `source-assets/scripts/*.js` → concatenated via `gulp-include`, minified with uglify in `build:prod`.
- `source-assets/liip-styleguide/` is a vendored toolkit (fonts, icons, base SCSS settings). Most of it is gitignored; only the files explicitly un-ignored in `.gitignore` are tracked.
- `gulp inject` inlines optimized SVGs into the built HTML via `gulp-inject-svg` after Sculpin runs.
- `source-assets/.well-known/` is copied to `dist/.well-known/` (and `security.txt` to `dist/`).

### Custom Sculpin extension

`src/SculpinTools/AddLinksToId.php` is a Sculpin event subscriber registered in `sculpin_kernel.yml`. It runs after every markdown conversion and:

1. Wraps the contents of any `<h1>`–`<h6>` that has an `id` in an `<a class="anchorLink" href="#id">` so headings are self-linking.
2. Generates a Table of Contents from h2/h3 headings and prepends it to the page.

Touching markdown front matter or heading structure can change TOC output; the extension only operates on headings carrying an `id` (PHP Markdown Extra emits these automatically when using `## Heading {#id}` or via the parser config).

### Dashboard integration

`install-dashboard.sh` clones [rokka-io/rokka-dashboard](https://github.com/rokka-io/rokka-dashboard) into `./rokka-dashboard/` (gitignored), builds it as a React app with `PUBLIC_URL=/assets/dashboard` and the rokka GTM tag injected, then copies:

- `build/static`, `build/*.json`, `build/*.ico` → `dist/assets/dashboard/`
- `build/index.html` → `dist/dashboard/index.html`

This is not part of `gulp build` — it's a separate step in the deployment pipeline.

### Deployment

`build.sh` runs `gulp build:prod` then `aws s3 sync dist/ s3://rokka-io/` and a CloudFront invalidation against distribution `E389UMLNXZS9QN`. A stage bucket (`stage-rokka-io` / `E2JJ5XIPU77PVR`) is commented out in the script.

## Conventions

- Node version is pinned to 18 (`.nvmrc`, Docker image, `install-dashboard.sh`). Newer Node may break the gulp 4 / gulp-sass 5 toolchain.
- Documentation is English-only by design — don't add German translations for files under `_guides` / `_references` / `_demos`.
- When editing documentation prose, prefer fixing it in place rather than restructuring — the numeric-prefix ordering and existing anchor IDs are referenced from elsewhere.
