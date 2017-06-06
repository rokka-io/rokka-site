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
| basestack | - | - | - | Name of existing stack that will be executed before this stack. Makes it easy to create new stacks with same base options. |
| jpg.quality | 76 | 1 | 100 | Jpg quality setting, lower number means smaller file size and worse lossy quality. |
| webp.quality | 80 | 1 | 100 | WebP quality setting, lower number means smaller file size and worse lossy quality. Choose a setting of 100 for lossless quality. |
| png.compression_level | 7 | 0 | 9 | Higher compression means smaller file size but also slower first render. There is little improvement above level 7 for most images. |


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

### Overwriting stacks

Please read this carefully, if you want to overwrite existing stacks with new options/operations and the same name, since it may not work like you'd expect.

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
