---
title: Authentication
use: [guides]
---

## If you are using a Library

All you need to do is specify the API key and secret that you will get with your account information.

## How to tell Rokka who you are

All calls to the Rokka API are authenticated, except the operations list (see [rendering images](4-rendering-images)).

To authenticate, use the `Api-Key` header with the key you where assigned during registration.

```bash
curl -H 'Content-Type: application/json' -H 'Api-Version: 1' -H 'Api-Key: myKey' -X POST 'https://api.rokka.io/{action}' -d '...'
```

The secret is currently not used. It was used for an old authentication scheme. It will likely be used again for future implementations. So just hold on to it, but you can ignore it for the time being.

If you implement your own Rokka client library, we recommend you require the secret in the configuration, together with the key, so you have it present for future use and easy upgrade.
