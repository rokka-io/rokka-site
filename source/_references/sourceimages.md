---
title: Source images
use: [references]
---

## Intro

Source images are your original images you upload to Rokka. You should always select the highest quality you can, Rokka will take care of the rest. Usually it's best to use PNG files, as they are not compressed. Rokka can handle PNG, JPG, GIF, WEBP, PDF and SVG files (more possible, if there's a demand). To ensure the best possible results, we recommend to upload the pictures in sRGB (with or without alpha channel) and not for example in CMYK.



## The source image object

| Attribute | Description |
| -------------- | ------------- |
| organization | Name of the organization that the image belongs to |
| hash | Hash to access the image with, based on metadata. 40 characters long |
| short_hash | A shorter, still unique version of the hash. Can be used instead of the hash. 6-40 characters |
| binary_hash | Sha1 hash of image binary data |
| name | Original filename |
| format | Original format as common file extension|
| mimetype | Original mime type |
| size | Size of images in bytes |
| width | Width of image in pixels |
| height | Height of image in pixels |
| dynamic_metadata | Can contain data that will alter the image identifying hash if altered. See [dynamic metadata](dynamic-metadata.html) |
| user_metadata | Contains custom meta data set by the API user for later searches. Changing this will not alter the main hash identifying the image. See [user metadata](user-metadata.html) |
| created | When this image was created on rokka |
| link | Backlink to itself, useful when you have lists or search by binary hash |

## Create a source image

You can create a source image with a post to the `/sourceimages` route and your organization name. It's a simple post with the file data in the body.

In the following example, __image.png__ is a image file in your current working directory and the organization is set to __mycompany__.

```language-bash
curl -X POST -F filedata=@image.png 'https://api.rokka.io/sourceimages/mycompany'
```
```language-php
$client = \Rokka\Client\Factory::getImageClient('mycompany', 'apiKey');

$sourceImages = $client->uploadSourceImage(file_get_contents('image.png'), 'image.png');

var_dump($sourceImages);
```


It will return the same meta data as you get from retrieving a single image, with the only difference that it is wrapped in an array for future expansions of multi file uploads.

### Supplying metadata while creating a source image

You can also directly add [user metadata](user-metadata.html) or [dynamic metadata](dynamic-metadata.html) while creating an image.

```language-bash
curl -X POST -F filedata=@image.png \
             -F 'meta_user[0]={"foo":"bar"}' \
             -F 'meta_dynamic[0][subject_area]={"x":100,"y":100}' \
             'https://api.rokka.io/sourceimages/mycompany'
```
```language-php
$client = \Rokka\Client\Factory::getImageClient('mycompany', 'apiKey');

$sourceImages = $client->uploadSourceImage(file_get_contents('image.png'), 'image.png', null, ['meta_user' => ['foo' => 'bar'], 'meta_dynamic' => ['subject_area' => ['x'=> 50, 'y' => 100]]]);

var_dump($sourceImages);
```

In case that source image already exists and there's metadata fields which are not defined in the upload, they are not deleted.

## Retrieve data about a source image

You can retrieve meta data about a source image by providing the identifying hash on the `/sourceimages` route.

In the following example the organization is set to __mycompany__ and the hash is set to __c412d8d6e4b9b7b058320b06972ac0ec72cfe6e5__.

```language-bash
curl -X GET 'https://api.rokka.io/sourceimages/mycompany/c412d8d6e4b9b7b058320b06972ac0ec72cfe6e5'
```
```language-php
$client = \Rokka\Client\Factory::getImageClient('mycompany', 'apiKey');

$sourceImage = $client->getSourceImage('c412d8d6e4b9b7b058320b06972ac0ec72cfe6e5');

var_dump($sourceImage);
```

An example response looks like following.

```language-js
{
    "hash": "c412d8d6e4b9b7b058320b06972ac0ec72cfe6e5",
    "short_hash": "c03683",
    "binary_hash": "03b3e8a0bdd76ef55c021066642c9d2fa9c02799",
    "created": "2015-08-24T12:17:12+0000",
    "name": "image1.png",
    "mimetype": "image/jpeg",
    "format": "png",
    "size": 131284,
    "width": 800,
    "height": 1160
    "organization": "mycompany",
    "link": "/sourceimages/liip/c412d8d6e4b9b7b058320b06972ac0ec72cfe6e5"
}
```


## Delete a source image

To delete a source image, you do a delete call on the source images url.

In the following example the organization is set to __mycompany__ and the hash is set to __c412d8d6e4b9b7b058320b06972ac0ec72cfe6e5__.

```language-bash
curl -X DELETE 'https://api.rokka.io/sourceimages/mycompany/c412d8d6e4b9b7b058320b06972ac0ec72cfe6e5'
```
```language-php
$client = \Rokka\Client\Factory::getImageClient('mycompany', 'apiKey');

$isDeleted = $client->deleteSourceImage('c412d8d6e4b9b7b058320b06972ac0ec72cfe6e5');

var_dump($isDeleted);
```

Deleting a source image will not remove it from the cache. Access to it will fade out as the cache becomes stale. Any new access to a render of a deleted source image will result in a 404 error.

Note: If the image you try to delete does not exist, the API responds with a 404 status code. This 404 can be ignored, though it might indicate a logic error in the client application.

## Deleting source images with binary hash

The same binary hash can have different entries in rokka, if they have different [dynamic metadata](dynamicmetadata.html). With this command you can delete all of them at once

```language-bash
curl -X DELETE 'https://api.rokka.io/sourceimages/mycompany?binaryHash=03b3e8a0bdd76ef55c021066642c9d2fa9c02799'
```
```language-php
$client = \Rokka\Client\Factory::getImageClient('mycompany', 'apiKey');

$isDeleted = $client->deleteSourceImagesWithBinaryHash('03b3e8a0bdd76ef55c021066642c9d2fa9c02799');

var_dump($isDeleted);
```

## Restore a source image

To restore a deleted image and its metadata,  do a `POST`request to `/sourceimages/{org}/{hash}/restore`.
Returns a 200 http code and the meta data for the image, if the image could be restored. Also if the image wasn't deleted and didn't need to be restored.
Returns a 404, if the image could not be restored or was not found.

Images can be restored for 30 days after their deletion.

You can also search for deleted images, if you add the search parameter "?deleted=true" to your searches. See [searching for images](searching-images.html) for more details.

```language-bash
curl -X POST 'https://api.rokka.io/sourceimages/mycompany/c412d8d6e4b9b7b058320b06972ac0ec72cfe6e5/restore'
```

## List source images

See [searching for images](searching-images.html) for more details about how to get a list of your images.

## Finding with binary hash

You can limit the outputs of the list by using limit and offset parameters to page through them.

| Attribute | Description |
| -------------- | ------------- |
| binaryHash | SHA1 hash of the binary file, lowercase hex |

In the following example the organization is set to __mycompany__ and the binary hash is set to __03b3e8a0bdd76ef55c021066642c9d2fa9c02799__.

```language-bash
curl -X GET 'https://api.rokka.io/sourceimages/mycompany?binaryHash=03b3e8a0bdd76ef55c021066642c9d2fa9c02799'
```
```language-php
$client = \Rokka\Client\Factory::getImageClient('mycompany', 'apiKey');

$sourceImage = $client->getSourceImageWithBinaryHash('03b3e8a0bdd76ef55c021066642c9d2fa9c02799');

var_dump($sourceImage);
```

The result is a list with one item in it if anything is found.

## Downloading a source image

Should you have a need to download the source image again, you can do so, using this call. This is the only way to get the exact image back. Even if you choose "noop" as a stack operation, rokka will process the image which may alter it.

```language-bash
curl -X GET 'https://api.rokka.io/sourceimages/mycompany/c412d8d6e4b9b7b058320b06972ac0ec72cfe6e5/download'
```

It will return the binary data as the response and contain the name of the file in the header of the response.
