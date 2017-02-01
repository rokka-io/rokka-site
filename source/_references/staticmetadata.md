---
title: Static metadata
use: [references]
---

## Intro

Static metadata is metadata added to a source image that doesn't change the image identifying hash.
Metadata can be a string, number, date or an array.

Rokka doesn't do anything with this metadata yet, except for returning it in its responses.
But we plan to add the possibility to search for images with this metadata.

## Add static metadata to a source image

To add static metadata to a source image, you need to provide the organization, the identifying hash of the image, the name of the dynamic metadata and the values to add.

The most flexible way to add/replace/delete fields is with a PATCH request and having the field data JSON-encoded in the body.
This also allows to update more than one field at once.

```bash
curl -H 'Content-Type: application/json' -X PATCH 'https://api.rokka.io/sourceimages/testorganization/0dcabb778d58d07ccd48b5ff291de05ba4374fb9/meta/static' -d '{
    "somefield": "somevalue",
    "somethingElse": "anothervalue",
    "deleteThis": null
    }'
```


```php
$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey', 'apiSecret');

$hash = '0dcabb778d58d07ccd48b5ff291de05ba4374fb9';

$client->addStaticMetadata([ "somefield" => "somevalue",
                             "somethingElse" => "anothervalue",
                             "deleteThis" => null
                             ], $hash);

```
If you do a PUT (or setStaticMetadata in PHP) instead of a PATCH request, then all existing fields will be deleted first.

If you want to update/add just one value, you can also do this by making a PUT request to `https://api.rokka.io/sourceimages/{organization}/{hash}/meta/static/{name}`
and include the JSON encoded value in the body

```bash
curl -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/sourceimages/testorganization/0dcabb778d58d07ccd48b5ff291de05ba4374fb9/meta/static/somefield' -d '"somevalue"'
```

```php
$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey', 'apiSecret');

$hash = '0dcabb778d58d07ccd48b5ff291de05ba4374fb9';

$client->setStaticMetadataField("somefield", "somevalue", $hash);

```


## Delete static metadata from a source image

Besides just setting a value of a field to null as shown above, you can also delete static metadata with special calls.

For a single field:

```bash
curl -H 'Content-Type: application/json' -X DELETE 'https://api.rokka.io/sourceimages/testorganization/0dcabb778d58d07ccd48b5ff291de05ba4374fb9/meta/static/somefield'
```

```php
$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey', 'apiSecret');

$hash = '0dcabb778d58d07ccd48b5ff291de05ba4374fb9';

$client->$client->deleteStaticMetadataField("somefield", $hash);

```

Deleting just all metadata of an image:

```bash
curl -H 'Content-Type: application/json' -X DELETE 'https://api.rokka.io/sourceimages/testorganization/0dcabb778d58d07ccd48b5ff291de05ba4374fb9/meta/static'
```

```php
$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey', 'apiSecret');

$hash = '0dcabb778d58d07ccd48b5ff291de05ba4374fb9';

$client->$client->deleteStaticMetadata($hash);

```