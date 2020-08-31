---
title: PHP client library intro
use: [guides]
---

# Note about CMS Clients

Note: If you just want to use rokka in a CMS like Drupal, Wordpress or Kirby, we recommend using the respective plugins (see the right side on the [documentation overview](/documentation/)). If you want to know, how the PHP library works and what it provides, this intro may be a good start nevertheless.

# Preparation

If you already know the basics of rokka and have uploaded an image and created a stack, you can directly skip to the "[The PHP library](#the-php-library)" chapter below.

## Get a rokka account

Before we start with the actual PHP stuff, we do some preparation. First, you of course need a rokka account. Head over to [the signup page](https://rokka.io/dashboard/#/signup) and get one. It's free for 90 days and afterwards still free for up to 5 GB of traffic and 2 GB of storage.

After you signed up, you'll get an email with your api key, don't lose that.

## Install the rokka CLI

For some basic setup, we'll use the rokka CLI, go and [get it](https://github.com/rokka-io/rokka-go) and follow the instructions to install it.

Note: Alternatively you can also just login at [rokka.io/dashboard](https://rokka.io/dashboard) and do there what we will do here with the CLI. Or in the [Swagger API documentation](https://api.rokka.io/doc/) for a more low level approach.

After you installed the rokka CLI, store your rokka api key in a config file with the following command:

```
rokka login --apiKey $YOUR_API_KEY
```

## Upload an image

Now you can upload your first image to rokka. We recommend to upload a high resolution image in a lossless image format like PNG. But there's no use in converting eg. a JPEG to PNG, if the JPEG version is the only version you have, then the JPEG is just fine.

```
rokka sourceimages create $YOUR_ORG rokka-pic.png
``` 

This will return some metadata information about the upload, eg:

```
Hash:         dba8937b9b057e419cf96c0696be8db9ed481218 (dba893)
Name:         rokka-pic.png
Details:      image/png, 1260x840, 894914Bytes
Created at:   Wed, February 21 2018, 13:18:15Z
Binary hash:  069a28acf55626285e6ade09064a661e6ce893f9
```

The important part is the hash (or the short hash in parenthesis). The hash is a unique value for each image. If you upload the same image again, it will return you the same hash. If you upload an image with just one byte changed, it will return you a totally different hash.

The hash is always 40 characters long, but the short hash may be between 6 and 40 characters long.  You can use both in all places of the API. 

Note: Don't just take the first 6 chars from the hash for the short hash, that may return you the wrong picture, always use the one returned by the rokka API.

After the upload, you can already let rokka render the image for you. Just go to `http://$YOUR_ORG.rokka.io/dynamic/dba893.jpg` in a browser. Of course, you have to replace the short hash `dba893` with the value you got from the upload in that URL.

You can also directly resize an image now with eg. `http://$YOUR_ORG.rokka.io/dynamic/resize-width-200/dba893.jpg`, which will return an image with a width of 200 pixels. If you want a PNG, WebP, AVIF or a HEIF image instead of a JPEG, just change the ending. And you can also use more desprictive filenames for SEO reasons. `http://$YOUR_ORG.rokka.io/dynamic/resize-width-200/dba893/someone-on-a-balcony.png` would return the same as above, but this time as PNG.

You can also change many parameters for the appearance of an image, eg. you want an image for a retina screen, set the DPR stack option to 2 with the following URL:

`https://$YOUR_ORG.rokka.io/dynamic/resize-width-200--options-dpr-2/dba893.png`

All the possible stack options and operations can be seen at the [stacks documentation](https://rokka.io/documentation/references/stacks.html) and at the [operations documentation](https://rokka.io/documentation/references/operations.html).

## Creating a stack

Another central concept of rokka are stacks. Stacks are a collection of one or more operations together with stack options. It abstracts away the implementation details of how your images are rendered, "users" of your images (like front end developers) don't have to know them, just the stack name. And it also makes your URLs way nicer.

The above resizing stack can be created with:

```
echo '{
  "options": {},
  "operations": [
    {
      "name": "resize",
      "options": {
        "width": 200
      }
    }
  ]
}' | rokka stacks create $YOUR_ORG test-stack
``` 

And then you can render an image simply using that stack name instead of `dynamic` from above: `https://$YOUR_ORG.rokka.io/test-stack/dba893.jpg`

If you want to overwrite some operation parameters or stack options, you can do that directly in the URL, eg.

`https://$YOUR_ORG.rokka.io/test-stack/resize-width-300--options-dpr-2/dba893.jpg` would return an image with a width of 300 px but in a device-pixel-ratio of 2 (for retina), which makes the picture actually 600px wide. This way you can easily have complex stacks (cropping and resizing for example) and just overwrite some parameters via URL, if you need to.

# The PHP library

After having uploaded a first image and created a first stack, let's finally move to the PHP part.


## Installation

Install the library using [composer](https://getcomposer.org/) in your project directory:

```
composer require rokka/client
```

## First steps

You may use rokka within a bigger framework (like Symfony), a CMS (like WordPress or Drupal) or within Twig, the following steps may not be needed or different, but they give a good feeling, how it works.

The easiest way to let the library generate the needed URLs is by using the [\Rokka\Client\TemplateHelper](https://rokka.io/client-php-api/master/Rokka/Client/TemplateHelper.html) class.

```
<?php
require_once("vendor/autoload.php");
use Rokka\Client\TemplateHelper;
$rokka = new TemplateHelper('$YOUR_ORG', '$YOUR_API_KEY');
?>
<html><body>

<img src="<?= $rokka->getStackUrl('dba893', 'test-stack', 'jpg');?>"> <br/>

</body>
</html>
```

Alternatively, you can also just use the `\Rokka\Client\UriHelper:composeUri ` static method.

```
<img src="https://liip-development.rokka.io<?= UriHelper::composeUri(['stack' => 'test-stack', 'hash' => 'dba893', 'format' => 'jpg']);?>">
```

Both examples return an URL like `https://$YOUR_ORG.rokka.io/test-stack/dba893.jpg`.

## Retina and responsive images

Nowadays you want to deliver high resolution images to your clients with "retina" screens. A service like rokka makes that easy and this library even more so.

You can add stack options to any render URL (or stack definition), and one of those options is the "dpr" (device pixel ratio) of the client. So let's say you have a retina screen with a DPR of 2, then you add "options-dpr-2" to your URL just before the hash, eg.
`https://$YOUR_ORG.rokka.io/test-stack/options-dpr-2/dba893.jpg` and you'll get an image twice the size.

The PHP library has some helper functions to generate such URLs. The following returns the same URL as above. And does the right thing, even if you already have options in your URL. No need for you to manually parse or concatenate that URL.

```
UriHelper::addOptionsToUriString('https://$YOUR_ORG.rokka.io/test-stack/dba893.jpg','options-dpr-2');
```

Alternative syntax with an array instead of a string

```
UriHelper::addOptionsToUriString('https://$YOUR_ORG.rokka.io/test-stack/dba893.jpg',['options' => ['dpr' => 2]]);
```

There's also `addOptionsToUri` which takes a `\Psr\Http\Message\UriInterface` instead of a string as input for the uri.

The above methods may give you an appropriate retina enabled render URL, but you'd still have to write the right HTML attributes to actually enable them. With the method `TemplateHelper::getSrcAttributes`, this gets much easier. Call it like the following:

```
<img <?= TemplateHelper::getSrcAttributes($rokka->getStackUrl('dba893', 'test-stack', 'jpg'), ['2x', '3x']);?>>
```

And you get a string back with `src` and a `srcset` attributes and the correct values (in this example with srcset for '2x' and '3x', you can also use "w" values instead of "x" there, but don't mix them). If you you want to know more about srcset, see [this blog post about responsive images](https://www.liip.ch/en/blog/things-you-should-know-about-responsive-images).

There's also a similar method for responsive images in CSS background-images, `TemplateHelper::getBackgroundImageStyle`.

## Some other helper methods

There are some more helper methods, if you need to resize some pictures quickly without creating a stack. The URLs may be long and if you need the same size often, we recommend to still create stacks for them.

Rendering an image resized to a width of 400 pixels (you may also specify a height in the 3rd parameter):

```
<img src="<?= $rokka->getResizeUrl('dba893', 400);?>">
```

Renders an image resized and cropped to specific dimensions. Very useful when you want to ensure that all pictures have the same size.

```
<img src="<?= $rokka->getResizeCropUrl('dba893', 400, 200, 'jpg');?>">
```

Renders the image in it's original size.

```
<img src="<?=  $rokka->getOriginalSizeUrl('dba893', 'jpg');?>">
```

You can use all those returned URLs also on the responsive images methods mentioned above.

## SEO 

It can be helpful for SEO purposes to have self-describing image names. That's why almost all URL generating methods also take a "SEO" parameter. It also slugifies the input automatically.

```
$rokka->getStackUrl('dba893', 'test-stack', 'jpg', 'A picture with thïngs');
```

returns

```
https://$YOUR_ORG.rokka.io/test-stack/dba893/a-picture-with-things.jpg
```


## Twig

The twig extension for rokka is also available. It mainly exposes the above mentioned helper methods. Documentation can be found at the github repo at [github.com/rokka-io/rokka-client-php-twig](https://github.com/rokka-io/rokka-client-php-twig). It will also be included in the [rokka symfony bundle](https://github.com/rokka-io/rokka-client-bundle/tree/twig) in the near future. 

# Working with "local" images

Uploading images manually to rokka is not a very efficient way to have them ready. You could integrate the uploading part into your Framework/CMS and use the PHP API for that ([see below about that](#managing-via-api)), which is often the best approach.

Or you can use the built in functionality of the `TemplateHelper` class to help you in that. Some methods of that class not only take a rokka image hash as first argument, but also a path to an existing local file, a `SplFileInfo` object or an object which implements [Rokka\Client\LocalImage\AbstractLocalImage](https://rokka.io/client-php-api/master/Rokka/Client/LocalImage/AbstractLocalImage.html) (more about that later)

The TemplateHelper then automatically uploads the image to rokka, if it can't find a corresponding hash locally and does all the rest for you. 
```
<img src="<?= $rokka->getStackUrl('images/foo.jpg', 'test-stack', 'jpg');?>"> 
```

### Store hashes somewhere else with TemplateHelper Callbacks

By default it stores the hash in a text file next to the local image, but that's maybe not what you need. You can write your own class implementing [\Rokka\Client\TemplateHelper\AbstractCallbacks](https://rokka.io/client-php-api/master/Rokka/Client/TemplateHelper/AbstractCallbacks.html) to change that behaviour.

```
class MyTemplateHelperCallbacks extends AbstractCallbacks
{
    public function getHash(AbstractLocalImage $image)
    {
        // lookup hash in Database or similiar
        return $this->lookupHash($image->getIdentifier());
    }

    public function saveHash(AbstractLocalImage $image, \Rokka\Client\Core\SourceImage $sourceImage)
    {
        // save hash in database or similar
        $this->saveHash($image->getIdentifier(), $sourceImage->shortHash);
        return $sourceImage->shortHash;
    }
}
```

And then provide that object to the `TemplateHelper` constructor.

```
$rokka = new TemplateHelper('$YOUR_ORG', '$YOUR_API_KEY', new MyTemplateHelperCallbacks());
```


### Getting image content from somewhere else with AbstractLocalImage

Sometimes original images are not stored in the local file system and can't be accessed with one of standard implementations, for example they are on AWS S3 or in a database. To support that, you need to write a class which implements `\Rokka\Client\LocalImage\AbstractLocalImage`. The simplest possible implementation is the following:

```
class myDBImage extends \Rokka\Client\LocalImage\AbstractLocalImage {
    public function getContent()
    {
        // getContentFromDB() has to be implemented by you as well
        return $this->getContentFromDB($this->identifier);
    }
}
```

and then you can use that with:

```
<img src="<?= $rokka->getStackUrl(new myDBImage('someKeyToLookUpInDB'), 'test-stack');?>"> 
```

You maybe also want to store the rokka hashes somewhere else (in the same database) in such a case, see the "TemplateHelper Callbacks" chapter above.

There are more methods you can implement in a LocalImage class to make your life easier. See the [API docs](https://rokka.io/client-php-api/master/) or the [sources](https://github.com/rokka-io/rokka-client-php/tree/master/src) for details.

# Managing via API

The PHP client library also offers a full blown API to all the REST API endpoints rokka provides. This may be very useful, when you for example want to upload your images as soon as they're uploaded to your framework/cms or you want automatically import them to rokka periodically and not only when they're accessed the first time (what the TemplateHelper classes do).

## Upload images

For uploading images, see the [Sourceimages](https://rokka.io/documentation/references/source-images.html) documentation. It contains PHP code how to upload source images and more. 

Once you uploaded an image, get the hash (or short hash) returned by that API call and store it somewhere for later use and generating URLs.

## Create stacks

You can also create stacks via the PHP API. It's documented in the [Stacks](https://rokka.io/documentation/references/stacks.html) reference. Head over there, also to have an overview of all the possible stack options and [operations](https://rokka.io/documentation/references/operations.html).
