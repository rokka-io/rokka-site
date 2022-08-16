---
title: Users and Memberships
use: [references]
description: All about rokka users and memberships and how to handle them

---

## Intro

To access the rokka API, you need an user and a membership of that user to the organization you want to access. 
This is automatically done, when you create a new account in the [signup screen](https://rokka.io/dashboard/#/signup) or 
with the corresponding API call.

Each user has one or several Api-Keys, can belong to different organizations and can have different access level on each
of those organisations. 
You can have up to 5 different Api-Keys per user. Useful if you want to change an Api-Key via key rotation, or
you just want to use different ones in different places. See below for details. 

Each user object has also an unique id, this should be used to add a user to a different organization with the membership
calls explained below.

It's a good idea to create a user for your application with only write access (and not admin rights) when you start using the service in earnest.

You can easily add new users with different membership rights in the [dashboard](https://rokka.io/dashboard/#/memberships).

## The user object

| Attribute | Description |
| -------------- | ------------- |
| id | UUID, doesn't change |
| email | Email address of this user |

## Create a user

Signing up is done using the `/users` endpoint. A post will do the trick.  [Try it out](https://api.rokka.io/doc/#/admin/createUser)

This is the only route besides the operations listing, where you don't need authorization. Everything else will need it, so check for the authorization part of the guide to see the details.

```language-bash
curl -H 'Content-Type: application/json' -X POST 'https://api.rokka.io/users' -d '[
    {
        "email": "my@example.org",
        "organization": "example-organization"
    }
]'
```

```language-php
$client = \Rokka\Client\Factory::getUserClient();

$user = $client->createUser('my.email@example.org');

echo "Api-Key: " . $user->getApiKey() . PHP_EOL;

```

You get back a full user object, containing your Api-Key. To be safe, this information is also sent by email to your address. Save these, you need them for authentication. The Api-Key can't be recovered later, so make sure, you keep it safe somewhere.


## Get the current user_id

You can get the user_id of the logged in user with the `/user` endpoint.  [Try it out](https://api.rokka.io/doc/#/admin/getUser)

For security and privacy reasons, we currently only return the user_id and not other information. The reason is that there are
valid reasons for using the Api-Key in a public setting (for uploading or reading) and therefore people could access your email adress then.

```language-bash
curl 'https://api.rokka.io/user'
```

Response: 

```language-javascript
{
    "user_id": "271cce77-45c7-4f6d-a0f6-a4edc29964e6"
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

You can also to this directly in the [dashboard](https://rokka.io/dashboard/#/memberships).


```language-bash
curl -X POST "https://api.rokka.io/organizations/awesomecompany/memberships" -H "Content-Type: application/json"  -d '{ 
    "roles": [ "write" ]
    }'
```

It will return a new user object with a membership to the current organisation, with a new user_id, Api-Key and the roles defined. Again, keep that Api-Key somewhere safe, you can't recover it (but you could just reissue this command again to get a new one)

```
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

$membership = $client->createUserAndMembership([Membership::ROLE_READ]);
var_dump($membership);
```


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

## Assign a user to an organization

If you have admin rights (given when creating a new organization automatically), you can add a user to the organization with this call.  [Try it out](https://api.rokka.io/doc/#/admin/createMembership)

__awesomecompany__ would be your organization name, __userId__ the id of the to be added user. (You can [get the user_id](#get-the-current-user_id) with a `GET /user` call, if you know the Api-Key of that user)

Role can be `read`, `write`, `upload`, `sourceimages:read`, `sourceimages:download:protected`, `sourceimages:write`, `sourceimages:unlock`,`admin`.

- Read role can only read metadata, including the organization, but not memberships. This could be used for a display-only application.
- Write can add images and stacks, as well as reading metadata. This would be the role you would want to give your application interacting with rokka, mainly.
- If you just want to give access to sourceimages, but not other data (like stacks), you can create a user with
  `sourceimages:read` or `sourceimages:write`.
- The roles `sourceimages:read` and `sourceimages:write` can't download the original binaries, when they are from 
  protected images. You have to explicitly give the `sourceimages:download:protected` role then. Other roles
  can download them. 
- Upload can just upload pictures, nothing else. Useful if you want to let other people directly upload images to your organization.
- `sourceimages:unlock` can only [lock and unlock sourceimages](/documentation/references/source-images.html#lock-a-source-image-to-prevent-deletion) and nothing else, best to be combined with another role.
- Admin can do everything, including adding, removing and promoting users in the organization.

If you want for example assign an existing user with just a read role to your organization, do the following

```language-bash
curl -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/organizations/awesomecompany/memberships/c8791715-a873-475e-96b2-5ffd488112e7' -d '{
    "roles": ["read"]
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
Javascript:

```language-javascript
rokka.user.deleteApiKey(id)
```


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
Javascript:
```language-javascript
console.log((await rokka.user.getCurrentApiKey()).body)
```

#### Deleting all Api Keys (except the currently used one)

If you want to delete all Api Keys, except the currently used one, you can use the following code. 
Since you can't delete the currently used Api Key, we have to check for that and not try to delete that one.

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

## Using JWT tokens instead of the API key for authentication

See [the Authentication guide](../guides/authentication.html) for details about how to get expiring JWT tokens for authentication.