---
title: Authentication
use: [guides]
description: How to authenticate with the rokka API
---

## Concept

The use the rokka API, you need to authenticate (but not for [rendering images](upload-and-render-an-image.html)). 
There are two ways to authenticate, either via an API Key (the one you got when you signed up) or via a JWT Token. 
The later is useful, when you don't want to store the API Key permanently, but you need the API Key to get such a token initially.

## Using rokka with an API Key

This is the easiest way to access the rokka API. Use the API key we provided you or [generate a new key](..references/users-and-memberships.html#rotate-your-api-key) or a [new user](../references/users-and-memberships.html#create-a-new-user-object-and-automatically-assign-it-to-an-organisation).

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

### Format of API Keys

API Keys generated before December 2021 had the format `[0-9A-Za-z]{32}` (32 chars) eg: `mHXscTNT0rk9ZoMLO4dlFbpGxGe06hXt`

Starting in December 2021, we changed that to a 64 char long string with the same pattern eg. `81468485c73a4201b5f86478434eb0431Lj0Sv7jrPioKLSBuNswRWQRP6OJbjLG`

## Using rokka with a JWT Token

If you don't want to store the API Key permanently in a place you can't control (for example a user's browser) or 
want to give out time limited access or just enable it from certain IPs/networks, a JWT token is the way.

You could also give out such a time limited token only when someone logged in through other means to your backend (like via SSO). 
They would never see the API Key, just get access for some time directly to the rokka API from their browser, therefore saving 
some roundtrips to your backend. And if they leave your organisation, you don't have to revoke the API key, just not
let them in to your backend and give out new JWT tokens to them.

### Getting a token

To get such a token initially, you have to get one with an API key. The token will have the same rights as the API key. 
It will be authenticated as the same user as with that API key.

(If you need a user with less rights, you need to [create a new one](references/users-and-memberships.html#create-a-new-user-object-and-automatically-assign-it-to-an-organisation) and then generate a token with the API key from that new user)

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

In our [PHP library](https://github.com/rokka-io/rokka.js)(https://github.com/rokka-io/rokka-client-php) (from 1.17 on) you can do the following to get one

```language-php
$client = \Rokka\Client\Factory::getUserClient();
// the $apiKey and $options are optional, 
$options = ['expires_in' => 3600]; // see below for the options
$token = $client->getNewToken($apiKey, $options); 
```

and in our [JavaScript library](https://github.com/rokka-io/rokka.js) (from 3.7 on)

```language-js
var rka = new rokka()
// the apiKey and options are optional 
var options = {'expires_in' => 3600}; // see below for the options
const response = rka.user.getNewToken(apiKey, options)
```

The `apiKey` parameter is optional, so that you can use another key than the main one. Eg. if you want to 
generate a token in the backend from an API Key with less permissions and send it to the user.

### Using a token to authenticate

After you got the token, you send the token prefixed with `Bearer ` in the `Authorization` header.

```language-bash
curl -H 'Content-Type: application/json' \ 
 -H 'Api-Version: 1' \ 
 -H 'Authorization: Bearer $TOKEN' \ 
 'https://api.rokka.io/user/apikeys/current'
```

In the PHP library, you can set it in the Factory function, or via the `setToken()` method
If the token and the API key are set, the API key is used. You can unset the API key `$client->setCredentials(null)`, if
it was set before to force the usage of a token.

```language-php
$userClient = Factory::getUserClient('orga', null,  [Factory::API_TOKEN => $token]);
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
export const rka = rokka({
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

PS. We're not sure, if this is a good idea to enable that IP protection by default. Just define explicitly with `no_ip_protection` or `ips`, what you want/need and the behavior won't change.

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
export const rka = rokka({
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

The JavaScript library also does some magic with renewing tokens. If it realizes, that a token is expiring soon (default 1 hour)
it does renew it automatically, if it is allowed to (the `rn` property in the property). 

You can change that default with the `apiTokenRefreshTime` option in the rokka constructor (in seconds). If you set it 
to `0` or less, it will never be refreshed automatically.

You can also check if a registered token already expired or not like in the example below. The method returns for how many seconds it's still
valid and a negative value, when it's already expired.

```language-js
const isExpired = rka.user.getTokenIsValidFor() < 0 
```

### Revoking a JWT Token

You can't revoke a JWT token by itself, but you can [delete/rotate the API key](..references/users-and-memberships.html#rotate-your-api-key) used for generating the token, then the token will also be invalid. But beware that this makes all tokens invalid which are based on this
API key.

