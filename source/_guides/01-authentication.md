---
title: Authentication
use: [guides]
description: How to authenticate with the rokka API
---

## Concept

To use the rokka API, you need to authenticate (but not for [rendering images](upload-and-render-an-image.html)).
There are two ways to authenticate, either via an API Key (the one you got when you signed up) or via a JWT Token.
The latter is useful, when you don't want to store the API Key permanently, but you need the API Key to get such a token initially.

What an authenticated request is *allowed* to do is determined by the [roles](../references/users-and-memberships.html#roles)
of the user's membership on the organization — a JWT token inherits the roles of the API Key it was created from. So
"authenticated" and "authorized" are two separate things: a valid key or token can still get a `403` if its roles don't
cover the requested action.

## Using rokka with an API Key

This is the easiest way to access the rokka API. Use the API key we provided you or [generate a new key](../references/users-and-memberships.html#rotate-your-api-key) or a [new user](../references/users-and-memberships.html#create-a-new-user-object-and-automatically-assign-it-to-an-organisation).

The disadvantage of this approach is, that you need to know the API key and it's valid forever and from everywhere
(until you revoke it manually via the API). If you only store the API key somewhere on your backend and it's hidden
from endusers, that shouldn't be a big issue. But you should still only give that API Key the permission it needs.

### Using an API key to authenticate in a rokka Client Library

All you need to do is get the API key and follow the instructions of the library ([PHP](https://github.com/rokka-io/rokka-client-php), [JavaScript](https://github.com/rokka-io/rokka.js))

### Using an API key to authenticate via REST API

To authenticate, put the API key to  the `Api-Key` header, eg:

```language-bash
curl -H 'Content-Type: application/json' \
 -H 'Api-Version: 1' \
 -H 'Api-Key: myKey' \
 -X GET \
 'https://api.rokka.io/{action}'
```

Alternatively, you can send the API key in the standard `Authorization: Bearer` header, which many HTTP clients and SDKs use by default:

```language-bash
curl -H 'Content-Type: application/json' \
 -H 'Api-Version: 1' \
 -H 'Authorization: Bearer myKey' \
 -X GET \
 'https://api.rokka.io/{action}'
```

rokka tells a raw API key apart from a [JWT token](#using-rokka-with-a-jwt-token) by its shape, so both can be sent in the same `Authorization: Bearer` header. If you send both an `Api-Key` header and an `Authorization` header, the `Api-Key` header takes precedence.

### Format of API Keys

API Keys generated before December 2021 had the format `[0-9A-Za-z]{32}` (32 chars) eg: `mHXscTNT0rk9ZoMLO4dlFbpGxGe06hXt`

Starting in December 2021, we changed that to a 64 char long string eg. `81468485c73a4201b5f86478434eb0431Lj0Sv7jrPioKLSBuNswRWQRP6OJbjLG`. It consists of a 32 char lowercase prefix (`[0-9a-z]{32}`, derived from the user id) followed by a 32 char mixed-case secret (`[0-9A-Za-z]{32}`).

## Using rokka with a JWT Token

If you don't want to store the API Key permanently in a place you can't control (for example a user's browser) or
want to give out time limited access or just enable it from certain IPs/networks, a JWT token is the way.

You could also give out such a time limited token only when someone logged in through other means to your backend (like via SSO).
They would never see the API Key, just get access for some time directly to the rokka API from their browser, therefore saving
some round trips to your backend. And if they leave your organisation, you don't have to revoke the API key, just not
let them into your backend and give out new JWT tokens to them.

### Getting a token

To get such a token initially, you have to get one with an API key. The token will have the same rights as the API key
(the same [roles](../references/users-and-memberships.html#roles) on the same organization). It will be authenticated as
the same user as with that API key. A token can't be given more rights than the API key it was created with.

(If you need a token with less rights, [create a new user](../references/users-and-memberships.html#create-a-new-user-object-and-automatically-assign-it-to-an-organisation) with just the roles you need and then generate a token with that new user's API key)

[Try it out](https://api.rokka.io/doc/#/admin/getUserToken)
```language-bash
curl -H 'Content-Type: application/json' \
 -H 'Api-Version: 1' \
 -H 'Api-Key: myKey' \
 'https://api.rokka.io/user/apikeys/token'
```

Would return something like

```language-json
{
   "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjdmOTllMjkxLWM0M2ItNDIzMC1hZTAxLWE3NmFmMjg4ZWM5MCIsImV4cCI6MTY1Mjc4MDE5NSwiZXhwdCI6ODY0MDAsImlwcyI6WyIyMTIuNTAuMTAuMTAiXSwicm4iOnRydWV9.EMU8CAiWQk7rLDm6JJ0ol1muj4bvkrqyqpQbXT3hM_g",
   "payload": {
       "id": "7f99e291-c43b-4230-ae01-a76af288ec90",
       "exp": 1652780195,
       "expt": 86400,
       "ips": [
           "212.50.10.10"
       ],
       "rn": true
   }
}
```

The `token` property is the actual token to be used for authentication later, the payload is the content of the JWT payload, which
tells you something about the properties of the JWT token.

In our [PHP library](https://github.com/rokka-io/rokka-client-php) (from 1.17 on) you can do the following to get one

```language-php
$client = \Rokka\Client\Factory::getUserClient();
// the $apiKey and $options are optional,
$options = ['expires_in' => 3600]; // see below for the options
$token = $client->getNewToken($apiKey, $options);
```

and in our [JavaScript library](https://github.com/rokka-io/rokka.js) (from 3.7 on)

```language-js
import { Rokka } from 'rokka'
const rka = new Rokka()
// the apiKey and options are optional
const options = {expires_in: 3600}; // see below for the options
const response = rka.user.getNewToken(apiKey, options)
```

The `apiKey` parameter is optional, so that you can use another key than the main one. Eg. if you want to
generate a token in the backend from an API Key with less permissions and send it to the user.

### Using a token to authenticate

After you get the token, you send the token prefixed with `Bearer ` in the `Authorization` header.

```language-bash
curl -H 'Content-Type: application/json' \
 -H 'Api-Version: 1' \
 -H 'Authorization: Bearer $TOKEN' \
 'https://api.rokka.io/user/apikeys/current'
```

This is the same header you can use for a [raw API key](#using-an-api-key-to-authenticate-via-rest-api) — rokka detects whether the value is a token or a raw key by its shape, so you don't need to tell it which one you're sending.

In the PHP library, you can set it in the Factory function, or via the `setToken()` method
If the token and the API key are set, the API key is used. You can unset the API key `$client->setCredentials(null)`, if
it was set before to force the usage of a token.

```language-php
$userClient = \Rokka\Client\Factory::getUserClient('orga', null, [\Rokka\Client\Factory::API_TOKEN => $token]);
// or
$userClient->setToken($token)
```

In JavaScript, you need callback functions to read and write the token so that it can be dynamically updated.
[See below](#javascript-library-specifics) for more details about that.
If the API key and the token are set, the token is used, when it has not expired.

In this example, it would store the token in localStorage.

```language-js
const getToken = () => {
   return window.localStorage.getItem('rokka-token')
}
const setToken = (token) => {
   window.localStorage.setItem('rokka-token', token ?? '')
}
import { Rokka } from 'rokka'
export const rka = new Rokka({
   apiTokenGetCallback: getToken,
   apiTokenSetCallback: setToken,
   apiTokenOptions: { expires_in: 3600 * 72 }, //we want it be valid for 3 days
})
```


### Refreshing a token

You can also refresh a token with a token. You don't need an API Key to get a new token with a new expiry time (if the token is allowed to renew/refresh).

### Token options

A token can have different options, which you can adjust  when you generate a token. Some options are restricted when using a token to generate a new token.
They're not if you use an API key.

#### Expires

A token always has an expiry time (the `exp` property in the payload). By default it's set to one day (86400 seconds). With the `expires_in` option,
you can choose any other expiry time.

You can't refresh a token with a longer expiry time than the token used for authentication (the `expt` property in the payload).
If you use an API Key as authentication, you're not limited by that.

The JavaScript library also tries to [auto refresh a token](#auto-renewing-tokens) after some time, if it's still valid.

#### IP Protection

By default, a token is IP protected. It can only be used from the same IP from where it was generated.
It's written in the `ips` property of the payload.

If you don't want IP protected tokens, set the `no_ip_protection` option to true.

You can also define the IPs/networks a token should be allowed from. Use the `ips` option for this with a comma
seperated list of IPs and networks. If you use `request_ip` as one of the values, it will be replaced with the currently
used ip. `request_ip,212.40.50.1/24` would allow the token to be used from the currently used IP and the 212.40.50.1/24
network. You can define up to 10 values and in total up to 10'000 covered addresses (we can adjust those values, if
this is not enough for you).

`no_ip_protection` and `ips` are mutually exclusive — combining `no_ip_protection=true` with a non-empty `ips` list returns a `400 Bad Request`.

PS. We're not sure if this is a good idea to enable that IP protection by default. Just define explicitly with `no_ip_protection` or `ips`, what you want/need and the behavior won't change.

> The token `ips`/`exp` options above live on the individual token. On top of them, the **Api Key itself**
> can carry an `allowed_ips` whitelist and an `expires` date (see
> [Restricting an Api Key](../references/users-and-memberships.html#restricting-an-api-key-ip-whitelist-expiry)).
> Those key-level restrictions are re-checked on every request made with a token minted from that key, so a
> token can never reach an IP the key forbids nor outlive the key's expiry — even if the token's own `ips`/`exp`
> would allow it.

#### Renewable

You can set a token to be renewable. Meaning someone can get a new token with a new expiry time with using the same
token (before it expired). Useful if you don't want to log out people just because the expiry time was reached.

If your token is IP protected, it's renewable by default, otherwise (if `no_ip_protection` was set)  not.
You can set this explicitly with the `renewable` option for either way.

In the payload it's the `rn` property, which tells you if a token is renewable or not.


### PHP library specifics

The PHP library doesn't refresh tokens automatically. But you can check if a token has expired with

```language-php
$isExpired = $userClient->getTokenIsValidFor() < 0; // returns the amount of seconds the token is still valid
```

and then manually refresh it, if it's still valid or ask for the API Key.

### JavaScript library specifics

For using the JavaScript library with JWT tokens, you need to specify where you store the token. One possibility, if it runs
in the browser, is to store it in `localStorage` or `sessionStorage` (depending on your requirements)

You can also define, which options should be used for generating new tokens with the `apiTokenOptions` constructor option (the
example shows the default values)


```language-js
import { Rokka } from 'rokka'
export const rka = new Rokka({
   apiTokenGetCallback: () => window.localStorage.getItem('rokka-token'),
   apiTokenSetCallback: (token) => window.localStorage.setItem('rokka-token', token ?? ''),
   apiTokenOptions: {
       renewable: true
       no_ip_protection: false
       ips: 'request_ip`
       expires_in: 3600 * 24
   }
})
```

and from then on, if the `apiTokenGetCallback` returns a non-falsy value, it uses that for authentication.

#### Auto-renewing tokens

The JavaScript library also does some magic with renewing tokens. If it realises, that a token is expiring soon (default 1 hour)
it does renew it automatically, if it is allowed to (the `rn` property in the property).

You can change that default with the `apiTokenRefreshTime` option in the rokka constructor (in seconds). If you set it
to `0` or less, it will never be refreshed automatically.

You can also check if a registered token has already expired or not like in the example below. The method returns for how many seconds it's still
valid and a negative value, when it's already expired.

```language-js
const isExpired = rka.user.getTokenIsValidFor() < 0
```

### Revoking a JWT Token

You can't revoke a JWT token by itself, but you can [delete/rotate the API key](../references/users-and-memberships.html#rotate-your-api-key) used for generating the token, then the token will also be invalid. But beware that this makes all tokens invalid which are based on this
API key.

### HTTP Status Codes

The rokka API returns a 401 HTTP Status, when you use an invalid token (be it expired or IP protected or just not in the right format). Renewing tokens on the other hand throws a 403, if this doesn't work (because for example you try to extend it for a longer period than the initial token).

The JavaScript library clears the token in the storage in both of those cases. So you can check for this token or a 401 if you want
to show a login screen, when something goes not as expected.

If you try to do API calls with just an invalid API Key, that throws also a 403 and not a 401. This is due to historical
reasons, and maybe important to know if you support API Keys and API JWT Tokens. But we do add the property `invalid_authentication`
in all cases to the response, if the authentication was invalid, see the example below. This property is missing, if you are properly authenticated,
but just not allowed to do that API call (which will also get you a 403 usually)

```language-js
{
   "code": 403,
   "message": "API credentials are not supplied or not a valid format.",
   "invalid_authentication": true
}
```

## Multi-Factor Authentication (MFA) for API Keys

You can protect individual API keys with a second factor (TOTP, the standard time-based one-time codes from
authenticator apps like Google Authenticator, Authy or 1Password). An API key with MFA enabled can't be used
directly anymore — its only purpose is to be exchanged for a time limited [JWT token](#using-rokka-with-a-jwt-token),
together with a valid TOTP code. If such a key leaks, it's useless without the authenticator.

MFA is set per API key, so you can keep a non-MFA key for CI or server-to-server usage on the same user, while
your interactively used keys (e.g. for the rokka dashboard) require a second factor.

### Setting up TOTP

Each user has one TOTP setup, shared by all their MFA enabled keys. Start it with:

```language-bash
curl -H 'Api-Key: myKey' -X POST 'https://api.rokka.io/user/mfa/totp'
```

This returns a `secret` and a `provisioning_uri` (`otpauth://...`), which you can show as a QR code to scan with
an authenticator app. The setup only becomes active once you confirm it with a first code:

```language-bash
curl -H 'Api-Key: myKey' -H 'Content-Type: application/json' \
 -X POST -d '{"totp": "123456"}' \
 'https://api.rokka.io/user/mfa/totp/confirm'
```

`GET /user/mfa/totp` shows the current state (`none`, `pending` or `active`). `DELETE /user/mfa/totp` (with a
valid `totp` code in the body) disables TOTP again and removes the MFA requirement from all keys.

### Requiring MFA for a key

```language-bash
curl -H 'Api-Key: myKey' -H 'Content-Type: application/json' \
 -X PATCH -d '{"requires_mfa": true}' \
 'https://api.rokka.io/user/apikeys/{keyId}'
```

You can also create a new, already protected key by passing `requires_mfa` to `POST /user/apikeys`.
Setting `requires_mfa` to `false` again removes the protection. Keys generated before December 2021 (the old
32 char format) can't be MFA protected — create a new key instead.

Note that enabling MFA on a key also invalidates all JWT tokens that were generated with that key before —
they lack the MFA confirmation.

A user with a read-only role (`read`, `upload` or `sourceimages:read`) can't set any of this up: the `/user/mfa/*`
and `/user/apikeys` endpoints answer `403` for it. The exception is a key flagged as
[trusted](../references/users-and-memberships.html#trusted-api-keys) — a key you declare never to hand to end
users. With such a key, a read-only user can manage its MFA setup and its keys as usual.

### Using an MFA protected key

Exchange the key for a JWT token with a **POST** to the token endpoint, passing the current code from your
authenticator app as a `totp` property in the JSON body. The code **must** be in the body — it can't be a query
parameter, so it never ends up in a URL, access log or browser history (an MFA key sent as a `GET`, or with the
`totp` in the query string, is refused):

```language-bash
curl -H 'Api-Key: myMfaKey' -H 'Content-Type: application/json' \
 -X POST -d '{"totp": "123456"}' \
 'https://api.rokka.io/user/apikeys/token?expires_in=86400'
```

All the usual [token options](#token-options) apply (as query parameters, like `expires_in` above). The returned
token has an `mfa: true` claim in the payload and works like any other token, including
[renewing](#refreshing-a-token) — a renewal doesn't need a new code.

Using the raw key any other way answers `401` with `"error": "mfa_required"` — that includes any other endpoint,
a `GET` on the token endpoint, or putting the `totp` in the query string instead of the body. Once you're on
`POST /user/apikeys/token` with the code in the body, a wrong, already used (each code works only once) or missing
code answers `401` with `"error": "totp_invalid"`. Too many wrong attempts answer `429` with
`"error": "totp_rate_limited"`.

### Getting an MFA key before setting up TOTP

A key can be flagged with `requires_mfa` before its user has set up TOTP — for example when rokka support
creates a protected key for you. Such a key can only reach the TOTP setup endpoints described above (everything
else answers `401` with `"error": "mfa_enrollment_required"`): whoever receives the key sets up TOTP themselves
on first use, and from then on the key behaves like a normal MFA protected key.

### If you lose your authenticator

There are no recovery codes. If you still have a non-MFA key on the user, remove the `requires_mfa` flag from
your keys with it (or simply create a new key). Otherwise, contact rokka support and we can reset the MFA setup
for your user.

