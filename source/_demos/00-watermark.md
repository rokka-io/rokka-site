---
title: Watermark
use: [demos]
header_include: demos/watermark-head.html
body_attributes: onload="updateImage()"
---
 
# Watermark

Uses some complexer stack configuration with stack expressions and variables and "substacks" inclusion

<div id="demoForm">   
<form id="form" onkeyup="updateImage()" onchange="updateImage()">
    <p>Image: 

    <select name="imagehash" id="imagehash">
            <option selected>5f6f3b</option>
            <option>d73781</option>
    <option>90b93a</option>
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
