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

### Alpha

Does operations with the alpha (transparency) channel of an image.

#### Properties

- `mode`: String, mode to be applied. The default value is `mask`.
    - `mask`: Returns the alpha channel as grayscale image, removing all other information, including the actual alpha channel.
    - `extract`: Returns just the alpha channel of an image.
    - `remove`: Removes the alpha channel from an image. 

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

- `sigma`: Number, minimum value 0. The default value is 4. Controls most of the blurring of the image.

### Crop

Crops an image to a set size.

#### Properties

- `width` (required): Integer, between 1 and 10000. The new width for the image.
- `height` (required): Integer, between 1 and 10000. The new height for the image.
- `anchor`: String. Describes where the crop should originate in the form of `XOFFSET_YOFFSET`, where:
    - `XOFFSET` is either a number of pixels or "left", "center", "right"
    - `YOFFSET` is either a number of pixels or "top", "center", "bottom".
   
   Or it can also be
    - `smart` for smart cropping (where the most attention of the image would be)
    - `subjectarea` for cropping on the subjectarea, if one exists
    - `face` for cropping on a face detection area, if this was added.
    - `auto`. Default value.
   
   `auto` will crop the image centering the crop box around the defined 
   [Subject Area](../references/dynamic-metadata.html#subject-area), if any exist, then around a face detection box , if any exist.
   If both are not defined defined, the crop operation will fallback to `center_center`.
   
   
- `mode`: String. If width and height should be taken as absolute values or as ratio. If ratio is chosen, rokka will try to find the largest possible crop fitting into the image with that ratio. The default value is `absolute`. Possible values are:
    - `absolute`
    - `ratio`
- `scale`: Scales the crop box by that percentage. Especially useful when using the ratio mode and you want eg. only the middle 50% of the picture cropped. The default value is `100`

### Dropshadow

Adds a dropshadow to an image.

#### Properties

- `horizontal`: Integer, between -100 and 100. The horizontal extent of the shadow in pixels. The default value is 0.
- `vertical`: Integer, between -100 and 100. The vertical extent of the shadow in pixels. The default value is 0.
- `opacity`: Integer, between 0 and 100. 100 is fully opaque and 0 is fully transparent. The default value is 0.
- `sigma`: Number, minimum value 0. The default value is 0.5. Controls most of the blurring of the shadow.
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

### Rotate

Rotates an image clockwise.

#### Properties

- `angle` (required): Number, between 0 and 360. The angle of rotation for the image.
- `background_colour`: String. The hex code for the background colour. The default value is `FFFFFF`.
- `background_opacity`: Number, between 0 and 100. 100 is fully opaque and 0 is fully transparent. The default value is 0.

### Sepia

Applies sepia toning to an image

### Trim

Trims edges that are the background color from an image.

#### Properties

- `fuzzy`: Number, between 0 and 100. Sets the degree of tolerance for pixel colour when calculating how much to trim from the image. The default value is 0.
