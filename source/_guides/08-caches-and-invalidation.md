---
title: Render caches and invalidation
use: [guides]
---

## General info about rokka's render caches

rokka assumes that a picture rendered and delivered via a unique URL never changes and be cached for a long time. That's one of the reasons, why we use unique hashes for an image and its output-changing metadata (like subject areas). This has some implications you should be aware of.

With this assumption that the output for a unique URL never changes, we send very long expiry times in the HTTP headers (one year), so that end-users (eg. browsers) can keep them in their local cache. It also tells the content delivery network (CDN) the same for the best end user experience and keep those images close to the end user in the CDN edge caches and never hits the backend again.

## Updating stacks

As rokka assumes that a unique URL always delivers the same image, it also assumes that a stack, once defined with a specific name, does not change significantly and suddenly delivers a totally different style of pictures. If you do that, images already rendered with that stack will not change in the CDN edge caches nor in browsers that already requested those images (we do have some control over edge caches, but the browsers also cache the images and never request it again).

If you need to change a stack that has already been used in production, we highly recommend to create a new stack with a different name. This will change the render URL, and therefore guarantee that the effects of the new stack rules are seen by all clients.

However, you can get a fresh render of an image with appending the "filename" part with a `v` and some numbers. If you already fetched an image with eg. `https://rokka.rokka.io/plain/68e13ab4522ccd1084e21b721c2b626f5c2634ef.jpg` and then update that stack, you can get a fresh copy from the backend with `https://rokka.rokka.io/plain/68e13ab4522ccd1084e21b721c2b626f5c2634ef/v1.jpg` or also with `https://rokka.rokka.io/plain/68e13ab4522ccd1084e21b721c2b626f5c2634ef/some_name-v1.jpg`. As long as the number after the `v` is different, it gets a new render from the backend. But it needs to be at the very end of the filename. This can help when you overwrite a stack and want to test the new output. Or you wanna make sure all your clients get a fresh copy.

Nevertheless, there are situations where overwriting a stack with the same name may be useful. Basically, if you are fine when already delivered images stay the same and only newly generated get the new options/operations (eg. for changing the quality). Or you want to base an existing stack on a base stack to reorganize your stack with less repetition.

While we can delete the CDN caches, there's no way to delete a browser cache without a new URL (or appending versioned query parameters, for example).

There's currently no API call for deleting the CDN cache for a certain stack. So even if you have the browser cache under control (eg. during development of a new site), you can't delete the CDN cache without talking to us (but don't hesitate to ask us). We're willing to implement an API endpoint for this, if there's enough demand for it.

## Deleting images and stacks

If you delete a source image (or a stack) on the backend via the API, images already rendered with it will still remain in the CDN caches, until they expire. So people still can access the rendered output of it. This usually is not a problem, but may be if you for example have to delete an image for copyright or privacy reasons.  

There's also no API endpoint for deleting all traces of a specific image. Get in contact with us, if you have to delete single images (or stacks) from the CDN caches.  We're of course willing to implement an API endpoint for this, if there's enough demand for it.

As a sidenote, you're not charged for storage used in the CDN caches, just for the storage on your source images. So if you delete a source image via the API, you won't be charged anymore for that storage .