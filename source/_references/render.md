---
title: Render
use: [references]
---

## Render an image through a stack

The recommended way to render images is through [stacks](stacks.html). Using a stack, the rendering
instructions are stored centrally and the result can be cached:

```bash
curl -X GET 'https://{organization}.rokka.io/{stack-name}/{hash}.{format}'
```

Note: Additional text after the hash is ignored. You can use this for example to add a
slug to the image URL for SEO purposes:

```bash
curl -X GET 'https://{organization}.rokka.io/{stack-name}/{hash}/{slug}.{format}'
```

## Dynamically render an image

For debugging, you can use the dynamic renderer to specify operations directly in the URL:

```bash
curl -X GET 'https://{organization}.rokka.io/dynamic/{operations}/{hash}.{format}'
```

URL Operations are concatenated with double hyphens (`--`). For example, to do a resize and then a 
rotate operation, the URL would look like this:

```bash
'https://{organization}.rokka.io/dynamic/resize-width-200-height-150--rotate-angle-90/{hash}.{format}'
```

Do not use the dynamic renderer for production output, but create stacks instead. The output is not cached.

See [operations](../references/operations.html) for the definition of URL operations.
