/*
 * hotlink.js
 * 2011-08-04
 * 
 * By Eli Grey, http://eligrey.com
 * Licensed under the X11/MIT License
 *   See LICENSE.md
 */

/*! @source http://purl.eligrey.com/github/hotlink.js/blob/master/hotlink.js */

/*global self, document*/

(function(view, document) {
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
		, get_script_loc = function() {
			try {
				0();
			} catch (error) {
				var loc, replacer = function (stack, matched_loc) {
					loc = matched_loc;
				};
				if ("fileName" in error) { // Firefox
					loc = error.fileName;
				} else if ("stacktrace" in error) { // Opera
					error.stacktrace.replace(/Line \d+ of .+ script (.*)/gm, replacer);
				} else if ("stack" in error) { // WebKit
					error.stack.replace(/at (.*)/gm, replacer);
					loc = loc.replace(/:\d+:\d+$/, ""); // remove line number
				}
				return loc;
			}
		}
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
		, hotlink = function(img) {
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
				// There is no other way to do this with feature detection
				width += 16;
				height += 16;
			}
			attrs = img.attributes;
			i = attrs.length;
			while (i--) {
				// copy @style, @class, etc.
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
		, test_frame = append(doc_elt, create_elt(HTML_NS, "iframe"))
		, test_link = create_elt(HTML_NS, "a", test_frame.contentDocument)
		, test_link_url = "about:blank"
		, style = create_elt(HTML_NS, "style")
		, imgs = document.querySelectorAll("img[data-src]")
		, i = imgs.length
		, img
	;
	// I'm not using CSSOM insertRule becuase WebKit & Opera don't support @declarations
	append(style, document.createTextNode(
		  "@namespace'" + HOTLINK_NS + "';img{display:inline-block;vertical-align:bottom}"
	));
	append(doc_elt, style);
	test_frame.style.overflow = "hidden";
	test_frame.style.height = test_frame.style.border = 0;
	test_link.rel = "noreferrer";
	// Firefox & IE have a problem with setting document.referrer for about:blank, so
	// that can't be used. /robots.txt and /favicon.ico usually load fast enough.
	if (firefox) {
		test_link_url = get_script_loc();
	} else if (ie) {
		// even if I could get the script location in IE, it'd trigger a download
		test_link_url = "/favicon.ico";
	}
	test_link.href = test_link_url;
	test_frame.addEventListener("load", function() {
		while (i--) {
			img = imgs[i];
			if (img.namespaceURI === HTML_NS) {
				if (test_frame.contentDocument.referrer === "") {
					// rel=noreferrer is supported
					hotlink(img);
				} else {
					// remap data-src to src
					attr(img, "src", attr(img, "data-src", false));
				}
			}
		}
	}, false);
	// Firefox & IE are buggy with link.click() so you need to set the src manually
	if (firefox || ie) {
		test_frame.src = test_link.href;
	}
	click(test_link);
}(self, document));