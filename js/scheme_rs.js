import { EditorState, EditorView, basicSetup } from "@codemirror/basic-setup";
import { keymap } from "@codemirror/view"
import { scheme } from "@codemirror/legacy-modes/mode/scheme"
import { StreamLanguage } from "@codemirror/stream-parser"
import { gutter } from "@codemirror/gutter"
import { indentWithTab } from "@codemirror/commands"

import { oneDark } from "./theme";

const main = async () => {
    const { evaluate, Thing } = await import("scheme.rs");
    const input = document.querySelector("#scheme");
    const output = document.querySelector("#output");
    const evalButton = document.querySelector("#eval");

    const doc = `(define (foldl fn acc ls)
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
`;

    const state = EditorState.create({
        doc,
        extensions: [
            basicSetup,
            oneDark,
            keymap.of([indentWithTab]),
            gutter({ class: "cm-mygutter" }),
            StreamLanguage.define(scheme)
        ]
    });
    const editor = new EditorView({
        state,
        parent: input
    });

    const callback = () => {
        // TODO!
        console.log(t.read_port("default"));
    }

    const t = Thing.new(callback);

    evalButton.addEventListener('click', () => {
        debugger
        const input = typeof editor.state.doc === 'string'
            ? editor.state.doc
            : editor.state.doc.sliceString(0);
        const result = t.eval(input);
        output.textContent = result;
    });
};

main();