---
title: Create an Organization
use: [guides]
---

## Organizations own Images

Images uploaded to rokka are always owned by an organization, not an individual user. When you create an organization, you automatically become its administrator and can add other users with a set of permissions. Users are identified by their email address.

## Create a new Organization

To get started, lets create an organization:

```language-bash
curl -X PUT 'https://api.rokka.io/organizations/testorganization' -d '{
    'billing_email' => 'billing@testorganization.com',
    'display_name' => 'Test Organization Ltd.'
}'
```
```language-php
/** @var \Rokka\Client\User $userClient */ 
$userClient->createOrganization('testorganization', 'billing@testorganization.com', 'Test Organization Ltd.');
```

This creates an organization called "testorganization" and returns a json structure that reflects the submitted data and adds the unique id of your organization. 

```language-js
{
    "id": "c03683b067927d77973b458e0baa40aa7b5e5418",
    "display_name": "Test Organization Ltd.",
    "name": "testorganization",
    "billing_email": "billing@testorganization.com"
}
```

Your organization is now ready to use.

You should not share your personal admin account, and particularly not use it from a web application. Instead, create a separate user for automated tools called e.g. "website@testorganization.com", then give it write access to your organization. Giving permissions on an organization is explained [in the reference](../references/users-and-memberships.html).
