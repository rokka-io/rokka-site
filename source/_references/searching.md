---
title: Searching images
use: [references]
---

## Intro

It's possible to list images and their metadata in your organization and also filter by their metadata.
The filter options are pretty basic right now, but may be improved in the future.


## Listing source images

Listing source images allows searching and sorting of images.
The images are by default sorted by their created date in a descending order (latest first).

Be aware: newly uploaded images or changed metadata may take a few seconds until
they appear in the results.

```bash
curl -H 'Content-Type: application/json' -X GET 'https://api.rokka.io/sourceimages/myorganization'
```

Example JSON response:
```js
{
  "total": 126,
  "links": {
    "next": {
      "href": "/sourceimages/myorganization?limit=100&offset=100"
    }
  },
  "items": [
    {
      "binary_hash": "binaryimage-sha1hash",
      "created": "2017-01-18T14:10:40+0000",
      "dynamic_metadata": {},
      "format": "jpg",
      "hash": "sha1hash",
      "height": 42,
      "link": "/sourceimages/myorganization/sha1hash",
      "name": "somename.jpg",
      "organization": "myorganization",
      "size": 84,
      "width": 42
    },
    // ... more images
}
```

Where:
 - `total` is the total amount of items matched by the search;
 - `links` contains helpful links for pagination purposes (like `prev` and `next` for pagination)

## Paging the results

You can limit the number of returned items of the list by using  the `limit` and the `offset` parameters,
those can be used to page through results, too.

| Attribute | Description | Default |
| -------------- | ------------- | ------------- |
| limit | Optional limit | 100 |
| offset | Optional offset | 0 |

Where `limit` must be an integer number between `0` and `2000`.
Please notice that using `limit=0` will return an empty list of items, but can be used to validate the
provided search parameters or for just get the total result count.

```bash
curl -X GET 'https://api.rokka.io/sourceimages/myorganization?limit=20&offset=100'
```

Example JSON response:
```js
{
  "total": 126,
  "links": {
    "next": {
      "href": "/sourceimages/myorganization?limit=20&offset=120"
    },
    "prev": {
      "href": "/sourceimages/myorganization?limit=20&offset=80"
    }
  },
  "items": [
    // ... Image objects
  ]
}
```

### Deep Paging Beyond 10,000 Hits

If you want to page beyond 10'000 hits, you need to use a so-called _cursor_.
With a cursor you can only page forward by one "page" and not randomly access a page.

You can use this cursor value as input for the _offset_ parameter to page to the next page.
A link to the next page is provided in every response.

If you don't submit an _offset_ number and your result has more than 10'000 hits, it will automatically
return a link for the next page with the cursor value in it.

A typical response for an organization with more than 10'000 hits looks like the following:

Example JSON response:
```js
{
   "total" : 74088,
   "links" : {
      "next" : {
         "href" : "/sourceimages/myorganization?limit=100&offset=VX3_3FBUQW9KNDlQYXMyTmtDUHhOd2NtOWtOR0ptTTJRMllURXlZekl5"
      }
   },
   "cursor" : "VX3_3FBUQW9KNDlQYXMyTmtDUHhOd2NtOWtOR0ptTTJRMllURXlZekl5",
   "items": [
    // ... Image objects
  ]
}
```

## Filtering for particular images

You can filter the list by the fields returned by a sourceimage (and its user defined metadata).
Just append the field-name and value to your list request.

The following returns all images with height = 1200.

```bash
curl -H 'Content-Type: application/json' -X GET 'https://api.rokka.io/sourceimages/myorganization?height=1200'
```

The following fields are available for each image for filtering:
 - `hash` (string): the image hash;
 - `binaryhash` (string): the image binary-hash;
 - `size` (integer): the image filesize, in bytes;
 - `format` (string): the image format, as the file extension ("png", "jpg");
 - `width` (integer): the image width, in pixels;
 - `height` (integer): the image height, in pixels;
 - `created` (date): the image creation date;

You can also filter by fields defined in the [User Metadata](/documentation/references/usermetadata.html),
those fields are accessible by using the `user:` and the correct [field type](user-metadata.html) prefixes.

The following example will return all images where the field `my_integer_field` has a value of `3`:

```bash
curl -H 'Content-Type: application/json' -X GET 'https://api.rokka.io/sourceimages/myorganization?user:int:my_integer_field=3'
```

## Prefix filtering

Returning all images which start with a certain value in a field is as easy as appending a star:

```bash
curl -H 'Content-Type: application/json' -X GET 'https://api.rokka.io/sourceimages/myorganization?name=plan*'
```

Returns all images having their name starting with "*plan*", such as "*plan*t", "*plan*e".

## Range filtering

If you want to filter for certain ranges or "greater than, less than", you can use the
[Lucene range query syntax](http://lucene.apache.org/core/6_4_1/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#Range_Searches).

|                                                              | parameter            |
|--------------------------------------------------------------|----------------------|
| Images with a size bigger than 30000:                        | `size=[30000,}`      |
| Images with a size equal or bigger than 30000:               | `size={30000,}`      |
| Images with a size bigger than 30000 and smaller than 40000: | `size=[30000,40000]` |
| Images with a _somedate_ in 2017                             | `user:date:somedate={'2017-01-01T00:00:00Z',}` |

## AND filtering

You can filter in different fields at once, eg. `size=[30000,}&name=foo*` returns all images greater than
`30000` and with a name starting with _foo_.

## OR / NOT filtering

OR and NOT filters are currently not possible.
If you have a need for that, get in contact with us and we'll see what we can do.

## Different sorting

You can change the sort field by using the `sort` parameter, it accepts a field name and
(optionally) the sorting direction (as "desc" or "asc").

The following will return the items sorted by the image size, ascending:

```bash
curl -H 'Content-Type: application/json' -X GET 'https://api.rokka.io/sourceimages/myorganization?sort=size'
```

Default sort order is descending; if you want to change it, add `desc` or `asc` to
your sort field, eg. the biggest images first:

```bash
curl -H 'Content-Type: application/json' -X GET 'https://api.rokka.io/sourceimages/myorganization?sort=size desc'
```

Sorting by multiple fields is possible, just add multiple sorting criteria separated by comma.
The following example will sort images first by `create` descending and later by `size` ascending: 

```bash
curl -H 'Content-Type: application/json' -X GET 'https://api.rokka.io/sourceimages/myorganization?sort=created desc,size asc'
```

User-Metadata fields can be used for sorting by using the prefix naming convention as for the
filtering: both the `user:` and the field type prefix must be specified.

The following will sort by the user defined field `my_integer_field` in a descending order: 

```bash
curl -H 'Content-Type: application/json' -X GET 'https://api.rokka.io/sourceimages/myorganization?sort=user:int:my_integer_field desc'
```
