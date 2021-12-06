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

Starting in December 2021, we changed that to `[0-9a-z-]{36}::[0-9A-Za-z]{32}` (70 chars long in total) eg. `43d1dc68-9976-4d75-8378-6468b30863d4::fPRgvS4qgO2DmYwPD36P1Dh4qF2M5aOH`

