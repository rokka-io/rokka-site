---
title: Render
slug: render
description: How to render a source image through rokka into your desired format

---

## Render an image through a stack

The recommended way to render images is through [stacks](stacks.html). Using a stack, the rendering
instructions are stored centrally and the result can be cached. 
For __hash__ you can use either the full hash or the short_hash returned by the API.

```bash
curl -X GET 'https://{organization}.rokka.io/{stack-name}/{hash}.{format}'
```

Note: Additional text after the hash is ignored. You can use this for example to add a
slug to the image URL for SEO purposes. This slug can contain all characters except a `/`.

```bash
curl -X GET 'https://{organization}.rokka.io/{stack-name}/{hash}/{slug}.{format}'
```

## Overwriting stack operation options

If you want to overwrite some stack operation options within the URL, you can do that. For example, if you want to have different resize width, but leave the rest as is.
It's the same format as mentioned below for dynamically rendering an image. You can also add/overwrite stack options.

```bash
'https://{organization}.rokka.io/{stack-name}/resize-width-200--options-dpr-2-autoformat-true/{hash}.{format}'
```

See also the [stack variables chapter](/documentation/references/stacks.html#stack-variables) for another way to overwrite stack operation options.

## Dynamically render an image

You can use the dynamic renderer to specify operations directly in the URL without the need for stacks:

```bash
https://{organization}.rokka.io/dynamic/{operations}/{hash}.{format}
```

URL Operations are concatenated with double hyphens (`--`). For example, to do a resize and then a 
rotate operation, the URL would look like this:

```bash
https://{organization}.rokka.io/dynamic/resize-width-200-height-150--rotate-angle-90/{hash}.{format}
```

You can also add stack options do a dynamic stack, prefix them with `options-`, eg:

```bash
https://{organization}.rokka.io/dynamic/resize-width-200-height-150--rotate-angle-90--options-dpr-2/{hash}.{format}
```


We recommend using stacks instead of the dynamic renderer for a better reusability of your rendered images.

See [operations](../references/operations.html) for the definition of URL operations.

## Rendering animated GIFs

rokka can also render and output animated GIFs in different formats, like animated WebP, MP4 and WebM. 
And can do all the stack operations you can use on a still image. It also automatically delivers in the usually 
much smaller WebP format instead of GIF, if you set `autoformat` to true on the stack. Additionally it optimizes the original GIF to make
it as small as possible in the [asynchronous optimization step](./stacks.html#additional-image-optimizations). The `gif.quality` stack
options defines, how much it should be compressed in this phase. Default is 70, 100 means lossless compression, minimum is 1.

Currently, only animated GIFs are supported as source image. Animated WebP or even videos are not, those are only
supported on the output side. We may add that, if there's demand.

If you just want to return the original animated gif in an optimized format to save bandwidth, create a stack without
operations and set `autoformat` to true.

```javascript
{
    "stack_operations": [],
    "stack_options": {
        "autoformat": true
    }
}
```

The following stack definition would for example add a watermark to your gif and resize it to a width of 300
```javascript
{
    "stack_operations": [
        {
            "name": "composition",
            "options": {
                "mode": "background",
                "secondary_image": "0dee47",
                "anchor": "right_bottom"
            }
        },
        {
            "name": "resize",
            "options": {
                "width": 300
            }
        }
    ],
    "stack_options": {
        "autoformat": true
    }
}
```


Be aware, that the transformation - especially with stack operations on large gifs - will take quite some time on the first hit and you 
may run into time-outs. If that's an issue for you, please report, and we will see, if we can increase some limitations
for you. 

### Output as video
To save even more bandwidth, it's advised to display the animations as video, instead of as a GIF. They will be much smaller.
You have to use the `<video>` on your HTML tag to do this. Eg.

```html
<video autoplay loop muted playsinline poster="https://yourorg.rokka.io/animation/options-autoformat-false/12a82d.jpg">
    <source src="https://yourorg.rokka.io/animation/12a82d.webm" type="video/webm">
    <source src="https://yourorg.rokka.io/animation/12a82d.mp4" type="video/mp4">
</video>
```

## Getting a blurhash from a rendered image

[BlurHash](https://blurha.sh/) is a compact representation of a placeholder for an image. With this short hash you can display "blurry" placeholders
in a webpage before the actual image is loaded. See [https://blurha.sh/](https://blurha.sh/) for more details about this
technique.

Rokka can provide this short hash to you, directly for each rendered image, so you don't have to build/compute that by yourself. 
Use the `blur` "format", eg `https://rokka.rokka.io/plain/68e13ab4522ccd1084e21b721c2b626f5c2634ef.blur`, make a GET request to this and
you'll get the blurhash back. This hash you can then store in your database or similar (along with the rokka hash for example)
and later use it for the blurhash library.

The result looks like this:

<script type="module" src="https://unpkg.com/blurhash-img?module"></script>
<blurhash-img 
  hash="L[JbHoogofbb?wkCRjofxvjroLae"
  style="--aspect-ratio: 840/1260; width: 50%">
</blurhash-img>

for this image

<img src="https://rokka.rokka.io/plain/68e13ab4522ccd1084e21b721c2b626f5c2634ef.jpg" style="width: 50%">

The code for this example using [blurhash-img](https://github.com/fpapado/blurhash-img) is:

```html
<script type="module" src="https://unpkg.com/blurhash-img?module"></script>
<blurhash-img 
  hash="L[JbHoogofbb?wkCRjofxvjroLae"
  style="--aspect-ratio: 840/1260; width: 50%">
</blurhash-img>
```


## Rendering images from a remote URL

See the [Loading images from a remote URL chapter](./stacks.html#loading-images-from-a-remote-url) for more details about that.



## Use another organization as fallback for rendering images

Sometimes you have different rokka organizations for test/stage and production environments, but need the same images 
in both of them. You can easily [copy all images from one org to another](./source-images.html#copy-a-source-image-to-another-organization), 
but this is a long and resource intensive process, when you have many images. 

Another approach, if you only need all the images for rendering and not via API operations, you can set the `render_org_fallback` 
organization option to another organisation. With this setting, whenever an image is not found for rendering in the original
organization, rokka checks the fallback organisation and loads it from there, if available. 

As said, they don't show up in the API, for example the image search. So if your CMS does interact with rokka to read from
those images, you won't get them. But you can still upload or copy the same images later, if you need to.
Also, you still have to copy the stacks from one organization to the other, there's no fallback for them.

To actually be able to link two organizations with this, you need to be admin on both organizations.

```bash
curl -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/organizations/mycompany/options' -d '{"render_org_fallback": "$FALLBACK_ORG"}'
```


## Signed URLs for limited access

rokka has the possibility to let you sign render URLs, so that those URLs are only valid for a certain time or can only be accessed
from certain IP ranges. If you need that feature, get in contact with us.


## Render an image without storing it

Sometimes you just want one rendering of an image and have no use for the image afterwards — a one-off
conversion, a quick preview of what a stack does, a thumbnail for something you keep elsewhere. Uploading
the image, rendering it and deleting it again is a lot of moving parts for that.

For those cases there's `POST /utils/{organization}/render/{stack}.{format}`. You post the image in the
request body and get the rendered result back in the response body. **Nothing is stored**: no source image
is created, the rendering is not cached anywhere, the image never shows up in your source image list or in
your statistics, and there's nothing to clean up afterwards.

```bash
curl -H 'Api-Key: $YOUR_API_KEY' \
     -F 'filedata=@myimage.jpg' \
     'https://api.rokka.io/utils/{organization}/render/{stack}.jpg' \
     --output rendered.jpg
```

Note this goes to `api.rokka.io`, not to `{organization}.rokka.io` — it needs your API key, and the key
needs the `upload` role.

Like the regular render URLs, you can use one of your own stacks, override its operation options, or use
the `dynamic` stack and put the operations right into the URL:

```bash
# one of your stacks
https://api.rokka.io/utils/{organization}/render/mystack.jpg

# one of your stacks, with overridden options
https://api.rokka.io/utils/{organization}/render/mystack/resize-width-100.jpg

# a dynamic stack
https://api.rokka.io/utils/{organization}/render/dynamic/resize-width-200-height-150--rotate-angle-90.jpg
```

Stack variables work as well, pass them as JSON in the `v` query parameter, same as
[for the regular render URLs](./stacks.html).

### When not to use it

Because nothing is cached, **every single call does the full rendering work** — there's no CDN and no render
cache in front of it. It is meant for one-off renderings, not for delivering images to your users. If you
serve the same rendering more than once, upload the image and use the regular
`https://{organization}.rokka.io/{stack}/{hash}.{format}` URLs instead: those are rendered once and then
served from cache.

### Limitations

- The upload is limited to 100 MB. Bigger images have to be uploaded as source images.
- Videos, PostScript/EPS and other non-image files are not supported, nor are the video output
  formats (`mp4`, `webm`, `m3u8`, …). Those need a stored source image. PDFs *are* supported, see
  below.
- The `basestack` and `source_file` stack options are not supported, since both of them refer to a
  stored image.
- Requests are rate limited per organization. A multi-page PDF request costs one request per page.

### Rendering PDFs, and several pages at once

You can post a PDF just like an image. By default you get page 1 back, rendered into whatever format
you asked for, and the [`pdf.page`](stacks.html) and `pdf.dpi` stack options work as usual:

```bash
curl -X POST -H "Api-Key: $API_KEY" -F filedata=@document.pdf \
  "https://api.rokka.io/utils/$ORGANIZATION/render/dynamic/resize-width-800--o-pdf.page-3.png" \
  -o page3.png
```

To get **several pages in one request**, use the `pdf.pages` stack option. The response is then a ZIP
file with one `page-{n}.{format}` entry per page:

```bash
curl -X POST -H "Api-Key: $API_KEY" -F filedata=@document.pdf \
  "https://api.rokka.io/utils/$ORGANIZATION/render/dynamic/resize-width-800--o-pdf.pages-1,3,5..7.png" \
  -o pages.zip

unzip -l pages.zip
#   page-1.png
#   page-3.png
#   page-5.png
#   page-6.png
#   page-7.png
```

The syntax is a comma separated list of page numbers and ranges, or `all` for the whole document:
`3`, `1,3,5`, `2..6`, `1,4..6,9`, `all`. Pages are counted from 1.

<div class="alert alert-info">
Ranges are written with <code>..</code> and <strong>not</strong> with <code>-</code>, because
<code>-</code> already separates stack options in the URL. <code>o-pdf.pages-1-5</code> is a syntax
error, <code>o-pdf.pages-1..5</code> is what you want.
</div>

A few things worth knowing:

- The response is **always** a ZIP when `pdf.pages` is set, even if it resolves to a single page. That
  way you never have to guess what came back.
- Pages are deduplicated and always returned in ascending order, so `5,1,3` and `1,3,5` give you the
  same archive.
- At most **50 pages** per request. Asking for `all` on a longer document is an error rather than a
  silently truncated archive — request the pages in batches instead (`1..50`, `51..100`, …).
- Every rendered page counts as one request against the rate limit, so a 10 page request uses 10 of
  your requests per minute.
- Asking for a page the document does not have is an error, and the message tells you how many pages
  it actually has.
- `pdf.pages` only works on this endpoint. For a stored PDF, use `pdf.page` and render one page per
  URL — those are cached and served from the CDN.