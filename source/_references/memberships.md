---
title: Memberships
use: [references]
---

## Intro

Membership is the connection between a user and an organization. It defines their access rights to that organization as well.

## The membership object

| Attribute | Description |
| -------------- | ------------- |
| user_id | UUID of user |
| organization_id | UUID of organization |
| role | Which role the user has for this organization |

## Add user to organization

If you have admin rights (given when creating a new organization automatically), you can add a user to the organization with this call.

__awesomecompany__ would be your organization name, __user@email.com__ the email the user has used to register their own account at rokka.

Role can be `read`, `write` and `admin`.

- Read role can only read metadata, including the organization, but not memberships. This could be used for a display-only application.
- Write can add images and stacks, as well as reading metadata. This would be the role you would want to give your application interacting with rokka, mainly.
- Admin can do everything, including adding, removing and promoting users in the organization.

It's best practice to create a user with only write access for general operations, and only use the admin user when necessary.

```bash
curl -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/organizations/awesomecompany/memberships/user@email.com' -d '{
    "role": "write"
}'
```

```php
use \Rokka\Client\Core\Membership;

$client = \Rokka\Client\Factory::getUserClient();

$membership = $client->createMembership('awesomecompany', 'my@email.com', Membership::ROLE_WRITE);
```

If the membership didn't exist yet, it will return a 201 code.
If the membership existed and has been updated, it will return a 200 code.
If the membership existed and it has not been updated, it will return a 204 code.
In a special case, if the action would remove the last active admin from the organization, it will return a 409 error and not execute the removal. This is to prevent locking yourself out of the organization. The only way to remove this is to delete the organization as a whole.
