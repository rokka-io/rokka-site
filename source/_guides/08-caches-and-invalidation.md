---
title: Render caches and invalidation
use: [guides]
---

# General info about rokka's render caches

rokka assumes that a picture rendered and delivered via a unique URL never changes and be cached for a long time. That's one of the reasons, why we use unique hashes for an image and its output-changing metadata (like subject areas). This has some implications you should be aware of.

Under this assumption that the output for a unique URL never changes, we send very long expiry times in the HTTP headers (one year), so that end-users (eg. browsers) can keep them in their local cache. It also tells the content delivery network (CDN) the same for the best end user experience and keep those images close to the end user in the CDN edge caches and never hits the backend again.

## Updating stacks

As rokka assumes that a unique URL always delivers the same image, it also assumes that a once defined stack does not change significantly with the same name and suddenly delivers a totally different style of pictures. If you do that, then a before rendered image would not change, if it's a already cached in one of the CDN edge caches.

We highly recommend to create a new stack with a different name, if you want to guarantee that not an old image will be delivered to your end users, since then the render URL also changes.

Nevertheless, there are situations where overwriting a stack with the same name may be useful. Basically, if you are fine when already delivered images stay the same and only newly generated get the new options/operations (eg. for changing the quality). Or you want to base an existing stack on a base stack to reorganize your stack with less repetition.

While we can delete the CDN caches, there's no way to delete a browser cache without a new URL (or other cache busting techniques).

There's currently no API call for deleting the CDN cache for a certain stack. So even if you have the browser cache under control (eg. during development of a new site), you can't delete the CDN cache without talking to us (but don't hesitate to ask us). We're willing to implement an API endpoint for this, if there's enough demand for it.

## Deleting images and stacks

If you delete a source image (or a stack) on the backend via the API, the already rendered images from that will still remain in the CDN caches, until they expire. So people still can access the rendered output of it. This usually is not a problem, but may be if you for example have to delete an image for copyright or privacy reasons.  

There's also no API endpoint for doing that from your side, get in contact with us, if you have to delete single images (or stacks) from the CDN caches.  We're of course willing to implement an API endpoint for this, if there's enough demand for it.

As a sidenote, you're not charged for storage used in the CDN caches, just for the storage on your source images. So if you delete a source image via the API, you won't be charged anymore for that storage .