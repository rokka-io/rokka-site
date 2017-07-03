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
| basestack | - | - | - | Name of existing stack that will be executed before this stack. See below for details|
| jpg.quality | 76 | 1 | 100 | Jpg quality setting, lower number means smaller file size and worse lossy quality. |
| webp.quality | 80 | 1 | 100 | WebP quality setting, lower number means smaller file size and worse lossy quality. Choose a setting of 100 for lossless quality. |
| png.compression_level | 7 | 0 | 9 | Higher compression means smaller file size but also slower first render. There is little improvement above level 7 for most images. |
| source_file | false | - | - | - | For outputting just the original unprocessed source file, set this to true and configure an empty operations collection. Can not be used together with other stack options. |
| autoformat | false | - | - | - | If set, rokka will return WebP instead of png/jpeg, if the client supports it. See below for more infos.|

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
use Rokka\Client\Core\StackOperation;
use Rokka\Client\Core\StackOperationCollection;

$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey', 'apiSecret');

$resize = new StackOperation('resize', ['width' => 200, 'height' => 200]);
$rotate = new StackOperation('rotate', ['angle' => 45]);

$stackOperationCollection = [$resize, $rotate];

$stack = $client->createStack('teststack', $stackOperationCollection, '', ['jpg.quality' => 60]);

echo 'Created stack ' . $stack->getName() . PHP_EOL;
print_r($stack);

```

Note: The name "dynamic" (used for dynamic rendering) and names starting with "_" are reserved and can't be chosen as stack names.

### Updating stacks

Please read this carefully, if you want to update an existing stacks with new options/operations, since it may not work like you'd expect.

rokka delivers images with a very long expire time (one year), so that endusers (eg. browsers) and the content delivery network (CDN) can keep them stored.
rokka assumes, that an image with the same URL never changes, that's why we use hashes for the images to ensure that. rokka also assumes that a once defined stack does not change significantly and suddenly delivers a totally different style of pictures. You have to create a new stack with a different name, if you want to do this. Otherwise end users may not get those newly generated images. While we can delete the CDN caches, there's no way to delete a browser cache without a new URL.

Nevertheless, there are situations where overwriting a stack with the same name may be useful. Basically, if you are fine when already delivered images stay the same and only newly generated get the new options/operations (eg. for changing the quality). Or you want to base an existing stack on a base stack to reorganize your stack with less repetition.

Be aware that currently there's no API call for deleting the CDN cache of a stack. So even if you have the browser cache under control (eg. during development of a new site), you can't delete the CDN cache without talking to us. We're willing to implement this, if there's enough demand for it.

To actually use it, just append `?overwrite=true` to your URL, and it will overwrite an eventually existing stack. Or in PHP add true as the 5th parameter of `createStack`.

```language-bash
curl -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/stacks/testorganization/teststack?overwrite=true' -d '{
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
use Rokka\Client\Core\StackOperation;
use Rokka\Client\Core\StackOperationCollection;

$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey', 'apiSecret');

$resize = new StackOperation('resize', ['width' => 200, 'height' => 200]);
$rotate = new StackOperation('rotate', ['angle' => 45]);

$stackOperationCollection = [$resize, $rotate];

$stack = $client->createStack('teststack', $stackOperationCollection, '', ['jpg.quality' => 60], true);

echo 'Created stack ' . $stack->getName() . PHP_EOL;
print_r($stack);

```

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

If you set the `autoformat: true` stack option, rokka will deliver an image in the usually smaller WebP format instead of PNG or JPG, if the client supports it.
If you didn't set `webp.quality` explicitely, it will return a lossless image, if a PNG was requested and a lossy image, if a JPG was requested. If you set `webp.quality` to any value on that stack, it will always honor that, no matter what was requested.

In the future, we may support more autoformat features, depending on demand.

## Retrieve a stack

You can retrieve a stack by providing the organization and stack name. This example gets the stack teststack from the organization testorganization.

```language-bash
curl -X GET 'https://api.rokka.io/stacks/testorganization/teststack'
```

```language-php
$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey', 'apiSecret');

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
$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey', 'apiSecret');

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
curl -X GET 'https://api.rokka.io/stacks/testorganization'
```

```language-php
use Rokka\Client\Core\Stack;

$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey', 'apiSecret');

$stacks = $client->listStacks();

foreach ($stacks as $stack) {
    /** @var Stack $stack */
    echo 'Stack ' . $stack->getName() . PHP_EOL;
}
```

### GET Parameters

| Attribute | Description |
| -------------- | ------------- |
| limit | Optional limit |
| offset | Optional offset |
