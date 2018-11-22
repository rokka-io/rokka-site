---
title: Render
use: [references]
---

## Render an image through a stack

The recommended way to render images is through [stacks](stacks.html). Using a stack, the rendering
instructions are stored centrally and the result can be cached. 
For __hash__ you can use either the full hash or the short_hash returned by the API.

```language-bash
curl -X GET 'https://{organization}.rokka.io/{stack-name}/{hash}.{format}'
```

Note: Additional text after the hash is ignored. You can use this for example to add a
slug to the image URL for SEO purposes:

```language-bash
curl -X GET 'https://{organization}.rokka.io/{stack-name}/{hash}/{slug}.{format}'
```

## Overwriting stack operation options

If you want to overwrite some stack operation options within the URL, you can do that. For example, if you want to have different resize width, but leave the rest as is.
It's the same format as mentioned below for dynamically rendering an image. You can also add/overwrite stack options.

```language-bash
'https://{organization}.rokka.io/{stack-name}/resize-width-200--options-dpr-2-autoformat-true/{hash}.{format}'
```


## Dynamically render an image

You can use the dynamic renderer to specify operations directly in the URL without the need for stacks:

```language-bash
https://{organization}.rokka.io/dynamic/{operations}/{hash}.{format}
```

URL Operations are concatenated with double hyphens (`--`). For example, to do a resize and then a 
rotate operation, the URL would look like this:

```language-bash
https://{organization}.rokka.io/dynamic/resize-width-200-height-150--rotate-angle-90/{hash}.{format}
```

You can also add stack options do a dynamic stack, prefix them with `options-`, eg:

```language-bash
https://{organization}.rokka.io/dynamic/resize-width-200-height-150--rotate-angle-90--options-dpr-2/{hash}.{format}
```


We recommend using stacks instead of the dynamic renderer for a better reusability of your rendered images.

See [operations](../references/operations.html) for the definition of URL operations.

## Rendering animated GIFs

rokka can also render and output animated GIFs in different formats, like animated WebP, MP4 and WebM. 
And can basically do all the stack operations you can use on a still image. It also automatically delivers in the usually 
much smaller WebP format instead of GIF, if you set `autoformat` to true on the stack. Additionally it optimizes the original GIF to make
it as small as possible in the [asynchronous optimization step](./stacks.html#additional-image-optimizations). The `gif.quality` stack
options defines, how much it should be compressed in this phase. Default is 60, 100 means lossless compression, minimum is 1.

Currently, only animated GIFs are supported as source image. Animated WebP or even videos are not, those are only
supported on the output side. We may add that, if there's demand.

If you just want to return the original animated gif in an optimized format to save bandwidth, create a stack without
operations and set `autoformat` to true.

```language-javascript
{
    "stack_operations": [],
    "stack_options": {
        "autoformat": true
    }
}
```

The following stack definition would for example add a watermark to your gif and resize it to a width of 300
```language-javascript
{
    "stack_operations": [
        {
            "name": "composition",
            "options": {
                "mode": "background",
                "secondary_image": "0dee47",
                "anchor": "right_bottom"
            }
        }
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

```language-html
<video autoplay loop muted playsinline poster="https://yourorg.rokka.io/animation/options-autoformat-false/12a82d.jpg">
    <source src="https://yourorg.rokka.io/animation/12a82d.webm" type="video/webm">
    <source src="https://yourorg.rokka.io/animation/12a82d.mp4" type="video/mp4">
</video>
```





