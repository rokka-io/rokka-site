---
title: Templates with Text
slug: template
use: [demos]
header_include: demos/templates-head.html
body_attributes: onload="updateImage()"
---
 
# Templates with Text Demo

Uses some complexer stack configuration with stack expressions and variables and "substacks" inclusion

<div id="demoForm">   
<form id="form" onkeyup="updateImage()" onchange="updateImage()">
    <p>Image: <select name="imagehash" id="imagehash">
    <option selected>ab329e</option>
    <option >ceb95d</option>
    <option >807fd9</option>
</select>
    Font Size: <input type="text" name="s"  size="3" value="50">
    Font: <select name="font">
        <option selected>86d7ee</option>
    <option >1d9e7c</option>
    <option>1249b3</option>
</select>
    </p>
    <p>
    Text 1: <input type="text" name="t"  value="Lego Set">
    Opacity: <input type="text" name="o"  value="100" size="4">
    </p>
    <p>
    Text 2: <input type="text" name="t2"  value="Fantastic 49.-">
    Angle: <input type="text" name="a"  value="-5" size="4">
        Color: <input type="text" name="color" value="7DAD41" size="7">
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
        Size: <input type="text" size="3" value="150" name="wlogo"/>
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


**The main template config:**

```javascript
{
    "stack_operations": [
        {
            "name": "resize",
            "options": {
                "width": 700
            }
        },
        {
            "expressions": {
                "width": "300 + ($shadow ? 4 :0)",
                "enabled": "$t2 != \"_no_text_\" ? true : false"
            },
            "name": "composition",
            "options": {
                "mode": "background",
                "secondary_stack": "subtemplate",
                "cache": true,
                "secondary_image": "83d1ca",
                "anchor": "15_65"
            }
        },
        {
            "expressions": {
                "text": "$t",
                "opacity": "$o",
                "size": "$s",
                "font": "$font"
            },
            "name": "text",
            "options": {
                "angle": 0,
                "anchor": "20_20"
            }
        },
        {
            "expressions": {
                "width": "$wlogo",
                "enabled": "$logo"
            },
            "name": "composition",
            "options": {
                "mode": "background",
                "secondary_image": "0cf76f",
                "anchor": "right_bottom"
            }
        }
    ],
    "stack_variables": {
        "font": "86d7ee",
        "logo": false,
        "wlogo": 150,
        "shadow": false,
        "a": -5,
        "o": 100,
        "s": 50,
        "t2": "_no_text_",
        "t": ""
    }
}
```

**The subtemplate template config:**

```javascript
{
    "stack_operations": [
        {
            "expressions": {
                "secondary_color": "$color"
            },
            "name": "composition",
            "options": {
                "mode": "background",
                "width": 600,
                "empty_primary": true,
                "height": 120
            }
        },
        {
            "expressions": {
                "font": "$font",
                "text": "$t2"
            },
            "name": "text",
            "options": {
                "width": 560,
                "resize_to_box": true,
                "color": "ffffff",
                "height": 80
            }
        },
        {
            "expressions": {
                "angle": "$a"
            },
            "name": "rotate",
            "options": {}
        },
        {
            "expressions": {
                "enabled": "$shadow"
            },
            "name": "dropshadow",
            "options": {
                "sigma": 2,
                "horizontal": 0,
                "vertical": 0,
                "opacity": 50
            }
        }
    ],
    "stack_variables": {
        "t2": "",
        "a": "-5",
        "font": "86d7ee",
        "shadow": false,
        "color": "7DAD41"
    }
}
```