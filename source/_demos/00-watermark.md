---
title: Watermark
use: [demos]
header_include: demos/watermark-head.html
body_attributes: onload="updateImage()"
---
 
# Watermark demo

Uses a [text operation](/documentation/references/operations.html#text) to apply a watermark
on your images diagonally. An expression in the stack config (see below) calculates the needed
angle of the watermark, depending on the width and height of the image. 

Furthermore, the text box is set to the output width (-50px) and the height is width / 7. With this
and the `resize_to_box` option, the text size is automatically adjusted to that box.

<div id="demoForm">   
<form id="form" onkeyup="updateImage()" onchange="updateImage()">
    <p>Image: 

    <select name="imagehash" id="imagehash">
        <option selected>90b93a</option>

            <option >5f6f3b</option>
            <option>d73781</option>
    <option >ab329e</option>
    <option >ceb95d</option>
    <option >807fd9</option>
</select>
    
    Font: 
    <select name="font">
        <option selected>86d7ee</option>
    <option >1d9e7c</option>
    <option>1249b3</option>
</select>
    Width: 
    <input type="text" name="width"  value="500" size="4">

    </p>
    <p>
    Text: 
    <input type="text" name="t"  value="My Watermark">
    Color: 
    <input type="text" name="color" value="000000" size="7">

    Opacity: 
    <input type="text" name="o"  value="20" size="4">
    
    </p>
    
</form>
</div>
<p>
    URL: <input id="url" onkeyup="urlchange()" size="120">
</p>
<p>
    <img id="image" src="">
</p>

See the [text operation chapter](/documentation/references/operations.html#text) for more info. 

**Stack config**:

````javascript
{
    "operations": [
        {
            "name": "resize",
            "options": {
                "mode": "fill",
                "upscale": false
            },
            "expressions": {
                "width": "$width"
            }
        },
        {
            "name": "text",
            "options": {
                "resize_to_box": true
            },
            "expressions": {
                "opacity": "$o",
                "text": "$t",
                "width":  "$width - 50",
                "height": "$width / 7",
                "font": "$font",
                "color": "$color",
                "angle": "-rad2deg(atan(image.height / image.width))"
            }
        }
    ],
    "variables": {
        "width": "500",
        "t": "My Watermark",
        "o": 20,
        "color": "000000",
        "font": "86d7ee"
    }
}
````


<p>
Photos by
</p>
<p> 
<span><a href="https://unsplash.com/@dominicrueegg?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Dominic Rüegg</a> on <a href="https://unsplash.com/?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>
</p>
<p><span><a href="https://unsplash.com/@behz?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Behzad Ghaffarian</a> on <a href="https://unsplash.com/?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>
</p>
<p><span><a href="https://unsplash.com/@teo?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Teo Zac</a> on <a href="https://unsplash.com/?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>
    </p>

