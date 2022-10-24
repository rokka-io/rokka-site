---
title: Protected Images and Stacks
use: [references]
description: rokka can protect your images with signed urls, so that they're for example only are accessible for a certain time.
---

## Intro

In general, images are pretty safe from unwanted downloads on rokka thanks to the unpredictable hash. 
If people don't know the hash, they can't guess it in a reasonable amount of time, even with the short hash.

But if someone knows the hash, they can pretty much render any image they want with it or change your
stack parameters. The only thing they can't do is to download the original image - unless you have
set a stack with the [`source_file` option](./stacks.html#configuring-a-stack-to-just-deliver-the-original-source-file). 
But also with just the dynamic stack and for example the `png` format one can get pretty close 
to the original image.

To prevent this, you can use protected images or stacks and then sign your rokka render URLs with
your organization's signing key. 

## Protected images

If you want certain images to only be accessible with a signed URL - for example some high resolution photographs people
shouldn't be able to just download through changing the rokka render URL - you can mark an image as protected. Then no matter how, they always need
a signed url to be accessed. Be aware, that people still can just download that image to their device and then send
it to other people.

Furthermore, API users with just the roles `sourceimages:read` and `sourceimages:write` can't download the original binaries of such
protected images. You have to explicitly give the `sourceimages:download:protected` role to those users. Other roles
can download them. See [Assign a user to an organization](users-and-memberships.html#assign-a-user-to-an-organization) 
for details.

### Same image protected has a different hash than unprotected

Important to know: The same image uploaded once as protected and once as unprotected get different hashes. This
is for security and caching reasons. And also that you don't accidentally make a published unprotected image protected
and your users can't access it anymore.

This also applies if you change the protected status of an image. It then gets you a different hash (but the old hash
doesn't get deleted by default).

But as with "normal" unprotected images, the same binary gives you always the same hash, depending on if they are
protected or not. 

### Uploading a to be protected image

To mark an image as protected during upload, you set the `protected` property in `options` to `true`. Examples:

Bash:
```language-bash
curl -X POST -F filedata=@image.png \
     'https://api.rokka.io/sourceimages/mycompany' \
     --form 'options[]={"protected":true}'
```
PHP:
```language-php
$client = \Rokka\Client\Factory::getImageClient('mycompany', 'apiKey');
$sourceImages = $client->uploadSourceImage(
    file_get_contents('image.png'), 
    'image.png', 
    null, 
    ['options' => ['protected' => true]]
);
```

JavaScript:
```language-javascript
var rokka = require('rokka')({apiKey: 'apiKey'})
var filePath = 'image.png' 
var response = rokka.sourceimages.create(
    org, 
    filePath, 
    require('fs').createReadStream(filePath), 
    {options: {protected: true}}
)
```

### (Un)protecting an existing image

You can also change the protected status of an existing image. As mentioned above (and as 
with [dynamic metadata](./dynamicmetadata.html)) the hash of the image changes, but rokka keeps the unprotected
version of it. If you want to directly delete the "old" image, you can set the `deletePrevious` option to `true`
and it will be gone (if the protected status actually changes, if it's the same, it will be kept, of course)

The new hash is reported in the `Location` header field.

Bash:
```language-bash
curl -X PUT 'https://api.rokka.io/sourceimages/mycompany/0dcabb778d58d07ccd48b5ff291de05ba4374fb9/options/protected' \
      --data-raw 'true'
```

PHP:
```language-php
$client = \Rokka\Client\Factory::getImageClient('mycompany', 'apiKey');
$newHash = $client->setProtected(
    true, 
    '0dcabb778d58d07ccd48b5ff291de05ba4374fb9', 
    null,
    ['deletePrevious' => true] // optional, default is false
);
```

JavaScript:
```language-javascript
var rokka = require('rokka')({apiKey: 'apiKey'})
var response = rokka.sourceimages.setProtected(
    org, 
    '0dcabb778d58d07ccd48b5ff291de05ba4374fb9', 
    true, 
    {deletePrevious: true} // optional, default is false
)
```


## Protected stacks

You can also protect render URLs for a single stack. This may be useful, if you for example have a stack 
which [dynamically adds text onto an image](../demos/template.html) and you don't want people to create their own versions of this.

You [create such a stack like any other stack](./stacks.html#create-a-stack), just set the stack option `protected` to true. 

Bash:
```language-bash
curl -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/stacks/mycompany/teststack?overwrite=true' -d '{
    "operations":
    [
        {
            "name": "resize",
            "options": {
                "width": 200,
                "height": 200
            }
        }
    ],
    "options": {
        "protected": true
    }
}
'
```
PHP: 

```language-php
use Rokka\Client\Core\Stack;
use Rokka\Client\Core\StackOperation;
$client = \Rokka\Client\Factory::getImageClient('mycompany', 'apiKey');
$stack = new Stack(null, 'stackname');
$stack->addStackOperation(new StackOperation('resize', ['width' => 200, 'height' => 200]));
$stack->setStackOptions(['protected' => true, 'autoformat' => true]);
$stack = $client->saveStack($stack);
```

JavaScript: 

```
var rokka = require('rokka')({apiKey: 'apiKey'})
var response await rokka.stacks.create(
    org,
    "stack-name",
    {
      operations: [
            {name: "resize", options: {width: 200, height: 200}}
      ],
      options: {
        protected: true, 
        autoformat: true
      }
    }
)

```

### (Un)protecting an existing stack

Together with [the `overwrite` query parameter](./stacks.html#updating-existing-stacks) you can change
the configuration of a stack. But you can't change a unprotected stack to a protected one. Again for security and 
caching reasons, and also that you don't make accidentally published images inaccessible.

But having said that, nothing prevents you to delete that unprotected stack first and then make a new one with
the same name. We just don't advise on that, in general, that `overwrite` parameter should only be used during
development and not when a stack is already used in production, not only with regards to protecting a stack. 


### Protecting the dynamic stack

Even if you protect all your stacks with the `protected` option, visitors can still circumvent the protection
with the virtual "dynamic" stack. Except if you protect the images itself.

To also protect the "dynamic" stack, you can set the organization option `protect_dynamic_stack` to true and from then
on all render requests to the "dynamic" stack need to be signed. But also be aware that if a request is somewhere
still cached, it may still go through with an unsigned URL (talk to us, if that's a problem, we can clear the relevant
caches manually).

The examples to set this organization option:

Bash:
```language-bash
curl -X PUT 'https://api.rokka.io/organizations/mycompany/options/protect_dynamic_stack' \
      --data-raw 'true'
```

PHP:
```language-php
$client = \Rokka\Client\Factory::getUserClient('awesomecompany', 'apiKey');
$client->setOrganizationOption(
    null, 
    \Rokka\Client\User::ORGANIZATION_OPTION_PROTECT_DYNAMIC_STACK,
    true
);
```

JavaScript:
```language-javascript
var rokka = require('rokka')({apiKey: 'apiKey'})
rokka.organizations.setOption(
    org, 
    rokka.organizations.OPTION_PROTECT_DYNAMIC_STACK, 
    false
)
```


## Making all render requests protected

This is currently not possible with a single command (tell us, if you really need that). But you have basically two
options to achieve it. Either make all your images protected. Or all your stacks and also protect the dynamic stack.
Both approaches have the same effect, all your render URLs need then to be signed.

## Signing an URL

For signing an URL, you need your organization's signing key (see below). Then the easiest way to sign a render URL is to use 
one of the official rokka client libraries. But you can also build it yourself.

To calculate the signature hash needed, you take the url path and query (without the host and the scheme) of a render URL, 
append a colon (`:`) and your signing key, the calculate a sha256 hash out of this and take the first 16 characters. Make sure
that url path has the leading '/' in it.
This hash then you append to the url with the query string parameter `sig`.

In PHP, this would look like this:

```language-php
$urlPath = '/stackname/504e34/image.jpg';
$key = '84jfskg2z40tz87hkjhl';
$signature = substr(hash('sha256',$urlpath.':'.$key),0,16);
$signedUrl = $urlPath.'?sig='$signature;
```

If you have other query parameters (like the `v` parameter), you have to include them too for the signature 
calculation.

You can see a live example of calculating a signature at the [sign url demo](../demos/signurl.html).


### Getting the signing key

Currently you can't create new or delete signing keys. We will add this feature some time in the future (and tell us
in the meantime, if you need a new key, we can change it for you)

Bash:
```language-bash
KEY=$(curl --request GET 'http://api.rokka.io/organizations/mycompany' | \
jq .signing_keys[0].key)
echo $KEY
```

PHP:
```language-php
$client = \Rokka\Client\Factory::getUserClient('awesomecompany', 'apiKey');
$key = $client->getOrganization()->getSigningKeys()[0];
```

JavaScript:
```language-javascript
var rokka = require('rokka')({apiKey: 'apiKey'})
var key = await rokka.organizations.get('test')).body.signing_keys[0].key
```

### Signing an actual URL

Don't use that in production, sign it with one of the clients and keep your signing key locally somewhere
```language-bash
# Really just for one time purposes
curl --request POST 'http://api.rokka.io/utils/test/sign_url' \
    --form 'url=https://mycompany.rokka.io/somestack/hash.jpg'
```

Don't know who'd wanna do this in bash, but it's possible:

```language-bash
URLPATH=/somestack/hash.jpg
SIGNATURE=$(echo -n ${URLPATH}:${KEY} | sha256sum | cut -c 1-16)
echo https://mycompany.rokka.io/${URLPATH}?sig=${SIGNATURE}
```

PHP:
```language-php
$url = https://mycompany.rokka.io/somestack/somehash.jpg";
$signedUrl = (string) \Rokka\Client\UriHelper::signUrl($url, $key); 
``` 

JavaScript:
```language-javascript
var rokka = require('rokka')()
var url = https://mycompany.rokka.io/somestack/somehash.jpg";
var signedUrl = rokka.render.signUrl(url, key)
``` 

### Doing a time limited signed URL

You can also make a signed URL time limited. A signed URL is then only valid until a certain time in the future. 

For this, you create a stringified JSON object with the property `until` and a valid date as string 
(ISO 8601 works best, others may work too) as value of this, then add  this with the `sigopts` query parameter and
create a signature of this whole URL.

Our official libraries also support this.

PHP:
```language-php
$url = https://mycompany.rokka.io/somestack/somehash.jpg";
# make it valid for a day
$validUntil = (new DateTime())->add(new DateInterval('PT1D'))
$signedUrl = (string) \Rokka\Client\UriHelper::signUrl($url, $key, $validUntil); 
``` 

JavaScript:

```language-javascript
var rokka = require('rokka')()
var url = https://mycompany.rokka.io/somestack/somehash.jpg";
var until = new Date()
until.setDate(until.getDate() + 1)
var signedUrl = rokka.render.signUrl(url, key, until)
``` 

Those two libraries round the date up to 5 minutes slices to improve caching, you can change that with 
the fourth parameter and define this in seconds. The higher this value, the better the CDN caching will be. For example, 
you can set this to 7200 seconds (two hours), if you want to give access for several hours and you don't care much
about up to two hours more.

See also the live example of calculating a signature at the [sign url demo](../demos/signurl.html) which also includes 
this option.

### Limiting signed URLs by other parameters

Currently you can only limit signed URLs by time. If you need limiting access by other parameters (like source IP), talk
to us, we may be able to make that possible. 
