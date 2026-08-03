/* ============================================================
   Meta (Facebook) Pixel
   1. Create a pixel in Meta Events Manager (business.facebook.com/events_manager)
   2. Paste its 15-16 digit ID below
   The pixel stays OFF until a real ID is set.
   ============================================================ */
var META_PIXEL_ID = "1698271231394054";

if (/^\d{10,20}$/.test(META_PIXEL_ID)) {
  /* Standard Meta Pixel loader */
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  fbq("init", META_PIXEL_ID);
  fbq("track", "PageView");
}
