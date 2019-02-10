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
(define (foldl fn acc ls)
    (if (null? ls)
        acc
        (foldl fn (fn acc (car ls)) (cdr ls))))
(define (foldr fn acc ls)
    (if (null? ls)
        acc
        (fn (car ls) (foldr fn acc (cdr ls)))))
(define (map fn ls)
    (foldr (lambda (x xs) (cons (fn x) xs)) '() ls))
(define (filter fn ls)
    (foldr (lambda (x xs) (if (fn x) (cons x xs) xs)) '() ls))
(define (double n) (+ n n))
(define (even?  n) (= 0 (modulo n 2)))
(define (zero?  n) (= 0 n))
(define (sub1   n) (- n 1))
(define (not    b) (if b #f #t))

(foldl  + 0    '(1 2 3 4 5))
(map    double '(1 2 3 4 5))
(filter even?  '(1 2 3 4 5 6 7 8 9 10))
(let* ([a 5] [b (+ a 10)]) (+ b 20))
(letrec
    ([is-even? 
        (lambda (n)
            (if (zero? n) #t
                (is-odd? (sub1 n))))]
    [is-odd? 
        (lambda (n)
            (if (zero? n) #f
                (is-even? (sub1 n))))])
    (is-odd? 13))
</pre>
    <pre style="border:1px solid gray;height:200px;overflow-y: auto; color: white;" id="output"></pre>
    <div style="clear:both; margin:1em;">
        <button id="eval">Eval</button>
    </div>
    <p>It's a lisp! Or maybe a scheme! And it's written in idris!</p>
    <p>How's it work? Write some scheme in the top pane, hit the 'eval' button, and see the results in the bottom pane.</p>
    <p><a href="https://github.com/ebenpack/lidrisp">Check it out</a></p>
</div>
<script>main.initLidrisp();</script>
```
