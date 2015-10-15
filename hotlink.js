/*
 * hotlink.js
 * 2011-08-24
 * 
 * By Eli Grey, http://eligrey.com
 * Licensed under the MIT License
 *   See https://github.com/eligrey/hotlink.js/blob/master/LICENSE.md
 */

/*! @source http://purl.eligrey.com/github/hotlink.js/blob/master/hotlink.js */

/*global self, document*/

var hotlink = (function(view, document) {
	"use strict";
	var
		  HTML_NS = "http://www.w3.org/1999/xhtml"
		, HOTLINK_NS = "http://purl.eligrey.com/hotlink"
		, doc_elt = document.documentElement
		, user_agent = view.navigator.userAgent
		// Some bugs just can't be solved with feature detection
		, firefox = ~user_agent.indexOf("Gecko/")
		, ie = ~user_agent.indexOf("MSIE")
		, opera = view.opera
		, click = function(elt) {
			if (elt.click) {
				elt.click();
			} else {
				var event = document.createEvent("Event");
				event.initEvent("click", true, true);
				elt.dispatchEvent(event);
			}
		}
		, append = function(node, child) {
			return node.appendChild(child);
		}
		, create_elt = function(ns, name, doc) {
			return (doc || document).createElementNS(ns, name);
		}
		, attr = function(elt, attr, val) {
			var old_val = elt.getAttribute(attr);
			if (arguments.length === 3) {
				if (val === false) {
					elt.removeAttribute(attr);
				} else {
					elt.setAttribute(attr, val);
				}
			}
			return old_val;
		}
		, frame_img = function(img) {
			var
				  parent = img.parentNode
				// I make the assumption that you're not using namespaces in your CSS
				, container = parent.insertBefore(create_elt(HOTLINK_NS, "img"), img)
				, frame = append(container, create_elt(HTML_NS, "iframe"))
				, link = create_elt(HTML_NS, "a", frame.contentDocument)
				, src = attr(img, "data-src", false) // img.dataset.src
				, width = +attr(img, "width", false)
				, height = +attr(img, "height", false)
				, attrs, i, attribute
			;
			if (firefox || opera) {
				// Firefox & Opera will need 16px padding once they support noreferrer
				// There is no other way to do this without feature detection
				width += 16;
				height += 16;
			}
			attrs = img.attributes;
			i = attrs.length;
			while (i--) {
				// copy attributes
				attribute = attrs[i];
				attr(container, attribute.name, attribute.value);
				attr(img, attribute.name, false);
			}
			parent.removeChild(img);
			frame.style.verticalAlign = "bottom";
			frame.style.width = width + "px";
			frame.style.height = height + "px";
			frame.scrolling = "no";
			frame.style.border = 0;
			link.rel = "noreferrer";
			link.href = src;
			if (firefox || ie) {
				frame.src = src;
			}
			click(link);
		}
		, ready = false
		, ready_queue = []
		, noreferrer_supported = false
		, hotlink = function(img) {
			if (ready) {
				if (noreferrer_supported) {
					frame_img(img);
				} else {
					// remap data-src to src
					attr(img, "src", attr(img, "data-src", false));
				}
			} else {
				ready_queue.push(img);
			}
		}
		, test_frame = append(doc_elt, create_elt(HTML_NS, "iframe"))
		, test_link = create_elt(HTML_NS, "a", test_frame.contentDocument)
		, test_link_url = "about:blank"
		, on_ready = function() {
			ready = true;
			noreferrer_supported = test_frame.contentDocument.referrer === "";
			var
				  i = 0
				, len = ready_queue.length
			;
			for (; i < len; i++) {
				hotlink(ready_queue[i]);
			}
		}
		, style = create_elt(HTML_NS, "style")
		, imgs = document.querySelectorAll("img[data-src]")
		, i = imgs.length
		, img
	;
	while (i--) {
		img = imgs[i];
		if (img.namespaceURI === HTML_NS) {
			hotlink(img);
		}
	}
	// I'm not using CSSOM insertRule becuase WebKit & Opera don't support @declarations
	append(style, document.createTextNode(
		  "@namespace'" + HOTLINK_NS + "';img{display:inline-block;vertical-align:bottom}"
	));
	append(doc_elt, style);
	test_frame.style.visibility = "hidden";
	test_frame.style.height = test_frame.style.border = 0;
	test_link.rel = "noreferrer";
	// Firefox & IE have a problem with setting document.referrer for about:blank, so
	// I use the /robots.txt instead.
	if (firefox || ie) {
		test_link_url = "/robots.txt";
	}
	test_link.href = test_link_url;
	test_frame.addEventListener("load", on_ready, false);
	// Firefox & IE are buggy with link.click() so you need to set the src manually
	if (firefox || ie) {
		test_frame.src = test_link.href;
	}
	click(test_link);
	return hotlink;
}(self, document));
