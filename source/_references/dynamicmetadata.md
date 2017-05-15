---
title: Dynamic metadata
use: [references]
---

## Intro

Dynamic metadata is metadata added to a source image that changes the image identifying hash. Currently the only dynamic metadata supported is the [subject area](#subject-area).

## Add dynamic metadata to a source image

To add dynamic metadata to a source image, you need to provide the organization, the identifying hash of the image, the name of the dynamic metadata and the values to add. Do this by making a PUT request to `https://api.rokka.io/sourceimages/{organization}/{hash}/meta/dynamic/{name}`

rokka will generate a new image with a new identifying hash, the same binary hash and meta data and return the new location in the `Location` header of the response.  This newly created image and the previous one are not especially connected (besides having the same binary hash), so if you change meta data on one image later, it won't propagate to the other.

If an image with the new hash already exists, it won't be created, but the existing one will be used and returned. Existing meta data won't be copied/overwritten in this case.

If you don't need the previous image to be kept on rokka, you can directly delete it with the `?deletePrevious=true` parameter.

In the following example, we are adding a subject area to an image.

```language-bash
curl -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/sourceimages/testorganization/0dcabb778d58d07ccd48b5ff291de05ba4374fb9/meta/dynamic/subject_area' -d '{
        "width": 20, 
        "height": 20, 
        "x": 0, 
        "y": 0
    }'
```


```language-php
use Rokka\Client\Core\DynamicMetadata\SubjectArea;

$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey', 'apiSecret');

$hash = '0dcabb778d58d07ccd48b5ff291de05ba4374fb9';

$dynamicMetadata = new SubjectArea(0, 0, 30, 230);

$newHash = $client->setDynamicMetadata($dynamicMetadata, $hash, ['deletePrevious' => false);

echo 'Updated subject area. New image hash: ' . $newHash . PHP_EOL;

```

## Delete dynamic metadata from a source image

To delete dynamic metadata from a source image, you need to provide the organization, the identifying hash of the image and the name of the dynamic metadata. Do this by making a DELETE request to `https://api.rokka.io/sourceimages/{organization}/{hash}/meta/dynamic/{name}`

As in adding dynamic meta data, rokka will generate a new image with a new identifying hash, the same binary hash and meta data and return the new location in the `Location` header of the response.  If an image with the new hash already exists, it won't be created, but the existing one will be used and returned. Eventually existing meta data won't be copied/overwritten in this case.

If you don't need the previous image to be kept on rokka, you can directly delete it with the `?deletePrevious=true` parameter.

```language-bash
curl -H 'Content-Type: application/json' -X DELETE 'https://api.rokka.io/sourceimages/testorganization/0dcabb778d58d07ccd48b5ff291de05ba4374fb9/meta/dynamic/subject_area?deletePrevious=true'
```

## Subject area

The subject area of an image is a box defined by its width, height and the coordinates of its
starting point (top-left corner).
Setting the subject area of an image allows the Crop operation (when used with the `auto` anchor),
to center the cropping box around the defined SubjectArea.
For further details see the [Crop operation](../references/operations.html#crop) 
 
You can use the SubjectArea to specify the most important part of the image, the part that should be
retained at any size.

### Properties

- `x` (required): Integer. The x-offset of the starting point, in pixels.
- `y` (required): Integer. The y-offset of the starting point, in pixels.
- `width`: Integer. The width of the subject area, in pixels. The default value is 1.
- `height`: Integer. The height of the subject area, in pixels. The default value is 1.
