---
title: Templates with Text
use: [demos]
header_include: demos/templates-head.html
body_attributes: onload="updateImage()"
---
 
# Templates with Text Demo

Uses some complexer stack configuration with stack expressions and variables and "substacks" inclusion

<div id="demoForm">   
<form id="form" onkeyup="updateImage()" onchange="updateImage()">
    <p>Image: <select name="imagehash" id="imagehash">
    <option value="5ab1ea" selected>1</option>
    <option value="fce8f3">2</option>
    <option value="1cf87c">3</option>
</select>
    Font Size: <input type="text" name="s"  size="3" value="50">
    Font: <select name="font">
    <option>1</option>
    <option selected>2</option>
    <option>3</option>
</select>
    </p>
    <p>
    Text 1: <input type="text" name="t"  value="Pfanne">
    Opacity: <input type="text" name="o"  value="100" size="4">
    </p>
    <p>
    Text 2: <input type="text" name="t2"  value="Nur 60.-">
    Angle: <input type="text" name="a"  value="-5" size="4">
        Color: <input type="text" name="color" value="ff6600" size="7">
    Shadow: <select name="shadow">
    <option>true</option>
    <option selected value="">false</option>
</select>
    </p>
    <p>

    Logo: <select name="logo">
    <option>true</option>
    <option value="" selected>false</option>
</select>
        Size: <input type="text" size="3" name="wlogo"/>
    </p>
</form>
</div>
<p>
    URL: <input id="url" onkeyup="urlchange()" size="120">
</p>
<p>
    <img id="image" src="">
</p>