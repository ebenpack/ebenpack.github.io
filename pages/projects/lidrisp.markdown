---
title: lidrisp
slug: lidrisp
tags: Idris
languages: Idris
published: 2019-01-22 18:16:00
author: ebenpack
description: A scheme-like, written in idris.
summary: A scheme-like, written in idris.
status: hidden
img: lidrisp.gif
---


```{=html}
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.1.9/ace.js"></script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.1.9/ext-language_tools.js"></script>
<div style="font-size:16px;">
    <pre style="border:1px solid gray;height:500px;overflow-y: auto;margin-bottom: 5px;" id="input" contentEditable="true">
(define (map2 fn ls)
  (if (empty? ls) ls
    (cons (fn (car ls)) (map2 fn (cdr ls)))))
(define (double2 n) (+ n n))
(map2 double2 '(1 2 3 4 5))

(define (filter2 fn ls)
  (if (empty? ls)
    ls
    (if (fn (car ls))
          (cons (car ls) (filter2 fn (cdr ls)))
          (filter2 fn (cdr ls)))))
(define (even? n) (= 0 (modulo n 2)))
(filter2 even? '(1 2 3 4 5 6 7 8))

(define (fold2 fn acc ls)
  (if (empty? ls) acc
      (fold2 fn (fn acc (car ls)) (cdr ls))))
(fold2 + 0 '(1 2 3 4))</pre>
    <pre style="border:1px solid gray;height:500px;overflow-y: auto; color: white;" id="output"></pre>
    <div style="clear:both; margin:1em;">
        <button id="eval">Eval</button>
    </div>
    <p>It's a lisp! Or maybe a scheme! And it's written in idris!</p>
    <p>How's it work? Write some scheme in the top pane, hit the 'eval' button, and see the results in the bottom pane.</p>
    <p><a href="https://github.com/ebenpack/lidrisp">Check it out</a></p>
</div>
<script>main.initLidrisp();</script>
```
