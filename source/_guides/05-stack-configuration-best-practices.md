---
title: Best practices for stack configurations 
use: [guides]
---

## Best practices for stack configurations 

While the default values for rokka stacks are chosen with decent values, there are some details you can  adjust to have 
an impact on either the size of your images or the way you can use them.

Therefore we'd like present here some of our recommended best practice for configuring a rokka stack to get the most out
 of rokka's possiblities.

Not all of them are always appropriate for your situation (that's why they are not defaults), but it's good to know
what they are and for what they're good and for what not. We're sure with this you can deliver the best possible
 images with the smallest sizes to provide your visitor a great experience.  
 
At the end of the article, you'll find a complete example of all the recommendations here. You can pick the things you 
want or apply to your use cases and leave the other things out. 

### Get the "original" image without scaling

While you can use the `dynamic` route without any parameters to get the image in the size as it was uploaded, we recommend
to create a stack dedicated to that purpose. Create the stack without any operations. We recommend to enable the `autoformat`
option to have the stack deliver webp if supported by the client:

```language-json
{
  "options": { "autoformat": true }
}
```

We like to call this stack `original`.

Note: This stack (nor the `dynamic` route) return you the exact same binary data of the image. The image size is preserved
but rokka re-encodes the image to optimize size and quality.

### The "traditional" resize & crop stack

One of the most common stack configurations is the resize & crop an image to ensure that all images have the exactly same
size no matter the size and aspect ratio of the source image. 

If the rendered image should have a size of 900 x 600 pixels, the stack configuration would be the following:

```language-json
{
  "operations": [
    {
      "name": "resize",
      "options": {
        "mode": "fill",
        "width": "900",
        "height": "600 "
      }
    },
    {
      "name": "crop",
      "options": {
        "width": "900",
        "height": "600 "
      }
    }
}
```

This configuration first [resizes](/documentation/references/operations.html#resize) an image, so that it totally fills
the defined width and height. The crop operation afterwards clips the parts of the image overflowwing that box.

### Autoformat for delivering the best suitable image format

The first thing you should do is setting the stack option `autoformat` to true.

With this option, rokka will choose the best possible format of an image based on different parameters,  instead of the
one you provided in the render URL. The most apparent benefit is to deliver WebP instead of JPEG or PNG to capable browsers. 
But there's more (like deliver JPEG instead of PNG, if it's a photo or vice versa for charts and such). 
Read more about it in the [autoformat chapter](/documentation/references/stacks.html#autoformat).

Add this `options` part to your stack configuration to enable it.

```language-json
{
  "operations" : [...]
  "options": { "autoformat": true }
}
```

### flexible resize & crop with variables

While we recommend doing a stack for each size of rendered images you need, sometimes you want to be able to define
the size via the render URL. With the current configuration, you need a way too long URL with 
[overwriting stack operation options](/documentation/references/render.html#overwriting-stack-operation-options) for that, eg.

```language-bash
'https://{organization}.rokka.io/{stack-name}/resize-width-1200-height-900-crop-width-1200-height-900/{hash}.{format}'
```

That's where [stack variables and expressions](/documentation/references/stacks.html#expressions) come as very useful.
To make this as flexible as possible for us, we define some variables and change some operation options to expressions with the following config:

```language-json
{
  "operations": [
    {
      "name": "resize",
      "options": {
        "mode": "fill"
      },
      "expressions": {
        "width": "$finalWidth",
        "height": "$finalHeight"
      }
    },
    {
      "name": "crop",
      "options": {},
      "expressions": {
        "width": "$finalWidth",
        "height": "$finalHeight"
      }
    }
  ],
  "options": {
    "autoformat": true
  },
  "variables": {
    "defaultWidth": 900,
    "defaultHeight": 600,
    "w": 0,
    "h": 0,
    "r": "$defaultWidth / $defaultHeight",
    "finalWidth": "$w == 0 ? ($h == 0 ? $defaultWidth : ($h * $r)) : $w",
    "finalHeight": "$h == 0 ? $finalWidth / $r : $h"
  }
}
```


And now you can change those variables in a render URL with the following URL format:

```language-bash
https://{organization}.rokka.io/{stack-name}{stackVariables}/{hash}.{format}
```

The variables and expressions together cover a lot of use cases. Mainly interesting are the variables `w` for the image width, `h` for the image height and `r` for the aspect ratio.
You can get an image with just defining one of them or a combination of those. The most often used case would certainly be to just define the width and this stack configuration takes care of the rest. See the table below for some examples.

The others are either for default values for width and height (which you can of course set to your needs), 
or some "temporary" variables to avoid repetition.

| {stackVariables} | result |
| --------- | ----------- |
|  | If you don't add stack variables, it returns the default size of 900 x 600 |
| /v-w-1200 | Resizes & crops the image to a width of 1200 and the same aspect ratio as the defaults (a width of 800 in the example)
| /v-h-800 | Resizes & crops the image to a height of 800 and the same aspect ratio as the defaults. |
| /v-w-1000-h-800 | Resizes & crops the image to a width of 1000 and height of 800, ignoring the default ratio.|
| /v-r-1.2 | Sets the aspect ratio to 1.2 and uses the default width. Ends in a height of 750 in the example. |
| /v-r-1.25-w-1000 | Resizes & crops the image to a width of 1000 with an aspect ratio of 1.25. Ends in a height of 800. |  


### Upscaling

rokka by default upscales images in the resize operation to the defined size, even if the source image is smaller than that.
This guaruantees that the rendered image always has the size given or expected by the browser.

But since upsizing images doesn't make them better and browsers can do the upsizing as well, it just adds unneeded bytes
to your traffic. 

To turn off upscaling in resizing, there are the [resize operation](/documentation/references/operations.html#resize) 
options `upscale` and `upscale_dpr to control that.

It's very important to make sure browsers still show images in the right size, when you turn those options off. 
You basically have to tell the browsers, how big (or at least how wide) your images should be shown to be on the safe side. 
We also reccomend to read [this blog post about resizing and responsive images](https://www.liip.ch/en/blog/things-you-should-know-about-responsive-images)
 for more background information about this.

To make this better configurable we introduce another render variable: `s` (for scaling), we will also need it later again for another use case.
If this variable is set to 1, it will scale the image to the defined size, even if the source image is smaller. If it's set to 0, it won't do this and just output the original size. 

What you prefer as default, is up to you. In our example it's "0", so we don't upscale by default. If you then have a place 
in your HTML where you can't set the image width with CSS, you add `v-s-1` to your render URL and will get an image
in the defined size, eg.

```language-bash
'https://{organization}.rokka.io/{stack-name}/v-w-500-s-1/{hash}.{format}'
```

The relevant parts in the config look like this (the full example is at the end of this article)

```language-json
{
  "operations": [
    {
      "name": "resize", 
      "expressions": {
        "upscale": "$s == 1 ? true : false",
        "upscale_dpr": "$s == 1 ? true : false"
         ...
        
  "variables: {
    "s": 0
    ...     
          
```

By the way, the crop operation after the resize is smart enough to know that an image eventually wasn't upscaled due to this setting and still will 
crop like expected. You could also set the option "mode" to "ratio" for the crop operation, which has the same effect.


### Retina/high-dpi screens and responsive images.

In today's time of high-dpi screens (also known as retina screens) and mobile devices, it's important to deliver the
right image for the right screen size and device-pixel-ratio (dpr). CSS and HTML have some tricks on stock for that and
rokka can help in delivering them.

The easiest way to deliver an image for retina screens and non-retina screens is using the `srcset` attribute. 
This would look like the following with rokka:

```language-html
<img 
   src="https://{organization}.rokka.io/{stack-name}/{hash}.{format}" 
   srcset="https://{organization}.rokka.io/{stack-name}/o-dpr-2/{hash}.{format} 2x" 
>
```

As you can see, you have to add a `2x` to the `srcset` attribute for telling the browser, that it should take this on
retina screens. And then you just add `/o-dpr-2` after the stack name in the render URL to tell rokka to deliver an
image twice the size.

Instead of the `2x` identifier, you can also define how wide possible rendered images are with a `w` identifier, eg. 
 `https://{organization}.rokka.io/{stack-name}/v-w-1800/{hash}.{format} 1800w`, also for multiple sizes.
Together with the `sizes` attribute the browser can then take the best suited picture, especially when pictures aren't always
the same size due to screen size and responsive layouts.

See [this blog post about resizing and responsive images](https://www.liip.ch/en/blog/things-you-should-know-about-responsive-images), which goes much more into detail about this.

What is important for our stack definition is the fact, that images in "retina" format don't need the same quality
settings as "normal" images to still look much better. This makes the retina images less heavy again, even though they're
twice as large as the "normal" ones.

To enable this, we need [Stack expressions](/documentation/references/stacks.html#stack-expressions-for-stack-options-and-stack-variables) and set the image quality lower via `optim.quality`, whenever the [stack option `dpr`](/documentation/references/stacks.html#device-pixel-ratio-dpr) is 2 or greater. You can of course also set `jpg.quality` or similar directly, but
we recommend using `optim.quality`, since that's more flexible and a little bit more intelligent. 
Default of `optim.quality` is by the way 4. You may experiment with that settings, if you're not happy with the quality.
And of course you could also set `jpeg.quality`/`webp.quality` instead, but then the stack won't take advantage of
our adaptive quality rendering.

```language-json
{
  ...
  "expressions": [
    {
      "expression": "options.dpr >= 2",
      "overrides": {
        "options": {
          "optim.quality": 2
        }
      }
    }
  ]
  ...
}
```

It's of course important, that you then set the stack option `dpr` in the render URL, otherwise it won't take effect.
So if you use the `w` attribute in srcset and you're sure that one width is only used on retina screens, your URL should
look like this to return a 1800 pixel wide image with "retina" settings:

```language-bash
https://{organization}.rokka.io/{stack-name}/v-w-900/o-dpr-2/{hash}.{format} 1800w
```


#### Generating those responsive URLs in PHP

If you're using PHP, there's  a little helper method in the PHP client, which that makes generating those "srcset" attributes 
 (together with "src") much easier:

```language-php
<img 
  <?=
  \Rokka\Client\TemplateHelper::getSrcAttributes(
    "https://{organization}.rokka.io/{stack-name}/{hash}.{format}", 
    ["2x"]
  );
  ?>
>
```

or with different  "w" URLs

```language-php
<img 
  <?=
  \Rokka\Client\TemplateHelper::getSrcAttributes(
    "https://{organization}.rokka.io/{stack-name}/{hash}.{format}", 
    ["500w", "900w", "1800w"]
   );
  ?>
>
```

or with "w" and DPR definition in the URL

```language-php
<img 
  <?=
  \Rokka\Client\TemplateHelper::getSrcAttributes(
    "https://{organization}.rokka.io/{stack-name}/{hash}.{format}", 
    ["500w" => "v-w-500", "900w" => "v-w-900", "1800w" => "o-dpr-2--v-w-900"], 
    false // The false is needed to preventing writing the width via the resize operation, we defined it with `v-w-900` here
   ); 
  ?>
>
```

### The Save-Data HTTP header

rokka [supports the Save-Data HTTP header](/documentation/references/stacks.html#expression-for-detecting-the-save-data-http-header)
which expresses that a client wants to save data, eg. get smaller images but with maybe less quality.

We recommend to support that with two expressions. The first sets `optim.quality` to 2 whenever that header is set.

The second one sets the stack option `dpr` back to 1, when it set to 2 or more. Clients with a Save-Data header
may not need retina quality picture in return of less bytes to be transferred. But we only set dpr to 1, if the scaling
variable `$s` is not set to 1. As you may remember from the [upscaling chapter above](#upscaling), we only should
deliver images in different sizes than from the browser expected when we correctly set the image size via CSS. We can
control that with the `$s` variable here as well (if it's 1, we want scaling to the defined image size, if it's 0, we 
don't need it.).

```language-json
{
  ...
  "expressions": [
    ...
    {
      "expression": "request.headers.save_data == 'on'",
      "overrides": {
        "options": {
          "optim.quality": 2
        }
      }
    },
    {
      "expression": "$s != 1 && options.dpr >= 2 && request.headers.save_data == 'on'",
      "overrides": {
        "options": {
          "dpr": 1
        }
      }
    }
  ]
}
```

### Using smartcrop

The [crop operation](/documentation/references/operations.html#crop) supports an anchor mode called `smart`. It tries
to figure out the best possible crop with some algorithms. It's not always perfect and may result sometimes in unpredictet
results, but it's something which certainly is worth trying out. Especially if your images have a pretty different 
aspect ratio than the rendered size.

rokka also has the an `auto` anchor mode, which first takes a subject area, if one exists, then a face detection area and 
then falls back to "center_center", but will never fall back to smart mode (to not give surprising results).

Generally using `smart` as anchor mode is also not ideal, since when you have a subject area, or a face detection area,
you most certainly want to use them, than the `smart` mode. But rokka also has you covered for this, since you can 
check for those image attributes in an expression. 

Furthermore using `smart` on animated gifs is also not recommended (since it currently does it on every frame), so we also
check for this.

And last, but not least, you can overwrite all of this with the stack variable `$a` on a per URL basis.

The relevant stack part looks like the following then:

```language-json
{
  "name": "crop",
  "options": {},
  "expressions": {
    "anchor": "$a === 'notset' ? ((image.hasSubjectArea || image.hasDetectionFace || image.format == 'gif') ? 'auto' : 'smart') : $a",
    "width": "$finalWidth",
    "height": "$finalHeight"
  }
}
``` 

### Delivering JPEGs with transparency

Sometimes you have large images, but need some transparency in them to fit into your website and JPEG doesn't support that.
Rendering them as PNG makes them huge, and WebP - supporting transparency also in lossy compression - isn't available in all browsers.
But there's a little trick to do help in making those images having a acceptable size with the help of SVG. There are
two blog posts about this topic by us ([part one](https://www.liip.ch/en/blog/how-to-compress-a-png-like-a-jpeg-with-rokka), 
[part two](https://www.liip.ch/en/blog/compressing-transparent-png-like-jpeg-rokka-got-even-easier)).

All you have to do to enable this is to set the 
[stack option `jpg.transparency.autoformat`](/documentation/references/stacks.html#delivering-a-transparency-capable-format-instead-of-jpeg-jpg.transparency.autoformat) 
to true. And then whenever you ask for a JPEG render and the source image is not opaque, it will deliver it with this SVG
trickery. If the source image is not opaque, it will deliver it as JPEG as normal.

It is advised to check the output of such images in Safari (the only main browser not supporting WebP nowadays), as the
result may not be 100% the same, especially if you half-transparent pixels in them.

```language-json
{
  "options": {
    "autoformat": true,
    "jpg.transparency.autoformat": true
  }
}
```

### The ultimate resize & crop stack configuration.

And here's the full resize & crop stack configuration with all the settings discussed above.
Just take whatever you think is appropriate for your use case, but you can also just copy&paste this, maybe change
`defaultWidth` and `defaultHeight` and then adjust from there. Not much can go wrong with all this.

```language-json
{
  "operations": [
    {
      "expressions": {
        "width": "$finalWidth",
        "height": "$finalHeight ",
        "upscale": "$s == 1 ? true : false",
        "upscale_dpr": "$s == 1 ? true : false"
      },
      "name": "resize",
      "options": {
        "mode": "fill"
      }
    },
    {
      "expressions": {
        "anchor": "$a === 'notset' ? ((image.hasSubjectArea || image.hasDetectionFace || image.isAnimated) ? 'auto' : 'smart') : $a",
        "width": "$finalWidth",
        "height": "$finalHeight"
      },
      "name": "crop",
      "options": {}
    }
  ],
  "options": {
    "autoformat": true,
    "jpg.transparency.autoformat": "true"
  },
  "expressions": [
    {
      "expression": "options.dpr >= 2",
      "overrides": {
        "options": {
          "optim.quality": 2
        }
      }
    },
    {
      "expression": "request.headers.save_data == 'on'",
      "overrides": {
        "options": {
          "optim.quality": 2
        }
      }
    },
    {
      "expression": "$s != 1 && options.dpr >= 2 && request.headers.save_data == 'on'",
      "overrides": {
        "options": {
          "dpr": 1
        }
      }
    }
  ],
  "variables": {
    "w": 0,
    "h": 0,
    "s": 0,
    "a": "notset",
    "defaultWidth": 900,
    "defaultHeight": 600,
    "r": "$defaultWidth / $defaultHeight",
    "finalWidth": "$w == 0 ? ($h == 0 ? $defaultWidth : ($h * $r)) : $w",
    "finalHeight": "$h == 0 ? $finalWidth / $r : $h"
  }
}
```
