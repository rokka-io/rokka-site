---
title: Users and Memberships
use: [references]
---

## Intro

To access the rokka API, you need an user and a membership of that user to the organization you want to access. 
This is automatically done, when you create a new account in [signup screen](https://rokka.io/dashboard/#/signup) or 
with the corresponding API call.

Each user has an unique Api-Key, can belong to different organizations and can have different access level on each
of those organisations. The Api-Key currently can't be changed,  but it is easy to create a new user with a new Api-Key and connect that to an organization via a membership. This is currently the recommended way, if you need to change an 
Api-Key, eg. because the current one shouldn't be used anymore.

Each user object has also an unique id, this should be used to add a user to a different organization with the membership
calls explained below.

It's a good idea to create a user for your application with only write access (and not admin rights) when you start using the service in earnest.

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

Role can be `read`, `write`, `upload` and `admin`.

- Read role can only read metadata, including the organization, but not memberships. This could be used for a display-only application.
- Write can add images and stacks, as well as reading metadata. This would be the role you would want to give your application interacting with rokka, mainly.
- Upload can just upload pictures, nothing else. Useful if you want to let other people directly upload images to your organization.
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

client->deleteMembership('c8791715-a873-475e-96b2-5ffd488112e7');
```

If the user is removed from the organization, it will return a 204 code.
If the user is not found or not a member of this organization, it will return a 404 code.
If the specified user is the only admin of this organization, it will return a 409 code. The last admin of an organization can not be removed
                      
## Rotate your API Key

A common usecase is to rotate/change your API key from time to time (or if your key leaked somehow). 

First you [create a new user with a membership association](./users-and-memberships.html#create-a-new-user-object-and-automatically-assign-it-to-an-organisation) to the current organization with the same permissions as the one with old key.

```language-bash
curl -X POST "https://api.rokka.io/organizations/awesomecompany/memberships" -H "Content-Type: application/json"  -d '{ 
    "roles": [ "write" ]
    }'
```

Copy the `api_key` returned here and change all your keys with it in you applications. When done and deployed, you can [remove the old user from this organization](./users-and-memberships.html#remove-a-user-from-an-organization) with its user_id.

```language-bash
curl  -X DELETE 'https://api.rokka.io/organizations/awesomecompany/memberships/c8791715-a873-475e-96b2-5ffd488112e7'
```

You can [get the user_id](./users-and-memberships.html#get-the-current-user_id) with the following command, in case you don't have it at hand anymore (while using the old Api-Key for authorization):

```language-bash
curl 'https://api.rokka.io/user'

``` 