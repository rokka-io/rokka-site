---
title: Get started
use: [guides]
---

## Concepts

Rokka is an image service that lets you upload images and retrieve them with different configuration. In order to use it, you have to register, create an organization and then upload images.

To get started you need to understand the concepts of __organizations__, __source images__, __operations__ and __stacks__.

- __Organizations__ are the term in which images are bundled together. An organization can be your company, or a page. Access rights and billing is done on a level of organizations.

- __Source images__ are the images you upload to the service. You should always upload the highest resolution images you have in order for the service to create great images for you. Rokka will store metadata with the source image, some of which you can alter. Based on the image and metadata, Rokka creates a hash which is then used for all other operations with this image.

- __Operations__ are single filters that can be applied to images. An example would be __resize__, where you can specify a width and height.

- __Stacks__ are an ordered collection of operations that have a name with it. A stack is always tied to an organization. You can render images with stacks, where the configured operations are applied to the image in the predefined order. This is the main way you can use Rokka to create high quality images, very fast.

## Libraries

Currently we provide a fully functional library to use Rokka in your PHP Project.

The easiest way to install it is by using [composer](https://getcomposer.org/).

In your project folder run `composer require rokka/client` to install it.

Composer will take care of everything for you and you can use it straight away with the examples in the documentation.

More libraries for other languages are planned.  

## Versioning

Before we dive into the api more, you should be aware of versioning. The header `Api-Version` expects a full number as value, lowest being 1. You should always send an api version header when making requests. The pre built libraries already do that by default, sending the correct header for the version of the API they are using.

If you do not use the version header, Rokka will always default to the latest version! In other words: __If you don't send the version header, your application might break with an update__, you have been warned.

## Registration

Before you can use the service, you need to register.

To do so, you need only supply an email address. This call will register you at the service:

```bash
curl -H 'Content-Type: application/json' -X POST 'https://api.rokka.io/users' -d '[
    {
        "email": "my@email.com"
    }
]'
```
```php
$client = \Rokka\Client\Factory::getUserClient();

$user = $client->createUser('my@email.com');

var_dump($user); // print out important user data
```

The response will be a json object with key and secret in them. In addition they will be mailed to you, just to be sure. Keep them safe, you will need them for the next steps.
