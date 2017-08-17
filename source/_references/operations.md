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

```language-bash
curl -X GET 'https://api.rokka.io/operations'
```
```language-php
$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey', 'apiSecret');

$operations = $client->listOperations();

var_dump($operations);
```

## Individual operations documentation

### Autorotate

Rotates the binary data to the correct physical orientation based on EXIF data.

If width and height are given, it takes those values to determine the aspect ratio and turns the image so it has the
same one as the box given, if needed. The rotation_direction is only taken into account when width and height are set
and then overrides the one set in the image's EXIF data.

#### Properties

All properties are optional.

- `width`: Integer, between 1 and 10000. Width of the box to fit in.
- `height`: Integer, between 1 and 10000. Height of the box to fit in.
- `rotation_direction`: Direction of rotation to use, overriding the one set in the EXIF data of the image.

### Blur

Blurs the entire image.

#### Properties

- `sigma`: Integer, minimum value 0. The default value is 4. Controls most of the blurring of the image.
- `radius`: Number, minimum value 0. The default value is 0. Can be left at 0 for most operations. If you have a deep
            understanding of how blurring operations work, you can use this to your advantage, otherwise you are good
            with leaving this at 0.

### Crop

Crops an image to a set size.

#### Properties

- `width` (required): Integer, between 1 and 10000. The new width for the image.
- `height` (required): Integer, between 1 and 10000. The new height for the image.
- `anchor`: String. Describes where the crop should originate in the form of `XOFFSET_YOFFSET`, where:
    - `XOFFSET` is either a number of pixels or "left", "center", "right"
    - `YOFFSET` is either a number of pixels or "top", "center", "bottom".
   
   The default value is `auto`, which will crop the image centering the crop box around the defined 
   [Subject Area](../references/dynamic-metadata.html#subject-area), if any.
   If no Subject Area is defined, the crop operation will fallback to `center_center`.

### Dropshadow

Adds a dropshadow to an image.

#### Properties

- `horizontal`: Integer, between -100 and 100. The horizontal extent of the shadow in pixels. The default value is 0.
- `vertical`: Integer, between -100 and 100. The vertical extent of the shadow in pixels. The default value is 0.
- `opacity`: Integer, between 0 and 100. 100 is fully opaque and 0 is fully transparent. The default value is 0.
- `sigma`: Integer, minimum value 0. The default value is 0.5. Controls most of the blurring of the shadow.
- `blur_radius`: Number, minimum value 0. The default value is 0. Can be left at 0 for most operations. If you have a
                 deep understanding of how blurring operations work, you can use this to your advantage, otherwise you
                 are good with leaving this at 0.
- `color`: String. The hex code for the shadow colour. The default value is `000000`.

### Grayscale

Converts an image to grayscale.

### Resize

Resizes an image.

#### Properties

At least `width` or `height` is required.

- `width`: Integer, between 1 and 10000. The new width for the image.
- `height`: Integer, between 1 and 10000. The new height for the image.
- `mode`: String. The mode of resizing to use. The default value is `box`. Possible values are:
    - `absolute`: Resizes the image to the dimensions given.
    - `box`: Resizes the image to keep its aspect ratio and fit into a box of the dimensions given, i.e. the dimensions given are the maximum dimensions of the resized image.
    - `fill`: Resizes the image to keep its aspect ratio and completely fill a box of the dimensions given, i.e. the dimensions given are the minimum dimensions of the resized image.
- `upscale`: Boolean. Whether to allow the resulting image to be bigger than the original one. The default value is `true`.
- `upscale_dpr`: Boolean. Whether to allow the resulting image to be dpr times bigger than the original one, when the dpr stack option is set. Eg. If your image has 100x100 dimensions and you ask for a 60x60 image, this setting would upscale a `dpr: 2` setting  to 120x120 even when `upscale` is set to `false`. But it would upscale a request for a 120x120 image only to 200x200 (since a `dpr: 1` request would leave it at 100x100). This is to prevent, that a browser would display an image  with `dpr: 1` on a standard screen bigger than one with `dpr: 2` on a retina screen.  We recommend to leave this untouched. The default value is `true`.
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

### Rotate

Rotates an image clockwise.

#### Properties

- `angle` (required): Number, between 0 and 360. The angle of rotation for the image.
- `background_colour`: String. The hex code for the background colour. The default value is `000000`.
- `background_opacity`: Number, between 0 and 100. 100 is fully opaque and 0 is fully transparent. The default value is 0.

### Sepia

Applies sepia toning to an image

#### Properties

- `threshold` : Positive Number. A measure of the extent of the sepia toning.

### Trim

Trims edges that are the background color from an image.

#### Properties

- `fuzzy`: Number, between 0 and 100. Sets the degree of tolerance for pixel colour when calculating how much to trim from the image. The default value is 0.
