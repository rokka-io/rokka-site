Rokka
=====

This is the repository for [rokka.io](https://rokka.io/) which includes documentation and general information about the image delivery service.

Built with [Astro](https://astro.build/). Node 22 (see `.nvmrc`).

Local Development
-----------------

```bash
npm ci
npm run dev
```

and then open [http://localhost:4321](http://localhost:4321) in your browser.

To build and inspect exactly what gets deployed:

```bash
npm run build
npm run preview
```

Check for broken links
----------------------

Run `npm run preview` as mentioned above, then do

```bash
./node_modules/.bin/blc http://localhost:4321/documentation --filter-level 3 -ro --exclude https://www.liip.ch/en/blog/tags/rokka --exclude https://www.drupal.org/project/rokka --exclude http://localhost:4321/dashboard/#/signup
```

For some strange reason, the blog/tags and drupal links are 404, that's why we exclude them here.


Documentation
-----------------

Documentation is split into guides and the API reference. Both are written in [markdown](https://daringfireball.net/projects/markdown/).
Have a look at the existing files under `src/content/guides`, `src/content/references` and `src/content/demos`.

Two things to know before editing:

- The numeric filename prefix (`00-`, `05-`, `10-`, …) sets the order in the sidebar. Leave gaps so pages can be inserted later.
- Every page has an explicit `slug:` in its front matter, and that slug is the public URL. Changing it breaks incoming links, so don't, even if the title changes.

Deployment
----------

`./buildWithDocker.sh` builds in a container, `./install-dashboard.sh` adds the
dashboard app, and `./deploy2aws.sh` syncs `dist/` to S3 and invalidates
CloudFront. `./build.sh` builds and deploys in one step.
