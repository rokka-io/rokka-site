---
title: Get started
use: [guides]
---

## Concepts

rokka is an image service that lets you upload images and retrieve them with different configuration. In order to use it, you have to register, create an organization and then upload images into that organization and define how those images can be output.

To get started you need to understand the concepts of __organizations__, __source images__, __operations__ and __stacks__.

- __Organizations__ are the term in which images are bundled together. An organization can be your company, or a page. Access rights and billing is done on a level of organizations.

- __Source images__ are the images you upload into an organization in rokka. You should always upload the highest resolution images you have in order for the service to create great images for you. rokka will store metadata with the source image, some of which you can alter. Based on the image and metadata, rokka creates a hash which is then used for all other operations with this image.

- __Operations__ are single filters that can be applied to images. An example would be __resize__, where you can specify a width and height.

- __Stacks__ are an ordered collection of operations that have a name with it. A stack is always tied to an organization. You can render images with stacks, where the configured operations are applied to the image in the predefined order. This is the main way you can use rokka to create high quality images, very fast.

## Management API

rokka is controlled via a REST API. The API allows to manage organizations and stacks and to upload images.

We provide a couple of API clients in popular programming languages, but the REST API is documented, in case you need to build your own client. If you open source a client, please send us a note so that we can list it in the documentation.

## Versioning

Before we dive into the API more, you should be aware of versioning. The header `Api-Version` expects a full number as value, lowest being 1. You should always send the API version header when making requests. The pre built libraries already do that by default, sending the correct header for the version of the API they are using.

If you do not use the version header, rokka will always default to the latest version! In other words: __If you don't send the version header, your application might break at any time__ - you have been warned.

## Registration

Before you can use the rokka service, you need to register. The rokka API will offer an automated registration, but for now, you need to fill in the <a href="/signup">online form</a>.

<!---
To do so, you need only supply an email address. This call will register you at the service:

```language-bash
curl -H 'Content-Type: application/json' -X POST 'https://api.rokka.io/users' -d '[
    {
        "email": "my@email.com"
    }
]'
```
```language-php
$client = \Rokka\Client\Factory::getUserClient();

$user = $client->createUser('my@email.com');

var_dump($user); // print out important user data
```

The response will be a json object with key and secret in them. In addition they will be mailed to you, just to be sure. Keep them safe, you will need them for the next steps.
--->
