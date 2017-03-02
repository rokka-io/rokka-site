---
title: Operations
use: [references]
---

## The operation object

| Attribute | Description |
| -------------- | ------------- |
| properties | An object that describes the parameters for the operation |
| required | Required parameters |

## List operations

It is possible to list all operations.

```bash
curl -X GET 'https://api.rokka.io/operations'
```
```php
$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey', 'apiSecret');

$operations = $client->listOperations();

var_dump($operations);
```

## Resize

Resizes an image.

### Properties

- `width` (required): Integer, between 1 and 10000. The new width for the image. 
- `height` (required): Integer, between 1 and 10000. The new height for the image.
- `mode`: String. The mode of resizing to use. The default value is `box`. Possible values are:
    - `absolute`: Resizes the image to the dimensions given.
    - `box`: Resizes the image to keep its aspect ratio and fit into a box of the dimensions given, i.e. the dimensions given are the maximum dimensions of the resized image.
    - `fill`: Resizes the image to keep its aspect ratio and completely fill a box of the dimensions given, i.e. the dimensions given are the minimum dimensions of the resized image.
- `upscale`: Boolean. Whether to allow the resulting image to be bigger than the original one. The default value is `true`.
- `filter`: String. The filter to use when resizing the image. The default value is `blackman`. Possible values are:
    - `blackman`
    - `bessel`
    - `box`
    - `catrom`
    - `cubic`
    - `gaussian`
    - `hamming`
    - `hanning`
    - `hermite`
    - `lanczos`
    - `mitchell`
    - `quadratic`
    - `point`
    - `sinc`
    - `triangle`

## Rotate

Rotates an image clockwise.

### Properties

- `angle` (required): Number, between 0 and 360. The angle of rotation for the image.
- `background_colour`: String. The hex code for the background colour. The default value is `000000`.
- `background_opacity`: Number, between 0 and 100. 100 is fully opaque and 0 is fully transparent. The default value is 0.

## Dropshadow

Adds a dropshadow to an image.

### Properties

- `horizontal`: Integer, between -100 and 100. The horizontal extent of the shadow in pixels. The default value is 0.
- `vertical`: Integer, between -100 and 100. The vertical extent of the shadow in pixels. The default value is 0.
- `opacity`: Integer, between 0 and 100. 100 is fully opaque and 0 is fully transparent. The default value is 0.
- `sigma`: Integer, minimum value 0. This parameter has a considerable effect on the rendering time! The default value is 10.
- `blur_radius`: Number, minimum value 0. The default value is 0.
- `color`: String. The hex code for the shadow colour. The default value is `000000`.

## Trim

Trims edges that are the background color from an image.

### Properties

- `fuzzy`: Number, between 0 and 100. Sets the degree of tolerance for pixel colour when calculating how much to trim from the image. The default value is 0.

## [Crop](#crop)

Crops an image to a set size.

### Properties

- `width` (required): Integer, between 1 and 10000. The new width for the image.
- `height` (required): Integer, between 1 and 10000. The new height for the image.
- `anchor`: String. Describes where the crop should originate in the form of `XOFFSET-YOFFSET`, where:
    - `XOFFSET` is either a number of pixels or "left", "center", "right"
    - `YOFFSET` is either a number of pixels or "top", "center", "bottom".
   
   The default value is `auto`, which will crop the image centering the crop box around the defined 
   [Subject Area](../references/dynamic-metadata.html#subject-area), if any.
   If no Subject Area is defined, the crop operation will fallback to `center-center`.

## Noop

Performs no operations and has no properties. The noop operation is provided so you can create a stack to return an unaltered source image.
