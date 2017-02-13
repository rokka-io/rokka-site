---
title: User metadata
use: [references]
---

## Intro

User metadata is metadata added to a source image by the API-user that doesn't change the image identifying hash.

## User metadata types

User metadata can be a string, integer, double, date, latitude/longitude or an array and also be changed after a image was uploaded.

Default is string, if you want to store it as any other type, you have to specify it with a prefix

| Type     | Prefix  |
-----------|----------
| Int      | int:    |
| Double   | double: |
| Date     | date:   |
| Location | latlon: |
| Array    | array:  |


Date needs to be in the _YYYY-MM-DDThh:mm:ssZ_ format. Location needs to be a latitude and longitude in the following form, eg: "47.38,8.52".
The elements of an array will always be stored as string, you can't specify a type there.

## Add user metadata to a source image

To add user metadata to a source image, you need to provide the organization, the identifying hash of the image, the name of the dynamic metadata and the values to add.

The most flexible way to add/replace/delete fields is with a PATCH request and having the field data JSON-encoded in the body.
This also allows to update more than one field at once.

```bash
curl -H 'Content-Type: application/json' -X PATCH 'https://api.rokka.io/sourceimages/testorganization/0dcabb778d58d07ccd48b5ff291de05ba4374fb9/meta/user' -d '{
    "somefield": "somevalue",
    "int:someNumber": 0,
    "date:someDate": "2017-01-29T12:34:56Z",
    "array:someArray": ["Foo","Bar","Baz"],
    "deleteThis": null
    }'
```


```php
$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey', 'apiSecret');

$hash = '0dcabb778d58d07ccd48b5ff291de05ba4374fb9';

$client->addUserMetadata([ "somefield" => "somevalue",
                             "somethingElse" => "anothervalue",
                             "deleteThis" => null
                             ], $hash);

```
If you do a PUT (or setUserMetadata in PHP) instead of a PATCH request, then all existing fields will be deleted first.

If you want to update/add just one value, you can also do this by making a PUT request to `https://api.rokka.io/sourceimages/{organization}/{hash}/meta/user/{name}`
and include the JSON encoded value in the body

```bash
curl -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/sourceimages/testorganization/0dcabb778d58d07ccd48b5ff291de05ba4374fb9/meta/user/somefield' -d '"somevalue"'
```

```php
$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey', 'apiSecret');

$hash = '0dcabb778d58d07ccd48b5ff291de05ba4374fb9';

$client->setUserMetadataField("somefield", "somevalue", $hash);

```


## Delete user metadata from a source image

Besides just setting a value of a field to null as shown above, you can also delete user metadata with special calls.

For a single field:

```bash
curl -H 'Content-Type: application/json' -X DELETE 'https://api.rokka.io/sourceimages/testorganization/0dcabb778d58d07ccd48b5ff291de05ba4374fb9/meta/static/somefield'
```

```php
$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey', 'apiSecret');

$hash = '0dcabb778d58d07ccd48b5ff291de05ba4374fb9';

$client->$client->deleteUserMetadataField("somefield", $hash);

```

Deleting just all metadata of an image:

```bash
curl -H 'Content-Type: application/json' -X DELETE 'https://api.rokka.io/sourceimages/testorganization/0dcabb778d58d07ccd48b5ff291de05ba4374fb9/meta/user'
```

```php
$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey', 'apiSecret');

$hash = '0dcabb778d58d07ccd48b5ff291de05ba4374fb9';

$client->$client->deleteUserMetadata($hash);

```

# 