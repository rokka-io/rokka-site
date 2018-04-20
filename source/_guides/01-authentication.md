---
title: Authentication
use: [guides]
---

## If you are using a Library

All you need to do is specify the API key that you will get with your account information.

## How to tell rokka who you are

All calls to the rokka API are authenticated, except the operations list (see [rendering images](upload-and-render-an-image.html)).

To authenticate, use the `Api-Key` header with the key you where assigned during registration.

```language-bash
curl -H 'Content-Type: application/json' -H 'Api-Version: 1' -H 'Api-Key: myKey' -X POST 'https://api.rokka.io/{action}' -d '...'
```

