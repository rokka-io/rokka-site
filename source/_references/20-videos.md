---
title: Videos
use: [references]
---

## Video support in rokka

rokka has some support for streaming videos, also adaptive for different bitrates and screensizes (depending on the used player). It doesn't support re-encoding or re-sizing of videos yet, so you have to generate and upload all the wanted resolutions/bitrates. If there's demand for automatic encoding/resizing, we're happy to look into it.  

Currently we only support the MP4 video format, support for other formats would be possible, 'though.

If you want to work with animated GIFs as source image, see [the rendering animated GIFs chapter](./render.html#rendering-animated-gifs).

## Uploading videos

Uploading videos works the same way as uploading images with the same API endpoints. Also all other sourceimages API endpoints work the same for videos. See the [source images chapter](source-images.html) for more details.

The size limit for a file is currently at about 300 MB, if you need to upload bigger videos, get in contact with us.

The source image response object for a video has some video related info, it's in the static metadata `video` part of the response. See below for an example. 

```json
 {
            "hash": "c97fc83ee1cd3d1919604aa5a57e0cbbc3defae1",
            "short_hash": "c97fc8",
            "binary_hash": "59b5ed64ecc04c8c8bab233438a92d43a8c87fc6",
            "created": "2018-05-17T09:25:32+00:00",
            "name": "1080.mp4",
            "mimetype": "video/mp4",
            "format": "mp4",
            "size": 62387004,
            "width": 1920,
            "height": 1080,
            "static_metadata": {
                "video": {
                    "data": {
                        "video_info": "h264 (Main) (avc1 / 0x31637661), yuv420p(tv, bt709), 1920x1080 [SAR 1:1 DAR 16:9], 6118 kb/s, 25 fps, 25 tbr, 90k tbn, 180k tbc (default)",
                        "audio_info": "aac (LC) (mp4a / 0x6134706D), 48000 Hz, stereo, fltp, 173 kb/s (default)",
                        "hours": "00",
                        "mins": "01",
                        "secs": "19",
                        "ms": "34",
                        "duration": "00:01:19.34",
                        "bitrate_per_sec": 6314953
                    }
                }
            }
        }
```

### Linking videos

If you want to use adaptive streaming (different bitrates/resolution depending on the clients network speed and screen size), 
you have to upload each of those versions to rokka and then link them together, so that we know which videos belong together.

You do this with adding the `linked` [dynamic metadata](dynamic-metadata.html) to one of the videos with all the video hashes in the `hashes` property.

```bash
curl -X PUT -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/sourceimages/$YOUR_ORG/c97fc83ee1cd3d1919604aa5a57e0cbbc3defae1/meta/dynamic/linked?deletePrevious=true' \
  -d '{
	"hashes": ["c0ba2aa4915006aa6ef3e260f45c0223873f637b", "edb0911b180e850318775ee0030e54cef78d66f4", "4ec87d67ce71d0b5080394b77dd756d7e8eadef5"]
}'
``` 

This will return a new source image object with a new hash, which you then can use later. If you still need the old source image object, change `deletePrevious` to `false`, but except you have published that hash somewhere already, there's not much need for that.


## Streaming videos

The main purpose of the current video support in rokka is to be able to stream a video with [HTTP Live Streaming](https://en.wikipedia.org/wiki/HTTP_Live_Streaming). rokka generates all the needed files for that automatically, you can start using them with just a single URL in your HLS supporting video player (see the chapter below how to integrate that with [video.js](https://videojs.com/)).

After you upload a video, rokka provides different formats to get the data you need. 

### .m3u

This returns the list of links to the list of segments for all linked videos. Sounds more complicated than it is, but this
is the ending you should use, if you want to have adaptive streaming.

URL:
```
http://liip.rokka.io/dynamic/e466fe12bb6c31379d66a3341afbe9011efdae6a.m3u
```

Sample Response
```
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=6314953,RESOLUTION=1920x1080
/dynamic/e466fe12bb6c31379d66a3341afbe9011efdae6a/6167-1920x1080.m3u8
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=487021,RESOLUTION=720x480
/dynamic/c0ba2aa4915006aa6ef3e260f45c0223873f637b/476-720x480.m3u8
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=1023810,RESOLUTION=1920x1080
/dynamic/edb0911b180e850318775ee0030e54cef78d66f4/1000-1920x1080.m3u8
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=715351,RESOLUTION=1280x720
/dynamic/4ec87d67ce71d0b5080394b77dd756d7e8eadef5/699-1280x720.m3u8
```

If only have one encoding of a video (not with different bitrates or resolutions), you can also just use the .m3u8 ending explained below.

### .m3u8

This returns the list of segments for a HLS enabled video. This is the URL you use, if you just have one encoding of a video and don't need adapive streaming.
As videos don't support stack operations, the stack name doesn't matter, so just use for example `dynamic`, as this always exists.

URL:
```
http://liip.rokka.io/dynamic/e466fe12bb6c31379d66a3341afbe9011efdae6a.m3u8
```

Sample Response:
```
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:20
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:20.000000,
/dynamic/230f95bf82c370666aa82e16268d3f3e6f0fddae/6167-1920x1080.ts
#EXTINF:20.000000,
/dynamic/c0ed2bfdf1a6bd226c7ed5eb3b145775d889a03a/6167-1920x1080.ts
#EXTINF:20.000000,
/dynamic/c654f15b7756b8218051f44d65db091043e4f5d2/6167-1920x1080.ts
#EXTINF:19.240000,
/dynamic/15f73d63d9a13df44f6c756aee30705a5bd15659/6167-1920x1080.ts
#EXT-X-ENDLIST
```

 
### .ts

The single segments of your video file. 
Be aware that the hashes for the segments are not actual source images you can search for. It's more of an internal hash.


## Generating a thumbnail from an imported video for rendering

You can also generate a thumbnail from an imported video. Just use one of the supported image formats as ending (jpg, png, etc) 
and an appropriate one from the beginning of the video will be generated. 

If you want a thumbnail for a specific time in the video, you can use the stack option `timestamp` for that. 

You can also apply all stack operations and use your own stacks for further operations on it, eg.

```
http://liip.rokka.io/dynamic/options-timestamp-00:00:40/56b4956d028d4e0b354d02dab1f6a2128673fe93.jpg
```

## Extracting and importing a thumbnail into rokka from a video

If all you need is one or more thumbnail from a (maybe remotely hosted) video in rokka, you can also extract them
directly from a video, without importing the video, but just that thumbnail. 

You can do this by appending an `@` and the timestamp to an URL and then use either the  ["upload by URL" through the sourceimages API](source-images.html#create-a-source-image-with-a-remote-url) the following way:

```
curl -X POST -F url[0]='https://liip.rokka.io/dynamic/56b4956d028d4e0b354d02dab1f6a2128673fe93.mp4@00:00:22' 'https://api.rokka.io/sourceimages/mycompany'
```

or use the "[rendering a remote image](stacks.html#rendering-a-remote-image)" method to directly use a remote video in a rendering call, eg.

```
https://mycompany.rokka.io/somestack/-https://liip.rokka.io/dynamic/56b4956d028d4e0b354d02dab1f6a2128673fe93.mp4@00:00:22-/some-seo-string.jpg
```

Both methods will just import that thumbnail into rokka for later reuse and not the whole video. It also just downloads the parts needed from the video 
to extract that thumbnail and not the full video. 

## Using video.js for adaptive streams

[Video.js](https://videojs.com/) is an open-source, extendable framework/library around the native video element. 
There's an [HLS library](https://github.com/videojs/videojs-contrib-hls) available for it, which allows to use HLS streams in any modern browser
and makes them also adaptive (chooses the right stream, depending on your screen resolution and bandwidth).

There's also a [Quality Selector library](https://github.com/chrisboustead/videojs-hls-quality-selector), which adds a quality selector menu to the player.

To display a video uploaded to rokka and using video.js, just include the following code in your site and adjust the rokka URLs with your organisation and hashes.

Don't forget to upload and [link together](#linking-videos) videos with the same content but different quality settings/screen resolutions as mentioned above. 
Also don't forget to use the new hash, after you linked different videos together to get adaptive streaming.

```html
<head>
    <link href="https://vjs.zencdn.net/6.9.0/video-js.css" rel="stylesheet">

    <script src="https://unpkg.com/video.js/dist/video.js"></script>
    <script src="https://unpkg.com/videojs-contrib-hls/dist/videojs-contrib-hls.js"></script>
    <!-- the libraries below are optional, if you want to have quality selector for the end user. -->
    <script src="https://unpkg.com/videojs-contrib-quality-levels/dist/videojs-contrib-quality-levels.min.js"></script>
    <script src="https://unpkg.com/videojs-hls-quality-selector/dist/videojs-hls-quality-selector.min.js"></script>

</head>

<body>
<video  id="my-video" class="video-js" controls preload="metadata"
       poster="https://liip.rokka.io/dynamic/56b4956d028d4e0b354d02dab1f6a2128673fe93.jpg" data-setup='{"fluid": true}'>
            <source src="https://liip.rokka.io/dynamic/56b4956d028d4e0b354d02dab1f6a2128673fe93.m3u" type='application/x-mpegURL'>
    <p class="vjs-no-js">
        To view this video please enable JavaScript, and consider upgrading to a web browser that
        <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
    </p>
</video>

<script>
  var player = videojs('my-video');
  player.hlsQualitySelector();
</script>
</body>
```

And here's the result of the code above:

<link href="https://vjs.zencdn.net/6.9.0/video-js.css" rel="stylesheet">
<script src="https://unpkg.com/video.js/dist/video.js"></script>
<script src="https://unpkg.com/videojs-contrib-hls/dist/videojs-contrib-hls.js"></script>
<script src="https://unpkg.com/videojs-contrib-quality-levels/dist/videojs-contrib-quality-levels.min.js"></script>
<script src="https://unpkg.com/videojs-hls-quality-selector/dist/videojs-hls-quality-selector.min.js"></script>


<video  id="my-video" class="video-js" controls preload="metadata"
       poster="https://liip.rokka.io/dynamic/56b4956d028d4e0b354d02dab1f6a2128673fe93.jpg" data-setup='{"fluid": true}'>
            <source src="https://liip.rokka.io/dynamic/56b4956d028d4e0b354d02dab1f6a2128673fe93.m3u" type='application/x-mpegURL'>
    <p class="vjs-no-js">
        To view this video please enable JavaScript, and consider upgrading to a web browser that
        <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
    </p>
</video>

<script>
  var player = videojs('my-video');
  player.hlsQualitySelector();
</script>
