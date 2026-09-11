---
title: Organizations
slug: organizations
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
| created | When this organization was created |
| options | Organization-level options (eg. remote URL and render fallback options) |
| master_organization | Name of the parent organization, for sub-organization setups |

To see all the organizations below a master organization, use [List the sub organizations of an organization](#list-the-sub-organizations-of-an-organization).

## Create an organization

With a user, you can create new organizations on the `/organizations` endpoint.

```bash
curl -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/organizations/awesomecompany' -d '{
    "billing_email": "my.email@mail.com",
    "display_name": "My Awesome Company"
}'
```
```php
$client = \Rokka\Client\Factory::getUserClient();

$client->setCredentials('apiKey');

$organization = $client->createOrganization('awesomecompany', 'my.email@mail.com', 'My Awesome Company');

var_dump($organization);
```

Note the use of the websafe name as part of the url on where to put the request.

You can also pass an optional `master_organization` field in the body to create a sub-organization of an existing one.

The return is the full organization object.

At the same time a membership relation is created, making you the admin of the new organization.

## Read data of one organization

To retrieve the metadata, a simple GET request will do. Anyone with read rights can do so on this organization.

```bash
curl -X GET 'https://api.rokka.io/organizations/awesomecompany'
```
```php
$client = \Rokka\Client\Factory::getUserClient();

$client->setCredentials('apiKey');

$organization = $client->getOrganization('awesomecompany');

var_dump($organization);
```

The return is the full organization object.

## List the sub organizations of an organization

If you run a master organization with sub-organizations below it — the ones whose usage is aggregated onto the master's
invoice — you can list them on the `/organizations/{organization}/sub_organizations` endpoint. It needs the `admin` or
`admin:read` role on that organization. [Try it out](https://api.rokka.io/doc/#/admin/listSubOrganizations)

```bash
curl -X GET 'https://api.rokka.io/organizations/awesomecompany/sub_organizations' -H 'Api-Key: myKey'
```

It returns a `total` and an `items` array, one entry per sub-organization, sorted by name:

```javascript
{
  "organization": "awesomecompany",
  "master_organization": "awesomecompany",
  "total": 2,
  "items": [
    {
      "name": "awesomecompany-shop",
      "id": "251581fc-12ba-466b-bb21-34d23838dc83",
      "display_name": "Awesome Company Shop",
      "billing_email": "my.email@mail.com",
      "created": "2024-03-01T14:00:00+01:00"
    },
    {
      "name": "awesomecompany-www",
      "id": "c8791715-a873-475e-96b2-5ffd488112e7",
      "display_name": "Awesome Company Website",
      "billing_email": "my.email@mail.com",
      "created": "2025-11-12T08:30:00+01:00"
    }
  ]
}
```

The organization you asked for is not part of `items` — it is echoed back as `organization`, so `items` really only
contains the organizations below it. Disabled sub-organizations are left out.

rokka does not support nesting master organizations, so an organization that is itself a sub-organization has no
sub-organizations of its own. Asking this on one answers with an empty list, and the `master_organization` field tells
you which organization to ask instead:

```javascript
{
  "organization": "awesomecompany-shop",
  "master_organization": "awesomecompany",
  "total": 0,
  "items": []
}
```

It deliberately doesn't expand to that master's other sub-organizations, since you may well have no rights on them.
