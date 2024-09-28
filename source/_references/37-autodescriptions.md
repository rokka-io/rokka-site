---
title: Auto descriptions
use: [references]
description: rokka can generate descriptions for alt attributes automatically
---

## Intro

Generating mandatory alt attributes for img tags can be quite cumbersome. Rokka can automatically generate them with the help of [OpenAI’s vision LLM](https://platform.openai.com/docs/guides/vision) in different languages. Currently, English, German, French and Italian are supported. If you’d like support for other languages, contact us.

This feature is only available to paying customers. If you'd like to test it without being one, contact us.

## Generating an autodescription during uploading of images

Add the following json snippet to the `meta_static` property.
If there is already a description in that language, it won’t be generated again. You need to add a `"force": true` attribute, if you want to regenerate them.

```language-json
{
    "auto_description": {
        "languages": ["de","en"]
    }
}
```

With curl: 

```language-bash
curl --location 'https://api.rokka.io/sourceimages/myorg' \
--header 'Api-Key: xxxx' \
--header 'Content-Type: application/json' \
--form 'f=@"/path/to/file.jpeg"' \
--form 'meta_static[0]="{\"auto_description\": {\"languages\": [\"de\", \"en\"]}}"'
```

With JavaScript:

```language-javascript
await rokka.sourceimages.create(
  "myorg",
  "file.jpg",
  fs.createReadStream(filePath), 
  { meta_static: {'auto_description': {"languages": ["de", "en"]}}}
)
```

With PHP:

```language-php
$image = $client->uploadSourceImage(
   file_get_contents('/path/to/file.jpeg'), 
   'foo.png',
   'test', 
   ['meta_static' => ['auto_description' => ['languages' => ['de','en']]]]
);
```   

## Adding an autodescription to an existing image

You can add autodescriptions to existing images.

With curl:

```language-bash
curl --location 'https://api.rokka.io/sourceimages/myorg/0d8fe0/autodescription' \
--header 'Api-Key: xyz' \
--header 'Content-Type: application/json' \
--data '{
   "languages": ["de","en","fr"],
   "force": true
}'
```

With JavaScript:

```language-javascript
await rokka.sourceimages.autodescription('myorg', '4f72fb', ['de','fr'], false)
```

With PHP:

```language-php
$newImage = $client->addAutodescription(['de','en'], '4f72fb');
```
