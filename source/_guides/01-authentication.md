---
title: Authentication
use: [guides]
description: How to authenticate with the rokka API
---

## If you are using a Library

All you need to do is specify the API key that you will get with your account information.

## How to tell rokka who you are

All calls to the rokka API are authenticated, except the operations list (see [rendering images](upload-and-render-an-image.html)).

To authenticate, use the `Api-Key` header with the key you where assigned during registration.

```language-bash
curl -H 'Content-Type: application/json' -H 'Api-Version: 1' -H 'Api-Key: myKey' -X POST 'https://api.rokka.io/{action}' -d '...'
```

## Format of API Keys

API Keys generated before December 2021 had the format `[0-9A-Za-z]{32}` (32 chars) eg: `mHXscTNT0rk9ZoMLO4dlFbpGxGe06hXt`

Starting in December 2021, we changed that to a 64 char long string with the same pattern eg. `81468485c73a4201b5f86478434eb0431Lj0Sv7jrPioKLSBuNswRWQRP6OJbjLG`

