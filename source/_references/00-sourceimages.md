---
title: Source images
use: [references]
---

## Intro

Source images are your original images you upload to Rokka. You should always select the highest quality you can, Rokka will take care of the rest. Usually it's best to use PNG files, as they are not compressed. Rokka can handle PNG, JPEG, (animated) GIF, HEIC, WebP, TIFF, PSD, EPS, PDF and SVG files (more possible, just inquire). It also can deliver videos, see the [video chapter](videos.html) for more.
 
 To ensure the best possible results, we recommend to upload the pictures in sRGB (with or without alpha channel) and not for example in CMYK.



## The source image object

| Attribute | Description |
| -------------- | ------------- |
| organization | Name of the organization that the image belongs to |
| hash | Hash to access the image with, based on metadata. 40 characters long |
| short_hash | A shorter, still unique version of the hash. Can be used instead of the hash. 6-40 characters |
| binary_hash | Sha1 hash of image binary data [(1)](#about-the-usage-of-sha1-in-hashes) |
| name | Original filename |
| format | Original format as common file extension|
| mimetype | Original mime type |
| size | Size of images in bytes |
| width | Width of image in pixels |
| height | Height of image in pixels |
| dynamic_metadata | Can contain data that will alter the image identifying hash if altered. See [dynamic metadata](dynamic-metadata.html) |
| user_metadata | Contains custom meta data set by the API user that is returned when requesting the source image and can be used for searching. Changing this will not alter the main hash identifying the image. See [user metadata](user-metadata.html) |
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

The current limit for uploading images are 150 MB in file size. For source images not in the JPEG or WebP format there's
 an additional limit of 225 Megapixels (equals an image of 15'000 x 15'000 size) .

### Create a source image with a remote URL

Instead of directly uploading an image within the POST request, you can also provide an URL to a remote image, which then will be 
downloaded by rokka and inserted into your repository. This happens synchronously, so you will get the same hashes and metadata back as with directly uploading an image.

The image at the URL has to be publicly accessible. There's currently no way to add authentication. If you need that, (talk to us)[https://rokka.io/en/contact/].

```language-bash
curl -X POST -F url[0]='https://rokka.rokka.io/dynamic/noop/f4d3f334ba90d2b4b00e82953fe0bf93e7ad9912.png' 'https://api.rokka.io/sourceimages/mycompany'
```
```language-php
$client = \Rokka\Client\Factory::getImageClient('mycompany', 'apiKey');

$sourceImages = $client->uploadSourceImageByUrl('https://rokka.rokka.io/dynamic/noop/f4d3f334ba90d2b4b00e82953fe0bf93e7ad9912.png');

var_dump($sourceImages);
```


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

// you can also use a metadata object for dynamic metadata instead eg.
// $sourceImages = $client->uploadSourceImage(file_get_contents('image.png'), 'image.png', null, ['meta_user' => ['foo' => 'bar'], 'meta_dynamic' => [new SubjectArea(50, 100)]]);

var_dump($sourceImages);
```

In case that source image already exists and there are metadata fields which are not defined in the upload, they are not deleted.

### Optimizing source images before saving

Sometimes source images contain too much data not really needed for just rendering images. 
Setting the `optimize_source` parameter to `true` can save you some storage space for such cases. 

When this parameter is set, rokka  (losslessly) recompresses TIFF and PSD (to PNG) images when this is set, but leaves the other formats 
alone (may be extended to other formats in the future). Helpful if you for example have layers from Photoshop. After setting this parameter, the original image (the PSD/TIFF one) 
will be gone and not retrievable anymore, just the optimized ones.

Additional you can set this parameter to `jpg` or `png`. Then rokka will convert TIFF and PSD files to high quality JPEG (or WebP, 
if the image is not opaque) or PNG before storing, saving even more space.

The binary hash generated for that source image is the one of the original image (before the recompression), and not the one actually stored. 
So you still can search for that image if you have to, using the original binary hash generated from the image.

### Protecting images

See the [Protected Images and Stacks chapter](./protected-images-stacks.html) for details. 

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

An example response would be:

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
    "link": "/sourceimages/mycompany/c412d8d6e4b9b7b058320b06972ac0ec72cfe6e5"
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

The same binary hash can have different entries in rokka, if they have different [dynamic metadata](dynamic-metadata.html). With this command you can delete all of them at once

```language-bash
curl -X DELETE 'https://api.rokka.io/sourceimages/mycompany?binaryHash=03b3e8a0bdd76ef55c021066642c9d2fa9c02799'
```
```language-php
$client = \Rokka\Client\Factory::getImageClient('mycompany', 'apiKey');

$isDeleted = $client->deleteSourceImagesWithBinaryHash('03b3e8a0bdd76ef55c021066642c9d2fa9c02799');

var_dump($isDeleted);
```

With the [PHP CLI](https://github.com/rokka-io/rokka-client-php-cli) you can also delete all source images from one organization. 
Be aware that this may take a while, if you have many images.

```language-bash
./bin/rokka-cli image:delete-all 
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

```language-php
$client->restoreSourceImage($hash);
```



## Copy a source image to another organization

To copy a source image to another organization (for example for copying images from a production to a test environment),
you can do a `COPY` request to  `/sourceimages/{org}/{hash}` and send the `Destination` header with the destination organization.
If you send a `Overwrite: F` header with it, it won't copy it, if it already exists at the destination.
Your API user needs to have read permissions on the source organization and write permissions on the destination organization. 
The [memberships endpoint](users-and-memberships.html) has methods to give an API user access to more organizations.

Returns the following http status codes:

* 201, if the image was newly created at the destination.
* 204, if the image was overwritten at the destination.
* 400, if the destination organization does not exist.
* 403, if you're not allowed to write to the destination organization.
* 404, if the source image was not found.
* 412, if `Overwrite: F` was sent and the destination exists already.

```language-bash
curl -X COPY -H 'Destination: mycompany-stage' 'https://api.rokka.io/sourceimages/mycompany/c412d8d6e4b9b7b058320b06972ac0ec72cfe6e5' 
```

```language-php
$client->copySourceImage($hash, $destinationOrg)
```

You can also copy up to 100 images at once for a little bit better performance.

```language-bash
curl -X POST -H 'Destination: mycompany-stage' 'https://api.rokka.io/sourceimages/mycompany/copy' -d '["abcdef","fedcba"]' 
```


With the [Go CLI](https://github.com/rokka-io/rokka-go) you can also copy all source images from one organization to another, without having to down- and upload them again. 
Be aware that this may take a while, if you have many images. If that's the case and you need it to be faster, talk to us, we can increase some limits.

```language-bash
rokka sourceimages copy-all $SOURCE_ORG $DESTINATION_ORG
```

You can also use the [PHP CLI](https://github.com/rokka-io/rokka-client-php-cli) for copying a whole organization. But it may be slower than the Go CLI, as it doesn't do parallel copying. 

```language-bash
./bin/rokka-cli image:copy-all $DESTINATION_ORG
```

If you just want to have a fallback organisation, while rendering images (but not for API operations), see the [Use another organization as fallback for rendering images chapter](./render.html#use-another-organization-as-fallback-for-rendering-images).

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


## About the usage of sha1 in hashes

We use sha1 for generating hashes and binary hashes of sourceimages, but not for cryptography or other security related matters.
All rokka needs is an unique hash per source image and sha1 does guarantee that.

We also separate the storage of images by organization. Images with the same hash in different organizations are treated separately and would not influence each other.

