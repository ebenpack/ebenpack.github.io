---
title: Lispish
slug: lispish
tags: JavaScript
languages: JavaScript
published: 2015-12-10 18:46:00
author: ebenpack
description: Some lisp-like noodlings in JS, by someone who doesn't really know lisp.
summary: Some lisp-like noodlings in JS, by someone who doesn't really know lisp.
img: lispish.png
---

```{=html}
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.1.9/ace.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.1.9/ext-language_tools.js"></script>
<div style="font-size:16px;">
    <pre style="border:1px solid gray;height:500px;overflow-y: auto;margin-bottom: 5px;" id="input" contentEditable="true">
list.foldl(
    function(a,b){return a + b;},
    0,
    list.map(
        function(curr){return curr * 2;},
        list.filter(
            function(curr){return curr % 2 === 0;},
            list.range(10)
        )
    )
);
//=>
cons.print(
    list.reverse(
        list.sort(
            function (a, b){return a < b},
            list.list(7,89,5,8,43,2,6,1)
        )
    ),
    {prefix: '', suffix: '', separator: ','}
);
//=>
function add(){
    return list.foldl(
        function(prev, curr){return curr + prev;},
        0,
        list.list(helpers.args(arguments))
    );
}
fun.curry(add, 5)(1)(2)(3)(4)(5);
//=></pre>
    <div style="-webkit-columns: 3 auto;-moz-columns: 3 auto;columns: 3 auto;border:1px solid gray;height:500px;overflow-y: auto;" id="ref"></div>
    <div style="clear:both; margin:1em;">
        <p>Ctrl-Enter / Cmd-Enter will print results to the special comment //=>. This comment will print the results of the prior statement.</p>
    </div>
</div>
<script>
main.initLispish('input', 'ref');
</script>
```
