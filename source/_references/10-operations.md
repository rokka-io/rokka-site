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

It is possible to list all operations. [Try it out](https://api.rokka.io/doc/#/stacks/listOperations).

```language-bash
curl -X GET 'https://api.rokka.io/operations'
```
```language-php
$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey');

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
    - `apply`: Applies an opacity to an image, needs also the property `opacity`

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

### Composition

Merges two images together to one. The to be added image (called secondary image) can either be another image uploaded to rokka or a fixed box with a defined size and color. You can also add additional transparency to both of them. This second image can be put into the background or the foreground of the initial image.

One usecase is to extend the canvas size of an image without resizing it. For this you define a new box with `width` and `height` and the optional `secondary_opacity`, `secondary_color` and `anchor`. Then you use `mode: "foreground"` to put the initial image in front of that defined box. 

The returned image is never smaller than the initial image. If eg. the dimensions of `width` and `height` are smaller than the initial image, it will return the full initial image. Therefore you can't count on having all the images returned from this operation having the same size, except if you put a `resize` operation before.


```language-javascript
{
    "name": "resize",
    "options": {
        "height": 450
    }
},
{
    "name": "composition",
    "options": {
        "mode": "foreground",
        "width": 1200,
        "height": 550,
        "anchor": "left_bottom"
        "secondary_opacity": 0,
    }
}

```

Or to fit a 4:3 image into a 16:9 box with white borders:

```language-javascript
{
    "name": "resize",
    "options": {
        "height": 160,
        "width": 90
    }
},
{
    "name": "composition",
    "options": {
        "mode": "foreground",
        "width": 160,
        "height": 90,
        "secondary_color": "FFFFFF",
    }
} 
```

Another use case is to add a watermark to your images. For this you have to upload your "watermark" to rokka as you would do with any other image and use the hash of that image in the option `secondary_image`. Then you use `mode: "background"` to put the initial image in the background of that secondary image.
 You can also use the optional `width`, `height`, `secondary_opacity`, `resize_mode` and `anchor` options in this mode.

```language-javascript
{
    "name": "composition",
    "options": {
        "mode": "background",
        "width": 160,
        "height": 90,
        "secondary_image": "ddc45f",
        "anchor": "right_bottom"
    }
} 
```


#### Properties

- `mode`: Where to put the initial image, `foreground` and `background` are possible options.
- `width`: Width of the secondary image. 
- `height`: Height of the secondary image.
- `resize_mode`: If `secondary_image` is used and `width` or `height` are set, the image is resized with this resize mode. See the [Resize operation](#resize) for possible values. Default: box
- `anchor`: Anchor where to place the composition, based on mode. See the [Crop operation](#crop) for possible values. Default: center_center
- `secondary_color`: Color to use as filler in hex without the # sign, example: "0F0F0F". Not used in when `secondary_image` is set. Default: 000000
- `secondary_opacity`: Opacity of filler. Default is 0, transparent. Goes up to 100 for opaque. Default: 100
- `resize_to_primary`: A `secondary_image` is resized to the primary `width` and `height`

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
   
- `fallback`: String. What "anchor" should be used, when no subject area was found. Default: "center_center"
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

### Modulate

Modulates an image for brightness, saturation and hue. Use this to for example brighten up or darken an image or remove its colors. 

For brightness and saturation, the input is an integer between 0 and 500, which is meant as percentage. The maximum value of 500 is pretty arbitrary, but more usually doesn't make any sense.

The brightness parameter applies a linear multiplier to the input image, making it appear brighter or darker. A value under 100 darkens the image, while a value over 100 brightens it.
A value of 0 will create an image that is completely black, while a value of 100 leaves the input unchanged. A value of for example 200 doubles the brightness of the image.

The saturation parameter super-saturates or desaturates the input image. A value under 100 desaturates the image, while a value over 100 super-saturates it. A value of 0 returns a completely unsaturated (no colors) image, while a value of 100 leaves the input unchanged. A value of for example 200 doubles the saturation of the image.

For the hue parameter, the input is an integer defining how many degrees the color should be shifted on a color wheel. A value of 0 and 360 leaves the input unchanged. A value of for example 180 inverts all colors to their opposite color on the wheel. 

#### Properties

- `brightness`: Integer. Percentage of brightness change between 0 and 500. The default value is 100.
- `saturation`: Integer. Percentage of saturation change between 0 and 500. The default value is 100.
- `hue`: Integer. Degrees for hue rotation between 0 and 360. The default value is 0.

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
We advise to read [this blog post about resizing and responsive images](https://www.liip.ch/en/blog/things-you-should-know-about-responsive-images), if you want to turn this off.
- `upscale_dpr`: Boolean. Whether to allow the resulting image to be dpr times bigger than the original one, when the dpr stack option is set. Eg. If your image has 100x100 dimensions and you ask for a 60x60 image, this setting would upscale a `dpr: 2` setting  to 120x120 even when `upscale` is set to `false`. But it would upscale a request for a 120x120 image only to 200x200 (since a `dpr: 1` request would leave it at 100x100). This is to prevent, that a browser would display an image  with `dpr: 1` on a standard screen bigger than one with `dpr: 2` on a retina screen.  We advise to read [this blog post about resizing and responsive images](https://www.liip.ch/en/blog/things-you-should-know-about-responsive-images), if you want to turn this off. The default value is `true`.

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
