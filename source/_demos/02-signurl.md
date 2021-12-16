---
title: Sign a URL
slug: signurl
use: [demos]
header_include: demos/signurl-head.html
body_attributes: onload="updateImage()"
description: Generating signatures for protected rokka images and stacks

---
 
# Sign a rokka URL Demo

See [the docs for detatils](https://rokka.io/documentation/references/protected-images-and-stacks.html).


<div id="demoForm">   
<form id="form" onkeyup="updateImage()" onchange="updateImage()">
    <p>
     Sign Key: <input id="signKey"  size="35" value="PoJUJTX4u0ZON12e0tVaMHRyizL8fs">
     </p>
    <p>
    Valid until: <input id="until"  type="datetime-local" value="now" size="20">
     Round validity up to <input id="roundUp" value="300" size="4"> Seconds.
     </p>

    <p>
     Input URL: <input id="inputUrl" value="https://rokka-demos.rokka.io/template/92147e.png" size="120">
     </p>

    <p>
     Variable for text (optional): <input id="inputText" value="Title" size="60">
     </p>

</form>
</div>
<p>
  Generated signature options: <span id="options"> </span>
</p>
<p>
    Signed URL: <textarea id="url" onkeyup="urlchange()" >
    </textarea>
</p>
<p>
    <img id="image" src="">
</p>
