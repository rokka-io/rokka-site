---
title: Users and Memberships
use: [references]
description: All about rokka users and memberships and how to handle them

---

## Intro

To access the rokka API, you need a **user** and a **membership** of that user to the **organization** you want to access.
This is automatically done, when you create a new account in the [signup screen](https://rokka.io/dashboard/#/signup) or
with the corresponding API call.

### How users, API keys, memberships and organizations fit together

rokka has four related concepts. It's worth getting the mental model right once, because it explains why the same
API key can be allowed to do one thing and forbidden from doing another:

- **User** — *who you are.* Identified by a UUID and an email. This is the account that owns your API keys.
- **API key** — *how you authenticate.* A key belongs to a user (up to 5 per user) and, when used, simply identifies
  that user. A key on its own carries **no permissions** — it's just proof of who you are.
- **Organization** — *what you're accessing.* Images, stacks and settings are grouped per organization, and the
  organization name is part of the API and rendering URL (e.g. `api.rokka.io/organizations/awesomecompany/…`).
- **Membership** — *what you're allowed to do.* A membership is the link between one user and one organization, and it
  carries the [roles](#roles) (permissions). A user can be a member of many organizations with different roles in each.

```text
   User  ──owns──▶  API key(s)          (authentication: who am I)
    │
    └──has membership(s)──▶  Organization + roles   (authorization: what may I do here)
```

The key point: **permissions live on the membership, not on the API key.** So the exact same key gives you *admin*
rights on one organization and maybe only *read* on another (or no access at all) — it depends on the membership of
its user for the organization in the URL you're calling. That's also why authenticating successfully and being allowed
to do something are two different things (see the [authentication guide](../guides/authentication.html#concept)).
To see all the organizations your user belongs to, use [List your own memberships](#list-your-own-memberships).

You can have up to 5 different API keys per user. Useful if you want to change a key via key rotation, or you just want
to use different ones in different places. See below for details.

Each user object also has a unique id; use it to add the user to a different organization with the membership calls
explained below.

It's a good idea to create a user for your application with only write access (and not admin rights) when you start using the service in earnest.

You can easily add new users with different membership rights in the [dashboard](https://rokka.io/dashboard/#/memberships).

## The user object

| Attribute | Description |
| -------------- | ------------- |
| id | UUID, doesn't change |
| email | Email address of this user |

## Create a user

Signing up is done using the `/users` endpoint. A post will do the trick.  [Try it out](https://api.rokka.io/doc/#/admin/createUser)

This is one of the few public routes that don't need authorization (others include the operations listing, `/stackoptions`, `/savings` and the rendering endpoints). Almost everything else needs it, so check the authorization part of the guide for the details.

```language-bash
curl -H 'Content-Type: application/json' -X POST 'https://api.rokka.io/users' -d '{
    "email": "my@example.org",
    "organization": "example-organization"
}'
```

```language-php
$client = \Rokka\Client\Factory::getUserClient();

$user = $client->createUser('my.email@example.org');

echo "Api-Key: " . $user->getApiKey() . PHP_EOL;

```

You get back a full user object, containing your Api-Key. To be safe, this information is also sent by email to your address. Save these, you need them for authentication. The Api-Key can't be recovered later, so make sure, you keep it safe somewhere.


## Get the current user_id

You can get the user_id of the logged in user with the `/user` endpoint.  [Try it out](https://api.rokka.io/doc/#/admin/getUser)

For read-only users we only return the `user_id` and no other information. The reason is that there are
valid reasons for using a read-only Api-Key in a public setting (for uploading or reading) and we don't want to expose
your email address or other Api-Keys then. For all other (non read-only) users, the response also contains the `email`
and the list of `api_keys`.

```language-bash
curl 'https://api.rokka.io/user'
```

Response (for a non read-only user): 

```language-javascript
{
    "user_id": "271cce77-45c7-4f6d-a0f6-a4edc29964e6",
    "email": "my@example.org",
    "api_keys": [
        { "id": "...", "comment": "...", "created": "..." }
    ]
}
```

```language-php

$client = \Rokka\Client\Factory::getUserClient('awesomecompany', 'apiKey');

$user_id = $client->getCurrentUserId();
var_dump($user_id);
```

## Create a new user object and automatically assign it to an organisation

If you need a new user, either for example for different roles (a write user) or you need a new Api-Key, you can do that in one call. [Try it out](https://api.rokka.io/doc/#/admin/createMembershipAndUser)


It's best practice to create a user with only write access for general operations, and only use the admin user when necessary.

You can also do this directly in the [dashboard](https://rokka.io/dashboard/#/memberships).


```language-bash
curl -X POST "https://api.rokka.io/organizations/awesomecompany/memberships" -H "Content-Type: application/json"  -d '{ 
    "roles": [ "write" ]
    }'
```

It will return a new user object with a membership to the current organisation, with a new user_id, Api-Key and the roles defined. Again, keep that Api-Key somewhere safe, you can't recover it (but you could just reissue this command again to get a new one)

```language-json
{
  "email": "test@example.org",
  "user_id": "ccd7be95-5db2-4e83-994d-f3269a98578b",
  "api_key": "kim8ZlrzJWEogDlqhOsN3daS8I4ajZom",
  "organization_id": "251581fc-12ba-466b-bb21-34d23838dc83",
  "roles": [
    "write"
  ]
}
```

```language-php
use \Rokka\Client\Core\Membership;

$client = \Rokka\Client\Factory::getUserClient('awesomecompany', 'apiKey');

$membership = $client->createUserAndMembership([Membership::ROLE_WRITE]);
var_dump($membership);
```

### Configuring the initial Api Key of the new user

You can optionally configure the **initial Api Key** of that new user with an `api_key` object in the same call.
It takes a `comment` plus any of the properties you can otherwise set when
[adding an Api Key](#adding-an-api-key-to-a-user): `trusted`, `requires_mfa`,
[`allowed_ips` and `expires`](#restricting-an-api-key-ip-whitelist-%2F-expiry).

```language-bash
curl -X POST "https://api.rokka.io/organizations/awesomecompany/memberships" -H "Content-Type: application/json"  -d '{
    "roles": [ "read" ],
    "api_key": {
        "comment": "key management, server side only",
        "trusted": true,
        "allowed_ips": ["192.168.0.5"],
        "expires": "2027-01-01T00:00:00+00:00"
    }
    }'
```

An invalid value in there answers `400` and doesn't create anything. Leaving `api_key` out (or sending it as
`null`) just means "all defaults", as before.

This is also the only way to hand a [trusted key](#trusted-api-keys) to a user that gets a read-only role
(`read`, `upload` or `sourceimages:read`) right away — see
[Rotating the Api Key of a read-only user](#rotating-the-api-key-of-a-read-only-user).


## Memberships

Membership is the connection between a user and an organization. It defines their access rights to that organization as well.

You can organize the memberships of an organization directly in the [dashboard](https://rokka.io/dashboard/#/memberships).

Or with the API calls mentioned here.


## The membership object

| Attribute | Description |
| -------------- | ------------- |
| email | The email of the user |
| user_id | UUID of user |
| organization_id | UUID of organization |
| roles | Which roles the user has for this organization as array |
| active | Whether the membership is active |
| last_access | When this user last accessed the organization |
| created | When this membership was created |
| comment | Optional comment for this membership |
| api_key | The Api-Key — only returned when the membership (and its user) is created |

## List memberships

List all memberships associated to this organisation. [Try it out](https://api.rokka.io/doc/#/admin/listMemberships)

```language-bash
curl -X GET 'https://api.rokka.io/organizations/awesomecompany/memberships'
```

This returns something like
```language-javascript
{
  "total": 2,
  "items": [
    {
      "email": "test@example.org",
      "user_id": "271cce77-45c7-4f6d-a0f6-a4edc29964e6",
      "organization_id": "251581fc-12ba-466b-bb21-34d23838dc83",
      "roles": [
        "admin"
      ],
      "active": true,
      "last_access": "2018-10-22T16:06:36+02:00"
    },
    {
      "email": "else@example.org",
      "user_id": "c8791715-a873-475e-96b2-5ffd488112e7",
      "organization_id": "251581fc-12ba-466b-bb21-34d23838dc83",
      "roles": [
        "upload",
        "read"
      ],
      "active": true
    }
  ]
}
```

```language-php
$client = \Rokka\Client\Factory::getUserClient('awesomecompany', 'apiKey');

$memberships = $client->listMemberships();
var_dump($memberships);
```

## Roles

A membership grants a user one or more roles on an organization. The roles are the same whether you set them via the
[dashboard](https://rokka.io/dashboard/#/memberships), when [assigning a membership](#assign-a-user-to-an-organization),
or when [creating a user with a membership](#create-a-new-user-object-and-automatically-assign-it-to-an-organisation).
A membership always needs at least one role, and you can freely combine them (e.g. `["upload", "sourceimages:unlock"]`).

These are all the available roles:

| Role | What it allows |
| --- | --- |
| `read` | Read-only access to metadata, including the organization itself, but **not** memberships. Good for a display-only application. |
| `write` | Add and change images and stacks, plus everything `read` can do. This is the role you'll usually give an application that talks to rokka. |
| `upload` | Upload images and nothing else. Useful to let others upload directly into your organization without any other access. |
| `sourceimages:read` | Read source images and their metadata only — no access to other data such as stacks. |
| `sourceimages:write` | Add and change source images (and upload) only — no access to other data such as stacks. |
| `sourceimages:download:protected` | Download the original binaries of [protected images](/documentation/references/protected-images-and-stacks.html). Needed on top of `sourceimages:read`/`sourceimages:write`, which otherwise can't download protected originals. |
| `sourceimages:unlock` | [Lock and unlock source images](/documentation/references/source-images.html#lock-a-source-image-to-prevent-deletion) and nothing else. Best combined with another role. |
| `billing:read` | Read-only access to the organization's cost / billing overview (the `/billing/{organization}` endpoints) and nothing else. Useful to give someone insight into costs without any write access. |
| `admin:read` | Read-only organization admin: everything `read` can do, **plus** reading the organization's memberships, users and API key metadata. Grants no write access at all. Useful to give someone (or some auditing tool) an overview of who has access to your organization, without letting them change anything. |
| `admin` | Full access, including adding, removing and promoting members in the organization. |

### Roles imply other roles

Roles are hierarchical: a higher role automatically satisfies the lower ones, so you rarely need to combine them
by hand. The table below shows which roles each role covers implicitly (in addition to itself).

| Role | Also grants |
| --- | --- |
| `admin` | Everything — all roles below. |
| `write` | `read`, `upload`, `sourceimages:read`, `sourceimages:write`, `sourceimages:download:protected`, `billing:read` |
| `admin:read` | `read`, `sourceimages:read`, `sourceimages:download:protected` |
| `read` | `sourceimages:read`, `sourceimages:download:protected` |
| `sourceimages:write` | `upload`, `sourceimages:read` |
| `upload` | — (only itself) |
| `sourceimages:read` | — (only itself) |
| `sourceimages:download:protected` | — (only itself) |
| `sourceimages:unlock` | — (only itself) |
| `billing:read` | — (only itself) |

So a `write` member can already read source images, upload, and see the billing overview without being given those
roles explicitly; an `admin` can do anything. Conversely, `sourceimages:read`/`sourceimages:write` can **not** download
the originals of protected images unless you also grant `sourceimages:download:protected` (`read`, `write` and `admin`
already can).

Note that `admin:read` is only implied by `admin`, **not** by `write` — unlike `billing:read`. Reading everyone's email
address and API key metadata is more sensitive than the cost overview, so it always has to be granted explicitly (or come
with full `admin`).

### Read-only overview of your users and their API keys

A member with `admin:read` (or `admin`) can list an organization's memberships with
`GET /organizations/{organization}/memberships`, and — across organizations — call `GET /user/admin/apikeys`.
That endpoint returns the members and their **API key metadata** for every organization where the calling user has
`admin:read`, as `{"total": N, "truncated": false, "items": [...]}` with one entry per (organization, member).

This is meant for auditing: add one user to all the organizations it should oversee with the `admin:read` role, and it
can review who has access to them and with which keys — through a single call, and without any write access anywhere.

Only key *metadata* is returned (`id`, `comment`, `created`, `accessed`, `requires_mfa`, `trusted`, `allowed_ips`,
`expires`).
The key values themselves are stored one-way hashed and can't be recovered by anyone, including rokka. Signing keys are
**not** included either — those stay behind the full `admin` role, as they can be used to sign rendering URLs.

Two caveats when setting up such a user: it must not have the `read`, `upload` or `sourceimages:read` role in *any*
organization (those mark a key as publicly used and block it from all `/user/*` endpoints), and if it is a member of a
very large number of organizations, the overview stops after the first 50 and sets `"truncated": true`.

> **Tip:** create a user with only `write` access for the day-to-day work of your application, and reserve `admin`
> for the few operations that actually need it (managing memberships and the organization itself).

## Assign a user to an organization

If you have admin rights (given when creating a new organization automatically), you can add a user to the organization with this call.  [Try it out](https://api.rokka.io/doc/#/admin/createMembership)

__awesomecompany__ would be your organization name, __userId__ the id of the to be added user. (You can [get the user_id](#get-the-current-user_id) with a `GET /user` call, if you know the Api-Key of that user)

The `roles` array can contain any of the roles described in the [Roles](#roles) section above
(`read`, `write`, `upload`, `sourceimages:read`, `sourceimages:write`, `sourceimages:download:protected`,
`sourceimages:unlock`, `billing:read`, `admin:read`, `admin`).

If you want for example assign an existing user with just a read role to your organization, do the following

```language-bash
curl -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/organizations/awesomecompany/memberships/c8791715-a873-475e-96b2-5ffd488112e7' -d '{
    "roles": ["read"]
}'
```

You can pass a single `role` string instead of the `roles` array, and an optional `comment` to store with the membership:

```language-bash
curl -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/organizations/awesomecompany/memberships/c8791715-a873-475e-96b2-5ffd488112e7' -d '{
    "roles": ["read"],
    "comment": "read-only access for the reporting tool"
}'
```

```language-php
use \Rokka\Client\Core\Membership;

$client = \Rokka\Client\Factory::getUserClient('awesomecompany', 'apiKey');

$membership = $client->createMembership('c8791715-a873-475e-96b2-5ffd488112e7', [Membership::ROLE_READ]);
var_dump($membership);
```

If the membership didn't exist yet, it will return a 201 code.
If the membership existed and has been updated, it will return a 200 code.
If the membership existed and it has not been updated, it will return a 204 code.
In a special case, if the action would remove the last active admin from the organization, it will return a 409 error and not execute the removal. This is to prevent locking yourself out of the organization. The only way to remove this is to delete the organization as a whole.

## Remove a user from an organization

To remove a member from an organization, send a DELETE request with the user_id in it.  [Try it out](https://api.rokka.io/doc/#/admin/deleteMembership)


```language-bash
curl -H -X DELETE 'https://api.rokka.io/organizations/awesomecompany/memberships/c8791715-a873-475e-96b2-5ffd488112e7'
```

```language-php
$client = \Rokka\Client\Factory::getUserClient('awesomecompany', 'apiKey');

$client->deleteMembership('c8791715-a873-475e-96b2-5ffd488112e7');
```

If the user is removed from the organization, it will return a 204 code.
If the user is not found or not a member of this organization, it will return a 404 code.
If the specified user is the only admin of this organization, it will return a 409 code. The last admin of an organization can not be removed
                      
## Rotate your Api Key

A common usecase is to rotate/change your Api key from time to time (or if your key leaked somehow).

There are two ways to rotate an Api key. Either directly on the User or you create a new User and add it to an organization via a membership.

### Via Dashboard

The easiest way to manage your Api Keys is via the Dashboard at [https://rokka.io/dashboard/#/apikeys](https://rokka.io/dashboard/#/apikeys).

### Adding, listing and deleting Api Keys of a user

In general, if a user has `read`, `upload` or `sourceimages:read` rights somewhere, all this methods won't work.
We assume, that such a user is used for public use and people could otherwise just change your key, if they 
know the Api Key. If you want to change an Api Key of such a user, you should use [the 2nd method](#creating-a-new-user-to-get-a-new-api-key) with creating
a new user and associating it to an organization.

The exception to that rule is a key explicitly flagged as [`trusted`](#trusted-api-keys): such a key is declared
never to be given to end users and may manage the keys of its user, even if that user has a read-only role. That's
what makes it possible to rotate the published key of such a user, see
[Rotating the Api Key of a read-only user](#rotating-the-api-key-of-a-read-only-user).

#### Adding an Api Key to a user

You can have up to 5 Api Keys per user. To add a new one, you POST to the `/user/apikeys` endpoint. It can have an
optional comment, too. [Try it out](https://api.rokka.io/doc/#/admin/createUserApiKey)

```language-bash
curl -X POST "https://api.rokka.io/user/apikeys" -H "Content-Type: application/json"  -d '{ 
    "comment": [ "some comment" ]
    }'
```

PHP:
```language-php
$client = \Rokka\Client\Factory::getUserClient('awesomecompany', 'apiKey');
$userApiKey = $client->addUserApiKey('some comment');
echo $userApiKey->getApiKey();
```  

JavaScript:
```language-javascript
const userApiKey = (await rokka.user.addApiKey('foo')).body
console.log(userApiKey.api_key);
```  

You'll get back an object, which contains the new Api Key. Store that somewhere safe, you or us can't get it later.

#### Listing Api Keys of a user

You can get all Api Keys (except the actual key, of course, just the info about it) with either
```language-bash
curl -X GET "https://api.rokka.io/user" -H "Content-Type: application/json"  
```
or 
```language-bash
curl -X GET "https://api.rokka.io/user/apikeys" -H "Content-Type: application/json" 
```
 [Try it out.](https://api.rokka.io/doc/#/admin/listUserApiKeys)

#### Deleting an Api Key of a user

You can delete an existing Api Key with a delete request on `/user/apikeys/$ApiKeyId`. You can't delete the
currently used key.  [Try it out.](https://api.rokka.io/doc/#/admin/deleteUserApiKey)


```language-bash
curl -X DELETE "https://api.rokka.io/user/apikeys/$ApiKeyId" -H "Content-Type: application/json"  
```

PHP:
```language-php
$client = \Rokka\Client\Factory::getUserClient('awesomecompany', 'apiKey');
$userApiKey = $client->deleteUserApiKey($id);
``` 
JavaScript:

```language-javascript
rokka.user.deleteApiKey(id)
```


#### Requiring MFA (TOTP) for an Api Key

You can protect an Api Key with a second factor: such a key can only be exchanged for a JWT token together with
a valid TOTP code, direct usage is refused. Set (or unset) the flag with a PATCH request.
[Try it out.](https://api.rokka.io/doc/#/admin/patchUserApiKey)

```language-bash
curl -X PATCH "https://api.rokka.io/user/apikeys/$ApiKeyId" -H "Content-Type: application/json" -d '{
    "requires_mfa": true
    }'
```

You can also pass `requires_mfa` when [adding a key](#adding-an-api-key-to-a-user). See the
[MFA section in the authentication guide](../guides/authentication.html#multi-factor-authentication-mfa-for-api-keys)
for the TOTP setup and the whole flow.

#### Restricting an Api Key (IP whitelist / expiry)

An Api Key can be restricted to a list of IPs / IPv4 network ranges (`allowed_ips`) and/or given an
expiration date (`expires`). A request made with a key from a non-whitelisted IP is refused with
`401` and `"error": "ip_not_allowed"`, a request with an expired key with `401` and
`"error": "key_expired"`. You can set both when [adding a key](#adding-an-api-key-to-a-user) or change
them later with a PATCH request. [Try it out.](https://api.rokka.io/doc/#/admin/patchUserApiKey)

```language-bash
curl -X PATCH "https://api.rokka.io/user/apikeys/$ApiKeyId" -H "Content-Type: application/json" -d '{
    "allowed_ips": ["192.168.0.5", "10.0.0.0/24"],
    "expires": "2027-01-01T00:00:00+00:00"
    }'
```

- These restrictions apply to the key itself **and** to every JWT token minted from it: changing them
  takes effect immediately, also for tokens issued earlier. A token minted from a key with an `expires`
  date never outlives the key.
- At most 10 entries in `allowed_ips`, covering at most 10'000 addresses in total. IPv6 works for exact
  matches, network ranges (CIDR) are IPv4 only. Unlike the token `ips` parameter, `request_ip` is not
  accepted here.
- Clear the whitelist by PATCHing `allowed_ips` to `null` or `[]`, clear the expiry with `expires: null`.
  The legacy (pre-2021) key can't carry these restrictions.

> **Careful:** PATCHing the key you are *currently authenticating with* so that it excludes your own IP
> (or gives it a past `expires`) would immediately lock that key — and its tokens — out. Such a change is
> refused with `400` by default. Either include your current IP in `allowed_ips`, make the change from an
> allowed IP, or use another key. If you really mean to (e.g. you are configuring a key for a server that
> runs elsewhere), append `?force=true` to the PATCH URL to override the guard. Restricting a *different*
> key than the one making the request is never blocked.

#### Trusted Api Keys

A user with a `read`, `upload` or `sourceimages:read` role is treated as a public user, and all the endpoints
above (plus `GET /user`, `GET /user/memberships` and the MFA endpoints) answer `403` for it. Such a key usually
ends up in a frontend, and whoever has it should not be able to change the keys of that user. The downside is
that such a user can't rotate its own keys either.

Flagging an Api Key as `trusted` is your declaration that *this particular key* is never handed to end users —
no frontend JavaScript, no mobile app; a key that stays on your server, in your deployment or in your CI. Such a
key is exempt from that guard and can manage the Api Keys of its user, even when the user has a read-only role.
[Try it out.](https://api.rokka.io/doc/#/admin/patchUserApiKey)

```language-bash
curl -X PATCH "https://api.rokka.io/user/apikeys/$ApiKeyId" -H "Content-Type: application/json" -d '{
    "trusted": true
    }'
```

You can also pass `trusted` when [adding a key](#adding-an-api-key-to-a-user), or set it on the initial key of a
new user when [creating it together with a membership](#configuring-the-initial-api-key-of-the-new-user).

- The flag is **per key**, and the key that authenticates the request is what counts. The published sibling key
  of the same user stays locked down exactly as before. A JWT token is checked against the key it was minted
  from, so a token from a trusted key can do the same — and stops being able to, as soon as you clear the flag
  on that key.
- It grants **no organization permissions** whatsoever. The membership roles are untouched: a `read` user with a
  trusted key can still only read images, it just may also manage its own keys, its MFA setup and see its own
  user object and memberships.
- It is independent of [`requires_mfa`](#requiring-mfa-totp-for-an-api-key),
  [`allowed_ips` and `expires`](#restricting-an-api-key-ip-whitelist-%2F-expiry) — a trusted key can carry all of
  them, and they are enforced on it exactly the same way. Restricting a trusted key to the IP of your server is
  a good idea.
- The default is `false`, so nothing changes for keys that were created before. The legacy (pre-2021, 32
  character) key can't be flagged — create a new key instead.
- If rokka marked the whole *user* as read-only, a trusted key doesn't change anything — that flag always wins.

> **Careful:** clearing `trusted` again on the key you are *currently authenticating with* is refused with `400`
> if that would immediately lock it out of key management — that is, if the user is read-only without the flag
> and has no other usable trusted key left. Use another key, or append `?force=true` to the PATCH URL if you
> really mean it. Clearing it on a *different* key is never blocked.

#### Getting currently used Api Key Info

If you don't remember, which Api Key ID the currently used Api Key has, you can do the following request.
[Try it out.](https://api.rokka.io/doc/#/admin/getUserApiKeyCurrent)

```language-bash
curl -X GET "https://api.rokka.io/user/apikeys/current" -H "Content-Type: application/json"  
```

PHP:
```language-php
$client = \Rokka\Client\Factory::getUserClient('awesomecompany', 'apiKey');
echo $client->getCurrentUserApiKey()->getId();
``` 
JavaScript:
```language-javascript
console.log((await rokka.user.getCurrentApiKey()).body)
```

#### Deleting all Api Keys (except the currently used one)

If you want to delete all Api Keys, except the currently used one, you can use the following code. 
Since you can't delete the currently used Api Key, we have to check for that and not try to delete that one.

Bash:
```language-bash
CURRENT=$(curl -s -H 'Api-Key: apiKey' 'https://api.rokka.io/user/apikeys/current' | jq -r .id)
for ID in $(curl -s -H 'Api-Key: apiKey' 'https://api.rokka.io/user/apikeys' | jq -r '.[].id'); do
    if [ "$ID" != "$CURRENT" ]; then
        echo "Delete $ID"
        curl -X DELETE -H 'Api-Key: apiKey' "https://api.rokka.io/user/apikeys/$ID"
    fi
done
```

PHP:
```language-php
$client = \Rokka\Client\Factory::getUserClient('awesomecompany', 'apiKey');
$user = $client->getCurrentUser();
$current = $client->getCurrentUserApiKey()->getId();

foreach ($user->getApiKeys() as $apiKey) {
    $id = $apiKey->getId();
    if ($current->getId() !== $id) {
        echo("Delete $id\n");
        $userClient->deleteUserApiKey($apiKey->getId());
    }
}

```

JavaScript:
```language-javascript
const currentKey = (await rokka.user.getCurrentApiKey()).body
const apiKeys = (await rokka.user.listApiKeys()).body
for (let key of apiKeys) {
    if (key.id !== currentKey.id) {
        console.log(`Delete ${key.id}`)
        await rokka.user.deleteApiKey(key.id)
    }
}

```


### Creating a new user to get a new Api Key

The other option to get a new Api Key is to create a new user and add it to an organization. You can do this in one call. 

You [create a new user with a membership association](./users-and-memberships.html#create-a-new-user-object-and-automatically-assign-it-to-an-organisation) to the current organization with the same permissions as the one with old key.

```language-bash
curl -X POST "https://api.rokka.io/organizations/awesomecompany/memberships" -H "Content-Type: application/json"  -d '{ 
    "roles": [ "write" ]
    }'
```

Then copy the `api_key` returned here and change all your keys with it in your applications. When done and deployed, you can [remove the old user from this organization](./users-and-memberships.html#remove-a-user-from-an-organization) with its user_id.

```language-bash
curl  -X DELETE 'https://api.rokka.io/organizations/awesomecompany/memberships/c8791715-a873-475e-96b2-5ffd488112e7'
```

You can [get the user_id](./users-and-memberships.html#get-the-current-user_id) with the following command, in case you don't have it at hand anymore (while using the old Api-Key for authorization):

```language-bash
curl -X GET 'https://api.rokka.io/user' -H "Content-Type: application/json" 
``` 

### Rotating the Api Key of a read-only user

Neither of the two methods above works for a user that has a `read`, `upload` or `sourceimages:read` role: its
key management endpoints answer `403`, as [explained above](#adding%2C-listing-and-deleting-api-keys-of-a-user).
Which is unfortunate, since a key published in a frontend is exactly the kind of key you want to rotate
regularly. The way to do that is to give such a user **two keys**: a [trusted](#trusted-api-keys) one that never
leaves your server and is only used to manage keys, and the key you actually publish.

1) Create the user with a trusted initial key:

```language-bash
curl -X POST "https://api.rokka.io/organizations/awesomecompany/memberships" -H "Content-Type: application/json"  -d '{
    "roles": [ "read" ],
    "api_key": { "trusted": true, "comment": "key management, server side only" }
    }'
```

Keep the `api_key` returned here somewhere safe on your server. It is the only key of that user that can manage
keys, and — like every Api Key — it can't be recovered later.

2) Create the key you actually publish, with the trusted key:

```language-bash
curl -X POST "https://api.rokka.io/user/apikeys" -H 'Api-Key: theTrustedKey' -H "Content-Type: application/json"  -d '{
    "comment": "public frontend key"
    }'
```

3) Roll that key out to your application. Once it's deployed everywhere, delete the previous published key,
again with the trusted key (if you don't have its id at hand, [list the keys](#listing-api-keys-of-a-user) with
`GET /user/apikeys` first):

```language-bash
curl -X DELETE "https://api.rokka.io/user/apikeys/$oldKeyId" -H 'Api-Key: theTrustedKey'
```

Repeat steps 2 and 3 whenever you want to rotate — no new user, no membership changes, and the trusted key stays
the same. Keep in mind that a user can have at most 5 Api Keys, so don't leave old ones around.

A few notes:

- An *existing* read-only user can't be upgraded this way. It can't flag any of its own keys (that's the `403`
  again), and nobody else can manage another user's keys. Either create a new user as above and move your
  applications over to it, or ask rokka support to add a trusted key to the existing user.
- If you want the trusted key to also require [MFA](#requiring-mfa-totp-for-an-api-key), pass
  `"requires_mfa": true` next to `"trusted": true` in step 1. `requires_mfa` alone is refused with `400` for a
  read-only membership: a fresh user has no TOTP setup yet, and without the trusted flag the key couldn't even
  reach the endpoints to do that setup.
- The published key from step 2 is a normal read-only key. It can't manage anything, and it never sees the
  trusted key.

## List your own memberships

To find out which organizations the currently authenticated user is a member of (and with which roles), use the
`/user/memberships` endpoint. Unlike [listing an organization's memberships](#list-memberships) — which needs an
organization name and admin rights — this is user-scoped: it just needs your own Api-Key (or a JWT token) and returns
every organization *you* belong to. [Try it out](https://api.rokka.io/doc/#/admin/listUserMemberships)

```language-bash
curl -X GET 'https://api.rokka.io/user/memberships' -H 'Api-Key: myKey'
```

It returns a `total` and an `items` array, one entry per organization, enriched with the organization name and
display name (not just the id):

```language-javascript
{
  "total": 2,
  "items": [
    {
      "organization": "awesomecompany",
      "organization_id": "251581fc-12ba-466b-bb21-34d23838dc83",
      "display_name": "My Awesome Company",
      "roles": ["admin"],
      "active": true,
      "last_access": "2026-07-18T09:12:00+02:00",
      "created": "2022-03-01T14:00:00+01:00"
    },
    {
      "organization": "anotherorg",
      "organization_id": "c8791715-a873-475e-96b2-5ffd488112e7",
      "display_name": "Another Org",
      "roles": ["read", "upload"],
      "active": true
    }
  ]
}
```

As with `/user` and `/user/apikeys`, this endpoint is not available to read-only (public) users: an Api-Key that has
a read-only role (`read`, `upload` or `sourceimages:read`) anywhere gets a `403`, so a public key can't be used to
enumerate all the organizations of its user.

## Using JWT tokens instead of the API key for authentication

See [the Authentication guide](../guides/authentication.html) for details about how to get expiring JWT tokens for authentication.