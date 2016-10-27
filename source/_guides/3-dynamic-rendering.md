---
title: Dynamic rendering
use: [guides]
---

Dynamic rendering can be used to test configurations dynamically before actually creating a stack. Dynamic rendering
should __NOT__ be used in production systems, since these images are not cached. You can however use stack rendering with custom options (explained in the [rendering reference](/documentation/references/render.html)), if you need for instance different resizing options. 

Let's take our __thumbnail__ stack from the [getting started guide](/documentation/guides/get-started.html) as an example.
If we wanted to render that stack dynamically we could do following call.
 
```bash
curl -X GET 'https://testorganization.rokka.io/dynamic/resize-width-200-height-200/c03683b067927d77973b458e0baa40aa7b5e5418.jpg'
```

We still render our images with the __testorganization__ and use the same image __hash__ as before, but instead of defining the stack name,
we use a __url operation__. The available operations can be viewed under `https://api.rokka.io/operations`
(__url__ defines the format for dynamic rendering). What if we wanted to rotate our thumbnails after resizing them? 

```bash
curl -X GET 'https://testorganization.rokka.io/dynamic/resize-width-200-height-100--rotate-angle-90/c03683b067927d77973b458e0baa40aa7b5e5418.jpg'
```

Now we can have a look at the image which is first __resized__ to a width of 200 and height of 100 and after that __rotated__ by 90 degrees.
Notice that the operations are separated by __double hyphens__ (`--`). If we want to use that in production we can create a stack with an appropriate 
name like explained in the [getting started guide](/documentation/guides/get-started.html).
