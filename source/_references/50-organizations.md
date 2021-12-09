---
title: Organizations
use: [references]
description: All about rokka organizations and how to handle them
---

## Intro

Organizations are what rokka uses to group images together. A user can be part of multiple organizations.
An organization is also part of the url to use the API and the rendering backend. It's a best practice to
have one organization per backend that manages images. For example if you run two shops that might 
have overlapping images, having two separate organizations would be advisable.

## The organization object

| Attribute | Description |
| -------------- | ------------- |
| id | UUID, doesn't change |
| name | Websafe name to use in urls e.g. "rokka". Only small letters, numbers and dashes ([a-z0-9-]) are allowed. |
| display_name | A more pretty name that can be displayed e.g. "rokka.io" |
| billing_email | Email address for billing purposes |

## Create an organization

With a user, you can create new organizations on the `/organizations` endpoint.

```language-bash
curl -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/organizations/awesomecompany' -d '{
    "billing_email": "my.email@mail.com",
    "display_name": "My Awesome Company"
}'
```
```language-php
$client = \Rokka\Client\Factory::getUserClient();

$client->setCredentials('apiKey');

$organization = $client->createOrganization('awesomecompany', 'my.email@mail.com', 'My Awesome Company');

var_dump($organization);
```

Note the use of the websafe name as part of the url on where to put the request.

The return is the full organization object.

At the same time a membership relation is created, making you the admin of the new organization.

## Read data of one organization

To retrieve the metadata, a simple GET request will do. Anyone with read rights can do so on this organization.

```language-bash
curl -X GET 'https://api.rokka.io/organizations/awesomecompany'
```
```language-php
$client = \Rokka\Client\Factory::getUserClient();

$client->setCredentials('apiKey');

$organization = $client->getOrganization('awesomecompany');

var_dump($organization);
```

The return is the full organization object.
