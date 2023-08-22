---
title: Source Images Aliases
use: [references]
description: rokka can manage an alias for your source images, so you can change the source image without changing the hash.
---

## Intro

While we highly recommend to stick with the hashes provided by rokka for your links, there may be cases where you want to 
change the source image without changing the link. For example, if you have an image used in a lots of places and you don't have 
good control over it, eg. in mail footers or logos used by external partners.

For this, rokka has the concept of aliases. An alias is basically a name for a source image. You can then use this alias
in your render URLs instead of the hash. And then you can change the source image behind the alias without changing the
render URLs.

Be aware that since rokka sends long cache time headers, it may not update on the client side for a long time.

We also encourage you not to use this feature for all of your images, but only for those where you really need it.
While you can change the source image behind an alias, you only can delete the CDN hash of an alias 10 times per hour. 
So if you have a lot of aliases and need to change them, you may run into problems with that limit.

## Creating an alias

To create an alias, you need to know the hash of the source image you want to use for the alias. Then you can create
the alias with the [sourceimages alias](https://api.rokka.io/doc/#/sourceimages%20alias) endpoint.

```language-bash
curl -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/sourceimages/myorganization/alias/${aliasname}' -d '
    {
        "hash": "abcdef1234567890abcdef1234567890abcdef12",
    }
'
```

### Overwriting an existing alias

If you want to overwrite an existing alias, you can do that by adding the `overwrite` query parameter to the request
and set it to `true`. Otherwise you get an error if the alias already exists.

```language-bash
curl -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/sourceimages/myorganization/alias/${aliasname}?overwrite=true' -d '
    {
        "hash": "abcdef1234567890abcdef1234567890abcdef12",
    }
```

## Rendering an alias

To render an alias, you use the alias name instead of the hash in the render URL and prefix it with `-_` and postfix it with `_-`. 
For example, if you have an alias called `myalias` and you want to render it as a `jpg` with a `resize` stack, the URL would look 
like this:

```
https://myorganization.rokka.io/resize/-_myalias_-.jpg
```

## Invalidating an alias at the CDN level

If you want to invalidate an alias at the CDN level, you need to call the [delete cache endpoint](https://api.rokka.io/doc/#/sourceimages%20alias/deleteSourceImageAliasCache) of the alias.

```language-bash
curl -X DELETE 'https://api.rokka.io/sourceimages/myorganization/alias/${aliasname}/cache'
```

Currently, you can only call this endpoint 10 times per hour. If you need more, please contact us.


## Deleting an alias

To delete an alias, you can use the [delete alias endpoint](https://api.rokka.io/doc/#/sourceimages%20alias/deleteSourceImageAlias) of the alias.

```language-bash
curl -X DELETE 'https://api.rokka.io/sourceimages/myorganization/alias/${aliasname}'
```

Be aware that you still need to invalidate the CDN cache for the alias, otherwise it will maybe still be available for some time.