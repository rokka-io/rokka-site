---
title: Videos
use: [references]
---

## Video support in rokka

rokka has some support for streaming videos, also adaptive for different bitrates and screensizes (depending on the used player). It does also support automatic re-encoding or re-sizing of a video. But you can also upload all those manually to be in better control, how they should generated and look.

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



## Streaming videos

The main purpose of the current video support in rokka is to be able to stream a video with [HTTP Live Streaming](https://en.wikipedia.org/wiki/HTTP_Live_Streaming) (HLS). rokka generates all the needed files for that automatically, you can start using them with just a single URL in your HLS supporting video player (see the chapter below how to integrate that with [video.js](https://videojs.com/)).

After you upload a video, rokka provides different formats to get the data you need. The most important one for you is the `m3u` format.

### .m3u

This returns the list of links to the list of segments for all (automatically or manually) linked videos. Sounds more complicated than it is, but this is the format you should use, if you want to have adaptive streaming.

If the video doesn't have already linked videos (described below in detail how to do that), the automatic creation of smaller videos for adaptive streaming will start and added to this video.

rokka will generate videos in 1080p, 720p, 480p, 360p, 240p and 144p sizes, if the original is bigger than this. This encoding can take a few minutes, but will appear automatically in the `m3u` list once they're generated.

All the newly generated videos will be added as linked sourceimage to the original video and consume storage, counting towards your bill. This for example means, if you also have to delete those linked videos in case you don't need them anymore. You'll find the hashes in the `linked` dynamic metadata.

If you don't want that automatic encoding to happen, use the .m3u8 link instead of the .m3u, which doesn't trigger that.
You can also add manually linked videos to produce the different videos for adaptive streaming by yourself, see below for details.


URL:
```
http://liip.rokka.io/dynamic/c97fc8.m3u
```

Sample Response
```
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=6314953,RESOLUTION=1920x1080
/dynamic/c97fc83ee1cd3d1919604aa5a57e0cbbc3defae1/6167-1920x1080.m3u8
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=596753,RESOLUTION=1280x720
/dynamic/6bbd94cd2664ebc650d3464e380fd03f91265eb5/583-1280x720.m3u8
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=427395,RESOLUTION=854x480
/dynamic/022c8f30a95522ee592898eae82d68e87626ea21/417-854x480.m3u8
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=350991,RESOLUTION=640x360
/dynamic/89f3b9e4437445c1197f5761ff915b927a917255/343-640x360.m3u8
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=277031,RESOLUTION=426x240
/dynamic/52c806828daea823721b34c92a2afded2bac3e29/271-426x240.m3u8
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=228941,RESOLUTION=256x144
/dynamic/42aa0a69a074ae0bf2864d92c21907edb58e2d98/224-256x144.m3u8
```

### .m3u8

This returns the list of segments for a HLS enabled video. This is the URL you use, if you just have one encoding of a video and don't need adaptive streaming and don't want to automatically generate smaller versions.
As videos don't support stack operations, the stack name doesn't matter, so just use for example `dynamic`, as this always exists.

URL:
```
http://liip.rokka.io/dynamic/c97fc8.m3u8
```

Sample Response:
```
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:10.000000,
/dynamic/355277fd50107408829daad0e6c260ca1f62fb6c/6167-1920x1080_0.ts
#EXTINF:10.000000,
/dynamic/317a7d8cb53c8c591f056c05a8df96a608d9dd4c/6167-1920x1080_1.ts
#EXTINF:10.000000,
/dynamic/7e6c5eb5b5c5819a2a118607bc5fa3753e3c10b8/6167-1920x1080_2.ts
#EXTINF:10.000000,
/dynamic/41741566440c8ff9642ad68bde138c77fc064b74/6167-1920x1080_3.ts
#EXTINF:10.000000,
/dynamic/ac0d1bb59f7df3bdb9bf14af8b191075b25a5253/6167-1920x1080_4.ts
#EXTINF:10.000000,
/dynamic/7224f12732d039a23480f8a903ca8109e72411c9/6167-1920x1080_5.ts
#EXTINF:9.880000,
/dynamic/d7ebb38e2fd9f11edd78fc63569145a898dd3c11/6167-1920x1080_6.ts
#EXTINF:4.240000,
/dynamic/798e8731e983d76b1cee206e4f3b22dcf4e8dbdc/6167-1920x1080_7.ts
#EXTINF:3.040000,
/dynamic/a00f71c0dacfa4607ee6d2072172e965db7f0dfa/6167-1920x1080_8.ts
#EXTINF:2.080000,
/dynamic/40c9aeb87873977959d869736b9723f8561b330e/6167-1920x1080_9.ts
#EXT-X-ENDLIST
```

 
### .ts

The single segments of your video file. 
Be aware that the hashes for the segments are not actual source images you can search for. It's more of an internal hash.

### Manually linking videos

If you want to use adaptive streaming (different bitrates/resolution depending on the clients network speed and screen size) and not rely on the automatic encoding of smaller sizes rokka provides,
you have to upload each of those versions to rokka and then link them together, so that we know which videos belong together.

You do this with adding the `linked` [dynamic metadata](dynamic-metadata.html) to one of the videos with all the video hashes in the `hashes` property.

```bash
curl -X PUT -H 'Content-Type: application/json' -X PUT 'https://api.rokka.io/sourceimages/$YOUR_ORG/c97fc83ee1cd3d1919604aa5a57e0cbbc3defae1/meta/dynamic/linked?deletePrevious=true' \
  -d '{
	"hashes": ["c0ba2aa4915006aa6ef3e260f45c0223873f637b", "edb0911b180e850318775ee0030e54cef78d66f4", "4ec87d67ce71d0b5080394b77dd756d7e8eadef5"]
}'
``` 

This will return a new source image object with a new hash, which you then can use later. If you still need the old source image object, change `deletePrevious` to `false`, but except you have published that hash somewhere already, there's not much need for that.

## Generating a thumbnail from an imported video for rendering

You can also generate a thumbnail from an imported video. Just use one of the supported image formats as ending (jpg, png, etc) 
and an appropriate one from the beginning of the video will be generated. 

```
http://liip.rokka.io/dynamic/c97fc8.jpg
```

If you want a thumbnail for a specific time in the video, you can use the stack option `timestamp` for that. 

You can also apply all stack operations and use your own stacks for further operations on it, eg.

```
http://liip.rokka.io/dynamic/options-timestamp-00:00:40/c97fc8.jpg
```

## Extracting and importing a thumbnail into rokka from a video

If all you need is one or more thumbnail from a (maybe remotely hosted) video in rokka, you can also extract them
directly from a video, without importing the video, but just that thumbnail. 

You can do this by appending an `@` and the timestamp to an URL and then use either the  ["upload by URL" through the sourceimages API](source-images.html#create-a-source-image-with-a-remote-url) the following way:

```
curl -X POST -F url[0]='https://liip.rokka.io/dynamic/c97fc8.mp4@00:00:22' 'https://api.rokka.io/sourceimages/mycompany'
```

or use the "[rendering a remote image](stacks.html#rendering-a-remote-image)" method to directly use a remote video in a rendering call, eg.

```
https://mycompany.rokka.io/somestack/-https://liip.rokka.io/dynamic/c97fc8.mp4@00:00:22-/some-seo-string.jpg
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
    <link href="https://vjs.zencdn.net/7.6.5/video-js.min.css" rel="stylesheet">
    <script src='https://vjs.zencdn.net/7.6.5/video.min.js'></script>

    <!-- the libraries below are optional, if you want to have quality selector for the end user. -->
    <script src="https://unpkg.com/videojs-contrib-quality-levels@2.0.9/dist/videojs-contrib-quality-levels.min.js"></script>
    <script src="https://unpkg.com/videojs-hls-quality-selector@1.0.5/dist/videojs-hls-quality-selector.min.js"></script>
</head>

<body>
<video-js id="my-video" class="video-js" controls preload="metadata"
          poster="https://liip.rokka.io/dynamic/c97fc8.jpg"
          data-setup='{"html5":{"hls": {"smoothQualityChange": true}},"fluid": true,"aspectRatio":"1920:1080"}'>
    <source src="https://liip.rokka.io/dynamic/c97fc8.m3u"" type='application/x-mpegURL'>
    <p class="vjs-no-js">
        To view this video please enable JavaScript, and consider upgrading to a web browser that
        <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
    </p>
</video-js>
<script>
    // only needed, when you want the quality selector. Otherwise you can skip the whole script block
    var player = videojs('my-video');
    player.hlsQualitySelector();
</script>
</body>
```

And here's the result of the code above:

<link href="https://vjs.zencdn.net/7.6.5/video-js.min.css" rel="stylesheet">
<script src='https://vjs.zencdn.net/7.6.5/video.min.js'></script>
<script src="https://unpkg.com/videojs-contrib-quality-levels@2.0.9/dist/videojs-contrib-quality-levels.min.js"></script>
<script src="https://unpkg.com/videojs-hls-quality-selector@1.0.5/dist/videojs-hls-quality-selector.min.js"></script>


<video  style="background-color: inherit" id="my-video" class="video-js" controls preload="metadata"
       poster="https://liip.rokka.io/dynamic/c97fc8.jpg" 
       data-setup='{"html5":{"hls": {"smoothQualityChange": true}},"fluid": true,"aspectRatio":"1920:1080"}'>
            <source src="https://liip.rokka.io/dynamic/c97fc8.m3u" type='application/x-mpegURL'>
    <p class="vjs-no-js">
        To view this video please enable JavaScript, and consider upgrading to a web browser that
        <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
    </p>
</video>

<script>
  var player = videojs('my-video');
  player.hlsQualitySelector();
</script>
