---
title: Users
use: [references]
---

## Intro

A user can be a physical person or you can create a user for a specific project/access level. A user is identified by their email, while internally they are given a UUID.

It's a good idea to create a user for your application with only write access when you start using the service in earnest.

## The user object

| Attribute | Description |
| -------------- | ------------- |
| id | UUID, doesn't change |
| email | Email address of this user |

## Create a user

Signing up is done using the `/users` endpoint. A post will do the trick.

This is the only route besides the operations listing, where you don't need authorization. Everything else will need it, so check for the authorization part of the guide to see the details.

```language-bash
curl -H 'Content-Type: application/json' -X POST 'https://api.rokka.io/users' -d '{ "email": "my.email@mail.com"}'
```

```language-php
$client = \Rokka\Client\Factory::getUserClient();

$user = $client->createUser('my.email@mail.com');

echo "Api-Key: " . $user->getApiKey() . PHP_EOL;
echo "Api-Secret: " . $user->getApiSecret() . PHP_EOL;

```

You get back a full user object, containing your api key and api secret. To be safe, they are also sent by email to your address. Save these, you need them for authentication.
