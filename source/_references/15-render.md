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
