---
title: API rate limiting and throttling 
use: [guides]
description: How does the API rate limiting work with rokka

---

To avoid unexpected load spikes on our servers, we enforce some rate limiting on API calls. Currently this only concerns calls on the [/sourceimages/ route](../references/source-images.html), but may change in the future. It will not affect delivering images to your end users. 

Before rejecting your requests when doing too many of them, the system throttles you with delaying them. You won't recognize much, except that they take longer than usual.

When you do way too many requests within a short amount of time, we will reject the excess requests with a [429 Too Many Requests](https://httpstatuses.com/429) HTTP status response. You may retry the request, but we recommend to wait a little and if the 429 responses persist to wait even longer.

The exact limits are subject to change, but it's at least 10-20 requests per second with an excess amount of a few hundred. 
This for example means that with a limit of 20 req/second and you send 500 images at once, the last ones will only be finished after 25 seconds. Set your timeouts high enough.

Depending on other factors (high load on the server in general), the system may send a 429 also when you request less than the usual limits. Therefore always be prepared in your code to receive a 429 response.

Our client libraries do support retrying when the API sends a 429. They do that 10 times with a few seconds pause in between. If it still fails then, they will report an error.

