---
title: API rate limiting and throttling 
use: [guides]
description: How does the API rate limiting work with rokka

---

To avoid unexpected load spikes on our servers, we enforce some rate limiting on API calls. Currently this only concerns calls on the [/sourceimages/ route](../references/source-images.html), but may change in the future. It will not affect delivering images to your end users. 

Before rejecting your requests when doing too many of them, the system throttles you with delaying them. You won't recognize much, except that they take longer than usual.

When you do way too many requests within a short amount of time, we will reject the excess requests with a [429 Too Many Requests](https://httpstatuses.com/429) HTTP status response. You may retry the request, but we recommend to wait a little and if the 429 responses persist to wait even longer.

The exact throughput depends on your provisioned capacity and overall system load, so we can't give you a fixed per-second quota. As an illustration: if you send a few hundred images at once, expect them to be throttled and spread out over a number of seconds rather than all finishing immediately. Set your timeouts high enough.

Depending on other factors (high load on the server in general), the system may send a 429 also when you request less than the usual limits. Therefore always be prepared in your code to receive a 429 response.

Our client libraries do support retrying when the API sends a 429. They do that 10 times with a few seconds pause in between. If it still fails then, they will report an error.

## Rate-limit response headers

The cache-invalidation endpoints (stack, source image and alias cache deletion) return rate-limit information in the response headers, so you can do informed backoff instead of blindly retrying:

- `X-RateLimit-Limit`: the maximum number of calls allowed in the current window.
- `X-RateLimit-Remaining`: how many calls you have left.
- `X-RateLimit-Retry-After` (only on a `429`): a unix timestamp after which you can retry.

On a `429`, the body also contains a human-readable `X-RateLimit-Retry-After-readable` field and `"status": "too many requests"`.

