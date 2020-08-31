---
title: Stacks
use: [references]
---

## The stack object

| Attribute | Description |
| --------- | ----------- |
| organization | Name of the organization that the stack belongs to |
| name | Name of the stack |
| created | When this stack was created |
| stackOperations | List of operations for this stack |
| options | Optional options that influence the entire stack |

## Create a stack

You can create a stack by providing an organization, the name and operations to apply on the stack.
In the following example, the stack applies a resize of 200 x 200 and rotates it by 45 degrees. It's created in the testorganization and given the name teststack.

The _options_ parameter is optional. You can use the following options in there.

| Attribute | Default | Minimum | Maximum | Description |
| --------- | ------- | ------- | ------- | ----------- |
| basestack | - | - | - | Name of existing stack that will be executed before this stack. See the [Basestacks chapter](#basestacks) below.|
| optim.quality | 4 | 1 | 10 | General image quality setting. If `jpeg.quality` resp. `webp.quality` is not set explicitely, rokka tries to find the best possible compression automatically.  See the [optimizations chapter](#additional-image-optimizations) below.
| jpg.quality | 80 | 1 | 100 | Jpg quality setting, lower number means smaller file size and worse lossy quality. Default is 65 for dpr >=2, see the [DPR chapter](#device-pixel-ratio-dpr) below.|
| webp.quality | 80 | 1 | 100 | WebP quality setting, lower number means smaller file size and worse lossy quality. Choose a setting of 100 for lossless quality. Default is 65 for dpr >=2, see the [DPR chapter](#device-pixel-ratio-dpr) below. |
| heif.quality | 40 | 1 | 100 | Heif/Heic quality setting, lower number means smaller file size and worse lossy quality.  |
| avif.quality | 50 | 1 | 100 | AVIF quality setting, lower number means smaller file size and worse lossy quality.  |
| gif.quality | 60 | 1 | 100 | Gif quality setting in the [optimization phase](#additional-image-optimizations). Choose a setting of 100 for lossless quality. Lower values also means lower file size. See the [rendering animated GIFs chapter](./render.html#rendering-animated-gifs).|
| pngquant.quality | 98 | 10 | 100 | We lossy compress (PNG and lossless WebP) images by default to make them much smaller (and hardly noticable). You can try some quality setting with this option. If set to 100, we don't apply any lossy compression.|
| png.compression_level | 7 | 0 | 9 | Higher compression means smaller file size but also slower first render. There is little improvement above level 7 for most images. |
| source_file | false | - | - | For outputting just the original unprocessed source file, set this to true and configure an empty operations collection. Can not be used together with other stack options. See the [source_file chapter](#configuring-a-stack-to-just-deliver-the-original-source-file) below.|
| remote_fullurl_allow | false | - | - | To load images directly from a remote URL instead of uploading them to rokka via the API first. See the [remote_basepath chapter](#loading-images-from-a-remote-url) below.|
| remote_fullurl_whitelist | null | - | - | To only allow certain domains to be used with the remote image feature. See the [remote_basepath chapter](#loading-images-from-a-remote-url) below.|
| remote_basepath | - | - | - | To load images directly from a remote URL with a basepath instead of uploading them to rokka via the API first. See the [remote_basepath chapter](#loading-images-from-a-remote-url) below.|
| autoformat | false | - | - | If set, rokka will return WebP instead of PNG/JPEG, if the client supports it. See the [autoformat chapter](#autoformat) below.|
| autoformat.exclude | null | - | - | You can exclude some autoformat operations. See the [autoformat chapter](#autoformat) below.|
| dpr | 1.0 | 1.0 | 10.0 | Sets the desired device pixel ratio of an image. See the [DPR chapter](#device-pixel-ratio-dpr) below. |
| content_disposition | inline | - | - | Sets a "Content-Disposition: attachment", if value is set to "attachment". |
| optim.disable_all |false| - | - | Disables all additional enhanced image size optimizations. See the [optimizations chapter](#additional-image-optimizations) below.|
| optim.immediate |false| - | - | Immediatly runs the enhanced image size otimizations instead of doing it later asynchronously. See the [optimizations chapter](#additional-image-optimizations) below. |
| jpg.transparency.color | FFFFFF | - | - | The background color used to replace the alpha channel. |
| jpg.transparency.autoformat | false | - | - | Delivers the best possible, alpha channel capable format instead of jpg (webp, svg or png), in case the rendered image has a visible alpha channel.  See the [transparency chapter](#delivering-a-transparency-capable-format-instead-of-jpeg-jpg.transparency.autoformat) below. |
| jpg.transparency.convert | false | - | - | Force converting an alpha channel to a jpg.transparency.color. Very rarely needded, as rokka will figure that out automatically.|
| timestamp | - | - | - | Use a thumbnail from a video at this timestamp for rendering. See the [video chapter](videos.html#generating-a-thumbnail-from-an-imported-video-for-rendering) for details. | 
| fps | 10 | 1 | 25 | Sets frame per second for movie to animated gif conversion. |
| dpi | - | 1 | 5000 | Sets some dpi metadata info to an image, but doesn't resize them. It only works for PNG and TIFF (but not JPEG), currently, and you do have to set `optim.disable_all` to true. DPI doesn't matter in the web context, usually you don't need this. |

```language-bash
curl -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/stacks/testorganization/teststack' -d '{
    "operations":
    [
        {
            "name": "resize",
            "options": {
                "width": 200,
                "height": 200
            }
        },
        {
            "name": "rotate",
            "options": {
                "angle": 45
            }
        }
    ],
    "options": {
        "jpg.quality": 60
    }
}
'
```

```language-php
use Rokka\Client\Core\Stack;
use Rokka\Client\Core\StackOperation;

$client = \Rokka\Client\Factory::getImageClient('mycompany', 'apiKey');

$stack = new Stack(null, 'teststack');

$stack->addStackOperation(new StackOperation('resize', ['width' => 200, 'height' => 200]));
$stack->addStackOperation(new StackOperation('rotate', ['angle' => 45]));
$stack->setStackOptions(['jpg.quality' => 80]);

$stack = $client->saveStack($stack);

echo 'Created stack ' . $stack->getName() . PHP_EOL;
print_r($stack);

```

Note: The name "dynamic" (used for dynamic rendering) and names starting with "_" are reserved and can't be chosen as stack names.

### Updating existing stacks

Please read the [Render caches and invalidation document](../guides/render-caches-and-invalidation.html) carefully, if you want to update an existing stacks with new options/operations, since it may not work like you'd expect.

To update an existing stack, just append `?overwrite=true` to your URL. Or use the corresponding parameters in one of the rokka client libraries.

```language-bash
curl -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/stacks/mycompany/teststack?overwrite=true' -d '{
    "operations":
    [
        {
            "name": "resize",
            "options": {
                "width": 200,
                "height": 200
            }
        },
        {
            "name": "rotate",
            "options": {
                "angle": 45
            }
        }
    ],
    "options": {
        "jpg.quality": 60
    }
}
'
```

In the PHP client add the key `overwrite` with value `true` to the second parameter array of `saveStack`:

```language-php
$stack = $client->saveStack($stack, ['overwrite' => true]);
```

### Best practices for configuring a stack

There's a whole page for that. We highly recomment reading this "[Best practices for stack configurations
](/best-practices-for-stack-configurations.html)" chapter.


### Configuring a stack with no operations

If you want to deliver an image without any image altering stack operations, you can configure a stack without any operations, just an empty collection with `"operations": []`. This stack configuration still loads the image into our processing engine and converts them to the requested image format (even if input and output image are the same). It will also apply optimizations to make the image as small as possible for delivering to endusers.

This configuration is useful if you want to deliver an image in its original size, don't want to have to take care about the input format and most imporantly, want to profit from our image optimizations. No matter in what format an image is uploaded, it will always be converted to your requested output format and made as small as possible.

### Configuring a stack to just deliver the original source file

Sometimes you want rokka to just deliver the exact original file you uploaded without any conversion and optimizations. For example delivering a PDF or SVG file in their original formats. Or a manually highly optimized PNG.

To get such a stack, create a stack with an empty operations collection and the stack option `source_file: true`. Such a configuration can't have any stack operations or any other stack options, otherwise the creation of the stack will fail.

```language-json
{
    "operations": [],
    "options": {
        "source_file": true
    }
}
```

Be aware that if you configure such a stack, everyone can download the original source file of all your uploaded images (as long as they know the hash of an image). If there's enough demand, we will implement a feature to only enable that for explicitely tagged pictures. Just tell us, if you'd like to use such a feature.

### Expressions

Expressions can be used to dynamically define [stack operations options](#expressions-in-stack-operation-options), [stack options](#stack-expressions-for-stack-options-and-stack-variables) or [stack variables](#stack-variables). They are quite powerful and are based on [Symfony Expressions](https://symfony.com/doc/current/components/expression_language/syntax.html#component-expression-arrays).

The simplest example of an expression is to just return a [stack variable](#stack-variables) with `$variable`, but you can also do more advanced stuff like `$w < 500 ? $w : 500` and much more.

Besides stack variables you can also use some other properties with  information about the used source image, the current request or any defined stack option. See the following table
for more information. If there's a property missing you'd like to have, we can almost certainly add them.

| Property | Description |
| -------- | ----------- |
| image.width / image.height | Returns the width or height of the current source image. |
| image.format | Returns the format of the current source image, like 'jpeg' or 'gif'. |
| image.hasSubjectArea | Returns true, if the source image has a [dynamic subject area](/documentation/references/dynamic-metadata.html#subject-area). |
| image.isAnimated | Returns true, if the source image is an animated image, like an animated gif. |
| image.hash | Returns the hash of the current source image.|
| image.subject_area.* | Returns subject area data for width, height, x and y.  |
| request.headers.save_data | Returns "on" if the [http header save-data is set](#expression-for-detecting-the-save-data-http-header). |
| options.* | Returns any stack option, eg `options.dpr` returns the currently set "[Device Pixel Ratio](documentation/references/stacks.html#device-pixel-ratio-dpr)". |

 
### Stack variables

Variables are defined on the top level of a stack configuration. They have two main functions. You can avoid repeating
definitions in your stack configuration, but more importantly, you can overwrite them via the render URL and then
set some options accordingly (as an additional benefits, it makes your URL shorter than with directly [overwrite stack operation options](/documentation/references/render.html#overwriting-stack-operation-options))
 
To use them in a render URLs as `variables` or `v` to our URL after the stack and followed by '-' for separating the variables and values, eg.:

```language-bash
https://{organization}.rokka.io/{stack-name}/v-w-200/{hash}.{format}
 
```

Stack variables can be used in stack operation options or in stack expressions, but not stack options yet. If there's a need for that, we maybe can implement it, but see the "[Expressions for Stack Options](#expressions-for-stack-options)" below for another way to do that.

You can also use expressions to define stack variables, but if you use another stack variable, that has to be defined first.

The following examples sets two variables, `w` with a value of 500 and `h` with half of that. Now, you can use them in other places of your stack configuration and
overwrite both via the render URL. If you don't set it via the URL, the defined values are taken.   

```language-json
{
  "operations": [...]
  "variables": {
    "w": 500
    "h": "$w / 2"
  }
}

```

### Expressions in stack operation options

Stack operation options can be configured via stack variables and expressions. This can be useful if 
you need to use the same value at different options and want to overwrite that via the render URL. Or need some
dynamic options.

To make this work, you need to define those options in an `expression` property of an operation. You can use any 
[expression](#expressions) supported by rokka, which also can be just a stack variable.

One example is a resize & crop stack:


```language-json
{
  "operations": [
    {
      "name": "resize",
      "options": {
        "mode": "fill"
      },
      "expressions": {
        "width": "$w",
        "height": "$h"
      }
    },
    {
      "name": "crop",
      "expressions": {
        "width": "$w",
        "height": "$h"
      }
    }
  ],
  "variables": {
    "w": 500
    "h": "$w / 2"
  }
}
```

If you call this stack, it will return an image resized and cropped to 500 x 250px. But if you overwrite that variable in a render URL like: `https://org.rokka.io/resizecrop/variables-w-800/abcdef.jpg`,
it would return an image sized 800 x 400px.

Options set via `expressions` will always take precedence over options set via the `options` property.

### Stack expressions for stack options and stack variables

rokka can change stack options based on other parameters dynamically with expressions. A typical usecase is that usually images for high resolution screens don't need a very high jpeg quality setting. With a lower setting, they still look much better than delivering an image in non-high-resolution dimensions, but also aren't that much bigger in file size.

Currently you can't use stack variables or expressions to directly define stack options (like with stack operations options). But you can use them in a stack expression for evaluating, if 
stack options should be defined with other values. 

To apply that on a stack, provide an expression configuration during creation of the stack in the following format:

```language-json
{
     "operations": [
         {
             "name": "resize",
             "options": {
                 "width": 200,
                 "height": 200
             }
         }
     ],
     "options": {
         "optim.quality": 4
         "autoformat": true
     },
     "expressions": [ {
         "expression": "options.dpr >= 2",
             "overrides": {
                "options": {
                   "optim.quality": 2
                }
             }
         }
     ]
}
```


And then, whenever you add "/options-dpr-2/" to your rokka URL, it will use the lower optim.quality. Eg. `https://org.rokka.io/stackname/somehash.jpg` will return a 200x200 image with a optim.quality of 4, and `https://org.rokka.io/stackname/options-dpr-2/somehash.jpg` will return a 400x400 image with a optim.quality of 2.

You can also change stack variables this way, use the property `variables` instead of `options` within `overrides`.

Expressions are applied from top to bottom and all the matching ones will be applied, the last one applying for a certain option winning.

With the PHP client, the code would be the following

```language-php
use Rokka\Client\Core\Stack;
use Rokka\Client\Core\StackOperation;
use Rokka\Client\Core\StackExpression;

$stack = new Stack(null, 'stackname');
$stack->addStackOperation(new StackOperation('resize', ['width' => 200, 'height' => 200]));
$stack->setStackOptions(['optim.quality' => 4, 'autoformat' => true]);

$e = new StackExpression("options.dpr > 2");
$e->setOptionsOverrides(['optim.quality' => 2]);
$stack->addStackExpression($e);

$stack = $client->saveStack($stack);

print_r($stack);
```


#### Expression for detecting the Save-Data HTTP Header 

Some browsers (mainly chrome based ones currently) support the HTTP Client Hint Header "Save-Data". It's supposed to indicate that either the end user wants to save bandwidth because they are on a bandwidth capped connection or the connection is slow and using less bandwidth may help with faster delivery of a webpage. See [this article by Google for more details](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/save-data/).

With rokka you can define a stack expression to apply different stack options when this header is set. For example define a lower image quality or force a DPR of 1, even on retina screens. The config would look like the following (be aware that you need to write `save_data` in the expression and not `save-data`)

```language-json
{
     "operations": [
         {
             "name": "resize",
             "options": {
                 "width": 200,
                 "height": 200
             }
         }
     ],
     "options": {
         "autoformat": true
     },
     "expressions": [ {
         "expression": "request.headers.save_data == 'on'",
             "overrides": {
                "options": {
                   "optim.quality": 2,
                   "dpr": 1
                }
             }
         }
     ]
}
```

The first time you define an expression for Save-Data, we update your CDN config, so it may take some minutes until it is actually available.

If you want to test it in your desktop browser, you can install a browser extension: [Chrome](https://developer.chrome.com/multidevice/data-compression), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/save-data/). 
 

### Basestacks

Basestacks make it easy to create new stacks with the same base options. Basestacks can keep your stack configuration much simpler, but also have the advantage of making your first-hit responses faster, since the output of basestacks are stored internally. This is especially useful if you use computational expensive stack operations like "dropshadow".

We recommend to not use basestacks as output stacks, for internal caching reasons. In case you want to deliver an image from a basestack, the best-practice way is to add another stack with no stack operations and use this stack for delivering your images.

One way to build such a stack config would then be the following configurations:

  * "base" with expensive stack operations like a rotation and a dropshadow
    * "original" stack with no stack operations and "base" as basestack
    * "large" stack with a "resize" operation and a size of 1000x1000 and "base" as basestack
    * "medium" stack with a "resize" operation and a size of 500x500 and "base" as basestack
    * etc..

Later, if you want to add another size, you just base them on the same basestack and you don't have to repeat the same rotation/dropshadow options. Furthermore the rokka servers don't have to recalculate the expensive operations, just the quite simple resize operations for the new stack. Leading to much faster response times for your end users on the first hits.

### Autoformat

If you set the `autoformat: true` stack option, rokka will try to deliver the most appropriate format, not necessarily the one you requested.
This currently consists of two stages. 

In the first stage, rokka checks the `Accept` header of the request and if it contains `image/webp`, rokka delivers in the usually smaller WebP format instead of PNG or JPEG. 
If you didn't set `webp.quality` explicitly and requested a PNG, it will return a lossless image and a lossy compressed image, if a JPG was requested. If you set `webp.quality` to any value on that stack, it will always honor that, no matter what was requested.

We also do some conversion to SVG (or SVG to PNG), if SVG is involved and choose the best format (SVG or Bitmap, depending on the sourceimage and 
stack operations), no matter which format was requested. See below for options how to turn some of those chonversions off.

In the second stage, during the [asynchronous 2nd stage optimization stage](#additional-image-optimizations), rokka analyses the image and changes the format, if another would be more appropriate. It can return a lossy image, even if a lossless was requested and vice versa. That image may be a little bit larger (but often also smaller), but with much better quality and no compression artifacts. This for example applies to computer generated drawings with few colors and large uniform areas, where PNG is a better suited format. Or if you ask for a photo as PNG, then JPG or lossless WebP may be a more suited format (and saves you lots of bytes). As this only happens during the asynchronous optimization, the first hit of such a request may return the lossy image, but subsequent requests later return the lossless format.

We also do optimize SVG images in this stage to make them smaller.

### Exclude some autoformat conversions

You can prevent some of the conversions a little with the `autoformat.exclude` stack option. It takes a comma-seperated list of the conversions you don't want to have applied.

| Attribute | Description |
| --------- | ----------- |
| webp | The image will never be converted to WebP, even if the browser would understand it. |
| lossless_to_lossy | If you requested a lossless image (either as PNG or with webp.quality set to 100), rokka will not convert it to a lossy image, even if that would be much smaller.|
| lossy_to_lossless | If you requested a lossy image, rokka will not convert it to a lossless image, even if that would be much smaller and better quality. |
| lossy_to_lossless_if_bigger | If you requested a lossy image, rokka will not convert it to a lossless image, when the resulting lossless image is bigger than the lossy one. |
| svg | If the sourceimage is a SVG file and we can do all stack operations in SVG, autoformat outputs it as SVG, even if you requested a different format. This option prevents that. |
| svg_to_png | If you requested a SVG rendering, but the result is just an image wrapped in SVG, autoformat outputs it as PNG (or WebP). This option prevents that, the otput will always be an SVG. | 


### More info about autoformat

If you download those autoformated rendered images with a non-web-browser client (eg. import them somewhere with a library or use it in a native app), make sure it can handle the different formats. Don't expect it to be in the format you have in the render URL. rokka sends the correct `Content-Type` header, you can use that to determine the actual format. Web-browsers only look at that, so they do know how to display these. 
The `Accept` header in the request does only matter for stating that you want WebP or not, but this does not play a role in determining the return format of the second stage. Meaning, even if your accept header is just `Accept: image/jpeg`, you may get a PNG back (because we assume, that your client can support PNG). The whole `Accept` header used by all the clients out there is quite a mess, therefore we decided not to support that and assume the client can support all the common image formats (GIF, PNG and JPEG). If you really need the exact format on a stack you have set with `autoformat: true`, add `/options-autoformat-false/` to the render URL right after the stack name and before the hash. Then you always get the format defined in the URL.

In the future, we may support more autoformat features or add more fine-grained options, depending on demand.

### Delivering a transparency capable format instead of JPEG (jpg.transparency.autoformat)

There are situations, where one needs an alpha channel on images which would be best suitable for the JPEG format and the alternatives are not ideal. PNG produces too large pictures for such images and WebP isn't supported on all browsers. To solve this problem, you can set the `jpg.transparency.autoformat: "true"` stack option and rokka will return an especially crafted SVG, if the result has a visible alpha channel (otherwise it sends a jpg). In case the browser supports WebP, it will use that instead of SVG. And if both are not detected, it will return PNG.

Nowadays almost all browsers support [loading SVG images via the the HTML img element](https://caniuse.com/#feat=svg-img) and eg. Firefox and Safari send just "*/*" in the "accept" Header for img requests. Therefore rokka delivers SVG when "*/*" is in the accept header (as long as WebP isn't explicitly stated in that header). If there's no accept header, it sends PNG.

You can also set `jpg.transparency.autoformat: "png"` to just return PNG instead of SVG, if the rendered image has a visible alpha channel (as above, it will return WebP instead of PNG, if the browser supports it). This will ensure support for rather old browsers, which don't support SVG properly. But then everyone will get the often much bigger PNG image instead of the smaller SVG. Alternatively you could detect SVG support on the client side and use two different stacks, one for the old browsers, the other for everything else. 

For more info about this technique, [see our blog post](https://blog.liip.ch/archive/2017/08/28/how-to-compress-a-png-like-a-jpeg-with-rokka.html) and [the follow up here](https://blog.liip.ch/archive/2017/09/04/compressing-transparent-png-like-jpeg-rokka-got-even-easier.html).


### Loading images from a remote URL

Instead of uploading images to rokka via the API, you can also let them be fetched "on demand" by rokka. There's two different ways to do it, either with a common `remote_basepath` or with the more open option `remote_fullurl_allow` (which then can be restricted again with `remote_fullurl_whitelist`). Both can be defined per stack or globally per org. 

If you include a rokka image from your own organisation, that's always allowed, eg. `https://mycompany.rokka.io/dynamic/-https://mycompany.rokka.io/dynamic/abcdef.jpg-.jpg`. Depending on your CMS or system and how you store the image URLs to rokka, this can make your life easier in writing the correct templates.
 
#### Using remote_fullurl_allow

With the `remote_fullurl_allow` you basically open up your rokka configuration to include any publicly available image. So be careful. But you can restrict the allowed images with `remote_fullurl_whitelist`, which takes an array of regexes for allowed domains.

You can configure that option globally on the organisation with the following call (which would allow images from rokka.io to be loaded):

```language-bash
curl -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/organizations/mycompany/options' \
 -d '{
        "remote_fullurl_allow": true,
        "remote_fullurl_whitelist": ["\.rokka.io"]
            
     }'
```
You can also set `remote_fullurl_allow` on individual stacks, if you want to have different ones for example.

```language-bash
curl -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/stacks/mycompany/teststack' -d '{
    "operations":
    [
        {
            "name": "resize",
            "options": {
                "width": 200,
            }
        }
    ],
    "options": {
       "remote_fullurl_allow": true,
       "remote_fullurl_whitelist": ["\.rokka.io"]
    }
}'
```
 
#### Using remote_basepath
 
You define the first part of the URL (the `remote_basepath`) in your configuration. Then you give the second part of the path to your image in the rokka URL surrounded with `-` and rokka will automatically fetch that image, insert it into the rokka system and delivers it. It does this only the first time that image is accessed, for later requests it will deliver the image directly from rokka and not hit your backend again.

You can configure that option globally on the organisation with the following call:

```language-bash
curl -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/organizations/mycompany/options' -d '{"remote_basepath": $REMOTE_BASEPATH"}'
```

$REMOTE_BASEPATH can then be for example something like 'https://blog.liip.ch/content/uploads/', basically the place where your images live. A S3 bucket is also an option, but the images have to be publicly available.

You can also set `remote_basepath` on individual stacks, if you want to have different ones for example.

```language-bash
curl -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/stacks/mycompany/teststack' -d '{
    "operations":
    [
        {
            "name": "resize",
            "options": {
                "width": 200,
            }
        }
    ],
    "options": {
        "remote_basepath": $REMOTE_BASEPATH
    }
}'
```

#### Rendering a remote image

To render now a remote image, you surround your remote URL with `-` and add that to the rokka URL instead of the rokka-hash and you're done. 

If you use `remote_basepath`, you just add the part after `remote_basepath` of your remote URL, with `remote_fullurl_allow` you add the full URL. 

```
https://{organization}.rokka.io/{stack-name}/{options}/-{remote_image_path}-.{format}

```

All the usual possibilities - like SEO additions, stack options, dynamic stacks, etc. - work like when you would upload the image directly to rokka, eg:

Concerete example with `remote_basepath`:
```
https://mycompany.rokka.io/somestack/-2017/06/Relax_sabbatical.jpg-/some-seo-string.jpg
```
Concerete example with `remote_fullurl_allow`:
```
https://mycompany.rokka.io/somestack/-https://blog.liip.ch/content/uploads/2017/06/Relax_sabbatical.jpg-/some-seo-string.jpg
```

Please be aware, that rokka only downloads your image once and never checks again, if it changed. If you change your image, you should therefore also change the filename.

Also be aware, that if you uploaded that same image already via the API and then via this way, then it will have two different hashes. The binary itself is only stored once, 'though. If you delete one of those hashes via the API, the other will still be in rokka.


### Device Pixel Ratio (DPR)

High resolution screens (Retina in some marketing terms) are very common today and modern browsers support this with the `<img srcset>` and `<picture>` element. The `dpr` stack option helps you implementing that easily without the need for different stacks. If `dpr` is set for example to 2.0, then rokka will return an image with twice the resolution than asked for.

An example, let's assume you have a stack named `small` which resizes your pictures to 200x200:

```language-json
{
  "operations": [
    {
      "name": "resize",
      "options": {
        "width": 200,
        "height": 200
      }
    }
  ]
}
```

A call to `https://{yourorg}.rokka.io/small/{hash}.jpg` will return a 200px image. But if you call it with https://{yourorg}.rokka.io/small/options-dpr-2/{hash}.jpg, you get a 400px image, looking much sharper on a retina screen. If you want to let the browser decide, which picture it should request, you can for example use the `srcset` attribute in an image tag.

```language-html
<img src="https://{yourorg}.rokka.io/small/{hash}.jpg"
     srcset= "https://{yourorg}.rokka.io/small/options-dpr-2/{hash}.jpg 2x,
              https://{yourorg}.rokka.io/small/options-dpr-3/{hash}.jpg 3x">
```

By default, we also set a lower jpg and webp quality for those retina images, since it keeps the files small and the visual difference is very small.
If you want to change that behaviour, set a `jpg.quality` and `webp.quality` stack option explicitly on your stack and it will always take that. If you want to have different quality settings for non-retina and retina and use other values than the defaults, see [stack expressions](#stack-expressions-for-stack-options-and-stack-variables) for more details into that.

There's also a resize stack operation option called `upscale_dpr`, which applies in some cases. Assuming your picture in the above example is only 300px wide. Using a dpr setting of 2 will upscale that to 400px by default (otherwise the browser would display it smaller, as a 150 css pixel image). Settting `upscale_dpr` to `false` will not do that and return the image in its original dimensions (which in this example would be 300px).

The more general `upscale` resize stack operation option also applies. If `upscale` is set to `false`, but `upscale_dpr` is set to `true` the above example would return a 200px picture in the dpr=1 case, but still a 400px in the dpr=2 case.

In table form, with a 300px image:

| stack operation options | dpr: 1, width: 200 | dpr: 2, width: 200 | dpr: 1, width: 400 | dpr: 2, width: 400 |
|----------------------------------|---------------|----------------|--------------------|--------------------|
| upscale: true, upscale_dpr: true | Return: 200px | Return: 400px | Return: 400px       | return 800px       |
| upscale: false, upscale_dpr: true | Return: 200px | Return: 400px | Return: 300px      | return 600px       |
| upscale: false, upscale_dpr: false | Return: 200px | Return: 300px | Return: 300px     | return 300px       |


Important: A stack with dpr options applied, currently needs a resize operation. Otherwise the dpr setting won't work and the call will return a `400` error. We can't produce higher dpr resolution with the other operations. Furthermore, if you use a basestack, the same applies. The main stack needs a resize operation, one just in the basestack won't do it.

### Additional image optimizations

rokka does some advanced image size optimizations on your images by default. As the optimizations are not always fast, it does those in the background to not slow down your first render request to an image. Therefore the first request on a newly rendered image will not have those optimizations applied, but requests made 10-30 seconds later will have those applied.

You can prevent that delay with the stack option `optim.immediate`. rokka then does it right on the first render and not only a few seconds later asynchronously. This will make your first render slower, but won't make a difference for later requests. This can also be very useful, if you want to see the final image during developing right away (eg. for deciding about the appropriate image quality setting). We recommend not to use this feature in production environments, since it can degrade your end user experience.

For PNG and lossless WebP we use [pngquant](https://pngquant.org/) to make the image size significantly smaller as long as the quality doesn't degrade. We additionally compress PNG with [zopflipng](https://github.com/google/zopfli) to make them even smaller.

SVG images are also optimized to make them as small as possible in this stage.

For JPEG and lossy WebP images the approach choosen depends on your stack settings.

By default or set `optim.quality` explicitly, rokka tries to find the best possible compression rate for your chosen `optim.quality`. It compresses the image several times (from the original image) with different quality settings and choses the one with the smallest filesize, which still looks good. This can lead to quite some savings in file size, but sometimes, depending on the image, it can produce a bigger image for a better perceived quality.

We highly recommend to use this feature instead of the hard-wired compression settings with `jpeg.quality` and `webp.quality`.

If you you used `jpg.quality` or `webp.quality` in your stack settings, rokka still tries to recompress the image to a lower filesize while keeping your set quality, but won't do much image depending and adaptive adjustments.

If you set `optim.quality` and also `jpg.quality`, rokka uses the `jpg.quality` setting for the initial rendering and `optim.quality` for the later adaptive optimization. 

rokka additionally checks, if your image better would be served as lossless or lossy, depending on the image and the resulting size.

We never do any of those optimizations to your source images, they stay as they were uploaded.

You can disable some of the optimizations with the `autoformat.exclude` stack option, see the [autoformat chapter](#autoformat) for details.

If you want to disable all those optimizations, set `optim.disable_all` to `true` as a stack options, but we'd advise to not do that. 

## Retrieve a stack

You can retrieve a stack by providing the organization and stack name. This example gets the stack teststack from the organization testorganization.

```language-bash
curl -X GET 'https://api.rokka.io/stacks/testorganization/teststack'
```

```language-php
$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey');

$stack = $client->getStack('teststack');

echo 'Displaying stack ' . $stack->getName() . PHP_EOL;
print_r($stack);
```

An example JSON response looks like this.

```language-js
{
    organization: "testorganization",
    name: "teststack",
    created: {
        date: "2015-08-20 08:50:32.000000",
        timezone_type: 3,
        timezone: "UTC"
    },
    stackoperations: [
        {
            name: "resize",
            options: {
                width: 200,
                height: 200
            }
        },
        {
            name: "rotate",
            options: {
                angle: 45
            }
        }
    ],
    _links: {
        self: {
            href: "/stacks/testorganization/teststack"
        }
    }
}
```


## Delete a stack

Deleting a stack works like this.

```language-bash
curl -X DELETE 'https://api.rokka.io/stacks/testorganization/teststack'
```

```language-php
$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey');

$deleted = $client->deleteStack('teststack');

if (true === $deleted) {
    echo 'Deleted stack';
} else {
    echo 'Did not delete stack!';
}
```

## List stacks

It is possible to list all stacks for an organization.

```language-bash
curl -X GET 'https://api.rokka.io/stacks/testorganization' -H 'Api-Key: key'
```

```language-php
use Rokka\Client\Core\Stack;

$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey');

$stacks = $client->listStacks();

foreach ($stacks as $stack) {
    /** @var Stack $stack */
    echo 'Stack ' . $stack->getName() . PHP_EOL;
}
```

An example JSON response looks like this.

```language-js
{
    "items": [
        {
            "created": "2017-11-01T16:10:43+00:00",
            "name": "test-stack",
            "organization": "example",
            "stack_operations": [
                {
                    "name": "resize",
                    "options": {
                        "height": 100,
                        "width": 1000
                    }
                }
            ],
            "stack_options": {
                "source_file": true
            }
        }
    ]
}
```
