---
title: Searching images
use: [references]
---

## Intro

It's possible to list images and their metadata in your organization and also filter by their metadata. The filter options are pretty basic right now, but may be improved in the future.


## Listing source images

To list images for an organization, you can use this call. By default that returns the latest uploaded images.

Be aware, that it can take a few seconds, until newly uploaded images show up in the list results (or their newly changed metadata)


```bash
curl -H 'Content-Type: application/json' -X GET 'https://api.rokka.io/sourceimages/testorganization'
```
```php
$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey', 'apiSecret');

$sourceImages = $client->listSourceImages();

var_dump($sourceImages);
```

The response will contain an array of objects that look like a single image.

## Paging the results

You can limit the outputs of the list by using limit and offset parameters to page through them.

| Attribute | Description | Default |
| -------------- | ------------- | ------------- |
| limit | Optional limit | 100 |
| offset | Optional offset | 0 |

```bash
curl -X GET 'https://api.rokka.io/sourceimages/testorganization?offset=100limit=20'
```
```php
$client = \Rokka\Client\Factory::getImageClient('testorganization', 'apiKey', 'apiSecret');

$sourceImages = $client->listSourceImages(20, 100);

var_dump($sourceImages);
```

### Deep Paging Beyond 10,000 Hits

If you want to page beyond 10'000 hits, you need to use a so-called _cursor_. With a cursor you can only page forward by one "page" and not randomly access a page.
You can use this cursor value as input for the _offset_ parameter to page to the next page. A full correct link is also provided in the resulting JSON.
If you don't submit an _offset_ number and your result has more than 10'000 hits, it will automatically return a link for the next page with the cursor value in it.
But you can still use offset numbers (instead of cursor) for paging up to 10'000 hits.

A typical resultset with more than 10'000 hits may look like the following

```bash
curl -H 'Content-Type: application/json' -X GET 'https://api.rokka.io/sourceimages/testorganization?limit=1'
```
```json
{
   "items" : [
      {
         "hash" : "abf3d6a12c5532612b7109d54abde391505b3669",
         "binary_hash" : "106ea5d2d1a73f586455effa371054ab15792a40",
         "width" : 699,
         "link" : "/sourceimages/testorganization/abf3d6a12c5532612b7109d54abde391505b3669",
         "height" : 1200,
         "size" : 826921,
         "organization" : "testorganization",
         "created" : "2017-01-18T08:31:25+0000",
         "format" : "png",
         "name" : "foobar.png"
      }
   ],
   "total" : 239208,
   "links" : {
      "next" : {
         "href" : "/sourceimages/testorganization?limit=1&offset=VX3_3FBUQW9KNDlQYXMyTmtDUHhOd2NtOWtOR0ptTTJRMllURXlZekl5TXpNM01USmlOekV3T1dRMU5HRmlaR1V6T1RFMU1EVmlNelkyT1cxcFozSnZjdz09AQ"
      }
   },
   "cursor" : "VX3_3FBUQW9KNDlQYXMyTmtDUHhOd2NtOWtOR0ptTTJRMllURXlZekl5TXpNM01USmlOekV3T1dRMU5HRmlaR1V6T1RFMU1EVmlNelkyT1cxcFozSnZjdz09AQ"
}
```

## Filtering for particular images

You can filter the list by the fields returned by a sourceimage (and its user defined metadata). Just append the fieldname and value to your list request. The following returns all images with height = 1200.


```bash
curl -H 'Content-Type: application/json' -X GET 'https://api.rokka.io/sourceimages/testorganization?height=1200'
```

You can also filter for user defined metadata, if you prefix the fieldname with `user:`. Don't forgot to include the type prefix ([described here](user-metadata.html)). Example:

```bash
curl -H 'Content-Type: application/json' -X GET 'https://api.rokka.io/sourceimages/testorganization?user:int:foo=3'
```

## Prefix filtering

Returning all images which start with a certain value in a field is as easy as appending a star:

```bash
curl -H 'Content-Type: application/json' -X GET 'https://api.rokka.io/sourceimages/testorganization?name=foo*'
```

Returns all images starting with _foo_

## Range filtering

If you want to filter for certain ranges or "greater than, less than", you can use the [Lucene range syntax](https://lucene.apache.org/core/2_9_4/queryparsersyntax.html#Range%20Searches).

|                                                              | parameter            |
|--------------------------------------------------------------|----------------------|
| Images with a size bigger than 30000:                        | `size=[30000,}`      |
| Images with a size equal or bigger than 30000:               | `size={30000,}`      |
| Images with a size bigger than 30000 and smaller than 40000: | `size=[30000,40000]` |
| Images with a _somedate_ in 2017                             | `user:date:somedate={'2017-01-01T00:00:00Z',}` |

## AND filtering

You can filter in different fields at once, eg. `size=[30000,}&name=foo*` returns all images greater than 30000 and name starting with _foo_.

## OR / NOT filtering

OR and NOT filters are currently not possible. If you have a need for that, get in contact with us and we'll see what we can do.

## Different sorting

You can change the sort field with the `sort` parameter. You can sort by almost any field, even user defined metadata (prefixed by `user:`). If you want eg. by size, do the following:

```bash
curl -H 'Content-Type: application/json' -X GET 'https://api.rokka.io/sourceimages/testorganization?sort=size'
```

Default sort order is ascending, if you want to change that add `desc` to your sort field, eg. the biggest images first:

```bash
curl -H 'Content-Type: application/json' -X GET 'https://api.rokka.io/sourceimages/testorganization?sort=size desc'
```
