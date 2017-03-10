---
title: User metadata
use: [references]
---

## Intro

User metadata is a metadata added to a source image by the API user that does not change the image
identifying hash.

## User metadata types

User metadata can be a string, integer, double, date, latitude/longitude or an array and also be
changed after an image was uploaded.

The default type is _String_, if you want to store it as any other type, you have to specify it with
a prefix.
Refer to the following table for a prefix/type documentation:

| Type     | Prefix  |
-----------|----------
| String   | str:    |
| Int      | int:    |
| Double   | double: |
| Date     | date:   |
| Location | latlon: |
| Array    | array:  |

Some limitations apply to each type, in particular:
 - the _Date_ type accepts values with the following format:`YYYY-MM-DDThh:mm:ssZ`;
 - the _Location_ type needs to be set as a `latitude, longitude` pair, eg: "47.38,8.52".
 - the elements of an _Array_ type will always be stored as string, you can't specify a type there.

## Add user metadata to a source image

User metadata field names have a maximum length of 54 characters, and can be composed only of the following
characters:

 - `a-z` (lower-case letters);
 - `0-9` (numbers);
 - `_` (underscore).

The most flexible way to add/replace/delete fields is with a PATCH request and having the field data
JSON-encoded in the body.
This also allows to update more than one field at once.

```language-bash
curl -H 'Content-Type: application/json' -X PATCH 'https://api.rokka.io/sourceimages/myorganization/0dcabb778d58d07ccd48b5ff291de05ba4374fb9/meta/user' -d '{
    "some_field": "some value",
    "str:some_string_field": "some value again",
    "int:some_umber": 0,
    "date:some_date": "2017-01-29T12:34:56Z",
    "array:some_array": ["Foo","Bar","Baz"],
    "delete_this": null
    }'
```

If you do a PUT instead of a PATCH request, then all existing fields will be deleted first.

If you want to update/add just one value, you can also do this by making a PUT request to
`https://api.rokka.io/sourceimages/{organization}/{hash}/meta/user/{name}` and include the 
JSON encoded value in the body:

```language-bash
curl -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/sourceimages/myorganization/0dcabb778d58d07ccd48b5ff291de05ba4374fb9/meta/user/somefield' -d '"somevalue"'
```

## Delete user metadata from a source image

Besides just setting a value of a field to null as shown above, you can also delete user
metadata using a DELETE API call.

For a single field:

```language-bash
curl -H 'Content-Type: application/json' -X DELETE 'https://api.rokka.io/sourceimages/myorganization/0dcabb778d58d07ccd48b5ff291de05ba4374fb9/meta/user/somefield'
```

Deleting all user metadata of an image:

```language-bash
curl -H 'Content-Type: application/json' -X DELETE 'https://api.rokka.io/sourceimages/myorganization/0dcabb778d58d07ccd48b5ff291de05ba4374fb9/meta/user'
```
