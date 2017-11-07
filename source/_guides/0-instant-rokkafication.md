# Instant Rokkafication

## How to get rokka up and running in no time.

In this part, we assume you already have a webpage with some pictures on it, and you'd like to deliver them with rokka with no fuss. With all the features and advantages rokka provides (CDN, image optimizations, etc..)

### CMS Plugins

If you're website is using a CMS which is supported by one of your plugins (wordpress, kirby, drupal), the easiest is to use those.

### Find a title for this 


First, get a rokka account, if you don't have one already.

Open a terminal and put the API_KEY and your organization name into environment variables.

```
export ROKKA_API_KEY=yourApiKey
export ROKKA_ORG=yourOrgName
```

Then adjust your organisation config with a remote basepath of your current website
(we assume here it's https://blog.liip.ch/ and the example image is https://blog.liip.ch/content/uploads/2017/06/Relax_sabbatical.jpg)

```
curl -X PUT \
  https://api.rokka.io/organizations/$ROKKA_ORG/remote_basepath \
  -H "api-key: $ROKKA_API_KEY" \
  -H 'content-type: application/json' \
  -d '"https://blog.liip.ch/content/uploads/"'
```

Now just get the image with

`https://$ROKKA_ORG.rokka.io/dynamic/options-autoformat-true/-2017/06/Relax_sabbatical.jpg-.jpg`

(Little caveat here: We recommend actually uploading picture to Rokka with the API (see below), this gives you much more control over everything, this approach is shown first, since it gets you started with rokka a little bit faster. Be also aware that if your original image changes, rokka won't notice, it will store the original in its database and never check for it again. You also have to delete them via the API, if you don't want them anymore in rokka)

This breaks down in

`https://{ROKKA_URL}/{STACKNAME}/{OPTIONS}/-{IMAGE_PATH_AFTER_BASE_PATH}-.{FORMAT}`

Dynamic is a special stackname, you can define your stacks dynamically (more about stacks below).
{OPTIONS} can have different options, here we only use `autoformat`, so that rokka delivers webp for browsers supporting that. {OPTIONS} is optional, but currently not for dynamic stacks (will maybe change in the future).

Then comes the obvious path to your image and then {FORMAT}, obvious choices here are .png or .jpg.

If you want to resize a picture to a certain size, you can do it via options:

`https://$ROKKA_ORG.rokka.io/dynamic/options-autoformat-true--resize-width-300/-2017/06/Relax_sabbatical.jpg-.jpg`

And if you now want to deliver retina pictures for browsers supporting it, add the dpr to your stack options and all is fine:

```
<img
    src="https://$ROKKA_ORG.rokka.io/dynamic/options-autoformat-true--resize-width-300/-2017/06/Relax_sabbatical-.jpg.jpg"
    srcset="https://$ROKKA_ORG.rokka.io/dynamic/options-autoformat-true-dpr-2--resize-width-300/-2017/06/Relax_sabbatical.jpg-.jpg 2x,
            https://$ROKKA_ORG.rokka.io/dynamic/options-autoformat-true-dpr-3--resize-width-300/-2017/06/Relax_sabbatical.jpg-.jpg 3x"
/>
```


## Stacks

Dynamic stacks can get quite verbose and we always recommend using proper stacks, also for reusability

So let's put that resizing to 300 into a stack

```
STACK_NAME=medium
curl -X PUT \
  http://api.rokka.dev/stacks/$ROKKA_ORG/$STACK_NAME \
  -H "api-key: $ROKKA_API_KEY" \
  -H 'content-type: application/json' \
  -d '{
   "operations":  [
                {
                    "name": "resize",
                    "options": {
                        "width": 300
                    }
                }
    ],
    "options": {
        "autoformat": true
    }
}'
```

And your URL suddenly gets much shorter to:

https://$ROKKA_ORG.rokka.io/medium/-2017/06/Relax_sabbatical.jpg-.jpg

or for the `<img>` example above
```
<img
    src="https://$ROKKA_ORG.rokka.io/medium/-2017/06/Relax_sabbatical.jpg-.jpg"
    srcset="https://$ROKKA_ORG.rokka.io/medium/options-dpr-2/-2017/06/Relax_sabbatical.jpg-.jpg 2x,
            https://$ROKKA_ORG.rokka.io/medium/options-dpr-3/-2017/06/Relax_sabbatical.jpg-.jpg 3x"
/>
```

## Uploading pictures to Rokka by the API

The recommended way.
FIXME: Put some code here, how to do that.
