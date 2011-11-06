hotlink.js
==========

hotlink.js makes it possible to undetectably hotlink images.

Demo
----

You can try out the [online demo][1] to see hotlink.js in action.

Supported Browsers
------------------

* Google Chrome 12+
* Safari 5.1+

†Firefox 5+, Internet Explorer 9+, and Opera 11.50+ will fall back to a normal image
without a hidden referrer.

Getting Started
---------------

1. [Download hotlink.js][2] ([unminified][3]).
2. Replace `<img src="...">` with `<img data-src="...">` for every image that you want
   to hotlink on your site.
3. Include `<script type="application/ecmascript" async="" src="hotlink.js"></script>`
   right before `</body>`.

API
---

    void hotlink(HTMLImageElement image)

If you are using dynamically inserted images, you'll want to use the API to hotlink them.

### Example

    var image = new Image(300, 100);
    image.setAttribute("data-src", "http://example.com/image.png");
    document.documentElement.appendChild(image);
    hotlink(image);

![Tracking image](//in.getclicky.com/212712ns.gif)

  [1]: http://eligrey.com/demos/hotlink.js/
  [2]: https://raw.github.com/eligrey/hotlink.js/master/hotlink.min.js
  [3]: https://raw.github.com/eligrey/hotlink.js/master/hotlink.js