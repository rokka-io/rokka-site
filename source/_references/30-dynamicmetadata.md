---
title: Dynamic Metadata
use: [references]
description: Dynamic metadata is metadata added to a source image that changes the image identifying hash. Like a SubjectArea or a Version
---

## Intro

Dynamic metadata is metadata added to a source image that changes the image identifying hash.

## Add dynamic metadata to a source image

To add dynamic metadata to a source image, you need to provide the organization, the identifying hash of the image, the name of the dynamic metadata and the values to add. Do this by making a PUT request to `https://api.rokka.io/sourceimages/{organization}/{hash}/meta/dynamic/{name}`

rokka will generate a new image with a new identifying hash, the same binary hash and meta data and return the new location in the `Location` header of the response.  This newly created image and the previous one are not especially connected (besides having the same binary hash), so if you change meta data on one image later, it won't propagate to the other.

If an image with the new hash already exists, it won't be created, but the existing one will be used and returned. Existing meta data won't be copied/overwritten in this case.

If you don't need the previous image to be kept on rokka, you can directly delete it with the `?deletePrevious=true` parameter.

The endpoint returns a `201 Created` (with the new source image in the body) when the metadata change results in a new hash, and a `204 No Content` when the metadata is unchanged. Billable-only metadata (like `detection_face`) on a non-paying organization returns a `403`.

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

$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey');

$hash = '0dcabb778d58d07ccd48b5ff291de05ba4374fb9';

$dynamicMetadata = new SubjectArea(0, 0, 30, 230);

$newHash = $client->setDynamicMetadata($dynamicMetadata, $hash, 'testorganization', ['deletePrevious' => false]);

echo 'Updated subject area. New image hash: ' . $newHash . PHP_EOL;

```

You can also directly provide metadata when you first upload an image. See [Source images](source-images.html#supplying-metadata-while-creating-a-source-image) for details.

## Delete dynamic metadata from a source image

To delete dynamic metadata from a source image, you need to provide the organization, the identifying hash of the image and the name of the dynamic metadata. Do this by making a DELETE request to `https://api.rokka.io/sourceimages/{organization}/{hash}/meta/dynamic/{name}`

As in adding dynamic meta data, rokka will generate a new image with a new identifying hash, the same binary hash and meta data and return the new location in the `Location` header of the response.  If an image with the new hash already exists, it won't be created, but the existing one will be used and returned. Eventually existing meta data won't be copied/overwritten in this case.

If you don't need the previous image to be kept on rokka, you can directly delete it with the `?deletePrevious=true` parameter.

```language-bash
curl -H 'Content-Type: application/json' -X DELETE 'https://api.rokka.io/sourceimages/testorganization/0dcabb778d58d07ccd48b5ff291de05ba4374fb9/meta/dynamic/subject_area?deletePrevious=true'
```

## Updating dynamic metadata without changing the hash

Both the PUT and DELETE endpoints above accept an optional `?keepHash=true` query parameter. When set, rokka updates the dynamic metadata of the existing source image in place and does **not** recompute the identifying hash. The `Location` header in the response points back to the original hash.

This is useful when you have a lot of images and stacks referenced by hash in places you cannot easily update (CMS content, third party systems, printed URLs), and you want to add or change a subject area, crop area, etc. without rewriting all those references.

**A word of warning:** using `keepHash=true` goes against one of rokka's fundamental design principles, namely that the image hash uniquely identifies the source image together with its (dynamic) metadata. With `keepHash=true`, the same hash can suddenly refer to different metadata over time, which is exactly what the hash was designed to prevent. Use this only if you fully understand the trade-offs below — in most cases, accepting a new hash (the default behaviour) is the right choice.

There is a major caveat:

**Downstream caches are not invalidated automatically.** CloudFront, memcached and browser caches will keep serving the previously rendered images for the affected hash until they expire (can take several months). If you need rendered images to reflect the new metadata immediately, you have to invalidate them yourself, for example by bumping the stack version with `bin/console rokka:stack:updateversion $ORGANIZATION $STACK` or flushing the render cache.

**Browser caches are also not invalidated.** Even after you flush CloudFront and the rokka render cache, end users will still see the old rendered image until their local browser cache expires (rendered images are sent with a one-year `Cache-Control` max-age). There is no server-side way to force a refresh — the only options are waiting for the cache to expire, having users hard-reload, or changing the URL.

One workaround for the cache problem is to **create a new stack**. The stack name (and version) is part of the rendered URL, so a new/updated stack produces fresh URLs that are not in any cache, and end users will see the new rendered image immediately — while the source image hash (and therefore the part of the URL you cannot easily change) stays stable.

`keepHash=true` is mutually exclusive with `deletePrevious=true`; combining them returns `400 Bad Request`.

When you use `keepHash=true`, the response also includes a `Warning: 299` header reminding you that downstream caches (CloudFront, memcached, browser) are not invalidated automatically and may need manual invalidation (see the caveats above).

```language-bash
curl -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/sourceimages/testorganization/0dcabb778d58d07ccd48b5ff291de05ba4374fb9/meta/dynamic/subject_area?keepHash=true' -d '{
        "width": 20,
        "height": 20,
        "x": 0,
        "y": 0
    }'

curl -X DELETE 'https://api.rokka.io/sourceimages/testorganization/0dcabb778d58d07ccd48b5ff291de05ba4374fb9/meta/dynamic/subject_area?keepHash=true'
```

## Supported metadata objects

### Subject area

The subject area of an image is a box defined by its width, height and the coordinates of its
starting point (top-left corner). In pixels (of the full sized image) or percentage.

Setting the subject area of an image allows the Crop operation (when used with the `auto` anchor),
to center the cropping box around the defined SubjectArea.
For further details see the [Crop operation](../references/operations.html#crop)

You can use the SubjectArea to specify the most important part of the image, the part that should be
retained at any size.

#### Properties

- `x` (required): Integer. The x-offset of the starting point, in pixels or percentage.
- `y` (required): Integer. The y-offset of the starting point, in pixels or percentage.
- `width`: Integer. The width of the subject area, in pixels or percentage. The default value is 1.
- `height`: Integer. The height of the subject area, in pixels or percentage. The default value is 1.
- `percentage`: Boolean. If the parameters above are in percentage instead of pixels

### Crop area

Works similarly to the subject area object. But an image will always be cropped exactly at the defined area.
This is especially useful with the Multi area format mentioned below.

If Subject area and Crop area are set, Subject area is used.

#### Properties

- `x` (required): Integer. The x-offset of the starting point, in pixels or percentage.
- `y` (required): Integer. The y-offset of the starting point, in pixels or percentage.
- `width` (required): Integer. The width of the crop area, in pixels or percentage. The default value is 1.
- `height` (required): Integer. The height of the crop area, in pixels or percentage. The default value is 1.
- `percentage`: Boolean. If the parameters above are in percentage instead of pixels.

### Multi areas

With the multi areas object, you can assign multiple Crop or Subject areas to one image and use them in a stack.
This is especially useful, when you want to use a different section of a picture for different stacks. For example a 9:16 image should focus on different parts of an image than a 4:3 image.

Setting multi areas on an image:

```language-bash
curl -H 'Content-Type: application/json' -X PUT  https://api.rokka.io/sourceimages/testorganization/0dcabb778d58d07ccd48b5ff291de05ba4374fb9/meta/dynamic/multi_areas \
  -d '{
  "landscape_16_9":{"crop_area": {"width":1600,"height":900,"x":500,"y":400}},
  "portrait_3_4":{"crop_area": {"width":600,"height":800,"x":400,"y":300}}
}'
```

```language-php
$dynamicMetadata = new MultiAreas(['landscape_16_9' => [new CropArea(1600, 900, 500, 400)], 'portrait_3_4' => [new CropArea(600, 800, 400, 300)]]);
$newHash = $client->setDynamicMetadata($dynamicMetadata, $hash, 'test', ['deletePrevious' => false]);
```

After you set Multi areas on a picture, you can reference to them via stack settings for the crop operation and the parameter `area`. Eg.
`https://YOURORG.rokka.io/dynamic/crop-width-16-height-9-mode-ratio-area-landscape_16_9/0dcabb778d58d07ccd48b5ff291de05ba4374fb9.jpg` and if that image has one defined for that `area`, this Subject or Crop area is used. If not, if falls back to the standard settings (in this case would just crop the image with a 16:9 ratio).

### Version

The version object just takes one parameter `text`. You can give it any string you want and it will change your image hash based on that.

One usecase is, when you'd like to manage different user metadata for the same image for different use cases. If you add a unique version dynamic
metadata for each of them, you can organize them independently.

Another use case is that if you want to be sure, that an image embedded somewhere won't be deleted by another client, which also
used this exact same image with the same hash. Then you would generate a different hash for both with a different version, and they won't delete each others images.
Of course they still can via [deleting by binary hash](source-images.html#deleting-source-images-with-binary-hash), if they really want to. But with
a different hash for each client (or article for example), they don't have to know about each other and you don't need to keep track of where
that image is also used. But keep in mind, that even if it's the same image, due to a different hash, an end user has to download it again
for each hash.

```language-bash
curl -H 'Content-Type: application/json' -X PUT  https://api.rokka.io/sourceimages/testorganization/0dcabb778d58d07ccd48b5ff291de05ba4374fb9/meta/dynamic/version \
  -d '{
  "text": "someVersionHere"
}'
```

```language-php
$newHash = $client->setDynamicMetadata(new Version("someVersionHere"), $hash, 'test', ['deletePrevious' => false]);
```

You can also search for that version string with eg.

```language-bash
curl https://api.rokka.io/sourceimages/testorganization/?dynamic:str:version:text=someVersionHere
```

### Detection face

You can trigger face detection on an image by setting the `detection_face` dynamic metadata (with an empty body).
rokka then runs face detection (via AWS Rekognition) and stores the detected face area, which you can use with the
`face` crop anchor and the `image.face_detection.*` / `image.hasDetectionFace` [expressions](stacks.html#expressions).
A `detection_eyemouth` area is derived automatically as well.

This is a **billable-account-only** feature — calling it on a non-paying organization returns a `403`.

```language-bash
curl -H 'Content-Type: application/json' -X PUT  https://api.rokka.io/sourceimages/testorganization/0dcabb778d58d07ccd48b5ff291de05ba4374fb9/meta/dynamic/detection_face -d '{}'
```
