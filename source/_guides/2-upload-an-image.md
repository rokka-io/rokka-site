---
title: Upload an image
use: [guides]
---


## Basic example

To upload an image you first have to create a user and an organization, you can look in the references section for more details about that. Now let's upload an image!

```bash
curl -X POST -F filedata=@image.jpg 'https://api.rokka.io/sourceimages/testorganization'
```
```php
$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey', 'apiSecret');

$client->uploadSourceImage(file_get_contents('image.jpg'), 'image.jpg');
```

The previous cURL command does a __POST__ request on api.rokka.io, with an image under __./image.jpg__ for an organization called __testorganization__.
The @ sign signalises that cURL should read the binary data of the specified file. If the upload was succesful it returns the metadata as a
source image, an output similair to this: 

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

Now that our image is uploaded we can create a stack to render our image with custom operations.
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
$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey', 'apiSecret');

$resize = new \Rokka\Client\Core\StackOperation('resize', ['width' => 200, 'height' => 200]);

$stackOperationCollection = new \Rokka\Client\Core\StackOperationCollection([$resize]);

$stack = $client->createStack('thumbnail', $stackOperationCollection);

var_dump($stack); // print out stack data
```

This does a __PUT__ request that creates a __thumbnail__ stack for our __testorganization__. Also see the content as JSON is an array, which means we 
can define multiple operations that are applied in the given order. If you want to find out what operations are available we can simply call
__GET__ on `https://api.rokka.io/operations`. A successful response returns the stack itself.

Now let's render our stack __thumbnail__ with the previously uploaded __image.jpg__. Open following url in the browser to see the rendered image:

`https://testorganization.rokka.io/thumbnail/c03683b067927d77973b458e0baa40aa7b5e5418.jpg`

Notice that the organization name is a __subdomain__ of rokka.io and that the stack is followed by the __hash__ of the source image (not the original 
filename).
