---
title: Source images
use: [references]
---

## Intro

Source images are your original images you upload to Rokka. You should always select the highest quality you can, Rokka will take care of the rest. Usually it's best to use PNG files, as they are not compressed. Rokka handles PNG, JPG and GIF files in RGB only. 

## The source image object

| Attribute | Description |
| -------------- | ------------- |
| organization | Name of the organization that the image belongs to |
| hash | Hash to access the image with, based on metadata |
| binary_hash | Hash of image binary data |
| static_metadata | Contains the following data set. Changing this will not alter the main hash identifying the image |
| name | Original filename |
| format | Original format |
| size | Size of images in bytes |
| width | Width of image in pixels |
| height | Height of image in pixels |
| dynamic_metadata | Can contain data that will alter the image identifying hash if altered |
| created | When this image was created |
| link | Backlink to itself, useful when you have lists or search by binary hash |

## Create a source image

You can create a source image with a post to the `/sourceimages` route and your organization name. It's a simple post with the file data in the body.

In the following example, __image.png__ is a image file in your current working directory and the organization is set to __mycompany__.

```bash
curl -X POST -F filedata=@image.png 'https://api.rokka.io/sourceimages/mycompany'
```
```php
$client = \Rokka\Client\Factory::getImageClient('mycompany', 'apiKey', 'apiSecret');

$sourceImage = $client->uploadSourceImage(file_get_contents('image.png'), 'image.png');

var_dump($sourceImage);
```


It will return the same meta data as you get from retrieving a single image, with the only difference that it is wrapped in an array for future expansions of multi file uploads.

## Retrieve data about a source image

You can retrieve meta data about a source image by providing the identifying hash on the `/sourceimages` route.

In the following example the organization is set to __mycompany__ and the hash is set to __c412d8d6e4b9b7b058320b06972ac0ec72cfe6e5__.

```bash
curl -X GET 'https://api.rokka.io/sourceimages/mycompany/c412d8d6e4b9b7b058320b06972ac0ec72cfe6e5'
```
```php
$client = \Rokka\Client\Factory::getImageClient('mycompany', 'apiKey', 'apiSecret');

$sourceImage = $client->getSourceImage('c412d8d6e4b9b7b058320b06972ac0ec72cfe6e5');

var_dump($sourceImage);
```

An example response looks like following.

```javascript
{
    "organization": "mycompany",
    "hash": "c412d8d6e4b9b7b058320b06972ac0ec72cfe6e5",
    "binary_hash": "03b3e8a0bdd76ef55c021066642c9d2fa9c02799",
    "static_metadata": 
    {
        "name": "image1.png",
        "format": "png",
        "size": 131284,
        "width": 800,
        "height": 1160
    },
    "dynamic_metadata": { },
    "created": "2015-08-24T12:17:12+0000",
    "link": "/sourceimages/liip/c412d8d6e4b9b7b058320b06972ac0ec72cfe6e5"
}
```


## Delete a source image

To delete a source image, you do a delete call on the source images url.

In the following example the organization is set to __mycompany__ and the hash is set to __c412d8d6e4b9b7b058320b06972ac0ec72cfe6e5__.

```bash
curl -X DELETE 'https://api.rokka.io/sourceimages/mycompany/c412d8d6e4b9b7b058320b06972ac0ec72cfe6e5'
```
```php
$client = \Rokka\Client\Factory::getImageClient('mycompany', 'apiKey', 'apiSecret');

$isDeleted = $client->deleteSourceImage('c412d8d6e4b9b7b058320b06972ac0ec72cfe6e5');

var_dump($isDeleted);
```

Deleting a source image will not remove it from the cache. Access to it will fade out as the cache becomes stale. Any new access to a render of a deleted source image will result in a 404 error.

Note: If the image you try to delete does not exist, the API responds with a 404 status code. This 404 can be ignored, though it might indicate a logic error in the client application.

## List source images

To list images for an organization, you can use this call.

In the following example the organization is set to __mycompany__.

```bash
curl -X GET 'https://api.rokka.io/sourceimages/mycompany'
```
```php
$client = \Rokka\Client\Factory::getImageClient('mycompany', 'apiKey', 'apiSecret');

$sourceImages = $client->listSourceImages();

var_dump($sourceImages);
```

The response will contain an array of objects that look like a single image, but may have less information presented. At least the hash will always be present.

### Paging the list

You can limit the outputs of the list by using limit and offset parameters to page through them.

| Attribute | Description | Default |
| -------------- | ------------- | ------------- |
| limit | Optional limit | 100 |
| offset | Optional offset | 0 |

```bash
curl -X GET 'https://api.rokka.io/sourceimages/mycompany?offset=100limit=20'
```
```php
$client = \Rokka\Client\Factory::getImageClient('mycompany', 'apiKey', 'apiSecret');

$sourceImages = $client->listSourceImages(20, 100);

var_dump($sourceImages);
```

### Finding by binary hash

You can limit the outputs of the list by using limit and offset parameters to page through them.

| Attribute | Description |
| -------------- | ------------- |
| binaryHash | SHA1 hash of the binary file, lowercase hex |

In the following example the organization is set to __mycompany__ and the binary hash is set to __03b3e8a0bdd76ef55c021066642c9d2fa9c02799__.

```bash
curl -X GET 'https://api.rokka.io/sourceimages/mycompany?binaryHash=03b3e8a0bdd76ef55c021066642c9d2fa9c02799'
```
```php
$client = \Rokka\Client\Factory::getImageClient('mycompany', 'apiKey', 'apiSecret');

$sourceImage = $client->getSourceImage('03b3e8a0bdd76ef55c021066642c9d2fa9c02799', true);

var_dump($sourceImage);
```

The result is a list with one item in it if anything is found.

## Downloading a source image

Should you have a need to download the source image again, you can do so, using this call. This is the only way to get the exact image back. Even if you choose "noop" as a stack operation, rokka will process the image which may alter it.

```bash
curl -X GET 'https://api.rokka.io/sourceimages/mycompany/c412d8d6e4b9b7b058320b06972ac0ec72cfe6e5/download'
```

It will return the binary data as the response and contain the name of the file in the header of the response.
