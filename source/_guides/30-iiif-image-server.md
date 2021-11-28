---
title: Rokka as IIIF Image Server
use: [guides]
header_include: demos/iiif-head.html
body_attributes: onload="loaded()"

---

## Use rokka as an IIIF Image Server

You can use rokka also as an [IIIF](https://iiif.io/) Image Server to deliver zoomable (high resolution) images according
to the [IIIF Image API](https://iiif.io/api/image/3.0/) and together with for example one of the Open Source viewers like
[OpenSeadragon](https://openseadragon.github.io/).

rokka supports the 2.1 and 3.0 version of those specs. The URL of the info.json is `https://${org}.rokka.io/_iiif/${hash}/info.json` 
for the latest version (3.0 right now). `https://${org}.rokka.io/_iiif/3/${hash}/info.json` or
`https://${org}.rokka.io/_iiif/2/${hash}/info.json` for a specific version.

If the image is large, we will pregenerate (cache) all the needed tiles on demand, for fast access later.

If you're using OpenSeadragon, this would be the config you need and the result of this you can see below.

```javascript
viewer = OpenSeadragon({
    id: "openseadragon1",
    tileSources: 'http://rokka.rokka.test/_iiif/283eaf/info.json',
    imageLoaderLimit: 2
});
```
<div id="container">
</div>

You can use any rokka picture for this. Try with your own with this form.
<div id="demoForm">   

<form id="form" onsubmit="return submitted(); ">

    <p>Rokka Organisation: <input id="org" name="org" value="">
    Hash: <input id="hash" name="hash" value=""></p>
    <p><input type="submit" value="Submit"></p>

</form>
</div>
