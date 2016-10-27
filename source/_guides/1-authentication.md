---
title: Authentication
use: [guides]
---

## If you are using a library, you can skip this

The library implementations are already taking care of this for you. All you need to supply is your key, secret and organization and you'll be set.

If you want to do it by hand, using curl or implement a new library, this part is for you.

## How to tell Rokka who you are

In the previous guide, you have seen how to register and gotten an API key and an API secret. Time to put them to good use.

All calls to the Rokka API are authenticated, except registration and the operations list. Here it's explained how to do it manually, but you can make your life easy with pre built libraries that will take care of this for you.

Each call to Rokka expects 2 headers, `Api-Version` (You should always use this! But we cover that in the next step) and `Api-Key`.

Simply send the key in the header and you are set.

The secret is currently not used (was used for an old authentication scheme), but will be used again for future implementations. So just hold on to it, but you can ignore it for the time being.

If you implement an access library, pass the secret in with the key, so you have it present for future use and easy upgrade.
