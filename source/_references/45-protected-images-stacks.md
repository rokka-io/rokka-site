---
title: Protected Images and Stacks
use: [references]
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
a signed url to be downloaded.

Furthermore API users with just the roles `sourceimages:read` and `sourceimages:write` can't download the original binaries of such
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

Docs coming very soon

### Protecting the dynamic stack

Docs coming very soon

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

More docs coming very soon

### Getting the signing key

Currently you can't create new or delete signing keys. We will add this feature some time (and tell us, if
you need a new key, we can change it for you)

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
