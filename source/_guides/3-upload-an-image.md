---
title: Upload and Render an Image
---

## Upload Image into an Organization

You have your user, know how to authenticate and created an organization. Now let's upload an image!

```bash
curl -X POST -F filedata=@image.jpg 'https://api.rokka.io/sourceimages/testorganization'
```
```php
/** @var \Rokka\Client\Image $imageClient */ 
$imageClient->uploadSourceImage(file_get_contents('image.jpg'), 'image.jpg');
```

The previous cURL command does a __POST__ request on api.rokka.io, with an image under __./image.jpg__ for an organization called __testorganization__.
The @ sign instructs cURL to send the binary data of the specified file. If the upload was successful, it returns the metadata in the "source image" structure, for example: 

```javascript
{
    "total": 1,
    "sourceimages": [
        {
            "hash": "c03683b067927d77973b458e0baa40aa7b5e5418",
            "organization": "testorganization",
            "created": {
                "date": "2015-08-20 10:11:33.000000",
                "timezone_type": 3,
                "timezone": "UTC"
            },
            "name": "image.jpg",
            "format": "jpg",
            "size": 426884,
            "width": 800,
            "height": 600,
            "deleted": false
        }
    ]
}
```

Keep track of the hash you where returned. You will need this hash to display the image. The hash does not change when you upload the same image again, but is guaranteed to change if the image changes in any way. When you display the image, it can be cached for a long time, as the URL changes when the image content changed.

## Creating a Stack

Now that your image is uploaded, you can create a stack to render our image with custom operations.
Let's say we want to resize our images to have them display as thumbnails in our app.

```bash
curl -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/stacks/testorganization/thumbnail' -d '[
    {
        "name": "resize",
        "options": {
            "width": 200,
            "height": 200
        }
    }
]'
```
```php

$resize = new \Rokka\Client\Core\StackOperation('resize', ['width' => 200, 'height' => 200]);
$stackOperationCollection = new \Rokka\Client\Core\StackOperationCollection([$resize]);

$stack = $imageClient->createStack('thumbnail', $stackOperationCollection);

var_dump($stack); // print out stack data
```

This does a __PUT__ request that creates a __thumbnail__ stack for our __testorganization__. The body of the message defines the operations to use. As that argument is an array, you can define multiple operations that are applied in the specified order. A successful response returns the resulting stack definition.

See [operations](/documentation/references/operations.html) for the definition of all available operations and their arguments.

## Rendering an Image

Now let's render our stack __thumbnail__ with the previously uploaded __image.jpg__. Open the following URL in the browser to see the rendered image:

`https://testorganization.rokka.io/thumbnail/c03683b067927d77973b458e0baa40aa7b5e5418.jpg`

Notice that the organization name is a __subdomain__ of rokka.io and that the stack is followed by the __hash__ of the source image (not the original filename). If you want to use a file name, e.g. for SEO reasons, you can append a file name to the URL. (Technically, a name after the hash is simply ignored.):

`https://testorganization.rokka.io/thumbnail/c03683b067927d77973b458e0baa40aa7b5e5418/image.jpg`

There is also the dynamic rendering that allows to specify operations in the URL without creating a stack. Dynamic rendering should __NOT__ be used in production systems, since its output  is not cached. You can however use stack rendering with custom options (explained in the [rendering reference](/documentation/references/render.html)), if you need for instance different resizing options. 
