---
title: Chrome DevTools Synchronous XHR Redirect Bug
tags: JavaScript, DevTools
slug: chrome-devtools-synchronous-xhr-redirect-bug
published: 2015-10-24 10:14
author: ebenpack
description: Chrome DevTools' network panel (circa v46) presents misleading information for redirected synchronous XHR requests.
---

There is an unusual, and potentially very frustrating bug in Chrome's DevTools (at least as of version 46.0.2490.80).
It does not appear to have been documented elsewhere, so it is being recorded here in the hope that it may prevent some
future hair-pulling.

<!--more-->

When making synchronous XHR requests (\*see note below) with 301, 302, etc. redirect responses, the network panel in
Chrome's DevTools will collapse all redirected requests into a single request (which can potentially contain mixed
elements of, at the very least, the first and last request). So, for example, if you make a synchronous Ajax request
to `/1`, which redirects to `/2`, which finally redirects to `/3` (where you get a nice 200 response), instead of
seeing these three requests in the network panel, you will only see a single request to `/3`.

Even more frustrating is that, if the request was a `POST` or a `PUT` or suchlike, the 'collapsed' request that is
displayed in the network panel will appear as if it was made with the initial request method (`POST`, `PUT`, etc.),
along with any submitted content (a JSON payload, or form data, e.g.), and it will appear as if this request was made
directly to the final redirected URL. In actuality, however, the initial request will be the `POST`/`PUT`/whatever with
the request body, and the final request will be a `GET` request with (of course) no request body (plus any number of
intermediary redirected `GET` requests).

As a concrete example, see the quick and dirty node server below.

```{.javascript .numberLines startFrom="1"}
var http = require('http');

http.createServer(function(req, res){
    var loc = parseInt(req.url.replace('/', ''), 10);
    if (req.url === '/') {
        start(req, res);
    } else if (loc < 5) {
        redir(req, res, loc);
    } else {
        finish(req, res);
    }
}).listen(8000);


function start(req, res){
    res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
    res.end(
        '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">' +
        '<title>Synchronous XHR Bug</title></head><body><script>' +
        'var request = new XMLHttpRequest();' +
        'request.open("POST", "/1", false);' +
        'request.send(JSON.stringify({foo:"bar"}));' +
        'if (request.status === 200) {' +
        '  console.log(request.responseText);' +
        '}' +
        '</script></body></html>'
    );
}

function redir(req, res, loc){
    res.writeHead(302, {"location": "/" + (loc + 1)});
    res.end();
}

function finish(req, res){
    res.writeHead(200, {"Content-Type": "application/javascript"});
    res.end(JSON.stringify({baz:'qux'}));
}
```

When a request is made to `/`, a synchronous Ajax `POST` request will be made to `/1`, which will redirect (via a `GET`)
to `/2`, which will redirect to... until finally `/5` is reached, and the JSON string `{"baz":"qux"}` is returned. Here
is how this appears in Chrome DevTools network panel (note that this appears as a single `POST` request directly
to `/5`):

![Chrome XHR redirect](/images/chrome-xhr-redirect.jpg)

And here is how the same request looks from Firefox's network panel:

![Firefox XHR redirect](/images/firefox-xhr-redirect.jpg)

Firefox gives a much more accurate depiction of the actual request that were made.

While this is unlikely to be a common source of issues, in the right circumstances it can be extremely frustrating. In
my case, I was reverse-engineering an internal legacy system in order to provide an API façade which would be easier to
work with. At one point, this system made a synchronous XHR `POST` request to URL A, which redirected to URL B, which
redirected to URL C. Chrome, however, was telling me that this was simply a single `POST` to URL C, and my attempts to
perform this particular action (e.g. via cURL or an HTTP request from node) were stymied. It took some time, and
considerable frustration, to realize that my tools were simply lying to me.

\* Note: Synchronous requests are generally discouraged, especially on the main thread. Even so, synchronous XHRs do
still exist in the wild.
