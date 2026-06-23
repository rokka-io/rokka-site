---
title: AI Auto Descriptions (Automatic Alt Text)
slug: auto-descriptions
use: [references]
header_include: references/autodescriptions-head.html
description: rokka uses an AI vision model to automatically generate accessible alt text (image descriptions) for your images in English, German, French and Italian.
---

## What are AI auto descriptions?

Auto descriptions let rokka **automatically generate the alt text for your images using an AI vision model**. Instead of writing an `alt` attribute by hand for every `<img>` tag, you ask rokka to describe the image and store that description as image metadata, ready to use in your HTML.

This solves a common, tedious accessibility problem: every image on the web should have a meaningful `alt` attribute (it is mandatory for [WCAG](https://www.w3.org/WAI/tutorials/images/) accessibility compliance and improves SEO), but writing good alt text manually for thousands of images does not scale. rokka generates these descriptions for you, on upload or on demand, in multiple languages.

Under the hood, rokka uses [OpenAI’s vision LLM](https://platform.openai.com/docs/guides/vision) to look at the image and produce a short, human-readable description suitable for an alt attribute.

## Which languages are supported?

Auto descriptions are currently available in **English, German, French and Italian**. You can generate descriptions in several languages for the same image in one request. If you need a language that is not listed here, [contact us](/contact) and we will look into adding it.

## Availability

This feature is only available to paying customers. If you’d like to test it without being one, [contact us](/contact).

## How does it work?

There are two ways to get an AI-generated description for an image:

1. **On upload** — generate the description automatically the moment an image is added to rokka.
2. **On demand** — add (or regenerate) a description for an image that already exists in rokka.

In both cases the generated text is stored as user metadata on the source image, so you can read it back later and render it into your `alt` attributes.

## Generating an auto description while uploading an image

Add the following JSON snippet to the `meta_static` property when you upload an image.
If there is already a description in that language, it won’t be generated again. Add a `"force": true` attribute if you want to regenerate them.

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

## Adding an auto description to an existing image

You can add auto descriptions to images that are already stored in rokka. Set `"force": true` to regenerate a description that already exists.

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

## Where are the generated descriptions stored?

The generated text is saved as user metadata on the source image. You can retrieve it together with the rest of the image metadata and then output it as the `alt` attribute of your `<img>` tags. See [User metadata](/documentation/references/user-metadata.html) for how to read metadata back from rokka.

## Frequently asked questions

### What is alt text and why do I need it?

Alt text (the `alt` attribute on an `<img>` tag) is a short text description of an image. Screen readers read it aloud for visually impaired users, browsers show it when an image fails to load, and search engines use it to understand image content. Meaningful alt text is required for accessibility (WCAG) and helps SEO.

### Can rokka generate alt text automatically?

Yes. rokka uses an AI vision model to generate alt text descriptions for your images automatically, either when you upload them or on demand for existing images.

### Which languages can rokka generate descriptions in?

English, German, French and Italian. You can request multiple languages at once. Contact rokka if you need another language.

### Will rokka overwrite an existing description?

No. If a description already exists for a given language, rokka keeps it. To regenerate it, pass `"force": true` in the request.

### Is the auto description feature free?

No, it is only available to paying customers. Contact rokka if you want to test it without being one.
